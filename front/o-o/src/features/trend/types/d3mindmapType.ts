import * as d3 from "d3";
import type { TrendKeywordItem } from "../types/trend";

export interface D3MindmapProps {
  readonly parentKeyword: string;
  readonly childKeywords: TrendKeywordItem[];
  readonly onMoreClick: (remainingKeywords: TrendKeywordItem[]) => void;
  readonly onNodeClick: (keyword: string) => void;
}

export interface Node extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  rank?: number;
  isParent?: boolean;
  isMoreButton?: boolean;
}

export interface Link extends d3.SimulationLinkDatum<Node> {
  source: string | Node;
  target: string | Node;
}
