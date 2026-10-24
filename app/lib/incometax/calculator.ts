/* ============================================================
   종합소득세 계산기: 계산 엔진 (인적용역 사업소득 프리랜서)

   · 대상 판정 : 직전연도 수입금액 · 신규 여부로 단순경비율 / 기준경비율 /
                 복식부기의무자(범위 밖) 를 가른다
   · 방식별 계산: 단순경비율 · 기준경비율 · 간편장부(실제 경비)
   · 정산      : 결정세액 − 기납부세액(원천징수 3%) = 납부(+) 또는 환급(−)
   · 역산      : 간편장부가 추계 신고보다 유리해지는 최소 실제 경비

   금액은 원 단위 정수로 다룬다. 경비율은 0.1% 단위 정수다.
   모든 계산은 브라우저 안에서만 이루어집니다. 서버 전송 없음.
   ============================================================ */

import { progressiveTax } from "../tax/brackets";
import { WITHHOLDING_POLICY } from "../freelancer/policy";
import { truncate10 } from "../freelancer/calculator";
import { policyFor, type IncomeTaxPolicy } from "./policy";

/** 입력 상한: 1조 원 */
export const MAX_AMOUNT = 1_000_000_000_000;

export type MethodKind = "simple" | "standard" | "ledger";
export const METHOD_KINDS: MethodKind[] = ["simple", "standard", "ledger"];

/** 0.1% 단위 경비율 묶음 */
export type Rates = { simple: number; simpleExcess: number; standard: number };

export type IncomeTaxInput = {
  /** 귀속연도 */
  year: number;
  /** 올해 수입금액 (3.3% 떼기 전 총 지급액) */
  revenue: number;
  /** 직전연도 수입금액 */
  prevRevenue: number;
  /** 올해 사업을 처음 시작했는가 */
  isNew: boolean;
  rates: Rates;
  /** 기준경비율 방식의 주요경비 (매입·임차료·인건비 증빙분) */
  majorExpenses: number;
  /** 간편장부 방식의 실제 필요경비. null 이면 계산하지 않는다 */
  actualExpenses: number | null;
  /** 본인 외 기본공제 대상 부양가족 수 */
  dependents: number;
  /** 70세 이상 경로우대 인원 (본인 포함) */
  elderly: number;
  /** 장애인 인원 (본인 포함) */
  disabled: number;
  /** 국민연금 지역가입자 본인 납부액 (연간) */
  pension: number;
  /** 원천징수된 소득세. null 이면 수입금액 × 3% */
  prepaid: number | null;
};

export type Eligibility = {
  /** 복식부기의무자 (직전연도 수입 7,500만원 이상): v1 범위 밖 */
  doubleEntry: boolean;
  /** 단순경비율로 추계 신고할 수 있는가 */
  simple: boolean;
  /** 무기장가산세가 면제되는 소규모사업자인가 */
  smallBusiness: boolean;
  /** 단순경비율이 안 되는 이유 */
  simpleReason: "ok" | "prevOver" | "currentOver" | "doubleEntry";
};

export type MethodResult = {
  kind: MethodKind;
  /** 이 사람이 이 방식으로 신고할 수 있는가 */
  eligible: boolean;
  /** 필요경비 */
  expenses: number;
  /** 사업소득금액 */
  income: number;
  /** 기준경비율: 배율 상한이 적용됐는가 */
  capped: boolean;
  /** 종합소득공제 (인적공제 + 연금보험료) */
  deductions: number;
  /** 과세표준 */
  taxBase: number;
  /** 산출세액 */
  computedTax: number;
  /** 표준세액공제 (산출세액 한도) */
  taxCredit: number;
  /** 무기장가산세 */
  penalty: number;
  /** 결정세액 (소득세, 가산세 포함) */
  determinedTax: number;
  /** 개인지방소득세 결정세액 */
  localTax: number;
  /** 소득세 납부(+) / 환급(−) */
  payable: number;
  /** 지방소득세 납부(+) / 환급(−) */
  localPayable: number;
  /** 합계 납부(+) / 환급(−) */
  totalPayable: number;
};

