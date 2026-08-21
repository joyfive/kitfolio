/* ============================================================
   실수령 계산: 근로소득세 · 지방소득세 (예상 계산)

   국세청 근로소득 간이세액표 산출 방식을 근사한 "예상 계산"입니다.
   실제 급여명세서의 원천징수액과는 차이가 발생할 수 있습니다.

   ── 간이세액 산출 흐름 (근사) ──
   1. 월 과세소득(비과세 제외)을 연으로 환산
   2. 근로소득공제 → 근로소득금액
   3. 인적공제: (공제대상 가족 수 + 20세 이하 자녀 수) × 150만원
      └ 국세청 간이세액표는 20세 이하 자녀 수를 공제대상 가족 수에 가산해 적용
   4. 4대보험료 공제(연금보험료·건강·고용 근로자 부담분) 차감 → 과세표준
   5. 종합소득세율(누진공제) 적용 → 산출세액
   6. 근로소득세액공제 차감 → 결정세액(연)
   7. 12로 나눠 월 세액 → 원천징수 선택비율(80/100/120%) 적용
   8. 지방소득세 = 근로소득세 × 10%

   모든 계산은 브라우저 안에서만 이루어집니다.
   ============================================================ */

/** 종합소득 과세표준 구간 (세율 · 누진공제) */
const TAX_BRACKETS: { upTo: number; rate: number; deduction: number }[] = [
  { upTo: 14_000_000, rate: 0.06, deduction: 0 },
  { upTo: 50_000_000, rate: 0.15, deduction: 1_260_000 },
  { upTo: 88_000_000, rate: 0.24, deduction: 5_760_000 },
  { upTo: 150_000_000, rate: 0.35, deduction: 15_440_000 },
  { upTo: 300_000_000, rate: 0.38, deduction: 19_940_000 },
  { upTo: 500_000_000, rate: 0.4, deduction: 25_940_000 },
  { upTo: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
  { upTo: Infinity, rate: 0.45, deduction: 65_940_000 },
];

/** 근로소득공제 (연 총급여 기준) */
function earnedIncomeDeduction(annual: number): number {
  if (annual <= 5_000_000) return annual * 0.7;
  if (annual <= 15_000_000) return 3_500_000 + (annual - 5_000_000) * 0.4;
  if (annual <= 45_000_000) return 7_500_000 + (annual - 15_000_000) * 0.15;
  if (annual <= 100_000_000) return 12_000_000 + (annual - 45_000_000) * 0.05;
  return Math.min(20_000_000, 14_750_000 + (annual - 100_000_000) * 0.02);
}

/** 과세표준 → 산출세액 (누진공제 방식) */
function progressiveTax(base: number): number {
  if (base <= 0) return 0;
  const b = TAX_BRACKETS.find((x) => base <= x.upTo)!;
  return base * b.rate - b.deduction;
}

/** 근로소득세액공제 (산출세액·총급여 기준 한도 적용) */
function earnedIncomeTaxCredit(computedTax: number, annual: number): number {
  const credit =
    computedTax <= 1_300_000
      ? computedTax * 0.55
      : 715_000 + (computedTax - 1_300_000) * 0.3;

  let cap: number;
  if (annual <= 33_000_000) cap = 740_000;
  else if (annual <= 70_000_000)
    cap = Math.max(660_000, 740_000 - (annual - 33_000_000) * 0.008);
  else if (annual <= 120_000_000)
    cap = Math.max(500_000, 660_000 - (annual - 70_000_000) * 0.5);
  else cap = Math.max(200_000, 500_000 - (annual - 120_000_000) * 0.5);

  return Math.min(credit, cap);
}

export type IncomeTaxInput = {
  /** 월 과세소득 (비과세 제외) */
  taxableMonthly: number;
  /** 공제대상 가족 수 (본인 포함) */
  dependents: number;
  /** 20세 이하 자녀 수 */
  childrenUnder20: number;
  /** 원천징수 선택비율 (80 · 100 · 120) */
  withholdingRate: number;
  /** 연간 4대보험 근로자 부담분 합계 (소득공제 대상): calculator.ts 가 단일 출처로 전달 */
  insuranceDeductionAnnual: number;
};

export type IncomeTaxResult = {
  /** 월 근로소득세 (선택비율 적용 후) */
  incomeTax: number;
  /** 월 지방소득세 (근로소득세 × 10%) */
  localIncomeTax: number;
};

/** 월 근로소득세 · 지방소득세 예상액 */
export function estimateIncomeTax(input: IncomeTaxInput): IncomeTaxResult {
  const {
    taxableMonthly,
    dependents,
    childrenUnder20,
    withholdingRate,
    insuranceDeductionAnnual,
  } = input;

  if (taxableMonthly <= 0) return { incomeTax: 0, localIncomeTax: 0 };

  const annual = taxableMonthly * 12;

  // 근로소득금액
  const earnedIncome = annual - earnedIncomeDeduction(annual);

  // 인적공제: 간이세액표는 20세 이하 자녀 수를 공제대상 가족 수에 가산
  const personalCount = Math.max(1, dependents) + Math.max(0, childrenUnder20);
  const personalDeduction = personalCount * 1_500_000;

  // 4대보험료 공제 (연금보험료공제 + 건강·고용 특별소득공제): 단일 출처에서 전달
  const insuranceDeduction = Math.max(0, insuranceDeductionAnnual);

  const taxBase = Math.max(
    0,
    earnedIncome - personalDeduction - insuranceDeduction,
  );

  const computedTax = progressiveTax(taxBase);
  const taxCredit = earnedIncomeTaxCredit(computedTax, annual);
  const annualTax = Math.max(0, computedTax - taxCredit);

  // 월 세액 → 원천징수 선택비율 적용
  const incomeTax = Math.round((annualTax / 12) * (withholdingRate / 100));
  const localIncomeTax = Math.round(incomeTax * 0.1);

  return { incomeTax, localIncomeTax };
}
