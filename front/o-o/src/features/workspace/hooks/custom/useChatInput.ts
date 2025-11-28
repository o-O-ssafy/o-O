import { useState, useCallback, useEffect } from "react";

/**
 * Chat input management hook
 *
 * **Features:**
 * - Manages chat input visibility state
 * - Handles '/' key detection with input-active check
 * - Tracks cursor position for input placement
 *
 * @returns Chat input state and control methods
 */
export function useChatInput() {
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [inputPosition, setInputPosition] = useState<{ x: number; y: number } | null>(null);
  const [lastCursorPosition, setLastCursorPosition] = useState<{ x: number; y: number } | null>(null);

  /**
   * Check if any input/textarea element currently has focus
   */
  const isInputActive = useCallback(() => {
    const activeElement = document.activeElement;
    return (
      activeElement?.tagName === "INPUT" ||
      activeElement?.tagName === "TEXTAREA" ||
      activeElement?.getAttribute("contenteditable") === "true"
    );
  }, []);

  /**
   * Open chat input at the specified position
   */
  const openChatInput = useCallback((position: { x: number; y: number }) => {
    setInputPosition(position);
    setIsInputVisible(true);
  }, []);

  /**
   * Close chat input
   */
  const closeChatInput = useCallback(() => {
    setIsInputVisible(false);
    setInputPosition(null);
  }, []);

  /**
   * Update the last known cursor position
   * If chat input is visible, also update the input position to follow cursor
   */
  const updateCursorPosition = useCallback((position: { x: number; y: number }) => {
    setLastCursorPosition(position);
    // If bubble is open, update its position to follow cursor (Figma style)
    if (isInputVisible) {
      setInputPosition(position);
    }
  }, [isInputVisible]);

  /**
   * Handle '/' key press to open chat input
   */
  const handleSlashKey = useCallback(() => {
    // Don't open if any input is active
    if (isInputActive()) {
      return;
    }

    // Use last cursor position if available
    if (lastCursorPosition) {
      openChatInput(lastCursorPosition);
    }
  }, [isInputActive, lastCursorPosition, openChatInput]);

  /**
   * Setup global keyboard listener for '/' key
   */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "/" && !event.ctrlKey && !event.metaKey && !event.altKey) {
        handleSlashKey();
        event.preventDefault(); // Prevent '/' from being typed in any input
      }
    };

    globalThis.addEventListener("keydown", handleKeyDown);
    return () => {
      globalThis.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSlashKey]);

  return {
    isInputVisible,
    inputPosition,
    openChatInput,
    closeChatInput,
    updateCursorPosition,
    isInputActive,
  };
}
