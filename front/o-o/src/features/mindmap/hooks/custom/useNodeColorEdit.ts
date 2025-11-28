import { useState } from 'react';

export const useNodeColorEdit = (initialColor: string = "#263A6B") => {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [color, setColor] = useState(initialColor);

  const togglePalette = () => {
    setPaletteOpen((prev) => !prev);
  };

  const closePalette = () => {
    setPaletteOpen(false);
  };

  const changeColor = (newColor: string) => {
    setColor(newColor);
  };

  return {
    paletteOpen,
    color,
    togglePalette,
    closePalette,
    changeColor,
  };
};