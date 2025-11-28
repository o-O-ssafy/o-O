import { useEffect, useState, useRef, useCallback } from 'react';
import { ICE_SERVERS } from '@/constants/voiceChat';
import type { VoiceParticipant, ClientMessage } from '../../types/voice.types';

type SendMessageFn = (message: ClientMessage) => void;

export function useWebRTC(
  localStream: MediaStream | null,
  participants: VoiceParticipant[],
  sendMessage: SendMessageFn,
  myUserId: string | undefined
) {
  const [peerConnections, setPeerConnections] = useState<Map<string, RTCPeerConnection>>(new Map());
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());

  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());

  // Create PeerConnection for a remote user
  const createPeerConnection = useCallback(
    (userId: string): RTCPeerConnection => {
      console.log('[useWebRTC] Creating peer connection for:', userId);

      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      // Add local stream tracks
      if (localStream) {
        localStream.getTracks().forEach((track) => {
          pc.addTrack(track, localStream);
        });
      }

      // Handle incoming tracks
      pc.ontrack = (event) => {
        console.log('[useWebRTC] Received remote track from:', userId);
        const [remoteStream] = event.streams;

        remoteStreamsRef.current.set(userId, remoteStream);
        setRemoteStreams(new Map(remoteStreamsRef.current));
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log('[useWebRTC] Sending ICE candidate to:', userId);
          sendMessage({
            type: 'ice',
            toUserId: userId,
            candidate: event.candidate.toJSON(),
          });
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log(`[useWebRTC] Connection state with ${userId}:`, pc.connectionState);

        if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
          // Clean up this peer connection
          removePeerConnection(userId);
        }
      };

      peerConnectionsRef.current.set(userId, pc);
      setPeerConnections(new Map(peerConnectionsRef.current));

      return pc;
    },
    [localStream, sendMessage]
  );

  // Remove PeerConnection
  const removePeerConnection = useCallback((userId: string) => {
    console.log('[useWebRTC] Removing peer connection for:', userId);

    const pc = peerConnectionsRef.current.get(userId);
    if (pc) {
      pc.close();
      peerConnectionsRef.current.delete(userId);
      setPeerConnections(new Map(peerConnectionsRef.current));
    }

    if (remoteStreamsRef.current.has(userId)) {
      remoteStreamsRef.current.delete(userId);
      setRemoteStreams(new Map(remoteStreamsRef.current));
    }
  }, []);

  // Send offer to a remote user
  const sendOffer = useCallback(
    async (userId: string) => {
      let pc = peerConnectionsRef.current.get(userId);

      if (!pc) {
        pc = createPeerConnection(userId);
      }

      try {
        console.log('[useWebRTC] Creating offer for:', userId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        sendMessage({
          type: 'offer',
          toUserId: userId,
          offer: offer,
        });
      } catch (error) {
        console.error('[useWebRTC] Error creating offer:', error);
      }
    },
    [createPeerConnection, sendMessage]
  );

  // Handle offer from remote user
  const handleOffer = useCallback(
    async (fromUserId: string, offer: RTCSessionDescriptionInit) => {
      console.log('[useWebRTC] Handling offer from:', fromUserId);

      let pc = peerConnectionsRef.current.get(fromUserId);

      if (!pc) {
        pc = createPeerConnection(fromUserId);
      }

      // Check signaling state before setting remote description
      if (pc.signalingState !== 'stable' && pc.signalingState !== 'have-local-offer') {
        console.warn(`[useWebRTC] Cannot handle offer in state: ${pc.signalingState}`);
        return;
      }

      try {
        await pc.setRemoteDescription(offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        sendMessage({
          type: 'answer',
          toUserId: fromUserId,
          answer: answer,
        });

        console.log('[useWebRTC] Sent answer to:', fromUserId);
      } catch (error) {
        console.error('[useWebRTC] Error handling offer:', error);
      }
    },
    [createPeerConnection, sendMessage]
  );

  // Handle answer from remote user
  const handleAnswer = useCallback(async (fromUserId: string, answer: RTCSessionDescriptionInit) => {
    console.log('[useWebRTC] Handling answer from:', fromUserId);

    const pc = peerConnectionsRef.current.get(fromUserId);
    if (!pc) {
      console.warn('[useWebRTC] No peer connection found for:', fromUserId);
      return;
    }

    // Check signaling state before setting remote description
    if (pc.signalingState !== 'have-local-offer') {
      console.warn(`[useWebRTC] Cannot handle answer in state: ${pc.signalingState}`);
      return;
    }

    try {
      await pc.setRemoteDescription(answer);
      console.log('[useWebRTC] Remote description set for:', fromUserId);
    } catch (error) {
      console.error('[useWebRTC] Error handling answer:', error);
    }
  }, []);

  // Handle ICE candidate from remote user
  const handleIce = useCallback(async (fromUserId: string, candidate: RTCIceCandidateInit) => {
    console.log('[useWebRTC] Handling ICE candidate from:', fromUserId);

    const pc = peerConnectionsRef.current.get(fromUserId);
    if (!pc) {
      console.warn('[useWebRTC] No peer connection found for:', fromUserId);
      return;
    }

    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.error('[useWebRTC] Error adding ICE candidate:', error);
    }
  }, []);

  // Sync peer connections with participants list
  useEffect(() => {
    if (!myUserId) {
      console.log('[useWebRTC] No myUserId, skipping sync');
      return;
    }

    console.log('[useWebRTC] Syncing participants:', {
      myUserId,
      participants: participants.map(p => p.userId),
      existingConnections: Array.from(peerConnectionsRef.current.keys())
    });

    // Create peer connections for new participants
    participants.forEach((participant) => {
      if (participant.userId !== myUserId && !peerConnectionsRef.current.has(participant.userId)) {
        console.log(`[useWebRTC] New participant detected: ${participant.userId}`);
        // Only send offer if my userId is greater (to avoid both sides sending offer)
        // This prevents "glare" situation in WebRTC signaling
        // Convert to numbers for comparison to ensure consistency
        const myUserIdNum = Number(myUserId);
        const participantUserIdNum = Number(participant.userId);

        if (myUserIdNum > participantUserIdNum) {
          console.log(`[useWebRTC] I'm initiating connection (${myUserId} > ${participant.userId})`);
          sendOffer(participant.userId);
        } else {
          console.log(`[useWebRTC] Waiting for offer from ${participant.userId} (${myUserId} < ${participant.userId})`);
        }
      }
    });

    // Remove peer connections for participants who left
    // Add a small delay to avoid race conditions with participant list updates
    const participantIds = new Set(participants.map((p) => p.userId));
    const removalTimer = setTimeout(() => {
      peerConnectionsRef.current.forEach((_, userId) => {
        if (!participantIds.has(userId)) {
          removePeerConnection(userId);
        }
      });
    }, 500); // 500ms delay before removing connections

    return () => clearTimeout(removalTimer);
  }, [participants, myUserId, sendOffer, removePeerConnection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[useWebRTC] Cleaning up all peer connections');
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
      remoteStreamsRef.current.clear();
    };
  }, []);

  return {
    peerConnections,
    remoteStreams,
    handleOffer,
    handleAnswer,
    handleIce,
  };
}
