import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { createPortal } from "react-dom";

type ToastVariant = "info" | "success" | "error";

interface ToastItem {
  readonly id: number;
  readonly message: string;
  readonly variant: ToastVariant;
}

interface ToastContextValue {
  readonly showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counterRef = useRef(0);
  const timersRef = useRef<Record<number, number>>({});

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));

    const timerId = timersRef.current[id];
    if (timerId && typeof window !== "undefined") {
      window.clearTimeout(timerId);
      delete timersRef.current[id];
    }
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = counterRef.current + 1;
      counterRef.current = id;

      setToasts((prev) => [...prev, { id, message, variant }]);

      if (typeof window !== "undefined") {
        const timerId = window.setTimeout(() => removeToast(id), 3000);
        timersRef.current[id] = timerId;
      }
    },
    [removeToast]
  );

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined") {
        Object.values(timersRef.current).forEach((timerId) =>
          window.clearTimeout(timerId)
        );
      }
    };
  }, []);

  const value = useMemo<ToastContextValue>(
    () => ({
      showToast,
    }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== "undefined" &&
        createPortal(
          <div className="fixed top-6 right-6 z-50 flex flex-col gap-2">
            {toasts.map((toast) => (
              <div
                key={toast.id}
                role="status"
                aria-live="polite"
                className={`rounded-lg px-4 py-3 text-sm font-medium text-white shadow-lg transition-opacity ${
                  toast.variant === "error"
                    ? "bg-red-500"
                    : toast.variant === "success"
                    ? "bg-green-500"
                    : "bg-semi-black"
                }`}
              >
                {toast.message}
              </div>
            ))}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
};
