import React from "react";
import ConfirmDialog from "@/shared/ui/ConfirmDialog";
import ContentDialog from "@/shared/ui/ContentDialog/ContentDialog";
import popoImage from "@/shared/assets/images/organize_popo.webp";

// ConfirmEndVoiceChatDialog: 음성 채팅 종료 시 표시되는 확인 다이얼로그
interface ConfirmEndVoiceChatDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onViewMindmap: () => void;
  onViewMeetingMinutes: () => void;
}

export const ConfirmEndVoiceChatDialog: React.FC<
  ConfirmEndVoiceChatDialogProps
> = ({ isOpen, onClose, onViewMindmap, onViewMeetingMinutes }) => {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      characterImage={popoImage}
      title="회의가 종료되었습니다."
      description={`회의 내용은 Popo가 정리해드렸어요.\n생성된 회의록을 확인하시겠습니까?`}
      buttons={[
        {
          id: "view-mindmap",
          text: "마인드맵 보기",
          onClick: onViewMindmap,
          variant: "outline",
        },
        {
          id: "view-meeting-minutes",
          text: "회의록 확인하기",
          onClick: onViewMeetingMinutes,
          variant: "default",
        },
      ]}
    />
  );
};

// MeetingMinutesContentDialog: 회의록 내용을 표시하는 다이얼로그
interface MeetingMinutesContentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  isGenerating: boolean;
  error?: string | null;
  workspaceTitle?: string;
}

export const MeetingMinutesContentDialog: React.FC<
  MeetingMinutesContentDialogProps
> = ({ isOpen, onClose, content, isGenerating, error, workspaceTitle }) => {
  // Copy content to clipboard
  const handleCopy = () => {
    if (content) {
      navigator.clipboard
        .writeText(content)
        .then(() => {
          alert("회의록이 클립보드에 복사되었습니다!");
        })
        .catch((err) => {
          console.error("[MeetingMinutesDialog] Failed to copy:", err);
          alert("복사에 실패했습니다.");
        });
    }
  };

  // Determine display content
  let displayContent = content;

  if (error) {
    displayContent = `# ❌ 오류 발생\n\n${error}`;
  } else if (isGenerating && !content) {
    displayContent = "# ⏳ 회의록 생성 중...\n\n잠시만 기다려주세요.";
  } else if (!content && !isGenerating) {
    displayContent = "# 📝 회의록\n\n회의록이 아직 생성되지 않았습니다.";
  }

  return (
    <ContentDialog
      isOpen={isOpen}
      onClose={onClose}
      characterImage={popoImage}
      title={workspaceTitle ? `${workspaceTitle} 회의` : "회의록"}
      content={displayContent}
      buttons={[
        {
          id: "copy",
          text: "복사하기",
          onClick: handleCopy,
          variant: "outline",
        },
        {
          id: "close",
          text: "닫기",
          onClick: onClose,
          variant: "default",
        },
      ]}
    />
  );
};
