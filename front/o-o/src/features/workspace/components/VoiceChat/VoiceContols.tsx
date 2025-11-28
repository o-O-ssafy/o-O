import React, { useMemo } from "react";
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
import { Copy, Lock, LockOpen, ChevronRight } from "lucide-react";
import CustomTooltip from "../../../../shared/ui/CustomTooltip";
import MicOffOutlinedIcon from "@mui/icons-material/MicOffOutlined";
import MicIcon from "@mui/icons-material/Mic";
import PhoneDisabledIcon from "@mui/icons-material/PhoneDisabled";
import PhoneEnabledIcon from "@mui/icons-material/PhoneEnabled";
import organizePopo from "@/shared/assets/images/organize_popo.webp";
import { useShareLink } from "../../hooks/custom/useShareLink";
import { useWorkspaceAccessQuery } from "../../hooks/query/useWorkspaceAccessQuery";
import { useAppSelector } from "@/store/hooks";
import { useUpdateMemberRoleMutation } from "../../hooks/mutation/useUpdateMemberRoleMutation";
import { useUpdateWorkspaceVisibilityMutation } from "../../hooks/mutation/useUpdateWorkspaceVisibilityMutation";
import type { WorkspaceRole, WorkspaceVisibility } from "@/services/dto/workspace.dto";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getProfileImageUrl } from "@/shared/utils/imageMapper";
import type { YClient } from "../../hooks/custom/yjsClient";

type Permission = "can View" | "can Edit";

interface Collaborator {
  id: string;
  name: string;
  avatar?: string;
  role: "Maintainer" | "Editor" | "Viewer";
  permission?: Permission;
  email?: string;
}

interface VoiceControlsProps {
  isMuted: boolean;
  isCallActive: boolean;
  isGptRecording?: boolean;
  showOrganize?: boolean;
  onMicToggle: () => void;
  onCallToggle: () => void;
  onOrganize?: () => void;
  workspaceId: string;
  yclient?: YClient | null;
  peers: Array<{
    email?: string;
    name?: string;
    userId?: number;
    role?: WorkspaceRole;
    profileImage?: string;
  }>;
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

const VoiceControls: React.FC<VoiceControlsProps> = ({
  isMuted,
  isCallActive,
  isGptRecording = false,
  showOrganize = true,
  onMicToggle,
  onCallToggle,
  onOrganize,
  workspaceId,
  yclient,
  peers,
}) => {
  // Fetch workspace data
  const { workspace } = useWorkspaceAccessQuery(workspaceId);
  const currentUser = useAppSelector((state) => state.user.user);
  const queryClient = useQueryClient();
  const { mutate: updateRole } = useUpdateMemberRoleMutation(yclient);
  const { mutate: updateVisibility } = useUpdateWorkspaceVisibilityMutation();

  // 로컬 상태로 멤버 역할 관리
  const [memberRoles, setMemberRoles] = useState<Map<number, WorkspaceRole>>(new Map());

  // Generate invite link using workspace token
  const inviteLink = useMemo(() => {
    if (!workspace?.token) return "";
    const baseUrl = window.location.origin;
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

    const targetPeer = peers.find((p) => p.email === userEmail);

    if (!targetPeer?.userId) {
      console.error("[VoiceControls] Cannot find userId for user:", userEmail);
      return;
    }

    const newRole: WorkspaceRole = permissionToRole(newPermission);

    // 낙관적 업데이트
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
          queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] });
        },
      }
    );
  };

  // Combine current user and online peers into collaborators list
  const activeUsers = useMemo<Collaborator[]>(() => {
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
    peers.forEach((peer) => {
      if (peer.email && peer.email !== currentUser?.email && peer.userId) {
        const peerRole = memberRoles.get(peer.userId) || peer.role || "VIEW";

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

    return users;
  }, [currentUser, workspace, peers, memberRoles]);

  return (
    <div className="flex items-center gap-2">
      {/* Mic Toggle */}
      <button
        onClick={onMicToggle}
        className={`
          w-12 h-12 rounded-full flex items-center justify-center
          transition-all duration-200 shadow-md
          ${
            isMuted
              ? "bg-danger hover:bg-danger/90 text-white"
              : "bg-white hover:bg-gray-100 text-semi-black"
          }
        `}
        aria-label={isMuted ? "마이크 켜기" : "마이크 끄기"}
      >
        {isMuted ? (
          <MicOffOutlinedIcon className="text-xl" />
        ) : (
          <MicIcon className="text-xl" />
        )}
      </button>

      {/* Call Toggle */}
      <button
        onClick={onCallToggle}
        className={`
          w-12 h-12 rounded-full flex items-center justify-center
          transition-all duration-200 shadow-md
          ${
            isCallActive
              ? "bg-white hover:bg-gray-100 text-semi-black"
              : "bg-danger hover:bg-danger/90 text-white"
          }
        `}
        aria-label={isCallActive ? "통화 종료" : "통화 시작"}
      >
        {isCallActive ? (
          <PhoneEnabledIcon className="text-xl" />
        ) : (
          <PhoneDisabledIcon className="text-xl" />
        )}
      </button>

      {/* Organize Button with Tooltip (GPT Toggle) */}
      {showOrganize && (
        <CustomTooltip
          content={
            isGptRecording
              ? 'GPT 녹음 중...'
              : <>아이디어를 놓치지 않게{'\n'}<span className="font-bold">Popo</span>가 정리해드려요.</>
          }
        >
          <button
            onClick={onOrganize}
            className={`
              w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-all duration-200
              ${isGptRecording
                ? 'bg-danger/10 hover:bg-danger/20 ring-2 ring-danger animate-pulse'
                : 'bg-white hover:bg-gray-100'
              }
            `}
            aria-label={isGptRecording ? "녹음 중지" : "녹음 시작"}
          >
            <img
              src={organizePopo}
              alt="organize"
              className="w-10 h-10 object-contain"
            />
          </button>
        </CustomTooltip>
      )}

      {/* Share Button with Popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className="bg-primary hover:bg-primary/90 text-white px-4 py-3 h-12 text-base font-semibold shadow-md ml-2"
            style={{ borderRadius: "13px" }}
          >
            공유하기
          </Button>
        </PopoverTrigger>

        {/* Popover Content */}
        <PopoverContent className="w-[310px] p-6" align="end" alignOffset={-14} sideOffset={18}>
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
};

export default VoiceControls;
