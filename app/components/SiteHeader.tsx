"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TOOLS, localizedHref } from "../lib/content";
import { LangProvider, routeLang, useT, type Lang } from "../lib/i18n";
import LangToggle from "./LangToggle";

type Cat = "all" | "dev" | "design" | "text";

/** 전 페이지 공통 헤더 (루트 layout.tsx에서 렌더).
 *  언어·액티브 카테고리는 URL에서 도출한다. */
export default function SiteHeader() {
  const pathname = usePathname() || "/";
  const lang = routeLang(pathname);
  return (
    <LangProvider lang={lang}>
      <HeaderInner lang={lang} pathname={pathname} />
    </LangProvider>
  );
}

function HeaderInner({ lang, pathname }: { lang: Lang; pathname: string }) {
  const t = useT();
  const bare = pathname.startsWith("/en")
    ? pathname.slice(3) || "/"
    : pathname;
  const slug = bare.replace(/^\//, "");
  const active: Cat =
    bare === "/" ? "all" : (TOOLS.find((x) => x.slug === slug)?.cat ?? "all");
  const home = localizedHref(lang, "/");

  const items: { cat: Cat; key: string; hash: string }[] = [
    { cat: "all", key: "nav.all", hash: "" },
    { cat: "dev", key: "nav.dev", hash: "#dev" },
    { cat: "design", key: "nav.design", hash: "#design" },
    { cat: "text", key: "nav.text", hash: "#text" },
  ];

  return (
    <header className="kf-header">
      <Link className="kf-brand" href={home}>
        <span className="kf-logomark">K</span>
        <span className="kf-brand-name">Kitfolio</span>
      </Link>
      <nav className="kf-nav">
        {items.map((it) => (
          <Link
            key={it.cat}
            href={home + it.hash}
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
