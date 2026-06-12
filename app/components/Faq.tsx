"use client";

import { getTool } from "../lib/content";
import { useLang, useT } from "../lib/i18n";

/** 도구 상세 페이지 공통 FAQ 섹션.
 *  콘텐츠는 lib/content.ts 의 해당 도구 `faq` 필드에서 가져온다.
 *  (FAQPage JSON-LD는 toolJsonLd()가 같은 데이터로 함께 생성) */
export default function Faq({ slug }: { slug: string }) {
  const { lang } = useLang();
  const t = useT();
  const c = getTool(slug);
  if (!c.faq) return null;

  return (
    <section className="kf-faq" aria-label="FAQ">
      <h2>{t("common.faq")}</h2>
      <div className="kf-faq-list">
        {c.faq[lang].map((item, i) => (
          <details className="kf-faq-item" key={i} open={i === 0}>
            <summary>
              <span className="q">{item.q}</span>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden
              >
                <path d="M3.5 6l4.5 4.5L12.5 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
