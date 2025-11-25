# Workspace Implementation - 실시간 협업 마인드맵 시스템

## Executive Summary

본 프로젝트는 **실시간 다중 사용자 협업**을 지원하는 마인드맵 워크스페이스 시스템입니다. CRDT(Conflict-free Replicated Data Type) 기술인 Yjs를 활용하여 동시 편집 충돌을 자동으로 해결하고, WebRTC 기반 음성 채팅 및 음성 인식을 통한 AI 키워드 추천 기능을 제공합니다.

### 핵심 가치
- **무충돌 협업**: Yjs CRDT를 통한 자동 병합으로 충돌 없는 실시간 협업
- **실시간 커뮤니케이션**: WebRTC 기반 음성 채팅 및 텍스트 채팅
- **AI 통합**: 음성 인식을 통한 자동 키워드 추출 및 회의록 생성
- **역할 기반 권한**: MAINTAINER, EDIT, VIEW 등급별 접근 제어
- **확장 가능한 아키텍처**: 모듈화된 훅 기반 설계

---

## 1. 기술 스택 및 아키텍처

### 1.1 Core Technology Stack

```json
{
  "실시간 협업": {
    "yjs": "^13.6.27",
    "y-websocket": "^3.0.0"
  },
  "음성 통신": {
    "WebRTC": "Native API",
    "Web Speech API": "Native API",
    "ws": "^8.18.0"
  },
  "상태 관리": {
    "@tanstack/react-query": "^5.90.5",
    "@reduxjs/toolkit": "^2.9.2",
    "zustand": "^5.0.2"
  },
  "시각화": {
    "d3": "^7.9.0",
    "react-zoom-pan-pinch": "^3.8.1"
  },
  "UI": {
    "React": "^19.1.1",
    "TypeScript": "^5.7.3",
    "Tailwind CSS": "^4.1.0",
    "Radix UI": "^1.x"
  }
}
```

### 1.2 아키텍처 레이어

```
┌─────────────────────────────────────────────────────┐
│              Presentation Layer                      │
│  (React Components, UI, Remote Cursors, Chat)       │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│              Business Logic Layer                    │
│  (Custom Hooks, State Management, Permissions)      │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│            Integration Layer                         │
│  (Yjs Client, WebRTC, React Query, Axios)          │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│              Network Layer                           │
│  (WebSocket, REST API, STUN/TURN)                   │
└─────────────────────────────────────────────────────┘
```

### 1.3 주요 디렉토리 구조

```
src/features/workspace/
├── hooks/
│   ├── custom/
│   │   ├── yjsClient.ts                 # Yjs 클라이언트 생성
│   │   ├── useYjsCollaboration.ts       # 협업 메인 훅
│   │   ├── useCollaborativeNodes.ts     # 노드 동기화
│   │   ├── useYMapState.ts              # Y.Map 상태 관리
│   │   ├── yMapCrud.ts                  # CRUD 연산
│   │   ├── useVoiceChat.ts              # 음성 채팅 오케스트레이션
│   │   ├── useWebRTC.ts                 # WebRTC 피어 관리
│   │   ├── useVoiceConnection.ts        # WebSocket 시그널링
│   │   ├── useVoiceGpt.ts               # 음성 인식 & GPT
│   │   └── useVoiceState.ts             # 음소거/발화 상태
│   └── query/
│       └── useWorkspaceAccessQuery.ts   # 워크스페이스 접근 제어
├── components/
│   ├── RemoteCursorsOverlay.tsx         # 원격 커서 렌더링
│   ├── ChatBubblesOverlay.tsx           # 채팅 말풍선
│   └── VoiceChat/                       # 음성 채팅 UI
├── types/
│   └── websocket.types.ts               # WebSocket 메시지 타입
└── pages/
    ├── MindmapPage.tsx                  # 메인 워크스페이스
    └── WorkspaceJoinPage.tsx            # 초대 링크 처리

src/services/
├── workspaceService.ts                  # Workspace REST API
├── websocketTokenService.ts             # WebSocket 토큰 발급
└── dto/
    └── workspace.dto.ts                 # 데이터 전송 객체
```

---

## 2. 실시간 협업 시스템 (Yjs CRDT)

### 2.1 Yjs 클라이언트 구현

**위치**: [src/features/workspace/hooks/custom/yjsClient.ts](src/features/workspace/hooks/custom/yjsClient.ts)

#### 핵심 기능

```typescript
export const createYClient = (
  wsUrl: string,
  workspaceId: string,
  wsToken: string,
  options?: { connect?: boolean }
): YClient => {
  const doc = new Y.Doc();
  const roomName = `workspace:${workspaceId}`;

  // WebSocket Provider 생성 (토큰 기반 인증)
  const provider = new WebsocketProvider(wsUrl, roomName, doc, {
    params: { token: wsToken },
    connect: options?.connect ?? true
  });

  // 메시지 핸들러 분리
  const jsonMessageHandlers: JsonMessageHandler[] = [];
  const originalOnMessage = provider.ws.onmessage;

  provider.ws.onmessage = (event: MessageEvent) => {
    if (typeof event.data === "string") {
      // JSON 메시지 → 애플리케이션 로직
      try {
        const parsed = JSON.parse(event.data);
        jsonMessageHandlers.forEach(handler => handler(parsed));
      } catch (err) {
        console.error("Failed to parse JSON message:", err);
      }
      return; // Yjs에 전달하지 않음
    }

    // Binary 메시지 → Yjs 동기화 프로토콜
    originalOnMessage?.call(provider.ws, event);
  };

  return { doc, provider, addJsonMessageHandler: ... };
};
```

#### 기술적 특징

1. **메시지 멀티플렉싱**: 단일 WebSocket 연결로 Yjs 바이너리 동기화와 커스텀 JSON 메시지를 동시 처리
2. **토큰 기반 인증**: 단기 토큰(ST)으로 WebSocket 연결 보안 강화
3. **확장 가능한 핸들러**: `addJsonMessageHandler`로 메시지 타입별 처리 로직 추가

### 2.2 협업 상태 관리

**위치**: [src/features/workspace/hooks/custom/useYjsCollaboration.ts](src/features/workspace/hooks/custom/useYjsCollaboration.ts)

#### Awareness Protocol (실시간 사용자 상태)

```typescript
interface AwarenessState {
  user: {
    userId: number;
    name: string;
    email: string;
    profileImage: string;
    color: string;
    role: WorkspaceRole; // MAINTAINER, EDIT, VIEW
  };
  cursor: { x: number; y: number; color: string } | null;
  chat: {
    isTyping: boolean;
    currentText: string;
    timestamp: number;
  } | null;
  gpt: {
    isRecording: boolean;
    keywords: string[];
    startedBy: string;
    timestamp: number;
  } | null;
}
```

