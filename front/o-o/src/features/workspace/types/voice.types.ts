// Voice WebSocket Message Types (Client ↔ Server)

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface VoiceState {
  muted: boolean;
  speaking: boolean;
}

export interface VoiceParticipant {
  userId: string;
  voiceState?: VoiceState;
}

// Server → Client Messages
export interface ParticipantsMessage {
  type: 'participants';
  workspaceId: string;
  participants: VoiceParticipant[];
}

export interface VoiceJoinedMessage {
  type: 'voice-joined';
  workspaceId: string;
  userId: string;
}

export interface VoiceLeftMessage {
  type: 'voice-left';
  workspaceId: string;
  userId: string;
}

export interface VoiceFullMessage {
  type: 'voice-full';
  workspaceId: string;
  maxParticipants: number;
}

export interface OfferMessage {
  type: 'offer';
  workspaceId: string;
  fromUserId: string;
  offer: RTCSessionDescriptionInit;
}

export interface AnswerMessage {
  type: 'answer';
  workspaceId: string;
  fromUserId: string;
  answer: RTCSessionDescriptionInit;
}

export interface IceMessage {
  type: 'ice';
  workspaceId: string;
  fromUserId: string;
  candidate: RTCIceCandidateInit;
}

export interface VoiceStateMessage {
  type: 'voice-state';
  workspaceId: string;
  userId: string;
  voiceState: VoiceState;
}

export interface ServerShutdownMessage {
  type: 'server-shutdown';
  message: string;
}

// GPT 관련 메시지 (Server → Client)
export interface GptRecordingStartedMessage {
  type: 'gpt-recording-started';
  workspaceId: string;
  startedBy: string;
  timestamp: number;
}

export interface PeerTranscriptMessage {
  type: 'peer-transcript';
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

export interface GptChunkMessage {
  type: 'gpt-chunk';
  content: string;
  timestamp: number;
}

export interface GptNodeSuggestion {
  parentId: string | null;
  keyword: string;
  memo: string;
}

export interface GptDoneMessage {
  type: 'gpt-done';
  nodes: GptNodeSuggestion[];
  timestamp: number;
}

export interface GptErrorMessage {
  type: 'gpt-error';
  error: string;
  rawText?: string;
  timestamp: number;
}

export interface GptSessionEndedMessage {
  type: 'gpt-session-ended';
  timestamp: number;
}

// 회의록 관련 메시지 (Server → Client)
export interface MeetingMinutesChunkMessage {
  type: 'meeting-minutes-chunk';
  content: string;
  timestamp: number;
}

export interface MeetingMinutesDoneMessage {
  type: 'meeting-minutes-done';
  content: string;
  timestamp: number;
}

export interface MeetingMinutesErrorMessage {
  type: 'meeting-minutes-error';
  error: string;
  timestamp: number;
}

export type ServerMessage =
  | ParticipantsMessage
  | VoiceJoinedMessage
  | VoiceLeftMessage
  | VoiceFullMessage
  | OfferMessage
  | AnswerMessage
  | IceMessage
  | VoiceStateMessage
  | ServerShutdownMessage
  | GptRecordingStartedMessage
  | PeerTranscriptMessage
  | GptChunkMessage
  | GptDoneMessage
  | GptErrorMessage
  | GptSessionEndedMessage
  | MeetingMinutesChunkMessage
  | MeetingMinutesDoneMessage
  | MeetingMinutesErrorMessage;

// Client → Server Messages
export interface SendOfferMessage {
  type: 'offer';
  toUserId: string;
  offer: RTCSessionDescriptionInit;
}

export interface SendAnswerMessage {
  type: 'answer';
  toUserId: string;
  answer: RTCSessionDescriptionInit;
}

export interface SendIceMessage {
  type: 'ice';
  toUserId: string;
  candidate: RTCIceCandidateInit;
}

export interface SendVoiceStateMessage {
  type: 'voice-state';
  voiceState: VoiceState;
}

// GPT 관련 메시지 (Client → Server)
export interface GptStartRecordingMessage {
  type: 'gpt-start-recording';
  userId: string;
}

export interface GptTranscriptMessage {
  type: 'gpt-transcript';
  userId: string;
  userName: string;
  text: string;
  isFinal: boolean;
  timestamp: number;
}

export interface GptStopRecordingMessage {
  type: 'gpt-stop-recording';
  userId: string;
}

// 회의록 관련 메시지 (Client → Server)
export interface VoiceTranscriptMessage {
  type: 'voice-transcript';
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
}

export interface GenerateMeetingMinutesMessage {
  type: 'generate-meeting-minutes';
  userId: string;
}

export type ClientMessage =
  | SendOfferMessage
  | SendAnswerMessage
  | SendIceMessage
  | SendVoiceStateMessage
  | GptStartRecordingMessage
  | GptTranscriptMessage
  | GptStopRecordingMessage
  | VoiceTranscriptMessage
  | GenerateMeetingMinutesMessage;
