import { logger } from '../utils/logger.js';
import { ydocManager } from '../yjs/ydoc-manager.js';

const GMS_API_URL = 'https://gms.ssafy.io/gmsapi/api.openai.com/v1/chat/completions';
const GMS_KEY = process.env.GMS_KEY;
const GPT_MODEL = process.env.GPT_MODEL || 'gpt-5-mini';

class GptSessionManager {
  constructor() {
    this.sessions = new Map(); // workspaceId → session
  }

  // 세션 시작
  startSession(workspaceId) {
    if (this.sessions.has(workspaceId)) {
      const session = this.sessions.get(workspaceId);
      logger.warn(`[GPT] Session already exists`, {
        workspaceId,
        transcriptCount: session.transcripts.length,
        connectionCount: session.connections.size,
      });
      return session;
    }

    // ✅ 초기 마인드맵 컨텍스트 로드 (세션 시작 시 1회만)
    const mindmapContext = this.getMindmapContext(workspaceId);

    const session = {
      workspaceId,
      transcripts: [], // { userId, userName, text, timestamp }
      connections: new Set(),
      isProcessing: false,
      updateTimer: null,
      // ✅ GPT 대화 히스토리 (최대 20개 유지)
      conversationHistory: [
        {
          role: 'developer',
          content: '당신은 마인드맵 노드를 제안하는 AI입니다. 사용자 대화에서 키워드를 추출하고, 반드시 JSON 배열 형식으로만 답변하세요. 마크다운 코드블록(```)이나 설명 텍스트는 포함하지 마세요. 순수 JSON만 출력하세요. 한국어로 답변하세요.'
        },
        {
          role: 'user',
          content: this.buildInitialMindmapPrompt(mindmapContext)
        }
      ],
      lastProcessedIndex: 0, // 마지막으로 처리한 transcript 인덱스
      initialMindmapContext: mindmapContext, // 초기 마인드맵 정보 저장 (참조용)
    };

    // 2초마다 GPT 호출
    session.updateTimer = setInterval(() => {
      this.processSession(workspaceId);
    }, 2000);

    this.sessions.set(workspaceId, session);
    logger.info(`[GPT] Session started`, {
      workspaceId,
      processingInterval: '2000ms',
      totalSessions: this.sessions.size,
      initialNodeCount: mindmapContext?.nodeCount || 0,
      conversationHistoryLength: session.conversationHistory.length,
    });
    return session;
  }

  // Transcript 추가
  addTranscript(workspaceId, userId, userName, text, timestamp) {
    const session = this.sessions.get(workspaceId);
    if (!session) {
      logger.warn(`[GPT] Cannot add transcript: session not found`, { workspaceId, userId });
      return;
    }

    session.transcripts.push({ userId, userName, text, timestamp });

    logger.info(`[GPT] STT transcript received`, {
      workspaceId,
      userId,
      userName,
      textLength: text.length,
      textPreview: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      totalTranscripts: session.transcripts.length,
      timestamp: new Date(timestamp).toISOString(),
    });

    // 모든 참가자에게 브로드캐스트 (broadcast 함수가 로그를 남김)
    this.broadcast(workspaceId, {
      type: 'peer-transcript',
      userId,
      userName,
      text,
      timestamp,
    });

    // 첫 번째 transcript가 왔을 때 즉시 GPT 호출
    if (session.transcripts.length === 1) {
      logger.info(`[GPT] First transcript received, triggering immediate processing`, {
        workspaceId,
        text: text.substring(0, 50),
      });
      this.processSession(workspaceId);
    }
  }

