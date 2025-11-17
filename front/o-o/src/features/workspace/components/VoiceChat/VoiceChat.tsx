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
}) => {
  const currentUser = useAppSelector((state) => state.user.user);
  const { peers } = usePeerCursors();

  // GPT Node Creator
  const { createNodesFromGpt } = useGptNodeCreator(crud, workspaceId, nodes);

  // Ref to store handleGptChunk function
  const handleGptChunkRef = useRef<((content: string) => void) | null>(null);

  // GPT 청크 핸들러
  const onGptChunkReceived = useCallback((content: string) => {
    // useVoiceGpt의 handleGptChunk 호출
    handleGptChunkRef.current?.(content);
  }, []);

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
  } = useVoiceChat({
    workspaceId,
    userId: currentUser?.id.toString(),
    enabled: false, // Manual join via button
    onGptChunk: onGptChunkReceived,
    onGptDone: (message) => {
      console.log('[VoiceChat] ===== GPT Processing Complete =====');
      console.log('[VoiceChat] 📊 Received GPT response:', {
        nodeCount: message.nodes.length,
        timestamp: new Date(message.timestamp).toISOString(),
      });
      console.log('[VoiceChat] 🎯 GPT Nodes:', message.nodes);

      // 노드를 마인드맵에 추가하고 생성된 노드 ID들 받기
      const createdNodeIds = createNodesFromGpt(message.nodes);

      // 부모 컴포넌트에 노드와 생성된 ID들 전달 (ExtractedKeywordList에 표시하기 위해)
      onGptNodesReceived?.(message.nodes, createdNodeIds);

      console.log('[VoiceChat] ✅ GPT 노드 생성 완료 및 데이터 전달');
    },
    onGptError: (message) => {
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
    },
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

  // GPT 녹음 상태 변경 시 부모에게 알림
  useEffect(() => {
    onGptRecordingChange?.(gpt.isRecording);
  }, [gpt.isRecording, onGptRecordingChange]);

  // GPT toggle 함수를 부모에게 전달
  useEffect(() => {
    onGptToggleReady?.(gpt.toggleRecording);
  }, [gpt.toggleRecording, onGptToggleReady]);

  // Join voice chat on mount
  useEffect(() => {
    if (!isInVoice) {
      joinVoice();
    }
  }, []); // Only run on mount

  const handleCallToggle = () => {
    if (isInVoice) {
      leaveVoice();
      onCallEnd?.();
    }
  };

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
  );
};

export default VoiceChat;