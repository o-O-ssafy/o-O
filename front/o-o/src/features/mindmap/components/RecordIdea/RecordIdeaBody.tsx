import { ExtractedKeywordList } from "./ExtractedKeywordList";

interface KeywordNode {
  id: string;
  label: string;
  children?: KeywordNode[];
}

interface RecordIdeaBodyProps {
  keywords?: KeywordNode[];
  onDelete?: (nodeId: string) => void;
  onNodeClick?: (nodeId: string) => void;
  canDelete?: boolean;
}

export function RecordIdeaBody({ keywords, onDelete, onNodeClick, canDelete }: RecordIdeaBodyProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-primary text-lg font-bold">추출된 키워드</p>
      <div className="text-[11px]">
        <p>키워드를 클릭하여</p>
        <p>해당 노드의 위치를 확인할 수 있습니다.</p>
      </div>
      <ExtractedKeywordList keywords={keywords} onDelete={onDelete} onNodeClick={onNodeClick} canDelete={canDelete} />
    </div>
  );
}
