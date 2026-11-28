/* ============================================================
   작성 문서(SourceDoc) → 렌더 데이터 변환

   auto-folio 의 lib/content.mjs 를 브라우저용 순수 함수로 옮겼다.
   파일·서버 접근이 없고, 사람이 손으로 쓴 yml 을 믿지 않는다:
   모양이 다른 값은 렌더러가 넘어지지 않도록 여기서 빈 값으로 바꾼다.
   ============================================================ */
import type {
  AwardGroup,
  Block,
  Brand,
  Capability,
  CareerEntry,
  Contact,
  Education,
  EtcItem,
  ListItem,
  Overview,
  PeerReview,
  Philosophy,
  PortfolioData,
  PortfolioProject,
  ResultEntry,
  ResumeData,
  ResumeProject,
  Rich,
  SkillRow,
  SolutionSection,
  SolutionSlide,
  SourceDoc,
} from "./types";
import { resolveFont } from "./fonts";

export const DEFAULT_PRIMARY = "#2D5DC8";

const isObj = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

/** 문서 값이 profile 값을 덮어쓴다. 배열은 통째로 교체 (항목 단위 병합 없음). */
export function deepMerge(base: unknown, over: unknown): unknown {
  if (Array.isArray(over) || Array.isArray(base)) return over ?? base;
  if (isObj(base) && isObj(over)) {
    const out: Record<string, unknown> = { ...base };
    for (const k of Object.keys(over)) out[k] = deepMerge(base[k], over[k]);
    return out;
  }
  return over ?? base;
}

/* ── 정규화 헬퍼 ─────────────────────────────────────── */

/** 숫자·불리언도 문자열로 (yml 은 2024 를 숫자로 읽는다) */
export function str(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return "";
}
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const strs = (v: unknown): string[] =>
  typeof v === "string" ? (v ? [v] : []) : arr(v).map(str).filter(Boolean);

function listItem(v: unknown): ListItem | null {
  if (typeof v === "string" || typeof v === "number") return str(v);
  if (isObj(v)) {
    const text = str(v.text);
    const children = strs(v.children);
    if (!text && children.length === 0) return null;
    return children.length ? { text, children } : text;
  }
  return null;
}
const listItems = (v: unknown): ListItem[] =>
  typeof v === "string" ? (v ? [v] : []) : arr(v).map(listItem).filter((x): x is ListItem => x !== null);

/** 문자열은 문단, 배열은 리스트. 비어 있으면 undefined (블록 생략). */
function rich(v: unknown): Rich | undefined {
  if (typeof v === "string" || typeof v === "number") return str(v) || undefined;
  if (Array.isArray(v)) {
    const items = listItems(v);
    return items.length ? items : undefined;
  }
  return undefined;
}
const opt = (v: unknown) => str(v) || undefined;

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;
export function normalizeHex(v: unknown, fallback = DEFAULT_PRIMARY): string {
  const s = str(v).trim();
  if (!HEX_RE.test(s)) return fallback;
  const h = s.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return `#${full.toUpperCase()}`;
}

/** primary → 옅은 tint (10% 혼합). 다이어그램 노드 배경에 쓴다. */
export function softTint(hex: string, amount = 0.1): string {
  const full = normalizeHex(hex).slice(1);
  const ch = (i: number) => parseInt(full.slice(i, i + 2), 16);
  const mix = (c: number) => Math.round(c * amount + 255 * (1 - amount));
  const h = (n: number) => n.toString(16).padStart(2, "0");
  return `#${h(mix(ch(0)))}${h(mix(ch(2)))}${h(mix(ch(4)))}`;
}

/* ── 공통 필드 ───────────────────────────────────────── */

const contacts = (v: unknown): Contact[] =>
  arr(v)
    .map((c) => (isObj(c) ? { value: str(c.value), strong: c.strong === true } : { value: str(c) }))
    .filter((c) => c.value);

const capabilities = (v: unknown): Capability[] =>
  arr(v)
    .filter(isObj)
    .map((c) => ({ title: str(c.title), desc: str(c.desc) }))
    .filter((c) => c.title || c.desc);

const careers = (v: unknown): CareerEntry[] =>
  arr(v)
    .filter(isObj)
    .map((c) => ({
      company: str(c.company),
      period: str(c.period),
      role: str(c.role),
      bullets: listItems(c.bullets),
    }))
    .filter((c) => c.company || c.role || c.bullets.length);

