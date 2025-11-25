import React, { useRef, useMemo, useEffect, useState, useCallback } from "react";
import type { RecommendNodeData } from "../types";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import * as d3 from "d3";
import type { Transform } from "../types";
import { useWorkspaceAccessQuery } from "../../workspace/hooks/query/useWorkspaceAccessQuery";
import { useWorkspacePermissions } from "../../workspace/hooks/custom/useWorkspacePermissions";
import MiniNav from "@/shared/ui/MiniNav";
import AskPopo from "../components/AskPopoButton";
import StatusBox from "../../workspace/components/StatusBox";
import ModeToggleButton from "../components/ModeToggleButton";
import { Textbox } from "../components/Textbox";
import AnalyzeSelectionPanel from "../components/AnalyzeSelectionPanel";
import D3Canvas from "../components/D3Canvas";
import VoiceChat from "../../workspace/components/VoiceChat/VoiceChat";
import { RecordIdeaDialog } from "../components/RecordIdea/RecordIdeaDialog";
import { PeerCursorProvider } from "../../workspace/components/PeerCursorProvider";
import { RemoteCursorsOverlay } from "../../workspace/components/RemoteCursorsOverlay";
import { ChatBubblesOverlay } from "../../workspace/components/ChatBubblesOverlay";
import { ChatInputBubble } from "../../workspace/components/ChatInputBubble";
import { useChatInput } from "../../workspace/hooks/custom/useChatInput";
import { useColorTheme } from "../hooks/useColorTheme";
import { useNodePositioning } from "../hooks/useNodePositioning";
import { useYjsCollaboration } from "../../workspace/hooks/custom/useYjsCollaboration";
import { useCollaborativeNodes } from "../../workspace/hooks/custom/useCollaborativeNodes";
import { useNodeOperations } from "../hooks/custom/useNodeOperations";
import { useMindmapUIState } from "../hooks/custom/useMindmapUIState";
import { useAnalyzeMode } from "../hooks/custom/useAnalyzeMode";
import { useDetachedSelection } from "../hooks/custom/useDetachedSelection";
import { useGptAwareness } from "../../workspace/hooks/custom/useGptAwareness";
import type { GptNodeSuggestion } from "../../workspace/types/voice.types";
import {
  getPendingImportKeywords,
  clearPendingImportKeywords,
  convertTrendKeywordsToNodes,
} from "../utils/importTrendKeywords";
import {
  DEFAULT_WORKSPACE_ID,
  resolveMindmapWsUrl,
} from "@/constants/mindmapCollaboration";
import { captureThumbnailAsFile } from "../utils/canvasCapture";
import { mindmapApi } from "../api/mindmapApi";
import { useAppSelector } from "@/store/hooks";

