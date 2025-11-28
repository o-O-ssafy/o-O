import AppRouter from "@/app/AppRouter";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { queryClient } from "./lib/query";
import { injectStore } from "./lib/axios";
import { QueryClientProvider } from "@tanstack/react-query";
import { ToastProvider } from "@/shared/ui/ToastProvider";
import { PastelLoadingOverlay } from "@/shared/ui/PastelLoadingOverlay";

// axios 인터셉터에서 store 사용할 수 있도록 주입
injectStore(store);

// 최상위 컴포넌트
function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <div className="font-paperlogy">
            <AppRouter />
            <PastelLoadingOverlay />
          </div>
        </ToastProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
