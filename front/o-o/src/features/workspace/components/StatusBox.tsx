import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, Lock, LockOpen, Headphones, ChevronRight } from "lucide-react";
import { useShareLink } from "../hooks/custom/useShareLink";
import { useWindowWidth } from "@/shared/hooks/useWindowWidth";
import { usePeerCursors } from "./PeerCursorProvider";
import { useWorkspaceAccessQuery } from "../hooks/query/useWorkspaceAccessQuery";
import { useAppSelector } from "@/store/hooks";
import { useUpdateMemberRoleMutation } from "../hooks/mutation/useUpdateMemberRoleMutation";
import { useUpdateWorkspaceVisibilityMutation } from "../hooks/mutation/useUpdateWorkspaceVisibilityMutation";
import type { WorkspaceRole, WorkspaceVisibility } from "@/services/dto/workspace.dto";
import { useMemo, useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getProfileImageUrl } from "@/shared/utils/imageMapper";
import type { YClient } from "../hooks/custom/yjsClient";

type StatusBoxProps = {
  onStartVoiceChat?: () => void;
  workspaceId: string;
  yclient?: YClient | null;
};

// UI Permission type
type Permission = "can View" | "can Edit";

// Collaborator type combining awareness and workspace data
interface Collaborator {
  id: string; // email or user identifier
  name: string;
  avatar?: string;
  role: "Maintainer" | "Editor" | "Viewer";
  permission?: Permission;
  email?: string;
}

// Convert backend role to UI display text
const roleToDisplay = (role: WorkspaceRole): "Maintainer" | "Editor" | "Viewer" => {
  switch (role) {
    case "MAINTAINER":
      return "Maintainer";
    case "EDIT":
      return "Editor";
    case "VIEW":
      return "Viewer";
  }
};

// Convert UI permission to backend role
const permissionToRole = (permission: Permission): WorkspaceRole => {
  return permission === "can Edit" ? "EDIT" : "VIEW";
};

// Convert backend role to UI permission
const roleToPermission = (role: WorkspaceRole): Permission => {
  return role === "EDIT" ? "can Edit" : "can View";
};

