// components/VoiceChat/VoiceChat.tsx
import React, { useMemo, useEffect } from "react";
import VoiceAvatar from "./VoiceAvatar";
import VoiceControls from "./VoiceContols";
import { useVoiceChat } from "../../hooks/custom/useVoiceChat";
import { usePeerCursors } from "../PeerCursorProvider";
import { useAppSelector } from "@/store/hooks";
import { getProfileImageUrl } from "@/shared/utils/imageMapper";

import type { YClient } from "../../hooks/custom/yjsClient";

interface VoiceChatProps {
  workspaceId: string;
  onCallEnd?: () => void;
  onOrganize?: () => void;
  yclient?: YClient | null;
  cursorColor?: string;
}

const VoiceChat: React.FC<VoiceChatProps> = ({
  workspaceId,
  onCallEnd,
  onOrganize,
  yclient,
  cursorColor,
}) => {
  const currentUser = useAppSelector((state) => state.user.user);
  const { peers } = usePeerCursors();

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
  } = useVoiceChat({
    workspaceId,
    userId: currentUser?.id.toString(),
    enabled: false, // Manual join via button
  });

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
        onMicToggle={toggleMute}
        onCallToggle={handleCallToggle}
        onOrganize={onOrganize}
        workspaceId={workspaceId}
        yclient={yclient}
        peers={peers}
      />
    </div>
  );
};

export default VoiceChat;
