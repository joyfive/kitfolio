/* ============================================================
   실업급여(구직급여) 계산: 정책 데이터

   ⚠️ UI·계산식과 분리된 "정책 데이터" 레이어입니다.
   상한·하한·최저임금·소정급여일수가 바뀌면 이 파일만 고칩니다.
   계산식(calculator.ts)과 화면(UnemploymentBenefitCalculator.tsx)은 손대지 않습니다.

   ── 근거 (2026-10-22 · 법령 인용·보도로 1차 확인, 국가법령정보센터 원문 대조 전) ──
   · 기초일액 = 이직 전 평균임금, 통상임금이 더 크면 통상임금 : 고용보험법 제45조
   · 기초일액 상한 113,500원 (2026-01-01 이후 이직자)         : 시행령 제68조 (2025-12-23 개정)
     2026-01-01 전 이직자는 종전 110,000원                    : 같은 시행령 부칙
   · 구직급여일액 = 기초일액 × 60%                            : 제46조
   · 하한 = 최저임금 시급 × 1일 소정근로시간 × 80%              : 제46조
     1일 소정근로시간의 1시간 미만 끝수는 올림 (7.5시간 → 8시간)  : 고용노동부 행정규칙
   · 소정급여일수                                            : 제50조 [별표 1]
   · 피보험단위기간 기준기간 18개월 · 180일 이상               : 제40조
   · 수급기간 이직일 다음 날부터 12개월                        : 제48조
   · 대기기간 실업 신고일부터 7일                              : 제49조
   · 조기재취업수당 = 미지급 일수 × 일액 × 1/2                 : 제64조 · 시행령
     실업 신고일부터 14일이 지난 뒤 재취업해야 대상 (대기기간 7일과 별개) : 고용24 안내

   기간은 이직일(마지막 근무일)로 고른다. 개정되면 값을 덮어쓰지 말고
   새 기간 행을 추가합니다. 2026-09-01 고용보험위원회에 보고된 개편안
   (주 6일 지급 · 상한 = 하한의 103%)은 법령 개정·시행일 확정 후 행으로 추가합니다.
   ============================================================ */

/** 상한 산정 방식: 정액(기초일액 상한 × 60%) 또는 하한 연동 (개편안 대비) */
export type UpperRule = { kind: "fixed" } | { kind: "floorLinked"; ratio: number };

export type UnemploymentPolicyPeriod = {
  effectiveFrom: string;
  /** 비어 있으면 현재 적용 중 */
  effectiveTo?: string;
  label: string;
  /** 기초일액 상한 (원) */
  baseDailyCap: number;
  /** 이직일 당시 최저임금 시급 (원) */
  minWageHourly: number;
  /** 구직급여 지급률 (기초일액 대비) */
  replacementRate: number;
  /** 하한 비율 (최저임금 대비) */
  floorRate: number;
  /** 하한 계산에 쓰는 1일 소정근로시간 최대 */
  maxFloorHours: number;
  /** 1주에 지급하는 날 수 (현행 7) */
  paidDaysPerWeek: number;
  upperRule: UpperRule;
};

export const POLICY_PERIODS: UnemploymentPolicyPeriod[] = [
  {
    effectiveFrom: "2024-01-01",
    effectiveTo: "2024-12-31",
    label: "2024",
    baseDailyCap: 110_000,
    minWageHourly: 9_860,
    replacementRate: 0.6,
    floorRate: 0.8,
    maxFloorHours: 8,
    paidDaysPerWeek: 7,
    upperRule: { kind: "fixed" },
  },
  {
    effectiveFrom: "2025-01-01",
    effectiveTo: "2025-12-31",
    label: "2025",
    baseDailyCap: 110_000,
    minWageHourly: 10_030,
    replacementRate: 0.6,
    floorRate: 0.8,
    maxFloorHours: 8,
    paidDaysPerWeek: 7,
    upperRule: { kind: "fixed" },
  },
  {
    effectiveFrom: "2026-01-01",
    label: "2026",
    baseDailyCap: 113_500,
    minWageHourly: 10_320,
    replacementRate: 0.6,
    floorRate: 0.8,
    maxFloorHours: 8,
    paidDaysPerWeek: 7,
    upperRule: { kind: "fixed" },
  },
];

/** 이직일(YYYY-MM-DD)에 적용되는 정책. 지원 범위 이전이면 null. */
export function policyOn(iso: string): UnemploymentPolicyPeriod | null {
  for (const p of POLICY_PERIODS) {
    if (iso >= p.effectiveFrom && (!p.effectiveTo || iso <= p.effectiveTo)) return p;
  }
  return null;
}

/** 소정급여일수 [별표 1]: 피보험기간 구간 경계 (개월, 이상) */
export const INSURED_MONTH_BOUNDS = [12, 36, 60, 120];

/** [별표 1] 행: 50세 미만 / 50세 이상·장애인 */
export const BENEFIT_DAYS_TABLE = {
  under50: [120, 150, 180, 210, 240],
  over50: [120, 180, 210, 240, 270],
} as const;

/** 소정급여일수에서 50세 이상 행을 적용하는 나이 */
export const OLDER_AGE = 50;
/** 65세 이후 새로 고용되면 구직급여 적용 제외 (제10조) */
export const EXCLUDED_NEW_HIRE_AGE = 65;

export const ELIGIBILITY = {
  /** 기준기간 (개월) */
  baseMonths: 18,
  /** 피보험단위기간 최소 (일) */
  minInsuredUnitDays: 180,
};

export const SCHEDULE = {
  /** 수급기간 (이직일 다음 날부터, 개월) */
  benefitPeriodMonths: 12,
  /** 대기기간 (실업 신고일부터, 일) */
  waitingDays: 7,
  /** 월 환산에 쓰는 실업인정 주기 (일) */
  certificationCycleDays: 28,
};

export const EARLY_REEMPLOYMENT = {
  /** 남아 있어야 하는 소정급여일수 비율 (이상) */
  minRemainingRatio: 0.5,
  /** 지급 비율 */
  payRatio: 0.5,
  /** 재취업 후 계속 고용돼야 하는 기간 (개월) */
  minEmploymentMonths: 12,
  /** 실업 신고일부터 이 일수가 지난 뒤 재취업해야 한다 (신고일 = 1일째, 15일째부터 대상).
   *  대기기간 7일(SCHEDULE.waitingDays)과는 별개 요건이다 (고용24 조기재취업수당 안내) */
  minDaysAfterApply: 14,
};
