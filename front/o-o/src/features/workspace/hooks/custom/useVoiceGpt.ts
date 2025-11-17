import { useState, useCallback, useRef, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import type { ClientMessage, GptNodeSuggestion } from '../../types/voice.types';

interface UseVoiceGptOptions {
  sendMessage: (message: ClientMessage) => void;
  isConnected: boolean;
  onGptDone: (message: { nodes: GptNodeSuggestion[]; timestamp: number }) => void;
  onGptError?: (error: string, rawText?: string) => void;
  onGptChunk?: (content: string) => void;
}

interface TranscriptItem {
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

export function useVoiceGpt({
  sendMessage,
  isConnected,
  onGptDone,
  onGptError,
  onGptChunk,
}: UseVoiceGptOptions) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState<TranscriptItem[]>([]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const currentUser = useAppSelector((state) => state.user.user);
  const isRecordingRef = useRef(isRecording);
  const sendMessageRef = useRef(sendMessage);
  const currentUserRef = useRef(currentUser);
  const onGptErrorRef = useRef(onGptError);
  const onGptChunkRef = useRef(onGptChunk);

  // Refs 동기화
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    onGptErrorRef.current = onGptError;
  }, [onGptError]);

  useEffect(() => {
    onGptChunkRef.current = onGptChunk;
  }, [onGptChunk]);

  // Web Speech API 초기화 (한 번만 실행)
  useEffect(() => {
    console.log('[VoiceGpt] ===== Initializing Web Speech API =====');

    // @ts-ignore - SpeechRecognition may not be in types
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.error('[VoiceGpt] ❌ Speech Recognition not supported in this browser');
      console.error('[VoiceGpt] Please use Chrome, Edge, or Safari');
      return;
    }

    console.log('[VoiceGpt] ✅ Speech Recognition API available');

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ko-KR';

    console.log('[VoiceGpt] 🔧 Speech Recognition configured:', {
      continuous: recognition.continuous,
      interimResults: recognition.interimResults,
      lang: recognition.lang,
      maxAlternatives: recognition.maxAlternatives,
    });

    recognition.onresult = (event) => {
      console.log('[VoiceGpt] 📝 Speech recognition result event (resultIndex:', event.resultIndex, ', total results:', event.results.length, ')');

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        const isFinal = event.results[i].isFinal;
        const confidence = event.results[i][0].confidence;

        console.log(`[VoiceGpt] Result[${i}]:`, {
          transcript,
          isFinal,
          confidence,
          length: transcript.length,
        });

        if (isFinal && transcript.trim()) {
          console.log('[VoiceGpt] ✅ Final transcript confirmed:', transcript);
          console.log('[VoiceGpt] 👤 Speaker:', currentUserRef.current?.nickname, `(ID: ${currentUserRef.current?.id})`);

          const message: ClientMessage = {
            type: 'gpt-transcript' as const,
            userId: currentUserRef.current?.id.toString() || '',
            userName: currentUserRef.current?.nickname || '',
            text: transcript,
            isFinal: true,
            timestamp: Date.now(),
          };

          console.log('[VoiceGpt] 📤 Sending transcript to server:', message);
          sendMessageRef.current(message);
        } else if (!isFinal) {
          console.log('[VoiceGpt] 🔄 Interim result (not sending):', transcript.substring(0, 30) + '...');
        } else if (!transcript.trim()) {
          console.log('[VoiceGpt] ⚠️ Empty transcript, skipping');
        }
      }
    };

    recognition.onerror = (event) => {
      console.error('[VoiceGpt] ❌ Speech recognition error:', event.error);
      console.error('[VoiceGpt] Error details:', {
        error: event.error,
        message: event.message,
        isRecording,
      });

      if (event.error === 'no-speech') {
        console.warn('[VoiceGpt] ⚠️ No speech detected, will retry on next speech...');
      } else if (event.error === 'aborted') {
        console.log('[VoiceGpt] 🛑 Recognition aborted intentionally');
      } else if (event.error === 'network') {
        console.error('[VoiceGpt] 🌐 Network error - check internet connection');
        onGptErrorRef.current?.(`음성 인식 오류: ${event.error} (네트워크 연결을 확인해주세요)`);
      } else if (event.error === 'not-allowed') {
        console.error('[VoiceGpt] 🚫 Microphone permission denied');
        onGptErrorRef.current?.(`음성 인식 오류: ${event.error} (마이크 권한을 허용해주세요)`);
      } else {
        console.error('[VoiceGpt] ❌ Unexpected error:', event.error);
        onGptErrorRef.current?.(`음성 인식 오류: ${event.error}`);
      }
    };

    recognition.onend = () => {
      console.log('[VoiceGpt] 🔄 Recognition ended');
      console.log('[VoiceGpt] Current state - isRecording:', isRecordingRef.current);

      // 녹음 중이면 자동으로 재시작
      if (isRecordingRef.current) {
        console.log('[VoiceGpt] 🔁 Auto-restarting recognition (continuous mode)...');
        try {
          recognition.start();
          console.log('[VoiceGpt] ✅ Recognition restarted successfully');
        } catch (e) {
          console.error('[VoiceGpt] ❌ Failed to restart recognition:', e);
          console.error('[VoiceGpt] Error details:', {
            name: (e as Error).name,
            message: (e as Error).message,
          });
        }
      } else {
        console.log('[VoiceGpt] ⏹️ Not restarting (recording stopped by user)');
      }
    };

    recognitionRef.current = recognition;
    console.log('[VoiceGpt] ✅ Speech Recognition initialized and ready');

    return () => {
      console.log('[VoiceGpt] 🧹 Cleaning up Speech Recognition');
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        console.log('[VoiceGpt] ✅ Speech Recognition stopped and cleaned up');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 한 번만 실행 (mount/unmount 시에만)

  // 녹음 시작
  const startRecording = useCallback(() => {
    console.log('[VoiceGpt] ===== Starting GPT Recording =====');
    console.log('[VoiceGpt] Connection state:', isConnected);
    console.log('[VoiceGpt] Current user:', currentUser?.nickname, `(ID: ${currentUser?.id})`);

    if (!isConnected) {
      console.error('[VoiceGpt] ❌ Not connected to voice server');
      onGptError?.('음성 서버에 연결되지 않았습니다');
      return;
    }

    if (!recognitionRef.current) {
      console.error('[VoiceGpt] ❌ Speech recognition not initialized');
      onGptError?.('음성 인식을 사용할 수 없습니다');
      return;
    }

    // 서버에 시작 신호
    const startMessage: ClientMessage = {
      type: 'gpt-start-recording' as const,
      userId: currentUser?.id.toString() || '',
    };
    console.log('[VoiceGpt] 📤 Sending start message to server:', startMessage);
    sendMessage(startMessage);

    // Web Speech API 시작
    try {
      recognitionRef.current.start();
      setIsRecording(true);
      setTranscripts([]);
      console.log('[VoiceGpt] ✅ Web Speech API started successfully');
      console.log('[VoiceGpt] 🎤 Listening for speech...');
    } catch (error) {
      console.error('[VoiceGpt] ❌ Failed to start recognition:', error);
      onGptError?.('음성 인식을 시작할 수 없습니다');
    }
  }, [isConnected, sendMessage, currentUser, onGptError]);

  // 녹음 일시정지 (서버 연결 유지)
  const pauseRecording = useCallback(() => {
    console.log('[VoiceGpt] ===== Pausing GPT Recording =====');
    console.log('[VoiceGpt] Current user:', currentUser?.nickname, `(ID: ${currentUser?.id})`);

    // Web Speech API만 종료 (서버 연결은 유지)
    if (recognitionRef.current) {
      console.log('[VoiceGpt] ⏸️ Pausing Web Speech API...');
      recognitionRef.current.stop();
    } else {
      console.warn('[VoiceGpt] ⚠️ Recognition ref is null, cannot pause');
    }

    setIsRecording(false);
    console.log('[VoiceGpt] ✅ Recording paused (server connection maintained)');
  }, [currentUser]);

  // 녹음 종료 (서버 연결 해제)
  const stopRecording = useCallback(() => {
    console.log('[VoiceGpt] ===== Stopping GPT Recording =====');
    console.log('[VoiceGpt] Current user:', currentUser?.nickname, `(ID: ${currentUser?.id})`);

    // 서버에 종료 신호
    const stopMessage: ClientMessage = {
      type: 'gpt-stop-recording' as const,
      userId: currentUser?.id.toString() || '',
    };
    console.log('[VoiceGpt] 📤 Sending stop message to server:', stopMessage);
    sendMessage(stopMessage);

    // Web Speech API 종료
    if (recognitionRef.current) {
      console.log('[VoiceGpt] 🛑 Stopping Web Speech API...');
      recognitionRef.current.stop();
    } else {
      console.warn('[VoiceGpt] ⚠️ Recognition ref is null, cannot stop');
    }

    setIsRecording(false);
    console.log('[VoiceGpt] ✅ Recording stopped successfully');
  }, [sendMessage, currentUser]);

  // 다른 사람 transcript 추가
  const addPeerTranscript = useCallback(
    (userId: string, userName: string, text: string, timestamp: number) => {
      console.log('[VoiceGpt] 👥 Adding peer transcript:', {
        userId,
        userName,
        text,
        timestamp: new Date(timestamp).toISOString(),
      });

      setTranscripts((prev) => {
        const newTranscripts = [...prev, { userId, userName, text, timestamp }];
        console.log('[VoiceGpt] 📋 Total transcripts:', newTranscripts.length);
        return newTranscripts;
      });
    },
    []
  );

  // GPT 청크 핸들러
  const handleGptChunk = useCallback((content: string) => {
    console.log('[VoiceGpt]', content);
    onGptChunkRef.current?.(content);
  }, []);

  // 녹음 토글 (시작/종료)
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    transcripts,
    startRecording,
    pauseRecording,
    stopRecording,
    toggleRecording,
    addPeerTranscript,
    handleGptChunk,
  };
}
