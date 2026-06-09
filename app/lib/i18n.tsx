"use client";

/* ============================================================
   Kitfolio — i18n (KO / EN), route-driven.

   언어는 URL로 결정됩니다 (KO=루트, EN=/en). 각 서브트리의 레이아웃이
   <LangProvider lang="..."> 로 고정 언어를 주입하고, 컴포넌트는 useLang()/
   useT()로 읽습니다. localStorage 토글이 아니라 URL 전환(LangToggle)으로
   언어를 바꾸므로 서버 렌더가 언어별로 정확히 일치합니다 (SEO 정합).

   페이지 SEO 카피(제목·설명·키워드·가이드)는 lib/content.ts 에 있고,
   여기 COMMON 은 헤더/버튼 등 공통 UI 마이크로카피만 담습니다.
   ============================================================ */
import { createContext, useCallback, useContext } from "react";

export type Lang = "ko" | "en";
export type Dict = Partial<Record<Lang, Record<string, string>>>;

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
  },
};

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
