/* Response DTO */
export interface TrendKeywordItem {
  keyword: string;
  score: number;
  rank: number;
}

export interface TrendKeywordResponse {
  period: string;
  parentKeyword: string | null;
  totalCount: number;
  items: TrendKeywordItem[];
}

/* Request DTO */
export interface TrendKeywordRequest {
  parentKeyword: string;
}
