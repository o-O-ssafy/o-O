// SearchInput.tsx
import type { MediaData } from "../types";
import youtube from "@/shared/assets/images/youtube.webp";
import { MediaPreview } from "./MediaPreviewProps";

interface SearchInputProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly mediaData: MediaData;
  readonly isDragging: boolean;
  readonly handlePaste: (e: React.ClipboardEvent<HTMLInputElement>) => void;
  readonly handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  readonly handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  readonly handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  readonly clearMedia: () => void;
}

export function SearchInput({
  value,
  onChange,
  mediaData,
  isDragging,
  handlePaste,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  clearMedia,
}: SearchInputProps) {

  return (
    <section
      className={`
        w-[clamp(300px,80%,1200px)]
        bg-white/60 shadow-md transitional-all duration-300 rounded-full
        focus:ring-1 focus:ring-primary border-none
        ${isDragging ? "ring-2 ring-primary bg-white/80" : ""}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      aria-label="미디어 업로드 영역"
    >
      {/* 이미지 미리보기 */}
      {mediaData.type === "image" && mediaData.imageUrl && (
        <MediaPreview
          type="image"
          icon={mediaData.imageUrl}
          label={mediaData.imageFile?.name || "Image"}
          onClear={clearMedia}
        />
      )}

      {/* 유튜브 링크 미리보기 */}
      {mediaData.type === "youtube" && mediaData.youtubeUrl && (
        <MediaPreview
          type="youtube"
          icon={youtube}
          label={mediaData.youtubeUrl}
          onClear={clearMedia}
        />
      )}

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="마인드맵을 생성할 아이디어를 입력해주세요."
        onPaste={handlePaste}
        className="
          w-full
          h-[50px] md:h-[60px]
          px-6 text-center font-semibold 
          text-[13px] sm:text-[14px] lg:text-[18px]
          text-semi-deep-grey rounded-full
          bg-transparent 
          focus:placeholder-transparent"
        style={{
          border: "none",
          outline: "none",
        }}
      />
    </section>
  );
}