  // GPT 처리
  async processSession(workspaceId) {
    const session = this.sessions.get(workspaceId);
    if (!session || session.isProcessing) {
      return;
    }

    // ✅ 새로운 transcript가 있는지 확인
    const newTranscripts = session.transcripts.slice(session.lastProcessedIndex);
    if (newTranscripts.length === 0) {
      return; // 처리할 새로운 대화 없음
    }

    session.isProcessing = true;

    try {
      // 1. 새로운 대화 내용만 포맷팅
      const newConversation = newTranscripts
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(t => `${t.userName}: ${t.text}`)
        .join('\n');

      logger.info(`[GPT] New conversation formatted`, {
        workspaceId,
        newTranscriptCount: newTranscripts.length,
        totalTranscripts: session.transcripts.length,
        conversationPreview: newConversation.substring(0, 100) + (newConversation.length > 100 ? '...' : ''),
        conversationHistoryLength: session.conversationHistory.length,
      });

      // 2. ✅ 현재 노드 구조 실시간 조회
      const currentNodesSummary = this.getCurrentNodesSummary(workspaceId);

      // 3. ✅ 새로운 대화를 히스토리에 추가 (parentId 규칙 강화)
      session.conversationHistory.push({
        role: 'user',
        content: `# 새로운 대화\n\n${newConversation}\n\n# 현재 마인드맵 노드 (parentId 참조용)\n\n${currentNodesSummary}\n\n# 지침\n\n위 대화에서 **회의 내용과 관련된 핵심 키워드만** 추출하여 마인드맵 노드를 제안하세요.\n\n**추출 규칙:**\n- 인사말("안녕하세요", "반갑습니다" 등)은 제외하세요.\n- 참석자 이름, 메타 정보는 제외하세요.\n- 실제 논의된 주제, 아이디어, 작업 항목, 결정 사항만 포함하세요.\n- **이전에 제안했거나 이미 존재하는 키워드와 중복되지 않는 새로운 키워드만 제안하세요.**\n- 대화 내용이 인사나 잡담뿐이거나 새로운 키워드가 없으면 빈 배열 []을 반환하세요.\n\n**parentId 규칙 (매우 중요!):**\n- **완전히 새로운 주제/카테고리**: parentId를 null로 설정\n- **위 목록의 기존 노드와 관련된 하위 개념**: 해당 노드의 ID 숫자를 parentId로 사용\n- **절대 문자열로 감싸지 마세요**: ❌ "null", "123" 같은 문자열 금지, ✅ null, 123 같이 숫자나 null만 사용\n- **예시**: 위 목록에 "AI 기술"(ID: 42)이 있고, 대화에서 "머신러닝"이 나오면 → parentId: 42\n\n**응답 형식:**\nJSON 배열로만 답변하세요 (마크다운 코드블록 없이).\n각 노드: {"parentId": 숫자 또는 null, "keyword": "키워드", "memo": "설명"}`
      });

      // 3. ✅ 슬라이딩 윈도우: 최대 20개 메시지 유지 (토큰 제한)
      const MAX_HISTORY_LENGTH = 20;
      if (session.conversationHistory.length > MAX_HISTORY_LENGTH) {
        // 시스템 프롬프트(developer) + 초기 마인드맵(user)는 유지, 나머지는 최근 18개만
        session.conversationHistory = [
          session.conversationHistory[0], // developer prompt
          session.conversationHistory[1], // initial mindmap context
          ...session.conversationHistory.slice(-18) // 최근 18개 (user + assistant 쌍)
        ];

        logger.info(`[GPT] Conversation history trimmed to ${session.conversationHistory.length} messages`, {
          workspaceId,
        });
      }

      logger.info(`[GPT] Starting GPT API request`, {
        workspaceId,
        model: GPT_MODEL,
        conversationHistoryLength: session.conversationHistory.length,
        newTranscripts: newTranscripts.length,
      });

      // 4. ✅ GMS API 호출 (전체 대화 히스토리 전달)
      const requestBody = {
        model: GPT_MODEL,
        messages: session.conversationHistory, // 전체 히스토리
        stream: true,
        // temperature 제거: gpt-5-mini 모델은 기본값 1만 지원
      };

      logger.info(`[GPT] Sending request to GMS API`, {
        url: GMS_API_URL,
        model: GPT_MODEL,
        messageCount: requestBody.messages.length,
        stream: true,
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
        logger.error(`[GPT] GMS API error`, {
          workspaceId,
          status: response.status,
          statusText: response.statusText,
          error: errorText,
        });

        this.broadcast(workspaceId, {
          type: 'gpt-error',
          error: `GMS API 오류: ${response.status}`,
          timestamp: Date.now(),
        });
        return;
      }

      if (!response.body) {
        throw new Error('No response body from GMS API');
      }

      logger.info(`[GPT] GMS API response received`, {
        workspaceId,
        status: response.status,
        contentType: response.headers.get('content-type'),
      });

      // 5. 스트리밍 응답 처리
      const gptResponse = await this.handleStreamResponse(workspaceId, response.body);

      // 6. ✅ GPT 응답을 히스토리에 추가 (다음 요청 시 컨텍스트로 사용)
      if (gptResponse) {
        session.conversationHistory.push({
          role: 'assistant',
          content: gptResponse
        });

        logger.info(`[GPT] Response added to conversation history`, {
          workspaceId,
          responseLength: gptResponse.length,
          totalHistoryLength: session.conversationHistory.length,
        });
      }

      // 7. ✅ 처리된 transcript 인덱스 업데이트
      session.lastProcessedIndex = session.transcripts.length;

      logger.info(`[GPT] Session processing completed`, {
        workspaceId,
        processedTranscripts: newTranscripts.length,
        totalTranscripts: session.transcripts.length,
        conversationHistoryLength: session.conversationHistory.length,
      });

    } catch (error) {
      logger.error(`[GPT] Error processing session:`, error);

      this.broadcast(workspaceId, {
        type: 'gpt-error',
        error: error.message || 'GPT 연결 실패',
        timestamp: Date.now(),
      });
    } finally {
      session.isProcessing = false;
    }
  }

  // 스트리밍 응답 처리
  async handleStreamResponse(workspaceId, stream) {
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let fullResponse = '';
    let chunkCount = 0;
    let firstChunkReceived = false;

    logger.info(`[GPT] Starting stream response processing`, { workspaceId });

    for await (const chunk of stream) {
      // 세션이 중간에 종료되었는지 확인
      if (!this.sessions.has(workspaceId)) {
        logger.warn(`[GPT] Session ended during streaming, aborting`, {
          workspaceId,
          chunksReceived: chunkCount,
          partialResponseLength: fullResponse.length,
        });
        return; // 스트리밍 중단
      }

      buffer += decoder.decode(chunk, { stream: true });

      // SSE 형식: "data: {...}\n\n"
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // 마지막 불완전한 줄 보관

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') {
          if (trimmed === 'data: [DONE]') {
            logger.info(`[GPT] Stream finished (DONE signal received)`, { workspaceId, totalChunks: chunkCount });
          }
          continue;
        }

        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6)); // "data: " 제거
            const delta = json.choices?.[0]?.delta?.content;

