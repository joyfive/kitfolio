/* ============================================================
   체크리스트 조립: 기준 선택 · N/A 후보 · 진행률 · 정렬

   여기 있는 함수는 전부 순수 함수다. 저장(storage)·내보내기(export)·화면이
   같은 계산을 공유하고, 테스트가 UI 없이 검증할 수 있게 분리한다.
   ============================================================ */
import { KWCAG_ITEMS } from "./kwcag";
import { WCAG_ITEMS } from "./wcag";
import {
  AXIS_ORDER,
  DEFAULT_FEATURES,
  emptyItemState,
  type Axis,
  type ChecklistDefinition,
  type ChecklistProject,
  type FeatureId,
  type ItemState,
  type Level,
  type Standard,
  type Status,
} from "./types";

/** 기준 번호를 숫자 단위로 비교한다: "1.4.10" 이 "1.4.4" 보다 뒤에 오게. */
function compareCriterion(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i += 1) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (d !== 0) return d;
  }
  return 0;
}

/**
 * 선택한 기준으로 생성되는 항목 목록.
 * - KWCAG 2.2: 33개 전체 (레벨 개념 없음)
 * - WCAG 2.2 A: Level A 31개
 * - WCAG 2.2 AA: A 31개 + AA 24개 = 55개 (AA 는 A 를 포함한다)
 */
export function definitionsFor(standard: Standard, targetLevel: Level): ChecklistDefinition[] {
  if (standard === "kwcag-2.2") {
    return [...KWCAG_ITEMS].sort((a, b) => compareCriterion(a.criterion, b.criterion));
  }
  const levels: Level[] = targetLevel === "AA" ? ["A", "AA"] : ["A"];
  return WCAG_ITEMS.filter((d) => levels.includes(d.level)).sort((a, b) =>
    compareCriterion(a.criterion, b.criterion),
  );
}

/** 선택한 기준에서 생성될 항목 수 (설정 카드 미리보기용) */
export function itemCountFor(standard: Standard, targetLevel: Level): number {
  return definitionsFor(standard, targetLevel).length;
}

/**
 * "해당 없음 후보" 판정.
 *
 * 기능 플래그가 하나도 없는 항목은 절대 후보가 되지 않는다: 키보드·구조·
 * 이름 역할 값처럼 광범위한 기준을 기능 질문 하나로 지워서는 안 되기 때문이다.
 * 플래그가 있는 항목은 **관련 기능이 전부 없다고 답했을 때만** 후보가 된다.
 * 후보는 표시일 뿐 항목을 숨기거나 분모에서 빼지 않는다. 최종 N/A 는 사용자가 정한다.
 */
export function isNaCandidate(
  def: ChecklistDefinition,
  features: Record<FeatureId, boolean>,
): boolean {
  if (def.featureFlags.length === 0) return false;
  return def.featureFlags.every((f) => features[f] === false);
}

/** 기준 목록으로 항목 상태 맵을 만든다. 기존 상태가 있으면 그대로 이어받는다. */
export function buildItemStates(
  defs: ChecklistDefinition[],
  previous?: Record<string, ItemState>,
): Record<string, ItemState> {
  const items: Record<string, ItemState> = {};
  for (const d of defs) items[d.id] = previous?.[d.id] ?? emptyItemState();
  return items;
}

export type Progress = {
  /** 생성된 전체 항목 수 */
  total: number;
  /** 사용자가 해당 없음으로 정한 수 */
  notApplicable: number;
  /** 진행률 분모: 전체 - 해당 없음 */
  applicable: number;
  notStarted: number;
  inReview: number;
  pass: number;
  issue: number;
  /** 검토에 착수한 수 = 검토 중 + 통과 + 이슈 */
  reviewed: number;
  /**
   * 검토 진행률(%). 작업 관리 수치이며 준수율·인증 점수가 아니다.
   * 적용 항목이 0이면 null: 분모가 없는데 100%를 만들지 않는다.
   */
  percent: number | null;
};

