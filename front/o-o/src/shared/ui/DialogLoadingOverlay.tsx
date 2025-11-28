import React from "react";
import { COLOR_THEMES } from "@/features/mindmap/styles/colorThemes";

interface DialogLoadingOverlayProps {
  bgColor: string;
}

const DialogLoadingOverlay: React.FC<DialogLoadingOverlayProps> = ({
  bgColor,
}) => {
  const pastelColors = COLOR_THEMES.Pastel;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center backdrop-blur-sm rounded-xl z-50"
      style={{ backgroundColor: bgColor }}
    >
      <div className="relative w-64 h-64">
        {/* Center orb */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-60 h-60 rounded-full animate-pulse-slow"
            style={{
              background: `conic-gradient(from 0deg, ${pastelColors.join(", ")})`,
              filter: "blur(12px)",
              opacity: 0.7,
            }}
          />
        </div>

        {/* Loading text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-primary font-semibold text-base tracking-widest">
            LOADING
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%,
          100% {
            transform: scale(0.9) rotate(0deg);
            opacity: 0.4;
          }
          50% {
            transform: scale(1.1) rotate(180deg);
            opacity: 0.7;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default DialogLoadingOverlay;