export type IncomeTaxResult = {
  input: IncomeTaxInput;
  policy: IncomeTaxPolicy;
  eligibility: Eligibility;
  /** 원천징수된 소득세 */
  prepaid: number;
  /** 원천징수된 지방소득세 */
  prepaidLocal: number;
  /** simple · standard · ledger (ledger 는 actualExpenses 가 있을 때만) */
  methods: MethodResult[];
  /** 신고할 수 있는 방식 가운데 합계 부담이 가장 작은 방식 */
  best: MethodKind | null;
  /** 이 사람이 쓰는 추계 방식 (복식부기의무자면 null) */
  estimateKind: "simple" | "standard" | null;
  /** 간편장부가 추계 신고와 같거나 유리해지는 최소 실제 경비 */
  breakEvenExpenses: number | null;
};

/** 부호를 유지한 10원 미만 버림 (환급도 10원 단위) */
function truncate10Signed(n: number): number {
  return n < 0 ? -truncate10(-n) : truncate10(n);
}

/** 0.1% 단위 비율 적용 (원 미만 버림) */
function applyPermille(amount: number, permille: number): number {
  return Math.floor((amount * permille) / 1000);
}

/** 대상 판정 */
export function eligibility(input: IncomeTaxInput, policy = policyFor(input.year)): Eligibility {
  const prev = input.isNew ? 0 : input.prevRevenue;
  const doubleEntry = !input.isNew && prev >= policy.doubleEntryThreshold;
  let simpleReason: Eligibility["simpleReason"] = "ok";
  if (doubleEntry) simpleReason = "doubleEntry";
  else if (input.revenue >= policy.doubleEntryThreshold) simpleReason = "currentOver";
  else if (!input.isNew && prev >= policy.simpleThreshold) simpleReason = "prevOver";
  return {
    doubleEntry,
    simple: simpleReason === "ok",
    smallBusiness: input.isNew || prev < policy.smallBusinessThreshold,
    simpleReason,
  };
}

/** 단순경비율 필요경비: 4,000만원 초과분은 초과율 */
export function simpleExpenses(revenue: number, rates: Rates, policy: IncomeTaxPolicy): number {
  const base = Math.min(revenue, policy.simpleExcessFrom);
  const excess = Math.max(0, revenue - policy.simpleExcessFrom);
  return applyPermille(base, rates.simple) + applyPermille(excess, rates.simpleExcess);
}

/** 인적공제 + 연금보험료공제 */
export function totalDeductions(input: IncomeTaxInput, policy: IncomeTaxPolicy): number {
  const people = 1 + Math.max(0, input.dependents);
  const elderly = Math.min(Math.max(0, input.elderly), people);
  const disabled = Math.min(Math.max(0, input.disabled), people);
  return (
    people * policy.basicDeduction +
    elderly * policy.elderlyDeduction +
    disabled * policy.disabledDeduction +
    Math.max(0, input.pension)
  );
}

type Settle = Pick<
  MethodResult,
  "deductions" | "taxBase" | "computedTax" | "taxCredit" | "penalty" | "determinedTax" | "localTax"
>;

/** 사업소득금액 → 결정세액 · 지방소득세 */
function settle(
  income: number,
  revenue: number,
  deductions: number,
  noBook: boolean,
  policy: IncomeTaxPolicy,
): Settle {
  const taxBase = Math.max(0, Math.floor(income - deductions));
  const computedTax = Math.floor(progressiveTax(taxBase));
  const taxCredit = Math.min(policy.standardTaxCredit, computedTax);
  const penalty = noBook
    ? Math.max(
        Math.floor((computedTax * policy.noBookPenaltyPct) / 100),
        Math.floor((revenue * policy.noBookRevenuePermyriad) / 10_000),
      )
    : 0;
  const determinedTax = truncate10(computedTax - taxCredit + penalty);
  const localTax = truncate10((determinedTax * policy.localRatePct) / 100);
  return { deductions, taxBase, computedTax, taxCredit, penalty, determinedTax, localTax };
}

function method(
  kind: MethodKind,
  eligible: boolean,
  expenses: number,
  income: number,
  capped: boolean,
  s: Settle,
  prepaid: number,
  prepaidLocal: number,
): MethodResult {
  const payable = truncate10Signed(s.determinedTax - prepaid);
  const localPayable = truncate10Signed(s.localTax - prepaidLocal);
  return {
    kind,
    eligible,
    expenses,
    income,
    capped,
    ...s,
    payable,
    localPayable,
    totalPayable: payable + localPayable,
  };
}

