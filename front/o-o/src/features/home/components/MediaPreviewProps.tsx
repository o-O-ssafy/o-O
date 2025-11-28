// src/features/home/components/MediaPreview.tsx
interface MediaPreviewProps {
  readonly type: "image" | "youtube";
  readonly icon: string;
  readonly label: string;
  readonly onClear: () => void;
}

export function MediaPreview({
  type,
  icon,
  label,
  onClear,
}: MediaPreviewProps) {
  return (
    <div
      className="w-fit flex items-center bg-primary rounded-full mx-8 mt-3"
      style={{
        gap: "clamp(0.25rem, 0.5vw, 0.5rem)",
        padding: "clamp(0.25rem, 0.5vw, 0.375rem) clamp(0.5rem, 1vw, 0.75rem)",
      }}
    >
      <img
        src={icon}
        alt={`${type} icon`}
        className="object-cover rounded-md flex-shrink-0"
        style={{
          width: "clamp(14px, 1.5vw, 20px)",
          height: "clamp(14px, 1.5vw, 20px)",
        }}
      />
      <span
        className="text-white truncate font-medium"
        style={{
          fontSize: "clamp(10px, 1vw, 12px)",
          maxWidth: "clamp(100px, 30vw, 400px)",
        }}
      >
        {label}
      </span>
      <button
        onClick={onClear}
        className="bg-white rounded-full text-primary font-extrabold flex items-center justify-center flex-shrink-0"
        style={{
          width: "clamp(14px, 1.5vw, 18px)",
          height: "clamp(14px, 1.5vw, 18px)",
          fontSize: "clamp(8px, 0.8vw, 10px)",
        }}
      >
        ✕
      </button>
    </div>
  );
}
