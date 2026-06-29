export type Currency = "KRW" | "USD" | "JPY" | "EUR";

export type PacingStatus = "under" | "on-track" | "over";

export interface BudgetPacingInput {
  totalBudget: number;
  startDate: Date;
  endDate: Date;
  referenceDate: Date;
  spentToDate: number;
  runMode: "daily" | "weekday";
  expectedDailySpend?: number;
}

export interface BudgetPacingResult {
  totalDays: number;
  elapsedDays: number;
  remainingDays: number;
  timePct: number;
  burnPct: number;
  pacingGap: number;
  status: PacingStatus;
  plannedSpend: number;
  variance: number;
  currentDailyAvg: number | null;
  remainingBudget: number;
  requiredDailySpend: number | null;
  projectedFinalSpend: number | null;
  projectedFinalBurnPct: number | null;
}

export type AdMetricKey = "roas" | "cpa" | "cpc" | "cpm" | "ctr";

export interface FunnelStage {
  id: string;
  name: string;
  count: string;
}

export interface FunnelStageResult {
  id: string;
  name: string;
  count: number;
  conversionRate: number | null;
  dropOffRate: number | null;
  dropOffCount: number | null;
  cumulativeRate: number;
  warning: boolean;
}

export interface FunnelAnalysisResult {
  stages: FunnelStageResult[];
  overallRate: number | null;
  worstConversionIdx: number | null;
  worstDropOffRateIdx: number | null;
  worstDropOffCountIdx: number | null;
}

export interface ReverseFunnelStage {
  id: string;
  name: string;
  conversionRate: string;
}

export interface ReverseFunnelResult {
  stages: { id: string; name: string; required: number; conversionRate: number | null }[];
  overallRate: number | null;
}
