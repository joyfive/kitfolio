import type { GrowthMode, GrowthResult } from "./growthMath";

export interface TabDef {
  mode: GrowthMode;
  slug: string;
  label: { ko: string; en: string };
}

export type OutputFormat =
  | "pct-signed"   // ±25.00%
  | "pct"          // 25.00% (unsigned)
  | "num"          // 1,250.00
  | "num-signed"   // ±1,250.00
  | "multiplier"   // 1.25×
  | "direction"    // Increase / Decrease / No change
  | "progress";    // 75.00% (0–100 range)

export interface OutputDef {
  key: keyof GrowthResult;
  label: { ko: string; en: string };
  format: OutputFormat;
  primary?: boolean;
}

export interface InputDef {
  key: string;
  label: { ko: string; en: string };
  unit?: string;
  allowNegative?: boolean;
}

export interface ExampleDef {
  inputs: Record<string, number>;
  label: { ko: string; en: string };
}

export interface ModeConfig {
  slug: string;
  tabs: TabDef[];
  inputs: InputDef[];
  outputs: OutputDef[];
  formulaEn: string;
  formulaKo: string;
  examples: ExampleDef[];
  relatedSlugs: string[];
  errorWhen?: (inputs: Record<string, number>) => { ko: string; en: string } | null;
}

// ── Tab groups ────────────────────────────────────────────

// 성장률·변화율·증가율·감소율·MoM·YoY·QoQ·WoW는 동일 수식이라
// 성장률 계산기(growth-rate) 한 페이지로 통합됨. 여기엔 남은 도구만 병기.
const TABS_A: TabDef[] = [
  { mode: "growth-rate",        slug: "growth-rate-calculator",        label: { ko: "성장률",     en: "Growth Rate" } },
  { mode: "percent-difference", slug: "percent-difference-calculator", label: { ko: "퍼센트 차이", en: "% Difference" } },
];

const TABS_C: TabDef[] = [
  { mode: "goal-growth",     slug: "goal-growth-calculator",     label: { ko: "목표 성장률",  en: "Goal Growth" } },
  { mode: "required-growth", slug: "required-growth-calculator", label: { ko: "필요 증가량",  en: "Required Growth" } },
  { mode: "reverse-growth",  slug: "reverse-growth-calculator",  label: { ko: "역산",         en: "Reverse Growth" } },
];

// 복리 성장 ≡ 성장 예측(동일 수식)이라 복리 성장 계산기로 통합됨.
const TABS_D: TabDef[] = [
  { mode: "cagr",            slug: "cagr-calculator",            label: { ko: "CAGR",    en: "CAGR" } },
  { mode: "compound-growth", slug: "compound-growth-calculator", label: { ko: "복리 성장", en: "Compound" } },
];

// ── Related tools by group ────────────────────────────────

const RELATED_A = ["cagr-calculator", "goal-growth-calculator", "compound-growth-calculator"];
const RELATED_C = ["growth-rate-calculator", "percent-difference-calculator", "cagr-calculator", "compound-growth-calculator"];
const RELATED_D = ["growth-rate-calculator", "goal-growth-calculator", "percent-difference-calculator", "reverse-growth-calculator"];

// ── Shared output blocks ──────────────────────────────────

const CHANGE_OUTPUTS: OutputDef[] = [
  { key: "changeRate",  label: { ko: "변화율",   en: "Change Rate" },  format: "pct-signed",  primary: true },
  { key: "difference",  label: { ko: "차이",     en: "Difference" },   format: "num-signed" },
  { key: "multiplier",  label: { ko: "배수",     en: "Multiplier" },   format: "multiplier" },
  { key: "direction",   label: { ko: "방향",     en: "Direction" },    format: "direction" },
];

// ── Mode configs ──────────────────────────────────────────

