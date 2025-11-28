// components/TrendMindmap/TrendExpandKeyword.tsx
import { useNavigate } from "react-router-dom";
import type { TrendKeywordItem } from "../../types/trend";
import CustomScrollbar from "@/shared/ui/CustomScrollbar";

interface TrendExpandKeywordProps {
  readonly keywords: TrendKeywordItem[];
}

export function TrendExpandKeyword({ keywords }: TrendExpandKeywordProps) {
  const navigate = useNavigate();

  const handleKeywordClick = (keyword: string) => {
    navigate(`/trend/${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="bg-[#F4F4F5] w-[226px] h-[60vh] rounded-3xl p-3">
      <CustomScrollbar maxHeight="55vh">
        <div className="pr-5">
          {keywords.map((item, index) => (
            <div
              key={`${item.keyword}-${index}`}
              onClick={() => handleKeywordClick(item.keyword)}
              className="
                pl-4 pr-3 py-2 mb-1
                hover:bg-primary 
                rounded-xl 
                hover:text-white
                cursor-pointer 
                duration-200
                overflow-hidden
                text-ellipsis
                transition-colors
                whitespace-nowrap
              "
            >
              • {item.keyword}
            </div>
          ))}
        </div>
      </CustomScrollbar>
    </div>
  );
}
