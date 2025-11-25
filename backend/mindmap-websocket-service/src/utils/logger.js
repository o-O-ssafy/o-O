/**
 * Simple logger utility for mindmap-websocket-service
 * 로그를 레벨별로 관리하고 타임스탬프를 추가하는 유틸리티
 */

// 로그 레벨 정의 (숫자가 작을수록 더 상세한 로그)
const LOG_LEVELS = {
  debug: 0,  // 디버깅용 상세 로그
  info: 1,   // 일반 정보 로그
  warn: 2,   // 경고 로그
  error: 3,  // 에러 로그
};

// 환경변수에서 현재 로그 레벨 가져오기 (기본값: info)
// LOG_LEVEL=debug로 설정하면 모든 로그 표시, error로 설정하면 에러만 표시
const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL || 'debug'];

// 로그 메시지를 포맷팅하는 함수
// 형식: [2025-01-15T10:30:45.123Z] [INFO] 메시지 내용 {"추가": "데이터"}
const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();  // ISO 포맷 타임스탬프 (예: 2025-01-15T10:30:45.123Z)
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';  // 추가 데이터가 있으면 JSON으로 변환
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
};

// 로거 객체 export (singleton 패턴)
export const logger = {
  // DEBUG 레벨: 개발 중 상세 디버깅용
  debug: (message, meta) => {
    if (currentLevel <= LOG_LEVELS.debug) {  // 현재 레벨이 debug 이하일 때만 출력
      console.log(formatMessage('debug', message, meta));
    }
  },

  // INFO 레벨: 일반적인 정보성 로그 (서버 시작, 연결 등)
  info: (message, meta) => {
    if (currentLevel <= LOG_LEVELS.info) {  // 현재 레벨이 info 이하일 때만 출력
      console.log(formatMessage('info', message, meta));
    }
  },

  // WARN 레벨: 경고 메시지 (문제는 아니지만 주의 필요)
  warn: (message, meta) => {
    if (currentLevel <= LOG_LEVELS.warn) {  // 현재 레벨이 warn 이하일 때만 출력
      console.warn(formatMessage('warn', message, meta));
    }
  },

  // ERROR 레벨: 에러 발생 시 (항상 표시되어야 함)
  error: (message, meta) => {
    if (currentLevel <= LOG_LEVELS.error) {  // 현재 레벨이 error 이하일 때만 출력
      console.error(formatMessage('error', message, meta));
    }
  },
};
