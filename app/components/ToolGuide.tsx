"use client";

import { getTool } from "../lib/content";
import { useLang } from "../lib/i18n";

/** 심화 가이드 섹션 — 대표(간판) 도구에만 렌더하는 긴 산문 콘텐츠.
 *  content.ts 레지스트리의 content[lang].guide 를 소비한다.
 *  guide 가 없는 도구에서는 아무것도 렌더하지 않는다. */
export default function ToolGuide({ slug }: { slug: string }) {
  const { lang } = useLang();
  const guide = getTool(slug).content[lang].guide;
  if (!guide?.length) return null;

  return (
    <section className="kf-guide" aria-label="Guide">
      {guide.map((sec, i) => (
        <div className="kf-guide-sec" key={i}>
          <h2>{sec.heading}</h2>
          {sec.body.map((p, j) => (
            <p key={j}>{p}</p>
          ))}
        </div>
      ))}
    </section>
  );
}
