"use client";

import { useState } from "react";
import {
  AEO_SECTION,
  FAQ_SECTION,
  aeoQA,
  getTool,
  type QA,
} from "../lib/content";
import { useLang } from "../lib/i18n";

type TabKey = "about" | "faq";

/** 도구 상세 페이지 공통 도움말 섹션 — 탭(칩)으로 전환되는 아코디언.
 *  - "이 도구에 대하여"(AEO: What/Who/How/Why) ↔ "자주 묻는 질문"(FAQ)
 *  - 두 탭 모두 동일한 아코디언 디자인 (한 번에 하나만 열림, 1번 기본 오픈)
 *  콘텐츠는 content.ts 레지스트리(content.aeo / faq + 섹션 카피)에서 가져온다.
 *  (같은 Q&A가 toolJsonLd()의 FAQPage JSON-LD에도 포함된다) */
export default function Faq({ slug }: { slug: string }) {
  const { lang } = useLang();
  const c = getTool(slug);

  const aboutItems = aeoQA(slug, lang);
  const faqItems = c.faq?.[lang] ?? [];

  const tabs: { key: TabKey; label: string; title: string; sub: string; items: QA[] }[] = [];
  if (aboutItems.length) {
    tabs.push({
      key: "about",
      label: AEO_SECTION[lang].tab,
      title: AEO_SECTION[lang].title,
      sub: AEO_SECTION[lang].sub,
      items: aboutItems,
    });
  }
  if (faqItems.length) {
    tabs.push({
      key: "faq",
      label: FAQ_SECTION[lang].tab,
      title: FAQ_SECTION[lang].title,
      sub: FAQ_SECTION[lang].sub,
      items: faqItems,
    });
  }

  const [tab, setTab] = useState<TabKey>(tabs[0]?.key ?? "about");
  const [open, setOpen] = useState<number | null>(0); // 각 탭 1번 기본 오픈

  if (tabs.length === 0) return null;
  const active = tabs.find((x) => x.key === tab) ?? tabs[0];

  function selectTab(key: TabKey) {
    setTab(key);
    setOpen(0); // 탭 전환 시 첫 항목 오픈으로 리셋
  }

  return (
    <section className="kf-faq" aria-label={active.title}>
      <div className="kf-faq-intro">
        <h2>{active.title}</h2>
        <p>{active.sub}</p>
      </div>

      {tabs.length > 1 && (
        <div className="kf-faq-tabs" role="tablist">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              role="tab"
              aria-selected={tb.key === tab}
              className={tb.key === tab ? "is-active" : ""}
              onClick={() => selectTab(tb.key)}
            >
              {tb.label}
            </button>
          ))}
        </div>
      )}

      <div className="kf-faq-card" role="list">
        {active.items.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              className={"kf-faq-item" + (isOpen ? " open" : "")}
              role="listitem"
              key={active.key + i}
            >
              <button
                className="kf-faq-q"
                aria-expanded={isOpen}
                aria-controls={`faq-a-${active.key}-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                <span className="kf-faq-q-text">{item.question}</span>
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
              <div
                className="kf-faq-a"
                id={`faq-a-${active.key}-${i}`}
                role="region"
              >
                <div className="kf-faq-a-inner">
                  <p className="kf-faq-a-text">{item.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {tab === "faq" && (
        <p className="kf-faq-more">
          {FAQ_SECTION[lang].more} <a href="#">{FAQ_SECTION[lang].moreLink}</a>
        </p>
      )}
    </section>
  );
}