#### 연결 생명주기 관리

```typescript
useEffect(() => {
  if (!enabled) return;

  // 1. WebSocket 토큰 발급
  const wsToken = await fetchWebSocketToken();

  // 2. Yjs 클라이언트 생성
  const client = createYClient(wsUrl, workspaceId, wsToken);

  // 3. Awareness 초기화
  awareness.setLocalStateField("user", {
    userId, name, email, profileImage,
    color: cursorColor,
    role: myRole
  });

  // 4. 인증 에러 처리
  client.addJsonMessageHandler((msg) => {
    if (msg.type === "auth-error") {
      onAuthError?.();
    }
  });

  // 5. 연결 해제 시 토큰 재발급 및 재연결
  const handleDisconnect = async () => {
    const newToken = await fetchWebSocketToken();
    client.provider.params = { token: newToken };
    client.provider.connect();
  };

  return () => {
    client.provider.disconnect();
    client.doc.destroy();
  };
}, [enabled, workspaceId]);
```

#### 주요 메시지 타입 처리

```typescript
// AI 추천 키워드 수신
if (message.type === "add-idea-done") {
  onAiRecommendation?.(message.nodes);
}

// 역할 변경 알림
if (message.type === "role-update") {
  queryClient.invalidateQueries(["workspace", workspaceId]);
}

// 음성 채팅 상태 변경
if (message.type === "voice-state") {
  // Awareness로 전파
}
```

### 2.3 노드 동기화 전략

**위치**: [src/features/workspace/hooks/custom/useCollaborativeNodes.ts](src/features/workspace/hooks/custom/useCollaborativeNodes.ts)

#### 부트스트랩 프로세스

```typescript
const bootstrapNodes = useCallback(async () => {
  if (!collab?.map || !collab.provider.synced) return;

  // 1. Y.Map이 비어있는 경우만 REST API 호출
  if (collab.map.size === 0) {
    const data = await getWorkspaceMindmap(workspaceId);

    // 2. 노드를 Y.Map에 삽입
    collab.doc.transact(() => {
      data.nodes.forEach(node => {
        const position = node.position || calculatePosition(node);
        collab.map.set(node.id, { ...node, position });
      });
    }, "bootstrap");
  }
}, [collab, workspaceId]);

// WebSocket 동기화 완료 후 실행
useEffect(() => {
  if (collab?.provider.synced && !hasBootstrapped.current) {
    hasBootstrapped.current = true;
    bootstrapNodes();
  }
}, [collab?.provider.synced]);
```

#### 중복 방지 로직

```typescript
// 임시 ID와 영구 ID 병합
const existingNodeIds = new Map<number, string>(); // nodeId → id
const existingIds = new Set<string>();             // Y.Map keys

for (const [id, data] of collab.map.entries()) {
  existingNodeIds.set(data.nodeId, id);
  existingIds.add(id);
}

// 새 노드 추가 시 중복 체크
for (const node of newNodes) {
  if (existingNodeIds.has(node.nodeId)) {
    console.warn(`Duplicate nodeId=${node.nodeId}, skipping`);
    continue;
  }

  // 임시 ID를 영구 ID로 교체
  const existingId = existingNodeIds.get(node.nodeId);
  if (existingId && isTempId(existingId)) {
    collab.map.delete(existingId);
  }

  collab.map.set(node.id, node);
}
```

#### 포지션 계산 (D3 Force Layout)

**위치**: [src/features/mindmap/utils/radialLayoutWithForces.ts](src/features/mindmap/utils/radialLayoutWithForces.ts)

```typescript
export function calculateRadialPosition(
  node: MindmapNodeData,
  allNodes: Map<string, MindmapNodeData>,
  canvasCenter = { x: 2500, y: 2500 }
): { x: number; y: number } {

  // 1. 깊이 기반 반지름 계산
  const depth = calculateDepth(node, allNodes);
  const radius = BASE_RADIUS + depth * DEPTH_INCREMENT;

  // 2. 형제 노드 간 각도 분배
  const siblings = getSiblings(node, allNodes);
  const angleStep = (2 * Math.PI) / (siblings.length || 1);
  const index = siblings.indexOf(node.id);
  const angle = index * angleStep;

  // 3. 극좌표 → 직교좌표 변환
  const x = canvasCenter.x + radius * Math.cos(angle);
  const y = canvasCenter.y + radius * Math.sin(angle);

  // 4. D3 Force Simulation으로 겹침 방지
  const simulation = d3.forceSimulation(nodes)
    .force("collision", d3.forceCollide().radius(100))
    .force("charge", d3.forceManyBody().strength(-50))
    .tick(50); // 50회 시뮬레이션

  return { x, y };
}
```

### 2.4 Y.Map 상태 관리 (증분 업데이트)

**위치**: [src/features/workspace/hooks/custom/useYMapState.ts](src/features/workspace/hooks/custom/useYMapState.ts)

#### 성능 최적화

```typescript
// ❌ 비효율: 전체 Y.Map을 JSON으로 변환 (O(n))
yMap.observe(() => {
  setNodes(Array.from(yMap.toJSON()));
});

// ✅ 효율적: 변경된 키만 처리 (O(k), k = 변경된 키 수)
yMap.observe((event, transaction) => {
  const changes = new Map<string, MindmapNodeData | null>();

  for (const key of event.keysChanged) {
    const action = event.changes?.keys?.get(key);

    if (action?.action === 'delete') {
      changes.set(key, null); // 삭제
    } else {
      const value = yMap.get(key);
      changes.set(key, value); // 추가/수정
    }
  }

  setNodes(prev => {
    const next = new Map(prev);
    changes.forEach((value, key) => {
      if (value === null) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    return next;
  });
});
```

#### Transaction Origin 검증

```typescript
const VALID_ORIGINS = [
  "mindmap-crud",
  "bootstrap",
  "local-update",
  "remote-sync"
] as const;

yMap.observe((event, transaction) => {
  const origin = transaction.origin;

  if (typeof origin !== 'string') {
    console.error('Invalid transaction origin:', {
      type: typeof origin,
      value: origin,
      stack: new Error().stack
    });
  }

  console.log(`📝 Y.Map Update [origin: ${origin}]`, {
    keysChanged: Array.from(event.keysChanged),
    mapSize: yMap.size
  });
});
```

### 2.5 CRUD 연산 추상화

