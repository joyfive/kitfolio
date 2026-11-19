import Link from "next/link";
import { localizedHref, type Lang } from "../lib/content";
import { formatDate } from "../lib/blog";
import { getAllPromptsMeta, promptLabel } from "../lib/prompts";
import PromptThumb from "./PromptThumb";

/** 업무 프롬프트 목록. 블로그 목록과 같은 갤러리형이고, 썸네일은 제목으로 그린다. */
export default function PromptList({ lang }: { lang: Lang }) {
  const prompts = getAllPromptsMeta(lang);
  const l = promptLabel(lang);

  return (
    <div className="kf-blog">
      <header className="kf-blog-head">
        <h1>{l.title}</h1>
        <p>{l.tagline}</p>
      </header>

      {prompts.length === 0 ? (
        <p className="kf-blog-empty">{l.empty}</p>
      ) : (
        <div className="kf-blog-grid">
          {prompts.map((p) => (
            <Link
              key={p.slug}
              className="kf-blog-card"
              href={localizedHref(lang, `/prompts/${p.slug}`)}
            >
              <PromptThumb title={p.title} badge={l.badge} />
              <div className="kf-blog-cardbody">
                <time className="kf-blog-date" dateTime={p.date}>
                  {l.published} {formatDate(p.date, lang)}
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
