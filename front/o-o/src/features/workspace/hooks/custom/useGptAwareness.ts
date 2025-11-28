import { useState, useEffect } from 'react';
import type { Awareness } from 'y-protocols/awareness';

export interface GptState {
  isRecording: boolean;
  keywords: Array<{ id: string; label: string; children?: any[] }>;
  startedBy: string;
  timestamp: number;
}

/**
 * Hook to subscribe to GPT recording state from Yjs Awareness
 *
 * Listens to all participants' Awareness state and returns the GPT session
 * if any participant has GPT state (recording or processing).
 *
 * Note:
 * - Returns GPT state even when isRecording is false to preserve startedBy
 * - Shares GPT state globally (no local priority) for keyword panel sync
 */
export function useGptAwareness(awareness?: Awareness): GptState | null {
  const [gptState, setGptState] = useState<GptState | null>(null);

  useEffect(() => {
    if (!awareness) {
      setGptState(null);
      return;
    }

    const updateGptState = () => {
      // Find any peer with GPT state (recording or processing)
      // Priority: MAINTAINER > Latest timestamp > isRecording
      const states = Array.from(awareness.getStates().entries());

      // console.log('[useGptAwareness] 🔍 Checking awareness states:', {
      //   totalStates: states.length,
      //   myClientId: awareness.clientID,
      //   allClientIds: states.map(([id]) => id),
      // });

      // Log ALL states for debugging
      states.forEach(([clientId, state]) => {
        const gptData = (state as any)?.gpt;
        const user = (state as any)?.user;
        // console.log(`[useGptAwareness] 📊 Client ${clientId}:`, {
        //   hasGptData: !!gptData,
        //   role: user?.role,
        //   isRecording: gptData?.isRecording,
        //   keywordsCount: gptData?.keywords?.length,
        //   keywords: gptData?.keywords?.map((k: any) => k.label),
        //   startedBy: gptData?.startedBy,
        //   timestamp: gptData?.timestamp,
        // });
      });

      // 1순위: MAINTAINER의 gptState (빈 배열 포함)
      for (const [clientId, state] of states) {
        const gptData = (state as any)?.gpt;
        const user = (state as any)?.user;

        if (gptData && user?.role === 'MAINTAINER' && gptData.keywords !== undefined) {
          // console.log('[useGptAwareness] ✅ MAINTAINER state 선택 (빈 배열 포함):', {
          //   clientId,
          //   keywordsCount: gptData.keywords.length,
          //   keywords: gptData.keywords.length > 0 ? gptData.keywords.map((k: any) => k.label) : '[]',
          // });
          setGptState(gptData);
          return;
        }
      }

      // 2순위: timestamp가 가장 최신인 gptState (빈 배열 포함)
      let latestState: GptState | null = null;
      let latestTimestamp = 0;
      let latestClientId: number | null = null;

      for (const [clientId, state] of states) {
        const gptData = (state as any)?.gpt;
        if (gptData && gptData.keywords !== undefined) {
          if (gptData.timestamp > latestTimestamp) {
            latestState = gptData;
            latestTimestamp = gptData.timestamp;
            latestClientId = clientId;
          }
        }
      }

      if (latestState) {
        // console.log('[useGptAwareness] 📅 최신 timestamp state 선택 (빈 배열 포함):', {
        //   clientId: latestClientId,
        //   timestamp: latestTimestamp,
        //   keywordsCount: latestState.keywords.length,
        //   keywords: latestState.keywords.length > 0 ? latestState.keywords.map((k: any) => k.label) : '[]',
        // });
        setGptState(latestState);
        return;
      }

      // 3순위: isRecording 중인 gptState (keywords 없어도 됨)
      for (const [clientId, state] of states) {
        const gptData = (state as any)?.gpt;

        if (gptData && gptData.isRecording) {
          // console.log('[useGptAwareness] 🎤 녹음 중 state 선택:', {
          //   clientId,
          //   isRecording: gptData.isRecording,
          //   keywordsCount: gptData.keywords?.length || 0,
          // });
          setGptState(gptData);
          return;
        }
      }

      // 4순위: gptData가 있기만 하면 (fallback)
      for (const [clientId, state] of states) {
        const gptData = (state as any)?.gpt;

        if (gptData) {
          // console.log('[useGptAwareness] ⚠️ GPT state found (fallback):', {
          //   clientId,
          //   isRecording: gptData.isRecording,
          //   keywordsCount: gptData.keywords?.length || 0,
          // });
          setGptState(gptData);
          return;
        }
      }

      // No GPT state found
      // console.log('[useGptAwareness] ❌ No GPT state found');
      setGptState(null);
    };

    // Subscribe to awareness changes
    awareness.on('change', updateGptState);

    // Initial state
    updateGptState();

    return () => {
      awareness.off('change', updateGptState);
    };
  }, [awareness]);

  return gptState;
}
