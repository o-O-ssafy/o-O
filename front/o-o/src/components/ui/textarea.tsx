import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      {...props}
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground",
        // focus & ring color를 primary로 변경
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary",
        // 비활성화 스타일 유지
        "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
