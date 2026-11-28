/* ============================================================
   yml 읽기·쓰기 (js-yaml). 브라우저 안에서만 돈다.
   ============================================================ */
import { dump, load } from "js-yaml";
import type { SourceDoc } from "./types";

export type YamlResult = { ok: true; doc: SourceDoc } | { ok: false; message: string; line?: number };

export function parseYaml(text: string): YamlResult {
  // js-yaml 5 는 빈 입력(주석만 있는 입력 포함)을 오류로 본다. 편집 중 전부 지운 상태는 빈 문서로 둔다.
  if (!text.replace(/^\s*#.*$/gm, "").trim()) return { ok: true, doc: {} };
  try {
    const v = load(text);
    if (v == null) return { ok: true, doc: {} };
    if (typeof v !== "object" || Array.isArray(v)) {
      return { ok: false, message: "top-level must be a mapping (key: value)" };
    }
    return { ok: true, doc: v as SourceDoc };
  } catch (e) {
    const err = e as { reason?: string; message?: string; mark?: { line?: number } };
    const line = typeof err.mark?.line === "number" ? err.mark.line + 1 : undefined;
    return { ok: false, message: err.reason ?? err.message ?? String(e), line };
  }
}

/** 빈 값(빈 문자열·빈 배열·빈 객체)을 지워 yml 을 짧게 유지한다. */
export function prune(v: unknown): unknown {
  if (Array.isArray(v)) {
    const out = v.map(prune).filter((x) => x !== undefined);
    return out.length ? out : undefined;
  }
  if (v && typeof v === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v)) {
      const p = prune(val);
      if (p !== undefined) out[k] = p;
    }
    return Object.keys(out).length ? out : undefined;
  }
  if (v === "" || v === null || v === undefined) return undefined;
  return v;
}

export function dumpYaml(doc: SourceDoc): string {
  const clean = (prune(doc) as SourceDoc | undefined) ?? {};
  if (Object.keys(clean).length === 0) return "";
  return dump(clean, { lineWidth: -1, noRefs: true });
}
