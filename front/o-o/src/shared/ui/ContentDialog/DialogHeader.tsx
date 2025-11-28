// components/ContentDialog/DialogHeader.tsx
import React from "react";
import type { DialogButton } from "../../../features/mindmap/types";
import { Button } from "@/components/ui/button";

interface DialogHeaderProps {
  characterImage?: string;
  title: string;
  buttons: DialogButton[];
}

const DialogHeader: React.FC<DialogHeaderProps> = ({
  characterImage,
  title,
  buttons,
}) => {
  return (
    <div className="flex items-center justify-between gap-3 sm:gap-4 mb-6 lg:mb-8">
      {/* Left: Character + Title */}
      <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 min-w-0 flex-1">
        {characterImage && (
          <img
            src={characterImage}
            alt="character"
            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 object-contain flex-shrink-0"
          />
        )}
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-[32px] font-bold text-primary break-words leading-tight truncate">
          {title}
        </h2>
      </div>

      {/* Right: Buttons */}
      <div className="flex gap-2 flex-shrink-0">
        {buttons.map((button, index) => (
          <Button
            key={button.id}
            onClick={button.onClick}
            variant={button.variant || "outline"}
            className={`
              px-2 sm:px-2 md:px-4 lg:px-6
              py-1.5 sm:py-2 md:py-2.5 lg:py-3
              lg:-my-14 lg:-mx-2
              text-xs sm:text-sm md:text-base
              whitespace-nowrap
              ${
                index === buttons.length - 1
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground border-primary shadow-md"
                  : "bg-transparent text-primary hover:bg-gray-100 border-0 shadow-none"
              }
            `}
          >
            {button.text}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default DialogHeader;
