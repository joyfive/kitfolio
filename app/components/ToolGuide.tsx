"use client";

import { getTool } from "../lib/content";
import { useLang } from "../lib/i18n";

/** 가이드 섹션 공통 카피 — 예제·제약·출처 블록 헤딩 */
const LABEL = {
  ko: {
    examples: "실전 사용 예",
    limitations: "이 도구로 할 수 없는 것 · 주의할 점",
    sources: "참고한 공식 자료",
    verified: "최근 검증",
    input: "입력",
    result: "결과",
  },
  en: {
    examples: "Worked examples",
    limitations: "What this tool can't do, and what to watch for",
    sources: "Official sources",
    verified: "Last verified",
    input: "Input",
    result: "Result",
  },
} as const;

/** 심화 가이드 섹션 — 검색 랜딩(indexable) 도구의 고유 본문.
 *  content.ts 레지스트리의 content[lang] 에서
 *  guide(산문) · examples(실전 예제) · limitations(제약) · sources(출처) 를 소비한다.
 *  넷 다 없으면 아무것도 렌더하지 않는다. */
export default function ToolGuide({ slug }: { slug: string }) {
  const { lang } = useLang();
  const tool = getTool(slug);
  const copy = tool.content[lang];
  const { guide, examples, limitations, sources } = copy;
  const l = LABEL[lang];

  if (!guide?.length && !examples?.length && !limitations?.length && !sources?.length) {
    return null;
  }

  return (
    <section className="kf-guide" aria-label="Guide">
      {guide?.map((sec, i) => (
        <div className="kf-guide-sec" key={i}>
          <h2>{sec.heading}</h2>
          {sec.body.map((p, j) => (
            <p key={j}>{p}</p>
          ))}
        </div>
      ))}

      {examples?.length ? (
        <div className="kf-guide-sec">
          <h2>{l.examples}</h2>
          <ol className="kf-guide-examples">
            {examples.map((ex, i) => (
              <li key={i}>
                <h3>{ex.title}</h3>
                <dl>
                  <div>
                    <dt>{l.input}</dt>
                    <dd>{ex.input}</dd>
                  </div>
                  <div>
                    <dt>{l.result}</dt>
                    <dd>{ex.result}</dd>
                  </div>
                </dl>
                {ex.note && <p className="kf-guide-example-note">{ex.note}</p>}
              </li>
            ))}
          </ol>
        </div>
      ) : null}

      {limitations?.length ? (
        <div className="kf-guide-sec">
          <h2>{l.limitations}</h2>
          <ul className="kf-guide-limits">
            {limitations.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {sources?.length ? (
        <div className="kf-guide-sec kf-guide-sources">
          <h2>{l.sources}</h2>
          <ul>
            {sources.map((s, i) => (
              <li key={i}>
                <a href={s.url} target="_blank" rel="noopener noreferrer nofollow">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          {tool.verifiedAt && (
            <p className="kf-guide-verified">
              {l.verified}: <time dateTime={tool.verifiedAt}>{tool.verifiedAt}</time>
            </p>
          )}
        </div>
      ) : null}
    </section>
  );
}
