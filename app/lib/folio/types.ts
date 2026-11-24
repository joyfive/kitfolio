/* ============================================================
   경력기술서·포트폴리오 빌더: 데이터 계약

   작성 원천(SourceDoc)은 사람이 쓰는 평평한 문서다. 폼 에디터와 yml 탭이
   같은 SourceDoc 을 고친다. 렌더러는 SourceDoc 을 직접 읽지 않고
   transform.ts 가 만든 ResumeData · PortfolioData 만 읽는다.

   저장 단위:
   · profile  : 공통 프로필 (이름·연락처·소개·경력·학력·활동). 두 도구가 함께 쓴다.
   · 문서     : 지원처별 경력기술서 · 포트폴리오. profile 위에 덮어쓴다 (문서 우선).
   ============================================================ */

/** 사람이 작성하는 문서 (yml 한 파일과 1:1). 키는 auto-folio 작성 형식을 따른다. */
export type SourceDoc = Record<string, unknown>;

/** 문서 라벨 언어. 페이지 언어와 별개로 고른다 (한국어 화면에서 영문 이력서 작성). */
export type DocLang = "ko" | "en";

/** 리스트 항목: 문자열 또는 1단계 중첩 */
export type ListItem = string | { text: string; children?: string[] };
/** 문자열이면 문단, 배열이면 리스트로 렌더 */
export type Rich = string | ListItem[];

export type Contact = { value: string; strong?: boolean };
export type Capability = { title: string; desc: string };
export type SkillRow = { k: string; v: string };
export type CareerEntry = { company: string; period: string; role: string; bullets: ListItem[] };
export type Education = { school: string; period: string; detail: string };
export type EtcItem = { title: string; detail: string[] };
export type AwardGroup = { year: string; items: string[] };

export type ResumeProject = {
  num: string;
  title: string;
  company: string;
  period: string;
  contribution?: number | string;
  role?: Rich;
  problem?: Rich;
  solution?: Rich;
  result?: Rich;
};

export type ResumeData = {
  brand: Brand;
  meta: { company_target: string; total_experience: string };
  header: { name: string; role: string; contact: Contact[] };
  profile: { lead: string; paragraphs: string[]; capabilities: Capability[]; skills: SkillRow[] };
  career: CareerEntry[];
  projects: ResumeProject[];
  appendix: { education: Education | null; etc: EtcItem[]; awards: AwardGroup[] };
};

export type Brand = { company: string; primary: string };

/* ── 포트폴리오 ─────────────────────────────────────────── */

export type Block = { type: string; [k: string]: unknown };

export type Overview = {
  title: string;
  desc?: string;
  tags?: string[];
  projects?: { no: number | string; title: string }[];
};
export type Philosophy = { title: string; desc?: string };
export type PeerReview = {
  title: string;
  source?: string;
  metrics?: { label: string; value: number }[];
  quotes?: string[];
};

export type ProjectOverview = {
  headline: string;
  background?: string;
  problem?: string;
  hypothesis?: string;
  solution?: string;
  result?: string;
  takeaway?: string;
};
export type ProblemCard = { title: string; desc?: string };
export type ProjectProblem = { background?: ListItem[]; cards?: ProblemCard[]; takeaway?: string };
export type ProjectHypothesis = { lead?: string; hypothesis?: string; evidence?: ListItem[]; takeaway?: string };
export type SolutionSection = {
  title?: string;
  desc?: string;
  element?: Block;
  note?: string;
  columns?: SolutionSection[];
};
export type SolutionSlide = { label?: string; sections?: SolutionSection[]; takeaway?: string };
export type ResultMetric = { label?: string; from?: string; value?: string };
export type ResultEntry = ListItem | ResultMetric;
export type ProjectOutcome = {
  collaboration?: Rich;
  results?: string | ResultEntry[];
  lesson?: Rich;
  takeaway?: string;
};
export type PortfolioProject = {
  title: string;
  period?: string;
  contribution?: string;
  overview?: ProjectOverview;
  problem?: ProjectProblem;
  hypothesis?: ProjectHypothesis;
  solutions?: SolutionSlide[];
  outcome?: ProjectOutcome;
};

export type PortfolioData = {
  brand: Brand;
  meta: { company_target: string; role: string };
  fixed: {
    cover: { title: string; name: string; role: string };
    photo: string;
    contact: Contact[];
    total_experience: string;
    career: CareerEntry[];
    education: Education | null;
    etc: EtcItem[];
    about: { lead: string; paragraphs: string[] } | null;
    working_style: string[];
    philosophy: Philosophy[];
    peer_review: PeerReview | null;
    capabilities: Capability[];
    overview: Overview[];
    ending: string[];
  };
  projects: PortfolioProject[];
};

/* ── 저장 ──────────────────────────────────────────────── */

export type FolioKind = "resume" | "portfolio";

export type FolioEntry = {
  id: string;
  /** 문서 라벨 언어 */
  lang: DocLang;
  doc: SourceDoc;
  updatedAt: string;
};

export type Workspace = {
  schemaVersion: 1;
  profile: SourceDoc;
  resume: FolioEntry[];
  portfolio: FolioEntry[];
  active: { resume?: string; portfolio?: string };
};