const MindmapPageContent: React.FC = () => {
  const currentUser = useAppSelector((state) => state.user.user);
  // 1. Routing & workspace params
  const params = useParams<{ workspaceId?: string }>();
  const workspaceId = params.workspaceId ?? DEFAULT_WORKSPACE_ID;
  const navigate = useNavigate();
  const location = useLocation();
  const wsUrl = resolveMindmapWsUrl();

  // 2. Get workspace info and permissions
  const { workspace } = useWorkspaceAccessQuery(workspaceId);
  const { myRole, canEdit, canManage } = useWorkspacePermissions(workspaceId);

  // 3. Refs for D3 canvas
  const cyRef = useRef<any>(null); // Mock ref for backward compatibility
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const [cyReady, setCyReady] = useState(false);
  const [focusNodeId, setFocusNodeId] = useState<string | null>(null);

  // 3a. D3 Transform state management
  const transformRef = useRef<React.MutableRefObject<Transform> | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });


  // 4. Helper hooks
  const { getRandomThemeColor } = useColorTheme(workspace?.theme ?? "PASTEL");
  const { findNonOverlappingPosition, findEmptySpace } = useNodePositioning();

  // 5. Stable cursor color (once per session) - separate from node theme colors
  const cursorColorRef = useRef<string | null>(null);
  if (!cursorColorRef.current) {
    // Use cursor-specific color palette for collaboration
    const CURSOR_COLORS = ["#F24822", "#57E257", "#FF824D", "#29DFFF", "#FF50F0", "#FFC60B"];
    cursorColorRef.current = CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
  }

  // AI 추천 데이터 저장 (nodeId -> 추천 목록)
  const [aiRecommendationsMap, setAiRecommendationsMap] = useState<Map<number, RecommendNodeData[]>>(new Map());
  // 트렌드 추천 데이터 저장 (nodeId -> 추천 목록)
  const [trendRecommendationsMap, setTrendRecommendationsMap] = useState<Map<number, RecommendNodeData[]>>(new Map());
  // 추천 로딩 상태 (nodeId -> 로딩 여부)
  const [isLoadingRecommendationsMap, setIsLoadingRecommendationsMap] = useState<Map<number, boolean>>(new Map());

  // AI + 트렌드 통합 추천 데이터 처리 콜백
  const handleAiRecommendations = useCallback((data: {
    nodeId: number;
    aiList?: Array<{ tempId: string | null; parentId: number | null; keyword: string; memo: string }>;
    trendList?: Array<{ keyword: string; score: number; rank: number }>;
    // 기존 형식 호환성 (legacy)
    nodes?: Array<{ keyword: string; memo: string }>;
  }) => {
    console.log("[MindmapPage] 🤖 Received AI+Trend recommendations for node:", data.nodeId, data);

    // 새로운 통합 형식 처리
    if (data.aiList || data.trendList) {
      // AI 추천 변환
      const aiRecommendations: RecommendNodeData[] = (data.aiList || []).map((item, index) => ({
        id: item.tempId || `ai-${data.nodeId}-${index}`,
        keyword: item.keyword,
        memo: item.memo,
        type: "ai" as const,
      }));

      // 트렌드 추천 변환
      const trendRecommendations: RecommendNodeData[] = (data.trendList || []).map((item, index) => ({
        id: `trend-${data.nodeId}-${index}`,
        keyword: item.keyword,
        type: "trend" as const,
      }));

      console.log("[MindmapPage] 💾 Storing recommendations - AI:", aiRecommendations.length, "Trend:", trendRecommendations.length);

      // 각각의 Map에 저장
      setAiRecommendationsMap(prev => {
        const newMap = new Map(prev);
        newMap.set(data.nodeId, aiRecommendations);
        console.log("[MindmapPage] ✅ AI recommendations stored for nodeId:", data.nodeId);
        return newMap;
      });

      setTrendRecommendationsMap(prev => {
        const newMap = new Map(prev);
        newMap.set(data.nodeId, trendRecommendations);
        console.log("[MindmapPage] ✅ Trend recommendations stored for nodeId:", data.nodeId);
        return newMap;
      });

      // 로딩 상태 종료
      setIsLoadingRecommendationsMap(prev => {
        const newMap = new Map(prev);
        newMap.set(data.nodeId, false);
        return newMap;
      });
    }
    // 기존 형식 호환성 유지 (legacy)
    else if (data.nodes) {
      const recommendations: RecommendNodeData[] = data.nodes.map((node, index) => ({
        id: `ai-${data.nodeId}-${index}`,
        keyword: node.keyword,
        memo: node.memo,
        type: "ai" as const,
      }));

      setAiRecommendationsMap(prev => {
        const newMap = new Map(prev);
        newMap.set(data.nodeId, recommendations);
        return newMap;
      });
    }
  }, []);

  // 6. Collaboration hooks
  const { collab, crud, updateChatState, updateGptState } = useYjsCollaboration(
    wsUrl,
    workspaceId,
    cursorColorRef.current,
    {
      enabled: true, // Mindmap 페이지에서는 항상 활성화
      onAuthError: () => {
        navigate("/"); // 인증 실패 시 홈으로 리다이렉트
      },
      myRole: workspace?.myRole, // 워크스페이스 역할 전달
      onAiRecommendation: handleAiRecommendations, // AI 추천 데이터 처리
    }
  );

  const { nodes, isBootstrapping } = useCollaborativeNodes(collab, workspaceId);

  // Check if workspace is empty (no nodes)
  const isEmptyWorkspace = nodes.length === 0;

  // 🐛 DEBUG: Expose Yjs map to window for console debugging
  useEffect(() => {
    if (collab?.map) {
      (globalThis as any).yNodes = collab.map;
    }
  }, [collab]);

  // 5b. Chat input hook
  const chatInput = useChatInput();

  // 6. UI state hook
  const {
    mode,
    selectedNodeId,
    voiceChatVisible,
    handleModeChange,
    setSelectedNodeId,
    setVoiceChatVisible,
  } = useMindmapUIState();

  // 6a. GPT state from Awareness (실시간 동기화)
  const gptState = useGptAwareness(collab?.client.provider.awareness);
  const isGptRecording = gptState?.isRecording ?? false;
  const gptKeywords = gptState?.keywords ?? [];
  const gptToggleRef = React.useRef<(() => void) | null>(null);

  // 6b. 로컬 패널 표시 상태 (non-MAINTAINER용)
  const [showGptPanel, setShowGptPanel] = useState(true);

  // Ref to access latest gptState without triggering callback recreation
  const gptStateRef = React.useRef(gptState);
  React.useEffect(() => {
    gptStateRef.current = gptState;
  }, [gptState]);

  // 녹음 시작 시 또는 키워드가 있을 때 패널 표시
  useEffect(() => {
    if (isGptRecording) {
      setShowGptPanel(true);
    } else if (gptKeywords.length > 0) {
      // 녹음은 끝났지만 키워드가 있으면 패널 유지
      setShowGptPanel(true);
    }
  }, [isGptRecording, gptKeywords.length]);

  // GPT 노드를 트리 구조로 변환
  const convertGptNodesToKeywords = (gptNodes: GptNodeSuggestion[], createdNodeIds: string[]) => {
    return gptNodes.map((node, index) => ({
      id: createdNodeIds[index],
      label: node.keyword,
      children: undefined, // GptNodeSuggestion에는 children이 없음 (flat 구조)
    }));
  };

  // GPT 녹음 상태 변경 핸들러 (Awareness 동기화는 VoiceChat에서 처리) - useCallback으로 memoization
  const handleGptRecordingChange = useCallback((isRecording: boolean) => {
    // Awareness에서 상태를 가져오므로 로컬 state 업데이트 불필요
    console.log('[MindmapPage] GPT 녹음 상태 변경:', isRecording);
  }, []);

  // GPT 토글 핸들러 (RecordIdeaDialog의 재생/일시정지 버튼용)
  const handleToggleGptRecording = () => {
    gptToggleRef.current?.();
  };

  // GPT 노드 수신 핸들러 (Awareness에 키워드 추가) - useCallback으로 memoization
  const handleGptNodesReceived = useCallback((nodes: GptNodeSuggestion[], createdNodeIds: string[]) => {
    console.log('[MindmapPage] GPT 노드 수신:', {
      nodesCount: nodes.length,
      createdNodeIds,
      myRole,
      isMaintainer: myRole === 'MAINTAINER',
    });

    // MAINTAINER만 Awareness 업데이트 (다른 사용자는 Awareness 구독으로 자동 동기화)
    if (myRole !== 'MAINTAINER') {
      console.log('[MindmapPage] ℹ️ 다른 역할 → Awareness 업데이트 스킵 (MAINTAINER가 업데이트함)');
      return;
    }

    // createdNodeIds가 비어있으면 실제로 노드가 생성되지 않은 것
    if (createdNodeIds.length === 0) {
      console.warn('[MindmapPage] ⚠️ MAINTAINER인데 createdNodeIds가 비어있음 - 노드 생성 실패?');
      return;
    }

    const newKeywords = convertGptNodesToKeywords(nodes, createdNodeIds);

    // Awareness 업데이트 (모든 참여자에게 동기화) - null-safe 처리
    // Use ref to avoid recreating this callback when gptState changes
    if (updateGptState && gptStateRef.current) {
      console.log('[MindmapPage] 📡 MAINTAINER가 Awareness에 키워드 추가:', {
        existingKeywords: gptStateRef.current.keywords?.length || 0,
        newKeywords: newKeywords.length,
        totalAfterUpdate: (gptStateRef.current.keywords?.length || 0) + newKeywords.length,
      });
      updateGptState({
        ...gptStateRef.current, // ref로 접근 (기존 상태 유지)
        keywords: [...(gptStateRef.current.keywords ?? []), ...newKeywords], // 키워드만 추가
      });
    }
  }, [updateGptState, myRole]);

  // 키워드 클릭 핸들러 - 해당 노드로 화면 이동
  const handleKeywordClick = (nodeId: string) => {
    // focusNodeId 설정하여 기존 포커스 로직 사용
    setFocusNodeId(nodeId);
    // 노드 선택
    setSelectedNodeId(nodeId);
  };

  // 키워드 삭제 핸들러 - Awareness + 실제 노드 삭제
  const handleDeleteKeyword = (nodeId: string) => {
    console.log('[MindmapPage] 키워드 삭제:', nodeId);

    // 실제 노드 삭제 (Yjs CRDT로 자동 동기화)
    if (crud) {
      crud.remove(nodeId);
    }

    // Awareness에서 키워드 제거 (모든 참여자에게 동기화)
    if (updateGptState && gptState) {
      const removeNodeById = (nodes: typeof gptKeywords): typeof gptKeywords => {
        return nodes.filter((node) => {
          if (node.id === nodeId) {
            return false;
          }
          if (node.children) {
            node.children = removeNodeById(node.children);
          }
          return true;
        });
      };

      const filteredKeywords = removeNodeById(gptState.keywords);

      console.log('[MindmapPage] 📡 Awareness에서 키워드 제거');
      updateGptState({
        ...gptState,
        keywords: filteredKeywords,
        timestamp: Date.now(),
      });
    }
  };

  // GPT 노드 확정 핸들러 (Y.doc에 이미 저장되어 있으므로 Awareness만 정리)
  const handleSubmitGptNodes = useCallback(async () => {
    if (!gptState?.keywords || gptState.keywords.length === 0) {
      console.log('[MindmapPage] 저장할 GPT 키워드가 없습니다.');
      return;
    }

    console.log('[MindmapPage] ✅ GPT 노드 확정 (Y.doc → 백엔드 자동 동기화)');

    // Y.doc에 이미 노드가 저장되어 있고, 백엔드가 Y.doc 변경을 감지하여 자동으로 DB에 저장함
    // 따라서 Awareness 상태만 정리하면 됨

    // Awareness 초기화 (GPT 상태 제거)
    if (updateGptState) {
      updateGptState(null);
    }

    // 패널 닫기
    setShowGptPanel(false);
  }, [gptState, updateGptState]);

  // 7. Node operations hook
  const nodeOperations = useNodeOperations({
    crud,
    nodes,
    cyRef,
    mode,
    workspaceId,
    myRole,
    getRandomThemeColor,
    findNonOverlappingPosition,
    findEmptySpace,
    yMap: collab?.map ?? null,
    isEmptyWorkspace,
  });

  // 8. Analyze mode hook
  const analyzeMode = useAnalyzeMode(nodes, mode);

  // 9. Detached selection hook
  const detachedSelection = useDetachedSelection(nodes, nodeOperations.handleEditNode);

  // 10. 썸네일 캡처 (페이지 언마운트 시 + 브라우저 탭 닫을 때)
  const thumbnailCapturedRef = useRef(false);
  const thumbnailCapturePromiseRef = useRef<Promise<void> | null>(null);
  // 🔥 캔버스 요소를 미리 저장 (popstate 시점에 ref가 null이 되는 문제 해결)
  const savedCanvasElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // 🔥 뒤로가기 차단 플래그
    const shouldBlockBackRef = { current: true };

    // 썸네일 캡처 함수 (Promise 저장하여 중복 실행 방지)
    const captureThumbnail = async () => {
      // 이미 캡처 중이거나 완료했으면 스킵
      if (thumbnailCapturedRef.current || thumbnailCapturePromiseRef.current) {
        return;
      }

      // 현재 ref 사용 (저장된 요소는 DOM에서 분리되어 html2canvas 실패)
      const targetElement = canvasContainerRef.current;
      if (!targetElement) {
        return;
      }

      // 캡처 Promise 저장 (중복 실행 방지)
      thumbnailCapturePromiseRef.current = (async () => {
        try {
          const thumbnailFile = await captureThumbnailAsFile(targetElement, {
            filename: `mindmap-${workspaceId}-thumbnail.png`,
            maxWidth: 1200,
            maxHeight: 800,
          });

          // 서버로 전송
          await mindmapApi.uploadThumbnail(workspaceId, thumbnailFile);
          thumbnailCapturedRef.current = true;
        } catch (error) {
          console.error('❌ [MindmapPage] Thumbnail capture/upload failed:', error);
          // 실패 시 다시 시도할 수 있도록 Promise 초기화
          thumbnailCapturePromiseRef.current = null;
        }
      })();

      return thumbnailCapturePromiseRef.current;
    };

    // 🔥 브라우저 뒤로가기 감지 - 캡처 후 실제 뒤로 가기
    const handlePopState = async (e: PopStateEvent) => {
      // 첫 번째 popstate (진짜 사용자 뒤로가기)
      if (shouldBlockBackRef.current && !thumbnailCapturedRef.current) {
        // 뒤로가기 취소하고 원래 위치로 복귀
        e.preventDefault?.(); // 표준 preventDefault (효과 없을 수 있음)
        history.pushState(null, '', location.pathname);

        // 차단 플래그 해제 (다음 뒤로가기는 허용)
        shouldBlockBackRef.current = false;

        try {
          // 캡처 시도 (완료 대기)
          await captureThumbnail();
        } catch (error) {
          console.error('❌ [MindmapPage] Capture failed, but navigation allowed:', error);
        }

        // 🔥 캡처 완료 후 /mypage로 라우팅
        setTimeout(() => {
          navigate('/mypage');
        }, 100);
      }
    };

    // 페이지 숨김 이벤트 (브라우저 탭 닫기, 다른 탭으로 이동 등)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (!thumbnailCapturedRef.current) {
          captureThumbnail();
        }
      }
    };

    // 브라우저 탭 닫기 전 이벤트
    const handleBeforeUnload = () => {
      if (!thumbnailCapturedRef.current) {
        captureThumbnail();
      }
    };

    // 🔥 MiniNav에서 발생시키는 커스텀 이벤트 감지
    const handleMindmapNavigation = (e: Event) => {
      if (!thumbnailCapturedRef.current) {
        // 캡처 시작 (비동기지만 완료를 기다리지 않음)
        captureThumbnail();
      }
    };

    // 🔥 뒤로가기 차단을 위한 히스토리 state 추가
    history.pushState(null, '', location.pathname);

    // 이벤트 리스너 등록
    window.addEventListener('popstate', handlePopState);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('mindmap-navigation', handleMindmapNavigation);

    // Cleanup
    return () => {

      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('mindmap-navigation', handleMindmapNavigation);

      // cleanup에서는 캡처하지 않음 (이미 DOM이 제거 중이라 html2canvas 실패)
    };
  }, [workspaceId]);

  // 🔥 트렌드 키워드 임포트 (로컬스토리지에서 감지)
  useEffect(() => {
    if (!collab || !crud) return;
    if (isBootstrapping) return; // 부트스트랩 완료 후에만 실행

    const pendingKeywords = getPendingImportKeywords();
    if (!pendingKeywords || pendingKeywords.length === 0) return;

    // 🔥 중복 실행 방지: 로컬스토리지에서 즉시 제거
    clearPendingImportKeywords();

    // Y.doc에 직접 노드 추가 (백엔드가 Y.doc 변경을 감지하여 자동 저장)
    const addNodesToYDoc = () => {
      // 키워드를 노드로 변환
      // 기존 노드가 있으면 오른쪽에 배치, 없으면 중앙(2500, 2500)에 배치
      const newNodes = convertTrendKeywordsToNodes(
        pendingKeywords,
        getRandomThemeColor,
        nodes // 기존 노드 정보 전달하여 겹치지 않게 배치
      );

      let lastNodeId: string | null = null;
      let firstNodeId: string | null = null;

      // Y.doc에 노드들 추가
      crud.transact((map) => {
        for (let i = 0; i < newNodes.length; i++) {
          const node = newNodes[i];
          const nodeId = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}-${i}`;

          // parentId 결정: 첫 노드는 null, 이후는 이전 노드의 ID
          const parentId = i === 0 ? null : lastNodeId;

          const newNode = {
            id: nodeId,
            parentId,
            workspaceId: parseInt(workspaceId, 10),
            type: node.type || "text",
            keyword: node.keyword,
            memo: node.memo || "",
            x: node.x ?? 2500,
            y: node.y ?? 2500,
            color: node.color,
            operation: "ADD" as const,
          };

          map.set(nodeId, newNode);
          lastNodeId = nodeId;

          // 첫 번째 노드 ID 저장 (카메라 포커스용)
          if (i === 0) {
            firstNodeId = nodeId;
          }
        }
      });

      // 첫 번째 노드로 카메라 포커스
      if (firstNodeId) {
        setFocusNodeId(firstNodeId);
      }

      console.log('[MindmapPage] ✅ 트렌드 키워드 Y.doc에 추가 완료 (백엔드 자동 동기화)');
    };

    addNodesToYDoc();
  }, [collab, crud, isBootstrapping, workspaceId, getRandomThemeColor, nodes]);

  // 🔥 포커스 노드로 카메라 이동 (cyRef를 통해 focusOnNode 호출)
  useEffect(() => {
    if (!focusNodeId) {
      return;
    }

    // nodes에서 해당 노드 찾기 (노드가 실제로 존재하는지 확인)
    const targetNode = nodes.find(n => n.id === focusNodeId);

    if (targetNode && targetNode.x !== undefined && targetNode.y !== undefined) {
      // cyRef의 focusOnNode 메서드 사용
      const timer = setTimeout(() => {
        if (cyRef.current && typeof (cyRef.current as any).focusOnNode === 'function') {
          (cyRef.current as any).focusOnNode(focusNodeId);
        }

        setFocusNodeId(null);
      }, 200); // DOM 렌더링 대기

      return () => clearTimeout(timer);
    }
  }, [focusNodeId, nodes]);

  // 🔄 Track D3 transform updates and container size
  useEffect(() => {
    if (!transformRef.current || !containerRef.current) return;

    const interval = setInterval(() => {
      if (transformRef.current) {
        const currentTransform = transformRef.current.current;
        // Only update if values actually changed
        setTransform(prev => {
          if (prev.x === currentTransform.x &&
              prev.y === currentTransform.y &&
              prev.k === currentTransform.k) {
            return prev; // No change, return same object
          }
          return { ...currentTransform };
        });
      }

      if (containerRef.current) {
        const newWidth = containerRef.current.clientWidth;
        const newHeight = containerRef.current.clientHeight;
        // Only update if values actually changed
        setContainerSize(prev => {
          if (prev.width === newWidth && prev.height === newHeight) {
            return prev; // No change, return same object
          }
          return { width: newWidth, height: newHeight };
        });
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [cyReady]);

  // D3 mousemove → chatInput 위치 + awareness.cursor 브로드캐스트
  // Note: D3Canvas 컴포넌트에서 onPointerMove prop으로 처리됨

  // 11. Loading state - collab/crud만 체크 (isBootstrapping은 백그라운드에서 진행)
  if (!collab || !crud) {
    return (
      <div className="flex items-center justify-center h-screen font-paperlogy">
        워크스페이스를 로딩 중입니다...
      </div>
    );
  }

  // 12. Render
  return (
    <PeerCursorProvider awareness={collab.client.provider.awareness}>
      <div className="bg-dotted font-paperlogy h-screen relative overflow-hidden">
        {/* Fixed UI Elements */}
        <div className="fixed top-1 left-1 md:top-4 md:left-4 z-50">
          <MiniNav />
        </div>

        <div className="fixed bottom-24 right-2 lg:bottom-4 lg:right-4 z-50">
          {mode === "edit" ? (
            <AskPopo workspaceId={workspaceId} />
          ) : (
            <AnalyzeSelectionPanel
              selectedNodes={analyzeMode.selectedAnalyzeNodes}
              workspaceId={workspaceId}
              onAnalyze={analyzeMode.handleAnalyzeExecute}
              onClear={analyzeMode.handleAnalyzeClear}
              onRemoveNode={analyzeMode.handleAnalyzeRemoveNode}
            />
          )}
        </div>

        {!voiceChatVisible && (
          <div className="fixed top-1 right-1 md:top-4 md:right-4 z-50">
            <StatusBox
              onStartVoiceChat={() => {
                // 분석모드에서 음성채팅 시작 시 편집모드로 자동 전환
                if (mode === "analyze") {
                  handleModeChange("edit");
                }
                setVoiceChatVisible(true);
              }}
              workspaceId={workspaceId}
              yclient={collab?.client}
            />
          </div>
        )}

        {voiceChatVisible ? (
          <div className="fixed top-1 md:top-4 left-1/2 -translate-x-1/2 z-50">
            <VoiceChat
              workspaceId={workspaceId}
              crud={crud}
              nodes={nodes}
              myRole={workspace?.myRole}
              onCallEnd={() => setVoiceChatVisible(false)}
              onOrganize={() => console.log("Organize clicked")}
              onGptRecordingChange={handleGptRecordingChange}
              onGptNodesReceived={handleGptNodesReceived}
              onGptToggleReady={(toggle) => { gptToggleRef.current = toggle; }}
              yclient={collab?.client}
              cursorColor={cursorColorRef.current ?? undefined}
              gptState={gptState}
              updateGptState={updateGptState}
            />
          </div>
        ) : (
          <div className="fixed top-1 md:top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-1 md:gap-2">
            <ModeToggleButton mode={mode} onModeChange={handleModeChange} />
          </div>
        )}

        {mode === "edit" && (
          <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-50 w-[min(95vw,48rem)] px-2 md:bottom-4 md:px-4">
            <Textbox onAddNode={nodeOperations.handleAddNode} />
          </div>
        )}

        {/* GPT Recording - RecordIdeaDialog */}
        {showGptPanel && (isGptRecording || gptKeywords.length > 0) && (
          <div className="fixed top-24 right-4 z-40">
            <RecordIdeaDialog
              keywords={gptKeywords}
              onDelete={canEdit ? handleDeleteKeyword : undefined}
              onNodeClick={handleKeywordClick}
              myRole={myRole}
              onClose={() => {
                // MAINTAINER: Awareness 상태 클리어 (모든 참여자에게 영향)
                // non-MAINTAINER: 로컬 패널만 숨김
                if (myRole === 'MAINTAINER') {
                  if (updateGptState) {
                    updateGptState(null);
                  }
                } else {
                  setShowGptPanel(false);
                }
              }}
              onSubmit={handleSubmitGptNodes}
            />
          </div>
        )}

        {/* D3 Canvas */}
        <div className="absolute inset-0" ref={canvasContainerRef}>
          <D3Canvas
            nodes={nodes}
            mode={mode}
            analyzeSelection={analyzeMode.analyzeSelection}
            selectedNodeId={selectedNodeId}
            aiRecommendationsMap={aiRecommendationsMap}
            trendRecommendationsMap={trendRecommendationsMap}
            isLoadingRecommendationsMap={isLoadingRecommendationsMap}
            setIsLoadingRecommendations={setIsLoadingRecommendationsMap}
            workspaceId={workspaceId}
            isReadOnly={!canEdit}
            onNodeSelect={setSelectedNodeId}
            onNodeUnselect={() => setSelectedNodeId(null)}
            onApplyTheme={nodeOperations.handleApplyTheme}
            onDeleteNode={nodeOperations.handleDeleteNode}
            onEditNode={nodeOperations.handleEditNode}
            onBatchNodePositionChange={nodeOperations.handleBatchNodePositionChange}
            onCyReady={(cy) => {
              cyRef.current = cy;
              setCyReady(true);

              // Extract D3 transform and container refs from mock cy object
              if ((cy as any)._d3Transform) {
                transformRef.current = (cy as any)._d3Transform;
              }
              if ((cy as any)._d3Container) {
                containerRef.current = (cy as any)._d3Container.current;
              }
            }}
            onCreateChildNode={nodeOperations.handleCreateChildNode}
            onAnalyzeNodeToggle={analyzeMode.handleAnalyzeNodeToggle}
            detachedSelectionMap={detachedSelection.detachedSelectionMap}
            onKeepChildrenDelete={detachedSelection.handleKeepChildrenDelete}
            onConnectDetachedSelection={detachedSelection.handleConnectDetachedSelection}
            onDismissDetachedSelection={detachedSelection.handleDismissDetachedSelection}
            className="absolute inset-0"
          />
          <RemoteCursorsOverlay transform={transform} container={containerRef.current} />
          <ChatBubblesOverlay
            transform={transform}
            containerWidth={containerSize.width}
            containerHeight={containerSize.height}
            awareness={collab.client.provider.awareness}
          />
          {chatInput.isInputVisible && chatInput.inputPosition && (
            <ChatInputBubble
              transform={transform}
              container={containerRef.current}
              position={chatInput.inputPosition}
              color={cursorColorRef.current}
              onClose={chatInput.closeChatInput}
              onUpdateChat={updateChatState}
            />
          )}
        </div>
      </div>
    </PeerCursorProvider>
  );
};

const MindmapPage: React.FC = () => {
  // 1. Extract workspace ID from URL params
  const params = useParams<{ workspaceId?: string }>();
  const workspaceId = params.workspaceId ?? DEFAULT_WORKSPACE_ID;

  // 2. Check workspace access permissions
  const { workspace, hasAccess, isLoading } = useWorkspaceAccessQuery(workspaceId);

  // 3. Show loading state while checking access
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen font-paperlogy">
        워크스페이스 접근 권한을 확인하는 중...
      </div>
    );
  }

  // 4. If no access, useWorkspaceAccessQuery will redirect automatically
  // Return null to prevent rendering
  if (!hasAccess) {
    return null;
  }

  // 5. Access granted - render the main content
  return <MindmapPageContent />;
};

export default MindmapPage;
