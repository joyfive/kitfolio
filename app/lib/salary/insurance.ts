/* ============================================================
   실수령 계산 — 4대보험 정책 데이터 (적용 기준일 기반)

   ⚠️ UI·계산식과 분리된 "정책 데이터" 레이어입니다.
   요율이 바뀌면 이 파일의 표에 새 기간을 추가하기만 하면 되고,
   계산식(calculator.ts)과 화면(SalaryCalculator.tsx)은 손대지 않습니다.

   ── 왜 "연도"가 아니라 "기간"인가 ──
   두 종류의 기준이 서로 다른 날짜에 바뀌기 때문입니다.
   · 보험 요율        : 매년 1월 1일 개정
   · 국민연금 기준소득월액 상·하한 : 매년 7월 1일 개정
   연도 하나로는 "2026년 6월"과 "2026년 7월"의 차이를 표현할 수 없어
   effectiveFrom / effectiveTo 기간 테이블 두 벌로 나눠 관리합니다.

   ── 근로자 부담분 기준 (사업주 부담분 제외) ──
   · 국민연금  : 기준소득월액 × 4.75%  (2026년 기준, 총 9.5%의 절반)
   · 건강보험  : 보수월액 × 3.595%     (2026년 기준, 총 7.19%의 절반)
   · 장기요양  : 건강보험료 × 13.14%   (2026년 기준, 소득 대비 0.9448%)
   · 고용보험  : 보수월액 × 0.9%       (실업급여분, 2022년 7월 이후 동결)

   출처는 아래 OFFICIAL_SOURCES 참고 — 공식 기관 자료만 사용합니다.
   요율은 모두 "예상값"이며 실제 급여명세서와 차이가 있을 수 있습니다.

   모든 계산은 브라우저 안에서만 이루어집니다. 서버 전송 없음.
   ============================================================ */

/** 근로자 부담 요율 묶음 */
export type InsuranceRates = {
  /** 국민연금 근로자 부담 요율 (기준소득월액 기준) */
  nationalPension: number;
  /** 건강보험 근로자 부담 요율 (보수월액 기준) */
  healthInsurance: number;
  /** 장기요양보험 요율 (건강보험료 기준) */
  longTermCare: number;
  /** 고용보험 근로자 부담 요율 (보수월액 기준) */
  employmentInsurance: number;
};

/** 요율 적용 기간 — effectiveTo 가 없으면 "현재까지 적용 중" */
export type InsuranceRatePeriod = {
  /** 적용 시작일 (YYYY-MM-DD, 포함) */
  effectiveFrom: string;
  /** 적용 종료일 (YYYY-MM-DD, 포함). 생략 시 무기한 */
  effectiveTo?: string;
  /** 화면 표기용 짧은 라벨 */
  label: string;
  rates: InsuranceRates;
};

/** 국민연금 기준소득월액 상·하한 적용 기간 (매년 7월 개정) */
export type PensionBasePeriod = {
  effectiveFrom: string;
  effectiveTo?: string;
  label: string;
  /** 기준소득월액 하한 (월) */
  lowerLimit: number;
  /** 기준소득월액 상한 (월) */
  upperLimit: number;
};

/** 이 정책 데이터를 사람이 마지막으로 공식 자료와 대조한 날짜 */
export const POLICY_VERIFIED_AT = "2026-08-18";

/** 공식 출처 — 기관 1차 자료만. 블로그·타사 계산기는 사용하지 않는다. */
export const OFFICIAL_SOURCES: { label: { ko: string; en: string }; url: string }[] = [
  {
    label: { ko: "국민연금공단 — 연금보험료 및 기준소득월액", en: "National Pension Service — contribution rate and standard monthly income" },
    url: "https://www.nps.or.kr/jsppage/info/easy/easy_04_01.jsp",
  },
  {
    label: { ko: "국민건강보험공단 — 보험료율 안내", en: "National Health Insurance Service — contribution rates" },
    url: "https://www.nhis.or.kr/nhis/policy/wbhadc00701m01.do",
  },
  {
    label: { ko: "보건복지부 — 2026년 건강보험료율·장기요양보험료율 보도자료", en: "Ministry of Health and Welfare — 2026 health and long-term care insurance rates" },
    url: "https://www.mohw.go.kr/board.es?mid=a10503000000&bid=0027",
  },
  {
    label: { ko: "고용노동부 — 고용보험료율", en: "Ministry of Employment and Labor — employment insurance rates" },
    url: "https://www.moel.go.kr/policy/policyinfo/lobar/list4.do",
  },
  {
    label: { ko: "국세청 — 근로소득 간이세액표", en: "National Tax Service — simplified withholding tax table" },
    url: "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2233&cntntsId=7666",
  },
];

