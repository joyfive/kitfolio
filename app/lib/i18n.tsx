"use client";

/* ============================================================
   Kitfolio — i18n (KO / EN), route-driven.

   언어는 URL로 결정됩니다 (KO=루트, EN=/en). 각 서브트리의 레이아웃이
   <LangProvider lang="..."> 로 고정 언어를 주입하고, 컴포넌트는 useLang()/
   useT()로 읽습니다. localStorage 토글이 아니라 URL 전환(LangToggle)으로
   언어를 바꾸므로 서버 렌더가 언어별로 정확히 일치합니다 (SEO 정합).

   역할 분담:
   - 렌더링 콘텐츠 텍스트(페이지 카피·FAQ·메타) → lib/content.ts (단일 출처)
   - UI 마이크로카피 — 전역 공통(헤더 네비·푸터·공용 버튼)은 여기 COMMON,
     도구별 컨트롤 라벨은 각 컴포넌트의 로컬 DICT.
   ============================================================ */
import { createContext, useCallback, useContext } from "react";

export type Lang = "ko" | "en";
export type Dict = Partial<Record<Lang, Record<string, string>>>;

/** 전역 공통 UI 마이크로카피 — t() 의 fallback 사전 */
const COMMON: Record<Lang, Record<string, string>> = {
  en: {
    "nav.all": "All tools",
    "nav.dev": "Developer",
    "nav.design": "Design",
    "nav.text": "Text",
    "header.search": "Search tools…",
    "header.favorites": "Favorites",
    "common.copy": "Copy",
    "common.copied": "Copied",
    "common.clear": "Clear",
    "common.paste": "Paste",
    "common.sample": "Sample",
    "common.privacy": "Runs entirely in your browser — nothing is uploaded.",
    "foot.tools": "Tools",
    "foot.about": "About",
    "foot.privacy": "Privacy",
    "foot.feedback": "Feedback",
    "foot.madeby": "Small tools for modern knowledge workers",
  },
  ko: {
    "nav.all": "전체 도구",
    "nav.dev": "개발",
    "nav.design": "디자인",
    "nav.text": "텍스트",
    "header.search": "도구 검색…",
    "header.favorites": "즐겨찾기",
    "common.copy": "복사",
    "common.copied": "복사됨",
    "common.clear": "지우기",
    "common.paste": "붙여넣기",
    "common.sample": "예시",
    "common.privacy": "모든 처리는 브라우저 안에서만 — 어떤 데이터도 전송되지 않습니다.",
    "foot.tools": "도구",
    "foot.about": "소개",
    "foot.privacy": "개인정보",
    "foot.feedback": "피드백",
    "foot.madeby": "일하는 사람을 위한 작은 웹 도구",
  },
};

/** URL 경로에서 언어 도출 (KO=루트, EN=/en). 루트 layout의 공통 헤더/푸터처럼
 *  LangProvider 서브트리 바깥에서 렌더되는 컴포넌트가 사용한다. */
export function routeLang(pathname: string): Lang {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "ko";
}

const LangCtx = createContext<Lang>("ko");

export function LangProvider({
  lang,
  children,
}: {
  lang: Lang;
  children: React.ReactNode;
}) {
  return <LangCtx.Provider value={lang}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return { lang: useContext(LangCtx) };
}

/** 현재 언어 + 페이지 dict 에 바인딩된 translator. */
export function useT(dict?: Dict) {
  const lang = useContext(LangCtx);
  return useCallback(
    (key: string) =>
      dict?.[lang]?.[key] ??
      COMMON[lang]?.[key] ??
      dict?.en?.[key] ??
      COMMON.en?.[key] ??
      key,
    [lang, dict],
  );
}
