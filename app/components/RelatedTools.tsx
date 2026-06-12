"use client";

import Link from "next/link";
import {
  LAYOUT_LABEL,
  RELATED_SECTION,
  TOOLS,
  getTool,
  localizedHref,
  type Tool,
} from "../lib/content";
import { useLang, useT, type Dict } from "../lib/i18n";

// 카드 상태 라벨만 로컬 dict. 섹션 카피·카드 텍스트는 content.ts 레지스트리.
const DICT: Dict = {
  ko: { soon: "준비 중", open: "열기" },
  en: { soon: "Soon", open: "Open" },
};

/** 도구 상세 페이지 하단 Related Tools 섹션.
 *  레지스트리의 relatedTools slug 목록을 허브와 동일한 카드 스타일로 렌더. */
export default function RelatedTools({ slug }: { slug: string }) {
  const { lang } = useLang();
  const t = useT(DICT);
  const c = getTool(slug);
  const related = (c.relatedTools ?? [])
    .map((s) => TOOLS.find((x) => x.slug === s))
    .filter((x): x is Tool => Boolean(x));
  if (related.length === 0) return null;

  return (
    <section className="kf-related" aria-label="Related tools">
      <h2>{RELATED_SECTION[lang].title}</h2>
      <div className="kf-related-grid">
        {related.map((tool) => {
          const inner = (
            <>
              <div className="tool-top">
                <span className={"tool-ico " + (tool.icoClass || "")}>
                  {tool.ico}
                </span>
              </div>
              <div className="tool-name">
                <span className="tool-en">{tool.name.en}</span>
                <span className="tool-ko">{tool.name.ko}</span>
              </div>
              <p className="tool-desc">{tool.content[lang].card}</p>
              <div className="tool-foot">
                <span className="theme-tag">{LAYOUT_LABEL[tool.layout]}</span>
                {tool.ready ? (
                  <span className="tool-go">
                    <span>{t("open")}</span>
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
                  <span className="soon-tag">{t("soon")}</span>
                )}
              </div>
            </>
          );
          return tool.ready ? (
            <Link
              className="tool is-ready"
              href={localizedHref(lang, "/" + tool.slug)}
              key={tool.slug}
            >
              {inner}
            </Link>
          ) : (
            <div className="tool is-soon" key={tool.slug}>
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}
