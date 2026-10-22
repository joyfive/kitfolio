/* ============================================================
   실업급여(구직급여) 계산: 공식 출처 · 검증일

   상한·하한·소정급여일수·수급기간은 모두 고용보험법령과 최저임금 고시에
   의존한다. 화면에 노출되는 출처는 이 파일이 단일 출처이며, content.ts 의
   레지스트리가 여기서 가져다 쓴다 (중복 기재 금지).

   기관·표준 1차 자료만 싣는다. 개인 블로그·타사 계산기는 쓰지 않는다.

   ⚠️ 2026-10-22 값은 법령 인용 페이지·보도와 대조한 1차 확인이다.
   국가법령정보센터 원문 대조(docs/plans/unemployment-benefit-calculator.md 9장)를
   마치면 이 날짜를 대조일로 갱신한 뒤 indexable 승격을 검토한다.
   ============================================================ */

/** 이 도구의 기준 정보를 마지막으로 확인한 날짜 */
export const UNEMPLOYMENT_VERIFIED_AT = "2026-10-22";

/** 공식 출처: 기관 1차 자료만 */
export const UNEMPLOYMENT_SOURCES: {
  label: { ko: string; en: string };
  url: string;
}[] = [
  {
    label: {
      ko: "국가법령정보센터 · 고용보험법 (제40조 수급 요건 · 제45조 기초일액 · 제46조 구직급여일액 · 제48조 수급기간 · 제49조 대기기간 · 제50조 [별표 1] 소정급여일수 · 제64조 조기재취업수당)",
      en: "Korean Law Information Center · Employment Insurance Act (Art. 40 eligibility, Art. 45 base daily wage, Art. 46 daily benefit, Art. 48 benefit period, Art. 49 waiting period, Art. 50 and Annex 1 benefit days, Art. 64 early reemployment allowance)",
    },
    url: "https://www.law.go.kr/법령/고용보험법",
  },
  {
    label: {
      ko: "국가법령정보센터 · 고용보험법 시행령 (제68조 기초일액 상한)",
      en: "Korean Law Information Center · Enforcement Decree of the Employment Insurance Act (Art. 68 base daily wage cap)",
    },
    url: "https://www.law.go.kr/법령/고용보험법시행령",
  },
  {
    label: {
      ko: "국가법령정보센터 · 고용보험법 시행규칙 ([별표 2] 수급자격이 제한되지 않는 정당한 이직 사유)",
      en: "Korean Law Information Center · Enforcement Rule of the Employment Insurance Act (Annex 2 justified reasons for leaving)",
    },
    url: "https://www.law.go.kr/법령/고용보험법시행규칙",
  },
  {
    label: {
      ko: "고용노동부 · 최저임금 고시 (2024년 9,860원 · 2025년 10,030원 · 2026년 10,320원)",
      en: "Ministry of Employment and Labor · Minimum wage notices (KRW 9,860 for 2024, 10,030 for 2025, 10,320 for 2026)",
    },
    url: "https://www.moel.go.kr",
  },
  {
    label: {
      ko: "국가법령정보센터 · 고용노동부 행정규칙 (구직급여 하한액 산정의 1일 소정근로시간: 1시간 미만 올림)",
      en: "Korean Law Information Center · Ministry of Employment and Labor administrative rule (daily contracted hours for the benefit floor: part hours round up)",
    },
    url: "https://www.law.go.kr/LSW/admRulInfoP.do?admRulSeq=2100000232090",
  },
  {
    label: {
      ko: "고용24 · 조기재취업수당 안내 (실업 신고일부터 14일 경과 후 재취업)",
      en: "Work24 · Early reemployment allowance guide (new job after 14 days from registering as unemployed)",
    },
    url: "https://ei.work24.go.kr/ei/eih/eg/pb/pbPersonBnef/retrievePb0208Info.do",
  },
  {
    label: {
      ko: "고용24 · 구직급여 안내",
      en: "Work24 · Job-seeking benefit guide",
    },
    url: "https://www.work24.go.kr",
  },
];
