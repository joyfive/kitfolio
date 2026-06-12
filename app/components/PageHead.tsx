"use client";

import { getTool } from "../lib/content";
import { useLang, useT } from "../lib/i18n";

/** 페이지 헤더(뱃지·제목·설명·사용 단계) — 모든 테마 공통 스타일. */
export default function PageHead({ slug }: { slug: string }) {
  const { lang } = useLang();
  const t = useT();
  const c = getTool(slug);

  return (
    <div className="kf-pagehead">
      <span className="ph-eyebrow">
        <span>{t(`nav.${c.cat}`)}</span>
        <span className="ph-sep">·</span>
        <span className="ph-theme">{c.themeLabel}</span>
      </span>
      <h1>
        {c.name.en} <span className="ph-ko">{c.name.ko}</span>
      </h1>
      <p className="ph-lead">{c.description![lang]}</p>
      <div className="ph-how">
        {c.steps![lang].map((s, i) => (
          <span className="ph-step" key={i}>
            <b>{i + 1}</b>
            <span>{s}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
