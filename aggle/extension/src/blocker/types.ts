export type FilterType = "network" | "cosmetic" | "exception";

export interface Filter {
  id: string;
  type: FilterType;
  pattern: string;
  regex?: RegExp;
  domain?: string;
  isException: boolean;
}

export interface FilterList {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  bundled: boolean;
  rules: Filter[];
  lastUpdated: number;
}

export interface BlockerStats {
  totalBlocked: number;
  blockedToday: number;
  lastResetDate: string;
  perSite: Record<string, number>;
}
