/* ============================================================
   종합소득세 기본세율 (소득세법 제55조 제1항)

   근로소득 간이세액 근사(salary/tax.ts)와 종합소득세 계산기(incometax/)가
   같은 표를 쓴다. 세율이 바뀌면 이 파일만 고친다.

   2023년 귀속부터 적용되는 8단계 표 (1,400만 · 5,000만 구간 상향 개정 반영).
   ============================================================ */

/** 종합소득 과세표준 구간 (세율 · 누진공제) */
export const TAX_BRACKETS: { upTo: number; rate: number; deduction: number }[] = [
  { upTo: 14_000_000, rate: 0.06, deduction: 0 },
  { upTo: 50_000_000, rate: 0.15, deduction: 1_260_000 },
  { upTo: 88_000_000, rate: 0.24, deduction: 5_760_000 },
  { upTo: 150_000_000, rate: 0.35, deduction: 15_440_000 },
  { upTo: 300_000_000, rate: 0.38, deduction: 19_940_000 },
  { upTo: 500_000_000, rate: 0.4, deduction: 25_940_000 },
  { upTo: 1_000_000_000, rate: 0.42, deduction: 35_940_000 },
  { upTo: Infinity, rate: 0.45, deduction: 65_940_000 },
];

/** 과세표준 → 산출세액 (누진공제 방식) */
export function progressiveTax(base: number): number {
  if (base <= 0) return 0;
  const b = TAX_BRACKETS.find((x) => base <= x.upTo)!;
  return base * b.rate - b.deduction;
}

/** 과세표준이 속한 구간의 세율 (0.06 ~ 0.45) */
export function marginalRate(base: number): number {
  if (base <= 0) return TAX_BRACKETS[0].rate;
  return TAX_BRACKETS.find((x) => base <= x.upTo)!.rate;
}
