import { useState } from "react";
import { X } from "lucide-react";
import type { TreeNode } from "../utils/buildNodeTree";

type AnalyzeTreeNodeProps = {
  node: TreeNode;
  onRemove: (nodeId: string) => void;
  isLastChild?: boolean;
  ancestorLines?: boolean[];
};

/**
 * 분석 모드에서 선택된 노드를 계층 구조로 표시하는 컴포넌트
 * - 재귀적으로 자식 노드를 렌더링
 * - 파일 트리 스타일 (├─ └─ │)
 * - 펼치기/접기 기능
 */
export default function AnalyzeTreeNode({
  node,
  onRemove,
  isLastChild = false,
  ancestorLines = [],
}: AnalyzeTreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children.length > 0;

  // 트리 브랜치 문자 생성
  const buildPrefix = () => {
    const parts: string[] = [];

    // 상위 레벨들의 세로선 표시
    for (let i = 0; i < ancestorLines.length; i++) {
      if (ancestorLines[i]) {
        parts.push("│ "); // 세로선 + 공백 1개
      } else {
        parts.push("  "); // 공백 2개
      }
    }

    // 현재 레벨의 브랜치 문자
    if (node.depth > 0) {
      parts.push(isLastChild ? "└─" : "├─");
    }

    return parts.join("");
  };

  const prefix = buildPrefix();

  return (
    <div className="font-paperlogy">
      {/* 현재 노드 */}
      <div className="flex items-center gap-1 py-0.5 px-2 hover:bg-slate-100 rounded-md transition-colors group">
        {/* 트리 브랜치 문자 */}
        <span className="font-mono text-slate-400 text-xs leading-none whitespace-pre select-none">
          {prefix}
        </span>

        {/* 노드 텍스트 */}
        <span className="flex-1 truncate text-sm text-slate-700">
          {node.type === "image"
            ? "[이미지]"
            : node.type === "video"
              ? "[영상]"
              : node.keyword}
        </span>

        {/* 제거 버튼 */}
        <button
          type="button"
          onClick={() => onRemove(node.id)}
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="제거"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* 자식 노드들 (재귀 렌더링) */}
      {hasChildren && (
        <div>
          {node.children.map((child, index) => {
            const isLast = index === node.children.length - 1;
            const newAncestorLines = [...ancestorLines, !isLastChild];

            return (
              <AnalyzeTreeNode
                key={child.id}
                node={child}
                onRemove={onRemove}
                isLastChild={isLast}
                ancestorLines={newAncestorLines}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
