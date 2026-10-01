/* ============================================================
   프리랜서 3.3% 계산: 원천징수 계산 엔진

   · forward : 지급액 → 소득세·지방소득세·실수령액
   · reverse : 목표 실수령액 → 그 금액 이상을 받는 최소 지급액

   금액은 모두 원 단위 정수로 다룬다. 비율도 정수 백분율이라
   곱셈·나눗셈 순서만 지키면 부동소수점 오차가 끼지 않는다.

   모든 계산은 브라우저 안에서만 이루어집니다. 서버 전송 없음.
   ============================================================ */

import { WITHHOLDING_POLICY, type WithholdingPolicy } from "./policy";

/** business = 사업소득 3.3% · other = 기타소득 8.8% */
export type IncomeMode = "business" | "other";

export const INCOME_MODES: IncomeMode[] = ["business", "other"];

/** 입력 상한: 1조 원. 정수 연산이 안전한 범위 안에서 충분히 크다. */
export const MAX_AMOUNT = 1_000_000_000_000;

export type WithholdingResult = {
  mode: IncomeMode;
  /** 지급액 (세전) */
  gross: number;
  /** 필요경비: 기타소득만. 사업소득은 0 */
  expense: number;
  /** 과세 대상 금액: 사업소득은 지급액, 기타소득은 기타소득금액 */
  taxable: number;
  /** 원천징수 소득세 */
  incomeTax: number;
  /** 지방소득세 (특별징수) */
  localTax: number;
  /** 원천징수 합계 */
  totalTax: number;
  /** 실수령액 */
  net: number;
  /** 지급액 대비 원천징수 합계 비율 (0~1) */
  effectiveRate: number;
  /** 기타소득 과세최저한에 걸려 세금이 0원인가 */
  belowMinimum: boolean;
  /** 소액 부징수로 소득세를 걷지 않았는가 */
  smallAmountExempt: boolean;
};

/** 10원 미만 끝수 버림 (국고금 관리법 제47조 제1항) */
export function truncate10(won: number): number {
  return Math.floor(won / 10) * 10;
}

/** 표시용 명목 원천징수율: 사업소득 0.033 · 기타소득 0.088 */
export function nominalRate(mode: IncomeMode, policy: WithholdingPolicy = WITHHOLDING_POLICY): number {
  const local = 1 + policy.localRatePct / 100;
  if (mode === "business") return (policy.businessRatePct / 100) * local;
  return (1 - policy.otherExpensePct / 100) * (policy.otherRatePct / 100) * local;
}

/** 지급액 → 원천징수 내역 */
export function calculateWithholding(
  gross: number,
  mode: IncomeMode,
  policy: WithholdingPolicy = WITHHOLDING_POLICY,
): WithholdingResult {
  const g = Math.max(0, Math.floor(gross));

  // 과세 대상 금액. 기타소득금액은 과세표준이라 1원 미만을 버린다 (제47조 제2항).
  const taxable =
    mode === "business"
      ? g
      : Math.floor((g * (100 - policy.otherExpensePct)) / 100);
  const expense = g - taxable;

  const belowMinimum = mode === "other" && taxable <= policy.otherMinimumIncome;

  const ratePct = mode === "business" ? policy.businessRatePct : policy.otherRatePct;
  let incomeTax = belowMinimum ? 0 : truncate10((taxable * ratePct) / 100);

  const exemptApplies = mode === "other" || policy.businessSmallAmountExempt;
  const smallAmountExempt =
    exemptApplies && incomeTax > 0 && incomeTax < policy.smallAmountThreshold;
  if (smallAmountExempt) incomeTax = 0;

  const localTax = truncate10((incomeTax * policy.localRatePct) / 100);
  const totalTax = incomeTax + localTax;
  const net = g - totalTax;

  return {
    mode,
    gross: g,
    expense,
    taxable,
    incomeTax,
    localTax,
    totalTax,
    net,
    effectiveRate: g > 0 ? totalTax / g : 0,
    belowMinimum,
    smallAmountExempt,
  };
}

export type ReverseResult = {
  /** 목표 실수령액 */
  target: number;
  /** 목표 이상을 받는 최소 지급액의 계산 결과 */
  result: WithholdingResult;
  /** 실수령액이 목표와 정확히 같은가 (절사 때문에 몇 원 넘칠 수 있다) */
  exact: boolean;
};

/** 목표 실수령액 → 실수령액이 목표 이상이 되는 최소 지급액
 *
 *  10원 단위 절사 때문에 실수령액은 지급액에 대해 단조 증가하지 않는다
 *  (소득세와 지방소득세가 같은 1원에서 동시에 10원씩 오르면 실수령액이 줄어든다).
 *  그래서 공식으로 바로 나누지 않고, 답이 될 수 없는 하한에서부터 위로 탐색한다.
 *
 *  하한의 근거: 절사로 줄어드는 세액은 소득세·지방소득세 각각 10원 미만이므로
 *  실수령액 ≤ 지급액 × (1 − 명목율) + 20. 따라서 지급액 × (1 − 명목율) + 20 < 목표 인
 *  지급액은 답이 될 수 없다. 또 세금은 0 이상이라 실수령액 ≤ 지급액 이므로
 *  목표보다 작은 지급액도 답이 될 수 없다.
 *
 *  위 하한은 세금이 붙는 금액에만 성립한다. 과세최저한 아래처럼 세금이 0원인
 *  구간에서는 실수령액 = 지급액 이므로, 목표 금액 자체가 비과세면 그것이 답이다.
 */
export function reverseWithholding(
  target: number,
  mode: IncomeMode,
  policy: WithholdingPolicy = WITHHOLDING_POLICY,
): ReverseResult {
  const t = Math.max(0, Math.floor(target));
  const atTarget = calculateWithholding(t, mode, policy);
  if (atTarget.totalTax === 0) return { target: t, result: atTarget, exact: true };

  const keep = 1 - nominalRate(mode, policy);
  const lower = Math.max(t, Math.floor((t - 20) / keep) - 1);

  // 하한에서 수십 원 안에 답이 있다. 안전하게 넉넉한 상한을 둔다.
  for (let g = lower; g <= lower + 1_000; g++) {
    const r = calculateWithholding(g, mode, policy);
    if (r.net >= t) return { target: t, result: r, exact: r.net === t };
  }
  // 도달하지 않는다. 방어적으로 근사값을 돌려준다.
  const r = calculateWithholding(Math.ceil(t / keep), mode, policy);
  return { target: t, result: r, exact: r.net === t };
}
