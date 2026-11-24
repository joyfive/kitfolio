/* 경력기술서 A4 렌더 (auto-folio components/resume 이식). 스타일: app/folio.css 의 .rf-* */
import type { CSSProperties } from "react";
import type { DocLang, ResumeData, Rich } from "../../lib/folio/types";
import { RESUME_LABELS } from "../../lib/folio/labels";
import { DashList, Inline, TextOrList } from "./RichText";

export function brandVars(primary: string): CSSProperties {
  // --primary-soft 는 같은 엘리먼트에서 brand hex 로 파생한다
  return {
    "--primary": primary,
    "--primary-soft": `color-mix(in srgb, ${primary} 10%, white)`,
  } as CSSProperties;
}

function Block({ label, body }: { label: string; body: Rich }) {
  return (
    <div className="pblock">
      <div className="plabel">{label}</div>
      <div className="pbody">
        <TextOrList value={body} />
      </div>
    </div>
  );
}

function Lines({ lines }: { lines: string[] }) {
  return (
    <>
      {lines.map((line, j) => (
        <span key={j}>
          <Inline text={line} />
          {j < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

export default function ResumeDoc({ data, lang }: { data: ResumeData; lang: DocLang }) {
  const L = RESUME_LABELS[lang];
  const { header, profile, career, projects, appendix, meta } = data;
  const hasAppendix = appendix.education || appendix.etc.length > 0 || appendix.awards.length > 0;
  let no = 0;
  const secNo = () => String(++no).padStart(2, "0");

  return (
    <article className="rf-doc folio-doc" style={brandVars(data.brand.primary)} lang={lang}>
      <header className="masthead">
        <div>
          <h1 className="name">{header.name}</h1>
          {header.role && <div className="role-title">{header.role}</div>}
        </div>
        <div className="contact">
          {header.contact.map((c, i) => (
            <div key={i}>{c.strong ? <b>{c.value}</b> : c.value}</div>
          ))}
        </div>
      </header>

      {(profile.lead || profile.paragraphs.length > 0 || profile.capabilities.length > 0 || profile.skills.length > 0) && (
        <section className="sec">
          <div className="sec-h">
            <span className="sec-k">{secNo()}</span>
            <h2 className="sec-t">{L.profile}</h2>
          </div>
          {profile.lead && (
            <p className="lead">
              <Inline text={profile.lead} />
            </p>
          )}
          {profile.paragraphs.map((p, i) => (
            <p className="intro-p" key={i}>
              <Inline text={p} />
            </p>
          ))}
          {profile.capabilities.length > 0 && (
            <>
              <div className="sub-h">{L.capabilities}</div>
              <div className="cap">
                {profile.capabilities.map((c, i) => (
                  <div className="cap-row" key={i}>
                    <div className="cap-t">{c.title}</div>
                    <div className="cap-d">
                      <Inline text={c.desc} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {profile.skills.length > 0 && (
            <>
              <div className="sub-h">{L.skills}</div>
              <table className="tbl">
                <thead>
                  <tr>
                    <th style={{ width: "120px" }}>{L.skillHead[0]}</th>
                    <th>{L.skillHead[1]}</th>
                  </tr>
                </thead>
                <tbody>
                  {profile.skills.map((s, i) => (
                    <tr key={i}>
                      <td className="k">{s.k}</td>
                      <td className="v">{s.v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </section>
      )}

      {career.length > 0 && (
        <section className="sec">
          <div className="sec-h">
            <span className="sec-k">{secNo()}</span>
            <h2 className="sec-t">{L.career}</h2>
            {meta.total_experience && <span className="sec-meta">{meta.total_experience}</span>}
          </div>
          {career.map((job, i) => (
            <div className="job" key={i}>
              <div className="job-head">
                <span className="job-co">{job.company}</span>
                <span className="job-per">{job.period}</span>
              </div>
              {job.role && <div className="job-role">{job.role}</div>}
              {job.bullets.length > 0 && <DashList items={job.bullets} className="bul" />}
            </div>
          ))}
        </section>
      )}

      {projects.length > 0 && (
        <section className="sec">
          <div className="sec-h">
            <span className="sec-k">{secNo()}</span>
            <h2 className="sec-t">{L.projects}</h2>
          </div>
          {projects.map((p, i) => {
            const num = `${no}.${i + 1}`;
            const meta = [p.company, p.period].filter(Boolean).join(" · ");
            return (
              <div className="proj" key={i}>
                <div className="proj-head">
                  <span className="proj-num">{num}</span>
                  <h3 className="proj-t">{p.title}</h3>
                </div>
                {(meta || p.contribution != null) && (
                  <p className="proj-meta">
                    {meta}
                    {p.contribution != null && p.contribution !== "" && (
                      <>
                        {meta ? " · " : ""}
                        {L.contribution} <b>{typeof p.contribution === "number" ? `${p.contribution}%` : p.contribution}</b>
                      </>
                    )}
                  </p>
                )}
                {p.role && <Block label={L.role} body={p.role} />}
                {p.problem && <Block label={L.problem} body={p.problem} />}
                {p.solution && <Block label={L.solution} body={p.solution} />}
                {p.result && (
                  <div className="pblock">
                    <div className="plabel">{L.result}</div>
                    <div className="perfbox">
                      {typeof p.result === "string" ? <Inline text={p.result} /> : <DashList items={p.result} />}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {hasAppendix && (
        <section className="sec">
          <div className="sec-h">
            <span className="sec-k">{secNo()}</span>
            <h2 className="sec-t">{L.appendix}</h2>
          </div>
          <div className="trio">
            <div>
              {appendix.education && (
                <>
                  <h4 className="f-h">{L.education}</h4>
                  <div className="edu-co">{appendix.education.school}</div>
                  {appendix.education.period && <div className="edu-meta">{appendix.education.period}</div>}
                  {appendix.education.detail && <div className="edu-sub">{appendix.education.detail}</div>}
                </>
              )}
              {appendix.etc.length > 0 && (
                <>
                  <h4 className="f-h" style={appendix.education ? { marginTop: "28px" } : undefined}>
                    {L.etc}
                  </h4>
                  {appendix.etc.map((e, i) => (
                    <div key={i} className="misc">
                      <div className="misc-co">{e.title}</div>
                      <div className="misc-d">
                        <Lines lines={e.detail} />
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
            {appendix.awards.length > 0 && (
              <div>
                <h4 className="f-h">{L.awards}</h4>
                {appendix.awards.map((a, i) => (
                  <div className="award-g" key={i}>
                    <div className="award-y">{a.year}</div>
                    <DashList items={a.items} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </article>
  );
}
