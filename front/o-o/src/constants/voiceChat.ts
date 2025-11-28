// Voice Chat WebSocket URL
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8084';

// Voice WebSocket endpoint
export const VOICE_WS_BASE_URL = WS_URL.replace('/mindmap/ws', '/mindmap/voice');

export function buildVoiceWsUrl(workspaceId: string): string {
  return `${VOICE_WS_BASE_URL}?workspace=${workspaceId}`;
}

// Maximum participants in a voice chat room
export const MAX_PARTICIPANTS = 6;

// WebRTC ICE servers configuration
export const ICE_SERVERS: RTCIceServer[] = [
  {
    urls: 'stun:stun.l.google.com:19302',
  },
  // Add TURN servers here for production if needed
];

// Speaking detection threshold (0-255 scale)
// 권장 범위: 15-30 (낮을수록 민감함, 높을수록 큰 소리만 감지)
export const SPEAKING_THRESHOLD = 30;
export const SPEAKING_HANGOVER_MS = 300;   // 말 멈춘 후 300ms 정도는 유지
export const MIN_SPEAKING_MS = 120;        // 짧은 픽 노이즈는 무시

// Speaking detection check interval (ms)
export const SPEAKING_CHECK_INTERVAL = 100;

// AudioContext settings
export const AUDIO_CONTEXT_CONFIG = {
  fftSize: 2048,
  smoothingTimeConstant: 0.8,
} as const;
