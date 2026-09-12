"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PageHead from "./PageHead";
import ToolGuide from "./ToolGuide";
import Faq from "./Faq";
import RelatedTools from "./RelatedTools";
import { useLang, useT, type Dict } from "../lib/i18n";
import { buildReport } from "../lib/a11y/report";
import { RULE_COPY, interpolate } from "../lib/a11y/messages";
import { MANUAL_CHECKS, looksLikeDocument } from "../lib/a11y/catalog";
import { SAMPLE_SCOPE, sampleHtml } from "../lib/a11y/sample";
import {
  AnalysisError,
  LIMITS,
  type AnalysisErrorType,
  type AnalysisResult,
  type Finding,
  type FindingCategory,
  type FindingLevel,
  type Scope,
} from "../lib/a11y/types";

/* 컨트롤 마이크로카피만 로컬 dict.
   페이지 콘텐츠(제목·설명·가이드·FAQ)는 content.ts 레지스트리,
   규칙 카탈로그 문구는 lib/a11y/messages.ts (항목이 많아 분리). */
const CONTROLS: Record<"ko" | "en", Record<string, string>> = {
  ko: {
    "a11y.scope.legend": "검사 범위",
    "a11y.scope.fragment": "컴포넌트 조각",
    "a11y.scope.document": "전체 문서",
    "a11y.scope.suggest": "전체 문서로 검사할까요?",
    "a11y.scope.fragmentHint":
      "조각 안의 헤딩·이미지·폼·이름·ARIA 참조·포커스를 검사합니다. lang·title·main 처럼 페이지 전체에 필요한 규칙은 실행하지 않습니다.",
    "a11y.scope.documentHint":
      "조각 규칙에 페이지 언어, 제목, 주요 랜드마크와 우회 탐색 관련 규칙을 더해 검사합니다.",
    "a11y.input.label": "검사할 HTML",
    "a11y.input.placeholder": "<main>...</main> 형식의 HTML을 붙여넣으세요.",
    "a11y.input.note":
      "HTML만 지원합니다. JSX·Vue·Svelte 템플릿은 1차 출시 범위에 포함되지 않습니다.",
    "a11y.input.privacy": "입력한 코드는 서버로 전송되지 않고 브라우저에서 분석됩니다.",
    "a11y.action.run": "검사하기",
    "a11y.action.sample": "예시 HTML",
    "a11y.action.clear": "지우기",
    "a11y.action.copy": "Markdown 보고서 복사",
    "a11y.confirm.sample": "현재 입력과 결과를 예시 HTML로 바꿀까요?",

    "a11y.state.initial":
      "HTML을 붙여넣고 검사하면 구조·레이블·이미지·포커스 관련 결과가 여기에 표시됩니다.",
    "a11y.state.running": "HTML을 검사하고 있습니다.",
    "a11y.state.dirty": "입력 변경됨 · 다시 검사 필요",
    "a11y.state.summary":
      "자동 검사에서 {issue}개의 높은 가능성 문제와 {review}개의 검토 항목을 찾았습니다.",
    "a11y.state.clean":
      "자동 검사에서 발견된 문제는 없습니다. 키보드 조작, 포커스 표시, 시각적 순서와 동적 상태는 실제 화면에서 계속 확인하세요.",
    "a11y.state.copied": "검사 보고서를 복사했습니다.",
    "a11y.state.copyFailed": "보고서를 복사하지 못했습니다. 다시 시도해 주세요.",

    "a11y.error.empty": "검사할 HTML을 입력해 주세요.",
    "a11y.error.too-long":
      "HTML은 500,000자 이하로 입력해 주세요. 큰 문서는 컴포넌트 단위로 나눠 검사할 수 있습니다.",
    "a11y.error.too-many-elements":
      "요소가 20,000개를 넘습니다. 검사할 범위를 더 작게 나눠 주세요.",
    "a11y.error.failed": "HTML을 검사하지 못했습니다. 입력을 줄이거나 다시 시도해 주세요.",

    "a11y.level.issue": "오류 가능성 높음",
    "a11y.level.review": "검토 필요",
    "a11y.level.manual": "수동 검사",
    "a11y.count.issue": "오류 가능성 높음",
    "a11y.count.review": "검토 필요",
    "a11y.count.manual": "수동 검사",
    "a11y.count.elements": "검사 요소",

    "a11y.view.legend": "결과 보기",
    "a11y.view.findings": "문제 목록",
    "a11y.view.headings": "헤딩 트리",
    "a11y.view.landmarks": "랜드마크",
    "a11y.view.tabs": "예상 탭 순서",

    "a11y.filter.level": "심각도",
    "a11y.filter.category": "분류",
    "a11y.filter.all": "전체",
    "a11y.cat.structure": "구조",
    "a11y.cat.name": "이름·레이블",
    "a11y.cat.image": "이미지",
    "a11y.cat.focus": "키보드·포커스",
    "a11y.cat.document": "문서",

    "a11y.card.location": "위치",
    "a11y.card.path": "요소 경로",
    "a11y.card.wcag": "관련 WCAG",
    "a11y.card.reason": "이유",
    "a11y.card.fix": "수정 방향",
    "a11y.card.noLocation": "파서가 보완한 요소 · 원본 위치 없음",
    "a11y.card.empty": "이 필터에 해당하는 결과가 없습니다.",

    "a11y.tree.noName": "이름 없음",
    "a11y.tree.skipped": "레벨 건너뜀",
    "a11y.tree.aria": "role=heading",
    "a11y.tree.empty": "헤딩이 없습니다.",
    "a11y.land.empty": "랜드마크가 없습니다.",
    "a11y.land.implicit": "암시적 역할",
    "a11y.land.ambiguous": "중첩 문맥 불확실",
    "a11y.land.noName": "이름 신호 없음",
    "a11y.tabs.empty": "포커스 가능한 요소가 없습니다.",
    "a11y.tabs.note":
      "CSS·JavaScript 상태를 알 수 없으므로 예상 순서입니다. 실제 화면에서 Tab과 Shift+Tab으로 확인하세요.",

    "a11y.parse.title": "브라우저가 보완해 해석한 HTML 구문이 있습니다.",
    "a11y.parse.note":
      "HTML 파싱 참고 항목이며 접근성 문제와는 별개입니다. 이 도구는 HTML 문법 검증기를 대신하지 않습니다.",

    "a11y.range.title": "무엇을 자동으로 확인하고, 무엇을 직접 확인해야 하나요?",
    "a11y.range.auto": "정적 HTML에서 자동으로 확인하는 항목",
    "a11y.range.manual": "실제 화면에서 직접 확인해야 하는 항목",
    "a11y.range.auto.document": "페이지 언어와 제목, 중복 id",
    "a11y.range.auto.structure": "헤딩 단계와 랜드마크 구성",
    "a11y.range.auto.name": "폼 레이블, 버튼·링크의 이름 신호, ARIA 참조",
    "a11y.range.auto.image": "이미지 대체 텍스트와 이미지 링크",
    "a11y.range.auto.focus": "tabindex 와 예상 탭 순서",
  },
  en: {
    "a11y.scope.legend": "Scope",
    "a11y.scope.fragment": "HTML fragment",
    "a11y.scope.document": "Full document",
    "a11y.scope.suggest": "Check this as a full document?",
    "a11y.scope.fragmentHint":
      "Checks headings, images, forms, names, ARIA references and focusable elements inside the fragment. Page-level rules such as lang, title and main are not run.",
    "a11y.scope.documentHint":
      "Adds page language, title, primary landmarks and bypass-related rules to the fragment rules.",
    "a11y.input.label": "HTML to check",
    "a11y.input.placeholder": "Paste HTML such as <main>...</main>.",
    "a11y.input.note":
      "HTML only. JSX, Vue and Svelte templates are outside the scope of this release.",
    "a11y.input.privacy":
      "Your markup is analyzed in the browser and is never sent to a server.",
    "a11y.action.run": "Run check",
    "a11y.action.sample": "Sample HTML",
    "a11y.action.clear": "Clear",
    "a11y.action.copy": "Copy Markdown report",
    "a11y.confirm.sample": "Replace the current input and results with the sample HTML?",

    "a11y.state.initial":
      "Paste HTML and run the check to see results for structure, labels, images and focus here.",
    "a11y.state.running": "Checking the HTML.",
    "a11y.state.dirty": "Input changed · run the check again",
    "a11y.state.summary":
      "The automatic check found {issue} high-confidence issues and {review} items to review.",
    "a11y.state.clean":
      "The automatic check found no issues. Keep testing keyboard operation, focus visibility, visual order and dynamic states in the running interface.",
    "a11y.state.copied": "Report copied.",
    "a11y.state.copyFailed": "The report could not be copied. Please try again.",

    "a11y.error.empty": "Enter the HTML you want to check.",
    "a11y.error.too-long":
      "Enter 500,000 characters or fewer. A large document can be checked one component at a time.",
    "a11y.error.too-many-elements":
      "The input has more than 20,000 elements. Split it into smaller parts.",
    "a11y.error.failed": "The HTML could not be checked. Reduce the input or try again.",

    "a11y.level.issue": "High-confidence issue",
    "a11y.level.review": "Needs review",
    "a11y.level.manual": "Manual test",
    "a11y.count.issue": "High-confidence issues",
    "a11y.count.review": "Needs review",
    "a11y.count.manual": "Manual test",
    "a11y.count.elements": "Elements checked",

    "a11y.view.legend": "Result view",
    "a11y.view.findings": "Findings",
    "a11y.view.headings": "Heading tree",
    "a11y.view.landmarks": "Landmarks",
    "a11y.view.tabs": "Estimated tab order",

    "a11y.filter.level": "Level",
    "a11y.filter.category": "Category",
    "a11y.filter.all": "All",
    "a11y.cat.structure": "Structure",
    "a11y.cat.name": "Names and labels",
    "a11y.cat.image": "Images",
    "a11y.cat.focus": "Keyboard and focus",
    "a11y.cat.document": "Document",

    "a11y.card.location": "Location",
    "a11y.card.path": "Element path",
    "a11y.card.wcag": "Related WCAG",
    "a11y.card.reason": "Why it matters",
    "a11y.card.fix": "How to fix",
    "a11y.card.noLocation": "Inserted by the parser, no source location",
    "a11y.card.empty": "No results match this filter.",

    "a11y.tree.noName": "No name",
    "a11y.tree.skipped": "Level skipped",
    "a11y.tree.aria": "role=heading",
    "a11y.tree.empty": "No headings found.",
    "a11y.land.empty": "No landmarks found.",
    "a11y.land.implicit": "Implicit role",
    "a11y.land.ambiguous": "Nesting context unknown",
    "a11y.land.noName": "No name signal",
    "a11y.tabs.empty": "No focusable elements found.",
    "a11y.tabs.note":
      "This is an estimate, because CSS and JavaScript state are unknown. Confirm it with Tab and Shift+Tab in the running interface.",

    "a11y.parse.title": "Some markup was recovered by the HTML parser.",
    "a11y.parse.note":
      "These are parsing notes, separate from accessibility findings. This tool does not replace an HTML validator.",

    "a11y.range.title": "What is checked automatically, and what is not?",
    "a11y.range.auto": "Checked automatically from static HTML",
    "a11y.range.manual": "Requires testing in the running interface",
    "a11y.range.auto.document": "Page language, title and duplicate ids",
    "a11y.range.auto.structure": "Heading levels and landmark structure",
    "a11y.range.auto.name": "Form labels, button and link name signals, ARIA references",
    "a11y.range.auto.image": "Image alternatives and image-only links",
    "a11y.range.auto.focus": "tabindex values and estimated tab order",
  },
};

