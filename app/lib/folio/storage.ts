/* ============================================================
   경력기술서·포트폴리오 로컬 저장

   서버로 아무것도 보내지 않는다. 저장 위치는 현재 브라우저의 localStorage 한 곳이다.
   두 도구(경력기술서 빌더 · 포트폴리오 빌더)가 같은 키를 쓴다: 공통 프로필을 함께 쓰기 때문.
   페이지 언어(KO · EN)마다 키를 나눈다: 영문 페이지는 영문 예시·영문 프로필로 따로 시작한다.

   원칙 (체크리스트 빌더와 같다):
   1. SSR 중에는 접근하지 않는다.
   2. 읽을 수 없는 데이터를 자동 삭제하지 않는다. 사용자가 덮어쓰기 전까지 원본을 둔다.
   ============================================================ */
import type { DocLang, FolioEntry, FolioKind, SourceDoc, Workspace } from "./types";

export const STORAGE_KEY = "kf:folio:v1";
/** 페이지 언어별 저장 키. KO 는 처음 출시한 키를 그대로 쓴다 (기존 저장본 유지). */
export const storageKey = (pageLang: DocLang) => (pageLang === "en" ? `${STORAGE_KEY}:en` : STORAGE_KEY);
export const BACKUP_MARK = "kitfolio_folio_backup";

export type LoadResult =
  | { kind: "empty" }
  | { kind: "ok"; workspace: Workspace }
  | { kind: "unreadable"; raw: string };

export type SaveResult = { ok: true } | { ok: false; reason: "quota" | "blocked" };

const isObj = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

export function newId(): string {
  return `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

function entry(v: unknown): FolioEntry | null {
  if (!isObj(v) || !isObj(v.doc)) return null;
  return {
    id: typeof v.id === "string" && v.id ? v.id : newId(),
    lang: v.lang === "en" ? "en" : "ko",
    doc: v.doc as SourceDoc,
    updatedAt: typeof v.updatedAt === "string" ? v.updatedAt : new Date().toISOString(),
  };
}

/** 저장된 값이나 백업 파일을 신뢰하지 않고 Workspace 모양으로 맞춘다. 모양이 아니면 null. */
export function normalizeWorkspace(v: unknown): Workspace | null {
  if (!isObj(v) || v.schemaVersion !== 1) return null;
  const list = (x: unknown) => (Array.isArray(x) ? x.map(entry).filter((e): e is FolioEntry => e !== null) : []);
  const active = isObj(v.active) ? v.active : {};
  return {
    schemaVersion: 1,
    profile: isObj(v.profile) ? (v.profile as SourceDoc) : {},
    resume: list(v.resume),
    portfolio: list(v.portfolio),
    active: {
      resume: typeof active.resume === "string" ? active.resume : undefined,
      portfolio: typeof active.portfolio === "string" ? active.portfolio : undefined,
    },
  };
}

export function loadWorkspace(pageLang: DocLang): LoadResult {
  if (typeof window === "undefined") return { kind: "empty" };
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(storageKey(pageLang));
  } catch {
    return { kind: "empty" };
  }
  if (!raw) return { kind: "empty" };
  try {
    const ws = normalizeWorkspace(JSON.parse(raw));
    return ws ? { kind: "ok", workspace: ws } : { kind: "unreadable", raw };
  } catch {
    return { kind: "unreadable", raw };
  }
}

export function saveWorkspace(ws: Workspace, pageLang: DocLang): SaveResult {
  if (typeof window === "undefined") return { ok: true };
  try {
    window.localStorage.setItem(storageKey(pageLang), JSON.stringify(ws));
    return { ok: true };
  } catch (e) {
    const name = (e as { name?: string }).name ?? "";
    return { ok: false, reason: /quota/i.test(name) ? "quota" : "blocked" };
  }
}

/** 저장 크기(문자 수 기준 대략치, KB) */
export function workspaceSizeKb(ws: Workspace): number {
  return Math.round(JSON.stringify(ws).length / 1024);
}

export function makeEntry(doc: SourceDoc, lang: DocLang): FolioEntry {
  return { id: newId(), lang, doc, updatedAt: new Date().toISOString() };
}

/** 지금 편집 중인 문서. active id 가 없거나 지워졌으면 첫 문서. */
export function activeEntry(ws: Workspace, kind: FolioKind): FolioEntry | undefined {
  const list = ws[kind];
  return list.find((e) => e.id === ws.active[kind]) ?? list[0];
}
