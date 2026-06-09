"use client";

import { useEffect } from "react";

/** EN 서브트리에서만 렌더 — <html lang>을 'en'으로 바꾸고, 벗어나면 'ko'로 복원.
 *  (루트 레이아웃의 정적 lang="ko"가 기본값) */
export default function SetHtmlLang({ lang }: { lang: "ko" | "en" }) {
  useEffect(() => {
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = "ko";
    };
  }, [lang]);
  return null;
}
