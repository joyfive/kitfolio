"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLang, useT, type Dict } from "../lib/i18n";
import { ToolName, ToolTags } from "./ToolCardParts";
import {
  ACTIONS,
  CATEGORIES,
  HUB,
  TOOLS,
  categoryOf,
  localizedHref,
  type ActionId,
  type CategoryId,
  type Tool,
} from "../lib/content";

// 허브 화면 UI 마이크로카피만 로컬 dict. 카피·라벨·검색 색인은 content.ts.
const DICT: Dict = {
  ko: {
    open: "열기",
    empty: "검색 결과가 없습니다.",
    searchPlaceholder: "하려는 작업을 입력하세요 (예: PDF 합치기, 사진 용량 줄이기)",
    allCats: "전체",
    allActions: "모든 작업",
  },
  en: {
    open: "Open",
    empty: "No tools match your search.",
    searchPlaceholder: "What do you need to do? (e.g. merge PDFs, shrink a photo)",
    allCats: "All",
    allActions: "Any task",
  },
};

// 허브 분류: 1단 주제 카테고리(CATEGORIES) → 2단 작업 태그(ACTIONS).
// 상태는 쿼리스트링 ?cat=&action= 에 동기화한다 (경로 카테고리 URL 금지).
const CAT_IDS = new Set<string>(CATEGORIES.map((c) => c.id));
const ACTION_IDS = new Set<string>(ACTIONS.map((a) => a.id));
const CAT_ORDER = new Map<string, number>(CATEGORIES.map((c, i) => [c.id, i]));
const CATALOG = [...TOOLS].sort(
  (a, b) => CAT_ORDER.get(a.category)! - CAT_ORDER.get(b.category)!,
);

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
  const [activeCat, setActiveCat] = useState<"all" | CategoryId>("all");
  const [activeAction, setActiveAction] = useState<"all" | ActionId>("all");
  const [onlyFav, setOnlyFav] = useState(false);
  const [favs, setFavs] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      setFavs(new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]")));
    } catch {
      /* ignore */
    }
  }, []);

  // 도구 상세의 카테고리 링크(/?cat=pay-tax) 등으로 진입하면 해당 칩을 선택
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const c = q.get("cat");
    const a = q.get("action");
    if (c && CAT_IDS.has(c)) setActiveCat(c as CategoryId);
    if (a && ACTION_IDS.has(a)) setActiveAction(a as ActionId);
  }, []);

  function syncQuery(cat: "all" | CategoryId, action: "all" | ActionId) {
    const q = new URLSearchParams(window.location.search);
    q.delete("target");
    if (cat === "all") q.delete("cat");
    else q.set("cat", cat);
    if (action === "all") q.delete("action");
    else q.set("action", action);
    const qs = q.toString();
    window.history.replaceState(null, "", window.location.pathname + (qs ? "?" + qs : ""));
  }

  function selectCat(cat: "all" | CategoryId) {
    // 카테고리를 바꾸면 2단 작업 선택은 초기화한다 (다른 카테고리에 없는 작업일 수 있음)
    setActiveCat(cat);
    setActiveAction("all");
    setOnlyFav(false);
    syncQuery(cat, "all");
  }

  function selectAction(action: "all" | ActionId) {
    setActiveAction(action);
    syncQuery(activeCat, action);
  }

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
    // 카드 순서 = 카테고리 칩 순서 (같은 카테고리 안에서는 레지스트리 순서 유지)
    return CATALOG.filter((tool) => {
      const hay = [
        tool.name.en,
        tool.name.ko,
        tool.content.ko.card,
        tool.content.en.card,
        ...tool.seo.ko.keywords,
        ...tool.seo.en.keywords,
        ...tool.searchTerms.ko,
        ...tool.searchTerms.en,
        categoryOf(tool.category).label.ko,
        categoryOf(tool.category).label.en,
      ]
        .join(" ")
        .toLowerCase();
      // 단어 단위 일치: "계약서 합치기" 가 "계약서 PDF 합치기" 에도 맞도록 모든 단어가 들어 있으면 통과
      const matchQ = !q || q.split(/\s+/).every((w) => hay.includes(w));
      const matchFav = !onlyFav || favs.has(tool.slug);
      const matchCat = activeCat === "all" || tool.category === activeCat;
      const matchAction =
        activeAction === "all" || tool.actions.includes(activeAction);
      return matchQ && matchFav && matchCat && matchAction;
    });
  }, [query, onlyFav, favs, activeCat, activeAction]);

  const catChips: { key: "all" | CategoryId; label: string }[] = [
    { key: "all", label: t("allCats") },
    ...CATEGORIES.map((c) => ({ key: c.id, label: c.label[lang] })),
  ];

  // 2단 작업 칩: 선택한 카테고리의 ready 도구가 실제로 가진 작업만 (빈 칩 금지)
  const actionChips = useMemo(() => {
    const pool = TOOLS.filter(
      (tool) => tool.ready && (activeCat === "all" || tool.category === activeCat),
    );
    return ACTIONS.filter((a) => pool.some((tool) => tool.actions.includes(a.id)));
  }, [activeCat]);

  const CatChips = ({ className }: { className: string }) => (
    <div className={className} role="group" aria-label={lang === "ko" ? "주제" : "Topic"}>
      {catChips.map((c) => (
        <button
          key={c.key}
          className={activeCat === c.key ? "is-active" : ""}
          aria-pressed={activeCat === c.key}
          onClick={() => selectCat(c.key)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );

  return (
    <>
      {/* 모바일 스티키 칩 바 (≤640px): 1단 주제 카테고리 */}
      <div className="hub-mcats">
        <CatChips className="hub-mcats-track" />
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

        {/* 1단 주제 카테고리 (데스크톱) · 2단 작업 태그 (공통): 스타일로 depth 구분 */}
        <CatChips className="hub-cats" />
        <div
          className="hub-actions"
          role="group"
          aria-label={lang === "ko" ? "작업" : "Task"}
        >
          {[{ id: "all" as const, label: { ko: t("allActions"), en: t("allActions") } }, ...actionChips].map(
            (a) => (
              <button
                key={a.id}
                className={activeAction === a.id ? "is-active" : ""}
                aria-pressed={activeAction === a.id}
                onClick={() => selectAction(a.id)}
              >
                {a.label[lang]}
              </button>
            ),
          )}
        </div>
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

      {/* 허브 하단 설명 콘텐츠: 사이트 성격 소개 (SEO·AEO 본문) */}
      <section className="hub-about" aria-label={HUB.about[lang].heading}>
        <h2>{HUB.about[lang].heading}</h2>
        <div className="hub-about-grid">
          {HUB.about[lang].sections.map((s, i) => (
            <div className="hub-about-card" key={i}>
              <h3>{s.h}</h3>
              <p>{s.p}</p>
            </div>
          ))}
        </div>
      </section>
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
      <ToolName tool={tool} lang={lang} />
      <p className="tool-desc">{tool.content[lang].card}</p>
      <div className="tool-foot">
        <ToolTags tool={tool} lang={lang} />
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

