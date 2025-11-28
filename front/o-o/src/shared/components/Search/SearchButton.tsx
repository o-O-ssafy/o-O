// components/Search/SearchButton.tsx
import { Search } from "lucide-react";
import { useState } from "react";
import { SearchInput } from "./SearchInput";
import { useClickOutside } from "@/shared/hooks/useClickOutside";

interface SearchButtonProps {
  readonly onSearch?: (query: string) => void;
  readonly placeholder?: string;
}

export function SearchButton({
  onSearch,
  placeholder = "검색어를 입력하세요",
}: SearchButtonProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useClickOutside<HTMLDivElement>(() => {
    if (isExpanded) closeSearch();
  });

  const closeSearch = () => {
    setIsExpanded(false);
    setSearchQuery("");
  };

  const handleSearch = () => {
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
    closeSearch();
  };

  if (isExpanded) {
    return (
      <SearchInput
        ref={containerRef}
        value={searchQuery}
        onChange={setSearchQuery}
        onSearch={handleSearch}
        onClose={closeSearch}
        placeholder={placeholder}
      />
    );
  }

  return (
    <button
      onClick={() => setIsExpanded(true)}
      className="flex items-center justify-center h-12 w-12 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow duration-200"
      aria-label="검색"
    >
      <Search className="h-5 w-5" style={{ color: "#263A6B" }} />
    </button>
  );
}
