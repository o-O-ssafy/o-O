import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// env 설정 이유 : 배포 시 production 설정으로 변경 시 코드 수정 해야함
// & 실수로 production 설정으로 개발하면 실제 사용자 데이터 건드리는 문제 !!
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
