import React from "react";
import ReactMarkdown from "react-markdown";
import CustomScrollbar from "@/shared/ui/CustomScrollbar";
import {
  MarkdownH1,
  MarkdownH2,
  MarkdownH3,
  MarkdownUL,
  MarkdownOL,
  MarkdownLI,
  MarkdownP,
  MarkdownStrong,
  MarkdownCode,
} from "@/shared/ui/MarkdownComponents";

interface DialogContentProps {
  content: string;
}

const DialogContent: React.FC<DialogContentProps> = ({ content }) => {
  return (
    <div className="flex-1 min-h-0 pl-8">
      <CustomScrollbar maxHeight="100%">
        <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none pr-2 sm:pr-3 lg:pr-4">
          <ReactMarkdown
            components={{
              h1: MarkdownH1,
              h2: MarkdownH2,
              h3: MarkdownH3,
              ul: MarkdownUL,
              ol: MarkdownOL,
              li: MarkdownLI,
              p: MarkdownP,
              strong: MarkdownStrong,
              code: MarkdownCode,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </CustomScrollbar>
    </div>
  );
};

export default DialogContent;
