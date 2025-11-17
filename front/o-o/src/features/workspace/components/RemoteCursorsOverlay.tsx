import { usePeerCursors } from "./PeerCursorProvider";
import { CursorIcon } from "@/shared/ui/CursorIcon";
import type { Transform } from "@/features/mindmap/types";

type RemoteCursorsOverlayProps = {
  transform: Transform;
  container: HTMLElement | null;
};

// Renders absolute-positioned peer cursors on top of the D3 canvas
export function RemoteCursorsOverlay({
  transform,
  container,
}: Readonly<RemoteCursorsOverlayProps>) {
  const { peers } = usePeerCursors();

  if (!container) {
    return null;
  }

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 60,
      }}
    >
      {peers.map((peer) => {
        // peer.x/y는 캔버스 절대 좌표 (model coordinates)
        // D3 transform을 사용하여 화면 좌표로 변환 (rendered position)
        const x = peer.x * transform.k + transform.x;
        const y = peer.y * transform.k + transform.y;

        // console.log(`🎯 [RemoteCursorsOverlay] Peer ${peer.id} model:(${peer.x}, ${peer.y}) → rendered:(${x}, ${y})`);

        return (
          <div
            key={peer.id}
            style={{
              position: "absolute",
              transform: `translate(${x}px, ${y}px)`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
            }}
          >
            <CursorIcon color={peer.color ?? "#3b82f6"} width={20} height={20} />
            {peer.name && (
              <div
                style={{
                  padding: "2px 6px",
                  borderRadius: 6,
                  fontSize: 11,
                  background: "rgba(0,0,0,0.6)",
                  color: "#fff",
                  whiteSpace: "nowrap",
                }}
              >
                {peer.name}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
