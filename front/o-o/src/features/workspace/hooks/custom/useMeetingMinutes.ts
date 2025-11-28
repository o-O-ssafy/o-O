import { useState, useCallback, useRef } from 'react';
import type {
  MeetingMinutesChunkMessage,
  MeetingMinutesDoneMessage,
  MeetingMinutesErrorMessage,
} from '../../types/voice.types';

interface UseMeetingMinutesOptions {
  sendMessage: (message: any) => void;
  userId: string | undefined;
  onGenerationStart?: () => void;
  onGenerationComplete?: (content: string) => void;
  onGenerationError?: (error: string) => void;
}

export function useMeetingMinutes({
  sendMessage,
  userId,
  onGenerationStart,
  onGenerationComplete,
  onGenerationError,
}: UseMeetingMinutesOptions) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [meetingMinutesContent, setMeetingMinutesContent] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showContentDialog, setShowContentDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for stable callbacks
  const onGenerationStartRef = useRef(onGenerationStart);
  const onGenerationCompleteRef = useRef(onGenerationComplete);
  const onGenerationErrorRef = useRef(onGenerationError);

  // Update refs when callbacks change
  onGenerationStartRef.current = onGenerationStart;
  onGenerationCompleteRef.current = onGenerationComplete;
  onGenerationErrorRef.current = onGenerationError;

  // Start meeting minutes generation
  const generateMeetingMinutes = useCallback(() => {
    if (!userId) {
      console.error('[useMeetingMinutes] Cannot generate: userId is undefined');
      return;
    }

    console.log('[useMeetingMinutes] 📝 Starting meeting minutes generation...');

    setIsGenerating(true);
    setMeetingMinutesContent('');
    setError(null);
    setShowConfirmDialog(false);
    setShowContentDialog(true);

    // Send generate request to server
    sendMessage({
      type: 'generate-meeting-minutes',
      userId,
    });

    onGenerationStartRef.current?.();
  }, [userId, sendMessage]);

  // Handle incoming chunk
  const handleChunk = useCallback((message: MeetingMinutesChunkMessage) => {
    console.log('[useMeetingMinutes] 📦 Received chunk:', message.content.substring(0, 50));

    setMeetingMinutesContent((prev) => prev + message.content);
  }, []);

  // Handle generation complete
  const handleDone = useCallback((message: MeetingMinutesDoneMessage) => {
    console.log('[useMeetingMinutes] ✅ Meeting minutes generation complete');

    setIsGenerating(false);
    setMeetingMinutesContent(message.content);

    onGenerationCompleteRef.current?.(message.content);
  }, []);

  // Handle generation error
  const handleError = useCallback((message: MeetingMinutesErrorMessage) => {
    console.error('[useMeetingMinutes] ❌ Error:', message.error);

    setIsGenerating(false);
    setError(message.error);

    onGenerationErrorRef.current?.(message.error);
  }, []);

  // Show confirm dialog (when ending voice chat)
  const showEndVoiceConfirm = useCallback(() => {
    console.log('[useMeetingMinutes] 🔔 Showing confirm dialog...');
    setShowConfirmDialog(true);
  }, []);

  // Hide confirm dialog
  const hideConfirmDialog = useCallback(() => {
    console.log('[useMeetingMinutes] ❌ Hiding confirm dialog...');
    setShowConfirmDialog(false);
  }, []);

  // Hide content dialog
  const hideContentDialog = useCallback(() => {
    console.log('[useMeetingMinutes] ❌ Hiding content dialog...');
    setShowContentDialog(false);
    setMeetingMinutesContent('');
    setError(null);
  }, []);

  // Reset all state
  const reset = useCallback(() => {
    console.log('[useMeetingMinutes] 🔄 Resetting state...');
    setIsGenerating(false);
    setMeetingMinutesContent('');
    setShowConfirmDialog(false);
    setShowContentDialog(false);
    setError(null);
  }, []);

  return {
    // State
    isGenerating,
    meetingMinutesContent,
    showConfirmDialog,
    showContentDialog,
    error,

    // Actions
    generateMeetingMinutes,
    showEndVoiceConfirm,
    hideConfirmDialog,
    hideContentDialog,
    reset,

    // Handlers (to be passed to useVoiceConnection)
    handleChunk,
    handleDone,
    handleError,
  };
}
