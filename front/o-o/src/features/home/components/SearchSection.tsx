import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SearchInput } from "./SearchInput";
import { SearchRecommendSection } from "./SearchRecommendSection";
import { Button } from "@/components/ui/button";
import LoginPromptModel from "@/shared/ui/LoginPromptModal";
import popo from "@/shared/assets/images/popo_chu.webp";
import { useAppSelector } from "@/store/hooks";
import type { TrendKeywordItem } from "@/features/trend/types/trend";
import { useMediaUpload } from "../hooks/custom/useMediaUpload";
import {
  useCreateInitialMindmapMutation,
  useCreateInitialMindmapFromImageMutation,
} from "@/features/mindmap/hooks/mutation/useCreateInitialMindmapMutation";
import type { InitialMindmapRequestDTO } from "@/services/dto/mindmap.dto";

interface SearchSectionProps {
  readonly keywords?: TrendKeywordItem[];
  readonly keywordsError?: string | null;
  readonly keywordsLoading: boolean;
}

export function SearchSection({
  keywords = [],
  keywordsError,
  keywordsLoading,
}: SearchSectionProps) {
  const [searchValue, setSearchValue] = useState("");
  const [selectedKeyword, setSelectedKeyword] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const navigate = useNavigate();

  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

  const {
    mediaData,
    isDragging,
    handlePaste,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    clearMedia,
  } = useMediaUpload();

  const { mutateAsync: createInitialMindmap, isPending } = useCreateInitialMindmapMutation();
  const { mutateAsync: createInitialMindmapFromImage, isPending: isImagePending } =
    useCreateInitialMindmapFromImageMutation();

  useEffect(() => {
    if (isLoginModalOpen && globalThis.google?.accounts?.id) {
      // 약간의 딜레이 후에 One Tap 프롬프트 표시
      setTimeout(() => {
        globalThis.google?.accounts.id.prompt();
      }, 300);
    }
  }, [isLoginModalOpen]);

  const handleKeywordClick = (keyword: string) => {
    setSearchValue(keyword);
    setSelectedKeyword(keyword);
  };

  const handleInputChange = (value: string) => {
    setSearchValue(value);
    if (value !== selectedKeyword) {
      setSelectedKeyword(null);
    }
  };

  const handleCreateClick = async () => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      let response;

      // 이미지 파일이 있는 경우
      if (mediaData.type === "image" && mediaData.imageFile) {
        response = await createInitialMindmapFromImage({
          file: mediaData.imageFile,
          startPrompt: searchValue || null,
        });
      } else {
        // 텍스트 또는 비디오 URL인 경우
        const request: InitialMindmapRequestDTO = {
          contentUrl: mediaData.type === "youtube" ? mediaData.youtubeUrl ?? null : null,
          contentType: mediaData.type === "youtube" ? "VIDEO" : "TEXT",
          startPrompt: searchValue || null,
        };
        response = await createInitialMindmap(request);
      }

      // 성공 시 마인드맵 페이지로 이동
      navigate(`/mindmap/${response.workspaceId}`);
    } catch (error) {
      console.error("마인드맵 생성 실패:", error);
      // TODO: 에러 처리 (토스트 메시지 등)
    }
  };

  return (
    <section
      className="w-full h-screen flex flex-col items-center justify-center relative"
      style={{ height: "calc(100vh - 130px)" }}
    >
      <div
        className="
          w-full flex flex-col justify-center items-center gap-16 
          translate-y-[-20%] relative z-10
        "
      >
        <div className="w-full flex flex-col justify-center items-center gap-8">
          <SearchInput
            value={searchValue}
            onChange={handleInputChange}
            mediaData={mediaData}
            isDragging={isDragging}
            handlePaste={handlePaste}
            handleDragOver={handleDragOver}
            handleDragLeave={handleDragLeave}
            handleDrop={handleDrop}
            clearMedia={clearMedia}
          />
          <SearchRecommendSection
            keywords={keywords}
            keywordsError={keywordsError}
            keywordsLoading={keywordsLoading}
            onKeywordClick={handleKeywordClick}
            selectedKeyword={selectedKeyword}
          />
        </div>
        <Button
          onClick={handleCreateClick}
          variant="primary"
          size="responsive"
          disabled={isPending || isImagePending}
        >
          {isPending || isImagePending ? "마인드맵을 생성 중입니다..." : "생성하기"}
        </Button>
      </div>

      {/* 포포 이미지 - 왼쪽 하단 고정 */}
      <img
        src={popo}
        alt="popo character"
        className="absolute bottom-0 left-4 sm:left-6 md:left-8 pointer-events-none"
        style={{
          width: "clamp(220px, 30vw, 400px)",
          height: "auto",
        }}
      />

      {/* 로그인 모달 */}
      <LoginPromptModel
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </section>
  );
}