const DICT: Dict = {
  ko: { ...RULE_COPY.ko, ...CONTROLS.ko },
  en: { ...RULE_COPY.en, ...CONTROLS.en },
};

const SLUG = "html-accessibility-checker";

const VIEWS = ["findings", "headings", "landmarks", "tabs"] as const;
type View = (typeof VIEWS)[number];

const LEVELS: FindingLevel[] = ["issue", "review", "manual"];
const CATEGORIES: FindingCategory[] = ["structure", "name", "image", "focus", "document"];

/** 심각도는 색상뿐 아니라 글자와 형태로도 구분한다 */
const LEVEL_MARK: Record<FindingLevel, string> = { issue: "!", review: "?", manual: "•" };

function lineNumbers(count: number) {
  let out = "";
  for (let i = 1; i <= count; i++) out += i + "\n";
  return out;
}

export default function HtmlAccessibilityChecker() {
  const { lang } = useLang();
  const t = useT(DICT);

  const [text, setText] = useState("");
  const [scope, setScope] = useState<Scope>("fragment");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorType, setErrorType] = useState<AnalysisErrorType | null>(null);
  const [dirty, setDirty] = useState(false);
  const [running, setRunning] = useState(false);
  const [slow, setSlow] = useState(false);
  const [view, setView] = useState<View>("findings");
  const [levelFilter, setLevelFilter] = useState<FindingLevel | "all">("all");
  const [catFilter, setCatFilter] = useState<FindingCategory | "all">("all");
  const [copyState, setCopyState] = useState<"idle" | "done" | "failed">("idle");
  const [parseOpen, setParseOpen] = useState(false);

  const gutterRef = useRef<HTMLDivElement>(null);
  const runIdRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  // 언마운트·초기화 때 진행 중인 작업을 정리한다
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      runIdRef.current += 1;
      for (const timer of timers) clearTimeout(timer);
      timers.length = 0;
    };
  }, []);

  const gutter = useMemo(() => lineNumbers(text.split("\n").length || 1), [text]);
  const suggestDocument = scope === "fragment" && looksLikeDocument(text);

  const runCheck = useCallback((source: string, checkScope: Scope) => {
    // 빈 입력은 엔진을 부르지 않고 바로 안내한다
    if (source.trim() === "") {
      setErrorType("empty");
      return;
    }

    const runId = ++runIdRef.current;
    setCopyState("idle");
    setRunning(true);

    // 150ms 를 넘길 때만 처리 중 상태를 보여준다 (짧은 입력에서 깜빡이지 않게)
    const slowTimer = setTimeout(() => {
      if (runIdRef.current === runId) setSlow(true);
    }, 150);
    timersRef.current.push(slowTimer);

    // 파서(parse5)를 포함한 검사 엔진은 이 시점에 처음 내려받는다.
    // 페이지의 SEO 본문만 읽고 가는 방문자가 파서 번들을 받지 않게 한다.
    void (async () => {
      try {
        const { analyzeHtml } = await import("../lib/a11y/analyze");
        if (runIdRef.current !== runId) return; // 새 검사가 시작되면 이전 결과는 버린다
        const next = analyzeHtml(source, checkScope);
        setResult(next);
        setErrorType(null);
        setDirty(false);
        setView("findings");
        setLevelFilter("all");
        setCatFilter("all");
      } catch (err) {
        if (runIdRef.current !== runId) return;
        // 검사에 실패해도 이전 정상 결과는 남겨 둔다
        setErrorType(err instanceof AnalysisError ? err.type : "failed");
      } finally {
        if (runIdRef.current === runId) {
          clearTimeout(slowTimer);
          setRunning(false);
          setSlow(false);
        }
      }
    })();
  }, []);

  function handleRun() {
    runCheck(text, scope);
  }

  function handleSample() {
    if (text.trim() && !window.confirm(t("a11y.confirm.sample"))) return;
    const sample = sampleHtml(lang);
    setText(sample);
    setScope(SAMPLE_SCOPE);
    runCheck(sample, SAMPLE_SCOPE);
  }

  function handleClear() {
    runIdRef.current += 1;
    setText("");
    setScope("fragment");
    setResult(null);
    setErrorType(null);
    setDirty(false);
    setView("findings");
    setLevelFilter("all");
    setCatFilter("all");
    setCopyState("idle");
    setParseOpen(false);
  }

  async function handleCopy() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(buildReport(result, lang, t));
      setCopyState("done");
    } catch {
      setCopyState("failed");
    }
  }

  const visibleFindings = useMemo(() => {
    if (!result) return [];
    return result.findings.filter(
      (f) =>
        (levelFilter === "all" || f.level === levelFilter) &&
        (catFilter === "all" || f.category === catFilter),
    );
  }, [result, levelFilter, catFilter]);

  const statusMessage = (() => {
    if (running && slow) return t("a11y.state.running");
    if (errorType) return t(`a11y.error.${errorType}`);
    if (copyState === "done") return t("a11y.state.copied");
    if (copyState === "failed") return t("a11y.state.copyFailed");
    if (!result) return t("a11y.state.initial");
    if (result.counts.issue === 0 && result.counts.review === 0) return t("a11y.state.clean");
    return interpolate(t("a11y.state.summary"), {
      issue: String(result.counts.issue),
      review: String(result.counts.review),
    });
  })();

  return (
    <>
      <PageHead slug={SLUG} />

      <div className="a11y">
        <div className="ide-bar">
          <div className="ide-title">
            <span className="dot" />
            <span className="name">HTML Accessibility Checker</span>
            <span className="path">/{SLUG}</span>
          </div>
          <span className="spacer" />

          <div className="a11y-scope" role="group" aria-label={t("a11y.scope.legend")}>
            {(["fragment", "document"] as const).map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={scope === value}
                onClick={() => setScope(value)}
              >
                {t(`a11y.scope.${value}`)}
              </button>
            ))}
          </div>

          <button className="btn-ide primary" type="button" onClick={handleRun} disabled={running}>
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M7 2.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9ZM10.5 10.5 14 14" />
            </svg>
            <span>{t("a11y.action.run")}</span>
          </button>
        </div>

        <div className="panes">
          <div className="pane pane-in">
            <div className="pane-head">
              <span className="pane-tab">
                <span className="tab-dot" />
                input.html
              </span>
              <span className="spacer" />
              <button className="pane-act" type="button" onClick={handleSample}>
                {t("a11y.action.sample")}
              </button>
              <button
                className="pane-act"
                type="button"
                onClick={handleClear}
                disabled={!text && !result}
              >
                {t("a11y.action.clear")}
              </button>
            </div>

            {suggestDocument && (
              <div className="a11y-suggest">
                <button type="button" onClick={() => setScope("document")}>
                  {t("a11y.scope.suggest")}
                </button>
              </div>
            )}

            <div className="pane-body">
              <div className="in-gutter" ref={gutterRef}>
                {gutter}
              </div>
              <textarea
                className="code-in"
                spellCheck={false}
                aria-label={t("a11y.input.label")}
                aria-describedby="a11y-input-note"
                placeholder={t("a11y.input.placeholder")}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  setErrorType(null);
                  setCopyState("idle");
                  if (result) setDirty(true);
                }}
                onScroll={(e) => {
                  if (gutterRef.current) {
                    gutterRef.current.style.transform = `translateY(${-(e.target as HTMLTextAreaElement).scrollTop}px)`;
                  }
                }}
              />
            </div>

            <p className="a11y-input-note" id="a11y-input-note">
              {t("a11y.input.note")} {t("a11y.input.privacy")}
            </p>
          </div>

          <div className="pane pane-out a11y-out">
            <div className="pane-head">
              <span className="pane-tab">
                <span className="tab-dot" style={{ background: "var(--color-blue-primary-500)" }} />
                results
              </span>
              <span className="spacer" />
              <span className="pane-meta">{t(`a11y.scope.${result?.scope ?? scope}`)}</span>
              <button className="pane-act" type="button" onClick={handleCopy} disabled={!result}>
                {t("a11y.action.copy")}
              </button>
            </div>

            <div className="pane-body a11y-panel">
              {dirty && result && <p className="a11y-dirty">{t("a11y.state.dirty")}</p>}

              <div className="a11y-summary">
                {(["issue", "review", "manual"] as const).map((level) => (
                  <div className={"a11y-stat lv-" + level} key={level}>
                    <span className="a11y-stat-n">{result?.counts[level] ?? 0}</span>
                    <span className="a11y-stat-l">{t(`a11y.count.${level}`)}</span>
                  </div>
                ))}
                <div className="a11y-stat">
                  <span className="a11y-stat-n">{result?.counts.elements ?? 0}</span>
                  <span className="a11y-stat-l">{t("a11y.count.elements")}</span>
                </div>
              </div>

              <div className="a11y-views" role="group" aria-label={t("a11y.view.legend")}>
                {VIEWS.map((key) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={view === key}
                    onClick={() => setView(key)}
                    disabled={!result}
                  >
                    {t(`a11y.view.${key}`)}
                  </button>
                ))}
              </div>

              {view === "findings" && result && (
                <>
                  <div className="a11y-filters">
                    <div role="group" aria-label={t("a11y.filter.level")}>
                      <span className="a11y-filter-l">{t("a11y.filter.level")}</span>
                      <button
                        type="button"
                        aria-pressed={levelFilter === "all"}
                        onClick={() => setLevelFilter("all")}
                      >
                        {t("a11y.filter.all")}
                      </button>
                      {LEVELS.map((level) => (
                        <button
                          key={level}
                          type="button"
                          aria-pressed={levelFilter === level}
                          onClick={() => setLevelFilter(level)}
                        >
                          {t(`a11y.count.${level}`)} {result.counts[level]}
                        </button>
                      ))}
                    </div>
                    <div role="group" aria-label={t("a11y.filter.category")}>
                      <span className="a11y-filter-l">{t("a11y.filter.category")}</span>
                      <button
                        type="button"
                        aria-pressed={catFilter === "all"}
                        onClick={() => setCatFilter("all")}
                      >
                        {t("a11y.filter.all")}
                      </button>
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          aria-pressed={catFilter === cat}
                          onClick={() => setCatFilter(cat)}
                        >
                          {t(`a11y.cat.${cat}`)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {visibleFindings.length === 0 ? (
                    <p className="a11y-empty">{t("a11y.card.empty")}</p>
                  ) : (
                    <ol className="a11y-findings">
                      {visibleFindings.map((f, i) => (
                        <FindingCard finding={f} t={t} key={`${f.ruleId}-${f.line ?? 0}-${i}`} />
                      ))}
                    </ol>
                  )}
                </>
              )}

              {view === "headings" && result && (
                <div className="a11y-list">
                  {result.headings.length === 0 ? (
                    <p className="a11y-empty">{t("a11y.tree.empty")}</p>
                  ) : (
                    <ol className="a11y-tree">
                      {result.headings.map((h, i) => (
                        <li
                          key={i}
                          style={{ paddingLeft: `${Math.max(0, (h.level || 1) - 1) * 16}px` }}
                        >
                          <span className="a11y-tree-lv">h{h.level || "?"}</span>
                          <span className="a11y-tree-name">
                            {h.name || <em>{t("a11y.tree.noName")}</em>}
                          </span>
                          {h.aria && <span className="a11y-tag">{t("a11y.tree.aria")}</span>}
                          {h.skipped && (
                            <span className="a11y-tag is-warn">{t("a11y.tree.skipped")}</span>
                          )}
                          <span className="a11y-tree-path">{h.path}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}

              {view === "landmarks" && result && (
                <div className="a11y-list">
                  {result.landmarks.length === 0 ? (
                    <p className="a11y-empty">{t("a11y.land.empty")}</p>
                  ) : (
                    <ol className="a11y-rows">
                      {result.landmarks.map((l, i) => (
                        <li key={i}>
                          <span className="a11y-role">{l.role}</span>
                          <span className="a11y-row-name">
                            {l.name || <em>{t("a11y.land.noName")}</em>}
                          </span>
                          {l.implicit && <span className="a11y-tag">{t("a11y.land.implicit")}</span>}
                          {l.ambiguous && (
                            <span className="a11y-tag is-warn">{t("a11y.land.ambiguous")}</span>
                          )}
                          <span className="a11y-row-path">
                            {l.path}
                            {l.line !== undefined && ` · ${l.line}:${l.column}`}
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}

              {view === "tabs" && result && (
                <div className="a11y-list">
                  {result.tabOrder.length === 0 ? (
                    <p className="a11y-empty">{t("a11y.tabs.empty")}</p>
                  ) : (
                    <>
                      <ol className="a11y-rows">
                        {result.tabOrder.map((row) => (
                          <li key={row.order}>
                            <span className="a11y-order">{row.order}</span>
                            <span className="a11y-role">{row.kind}</span>
                            <span className="a11y-row-name">
                              {row.name || <em>{t("a11y.land.noName")}</em>}
                            </span>
                            {row.tabindex !== null && (
                              <span className={"a11y-tag" + (row.tabindex > 0 ? " is-warn" : "")}>
                                tabindex={row.tabindex}
                              </span>
                            )}
                            <span className="a11y-row-path">
                              {row.path}
                              {row.line !== undefined && ` · ${row.line}:${row.column}`}
                            </span>
                          </li>
                        ))}
                      </ol>
                      <p className="a11y-note">{t("a11y.tabs.note")}</p>
                    </>
                  )}
                </div>
              )}

              {result && result.parseNotes.length > 0 && (
                <div className="a11y-parse">
                  <button
                    type="button"
                    aria-expanded={parseOpen}
                    onClick={() => setParseOpen((v) => !v)}
                  >
                    {t("a11y.parse.title")} ({result.parseNotes.length})
                  </button>
                  {parseOpen && (
                    <>
                      <ul>
                        {result.parseNotes.map((n, i) => (
                          <li key={i}>
                            <code>{n.code}</code> {n.line}:{n.column}
                          </li>
                        ))}
                      </ul>
                      <p className="a11y-note">{t("a11y.parse.note")}</p>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="ide-status">
          <span className={"status-pill " + statusPill(running, errorType, result)}>
            <span>{t(`a11y.scope.${result?.scope ?? scope}`)}</span>
          </span>
          <span className="a11y-live" role="status" aria-live="polite">
            {statusMessage}
          </span>
          <span className="spacer" />
          <span>
            {text.length.toLocaleString()} / {LIMITS.maxChars.toLocaleString()}
          </span>
        </div>
      </div>

      <p className="a11y-scope-hint">
        {t(scope === "document" ? "a11y.scope.documentHint" : "a11y.scope.fragmentHint")}
      </p>

      <section className="a11y-range" aria-labelledby="a11y-range-title">
        <h2 id="a11y-range-title">{t("a11y.range.title")}</h2>
        <div className="a11y-range-grid">
          <div>
            <h3>{t("a11y.range.auto")}</h3>
            <ul>
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <b>{t(`a11y.cat.${cat}`)}</b> {t(`a11y.range.auto.${cat}`)}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>{t("a11y.range.manual")}</h3>
            <ul>
              {MANUAL_CHECKS.map((m) => (
                <li key={m.id}>{t(`a11y.rule.${m.id}.title`)}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ToolGuide slug={SLUG} />
      <Faq slug={SLUG} />
      <RelatedTools slug={SLUG} />
    </>
  );
}

function statusPill(
  running: boolean,
  errorType: AnalysisErrorType | null,
  result: AnalysisResult | null,
) {
  if (errorType) return "err";
  if (running || !result) return "idle";
  return "ok";
}

function FindingCard({ finding, t }: { finding: Finding; t: (key: string) => string }) {
  const { ruleId, level, wcag, vars } = finding;
  return (
    <li className={"a11y-card lv-" + level}>
      <div className="a11y-card-head">
        <span className={"a11y-level lv-" + level} aria-hidden="true">
          {LEVEL_MARK[level]}
        </span>
        <span className="a11y-level-text">{t(`a11y.level.${level}`)}</span>
        <h3>{t(finding.titleKey)}</h3>
        <span className="a11y-rule-id">{ruleId}</span>
      </div>

      {level !== "manual" && (
        <dl className="a11y-card-meta">
          <div>
            <dt>{t("a11y.card.location")}</dt>
            <dd>
              {finding.line === undefined
                ? t("a11y.card.noLocation")
                : `${finding.line}:${finding.column ?? 1}`}
            </dd>
          </div>
          {finding.elementPath && (
            <div>
              <dt>{t("a11y.card.path")}</dt>
              <dd>
                <code>{finding.elementPath}</code>
              </dd>
            </div>
          )}
          {wcag.length > 0 && (
            <div>
              <dt>{t("a11y.card.wcag")}</dt>
              <dd>{wcag.join(", ")}</dd>
            </div>
          )}
        </dl>
      )}

      {/* 사용자 HTML 은 반드시 텍스트로만 렌더한다 (innerHTML 금지) */}
      {finding.snippet && (
        <pre className="a11y-snippet">
          <code>{finding.snippet}</code>
        </pre>
      )}

      <p className="a11y-card-body">
        <b>{t("a11y.card.reason")}</b> {interpolate(t(finding.reasonKey), vars)}
      </p>
      <p className="a11y-card-body">
        <b>{t("a11y.card.fix")}</b> {interpolate(t(finding.fixKey), vars)}
      </p>
    </li>
  );
}
