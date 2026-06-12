"use client";

import { CATS, getTool } from "../lib/content";
import { useLang } from "../lib/i18n";

/** 페이지 헤더(뱃지·제목·설명·How It Works) — 모든 테마 공통 스타일.
 *  텍스트는 전부 content.ts 레지스트리에서 가져온다. */
export default function PageHead({ slug }: { slug: string }) {
  const { lang } = useLang();
  const c = getTool(slug);
  const copy = c.content[lang];
  const catLabel = CATS.find((x) => x.id === c.cat)!.label[lang].big;

  return (
    <div className="kf-pagehead">
      <span className="ph-eyebrow">
        <span>{catLabel}</span>
        <span className="ph-sep">·</span>
        <span className="ph-theme">{c.badge}</span>
      </span>
      <h1>
        {c.name.en} <span className="ph-ko">{c.name.ko}</span>
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
