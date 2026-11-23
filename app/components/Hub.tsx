"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useLang, useT, type Dict } from "../lib/i18n";
import {
  ACTIONS,
  CATEGORIES,
  HUB,
  categoryOf,
  localizedHref,
  publishedTools,
  type ActionId,
  type CategoryId,
  type Tool,
} from "../lib/content";

// 허브 화면 UI 마이크로카피만 로컬 dict. 카피·라벨·검색 색인은 content.ts.
const DICT: Dict = {
  ko: {
    searchLabel: "도구 검색",
    narrow: "작업으로 좁히기",
    reset: "검색·필터 초기화",
    emptyFavorites: "조건에 맞는 즐겨찾기가 없습니다. 도구 옆 별표로 추가할 수 있어요.",
    quick: "대표 작업",
    privacy: "처리 방식",
    favorite: "즐겨찾기",
    empty: "검색 결과가 없습니다.",
    searchPlaceholder: "예: PDF 합치기",
    allCats: "전체",
    allActions: "모든 작업",
  },
  en: {
    searchLabel: "Search tools",
    narrow: "Filter by task",
    reset: "Clear search and filters",
    emptyFavorites: "No matching favorites. Use the star beside a tool to save it.",
    quick: "Quick tasks",
    privacy: "How data is handled",
    favorite: "Favorite",
    empty: "No tools match your search.",
    searchPlaceholder: "e.g. merge PDFs",
    allCats: "All",
    allActions: "Any task",
  },
};

// 허브 분류: 1단 주제 카테고리(CATEGORIES) → 2단 작업 태그(ACTIONS).
// 상태는 쿼리스트링 ?cat=&action= 에 동기화한다 (경로 카테고리 URL 금지).
const CAT_IDS = new Set<string>(CATEGORIES.map((c) => c.id));
const ACTION_IDS = new Set<string>(ACTIONS.map((a) => a.id));

