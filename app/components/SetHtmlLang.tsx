"use client";

import { useEffect } from "react";

/** EN 서브트리에서만 렌더 — document.documentElement.lang 을 'en'으로 바꾸고,
 *  벗어나면 'ko'로 복원한다.
 *
 *  ⚠️ 이것은 **hydration 이후에 실행되는 클라이언트 effect** 다.
 *  초기 SSR HTML 의 <html lang> 은 여전히 루트 레이아웃의 정적 "ko" 이며,
 *  이 컴포넌트는 그것을 바꾸지 못한다. 첫 응답부터 en 으로 표기되는 것은
 *  app/en/layout.tsx 의 lang="en" 래퍼와 헤더·푸터 엘리먼트뿐이다.
 *  루트 html lang 의 SSR 해결은 route group 재구성이 필요하며 미적용 상태. */
export default function SetHtmlLang({ lang }: { lang: "ko" | "en" }) {
  useEffect(() => {
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = "ko";
    };
  }, [lang]);
  return null;
}
