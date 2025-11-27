// components/VoiceChat/VoiceChat.tsx
import React, { useMemo, useEffect, useCallback, useRef } from "react";
import VoiceAvatar from "./VoiceAvatar";
import VoiceControls from "./VoiceContols";
import { useVoiceChat } from "../../hooks/custom/useVoiceChat";
import { useVoiceGpt } from "../../hooks/custom/useVoiceGpt";
import { useGptNodeCreator } from "../../../mindmap/hooks/custom/useGptNodeCreator";
import { usePeerCursors } from "../PeerCursorProvider";
import { useAppSelector } from "@/store/hooks";
import type { NodeData } from "../../../mindmap/types";
import type { GptNodeSuggestion } from "../../types/voice.types";
import { getProfileImageUrl } from "@/shared/utils/imageMapper";
import type { YClient } from "../../hooks/custom/yjsClient";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import ContentDialog from "@/shared/ui/ContentDialog/ContentDialog";
import popoImage from "@/shared/assets/images/organize_popo.webp";
import { useWorkspaceAccessQuery } from "../../hooks/query/useWorkspaceAccessQuery";

interface YjsCRUD {
  create: (node: NodeData) => void;
  read: (id: string) => NodeData | undefined;
}

interface VoiceChatProps {
  workspaceId: string;
  crud: YjsCRUD | null;
  nodes?: NodeData[];
  myRole?: string;
  onCallEnd?: () => void;
  onOrganize?: () => void;
  onGptRecordingChange?: (isRecording: boolean) => void;
  onGptNodesReceived?: (nodes: GptNodeSuggestion[], createdNodeIds: string[]) => void;
  onGptToggleReady?: (toggle: () => void) => void;
  yclient?: YClient | null;
  cursorColor?: string;
  gptState?: {
    isRecording: boolean;
    keywords: Array<{ id: string; label: string; children?: any[] }>;
    startedBy: string;
    timestamp: number;
  } | null;
  updateGptState?: (gptData: {
    isRecording: boolean;
    keywords: Array<{ id: string; label: string; children?: any[] }>;
    startedBy: string;
    timestamp: number;
  } | null) => void;
}