            if (delta) {
              fullResponse += delta;
              chunkCount++;

              // 첫 청크 수신 로그
              if (!firstChunkReceived) {
                firstChunkReceived = true;
                logger.info(`[GPT] First chunk received`, {
                  workspaceId,
                  firstChunkLength: delta.length,
                  firstChunkPreview: delta.substring(0, 30) + (delta.length > 30 ? '...' : ''),
                });
              }

              // 10개마다 진행 상황 로그
              if (chunkCount % 10 === 0) {
                logger.info(`[GPT] Stream progress`, {
                  workspaceId,
                  chunksReceived: chunkCount,
                  currentResponseLength: fullResponse.length,
                });
              }

              // 클라이언트에 청크 전송 (실시간 피드백)
              this.broadcast(workspaceId, {
                type: 'gpt-chunk',
                content: delta,
                timestamp: Date.now(),
              });
            }
          } catch (e) {
            logger.warn(`[GPT] Failed to parse SSE line`, {
              workspaceId,
              error: e.message,
              line: trimmed.substring(0, 100),
            });
          }
        }
      }
    }

    logger.info(`[GPT] Stream processing completed`, {
      workspaceId,
      totalChunks: chunkCount,
      fullResponseLength: fullResponse.length,
      responsePreview: fullResponse.substring(0, 100) + (fullResponse.length > 100 ? '...' : ''),
    });

    // 최종 JSON 파싱 전에도 세션 확인
    if (!this.sessions.has(workspaceId)) {
      logger.warn(`[GPT] Session ended before JSON parsing, skipping`, {
        workspaceId,
        totalChunks: chunkCount,
        fullResponseLength: fullResponse.length,
      });
      return;
    }

    // JSON 파싱 및 검증
    try {
      logger.info(`[GPT] Starting JSON parsing`, {
        workspaceId,
        rawResponseLength: fullResponse.length,
      });

      // 1. 마크다운 코드블록 제거 (GPT가 실수로 넣을 수 있음)
      let jsonText = fullResponse.trim();
      const originalText = jsonText;
      jsonText = jsonText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '');

      if (originalText !== jsonText) {
        logger.info(`[GPT] Removed markdown code blocks from response`, {
          workspaceId,
          before: originalText.substring(0, 50),
          after: jsonText.substring(0, 50),
        });
      }

      // 2. JSON 파싱
      logger.info(`[GPT] Parsing JSON`, {
        workspaceId,
        jsonLength: jsonText.length,
        jsonPreview: jsonText.substring(0, 200) + (jsonText.length > 200 ? '...' : ''),
      });

      const nodes = JSON.parse(jsonText);

      // 3. 배열인지 확인
      if (!Array.isArray(nodes)) {
        throw new Error('Response is not an array');
      }

      logger.info(`[GPT] JSON parsed successfully`, {
        workspaceId,
        nodeCount: nodes.length,
        isArray: true,
      });

      // 4. 각 노드 검증
      const validatedNodes = nodes.map((node, index) => {
        if (!node.keyword || typeof node.keyword !== 'string') {
          throw new Error(`Node ${index}: missing or invalid keyword`);
        }

        const validated = {
          parentId: node.parentId || null,
          keyword: node.keyword.trim(),
          memo: node.memo?.trim() || '',
        };

        logger.info(`[GPT] Node validated`, {
          workspaceId,
          index,
          parentId: validated.parentId,
          keyword: validated.keyword,
          memoLength: validated.memo.length,
        });

        return validated;
      });

      logger.info(`[GPT] All nodes validated successfully`, {
        workspaceId,
        totalNodes: validatedNodes.length,
        nodes: validatedNodes.map(n => ({ keyword: n.keyword, parentId: n.parentId })),
      });

      // 5. 클라이언트에 전송
      this.broadcast(workspaceId, {
        type: 'gpt-done',
        nodes: validatedNodes,
        timestamp: Date.now(),
      });

      logger.info(`[GPT] Results broadcasted to clients`, {
        workspaceId,
        nodeCount: validatedNodes.length,
      });

      // ✅ GPT 응답 반환 (히스토리에 저장하기 위해)
      return fullResponse;

    } catch (error) {
      logger.error(`[GPT] Failed to parse JSON`, {
        workspaceId,
        error: error.message,
        errorStack: error.stack,
        rawResponseLength: fullResponse.length,
        rawResponsePreview: fullResponse.substring(0, 500) + (fullResponse.length > 500 ? '...' : ''),
      });

      // 파싱 실패 시
      this.broadcast(workspaceId, {
        type: 'gpt-error',
        error: 'GPT 응답을 파싱할 수 없습니다',
        rawText: fullResponse,
        timestamp: Date.now(),
      });

      // ✅ 파싱 실패해도 응답 반환 (히스토리에 남김)
      return fullResponse;
    }
  }

  // 현재 마인드맵 정보 가져오기
  getMindmapContext(workspaceId) {
    try {
      const ydoc = ydocManager.getDoc(workspaceId);
      if (!ydoc) {
        logger.warn(`[GPT] No Y.Doc found for workspace ${workspaceId}`);
        return null;
      }

      const nodesMap = ydoc.getMap('mindmap:nodes');
      const nodes = [];
      const keywords = [];

      nodesMap.forEach((node, id) => {
        nodes.push({
          id,
          keyword: node.keyword,
          parentId: node.parentId,
        });
        keywords.push(node.keyword);
      });

      logger.info(`[GPT] Mindmap context loaded for workspace ${workspaceId}`, {
        nodeCount: nodes.length,
        nodes: nodes.slice(0, 10).map(n => ({ id: n.id, keyword: n.keyword, parentId: n.parentId })),
        totalKeywords: keywords.length,
      });

      return {
        nodeCount: nodes.length,
        nodes: nodes.slice(0, 50), // 최대 50개만 (토큰 절약)
        existingKeywords: keywords, // 기존 키워드 목록
      };
    } catch (error) {
      logger.error(`[GPT] Error getting mindmap context:`, error);
      return null;
    }
  }

  // 현재 노드 목록 간결하게 요약 (매 요청마다 GPT에게 제공)
  getCurrentNodesSummary(workspaceId) {
    try {
      const ydoc = ydocManager.getDoc(workspaceId);
      if (!ydoc) {
        return '현재 노드 없음. 새 주제는 parentId: null로 시작하세요.';
      }

      const nodesMap = ydoc.getMap('mindmap:nodes');
      const nodes = [];

      nodesMap.forEach((node, id) => {
        nodes.push(`  - ID: ${id}, 키워드: "${node.keyword}"`);
      });

      if (nodes.length === 0) {
        return '현재 노드 없음. 새 주제는 parentId: null로 시작하세요.';
      }

      // 최대 20개만 표시 (토큰 절약)
      const displayNodes = nodes.slice(0, 20).join('\n');
      const summary = `현재 ${nodes.length}개 노드 존재:\n${displayNodes}`;

      if (nodes.length > 20) {
        return summary + `\n  ... 외 ${nodes.length - 20}개 더 있음`;
      }

      return summary;
    } catch (error) {
      logger.error(`[GPT] Error getting current nodes summary:`, error);
      return '노드 정보를 가져올 수 없습니다. parentId: null 사용을 권장합니다.';
    }
  }

  // ✅ 초기 마인드맵 컨텍스트 프롬프트 생성 (세션 시작 시 1회)
  buildInitialMindmapPrompt(mindmapContext) {
    let prompt = '# 초기 마인드맵 정보\n\n';

    if (mindmapContext && mindmapContext.nodes.length > 0) {
      prompt += `현재 ${mindmapContext.nodeCount}개의 노드가 있습니다:\n`;
      mindmapContext.nodes.forEach(node => {
        prompt += `- ID: ${node.id}, 키워드: "${node.keyword}", 부모ID: ${node.parentId || 'null'}\n`;
      });
      prompt += '\n';

      // 기존 키워드 목록 명시
      if (mindmapContext.existingKeywords && mindmapContext.existingKeywords.length > 0) {
        prompt += '**기존 키워드 목록 (중복 금지):**\n';
        prompt += mindmapContext.existingKeywords.map(k => `"${k}"`).join(', ') + '\n\n';
      }
    } else {
      prompt += '아직 노드가 없습니다. 루트 노드(parentId: null)부터 시작하세요.\n\n';
    }

    prompt += '# JSON 응답 형식\n\n';
    prompt += '각 노드는 다음 구조를 따릅니다:\n';
    prompt += '[\n';
    prompt += '  {\n';
    prompt += '    "parentId": 기존_노드_ID_숫자 또는 null,\n';
    prompt += '    "keyword": "핵심 키워드 (3-10자, 간결하게)",\n';
    prompt += '    "memo": "상세 설명 (1-2문장)"\n';
    prompt += '  }\n';
    prompt += ']\n\n';

    prompt += '# parentId 규칙\n\n';
    prompt += '- parentId는 반드시 **숫자(number)** 또는 **null**이어야 합니다.\n';
    prompt += '- 문자열로 감싸지 마세요. ❌ "null", "root", "n1" 같은 형식 금지\n';
    prompt += '- 루트 노드(최상위)는 parentId를 null로 설정\n';
    prompt += '- 기존 노드의 하위 노드는 위에 나열된 기존 노드 ID 숫자를 사용\n\n';

    prompt += '# 올바른 예시\n\n';
    if (mindmapContext && mindmapContext.nodes.length > 0) {
      const firstNode = mindmapContext.nodes[0];
      prompt += '[\n';
      prompt += `  {"parentId": null, "keyword": "AI 기술 도입", "memo": "업무 자동화를 위한 AI 기술 검토"},\n`;
      prompt += `  {"parentId": ${firstNode.id}, "keyword": "데이터 수집", "memo": "학습용 데이터셋 구축 계획"}\n`;
      prompt += ']\n\n';
    } else {
      prompt += '[\n';
      prompt += '  {"parentId": null, "keyword": "프로젝트 기획", "memo": "신규 프로젝트 전체 기획안"},\n';
      prompt += '  {"parentId": null, "keyword": "일정 관리", "memo": "마일스톤 및 주요 일정 정리"}\n';
      prompt += ']\n\n';
    }

    prompt += '# 잘못된 예시 (사용 금지)\n\n';
    prompt += '❌ {"parentId": "null", ...}  // 문자열 "null" 금지\n';
    prompt += '❌ {"parentId": "root", ...}  // "root" 문자열 금지\n';
    prompt += '❌ {"parentId": "n1", ...}    // 문자열 ID 금지\n';
    prompt += '❌ {"keyword": "안녕하세요", ...}  // 인사말 금지\n';
    prompt += '❌ {"keyword": "참석자: 홍길동", ...}  // 메타 정보 금지\n';
    if (mindmapContext && mindmapContext.existingKeywords && mindmapContext.existingKeywords.length > 0) {
      prompt += `❌ {"keyword": "${mindmapContext.existingKeywords[0]}", ...}  // 이미 존재하는 키워드 금지\n`;
    }

    return prompt;
  }

  // ⚠️ 이 함수는 더 이상 사용되지 않음 (대화 히스토리 방식으로 변경)
  // GPT 프롬프트 생성
  buildPrompt(mindmapContext, conversation) {
    let prompt = '# 현재 마인드맵 정보\n\n';

    if (mindmapContext && mindmapContext.nodes.length > 0) {
      prompt += `현재 ${mindmapContext.nodeCount}개의 노드가 있습니다:\n`;
      mindmapContext.nodes.forEach(node => {
        prompt += `- ID: ${node.id}, 키워드: "${node.keyword}", 부모ID: ${node.parentId || 'null'}\n`;
      });
      prompt += '\n';

      // 기존 키워드 목록 명시
      if (mindmapContext.existingKeywords && mindmapContext.existingKeywords.length > 0) {
        prompt += '**이미 존재하는 키워드 목록 (중복 금지):**\n';
        prompt += mindmapContext.existingKeywords.map(k => `"${k}"`).join(', ') + '\n\n';
      }
    } else {
      prompt += '아직 노드가 없습니다. 루트 노드(parentId: null)부터 시작하세요.\n\n';
    }

    prompt += '# 팀원들의 대화\n\n';
    prompt += conversation + '\n\n';

    prompt += '# 중요 지침\n\n';
    prompt += '위 대화에서 **회의 내용과 관련된 핵심 키워드만** 추출하여 마인드맵 노드를 제안하세요.\n';
    prompt += '- 인사말("안녕하세요", "반갑습니다" 등)은 제외하세요.\n';
    prompt += '- 참석자 이름, 메타 정보("이승훈", "회의 시작" 등)는 제외하세요.\n';
    prompt += '- 실제 논의된 주제, 아이디어, 작업 항목, 결정 사항만 포함하세요.\n';
    prompt += '- **이미 존재하는 키워드와 중복되지 않는 새로운 키워드만 제안하세요.**\n';
    prompt += '- 대화 내용이 인사나 잡담뿐이거나 새로운 키워드가 없으면 빈 배열 []을 반환하세요.\n\n';

    prompt += '# JSON 응답 형식\n\n';
    prompt += '**반드시 아래 JSON 배열 형식으로만 답변하세요. 코드블록(```)이나 설명 텍스트는 포함하지 마세요.**\n\n';
    prompt += '각 노드는 다음 구조를 따릅니다:\n';
    prompt += '[\n';
    prompt += '  {\n';
    prompt += '    "parentId": 기존_노드_ID_숫자 또는 null,\n';
    prompt += '    "keyword": "핵심 키워드 (3-10자, 간결하게)",\n';
    prompt += '    "memo": "상세 설명 (1-2문장)"\n';
    prompt += '  }\n';
    prompt += ']\n\n';

    prompt += '# parentId 규칙\n\n';
    prompt += '- parentId는 반드시 **숫자(number)** 또는 **null**이어야 합니다.\n';
    prompt += '- 문자열로 감싸지 마세요. ❌ "null", "root", "n1" 같은 형식 금지\n';
    prompt += '- 루트 노드(최상위)는 parentId를 null로 설정\n';
    prompt += '- 기존 노드의 하위 노드는 위에 나열된 기존 노드 ID 숫자를 사용\n\n';

    prompt += '# 올바른 예시\n\n';
    if (mindmapContext && mindmapContext.nodes.length > 0) {
      const firstNode = mindmapContext.nodes[0];
      prompt += '[\n';
      prompt += `  {"parentId": null, "keyword": "AI 기술 도입", "memo": "업무 자동화를 위한 AI 기술 검토"},\n`;
      prompt += `  {"parentId": ${firstNode.id}, "keyword": "데이터 수집", "memo": "학습용 데이터셋 구축 계획"}\n`;
      prompt += ']\n\n';
    } else {
      prompt += '[\n';
      prompt += '  {"parentId": null, "keyword": "프로젝트 기획", "memo": "신규 프로젝트 전체 기획안"},\n';
      prompt += '  {"parentId": null, "keyword": "일정 관리", "memo": "마일스톤 및 주요 일정 정리"}\n';
      prompt += ']\n\n';
    }

    prompt += '# 잘못된 예시 (사용 금지)\n\n';
    prompt += '❌ {"parentId": "null", ...}  // 문자열 "null" 금지\n';
    prompt += '❌ {"parentId": "root", ...}  // "root" 문자열 금지\n';
    prompt += '❌ {"parentId": "n1", ...}    // 문자열 ID 금지\n';
    prompt += '❌ {"keyword": "안녕하세요", ...}  // 인사말 금지\n';
    prompt += '❌ {"keyword": "참석자: 홍길동", ...}  // 메타 정보 금지\n';
    if (mindmapContext && mindmapContext.existingKeywords && mindmapContext.existingKeywords.length > 0) {
      prompt += `❌ {"keyword": "${mindmapContext.existingKeywords[0]}", ...}  // 이미 존재하는 키워드 금지\n`;
    }
    prompt += '\n';

    prompt += '새로운 회의 내용이 있으면 1-2개의 새로운 노드를, 중복이거나 새로운 내용이 없으면 빈 배열 []을 반환하세요.';

    return prompt;
  }

  // 브로드캐스트
  broadcast(workspaceId, message) {
    const session = this.sessions.get(workspaceId);
    if (!session) {
      logger.warn(`[GPT] Cannot broadcast: session not found`, { workspaceId, messageType: message.type });
      return;
    }

    const data = JSON.stringify(message);
    let sentCount = 0;
    let closedCount = 0;

    session.connections.forEach(conn => {
      if (conn.readyState === 1) { // OPEN
        conn.send(data);
        sentCount++;
      } else {
        closedCount++;
      }
    });

    logger.info(`[GPT] Message broadcasted`, {
      workspaceId,
      messageType: message.type,
      messageSize: data.length,
      totalConnections: session.connections.size,
      sentTo: sentCount,
      closedConnections: closedCount,
    });
  }

  // 연결 추가
  addConnection(workspaceId, conn) {
    const session = this.sessions.get(workspaceId);
    if (session) {
      session.connections.add(conn);
      logger.info(`[GPT] Connection added`, {
        workspaceId,
        totalConnections: session.connections.size,
      });
    } else {
      logger.warn(`[GPT] Cannot add connection: session not found`, { workspaceId });
    }
  }

  // 연결 제거
  removeConnection(workspaceId, conn) {
    const session = this.sessions.get(workspaceId);
    if (session) {
      session.connections.delete(conn);
      logger.info(`[GPT] Connection removed`, {
        workspaceId,
        remainingConnections: session.connections.size,
      });
    } else {
      logger.warn(`[GPT] Cannot remove connection: session not found`, { workspaceId });
    }
  }

  // 세션 종료
  stopSession(workspaceId) {
    const session = this.sessions.get(workspaceId);
    if (!session) {
      logger.warn(`[GPT] Cannot stop session: session not found`, { workspaceId });
      return;
    }

    logger.info(`[GPT] Stopping session`, {
      workspaceId,
      transcriptCount: session.transcripts.length,
      connectionCount: session.connections.size,
    });

    if (session.updateTimer) {
      clearInterval(session.updateTimer);
    }

    // 모든 연결에 종료 신호
    this.broadcast(workspaceId, {
      type: 'gpt-session-ended',
      timestamp: Date.now(),
    });

    this.sessions.delete(workspaceId);
    logger.info(`[GPT] Session stopped`, {
      workspaceId,
      remainingSessions: this.sessions.size,
    });
  }
}

export const gptSessionManager = new GptSessionManager();
