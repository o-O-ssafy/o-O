import type { TrendKeywordItem } from "@/features/trend/types/trend";

interface SearchRecommendSectionProps {
  readonly keywords?: TrendKeywordItem[];
  readonly keywordsError?: string | null;
  readonly keywordsLoading: boolean;
  readonly onKeywordClick: (keyword: string) => void;
  readonly selectedKeyword: string | null;
}

export function SearchRecommendSection({
  keywords = [],
  keywordsError,
  keywordsLoading,
  onKeywordClick,
  selectedKeyword,
}: SearchRecommendSectionProps) {
  // 로딩 중
  if (keywordsLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="w-6 h-6 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // 에러 발생
  if (keywordsError) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-red-500">추천 키워드를 불러올 수 없습니다</p>
      </div>
    );
  }

  // 데이터 없음
  if (keywords.length === 0) {
    return null;
  }

  const handleClick = (keyword: string) => {
    if (selectedKeyword === keyword) {
      onKeywordClick("");
    } else {
      onKeywordClick(keyword);
    }
  };

  return (
    <section>
      <div
        className="
          flex text-[10px] sm:text-[16px] md:text-[18px] lg:text-[20px]
          gap-0 sm:gap-8 md:gap-16 lg:gap-28
        "
      >
        {keywords.slice(0, 5).map((item) => (
          <button
            className={`
              px-4 py-1
              rounded-full 
              font-medium
              transition-all 
              cursor-pointer
              hover:scale-105
              active:scale-95
              ${
                selectedKeyword === item.keyword
                  ? "bg-primary text-white"
                  : "text-semi-deep-gray hover:bg-gray"
              }
            `}
            key={item.rank}
            onClick={() => handleClick(item.keyword)}
          >
            {item.keyword}
          </button>
        ))}
      </div>
    </section>
  );
}
