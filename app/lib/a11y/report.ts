/* ============================================================
   HTML 접근성 검사기: Markdown 보고서 (기획서 4.6)

   PR·이슈·QA 티켓에 그대로 붙일 수 있는 형태로 만든다.
   원본 HTML 전체는 절대 넣지 않는다: 코드 조각만, 그것도 결과 카드와
   같은 160자 제한을 그대로 따른다.
   ============================================================ */
import type { Lang } from "../content";
import { SITE } from "../content";
import { interpolate } from "./messages";
import type { AnalysisResult, Finding } from "./types";

const LABEL = {
  ko: {
    title: "HTML 접근성 검사 보고서",
    tool: "도구",
    toolName: "HTML 접근성 검사기",
    scope: "검사 범위",
    fragment: "컴포넌트 조각",
    document: "전체 문서",
    summary: "요약",
    issue: "오류 가능성 높음",
    review: "검토 필요",
    manual: "수동 검사",
    elements: "검사 요소",
    location: "위치",
    path: "요소 경로",
    wcag: "관련 WCAG",
    code: "코드",
    reason: "이유",
    fix: "수정 방향",
    none: "자동 검사에서 발견된 항목이 없습니다.",
    noLocation: "파서가 보완한 요소 · 원본 위치 없음",
    note: "자동 검사는 정적 HTML에서 확인 가능한 항목만 다룹니다. 전체 접근성 준수 여부를 판정하지 않습니다.",
  },
  en: {
    title: "HTML accessibility report",
    tool: "Tool",
    toolName: "HTML Accessibility Checker",
    scope: "Scope",
    fragment: "HTML fragment",
    document: "Full document",
    summary: "Summary",
    issue: "High-confidence issues",
    review: "Needs review",
    manual: "Manual test",
    elements: "Elements checked",
    location: "Location",
    path: "Element path",
    wcag: "Related WCAG",
    code: "Code",
    reason: "Why it matters",
    fix: "How to fix",
    none: "No findings from the automatic checks.",
    noLocation: "Inserted by the parser, no source location",
    note: "Automatic checks cover only what static HTML can show. They do not determine overall accessibility conformance.",
  },
} as const;

type Translate = (key: string) => string;

/** 검사 결과를 Markdown 문자열로 만든다.
 *  @param t  규칙 문구 조회 (컴포넌트의 useT: RULE_COPY 를 포함한 사전) */
export function buildReport(result: AnalysisResult, lang: Lang, t: Translate): string {
  const l = LABEL[lang];
  const url = SITE.url + (lang === "en" ? "/en" : "") + "/html-accessibility-checker";
  const lines: string[] = [];

  lines.push(`# ${l.title}`, "");
  lines.push(`- ${l.tool}: ${l.toolName} (${url})`);
  lines.push(`- ${l.scope}: ${result.scope === "document" ? l.document : l.fragment}`);
  lines.push(
    `- ${l.summary}: ${l.issue} ${result.counts.issue} · ${l.review} ${result.counts.review} · ${l.manual} ${result.counts.manual} · ${l.elements} ${result.counts.elements}`,
  );
  lines.push("");

  for (const level of ["issue", "review"] as const) {
    const items = result.findings.filter((f) => f.level === level);
    lines.push(`## ${l[level]} (${items.length})`, "");
    if (!items.length) {
      lines.push(l.none, "");
      continue;
    }
    items.forEach((f, i) => {
      lines.push(`### ${i + 1}. ${f.ruleId} · ${t(f.titleKey)}`, "");
      lines.push(`- ${l.location}: ${locationText(f, l.noLocation)}`);
      if (f.elementPath) lines.push(`- ${l.path}: \`${f.elementPath}\``);
      if (f.wcag.length) lines.push(`- ${l.wcag}: ${f.wcag.join(", ")}`);
      if (f.snippet) lines.push(`- ${l.code}: \`${escapeInlineCode(f.snippet)}\``);
      lines.push(`- ${l.reason}: ${interpolate(t(f.reasonKey), f.vars)}`);
      lines.push(`- ${l.fix}: ${interpolate(t(f.fixKey), f.vars)}`);
      lines.push("");
    });
  }

  const manual = result.findings.filter((f) => f.level === "manual");
  lines.push(`## ${l.manual} (${manual.length})`, "");
  manual.forEach((f, i) => {
    lines.push(`${i + 1}. ${t(f.titleKey)} ${interpolate(t(f.fixKey), f.vars)}`);
  });
  lines.push("", l.note, "");

  return lines.join("\n");
}

function locationText(f: Finding, fallback: string): string {
  if (f.line === undefined) return fallback;
  return `${f.line}:${f.column ?? 1}`;
}

/** 백틱이 들어간 조각이 코드 스팬을 깨지 않게 한다 */
function escapeInlineCode(s: string): string {
  return s.replace(/`/g, "'");
}
