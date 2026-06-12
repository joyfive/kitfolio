"use client";

import { useState } from "react";
import { getTool } from "../lib/content";
import { useLang, useT } from "../lib/i18n";

/** 도구 상세 페이지 공통 FAQ — Claude Design 핸드오프(faq.html) 구현.
 *  - 1개의 화이트 카드 안 아코디언, 중앙 정렬 (max 760px + 텍스트 센터)
 *  - 한 번에 하나만 열림 (열린 항목을 다시 누르면 닫힘)
 *  - 1번 항목 기본 오픈, grid-rows 높이 애니메이션 + 아이콘 회전
 *  콘텐츠는 content.ts 의 해당 도구 `faq` 필드에서 가져온다.
 *  (FAQPage JSON-LD는 toolJsonLd()가 같은 데이터로 함께 생성) */
export default function Faq({ slug }: { slug: string }) {
  const { lang } = useLang();
  const t = useT();
  const c = getTool(slug);
  const [open, setOpen] = useState<number | null>(0); // 1번 기본 오픈
  if (!c.faq) return null;

  return (
    <section className="kf-faq" aria-label="FAQ">
      <div className="kf-faq-intro">
        <span className="eyebrow">{t("faq.eyebrow")}</span>
        <h2>{t("faq.title")}</h2>
        <p>{t("faq.sub")}</p>
      </div>

      <div className="kf-faq-card" role="list">
        {c.faq[lang].map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              className={"kf-faq-item" + (isOpen ? " open" : "")}
              role="listitem"
              key={i}
            >
              <button
                className="kf-faq-q"
                aria-expanded={isOpen}
                aria-controls={`faq-a-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span className="kf-faq-q-text">{item.q}</span>
                <span className="kf-faq-icon" aria-hidden>
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 6l4 4 4-4" />
                  </svg>
                </span>
              </button>
              <div className="kf-faq-a" id={`faq-a-${i}`} role="region">
                <div className="kf-faq-a-inner">
                  <p className="kf-faq-a-text">{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="kf-faq-more">
        {t("faq.more")} <a href="#">{t("faq.moreLink")}</a>
      </p>
    </section>
  );
}
