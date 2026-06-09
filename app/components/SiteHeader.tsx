"use client";

import Link from "next/link";
import { localizedHref } from "../lib/content";
import { useLang, useT } from "../lib/i18n";
import LangToggle from "./LangToggle";

type Cat = "all" | "dev" | "design" | "text";

/** 도구 페이지 공통 헤더. 허브는 검색·즐겨찾기 상태가 있어 자체 헤더를 사용. */
export default function SiteHeader({
  active,
  dark = false,
}: {
  active?: Cat;
  dark?: boolean;
}) {
  const { lang } = useLang();
  const t = useT();
  const home = localizedHref(lang, "/");
  const items: { cat: Cat; key: string }[] = [
    { cat: "all", key: "nav.all" },
    { cat: "dev", key: "nav.dev" },
    { cat: "design", key: "nav.design" },
    { cat: "text", key: "nav.text" },
  ];

  return (
    <header className={"kf-header" + (dark ? " is-dark" : "")}>
      <Link className="kf-brand" href={home}>
        <span className="kf-logomark">K</span>
        <span className="kf-brand-name">Kitfolio</span>
      </Link>
      <nav className="kf-nav">
        {items.map((it) => (
          <Link
            key={it.cat}
            href={home}
            className={active === it.cat ? "is-active" : ""}
          >
            {t(it.key)}
          </Link>
        ))}
      </nav>
      <div className="kf-header-spacer" />
      <div className="kf-header-actions">
        <LangToggle />
      </div>
    </header>
  );
}
