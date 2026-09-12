/* ============================================================
   내보내기: Markdown · CSV

   두 형식 모두 **현재 체크리스트 전체**를 담는다. 필터는 화면에만 적용되고
   내보내기에는 영향을 주지 않는다: 전달받은 사람이 빠진 항목을 알 수 없기 때문이다.

   브라우저 저장은 백업이 아니다. 중요한 작업은 이 파일로 보관한다.
   ============================================================ */
import { computeProgress, definitionsFor, isNaCandidate } from "./catalog";
import {
  AXIS_LABEL,
  ENVIRONMENT_LABEL,
  ORGANIZATION_LABEL,
  PHASE_LABEL,
  ROLE_LABEL,
  STANDARD_LABEL,
  STATUS_LABEL,
} from "./labels";
import { AXIS_ORDER, type ChecklistProject } from "./types";

type Lang = "ko" | "en";

const COPY = {
  ko: {
    heading: (name: string) => `# ${name} 웹접근성 체크리스트`,
    standard: "기준",
    environment: "환경",
    organization: "운영 유형",
    created: "생성일",
    updated: "최종 수정",
    progress: "검토 진행률",
    counts: "항목 현황",
    roles: "역할",
    phases: "단계",
    question: "확인 질문",
    note: "메모",
    evidence: "근거",
    source: "출처",
    naCandidate: "해당 없음 후보",
    noProgress: "검토할 항목이 없습니다",
    disclaimer:
      "이 문서는 내부 사전 검토 기록입니다. 공식 웹 접근성 품질인증 판정이나 준수율 산정을 대신하지 않습니다.",
    filename: "accessibility-checklist",
    csv: [
      "프로젝트명",
      "기준",
      "기준 번호",
      "레벨",
      "검사 축",
      "항목명",
      "확인 질문",
      "역할",
      "단계",
      "상태",
      "N/A 후보",
      "메모",
      "근거 URL",
      "공식 출처",
      "수정 시각",
    ],
    yes: "예",
    no: "아니요",
  },
  en: {
    heading: (name: string) => `# ${name} web accessibility checklist`,
    standard: "Standard",
    environment: "Environment",
    organization: "Organization type",
    created: "Created",
    updated: "Last updated",
    progress: "Review progress",
    counts: "Status counts",
    roles: "Roles",
    phases: "Phases",
    question: "Check",
    note: "Note",
    evidence: "Evidence",
    source: "Source",
    naCandidate: "Not applicable candidate",
    noProgress: "No items to review",
    disclaimer:
      "This document is an internal pre-review record. It is not a conformance claim, a score, or a certification result.",
    filename: "accessibility-checklist",
    csv: [
      "Project",
      "Standard",
      "Criterion",
      "Level",
      "Axis",
      "Title",
      "Check",
      "Roles",
      "Phases",
      "Status",
      "NA candidate",
      "Note",
      "Evidence URL",
      "Source",
      "Updated",
    ],
    yes: "Yes",
    no: "No",
  },
} as const;

/** ISO 문자열에서 날짜만 (YYYY-MM-DD). 시간대 변환 없이 저장된 값을 그대로 쓴다. */
function dateOnly(iso: string): string {
  return iso.slice(0, 10);
}

/**
 * 파일명용 슬러그: **ASCII 영문·숫자만** 남긴다.
 *
 * 한글을 그대로 두면 안 되는 이유가 있다. Chromium 은 blob URL 다운로드에서
 * `download` 속성에 비 ASCII 문자가 하나라도 있으면 이름 전체를 버리고
 * 확장자 없는 `download` 로 저장한다. 확장자가 사라진 파일은 열 수 없으므로,
 * 한글 프로젝트명은 슬러그에서 빼고 도구명과 날짜로만 파일을 식별한다.
 * (프로젝트명은 문서 첫 줄과 CSV 첫 열에 그대로 남는다)
 *
 * 남길 것이 없으면 빈 문자열을 돌려주고 exportFilename 이 그 자리를 생략한다.
 */
export function projectSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/, "");
}

export function exportFilename(project: ChecklistProject, lang: Lang, ext: "md" | "csv"): string {
  const date = dateOnly(new Date().toISOString());
  const parts = [projectSlug(project.projectName), COPY[lang].filename, date].filter(Boolean);
  return `${parts.join("-")}.${ext}`;
}