export const CONFIGS: Record<GrowthMode, ModeConfig> = {
  "growth-rate": {
    slug: "growth-rate-calculator",
    tabs: TABS_A,
    inputs: [
      { key: "start", label: { ko: "이전 값",  en: "Previous Value" }, allowNegative: true },
      { key: "end",   label: { ko: "현재 값",  en: "Current Value" },  allowNegative: true },
    ],
    outputs: CHANGE_OUTPUTS,
    formulaEn: "Growth Rate = (Current − Previous) / Previous × 100",
    formulaKo: "성장률 = (현재 − 이전) / 이전 × 100",
    examples: [
      { inputs: { start: 10000, end: 12500 }, label: { ko: "MoM 10,000 → 12,500", en: "MoM 10,000 → 12,500" } },
      { inputs: { start: 100, end: 125 },     label: { ko: "100 → 125",   en: "100 → 125" } },
      { inputs: { start: 80, end: 60 },       label: { ko: "80 → 60 (감소)", en: "80 → 60 (down)" } },
    ],
    relatedSlugs: RELATED_A,
    errorWhen: (inp) => inp.start === 0 ? { ko: "이전 값이 0이면 성장률을 계산할 수 없습니다.", en: "Previous value cannot be zero." } : null,
  },

  "percent-difference": {
    slug: "percent-difference-calculator",
    tabs: TABS_A,
    inputs: [
      { key: "a", label: { ko: "값 A", en: "Value A" }, allowNegative: true },
      { key: "b", label: { ko: "값 B", en: "Value B" }, allowNegative: true },
    ],
    outputs: [
      { key: "changeRate",  label: { ko: "퍼센트 차이", en: "Percent Difference" }, format: "pct", primary: true },
      { key: "difference",  label: { ko: "절대 차이",   en: "Absolute Difference" }, format: "num" },
    ],
    formulaEn: "% Difference = |A − B| / ((A + B) / 2) × 100",
    formulaKo: "퍼센트 차이 = |A − B| / ((A + B) / 2) × 100",
    examples: [
      { inputs: { a: 100, b: 120 }, label: { ko: "100 vs 120", en: "100 vs 120" } },
      { inputs: { a: 50, b: 75 },   label: { ko: "50 vs 75",   en: "50 vs 75" } },
      { inputs: { a: 200, b: 300 }, label: { ko: "200 vs 300", en: "200 vs 300" } },
    ],
    relatedSlugs: RELATED_A,
    errorWhen: (inp) => (inp.a + inp.b === 0) ? { ko: "두 값의 합이 0이면 계산할 수 없습니다.", en: "Values cannot both be zero." } : null,
  },

  "goal-growth": {
    slug: "goal-growth-calculator",
    tabs: TABS_C,
    inputs: [
      { key: "current", label: { ko: "현재 값",  en: "Current Value" } },
      { key: "target",  label: { ko: "목표 값",  en: "Target Value" } },
    ],
    outputs: [
      { key: "requiredGrowthRate",  label: { ko: "필요 성장률",  en: "Required Growth Rate" },  format: "pct-signed", primary: true },
      { key: "requiredDifference",  label: { ko: "필요 증가량",  en: "Required Difference" },    format: "num-signed" },
      { key: "multiplierNeeded",    label: { ko: "배수",         en: "Multiplier Needed" },      format: "multiplier" },
    ],
    formulaEn: "Required Growth Rate = (Target − Current) / Current × 100",
    formulaKo: "필요 성장률 = (목표 − 현재) / 현재 × 100",
    examples: [
      { inputs: { current: 10000, target: 15000 }, label: { ko: "10,000 → 15,000", en: "10,000 → 15,000" } },
      { inputs: { current: 500, target: 800 },     label: { ko: "500 → 800",        en: "500 → 800" } },
      { inputs: { current: 1000, target: 1250 },   label: { ko: "1,000 → 1,250",    en: "1,000 → 1,250" } },
    ],
    relatedSlugs: RELATED_C,
    errorWhen: (inp) => inp.current === 0 ? { ko: "현재 값이 0이면 계산할 수 없습니다.", en: "Current value cannot be zero." } : null,
  },

  "required-growth": {
    slug: "required-growth-calculator",
    tabs: TABS_C,
    inputs: [
      { key: "current", label: { ko: "현재 값",  en: "Current Value" } },
      { key: "target",  label: { ko: "목표 값",  en: "Target Value" } },
    ],
    outputs: [
      { key: "requiredIncrease",   label: { ko: "필요 증가량",    en: "Required Increase" },     format: "num-signed", primary: true },
      { key: "requiredGrowthRate", label: { ko: "필요 성장률",    en: "Required Growth Rate" },   format: "pct-signed" },
      { key: "remainingGap",       label: { ko: "남은 갭",        en: "Remaining Gap" },          format: "num-signed" },
      { key: "progressToTarget",   label: { ko: "목표 달성률",    en: "Progress to Target" },     format: "progress" },
    ],
    formulaEn: "Progress = Current / Target × 100   |   Gap = Target − Current",
    formulaKo: "달성률 = 현재 / 목표 × 100   |   갭 = 목표 − 현재",
    examples: [
      { inputs: { current: 7000, target: 10000 },  label: { ko: "7,000 / 10,000", en: "7,000 / 10,000" } },
      { inputs: { current: 300, target: 500 },     label: { ko: "300 / 500",       en: "300 / 500" } },
      { inputs: { current: 1200, target: 2000 },   label: { ko: "1,200 / 2,000",   en: "1,200 / 2,000" } },
    ],
    relatedSlugs: RELATED_C,
    errorWhen: (inp) => {
      if (inp.current === 0) return { ko: "현재 값이 0이면 계산할 수 없습니다.", en: "Current value cannot be zero." };
      if (inp.target === 0) return { ko: "목표 값이 0이면 계산할 수 없습니다.", en: "Target value cannot be zero." };
      return null;
    },
  },

  "reverse-growth": {
    slug: "reverse-growth-calculator",
    tabs: TABS_C,
    inputs: [
      { key: "finalValue",  label: { ko: "최종 값",  en: "Final Value" } },
      { key: "growthRate",  label: { ko: "성장률 (%)", en: "Growth Rate (%)" }, unit: "%", allowNegative: true },
    ],
    outputs: [
      { key: "originalValue", label: { ko: "원래 값", en: "Original Value" }, format: "num", primary: true },
      { key: "difference",    label: { ko: "차이",    en: "Difference" },     format: "num-signed" },
      { key: "multiplier",    label: { ko: "배수",    en: "Multiplier" },     format: "multiplier" },
    ],
    formulaEn: "Original Value = Final Value / (1 + Growth Rate / 100)",
    formulaKo: "원래 값 = 최종 값 / (1 + 성장률 / 100)",
    examples: [
      { inputs: { finalValue: 125, growthRate: 25 },   label: { ko: "125, +25%", en: "125, +25%" } },
      { inputs: { finalValue: 1500, growthRate: 50 },  label: { ko: "1,500, +50%", en: "1,500, +50%" } },
      { inputs: { finalValue: 900, growthRate: -10 },  label: { ko: "900, -10%",   en: "900, -10%" } },
    ],
    relatedSlugs: RELATED_C,
    errorWhen: (inp) => (1 + inp.growthRate / 100 === 0) ? { ko: "성장률이 -100%이면 계산할 수 없습니다.", en: "Growth rate of -100% is invalid." } : null,
  },

  "cagr": {
    slug: "cagr-calculator",
    tabs: TABS_D,
    inputs: [
      { key: "start", label: { ko: "시작 값",   en: "Start Value" } },
      { key: "end",   label: { ko: "종료 값",   en: "End Value" } },
      { key: "years", label: { ko: "기간 (년)", en: "Number of Years" } },
    ],
    outputs: [
      { key: "cagr",           label: { ko: "CAGR",       en: "CAGR" },            format: "pct-signed", primary: true },
      { key: "totalGrowth",    label: { ko: "총 성장률",  en: "Total Growth" },    format: "pct-signed" },
      { key: "finalMultiplier",label: { ko: "최종 배수",  en: "Final Multiplier" }, format: "multiplier" },
    ],
    formulaEn: "CAGR = (End / Start) ^ (1 / Years) − 1",
    formulaKo: "CAGR = (종료 / 시작) ^ (1 / 기간) − 1",
    examples: [
      { inputs: { start: 100, end: 200, years: 5 },    label: { ko: "100 → 200, 5년",    en: "100 → 200, 5 yrs" } },
      { inputs: { start: 1000, end: 1500, years: 3 },  label: { ko: "1,000 → 1,500, 3년", en: "1,000 → 1,500, 3 yrs" } },
      { inputs: { start: 10000, end: 25000, years: 10 }, label: { ko: "10,000 → 25,000, 10년", en: "10,000 → 25,000, 10 yrs" } },
    ],
    relatedSlugs: RELATED_D,
    errorWhen: (inp) => {
      if (inp.start <= 0) return { ko: "시작 값은 0보다 커야 합니다.", en: "Start value must be greater than zero." };
      if (inp.years <= 0) return { ko: "기간은 0보다 커야 합니다.", en: "Years must be greater than zero." };
      return null;
    },
  },

  "compound-growth": {
    slug: "compound-growth-calculator",
    tabs: TABS_D,
    inputs: [
      { key: "initial", label: { ko: "초기 값",   en: "Initial Value" } },
      { key: "rate",    label: { ko: "성장률 (%)", en: "Growth Rate (%)" }, unit: "%", allowNegative: true },
      { key: "periods", label: { ko: "기간 (회차)", en: "Number of Periods" } },
    ],
    outputs: [
      { key: "finalValue",      label: { ko: "최종 값",  en: "Final Value" },      format: "num",        primary: true },
      { key: "totalGrowth",     label: { ko: "총 성장률", en: "Total Growth" },    format: "pct-signed" },
      { key: "totalDifference", label: { ko: "총 증가량", en: "Total Difference" }, format: "num-signed" },
    ],
    formulaEn: "Final Value = Initial × (1 + Rate / 100) ^ Periods",
    formulaKo: "최종 값 = 초기 값 × (1 + 성장률 / 100) ^ 기간",
    examples: [
      { inputs: { initial: 1000, rate: 10, periods: 5 },  label: { ko: "1,000, 10%, 5회", en: "1,000, 10%, 5 periods" } },
      { inputs: { initial: 5000, rate: 5, periods: 10 },  label: { ko: "5,000, 5%, 10회", en: "5,000, 5%, 10 periods" } },
      { inputs: { initial: 100, rate: 20, periods: 3 },   label: { ko: "100, 20%, 3회",   en: "100, 20%, 3 periods" } },
    ],
    relatedSlugs: RELATED_D,
    errorWhen: (inp) => inp.periods < 0 ? { ko: "기간은 0 이상이어야 합니다.", en: "Periods must be 0 or greater." } : null,
  },
};
