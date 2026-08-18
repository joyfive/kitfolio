/* ============================================================
   실수령 계산 — 메인 계산 엔진 (UI 비의존)

   UI에서는 calculateSalary() 하나만 호출합니다.
   요율은 insurance.ts, 세금은 tax.ts, 반올림은 formatter.ts 가 담당합니다.

   모든 계산은 브라우저 안에서만 이루어집니다. 서버 전송 없음.
   ============================================================ */

import { policyOn, toIsoDate, type InsurancePolicy } from "./insurance";
import { estimateIncomeTax } from "./tax";
import { roundWon } from "./formatter";

export type PayMode = "annual" | "monthly";

export type SalaryInput = {
  /** 급여 형태 — 연봉 / 월급 */
  mode: PayMode;
  /** 세전 금액 (연봉 또는 월급) */
  amount: number;
  /** 월 비과세 금액 (기본 200,000) */
  nonTaxable: number;
  /** 부양가족 수, 본인 포함 (기본 1) */
  dependents: number;
  /** 20세 이하 자녀 수 (기본 0) */
  childrenUnder20: number;
  /** 원천징수 선택비율 80 · 100 · 120 (기본 100) */
  withholdingRate: number;
  /**
   * 적용 기준일 (Date 또는 "YYYY-MM-DD"). 기본값은 "오늘".
   * 보험 요율(1월 개정)과 국민연금 기준소득월액(7월 개정)의 적용 시점이
   * 다르므로, 연도가 아니라 날짜로 정책을 선택한다.
   */
  asOf?: Date | string;
};

export type Deductions = {
  nationalPension: number;
  healthInsurance: number;
  longTermCare: number;
  employmentInsurance: number;
  incomeTax: number;
  localIncomeTax: number;
};

export type SalaryResult = {
  /** 세전 월 급여 */
  monthlyGross: number;
  /** 세전 연 급여 */
  annualGross: number;
  /** 월 과세소득 (비과세 제외) */
  taxableMonthly: number;
  /** 월 공제 상세 */
  deductions: Deductions;
  /** 월 총 공제액 */
  totalDeduction: number;
  /** 월 실수령액 */
  netMonthly: number;
  /** 연 실수령액 (월 실수령 × 12) */
  netAnnual: number;
  /** 계산에 실제 적용된 보험 정책 (요율·기준소득월액·기준일) */
  policy: InsurancePolicy;
};

/**
 * 연봉/월급 실수령액 계산.
 * 금액이 0 이하이면 계산 불가로 보고 null 반환.
 */
export function calculateSalary(input: SalaryInput): SalaryResult | null {
  const asOf = toIsoDate(input.asOf ?? new Date());
  const amount = input.amount;

  if (!Number.isFinite(amount) || amount <= 0) return null;

  const policy = policyOn(asOf);

  const monthlyGross = input.mode === "annual" ? amount / 12 : amount;
  const annualGross = input.mode === "annual" ? amount : amount * 12;

  const nonTaxable = Math.max(0, input.nonTaxable);
  const taxableMonthly = Math.max(0, monthlyGross - nonTaxable);

  // ── 4대보험 (근로자 부담분) ──
  const pensionBase = Math.min(
    Math.max(taxableMonthly, policy.pensionLowerLimit),
    policy.pensionUpperLimit,
  );
  // 과세소득이 0이면 연금도 0
  const nationalPension =
    taxableMonthly <= 0 ? 0 : roundWon(pensionBase * policy.nationalPension);
  const healthInsurance = roundWon(taxableMonthly * policy.healthInsurance);
  const longTermCare = roundWon(healthInsurance * policy.longTermCare);
  const employmentInsurance = roundWon(
    taxableMonthly * policy.employmentInsurance,
  );

  // ── 근로소득세 · 지방소득세 ──
  // 4대보험 근로자 부담분은 소득공제 대상 → 연 합계를 세금 계산에 전달
  const insuranceDeductionAnnual =
    (nationalPension + healthInsurance + longTermCare + employmentInsurance) *
    12;
  const { incomeTax, localIncomeTax } = estimateIncomeTax({
    taxableMonthly,
    dependents: Math.max(1, Math.round(input.dependents)),
    childrenUnder20: Math.max(0, Math.round(input.childrenUnder20)),
    withholdingRate: input.withholdingRate,
    insuranceDeductionAnnual,
  });

  const deductions: Deductions = {
    nationalPension,
    healthInsurance,
    longTermCare,
    employmentInsurance,
    incomeTax,
    localIncomeTax,
  };

  const totalDeduction =
    nationalPension +
    healthInsurance +
    longTermCare +
    employmentInsurance +
    incomeTax +
    localIncomeTax;

  const netMonthly = roundWon(monthlyGross) - totalDeduction;
  const netAnnual = netMonthly * 12;

  return {
    monthlyGross: roundWon(monthlyGross),
    annualGross: roundWon(annualGross),
    taxableMonthly: roundWon(taxableMonthly),
    deductions,
    totalDeduction,
    netMonthly,
    netAnnual,
    policy,
  };
}
