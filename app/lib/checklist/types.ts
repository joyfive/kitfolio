/* ============================================================
   웹접근성 체크리스트 빌더: 타입과 상수

   설계 원칙: **기준 정의(ChecklistDefinition)와 사용자 상태(ChecklistProject)를
   분리한다.** 표준 문구를 개정해도 사용자의 체크 기록이 깨지지 않도록
   `id` 와 `criterion` 은 고정하고, 화면 문구만 정의 쪽에서 갈아끼운다.

   이 도구는 자동 검사기가 아니라 **검토 업무를 조직하는 도구**다.
   그래서 진행률·상태를 "준수율", "인증 점수", "합격"으로 표현하지 않는다.
   ============================================================ */

/** 적용 기준. 두 표준을 하나의 레벨 체계로 섞지 않는다. */
export type Standard = "kwcag-2.2" | "wcag-2.2";

/** 목표 레벨: WCAG 에만 있다. KWCAG 2.2 는 A/AA/AAA 등급을 쓰지 않는다. */
export type Level = "A" | "AA" | null;

/** 실무 검사 축 7종. 표준 번호가 아니라 "누가 무엇을 보는가"로 묶는다. */
export type Axis =
  | "color"
  | "typography-reflow"
  | "target-pointer"
  | "keyboard-focus"
  | "structure-semantics"
  | "dynamic-status"
  | "cognitive-process";

/** 담당 역할 태그. 한 항목에 여러 역할이 붙는 것은 정상이다:
 *  접근성 문제는 보통 한 단계에서만 해결되지 않는다. */
export type Role = "planning" | "design" | "publishing";

/** 작업 단계 태그 */
export type Phase = "planning" | "design" | "implementation" | "qa" | "operation";

/** 항목 상태 5종 */
export type Status = "not_started" | "in_review" | "pass" | "issue" | "not_applicable";

/** 테스트 환경: 확인 방법과 안내 문구에만 반영한다. 기준을 제거하지 않는다. */
export type Environment = "responsive" | "desktop-first" | "mobile-first";

/** 운영 유형: 프로젝트 메타데이터와 주의 문구에만 반영한다.
 *  민간·공공 여부가 기술 검사항목을 자동으로 바꾸지는 않는다. */
export type Organization = "general-private" | "public-certification";

/** 서비스 기능 질문 ID. "해당 없음 후보"를 계산하는 유일한 입력이다. */
export type FeatureId =
  | "media_prerecorded"
  | "media_live"
  | "forms"
  | "authentication"
  | "timed_content"
  | "moving_content"
  | "drag_gesture"
  | "motion_input"
  | "data_tables"
  | "web_app_widgets"
  | "epub_reference";

/** 항목에서 바로 이동할 수 있는 Kitfolio 검사 도구 slug */
export type RelatedToolSlug =
  | "color-contrast-checker"
  | "color-blindness-simulator"
  | "html-accessibility-checker"
  | "text-scaling-checker";

type Bilingual = { ko: string; en: string };
type BilingualList = { ko: string[]; en: string[] };

/** 기준 정의: 빌드 타임 상수. 사용자 데이터가 섞이지 않는다. */
export type ChecklistDefinition = {
  /** 저장 키. 표준 문구가 바뀌어도 절대 바꾸지 않는다. */
  id: string;
  standard: Standard;
  /** 표준이 쓰는 번호 (KWCAG "8", WCAG "1.4.3") */
  criterion: string;
  /** WCAG 만 값을 가진다. KWCAG 는 null. */
  level: Level;
  /** 표준의 공식 항목명 */
  title: Bilingual;
  /** 실무자가 답할 수 있는 한 문장 질문 */
  question: Bilingual;
  /** 확인 방법 2~4개 */
  howToCheck: BilingualList;
  /** 완료 근거로 무엇을 남기면 되는지 */
  evidence: Bilingual;
  axis: Axis;
  roles: Role[];
  phases: Phase[];
  /** 비어 있으면 기능 질문으로 N/A 후보가 되지 않는다.
   *  키보드·구조·이름 역할 값처럼 광범위한 항목은 의도적으로 비운다. */
  featureFlags: FeatureId[];
  /** 공식 1차 출처 (외부 링크) */
  sourceUrl: string;
  relatedTool?: RelatedToolSlug;
};

