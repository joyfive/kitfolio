/* ============================================================
   부가세 계산: 계산 엔진

   · grossFromSupply   : 공급가액 → 부가세·합계 (1원 미만 처리 선택)
   · supplyFromGross   : 합계 → 공급가액 (A. 합계 고정 · B. 정확 역산)
   · calculateSimplified : 간이과세자 납부세액·공제·납부 면제

   금액은 모두 원 단위 정수로 다룬다. `합계 / 1.1` 같은 소수 나눗셈은
   110000 / 1.1 = 99999.99999999999 처럼 오차가 나므로 쓰지 않고,
   정수 분자·분모로 곱한 뒤 한 번만 나눈다.

   모든 계산은 브라우저 안에서만 이루어집니다. 서버 전송 없음.
   ============================================================ */

import {
  VAT_RATE_PCT,
  PURCHASE_CREDIT_PERMILLE,
  industryById,
  simplifiedPolicyOn,
  cardCreditOn,
  type IndustryId,
} from "./policy";

/** general = 일반과세 · simplified = 간이과세 */
export type VatMode = "general" | "simplified";
export const VAT_MODES: VatMode[] = ["general", "simplified"];

/** 1원 미만 처리: 절사 · 반올림 · 올림 */
export type Rounding = "floor" | "round" | "ceil";
export const ROUNDINGS: Rounding[] = ["floor", "round", "ceil"];

/** 입력 상한: 1조 원. 금액 × 1000 도 안전한 정수 범위 안에 있다. */
export const MAX_AMOUNT = 1_000_000_000_000;

/** 0 이상의 정수 n / d 를 지정한 방식으로 정수로 만든다 */
export function divide(n: number, d: number, rounding: Rounding): number {
  const q = Math.floor(n / d);
  const r = n - q * d;
  if (r === 0 || rounding === "floor") return q;
  if (rounding === "ceil") return q + 1;
  return r * 2 >= d ? q + 1 : q;
}

/** 10원 미만 끝수 버림 (국고금 관리법 제47조 제1항) */
export function truncate10(won: number): number {
  return Math.floor(won / 10) * 10;
}

function clampWon(n: number): number {
  return Math.min(MAX_AMOUNT, Math.max(0, Math.floor(n)));
}

export type GeneralResult = {
  supply: number;
  vat: number;
  gross: number;
};

/** 공급가액 → 부가세·합계 */
export function grossFromSupply(supply: number, rounding: Rounding = "floor"): GeneralResult {
  const s = clampWon(supply);
  const vat = divide(s * VAT_RATE_PCT, 100, rounding);
  return { supply: s, vat, gross: s + vat };
}

export type ReverseResult = {
  gross: number;
  /** A. 합계 고정: 공급가액 = 합계 × 100/110 원 미만 반올림, 부가세 = 합계 − 공급가액 */
  inclusive: GeneralResult;
  /** B. 정확 역산: 공급가액 + 부가세(선택한 1원 미만 처리) = 합계 인 공급가액. 없으면 null */
  exact: GeneralResult | null;
  /** B 의 해가 없을 때 만들 수 있는 바로 아래·위 합계 */
  nearestBelow: GeneralResult | null;
  nearestAbove: GeneralResult | null;
};

/** 합계 → 공급가액 */
export function supplyFromGross(gross: number, rounding: Rounding = "floor"): ReverseResult {
  const g = clampWon(gross);
  const supplyA = divide(g * 100, 100 + VAT_RATE_PCT, "round");
  const inclusive = { supply: supplyA, vat: g - supplyA, gross: g };

  // 공급가액 + 부가세는 공급가액에 대해 강하게 증가하므로 해는 많아야 하나다.
  // 근사값 주변 몇 원만 보면 된다.
  const approx = divide(g * 100, 100 + VAT_RATE_PCT, "floor");
  let exact: GeneralResult | null = null;
  let nearestBelow: GeneralResult | null = null;
  let nearestAbove: GeneralResult | null = null;
  for (let s = Math.max(0, approx - 3); s <= approx + 3; s++) {
    const r = grossFromSupply(s, rounding);
    if (r.gross === g) exact = r;
    else if (r.gross < g) nearestBelow = r;
    else if (!nearestAbove) nearestAbove = r;
  }
  return {
    gross: g,
    inclusive,
    exact,
    nearestBelow: exact ? null : nearestBelow,
    nearestAbove: exact ? null : nearestAbove,
  };
}

