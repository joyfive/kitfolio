/* 포트폴리오 1920×1080 슬라이드 렌더 (auto-folio components/portfolio 이식).
   스타일: app/folio.css 의 .pf-* */
import type { ReactNode } from "react";
import type {
  DocLang,
  Overview,
  PeerReview,
  PortfolioData,
  PortfolioProject,
  ProjectHypothesis,
  ProjectOutcome,
  ProjectOverview,
  ProjectProblem,
  ResultEntry,
  ResultMetric,
  SolutionSection,
  SolutionSlide,
} from "../../lib/folio/types";
import { PORTFOLIO_LABELS, type PortfolioLabels } from "../../lib/folio/labels";
import { DashList, Inline, TextOrList } from "./RichText";
import Deck, { Slide } from "./Deck";
import BlockView from "./Blocks";
import { brandVars } from "./ResumeDoc";

const pageNo = (n: number) => String(n).padStart(2, "0");

function OverviewPage({ proj, o, L }: { proj: PortfolioProject; o: ProjectOverview; L: PortfolioLabels }) {
  const rows: [string, string | undefined][] = [
    [L.rowBackground, o.background],
    [L.rowProblem, o.problem],
    [L.rowHypothesis, o.hypothesis],
    [L.rowSolution, o.solution],
    [L.rowResult, o.result],
  ];
  const meta = [proj.period ? `${L.period} ${proj.period}` : null, proj.contribution ? `${L.contribution} ${proj.contribution}` : null].filter(Boolean);
  return (
    <div className="pf-povr">
      <div className="pf-povr-head">
        <h3>
          <Inline text={o.headline} />
        </h3>
        {meta.length > 0 && <span className="pf-povr-meta">{meta.join("  ·  ")}</span>}
      </div>
      <div>
        {rows
          .filter(([, v]) => v)
          .map(([label, text]) => (
            <div className="pf-povr-row" key={label}>
              <div className="pf-povr-label">{label}</div>
              <p>
                <Inline text={text as string} />
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}

function ProblemPage({ p, L }: { p: ProjectProblem; L: PortfolioLabels }) {
  return (
    <div className="pf-psections">
      {p.background && p.background.length > 0 && (
        <section>
          <h3 className="pf-heading">{L.background}</h3>
          <div className="pf-list">
            <DashList items={p.background} />
          </div>
        </section>
      )}
      {p.cards && p.cards.length > 0 && (
        <section>
          <h3 className="pf-heading">{L.problemDef}</h3>
          <div className="pf-pcards">
            {p.cards.map((c, i) => (
              <div className="pf-pcard" key={i}>
                <h4>
                  <Inline text={c.title} />
                </h4>
                {c.desc && (
                  <p>
                    <Inline text={c.desc} />
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function HypothesisPage({ h, L }: { h: ProjectHypothesis; L: PortfolioLabels }) {
  return (
    <div className="pf-psections">
      {h.lead && (
        <p className="pf-plead">
          <Inline text={h.lead} />
        </p>
      )}
      <div className="pf-phypo-grid">
        {h.hypothesis && (
          <section className="pf-pcard">
            <h4>{L.hypothesis}</h4>
            <p>
              <Inline text={h.hypothesis} />
            </p>
          </section>
        )}
        {h.evidence && h.evidence.length > 0 && (
          <section className="pf-pcard">
            <h4>{L.evidence}</h4>
            <DashList items={h.evidence} />
          </section>
        )}
      </div>
    </div>
  );
}

function SectionView({ s }: { s: SolutionSection }) {
  return (
    <div className="pf-ssec">
      {s.title && (
        <h3 className="pf-heading">
          <Inline text={s.title} />
        </h3>
      )}
      {s.desc && (
        <p className="pf-text">
          <Inline text={s.desc} />
        </p>
      )}
      {s.element && <BlockView block={s.element} />}
      {s.note && (
        <p className="pf-snote">
          <Inline text={s.note} />
        </p>
      )}
    </div>
  );
}

function SolutionPage({ slide }: { slide: SolutionSlide }) {
  return (
    <div className="pf-solution">
      {(slide.sections ?? []).map((s, i) =>
        s.columns && s.columns.length > 0 ? (
          <div className="pf-scols" key={i}>
            {s.columns.map((c, j) => (
              <SectionView s={c} key={j} />
            ))}
          </div>
        ) : (
          <SectionView s={s} key={i} />
        ),
      )}
    </div>
  );
}

const isMetric = (it: ResultEntry): it is ResultMetric =>
  typeof it === "object" && it !== null && !("text" in it);

function Results({ items }: { items: NonNullable<ProjectOutcome["results"]> }) {
  if (typeof items === "string" || !items.some(isMetric)) {
    return <TextOrList value={items as string} pClass="pf-text" />;
  }
  return (
    <div className="pf-metrics">
      {items.map((it, i) =>
        isMetric(it) ? (
          <div className="pf-metric" key={i}>
            {it.label && (
              <div className="pf-metric-label">
                <Inline text={it.label} />
              </div>
            )}
            <div className="pf-metric-value">
              {it.from && <span className="pf-metric-from">{it.from}</span>}
              {it.from && it.value && <span className="pf-metric-arrow">→</span>}
              {it.value && (
                <b>
                  <Inline text={it.value} />
                </b>
              )}
            </div>
          </div>
        ) : (
          <p className="pf-text" key={i}>
            <Inline text={typeof it === "string" ? it : it.text} />
          </p>
        ),
      )}
    </div>
  );
}

function OutcomePage({ o, L }: { o: ProjectOutcome; L: PortfolioLabels }) {
  return (
    <div className="pf-pout">
      {o.collaboration && (
        <section className="pf-pcard">
          <h4>{L.collaboration}</h4>
          <TextOrList value={o.collaboration} pClass="pf-text" />
        </section>
      )}
      {o.results && (
        <section className="pf-pcard">
          <h4>{L.results}</h4>
          <Results items={o.results} />
        </section>
      )}
      {o.lesson && (
        <section className="pf-pcard pf-pcard--wide">
          <h4>{L.lesson}</h4>
          <TextOrList value={o.lesson} pClass="pf-text" />
        </section>
      )}
    </div>
  );
}

type ProjectPage = { tab: string; title: string; body: ReactNode; takeaway?: string };

/** 프로젝트 → 페이지 시퀀스. 섹션이 없으면 페이지·탭 모두 생략. */
function buildProjectPages(proj: PortfolioProject, L: PortfolioLabels): ProjectPage[] {
  const pages: ProjectPage[] = [];
  if (proj.overview) {
    pages.push({ tab: L.tabOverview, title: L.tabOverview, body: <OverviewPage proj={proj} o={proj.overview} L={L} />, takeaway: proj.overview.takeaway });
  }
  if (proj.problem) {
    pages.push({ tab: L.tabProblem, title: L.tabProblem, body: <ProblemPage p={proj.problem} L={L} />, takeaway: proj.problem.takeaway });
  }
  if (proj.hypothesis) {
    pages.push({ tab: L.tabHypothesis, title: L.tabHypothesis, body: <HypothesisPage h={proj.hypothesis} L={L} />, takeaway: proj.hypothesis.takeaway });
  }
  const solutions = proj.solutions ?? [];
  solutions.forEach((s, i) => {
    const label = s.label ?? (solutions.length > 1 ? `${L.point} ${i + 1}` : null);
    pages.push({
      tab: L.tabSolution,
      title: label ? `${L.tabSolution} · ${label}` : L.tabSolution,
      body: <SolutionPage slide={s} />,
      takeaway: s.takeaway,
    });
  });
  if (proj.outcome) {
    pages.push({ tab: L.tabOutcome, title: L.tabOutcome, body: <OutcomePage o={proj.outcome} L={L} />, takeaway: proj.outcome.takeaway });
  }
  return pages;
}

function SlideHead({ eyebrow, title, no }: { eyebrow: string; title: string; no: number }) {
  return (
    <header className="pf-shead">
      <div>
        <div className="pf-eyebrow">{eyebrow}</div>
        <h2 className="pf-stitle">{title}</h2>
      </div>
      <div className="pf-pageno">{pageNo(no)}</div>
    </header>
  );
}

function Footer({ company, name }: { company: string; name: string }) {
  return (
    <footer className="pf-foot">
      <span>{[company, name].filter(Boolean).join(" · ")}</span>
    </footer>
  );
}

function PeerReviewSummary({ peer, L }: { peer: PeerReview; L: PortfolioLabels }) {
  return (
    <section className="pf-card pf-peer-summary">
      <h3 className="pf-card-h">{peer.title}</h3>
      {peer.source && (
        <p className="pf-peer-source">
          {L.source} · {peer.source}
        </p>
      )}
      {peer.metrics && peer.metrics.length > 0 && (
        <div className="pf-peer-bars">
          {peer.metrics.map((m, i) => (
            <div className="pf-peer-bar" key={i}>
              <span>{m.label}</span>
              <div className="pf-bar-track">
                <i style={{ width: `${m.value}%` }} />
              </div>
              <b>{m.value}%</b>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function OverviewItem({ item, index, L }: { item: Overview; index: number; L: PortfolioLabels }) {
  const links = item.projects ?? [];
  return (
    <div className="pf-map-row">
      <div className="pf-map-no">{index + 1}</div>
      <div className="pf-map-content">
        <div className="pf-map-title">{item.title}</div>
        {item.desc && (
          <p className="pf-map-desc">
            <Inline text={item.desc} />
          </p>
        )}
        {links.length > 0 ? (
          <div className="pf-map-links">
            <span>{L.linked}</span>
            <div>
              {links.map((p, i) => (
                <div className="pf-map-link" key={i}>
                  <b>#{p.no}</b>
                  <strong>{p.title}</strong>
                </div>
              ))}
            </div>
          </div>
        ) : item.tags && item.tags.length > 0 ? (
          <span className="pf-tags">
            {item.tags.map((t) => (
              <span key={t}>{t}</span>
            ))}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default function PortfolioDoc({ data, lang }: { data: PortfolioData; lang: DocLang }) {
  const L = PORTFOLIO_LABELS[lang];
  const { fixed, projects, meta } = data;
  const company = meta.company_target;
  const name = fixed.cover.name;
  const photo = /^(https?:|data:image\/)/i.test(fixed.photo) ? fixed.photo : "";
  let page = 1;

  return (
    <div className="pf-root folio-doc" style={brandVars(data.brand.primary)} lang={lang}>
      <Deck>
        <Slide kind="cover">
          <div className="pf-cover-top">
            <h1 className="pf-cover-title">
              <Inline text={fixed.cover.title || L.portfolio} />
              <span className="pf-dot">.</span>
            </h1>
            <div className="pf-logo">{company}</div>
          </div>
          <div className="pf-cover-bottom">
            <div className="pf-person">
              <span className="pf-cover-name">{name}</span>
              {fixed.cover.role && <span className="pf-tag pf-tag--blue">{fixed.cover.role}</span>}
            </div>
            <span className="pf-tag">{[company, L.portfolio].filter(Boolean).join(" · ")}</span>
          </div>
        </Slide>

        {(fixed.about || fixed.career.length > 0) && (
          <Slide kind="about">
            <SlideHead eyebrow={L.aboutEyebrow} title={L.aboutTitle} no={++page} />
            <div className="pf-body pf-body--about">
              <section className="pf-profile">
                <div className="pf-photo">
                  {photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={photo} alt="" />
                  ) : (
                    L.photo
                  )}
                </div>
                <div>
                  <div className="pf-profile-meta">
                    <span className="pf-cv-name">{name}</span>
                    {fixed.cover.role && <span className="pf-tag pf-tag--blue">{fixed.cover.role}</span>}
                    {fixed.contact.map((c, i) => (
                      <span className="pf-tag" key={i}>
                        {c.value}
                      </span>
                    ))}
                  </div>
                  {fixed.about?.lead && (
                    <p className="pf-q pf-q--lead">
                      <Inline text={fixed.about.lead} />
                    </p>
                  )}
                  {fixed.about?.paragraphs.slice(0, 1).map((p, i) => (
                    <p className="pf-q" key={i}>
                      <Inline text={p} />
                    </p>
                  ))}
                </div>
              </section>

              <div className="pf-about-grid">
                <section className="pf-card">
                  <h3 className="pf-card-h">
                    {L.career} {fixed.total_experience && <span>{fixed.total_experience.replace(/^총\s*/, "")}</span>}
                  </h3>
                  <div className="pf-exp-list">
                    {fixed.career.map((c, i) => (
                      <div className="pf-exp" key={i}>
                        <div>
                          <div className="pf-exp-co">{c.company}</div>
                          {c.period && <div className="pf-exp-meta">{c.period}</div>}
                          {c.role && <div className="pf-exp-role">{c.role}</div>}
                        </div>
                        <ul className="dash pf-mini-list">
                          {c.bullets.slice(0, 3).map((b, j) => (
                            <li key={j}>
                              <Inline text={typeof b === "string" ? b : b.text} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>

                <div className="pf-side-stack">
                  {fixed.education && (
                    <section className="pf-card">
                      <h3 className="pf-card-h">{L.education}</h3>
                      <div className="pf-soft-row">
                        <div className="pf-exp-co">{fixed.education.school}</div>
                        {fixed.education.period && <div className="pf-exp-meta">{fixed.education.period}</div>}
                        {fixed.education.detail && (
                          <ul className="dash pf-mini-list">
                            <li>
                              <Inline text={fixed.education.detail} />
                            </li>
                          </ul>
                        )}
                      </div>
                    </section>
                  )}
                  {fixed.etc.length > 0 && (
                    <section className="pf-card">
                      <h3 className="pf-card-h">{L.etc}</h3>
                      {fixed.etc.map((e, i) => (
                        <div className="pf-soft-row" key={i}>
                          <div className="pf-exp-co">{e.title}</div>
                          <ul className="dash pf-mini-list">
                            {e.detail.map((d, j) => (
                              <li key={j}>
                                <Inline text={d} />
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </section>
                  )}
                </div>
              </div>
            </div>
            <Footer company={company} name={name} />
          </Slide>
        )}

        {(fixed.working_style.length > 0 || fixed.philosophy.length > 0 || fixed.peer_review) && (
          <Slide kind="section">
            <SlideHead eyebrow={L.aboutEyebrow} title={L.workTitle} no={++page} />
            <div className="pf-body pf-work">
              <div className="pf-work-top">
                {fixed.philosophy.length > 0 && (
                  <section className="pf-card pf-philo-card">
                    <h3 className="pf-card-h">{L.philosophy}</h3>
                    <ul className="pf-philo">
                      {fixed.philosophy.map((s, i) => (
                        <li key={i} className={s.desc ? "pf-philo--rich" : undefined}>
                          <Inline text={s.title} />
                          {s.desc && (
                            <p className="pf-philo-desc">
                              <Inline text={s.desc} />
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
                {fixed.peer_review ? (
                  <PeerReviewSummary peer={fixed.peer_review} L={L} />
                ) : fixed.working_style.length > 0 ? (
                  <section className="pf-card">
                    <h3 className="pf-card-h">{L.workingStyle}</h3>
                    <ul className="dash pf-work-list">
                      {fixed.working_style.map((s, i) => (
                        <li key={i}>
                          <Inline text={s} />
                        </li>
                      ))}
                    </ul>
                  </section>
                ) : null}
              </div>
              {fixed.peer_review?.quotes && fixed.peer_review.quotes.length > 0 && (
                <div className="pf-peer-quotes">
                  {fixed.peer_review.quotes.map((q, i) => (
                    <blockquote key={i}>
                      <Inline text={q} />
                    </blockquote>
                  ))}
                </div>
              )}
            </div>
            <Footer company={company} name={name} />
          </Slide>
        )}

        {(fixed.capabilities.length > 0 || fixed.overview.length > 0) && (
          <Slide kind="overview">
            <SlideHead eyebrow={L.overviewEyebrow} title={L.overviewTitle} no={++page} />
            <div className="pf-body pf-overview-grid">
              <section className="pf-card">
                <h3 className="pf-card-h">{L.capabilities}</h3>
                <div className="pf-cap-list">
                  {fixed.capabilities.map((c, i) => (
                    <div className="pf-cap-row" key={i}>
                      <div className="pf-cap-title">
                        <span>{pageNo(i + 1)}</span>
                        {c.title}
                      </div>
                      <p>
                        <Inline text={c.desc} />
                      </p>
                    </div>
                  ))}
                </div>
              </section>
              <section className="pf-card">
                <h3 className="pf-card-h">{L.showcase}</h3>
                <div className="pf-project-map">
                  {fixed.overview.map((o, i) => (
                    <OverviewItem item={o} index={i} L={L} key={i} />
                  ))}
                </div>
              </section>
            </div>
            <Footer company={company} name={name} />
          </Slide>
        )}

        {projects.map((proj, pi) => {
          const pages = buildProjectPages(proj, L);
          const tabs = [...new Set(pages.map((p) => p.tab))];
          return pages.map((pg, si) => (
            <Slide kind="project" key={`${pi}-${si}`}>
              <header className="pf-phead">
                <div className="pf-ptop">
                  <div className="pf-eyebrow">
                    {L.project} #{pi + 1} · {proj.title}
                  </div>
                  <div className="pf-pageno">{pageNo(++page)}</div>
                </div>
                <div className="pf-ptitle">
                  <h2 className="pf-stitle">{pg.title}</h2>
                  <nav className="pf-tabs" aria-label={proj.title}>
                    {tabs.map((tab) => (
                      <span className={`pf-tab${tab === pg.tab ? " is-on" : ""}`} key={tab}>
                        {tab}
                      </span>
                    ))}
                  </nav>
                </div>
              </header>
              <div className="pf-body">{pg.body}</div>
              {pg.takeaway && (
                <p className="pf-takeaway">
                  <Inline text={pg.takeaway} />
                </p>
              )}
              <Footer company={company} name={name} />
            </Slide>
          ));
        })}

        {fixed.ending.length > 0 && (
          <Slide kind="cover">
            <div className="pf-cover-top">
              <h2 className="pf-ending">
                {fixed.ending.map((s, i) => (
                  // 마지막 문장의 마침표는 액센트 점(pf-dot)으로 대체: 이중 마침표 방지
                  <span key={i}>
                    {i > 0 && <br />}
                    <Inline text={i === fixed.ending.length - 1 ? s.replace(/\.\s*$/, "") : s} />
                  </span>
                ))}
                <span className="pf-dot">.</span>
              </h2>
              <div className="pf-logo">{company}</div>
            </div>
            <div className="pf-cover-bottom">
              <div>
                <div className="pf-thanks">{L.thanks}</div>
                <div className="pf-cover-name">{L.signed.replace("{name}", name)}</div>
              </div>
              {fixed.contact[0] && <span className="pf-tag pf-tag--blue">{fixed.contact[0].value}</span>}
            </div>
          </Slide>
        )}
      </Deck>
    </div>
  );
}
