"use client";

import Link from "next/link";
import { categoryHref, categoryOf, getTool, toolNames } from "../lib/content";
import { useLang } from "../lib/i18n";

/** 작업을 시작하는 데 필요한 제목과 짧은 소개. */
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
            <span className="ph-sep" aria-hidden="true">·</span>
            <span className="ph-scope">{c.scope[lang]}</span>
          </>
        )}
      </span>
      <h1>{names.main}</h1>
      <p className="ph-lead">{copy.card}</p>
    </div>
  );
}
