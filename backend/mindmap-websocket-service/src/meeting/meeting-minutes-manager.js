/**
 * MeetingMinutesManager - 회의록 자동 생성 매니저
 *
 * 역할:
 * - 음성 채팅 중 수집된 STT를 기반으로 회의록 생성
 * - GPT API를 활용한 마크다운 회의록 작성
 * - 스트리밍 응답으로 실시간 피드백 제공
 */

import { logger } from '../utils/logger.js';

const GMS_API_URL = 'https://gms.ssafy.io/gmsapi/api.openai.com/v1/chat/completions';
const GMS_KEY = process.env.GMS_KEY;
const GPT_MODEL = process.env.GPT_MODEL || 'gpt-5-mini';

class MeetingMinutesManager {
  constructor() {
    logger.info('[MeetingMinutes] MeetingMinutesManager initialized');
  }

  /**
   * 회의록 생성
   * @param {string} workspaceId - 워크스페이스 ID
   * @param {Array} transcripts - 수집된 STT 배열 [{ userId, userName, text, timestamp }]
   * @param {WebSocket} conn - 응답 전송용 WebSocket 연결
   */
  async generate(workspaceId, transcripts, conn) {
    if (!transcripts || transcripts.length === 0) {
      logger.warn(`[MeetingMinutes] No transcripts available for workspace ${workspaceId}`);
      this.sendError(conn, '대화 내용이 없어 회의록을 생성할 수 없습니다.');
      return;
    }

    logger.info(`[MeetingMinutes] Starting generation for workspace ${workspaceId}`, {
      transcriptCount: transcripts.length,
      startTime: new Date(transcripts[0].timestamp).toISOString(),
      endTime: new Date(transcripts[transcripts.length - 1].timestamp).toISOString(),
    });

    try {
      // 1. 회의 정보 추출
      const meetingInfo = this.extractMeetingInfo(transcripts);

      // 2. 프롬프트 생성
      const prompt = this.buildPrompt(transcripts, meetingInfo);

      logger.info(`[MeetingMinutes] Prompt generated`, {
        workspaceId,
        promptLength: prompt.length,
        participants: meetingInfo.participants.join(', '),
      });

      // 3. GPT API 호출
      const messages = [
        {
          role: 'developer',
          content: '당신은 회의록 작성 전문가입니다. 주어진 회의 내용을 바탕으로 명확하고 구조화된 마크다운 회의록을 작성하세요.'
        },
        {
          role: 'user',
          content: prompt
        }
      ];

      const requestBody = {
        model: GPT_MODEL,
        messages: messages,
        stream: true,
      };

      logger.info(`[MeetingMinutes] Sending request to GMS API`, {
        workspaceId,
        model: GPT_MODEL,
        messageCount: messages.length,
      });

      const response = await fetch(GMS_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GMS_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`[MeetingMinutes] GMS API error`, {
          workspaceId,
          status: response.status,
          error: errorText,
        });
        this.sendError(conn, `회의록 생성 실패: ${response.status}`);
        return;
      }

      if (!response.body) {
        throw new Error('No response body from GMS API');
      }

      logger.info(`[MeetingMinutes] GMS API response received, starting stream`, {
        workspaceId,
        status: response.status,
      });

      // 4. 스트리밍 응답 처리
      await this.handleStreamResponse(workspaceId, response.body, conn);

      logger.info(`[MeetingMinutes] Generation completed successfully`, {
        workspaceId,
      });

    } catch (error) {
      logger.error(`[MeetingMinutes] Error generating meeting minutes:`, error);
      this.sendError(conn, '회의록 생성 중 오류가 발생했습니다.');
    }
  }

  /**
   * 회의 정보 추출 (참석자, 시간 등)
   */
  extractMeetingInfo(transcripts) {
    // 참석자 목록 (중복 제거)
    const participantsSet = new Set();
    transcripts.forEach(t => participantsSet.add(t.userName));
    const participants = Array.from(participantsSet);

    // 시작/종료 시간
    const startTime = transcripts[0].timestamp;
    const endTime = transcripts[transcripts.length - 1].timestamp;
    const duration = Math.round((endTime - startTime) / 1000 / 60); // 분 단위

    return {
      participants,
      startTime: new Date(startTime).toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      endTime: new Date(endTime).toLocaleString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      duration: `약 ${duration}분`,
      totalMessages: transcripts.length,
    };
  }

  /**
   * 회의록 생성 프롬프트 작성
   */
  buildPrompt(transcripts, meetingInfo) {
    let prompt = '# 회의 내용\n\n';
    prompt += `**참석자**: ${meetingInfo.participants.join(', ')}\n`;
    prompt += `**시작 시간**: ${meetingInfo.startTime}\n`;
    prompt += `**종료 시간**: ${meetingInfo.endTime}\n`;
    prompt += `**소요 시간**: ${meetingInfo.duration}\n\n`;
    prompt += '---\n\n';
    prompt += '## 대화 내용\n\n';

    // 대화 내용을 시간순으로 정렬
    const sortedTranscripts = [...transcripts].sort((a, b) => a.timestamp - b.timestamp);

    sortedTranscripts.forEach(t => {
      const time = new Date(t.timestamp).toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      prompt += `**[${time}] ${t.userName}**: ${t.text}\n\n`;
    });

    prompt += '---\n\n';
    prompt += '# 회의록 작성 지침\n\n';
    prompt += '위 회의 내용을 바탕으로 다음 형식의 회의록을 작성하세요:\n\n';

    prompt += '## 1. 회의 개요\n';
    prompt += '- 참석자와 회의 시간 정보를 포함\n';
    prompt += '- 회의의 전반적인 목적과 주제를 1-2문장으로 요약\n\n';

    prompt += '## 2. 주요 논의 사항\n';
    prompt += '- 회의에서 논의된 핵심 주제들을 번호 목록으로 정리\n';
    prompt += '- 각 주제별로 주요 의견과 논점을 요약\n';
    prompt += '- 중요한 발언은 발언자를 명시\n\n';

    prompt += '## 3. 결정 사항\n';
    prompt += '- 회의에서 결정된 내용을 명확하게 정리\n';
    prompt += '- 결정 사항이 없으면 "없음"으로 표시\n\n';

    prompt += '## 4. 액션 아이템\n';
    prompt += '- 향후 진행할 작업들을 체크박스 형식으로 정리\n';
    prompt += '- 가능하면 담당자를 명시\n';
    prompt += '- 액션 아이템이 없으면 "없음"으로 표시\n\n';

    prompt += '## 5. 기타 메모\n';
    prompt += '- 참고할 만한 기타 내용\n';
    prompt += '- 특이사항이나 추가 의견\n\n';

    prompt += '**작성 규칙:**\n';
    prompt += '- 반드시 마크다운 형식으로 작성\n';
    prompt += '- 명확하고 간결한 문장 사용\n';
    prompt += '- 인사말이나 불필요한 잡담은 제외\n';
    prompt += '- 객관적이고 전문적인 톤 유지\n';
    prompt += '- 한국어로 작성\n';

    return prompt;
  }

  /**
   * 스트리밍 응답 처리
   */
  async handleStreamResponse(workspaceId, stream, conn) {
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let fullResponse = '';
    let chunkCount = 0;

    logger.info(`[MeetingMinutes] Starting stream response processing`, { workspaceId });

    for await (const chunk of stream) {
      // WebSocket 연결이 닫혔는지 확인
      if (conn.readyState !== 1) {  // WebSocket.OPEN === 1
        logger.warn(`[MeetingMinutes] Connection closed during streaming, aborting`, {
          workspaceId,
          chunksReceived: chunkCount,
        });
        return;
      }

      buffer += decoder.decode(chunk, { stream: true });

      // SSE 형식: "data: {...}\n\n"
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') {
          if (trimmed === 'data: [DONE]') {
            logger.info(`[MeetingMinutes] Stream finished`, {
              workspaceId,
              totalChunks: chunkCount,
              totalLength: fullResponse.length,
            });
          }
          continue;
        }

        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            const delta = json.choices?.[0]?.delta?.content;

            if (delta) {
              fullResponse += delta;
              chunkCount++;

              // 클라이언트에 청크 전송 (실시간 피드백)
              this.sendChunk(conn, delta);

              // 10개마다 진행 상황 로그
              if (chunkCount % 10 === 0) {
                logger.info(`[MeetingMinutes] Stream progress`, {
                  workspaceId,
                  chunksReceived: chunkCount,
                  currentLength: fullResponse.length,
                });
              }
            }
          } catch (e) {
            logger.warn(`[MeetingMinutes] Failed to parse SSE line`, {
              workspaceId,
              error: e.message,
            });
          }
        }
      }
    }

    logger.info(`[MeetingMinutes] Stream processing completed`, {
      workspaceId,
      totalChunks: chunkCount,
      totalLength: fullResponse.length,
    });

    // 최종 완성된 회의록 전송
    this.sendDone(conn, fullResponse);
  }

  /**
   * 청크 전송 (스트리밍)
   */
  sendChunk(conn, content) {
    if (conn.readyState === 1) {  // WebSocket.OPEN
      try {
        conn.send(JSON.stringify({
          type: 'meeting-minutes-chunk',
          content,
          timestamp: Date.now(),
        }));
      } catch (error) {
        logger.error(`[MeetingMinutes] Failed to send chunk:`, error);
      }
    }
  }

  /**
   * 완성된 회의록 전송
   */
  sendDone(conn, content) {
    if (conn.readyState === 1) {  // WebSocket.OPEN
      try {
        conn.send(JSON.stringify({
          type: 'meeting-minutes-done',
          content,
          timestamp: Date.now(),
        }));
        logger.info(`[MeetingMinutes] Meeting minutes sent successfully`, {
          contentLength: content.length,
        });
      } catch (error) {
        logger.error(`[MeetingMinutes] Failed to send done message:`, error);
      }
    }
  }

  /**
   * 에러 전송
   */
  sendError(conn, error) {
    if (conn.readyState === 1) {  // WebSocket.OPEN
      try {
        conn.send(JSON.stringify({
          type: 'meeting-minutes-error',
          error,
          timestamp: Date.now(),
        }));
        logger.info(`[MeetingMinutes] Error sent to client`, { error });
      } catch (e) {
        logger.error(`[MeetingMinutes] Failed to send error:`, e);
      }
    }
  }
}

// Export singleton instance
export const meetingMinutesManager = new MeetingMinutesManager();
