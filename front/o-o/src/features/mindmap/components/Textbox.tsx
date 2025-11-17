import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import type { TextboxProps } from "../types";
import { useMediaUpload } from "@/features/home/hooks/custom/useMediaUpload";
import { MediaPreview } from "@/features/home/components/MediaPreviewProps";
import youtubeIcon from "@/shared/assets/images/youtube.webp";

export function Textbox({ onAddNode, disabled = false }: Readonly<TextboxProps>) {
  const [value, setValue] = useState("");
  const {
    mediaData,
    isDragging,
    handlePaste,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearMedia,
  } = useMediaUpload();

  const handleSubmit = () => {
    if (!value.trim() && !mediaData.imageFile && !mediaData.youtubeUrl) {
      return;
    }

    onAddNode({
      text: value.trim(),
      imageFile: mediaData.imageFile || null,
      youtubeUrl: mediaData.youtubeUrl || null,
    });

    setValue("");
    clearMedia();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div
        className={`flex flex-col gap-2 ${
          isDragging ? "ring-2 ring-primary rounded-lg p-2" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* 미디어 프리뷰 */}
        {mediaData.type === "image" && mediaData.imageUrl && (
          <MediaPreview
            type="image"
            icon={mediaData.imageUrl}
            label={mediaData.imageFile?.name || "image"}
            onClear={clearMedia}
          />
        )}
        {mediaData.type === "youtube" && mediaData.youtubeUrl && (
          <MediaPreview
            type="youtube"
            icon={youtubeIcon}
            label={mediaData.youtubeUrl}
            onClear={clearMedia}
          />
        )}

        <div className="flex items-stretch gap-2">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="떠오른 아이디어를 입력해주세요"
            className="flex-1 h-16 min-h-0 resize-none text-sm md:text-base"
          />
          <Button onClick={handleSubmit} className="h-16 px-5 shrink-0" disabled={disabled}>
            입력하기
          </Button>
        </div>
      </div>
    </div>
  )
}
