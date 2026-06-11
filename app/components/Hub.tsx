"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLang, useT, type Dict } from "../lib/i18n";
import LangToggle from "./LangToggle";
import {
  CATS,
  HUB,
  TOOLS,
  localizedHref,
  type Tool,
} from "../lib/content";

const DICT: Dict = {
  ko: { soon: "준비 중", open: "열기", empty: "검색 결과가 없습니다." },
  en: { soon: "Soon", open: "Open", empty: "No tools match your search." },
};

const CAT_LABELS: Record<
  "dev" | "design" | "text",
  { ko: { big: string; small: string }; en: { big: string; small: string } }
> = {
  dev: {
    ko: { big: "개발", small: "Developer" },
    en: { big: "Developer", small: "IDE theme" },
  },
  design: {
    ko: { big: "디자인", small: "Design" },
    en: { big: "Design", small: "Canvas theme" },
  },
  text: {
    ko: { big: "텍스트", small: "Text" },
    en: { big: "Text", small: "Clean theme" },
  },
};

const FAV_KEY = "kitfolio-favs";

const SearchIcon = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="9" cy="9" r="6" />
    <path d="m18 18-3.6-3.6" />
  </svg>
);

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    viewBox="0 0 20 20"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinejoin="round"
  >
    <path d="M10 2.5l2.3 4.7 5.2.8-3.75 3.65.9 5.15L10 14.95 5.15 17.5l.9-5.15L2.3 8.7l5.2-.8z" />
  </svg>
);

