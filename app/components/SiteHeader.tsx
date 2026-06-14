"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localizedHref } from "../lib/content";
import { LangProvider, routeLang, type Lang } from "../lib/i18n";
import LangToggle from "./LangToggle";

/** 전 페이지 공통 헤더 (루트 layout.tsx에서 렌더).
 *  브랜드 역할만 수행 — 로고(홈) + 언어 선택기. 탐색/필터는 홈에서 담당. */
export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const lang = routeLang(pathname);
  return (
    <LangProvider lang={lang}>
      <HeaderInner lang={lang} />
    </LangProvider>
  );
}

function HeaderInner({ lang }: { lang: Lang }) {
  const home = localizedHref(lang, "/");
  return (
    <header className="kf-header">
      <Link className="kf-brand" href={home}>
        <span className="kf-logomark">K</span>
        <span className="kf-brand-name">Kitfolio</span>
      </Link>
      <div className="kf-header-spacer" />
      <div className="kf-header-actions">
        <LangToggle />
      </div>
    </header>
  );
}
