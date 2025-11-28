import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// StrictMode는 개발 환경에서 컴포넌트를 2번 렌더링하여 부작용을 감지합니다.
// 하지만 Yjs WebSocket 초기화가 중복 실행되어 성능 문제를 유발하므로 비활성화합니다.
ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