/**
 * 보험 요율 — 매년 1월 1일 개정. 최신 기간이 배열 뒤쪽에 오도록 유지한다.
 *
 * 2026년 개정 내용:
 * · 국민연금 9% → 9.5% (연금개혁에 따른 단계적 인상 1년차, 근로자 4.75%)
 * · 건강보험 7.09% → 7.19% (근로자 3.595%)
 * · 장기요양 건강보험료 대비 12.95% → 13.14% (소득 대비 0.9182% → 0.9448%)
 * · 고용보험(실업급여) 근로자 0.9% 동결
 */
export const RATE_PERIODS: InsuranceRatePeriod[] = [
  {
    effectiveFrom: "2025-01-01",
    effectiveTo: "2025-12-31",
    label: "2025",
    rates: {
      nationalPension: 0.045,
      healthInsurance: 0.03545,
      longTermCare: 0.1295,
      employmentInsurance: 0.009,
    },
  },
  {
    effectiveFrom: "2026-01-01",
    label: "2026",
    rates: {
      nationalPension: 0.0475,
      healthInsurance: 0.03595,
      longTermCare: 0.1314,
      employmentInsurance: 0.009,
    },
  },
];

/**
 * 국민연금 기준소득월액 상·하한 — 매년 7월 1일 개정 (A값 변동률 연동).
 * 요율과 개정 시점이 달라 별도 표로 관리한다.
 */
export const PENSION_BASE_PERIODS: PensionBasePeriod[] = [
  {
    effectiveFrom: "2024-07-01",
    effectiveTo: "2025-06-30",
    label: "2024.07–2025.06",
    lowerLimit: 390_000,
    upperLimit: 6_170_000,
  },
  {
    effectiveFrom: "2025-07-01",
    effectiveTo: "2026-06-30",
    label: "2025.07–2026.06",
    lowerLimit: 400_000,
    upperLimit: 6_370_000,
  },
  {
    effectiveFrom: "2026-07-01",
    effectiveTo: "2027-06-30",
    label: "2026.07–2027.06",
    lowerLimit: 410_000,
    upperLimit: 6_590_000,
  },
];

/** 특정 시점에 적용되는 보험 정책 한 벌 (요율 + 기준소득월액 + 표기용 라벨) */
export type InsurancePolicy = InsuranceRates & {
  /** 국민연금 기준소득월액 하한 (월) */
  pensionLowerLimit: number;
  /** 국민연금 기준소득월액 상한 (월) */
  pensionUpperLimit: number;
  /** 요율 기준 라벨 (예: "2026") */
  rateLabel: string;
  /** 기준소득월액 기준 라벨 (예: "2026.07–2027.06") */
  pensionBaseLabel: string;
  /** 실제 적용 기준일 (YYYY-MM-DD) */
  asOf: string;
};

/** Date | "YYYY-MM-DD" → "YYYY-MM-DD" (로컬 시간 기준) */
export function toIsoDate(date: Date | string): string {
  if (typeof date === "string") return date.slice(0, 10);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** ISO 날짜 문자열은 사전순 비교 = 시간순 비교 */
function pick<T extends { effectiveFrom: string; effectiveTo?: string }>(
  periods: T[],
  iso: string,
): T {
  const hit = periods.find(
    (p) => iso >= p.effectiveFrom && (!p.effectiveTo || iso <= p.effectiveTo),
  );
  if (hit) return hit;
  // 표 범위 밖: 이전이면 가장 이른 기간, 이후면 가장 늦은 기간으로 폴백
  const first = periods[0];
  const last = periods[periods.length - 1];
  return iso < first.effectiveFrom ? first : last;
}

/** 해당 시점의 근로자 부담 요율 */
export function ratesOn(date: Date | string): InsuranceRates {
  return pick(RATE_PERIODS, toIsoDate(date)).rates;
}

/** 해당 시점의 국민연금 기준소득월액 상·하한 */
export function pensionBaseOn(date: Date | string): PensionBasePeriod {
  return pick(PENSION_BASE_PERIODS, toIsoDate(date));
}

/** 해당 시점에 적용되는 보험 정책 한 벌 — 계산 엔진의 단일 진입점 */
export function policyOn(date: Date | string): InsurancePolicy {
  const iso = toIsoDate(date);
  const rate = pick(RATE_PERIODS, iso);
  const base = pick(PENSION_BASE_PERIODS, iso);
  return {
    ...rate.rates,
    pensionLowerLimit: base.lowerLimit,
    pensionUpperLimit: base.upperLimit,
    rateLabel: rate.label,
    pensionBaseLabel: base.label,
    asOf: iso,
  };
}
