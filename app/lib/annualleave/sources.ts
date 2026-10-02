/* ============================================================
   연차 계산: 공식 출처 · 검증일

   연차 발생 일수·소멸·적용 제외·회계연도 비례 산식은 모두 법령과
   고용노동부 해석에 의존한다. 화면에 노출되는 출처는 이 파일이 단일
   출처이며, content.ts 의 레지스트리가 여기서 가져다 쓴다 (중복 기재 금지).

   기관·표준 1차 자료만 싣는다. 개인 블로그·타사 계산기는 쓰지 않는다.
   ============================================================ */

/** 이 도구의 기준 정보를 사람이 마지막으로 원문과 대조한 날짜 */
export const ANNUAL_LEAVE_VERIFIED_AT = "2026-10-02";

/** 공식 출처: 기관 1차 자료만 */
export const ANNUAL_LEAVE_SOURCES: {
  label: { ko: string; en: string };
  url: string;
}[] = [
  {
    label: {
      ko: "국가법령정보센터 · 근로기준법 (제18조 단시간근로자 · 제60조 연차 유급휴가 · 제61조 사용 촉진)",
      en: "Korean Law Information Center · Labor Standards Act (Art. 18 part-time workers, Art. 60 annual paid leave, Art. 61 leave promotion)",
    },
    url: "https://www.law.go.kr/법령/근로기준법",
  },
  {
    label: {
      ko: "국가법령정보센터 · 근로기준법 시행령 ([별표 1] 4명 이하 사업장 적용 범위 · [별표 2] 단시간근로자 연차)",
      en: "Korean Law Information Center · Enforcement Decree of the Labor Standards Act (Annex 1 workplaces of 4 or fewer, Annex 2 part-time leave)",
    },
    url: "https://www.law.go.kr/법령/근로기준법시행령",
  },
  {
    label: {
      ko: "국가법령정보센터 · 민법 (제160조 역에 의한 기간 계산)",
      en: "Korean Law Information Center · Civil Act (Art. 160 calendar computation of periods)",
    },
    url: "https://www.law.go.kr/법령/민법",
  },
  {
    label: {
      ko: "고용노동부 · 1년 미만 근로자 등에 대한 연차휴가 보장 확대 관련 개정 근로기준법 설명자료 (2018-05)",
      en: "Ministry of Employment and Labor · Guide to the amended Labor Standards Act on annual leave for workers under one year (May 2018)",
    },
    url: "https://www.moel.go.kr",
  },
];
