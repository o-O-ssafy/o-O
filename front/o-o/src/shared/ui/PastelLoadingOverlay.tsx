import { useEffect, useState } from "react";
import { useLoadingStore } from "../store/loadingStore";
import { COLOR_THEMES } from "@/features/mindmap/styles/colorThemes";
import popoSide from "@/shared/assets/images/popo_side.png";

const pastelColors = COLOR_THEMES.Pastel;

const loadingMessages = [
  "아이디어를 구슬에 담는 중...",
  "흩어진 아이디어 구슬을 모으는 중...",
  "아이디어 구슬을 가지런히 놓는 중...",
];

/**
 * Pastel loading overlay component
 *
 * Features:
 * - Full viewport overlay with backdrop
 * - Animated pastel spinner
 * - Blocks user interaction during loading
 * - Automatically shows/hides based on global loading state
 * - Floating popo mascot in center
 * - Rotating loading messages with fade transitions
 */
export function PastelLoadingOverlay() {
  const isLoading = useLoadingStore((state) => state.isLoading);
  const [messageIndex, setMessageIndex] = useState(0);

  // 3초마다 메시지 순환
  useEffect(() => {
    if (!isLoading) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isLoading]);

  // 로딩 끝나면 메시지 초기화
  useEffect(() => {
    if (!isLoading) {
      setMessageIndex(0);
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div
      className="fixed inset-0 bg-white bg-dotted flex items-center justify-center"
      style={{ zIndex: 100, pointerEvents: "auto" }}
    >
      <div className="relative w-64 h-64 flex flex-col items-center justify-center">
        {/* Rotating container */}
        <div className="absolute inset-0 animate-spin-slow">
          {pastelColors.map((color, index) => {
            const angle = (index * 360) / pastelColors.length;
            const radius = 230; // Distance from center
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;

            return (
              <div
                key={index}
                className="absolute rounded-full blur-sm"
                style={{
                  width: "120px",
                  height: "120px",
                  left: "50%",
                  top: "50%",
                  transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
                  background: `radial-gradient(circle, ${color} 0%, ${color}DD 50%, ${color}88 100%)`,
                  boxShadow: `0 0 20px ${color}AA`,
                }}
              />
            );
          })}
        </div>

        {/* Center glow */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-48 h-48 rounded-full blur-xl opacity-20"
            style={{
              background: `radial-gradient(circle, ${pastelColors[0]}, ${pastelColors[3]}, ${pastelColors[6]})`,
            }}
          />
        </div>

        {/* Floating popo mascot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src={popoSide}
            alt="Loading"
            className="w-80 h-80 object-contain animate-float"
          />
        </div>

        {/* Loading messages */}
        <div className="absolute bottom-[-30px] w-full">
          <div className="relative h-8 flex items-center justify-center">
            {loadingMessages.map((message, index) => (
              <div
                key={message}
                className="absolute inset-0 flex items-center justify-center transition-opacity duration-500"
                style={{
                  opacity: messageIndex === index ? 1 : 0,
                }}
              >
                <span className="text-gray-600 font-medium text-base whitespace-nowrap">
                  {message}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes spin-slow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-15px);
            }
          }

          .animate-spin-slow {
            animation: spin-slow 8s linear infinite;
          }

          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
}
