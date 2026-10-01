/* ============================================================
   프리랜서 3.3% 계산: 원천징수 정책 데이터

   ⚠️ UI·계산식과 분리된 "정책 데이터" 레이어입니다.
   세율·필요경비율·과세최저한이 바뀌면 이 파일만 고칩니다.
   계산식(calculator.ts)과 화면(FreelancerTaxCalculator.tsx)은 손대지 않습니다.

   ── 근거 조문 (2026-10-01 원문 대조) ──
   · 사업소득 원천징수세율 3%      : 소득세법 제129조 제1항 제3호
   · 기타소득 원천징수세율 20%     : 소득세법 제129조 제1항 제6호 라목
   · 원고료·강연료 필요경비 60%    : 소득세법 시행령 제87조 제1호의2
   · 기타소득 과세최저한 건별 5만원 : 소득세법 제84조 (2027.1.1 부터 제4호로 이동)
   · 소액 부징수 1천원 미만        : 소득세법 제86조 제1호
   · 소액 부징수 예외              : 소득세법 시행령 제149조의3
       (부가가치세법 제26조 제1항 제15호의 인적 용역을 계속적·반복적으로
        공급하고 받은 사업소득은 1천원 미만이어도 징수한다)
   · 지방소득세 = 소득세의 10%     : 지방세법 제103조의13 제1항
   · 10원 미만 끝수 버림            : 국고금 관리법 제47조 제1항 (지방자치단체 준용: 제3항)
   · 과세표준 1원 미만 끝수 버림     : 국고금 관리법 제47조 제2항

   세율은 오랫동안 바뀌지 않았지만, 개정되면 값을 덮어쓰지 말고
   적용 기간을 나눠 기록합니다 (salary/insurance.ts 의 기간 테이블 방식).
   ============================================================ */

/** 원천징수 정책 묶음. 비율은 모두 정수 백분율이라 부동소수점 오차가 없다. */
export type WithholdingPolicy = {
  /** 사업소득 원천징수세율 (%) */
  businessRatePct: number;
  /** 기타소득 원천징수세율 (%) */
  otherRatePct: number;
  /** 원고료·강연료 필요경비 의제율 (%) */
  otherExpensePct: number;
  /** 기타소득 과세최저한: 건별 기타소득금액이 이 금액 이하면 과세하지 않는다 */
  otherMinimumIncome: number;
  /** 소액 부징수 기준: 원천징수 소득세가 이 금액 미만이면 징수하지 않는다 */
  smallAmountThreshold: number;
  /** 사업소득에 소액 부징수를 적용하는가.
   *  계속적·반복적 인적용역 사업소득은 시행령 제149조의3 으로 제외되므로 false */
  businessSmallAmountExempt: boolean;
  /** 지방소득세율: 소득세 대비 (%) */
  localRatePct: number;
};

export const WITHHOLDING_POLICY: WithholdingPolicy = {
  businessRatePct: 3,
  otherRatePct: 20,
  otherExpensePct: 60,
  otherMinimumIncome: 50_000,
  smallAmountThreshold: 1_000,
  businessSmallAmountExempt: false,
  localRatePct: 10,
};
