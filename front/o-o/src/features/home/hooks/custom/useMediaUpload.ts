// hooks/custom/useMediaUpload.ts
import { useState } from "react";
import type { MediaData } from "../../types";

export function useMediaUpload() {
  const [mediaData, setMediaData] = useState<MediaData>({ type: null });
  const [isDragging, setIsDragging] = useState(false);

  // 유튜브 URL 유효성 검사
  const isYoutubeUrl = (text: string): boolean => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    return youtubeRegex.test(text.trim());
  };

  const setImage = (file: File) => {
    const url = URL.createObjectURL(file);
    setMediaData({
      type: "image",
      imageUrl: url,
      imageFile: file,
    });
  };

  const setYoutubeUrl = (url: string) => {
    setMediaData({
      type: "youtube",
      youtubeUrl: url.trim(),
    });
  };

  const clearMedia = () => {
    setMediaData({ type: null });
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData?.getData("text");

    // 유튜브 링크 확인
    if (text && isYoutubeUrl(text)) {
      e.preventDefault();
      setYoutubeUrl(text);
      return;
    }

    // 이미지 확인
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.includes("image")) {
        const blob = item.getAsFile();
        if (blob) {
          setImage(blob);
          break;
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const text = e.dataTransfer?.getData("text");
    if (text && isYoutubeUrl(text)) {
      setYoutubeUrl(text);
      return;
    }

    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.type.startsWith("image/")) {
      setImage(file);
    }
  };

  return {
    mediaData,
    isDragging,
    handlePaste,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearMedia,
  };
}
