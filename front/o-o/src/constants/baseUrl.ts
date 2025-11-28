// 개발 환경에서는 프록시를 사용하므로 빈 문자열
// 프로덕션 환경에서는 실제 서버 URL 사용

export const API_BASE_URL = import.meta.env.VITE_API_URL