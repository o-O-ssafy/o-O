import { useState } from "react";
import { CalendarDetail } from "./CalendarDetail";
import { DashboardTabNav } from "../DashboardTabNav";
import popo from "@/shared/assets/images/popo_chu.webp";
import { MarblesView } from "../MarblesView";

interface CalendarViewProps {
  readonly isFullscreen?: boolean;
  readonly activeDates?: string[];
  readonly activeDaysLoading: boolean;
  readonly activeDaysError: string | null;
  readonly keywords?: string[];
  readonly keywordsLoading: boolean;
  readonly keywordsError: string | null;
  readonly onDateSelect: (params: { date: string }) => void;
  readonly onMonthChange: (params: { month: string }) => void;
}

export function CalendarView({
  isFullscreen = false,
  activeDates = [],
  activeDaysLoading,
  activeDaysError,
  keywords = [],
  keywordsLoading,
  keywordsError,
  onDateSelect,
  onMonthChange,
}: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date()); // 🔥 현재 월 상태 추가

  // 🔥 디버깅 로그
  console.log("CalendarView - activeDates:", activeDates);
  console.log("CalendarView - activeDaysLoading:", activeDaysLoading);
  console.log("CalendarView - activeDaysError:", activeDaysError);

  console.log("전체화면 감지: ", isFullscreen);
  const containerStyle = isFullscreen
    ? "w-[95vw] h-[82vh] pt-1 bg-white/60 rounded-3xl"
    : "w-[93vw] h-[88vh] sm:h-[83vh] lg:h-[78vh] bg-white/60 rounded-3xl";

  const handleDateClick = (date: string) => {
    setSelectedDate(date);
    onDateSelect({ date });
  };

  const handleMonthChange = (year: number, month: number) => {
    // 🔥 현재 월 상태 업데이트
    setCurrentMonth(new Date(year, month - 1));

    // month를 YYYY-MM 형식으로 변환
    const formattedMonth = `${year}-${String(month).padStart(2, "0")}`;
    onMonthChange({ month: formattedMonth });
  };

  // 로딩 중일 때 UI 처리
  if (activeDaysLoading && activeDates.length === 0) {
    return (
      <div className={`${containerStyle} flex items-center justify-center`}>
        <div className="text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">캘린더 데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  // 에러 처리
  if (activeDaysError) {
    return (
      <div className={`${containerStyle} flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-red-500 mb-2">⚠️ 오류가 발생했습니다</p>
          <p className="text-gray-600 text-sm">{activeDaysError}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${containerStyle} bg-white/60 rounded-3xl relative flex flex-col`}
    >
      <div className="absolute z-10 right-3 top-3 sm:right-5 sm:top-5">
        <DashboardTabNav />
      </div>
      <div className="flex flex-col sm:flex-row justify-between h-full py-2 lg:py-0">
        {/* 왼쪽: 캘린더 영역 */}
        <div className="w-auto relative flex justify-start flex-shrink-0">
          <CalendarDetail
            activeDates={activeDates}
            selectedDate={selectedDate}
            currentMonth={currentMonth} // 🔥 현재 월 전달
            onDateClick={handleDateClick}
            onMonthChange={handleMonthChange}
            isFullscreen={isFullscreen}
          />

          {isFullscreen ? (
            <img
              src={popo}
              alt="popo character"
              className="absolute bottom-0 left-0 h-[360px] hidden sm:block"
            />
          ) : (
            <img
              src={popo}
              alt="popo character"
              className="absolute bottom-0 left-3 hidden sm:block"
              style={{
                width: "clamp(25px, 100vw, 250px)",
                height: "auto",
              }}
            />
          )}
        </div>

        {/* 오른쪽: Marbles 영역 */}
        <div className="flex-1 overflow-hidden">
          <MarblesView
            keywords={keywords}
            isLoading={keywordsLoading}
            error={keywordsError}
            selectedDate={selectedDate}
          />
        </div>
      </div>
    </div>
  );
}
