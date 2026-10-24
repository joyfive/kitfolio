/* ============================================================
   종합소득세 계산기: 공식 출처 · 검증일

   세율·공제·추계 규칙·가산세는 법령에, 경비율은 국세청 고시에 의존한다.
   화면에 노출되는 출처는 이 파일이 단일 출처이며,
   content.ts 의 레지스트리가 여기서 가져다 쓴다 (중복 기재 금지).

   기관·표준 1차 자료만 싣는다. 개인 블로그·타사 계산기는 쓰지 않는다.
   ============================================================ */

/** 이 도구의 기준 정보를 마지막으로 대조한 날짜 */
export const INCOMETAX_VERIFIED_AT = "2026-10-22";

/** 공식 출처: 기관 1차 자료만 */
export const INCOMETAX_SOURCES: {
  label: { ko: string; en: string };
  url: string;
}[] = [
  {
    label: {
      ko: "국가법령정보센터 · 소득세법 (제50조·제51조 인적공제 · 제55조 세율 · 제59조의4 표준세액공제 · 제80조 추계 · 제81조의5 가산세)",
      en: "Korean Law Information Center · Income Tax Act (Arts. 50-51 personal deductions, Art. 55 rates, Art. 59-4 standard credit, Art. 80 estimation, Art. 81-5 penalty)",
    },
    url: "https://www.law.go.kr/법령/소득세법",
  },
  {
    label: {
      ko: "국가법령정보센터 · 소득세법 시행령 (제143조 추계 경비율 · 제147조의2 소규모사업자 · 제208조 간편장부대상자)",
      en: "Korean Law Information Center · Enforcement Decree of the Income Tax Act (Art. 143 expense rates, Art. 147-2 small businesses, Art. 208 simplified bookkeeping)",
    },
    url: "https://www.law.go.kr/법령/소득세법시행령",
  },
  {
    label: {
      ko: "국가법령정보센터 · 지방세법 (제103조의3 개인지방소득세 세율)",
      en: "Korean Law Information Center · Local Tax Act (Art. 103-3 local income tax rates)",
    },
    url: "https://www.law.go.kr/법령/지방세법",
  },
  {
    label: {
      ko: "국세청 · 종합소득세 기장의무와 추계신고 경비율 판단기준",
      en: "National Tax Service · Bookkeeping duty and expense-rate eligibility for estimated returns",
    },
    url: "https://www.nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=2230&cntntsId=7669",
  },
  {
    label: {
      ko: "국세청 홈택스 · 기준·단순경비율(업종코드) 조회",
      en: "NTS Hometax · Standard and simple expense rate lookup by industry code",
    },
    url: "https://www.hometax.go.kr",
  },
];
