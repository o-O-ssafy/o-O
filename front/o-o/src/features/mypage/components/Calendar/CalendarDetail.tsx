import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState } from "react";

interface CalendarDetailProps {
  readonly activeDates?: string[];
  readonly selectedDate: string | null;
  readonly currentMonth: Date;
  readonly onDateClick: (date: string) => void;
  readonly onMonthChange: (year: number, month: number) => void;
  readonly isFullscreen: boolean;
}

export function CalendarDetail({
  activeDates = [],
  selectedDate,
  currentMonth,
  onDateClick,
  onMonthChange,
  isFullscreen,
}: CalendarDetailProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const today = new Date();

  // activeDates를 Date 객체로 변환
  const datesWithIdeas = activeDates.map((dateStr) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  });

  // 날짜를 "YYYY-MM-DD" 형식으로 변환
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 컴포넌트 마운트 시 오늘 날짜의 키워드 자동 로드
  useEffect(() => {
    if (activeDates.length === 0) return;

    const todayStr = formatDate(today);
    if (activeDates.includes(todayStr)) {
      onDateClick(todayStr);
    }
  }, []);

  // 날짜 선택 핸들러
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      return;
    }

    setDate(selectedDate);
    const dateStr = formatDate(selectedDate);

    // 🔥 키워드 유무와 관계없이 항상 조회
    onDateClick(dateStr);
  };

  // 월 변경 핸들러
  const handleMonthChange = (newMonth: Date) => {
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();
    const newMonthValue = newMonth.getMonth();
    const newYear = newMonth.getFullYear();

    // 현재 월보다 미래면 막기
    if (
      newYear > todayYear ||
      (newYear === todayYear && newMonthValue > todayMonth)
    ) {
      return;
    }

    onMonthChange(newYear, newMonthValue + 1);
  };

  // 다음 달 버튼이 비활성화되어야 하는지 확인
  const isNextDisabled =
    currentMonth.getFullYear() > today.getFullYear() ||
    (currentMonth.getFullYear() === today.getFullYear() &&
      currentMonth.getMonth() >= today.getMonth());

  return (
    <div
      className={`
        ${
          isFullscreen
            ? "scale-110 pl-8 w-[40vh]"
            : "scale-[0.7] md:scale-[0.8] xl:scale-[0.9] -mt-2 md:-mt-0 w-[30vh] sm:w-[35vh] md:w-[40vh] lg:w-[45vh] h-[40vh]"
        } 
            origin-top-left pl-3
        `}
    >
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleDateSelect}
        month={currentMonth}
        onMonthChange={handleMonthChange}
        modifiers={{
          withIdeas: datesWithIdeas,
        }}
        showOutsideDays={true}
        disabled={(date) => date > today}
        classNames={{
          button_next: isNextDisabled
            ? "!opacity-30 !cursor-not-allowed hover:!bg-transparent pointer-events-none"
            : "",
        }}
      />
    </div>
  );
}
