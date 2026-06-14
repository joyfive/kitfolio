"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLang, useT, type Dict } from "../lib/i18n";
import {
  HUB,
  TARGET_LABELS,
  TOOLS,
  localizedHref,
  type TargetTag,
  type Tool,
} from "../lib/content";

// 허브 화면 UI 마이크로카피만 로컬 dict. 카피·라벨·검색 색인은 content.ts.
const DICT: Dict = {
  ko: {
    open: "열기",
    empty: "검색 결과가 없습니다.",
    searchPlaceholder: "어떤 도구가 필요하세요? (예: JSON, 그라디언트, 글자 수)",
    allTargets: "전체",
  },
  en: {
    open: "Open",
    empty: "No tools match your search.",
    searchPlaceholder: "What do you need? (e.g. JSON, gradient, word count)",
    allTargets: "All",
  },
};

// 허브 분류 = 타겟(직군). 칩/카드 태그가 이 순서를 공유.
const TARGET_ORDER: TargetTag[] = [
  "pm",
  "designer",
  "developer",
  "job-seeker",
  "office-worker",
  "small-business-owner",
];

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
  const [activeTarget, setActiveTarget] = useState<"all" | TargetTag>("all");
  const [onlyFav, setOnlyFav] = useState(false);
  const [favs, setFavs] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      setFavs(new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]")));
    } catch {
      /* ignore */
    }
  }, []);

  // 푸터 등에서 /?target=pm 로 진입하면 해당 직군 칩을 선택
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("target");
    if (p && p in TARGET_LABELS) setActiveTarget(p as TargetTag);
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

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TOOLS.filter((tool) => {
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
      const matchTarget =
        activeTarget === "all" || tool.targets.includes(activeTarget);
      return matchQ && matchFav && matchTarget;
    });
  }, [query, onlyFav, favs, activeTarget]);

  const chips: { key: "all" | TargetTag; label: string }[] = [
    { key: "all", label: t("allTargets") },
    ...TARGET_ORDER.map((tag) => ({ key: tag, label: TARGET_LABELS[tag][lang] })),
  ];

  const ChipBar = ({ className }: { className: string }) => (
    <div className={className} aria-label="Filter by role">
      {chips.map((c) => (
        <button
          key={c.key}
          className={activeTarget === c.key ? "is-active" : ""}
          onClick={() => {
            setActiveTarget(c.key);
            setOnlyFav(false);
          }}
        >
          {c.label}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* 모바일 스티키 칩 바 (≤640px) */}
      <div className="hub-mcats" aria-label="Roles">
        <div className="hub-mcats-track">
          {chips.map((c) => (
            <button
              key={c.key}
              className={activeTarget === c.key ? "is-active" : ""}
              onClick={() => {
                setActiveTarget(c.key);
                setOnlyFav(false);
              }}
            >
              {c.label}
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
            <b>{visible.length}</b>
            {hero.stat}
          </span>
        </div>

        {/* 데스크톱 직군 칩 — 선택 시 해당 타겟 도구만 필터링 */}
        <ChipBar className="hub-targets" />
      </section>

      <div className="cat-grid" id="catalog">
        {visible.map((tool) => (
          <ToolCard
            key={tool.slug}
            tool={tool}
            lang={lang}
            href={localizedHref(lang, "/" + tool.slug)}
            fav={favs.has(tool.slug)}
            onFav={() => toggleFav(tool.slug)}
            openLabel={t("open")}
          />
        ))}
      </div>

      {visible.length === 0 && <div className="hub-empty">{t("empty")}</div>}
    </>
  );
}

function ToolCard({
  tool,
  lang,
  href,
  fav,
  onFav,
  openLabel,
}: {
  tool: Tool;
  lang: "ko" | "en";
  href: string;
  fav: boolean;
  onFav: () => void;
  openLabel: string;
}) {
  return (
    <Link className="tool is-ready" href={href}>
      <div className="tool-top">
        <span className={"tool-ico " + (tool.icoClass || "")}>{tool.ico}</span>
        <button
          className={"tool-fav" + (fav ? " is-on" : "")}
          title="즐겨찾기"
          aria-label="Favorite"
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
      <p className="tool-desc">{tool.content[lang].card}</p>
      <div className="tool-foot">
        <span className="tool-tags">
          {tool.targets.map((tag) => (
            <span className="target-tag" key={tag}>
              {TARGET_LABELS[tag][lang]}
            </span>
          ))}
        </span>
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
      </div>
    </Link>
  );
}
