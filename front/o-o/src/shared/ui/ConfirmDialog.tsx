// components/ConfirmDialog.tsx
import React, { useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface ConfirmDialogButton {
  id: string; // 안정 key
  text: string;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary";
}

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  characterImage: string;
  title: string;
  description: string;
  buttons: ConfirmDialogButton[];
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  characterImage,
  title,
  description,
  buttons,
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  // S6660 대응: else { if (...) } 구조 제거 → 두 개의 if로 분리
  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;

    if (isOpen && !dlg.open) {
      dlg.showModal();
    }
    if (!isOpen && dlg.open) {
      dlg.close();
    }
  }, [isOpen]);

  // 닫힘 이벤트 통합 처리 (Esc 또는 close())
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // S6847 대응: dialog에 마우스/키보드 리스너 바인딩 금지 → onMouseDown 제거
  // (배경 클릭 닫기는 제공하지 않음. Esc/버튼으로 닫기)

  // 초기 렌더에서 null 반환해 깜빡임 방지
  if (!isOpen && !dialogRef.current?.open) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-[100] max-w-4xl w-[min(90vw,56rem)] p-0 bg-transparent"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
      onCancel={handleClose} // Esc
      onClose={handleClose}
    >
      <div className="relative bg-[#F7FAFF] rounded-none shadow-2xl w-full p-12">
        {/* X 버튼 (title에 "delete"가 포함된 경우만 표시) */}
        {title.toLowerCase().includes("delete") ||
        title.toLowerCase().includes("삭제") ||
        title.toLowerCase().includes("주의") ? (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors"
            aria-label="닫기"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        ) : null}

        <div className="flex gap-8 items-center">
          {/* Character Image */}
          <div className="flex-shrink-0">
            <img
              src={characterImage}
              alt="캐릭터 이미지"
              className="w-80 h-80 object-contain"
            />
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Title */}
            <h2
              id="confirm-dialog-title"
              className="text-3xl font-bold text-primary"
            >
              {title}
            </h2>

            {/* Description */}
            <p
              id="confirm-dialog-desc"
              className="text-lg text-gray-700 leading-relaxed whitespace-pre-line"
            >
              {description}
            </p>

            {/* Buttons */}
            <div className="flex gap-3 justify-end mt-12">
              {buttons.map((button, idx) => (
                <Button
                  key={button.id}
                  onClick={button.onClick}
                  variant={button.variant}
                  className={`px-8 py-3 text-lg font-semibold
                  ${
                    button.variant === "outline"
                      ? "bg-transparent text-primary hover:underline shadow-none border-none"
                      : "bg-primary hover:bg-primary/90 text-white"
                  }`}
                  style={{ borderRadius: "13px" }}
                  autoFocus={idx === 0}
                >
                  {button.text}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* backdrop 스타일 */}
      <style>{`
      dialog::backdrop {
        background: rgba(0,0,0,0.5);
      }
    `}</style>
    </dialog>
  );
};

export default ConfirmDialog;
