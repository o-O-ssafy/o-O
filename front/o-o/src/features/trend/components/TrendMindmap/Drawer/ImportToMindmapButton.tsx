interface ImportToMindmapButtonProps {
  readonly onClick?: () => void;
}

export function ImportToMindmapButton({ onClick }: ImportToMindmapButtonProps) {
  return (
    <button
      onClick={onClick}
      className="
        flex-shrink-0
        px-2 py-2
        w-32 h-[60px]
        bg-[#263A6B]
        text-white
        rounded-full
        font-medium
        text-sm
        hover:bg-[#1e2d52]
        active:scale-95
        transition-all
        duration-200
        shadow-md
        hover:shadow-lg
        text-center
        leading-tight
        flex
        flex-col
        items-center
        justify-center
      "
    >
      <span>내 마인드맵으로</span>
      <span>가져오기</span>
    </button>
  );
}
