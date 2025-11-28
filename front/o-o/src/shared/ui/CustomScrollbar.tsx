// shared/ui/CustomScrollbar.tsx
import React from "react";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

interface CustomScrollbarProps {
  children: React.ReactNode;
  maxHeight?: string;
  maxWidth?: string;
  className?: string;
  autoHide?: boolean;
  direction?: "vertical" | "horizontal";
}

const CustomScrollbar: React.FC<CustomScrollbarProps> = ({
  children,
  maxHeight = "100%",
  maxWidth,
  className = "",
  autoHide = false,
  direction = "vertical",
}) => {
  return (
    <SimpleBar
      style={{
        maxHeight: direction === "vertical" ? maxHeight : undefined,
        maxWidth: direction === "horizontal" ? maxWidth : undefined,
      }}
      className={`custom-simplebar ${className} cursor-pointer`}
      autoHide={autoHide}
    >
      {children}
    </SimpleBar>
  );
};

export default CustomScrollbar;
