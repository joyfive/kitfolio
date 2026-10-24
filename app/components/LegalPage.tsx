import { Fragment } from "react";
import Link from "next/link";
import LegalVersionSelect from "./LegalVersionSelect";
import {
  LEGAL,
  LEGAL_EMAIL,
  formatLegalDate,
  isPolicySlug,
  legalDateOf,
  legalVersionHref,
  legalVersions,
  type Lang,
  type LegalSlug,
  type LegalVersion,
  type PolicySlug,
} from "../lib/content";

// 개정 이력 UI 마이크로카피
const VERSION_UI = {
  ko: {
    select: "개정일자",
    current: "현행",
    history: "개정 이력",
    archived: (from: string, until: string) => `이전 버전입니다. ${from}부터 ${until}까지 시행되었습니다.`,
    goCurrent: "현행 문서 보기",
    period: (from: string, until?: string) => (until ? `${from} ~ ${until}` : `${from} 시행`),
  },
  en: {
    select: "Revision",
    current: "current",
    history: "Revision history",
    archived: (from: string, until: string) => `This is an earlier version, in effect from ${from} to ${until}.`,
    goCurrent: "View the current version",
    period: (from: string, until?: string) => (until ? `${from} to ${until}` : `Effective ${from}`),
  },
};

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
  version,
}: {
  slug: LegalSlug;
  lang: Lang;
  /** 이전 버전 시행일 (YYYY-MM-DD). 없으면 현행 */
  version?: string;
}) {
  const versions = isPolicySlug(slug) ? legalVersions(slug) : null;
  const selected: LegalVersion | null = versions
    ? (versions.find((v) => v.id === version) ?? versions[0])
    : null;
  const doc = selected ? selected.doc[lang] : LEGAL[slug].doc[lang];
  const ui = VERSION_UI[lang];
  const dateText = selected ? formatLegalDate(selected.id, lang) : legalDateOf(slug, lang);

  return (
    <article className="kf-legal">
      <h1>{doc.title}</h1>
      {versions && selected && (
        <LegalVersionSelect
          label={ui.select}
          value={selected.id}
          options={versions.map((v) => ({
            id: v.id,
            text: formatLegalDate(v.id, lang) + (v.current ? ` (${ui.current})` : ""),
            href: legalVersionHref(slug as PolicySlug, lang, v.id),
          }))}
        />
      )}
      {selected && !selected.current && (
        <p className="legal-archived" role="note">
          {ui.archived(formatLegalDate(selected.id, lang), formatLegalDate(selected.until!, lang))}{" "}
          <Link href={legalVersionHref(slug as PolicySlug, lang, null)}>{ui.goCurrent}</Link>
        </p>
      )}
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
          <dd>{dateText}</dd>
        </div>
      </dl>

      {versions && (
        <section className="legal-history" aria-label={ui.history}>
          <h2>{ui.history}</h2>
          <ol>
            {versions.map((v) => (
              <li key={v.id} className={v.id === selected?.id ? "is-selected" : ""}>
                <Link href={legalVersionHref(slug as PolicySlug, lang, v.id)}>
                  {formatLegalDate(v.id, lang)}
                  {v.current ? ` (${ui.current})` : ""}
                </Link>
                <span className="legal-history-period">
                  {ui.period(formatLegalDate(v.id, lang), v.until && formatLegalDate(v.until, lang))}
                </span>
                <p>{v.summary[lang]}</p>
              </li>
            ))}
          </ol>
        </section>
      )}
    </article>
  );
}
