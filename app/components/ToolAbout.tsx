"use client";

import { AEO_SECTION, aeoQA } from "../lib/content";
import { useLang } from "../lib/i18n";

/** AEO 명시 문단 섹션 — What is / Who is it for / How does it work / Why use it.
 *  콘텐츠는 content.ts 레지스트리의 aeo 필드. 같은 Q&A가 FAQPage JSON-LD에도 포함된다. */
export default function ToolAbout({ slug }: { slug: string }) {
  const { lang } = useLang();
  const items = aeoQA(slug, lang);
  if (items.length === 0) return null;

  return (
    <section className="kf-aeo" aria-label="About this tool">
      <h2>{AEO_SECTION[lang].title}</h2>
      <div className="kf-aeo-grid">
        {items.map((it) => (
          <div className="kf-aeo-item" key={it.question}>
            <h3>{it.question}</h3>
            <p>{it.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
