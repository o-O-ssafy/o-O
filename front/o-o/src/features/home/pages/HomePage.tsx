import { useTrend } from "@/features/trend/hooks/useTrend";
import { SearchSection } from "../components/SearchSection";
import background from "@/shared/assets/images/home_bg.webp";
import { Header } from "@/shared/ui/Header";
import { useEffect } from "react";

export function HomePage() {
  const { keywords, keywordsError, keywordsLoading, fetchTopTrendList } =
    useTrend();

  // 페이지 진입 시 상위 키워드 조회
  useEffect(() => {
    fetchTopTrendList();
  }, [fetchTopTrendList]);

  return (
    <div
      className="w-screen h-screen bg-cover bg-center bg-no-repeat overflow-hidden"
      style={{ backgroundImage: `url(${background})` }}
    >
      <Header />
      <SearchSection
        keywords={keywords}
        keywordsError={keywordsError}
        keywordsLoading={keywordsLoading}
      />
    </div>
  );
}