export function computeProgress(
  defs: ChecklistDefinition[],
  items: Record<string, ItemState>,
): Progress {
  const count: Record<Status, number> = {
    not_started: 0,
    in_review: 0,
    pass: 0,
    issue: 0,
    not_applicable: 0,
  };
  for (const d of defs) count[items[d.id]?.status ?? "not_started"] += 1;

  const total = defs.length;
  const notApplicable = count.not_applicable;
  const applicable = total - notApplicable;
  const reviewed = count.in_review + count.pass + count.issue;

  return {
    total,
    notApplicable,
    applicable,
    notStarted: count.not_started,
    inReview: count.in_review,
    pass: count.pass,
    issue: count.issue,
    reviewed,
    percent: applicable > 0 ? Math.round((reviewed / applicable) * 100) : null,
  };
}

/** 축 단위 집계: 아코디언 헤더의 "완료 수 / 적용 항목 수 · 이슈 수". */
export type AxisSummary = {
  axis: Axis;
  defs: ChecklistDefinition[];
  /** 이 축에서 적용 대상(= 해당 없음 제외) 수 */
  applicable: number;
  /** 검토를 마친 수 = 통과 + 이슈 */
  done: number;
  issue: number;
};

export function summarizeByAxis(
  defs: ChecklistDefinition[],
  items: Record<string, ItemState>,
): AxisSummary[] {
  return AXIS_ORDER.map((axis) => {
    const list = defs.filter((d) => d.axis === axis);
    let applicable = 0;
    let done = 0;
    let issue = 0;
    for (const d of list) {
      const s = items[d.id]?.status ?? "not_started";
      if (s === "not_applicable") continue;
      applicable += 1;
      if (s === "pass" || s === "issue") done += 1;
      if (s === "issue") issue += 1;
    }
    return { axis, defs: list, applicable, done, issue };
  }).filter((g) => g.defs.length > 0);
}

/** 기본으로 펼칠 축: 첫 번째 미완료 축. 전부 끝났으면 첫 축. */
export function firstOpenAxis(groups: AxisSummary[]): Axis | null {
  if (groups.length === 0) return null;
  const pending = groups.find((g) => g.applicable > g.done);
  return (pending ?? groups[0]).axis;
}

/** 새 프로젝트 생성. 기준 선택과 기능 응답이 확정된 뒤에 호출한다. */
export function createProject(input: {
  projectName: string;
  standard: Standard;
  targetLevel: Level;
  environment: ChecklistProject["environment"];
  organization: ChecklistProject["organization"];
  features?: Partial<Record<FeatureId, boolean>>;
  now?: Date;
}): ChecklistProject {
  const now = (input.now ?? new Date()).toISOString();
  // KWCAG 에는 레벨 개념이 없으므로 저장 값도 null 로 정규화한다.
  const targetLevel = input.standard === "kwcag-2.2" ? null : (input.targetLevel ?? "AA");
  const features = { ...DEFAULT_FEATURES, ...input.features };
  return {
    schemaVersion: 1,
    projectName: input.projectName.trim(),
    standard: input.standard,
    targetLevel,
    environment: input.environment,
    organization: input.organization,
    features,
    createdAt: now,
    updatedAt: now,
    items: buildItemStates(definitionsFor(input.standard, targetLevel)),
  };
}

/**
 * 목표 레벨 변경.
 * - A → AA: 기존 A 항목의 상태·메모는 보존하고 AA 항목만 미검토로 추가한다.
 * - AA → A: 숨겨질 AA 항목은 제거한다. 호출 전에 유실 확인을 받는다.
 */
export function changeTargetLevel(project: ChecklistProject, level: Level): ChecklistProject {
  const defs = definitionsFor(project.standard, level);
  return {
    ...project,
    targetLevel: level,
    items: buildItemStates(defs, project.items),
    updatedAt: new Date().toISOString(),
  };
}

/** AA → A 로 내릴 때 사라지는 항목 중 사용자가 이미 기록을 남긴 것. */
export function itemsLostByLevelChange(project: ChecklistProject, level: Level): string[] {
  const keep = new Set(definitionsFor(project.standard, level).map((d) => d.id));
  return Object.entries(project.items)
    .filter(([id, s]) => !keep.has(id) && (s.status !== "not_started" || s.note || s.evidenceUrl))
    .map(([id]) => id);
}

/** 사용자가 이미 기록을 남긴 항목이 하나라도 있는가 (기준 변경·초기화 경고용) */
export function hasUserInput(project: ChecklistProject): boolean {
  return Object.values(project.items).some(
    (s) => s.status !== "not_started" || s.note.trim() !== "" || s.evidenceUrl.trim() !== "",
  );
}
