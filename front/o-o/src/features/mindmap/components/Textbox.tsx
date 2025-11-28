import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import type { TextboxProps } from "../types";

export function Textbox({ onAddNode, disabled = false }: Readonly<TextboxProps>) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    if (!value.trim()) {
      return;
    }

    onAddNode({
      text: value.trim(),
    });

    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex flex-col gap-2">
        <div className="flex items-stretch gap-2">
          <Textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="떠오른 아이디어를 입력해주세요"
            className="flex-1 h-16 min-h-0 resize-none text-sm md:text-base"
          />
          <Button onClick={handleSubmit} className="h-16 px-5 shrink-0" disabled={disabled}>
            입력하기
          </Button>
        </div>
      </div>
    </div>
  )
}
