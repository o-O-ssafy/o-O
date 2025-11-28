import { useState } from 'react';

export type FocusedButton = "delete" | "add" | "edit" | "palette" | "recommend" | null;

export const useNodeFocus = () => {
  const [focusedButton, setFocusedButton] = useState<FocusedButton>(null);

  const clearFocus = () => setFocusedButton(null);
  const setFocus = (button: FocusedButton) => setFocusedButton(button);

  return {
    focusedButton,
    setFocusedButton,
    clearFocus,
    setFocus,
  };
};
