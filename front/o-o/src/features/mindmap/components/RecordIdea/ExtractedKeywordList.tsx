import { X } from "lucide-react";

// 임시 데이터 타입 정의
interface KeywordNode {
  id: string;
  label: string;
  children?: KeywordNode[];
}

interface ExtractedKeywordListProps {
  keywords?: KeywordNode[];
  onDelete?: (nodeId: string) => void;
  onNodeClick?: (nodeId: string) => void;
}

// 재귀적으로 트리를 렌더링하는 컴포넌트
const KeywordTreeNode = ({
  node,
  level = 0,
  isLast = false,
  ancestorLines = [],
  onDelete,
  onNodeClick,
}: {
  node: KeywordNode;
  level?: number;
  isLast?: boolean;
  ancestorLines?: boolean[];
  onDelete: (nodeId: string) => void;
  onNodeClick?: (nodeId: string) => void;
}) => {
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div>
      <div className="flex items-center" style={{ minHeight: "28px" }}>
        {/* 각 depth에서 선 그리기 */}
        {ancestorLines.map((shouldDraw, depth) => (
          <div
            key={`${node.id}-ancestor-${depth}`}
            style={{
              width: "32px",
              height: "28px",
              position: "relative",
            }}
          >
            {shouldDraw && (
              <div
                style={{
                  position: "absolute",
                  left: "8px",
                  top: 0,
                  width: "1px",
                  height: "100%",
                  backgroundColor: "black",
                }}
              />
            )}
          </div>
        ))}

        {/* 현재 노드의 branch */}
        {level > 0 && (
          <div
            style={{
              width: "32px",
              height: "28px",
              position: "relative",
            }}
          >
            {/* 수직선 - 부모가 마지막이면 절반만 */}
            <div
              style={{
                position: "absolute",
                left: "8px",
                top: 0,
                width: "1px",
                height: isLast ? "14px" : "100%",
                backgroundColor: "black",
              }}
            />
            {/* 수평선 */}
            <div
              style={{
                position: "absolute",
                left: "8px",
                top: "13px",
                width: "24px",
                height: "1px",
                backgroundColor: "black",
              }}
            />
          </div>
        )}

        {/* 라벨과 삭제 버튼 */}
        <div className="flex items-center gap-2">
          <span
            className="text-sm text-black cursor-pointer hover:text-primary transition-colors"
            onClick={() => onNodeClick?.(node.id)}
          >
            {node.label}
          </span>
          <button
            onClick={() => onDelete(node.id)}
            className="flex items-center justify-center w-3 h-3 rounded-full bg-[#D16D6A] hover:bg-red-500 transition-colors"
          >
            <X className="w-2 h-2 text-white" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* 자식 노드 */}
      {hasChildren &&
        node.children!.map((child, idx) => {
          const lastChild = idx === node.children!.length - 1;

          const nextAncestorLines = [...ancestorLines];

          if (level > 0) {
            // ✅ 부모(depth - 1)에서 vertical line 그릴지 결정
            nextAncestorLines[level - 1] = !isLast;
          }

          return (
            <KeywordTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              isLast={lastChild}
              ancestorLines={nextAncestorLines}
              onDelete={onDelete}
              onNodeClick={onNodeClick}
            />
          );
        })}
    </div>
  );
};

export function ExtractedKeywordList({ keywords = [], onDelete, onNodeClick }: ExtractedKeywordListProps = {}) {
  const handleDelete = (nodeId: string) => {
    // 부모 컴포넌트에서 전달받은 onDelete가 있으면 사용
    if (onDelete) {
      onDelete(nodeId);
    }
  };

  return (
    <div className="space-y-1">
      {keywords.length > 0 ? (
        keywords.map((keyword) => (
          <KeywordTreeNode
            key={keyword.id}
            node={keyword}
            level={0}
            ancestorLines={[]}
            onDelete={handleDelete}
            onNodeClick={onNodeClick}
          />
        ))
      ) : (
        <p className="text-sm text-gray-400 text-center py-8">
          추출된 키워드가 없습니다.
        </p>
      )}
    </div>
  );
}
