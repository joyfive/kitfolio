"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLang, useT, type Dict } from "../lib/i18n";
import LangToggle from "./LangToggle";
import { CATS, TOOLS, type Tool, type ToolCat } from "../lib/tools";

const DICT: Dict = {
  ko: {
    "hub.eyebrow": "설치 없이 · 가입 없이 · 브라우저에서 바로",
    "hub.subtitle":
      "개발자와 디자이너를 위한 가볍고 빠른 유틸리티 모음. 모든 처리는 브라우저 안에서 끝나고, 어떤 데이터도 서버로 전송되지 않습니다.",
    "hub.searchPh": "어떤 도구가 필요하세요? (예: JSON, 그라디언트, 글자 수)",
    "hub.empty": "검색 결과가 없습니다.",
    "cat.dev": "개발",
    "cat.dev.sub": "Developer",
    "cat.design": "디자인",
    "cat.design.sub": "Design",
    "cat.text": "텍스트",
    "cat.text.sub": "Text",
    soon: "준비 중",
    open: "열기",
  },
  en: {
    "hub.eyebrow": "No install · No sign-up · Right in your browser",
    "hub.subtitle":
      "A lightweight set of utilities for developers and designers. Everything runs in your browser — no data is ever sent to a server.",
    "hub.searchPh": "What do you need? (e.g. JSON, gradient, word count)",
    "hub.empty": "No tools match your search.",
    "cat.dev": "Developer",
    "cat.dev.sub": "IDE theme",
    "cat.design": "Design",
    "cat.design.sub": "Canvas theme",
    "cat.text": "Text",
    "cat.text.sub": "Clean theme",
    soon: "Soon",
    open: "Open",
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
  const [activeCat, setActiveCat] = useState<ToolCat | "all">("all");
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
    const hay = (
      tool.en +
      " " +
      tool.ko +
      " " +
      tool.d_ko +
      " " +
      tool.d_en
    ).toLowerCase();
    const matchQ = !q || hay.includes(q);
    const matchFav = !onlyFav || favs.has(tool.en);
    const matchCat = activeCat === "all" || tool.cat === activeCat;
    return matchQ && matchFav && matchCat;
  }

  const visibleByCat = useMemo(() => {
    const map: Record<string, Tool[]> = {};
    CATS.forEach((c) => {
      map[c.id] = TOOLS.filter((x) => x.cat === c.id && matches(x));
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, activeCat, onlyFav, favs]);

  const totalVisible = Object.values(visibleByCat).reduce(
    (n, arr) => n + arr.length,
    0,
  );

  const navItems: { cat: ToolCat | "all"; key: string }[] = [
    { cat: "all", key: "nav.all" },
    { cat: "dev", key: "nav.dev" },
    { cat: "design", key: "nav.design" },
    { cat: "text", key: "nav.text" },
  ];

  return (
    <>
      <header className="kf-header">
        <Link className="kf-brand" href="/">
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

      <main className="hub-main">
        <section className="hub-hero">
          <span className="hub-eyebrow">{t("hub.eyebrow")}</span>
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
          <p>{t("hub.subtitle")}</p>
          <div className="hub-herobar">
            <label className="hub-bigsearch">
              <SearchIcon />
              <input
                type="text"
                placeholder={t("hub.searchPh")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <span className="hub-stat">
              {lang === "en" ? (
                <>
                  <b>14</b> tools · 3 categories
                </>
              ) : (
                <>
                  <b>14</b>개 도구 · 3개 카테고리
                </>
              )}
            </span>
          </div>
        </section>

        <div id="catalog">
          {CATS.map((cat) => {
            const items = visibleByCat[cat.id];
            if (items.length === 0) return null;
            return (
              <section className="cat" key={cat.id}>
                <div className="cat-head">
                  <h2>{t(cat.sub)}</h2>
                  <span className="cat-ko">{t(cat.key)}</span>
                  <span className="cat-count">{items.length}</span>
                </div>
                <div className="cat-grid">
                  {items.map((tool) => (
                    <ToolCard
                      key={tool.en}
                      tool={tool}
                      desc={lang === "en" ? tool.d_en : tool.d_ko}
                      fav={favs.has(tool.en)}
                      onFav={() => toggleFav(tool.en)}
                      openLabel={t("open")}
                      soonLabel={t("soon")}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        {totalVisible === 0 && (
          <div className="hub-empty">{t("hub.empty")}</div>
        )}
      </main>

      <footer className="hub-footer">
        <span className="kf-logomark">K</span>
        <span>© 2026 Kitfolio · {t("common.privacy")}</span>
      </footer>
    </>
  );
}

function ToolCard({
  tool,
  desc,
  fav,
  onFav,
  openLabel,
  soonLabel,
}: {
  tool: Tool;
  desc: string;
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
        <span className="tool-en">{tool.en}</span>
        <span className="tool-ko">{tool.ko}</span>
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

  if (tool.ready && tool.href) {
    return (
      <Link className="tool is-ready" href={tool.href}>
        {inner}
      </Link>
    );
  }
  return <div className="tool is-soon">{inner}</div>;
}
