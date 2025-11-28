export const DEFAULT_WORKSPACE_ID = "poc-workspace";
export const NODES_YMAP_KEY = "mindmap:nodes";
export const DEFAULT_Y_WEBSOCKET_URL = "ws://localhost:8080";

export const buildMindmapRoomId = (workspaceId: string) =>
  `mindmap:${workspaceId}`;

export const buildMindmapShareLink = (
  workspaceId: string,
  origin?: string
) => {
  const resolvedOrigin =
    origin ?? (globalThis.window === undefined ? "" : globalThis.window.location.origin);
  return `${resolvedOrigin}/mindmap/${workspaceId}`;
};

// Resolves the websocket endpoint with env overrides + sane fallback
export const resolveMindmapWsUrl = () => {
  const endpoint =
    import.meta.env.VITE_WS_URL ??
    import.meta.env.VITE_Y_WEBSOCKET_URL ??
    DEFAULT_Y_WEBSOCKET_URL;
  if (!endpoint) {
    console.warn("[mindmap] Missing websocket URL, falling back to default.");
  }
  return endpoint;
};
