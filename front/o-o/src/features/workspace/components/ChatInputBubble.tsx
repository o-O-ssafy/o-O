import { useEffect, useRef, useState } from "react";
import { getContrastTextColor } from "@/shared/utils/colorUtils";
import type { Transform } from "@/features/mindmap/types";
import { useSpeechBubble } from "../hooks/custom/useSpeechBubble";
import { BUBBLE_STYLES, createBubbleTailStyle } from "../utils/speechBubbleStyles";

type ChatInputBubbleProps = {
  transform: Transform;
  container: HTMLElement | null;
  position: { x: number; y: number }; // Model coordinates
  color: string;
  onClose: () => void;
  onUpdateChat: (chatData: { isTyping: boolean; currentText: string; timestamp: number } | null) => void;
};

/**
 * Inline chat input bubble component
 *
 * **Features:**
 * - Appears at cursor position
 * - Auto-focuses on mount
 * - Broadcasts each keystroke in real-time
 * - ESC to cancel, Enter to confirm and close
 * - Speech bubble style matching cursor color
 * - Multi-line support with 60 character limit
 */
export function ChatInputBubble({
  transform,
  container,
  position,
  color,
  onClose,
  onUpdateChat,
}: Readonly<ChatInputBubbleProps>) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rafRef = useRef<number>(0);
  const onUpdateChatRef = useRef(onUpdateChat);

  // Keep onUpdateChat ref current to avoid timer resets
  useEffect(() => {
    onUpdateChatRef.current = onUpdateChat;
  }, [onUpdateChat]);

  // Calculate text color based on background for readability
  const textColor = getContrastTextColor(color);

  // Transform model coordinates to screen coordinates using shared hook
  const { screenPosition } = useSpeechBubble({
    modelPosition: position,
    transform,
    // No containerSize = no off-screen clamping for input bubble
  });

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Broadcast typing state in real-time (throttled with RAF)
  useEffect(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      if (text.length > 0) {
        onUpdateChatRef.current?.({
          isTyping: true,
          currentText: text,
          timestamp: Date.now(),
        });
      } else {
        onUpdateChatRef.current?.(null);
      }
    });

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [text]);

  // Auto-close: 3 seconds if empty, 6 seconds after last input if has text
  useEffect(() => {
    const timer = text.length === 0
      ? setTimeout(() => {
          // Empty text: close after 3 seconds
          onUpdateChatRef.current?.(null);
          onClose();
        }, 3000)
      : setTimeout(() => {
          // Has text: close after 6 seconds of last input
          onUpdateChatRef.current?.(null);
          onClose();
        }, 6000);

    return () => clearTimeout(timer);
  }, [text, onClose]);

  // Keyboard event handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onUpdateChatRef.current?.(null);
      onClose();
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        left: screenPosition.x,
        top: screenPosition.y,
        transform: BUBBLE_STYLES.anchorTransform,
        zIndex: 100,
        pointerEvents: "auto",
      }}
    >
      {/* Speech bubble */}
      <div
        style={{
          position: "relative",
          background: color,
          borderRadius: BUBBLE_STYLES.borderRadius,
          padding: BUBBLE_STYLES.padding,
          boxShadow: BUBBLE_STYLES.boxShadow,
          minWidth: BUBBLE_STYLES.minWidth,
          maxWidth: BUBBLE_STYLES.maxWidth,
          marginBottom: 8,
        }}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요"
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            color: textColor,
            fontSize: BUBBLE_STYLES.fontSize,
            resize: "none",
            fontFamily: "inherit",
            lineHeight: BUBBLE_STYLES.lineHeight,
            wordWrap: "break-word",
            overflow: "hidden",
          }}
          maxLength={60}
          rows={2}
        />

        {/* Speech bubble tail */}
        <div style={createBubbleTailStyle(color)} />
      </div>
    </div>
  );
}
