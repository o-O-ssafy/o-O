// components/CustomTooltip.tsx
import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface CustomTooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  // 외부에서 직접 화면 좌표를 전달받는 옵션
  screenX?: number;
  screenY?: number;
  nodeRadius?: number;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({
  children,
  content,
  screenX,
  screenY,
  nodeRadius = 96,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) {
      // 외부에서 화면 좌표가 전달된 경우 해당 좌표 사용
      if (screenX !== undefined && screenY !== undefined) {
        setPosition({
          x: screenX,
          y: screenY + nodeRadius + 8, // 노드 하단 + 여백
        });
      } else if (triggerRef.current) {
        // 기존 방식: getBoundingClientRect 사용
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition({
          x: rect.left + rect.width / 2,
          y: rect.bottom + 8,
        });
      }
    }
  }, [isVisible, screenX, screenY, nodeRadius]);

  return (
    <div className="inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="focus:outline-none"
        aria-describedby="tooltip"
      >
        {children}
      </div>

      {isVisible && content && createPortal(
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            transform: "translateX(-50%)",
          }}
        >
          {/* 화살표 */}
          <div
            className="absolute bottom-full left-1/2 -translate-x-1/2"
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
          <div className="bg-[#E1E1E1] text-[#263A6B] px-5 py-3 rounded-2xl shadow-lg w-max max-w-sm whitespace-pre-wrap text-sm leading-normal font-paperlogy">
            {content}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CustomTooltip;
