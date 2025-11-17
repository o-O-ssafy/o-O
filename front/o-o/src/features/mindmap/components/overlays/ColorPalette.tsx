import {
  ColorPicker,
  ColorPickerSelection,
  ColorPickerHue,
  ColorPickerEyeDropper,
  // ColorPickerFormat,
  ColorPickerAlpha,
} from "@/components/ui/shadcn-io/color-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Color from "color";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ColorPaletteProps } from "../../types";
import { COLOR_THEMES, type ColorThemeName } from "../../styles/colorThemes";
import { useColorTheme } from "../../hooks/useColorTheme";
import { createRadialGradient } from "@/shared/utils/gradientUtils";

export default function ColorPalette({
  open,
  onColorChange,
  onApplyTheme,
  onClose,
  value = "#263A6B",
  className,
  buttonRef,
}: ColorPaletteProps) {
  const paletteRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const { getCurrentTheme, setCurrentTheme } = useColorTheme();
  const [selectedTheme, setSelectedTheme] = useState<ColorThemeName>(() =>
    getCurrentTheme()
  );

  /** 내부 상태: 현재 색상(hex) + 투명도(0~1) */
  const [currentColor, setCurrentColor] = useState(() => Color(value).alpha(1));

  /** 🎨 색상/투명도 변경 */
  const handleChange = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (input: any) => {
      const c = Color(input);
      setCurrentColor(c);
      onColorChange?.(c.hex());
    },
    [onColorChange]
  );

  /** 🎨 테마 변경 */
  const handleThemeChange = (theme: ColorThemeName) => {
    setSelectedTheme(theme);
    setCurrentTheme(theme);
    onApplyTheme?.([...COLOR_THEMES[theme]]);
  };

  /** ✋ 외부 클릭 감지 */
  useEffect(() => {
    if (!open || !onClose) return;
    const handleClickOutside = (e: PointerEvent) => {
      const target = e.target as HTMLElement;

      // Radix UI portal 요소인지 확인 (Select dropdown 등)
      
      const isRadixPortal =
        target.closest("[data-radix-popper-content-wrapper]") ||
        target.closest('[role="listbox"]') ||
        target.closest("[data-radix-select-content]");

      if (
        paletteRef.current &&
        !paletteRef.current.contains(target) &&
        !isRadixPortal
      ) {
        onClose();
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("pointerdown", handleClickOutside);
    }, 100);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("pointerdown", handleClickOutside);
    };
  }, [open, onClose]);

  /** 🎨 투명도 슬라이더 값 */
  const alphaPercent = Math.round(currentColor.alpha() * 100);

  /** 투명도 입력 변경 */
  const handleAlphaChange = (value: number) => {
    const newColor = currentColor.alpha(value / 100);
    setCurrentColor(newColor);
    onColorChange?.(newColor.rgb().string());
  };

  /** 입력 필드용 로컬 상태 */
  const [hexInput, setHexInput] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  /** 색상 입력창 (HEX 입력) 변경 */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHexInput(val);

    // 유효한 HEX 형식인 경우에만 색상 업데이트
    if (/^#[0-9A-Fa-f]{6}$/.test(val) || /^#[0-9A-Fa-f]{3}$/.test(val)) {
      const c = Color(val);
      setCurrentColor(c);
      onColorChange?.(c.hex());
    }
  };

  /** currentColor 변경 시 hexInput 동기화 (입력 필드가 포커스되어 있지 않을 때만) */
  useEffect(() => {
    if (document.activeElement !== inputRef.current) {
      setHexInput(currentColor.hex().toUpperCase());
    }
  }, [currentColor]);

  /** 버튼 위치 계산 */
  useEffect(() => {
    if (!open || !buttonRef?.current) return;

    const updatePosition = () => {
      const rect = buttonRef.current!.getBoundingClientRect();
      setPosition({
        left: rect.right + 8, // 버튼 오른쪽 + 8px margin
        top: rect.top - 320, // 버튼 위쪽으로 팔레트 배치
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, buttonRef]);

  if (!open) return null;

  const content = (
    <div
      ref={paletteRef}
      className={cn(
        "fixed z-[9999] transition-all duration-300",
        className
      )}
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
      }}
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-[340px] font-paperlogy">
        <div className="flex flex-col gap-4">
          {/* 🎨 ColorPicker */}
          <div className="relative z-[1001]">
            <ColorPicker
              value={currentColor.rgb().string()}
              onChange={handleChange}
            >
              {/* 제목 */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-700">
                  색상 테마
                </span>
              </div>

              {/* 색상 선택 영역 */}
              <div className="h-48 w-full">
                <ColorPickerSelection />
              </div>

              {/* Hue + Alpha 슬라이더 */}
              <div className="flex flex-col gap-2 mt-2">
                <ColorPickerHue />
                <ColorPickerAlpha />
              </div>

              {/* 색상 값 + 투명도 입력 */}
              <div className="flex items-center gap-1.5 mt-2">
                <ColorPickerEyeDropper />
                <input
                  ref={inputRef}
                  type="text"
                  value={hexInput}
                  onChange={handleInputChange}
                  className="flex-1 border rounded px-2 py-1 text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    value={alphaPercent}
                    min={0}
                    max={100}
                    onChange={(e) => handleAlphaChange(Number(e.target.value))}
                    className="w-[64px] border rounded px-2 py-1 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <span className="text-gray-600 text-xs font-medium">%</span>
                </div>
              </div>
            </ColorPicker>
          </div>

          {/* 🎨 테마 선택 */}
          <div>
            <span className="text-xs text-gray-600 block mb-2">테마 선택</span>
            <Select
              value={selectedTheme}
              onValueChange={(v) => handleThemeChange(v as ColorThemeName)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="z-[10000]" side="bottom" align="start">
                {Object.keys(COLOR_THEMES).map((theme) => (
                  <SelectItem key={theme} value={theme}>
                    {theme}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 🎨 컬러 팔레트 */}
          <div>
            <span className="text-xs text-gray-600 block mb-2">
              컬러 팔레트
            </span>
            <div className="flex gap-2 flex-wrap">
              {COLOR_THEMES[selectedTheme].map((color) => (
                <button
                  key={color}
                  className="w-8 h-8 rounded-full border-2 border-gray-200 hover:border-gray-400 transition-colors"
                  style={{ background: createRadialGradient(color) }}
                  onClick={() => handleChange(color)}
                  type="button"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
