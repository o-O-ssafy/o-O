import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb, Loader2 } from "lucide-react";
import ContentDialog from "../../../shared/ui/ContentDialog/ContentDialog";
import analyzePopoImage from "@/shared/assets/images/analyze_popo.webp";
import planningPopoImage from "@/shared/assets/images/planning_popo.webp";
import type { NodeData } from "../types";
import { buildNodeTree } from "../utils/buildNodeTree";
import AnalyzeTreeNode from "./AnalyzeTreeNode";
import { analyzeSelectedNodes, createPlan } from "@/services/mindmapService";
import { useToast } from "@/shared/ui/ToastProvider";

export default function AnalyzeSelectionPanel({
  selectedNodes,
  workspaceId,
  onAnalyze,
  onClear,
  onRemoveNode,
}: Readonly<{
  selectedNodes: NodeData[];
  workspaceId: string;
  onAnalyze: () => void;
  onClear: () => void;
  onRemoveNode: (nodeId: string) => void;
}>) {
  const { showToast } = useToast();
  const hasSelection = selectedNodes.length > 0;
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [apiAnalysisResult, setApiAnalysisResult] = useState<string | null>(
    null
  );
  const [apiPlan, setApiPlan] = useState<string | null>(null);

  // 선택된 노드들을 계층 구조로 변환
  const treeRoots = useMemo(() => {
    const roots = buildNodeTree(selectedNodes);
    return roots;
  }, [selectedNodes]);

  const dialogContent = useMemo(() => {
    const keywordLines = selectedNodes
      .map((node, index) => `${index + 1}. ${node.keyword}`)
      .join("\n");

    return apiAnalysisResult || `선택된 키워드:\n${keywordLines || "- (없음)"}`;
  }, [selectedNodes, apiAnalysisResult]);

  const planContent = useMemo(() => {
    const keywordList = selectedNodes
      .map((node, idx) => `${idx + 1}. ${node.keyword}`)
      .join("\n");
    return `### 1. 기획 배경\n- 알고리즘 학습의 어려움: 완전탐색, BFS 같은 탐색 알고리즘은 개념은 단순하지만 실제 동작 과정을 이해하기 어려움.\n- 서비스화의 필요성: 단순한 코드 구현이 아니라, 시각화와 AI 설명을 통해 직관적으로 이해할 수 있는 환경 제공 필요.\n- 응용 가능성: BFS는 경로 탐색, 추천 시스템, 네트워크 분석 등 실무 개발 현장에서 핵심적으로 쓰이고 있어 교육뿐만 아니라 다양한 서비스로 확장 가능.\n\n### 2. 주요 기능\n1) 알고리즘 시각화 학습\n   - 완전탐색 & BFS 진행 과정을 단계별 애니메이션으로 제공.\n   - 큐, 그래프, 트리 구조 변화를 실시간으로 확인 가능.\n2) AI 튜터 챗봇\n   - 사용자가 문제를 입력하면 AI가 풀이 과정을 BFS 방식으로 설명.\n   - 완전탐색과 BFS를 비교하며 효율성 차이를 알려줌.\n3) 실전 응용 모듈\n   - 예: 지도 내 최단 경로 탐색, 추천 시스템 미니 시뮬레이션.\n   - 단순 이론이 아닌 실제 개발 서비스 맥락에서 BFS를 활용 경험 제공.\n\n### 3. 기대 효과\n- 학습 곡선 완화: 추상적인 알고리즘 개념을 시각적·대화형으로 설명함으로써 학습 곡선 완화.\n- 개발 실무 연결: 알고리즘을 단순 교육이 아니라 실제 서비스 기획과 연결해 학습자 동기 부여.\n\n### 🔖 참고 키워드\n${keywordList || "- (선택된 노드 없음)"}`;
  }, [selectedNodes]);

  const handleAnalyzeClick = async () => {
    if (!hasSelection) return;

    setIsAnalyzing(true);

    try {
      // NodeData에서 nodeId 추출
      const nodeIds = selectedNodes
        .map((node) => node.nodeId)
        .filter((id): id is number => typeof id === "number");

      if (nodeIds.length === 0) {
        throw new Error("분석할 노드의 ID를 찾을 수 없습니다.");
      }

      // API 호출
      const result = await analyzeSelectedNodes(workspaceId, nodeIds);

      // 결과 저장
      setApiAnalysisResult(result.analysis);
      setAnalysisDialogOpen(true);

      // 성공 토스트
      showToast("분석이 완료되었습니다!", "success");

      // 부모 콜백 실행
      onAnalyze();
    } catch (error) {
      console.error("[AnalyzeSelectionPanel] 분석 실패:", error);
      showToast("분석에 실패했습니다. 다시 시도해주세요.", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handlePlanOpen = async () => {
    setAnalysisDialogOpen(false);

    try {
      // 분석 결과가 없으면 기획안을 생성할 수 없음
      if (!apiAnalysisResult) {
        showToast("분석 결과가 없습니다. 먼저 분석을 실행해주세요.", "error");
        return;
      }

      const result = await createPlan(
        workspaceId,
        apiAnalysisResult,
        "AI 기반 마인드맵 서비스 기획안"
      );
      setApiPlan(result.plan);
      setPlanDialogOpen(true);
    } catch (error) {
      console.error("[AnalyzeSelectionPanel] 기획안 생성 실패:", error);
      showToast("기획안 생성에 실패했습니다.", "error");
    }
  };

  const handlePlanCopy = () => {
    if (navigator?.clipboard) {
      const content = apiPlan || planContent;
      navigator.clipboard.writeText(content).catch(() => {
        console.warn("Failed to copy plan content");
      });
    }
  };

  return (
    <>
      <div className="w-72 rounded-2xl border border-slate-200 bg-white/95 shadow-2xl p-4 font-paperlogy">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-500" />
            <div>
              <p className="text-sm font-semibold text-slate-700">
                선택된 노드
              </p>
              <p className="text-xs text-slate-400">
                총 {selectedNodes.length}개
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClear}
            className="text-xs text-slate-400 hover:text-slate-600 disabled:opacity-50"
            disabled={!hasSelection}
          >
            초기화
          </button>
        </div>

        <div className="max-h-48 overflow-y-auto rounded-lg border border-dashed border-slate-200 bg-slate-50 p-2">
          {hasSelection ? (
            <div>
              {treeRoots.map((root, index) => (
                <AnalyzeTreeNode
                  key={root.id}
                  node={root}
                  onRemove={onRemoveNode}
                  isLastChild={index === treeRoots.length - 1}
                  ancestorLines={[]}
                />
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 p-3">
              아직 선택된 노드가 없습니다.
            </p>
          )}
        </div>

        <Button
          onClick={handleAnalyzeClick}
          className="mt-4 w-full"
          disabled={!hasSelection || isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              분석 중...
            </>
          ) : (
            "분석하기"
          )}
        </Button>
      </div>

      {analysisDialogOpen && (
        <ContentDialog
          characterImage={analyzePopoImage}
          title="AI 분석 내용"
          content={dialogContent}
          onClose={() => setAnalysisDialogOpen(false)}
          buttons={[
            {
              id: "back",
              text: "뒤로가기",
              onClick: () => setAnalysisDialogOpen(false),
              variant: "outline",
            },
            {
              id: "plan",
              text: "기획안 작성하기",
              onClick: handlePlanOpen,
            },
          ]}
        />
      )}

      {planDialogOpen && (
        <ContentDialog
          characterImage={planningPopoImage}
          title="AI 기반 마인드맵 서비스 기획안"
          content={apiPlan || planContent}
          onClose={() => setPlanDialogOpen(false)}
          buttons={[
            {
              id: "plan-back",
              text: "뒤로가기",
              onClick: () => setPlanDialogOpen(false),
              variant: "outline",
            },
            {
              id: "copy",
              text: "복사하기",
              onClick: handlePlanCopy,
            },
          ]}
        />
      )}
    </>
  );
}
