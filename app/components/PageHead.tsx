"use client";

import Link from "next/link";
import { categoryHref, categoryOf, getTool, toolNames } from "../lib/content";
import { useLang } from "../lib/i18n";

/** 페이지 헤더(뱃지·제목·설명·How It Works): 모든 테마 공통 스타일.
 *  텍스트는 전부 content.ts 레지스트리에서 가져온다. */
export default function PageHead({ slug }: { slug: string }) {
  const { lang } = useLang();
  const c = getTool(slug);
  const copy = c.content[lang];
  const cat = categoryOf(c.category);
  const names = toolNames(c, lang);

  return (
    <div className="kf-pagehead">
      {/* eyebrow: 카테고리(허브 해당 분류로 돌아가기) · 적용 범위 */}
      <span className="ph-eyebrow">
        <Link className="ph-cat" href={categoryHref(lang, c.category)}>
          {cat.label[lang]}
        </Link>
        {c.scope && (
          <>
            <span className="ph-sep">·</span>
            <span className="ph-scope">{c.scope[lang]}</span>
          </>
        )}
      </span>
      <h1>
        {names.main}{" "}
        <span className="ph-sub" lang={names.subLang}>
          {names.sub}
        </span>
      </h1>
      <p className="ph-lead">{copy.description}</p>
      <div className="ph-how">
        {copy.howItWorks?.map((s, i) => (
          <span className="ph-step" key={i}>
            <b>{i + 1}</b>
            <span>{s}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
