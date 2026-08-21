import Link from "next/link";
import { getTool, localizedHref, type Lang } from "../lib/content";
import { getPost, formatDate, blogLabel } from "../lib/blog";

/** 단일 아티클 렌더. 서버 컴포넌트 — md → HTML 은 blog.ts(marked)에서. */
export default function BlogArticle({
  slug,
  lang,
}: {
  slug: string;
  lang: Lang;
}) {
  const post = getPost(slug, lang);
  if (!post) return null;
  const { meta, html } = post;
  const l = blogLabel(lang);

  const related = meta.relatedTools
    .map((s) => {
      try {
        return getTool(s);
      } catch {
        return null;
      }
    })
    .filter((t): t is NonNullable<typeof t> => t !== null);

  return (
    <article className="kf-article">
      <nav className="kf-article-back">
        <Link href={localizedHref(lang, "/blog")}>← {l.title}</Link>
      </nav>

      <header className="kf-article-head">
        {/* 날짜 · 작성자 — 누가 썼는지는 여기 한 줄로만 밝힌다.
            역할(authorRole)과 최근 검증일(reviewedAt)은 화면에 노출하지 않고
            BlogPosting JSON-LD 에만 남긴다. */}
        <div className="kf-article-meta">
          <time dateTime={meta.date}>{formatDate(meta.date, lang)}</time>
          {meta.updated && meta.updated !== meta.date && (
            <span className="kf-article-updated">
              {lang === "ko" ? "· 업데이트 " : "· Updated "}
              {formatDate(meta.updated, lang)}
            </span>
          )}
          <span className="kf-article-author">@{meta.author}</span>
        </div>
        <h1>{meta.title}</h1>
        {meta.description && <p className="kf-article-lead">{meta.description}</p>}
      </header>

      {meta.cover && (
        <div className="kf-article-cover">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={meta.cover} alt={meta.coverAlt ?? meta.title} />
        </div>
      )}

      <div
        className="kf-article-body"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* 공식 출처 — 외부 기준(세법·요율·플랫폼 정책)에 의존하는 글에만 붙는다 */}
      {meta.sources.length > 0 && (
        <section className="kf-article-sources">
          <h2>{lang === "ko" ? "참고한 공식 자료" : "Official sources"}</h2>
          <ul>
            {meta.sources.map((s) => (
              <li key={s.url}>
                <a href={s.url} target="_blank" rel="noopener noreferrer nofollow">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section className="kf-article-related">
          <h2>{lang === "ko" ? "관련 도구" : "Related tools"}</h2>
          <div className="kf-article-related-grid">
            {related.map((t) => (
              <Link
                key={t.slug}
                className="kf-article-tool"
                href={localizedHref(lang, "/" + t.slug)}
              >
                <span className={"tool-ico " + (t.icoClass || "")}>{t.ico}</span>
                <span className="kf-article-tool-name">
                  <b>{t.name.en}</b>
                  <span>{t.name.ko}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