/** 간편장부 방식 하나만 계산 (역산 탐색에도 쓴다) */
function ledgerMethod(
  input: IncomeTaxInput,
  expenses: number,
  policy: IncomeTaxPolicy,
  prepaid: number,
  prepaidLocal: number,
): MethodResult {
  const exp = Math.max(0, Math.floor(expenses));
  const income = Math.max(0, input.revenue - exp);
  const s = settle(income, input.revenue, totalDeductions(input, policy), false, policy);
  return method("ledger", true, exp, income, false, s, prepaid, prepaidLocal);
}

/** 원천징수된 소득세 · 지방소득세 */
export function prepaidTaxes(input: IncomeTaxInput): { prepaid: number; prepaidLocal: number } {
  const prepaid =
    input.prepaid ?? truncate10((input.revenue * WITHHOLDING_POLICY.businessRatePct) / 100);
  const prepaidLocal = truncate10((prepaid * WITHHOLDING_POLICY.localRatePct) / 100);
  return { prepaid, prepaidLocal };
}

export function calculate(input: IncomeTaxInput): IncomeTaxResult {
  const policy = policyFor(input.year);
  const el = eligibility(input, policy);
  const { prepaid, prepaidLocal } = prepaidTaxes(input);
  const deductions = totalDeductions(input, policy);
  const revenue = Math.max(0, input.revenue);

  // 단순경비율
  const sExp = simpleExpenses(revenue, input.rates, policy);
  const sIncome = Math.max(0, revenue - sExp);
  const simple = method(
    "simple",
    el.simple,
    sExp,
    sIncome,
    false,
    settle(sIncome, revenue, deductions, !el.smallBusiness, policy),
    prepaid,
    prepaidLocal,
  );

  // 기준경비율: min(수입 − 주요경비 − 수입 × 기준경비율, 단순경비율 소득금액 × 배율)
  const major = Math.max(0, Math.floor(input.majorExpenses));
  const stdIncomeRaw = Math.max(0, revenue - major - applyPermille(revenue, input.rates.standard));
  const cap = Math.floor((sIncome * policy.standardCapMultiplierX10) / 10);
  const capped = cap < stdIncomeRaw;
  const stdIncome = capped ? cap : stdIncomeRaw;
  const standard = method(
    "standard",
    !el.simple && !el.doubleEntry,
    revenue - stdIncome,
    stdIncome,
    capped,
    settle(stdIncome, revenue, deductions, !el.smallBusiness, policy),
    prepaid,
    prepaidLocal,
  );

  const methods: MethodResult[] = [simple, standard];
  if (input.actualExpenses !== null) {
    methods.push(ledgerMethod(input, input.actualExpenses, policy, prepaid, prepaidLocal));
  }

  const eligibleMethods = methods.filter((m) => m.eligible);
  const best = eligibleMethods.length
    ? eligibleMethods.reduce((a, b) => (b.totalPayable < a.totalPayable ? b : a)).kind
    : null;

  const estimateKind = el.doubleEntry ? null : el.simple ? "simple" : "standard";
  const estimate = estimateKind === "simple" ? simple : estimateKind === "standard" ? standard : null;

  return {
    input,
    policy,
    eligibility: el,
    prepaid,
    prepaidLocal,
    methods,
    best,
    estimateKind,
    breakEvenExpenses: estimate
      ? breakEven(input, estimate.totalPayable, policy, prepaid, prepaidLocal)
      : null,
  };
}

/** 간편장부 합계 부담이 target 이하가 되는 최소 실제 경비 (이분 탐색).
 *  경비가 늘면 소득금액이 줄어 세액은 줄거나 같으므로 단조다. */
function breakEven(
  input: IncomeTaxInput,
  target: number,
  policy: IncomeTaxPolicy,
  prepaid: number,
  prepaidLocal: number,
): number | null {
  const total = (e: number) => ledgerMethod(input, e, policy, prepaid, prepaidLocal).totalPayable;
  let hi = Math.max(0, input.revenue);
  if (total(hi) > target) return null;
  let lo = 0;
  if (total(lo) <= target) return 0;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (total(mid) <= target) hi = mid;
    else lo = mid;
  }
  return hi;
}
