/* ============================================================
   실수령 계산 — 표시·반올림 헬퍼

   모든 출력은 원 단위 반올림.
   ============================================================ */

/** 원 단위 반올림 */
export function roundWon(n: number): number {
  return Math.round(n);
}

/** 천 단위 구분 숫자 문자열 ("3,421,550") */
export function formatNumber(n: number): string {
  return roundWon(n).toLocaleString("en-US");
}

/** 원 단위 표기 ("3,421,550원") */
export function formatWon(n: number): string {
  return `${formatNumber(n)}원`;
}
