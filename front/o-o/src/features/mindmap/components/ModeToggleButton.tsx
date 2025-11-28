import type { MindmapMode } from "../types";

export default function ModeToggleButton({
  mode,
  onModeChange,
}: Readonly<{
  mode: MindmapMode;
  onModeChange: (mode: MindmapMode) => void;
}>) {
  return (
    <div className="relative inline-flex bg-gray-200 rounded-lg p-1 font-paperlogy">
      <div
        className={`absolute top-1 bottom-1 bg-primary rounded-md shadow-sm transition-all duration-300 ease-in-out ${
          mode === "edit" ? "left-1 right-1/2" : "left-1/2 right-1"
        }`}
      />

      <button
        onClick={() => onModeChange("edit")}
        className={`relative z-10 px-4 py-1.5 md:px-8 md:py-2 rounded-md transition-colors duration-300 text-sm md:text-base ${
          mode === "edit" ? "text-[#F3F7FF] font-regular" : "text-primary"
        }`}
      >
        편집 모드
      </button>

      <button
        onClick={() => onModeChange("analyze")}
        className={`relative z-10 px-4 py-1.5 md:px-8 md:py-2 rounded-md transition-colors duration-300 text-sm md:text-base ${
          mode === "analyze" ? "text-[#F3F7FF] font-regular" : "text-primary"
        }`}
      >
        분석 모드
      </button>
    </div>
  );
}
