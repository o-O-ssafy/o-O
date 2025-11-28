import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { NodeAddInputProps } from "../../types";
import { useMediaUpload } from "@/features/home/hooks/custom/useMediaUpload";
import { MediaPreview } from "@/features/home/components/MediaPreviewProps";
import youtube from "@/shared/assets/images/youtube.webp";

export default function NodeAddInput({
  open,
  onConfirm,
  onCancel,
  buttonRef,
  centerX,
  centerY,
  buttonOffsetX = 0,
  buttonOffsetY = 0,
}: NodeAddInputProps) {
  const [keyword, setKeyword] = useState("");
  const [description, setDescription] = useState("");
  const [position, setPosition] = useState({ left: 0, top: 0 });

  // 미디어 업로드 훅 추가
  const {
    mediaData,
    isDragging,
    handlePaste,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearMedia,
  } = useMediaUpload();

  // 입력창이 닫힐 때 입력 필드 초기화
  useEffect(() => {
    if (!open) {
      setKeyword("");
      setDescription("");
      clearMedia();
    }
  }, [open, clearMedia]);

  const handleConfirm = () => {
    // 미디어가 있으면 미디어만, 없으면 키워드 전송
    if (mediaData.type) {
      onConfirm("", description.trim(), mediaData);
    } else if (keyword.trim()) {
      onConfirm(keyword.trim(), description.trim(), mediaData);
    }
  };

  // label 연결용 id
  const keywordId = "add-node-keyword";
  const descriptionId = "add-node-description";

  /** 버튼 위치 계산 */
  useEffect(() => {
    if (!open) return;

    // centerX, centerY가 제공되면 노드 위치 기준으로 계산
    if (centerX !== undefined && centerY !== undefined) {
      setPosition({
        left: centerX + buttonOffsetX + 16, // 노드 중심 + 버튼 오프셋 + 16px margin
        top: centerY + buttonOffsetY,
      });
      return;
    }

    // 기존 방식: buttonRef 기준으로 계산
    if (!buttonRef?.current) return;

    const updatePosition = () => {
      const rect = buttonRef.current!.getBoundingClientRect();
      setPosition({
        left: rect.right + 16, // 버튼 오른쪽 + 16px margin
        top: rect.top + rect.height / 2, // 버튼 중앙
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, buttonRef, centerX, centerY, buttonOffsetX, buttonOffsetY]);

  if (!open) return null;

  const content = (
    <>
      {/* 패널 */}
      <section
        className={`fixed bg-[#D8E7F3] p-6 rounded-lg shadow-xl z-[9999] w-80 flex flex-col gap-4 ${
          isDragging ? "ring-2 ring-primary" : ""
        }`}
        aria-labelledby="add-node-title"
        style={{
          left: `${position.left}px`,
          top: `${position.top}px`,
          transform: 'translateY(-50%)',
          opacity: open ? 1 : 0,
          transition: 'opacity 200ms ease',
          pointerEvents: open ? 'auto' : 'none',
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
          {/* 시각적 제목: aria-labelledby와 연결 */}
          <h2 id="add-node-title" className="sr-only">
            노드 추가 입력창
          </h2>

          {/* 키워드 입력 */}
          <div className="space-y-2">
            <label htmlFor={keywordId} className="text-sm font-paperlogy font-semibold">
              키워드
            </label>

            {/* 미디어가 있으면 미리보기만 표시 */}
            {mediaData.type ? (
              <div className="space-y-2">
                {mediaData.type === "image" && mediaData.imageUrl && (
                  <div className="relative">
                    <img
                      src={mediaData.imageUrl}
                      alt={mediaData.imageFile?.name || "Uploaded image"}
                      className="w-full h-40 object-cover rounded-md border-2 border-primary"
                    />
                    <button
                      onClick={clearMedia}
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                      type="button"
                    >
                      <span className="text-primary font-bold text-sm px-2">✕</span>
                    </button>
                    <p className="text-xs text-gray-600 mt-1 truncate">
                      {mediaData.imageFile?.name || "Image"}
                    </p>
                  </div>
                )}
                {mediaData.type === "youtube" && mediaData.youtubeUrl && (
                  <div className="relative bg-white rounded-md border-2 border-primary p-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={youtube}
                        alt="YouTube"
                        className="w-6 h-6 flex-shrink-0"
                      />
                      <p className="text-sm text-gray-700 truncate flex-1">
                        {mediaData.youtubeUrl}
                      </p>
                      <button
                        onClick={clearMedia}
                        className="bg-primary text-white rounded-full px-2 py-1 text-xs font-bold hover:bg-primary/90"
                        type="button"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Input
                id={keywordId}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="키워드 / 사진 / 영상 링크를 첨부해주세요."
                className="w-full"
                onPaste={handlePaste}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleConfirm();
                  }
                  if (e.key === "Escape") onCancel();
                }}
                autoFocus
              />
            )}
          </div>

          {/* 설명 입력 */}
          <div className="space-y-2">
            <label htmlFor={descriptionId} className="text-sm font-paperlogy font-semibold">
              설명
            </label>
            <Textarea
              id={descriptionId}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="키워드에 대한 상세 설명을 입력하세요."
              className="w-full min-h-[100px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Escape") onCancel();
              }}
            />
          </div>

          {/* 버튼들 */}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="font-paperlogy"
            >
              취소
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              className="bg-primary hover:bg-primary/90 font-paperlogy"
            >
              입력하기
            </Button>
          </div>
        </section>
    </>
  );

  return createPortal(content, document.body);
}