const QUICK_TASKS = [
  { slug: "pdf-tools", mark: "PDF", ko: "PDF 합치기", en: "Merge PDFs" },
  { slug: "image-optimizer", mark: "IMG", ko: "사진 용량 줄이기", en: "Shrink an image" },
  { slug: "salary-calculator", mark: "₩", ko: "연봉 실수령액 계산", en: "Estimate take-home pay" },
  { slug: "json-formatter", mark: "{ }", ko: "JSON 정리", en: "Format JSON" },
] as const;

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
  const [actionsOpen, setActionsOpen] = useState(false);
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
    if (a && ACTION_IDS.has(a)) {
      setActiveAction(a as ActionId);
      setActionsOpen(true);
    }
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
    setActionsOpen(false);
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
      try {
        localStorage.setItem(FAV_KEY, JSON.stringify([...next]));
      } catch {
        // Keep favorites usable for this session when storage is unavailable.
      }
      return next;
    });
  }

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    // 카드 = 공개 페이지 단위 (sitemap 과 같은 목록). 순서 = 레지스트리 = 카테고리 순서
    return publishedTools().filter((tool) => {
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
    const pool = publishedTools().filter(
      (tool) => activeCat === "all" || tool.category === activeCat,
    );
    return ACTIONS.filter((a) => pool.some((tool) => tool.actions.includes(a.id)));
  }, [activeCat]);

  const filtered = Boolean(query.trim() || onlyFav || activeCat !== "all" || activeAction !== "all");
  const groups = filtered
    ? [{ key: "results", title: null, tools: visible }]
    : CATEGORIES.map((category) => ({
        key: category.id,
        title: category.label[lang],
        tools: visible.filter((tool) => tool.category === category.id),
      })).filter((group) => group.tools.length > 0);

  function resetFilters() {
    setQuery("");
    selectCat("all");
  }

  return (
    <>
      <section className="hub-hero">
        <h1>{hero.h1.pre}<span className="accent">{hero.h1.accent}</span>{hero.h1.post}</h1>
        <p>{hero.subtitle} <Link href={localizedHref(lang, "/privacy-policy")}>{t("privacy")}</Link></p>
        <div className="hub-herobar">
          <label className="hub-bigsearch">
            <SearchIcon />
            <span className="sr-only">{t("searchLabel")}</span>
            <input
              type="search"
              placeholder={t("searchPlaceholder")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <button
            type="button"
            className={"hub-favbtn" + (onlyFav ? " is-active" : "")}
            aria-pressed={onlyFav}
            aria-label={t("header.favorites")}
            title={t("header.favorites")}
            onClick={() => setOnlyFav((value) => !value)}
          >
            <StarIcon filled={onlyFav} />
            <span>{t("header.favorites")}</span>
          </button>
        </div>

        {!filtered && (
          <nav className="hub-quick" aria-label={t("quick")}>
            {QUICK_TASKS.map((task) => (
              <Link key={task.slug} href={localizedHref(lang, "/" + task.slug)}>
                <span className="hub-mark" aria-hidden="true">{task.mark}</span>
                {task[lang]}
              </Link>
            ))}
          </nav>
        )}

        <div className="hub-filters">
          <div className="hub-cats" role="group" aria-label={lang === "ko" ? "주제" : "Topic"}>
            {catChips.map((category) => (
              <button
                key={category.key}
                type="button"
                className={activeCat === category.key ? "is-active" : ""}
                aria-pressed={activeCat === category.key}
                onClick={() => selectCat(category.key)}
              >
                {category.label}
              </button>
            ))}
          </div>
          <button type="button" className="hub-narrow" aria-expanded={actionsOpen}
            aria-controls="hub-task-filters" onClick={() => setActionsOpen((open) => !open)}>
            {t("narrow")}{activeAction !== "all" && ` · ${ACTIONS.find((action) => action.id === activeAction)?.label[lang]}`}
          </button>
          <div id="hub-task-filters" className="hub-actions" hidden={!actionsOpen}
            role="group" aria-label={lang === "ko" ? "작업" : "Task"}>
            <button type="button" aria-pressed={activeAction === "all"} onClick={() => selectAction("all")}>
              {t("allActions")}
            </button>
            {actionChips.map((action) => (
              <button key={action.id} type="button" aria-pressed={activeAction === action.id}
                onClick={() => selectAction(action.id)}>
                {action.label[lang]}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div id="catalog">
        <div className="hub-results">
          <span className="hub-stat" role="status"><b>{visible.length}</b>{hero.stat}</span>
          {filtered && <button type="button" onClick={resetFilters}>{t("reset")}</button>}
        </div>
        {groups.map((group) => (
          <div key={group.key} className="hub-group">
            {group.title && <h2>{group.title}</h2>}
            <div className="cat-grid">
              {group.tools.map((tool) => (
                <div key={tool.slug} className="hub-tool">
                  <Link className="hub-tool-link" href={localizedHref(lang, "/" + tool.slug)}>
                    <span className="hub-mark" aria-hidden="true">{tool.ico || "CSS"}</span>
                    <div>
                      <strong>{tool.name[lang]}</strong>
                      <p>{tool.content[lang].card}</p>
                      {filtered && activeCat === "all" && <small>{categoryOf(tool.category).label[lang]}</small>}
                    </div>
                    <span className="hub-arrow" aria-hidden="true">→</span>
                  </Link>
                  <button type="button" className="hub-tool-fav" aria-pressed={favs.has(tool.slug)}
                    aria-label={`${t("favorite")}: ${tool.name[lang]}`}
                    onClick={() => toggleFav(tool.slug)}>
                    <StarIcon filled={favs.has(tool.slug)} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
        {visible.length === 0 && <p className="hub-empty">{t(onlyFav ? "emptyFavorites" : "empty")}</p>}
      </div>

      <section className="hub-about" aria-labelledby="hub-about-heading">
        <h2 id="hub-about-heading">{HUB.about[lang].heading}</h2>
        {HUB.about[lang].sections.map((section) => (
          <div className="hub-about-section" key={section.h}>
            <h3>{section.h}</h3>
            <p>{section.p}</p>
          </div>
        ))}
      </section>
    </>
  );
}