export type SimplifiedInput = {
  industry: IndustryId;
  /** 과세기간 공급대가 합계 (부가세 포함 매출) */
  sales: number;
  /** 세금계산서·카드 영수증 등을 받은 매입 공급대가 */
  purchases: number;
  /** 신용카드·현금영수증 등으로 발행한 매출 */
  cardSales: number;
  /** 과세기간 중 영업한 개월 수 (1~12). 1개월 미만 끝수는 1개월로 입력 */
  months: number;
  /** 정책 기준일 YYYY-MM-DD */
  asOf: string;
};

export type SimplifiedResult = {
  valueAddedPct: number;
  /** 공제 전 납부세액 = 공급대가 × 부가가치율 × 10% (원 미만 버림) */
  payable: number;
  /** 매입공제 0.5% */
  purchaseCredit: number;
  /** 신용카드 등 발행세액공제 (한도 적용 후) */
  cardCredit: number;
  /** 카드 공제가 연간 한도에 걸렸는가 */
  cardCapped: boolean;
  /** 실제로 빠지는 공제 합계: 납부세액을 넘지 않는다 (제63조 제6항) */
  creditsApplied: number;
  /** 공제가 납부세액보다 커서 버려진 금액 (환급 없음) */
  creditsLost: number;
  /** 공제 후 납부세액 (10원 미만 버림), 면제 전 */
  netBeforeExemption: number;
  /** 최종 납부할 세액: 면제 대상이면 0 */
  due: number;
  /** 납부 면제 판단에 쓴 연 환산 공급대가 */
  annualizedSales: number;
  exempt: boolean;
  exemptionThreshold: number;
  /** 간이과세 적용 기준 (부동산임대업은 4,800만원) */
  simplifiedThreshold: number;
  /** 연 환산 공급대가가 간이과세 기준 이상인가: 다음 해 7월 1일부터 일반과세 전환 대상 */
  overThreshold: boolean;
  mayBeExcluded: boolean;
  cardPermille: number;
  cardAnnualCap: number;
  /** 같은 매출·매입을 일반과세자로 계산한 매출세액 − 매입세액 (공제 전, 음수면 환급) */
  generalComparison: number;
};

/** 간이과세자 납부세액 */
export function calculateSimplified(input: SimplifiedInput): SimplifiedResult {
  const industry = industryById(input.industry);
  const policy = simplifiedPolicyOn(input.asOf);
  const card = cardCreditOn(input.asOf);

  const sales = clampWon(input.sales);
  const purchases = clampWon(input.purchases);
  const cardSales = Math.min(clampWon(input.cardSales), sales);
  const months = Math.min(12, Math.max(1, Math.floor(input.months) || 12));

  const payable = Math.floor((sales * industry.valueAddedPct * VAT_RATE_PCT) / 10_000);
  const purchaseCredit = Math.floor((purchases * PURCHASE_CREDIT_PERMILLE) / 1_000);
  const cardRaw = Math.floor((cardSales * card.permille) / 1_000);
  const cardCredit = Math.min(cardRaw, card.annualCap);

  const credits = purchaseCredit + cardCredit;
  const creditsApplied = Math.min(credits, payable);
  const netBeforeExemption = truncate10(payable - creditsApplied);

  const annualizedSales = months === 12 ? sales : Math.floor((sales * 12) / months);
  const exempt = annualizedSales < policy.exemptionThreshold;
  const simplifiedThreshold = industry.rental ? policy.rentalThreshold : policy.threshold;

  const outputVat = Math.floor((sales * VAT_RATE_PCT) / (100 + VAT_RATE_PCT));
  const inputVat = Math.floor((purchases * VAT_RATE_PCT) / (100 + VAT_RATE_PCT));
  const diff = outputVat - inputVat;
  const generalComparison = diff >= 0 ? truncate10(diff) : -truncate10(-diff);

  return {
    valueAddedPct: industry.valueAddedPct,
    payable,
    purchaseCredit,
    cardCredit,
    cardCapped: cardRaw > card.annualCap,
    creditsApplied,
    creditsLost: credits - creditsApplied,
    netBeforeExemption,
    due: exempt ? 0 : netBeforeExemption,
    annualizedSales,
    exempt,
    exemptionThreshold: policy.exemptionThreshold,
    simplifiedThreshold,
    overThreshold: annualizedSales >= simplifiedThreshold,
    mayBeExcluded: industry.mayBeExcluded,
    cardPermille: card.permille,
    cardAnnualCap: card.annualCap,
    generalComparison,
  };
}
