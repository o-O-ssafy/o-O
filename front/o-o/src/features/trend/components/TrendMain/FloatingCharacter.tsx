interface FloatingCharacterProps {
  readonly image: string;
  readonly isFullscreen: boolean;
}

export function FloatingCharacter({
  image,
  isFullscreen,
}: FloatingCharacterProps) {
  const size = isFullscreen
    ? "clamp(400px, 40vw, 600px)"
    : "clamp(300px, 25vw, 400px)";

  return (
    <div className="absolute left-1/2 bottom-4 -translate-x-1/2 translate-y-1/3 z-10">
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <img
          src={image}
          alt="character"
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}
