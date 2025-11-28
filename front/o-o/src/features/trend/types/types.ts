import type { TrendKeywordItem } from "./trend";

export interface Keyword {
  readonly id: number;
  readonly text: string;
}

export interface TrendKeywordProps {
  readonly keywords?: TrendKeywordItem[];
  readonly keywordsError?: string | null;
  readonly keywordsLoading: boolean;
  readonly characterImage?: string;
}

export interface KeywordBoxProps {
  readonly text?: string;
  readonly colorClass: string;
  readonly isLarge?: boolean;
  readonly onClick?: () => void;
}

export interface User {
  id: string;
  name: string;
  image?: string;
}

export interface Project {
  id: string;
  title: string;
  date: string;
  isPrivate: boolean;
  collaborators: User[];
  thumbnail?: string;
}
