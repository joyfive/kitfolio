/* ============================================================
   부가세 계산: 공식 출처 · 검증일

   세율·부가가치율·공제율·기준 금액은 모두 법령에 의존한다.
   화면에 노출되는 출처는 이 파일이 단일 출처이며,
   content.ts 의 레지스트리가 여기서 가져다 쓴다 (중복 기재 금지).

   기관·표준 1차 자료만 싣는다. 개인 블로그·타사 계산기는 쓰지 않는다.
   ============================================================ */

/** 이 도구의 기준 정보를 사람이 마지막으로 법령 원문과 대조한 날짜 */
export const VAT_VERIFIED_AT = "2026-10-22";

/** 공식 출처: 기관 1차 자료만 */
export const VAT_SOURCES: {
  label: { ko: string; en: string };
  url: string;
}[] = [
  {
    label: {
      ko: "국가법령정보센터 · 부가가치세법 (제29조 과세표준 · 제30조 세율 · 제46조 신용카드 등 세액공제 · 제61조 간이과세 범위 · 제63조 간이과세자 세액 · 제69조 납부의무 면제)",
      en: "Korean Law Information Center · Value-Added Tax Act (Art. 29 tax base, Art. 30 rate, Art. 46 card credit, Art. 61 simplified scope, Art. 63 simplified tax, Art. 69 exemption)",
    },
    url: "https://www.law.go.kr/법령/부가가치세법",
  },
  {
    label: {
      ko: "국가법령정보센터 · 부가가치세법 시행령 (제109조 간이과세 적용 범위 · 제111조 업종별 부가가치율)",
      en: "Korean Law Information Center · Enforcement Decree of the VAT Act (Art. 109 simplified scope, Art. 111 value-added ratios)",
    },
    url: "https://www.law.go.kr/법령/부가가치세법시행령",
  },
  {
    label: {
      ko: "국가법령정보센터 · 국고금 관리법 (제47조 끝수 계산)",
      en: "Korean Law Information Center · National Treasury Management Act (Art. 47 rounding)",
    },
    url: "https://www.law.go.kr/법령/국고금관리법",
  },
];
