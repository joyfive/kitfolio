"use client";

import Link from "next/link";
import { useT } from "../lib/i18n";
import LangToggle from "./LangToggle";

type Cat = "all" | "dev" | "design" | "text";

/** Common header used by the tool pages. The hub renders its own
 *  header inline because its nav/search/favorites are stateful. */
export default function SiteHeader({
  active,
  dark = false,
}: {
  active?: Cat;
  dark?: boolean;
}) {
  const t = useT();
  const items: { cat: Cat; key: string }[] = [
    { cat: "all", key: "nav.all" },
    { cat: "dev", key: "nav.dev" },
    { cat: "design", key: "nav.design" },
    { cat: "text", key: "nav.text" },
  ];

  return (
    <header className={"kf-header" + (dark ? " is-dark" : "")}>
      <Link className="kf-brand" href="/">
        <span className="kf-logomark">K</span>
        <span className="kf-brand-name">Kitfolio</span>
      </Link>
      <nav className="kf-nav">
        {items.map((it) => (
          <Link
            key={it.cat}
            href="/"
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
