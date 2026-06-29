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

const TABS_A: TabDef[] = [
  { mode: "growth-rate",          slug: "growth-rate-calculator",         label: { ko: "성장률",    en: "Growth Rate" } },
  { mode: "percentage-change",    slug: "percentage-change-calculator",   label: { ko: "변화율",    en: "% Change" } },
  { mode: "percentage-increase",  slug: "percentage-increase-calculator", label: { ko: "증가율",    en: "% Increase" } },
  { mode: "percentage-decrease",  slug: "percentage-decrease-calculator", label: { ko: "감소율",    en: "% Decrease" } },
  { mode: "percent-difference",   slug: "percent-difference-calculator",  label: { ko: "퍼센트 차이", en: "% Difference" } },
];

const TABS_B: TabDef[] = [
  { mode: "mom-growth", slug: "mom-growth-calculator", label: { ko: "MoM", en: "MoM" } },
  { mode: "yoy-growth", slug: "yoy-growth-calculator", label: { ko: "YoY", en: "YoY" } },
  { mode: "qoq-growth", slug: "qoq-growth-calculator", label: { ko: "QoQ", en: "QoQ" } },
  { mode: "wow-growth", slug: "wow-growth-calculator", label: { ko: "WoW", en: "WoW" } },
];

const TABS_C: TabDef[] = [
  { mode: "goal-growth",     slug: "goal-growth-calculator",     label: { ko: "목표 성장률",  en: "Goal Growth" } },
  { mode: "required-growth", slug: "required-growth-calculator", label: { ko: "필요 증가량",  en: "Required Growth" } },
  { mode: "reverse-growth",  slug: "reverse-growth-calculator",  label: { ko: "역산",         en: "Reverse Growth" } },
];

const TABS_D: TabDef[] = [
  { mode: "cagr",               slug: "cagr-calculator",               label: { ko: "CAGR",    en: "CAGR" } },
  { mode: "compound-growth",    slug: "compound-growth-calculator",    label: { ko: "복리 성장", en: "Compound" } },
  { mode: "growth-projection",  slug: "growth-projection-calculator",  label: { ko: "성장 예측", en: "Projection" } },
];

// ── Related tools by group ────────────────────────────────

const RELATED_A = ["cagr-calculator", "goal-growth-calculator", "mom-growth-calculator"];
const RELATED_B = ["growth-rate-calculator", "percentage-change-calculator", "cagr-calculator", "growth-projection-calculator"];
const RELATED_C = ["growth-rate-calculator", "percentage-change-calculator", "cagr-calculator", "compound-growth-calculator"];
const RELATED_D = ["growth-rate-calculator", "goal-growth-calculator", "mom-growth-calculator", "percentage-change-calculator"];

// ── Shared output blocks ──────────────────────────────────

const CHANGE_OUTPUTS: OutputDef[] = [
  { key: "changeRate",  label: { ko: "변화율",   en: "Change Rate" },  format: "pct-signed",  primary: true },
  { key: "difference",  label: { ko: "차이",     en: "Difference" },   format: "num-signed" },
  { key: "multiplier",  label: { ko: "배수",     en: "Multiplier" },   format: "multiplier" },
  { key: "direction",   label: { ko: "방향",     en: "Direction" },    format: "direction" },
];

