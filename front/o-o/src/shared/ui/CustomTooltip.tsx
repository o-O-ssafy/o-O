// components/CustomTooltip.tsx
import React, { useState } from "react";

interface CustomTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ children, content }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="focus:outline-none"
        aria-describedby="tooltip"
      >
        {children}
      </div>

      {isVisible && content && (
        <div className="absolute top-full left-[-7px] mt-2 z-[9999]">
          {/* 화살표 (버튼 중앙에 위치) */}
          <div
            className="absolute bottom-full left-7"
            style={{
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderBottom: "8px solid #E1E1E1",
              marginBottom: "-1px",
            }}
          />
          {/* 말풍선 */}
          <div className="bg-[#E1E1E1] text-[#263A6B] px-5 py-3 rounded-2xl shadow-lg max-w-xs whitespace-pre-wrap break-words text-sm">
            {content}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTooltip;
