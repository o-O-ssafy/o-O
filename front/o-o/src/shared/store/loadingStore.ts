import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  setIsLoading: (value: boolean) => void;
}

/**
 * Global loading state store
 *
 * Used for:
 * - Initial mindmap creation (Home → MindmapPage transition)
 * - Textbox idea analysis (waiting for backend nodes)
 */
export const useLoadingStore = create<LoadingState>((set) => ({
  isLoading: false,
  setIsLoading: (value: boolean) => set({ isLoading: value }),
}));
