import { forwardRef } from "react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";

interface DrawerToggleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isOpen: boolean;
  buttonBottom: string;
}

export const DrawerToggleButton = forwardRef<
  HTMLButtonElement,
  DrawerToggleButtonProps
>(({ isOpen, buttonBottom, ...props }, ref) => {
  return (
    <button
      ref={ref}
      {...props}
      className={`
        bg-[#F6F6F6] 
        border border-[#E5E5E5] 
        rounded-full 
        shadow-md
        hover:shadow-lg
        hover:bg-gray-200
        active:scale-95
        transition-all
        duration-300
        cursor-pointer
        w-9 h-9 
        sm:w-10 sm:h-10 
        md:w-12 md:h-12
        flex items-center justify-center
        fixed
        z-50
        ${buttonBottom}
      `}
      aria-label={isOpen ? "드로어 닫기" : "드로어 열기"}
    >
      {isOpen ? (
        <ArrowDropDownIcon
          sx={{
            fontSize: { xs: 28, sm: 32, md: 40 },
            color: "#263A6B",
          }}
        />
      ) : (
        <ArrowDropUpIcon
          sx={{
            fontSize: { xs: 28, sm: 32, md: 40 },
            color: "#263A6B",
          }}
        />
      )}
    </button>
  );
});

DrawerToggleButton.displayName = "DrawerToggleButton";
