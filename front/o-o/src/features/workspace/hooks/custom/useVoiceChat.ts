import { useState, useEffect, useCallback, useRef } from 'react';
import { useVoiceConnection } from './useVoiceConnection';
import { useWebRTC } from './useWebRTC';
import { useVoiceState } from './useVoiceState';
import type {
  VoiceParticipant,
  MeetingMinutesChunkMessage,
  MeetingMinutesDoneMessage,
  MeetingMinutesErrorMessage,
} from '../../types/voice.types';

interface UseVoiceChatOptions {
  workspaceId: string;
  userId: string | undefined;
  enabled?: boolean; // Whether to auto-join voice chat
  onGptChunk?: (content: string) => void;
  onGptDone?: (message: { nodes: any[]; timestamp: number }) => void;
  onGptError?: (message: { error: string; rawText?: string; timestamp: number }) => void;
  onGptRecordingStarted?: (startedBy: string, timestamp: number) => void;
  onGptSessionEnded?: () => void;
  onMeetingMinutesChunk?: (message: MeetingMinutesChunkMessage) => void;
  onMeetingMinutesDone?: (message: MeetingMinutesDoneMessage) => void;
  onMeetingMinutesError?: (message: MeetingMinutesErrorMessage) => void;
}

export function useVoiceChat({
  workspaceId,
  userId,
  enabled = false,
  onGptChunk,
  onGptDone,
  onGptError,
  onGptRecordingStarted,
  onGptSessionEnded,
  onMeetingMinutesChunk,
  onMeetingMinutesDone,
  onMeetingMinutesError,
}: UseVoiceChatOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isInVoice, setIsInVoice] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Refs for WebRTC handlers
  const handleOfferRef = useRef<((fromUserId: string, offer: RTCSessionDescriptionInit) => Promise<void>) | null>(null);
  const handleAnswerRef = useRef<((fromUserId: string, answer: RTCSessionDescriptionInit) => Promise<void>) | null>(null);
  const handleIceRef = useRef<((fromUserId: string, candidate: RTCIceCandidateInit) => Promise<void>) | null>(null);

  // WebSocket connection for signaling
  const {
    participants,
    connectionState,
    sendMessage,
    disconnect: disconnectVoice,
  } = useVoiceConnection(
    workspaceId,
    { enabled: isInVoice },
    {
      onOffer: (fromUserId, offer) => handleOfferRef.current?.(fromUserId, offer),
      onAnswer: (fromUserId, answer) => handleAnswerRef.current?.(fromUserId, answer),
      onIce: (fromUserId, candidate) => handleIceRef.current?.(fromUserId, candidate),
      onGptChunk: onGptChunk,
      onGptDone: onGptDone,
      onGptError: onGptError,
      onGptRecordingStarted: onGptRecordingStarted,
      onGptSessionEnded: onGptSessionEnded,
      onMeetingMinutesChunk: onMeetingMinutesChunk,
      onMeetingMinutesDone: onMeetingMinutesDone,
      onMeetingMinutesError: onMeetingMinutesError,
    }
  );

  const isConnected = connectionState === 'connected';

  // WebRTC peer connections
  const { peerConnections, remoteStreams, handleOffer, handleAnswer, handleIce } = useWebRTC(
    localStream,
    participants,
    sendMessage,
    userId
  );

  // Voice state (mute/speaking)
  const { isMuted, isSpeaking, toggleMute } = useVoiceState(localStream, sendMessage, isConnected);

  // Wire up WebRTC handlers to refs
  useEffect(() => {
    handleOfferRef.current = handleOffer;
    handleAnswerRef.current = handleAnswer;
    handleIceRef.current = handleIce;
  }, [handleOffer, handleAnswer, handleIce]);

  // Get user media (microphone)
  const getUserMedia = useCallback(async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      console.log('[useVoiceChat] Got user media stream');
      return stream;
    } catch (err) {
      console.error('[useVoiceChat] Failed to get user media:', err);
      setError('마이크 접근 권한이 필요합니다.');
      return null;
    }
  }, []);

  // Join voice chat
  const joinVoice = useCallback(async () => {
    if (isInVoice) {
      console.warn('[useVoiceChat] Already in voice chat');
      return;
    }

    setError(null);

    // Get microphone access
    const stream = await getUserMedia();
    if (!stream) {
      return;
    }

    setLocalStream(stream);
    localStreamRef.current = stream;

    // Enable WebSocket connection by setting isInVoice
    setIsInVoice(true);

    console.log('[useVoiceChat] Joined voice chat');
  }, [isInVoice, getUserMedia]);

  // Leave voice chat
  const leaveVoice = useCallback(() => {
    if (!isInVoice) {
      console.warn('[useVoiceChat] Not in voice chat');
      return;
    }

    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    setLocalStream(null);

    // Disconnect from signaling server (useVoiceConnection will handle this via enabled flag)
    setIsInVoice(false);
    setError(null);

    console.log('[useVoiceChat] Left voice chat');
  }, [isInVoice]);

  // Auto-join if enabled
  useEffect(() => {
    if (enabled && !isInVoice && userId) {
      joinVoice();
    }

    return () => {
      // Cleanup on unmount - stop all tracks
      console.log('[useVoiceChat] 🧹 Cleanup: Stopping local stream tracks...');
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          console.log('[useVoiceChat] 🛑 Stopping track:', track.kind, track.label);
          track.stop();
        });
        localStreamRef.current = null;
      }
    };
  }, [enabled]); // Only run on mount/unmount or when enabled changes

  // Request meeting minutes generation
  const requestMeetingMinutes = useCallback(() => {
    if (!userId) {
      console.error('[useVoiceChat] Cannot request meeting minutes: userId is undefined');
      return;
    }

    console.log('[useVoiceChat] 📝 Requesting meeting minutes generation...');

    sendMessage({
      type: 'generate-meeting-minutes',
      userId,
    });
  }, [userId, sendMessage]);

  return {
    // State
    isInVoice,
    isConnected,
    connectionState,
    participants,
    isMuted,
    isSpeaking,
    error,

    // Streams
    localStream,
    remoteStreams,
    peerConnections,

    // Actions
    joinVoice,
    leaveVoice,
    toggleMute,
    sendMessage,
    requestMeetingMinutes,
  };
}
