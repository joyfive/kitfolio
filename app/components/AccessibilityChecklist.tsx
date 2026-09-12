"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PageHead from "./PageHead";
import ToolGuide from "./ToolGuide";
import Faq from "./Faq";
import RelatedTools from "./RelatedTools";
import { localizedHref } from "../lib/content";
import { useLang, useT, type Dict } from "../lib/i18n";
import {
  changeTargetLevel,
  computeProgress,
  createProject,
  definitionsFor,
  firstOpenAxis,
  hasUserInput,
  isNaCandidate,
  itemCountFor,
  itemsLostByLevelChange,
  summarizeByAxis,
} from "../lib/checklist/catalog";
import { exportFilename, toCsv, toMarkdown } from "../lib/checklist/export";
import {
  AXIS_LABEL,
  ENVIRONMENT_LABEL,
  FEATURE_EFFECT,
  FEATURE_QUESTION,
  ORGANIZATION_LABEL,
  PHASE_LABEL,
  ROLE_LABEL,
  STANDARD_LABEL,
  STANDARD_NOTE,
  STATUS_LABEL,
  STATUS_MEANING,
  TOOL_CTA,
} from "../lib/checklist/labels";
import { clearProject, loadProject, saveProject } from "../lib/checklist/storage";
import {
  AXIS_ORDER,
  DEFAULT_FEATURES,
  FEATURE_ORDER,
  LIMITS,
  PHASE_ORDER,
  ROLE_ORDER,
  STATUS_ORDER,
  type Axis,
  type ChecklistProject,
  type Environment,
  type FeatureId,
  type Level,
  type Organization,
  type Phase,
  type Role,
  type Standard,
  type Status,
} from "../lib/checklist/types";

const SLUG = "accessibility-checklist";

/* 컨트롤 마이크로카피만 로컬 dict.
   페이지 콘텐츠(제목·설명·가이드·FAQ)는 content.ts 레지스트리,
   축·역할·단계·상태 라벨은 lib/checklist/labels.ts (내보내기와 공유). */
