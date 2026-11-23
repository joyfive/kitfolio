"use client";

import { getTool, localizedHref, type GuideExample } from "../lib/content";
import { useLang } from "../lib/i18n";
import { toolGuideContext } from "../lib/tool-guide-context";
import ToolSupport from "./ToolSupport";

const RELATED_ARTICLES: Record<string, string> = {
  "character-counter": "character-count-limits",
  "qr-code-generator": "qr-code-guide",
  "qr-code-reader": "qr-code-guide",
  "salary-calculator": "salary-net-pay-korea",
  "ad-metrics-calculator": "ad-metrics-explained",
  "growth-rate-calculator": "growth-rate-explained",
  "cagr-calculator": "compound-growth-future-value",
  "json-formatter": "json-explained",
  "css-unit-converter": "css-units-explained",
};

export default function ToolGuide({ slug, exampleIndex = 0, currentExample, steps, modeLabel }: {
  slug: string;
  exampleIndex?: number;
  currentExample?: GuideExample;
  steps?: readonly string[];
  modeLabel?: string;
}) {
  const { lang } = useLang();
  const tool = getTool(slug);
  const copy = tool.content[lang];
  const examples = copy.examples ?? [];
  const example = currentExample ?? examples[exampleIndex] ?? examples[0];
  const guideSteps = steps ?? copy.howItWorks;
  const article = RELATED_ARTICLES[slug];
  const ko = lang === "ko";
  if (!example || !guideSteps?.length) return null;

  return (
    <ToolSupport
      lang={lang}
      guide={{
        title: [ko ? "사용 가이드" : "How to use this tool", modeLabel].filter(Boolean).join(" · "),
        situation: toolGuideContext(slug, lang) ?? copy.card,
        steps: guideSteps.map((title) => ({ title })),
        exampleTitle: example.title,
        input: example.input,
        output: example.result,
        note: example.note,
        moreExamples: examples.filter((item) => item !== example),
      }}
      faq={tool.faq?.[lang] ?? []}
      reading={{
        title: ko ? "배경 설명과 결과 해석" : "Background and how to read results",
        sections: copy.guide,
        limitations: copy.limitations,
        sources: copy.sources,
        verifiedAt: tool.verifiedAt,
      }}
      articleHref={article && localizedHref(lang, "/blog/" + article)}
    />
  );
}
