import Link from "next/link";
import { getTool, localizedHref, toolNames, type Lang } from "../lib/content";
import { formatDate } from "../lib/blog";
import { getPrompt, oldestUiVerifiedAt, promptLabel } from "../lib/prompts";
import PrimaryPrompt from "./PrimaryPrompt";
import PromptCopyButtons from "./PromptCopyButtons";

/** 업무 프롬프트 상세. 블로그 아티클과 같은 읽기 레이아웃 + 게재일 + 코드 블록 복사 버튼. */
export default function PromptArticle({ slug, lang }: { slug: string; lang: Lang }) {
  const post = getPrompt(slug, lang);
  if (!post) return null;
  const { meta, html, primaryPrompt, uiPaths } = post;
  const l = promptLabel(lang);
  const verified = oldestUiVerifiedAt(uiPaths);
  const services = [...new Set(uiPaths.map((u) => u.service))].join(", ");

  const related = meta.relatedTools
    .map((s) => {
      try {
        return getTool(s);
      } catch {
        return null;
      }
    })
    .filter((t): t is NonNullable<typeof t> => t !== null);

  const bodyId = `prompt-body-${slug}`;

  return (
    <article className="kf-article">
      <nav className="kf-article-back">
        <Link href={localizedHref(lang, "/prompts")}>← {l.back}</Link>
      </nav>

      <header className="kf-article-head">
        <div className="kf-article-meta">
          <span>
            {l.published} <time dateTime={meta.date}>{formatDate(meta.date, lang)}</time>
          </span>
          {meta.updated && meta.updated !== meta.date && (
            <span className="kf-article-updated">
              {" · "}
              {l.updated} <time dateTime={meta.updated}>{formatDate(meta.updated, lang)}</time>
            </span>
          )}
          <span className="kf-article-author">{meta.author}</span>
        </div>
        <h1>{meta.title}</h1>
        {meta.description && <p className="kf-article-lead">{meta.description}</p>}
      </header>

      {primaryPrompt !== null && <PrimaryPrompt text={primaryPrompt} lang={lang} />}

      <div id={bodyId} className="kf-article-body" dangerouslySetInnerHTML={{ __html: html }} />
      <PromptCopyButtons targetId={bodyId} copyLabel={l.copy} copiedLabel={l.copied} />

      {verified && (
        <p className="kf-prompt-uinote">{l.uiVerified(formatDate(verified, lang), services)}</p>
      )}

      {related.length > 0 && (
        <section className="kf-article-related">
          <h2>{l.related}</h2>
          <div className="kf-article-related-grid">
            {related.map((t) => (
              <Link key={t.slug} className="kf-article-tool" href={localizedHref(lang, "/" + t.slug)}>
                <span className={"tool-ico " + (t.icoClass || "")}>{t.ico}</span>
                <span className="kf-article-tool-name">
                  <b>{toolNames(t, lang).main}</b>
                  <span lang={toolNames(t, lang).subLang}>{toolNames(t, lang).sub}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
