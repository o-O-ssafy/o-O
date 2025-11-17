import React, { useRef, useMemo, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Core } from "cytoscape";
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
import { useMindmapSync } from "../hooks/custom/useMindmapSync";
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

const MindmapPageContent: React.FC = () => {
  // 1. Routing & workspace params
  const params = useParams<{ workspaceId?: string }>();
  const workspaceId = params.workspaceId ?? DEFAULT_WORKSPACE_ID;
  const navigate = useNavigate();
  const wsUrl = resolveMindmapWsUrl();

  // 2. Get workspace info and permissions
  const { workspace } = useWorkspaceAccessQuery(workspaceId);
  const { myRole, canEdit, canManage } = useWorkspacePermissions(workspaceId);

  // 3. Refs for Cytoscape (mock API for backward compatibility)
  const cyRef = useRef<Core | null>(null);
  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const [cyReady, setCyReady] = useState(false);

  // 3a. D3 Transform state management
  const transformRef = useRef<React.MutableRefObject<Transform> | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, k: 1 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });


  // 4. Helper hooks
  const { getRandomThemeColor } = useColorTheme();
  const { findNonOverlappingPosition, findEmptySpace } = useNodePositioning();

  // 5. Stable cursor color (once per session) - separate from node theme colors
  const cursorColorRef = useRef<string | null>(null);
  if (!cursorColorRef.current) {
    // Use cursor-specific color palette for collaboration
    const CURSOR_COLORS = ["#F24822", "#57E257", "#FF824D", "#29DFFF", "#FF50F0", "#FFC60B"];
    cursorColorRef.current = CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
  }

  // 6. Collaboration hooks
  const { collab, crud, updateChatState } = useYjsCollaboration(
    wsUrl,
    workspaceId,
    cursorColorRef.current,
    {
      enabled: true, // Mindmap 페이지에서는 항상 활성화
      onAuthError: () => {
        navigate("/"); // 인증 실패 시 홈으로 리다이렉트
      },
      myRole: workspace?.myRole, // 워크스페이스 역할 전달
    }
  );

  const { nodes, isBootstrapping } = useCollaborativeNodes(collab, workspaceId);

  // 🐛 DEBUG: Expose Yjs map to window for console debugging
  useEffect(() => {
    if (collab?.map) {
      (globalThis as any).yNodes = collab.map;
    }
  }, [collab]);

  // 5a. Sync Yjs changes to backend API
  useMindmapSync(workspaceId, collab?.map ?? null, !!collab);

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

  // 6a. GPT state for RecordIdeaDialog
  const [isGptRecording, setIsGptRecording] = useState(false);
  const [gptKeywords, setGptKeywords] = useState<{ id: string; label: string; children?: any[] }[]>([]);
  const gptToggleRef = React.useRef<(() => void) | null>(null);

  // GPT 노드를 트리 구조로 변환
  const convertGptNodesToKeywords = (gptNodes: GptNodeSuggestion[], createdNodeIds: string[]) => {
    return gptNodes.map((node, index) => ({
      id: createdNodeIds[index],
      label: node.keyword,
      children: undefined, // GptNodeSuggestion에는 children이 없음 (flat 구조)
    }));
  };

  // GPT 녹음 상태 변경 핸들러
  const handleGptRecordingChange = (isRecording: boolean) => {
    setIsGptRecording(isRecording);
    if (!isRecording) {
      // 녹음 종료 시 키워드 초기화는 하지 않음 (결과가 올 때까지 대기)
    }
  };

  // GPT 토글 핸들러 (RecordIdeaDialog의 재생/일시정지 버튼용)
  const handleToggleGptRecording = () => {
    gptToggleRef.current?.();
  };

  // GPT 노드 수신 핸들러
  const handleGptNodesReceived = (nodes: GptNodeSuggestion[], createdNodeIds: string[]) => {
    const keywords = convertGptNodesToKeywords(nodes, createdNodeIds);
    setGptKeywords(prev => [...prev, ...keywords]);
  };

  // 키워드 클릭 핸들러 - 해당 노드로 화면 이동
  const handleKeywordClick = (nodeId: string) => {
    // GPT 노드는 임시 ID를 사용하므로, nodes 배열에서 찾기
    const targetNode = nodes.find(node => node.id === nodeId);

    if (targetNode && canvasContainerRef.current) {
      const svgElement = canvasContainerRef.current.querySelector('svg');
      if (svgElement) {
        // D3 zoom을 사용하여 노드 위치로 이동
        const zoom = (svgElement as any).__zoom;
        if (zoom) {
          const containerRect = canvasContainerRef.current.getBoundingClientRect();
          const centerX = containerRect.width / 2;
          const centerY = containerRect.height / 2;

          // 노드를 화면 중앙으로 이동
          const transform = d3.zoomIdentity
            .translate(centerX, centerY)
            .scale(1)
            .translate(-targetNode.x, -targetNode.y);

          d3.select(svgElement)
            .transition()
            .duration(500)
            .call((zoom as any).transform, transform);
        }
      }
    }
  };

  // 키워드 삭제 핸들러 - UI와 실제 노드 모두 삭제
  const handleDeleteKeyword = (nodeId: string) => {
    // UI에서 키워드 제거
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
    setGptKeywords(removeNodeById(gptKeywords));

    // 실제 노드도 삭제
    if (crud) {
      crud.remove(nodeId);
    }
  };

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
  });

  // 8. Analyze mode hook
  const analyzeMode = useAnalyzeMode(nodes, mode);

  // 9. Detached selection hook
  const detachedSelection = useDetachedSelection(nodes, nodeOperations.handleEditNode);

  // 🔥 트렌드 키워드 임포트 (로컬스토리지에서 감지)
  useEffect(() => {
    if (!collab || !crud) return;
    if (isBootstrapping) return; // 부트스트랩 완료 후에만 실행

    const pendingKeywords = getPendingImportKeywords();
    if (!pendingKeywords || pendingKeywords.length === 0) return;

    // viewport 중심 좌표 계산
    let startX = 0;
    let startY = 0;
    if (cyRef.current) {
      const pan = cyRef.current.pan();
      const zoom = cyRef.current.zoom();
      const container = cyRef.current.container();
      if (container) {
        const centerX = container.clientWidth / 2;
        const centerY = container.clientHeight / 2;
        startX = (centerX - pan.x) / zoom;
        startY = (centerY - pan.y) / zoom;
      }
    }

    // 키워드를 노드로 변환
    const newNodes = convertTrendKeywordsToNodes(
      pendingKeywords,
      getRandomThemeColor,
      startX,
      startY
    );

    // Y.Map에 노드 추가 (transaction으로 한 번에)
    crud.transact((map) => {
      for (const node of newNodes) {
        map.set(node.id, node);
      }
    });

    // 로컬스토리지에서 제거
    clearPendingImportKeywords();
  }, [collab, crud, isBootstrapping, getRandomThemeColor]);

  // 🔄 Track D3 transform updates and container size
  useEffect(() => {
    if (!transformRef.current || !containerRef.current) return;

    const interval = setInterval(() => {
      if (transformRef.current) {
        const currentTransform = transformRef.current.current;
        setTransform({ ...currentTransform });
      }

      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [cyReady]);

  // 🔥 Cytoscape mousemove → chatInput 위치 + awareness.cursor 브로드캐스트
  useEffect(() => {
    if (!collab) return;
    if (!cyReady) return;

    const cy = cyRef.current;
    if (!cy) {
      return;
    }

    const awareness = collab.client.provider.awareness;
    if (!awareness) {
      return;
    }

    let raf = 0;

    const handleMouseMove = (event: cytoscape.EventObject) => {
      if (raf) cancelAnimationFrame(raf);

      raf = requestAnimationFrame(() => {
        const position = event.position;
        if (!position) return;

        // 1) ChatInput 위치 업데이트 (모델 좌표)
        chatInput.updateCursorPosition({ x: position.x, y: position.y });

        // 2) Awareness cursor 브로드캐스트
        const cursorData = {
          x: position.x,
          y: position.y,
          color: cursorColorRef.current,
        };

        awareness.setLocalStateField("cursor", cursorData);
      });
    };

    cy.on("mousemove", handleMouseMove);

    return () => {
      cy.off("mousemove", handleMouseMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [collab, cyReady, chatInput]);

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
            <AskPopo />
          ) : (
            <AnalyzeSelectionPanel
              selectedNodes={analyzeMode.selectedAnalyzeNodes}
              onAnalyze={analyzeMode.handleAnalyzeExecute}
              onClear={analyzeMode.handleAnalyzeClear}
              onRemoveNode={analyzeMode.handleAnalyzeRemoveNode}
            />
          )}
        </div>

        {!voiceChatVisible && (
          <div className="fixed top-1 right-1 md:top-4 md:right-4 z-50">
            <StatusBox
              onStartVoiceChat={() => setVoiceChatVisible(true)}
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
        {(isGptRecording || gptKeywords.length > 0) && (
          <div className="fixed top-24 right-4 z-40">
            <RecordIdeaDialog
              keywords={gptKeywords}
              onDelete={handleDeleteKeyword}
              onNodeClick={handleKeywordClick}
              isRecording={isGptRecording}
              onToggleRecording={handleToggleGptRecording}
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