const VoiceChat: React.FC<VoiceChatProps> = ({
  workspaceId,
  crud,
  nodes = [],
  myRole,
  onCallEnd,
  onOrganize,
  onGptRecordingChange,
  onGptNodesReceived,
  onGptToggleReady,
  yclient,
  cursorColor,
  gptState,
  updateGptState,
}) => {
  const currentUser = useAppSelector((state) => state.user.user);
  const { peers } = usePeerCursors();
  const { workspace } = useWorkspaceAccessQuery(workspaceId);

  // GPT Node Creator
  const { createNodesFromGpt } = useGptNodeCreator(crud, workspaceId, nodes, workspace?.theme ?? "PASTEL");

  // Ref to store handleGptChunk function
  const handleGptChunkRef = useRef<((content: string) => void) | null>(null);

  // Ref to prevent duplicate GPT processing
  const processedGptTimestamps = useRef(new Set<number>());

  // Refs for GPT control functions (will be set after gpt is initialized)
  const gptStartRecordingRef = useRef<(() => void) | null>(null);
  const gptStopRecordingRef = useRef<(() => void) | null>(null);
  const gptIsRecordingRef = useRef<boolean>(false);

  // Ref to track previous recording state
  const prevIsRecordingRef = useRef<boolean>(false);

  // Refs for stable access in callbacks (avoid dependency array changes)
  const currentUserRef = useRef(currentUser);
  const gptStateRef = useRef(gptState);
  const createNodesFromGptRef = useRef(createNodesFromGpt);

  // Sync refs with latest values
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    gptStateRef.current = gptState;
  }, [gptState]);

  useEffect(() => {
    createNodesFromGptRef.current = createNodesFromGpt;
  }, [createNodesFromGpt]);

  // GPT 청크 핸들러
  const onGptChunkReceived = useCallback((content: string) => {
    // useVoiceGpt의 handleGptChunk 호출
    handleGptChunkRef.current?.(content);
  }, []);

  // GPT Done 핸들러 (useCallback으로 memoization)
  const handleGptDone = useCallback((message: { nodes: any[]; timestamp: number }) => {
    // 중복 방지: 같은 timestamp를 2번 처리하지 않음
    if (processedGptTimestamps.current.has(message.timestamp)) {
      console.warn('[VoiceChat] ⚠️ Duplicate GPT done message ignored:', message.timestamp);
      return;
    }
    processedGptTimestamps.current.add(message.timestamp);

    console.log('[VoiceChat] ===== GPT Processing Complete =====');
    console.log('[VoiceChat] 📊 Received GPT response:', {
      nodeCount: message.nodes.length,
      timestamp: new Date(message.timestamp).toISOString(),
    });
    console.log('[VoiceChat] 🎯 GPT Nodes:', message.nodes);

    // MAINTAINER만 노드를 생성 (권한 기반 제어)
    const isMaintainer = myRole === 'MAINTAINER';

    console.log('[VoiceChat] 🔍 권한 체크:', {
      myRole,
      isMaintainer,
      currentUserId: currentUserRef.current?.id.toString(),
    });

    let createdNodeIds: string[] = [];

    if (isMaintainer) {
      console.log('[VoiceChat] 🎯 MAINTAINER → 노드 생성');
      // 노드를 마인드맵에 추가하고 생성된 노드 ID들 받기 (ref로 최신 함수 참조)
      createdNodeIds = createNodesFromGptRef.current(message.nodes);
    } else {
      console.log('[VoiceChat] ℹ️ 다른 역할 → 키워드 표시만');
    }

    // 모든 참여자: 부모 컴포넌트에 노드와 생성된 ID들 전달 (ExtractedKeywordList에 표시하기 위해)
    onGptNodesReceived?.(message.nodes, createdNodeIds);

    console.log('[VoiceChat] ✅ GPT 처리 완료');
  }, [onGptNodesReceived, myRole]);

  // GPT Error 핸들러 (useCallback으로 memoization)
  const handleGptError = useCallback((message: { error: string; rawText?: string; timestamp: number }) => {
    console.error('[VoiceChat] ===== GPT Error =====');
    console.error('[VoiceChat] ❌ Error message:', message.error);

    if (message.rawText) {
      console.error('[VoiceChat] 📄 Raw GPT response (failed to parse):');
      console.error(message.rawText);
      console.error('[VoiceChat] Response length:', message.rawText.length, 'characters');
    } else {
      console.error('[VoiceChat] ⚠️ No raw response available');
    }

    // TODO: 사용자에게 에러 알림 표시
    console.log('[VoiceChat] 💡 TODO: Display error notification to user');
  }, []);

  // GPT Recording Started 핸들러 (ref 사용)
  const handleGptRecordingStarted = useCallback((startedBy: string, timestamp: number) => {
    console.log('[VoiceChat] ===== GPT 녹음 시작됨 =====');
    console.log('[VoiceChat] 👤 Started by:', startedBy);
    console.log('[VoiceChat] 🕐 Timestamp:', new Date(timestamp).toISOString());
    console.log('[VoiceChat] 📊 Current user:', currentUserRef.current?.id.toString());

    // 다른 사람이 녹음을 시작한 경우, 자동으로 STT 시작
    if (startedBy !== currentUserRef.current?.id.toString()) {
      console.log('[VoiceChat] 🎤 다른 사용자가 녹음 시작 → 자동으로 STT 시작');
      if (!gptIsRecordingRef.current) {
        gptStartRecordingRef.current?.();
      } else {
        console.log('[VoiceChat] ⚠️ 이미 녹음 중, 스킵');
      }
    } else {
      console.log('[VoiceChat] ℹ️ 본인이 시작한 녹음, STT는 이미 시작됨');
    }
  }, []);

  // GPT Session Ended 핸들러 (ref 사용)
  const handleGptSessionEnded = useCallback(() => {
    console.log('[VoiceChat] ===== GPT 세션 종료됨 =====');

    if (gptIsRecordingRef.current) {
      console.log('[VoiceChat] 🛑 자동으로 STT 종료...');
      gptStopRecordingRef.current?.();
    } else {
      console.log('[VoiceChat] ⚠️ 녹음 중이 아님, 스킵');
    }
  }, []);

  // Meeting Minutes handlers (will be passed to useVoiceChat)
  const [meetingMinutesState, setMeetingMinutesState] = React.useState({
    isGenerating: false,
    content: '',
    showConfirmDialog: false,
    showContentDialog: false,
    error: null as string | null,
  });

  const handleMeetingMinutesChunk = useCallback(
    (message: { content: string; timestamp: number }) => {
      console.log('[VoiceChat] 📦 Meeting minutes chunk received');
      setMeetingMinutesState((prev) => ({
        ...prev,
        content: prev.content + message.content,
      }));
    },
    []
  );

  const handleMeetingMinutesDone = useCallback(
    (message: { content: string; timestamp: number }) => {
      console.log('[VoiceChat] ✅ Meeting minutes generation complete');
      setMeetingMinutesState((prev) => ({
        ...prev,
        isGenerating: false,
        content: message.content,
      }));
    },
    []
  );

  const handleMeetingMinutesError = useCallback(
    (message: { error: string; timestamp: number }) => {
      console.error('[VoiceChat] ❌ Meeting minutes error:', message.error);
      setMeetingMinutesState((prev) => ({
        ...prev,
        isGenerating: false,
        error: message.error,
      }));
    },
    []
  );

  // Use the voice chat hook
  const {
    isInVoice,
    participants,
    isMuted,
    isSpeaking,
    remoteStreams,
    joinVoice,
    leaveVoice,
    toggleMute,
    sendMessage,
    connectionState,
    requestMeetingMinutes,
  } = useVoiceChat({
    workspaceId,
    userId: currentUser?.id.toString(),
    enabled: false, // Manual join via button
    onGptChunk: onGptChunkReceived,
    onGptDone: handleGptDone,
    onGptError: handleGptError,
    onGptRecordingStarted: handleGptRecordingStarted,
    onGptSessionEnded: handleGptSessionEnded,
    onMeetingMinutesChunk: handleMeetingMinutesChunk,
    onMeetingMinutesDone: handleMeetingMinutesDone,
    onMeetingMinutesError: handleMeetingMinutesError,
  });

  // GPT Hook (only for UI state management - handlers are in useVoiceChat)
  const gpt = useVoiceGpt({
    sendMessage,
    isConnected: connectionState === 'connected',
    onGptChunk: () => {}, // Handled by useVoiceChat
    onGptDone: () => {}, // Handled by useVoiceChat
    onGptError: () => {}, // Handled by useVoiceChat
  });

  // handleGptChunk를 ref에 저장
  useEffect(() => {
    handleGptChunkRef.current = gpt.handleGptChunk;
  }, [gpt.handleGptChunk]);

  // GPT control functions를 ref에 저장
  useEffect(() => {
    gptStartRecordingRef.current = gpt.startRecording;
    gptStopRecordingRef.current = gpt.stopRecording;
    gptIsRecordingRef.current = gpt.isRecording;
  }, [gpt.startRecording, gpt.stopRecording, gpt.isRecording]);

  // GPT 녹음 상태 변경 시 처리
  useEffect(() => {
    onGptRecordingChange?.(gpt.isRecording);

    // 녹음이 시작될 때만 Awareness 초기화 (false -> true 전환)
    if (gpt.isRecording && !prevIsRecordingRef.current) {
      if (updateGptState && currentUserRef.current) {
        // console.log('[VoiceChat] 📡 Awareness 초기화: 녹음 시작');
        updateGptState({
          isRecording: true,
          keywords: [], // 초기 상태
          startedBy: currentUserRef.current.id.toString(),
          timestamp: Date.now(),
        });
      }
    }
    // 녹음이 종료될 때 isRecording만 false로 업데이트 (키워드는 유지)
    else if (!gpt.isRecording && prevIsRecordingRef.current) {
      if (updateGptState && gptStateRef.current) {
        // console.log('[VoiceChat] 📡 Awareness 업데이트: 녹음 종료');
        // console.log('[VoiceChat] 현재 상태:', gptStateRef.current);
        updateGptState({
          ...gptStateRef.current, // ref 사용으로 최신 상태 참조
          isRecording: false, // 녹음 상태만 false로 변경
          // keywords, startedBy, timestamp는 그대로 유지
        });
      }
    }

    // 이전 상태 업데이트
    prevIsRecordingRef.current = gpt.isRecording;
  }, [gpt.isRecording, updateGptState, onGptRecordingChange]); // gptState 제거, ref 사용

  // GPT toggle 함수를 부모에게 전달
  useEffect(() => {
    onGptToggleReady?.(gpt.toggleRecording);
  }, [gpt.toggleRecording, onGptToggleReady]);

  // Join voice chat on mount
  useEffect(() => {
    if (!isInVoice) {
      joinVoice();
    }

    // Cleanup on unmount
    return () => {
      console.log('[VoiceChat] 🧹 Component unmounting, cleaning up...');

      // Stop GPT recording if active
      if (gpt.isRecording) {
        console.log('[VoiceChat] 🛑 Stopping GPT recording on unmount...');
        gpt.stopRecording();
      }

      // Leave voice chat if active
      if (isInVoice) {
        console.log('[VoiceChat] 📞 Leaving voice chat on unmount...');
        leaveVoice();
      }
    };
  }, []); // Only run on mount

  const handleCallToggle = () => {
    if (isInVoice) {
      // Stop GPT recording FIRST if active (to stop Web Speech API)
      if (gpt.isRecording) {
        console.log('[VoiceChat] 🛑 Stopping GPT recording before leaving voice...');
        gpt.stopRecording();
      }

      // MAINTAINER: Show confirm dialog to choose between mindmap or meeting minutes
      const isMaintainer = myRole === 'MAINTAINER';
      if (isMaintainer) {
        console.log('[VoiceChat] 👤 MAINTAINER ending voice → Show confirm dialog');
        setMeetingMinutesState((prev) => ({ ...prev, showConfirmDialog: true }));
      } else {
        // MEMBER: Just leave voice chat immediately
        console.log('[VoiceChat] 👤 MEMBER ending voice → Leave immediately');
        leaveVoice();
        onCallEnd?.();
      }
    }
  };

  // Handle "View Mindmap" button click in confirm dialog
  const handleViewMindmap = useCallback(() => {
    console.log('[VoiceChat] 📍 User chose "View Mindmap" → Cleanup and close');
    setMeetingMinutesState((prev) => ({ ...prev, showConfirmDialog: false }));
    leaveVoice();
    onCallEnd?.();
  }, [leaveVoice, onCallEnd]);

  // Handle "View Meeting Minutes" button click in confirm dialog
  const handleViewMeetingMinutes = useCallback(() => {
    console.log('[VoiceChat] 📝 User chose "View Meeting Minutes" → Generate');
    setMeetingMinutesState((prev) => ({
      ...prev,
      showConfirmDialog: false,
      showContentDialog: true,
      isGenerating: true,
      content: '',
      error: null,
    }));
    requestMeetingMinutes();
  }, [requestMeetingMinutes]);

  // Handle meeting minutes dialog close
  const handleMeetingMinutesClose = useCallback(() => {
    console.log('[VoiceChat] ❌ Closing meeting minutes dialog → Cleanup');
    setMeetingMinutesState((prev) => ({
      ...prev,
      showContentDialog: false,
      content: '',
      error: null,
    }));
    leaveVoice();
    onCallEnd?.();
  }, [leaveVoice, onCallEnd]);

  // Play remote audio streams
  useEffect(() => {
    remoteStreams.forEach((stream, userId) => {
      // Find or create audio element for this user
      let audioElement = document.getElementById(`voice-audio-${userId}`) as HTMLAudioElement;

      if (!audioElement) {
        audioElement = document.createElement('audio');
        audioElement.id = `voice-audio-${userId}`;
        audioElement.autoplay = true;
        audioElement.style.display = 'none';
        document.body.appendChild(audioElement);
      }

      if (audioElement.srcObject !== stream) {
        audioElement.srcObject = stream;
      }
    });

    // Cleanup audio elements for users who left
    // Only remove audio elements that are no longer in remoteStreams
    const activeUserIds = new Set(Array.from(remoteStreams.keys()));
    const allAudioElements = document.querySelectorAll('[id^="voice-audio-"]');
    allAudioElements.forEach((element) => {
      const userId = element.id.replace('voice-audio-', '');
      if (!activeUserIds.has(userId)) {
        element.remove();
      }
    });
  }, [remoteStreams]);

  // Build user list with voice states
  const voiceUsers = useMemo(() => {
    // Map participants to user display data
    const users = participants.map((participant, index) => {
      // Check if this participant is current user
      const isCurrentUser = participant.userId === currentUser?.id.toString();

      // Find peer data for avatar/name (for other users)
      const peer = peers.find((p) => p.userId?.toString() === participant.userId);

      // Determine if this participant is speaking
      const isUserSpeaking = isCurrentUser
        ? isSpeaking
        : participant.voiceState?.speaking ?? false;

      return {
        id: participant.userId,
        name: isCurrentUser
          ? currentUser.nickname
          : (peer?.name ?? `User ${participant.userId}`),
        avatar: isCurrentUser
          ? getProfileImageUrl(currentUser.profileImage)
          : getProfileImageUrl(peer?.profileImage),
        isSpeaking: isUserSpeaking && !(participant.voiceState?.muted ?? false),
        voiceColor: isCurrentUser
          ? cursorColor
          : peer?.color,
        colorIndex: index % 6,
      };
    });

    return users;
  }, [participants, peers, currentUser, isSpeaking, cursorColor]);

  return (
    <>
      <div
        className="flex items-center gap-3 bg-semi-white px-4 py-2 shadow-lg"
        style={{ borderRadius: "20px" }}
      >
        {/* Users Avatars */}
        <div className="flex items-center gap-3">
          {voiceUsers.map((user, index) => (
            <VoiceAvatar
              key={user.id}
              avatar={user.avatar}
              name={user.name}
              isSpeaking={user.isSpeaking}
              voiceColor={user.voiceColor}
              colorIndex={user.colorIndex}
              index={index}
            />
          ))}
        </div>

        {/* Divider */}
        <div className="h-12 w-px bg-gray-300 mx-2" />

        {/* Control Buttons */}
        <VoiceControls
          isMuted={isMuted}
          isCallActive={isInVoice}
          isGptRecording={gpt.isRecording}
          showOrganize={myRole === "MAINTAINER"}
          onMicToggle={toggleMute}
          onCallToggle={handleCallToggle}
          onOrganize={gpt.toggleRecording}
          workspaceId={workspaceId}
          yclient={yclient}
          peers={peers}
        />
      </div>

      {/* Meeting Minutes Dialogs */}
      <ConfirmDialog
        isOpen={meetingMinutesState.showConfirmDialog}
        onClose={() => setMeetingMinutesState((prev) => ({ ...prev, showConfirmDialog: false }))}
        characterImage={popoImage}
        title="회의가 종료되었습니다."
        description={`회의 내용은 Popo가 정리해드렸어요.\n생성된 회의록을 확인하시겠습니까?`}
        buttons={[
          {
            id: "view-mindmap",
            text: "마인드맵 보기",
            onClick: handleViewMindmap,
            variant: "outline",
          },
          {
            id: "view-meeting-minutes",
            text: "회의록 확인하기",
            onClick: handleViewMeetingMinutes,
            variant: "default",
          },
        ]}
      />

      <ContentDialog
        isOpen={meetingMinutesState.showContentDialog}
        onClose={handleMeetingMinutesClose}
        characterImage={popoImage}
        title={workspace?.title ? `${workspace.title} 회의` : "회의록"}
        content={
          meetingMinutesState.error
            ? `# ❌ 오류 발생\n\n${meetingMinutesState.error}`
            : meetingMinutesState.content || "# 📝 회의록\n\n회의록이 아직 생성되지 않았습니다."
        }
        isLoading={meetingMinutesState.isGenerating}
        buttons={[
          {
            id: "copy",
            text: "복사하기",
            onClick: () => {
              if (meetingMinutesState.content) {
                navigator.clipboard
                  .writeText(meetingMinutesState.content)
                  .then(() => {
                    alert("회의록이 클립보드에 복사되었습니다!");
                  })
                  .catch((err) => {
                    console.error("[VoiceChat] Failed to copy:", err);
                    alert("복사에 실패했습니다.");
                  });
              }
            },
            variant: "outline",
          },
          {
            id: "close",
            text: "닫기",
            onClick: handleMeetingMinutesClose,
            variant: "default",
          },
        ]}
      />
    </>
  );
};

export default VoiceChat;