import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Awareness } from "y-protocols/awareness";
import type { WorkspaceRole } from "@/services/dto/workspace.dto";

type PeerCursor = {
  id: number;
  x: number;
  y: number;
  color?: string;
  userId?: number;
  name?: string;
  email?: string;
  profileImage?: string;
  role?: WorkspaceRole;
};

type OnlinePeer = {
  id: number;
  userId?: number;
  name?: string;
  email?: string;
  profileImage?: string;
  color?: string;
  role?: WorkspaceRole;
};

type PeerCursorContextValue = {
  peers: PeerCursor[]; // cursor 있는 사용자만 (커서 오버레이용)
  onlinePeers: OnlinePeer[]; // 모든 온라인 사용자 (StatusBox용)
};

const PeerCursorContext = createContext<PeerCursorContextValue>({ peers: [], onlinePeers: [] });

// Shared hook so canvases/overlays can read remote cursor metadata
export const usePeerCursors = () => useContext(PeerCursorContext);

type PeerCursorProviderProps = {
  awareness?: Awareness;
  currentUserEmail?: string;
  children: React.ReactNode;
};

// Keeps the awareness map mirrored into React state for rendering overlays
export function PeerCursorProvider({
  awareness,
  currentUserEmail,
  children,
}: Readonly<PeerCursorProviderProps>) {
  const [peers, setPeers] = useState<PeerCursor[]>([]);
  const [onlinePeers, setOnlinePeers] = useState<OnlinePeer[]>([]);

  useEffect(() => {
    if (!awareness) {
      setPeers([]);
      setOnlinePeers([]);
      return;
    }

    const updatePeers = () => {
      const cursorMap = new Map<string, PeerCursor>(); // 이메일 기준 중복 제거
      const onlineMap = new Map<string, OnlinePeer>(); // 이메일 기준 중복 제거
      const selfId = awareness.clientID;

      const allStates = awareness.getStates();
      console.log(`🔍 [PeerCursorProvider] updatePeers 호출됨 - 전체 클라이언트 수: ${allStates.size}, 내 ID: ${selfId}`);

      for (const [id, state] of allStates) {
        console.log(`  👤 Client ${id}:`, {
          user: state?.user,
          hasCursor: !!state?.cursor,
        });

        if (id === selfId) {
          console.log(`    ↳ 내 자신이므로 스킵`);
          continue;
        }

        const stateObj = state as {
          cursor?: { x: number; y: number; color?: string; timestamp?: number };
          user?: {
            userId?: number;
            name?: string;
            email?: string;
            profileImage?: string;
            color?: string;
            role?: WorkspaceRole;
          };
        };

        const cursor = stateObj.cursor;
        const userState = stateObj.user;
        const email = userState?.email;

        // 현재 유저의 이메일과 같으면 스킵 (새로고침 시 이전 세션 잔상 방지)
        if (email && currentUserEmail && email === currentUserEmail) {
          continue;
        }

        // 온라인 사용자 목록: user 정보가 있으면 추가 (이메일로 중복 제거)
        console.log(`    ↳ 조건 체크: userState=${!!userState}, email="${email}", currentUserEmail="${currentUserEmail}"`);
        if (userState && email) {
          console.log(`    ✅ onlineMap에 추가: ${email}`);
          onlineMap.set(email, {
            id,
            userId: userState.userId,
            name: userState.name,
            email: userState.email,
            profileImage: userState.profileImage,
            color: userState.color,
            role: userState.role,
          });
        }

        // 커서 오버레이: cursor 정보가 있어야만 추가 (이메일로 중복 제거)
        if (cursor && email) {
          cursorMap.set(email, {
            id,
            x: cursor.x,
            y: cursor.y,
            color: cursor.color,
            userId: userState?.userId,
            name: userState?.name,
            email: userState?.email,
            profileImage: userState?.profileImage,
            role: userState?.role,
          });
        }
      }

      const peersArray = Array.from(cursorMap.values());
      const onlinePeersArray = Array.from(onlineMap.values());
      console.log(`🔍 [PeerCursorProvider] 최종 결과 - peers: ${peersArray.length}명, onlinePeers: ${onlinePeersArray.length}명`);
      console.log(`    onlinePeers:`, onlinePeersArray.map(p => ({ email: p.email, name: p.name, userId: p.userId })));
      setPeers(peersArray);
      setOnlinePeers(onlinePeersArray);
    };

    // "change" 이벤트: 다른 클라이언트의 상태가 추가/업데이트/제거 되었을 때
    awareness.on("change", updatePeers);
    // "update" 이벤트: awareness 프로토콜의 상태 동기화가 일어날 때 (새 피어가 자신의 상태를 브로드캐스트할 때)
    awareness.on("update", updatePeers);
    updatePeers();

    return () => {
      awareness.off("change", updatePeers);
      awareness.off("update", updatePeers);
    };
  }, [awareness, currentUserEmail]);

  const value = useMemo(() => ({ peers, onlinePeers }), [peers, onlinePeers]);

  return (
    <PeerCursorContext.Provider value={value}>
      {children}
    </PeerCursorContext.Provider>
  );
}
