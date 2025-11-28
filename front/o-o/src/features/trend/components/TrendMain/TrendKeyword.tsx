// components/TrendKeyword.tsx
import popo from "@/shared/assets/images/popo4.webp";
import {
  type TrendKeywordProps,
  type Keyword,
} from "@/features/trend/types/types";
import { useFullscreen } from "@/features/trend/hooks/custom/useFullscreen";
import { KeywordGrid } from "./KeywordGrid";
import { FloatingCharacter } from "./FloatingCharacter";

const KEYWORD_COLORS: readonly string[] = [
  "bg-green-200 hover:bg-green-300",
  "bg-orange-200 hover:bg-orange-300",
  "bg-purple-200 hover:bg-purple-300",
  "bg-yellow-200 hover:bg-yellow-300",
  "bg-cyan-200 hover:bg-cyan-300",
] as const;

export function TrendKeyword({
  keywords,
  keywordsError,
  keywordsLoading,
  characterImage = popo,
}: Readonly<TrendKeywordProps>) {
  const isFullscreen = useFullscreen();

  return (
    <div className="w-full overflow-hidden relative py-4 md:py-6 px-2 md:px-10">
      <KeywordGrid
        keywords={keywords}
        keywordsError={keywordsError}
        keywordsLoading={keywordsLoading}
        colors={KEYWORD_COLORS}
      />
      <FloatingCharacter image={characterImage} isFullscreen={isFullscreen} />
    </div>
  );
}
