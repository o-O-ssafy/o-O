import { useEffect, useState, useRef, useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import { fetchWebSocketToken } from '@/services/websocketTokenService';
import { buildVoiceWsUrl } from '@/constants/voiceChat';
import type {
  ServerMessage,
  ClientMessage,
  VoiceParticipant,
  ConnectionState,
  OfferMessage,
  AnswerMessage,
  IceMessage,
  VoiceStateMessage,
  PeerTranscriptMessage,
  GptChunkMessage,
  GptDoneMessage,
  GptErrorMessage,
} from '../../types/voice.types';

type UseVoiceConnectionOptions = {
  enabled: boolean;
  onAuthError?: () => void;
};

type MessageHandlers = {
  onOffer?: (fromUserId: string, offer: RTCSessionDescriptionInit) => void;
  onAnswer?: (fromUserId: string, answer: RTCSessionDescriptionInit) => void;
  onIce?: (fromUserId: string, candidate: RTCIceCandidateInit) => void;
  onVoiceState?: (userId: string, muted: boolean, speaking: boolean) => void;
  onPeerTranscript?: (userId: string, userName: string, text: string, timestamp: number) => void;
  onGptChunk?: (content: string) => void;
  onGptDone?: (message: GptDoneMessage) => void;
  onGptError?: (message: GptErrorMessage) => void;
};

export function useVoiceConnection(
  workspaceId: string,
  options: UseVoiceConnectionOptions,
  handlers: MessageHandlers = {}
) {
  const { enabled, onAuthError } = options;

  const [ws, setWs] = useState<WebSocket | null>(null);
  const [participants, setParticipants] = useState<VoiceParticipant[]>([]);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [isFull, setIsFull] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const mountedRef = useRef(true);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const handlersRef = useRef(handlers);

  const currentUser = useAppSelector((state) => state.user.user);

  // Update handlers ref when they change
  useEffect(() => {
    handlersRef.current = handlers;
  }, [handlers]);

  const MAX_RECONNECT_ATTEMPTS = 3;
  const RECONNECT_DELAY = 2000;

  // Send message to server
  const sendMessage = useCallback((message: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Connect to Voice WebSocket
  const connect = useCallback(async () => {
    if (!enabled || !mountedRef.current) {
      return;
    }
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setConnectionState('connecting');

      const token = await fetchWebSocketToken();
      const url = `${buildVoiceWsUrl(workspaceId)}&token=${token}`;

      const socket = new WebSocket(url);

      socket.onopen = () => {
        setConnectionState('connected');
        reconnectAttemptsRef.current = 0;

        if (mountedRef.current) {
          wsRef.current = socket;
          setWs(socket);
        }
      };

      socket.onmessage = (event) => {
        try {
          const message: ServerMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'participants':
              setParticipants(message.participants);
              break;

            case 'voice-joined':
              setParticipants((prev) => [
                ...prev,
                { userId: message.userId },
              ]);
              break;

            case 'voice-left':
              setParticipants((prev) =>
                prev.filter((p) => p.userId !== message.userId)
              );
              break;

            case 'voice-full':
              setIsFull(true);
              setConnectionState('error');
              break;

            case 'offer':
              handlersRef.current.onOffer?.(message.fromUserId, message.offer);
              break;

            case 'answer':
              handlersRef.current.onAnswer?.(message.fromUserId, message.answer);
              break;

            case 'ice':
              handlersRef.current.onIce?.(message.fromUserId, message.candidate);
              break;

            case 'voice-state':
              handlersRef.current.onVoiceState?.(
                message.userId,
                message.voiceState.muted,
                message.voiceState.speaking
              );
              break;

            case 'peer-transcript':
              handlersRef.current.onPeerTranscript?.(
                message.userId,
                message.userName,
                message.text,
                message.timestamp
              );
              break;

            case 'gpt-chunk':
              handlersRef.current.onGptChunk?.(message.content);
              break;

            case 'gpt-done':
              handlersRef.current.onGptDone?.(message);
              break;

            case 'gpt-error':
              handlersRef.current.onGptError?.(message);
              break;

            case 'server-shutdown':
              setConnectionState('disconnected');
              break;

            default:
              break;
          }
        } catch (error) {
          console.error('[useVoiceConnection] Error parsing message:', error);
        }
      };

      socket.onerror = () => {
        setConnectionState('error');
      };

      socket.onclose = () => {
        setConnectionState('disconnected');
        wsRef.current = null;
        setWs(null);

        // Auto-reconnect logic
        if (
          mountedRef.current &&
          enabled &&
          reconnectAttemptsRef.current < MAX_RECONNECT_ATTEMPTS
        ) {
          reconnectAttemptsRef.current++;

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, RECONNECT_DELAY);
        } else if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          onAuthError?.();
        }
      };
    } catch (error) {
      setConnectionState('error');
      onAuthError?.();
    }
  }, [enabled, workspaceId, onAuthError]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setWs(null);
    }

    setConnectionState('disconnected');
    setParticipants([]);
    setIsFull(false);
  }, []);

  // Connect when enabled
  useEffect(() => {
    mountedRef.current = true; // 매번 enabled가 변경될 때 mounted = true로 재설정

    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      // 컴포넌트가 실제로 언마운트될 때만 false로 설정
      // enabled 변경 시에는 실행되지만 바로 위에서 true로 재설정됨
      mountedRef.current = false;
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return {
    ws,
    participants,
    connectionState,
    isFull,
    sendMessage,
    disconnect,
  };
}
