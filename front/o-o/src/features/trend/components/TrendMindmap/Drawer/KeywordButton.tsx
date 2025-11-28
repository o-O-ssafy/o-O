interface KeywordButtonProps {
  readonly keyword: string;
  readonly index: number;
}

const KEYWORD_COLORS = [
  { bg: "bg-purple-200/60", blur: "bg-purple-300/40" },
  { bg: "bg-orange-200/60", blur: "bg-orange-300/40" },
  { bg: "bg-blue-200/60", blur: "bg-blue-300/40" },
  { bg: "bg-pink-200/60", blur: "bg-pink-300/40" },
  { bg: "bg-green-200/60", blur: "bg-green-300/40" },
  { bg: "bg-yellow-200/60", blur: "bg-yellow-300/40" },
] as const;

export function KeywordButton({ keyword, index }: KeywordButtonProps) {
  const color = KEYWORD_COLORS[index % KEYWORD_COLORS.length];

  return (
    <button className="relative flex-shrink-0 hover:scale-110 active:scale-95 transition-transform duration-200">
      {/* 블러 효과 배경 */}
      <div
        className={`
          absolute inset-2
          ${color.blur}
          rounded-full 
          blur-sm
          scale-100
        `}
      />

      {/* 메인 원형 배경 */}
      <div
        className={`
          relative
          w-20 h-20
          backdrop-blur-sm
          rounded-full
          flex items-center justify-center
        `}
      >
        {/* 텍스트 */}
        <span
          className="
            text-gray-800
            font-semibold
            text-sm
            px-2
            text-center
            leading-tight
          "
        >
          {keyword}
        </span>
      </div>
    </button>
  );
}
