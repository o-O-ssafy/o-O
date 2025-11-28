import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import CustomTooltip from "@/shared/ui/CustomTooltip";

interface VoiceAvatarProps {
  avatar: string;
  name: string;
  isSpeaking?: boolean;
  voiceColor: string;
}

const VoiceAvatar: React.FC<VoiceAvatarProps> = ({
  avatar,
  name,
  isSpeaking = false,
  voiceColor,
}) => {
  const color = voiceColor;

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
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full animate-pulse"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 8px ${color}, 0 0 12px ${color}40`
            }}
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
