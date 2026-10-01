/* ============================================================
   프리랜서 3.3% 계산: 공식 출처 · 검증일

   세율·필요경비·과세최저한·소액 부징수는 모두 법령에 의존한다.
   화면에 노출되는 출처는 이 파일이 단일 출처이며,
   content.ts 의 레지스트리가 여기서 가져다 쓴다 (중복 기재 금지).

   기관·표준 1차 자료만 싣는다. 개인 블로그·타사 계산기는 쓰지 않는다.
   ============================================================ */

/** 이 도구의 기준 정보를 사람이 마지막으로 법령 원문과 대조한 날짜 */
export const FREELANCER_VERIFIED_AT = "2026-10-01";

/** 공식 출처: 기관 1차 자료만 */
export const FREELANCER_SOURCES: {
  label: { ko: string; en: string };
  url: string;
}[] = [
  {
    label: {
      ko: "국가법령정보센터 · 소득세법 (제84조 과세최저한 · 제86조 소액 부징수 · 제129조 원천징수세율)",
      en: "Korean Law Information Center · Income Tax Act (Art. 84 minimum, Art. 86 small amounts, Art. 129 withholding rates)",
    },
    url: "https://www.law.go.kr/법령/소득세법",
  },
  {
    label: {
      ko: "국가법령정보센터 · 소득세법 시행령 (제87조 필요경비 · 제149조의3 소액 부징수의 예외)",
      en: "Korean Law Information Center · Enforcement Decree of the Income Tax Act (Art. 87 expenses, Art. 149-3 exception)",
    },
    url: "https://www.law.go.kr/법령/소득세법시행령",
  },
  {
    label: {
      ko: "국가법령정보센터 · 지방세법 (제103조의13 개인지방소득세 특별징수)",
      en: "Korean Law Information Center · Local Tax Act (Art. 103-13 local income tax withholding)",
    },
    url: "https://www.law.go.kr/법령/지방세법",
  },
  {
    label: {
      ko: "국가법령정보센터 · 국고금 관리법 (제47조 끝수 계산)",
      en: "Korean Law Information Center · National Treasury Management Act (Art. 47 rounding)",
    },
    url: "https://www.law.go.kr/법령/국고금관리법",
  },
];
