import type { ReactNode } from "react";
import Link from "next/link";
import type { GuideExample, GuideSection, Lang, QA, SourceLink } from "../lib/content";

export default function ToolSupport({ lang, guide, faq, reading, articleHref }: {
  lang: Lang;
  guide: { title: string; situation: string; steps: ReadonlyArray<{ title: string; detail?: string }>; input: string; output: string; exampleTitle?: string; note?: string; moreExamples?: readonly GuideExample[] };
  faq: readonly QA[];
  reading: { title: string; text?: string; sections?: readonly GuideSection[]; limitations?: readonly string[]; sources?: readonly SourceLink[]; verifiedAt?: string };
  articleHref?: string;
}) {
  const l = lang === "ko"
    ? { nav: "이 페이지에서", tool: "도구", guide: "사용 가이드", faq: "FAQ", faqTitle: "작업 중 자주 막히는 경우", reading: "배경 설명", example: "예시", input: "입력", output: "얻는 결과", limits: "제약 및 주의사항", sources: "참고한 공식 자료", verified: "최근 검증", examples: "다른 실전 예시", more: "관련 글 읽기", back: "도구로 돌아가기" }
    : { nav: "On this page", tool: "Tool", guide: "Guide", faq: "FAQ", faqTitle: "Common questions and issues", reading: "Background", example: "Example", input: "Input", output: "Result", limits: "Limits and things to check", sources: "Official sources", verified: "Last verified", examples: "More worked examples", more: "Read the related article", back: "Back to the tool" };
  const links = [["tool", l.tool], ["guide", l.guide], ...(faq.length ? [["faq", l.faq]] : []), ["reading", l.reading]];
  const back = <a className="kf-support-link" href="#tool">{l.back} ↑</a>;

  return (
    <div className="kf-support">
      <nav className="kf-support-nav" aria-label={l.nav}>
        <strong>{l.nav}</strong>
        {links.map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
      </nav>
      <div className="kf-support-content">
        <SupportSection id="guide" title={guide.title}>
          <p>{guide.situation}</p>
          <ol className="kf-support-steps">
            {guide.steps.map(({ title, detail }) => (
              <li key={title}>
                <h3>{title}</h3>
                {detail && <p>{detail}</p>}
              </li>
            ))}
          </ol>
          <div className="kf-support-example">
            <h3>{guide.exampleTitle ? `${l.example} · ${guide.exampleTitle}` : l.example}</h3>
            <dl><div><dt>{l.input}</dt><dd>{guide.input}</dd></div><div><dt>{l.output}</dt><dd>{guide.output}</dd></div></dl>
            {guide.note && <p>{guide.note}</p>}
          </div>
          {!!guide.moreExamples?.length && (
            <details className="kf-support-more">
              <summary>{l.examples}</summary>
              <ul className="kf-guide-examples">
                {guide.moreExamples.map((example) => (
                  <li key={example.title}>
                    <h3>{example.title}</h3>
                    <dl>
                      <div><dt>{l.input}</dt><dd>{example.input}</dd></div>
                      <div><dt>{l.output}</dt><dd>{example.result}</dd></div>
                    </dl>
                    {example.note && <p>{example.note}</p>}
                  </li>
                ))}
              </ul>
            </details>
          )}
          {back}
        </SupportSection>
        {faq.length > 0 && (
          <SupportSection id="faq" title={l.faqTitle}>
            <div className="kf-support-faq">
              {faq.map(({ question, answer }, index) => <details key={question} id={`faq-${index + 1}`}><summary>{question}</summary><p>{answer}</p></details>)}
            </div>
          </SupportSection>
        )}
        <SupportSection id="reading" title={reading.title}>
          {reading.text && <p>{reading.text}</p>}
          {reading.sections?.map(({ heading, body }) => (
            <div className="kf-support-topic" key={heading}>
              <h3>{heading}</h3>
              {body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          ))}
          {!!reading.limitations?.length && <details><summary>{l.limits}</summary><ul>{reading.limitations.map(item => <li key={item}>{item}</li>)}</ul></details>}
          {!!reading.sources?.length && (
            <div className="kf-support-topic">
              <h3>{l.sources}</h3>
              <ul>{reading.sources.map(({ label, url }) => <li key={url}><a href={url} target="_blank" rel="noopener noreferrer">{label}</a></li>)}</ul>
              {reading.verifiedAt && <p>{l.verified} <time dateTime={reading.verifiedAt}>{reading.verifiedAt}</time></p>}
            </div>
          )}
          {articleHref && <Link className="kf-support-link" href={articleHref}>{l.more} →</Link>}
        </SupportSection>
        {back}
      </div>
    </div>
  );
}

function SupportSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return <section id={id} tabIndex={-1} aria-labelledby={`${id}-heading`}><h2 id={`${id}-heading`}>{title}</h2>{children}</section>;
}
