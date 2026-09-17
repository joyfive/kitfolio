/* ============================================================
   체크리스트 로컬 저장

   서버로 아무것도 보내지 않는다. 저장 위치는 현재 브라우저의 localStorage
   한 곳뿐이며, 프로젝트명·메모·근거 URL 은 분석 이벤트에도 넣지 않는다.

   원칙 두 가지:
   1. **SSR 중에는 절대 접근하지 않는다.** 모든 함수가 window 존재를 먼저 본다.
   2. **읽을 수 없는 데이터를 자동 삭제하지 않는다.** 사용자가 새 체크리스트를
      만들기 전까지 원본을 그대로 둔다. 잘못 파싱한 쪽이 사라지면 복구할 수 없다.
   ============================================================ */
import {
  DEFAULT_FEATURES,
  LIMITS,
  SCHEMA_VERSION,
  STORAGE_KEY,
  emptyItemState,
  type ChecklistProject,
  type FeatureId,
  type ItemState,
  type Status,
} from "./types";
import { definitionsFor } from "./catalog";

/** 저장소 읽기 결과. 비어 있음 / 정상 / 읽을 수 없음을 구분한다. */
export type LoadResult =
  | { kind: "empty" }
  | { kind: "ok"; project: ChecklistProject }
  | { kind: "unreadable"; reason: "parse" | "schema" | "shape" };

const STATUSES: Status[] = ["not_started", "in_review", "pass", "issue", "not_applicable"];

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.slice(0, max) : "";
}

/** 저장된 항목 상태 하나를 신뢰하지 않고 정규화한다. */
function normalizeItem(raw: unknown): ItemState {
  if (!raw || typeof raw !== "object") return emptyItemState();
  const r = raw as Record<string, unknown>;
  const status = STATUSES.includes(r.status as Status) ? (r.status as Status) : "not_started";
  return {
    status,
    note: str(r.note, LIMITS.note),
    evidenceUrl: str(r.evidenceUrl, LIMITS.evidenceUrl),
    updatedAt: typeof r.updatedAt === "string" ? r.updatedAt : null,
  };
}

/**
 * 저장된 프로젝트 읽기.
 *
 * 스키마 버전이 다르면 `unreadable` 을 반환하고 **삭제하지 않는다.**
 * 기준 목록은 저장하지 않고 standard·targetLevel 로 다시 만들기 때문에,
 * 항목 정의가 늘어나도 사용자 상태는 id 로 다시 붙는다.
 */
export function loadProject(): LoadResult {
  if (typeof window === "undefined") return { kind: "empty" };
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return { kind: "empty" }; // 저장소 접근 자체가 막힌 브라우저
  }
  if (!raw) return { kind: "empty" };

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { kind: "unreadable", reason: "parse" };
  }
  if (!parsed || typeof parsed !== "object") return { kind: "unreadable", reason: "shape" };

  const p = parsed as Record<string, unknown>;
  if (p.schemaVersion !== SCHEMA_VERSION) return { kind: "unreadable", reason: "schema" };
  if (p.standard !== "kwcag-2.2" && p.standard !== "wcag-2.2") {
    return { kind: "unreadable", reason: "shape" };
  }

  const standard = p.standard;
  const targetLevel =
    standard === "kwcag-2.2" ? null : p.targetLevel === "A" ? "A" : "AA";
  const defs = definitionsFor(standard, targetLevel);
  const savedItems = (p.items ?? {}) as Record<string, unknown>;

  const items: Record<string, ItemState> = {};
  for (const d of defs) items[d.id] = normalizeItem(savedItems[d.id]);

  const features = { ...DEFAULT_FEATURES };
  const savedFeatures = (p.features ?? {}) as Record<string, unknown>;
  for (const key of Object.keys(features) as FeatureId[]) {
    if (typeof savedFeatures[key] === "boolean") features[key] = savedFeatures[key] as boolean;
  }

  const now = new Date().toISOString();
  return {
    kind: "ok",
    project: {
      schemaVersion: SCHEMA_VERSION,
      projectName: str(p.projectName, LIMITS.projectName),
      standard,
      targetLevel,
      environment:
        p.environment === "desktop-first" || p.environment === "mobile-first"
          ? p.environment
          : "responsive",
      organization:
        p.organization === "public-certification" ? "public-certification" : "general-private",
      features,
      createdAt: typeof p.createdAt === "string" ? p.createdAt : now,
      updatedAt: typeof p.updatedAt === "string" ? p.updatedAt : now,
      items,
    },
  };
}

/** 저장. 실패하면 false 를 돌려주고 화면 상태는 호출부가 그대로 유지한다. */
export function saveProject(project: ChecklistProject): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    return true;
  } catch {
    return false; // 용량 초과 · 시크릿 모드 · 저장 차단
  }
}

/** 저장 데이터 삭제. 사용자가 "삭제하고 새로 만들기"를 확인했을 때만 호출한다. */
export function clearProject(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* 지우지 못해도 화면은 새 설정 카드로 돌아간다 */
  }
}
