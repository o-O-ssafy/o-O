import { Button } from "@/components/ui/button";
import { RecordIdeaBody } from "./RecordIdeaBody";
import { RecordIdeaHeader } from "./RecordIdeaHeader";

interface KeywordNode {
  id: string;
  label: string;
  children?: KeywordNode[];
}

interface RecordIdeaDialogProps {
  keywords?: KeywordNode[];
  onDelete?: (nodeId: string) => void;
  onNodeClick?: (nodeId: string) => void;
  isRecording?: boolean;
  onToggleRecording?: () => void;
}

export function RecordIdeaDialog({ keywords, onDelete, onNodeClick, isRecording, onToggleRecording }: RecordIdeaDialogProps) {
  return (
    <div className="w-[33vh] h-[80vh] rounded-2xl shadow-lg flex flex-col">
      <div className="bg-[#ECECEC] py-3 px-4 rounded-t-2xl">
        <RecordIdeaHeader isRecording={isRecording} onToggleRecording={onToggleRecording} />
      </div>
      <div className="bg-[#F7F7F7] py-3 px-5 rounded-b-2xl h-full">
        <RecordIdeaBody keywords={keywords} onDelete={onDelete} onNodeClick={onNodeClick} />
      </div>
      <Button className="bg-primary mb-4 mx-4 shadow-md">입력하기</Button>
    </div>
  );
}
