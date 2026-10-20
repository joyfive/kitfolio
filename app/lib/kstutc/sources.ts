/* ============================================================
   KST ↔ UTC 변환: 공식 출처 · 검증일

   KST = UTC+09:00 은 표준시에 관한 법률 제2조(동경 135도 표준자오선)에 근거한다.
   화면에 노출되는 출처는 이 파일이 단일 출처이며,
   content.ts 의 레지스트리가 여기서 가져다 쓴다 (중복 기재 금지).
   ============================================================ */

/** 이 도구의 기준 정보를 사람이 마지막으로 법령 원문과 대조한 날짜 */
export const KST_UTC_VERIFIED_AT = "2026-10-20";

/** 공식 출처: 기관 1차 자료만 */
export const KST_UTC_SOURCES: {
  label: { ko: string; en: string };
  url: string;
}[] = [
  {
    label: {
      ko: "국가법령정보센터 · 표준시에 관한 법률 (제2조 표준자오선 동경 135도)",
      en: "Korean Law Information Center · Act on Standard Time (Art. 2, standard meridian 135° E)",
    },
    url: "https://www.law.go.kr/법령/표준시에관한법률",
  },
];
