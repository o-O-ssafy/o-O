/**
 * WebSocket notification message for role changes
 *
 * Flow:
 * 1. MAINTAINER calls PATCH /workspace/{workspaceId}/member/{targetUserId}
 * 2. Frontend sends {type: 'role-changed', targetUserId} via WebSocket
 * 3. Backend broadcasts {type: 'role-update'} to target user
 * 4. Target user receives message and refetches workspace data via REST API
 * 5. UI updates automatically based on new role from REST API
 *
 * Note: WebSocket only carries minimal notification info.
 *       Actual role data comes from REST API (DB-based, authoritative).
 */
export interface RoleUpdateNotification {
  type: "role-update";
  // No other fields needed - this is just a notification to refetch data
}

/**
 * Notification to let peers know the initial-mindmap generation has finished
 * This tells the client to refetch nodes from REST and seed the Y.Map
 */
export interface InitialCreateDoneNotification {
  type: "initial-create-done";
}

/**
 * WebSocket notification message for visibility changes
 *
 * Flow:
 * 1. MAINTAINER calls PATCH /workspace/{workspaceId}/visibility
 * 2. Frontend sends {type: 'visibility-changed'} via WebSocket
 * 3. Backend broadcasts {type: 'visibility-update'} to all users in the room
 * 4. Users receive message and refetch workspace data via REST API
 * 5. UI updates automatically based on new visibility from REST API
 */
export interface VisibilityUpdateNotification {
  type: "visibility-update";
}

/**
 * Union type for all workspace-related WebSocket notifications
 * Extend this as more notification types are added
 */
export type WorkspaceNotification =
  | RoleUpdateNotification
  | InitialCreateDoneNotification
  | VisibilityUpdateNotification;

/**
 * Type guard to check if a message is a RoleUpdateNotification
 */
export function isRoleUpdateNotification(
  message: unknown
): message is RoleUpdateNotification {
  if (typeof message !== "object" || message === null) {
    return false;
  }

  const msg = message as Record<string, unknown>;

  // Only check for type field - this is a minimal notification
  return msg.type === "role-update";
}

/**
 * Type guard for initial create completion notification
 */
export function isInitialCreateDoneNotification(
  message: unknown
): message is InitialCreateDoneNotification {
  if (typeof message !== "object" || message === null) {
    return false;
  }

  const msg = message as Record<string, unknown>;
  return msg.type === "initial-create-done";
}

/**
 * Type guard to check if a message is a VisibilityUpdateNotification
 */
export function isVisibilityUpdateNotification(
  message: unknown
): message is VisibilityUpdateNotification {
  if (typeof message !== "object" || message === null) {
    return false;
  }

  const msg = message as Record<string, unknown>;
  return msg.type === "visibility-update";
}
