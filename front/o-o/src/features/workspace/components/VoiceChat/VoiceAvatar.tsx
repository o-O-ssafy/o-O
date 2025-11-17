import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import CustomTooltip from "@/shared/ui/CustomTooltip";

// 고정 색상 6가지
const VOICE_COLORS = [
  "#F24822", // 빨강
  "#57E257", // 초록
  "#FF824D", // 주황
  "#29DFFF", // 하늘
  "#FF50F0", // 분홍
  "#FFC60B", // 노랑
] as const;

interface VoiceAvatarProps {
  avatar: string;
  name: string;
  isSpeaking?: boolean;
  voiceColor?: string;
  colorIndex?: number;
  index: number;
}

const VoiceAvatar: React.FC<VoiceAvatarProps> = ({
  avatar,
  name,
  isSpeaking = false,
  voiceColor,
  colorIndex,
  index,
}) => {
  const finalColorIndex = colorIndex ?? index % VOICE_COLORS.length;
  const color = voiceColor ?? VOICE_COLORS[finalColorIndex];

  return (
    <CustomTooltip content={<span className="text-sm">{name}</span>}>
      <div className="relative">
        <Avatar className="w-14 h-14 bg-white shadow-md p-2">
          <AvatarImage src={avatar} alt={name} />
          <AvatarFallback className="bg-primary text-white">
            {name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {isSpeaking && (
          <div
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full"
            style={{ backgroundColor: color }}
          >
            <div
              className="absolute inset-0 rounded-full animate-ping"
              style={{ backgroundColor: color }}
            />
          </div>
        )}
      </div>
    </CustomTooltip>
  );
};

export default VoiceAvatar;
