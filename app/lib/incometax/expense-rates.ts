/* ============================================================
   종합소득세 계산기: 업종별 경비율 (국세청 고시)

   경비율은 귀속연도마다 국세청이 고시한다 (보통 다음 해 3월).
   적용 기간이 1월 1일~12월 31일로 귀속연도와 같으므로 이 테이블은 연도가 키다.

   비율은 0.1% 단위 정수다 (64.1% → 641). 부동소수점 오차를 피한다.

   ⚠️ 고시가 아직 없는 연도(또는 이 파일에 아직 옮기지 않은 연도)는
   가장 최근 고시값으로 계산하고 화면에 "추정"으로 표시한다.
   사용자는 홈택스 "기준·단순경비율 조회" 값으로 언제든 바꿔 넣을 수 있다.
   ============================================================ */

export type ExpenseRate = {
  /** 업종코드 (국세청) */
  code: string;
  name: { ko: string; en: string };
  /** 단순경비율 일반율 (0.1% 단위) */
  simple: number;
  /** 단순경비율 초과율: 수입금액 4,000만원 초과분 (0.1% 단위) */
  simpleExcess: number;
  /** 기준경비율 일반율 (0.1% 단위) */
  standard: number;
};

export type ExpenseRateNotice = {
  /** 귀속연도 */
  year: number;
  /** 고시 번호 · 고시일 */
  notice: string;
  rates: ExpenseRate[];
};

export const EXPENSE_RATE_NOTICES: ExpenseRateNotice[] = [
  {
    year: 2024,
    notice: "국세청 고시 제2025-6호 (2025-03-28)",
    rates: [
      {
        code: "940909",
        name: { ko: "기타 자영업 (인적용역)", en: "Other self-employed services" },
        simple: 641,
        simpleExcess: 497,
        standard: 134,
      },
    ],
  },
];

/** 귀속연도의 고시. 그 해 고시가 없으면 가장 최근 고시를 돌려주고 estimated=true */
export function noticeFor(year: number): { notice: ExpenseRateNotice; estimated: boolean } {
  const exact = EXPENSE_RATE_NOTICES.find((n) => n.year === year);
  if (exact) return { notice: exact, estimated: false };
  const latest = [...EXPENSE_RATE_NOTICES]
    .filter((n) => n.year < year)
    .sort((a, b) => b.year - a.year)[0];
  return { notice: latest ?? EXPENSE_RATE_NOTICES[0], estimated: true };
}
