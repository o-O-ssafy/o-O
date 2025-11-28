import { useState } from 'react';

export const useNodeAdd = () => {
  const [showAddInput, setShowAddInput] = useState(false);
  const [addValue, setAddValue] = useState('');

  const openAddInput = () => {
    setShowAddInput(true);
  };

  const closeAddInput = () => {
    setAddValue('');
    setShowAddInput(false);
  };

  const confirmAdd = () => {
    const trimmedValue = addValue.trim();
    if (trimmedValue) {
      setAddValue('');
      setShowAddInput(false);
      return trimmedValue;
    }
    return null;
  };

  return {
    showAddInput,
    addValue,
    setAddValue,
    openAddInput,
    closeAddInput,
    confirmAdd,
  };
};