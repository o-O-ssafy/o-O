// components/KeywordGrid.tsx
import { KeywordBox } from "./KeywordBox";
import { useNavigate } from "react-router-dom";
import type { TrendKeywordItem } from "../../types/trend";

interface KeywordGridProps {
  readonly keywords?: TrendKeywordItem[];
  readonly keywordsError?: string | null;
  readonly keywordsLoading: boolean;
  readonly colors: readonly string[];
}

export function KeywordGrid({
  keywords = [],
  keywordsError,
  keywordsLoading,
  colors,
}: KeywordGridProps) {
  const navigate = useNavigate();

  const handleClick = (keyword: string) => {
    navigate(`/trend/${encodeURIComponent(keyword)}`);
  };

  // 로딩 중
  if (keywordsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">인기 키워드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (keywordsError) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="text-center">
          <p className="text-red-500 mb-2">⚠️ 오류가 발생했습니다</p>
          <p className="text-gray-600 text-sm">{keywordsError}</p>
        </div>
      </div>
    );
  }

  // 데이터 없음
  if (keywords.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <p className="text-gray-500">표시할 키워드가 없습니다.</p>
      </div>
    );
  }

  return (
    <div
      className="
        grid grid-cols-3 grid-rows-4 gap-2 md:gap-3 lg:gap-4 
        w-full max-w-8xl mx-auto px-3
        h-[calc(100vh-100px)] sm:h-[calc(100vh-100px)] lg:h-[calc(100vh-180px)]
      "
    >
      {keywords[0] && (
        <div className="row-span-1 col-span-2">
          <KeywordBox
            text={keywords[0].keyword}
            colorClass={colors[0]}
            onClick={() => handleClick(keywords[0].keyword)}
          />
        </div>
      )}

      {keywords[2] && (
        <div className="row-span-2">
          <KeywordBox
            text={keywords[2].keyword}
            colorClass={colors[2]}
            onClick={() => handleClick(keywords[2].keyword)}
          />
        </div>
      )}

      {keywords[3] && (
        <div className="row-span-3">
          <KeywordBox
            text={keywords[3].keyword}
            colorClass={colors[3]}
            onClick={() => handleClick(keywords[3].keyword)}
          />
        </div>
      )}

      {keywords[1] && (
        <div className="row-span-2">
          <KeywordBox
            text={keywords[1].keyword}
            colorClass={colors[1]}
            onClick={() => handleClick(keywords[1].keyword)}
          />
        </div>
      )}

      {keywords[4] && (
        <div className="row-span-2">
          <KeywordBox
            text={keywords[4].keyword}
            colorClass={colors[4]}
            onClick={() => handleClick(keywords[4].keyword)}
          />
        </div>
      )}

      <div />
    </div>
  );
}