**위치**: [src/features/workspace/hooks/custom/yMapCrud.ts](src/features/workspace/hooks/custom/yMapCrud.ts)

```typescript
export const createYMapCrud = <K extends string, V>(
  doc: Y.Doc,
  map: Y.Map<V>,
  origin: string = "mindmap-crud"
) => ({
  // 단일 업데이트
  set(key: K, value: V) {
    doc.transact(() => {
      map.set(key, value);
    }, origin);
  },

  // 배치 업데이트 (단일 트랜잭션)
  setMany(entries: [K, V][]) {
    doc.transact(() => {
      entries.forEach(([key, value]) => map.set(key, value));
    }, origin);
  },

  // 조건부 업데이트
  update(key: K, updater: (prev: V | undefined) => V) {
    doc.transact(() => {
      const prev = map.get(key);
      const next = updater(prev);
      map.set(key, next);
    }, origin);
  },

  // 삭제
  remove(key: K) {
    doc.transact(() => {
      map.delete(key);
    }, origin);
  },

  // 커스텀 트랜잭션
  transact(callback: () => void) {
    doc.transact(callback, origin);
  }
});
```

---

## 3. 음성 채팅 및 WebRTC 시스템

### 3.1 음성 채팅 아키텍처

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   User A     │       │   User B     │       │   User C     │
│              │       │              │       │              │
│ Microphone   │       │ Microphone   │       │ Microphone   │
└──────┬───────┘       └──────┬───────┘       └──────┬───────┘
       │                      │                      │
       │  getUserMedia()      │                      │
       │                      │                      │
       ▼                      ▼                      ▼
┌──────────────────────────────────────────────────────────────┐
│              WebSocket Signaling Server                       │
│  (SDP Offer/Answer, ICE Candidates, Voice State)             │
└──────────────────────────────────────────────────────────────┘
       │                      │                      │
       │  RTCPeerConnection   │                      │
       ├──────────────────────┤                      │
       │                      ├──────────────────────┤
       │                      │                      │
       ▼                      ▼                      ▼
   [Audio Stream]        [Audio Stream]        [Audio Stream]
