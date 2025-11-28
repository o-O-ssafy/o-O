import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

type NodeEditFormProps = {
  value: string;
  memo: string;
  onChange: (value: string) => void;
  onMemoChange: (memo: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * NodeEditForm
 * - 노드 텍스트 및 메모 편집 UI
 * - Input과 Textarea, 확인/취소 버튼
 */
export default function NodeEditForm({
  value,
  memo,
  onChange,
  onMemoChange,
  onConfirm,
  onCancel,
}: Readonly<NodeEditFormProps>) {
  return (
    <div className="flex flex-col items-center gap-2" style={{ pointerEvents: "auto" }}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="키워드"
        className="w-36 h-10 text-sm text-center bg-white"
        style={{ pointerEvents: "auto" }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onConfirm();
          }
          if (e.key === "Escape") onCancel();
          e.stopPropagation();
        }}
        autoFocus
      />
      <Textarea
        value={memo}
        onChange={(e) => onMemoChange(e.target.value)}
        placeholder="메모 (선택사항)"
        className="w-36 h-20 text-xs bg-white resize-none"
        style={{ pointerEvents: "auto" }}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.ctrlKey) {
            e.preventDefault();
            onConfirm();
          }
          if (e.key === "Escape") onCancel();
          e.stopPropagation();
        }}
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onConfirm();
          }}
          className="bg-green-500 hover:bg-green-600 h-8 px-3"
          style={{ pointerEvents: "auto" }}
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}
          className="h-8 px-3"
          style={{ pointerEvents: "auto" }}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