const DICT: Dict = {
  ko: {
    "ac.nav.label": "접근성 도구",
    "ac.nav.contrast": "명도대비",
    "ac.nav.cvd": "색각 미리보기",
    "ac.nav.html": "HTML 검사",
    "ac.nav.scale": "확대·간격",
    "ac.nav.checklist": "체크리스트",

    "ac.privacy":
      "입력한 프로젝트 정보와 체크 상태는 이 브라우저에만 저장됩니다. 다른 기기와 동기화되지 않으므로 중요한 결과는 Markdown 또는 CSV로 보관하세요.",

    "ac.setup.title": "체크리스트 만들기",
    "ac.setup.editTitle": "설정 변경",
    "ac.setup.name": "프로젝트명",
    "ac.setup.namePlaceholder": "예: 고객센터 리뉴얼",
    "ac.setup.nameError": "프로젝트명을 입력해 주세요.",
    "ac.setup.standard": "적용 기준",
    "ac.setup.level": "목표 레벨",
    "ac.setup.levelA": "A",
    "ac.setup.levelAA": "AA",
    "ac.setup.levelNote": "AA를 선택하면 A 항목이 함께 포함됩니다.",
    "ac.setup.environment": "테스트 환경",
    "ac.setup.organization": "운영 유형",
    "ac.setup.publicNote":
      "준비용 체크리스트이며 공식 표본 심사와 사용자 심사를 대신하지 않습니다.",
    "ac.setup.features": "서비스 기능",
    "ac.setup.featuresHelp":
      "없다고 답한 기능의 관련 항목은 삭제되지 않고 해당 없음 후보로만 표시됩니다. 최종 판단은 실제 화면을 확인한 뒤 직접 정하세요.",
    "ac.setup.featureYes": "예",
    "ac.setup.featureNo": "아니요",
    "ac.setup.preview": "생성될 항목",
    "ac.setup.submit": "이 설정으로 생성",
    "ac.setup.cancel": "취소",
    "ac.setup.unit": "개",

    "ac.summary.project": "프로젝트",
    "ac.summary.standard": "기준",
    "ac.summary.environment": "환경",
    "ac.summary.organization": "운영",
    "ac.summary.storage": "저장",
    "ac.summary.storageValue": "이 브라우저에 자동 저장됨",
    "ac.summary.edit": "설정 변경",
    "ac.summary.progress": "검토 진행률",
    "ac.summary.progressNote": "작업 진행 상황이며 준수율이나 인증 점수가 아닙니다.",
    "ac.summary.empty": "검토할 항목이 없습니다",
    "ac.summary.itemsTotal": "전체 항목",

    "ac.restore.banner": "이 브라우저에 저장된 “{name}” 체크리스트를 불러왔습니다.",
    "ac.restore.dismiss": "확인",
    "ac.error.unreadable":
      "저장된 체크리스트 형식을 읽을 수 없습니다. 내보낸 파일이 있다면 보관한 뒤 새로 시작해 주세요.",
    "ac.error.save":
      "브라우저에 저장하지 못했습니다. 페이지를 닫기 전에 체크리스트를 다운로드해 주세요.",
    "ac.error.copy": "복사하지 못했습니다. Markdown 다운로드를 이용해 주세요.",
    "ac.error.download": "파일을 만들지 못했습니다. 다시 시도해 주세요.",

    "ac.filter.search": "검색",
    "ac.filter.searchPlaceholder": "기준 번호, 제목, 질문, 메모 검색",
    "ac.filter.status": "상태",
    "ac.filter.role": "역할",
    "ac.filter.phase": "단계",
    "ac.filter.axis": "검사 축",
    "ac.filter.na": "해당 없음 후보",
    "ac.filter.naOnly": "후보만 보기",
    "ac.filter.all": "전체",
    "ac.filter.sort": "정렬",
    "ac.sort.default": "기본 순서",
    "ac.sort.issue": "이슈 먼저",
    "ac.sort.recent": "최근 수정",
    "ac.filter.reset": "필터 초기화",
    "ac.filter.empty": "조건에 맞는 항목이 없습니다. 필터를 초기화해 보세요.",
    "ac.filter.visible": "표시 중 {count}개",

    "ac.item.level": "레벨",
    "ac.item.how": "확인 방법",
    "ac.item.evidenceHint": "완료 근거",
    "ac.item.status": "상태",
    "ac.item.note": "메모",
    "ac.item.notePlaceholder": "확인한 범위와 결과를 기록해 주세요.",
    "ac.item.noteIssue": "발견한 문제, 영향 화면, 수정 담당을 기록해 주세요.",
    "ac.item.noteNa": "해당하지 않는 이유를 기록해 주세요.",
    "ac.item.url": "근거 URL",
    "ac.item.urlPlaceholder": "https://",
    "ac.item.saved": "저장됨",
    "ac.item.source": "공식 기준 보기",
    "ac.item.naBadge": "해당 없음 후보",
    "ac.item.naHelp":
      "선택한 서비스 기능에 따르면 적용되지 않을 가능성이 있습니다. 실제 화면을 확인한 뒤 상태를 정하세요.",

    "ac.axis.count": "{done} / {total} 검토",
    "ac.axis.issue": "이슈 {count}",

    "ac.export.title": "내보내기",
    "ac.export.help":
      "필터와 상관없이 현재 체크리스트 전체가 포함됩니다. 브라우저 저장은 백업이 아니므로 정기적으로 내려받아 보관하세요.",
    "ac.export.copyMd": "Markdown 복사",
    "ac.export.copied": "Markdown 체크리스트를 복사했습니다.",
    "ac.export.downloadMd": "Markdown 다운로드",
    "ac.export.downloadCsv": "CSV 다운로드",
    "ac.export.reset": "새 체크리스트",
    "ac.reset.confirm":
      "현재 체크 상태와 메모가 이 브라우저에서 삭제됩니다. 먼저 내보내시겠어요?",
    "ac.reset.go": "삭제하고 새로 만들기",

    "ac.confirm.standard":
      "적용 기준을 바꾸면 현재 체크 상태와 메모가 초기화됩니다. 계속할까요?",
    "ac.confirm.level":
      "목표 레벨을 A로 내리면 기록이 남은 AA 항목 {count}개가 삭제됩니다. 계속할까요?",

    "ac.interpret.title": "결과를 어떻게 읽어야 하나요",
    "ac.interpret.cert":
      "이 체크리스트는 내부 사전 검토 기록입니다. 국내 웹 접근성 품질인증은 표본 페이지 선정, 항목별 준수율 산정, 전문가 심사와 사용자 심사를 포함하는 별도 절차이며 이 도구가 대신하지 않습니다. 모든 항목을 통과로 표시했더라도 인증 통과나 준수율 100%로 보고하지 마세요.",
  },
  en: {
    "ac.nav.label": "Accessibility tools",
    "ac.nav.contrast": "Contrast",
    "ac.nav.cvd": "Color vision",
    "ac.nav.html": "HTML check",
    "ac.nav.scale": "Scaling",
    "ac.nav.checklist": "Checklist",

    "ac.privacy":
      "Your project details and review status stay in this browser only. Nothing syncs to another device, so export important work as Markdown or CSV.",

    "ac.setup.title": "Build a checklist",
    "ac.setup.editTitle": "Change settings",
    "ac.setup.name": "Project name",
    "ac.setup.namePlaceholder": "e.g. Support center redesign",
    "ac.setup.nameError": "Enter a project name.",
    "ac.setup.standard": "Standard",
    "ac.setup.level": "Target level",
    "ac.setup.levelA": "A",
    "ac.setup.levelAA": "AA",
    "ac.setup.levelNote": "Choosing AA includes the Level A criteria as well.",
    "ac.setup.environment": "Test environment",
    "ac.setup.organization": "Organization type",
    "ac.setup.publicNote":
      "This is preparation material. It does not replace official sampling or user testing.",
    "ac.setup.features": "Product features",
    "ac.setup.featuresHelp":
      "Items related to a feature you do not have are never deleted. They are only flagged as not applicable candidates, and you make the final call after checking the real screens.",
    "ac.setup.featureYes": "Yes",
    "ac.setup.featureNo": "No",
    "ac.setup.preview": "Items to generate",
    "ac.setup.submit": "Create with these settings",
    "ac.setup.cancel": "Cancel",
    "ac.setup.unit": "",

    "ac.summary.project": "Project",
    "ac.summary.standard": "Standard",
    "ac.summary.environment": "Environment",
    "ac.summary.organization": "Organization",
    "ac.summary.storage": "Storage",
    "ac.summary.storageValue": "Saved automatically in this browser",
    "ac.summary.edit": "Change settings",
    "ac.summary.progress": "Review progress",
    "ac.summary.progressNote": "This tracks workflow, not conformance or a certification score.",
    "ac.summary.empty": "No items to review",
    "ac.summary.itemsTotal": "Total items",

    "ac.restore.banner": "Loaded the “{name}” checklist saved in this browser.",
    "ac.restore.dismiss": "Got it",
    "ac.error.unreadable":
      "The saved checklist could not be read. Keep any exported file, then start a new checklist.",
    "ac.error.save":
      "Could not save to this browser. Download the checklist before closing the page.",
    "ac.error.copy": "Could not copy. Use the Markdown download instead.",
    "ac.error.download": "Could not create the file. Please try again.",

    "ac.filter.search": "Search",
    "ac.filter.searchPlaceholder": "Search criterion, title, question, notes",
    "ac.filter.status": "Status",
    "ac.filter.role": "Role",
    "ac.filter.phase": "Phase",
    "ac.filter.axis": "Axis",
    "ac.filter.na": "Not applicable candidates",
    "ac.filter.naOnly": "Candidates only",
    "ac.filter.all": "All",
    "ac.filter.sort": "Sort",
    "ac.sort.default": "Default order",
    "ac.sort.issue": "Issues first",
    "ac.sort.recent": "Recently updated",
    "ac.filter.reset": "Reset filters",
    "ac.filter.empty": "No items match these filters. Try resetting them.",
    "ac.filter.visible": "{count} shown",

    "ac.item.level": "Level",
    "ac.item.how": "How to check",
    "ac.item.evidenceHint": "Evidence to record",
    "ac.item.status": "Status",
    "ac.item.note": "Note",
    "ac.item.notePlaceholder": "Record what you checked and what you found.",
    "ac.item.noteIssue": "Record the problem, the affected screens, and who will fix it.",
    "ac.item.noteNa": "Record why this does not apply.",
    "ac.item.url": "Evidence URL",
    "ac.item.urlPlaceholder": "https://",
    "ac.item.saved": "Saved",
    "ac.item.source": "Open the official criterion",
    "ac.item.naBadge": "Not applicable candidate",
    "ac.item.naHelp":
      "Based on the features you selected, this may not apply. Check the real screens before choosing a status.",

    "ac.axis.count": "{done} of {total} reviewed",
    "ac.axis.issue": "{count} issues",

    "ac.export.title": "Export",
    "ac.export.help":
      "Exports always contain the complete checklist, regardless of filters. Browser storage is not a backup, so download a copy regularly.",
    "ac.export.copyMd": "Copy Markdown",
    "ac.export.copied": "Copied the Markdown checklist.",
    "ac.export.downloadMd": "Download Markdown",
    "ac.export.downloadCsv": "Download CSV",
    "ac.export.reset": "New checklist",
    "ac.reset.confirm":
      "Your review status and notes will be deleted from this browser. Export first?",
    "ac.reset.go": "Delete and start over",

    "ac.confirm.standard":
      "Changing the standard resets the current review status and notes. Continue?",
    "ac.confirm.level":
      "Dropping to Level A deletes {count} AA items that already have a record. Continue?",

    "ac.interpret.title": "How to read these results",
    "ac.interpret.cert":
      "This checklist is an internal pre-review record. Korean web accessibility certification uses its own process, including page sampling, item-level conformance calculations, expert review, and user testing. Marking every item as passed is not certification and is not 100% conformance.",
  },
};

