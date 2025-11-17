import { useEffect, useState, useRef, useCallback } from 'react';
import { SPEAKING_THRESHOLD } from '@/constants/voiceChat';
import type { VoiceState, ClientMessage } from '../../types/voice.types';

type SendMessageFn = (message: ClientMessage) => void;

export function useVoiceState(
  localStream: MediaStream | null,
  sendMessage: SendMessageFn,
  isConnected: boolean
) {
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Toggle mute/unmute
  const toggleMute = useCallback(() => {
    if (!localStream) return;

    const audioTrack = localStream.getAudioTracks()[0];
    if (!audioTrack) return;

    const newMutedState = !isMuted;
    audioTrack.enabled = !newMutedState;
    setIsMuted(newMutedState);

    // Broadcast voice state change
    if (isConnected) {
      sendMessage({
        type: 'voice-state',
        voiceState: {
          muted: newMutedState,
          speaking: false, // Always false when toggling mute
        },
      });
    }
  }, [localStream, isMuted, isConnected, sendMessage]);

  // Speaking detection using AudioContext
  useEffect(() => {
    if (!localStream || isMuted) {
      // Cleanup if no stream or muted
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (isSpeaking) {
        setIsSpeaking(false);
        if (isConnected) {
          sendMessage({
            type: 'voice-state',
            voiceState: {
              muted: isMuted,
              speaking: false,
            },
          });
        }
      }
      return;
    }

    // Create AudioContext and AnalyserNode
    const audioContext = new AudioContext();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(localStream);

    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);

    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    let previousSpeakingState = false;

    // Analyze audio levels
    const detectSpeaking = () => {
      if (!analyserRef.current) return;

      analyser.getByteFrequencyData(dataArray);

      // Calculate average volume
      const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;

      const isCurrentlySpeaking = average > SPEAKING_THRESHOLD;

      // Only update and broadcast if speaking state changed
      if (isCurrentlySpeaking !== previousSpeakingState) {
        previousSpeakingState = isCurrentlySpeaking;
        setIsSpeaking(isCurrentlySpeaking);

        if (isConnected) {
          sendMessage({
            type: 'voice-state',
            voiceState: {
              muted: isMuted,
              speaking: isCurrentlySpeaking,
            },
          });
        }
      }

      animationFrameRef.current = requestAnimationFrame(detectSpeaking);
    };

    detectSpeaking();

    // Cleanup
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [localStream, isMuted, isConnected, sendMessage]);

  return {
    isMuted,
    isSpeaking,
    toggleMute,
  };
}
