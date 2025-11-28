// components/Search/SearchInput.tsx
import { Search } from "lucide-react";
import { forwardRef } from "react";

interface SearchInputProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly onSearch: () => void;
  readonly onClose: () => void;
  readonly placeholder?: string;
}

export const SearchInput = forwardRef<HTMLDivElement, SearchInputProps>(
  ({ value, onChange, onSearch, onClose, placeholder }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        onSearch();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    return (
      <div
        ref={ref}
        className="relative min-w-[500px] animate-in fade-in slide-in-from-right duration-200"
      >
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus
          className="w-full h-12 pl-5 pr-12 bg-white rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 text-sm placeholder:text-gray-400"
        />
        <button
          onClick={onSearch}
          className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 transition-colors duration-200"
          aria-label="검색"
        >
          <Search className="h-4 w-4" style={{ color: "#263A6B" }} />
        </button>
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";
