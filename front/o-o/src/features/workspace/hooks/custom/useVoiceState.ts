import { useEffect, useState, useRef, useCallback } from 'react';
import { SPEAKING_THRESHOLD, SPEAKING_HANGOVER_MS, MIN_SPEAKING_MS } from '@/constants/voiceChat';
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

  // References to track speaking timing
  const lastAboveThresholdRef = useRef<number | null>(null);
  const speakingSinceRef = useRef<number | null>(null);

  
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


    // Analyze audio levels;
    const detectSpeaking = () => {
      if (!analyserRef.current) return;

      analyser.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((sum, v) => sum + v, 0) / dataArray.length;

      const now = performance.now();
      const aboveThreshold = average > SPEAKING_THRESHOLD;

      if (aboveThreshold) {
        if (!speakingSinceRef.current) {
          // threshold를 처음 넘은 시점 기록
          speakingSinceRef.current = now;
        }
        lastAboveThresholdRef.current = now;
      }

      let nextSpeakingState = previousSpeakingState;

      // 1) 아직 speaking이 아니었는데, 일정 시간 이상 계속 threshold 위에 있음 → speaking 시작
      if (!previousSpeakingState && speakingSinceRef.current) {
        if (now - speakingSinceRef.current > MIN_SPEAKING_MS) {
          nextSpeakingState = true;
        }
      }

      // 2) speaking 중인데, 마지막으로 threshold를 넘은 이후로 오래 지남 → speaking 종료
      if (previousSpeakingState && lastAboveThresholdRef.current) {
        if (now - lastAboveThresholdRef.current > SPEAKING_HANGOVER_MS) {
          nextSpeakingState = false;
          speakingSinceRef.current = null;
          lastAboveThresholdRef.current = null;
        }
      }

      if (nextSpeakingState !== previousSpeakingState) {
        previousSpeakingState = nextSpeakingState;
        setIsSpeaking(nextSpeakingState);

        if (isConnected) {
          sendMessage({
            type: 'voice-state',
            voiceState: {
              muted: isMuted,
              speaking: nextSpeakingState,
            },
          });
        }

        console.log(
          '[VoiceState] Speaking state changed:',
          nextSpeakingState,
          'avg:',
          average.toFixed(2)
        );
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
