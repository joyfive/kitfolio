"use client";

/* ============================================================
   Kitfolio — i18n (KO / EN), route-driven.

   언어는 URL로 결정됩니다 (KO=루트, EN=/en). 각 서브트리의 레이아웃이
   <LangProvider lang="..."> 로 고정 언어를 주입하고, 컴포넌트는 useLang()/
   useT()로 읽습니다. localStorage 토글이 아니라 URL 전환(LangToggle)으로
   언어를 바꾸므로 서버 렌더가 언어별로 정확히 일치합니다 (SEO 정합).

   모든 텍스트(공통 UI 포함)는 lib/content.ts 한 파일에서 관리합니다.
   여기서는 content.ts 의 COMMON 을 fallback 사전으로 사용하는
   t() 헬퍼만 제공합니다.
   ============================================================ */
import { createContext, useCallback, useContext } from "react";
import { COMMON } from "./content";

export type Lang = "ko" | "en";
export type Dict = Partial<Record<Lang, Record<string, string>>>;

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
