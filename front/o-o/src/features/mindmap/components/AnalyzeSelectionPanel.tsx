import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";
import ContentDialog from "../../../shared/ui/ContentDialog/ContentDialog";
import analyzePopoImage from "@/shared/assets/images/analyze_popo.webp";
import planningPopoImage from "@/shared/assets/images/planning_popo.webp";
import type { NodeData } from "../types";
import { buildNodeTree } from "../utils/buildNodeTree";
import AnalyzeTreeNode from "./AnalyzeTreeNode";

export default function AnalyzeSelectionPanel({
  selectedNodes,
  onAnalyze,
  onClear,
  onRemoveNode,
}: Readonly<{
  selectedNodes: NodeData[];
  onAnalyze: () => void;
  onClear: () => void;
  onRemoveNode: (nodeId: string) => void;
}>) {
  const hasSelection = selectedNodes.length > 0;
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);

  // 선택된 노드들을 계층 구조로 변환
  const treeRoots = useMemo(() => {
    const roots = buildNodeTree(selectedNodes);
    return roots;
  }, [selectedNodes]);

  const dialogContent = useMemo(() => {
    const keywordLines = selectedNodes
      .map((node, index) => `${index + 1}. ${node.keyword}`)
      .join("\n");

    return `## AI 분석 내용\n말씀하신 키워드를 바탕으로 정리해드릴게요.\n\n### 🌱 내 생각 정리\n- 알고리즘은 문제 해결의 설계도예요. 그중 완전탐색은 가능한 모든 경우를 다 확인하는 방식이라 정답은 확실하지만 시간이 오래 걸릴 수 있죠.\n- 그래서 BFS 같은 효율적인 탐색 방법이 필요해요. 단계별로 차근차근 넓혀가며 답을 찾는 구조라, 현업에서도 핵심 도구로 쓰입니다.\n\n### 🔍 존재 여부와 실현 가능성\n- 이미 BFS와 완전탐색은 학습, 게임, 네트워크, AI 서비스 등에서 폭넓게 쓰이고 있어요.\n- 구현도 어렵지 않아 Python이나 Java 같은 언어에서 바로 테스트할 수 있고, "아이디어" 자체는 이미 존재하지만 어떻게 풀어내느냐가 차별화 포인트입니다.\n\n### 🚀 확장 가능성\n- 교육 서비스: 탐색 과정을 애니메이션으로 시각화해 학습자가 쉽게 이해하도록 구성할 수 있어요.\n- 실제 서비스: 추천 시스템, 경로 찾기, 관계 분석 등 다양한 도메인에 적용 가능해요.\n- AI 결합: "지금 어떤 노드를 탐색 중인지"를 설명해주는 AI 튜터나 BFS 코드를 자동으로 제안해주는 기능으로 확장할 수 있습니다.\n\n### ✏️ 선택된 키워드\n${keywordLines || "- (없음)"}\n\n### ✅ 발전 방향 제안\n- 탐색 과정을 단계별 체크리스트로 정리하고, 서비스 시나리오(문제 → 탐색 → 결과)를 도식화해보세요.\n- 팀 내 공유 시에는 "탐색 효율 향상"과 "사용자 경험" 중 어디에 초점을 둘지 명확히 하는 것이 좋겠어요.`;
  }, [selectedNodes]);

  const planContent = useMemo(() => {
    const keywordList = selectedNodes
      .map((node, idx) => `${idx + 1}. ${node.keyword}`)
      .join("\n");
    return `### 1. 기획 배경\n- 알고리즘 학습의 어려움: 완전탐색, BFS 같은 탐색 알고리즘은 개념은 단순하지만 실제 동작 과정을 이해하기 어려움.\n- 서비스화의 필요성: 단순한 코드 구현이 아니라, 시각화와 AI 설명을 통해 직관적으로 이해할 수 있는 환경 제공 필요.\n- 응용 가능성: BFS는 경로 탐색, 추천 시스템, 네트워크 분석 등 실무 개발 현장에서 핵심적으로 쓰이고 있어 교육뿐만 아니라 다양한 서비스로 확장 가능.\n\n### 2. 주요 기능\n1) 알고리즘 시각화 학습\n   - 완전탐색 & BFS 진행 과정을 단계별 애니메이션으로 제공.\n   - 큐, 그래프, 트리 구조 변화를 실시간으로 확인 가능.\n2) AI 튜터 챗봇\n   - 사용자가 문제를 입력하면 AI가 풀이 과정을 BFS 방식으로 설명.\n   - 완전탐색과 BFS를 비교하며 효율성 차이를 알려줌.\n3) 실전 응용 모듈\n   - 예: 지도 내 최단 경로 탐색, 추천 시스템 미니 시뮬레이션.\n   - 단순 이론이 아닌 실제 개발 서비스 맥락에서 BFS를 활용 경험 제공.\n\n### 3. 기대 효과\n- 학습 곡선 완화: 추상적인 알고리즘 개념을 시각적·대화형으로 설명함으로써 학습 곡선 완화.\n- 개발 실무 연결: 알고리즘을 단순 교육이 아니라 실제 서비스 기획과 연결해 학습자 동기 부여.\n\n### 🔖 참고 키워드\n${keywordList || "- (선택된 노드 없음)"}`;
  }, [selectedNodes]);

  const handleAnalyzeClick = () => {
    if (!hasSelection) return;
    onAnalyze();
    setAnalysisDialogOpen(true);
  };

  const handlePlanOpen = () => {
    setAnalysisDialogOpen(false);
    setPlanDialogOpen(true);
  };

  const handlePlanCopy = () => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(planContent).catch(() => {
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
          disabled={!hasSelection}
        >
          분석하기
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
          title="알고리즘 기반 AI 학습·서비스 플랫폼 기획안"
          content={planContent}
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
