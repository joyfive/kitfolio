"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localizedHref, publishedTools } from "../lib/content";
import { LangProvider, routeLang, type Lang } from "../lib/i18n";
import LangToggle from "./LangToggle";
import { LogoMark } from "./Logo";

/** 경력기술서 메뉴가 묶는 도구 (경력기술서 ↔ 포트폴리오 탭) */
export const FOLIO_SLUGS = ["resume-builder", "portfolio-builder"] as const;

type NavId = "tools" | "folio" | "blog" | "prompts";

/** 헤더 메뉴 단일 출처. isNew: NEW 뱃지 (자동 종료 없음, 떼려면 false 로) */
const NAV: { id: NavId; path: string; label: Record<Lang, string>; isNew?: boolean }[] = [
  { id: "tools", path: "/", label: { ko: "웹 도구", en: "Web tools" } },
  { id: "folio", path: "/resume-builder", label: { ko: "경력기술서", en: "Resume" }, isNew: true },
  { id: "blog", path: "/blog", label: { ko: "블로그", en: "Blog" } },
  { id: "prompts", path: "/prompts", label: { ko: "프롬프트", en: "Prompts" } },
];

const TOOL_SLUGS = new Set(publishedTools().map((t) => t.slug));

/** 현재 경로가 속한 메뉴. 도구 페이지는 '웹 도구', 경력기술서·포트폴리오는 '경력기술서'. */
function activeNav(pathname: string): NavId | null {
  const bare = pathname.startsWith("/en") ? pathname.slice(3) || "/" : pathname;
  const first = bare.split("/")[1] ?? "";
  if (bare === "/") return "tools";
  if ((FOLIO_SLUGS as readonly string[]).includes(first)) return "folio";
  if (first === "blog") return "blog";
  if (first === "prompts") return "prompts";
  if (TOOL_SLUGS.has(first)) return "tools";
  return null;
}

/** 전 페이지 공통 헤더 (루트 layout.tsx에서 렌더).
 *  로고 · 메뉴(웹 도구 · 경력기술서 · 블로그 · 프롬프트) · 언어 선택기.
 *  도구 검색·분류 필터는 허브 히어로가 담당한다. */
export default function SiteHeader({
  promptLangs,
}: {
  /** 언어별 공개된 업무 프롬프트 존재 여부 (서버 레이아웃이 계산해 넘긴다) */
  promptLangs: Record<Lang, boolean>;
}) {
  const pathname = usePathname() || "/";
  const lang = routeLang(pathname);
  return (
    <LangProvider lang={lang}>
      <HeaderInner
        lang={lang}
        active={activeNav(pathname)}
        exact={NAV.some((n) => localizedHref(lang, n.path) === pathname)}
        showPrompts={promptLangs[lang]}
      />
    </LangProvider>
  );
}

function HeaderInner({ lang, active, exact, showPrompts }: { lang: Lang; active: NavId | null; exact: boolean; showPrompts: boolean }) {
  const home = localizedHref(lang, "/");
  const items = NAV.filter((n) => n.id !== "prompts" || showPrompts);
  return (
    // lang: 루트 레이아웃의 <html lang="ko"> 아래에서도 EN 라우트의 헤더가
    // 영어로 읽히도록 자기 엘리먼트에 언어를 선언한다 (SSR 초기 HTML 포함).
    <header className="kf-header" lang={lang}>
      <Link className="kf-brand" href={home}>
        <LogoMark title="Kitfolio" />
        <span className="kf-brand-name">Kitfolio</span>
      </Link>
      <nav className="kf-nav" aria-label={lang === "ko" ? "주 메뉴" : "Main menu"}>
        {items.map((n) => (
          <Link
            key={n.id}
            href={localizedHref(lang, n.path)}
            className={active === n.id ? "is-active" : undefined}
            aria-current={active === n.id ? (exact ? "page" : "true") : undefined}
          >
            {n.label[lang]}
            {n.isNew && (
              <span className="kf-nav-new">
                <span aria-hidden="true">NEW</span>
                <span className="sr-only">{lang === "ko" ? " (새 기능)" : " (new)"}</span>
              </span>
            )}
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