function education(v: unknown): Education | null {
  if (!isObj(v)) return null;
  const e = { school: str(v.school), period: str(v.period), detail: str(v.detail) };
  return e.school || e.period || e.detail ? e : null;
}

/** etc 한 리스트에 {title, detail}(활동)·{year, items}(수상)를 섞어 쓴다 → 분리 */
export function splitActivities(d: SourceDoc): { etc: EtcItem[]; awards: AwardGroup[] } {
  const etc: EtcItem[] = [];
  const awards: AwardGroup[] = [];
  for (const e of arr(d.etc)) {
    if (!isObj(e)) continue;
    if (e.year != null) awards.push({ year: str(e.year), items: strs(e.items ?? e.detail) });
    else etc.push({ title: str(e.title), detail: strs(e.detail ?? e.items) });
  }
  for (const a of arr(d.awards)) {
    if (isObj(a)) awards.push({ year: str(a.year), items: strs(a.items) });
  }
  return { etc: etc.filter((e) => e.title || e.detail.length), awards: awards.filter((a) => a.year || a.items.length) };
}

function brand(d: SourceDoc): Brand {
  return { company: str(d.company_name), primary: normalizeHex(d.primary), font: resolveFont(d.font).id };
}

/* ── 경력기술서 ──────────────────────────────────────── */

export function toResume(d: SourceDoc): ResumeData {
  const projects: ResumeProject[] = arr(d.projects)
    .filter(isObj)
    .map((p, i) => ({
      num: `3.${i + 1}`,
      title: str(p.title),
      company: str(p.company),
      period: str(p.period),
      contribution: typeof p.contribution === "number" ? p.contribution : opt(p.contribution),
      role: rich(p.role),
      problem: rich(p.problem),
      solution: rich(p.solution),
      result: rich(p.result),
    }));
  return {
    brand: brand(d),
    meta: { company_target: str(d.company_name), total_experience: str(d.total_experience) },
    header: { name: str(d.name), role: str(d.headline), contact: contacts(d.contact) },
    profile: {
      lead: str(d.lead),
      paragraphs: strs(d.paragraphs),
      capabilities: capabilities(d.capabilities),
      skills: arr(d.skills)
        .filter(isObj)
        .map((s): SkillRow => ({ k: str(s.k), v: str(s.v) }))
        .filter((s) => s.k || s.v),
    },
    career: careers(d.career),
    projects,
    appendix: { education: education(d.education), ...splitActivities(d) },
  };
}

/* ── 포트폴리오 ──────────────────────────────────────── */

function block(v: unknown): Block | undefined {
  if (!isObj(v) || typeof v.type !== "string" || !v.type) return undefined;
  return v as Block;
}

function section(v: unknown): SolutionSection | null {
  if (!isObj(v)) return null;
  const columns = arr(v.columns).map(section).filter((x): x is SolutionSection => x !== null);
  const s: SolutionSection = {
    title: opt(v.title),
    desc: opt(v.desc),
    element: block(v.element),
    note: opt(v.note),
  };
  if (columns.length) s.columns = columns;
  return s.title || s.desc || s.element || s.note || s.columns ? s : null;
}

function resultEntries(v: unknown): string | ResultEntry[] | undefined {
  if (typeof v === "string") return v || undefined;
  const out: ResultEntry[] = [];
  for (const it of arr(v)) {
    if (isObj(it) && ("value" in it || "from" in it || "label" in it) && !("text" in it)) {
      const m = { label: opt(it.label), from: opt(it.from), value: opt(it.value) };
      if (m.label || m.from || m.value) out.push(m);
    } else {
      const li = listItem(it);
      if (li) out.push(li);
    }
  }
  return out.length ? out : undefined;
}

