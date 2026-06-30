/* ============================================================
   실수령 계산 — 4대보험 요율 상수 (연도별)

   ⚠️ UI 로직과 분리합니다. 향후 요율이 바뀌면 이 파일의 상수만
   수정하면 됩니다. 계산식(calculator.ts)은 손대지 않습니다.

   모든 계산은 브라우저 안에서만 이루어집니다. 서버 전송 없음.

   ── 근로자 부담분 기준 (사용자 부담분은 제외) ──
   · 국민연금  : 기준소득월액 × 4.5% (상·하한 적용)
   · 건강보험  : 보수월액 × 3.545%
   · 장기요양  : 건강보험료 × 12.95%
   · 고용보험  : 보수월액 × 0.9%

   요율은 모두 "예상값"입니다. 실제 급여명세서와 차이가 있을 수 있습니다.
   ============================================================ */

export type InsuranceRates = {
  /** 국민연금 근로자 부담 요율 */
  nationalPension: number;
  /** 국민연금 기준소득월액 상한 (월) */
  pensionUpperLimit: number;
  /** 국민연금 기준소득월액 하한 (월) */
  pensionLowerLimit: number;
  /** 건강보험 근로자 부담 요율 */
  healthInsurance: number;
  /** 장기요양보험 요율 (건강보험료 기준) */
  longTermCare: number;
  /** 고용보험 근로자 부담 요율 */
  employmentInsurance: number;
};

/** 연도별 4대보험 요율. 새 연도는 여기에 추가하면 계산기가 자동 대응합니다. */
export const INSURANCE_BY_YEAR: Record<number, InsuranceRates> = {
  2025: {
    nationalPension: 0.045,
    pensionUpperLimit: 6_170_000,
    pensionLowerLimit: 390_000,
    healthInsurance: 0.03545,
    longTermCare: 0.1295,
    employmentInsurance: 0.009,
  },
  2026: {
    nationalPension: 0.045,
    pensionUpperLimit: 6_370_000,
    pensionLowerLimit: 400_000,
    healthInsurance: 0.03545,
    longTermCare: 0.1295,
    employmentInsurance: 0.009,
  },
};

/** 계산기가 지원하는 연도 목록 (최신순) */
export const SUPPORTED_YEARS = Object.keys(INSURANCE_BY_YEAR)
  .map(Number)
  .sort((a, b) => b - a);

/** 기본(최신) 연도 */
export const DEFAULT_YEAR = SUPPORTED_YEARS[0];

/** 해당 연도 요율을 반환. 미지원 연도는 가장 가까운 최신 연도로 폴백. */
export function ratesFor(year: number): InsuranceRates {
  return INSURANCE_BY_YEAR[year] ?? INSURANCE_BY_YEAR[DEFAULT_YEAR];
}
