// components/ContentDialog/ContentDialog.tsx
import React from "react";
import type { ContentDialogProps } from "../../../features/mindmap/types";
import DialogHeader from "./DialogHeader";
import DialogContent from "./DialogContent";
import DialogLoadingOverlay from "../DialogLoadingOverlay";

export const DIALOG_BG_COLOR = "#DCDFE5";

const ContentDialog: React.FC<ContentDialogProps> = ({
  characterImage,
  title,
  buttons,
  content,
  className = "",
  isOpen = true,
  isLoading = false,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 p-4 backdrop-blur-sm">
      {/* 배경 클릭 시 닫기 */}
      {onClose && (
        <button
          className="absolute inset-0"
          onClick={onClose}
          aria-label="Close dialog"
        />
      )}

      {/* 다이얼로그 컨텐츠 */}
      <div className={`relative z-10 w-full max-w-7xl h-[80vh] `}>
        <div
          className={`bg-[#DCDFE5] rounded-xl lg:rounded-2xl shadow-2xl h-full ${className}`}
        >
          <div className="p-4 sm:p-6 lg:p-10 h-full flex flex-col relative">
            <DialogHeader
              characterImage={characterImage}
              title={title}
              buttons={buttons}
            />
            <DialogContent content={content} />
            {isLoading && <DialogLoadingOverlay bgColor={DIALOG_BG_COLOR} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentDialog;
