"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localizedHref } from "../lib/content";
import { LangProvider, routeLang, type Lang } from "../lib/i18n";
import LangToggle from "./LangToggle";
import { LogoMark } from "./Logo";

/** 전 페이지 공통 헤더 (루트 layout.tsx에서 렌더).
 *  브랜드 역할만 수행: 로고(홈) + 언어 선택기. 탐색/필터는 홈에서 담당. */
export default function SiteHeader({
  promptLangs,
}: {
  /** 언어별 공개된 업무 프롬프트 존재 여부 (서버 레이아웃이 계산해 넘긴다) */
  promptLangs: Record<Lang, boolean>;
}) {
  const pathname = usePathname() || "/";
  const lang = routeLang(pathname);
  return (
    <LangProvider lang={lang}>
      <HeaderInner lang={lang} showPrompts={promptLangs[lang]} />
    </LangProvider>
  );
}

function HeaderInner({ lang, showPrompts }: { lang: Lang; showPrompts: boolean }) {
  const home = localizedHref(lang, "/");
  return (
    // lang: 루트 레이아웃의 <html lang="ko"> 아래에서도 EN 라우트의 헤더가
    // 영어로 읽히도록 자기 엘리먼트에 언어를 선언한다 (SSR 초기 HTML 포함).
    <header className="kf-header" lang={lang}>
      <Link className="kf-brand" href={home}>
        <LogoMark title="Kitfolio" />
        <span className="kf-brand-name">Kitfolio</span>
      </Link>
      <div className="kf-header-spacer" />
      <div className="kf-header-actions">
        {showPrompts && (
          <Link className="kf-header-nav" href={localizedHref(lang, "/prompts")}>
            {lang === "ko" ? "프롬프트" : "Prompts"}
          </Link>
        )}
        <Link className="kf-header-nav" href={localizedHref(lang, "/blog")}>
          {lang === "ko" ? "블로그" : "Blog"}
        </Link>
        <LangToggle />
      </div>
    </header>
  );
}