export default function StatusBox({ onStartVoiceChat, workspaceId, yclient }: Readonly<StatusBoxProps>) {
  // Fetch workspace data
  const { workspace } = useWorkspaceAccessQuery(workspaceId);
  const currentUser = useAppSelector((state) => state.user.user);
  const { onlinePeers } = usePeerCursors();
  const queryClient = useQueryClient();
  const { mutate: updateRole } = useUpdateMemberRoleMutation(yclient);
  const { mutate: updateVisibility } = useUpdateWorkspaceVisibilityMutation(yclient);

  // 로컬 상태로 멤버 역할 관리 (userId → WorkspaceRole)
  const [memberRoles, setMemberRoles] = useState<Map<number, WorkspaceRole>>(new Map());

  // Generate invite link using workspace token
  const inviteLink = useMemo(() => {
    if (!workspace?.token) return "";
    const baseUrl = window.location.origin; // e.g., https://www.o-o.io.kr
    return `${baseUrl}/workspace/join?token=${workspace.token}`;
  }, [workspace?.token]);

  // Custom hooks
  const { copied, handleCopyLink } = useShareLink(inviteLink);

  // Get access type from workspace
  const accessType = workspace?.visibility === "PRIVATE" ? "private" : "public";

  // Check if current user is maintainer
  const isMaintainer = workspace?.myRole === "MAINTAINER";

  // Handle visibility change
  const handleVisibilityChange = (value: string) => {
    if (!workspace || !isMaintainer) return;

    const newVisibility: WorkspaceVisibility = value === "private" ? "PRIVATE" : "PUBLIC";
    updateVisibility({
      workspaceId,
      visibility: newVisibility,
    });
  };

  // Handle permission change
  const handlePermissionChange = (userEmail: string, newPermission: Permission) => {
    if (!workspace || !isMaintainer) return;

    // Find the user's numeric userId from onlinePeers
    const targetPeer = onlinePeers.find((p) => p.email === userEmail);

    console.log("[StatusBox] Permission change requested:", {
      userEmail,
      newPermission,
      targetPeer,
      allPeers: onlinePeers.map(p => ({ email: p.email, userId: p.userId, name: p.name })),
    });

    if (!targetPeer?.userId) {
      console.error("[StatusBox] Cannot find userId for user:", userEmail);
      return;
    }

    // Convert Permission to WorkspaceRole
    const newRole: WorkspaceRole = permissionToRole(newPermission);

    console.log("[StatusBox] Updating role:", {
      workspaceId,
      targetUserId: targetPeer.userId,
      targetEmail: userEmail,
      newRole,
    });

    // 낙관적 업데이트: 즉시 로컬 상태 업데이트
    setMemberRoles((prev) => {
      const next = new Map(prev);
      next.set(targetPeer.userId!, newRole);
      return next;
    });

    updateRole(
      {
        workspaceId,
        targetUserId: targetPeer.userId,
        role: newRole,
      },
      {
        onSuccess: () => {
          // 성공 시 workspace query를 invalidate해서 상대방도 최신 role을 받도록 함
          queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
        },
      }
    );
  };

  // Combine current user and online peers into collaborators list
  const activeUsers = useMemo<Collaborator[]>(() => {
    console.log(`🔍 [StatusBox] activeUsers 계산 - onlinePeers: ${onlinePeers.length}명`);
    const users: Collaborator[] = [];

    // Add current user
    if (currentUser && workspace) {
      users.push({
        id: currentUser.email,
        name: currentUser.nickname,
        avatar: getProfileImageUrl(currentUser.profileImage),
        role: roleToDisplay(workspace.myRole),
        permission: workspace.myRole === "MAINTAINER" ? undefined : roleToPermission(workspace.myRole),
        email: currentUser.email,
      });
    }

    // Add online peers (excluding self)
    onlinePeers.forEach((peer) => {
      console.log(`  👤 peer 체크:`, { email: peer.email, userId: peer.userId, name: peer.name });
      console.log(`    조건: email=${!!peer.email}, notSelf=${peer.email !== currentUser?.email}`);
      // userId 체크 제거 - awareness 설정 타이밍에 따라 userId가 늦게 올 수 있음
      if (peer.email && peer.email !== currentUser?.email) {
        // 우선순위: 1) 로컬 상태 2) awareness에서 받은 role 3) 기본값 VIEW
        const peerRole = (peer.userId && memberRoles.get(peer.userId)) || peer.role || "VIEW";

        users.push({
          id: peer.email,
          name: peer.name || "Anonymous",
          avatar: getProfileImageUrl(peer.profileImage),
          role: roleToDisplay(peerRole),
          permission: roleToPermission(peerRole),
          email: peer.email,
        });
      }
    });

    console.log(`🔍 [StatusBox] 최종 activeUsers: ${users.length}명`, users.map(u => u.email));
    return users;
  }, [currentUser, workspace, onlinePeers, memberRoles]);

  const windowWidth = useWindowWidth();

  // 반응형 아바타 개수 제한
  const getVisibleUsers = () => {
    if (windowWidth < 640) return activeUsers.slice(0, 2); // mobile: 2개
    if (windowWidth < 1024) return activeUsers.slice(0, 3); // tablet: 3개
    return activeUsers; // desktop: 전체
  };

  const visibleUsers = getVisibleUsers();
  const remainingCount = activeUsers.length - visibleUsers.length;

  return (
    <div>
      <Popover>
        {/* 기본 상태: 프로필 이미지들 + 공유하기 버튼 */}
        <div className="flex items-center gap-1 md:gap-2 bg-white rounded-lg shadow-lg px-1.5 py-1 md:px-4 md:py-2">
          {/* 접속 중인 사용자 아바타 */}
          <div className="flex -space-x-2">
            {visibleUsers.map((user) => (
              <Avatar key={user.id} className="w-7 h-7 md:w-10 md:h-10 border-2 border-white">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>{user.name[0]}</AvatarFallback>
              </Avatar>
            ))}
            {remainingCount > 0 && (
              <div className="w-7 h-7 md:w-10 md:h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                <span className="text-[10px] md:text-xs font-semibold text-gray-600">+{remainingCount}</span>
              </div>
            )}
          </div>

          {/* 공유하기 버튼 */}
          <PopoverTrigger asChild>
            <Button className="text-xs md:text-sm px-2 py-1.5 md:px-4 md:py-2">
              공유하기
            </Button>
          </PopoverTrigger>
        </div>

        {/* Popover 컨텐츠 */}
        <PopoverContent className="w-[310px] p-6" align="end" alignOffset={-14} sideOffset={18} >
          <div className="space-y-4">
            {/* 사용자 목록 */}
            <div className="space-y-3">
              {activeUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 ml-5">
                    <p className="font-paperlogy text-sm">{user.name}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    {user.role === "Maintainer" ? (
                      <p className="text-xs text-gray-500 w-[110px]">{user.role}</p>
                    ) : isMaintainer && user.email !== currentUser?.email ? (
                      <Select
                        value={user.permission}
                        onValueChange={(value) => handlePermissionChange(user.id, value as Permission)}
                      >
                        <SelectTrigger className="w-[110px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="can View">can View</SelectItem>
                          <SelectItem value="can Edit">can Edit</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-xs text-gray-500 w-[110px]">{user.role}</p>
                    )}

                    {/* 본인에게만 음성 채팅 버튼 표시 */}
                    {onStartVoiceChat && user.email === currentUser?.email && (
                      <button
                        type="button"
                        onClick={onStartVoiceChat}
                        className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Voice chat 열기"
                      >
                        <Headphones className="w-4 h-4 text-gray-500" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 구분선 */}
            <div className="border-t pt-4" />

            {/* 초대 링크 섹션 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-primary font-paperlogy font-extrabold">Invite Link</Label>
                {copied && (
                  <p className="text-xs font-paperlogy text-primary">링크가 복사되었습니다!</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  value={inviteLink}
                  readOnly
                  className="flex-1 text-sm bg-gray-50"
                  placeholder="워크스페이스 정보를 불러오는 중..."
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={handleCopyLink}
                  className="shrink-0"
                  disabled={!inviteLink}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* 권한 설정 */}
            {isMaintainer ? (
              <Select value={accessType} onValueChange={handleVisibilityChange}>
                <SelectTrigger className="w-full h-10 justify-between font-paperlogy [&>svg]:hidden">
                  <div className="flex items-center">
                    {accessType === "private" ? (
                      <Lock className="w-4 h-4 mr-2" />
                    ) : (
                      <LockOpen className="w-4 h-4 mr-2" />
                    )}
                    <SelectValue />
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private" className="font-paperlogy">
                    Only those invited people
                  </SelectItem>
                  <SelectItem value="public" className="font-paperlogy">
                    Open to everyone
                  </SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="w-full h-10 flex items-center px-3 border rounded-md bg-gray-50">
                <div className="flex items-center font-paperlogy text-sm">
                  {accessType === "private" ? (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      <span>Only those invited people</span>
                    </>
                  ) : (
                    <>
                      <LockOpen className="w-4 h-4 mr-2" />
                      <span>Open to everyone</span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
