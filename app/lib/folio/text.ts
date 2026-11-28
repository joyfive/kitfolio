/* ============================================================
   폼 텍스트 ↔ 문서 값 변환

   폼에서는 문단·리스트를 한 입력칸에 쓴다. 규칙은 마크다운과 같다:
     - 항목          → 리스트 항목
       - 하위 항목   → 바로 위 항목의 하위 (공백 2칸 이상 들여쓰기)
     그냥 문장        → 문단
   "- " 로 시작하는 줄이 하나도 없으면 문단(문자열), 하나라도 있으면 리스트로 저장한다.
   ============================================================ */
import type { ListItem, Rich } from "./types";

const BULLET = /^(\s*)[-*]\s+(.*)$/;

export function textToRich(text: string): Rich | undefined {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  if (!lines.some((l) => BULLET.test(l))) {
    const s = text.trim();
    return s || undefined;
  }
  const out: ListItem[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const m = BULLET.exec(line);
    const indent = m ? m[1].length : 0;
    const body = (m ? m[2] : line).trim();
    const prev = out[out.length - 1];
    if (indent >= 2 && prev !== undefined) {
      const parent = typeof prev === "string" ? { text: prev, children: [] as string[] } : prev;
      parent.children = [...(parent.children ?? []), body];
      out[out.length - 1] = parent;
    } else {
      out.push(body);
    }
  }
  return out.length ? out : undefined;
}

export function richToText(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number") return String(v);
  if (!Array.isArray(v)) return "";
  const lines: string[] = [];
  for (const it of v) {
    if (typeof it === "string" || typeof it === "number") lines.push(`- ${it}`);
    else if (it && typeof it === "object") {
      const o = it as { text?: unknown; children?: unknown };
      lines.push(`- ${typeof o.text === "string" ? o.text : ""}`);
      if (Array.isArray(o.children)) for (const c of o.children) lines.push(`  - ${String(c)}`);
    }
  }
  return lines.join("\n");
}

/** 한 줄 = 한 항목 (빈 줄 제외) */
export function textToLines(text: string): string[] {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

export function linesToText(v: unknown): string {
  if (typeof v === "string") return v;
  if (!Array.isArray(v)) return "";
  return v.map((x) => (typeof x === "string" || typeof x === "number" ? String(x) : "")).join("\n");
}

/** 표 한 줄: 셀은 | 로 나눈다 */
export function textToRows(text: string): string[][] {
  return textToLines(text).map((l) => l.split("|").map((c) => c.trim()));
}
export function rowsToText(v: unknown): string {
  if (!Array.isArray(v)) return "";
  return v.map((r) => (Array.isArray(r) ? r.map((c) => String(c ?? "")).join(" | ") : String(r))).join("\n");
}

/** 항상 리스트: 한 줄 = 한 항목, 2칸 이상 들여쓰면 바로 위 항목의 하위. 줄머리 "- " 는 있어도 없어도 된다. */
export function textToList(text: string): ListItem[] {
  const bulletized = text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .filter((l) => l.trim())
    .map((l) => `${/^\s{2,}/.test(l) ? "  " : ""}- ${l.trim().replace(/^[-*]\s+/, "")}`)
    .join("\n");
  const r = textToRich(bulletized);
  return Array.isArray(r) ? r : [];
}

export function listToText(v: unknown): string {
  const list = Array.isArray(v) ? v : typeof v === "string" && v ? [v] : [];
  return richToText(list)
    .split("\n")
    .map((l) => l.replace(/^(\s*)- /, "$1"))
    .join("\n");
}