const PERIOD_OUTPUTS: OutputDef[] = [
  { key: "changeRate",  label: { ko: "성장률",   en: "Growth Rate" },  format: "pct-signed",  primary: true },
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
      { key: "start", label: { ko: "시작 값",  en: "Start Value" }, allowNegative: true },
      { key: "end",   label: { ko: "종료 값",  en: "End Value" },   allowNegative: true },
    ],
    outputs: CHANGE_OUTPUTS,
    formulaEn: "Growth Rate = (End − Start) / Start × 100",
    formulaKo: "성장률 = (종료 − 시작) / 시작 × 100",
    examples: [
      { inputs: { start: 100, end: 125 },  label: { ko: "100 → 125",   en: "100 → 125" } },
      { inputs: { start: 1200, end: 1860 }, label: { ko: "1,200 → 1,860", en: "1,200 → 1,860" } },
      { inputs: { start: 80, end: 60 },    label: { ko: "80 → 60",     en: "80 → 60" } },
    ],
    relatedSlugs: RELATED_A,
    errorWhen: (inp) => inp.start === 0 ? { ko: "시작 값이 0이면 성장률을 계산할 수 없습니다.", en: "Start value cannot be zero." } : null,
  },

  "percentage-change": {
    slug: "percentage-change-calculator",
    tabs: TABS_A,
    inputs: [
      { key: "start", label: { ko: "이전 값", en: "Previous Value" }, allowNegative: true },
      { key: "end",   label: { ko: "현재 값", en: "Current Value" },  allowNegative: true },
    ],
    outputs: CHANGE_OUTPUTS,
    formulaEn: "% Change = (New − Old) / |Old| × 100",
    formulaKo: "변화율 = (새 값 − 이전 값) / |이전 값| × 100",
    examples: [
      { inputs: { start: 50, end: 75 },   label: { ko: "50 → 75",  en: "50 → 75" } },
      { inputs: { start: 200, end: 150 }, label: { ko: "200 → 150", en: "200 → 150" } },
      { inputs: { start: 1000, end: 1350 }, label: { ko: "1,000 → 1,350", en: "1,000 → 1,350" } },
    ],
    relatedSlugs: RELATED_A,
    errorWhen: (inp) => inp.start === 0 ? { ko: "이전 값이 0이면 변화율을 계산할 수 없습니다.", en: "Previous value cannot be zero." } : null,
  },

  "percentage-increase": {
    slug: "percentage-increase-calculator",
    tabs: TABS_A,
    inputs: [
      { key: "start", label: { ko: "원래 값",  en: "Original Value" } },
      { key: "end",   label: { ko: "증가된 값", en: "Increased Value" } },
    ],
    outputs: CHANGE_OUTPUTS,
    formulaEn: "% Increase = (New − Original) / Original × 100",
    formulaKo: "증가율 = (새 값 − 원래 값) / 원래 값 × 100",
    examples: [
      { inputs: { start: 80, end: 100 },  label: { ko: "80 → 100", en: "80 → 100" } },
      { inputs: { start: 500, end: 650 }, label: { ko: "500 → 650", en: "500 → 650" } },
      { inputs: { start: 1000, end: 1200 }, label: { ko: "1,000 → 1,200", en: "1,000 → 1,200" } },
    ],
    relatedSlugs: RELATED_A,
    errorWhen: (inp) => inp.start === 0 ? { ko: "원래 값이 0이면 계산할 수 없습니다.", en: "Original value cannot be zero." } : null,
  },

  "percentage-decrease": {
    slug: "percentage-decrease-calculator",
    tabs: TABS_A,
    inputs: [
      { key: "start", label: { ko: "원래 값",  en: "Original Value" } },
      { key: "end",   label: { ko: "감소된 값", en: "Decreased Value" } },
    ],
    outputs: CHANGE_OUTPUTS,
    formulaEn: "% Decrease = (Original − New) / Original × 100",
    formulaKo: "감소율 = (원래 값 − 새 값) / 원래 값 × 100",
    examples: [
      { inputs: { start: 100, end: 75 },  label: { ko: "100 → 75", en: "100 → 75" } },
      { inputs: { start: 200, end: 160 }, label: { ko: "200 → 160", en: "200 → 160" } },
      { inputs: { start: 500, end: 375 }, label: { ko: "500 → 375", en: "500 → 375" } },
    ],
    relatedSlugs: RELATED_A,
    errorWhen: (inp) => inp.start === 0 ? { ko: "원래 값이 0이면 계산할 수 없습니다.", en: "Original value cannot be zero." } : null,
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

  "mom-growth": {
    slug: "mom-growth-calculator",
    tabs: TABS_B,
    inputs: [
      { key: "previous", label: { ko: "지난달 값",  en: "Previous Month Value" }, allowNegative: true },
      { key: "current",  label: { ko: "이번달 값",  en: "Current Month Value" },  allowNegative: true },
    ],
    outputs: PERIOD_OUTPUTS,
    formulaEn: "MoM Growth = (Current − Previous) / Previous × 100",
    formulaKo: "MoM 성장률 = (이번달 − 지난달) / 지난달 × 100",
    examples: [
      { inputs: { previous: 10000, current: 12500 }, label: { ko: "10,000 → 12,500", en: "10,000 → 12,500" } },
      { inputs: { previous: 5000, current: 4750 },   label: { ko: "5,000 → 4,750",   en: "5,000 → 4,750" } },
      { inputs: { previous: 800, current: 1000 },    label: { ko: "800 → 1,000",      en: "800 → 1,000" } },
    ],
    relatedSlugs: RELATED_B,
    errorWhen: (inp) => inp.previous === 0 ? { ko: "지난달 값이 0이면 계산할 수 없습니다.", en: "Previous month value cannot be zero." } : null,
  },

  "yoy-growth": {
    slug: "yoy-growth-calculator",
    tabs: TABS_B,
    inputs: [
      { key: "previous", label: { ko: "작년 값",   en: "Previous Year Value" }, allowNegative: true },
      { key: "current",  label: { ko: "올해 값",   en: "Current Year Value" },  allowNegative: true },
    ],
    outputs: PERIOD_OUTPUTS,
    formulaEn: "YoY Growth = (Current − Previous) / Previous × 100",
    formulaKo: "YoY 성장률 = (올해 − 작년) / 작년 × 100",
    examples: [
      { inputs: { previous: 100000, current: 125000 }, label: { ko: "100,000 → 125,000", en: "100,000 → 125,000" } },
      { inputs: { previous: 50000, current: 44000 },   label: { ko: "50,000 → 44,000",   en: "50,000 → 44,000" } },
      { inputs: { previous: 8000, current: 11200 },    label: { ko: "8,000 → 11,200",     en: "8,000 → 11,200" } },
    ],
    relatedSlugs: RELATED_B,
    errorWhen: (inp) => inp.previous === 0 ? { ko: "작년 값이 0이면 계산할 수 없습니다.", en: "Previous year value cannot be zero." } : null,
  },

  "qoq-growth": {
    slug: "qoq-growth-calculator",
    tabs: TABS_B,
    inputs: [
      { key: "previous", label: { ko: "지난 분기 값", en: "Previous Quarter Value" }, allowNegative: true },
      { key: "current",  label: { ko: "이번 분기 값", en: "Current Quarter Value" },  allowNegative: true },
    ],
    outputs: PERIOD_OUTPUTS,
    formulaEn: "QoQ Growth = (Current − Previous) / Previous × 100",
    formulaKo: "QoQ 성장률 = (이번 분기 − 지난 분기) / 지난 분기 × 100",
    examples: [
      { inputs: { previous: 25000, current: 28500 }, label: { ko: "25,000 → 28,500", en: "25,000 → 28,500" } },
      { inputs: { previous: 12000, current: 10800 }, label: { ko: "12,000 → 10,800", en: "12,000 → 10,800" } },
      { inputs: { previous: 3000, current: 4200 },   label: { ko: "3,000 → 4,200",   en: "3,000 → 4,200" } },
    ],
    relatedSlugs: RELATED_B,
    errorWhen: (inp) => inp.previous === 0 ? { ko: "지난 분기 값이 0이면 계산할 수 없습니다.", en: "Previous quarter value cannot be zero." } : null,
  },

  "wow-growth": {
    slug: "wow-growth-calculator",
    tabs: TABS_B,
    inputs: [
      { key: "previous", label: { ko: "지난주 값",  en: "Previous Week Value" }, allowNegative: true },
      { key: "current",  label: { ko: "이번주 값",  en: "Current Week Value" },  allowNegative: true },
    ],
    outputs: PERIOD_OUTPUTS,
    formulaEn: "WoW Growth = (Current − Previous) / Previous × 100",
    formulaKo: "WoW 성장률 = (이번주 − 지난주) / 지난주 × 100",
    examples: [
      { inputs: { previous: 2000, current: 2400 }, label: { ko: "2,000 → 2,400", en: "2,000 → 2,400" } },
      { inputs: { previous: 500, current: 475 },   label: { ko: "500 → 475",     en: "500 → 475" } },
      { inputs: { previous: 150, current: 210 },   label: { ko: "150 → 210",     en: "150 → 210" } },
    ],
    relatedSlugs: RELATED_B,
    errorWhen: (inp) => inp.previous === 0 ? { ko: "지난주 값이 0이면 계산할 수 없습니다.", en: "Previous week value cannot be zero." } : null,
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

  "growth-projection": {
    slug: "growth-projection-calculator",
    tabs: TABS_D,
    inputs: [
      { key: "current", label: { ko: "현재 값",   en: "Current Value" } },
      { key: "rate",    label: { ko: "성장률 (%)", en: "Growth Rate (%)" }, unit: "%", allowNegative: true },
      { key: "periods", label: { ko: "기간 (회차)", en: "Number of Periods" } },
    ],
    outputs: [
      { key: "projectedValue",  label: { ko: "예측 값",   en: "Projected Value" },    format: "num",        primary: true },
      { key: "totalGrowth",     label: { ko: "총 성장률", en: "Total Growth" },        format: "pct-signed" },
      { key: "totalDifference", label: { ko: "총 증가량", en: "Total Difference" },    format: "num-signed" },
    ],
    formulaEn: "Projected Value = Current × (1 + Rate / 100) ^ Periods",
    formulaKo: "예측 값 = 현재 값 × (1 + 성장률 / 100) ^ 기간",
    examples: [
      { inputs: { current: 10000, rate: 15, periods: 5 }, label: { ko: "10,000, 15%, 5회", en: "10,000, 15%, 5 periods" } },
      { inputs: { current: 500, rate: 8, periods: 12 },   label: { ko: "500, 8%, 12회",     en: "500, 8%, 12 periods" } },
      { inputs: { current: 2000, rate: 25, periods: 4 },  label: { ko: "2,000, 25%, 4회",   en: "2,000, 25%, 4 periods" } },
    ],
    relatedSlugs: RELATED_D,
    errorWhen: (inp) => inp.periods < 0 ? { ko: "기간은 0 이상이어야 합니다.", en: "Periods must be 0 or greater." } : null,
  },
};