const A11Y_TOOLS = [
  { slug: "color-contrast-checker", key: "ac.nav.contrast" },
  { slug: "color-blindness-simulator", key: "ac.nav.cvd" },
  { slug: "html-accessibility-checker", key: "ac.nav.html" },
  { slug: "text-scaling-checker", key: "ac.nav.scale" },
  { slug: SLUG, key: "ac.nav.checklist" },
] as const;

type SortKey = "default" | "issue" | "recent";

type Draft = {
  name: string;
  standard: Standard;
  level: Exclude<Level, null>;
  environment: Environment;
  organization: Organization;
  features: Record<FeatureId, boolean>;
};

function emptyDraft(lang: "ko" | "en"): Draft {
  return {
    name: "",
    // KO 방문자는 국내 기준을, EN 방문자는 국제 기준을 먼저 만날 확률이 높다.
    standard: lang === "ko" ? "kwcag-2.2" : "wcag-2.2",
    level: "AA",
    environment: "responsive",
    organization: "general-private",
    features: { ...DEFAULT_FEATURES },
  };
}

function toggle<T>(set: Set<T>, value: T): Set<T> {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export default function AccessibilityChecklist() {
  const { lang } = useLang();
  const t = useT(DICT);

  /* 저장 데이터는 hydration 이후에만 읽는다: 서버 렌더 결과는 항상 설정 카드다. */
  const [project, setProject] = useState<ChecklistProject | null>(null);
  const [draft, setDraft] = useState<Draft>(() => emptyDraft(lang));
  const [setupOpen, setSetupOpen] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [restoredName, setRestoredName] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [live, setLive] = useState("");
  const [resetOpen, setResetOpen] = useState(false);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<Status>>(new Set());
  const [roleFilter, setRoleFilter] = useState<Set<Role>>(new Set());
  const [phaseFilter, setPhaseFilter] = useState<Set<Phase>>(new Set());
  const [axisFilter, setAxisFilter] = useState<Set<Axis>>(new Set());
  const [naOnly, setNaOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("default");
  const [openAxes, setOpenAxes] = useState<Set<Axis>>(new Set());

  const nameRef = useRef<HTMLInputElement>(null);
  const announce = useCallback((message: string) => {
    setLive("");
    // 같은 문구가 연속으로 나와도 보조기술이 다시 읽도록 한 tick 비운다.
    window.setTimeout(() => setLive(message), 30);
  }, []);

  useEffect(() => {
    const result = loadProject();
    if (result.kind === "ok") {
      setProject(result.project);
      setRestoredName(result.project.projectName);
      setDraft({
        name: result.project.projectName,
        standard: result.project.standard,
        level: result.project.targetLevel ?? "AA",
        environment: result.project.environment,
        organization: result.project.organization,
        features: { ...result.project.features },
      });
    } else if (result.kind === "unreadable") {
      // 손상된 데이터는 지우지 않는다: 새 체크리스트를 만들 때만 덮어쓴다.
      setLoadError(true);
      setSetupOpen(true);
    } else {
      setSetupOpen(true);
    }
  }, []);

  /* 500ms debounce 저장. 실패해도 화면 상태는 그대로 두고 배너만 띄운다. */
  useEffect(() => {
    if (!project) return;
    const id = window.setTimeout(() => setSaveError(!saveProject(project)), 500);
    return () => window.clearTimeout(id);
  }, [project]);

  const defs = useMemo(
    () => (project ? definitionsFor(project.standard, project.targetLevel) : []),
    [project],
  );
  const progress = useMemo(
    () => computeProgress(defs, project?.items ?? {}),
    [defs, project],
  );
  const groups = useMemo(
    () => summarizeByAxis(defs, project?.items ?? {}),
    [defs, project],
  );

  /* 기본으로 펼칠 축: 첫 번째 미완료 축. 프로젝트가 바뀔 때만 다시 계산한다. */
  const projectKey = project ? `${project.standard}:${project.targetLevel}:${project.createdAt}` : "";
  useEffect(() => {
    if (!projectKey) return;
    const first = firstOpenAxis(summarizeByAxis(defs, project?.items ?? {}));
    setOpenAxes(first ? new Set([first]) : new Set());
    // 항목 상태가 바뀔 때마다 아코디언이 다시 접히면 안 되므로 프로젝트 단위로만 리셋한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectKey]);

  const filterActive =
    query.trim() !== "" ||
    statusFilter.size > 0 ||
    roleFilter.size > 0 ||
    phaseFilter.size > 0 ||
    axisFilter.size > 0 ||
    naOnly;

  const visibleIds = useMemo(() => {
    if (!project) return new Set<string>();
    const q = query.trim().toLowerCase();
    const ids = new Set<string>();
    for (const def of defs) {
      const state = project.items[def.id];
      const status = state?.status ?? "not_started";
      if (statusFilter.size && !statusFilter.has(status)) continue;
      if (roleFilter.size && !def.roles.some((r) => roleFilter.has(r))) continue;
      if (phaseFilter.size && !def.phases.some((p) => phaseFilter.has(p))) continue;
      if (axisFilter.size && !axisFilter.has(def.axis)) continue;
      if (naOnly && !isNaCandidate(def, project.features)) continue;
      if (q) {
        const hay = [
          def.criterion,
          def.title[lang],
          def.question[lang],
          state?.note ?? "",
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) continue;
      }
      ids.add(def.id);
    }
    return ids;
  }, [project, defs, query, statusFilter, roleFilter, phaseFilter, axisFilter, naOnly, lang]);

  /* 필터가 걸리면 결과가 접힌 축 안에 숨지 않도록 매칭된 축을 모두 편다. */
  useEffect(() => {
    if (!filterActive) return;
    setOpenAxes(
      new Set(
        groups.filter((g) => g.defs.some((d) => visibleIds.has(d.id))).map((g) => g.axis),
      ),
    );
  }, [filterActive, visibleIds, groups]);

  function patchItem(id: string, patch: { status?: Status; note?: string; evidenceUrl?: string }) {
    setProject((prev) => {
      if (!prev) return prev;
      const now = new Date().toISOString();
      return {
        ...prev,
        updatedAt: now,
        items: {
          ...prev.items,
          [id]: { ...prev.items[id], ...patch, updatedAt: now },
        },
      };
    });
  }

  function submitSetup() {
    const name = draft.name.trim();
    if (!name) {
      setNameError(true);
      nameRef.current?.focus();
      return;
    }
    const level: Level = draft.standard === "kwcag-2.2" ? null : draft.level;

    // 설정 변경: 기준이 그대로면 상태를 보존하고, 바뀌면 확인 후 새로 만든다.
    if (project && project.standard === draft.standard) {
      let next: ChecklistProject = { ...project };
      if (project.targetLevel !== level) {
        const lost = itemsLostByLevelChange(project, level);
        if (lost.length > 0) {
          const message = t("ac.confirm.level").replace("{count}", String(lost.length));
          if (!window.confirm(message)) return;
        }
        next = changeTargetLevel(next, level);
      }
      setProject({
        ...next,
        projectName: name,
        environment: draft.environment,
        organization: draft.organization,
        features: { ...draft.features },
        updatedAt: new Date().toISOString(),
      });
      setSetupOpen(false);
      setNameError(false);
      return;
    }

    if (project && hasUserInput(project) && !window.confirm(t("ac.confirm.standard"))) return;

    setProject(
      createProject({
        projectName: name,
        standard: draft.standard,
        targetLevel: level,
        environment: draft.environment,
        organization: draft.organization,
        features: draft.features,
      }),
    );
    setSetupOpen(false);
    setNameError(false);
    setLoadError(false);
    setRestoredName(null);
  }

  const download = useCallback(
    (content: string, filename: string, mime: string) => {
      try {
        const blob = new Blob([content], { type: mime });
        const href = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = href;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.setTimeout(() => URL.revokeObjectURL(href), 1000);
      } catch {
        announce(t("ac.error.download"));
      }
    },
    [announce, t],
  );

  function downloadMarkdown() {
    if (!project) return;
    download(
      toMarkdown(project, lang),
      exportFilename(project, lang, "md"),
      "text/markdown;charset=utf-8",
    );
  }

  function downloadCsv() {
    if (!project) return;
    download(toCsv(project, lang), exportFilename(project, lang, "csv"), "text/csv;charset=utf-8");
  }

  async function copyMarkdown() {
    if (!project) return;
    try {
      await navigator.clipboard.writeText(toMarkdown(project, lang));
      announce(t("ac.export.copied"));
    } catch {
      announce(t("ac.error.copy"));
    }
  }

  function resetAll() {
    clearProject();
    setProject(null);
    setDraft(emptyDraft(lang));
    setResetOpen(false);
    setSetupOpen(true);
    setRestoredName(null);
    setSaveError(false);
    window.setTimeout(() => nameRef.current?.focus(), 0);
  }

  function resetFilters() {
    setQuery("");
    setStatusFilter(new Set());
    setRoleFilter(new Set());
    setPhaseFilter(new Set());
    setAxisFilter(new Set());
    setNaOnly(false);
    setSort("default");
  }

  const previewCount = itemCountFor(
    draft.standard,
    draft.standard === "kwcag-2.2" ? null : draft.level,
  );

  function sortDefs(list: typeof defs) {
    if (!project || sort === "default") return list;
    const copy = [...list];
    if (sort === "issue") {
      const rank: Record<Status, number> = {
        issue: 0,
        in_review: 1,
        not_started: 2,
        pass: 3,
        not_applicable: 4,
      };
      copy.sort(
        (a, b) =>
          rank[project.items[a.id]?.status ?? "not_started"] -
          rank[project.items[b.id]?.status ?? "not_started"],
      );
    } else {
      copy.sort((a, b) => {
        const ta = project.items[a.id]?.updatedAt ?? "";
        const tb = project.items[b.id]?.updatedAt ?? "";
        return tb.localeCompare(ta);
      });
    }
    return copy;
  }

  const standardText =
    project && project.standard === "wcag-2.2" && project.targetLevel
      ? `${STANDARD_LABEL[lang]["wcag-2.2"]} Level ${project.targetLevel}`
      : project
        ? STANDARD_LABEL[lang][project.standard]
        : "";

  return (
    <>
      <PageHead slug={SLUG} />

      <nav className="ac-toolnav" aria-label={t("ac.nav.label")}>
        <ul>
          {A11Y_TOOLS.map((tool) => (
            <li key={tool.slug}>
              <Link
                href={localizedHref(lang, "/" + tool.slug)}
                aria-current={tool.slug === SLUG ? "page" : undefined}
                className={tool.slug === SLUG ? "is-current" : undefined}
              >
                {t(tool.key)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <p className="ac-privacy">{t("ac.privacy")}</p>

      <div className="ac-alerts" role="status" aria-live="polite">
        {live && <p className="ac-live">{live}</p>}
        {loadError && <p className="ac-alert is-error">{t("ac.error.unreadable")}</p>}
        {saveError && <p className="ac-alert is-error">{t("ac.error.save")}</p>}
        {restoredName && !setupOpen && (
          <p className="ac-alert">
            {t("ac.restore.banner").replace("{name}", restoredName)}{" "}
            <button type="button" onClick={() => setRestoredName(null)}>
              {t("ac.restore.dismiss")}
            </button>
          </p>
        )}
      </div>

      {setupOpen && (
        <section className="ac-setup" aria-labelledby="ac-setup-title">
          <h2 id="ac-setup-title">{project ? t("ac.setup.editTitle") : t("ac.setup.title")}</h2>

          <div className="ac-field">
            <label htmlFor="ac-name">{t("ac.setup.name")}</label>
            <input
              id="ac-name"
              ref={nameRef}
              type="text"
              value={draft.name}
              maxLength={LIMITS.projectName}
              placeholder={t("ac.setup.namePlaceholder")}
              aria-invalid={nameError || undefined}
              aria-describedby={nameError ? "ac-name-error" : undefined}
              onChange={(e) => {
                setDraft({ ...draft, name: e.target.value });
                if (nameError) setNameError(false);
              }}
            />
            {nameError && (
              <p className="ac-field-error" id="ac-name-error">
                {t("ac.setup.nameError")}
              </p>
            )}
          </div>

          <fieldset className="ac-fieldset">
            <legend>{t("ac.setup.standard")}</legend>
            <div className="ac-radios">
              {(["kwcag-2.2", "wcag-2.2"] as Standard[]).map((s) => (
                <label key={s} className={draft.standard === s ? "is-on" : undefined}>
                  <input
                    type="radio"
                    name="ac-standard"
                    checked={draft.standard === s}
                    onChange={() => setDraft({ ...draft, standard: s })}
                  />
                  <span>{STANDARD_LABEL[lang][s]}</span>
                </label>
              ))}
            </div>
            <p className="ac-hint">{STANDARD_NOTE[lang][draft.standard]}</p>
          </fieldset>

          {draft.standard === "wcag-2.2" && (
            <fieldset className="ac-fieldset">
              <legend>{t("ac.setup.level")}</legend>
              <div className="ac-radios">
                {(["A", "AA"] as const).map((l) => (
                  <label key={l} className={draft.level === l ? "is-on" : undefined}>
                    <input
                      type="radio"
                      name="ac-level"
                      checked={draft.level === l}
                      onChange={() => setDraft({ ...draft, level: l })}
                    />
                    <span>{l}</span>
                  </label>
                ))}
              </div>
              <p className="ac-hint">{t("ac.setup.levelNote")}</p>
            </fieldset>
          )}

          <fieldset className="ac-fieldset">
            <legend>{t("ac.setup.environment")}</legend>
            <div className="ac-radios">
              {(["responsive", "desktop-first", "mobile-first"] as Environment[]).map((e) => (
                <label key={e} className={draft.environment === e ? "is-on" : undefined}>
                  <input
                    type="radio"
                    name="ac-env"
                    checked={draft.environment === e}
                    onChange={() => setDraft({ ...draft, environment: e })}
                  />
                  <span>{ENVIRONMENT_LABEL[lang][e]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="ac-fieldset">
            <legend>{t("ac.setup.organization")}</legend>
            <div className="ac-radios">
              {(["general-private", "public-certification"] as Organization[]).map((o) => (
                <label key={o} className={draft.organization === o ? "is-on" : undefined}>
                  <input
                    type="radio"
                    name="ac-org"
                    checked={draft.organization === o}
                    onChange={() => setDraft({ ...draft, organization: o })}
                  />
                  <span>{ORGANIZATION_LABEL[lang][o]}</span>
                </label>
              ))}
            </div>
            {draft.organization === "public-certification" && (
              <p className="ac-hint">{t("ac.setup.publicNote")}</p>
            )}
          </fieldset>

          <fieldset className="ac-fieldset ac-features">
            <legend>{t("ac.setup.features")}</legend>
            <p className="ac-hint">{t("ac.setup.featuresHelp")}</p>
            <ul>
              {FEATURE_ORDER.map((id) => (
                <li key={id}>
                  <span className="ac-feature-q">
                    {FEATURE_QUESTION[lang][id]}
                    <em>{FEATURE_EFFECT[lang][id]}</em>
                  </span>
                  <span className="ac-seg" role="group" aria-label={FEATURE_QUESTION[lang][id]}>
                    {[true, false].map((value) => (
                      <button
                        key={String(value)}
                        type="button"
                        aria-pressed={draft.features[id] === value}
                        onClick={() =>
                          setDraft({ ...draft, features: { ...draft.features, [id]: value } })
                        }
                      >
                        {value ? t("ac.setup.featureYes") : t("ac.setup.featureNo")}
                      </button>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </fieldset>

          <div className="ac-setup-foot">
            <p className="ac-preview">
              {t("ac.setup.preview")} <b>{previewCount}</b>
              {t("ac.setup.unit")}
            </p>
            <div className="ac-setup-actions">
              {project && (
                <button type="button" className="ac-btn" onClick={() => setSetupOpen(false)}>
                  {t("ac.setup.cancel")}
                </button>
              )}
              <button type="button" className="ac-btn is-primary" onClick={submitSetup}>
                {t("ac.setup.submit")}
              </button>
            </div>
          </div>
        </section>
      )}

      {project && !setupOpen && (
        <>
          <section className="ac-summary" aria-labelledby="ac-summary-title">
            <div className="ac-summary-head">
              <h2 id="ac-summary-title">{project.projectName}</h2>
              <button type="button" className="ac-btn" onClick={() => setSetupOpen(true)}>
                {t("ac.summary.edit")}
              </button>
            </div>

            <dl className="ac-meta">
              <div>
                <dt>{t("ac.summary.standard")}</dt>
                <dd>
                  {standardText} · {progress.total}
                  {t("ac.setup.unit")}
                </dd>
              </div>
              <div>
                <dt>{t("ac.summary.environment")}</dt>
                <dd>{ENVIRONMENT_LABEL[lang][project.environment]}</dd>
              </div>
              <div>
                <dt>{t("ac.summary.organization")}</dt>
                <dd>{ORGANIZATION_LABEL[lang][project.organization]}</dd>
              </div>
              <div>
                <dt>{t("ac.summary.storage")}</dt>
                <dd>{t("ac.summary.storageValue")}</dd>
              </div>
            </dl>

            <div className="ac-progress">
              <div className="ac-progress-top">
                <span className="ac-progress-label">{t("ac.summary.progress")}</span>
                <b>
                  {progress.percent === null ? t("ac.summary.empty") : `${progress.percent}%`}
                </b>
              </div>
              <div
                className="ac-bar"
                role="progressbar"
                aria-valuenow={progress.percent ?? 0}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={t("ac.summary.progress")}
              >
                <span style={{ width: `${progress.percent ?? 0}%` }} />
              </div>
              <p className="ac-hint">{t("ac.summary.progressNote")}</p>
            </div>

            <ul className="ac-counts">
              {(["pass", "issue", "in_review", "not_applicable"] as Status[]).map((s) => (
                <li key={s} className={"ac-count is-" + s}>
                  <span>{STATUS_LABEL[lang][s]}</span>
                  <b>
                    {s === "pass"
                      ? progress.pass
                      : s === "issue"
                        ? progress.issue
                        : s === "in_review"
                          ? progress.inReview
                          : progress.notApplicable}
                  </b>
                </li>
              ))}
            </ul>
          </section>

          <section className="ac-toolbar" aria-label={t("ac.filter.search")}>
            <div className="ac-field ac-search">
              <label htmlFor="ac-q">{t("ac.filter.search")}</label>
              <input
                id="ac-q"
                type="search"
                value={query}
                placeholder={t("ac.filter.searchPlaceholder")}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <fieldset className="ac-chipset">
              <legend>{t("ac.filter.status")}</legend>
              {STATUS_ORDER.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="ac-chip"
                  aria-pressed={statusFilter.has(s)}
                  onClick={() => setStatusFilter(toggle(statusFilter, s))}
                >
                  {STATUS_LABEL[lang][s]}
                </button>
              ))}
            </fieldset>

            <fieldset className="ac-chipset">
              <legend>{t("ac.filter.role")}</legend>
              {ROLE_ORDER.map((r) => (
                <button
                  key={r}
                  type="button"
                  className="ac-chip"
                  aria-pressed={roleFilter.has(r)}
                  onClick={() => setRoleFilter(toggle(roleFilter, r))}
                >
                  {ROLE_LABEL[lang][r]}
                </button>
              ))}
            </fieldset>

            <fieldset className="ac-chipset">
              <legend>{t("ac.filter.phase")}</legend>
              {PHASE_ORDER.map((p) => (
                <button
                  key={p}
                  type="button"
                  className="ac-chip"
                  aria-pressed={phaseFilter.has(p)}
                  onClick={() => setPhaseFilter(toggle(phaseFilter, p))}
                >
                  {PHASE_LABEL[lang][p]}
                </button>
              ))}
            </fieldset>

            <fieldset className="ac-chipset">
              <legend>{t("ac.filter.axis")}</legend>
              {AXIS_ORDER.filter((a) => defs.some((d) => d.axis === a)).map((a) => (
                <button
                  key={a}
                  type="button"
                  className="ac-chip"
                  aria-pressed={axisFilter.has(a)}
                  onClick={() => setAxisFilter(toggle(axisFilter, a))}
                >
                  {AXIS_LABEL[lang][a]}
                </button>
              ))}
            </fieldset>

            <fieldset className="ac-chipset">
              <legend>{t("ac.filter.na")}</legend>
              <button
                type="button"
                className="ac-chip"
                aria-pressed={naOnly}
                onClick={() => setNaOnly(!naOnly)}
              >
                {t("ac.filter.naOnly")}
              </button>
            </fieldset>

            <div className="ac-field ac-sort">
              <label htmlFor="ac-sort">{t("ac.filter.sort")}</label>
              <select
                id="ac-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
              >
                <option value="default">{t("ac.sort.default")}</option>
                <option value="issue">{t("ac.sort.issue")}</option>
                <option value="recent">{t("ac.sort.recent")}</option>
              </select>
            </div>

            <div className="ac-toolbar-foot">
              <span>{t("ac.filter.visible").replace("{count}", String(visibleIds.size))}</span>
              {filterActive && (
                <button type="button" className="ac-btn" onClick={resetFilters}>
                  {t("ac.filter.reset")}
                </button>
              )}
            </div>
          </section>

          {visibleIds.size === 0 ? (
            <p className="ac-empty">
              {t("ac.filter.empty")}{" "}
              <button type="button" className="ac-btn" onClick={resetFilters}>
                {t("ac.filter.reset")}
              </button>
            </p>
          ) : (
            <div className="ac-groups">
              {groups.map((group) => {
                const list = sortDefs(group.defs.filter((d) => visibleIds.has(d.id)));
                if (list.length === 0) return null;
                const open = openAxes.has(group.axis);
                return (
                  <section className="ac-group" key={group.axis}>
                    <h3>
                      <button
                        type="button"
                        className="ac-group-head"
                        aria-expanded={open}
                        aria-controls={`ac-group-${group.axis}`}
                        onClick={() => setOpenAxes(toggle(openAxes, group.axis))}
                      >
                        <span className="ac-group-name">{AXIS_LABEL[lang][group.axis]}</span>
                        <span className="ac-group-meta">
                          {t("ac.axis.count")
                            .replace("{done}", String(group.done))
                            .replace("{total}", String(group.applicable))}
                          {group.issue > 0 && (
                            <em>{t("ac.axis.issue").replace("{count}", String(group.issue))}</em>
                          )}
                        </span>
                        <span className="ac-group-caret" aria-hidden="true" />
                      </button>
                    </h3>

                    {/* 열린 축의 상세만 렌더한다: 55개 textarea 를 항상 DOM 에 두지 않는다 */}
                    {open && (
                      <ul className="ac-items" id={`ac-group-${group.axis}`}>
                        {list.map((def) => {
                          const state = project.items[def.id];
                          const status = state?.status ?? "not_started";
                          const candidate = isNaCandidate(def, project.features);
                          const notePlaceholder =
                            status === "issue"
                              ? t("ac.item.noteIssue")
                              : status === "not_applicable"
                                ? t("ac.item.noteNa")
                                : t("ac.item.notePlaceholder");
                          return (
                            <li className={"ac-item is-" + status} key={def.id}>
                              <p className="ac-item-code">
                                <span>
                                  {def.standard === "wcag-2.2"
                                    ? `WCAG ${def.criterion}`
                                    : `KWCAG 2.2 · ${def.criterion}`}
                                </span>
                                {def.level && <em>{def.level}</em>}
                              </p>
                              <h4>{def.title[lang]}</h4>

                              <p className="ac-tags">
                                {def.roles.map((r) => (
                                  <span className="ac-tag" key={r}>
                                    {ROLE_LABEL[lang][r]}
                                  </span>
                                ))}
                                {def.phases.map((p) => (
                                  <span className="ac-tag is-phase" key={p}>
                                    {PHASE_LABEL[lang][p]}
                                  </span>
                                ))}
                                {candidate && (
                                  <span className="ac-tag is-na" title={t("ac.item.naHelp")}>
                                    {t("ac.item.naBadge")}
                                  </span>
                                )}
                              </p>

                              <p className="ac-item-q">{def.question[lang]}</p>
                              {candidate && <p className="ac-na-help">{t("ac.item.naHelp")}</p>}

                              <div className="ac-how">
                                <h5>{t("ac.item.how")}</h5>
                                <ul>
                                  {def.howToCheck[lang].map((step, i) => (
                                    <li key={i}>{step}</li>
                                  ))}
                                </ul>
                                <p className="ac-evidence-hint">
                                  <b>{t("ac.item.evidenceHint")}</b> {def.evidence[lang]}
                                </p>
                              </div>

                              <p className="ac-links">
                                {def.relatedTool && (
                                  <Link
                                    className="ac-tool-cta"
                                    href={localizedHref(lang, "/" + def.relatedTool)}
                                  >
                                    {TOOL_CTA[lang][def.relatedTool]}
                                  </Link>
                                )}
                                <a
                                  href={def.sourceUrl}
                                  target="_blank"
                                  rel="noopener noreferrer nofollow"
                                >
                                  {t("ac.item.source")}
                                </a>
                              </p>

                              <div
                                className="ac-status"
                                role="group"
                                aria-label={`${t("ac.item.status")}: ${def.title[lang]}`}
                              >
                                {STATUS_ORDER.map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    className={"ac-status-btn is-" + s}
                                    aria-pressed={status === s}
                                    title={STATUS_MEANING[lang][s]}
                                    onClick={() => patchItem(def.id, { status: s })}
                                  >
                                    {STATUS_LABEL[lang][s]}
                                  </button>
                                ))}
                              </div>

                              <div className="ac-field">
                                <label htmlFor={`note-${def.id}`}>{t("ac.item.note")}</label>
                                <textarea
                                  id={`note-${def.id}`}
                                  value={state?.note ?? ""}
                                  maxLength={LIMITS.note}
                                  placeholder={notePlaceholder}
                                  onChange={(e) => patchItem(def.id, { note: e.target.value })}
                                />
                              </div>

                              <div className="ac-field ac-url">
                                <label htmlFor={`url-${def.id}`}>{t("ac.item.url")}</label>
                                <input
                                  id={`url-${def.id}`}
                                  type="url"
                                  inputMode="url"
                                  value={state?.evidenceUrl ?? ""}
                                  maxLength={LIMITS.evidenceUrl}
                                  placeholder={t("ac.item.urlPlaceholder")}
                                  onChange={(e) =>
                                    patchItem(def.id, { evidenceUrl: e.target.value })
                                  }
                                />
                              </div>

                              {state?.updatedAt && (
                                <p className="ac-saved">{t("ac.item.saved")}</p>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </section>
                );
              })}
            </div>
          )}

          <section className="ac-export" aria-labelledby="ac-export-title">
            <h2 id="ac-export-title">{t("ac.export.title")}</h2>
            <p className="ac-hint">{t("ac.export.help")}</p>
            <div className="ac-export-actions">
              <button type="button" className="ac-btn is-primary" onClick={copyMarkdown}>
                {t("ac.export.copyMd")}
              </button>
              <button type="button" className="ac-btn" onClick={downloadMarkdown}>
                {t("ac.export.downloadMd")}
              </button>
              <button type="button" className="ac-btn" onClick={downloadCsv}>
                {t("ac.export.downloadCsv")}
              </button>
              <button
                type="button"
                className="ac-btn is-danger"
                onClick={() => setResetOpen(true)}
              >
                {t("ac.export.reset")}
              </button>
            </div>

            {resetOpen && (
              <div className="ac-reset" role="group" aria-label={t("ac.export.reset")}>
                <p>{t("ac.reset.confirm")}</p>
                <div className="ac-export-actions">
                  <button type="button" className="ac-btn" onClick={() => setResetOpen(false)}>
                    {t("ac.setup.cancel")}
                  </button>
                  <button type="button" className="ac-btn" onClick={downloadMarkdown}>
                    {t("ac.export.downloadMd")}
                  </button>
                  <button type="button" className="ac-btn is-danger" onClick={resetAll}>
                    {t("ac.reset.go")}
                  </button>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      <section className="ac-interpret" aria-labelledby="ac-interpret-title">
        <h2 id="ac-interpret-title">{t("ac.interpret.title")}</h2>
        <dl>
          {STATUS_ORDER.map((s) => (
            <div key={s}>
              <dt>{STATUS_LABEL[lang][s]}</dt>
              <dd>{STATUS_MEANING[lang][s]}</dd>
            </div>
          ))}
        </dl>
        <p className="ac-cert-note">{t("ac.interpret.cert")}</p>
      </section>

      <ToolGuide slug={SLUG} />
      <Faq slug={SLUG} />
      <RelatedTools slug={SLUG} />
    </>
  );
}
