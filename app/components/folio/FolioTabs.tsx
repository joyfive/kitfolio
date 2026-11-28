"use client";

import Link from "next/link";
import { localizedHref } from "../../lib/content";
import { useLang } from "../../lib/i18n";

/* 헤더 '경력기술서' 메뉴 아래의 두 도구 전환 탭. 각 탭은 독립 URL 페이지이고,
   공통 프로필을 같은 localStorage 에서 읽으므로 전환해도 내용이 이어진다. */
const TABS = [
  { slug: "resume-builder", label: { ko: "경력기술서", en: "Resume" } },
  { slug: "portfolio-builder", label: { ko: "포트폴리오", en: "Portfolio" } },
] as const;

export default function FolioTabs({ current }: { current: (typeof TABS)[number]["slug"] }) {
  const { lang } = useLang();
  return (
    <nav className="fb-doctabs" aria-label={lang === "ko" ? "문서 종류" : "Document type"}>
      {TABS.map((tab) => (
        <Link
          key={tab.slug}
          href={localizedHref(lang, `/${tab.slug}`)}
          className={tab.slug === current ? "is-on" : undefined}
          aria-current={tab.slug === current ? "page" : undefined}
        >
          {tab.label[lang]}
        </Link>
      ))}
    </nav>
  );
}
