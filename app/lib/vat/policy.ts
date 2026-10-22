/* ============================================================
   부가세 계산: 정책 데이터

   ⚠️ UI·계산식과 분리된 "정책 데이터" 레이어입니다.
   세율·부가가치율·공제율·기준 금액이 바뀌면 이 파일만 고칩니다.
   계산식(calculator.ts)과 화면(VatCalculator.tsx)은 손대지 않습니다.

   ── 근거 조문 (2026-10-22 원문 대조) ──
   · 세율 10%                           : 부가가치세법 제30조
   · 포함 여부 불분명 시 × 100/110       : 부가가치세법 제29조 제7항
   · 간이 납부세액 = 공급대가 × 부가가치율 × 10% : 부가가치세법 제63조 제2항
   · 업종별 부가가치율 6구분             : 부가가치세법 시행령 제111조 제2항 표
   · 매입공제 = 세금계산서등 수취 공급대가 × 0.5% : 부가가치세법 제63조 제3항 제1호
   · 공제 합계가 납부세액 초과 시 초과분 없음 : 부가가치세법 제63조 제6항
   · 신용카드 등 발행세액공제           : 부가가치세법 제46조 제1항 제3호
       (1%·연 500만원, 2026. 12. 31. 까지 1.3%·연 1천만원)
   · 간이과세 기준 1억 400만원           : 부가가치세법 제61조 제1항 · 시행령 제109조 제1항
       (2024. 2. 29. 개정, 2024. 7. 1. 부터 적용: 개정 부칙 사항이라 2차 자료 기준)
   · 부동산임대업·과세유흥장소 4,800만원 : 부가가치세법 제61조 제1항 제3호
   · 납부의무 면제 4,800만원 미만        : 부가가치세법 제69조 제1항
   · 12개월 환산 · 1개월 미만 끝수 1개월  : 부가가치세법 제69조 제3항
   · 10원 미만 끝수 버림                 : 국고금 관리법 제47조 제1항

   개정되면 값을 덮어쓰지 말고 적용 기간을 나눠 기록합니다
   (salary/insurance.ts 의 기간 테이블 방식).
   ============================================================ */

/** 부가가치세율 (%) */
export const VAT_RATE_PCT = 10;

/** 간이과세 매입공제율: 세금계산서등 수취 공급대가의 1000분의 5 (0.5%) */
export const PURCHASE_CREDIT_PERMILLE = 5;

/** 화면 업종 선택지. 시행령 제111조 제2항 표의 6구분을 따르되,
 *  간이과세 기준 금액이 다른 부동산임대업(5구분 소속)만 따로 뺀다. */
export type IndustryId =
  | "retail"
  | "manufacturing"
  | "lodging"
  | "construction"
  | "professional"
  | "rental"
  | "otherService";

export type Industry = {
  id: IndustryId;
  /** 시행령 제111조 제2항 표의 구분 번호 */
  row: number;
  /** 부가가치율 (%) */
  valueAddedPct: number;
  /** 시행령 제109조 제2항으로 간이과세가 배제될 수 있는 업종이 섞여 있는가 */
  mayBeExcluded: boolean;
  /** 부동산임대업: 간이과세 기준 금액이 4,800만원 (법 제61조 제1항 제3호) */
  rental: boolean;
};

export const INDUSTRIES: Industry[] = [
  { id: "retail", row: 1, valueAddedPct: 15, mayBeExcluded: false, rental: false },
  { id: "manufacturing", row: 2, valueAddedPct: 20, mayBeExcluded: true, rental: false },
  { id: "lodging", row: 3, valueAddedPct: 25, mayBeExcluded: false, rental: false },
  { id: "construction", row: 4, valueAddedPct: 30, mayBeExcluded: true, rental: false },
  { id: "professional", row: 5, valueAddedPct: 40, mayBeExcluded: true, rental: false },
  { id: "rental", row: 5, valueAddedPct: 40, mayBeExcluded: false, rental: true },
  { id: "otherService", row: 6, valueAddedPct: 30, mayBeExcluded: false, rental: false },
];

export function industryById(id: IndustryId): Industry {
  return INDUSTRIES.find((x) => x.id === id) ?? INDUSTRIES[0];
}

/** 날짜에 따라 바뀌는 간이과세 정책. 기간은 양 끝 포함, ISO 날짜 문자열. */
export type SimplifiedPeriod = {
  effectiveFrom: string;
  effectiveTo: string | null;
  /** 간이과세 적용 기준: 직전 연도 공급대가 합계가 이 금액 미만 */
  threshold: number;
  /** 부동산임대업·과세유흥장소 기준 */
  rentalThreshold: number;
  /** 납부의무 면제: 해당 과세기간 공급대가 합계가 이 금액 미만 */
  exemptionThreshold: number;
};

export const SIMPLIFIED_PERIODS: SimplifiedPeriod[] = [
  {
    effectiveFrom: "2021-07-01",
    effectiveTo: "2024-06-30",
    threshold: 80_000_000,
    rentalThreshold: 48_000_000,
    exemptionThreshold: 48_000_000,
  },
  {
    effectiveFrom: "2024-07-01",
    effectiveTo: null,
    threshold: 104_000_000,
    rentalThreshold: 48_000_000,
    exemptionThreshold: 48_000_000,
  },
];

/** 신용카드 등 발행세액공제 (법 제46조 제1항 제3호). 한도는 연간. */
export type CardCreditPeriod = {
  effectiveFrom: string;
  effectiveTo: string | null;
  /** 발급금액 대비 공제율 (1000분율) */
  permille: number;
  /** 연간 한도 */
  annualCap: number;
};

export const CARD_CREDIT_PERIODS: CardCreditPeriod[] = [
  { effectiveFrom: "2024-01-01", effectiveTo: "2026-12-31", permille: 13, annualCap: 10_000_000 },
  { effectiveFrom: "2027-01-01", effectiveTo: null, permille: 10, annualCap: 5_000_000 },
];

function pick<T extends { effectiveFrom: string; effectiveTo: string | null }>(
  periods: T[],
  date: string,
): T {
  const hit = periods.find(
    (p) => p.effectiveFrom <= date && (p.effectiveTo === null || date <= p.effectiveTo),
  );
  // 표 밖의 과거 날짜는 가장 이른 기간, 미래는 마지막 기간으로 본다.
  if (hit) return hit;
  return date < periods[0].effectiveFrom ? periods[0] : periods[periods.length - 1];
}

/** 기준일(YYYY-MM-DD)에 적용되는 간이과세 정책 */
export function simplifiedPolicyOn(date: string): SimplifiedPeriod {
  return pick(SIMPLIFIED_PERIODS, date);
}

/** 기준일(YYYY-MM-DD)에 적용되는 신용카드 등 발행세액공제 */
export function cardCreditOn(date: string): CardCreditPeriod {
  return pick(CARD_CREDIT_PERIODS, date);
}
