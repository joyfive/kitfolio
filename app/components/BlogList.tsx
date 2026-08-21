import Link from "next/link";
import { localizedHref, type Lang } from "../lib/content";
import { getAllPostsMeta, blogLabel, formatDate } from "../lib/blog";

/** 블로그 목록 (갤러리형 카드). 서버 컴포넌트: 빌드 시 md 파일에서 생성. */
export default function BlogList({ lang }: { lang: Lang }) {
  const posts = getAllPostsMeta(lang);
  const l = blogLabel(lang);

  return (
    <div className="kf-blog">
      <header className="kf-blog-head">
        <h1>{l.title}</h1>
        <p>{l.tagline}</p>
      </header>

      {posts.length === 0 ? (
        <p className="kf-blog-empty">
          {lang === "ko" ? "아직 게시된 글이 없습니다." : "No posts yet."}
        </p>
      ) : (
        <div className="kf-blog-grid">
          {posts.map((p) => (
            <Link
              key={p.slug}
              className="kf-blog-card"
              href={localizedHref(lang, `/blog/${p.slug}`)}
            >
              <div className="kf-blog-cover">
                {p.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.cover} alt={p.coverAlt ?? p.title} loading="lazy" />
                ) : (
                  <span className="kf-blog-cover-ph" aria-hidden />
                )}
              </div>
              <div className="kf-blog-cardbody">
                <time className="kf-blog-date" dateTime={p.date}>
                  {formatDate(p.date, lang)}
                </time>
                <h2>{p.title}</h2>
                <p>{p.description}</p>
                {p.tags.length > 0 && (
                  <span className="kf-blog-tags">
                    {p.tags.map((t) => (
                      <span className="kf-blog-tag" key={t}>
                        {t}
                      </span>
                    ))}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
