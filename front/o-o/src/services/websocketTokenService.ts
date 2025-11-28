import { apiClient } from '@/lib/axios';

/**
 * WebSocket 토큰 응답 DTO
 */
interface WebSocketTokenResponseDTO {
  wsToken: string;
}

/**
 * WebSocket 연결용 단기 토큰을 발급받습니다.
 *
 * - 유효시간: 1분
 * - 용도: 실시간 협업 WebSocket 연결 인증
 * - 엔드포인트: POST /auth/ws-token
 *
 * @returns WebSocket 토큰 문자열
 * @throws API 요청 실패 시 에러
 *
 * @example
 * ```typescript
 * const wsToken = await fetchWebSocketToken();
 * const wsUrl = `wss://api.o-o.io.kr/mindmap/ws?workspace=${id}&token=${wsToken}`;
 * ```
 */
export async function fetchWebSocketToken(): Promise<string> {
  const { data } = await apiClient.post<WebSocketTokenResponseDTO>('/auth/ws-token');
  return data.wsToken;
}
