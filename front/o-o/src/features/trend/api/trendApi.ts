import { apiClient } from "@/lib/axios";
import type { TrendKeywordResponse } from "../types/trend";

export const trendApi = {
  // GET /trend/top
  getTopTrend: async (): Promise<TrendKeywordResponse> => {
    const { data } = await apiClient.get<TrendKeywordResponse>(
      "/trend/top",
      {}
    );

    return data;
  },

  // GET /trend/{parentKeyword}
  getChildTrend: async (
    parentKeyword: string
  ): Promise<TrendKeywordResponse> => {
    const { data } = await apiClient.get<TrendKeywordResponse>(
      `/trend/${parentKeyword}`,
      {}
    );

    // parentKeyword와 동일한 키워드를 제외하고 상위 7개만 반환
    const filteredItems = data.items
      .filter((item) => item.keyword !== data.parentKeyword)
      .slice(0, 7);

    return {
      ...data,
      items: filteredItems,
    };
  },

  // GET /trend/search?keyword=검색어
  getSearchKeywordTrend: async (
    keyword: string
  ): Promise<TrendKeywordResponse> => {
    if (!keyword.trim()) {
      console.warn("⚠️ 검색어가 비어있습니다.");
      return {
        period: "",
        parentKeyword: null,
        totalCount: 0,
        items: [],
      };
    }

    const { data } = await apiClient.get<TrendKeywordResponse>(
      "/trend/search",
      {
        params: {
          keyword: keyword.trim(),
        },
      }
    );

    return data;
  },
};
