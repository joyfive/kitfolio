"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLang, useT, type Dict } from "../lib/i18n";
import {
  CATS,
  HUB,
  LAYOUT_LABEL,
  TOOLS,
  localizedHref,
  type Tool,
} from "../lib/content";

// 허브 화면 UI 마이크로카피(상태 라벨·인풋 플레이스홀더)만 로컬 dict.
// 히어로 카피·카드 설명·검색 색인은 content.ts 레지스트리.
const DICT: Dict = {
  ko: {
    soon: "준비 중",
    open: "열기",
    empty: "검색 결과가 없습니다.",
    searchPlaceholder: "어떤 도구가 필요하세요? (예: JSON, 그라디언트, 글자 수)",
  },
  en: {
    soon: "Soon",
    open: "Open",
    empty: "No tools match your search.",
    searchPlaceholder: "What do you need? (e.g. JSON, gradient, word count)",
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
  const hero = HUB.hero[lang];

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
      tool.content.ko.card,
      tool.content.en.card,
      ...tool.seo.ko.keywords,
      ...tool.seo.en.keywords,
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

  return (
    <>
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

      <section className="hub-hero">
        <span className="hub-eyebrow">{hero.eyebrow}</span>
        <h1>
          {hero.h1.pre}
          <span className="accent">{hero.h1.accent}</span>
          {hero.h1.post.split("\n").map((part, i) =>
            i === 0 ? (
              part
            ) : (
              <span key={i}>
                <br />
                {part}
              </span>
            ),
          )}
        </h1>
        <p>{hero.subtitle}</p>
        <div className="hub-herobar">
          <label className="hub-bigsearch">
            <SearchIcon />
            <input
              type="text"
              placeholder={t("searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <button
            className={"hub-favbtn" + (onlyFav ? " is-active" : "")}
            title={t("header.favorites")}
            onClick={() => setOnlyFav((v) => !v)}
          >
            <StarIcon filled={onlyFav} />
            <span>{t("header.favorites")}</span>
          </button>
          <span className="hub-stat">
            <b>{TOOLS.length}</b>
            {hero.stat}
          </span>
        </div>
      </section>

      <div id="catalog">
        {CATS.map((cat) => {
          const items = visibleByCat[cat.id];
          if (items.length === 0) return null;
          const label = cat.label[lang];
          return (
            <section className="cat" id={cat.id} key={cat.id}>
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
                    desc={tool.content[lang].card}
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
    </>
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
        <span className="theme-tag">{LAYOUT_LABEL[tool.layout]}</span>
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
