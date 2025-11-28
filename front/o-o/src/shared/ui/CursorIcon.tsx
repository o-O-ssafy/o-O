// Cursor color palette for collaboration
export const CURSOR_COLORS = [
  "#F24822",
  "#57E257",
  "#FF824D",
  "#29DFFF",
  "#FF50F0",
  "#FFC60B",
] as const;

export function getRandomCursorColor(): string {
  return CURSOR_COLORS[Math.floor(Math.random() * CURSOR_COLORS.length)];
}

type CursorIconProps = {
  color: string;
  width?: number;
  height?: number;
  className?: string;
};

export const CursorIcon = ({
  color,
  width = 20,
  height = 20,
  className
}: CursorIconProps) => (
  <svg
    width={width}
    height={height}
    viewBox="0 0 266.50 266.50"
    fill="none"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    style={{ transform: "rotate(270deg)" }}
  >
    <path
      d="M150.036,266.494c-0.264,0-0.517-0.006-0.792-0.018c-6.102-0.337-11.332-4.474-13.046-10.347l-26.067-89.027 l-95.203-18.867c-6.014-1.194-10.614-6.059-11.476-12.123c-0.858-6.062,2.201-12.016,7.65-14.832L242.143,1.617 C247.5-1.175,254.057-0.29,258.518,3.8c4.474,4.101,5.885,10.55,3.562,16.146l-98.743,237.655 C161.097,263.018,155.836,266.494,150.036,266.494z"
      fill={color}
    />
  </svg>
);
