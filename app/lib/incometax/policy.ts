/* ============================================================
   종합소득세 계산기: 정책 데이터 (인적용역 사업소득 프리랜서)

   ⚠️ UI·계산식과 분리된 "정책 데이터" 레이어입니다.
   공제액·기준금액·가산세율이 바뀌면 이 파일만 고칩니다.
   세율표는 tax/brackets.ts, 원천징수율은 freelancer/policy.ts 가 단일 출처입니다.

   ── 근거 조문 (기획서 3.6 대조표 참고) ──
   · 기본공제 1인당 150만원          : 소득세법 제50조
   · 경로우대 100만 · 장애인 200만    : 소득세법 제51조
   · 연금보험료공제 (국민연금 전액)   : 소득세법 제51조의3
   · 표준세액공제 7만원               : 소득세법 제59조의4 제9항
   · 추계 소득금액 · 배율             : 소득세법 제80조 제3항 · 시행령 제143조 · 시행규칙 제67조
   · 단순경비율 기준 (인적용역 3,600만) : 시행령 제143조 제4항 (2023년 귀속부터)
   · 간편장부대상자 (서비스업 7,500만) : 시행령 제208조 제5항
   · 무기장가산세 (장부의 기록·보관 불성실가산세)
       max(산출세액 × 20%, 수입금액 × 7/10,000), 소규모사업자 제외
                                      : 소득세법 제81조의5 · 시행령 제147조의2
   · 개인지방소득세                   : 지방세법 제103조의3 (소득세 과세표준에 1/10 세율)

   귀속연도 기준으로 기간을 나눠 기록합니다. 값이 바뀌면 덮어쓰지 말고
   새 행을 추가합니다 (salary/insurance.ts 의 기간 테이블 방식).
   ============================================================ */

export type IncomeTaxPolicy = {
  /** 이 정책이 적용되기 시작하는 귀속연도 */
  fromYear: number;
  /** 기본공제: 1인당 */
  basicDeduction: number;
  /** 추가공제: 70세 이상 경로우대 1인당 */
  elderlyDeduction: number;
  /** 추가공제: 장애인 1인당 */
  disabledDeduction: number;
  /** 표준세액공제: 근로소득이 없는 종합소득자 */
  standardTaxCredit: number;
  /** 단순경비율 적용 기준: 직전연도 수입금액이 이 금액 미만 (인적용역) */
  simpleThreshold: number;
  /** 복식부기의무자 기준: 직전연도 수입금액이 이 금액 이상 (서비스업) */
  doubleEntryThreshold: number;
  /** 무기장가산세를 면제하는 소규모사업자 기준: 직전연도 수입금액이 이 금액 미만 */
  smallBusinessThreshold: number;
  /** 단순경비율 초과율이 적용되는 수입금액 경계 */
  simpleExcessFrom: number;
  /** 기준경비율 소득금액 상한 배율 (간편장부대상자) · 10배수 정수 (2.8배 → 28) */
  standardCapMultiplierX10: number;
  /** 무기장가산세: 산출세액 대비 (%) */
  noBookPenaltyPct: number;
  /** 무기장가산세 하한: 수입금액 대비 (만분율, 7 → 0.07%) */
  noBookRevenuePermyriad: number;
  /** 개인지방소득세: 소득세 대비 (%) */
  localRatePct: number;
};

export const INCOME_TAX_POLICIES: IncomeTaxPolicy[] = [
  {
    fromYear: 2023,
    basicDeduction: 1_500_000,
    elderlyDeduction: 1_000_000,
    disabledDeduction: 2_000_000,
    standardTaxCredit: 70_000,
    simpleThreshold: 36_000_000,
    doubleEntryThreshold: 75_000_000,
    smallBusinessThreshold: 48_000_000,
    simpleExcessFrom: 40_000_000,
    standardCapMultiplierX10: 28,
    noBookPenaltyPct: 20,
    noBookRevenuePermyriad: 7,
    localRatePct: 10,
  },
];

/** 귀속연도에 적용되는 정책 (가장 최근에 시작한 행) */
export function policyFor(year: number): IncomeTaxPolicy {
  const rows = INCOME_TAX_POLICIES.filter((p) => p.fromYear <= year).sort(
    (a, b) => b.fromYear - a.fromYear,
  );
  return rows[0] ?? INCOME_TAX_POLICIES[0];
}

/** 화면에서 고를 수 있는 귀속연도 (최근 것이 앞) */
export const TAX_YEARS = [2026, 2025] as const;
export type TaxYear = (typeof TAX_YEARS)[number];
