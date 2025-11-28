import SearchInput from "@/shared/components/Search/SearchInputHeader";

export function IdeaSearchSection() {
  const handleSearch = (query: string) => {
    console.log("Search:", query);
    // 실제 검색 로직 추가
  };

  return (
    <div className="flex justify-end sm:px-14 px-5 py-2 sm:py-0">
      <SearchInput
        placeholder="아이디어를 검색하세요"
        onSearch={handleSearch}
      />
    </div>
  );
}
