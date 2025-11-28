import { useState } from 'react';

export const useNodeTextEdit = (initialText: string, initialMemo?: string) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(initialText);
  const [editMemo, setEditMemo] = useState(initialMemo || '');

  const startEdit = () => {
    setEditValue(initialText);
    setEditMemo(initialMemo || '');
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setEditValue(initialText);
    setEditMemo(initialMemo || '');
    setIsEditing(false);
  };

  const confirmEdit = () => {
    setIsEditing(false);
    return { text: editValue.trim(), memo: editMemo.trim() };
  };

  return {
    isEditing,
    editValue,
    editMemo,
    setEditValue,
    setEditMemo,
    startEdit,
    cancelEdit,
    confirmEdit,
  };
};