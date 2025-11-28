import { type KeywordBoxProps } from "../../types/types";

export function KeywordBox({
  text,
  colorClass,
  isLarge = true,
  onClick,
}: Readonly<KeywordBoxProps>) {
  if (!text) return null;

  return (
    <button className="w-full h-full relative" onClick={onClick}>
      <div
        className={`
          absolute inset-0 ${colorClass}
          rounded-xl md:rounded-2xl lg:rounded-3xl
          shadow-lg hover:shadow-xl blur-md
          transition-all duration-300 hover:scale-105
          cursor-pointer
        `}
      />
      <span
        className={`
          absolute inset-0 flex items-center justify-center
          font-semibold md:font-bold text-gray-800 text-center
          px-2 sm:px-3 md:px-4
          ${isLarge ? "text-base sm:text-lg md:text-2xl" : "text-xs sm:text-sm md:text-base"}
        `}
        style={{ pointerEvents: "none" }}
      >
        {text}
      </span>
    </button>
  );
}
