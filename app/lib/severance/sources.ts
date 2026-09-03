/* ============================================================
   퇴직금 계산: 공식 출처 · 검증일

   퇴직금 산식과 지급 요건, IRP 이전 의무와 예외는 모두 외부 기준(법령·
   행정 안내)에 의존한다. 화면에 노출되는 출처는 이 파일이 단일 출처이며,
   content.ts 의 레지스트리가 여기서 가져다 쓴다 (중복 기재 금지).

   기관·표준 1차 자료만 싣는다. 개인 블로그·타사 계산기는 쓰지 않는다.
   ============================================================ */

/** 이 도구의 기준 정보를 사람이 마지막으로 공식 자료와 대조한 날짜 */
export const SEVERANCE_VERIFIED_AT = "2026-08-27";

/** 공식 출처: 기관 1차 자료만 */
export const SEVERANCE_SOURCES: {
  label: { ko: string; en: string };
  url: string;
}[] = [
  {
    label: {
      ko: "고용노동부 · 퇴직금 계산기 (내 퇴직금 계산해 보기)",
      en: "Ministry of Employment and Labor · official severance pay calculator",
    },
    url: "https://www.moel.go.kr/retirementpayCal.do",
  },
  {
    label: {
      ko: "국가법령정보센터 · 근로자퇴직급여 보장법",
      en: "Korean Law Information Center · Employee Retirement Benefit Security Act",
    },
    url: "https://www.law.go.kr/법령/근로자퇴직급여보장법",
  },
  {
    label: {
      ko: "국가법령정보센터 · 근로기준법 (평균임금·통상임금 정의)",
      en: "Korean Law Information Center · Labor Standards Act (average and ordinary wage)",
    },
    url: "https://www.law.go.kr/법령/근로기준법",
  },
  {
    label: {
      ko: "금융감독원 통합연금포털 · 개인형 IRP 안내",
      en: "Financial Supervisory Service pension portal · individual retirement pension (IRP)",
    },
    url: "https://100lifeplan.fss.or.kr",
  },
];
