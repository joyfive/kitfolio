"use client";

import type { Lang } from "../lib/content";
import { copyText } from "../lib/clipboard";

const LABELS = {
  ko: { title: "프롬프트", copy: "프롬프트 복사", success: "프롬프트를 복사했어요.", failure: "복사할 수 없습니다. 아래 원문을 직접 선택해 주세요." },
  en: { title: "Prompt", copy: "Copy prompt", success: "Prompt copied.", failure: "Could not copy. Select the prompt below to copy it manually." },
};

export default function PrimaryPrompt({ text, lang }: { text: string; lang: Lang }) {
  const labels = LABELS[lang];
  async function copy() {
    try {
      await copyText(text, { success: labels.success, fail: labels.failure });
    } catch {
      /* 실패 토스트는 copyText 가 띄운다 */
    }
  }

  return (
    <section className="kf-primary-prompt" aria-labelledby="primary-prompt-heading">
      <div className="kf-primary-prompt-head">
        <h2 id="primary-prompt-heading">{labels.title}</h2>
        <button type="button" className="btn btn-primary" onClick={copy}>{labels.copy}</button>
      </div>
      <pre><code>{text}</code></pre>
    </section>
  );
}