export default function Hub() {
  const { lang } = useLang();
  const t = useT(DICT);

  const [query, setQuery] = useState("");
  const [activeCat, setActiveCat] = useState<"all" | "dev" | "design" | "text">(
    "all",
  );
  const [onlyFav, setOnlyFav] = useState(false);
  const [favs, setFavs] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      setFavs(new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]")));
    } catch {
      /* ignore */
    }
  }, []);

  function toggleFav(id: string) {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      localStorage.setItem(FAV_KEY, JSON.stringify([...next]));
      return next;
    });
  }

  function matches(tool: Tool) {
    const q = query.trim().toLowerCase();
    const hay = [
      tool.name.en,
      tool.name.ko,
      tool.card.ko,
      tool.card.en,
      ...tool.keywords.ko,
      ...tool.keywords.en,
    ]
      .join(" ")
      .toLowerCase();
    const matchQ = !q || hay.includes(q);
    const matchFav = !onlyFav || favs.has(tool.slug);
    const matchCat = activeCat === "all" || tool.cat === activeCat;
    return matchQ && matchFav && matchCat;
  }

  const visibleByCat = useMemo(() => {
    const map: Record<string, Tool[]> = {};
    CATS.forEach((cat) => {
      map[cat.id] = TOOLS.filter((x) => x.cat === cat.id && matches(x));
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeCat, onlyFav, favs]);

  const totalVisible = Object.values(visibleByCat).reduce(
    (n, arr) => n + arr.length,
    0,
  );

  const navItems: { cat: "all" | "dev" | "design" | "text"; key: string }[] = [
    { cat: "all", key: "nav.all" },
    { cat: "dev", key: "nav.dev" },
    { cat: "design", key: "nav.design" },
    { cat: "text", key: "nav.text" },
  ];

  const home = localizedHref(lang, "/");

  return (
    <div className="hub-page">
      <header className="kf-header">
        <Link className="kf-brand" href={home}>
          <span className="kf-logomark">K</span>
          <span className="kf-brand-name">Kitfolio</span>
        </Link>
        <nav className="kf-nav">
          {navItems.map((it) => (
            <a
              key={it.cat}
              href="#"
              className={activeCat === it.cat ? "is-active" : ""}
              onClick={(e) => {
                e.preventDefault();
                setActiveCat(it.cat);
                setOnlyFav(false);
              }}
            >
              {t(it.key)}
            </a>
          ))}
        </nav>
        <div className="kf-header-spacer" />
        <div className="kf-header-actions">
          <label className="kf-search">
            <SearchIcon />
            <input
              type="text"
              placeholder={t("header.search")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <button
            className={"kf-iconbtn" + (onlyFav ? " is-active" : "")}
            title={t("header.favorites")}
            aria-label={t("header.favorites")}
            onClick={() => setOnlyFav((v) => !v)}
          >
            <StarIcon filled={false} />
          </button>
          <LangToggle />
        </div>
      </header>

      {/* Mobile category chip bar — sticky, ≤640px only */}
      <div className="hub-mcats" aria-label="Categories">
        <div className="hub-mcats-track">
          {navItems.map((it) => (
            <button
              key={it.cat}
              className={activeCat === it.cat ? "is-active" : ""}
              onClick={() => {
                setActiveCat(it.cat);
                setOnlyFav(false);
              }}
            >
              {t(it.key)}
            </button>
          ))}
        </div>
      </div>

      <main className="hub-main">
        <section className="hub-hero">
          <span className="hub-eyebrow">{HUB.eyebrow[lang]}</span>
          <h1>
            {lang === "en" ? (
              <>
                Every <span className="accent">web tool</span> you need,
                <br />
                in one fast place.
              </>
            ) : (
              <>
                필요한 <span className="accent">웹 도구</span>,<br />한 곳에서
                빠르게.
              </>
            )}
          </h1>
          <p>{HUB.subtitle[lang]}</p>
          <div className="hub-herobar">
            <label className="hub-bigsearch">
              <SearchIcon />
              <input
                type="text"
                placeholder={
                  lang === "en"
                    ? "What do you need? (e.g. JSON, gradient, word count)"
                    : "어떤 도구가 필요하세요? (예: JSON, 그라디언트, 글자 수)"
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <span className="hub-stat">
              {lang === "en" ? (
                <>
                  <b>{TOOLS.length}</b> tools · 3 categories
                </>
              ) : (
                <>
                  <b>{TOOLS.length}</b>개 도구 · 3개 카테고리
                </>
              )}
            </span>
          </div>
        </section>

        <div id="catalog">
          {CATS.map((cat) => {
            const items = visibleByCat[cat.id];
            if (items.length === 0) return null;
            const label = CAT_LABELS[cat.id][lang];
            return (
              <section className="cat" key={cat.id}>
                <div className="cat-head">
                  <h2>{label.small}</h2>
                  <span className="cat-ko">{label.big}</span>
                  <span className="cat-count">{items.length}</span>
                </div>
                <div className="cat-grid">
                  {items.map((tool) => (
                    <ToolCard
                      key={tool.slug}
                      tool={tool}
                      desc={tool.card[lang]}
                      href={
                        tool.ready
                          ? localizedHref(lang, "/" + tool.slug)
                          : undefined
                      }
                      fav={favs.has(tool.slug)}
                      onFav={() => toggleFav(tool.slug)}
                      openLabel={t("open")}
                      soonLabel={t("soon")}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {totalVisible === 0 && <div className="hub-empty">{t("empty")}</div>}
      </main>

      <footer className="hub-footer">
        <div className="hub-footer-inner">
          <div className="foot-brand">
            <div className="foot-brandrow">
              <span className="kf-logomark">K</span>
              <b>Kitfolio</b>
            </div>
            <div className="foot-privacy">
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M8 1.5l5 2v3.5c0 3-2.1 5.4-5 6.5-2.9-1.1-5-3.5-5-6.5V3.5z" />
                <path d="M6 8l1.5 1.5L10.5 6.5" />
              </svg>
              <span>{t("common.privacy")}</span>
            </div>
          </div>
          <div className="foot-links">
            <div className="foot-col">
              <span className="foot-h">{t("foot.tools")}</span>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveCat("dev"); window.scrollTo({top:0,behavior:"smooth"}); }}>{t("nav.dev")}</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveCat("design"); window.scrollTo({top:0,behavior:"smooth"}); }}>{t("nav.design")}</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setActiveCat("text"); window.scrollTo({top:0,behavior:"smooth"}); }}>{t("nav.text")}</a>
            </div>
            <div className="foot-col">
              <span className="foot-h">{t("foot.about")}</span>
              <a href="#">{t("foot.privacy")}</a>
              <a href="#">{t("foot.feedback")}</a>
              <a href="https://github.com/joyfive/kitfolio" target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© 2026 Kitfolio</span>
          <span className="dotsep" />
          <span>{t("foot.madeby")}</span>
        </div>
      </footer>
    </div>
  );
}

function ToolCard({
  tool,
  desc,
  href,
  fav,
  onFav,
  openLabel,
  soonLabel,
}: {
  tool: Tool;
  desc: string;
  href?: string;
  fav: boolean;
  onFav: () => void;
  openLabel: string;
  soonLabel: string;
}) {
  const inner = (
    <>
      <div className="tool-top">
        <span className={"tool-ico " + (tool.icoClass || "")}>{tool.ico}</span>
        <button
          className={"tool-fav" + (fav ? " is-on" : "")}
          title="즐겨찾기"
          aria-label="Favorite"
          disabled={!tool.ready}
          onClick={(e) => {
            e.preventDefault();
            onFav();
          }}
        >
          <StarIcon filled={fav} />
        </button>
      </div>
      <div className="tool-name">
        <span className="tool-en">{tool.name.en}</span>
        <span className="tool-ko">{tool.name.ko}</span>
      </div>
      <p className="tool-desc">{desc}</p>
      <div className="tool-foot">
        <span className="theme-tag">{tool.theme}</span>
        {tool.ready ? (
          <span className="tool-go">
            <span>{openLabel}</span>
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </span>
        ) : (
          <span className="soon-tag">{soonLabel}</span>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <Link className="tool is-ready" href={href}>
        {inner}
      </Link>
    );
  }
  return <div className="tool is-soon">{inner}</div>;
}