/** 상태 요약 한 줄: "통과 10 · 이슈 3 · 검토 중 3 · 미검토 15 · 해당 없음 2" */
function countsLine(project: ChecklistProject, lang: Lang): string {
  const defs = definitionsFor(project.standard, project.targetLevel);
  const p = computeProgress(defs, project.items);
  const s = STATUS_LABEL[lang];
  return [
    `${s.pass} ${p.pass}`,
    `${s.issue} ${p.issue}`,
    `${s.in_review} ${p.inReview}`,
    `${s.not_started} ${p.notStarted}`,
    `${s.not_applicable} ${p.notApplicable}`,
  ].join(" · ");
}

/**
 * Markdown 내보내기.
 * 메모·근거가 비어 있으면 해당 줄을 생략하고, 미검토 항목도 전부 포함한다.
 */
export function toMarkdown(project: ChecklistProject, lang: Lang): string {
  const c = COPY[lang];
  const defs = definitionsFor(project.standard, project.targetLevel);
  const progress = computeProgress(defs, project.items);
  const standardText =
    project.standard === "wcag-2.2" && project.targetLevel
      ? `${STANDARD_LABEL[lang]["wcag-2.2"]} Level ${project.targetLevel}`
      : STANDARD_LABEL[lang][project.standard];

  const lines: string[] = [
    c.heading(project.projectName),
    "",
    `- ${c.standard}: ${standardText}`,
    `- ${c.environment}: ${ENVIRONMENT_LABEL[lang][project.environment]}`,
    `- ${c.organization}: ${ORGANIZATION_LABEL[lang][project.organization]}`,
    `- ${c.created}: ${dateOnly(project.createdAt)}`,
    `- ${c.updated}: ${dateOnly(project.updatedAt)}`,
    `- ${c.progress}: ${progress.percent === null ? c.noProgress : `${progress.percent}%`}`,
    `- ${c.counts}: ${countsLine(project, lang)}`,
    "",
    `> ${c.disclaimer}`,
  ];

  for (const axis of AXIS_ORDER) {
    const group = defs.filter((d) => d.axis === axis);
    if (group.length === 0) continue;
    lines.push("", `## ${AXIS_LABEL[lang][axis]}`);

    for (const def of group) {
      const state = project.items[def.id];
      const status = STATUS_LABEL[lang][state?.status ?? "not_started"];
      lines.push("", `### [${status}] ${def.criterion}. ${def.title[lang]}`);
      if (def.level) lines.push(`- Level: ${def.level}`);
      lines.push(`- ${c.roles}: ${def.roles.map((r) => ROLE_LABEL[lang][r]).join(", ")}`);
      lines.push(`- ${c.phases}: ${def.phases.map((p) => PHASE_LABEL[lang][p]).join(", ")}`);
      lines.push(`- ${c.question}: ${def.question[lang]}`);
      if (isNaCandidate(def, project.features)) lines.push(`- ${c.naCandidate}: ${c.yes}`);
      if (state?.note.trim()) lines.push(`- ${c.note}: ${state.note.trim()}`);
      if (state?.evidenceUrl.trim()) lines.push(`- ${c.evidence}: ${state.evidenceUrl.trim()}`);
      lines.push(`- ${c.source}: ${def.sourceUrl}`);
    }
  }

  return lines.join("\n") + "\n";
}

/** RFC 4180: 쉼표·따옴표·줄바꿈이 있으면 감싸고 내부 따옴표는 두 번 쓴다. */
export function csvCell(value: string): string {
  if (/[",\r\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

/**
 * CSV 내보내기. 한국어 Excel 에서 깨지지 않도록 UTF-8 BOM 을 붙이고
 * 줄바꿈은 CRLF 를 쓴다. 열 순서는 명세에 고정돼 있다.
 */
export function toCsv(project: ChecklistProject, lang: Lang): string {
  const c = COPY[lang];
  const defs = definitionsFor(project.standard, project.targetLevel);
  const rows: string[][] = [[...c.csv]];

  for (const def of defs) {
    const state = project.items[def.id];
    rows.push([
      project.projectName,
      STANDARD_LABEL[lang][def.standard],
      def.criterion,
      def.level ?? "",
      AXIS_LABEL[lang][def.axis],
      def.title[lang],
      def.question[lang],
      def.roles.map((r) => ROLE_LABEL[lang][r]).join(" / "),
      def.phases.map((p) => PHASE_LABEL[lang][p]).join(" / "),
      STATUS_LABEL[lang][state?.status ?? "not_started"],
      isNaCandidate(def, project.features) ? c.yes : c.no,
      state?.note ?? "",
      state?.evidenceUrl ?? "",
      def.sourceUrl,
      state?.updatedAt ?? "",
    ]);
  }

  const body = rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
  return "﻿" + body + "\r\n";
}
