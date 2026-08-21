import { Fragment } from "react";
import {
  LEGAL,
  LEGAL_EMAIL,
  LEGAL_EFFECTIVE,
  type Lang,
  type LegalSlug,
} from "../lib/content";

/** 최소 인라인 마크업 렌더러: **굵게** 와 [라벨](url) 만 지원. */
function renderInline(text: string, keyBase: string) {
  const tokens = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return tokens.map((tok, i) => {
    const key = `${keyBase}-${i}`;
    const bold = /^\*\*([^*]+)\*\*$/.exec(tok);
    if (bold) return <strong key={key}>{bold[1]}</strong>;
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(tok);
    if (link) {
      return (
        <a key={key} href={link[2]} target="_blank" rel="noopener noreferrer">
          {link[1]}
        </a>
      );
    }
    return <Fragment key={key}>{tok}</Fragment>;
  });
}

/** 약관/정책 페이지: 서버 컴포넌트. 콘텐츠는 content.ts LEGAL 레지스트리에서. */
export default function LegalPage({
  slug,
  lang,
}: {
  slug: LegalSlug;
  lang: Lang;
}) {
  const doc = LEGAL[slug].doc[lang];

  return (
    <article className="kf-legal">
      <h1>{doc.title}</h1>
      {doc.intro && (
        <p className="legal-intro">{renderInline(doc.intro, "intro")}</p>
      )}

      {doc.sections.map((sec, si) => (
        <section key={si} className="legal-section">
          <h2>{sec.heading}</h2>
          {sec.body.map((p, pi) => (
            <p key={pi}>{renderInline(p, `s${si}-p${pi}`)}</p>
          ))}
        </section>
      ))}

      <dl className="legal-meta">
        <div>
          <dt>{doc.contactLabel}</dt>
          <dd>
            <a href={`mailto:${LEGAL_EMAIL}`}>{LEGAL_EMAIL}</a>
          </dd>
        </div>
        <div>
          <dt>{doc.effectiveLabel}</dt>
          <dd>{LEGAL_EFFECTIVE[lang]}</dd>
        </div>
      </dl>
    </article>
  );
}