```

### 3.2 WebRTC 피어 연결 관리

**위치**: [src/features/workspace/hooks/custom/useWebRTC.ts](src/features/workspace/hooks/custom/useWebRTC.ts)

#### Glare Prevention (동시 Offer 방지)

```typescript
const setupPeerConnection = (participant: VoiceParticipant) => {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  });

  // 로컬 오디오 스트림 추가
  localStream?.getTracks().forEach(track => {
    pc.addTrack(track, localStream);
  });

  // 원격 스트림 수신
  pc.ontrack = (event) => {
    const [stream] = event.streams;
    setRemoteStreams(prev => ({
      ...prev,
      [participant.userId]: stream
    }));
  };

  // ICE Candidate 전송
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      sendMessage({
        type: 'ice',
        targetUserId: participant.userId,
        candidate: event.candidate
      });
    }
  };

  peerConnections.current.set(participant.userId, pc);

  // Glare 방지: userId 비교로 Offer 주체 결정
  const myUserIdNum = Number(myUserId);
  const participantUserIdNum = Number(participant.userId);

  if (myUserIdNum > participantUserIdNum) {
    sendOffer(participant.userId); // 내가 Offer 전송
  }
  // 그렇지 않으면 상대방의 Offer 대기
};
```

#### Signaling 메시지 처리

```typescript
const handleSignalingMessage = async (message: SignalingMessage) => {
  switch (message.type) {
    case 'offer':
      const pc = getOrCreatePeerConnection(message.userId);
      await pc.setRemoteDescription(new RTCSessionDescription(message.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      sendMessage({
        type: 'answer',
        targetUserId: message.userId,
        sdp: answer
      });
      break;

    case 'answer':
      const pc = peerConnections.current.get(message.userId);
      await pc?.setRemoteDescription(new RTCSessionDescription(message.sdp));
      break;

    case 'ice':
      const pc = peerConnections.current.get(message.userId);
      await pc?.addIceCandidate(new RTCIceCandidate(message.candidate));
      break;
  }
};
```

### 3.3 음성 인식 & GPT 통합

**위치**: [src/features/workspace/hooks/custom/useVoiceGpt.ts](src/features/workspace/hooks/custom/useVoiceGpt.ts)

#### Web Speech API 설정

```typescript
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

const recognition = new SpeechRecognition();
recognition.continuous = true;      // 연속 인식
recognition.interimResults = true;  // 중간 결과 포함
recognition.lang = 'ko-KR';         // 한국어

recognition.onresult = (event) => {
  for (let i = event.resultIndex; i < event.results.length; i++) {
    const transcript = event.results[i][0].transcript;
    const isFinal = event.results[i].isFinal;
    const confidence = event.results[i][0].confidence;

    console.log(`🎤 [${isFinal ? 'Final' : 'Interim'}] "${transcript}" (${confidence})`);

    if (isFinal && transcript.trim()) {
      // 서버로 전송 (GPT 키워드 추출)
      sendMessage({
        type: 'gpt-transcript',
        userId,
        userName,
        text: transcript,
        isFinal: true,
        timestamp: Date.now()
      });
    } else if (!isFinal) {
      // 임시 자막 표시
      setInterimTranscript(transcript);
    }
  }
};

// 자동 재시작 (연속 녹음)
recognition.onend = () => {
  if (isRecordingRef.current) {
    console.log('🔄 Speech recognition restarting...');
    recognition.start();
  }
};
```

#### 회의록 생성 워크플로우

```
1. 사용자들이 음성 채팅 중 발언
   ↓
2. Web Speech API가 실시간 텍스트 변환
   ↓
3. WebSocket으로 transcript 전송
   type: 'voice-transcript'
   ↓
4. 백엔드가 모든 transcript 누적
   ↓
5. 사용자가 "회의록 생성" 요청
   ↓
6. 백엔드가 GPT에게 요약 요청
   ↓
7. 스트리밍 응답 (chunk 단위)
   type: 'meeting-minutes-chunk'
   ↓
8. 완료 메시지
   type: 'meeting-minutes-done'
```

#### 스트리밍 응답 처리

```typescript
const [meetingMinutes, setMeetingMinutes] = useState('');

useEffect(() => {
  const handler = (message: WebSocketMessage) => {
    if (message.type === 'meeting-minutes-chunk') {
      setMeetingMinutes(prev => prev + message.content);
    }

    if (message.type === 'meeting-minutes-done') {
      console.log('✅ Meeting minutes completed');
      setIsGenerating(false);
    }
  };

  yjsClient.addJsonMessageHandler(handler);
  return () => { /* cleanup */ };
}, [yjsClient]);
```

### 3.4 발화 감지 (Speaking Detection)

**위치**: [src/features/workspace/hooks/custom/useVoiceState.ts](src/features/workspace/hooks/custom/useVoiceState.ts)

```typescript
const detectSpeaking = (stream: MediaStream) => {
  const audioContext = new AudioContext();
  const analyser = audioContext.createAnalyser();
  const source = audioContext.createMediaStreamSource(stream);

  source.connect(analyser);
  analyser.fftSize = 512;

  const dataArray = new Uint8Array(analyser.frequencyBinCount);

  const checkAudioLevel = () => {
    analyser.getByteFrequencyData(dataArray);

    // 평균 진폭 계산
    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

    // 임계값 기반 발화 판단
    const isSpeaking = average > SPEAKING_THRESHOLD;

    setIsSpeaking(isSpeaking);

    // Awareness로 상태 전파
    awareness.setLocalStateField('voiceState', {
      isMuted,
      isSpeaking
    });
  };

  const intervalId = setInterval(checkAudioLevel, SPEAKING_CHECK_INTERVAL);
  return () => {
    clearInterval(intervalId);
    audioContext.close();
  };
};
```

---

## 4. 권한 관리 시스템 (RBAC)

### 4.1 역할 정의

**위치**: [src/services/dto/workspace.dto.ts](src/services/dto/workspace.dto.ts)

```typescript
export type WorkspaceRole = "MAINTAINER" | "EDIT" | "VIEW";

export type WorkspaceVisibility = "PUBLIC" | "PRIVATE";

export interface WorkspaceDetailDTO {
  readonly id: number;
  readonly type: "TEAM" | "PERSONAL";
  readonly visibility: WorkspaceVisibility;
  readonly theme: WorkspaceTheme;
  readonly title: string;
  readonly thumbnail?: string;
  readonly createdAt: string;
  readonly isMember: boolean;
  readonly myRole: WorkspaceRole;  // 현재 사용자의 역할
  readonly token: string;          // 초대 토큰
  readonly memberCount: number;
}
```

### 4.2 권한 검증 유틸리티

**위치**: [src/shared/utils/permissionUtils.ts](src/shared/utils/permissionUtils.ts)

```typescript
export function canEditWorkspace(role?: WorkspaceRole): boolean {
  return role === 'MAINTAINER' || role === 'EDIT';
}

export function canViewWorkspace(role?: WorkspaceRole): boolean {
  return role === 'MAINTAINER' || role === 'EDIT' || role === 'VIEW';
}

export function canManageMembers(role?: WorkspaceRole): boolean {
  return role === 'MAINTAINER';
}

export function canChangeVisibility(role?: WorkspaceRole): boolean {
  return role === 'MAINTAINER';
}

export function canDeleteWorkspace(role?: WorkspaceRole): boolean {
  return role === 'MAINTAINER';
}
```

### 4.3 접근 제어 훅

**위치**: [src/features/workspace/hooks/query/useWorkspaceAccessQuery.ts](src/features/workspace/hooks/query/useWorkspaceAccessQuery.ts)

```typescript
export const useWorkspaceAccessQuery = (workspaceId: string) => {
  const navigate = useNavigate();

  const { data, isError, isLoading } = useQuery({
    queryKey: ["workspace", workspaceId],
    queryFn: () => getWorkspace(workspaceId),
    staleTime: 5 * 60 * 1000, // 5분
    retry: 1
  });

  const workspace = data?.data;

  // 접근 가능 여부 판단
  const hasAccess =
    workspace?.visibility === 'PUBLIC' ||
    canViewWorkspace(workspace?.myRole);

  useEffect(() => {
    if (isError || (workspace && !hasAccess)) {
      console.error('❌ Access denied to workspace:', workspaceId);
      navigate('/', { replace: true });
    }
  }, [isError, workspace, hasAccess, navigate]);

  return {
    workspace,
    isLoading,
    canEdit: canEditWorkspace(workspace?.myRole),
    canManage: canManageMembers(workspace?.myRole),
    hasAccess
  };
};
```

### 4.4 역할 변경 처리

#### API 호출 (MAINTAINER만 가능)

**위치**: [src/services/workspaceService.ts](src/services/workspaceService.ts)

```typescript
export const updateMemberRole = async (
  workspaceId: number,
  targetUserId: number,
  role: WorkspaceRole
): Promise<void> => {
  await apiClient.patch(
    `/workspace/${workspaceId}/member/${targetUserId}`,
    { role }
  );
};
```

#### WebSocket 알림 처리

```typescript
// 백엔드에서 브로드캐스트
{ type: "role-update", workspaceId: 123 }

// 클라이언트에서 수신 및 캐시 무효화
useEffect(() => {
  const handler = (message: WebSocketMessage) => {
    if (message.type === 'role-update') {
      queryClient.invalidateQueries({
        queryKey: ['workspace', workspaceId]
      });

      // UI 자동 갱신
      // - 권한이 낮아지면 버튼 비활성화
      // - 권한이 올라가면 버튼 활성화
    }
  };

  yjsClient.addJsonMessageHandler(handler);
}, [yjsClient, queryClient]);
```

---

## 5. UI 컴포넌트

### 5.1 원격 커서 시스템

**위치**:
- [src/features/workspace/components/PeerCursorProvider.tsx](src/features/workspace/components/PeerCursorProvider.tsx)
- [src/features/workspace/components/RemoteCursorsOverlay.tsx](src/features/workspace/components/RemoteCursorsOverlay.tsx)

#### 좌표 변환 (모델 → 화면)

```typescript
interface PeerCursor {
  id: number;
  userId: number;
  name: string;
  x: number;  // 모델 좌표
  y: number;  // 모델 좌표
  color: string;
  role: WorkspaceRole;
}

const RemoteCursorsOverlay = ({ peers, transform }) => {
  return (
    <>
      {peers.map(peer => {
        // D3 ZoomTransform 적용
        const screenX = peer.x * transform.k + transform.x;
        const screenY = peer.y * transform.k + transform.y;

        return (
          <div
            key={peer.id}
            style={{
              position: 'absolute',
              left: screenX,
              top: screenY,
              pointerEvents: 'none',
              transition: 'left 0.1s, top 0.1s' // 부드러운 이동
            }}
          >
            <svg width="24" height="24">
              <path
                d="M0 0 L0 16 L5 11 L8 18 L11 16 L8 9 L13 9 Z"
                fill={peer.color}
                stroke="white"
                strokeWidth="1"
              />
            </svg>
            <span style={{ color: peer.color }}>
              {peer.name} ({peer.role})
            </span>
          </div>
        );
      })}
    </>
  );
};
```

#### Awareness 통합

```typescript
const PeerCursorProvider = ({ children }) => {
  const { awareness } = useYjsCollaboration();
  const [peers, setPeers] = useState<PeerCursor[]>([]);
  const selfId = awareness.clientID;

  useEffect(() => {
    const updatePeers = () => {
      const next: PeerCursor[] = [];

      for (const [clientId, state] of awareness.getStates()) {
        if (clientId === selfId) continue;

        const cursor = state.cursor;
        if (!cursor) continue;

        next.push({
          id: clientId,
          userId: state.user?.userId,
          name: state.user?.name,
          x: cursor.x,
          y: cursor.y,
          color: cursor.color,
          role: state.user?.role
        });
      }

      setPeers(next);
    };

    awareness.on("change", updatePeers);
    return () => awareness.off("change", updatePeers);
  }, [awareness, selfId]);

  return (
    <PeerCursorContext.Provider value={{ peers }}>
      {children}
    </PeerCursorContext.Provider>
  );
};
```

### 5.2 채팅 시스템

**위치**: [src/features/workspace/components/ChatBubblesOverlay.tsx](src/features/workspace/components/ChatBubblesOverlay.tsx)

```typescript
interface ChatBubble {
  userId: number;
  name: string;
  text: string;
  x: number;  // 커서 위치
  y: number;
  color: string;
  timestamp: number;
}

const ChatBubblesOverlay = () => {
  const { awareness } = useYjsCollaboration();
  const [bubbles, setBubbles] = useState<ChatBubble[]>([]);

  useEffect(() => {
    const updateBubbles = () => {
      const next: ChatBubble[] = [];

      for (const [_, state] of awareness.getStates()) {
        const chat = state.chat;
        if (!chat || !chat.currentText) continue;

        next.push({
          userId: state.user.userId,
          name: state.user.name,
          text: chat.currentText,
          x: state.cursor?.x || 0,
          y: state.cursor?.y || 0,
          color: state.user.color,
          timestamp: chat.timestamp
        });
      }

      setBubbles(next);
    };

    awareness.on("change", updateBubbles);
    return () => awareness.off("change", updateBubbles);
  }, [awareness]);

  return (
    <>
      {bubbles.map(bubble => (
        <ChatBubble
          key={bubble.userId}
          text={bubble.text}
          author={bubble.name}
          x={bubble.x}
          y={bubble.y - 40} // 커서 위에 표시
          color={bubble.color}
        />
      ))}
    </>
  );
};
```

### 5.3 음성 채팅 UI

**위치**: [src/features/workspace/components/VoiceChat/VoiceChat.tsx](src/features/workspace/components/VoiceChat/VoiceChat.tsx)

```typescript
const VoiceChat = () => {
  const {
    isInVoice,
    isMuted,
    participants,
    joinVoice,
    leaveVoice,
    toggleMute
  } = useVoiceChat();

  const {
    isRecording: isGptRecording,
    startRecording,
    stopRecording
  } = useVoiceGpt();

  return (
    <div className="voice-chat-panel">
      {/* 참가자 목록 */}
      <div className="participants">
        {participants.map(p => (
          <VoiceAvatar
            key={p.userId}
            name={p.name}
            isSpeaking={p.isSpeaking}
            isMuted={p.isMuted}
            color={p.color}
          />
        ))}
      </div>

      {/* 컨트롤 */}
      <div className="controls">
        {!isInVoice ? (
          <button onClick={joinVoice}>음성 채팅 참여</button>
        ) : (
          <>
            <button onClick={toggleMute}>
              {isMuted ? '음소거 해제' : '음소거'}
            </button>

            <button onClick={leaveVoice}>나가기</button>

            <button
              onClick={isGptRecording ? stopRecording : startRecording}
              disabled={!canManage}
            >
              {isGptRecording ? 'GPT 중지' : 'GPT 시작'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
```

---

## 6. 주요 기술적 성과

### 6.1 무충돌 협업 (CRDT)

#### 문제 상황

```
시나리오: 두 사용자가 동시에 노드를 생성

User A (네트워크 지연 200ms):
  t=0    노드 "Alpha" 생성 → Y.Map.set("node-1", { title: "Alpha" })
  t=200  서버에 도달

User B (네트워크 지연 50ms):
  t=0    노드 "Beta" 생성 → Y.Map.set("node-2", { title: "Beta" })
  t=50   서버에 도달

기존 방식 (Last-Write-Wins):
  - 서버가 먼저 받은 것만 저장
  - User A가 나중에 동기화하면 "Alpha" 유실
```

#### Yjs 해결 방법

```typescript
// Yjs는 CRDT 알고리즘으로 자동 병합

User A:
  Y.Map { "node-1": { title: "Alpha" } }

User B:
  Y.Map { "node-2": { title: "Beta" } }

Yjs 동기화 후 (양쪽 모두):
  Y.Map {
    "node-1": { title: "Alpha" },
    "node-2": { title: "Beta" }
  }

✅ 두 작업 모두 보존됨 (충돌 없음)
```

### 6.2 임시 ID → 영구 ID 마이그레이션

#### 문제

```
1. 클라이언트가 노드 생성 시 MongoDB ObjectId를 알 수 없음
2. 임시 ID로 Y.Map에 추가해야 함
3. 서버가 DB에 저장 후 영구 ID 반환
4. 임시 ID를 영구 ID로 교체해야 함
```

#### 해결 방법

```typescript
// 1단계: 클라이언트가 임시 ID 생성
const tempId = `temp-${Date.now()}-${Math.random().toString(36)}`;
yMap.set(tempId, {
  nodeId: null, // 아직 DB에 없음
  title: "New Node",
  position: { x: 100, y: 100 }
});

// 2단계: 서버 처리
// - Yjs update 수신
// - DB에 노드 생성
// - nodeId와 MongoDB _id 할당
const dbNode = await NodeModel.create({
  title: "New Node",
  position: { x: 100, y: 100 }
});

// 3단계: 서버가 WebSocket으로 영구 ID 전송
send({
  type: "add-idea-done",
  nodes: [{
    id: dbNode._id.toString(),      // 영구 ID
    nodeId: dbNode.nodeId,           // 고유 번호
    title: "New Node",
    position: { x: 100, y: 100 }
  }]
});

// 4단계: 클라이언트가 임시 ID 교체
const isTempId = (id: string) => id.startsWith("temp-");

for (const [existingId, data] of yMap.entries()) {
  if (data.nodeId === newNode.nodeId && isTempId(existingId)) {
    yMap.delete(existingId);              // 임시 ID 삭제
    yMap.set(newNode.id, newNode);        // 영구 ID로 추가
    break;
  }
}
```

### 6.3 WebSocket 메시지 멀티플렉싱

#### 도전 과제

```
단일 WebSocket 연결로:
1. Yjs 바이너리 동기화 프로토콜 (CRDT 알고리즘)
2. 커스텀 JSON 메시지 (채팅, GPT, 음성 상태 등)

를 동시에 처리해야 함
```

#### 구현

```typescript
// y-websocket Provider의 WebSocket 래핑
const provider = new WebsocketProvider(wsUrl, roomName, doc);
const originalOnMessage = provider.ws.onmessage;

provider.ws.onmessage = (event: MessageEvent) => {
  // 타입 체크로 메시지 라우팅
  if (typeof event.data === "string") {
    // JSON 메시지 → 애플리케이션 로직
    try {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case "add-idea-done":
          // GPT 키워드 추천 처리
          break;
        case "role-update":
          // 권한 변경 처리
          break;
        case "voice-state":
          // 음성 상태 변경
          break;
      }

      // Yjs로 전달하지 않음
      return;
    } catch (err) {
      console.error("Invalid JSON:", err);
    }
  }

  // 바이너리 메시지 → Yjs 동기화 프로토콜
  originalOnMessage?.call(provider.ws, event);
};
```

### 6.4 D3 Force Layout 최적화

#### 알고리즘

```typescript
export function radialLayoutWithForces(
  nodes: MindmapNodeData[],
  edges: MindmapEdgeData[]
): Map<string, { x: number; y: number }> {

  // 1. 깊이 기반 반지름 계산
  const nodeDepths = new Map<string, number>();
  const calculateDepth = (nodeId: string): number => {
    const parent = edges.find(e => e.target === nodeId);
    if (!parent) return 0;
    return 1 + calculateDepth(parent.source);
  };

  // 2. 각 깊이별로 노드 그룹핑
  const depthGroups = new Map<number, string[]>();
  nodes.forEach(node => {
    const depth = calculateDepth(node.id);
    if (!depthGroups.has(depth)) {
      depthGroups.set(depth, []);
    }
    depthGroups.get(depth).push(node.id);
  });

  // 3. 각도 분배 (겹치지 않도록)
  const positions = new Map<string, { x: number; y: number }>();
  depthGroups.forEach((nodeIds, depth) => {
    const radius = BASE_RADIUS + depth * DEPTH_INCREMENT;
    const angleStep = (2 * Math.PI) / nodeIds.length;

    nodeIds.forEach((nodeId, index) => {
      const angle = index * angleStep;
      positions.set(nodeId, {
        x: CENTER_X + radius * Math.cos(angle),
        y: CENTER_Y + radius * Math.sin(angle)
      });
    });
  });

  // 4. D3 Force Simulation으로 미세 조정
  const simulation = d3.forceSimulation(nodes)
    .force("collision", d3.forceCollide().radius(NODE_RADIUS + PADDING))
    .force("charge", d3.forceManyBody().strength(-100))
    .force("x", d3.forceX(d => positions.get(d.id).x).strength(0.5))
    .force("y", d3.forceY(d => positions.get(d.id).y).strength(0.5))
    .stop();

  // 50회 시뮬레이션 (동기 실행)
  for (let i = 0; i < 50; i++) {
    simulation.tick();
  }

  // 5. 최종 좌표 반환
  nodes.forEach(node => {
    positions.set(node.id, { x: node.x, y: node.y });
  });

  return positions;
}
```

---

## 7. 보안 및 인증

### 7.1 인증 흐름

```
┌──────────────┐
│  User Login  │
│   (Google    │
│    OAuth)    │
└──────┬───────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Backend Issues JWT                 │
│  (Long-lived, stored in localStorage)│
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Client Requests WebSocket Token    │
│  GET /ws/token                      │
│  Authorization: Bearer <JWT>        │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Backend Issues Short-lived Token   │
│  (ST, valid for 15 minutes)         │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Client Connects to WebSocket       │
│  ws://server?token=<ST>             │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Backend Validates ST               │
│  - Check signature                  │
│  - Check expiration                 │
│  - Extract userId                   │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  Yjs Collaboration Begins           │
└─────────────────────────────────────┘
```

### 7.2 토큰 갱신

```typescript
const useYjsCollaboration = (wsUrl, workspaceId, options) => {
  const [client, setClient] = useState<YClient | null>(null);

  useEffect(() => {
    const connect = async () => {
      // 초기 토큰 발급
      const token = await fetchWebSocketToken();
      const yjsClient = createYClient(wsUrl, workspaceId, token);

      // 연결 상태 감시
      yjsClient.provider.on("status", async (event) => {
        if (event.status === "disconnected") {
          console.log('🔄 Reconnecting with new token...');

          // 새 토큰 발급
          const newToken = await fetchWebSocketToken();

          // Provider 재연결
          yjsClient.provider.params = { token: newToken };
          yjsClient.provider.connect();
        }
      });

      // 인증 에러 처리
      yjsClient.addJsonMessageHandler((msg) => {
        if (msg.type === "auth-error") {
          console.error('❌ Authentication failed');
          options.onAuthError?.();
        }
      });

      setClient(yjsClient);
    };

    if (options.enabled) {
      connect();
    }

    return () => {
      client?.provider.disconnect();
      client?.doc.destroy();
    };
  }, [options.enabled, workspaceId]);

  return client;
};
```

### 7.3 권한 검증 (서버측)

```
클라이언트 요청:
PATCH /workspace/123/member/456
{ role: "MAINTAINER" }
Authorization: Bearer <JWT>

백엔드 검증:
1. JWT 검증 (서명, 만료 시간)
2. userId 추출
3. DB 조회: workspace.members에서 userId의 역할 확인
4. canManageMembers(role) === true 인지 검증
5. 성공 시 역할 변경, 실패 시 403 Forbidden
```

---

## 8. 성능 최적화

### 8.1 증분 Y.Map 업데이트

```typescript
// ❌ 비효율적: 매번 전체 맵을 JSON 변환 (O(n))
yMap.observe(() => {
  const allNodes = yMap.toJSON();
  setNodes(Object.values(allNodes));
});

// ✅ 효율적: 변경된 키만 처리 (O(k))
yMap.observe((event, transaction) => {
  const updates = new Map<string, NodeData | null>();

  for (const key of event.keysChanged) {
    const action = event.changes?.keys?.get(key);

    if (action?.action === 'delete') {
      updates.set(key, null);
    } else {
      updates.set(key, yMap.get(key));
    }
  }

  setNodes(prev => {
    const next = new Map(prev);
    updates.forEach((value, key) => {
      if (value === null) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    });
    return next;
  });
});
```

**성능 개선**:
- 100개 노드 중 1개 변경: O(100) → O(1)
- 재렌더링 최소화

### 8.2 배치 트랜잭션

```typescript
// ❌ 나쁜 예: 개별 트랜잭션
nodes.forEach(node => {
  doc.transact(() => {
    yMap.set(node.id, node);
  }, "individual-update");
});
// 결과: 100개 노드 = 100번의 네트워크 전송

// ✅ 좋은 예: 단일 트랜잭션
doc.transact(() => {
  nodes.forEach(node => {
    yMap.set(node.id, node);
  });
}, "batch-update");
// 결과: 100개 노드 = 1번의 네트워크 전송
```

### 8.3 React 재렌더링 최소화

```typescript
// 얕은 비교로 불필요한 재렌더링 방지
const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });

const handleZoom = (newTransform) => {
  setTransform(prev => {
    // 값이 같으면 같은 객체 참조 반환 → 재렌더링 없음
    if (
      prev.x === newTransform.x &&
      prev.y === newTransform.y &&
      prev.k === newTransform.k
    ) {
      return prev;
    }
    return newTransform;
  });
};
```

### 8.4 디바운싱 (커서 위치 업데이트)

```typescript
import { debounce } from 'lodash';

const updateCursorPosition = debounce((x: number, y: number) => {
  awareness.setLocalStateField('cursor', { x, y, color });
}, 50); // 50ms마다 최대 1회 전송

canvas.addEventListener('mousemove', (e) => {
  const modelX = (e.clientX - transform.x) / transform.k;
  const modelY = (e.clientY - transform.y) / transform.k;

  updateCursorPosition(modelX, modelY);
});
```

**효과**:
- 초당 60회 mousemove 이벤트 → 초당 20회 WebSocket 전송
- 네트워크 대역폭 66% 감소

---

## 9. 에러 핸들링 및 복원력

### 9.1 네트워크 장애 대응

```typescript
// WebSocket 자동 재연결 (y-websocket 내장)
const provider = new WebsocketProvider(wsUrl, roomName, doc, {
  maxBackoffTime: 10000,  // 최대 10초 대기
  connect: true
});

// 커스텀 재연결 로직
provider.on('status', async (event) => {
  console.log('WebSocket status:', event.status);

  switch (event.status) {
    case 'connecting':
      setLoadingMessage('서버에 연결 중...');
      break;

    case 'connected':
      setLoadingMessage(null);
      console.log('✅ Connected to Yjs server');
      break;

    case 'disconnected':
      setLoadingMessage('연결이 끊어졌습니다. 재연결 시도 중...');

      // 토큰 재발급 후 재연결
      const newToken = await fetchWebSocketToken();
      provider.params = { token: newToken };
      provider.connect();
      break;
  }
});
```

### 9.2 중복 방지

```typescript
// 노드 중복 삽입 방지
const existingNodeIds = new Set(
  Array.from(yMap.values()).map(node => node.nodeId)
);

for (const newNode of incomingNodes) {
  if (existingNodeIds.has(newNode.nodeId)) {
    console.warn(`⚠️ Duplicate node detected: nodeId=${newNode.nodeId}`);
    continue; // 스킵
  }

  yMap.set(newNode.id, newNode);
  existingNodeIds.add(newNode.nodeId);
}
```

### 9.3 Graceful Degradation

```typescript
// WebSocket 실패 시 읽기 전용 모드
const [isReadOnly, setIsReadOnly] = useState(false);

useEffect(() => {
  if (!collab || !collab.provider.synced) {
    setIsReadOnly(true);

    // REST API로 데이터 로드 (읽기 전용)
    const data = await getWorkspaceMindmap(workspaceId);
    setNodes(data.nodes);
  } else {
    setIsReadOnly(false);
  }
}, [collab?.provider.synced]);

// UI에 반영
<button disabled={isReadOnly}>
  {isReadOnly ? '서버 연결 중...' : '노드 추가'}
</button>
```

---

## 10. 디버깅 및 관찰성

### 10.1 상세 로깅

```typescript
// Yjs 업데이트 로깅
doc.on('update', (update: Uint8Array, origin: any) => {
  console.log('🔥 Yjs Update Received');
  console.log('├─ Size:', update.length, 'bytes');
  console.log('├─ Origin:', origin);
  console.log('├─ From WebSocket:', origin === provider);

  const decoded = Y.decodeUpdate(update);
  console.log('└─ Struct count:', decoded.structs?.length);
});

// WebSocket 메시지 로깅
const originalSend = provider.ws.send;
provider.ws.send = function(data) {
  console.log('📤 WebSocket Send:', {
    type: typeof data === 'string' ? 'JSON' : 'Binary',
    size: data.length || data.byteLength,
    preview: typeof data === 'string' ? data.substring(0, 100) : '[binary]'
  });
  return originalSend.call(this, data);
};
```

### 10.2 개발자 도구 통합

```typescript
// 글로벌 객체로 노출 (브라우저 콘솔에서 접근)
useEffect(() => {
  if (collab?.map) {
    (globalThis as any).__DEBUG__ = {
      yMap: collab.map,
      yDoc: collab.doc,
      provider: collab.provider,
      awareness: collab.awareness,

      // 헬퍼 함수
      getNode: (id: string) => collab.map.get(id),
      getAllNodes: () => Array.from(collab.map.entries()),
      getMapSize: () => collab.map.size,
      inspectUpdate: (update: Uint8Array) => Y.decodeUpdate(update)
    };
  }
}, [collab]);

// 사용 예시 (브라우저 콘솔):
// > __DEBUG__.getAllNodes()
// > __DEBUG__.getNode("node-123")
// > __DEBUG__.yMap.toJSON()
```

### 10.3 Transaction Origin 검증

```typescript
const VALID_ORIGINS = [
  "mindmap-crud",
  "bootstrap",
  "local-update",
  "remote-sync"
] as const;

yMap.observe((event, transaction) => {
  const origin = transaction.origin;

  // 타입 검증
  if (typeof origin !== 'string') {
    console.error('❌ Invalid transaction origin (expected string):', {
      type: typeof origin,
      value: origin,
      stack: new Error().stack
    });
  }

  // 유효한 origin 체크
  if (!VALID_ORIGINS.includes(origin as any)) {
    console.warn('⚠️ Unknown transaction origin:', origin);
  }

  console.log(`📝 Y.Map Update [origin: ${origin}]`, {
    keysChanged: Array.from(event.keysChanged),
    mapSize: yMap.size
  });
});
```

---

## 11. 확장성 고려사항

### 11.1 현재 제약사항

1. **y-websocket 메모리 저장**:
   - 모든 Yjs 문서가 서버 메모리에 저장됨
   - 서버 재시작 시 데이터 유실 (DB 복원 필요)

2. **수평 확장 불가**:
   - WebSocket 연결이 특정 서버에 고정
   - 로드 밸런서 사용 시 sticky session 필요

3. **동시 접속 제한**:
   - 단일 서버 당 ~1000명 (메모리 제약)

### 11.2 프로덕션 권장 사항

#### Yjs 영속성 레이어

```typescript
// y-redis 또는 y-leveldb 사용
import { LeveldbPersistence } from 'y-leveldb';

const persistence = new LeveldbPersistence('./yjs-data');

wss.on('connection', (conn, req) => {
  const docName = req.url.split('?')[0];
  const doc = await persistence.getYDoc(docName);

  setupWSConnection(conn, doc, docName);

  // 변경사항 자동 저장
  doc.on('update', async (update) => {
    await persistence.storeUpdate(docName, update);
  });
});
```

#### 로드 밸런싱

```nginx
# Nginx 설정 (Sticky Session)
upstream websocket_backend {
  ip_hash;  # 클라이언트 IP 기반 라우팅
  server 192.168.1.10:3000;
  server 192.168.1.11:3000;
  server 192.168.1.12:3000;
}

server {
  location /ws {
    proxy_pass http://websocket_backend;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

#### 모니터링

```typescript
// Prometheus 메트릭
const register = new prometheus.Registry();

const wsConnections = new prometheus.Gauge({
  name: 'yjs_websocket_connections',
  help: 'Number of active WebSocket connections'
});

const docCount = new prometheus.Gauge({
  name: 'yjs_document_count',
  help: 'Number of Y.Doc instances in memory'
});

wss.on('connection', () => {
  wsConnections.inc();
});

wss.on('close', () => {
  wsConnections.dec();
});
```

---

## 12. 라우팅 및 페이지 구조

### 12.1 주요 라우트

**위치**: [src/app/AppRouter.tsx](src/app/AppRouter.tsx)

```typescript
const routes = [
  {
    path: "/",
    element: <HomePage />
  },
  {
    path: "/mindmap/:workspaceId",
    element: <MindmapPage />,
    // 권한 체크: useWorkspaceAccessQuery
  },
  {
    path: "/workspace/join",
    element: <WorkspaceJoinPage />,
    // Query param: ?token=xxx
  },
  {
    path: "/mypage",
    element: <MyPage />
  },
  {
    path: "/trend",
    element: <TrendPage />
  }
];
```

### 12.2 초대 링크 처리

**위치**: [src/features/workspace/pages/WorkspaceJoinPage.tsx](src/features/workspace/pages/WorkspaceJoinPage.tsx)

```typescript
const WorkspaceJoinPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const joinMutation = useMutation({
    mutationFn: () => joinWorkspaceByToken(token!),
    onSuccess: (response) => {
      const workspaceId = response.data.workspaceId;
      navigate(`/mindmap/${workspaceId}`);
    },
    onError: (error) => {
      if (error.response?.status === 409) {
        // 이미 멤버인 경우
        const workspaceId = error.response.data.workspaceId;
        navigate(`/mindmap/${workspaceId}`);
      } else {
        console.error('Failed to join workspace:', error);
        navigate('/');
      }
    }
  });

  useEffect(() => {
    if (token) {
      joinMutation.mutate();
    }
  }, [token]);

  return <div>워크스페이스 참가 중...</div>;
};
```

---

## 13. 테마 시스템

**위치**: [src/features/mindmap/hooks/useColorTheme.ts](src/features/mindmap/hooks/useColorTheme.ts)

```typescript
export type WorkspaceTheme =
  | "SUMMER_BEACH"
  | "CITRUS"
  | "RETRO"
  | "COOL"
  | "LAVENDER"
  | "PASTEL";

export const COLOR_THEMES: Record<WorkspaceTheme, ColorTheme> = {
  SUMMER_BEACH: {
    background: "#FFF9E3",
    node: ["#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3"],
    edge: "#A8DADC",
    text: "#1A1A1A"
  },
  CITRUS: {
    background: "#FFF8E7",
    node: ["#FF6F00", "#FFA726", "#FFCA28", "#66BB6A"],
    edge: "#FFB74D",
    text: "#212121"
  },
  // ...
};

export const useColorTheme = (workspaceId: string) => {
  const { workspace } = useWorkspaceAccessQuery(workspaceId);
  const theme = workspace?.theme || "SUMMER_BEACH";

  return COLOR_THEMES[theme];
};
```

---

## 결론

본 워크스페이스 구현은 다음과 같은 기술적 깊이를 보여줍니다:

### 핵심 성과

1. **실시간 협업**: Yjs CRDT를 활용한 무충돌 동시 편집
2. **WebRTC 통합**: 메시 네트워크 기반 음성 채팅
3. **AI 통합**: Web Speech API + GPT를 활용한 회의록 자동 생성
4. **확장 가능한 아키텍처**: 훅 기반 모듈화, 타입 안정성
5. **보안**: 이중 토큰 시스템 (JWT + ST)
6. **성능**: 증분 업데이트, 배치 트랜잭션, 디바운싱

### 기술적 차별점

- **CRDT 전문성**: Yjs 내부 동작 이해 및 최적화
- **WebRTC 구현**: Signaling, ICE, Glare 방지 등 실전 경험
- **타입 안정성**: 엔드투엔드 TypeScript, 엄격한 DTO 관리
- **복원력**: 네트워크 장애 대응, 중복 방지, Graceful Degradation
- **관찰성**: 상세 로깅, 개발자 도구 통합

### 프로덕션 준비도

- ✅ 권한 관리 (RBAC)
- ✅ 인증/인가 (OAuth + JWT + ST)
- ✅ 에러 핸들링
- ⚠️ 확장성 (단일 서버 제약, 개선 가능)
- ✅ 사용자 경험 (실시간 피드백, 부드러운 애니메이션)

---

**작성일**: 2025-01-25
**버전**: 1.0.0
**기술 스택**: React 19 + TypeScript 5 + Yjs 13 + WebRTC + D3.js 7