function project(p: Record<string, unknown>): PortfolioProject {
  const out: PortfolioProject = {
    title: str(p.title),
    period: opt(p.period),
    contribution: opt(p.contribution),
  };
  if (isObj(p.overview)) {
    const o = p.overview;
    out.overview = {
      headline: str(o.headline),
      background: opt(o.background),
      problem: opt(o.problem),
      hypothesis: opt(o.hypothesis),
      solution: opt(o.solution),
      result: opt(o.result),
      takeaway: opt(o.takeaway),
    };
  }
  if (isObj(p.problem)) {
    const pr = p.problem;
    out.problem = {
      background: listItems(pr.background),
      cards: arr(pr.cards)
        .filter(isObj)
        .map((c) => ({ title: str(c.title), desc: opt(c.desc) }))
        .filter((c) => c.title || c.desc),
      takeaway: opt(pr.takeaway),
    };
  }
  if (isObj(p.hypothesis)) {
    const h = p.hypothesis;
    out.hypothesis = {
      lead: opt(h.lead),
      hypothesis: opt(h.hypothesis),
      evidence: listItems(h.evidence),
      takeaway: opt(h.takeaway),
    };
  }
  const solutions: SolutionSlide[] = arr(p.solutions)
    .filter(isObj)
    .map((s) => ({
      label: opt(s.label),
      sections: arr(s.sections).map(section).filter((x): x is SolutionSection => x !== null),
      takeaway: opt(s.takeaway),
    }));
  if (solutions.length) out.solutions = solutions;
  if (isObj(p.outcome)) {
    const o = p.outcome;
    out.outcome = {
      collaboration: rich(o.collaboration),
      results: resultEntries(o.results),
      lesson: rich(o.lesson),
      takeaway: opt(o.takeaway),
    };
  }
  return out;
}

/** overview 의 연결 프로젝트는 번호만 써도 된다: 제목은 프로젝트 목록에서 찾는다. */
function overviewItems(v: unknown, projects: PortfolioProject[]): Overview[] {
  return arr(v)
    .filter(isObj)
    .map((o) => {
      const links = arr(o.projects)
        .map((l) => {
          const no = isObj(l) ? l.no : l;
          const n = typeof no === "number" ? no : parseInt(str(no), 10);
          const title = isObj(l) ? str(l.title) : "";
          const found = Number.isFinite(n) ? projects[n - 1]?.title ?? "" : "";
          return { no: Number.isFinite(n) ? n : str(no), title: title || found };
        })
        .filter((l) => l.title);
      return { title: str(o.title), desc: opt(o.desc), tags: strs(o.tags), projects: links };
    })
    .filter((o) => o.title || o.desc);
}

function peerReview(v: unknown): PeerReview | null {
  if (!isObj(v)) return null;
  const p: PeerReview = {
    title: str(v.title),
    source: opt(v.source),
    metrics: arr(v.metrics)
      .filter(isObj)
      .map((m) => ({ label: str(m.label), value: Math.max(0, Math.min(100, Number(m.value) || 0)) }))
      .filter((m) => m.label),
    quotes: strs(v.quotes),
  };
  return p.title || p.metrics?.length || p.quotes?.length ? p : null;
}

export function toPortfolio(d: SourceDoc): PortfolioData {
  const { etc, awards } = splitActivities(d);
  // 포트폴리오는 수상 이력을 '그 외 활동'으로 합친다 (별도 수상 카드 없음)
  const activities: EtcItem[] = [...etc, ...awards.map((a) => ({ title: a.year, detail: a.items }))];
  const projects = arr(d.projects).filter(isObj).map(project);
  const lead = str(d.lead);
  const paragraphs = strs(d.paragraphs);
  const philosophy: Philosophy[] = arr(d.philosophy)
    .map((p) => (isObj(p) ? { title: str(p.title), desc: opt(p.desc) } : { title: str(p) }))
    .filter((p) => p.title);
  return {
    brand: brand(d),
    meta: { company_target: str(d.company_name), role: str(d.title ?? d.headline) },
    fixed: {
      cover: { title: str(d.title), name: str(d.name), role: str(d.headline) },
      photo: str(d.photo),
      logo: str(d.logo),
      contact: contacts(d.contact),
      total_experience: str(d.total_experience),
      career: careers(d.career),
      education: education(d.education),
      etc: activities,
      about: lead || paragraphs.length ? { lead, paragraphs } : null,
      working_style: strs(d.working_style),
      philosophy,
      peer_review: peerReview(d.peer_review),
      capabilities: capabilities(d.capabilities),
      overview: overviewItems(d.overview, projects),
      ending: strs(d.ending),
    },
    projects,
  };
}

/** profile + 문서 → 렌더 데이터 */
export function buildResume(profile: SourceDoc, doc: SourceDoc): ResumeData {
  return toResume(deepMerge(profile, doc) as SourceDoc);
}
export function buildPortfolio(profile: SourceDoc, doc: SourceDoc): PortfolioData {
  return toPortfolio(deepMerge(profile, doc) as SourceDoc);
}
