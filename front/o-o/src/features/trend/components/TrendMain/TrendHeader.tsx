import { useNavigate } from "react-router-dom";
import SearchInput, {
  type SearchInputHandle,
} from "@/shared/components/Search/SearchInputHeader";
import { useTrend } from "../../hooks/useTrend";
import { useEffect, useState, useRef } from "react";
import { useAppDispatch } from "@/store/hooks";
import { clearChildKeywords } from "@/store/slices/trendSlice";

interface TrendHeaderProps {
  readonly onSearch?: () => void;
}

export function TrendHeader({ onSearch }: TrendHeaderProps) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const searchInputRef = useRef<SearchInputHandle>(null);
  const { searchTrendList, keywords, keywordsError, keywordsLoading } = useTrend();
  const [lastSearchQuery, setLastSearchQuery] = useState("");
  const [showNoResultModal, setShowNoResultModal] = useState(false);

  const handleSearch = (query: string) => {
    console.log("🔍 검색 시작:", query);
    setLastSearchQuery(query);
    searchTrendList(query);
    onSearch?.();
  };

  // 검색 결과에 따라 처리
  useEffect(() => {
    if (!lastSearchQuery.trim()) {
      return;
    }

    // 로딩 중일 때는 처리하지 않음 (API 응답 대기)
    if (keywordsLoading) {
      console.log("⏳ 검색 중...");
      return;
    }

    console.log("📊 검색 결과 개수:", keywords.length);
    console.log("🔎 첫 번째 결과:", keywords[0]?.keyword);
    console.log("❌ 에러:", keywordsError);

    // 1. 정확히 일치하는 결과가 있으면 → 마인드맵 페이지로 이동 (최우선)
    const exactMatch = keywords.find(
      (kw) => kw.keyword === lastSearchQuery
    );
    if (exactMatch) {
      console.log("✅ 정확한 일치 → 마인드맵 페이지로 이동:", exactMatch.keyword);
      clearSearchInput();
      navigate(`/trend/${encodeURIComponent(exactMatch.keyword)}`);
      setLastSearchQuery("");
      return;
    }

    // 2. 에러가 있는 경우 → 팝업 띄우기 (keywords 유지)
    if (keywordsError) {
      console.log("❌ 검색 에러:", keywordsError);
      clearSearchInput();
      setShowNoResultModal(true);
      return;
    }

    if (keywords.length === 0) {
      return;
    }

    // 3. 정확히 일치하지 않으면서 5개 이하 결과 → 팝업 표시 (keywords 유지)
    if (keywords.length <= 5 && keywords[0].keyword !== lastSearchQuery) {
      console.log("❌ 정확한 일치 없음 → 팝업 표시 (keywords 유지)");
      clearSearchInput();
      setShowNoResultModal(true);
      return;
    }

    // 4. 5개 이상 결과 (정확한 일치 아님) → 상위 5개 표시
    if (keywords.length > 5) {
      console.log("📋 5개 이상 검색 결과 → 상위 5개 표시");
      clearSearchInput();
    }
  }, [keywords, keywordsError, keywordsLoading, lastSearchQuery, navigate]);

  const clearSearchInput = () => {
    searchInputRef.current?.clear();
  };

  const handleCloseModal = () => {
    console.log("🔄 모달 닫기 - 검색 상태 초기화");
    setShowNoResultModal(false);
    setLastSearchQuery("");
    // Redux에서 에러 상태 초기화
    dispatch(clearChildKeywords());
  };

  return (
    <>
      <div className="flex justify-between items-center">
        <p className="md:text-xl sm:text-md font-bold">
          실시간 인기있는 아이디어
        </p>
        <SearchInput
          ref={searchInputRef}
          placeholder="찾고 싶은 키워드를 입력하세요."
          onSearch={handleSearch}
        />
      </div>

      {/* 검색 결과 없음 모달 */}
      {showNoResultModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">검색 결과 없음</p>
              <p className="text-gray-600 mb-6">
                "{lastSearchQuery}"에 정확히 일치하는 키워드가 없습니다.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                다른 키워드로 검색해주세요.
              </p>

              <button
                onClick={handleCloseModal}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
