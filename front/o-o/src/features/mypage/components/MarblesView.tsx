import Marble from "@/shared/assets/images/marble.webp";
import { useMarbleLayout } from "../hooks/custom/useMarbleLayout";
import { useRef } from "react";
import { getFontSize } from "@/shared/utils/fontSizeUtil";

interface MarblesViewProps {
  readonly keywords: string[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly selectedDate: string | null;
}

export function MarblesView({
  keywords,
  isLoading,
  error,
  selectedDate,
}: MarblesViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const marbles = useMarbleLayout(keywords, containerRef);

  // 로딩 중
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500">키워드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 발생
  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-500 px-4">
        <div className="text-center">
          <p className="text-lg font-semibold mb-2">⚠️ 오류 발생</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  // 날짜를 선택하지 않은 경우
  if (!selectedDate) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 px-4">
        <p className="text-base text-[14px] sm:text-[19px] md:text-xl lg:text-2xl font-semibold text-center">
          아이디어를 기록한 날짜를 선택하면 키워드 구슬이 랜덤으로 표시됩니다.
        </p>
      </div>
    );
  }

  // 선택한 날짜에 키워드가 없는 경우
  if (keywords.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 px-4">
        <p className="text-base text-[14px] sm:text-[19px] md:text-xl lg:text-2xl font-semibold text-center">
          선택한 날짜에 키워드가 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {marbles.map((m, index) => {
        const fontSize = getFontSize(m.radius, m.text.length);

        return (
          <button
            type="button"
            key={m.id}
            className="absolute transition-all duration-300 hover:z-5 cursor-pointer 
                       hover:scale-110 sm:hover:scale-105 md:hover:scale-110"
            style={{
              left: m.x,
              top: m.y,
              width: `${m.radius * 2}px`,
              height: `${m.radius * 2}px`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <img
              src={Marble}
              alt="marble"
              className="w-full h-full object-contain"
              style={{
                filter: "drop-shadow(0 8px 16px rgba(0, 0, 0, 0.12))",
              }}
            />
            <span
              className="absolute inset-0 flex items-center justify-center font-semibold text-center 
                         px-1 sm:px-2 pointer-events-none leading-tight"
              style={{
                fontSize: `${fontSize}px`,
                color: "#2d3748",
              }}
            >
              {m.text}
            </span>
          </button>
        );
      })}
    </div>
  );
}