/** 항목별 사용자 입력 */
export type ItemState = {
  status: Status;
  note: string;
  evidenceUrl: string;
  /** 마지막으로 사용자가 건드린 시각 (ISO). 한 번도 없으면 null */
  updatedAt: string | null;
};

/** 브라우저에 저장되는 사용자 프로젝트 */
export type ChecklistProject = {
  schemaVersion: 1;
  projectName: string;
  standard: Standard;
  targetLevel: Level;
  environment: Environment;
  organization: Organization;
  features: Record<FeatureId, boolean>;
  createdAt: string;
  updatedAt: string;
  items: Record<string, ItemState>;
};

/* ── 순서 상수: 화면 정렬과 내보내기가 공유한다 ───────────── */

/** 기본 정렬의 1차 키. 검사 축 순서는 "보이는 것 → 조작 → 구조 → 절차". */
export const AXIS_ORDER: Axis[] = [
  "color",
  "typography-reflow",
  "target-pointer",
  "keyboard-focus",
  "structure-semantics",
  "dynamic-status",
  "cognitive-process",
];

export const STATUS_ORDER: Status[] = [
  "not_started",
  "in_review",
  "pass",
  "issue",
  "not_applicable",
];

export const ROLE_ORDER: Role[] = ["planning", "design", "publishing"];

export const PHASE_ORDER: Phase[] = [
  "planning",
  "design",
  "implementation",
  "qa",
  "operation",
];

/** 설정 카드의 기능 질문 순서 · 기본값 */
export const FEATURE_ORDER: FeatureId[] = [
  "media_prerecorded",
  "media_live",
  "forms",
  "authentication",
  "timed_content",
  "moving_content",
  "drag_gesture",
  "motion_input",
  "data_tables",
  "web_app_widgets",
  "epub_reference",
];

/** 기능 질문 기본값: 대부분의 사이트에 있는 것만 true 로 둔다. */
export const DEFAULT_FEATURES: Record<FeatureId, boolean> = {
  media_prerecorded: false,
  media_live: false,
  forms: true,
  authentication: false,
  timed_content: false,
  moving_content: false,
  drag_gesture: false,
  motion_input: false,
  data_tables: false,
  web_app_widgets: true,
  epub_reference: false,
};

/** 입력 길이 상한: 저장 용량과 내보내기 안정성을 위해 자른다. */
export const LIMITS = {
  projectName: 60,
  note: 2000,
  evidenceUrl: 500,
} as const;

/** 공식 출처 URL 상수: 항목 데이터가 문자열을 중복해서 들고 있지 않게 한다. */
export const SOURCES = {
  /** 한국형 웹 콘텐츠 접근성 지침 2.2 */
  kwcag: "https://www.wa.or.kr/board/view.asp?BoardID=0004&sn=22592",
  /** 정보통신접근성 품질인증 표준심사 지침 (2025-01-01 시행) */
  kwcagAssessment: "https://www.wa.or.kr/board/view.asp?BoardID=0004&sn=35560",
  /** WCAG 2.2 Recommendation */
  wcag: "https://www.w3.org/TR/WCAG22/",
  /** How to Meet WCAG 2.2 (Quick Reference) */
  wcagQuickref: "https://www.w3.org/WAI/WCAG22/quickref/",
} as const;

/** WCAG Understanding 문서 URL. 성공 기준마다 한 페이지가 있다. */
export function wcagUnderstanding(slug: string): string {
  return `https://www.w3.org/WAI/WCAG22/Understanding/${slug}.html`;
}

/** 저장 키: schemaVersion 을 올릴 때 키도 함께 올린다. */
export const STORAGE_KEY = "kitfolio:accessibility-checklist:v1";
export const SCHEMA_VERSION = 1 as const;

/** 항목의 초기 상태 */
export function emptyItemState(): ItemState {
  return { status: "not_started", note: "", evidenceUrl: "", updatedAt: null };
}
