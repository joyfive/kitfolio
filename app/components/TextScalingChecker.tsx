"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PageHead from "./PageHead";
import ToolGuide from "./ToolGuide";
import Faq from "./Faq";
import RelatedTools from "./RelatedTools";
import { useLang, useT, type Dict } from "../lib/i18n";
import { NODE_ID_ATTR } from "../lib/textscale/nodeId";
import { buildSrcdoc, cssRequestsExternal } from "../lib/textscale/srcdoc";
import { applyPreset, viewportsFor } from "../lib/textscale/presets";
import { afterLayout, snapshotDocument } from "../lib/textscale/measure";
import { DOCUMENT_NODE, detectCandidates, summarize } from "../lib/textscale/detect";
import { MANUAL_CHECKS, RULE_COPY } from "../lib/textscale/messages";
import { sampleCss, sampleHtml } from "../lib/textscale/sample";
import {
  DEFAULT_PRESET,
  DEFAULT_VIEWPORT,
  LIMITS,
  PRESET_CRITERION,
  VIEWPORTS,
  type Candidate,
  type InputKind,
  type Preset,
  type PreviewErrorType,
  type Viewport,
} from "../lib/textscale/types";

/* 컨트롤 마이크로카피만 로컬 dict.
   페이지 콘텐츠(제목·설명·가이드·FAQ)는 content.ts 레지스트리,
   감지 규칙 문구와 직접 확인 목록은 lib/textscale/messages.ts. */
const CONTROLS: Record<"ko" | "en", Record<string, string>> = {
  ko: {
    "ts.tab.html": "HTML·텍스트",
    "ts.tab.css": "CSS",
    "ts.input.html.label": "검사할 HTML 또는 텍스트",
    "ts.input.html.placeholder": "<section>...</section> 또는 일반 텍스트를 붙여넣으세요.",
    "ts.input.css.label": "적용할 CSS · 선택",
    "ts.input.css.placeholder": ".card { max-width: 40rem; }",
    "ts.action.apply": "미리보기 적용",
    "ts.action.sample": "예시 불러오기",
    "ts.action.reset": "초기화",
    "ts.confirm.sample": "현재 입력과 결과를 예시로 바꿀까요?",

    "ts.preset.legend": "검사 프리셋",
    "ts.preset.text-200": "텍스트 200%",
    "ts.preset.reflow-320": "리플로 320px",
    "ts.preset.text-spacing": "텍스트 간격",
    "ts.preset.text-200.desc":
      "선택한 viewport 에서 계산된 글자 크기만 2배로 만듭니다. width·height·padding 은 바꾸지 않습니다.",
    "ts.preset.reflow-320.desc":
      "원본 1280 CSS px, 검사 320 CSS px 로 내부 viewport 자체를 바꿔 반응형 CSS 가 실제로 동작하게 합니다.",
    "ts.preset.text-spacing.desc":
      "줄 높이 1.5배, 문단 뒤 2배, 글자 0.12배, 단어 0.16배를 강제합니다. 기존 값이 더 크면 줄이지 않습니다.",

    "ts.viewport.legend": "비교 viewport",
    "ts.viewport.locked": "원본 1280px → 검사 320px",
    "ts.viewport.reflowNote": "1280px 기준 400% 확대와 동등한 320 CSS px 입니다.",

    "ts.preview.origin": "원본",
    "ts.preview.test": "검사 결과",
    "ts.preview.inner": "내부 viewport",
    "ts.preview.fit": "화면 맞춤",
    "ts.preview.empty": "미리보기 없음",

    "ts.state.initial":
      "HTML이나 텍스트를 입력하면 원본과 확대·간격 적용 결과가 여기에 표시됩니다.",
    "ts.state.rendering": "안전한 미리보기를 만들고 있습니다.",
    "ts.state.measuring": "확대와 오버플로를 확인하고 있습니다.",
    "ts.state.dirty": "입력 변경됨 · 다시 적용 필요",
    "ts.state.clean":
      "자동 측정에서 오버플로·잘림 후보를 찾지 못했습니다. 겹침과 기능 손실은 직접 확인하세요.",
    "ts.state.found": "감지된 문제 후보 {count}개",
    "ts.state.always":
      "겹침, 기능 손실과 실제 브라우저 확대는 직접 확인하세요.",

    "ts.error.empty": "검사할 HTML 또는 텍스트를 입력해 주세요.",
    "ts.error.html-too-long": "HTML 또는 텍스트는 200,000자 이하로 입력해 주세요.",
    "ts.error.css-too-long": "CSS는 100,000자 이하로 입력해 주세요.",
    "ts.error.too-many-elements":
      "요소가 10,000개를 넘습니다. 컴포넌트 단위로 나눠 검사해 주세요.",
    "ts.error.parse-failed": "HTML을 해석하지 못했습니다. 마크업을 확인하고 다시 시도해 주세요.",
    "ts.error.render-failed": "미리보기를 만들지 못했습니다. 입력을 줄이거나 다시 시도해 주세요.",
    "ts.error.unsupported":
      "이 브라우저에서는 안전한 미리보기를 만들 수 없습니다. 최신 브라우저에서 다시 시도해 주세요.",

    "ts.notice.styleTag":
      "HTML 안의 style 태그는 적용하지 않습니다. CSS 입력 영역에 옮겨 주세요.",
    "ts.notice.external":
      "외부 이미지·웹폰트·stylesheet는 안전을 위해 불러오지 않습니다.",
    "ts.notice.textInput":
      "일반 텍스트로 인식해 빈 줄 기준으로 문단을 나눠 렌더링했습니다.",
    "ts.notice.resourceLimit": "외부 리소스 제한: 웹폰트·이미지 미적용",

    "ts.summary.preset": "현재 프리셋",
    "ts.summary.viewport": "내부 viewport",
    "ts.summary.candidates": "감지 후보",
    "ts.summary.pageOverflow": "페이지 가로 오버플로",
    "ts.summary.detected": "감지됨",
    "ts.summary.none": "없음",
    "ts.summary.unit": "개 요소",

    "ts.result.title": "감지된 문제 후보",
    "ts.result.manual": "직접 확인",
    "ts.result.preexisting": "원본에도 있던 문제",
    "ts.result.introduced": "이 프리셋에서 새로 생김",
    "ts.result.size": "원본 → 검사",
    "ts.result.why": "후보가 된 이유",
    "ts.result.fix": "수정 검토 방향",
    "ts.result.locate": "미리보기에서 위치 보기",
    "ts.result.document": "문서 전체",

    "ts.criteria.title": "각 프리셋이 검사하는 기준",
    "ts.criteria.applies": "적용",
  },
  en: {
    "ts.tab.html": "HTML or text",
    "ts.tab.css": "CSS",
    "ts.input.html.label": "HTML or text to check",
    "ts.input.html.placeholder": "Paste <section>...</section> or plain text.",
    "ts.input.css.label": "CSS to apply · optional",
    "ts.input.css.placeholder": ".card { max-width: 40rem; }",
    "ts.action.apply": "Build preview",
    "ts.action.sample": "Load sample",
    "ts.action.reset": "Reset",
    "ts.confirm.sample": "Replace the current input and results with the sample?",

    "ts.preset.legend": "Test preset",
    "ts.preset.text-200": "200% text",
    "ts.preset.reflow-320": "320px reflow",
    "ts.preset.text-spacing": "Text spacing",
    "ts.preset.text-200.desc":
      "Doubles each element's computed font size at the selected viewport, leaving width, height and padding unchanged.",
    "ts.preset.reflow-320.desc":
      "Uses a real 1280 CSS px layout viewport for the original and 320 CSS px for the test so responsive CSS actually reacts.",
    "ts.preset.text-spacing.desc":
      "Forces line height 1.5, space after paragraphs 2, letter spacing 0.12 and word spacing 0.16 times the font size, never reducing a larger existing value.",

    "ts.viewport.legend": "Comparison viewport",
    "ts.viewport.locked": "Original 1280px → test 320px",
    "ts.viewport.reflowNote":
      "320 CSS px is equivalent to zooming a 1280 CSS px viewport to 400%.",

    "ts.preview.origin": "Original",
    "ts.preview.test": "Test result",
    "ts.preview.inner": "Inner viewport",
    "ts.preview.fit": "Fit to screen",
    "ts.preview.empty": "No preview yet",

    "ts.state.initial":
      "Enter HTML or text to see the original and the resized or respaced result here.",
    "ts.state.rendering": "Building a sandboxed preview.",
    "ts.state.measuring": "Checking resizing and overflow.",
    "ts.state.dirty": "Input changed · build the preview again",
    "ts.state.clean":
      "No overflow or clipping candidates were detected. Check overlap and loss of functionality yourself.",
    "ts.state.found": "{count} candidates detected",
    "ts.state.always":
      "Overlap, loss of functionality and real browser zoom still need a human check.",

    "ts.error.empty": "Enter the HTML or text you want to check.",
    "ts.error.html-too-long": "Enter 200,000 characters or fewer of HTML or text.",
    "ts.error.css-too-long": "Enter 100,000 characters or fewer of CSS.",
    "ts.error.too-many-elements":
      "The input has more than 10,000 elements. Check one component at a time.",
    "ts.error.parse-failed": "The HTML could not be parsed. Check the markup and try again.",
    "ts.error.render-failed": "The preview could not be built. Reduce the input or try again.",
    "ts.error.unsupported":
      "This browser cannot build a sandboxed preview. Try again in a current browser.",

    "ts.notice.styleTag":
      "A style tag inside the HTML is not applied. Move it to the CSS field.",
    "ts.notice.external":
      "External images, web fonts and stylesheets are not loaded, by design.",
    "ts.notice.textInput":
      "Treated as plain text and rendered as paragraphs split on blank lines.",
    "ts.notice.resourceLimit": "External resources: web fonts and images not applied",

    "ts.summary.preset": "Preset",
    "ts.summary.viewport": "Inner viewport",
    "ts.summary.candidates": "Candidates",
    "ts.summary.pageOverflow": "Page horizontal overflow",
    "ts.summary.detected": "Detected",
    "ts.summary.none": "None",
    "ts.summary.unit": " elements",

    "ts.result.title": "Detected candidates",
    "ts.result.manual": "Check these yourself",
    "ts.result.preexisting": "Already present in the original",
    "ts.result.introduced": "Introduced by this preset",
    "ts.result.size": "Original → test",
    "ts.result.why": "Why it was flagged",
    "ts.result.fix": "What to review",
    "ts.result.locate": "Show in preview",
    "ts.result.document": "Whole document",

    "ts.criteria.title": "What each preset tests",
    "ts.criteria.applies": "Applies",
  },
};

const DICT: Dict = {
  ko: { ...RULE_COPY.ko, ...CONTROLS.ko },
  en: { ...RULE_COPY.en, ...CONTROLS.en },
};

const SLUG = "text-scaling-checker";
const PRESETS: Preset[] = ["text-200", "reflow-320", "text-spacing"];
/** iframe 의 내부 logical 높이. 화면 맞춤 배율은 이 값에 곱해서만 적용한다. */
const FRAME_HEIGHT = 520;
/** 강조 outline 표시용 내부 속성 (측정이 끝난 뒤에만 붙인다) */
const HIGHLIGHT_ATTR = "data-kf-highlight";

/** 적용된 source snapshot: 프리셋·viewport 를 바꿔도 이 입력은 그대로 쓴다 */
type Applied = {
  body: string;
  css: string;
  kind: InputKind;
  preset: Preset;
  viewport: Viewport;
  notices: { styleTag: boolean; external: boolean };
  /** 같은 입력을 다시 적용할 때도 effect 가 다시 돌도록 */
  seq: number;
};

type Result = {
  preset: Preset;
  viewports: { origin: number; test: number };
  candidates: Candidate[];
  summary: ReturnType<typeof summarize>;
};

export default function TextScalingChecker() {
  const { lang } = useLang();
  const t = useT(DICT);

  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [tab, setTab] = useState<"html" | "css">("html");
  const [preset, setPreset] = useState<Preset>(DEFAULT_PRESET);
  const [viewport, setViewport] = useState<Viewport>(DEFAULT_VIEWPORT);
  const [applied, setApplied] = useState<Applied | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [errorType, setErrorType] = useState<PreviewErrorType | null>(null);
  const [phase, setPhase] = useState<"idle" | "rendering" | "measuring">("idle");
  const [dirty, setDirty] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [fit, setFit] = useState(1);

  const originRef = useRef<HTMLIFrameElement>(null);
  const testRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const runIdRef = useRef(0);
  const seqRef = useRef(0);

  const viewports = useMemo(() => viewportsFor(preset, viewport), [preset, viewport]);

  /* 화면 맞춤 배율: iframe **바깥** wrapper 에만 적용해 내부 layout·media query·
     측정값이 배율에 영향을 받지 않게 한다.
     열 개수를 추측하지 않고 실제로 grid 가 잡아 준 figure 폭을 재서 계산한다. */
  useEffect(() => {
    const frame = stageRef.current?.querySelector(".ts-frame");
    if (!frame || typeof ResizeObserver === "undefined") return;
    const widest = Math.max(viewports.origin, viewports.test);
    const update = () => {
      const available = frame.clientWidth;
      if (available > 0) setFit(Math.min(1, available / widest));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(frame);
    return () => observer.disconnect();
  }, [viewports.origin, viewports.test]);

  /* 적용된 snapshot 이 바뀌면 두 preview 를 다시 만들고 측정한다 */
  useEffect(() => {
    if (!applied) return;
    const originEl = originRef.current;
    const testEl = testRef.current;
    if (!originEl || !testEl) return;

    const runId = ++runIdRef.current;
    const vp = viewportsFor(applied.preset, applied.viewport);
    setPhase("rendering");
    setSelected(null);

    const waitLoad = (el: HTMLIFrameElement) =>
      new Promise<void>((resolve) => {
        el.addEventListener("load", () => resolve(), { once: true });
      });
    const loaded = Promise.all([waitLoad(originEl), waitLoad(testEl)]);

    const common = { body: applied.body, css: applied.css, lang };
    originEl.srcdoc = buildSrcdoc({ ...common, viewport: vp.origin });
    testEl.srcdoc = buildSrcdoc({ ...common, viewport: vp.test });

    loaded
      .then(async () => {
        if (runIdRef.current !== runId) return; // 새 적용이 시작되면 이전 측정은 버린다
        const originView = originEl.contentWindow;
        const testView = testEl.contentWindow;
        if (!originView || !testView) throw new Error("no preview window");

        setPhase("measuring");
        await Promise.all([afterLayout(originView), afterLayout(testView)]);
        if (runIdRef.current !== runId) return;

        applyPreset(testView.document, applied.preset);
        await afterLayout(testView);
        if (runIdRef.current !== runId) return;

        // 측정을 끝낸 뒤에만 강조를 그린다: outline 이 scrollWidth 를 바꿀 수 있다
        const origin = snapshotDocument(originView.document, vp.origin);
        const test = snapshotDocument(testView.document, vp.test);
        const candidates = detectCandidates({ preset: applied.preset, origin, test });

        setResult({ preset: applied.preset, viewports: vp, candidates, summary: summarize(candidates) });
        setErrorType(null);
        setDirty(false);
        setPhase("idle");
      })
      .catch(() => {
        if (runIdRef.current !== runId) return;
        setErrorType("render-failed"); // 이전 정상 결과는 그대로 둔다
        setPhase("idle");
      });
  }, [applied, lang]);

  /* 결과가 있는 상태에서 프리셋·viewport 를 바꾸면 같은 입력으로 다시 적용한다 */
  useEffect(() => {
    if (!applied) return;
    if (applied.preset === preset && applied.viewport === viewport) return;
    setApplied({ ...applied, preset, viewport, seq: ++seqRef.current });
  }, [preset, viewport, applied]);

  const build = useCallback(
    (sourceHtml: string, sourceCss: string) => {
      if (sourceHtml.trim() === "") {
        setErrorType("empty");
        return;
      }
      if (sourceHtml.length > LIMITS.maxHtmlChars) {
        setErrorType("html-too-long");
        return;
      }
      if (sourceCss.length > LIMITS.maxCssChars) {
        setErrorType("css-too-long");
        return;
      }
      if (typeof ResizeObserver === "undefined" || !("srcdoc" in document.createElement("iframe"))) {
        setErrorType("unsupported");
        return;
      }

      setErrorType(null);
      setPhase("rendering");

      // 파서(parse5)를 포함한 정제 모듈은 여기서 처음 내려받는다.
      // 페이지의 SEO 본문만 읽고 가는 방문자가 파서 번들을 받지 않게 한다.
      void (async () => {
        try {
          const { detectInputKind, sanitizeHtml, textToParagraphs } = await import(
            "../lib/textscale/sanitize"
          );
          const kind = detectInputKind(sourceHtml);
          let body: string;
          let styleTag = false;
          let external = false;
          if (kind === "text") {
            body = textToParagraphs(sourceHtml);
          } else {
            const clean = sanitizeHtml(sourceHtml);
            if (clean.elementCount > LIMITS.maxElements) {
              setErrorType("too-many-elements");
              setPhase("idle");
              return;
            }
            body = clean.html;
            styleTag = clean.hadStyleTag;
            external = clean.hadExternalResource || clean.hadImage;
          }
          setApplied({
            body,
            css: sourceCss,
            kind,
            preset,
            viewport,
            notices: { styleTag, external: external || cssRequestsExternal(sourceCss) },
            seq: ++seqRef.current,
          });
        } catch {
          setErrorType("parse-failed"); // 이전 정상 결과는 유지한다
          setPhase("idle");
        }
      })();
    },
    [preset, viewport],
  );

  function handleApply() {
    build(html, css);
  }

  function handleSample() {
    if ((html.trim() || css.trim()) && !window.confirm(t("ts.confirm.sample"))) return;
    const nextHtml = sampleHtml(lang);
    const nextCss = sampleCss();
    setHtml(nextHtml);
    setCss(nextCss);
    setTab("html");
    build(nextHtml, nextCss);
  }

  function handleReset() {
    runIdRef.current += 1;
    setHtml("");
    setCss("");
    setTab("html");
    setPreset(DEFAULT_PRESET);
    setViewport(DEFAULT_VIEWPORT);
    setApplied(null);
    setResult(null);
    setErrorType(null);
    setDirty(false);
    setSelected(null);
    setPhase("idle");
    // 남아 있던 preview 문서와 큰 참조를 정리한다
    for (const ref of [originRef, testRef]) {
      if (ref.current) ref.current.srcdoc = "";
    }
  }

  /** 후보를 고르면 검사 preview 의 해당 요소를 강조하고 보이는 위치로 옮긴다.
   *  포커스는 옮기지 않는다 (사용자가 결과 목록을 계속 훑을 수 있어야 한다). */
  function locate(nodeId: string) {
    setSelected(nodeId);
    const doc = testRef.current?.contentWindow?.document;
    if (!doc) return;
    for (const prev of Array.from(doc.querySelectorAll<HTMLElement>(`[${HIGHLIGHT_ATTR}]`))) {
      prev.style.removeProperty("outline");
      prev.style.removeProperty("outline-offset");
      prev.removeAttribute(HIGHLIGHT_ATTR);
    }
    if (nodeId === DOCUMENT_NODE) return;
    const el = doc.querySelector<HTMLElement>(`[${NODE_ID_ATTR}="${CSS.escape(nodeId)}"]`);
    if (!el) return;
    el.style.setProperty("outline", "3px solid #2d5dc8", "important");
    el.style.setProperty("outline-offset", "2px", "important");
    el.setAttribute(HIGHLIGHT_ATTR, "");
    el.scrollIntoView({ block: "center", inline: "nearest" });
  }

  const notices: string[] = [];
  if (applied?.notices.styleTag) notices.push(t("ts.notice.styleTag"));
  if (applied?.notices.external) notices.push(t("ts.notice.external"));
  if (applied?.kind === "text") notices.push(t("ts.notice.textInput"));

  const status = (() => {
    if (phase === "rendering") return t("ts.state.rendering");
    if (phase === "measuring") return t("ts.state.measuring");
    if (errorType) return t(`ts.error.${errorType}`);
    if (!result) return t("ts.state.initial");
    if (result.candidates.length === 0) return t("ts.state.clean");
    return t("ts.state.found").replace("{count}", String(result.candidates.length));
  })();

  const shown = result ?? null;
  const frameW = Math.round(viewports.test * fit);

  return (
    <>
      <PageHead slug={SLUG} />

      <div className="ts-work">
        {/* 입력: HTML·텍스트 / CSS 두 탭 */}
        <div className="ts-editor">
          <div className="ts-tabs" role="group" aria-label={t("ts.input.html.label")}>
            {(["html", "css"] as const).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={tab === key}
                onClick={() => setTab(key)}
              >
                {t(`ts.tab.${key}`)}
              </button>
            ))}
            <span className="ts-tab-spacer" />
            <button className="ts-act" type="button" onClick={handleSample}>
              {t("ts.action.sample")}
            </button>
            <button
              className="ts-act"
              type="button"
              onClick={handleReset}
              disabled={!html && !css && !applied}
            >
              {t("ts.action.reset")}
            </button>
          </div>

          <textarea
            className="ts-code"
            hidden={tab !== "html"}
            spellCheck={false}
            aria-label={t("ts.input.html.label")}
            placeholder={t("ts.input.html.placeholder")}
            value={html}
            onChange={(e) => {
              setHtml(e.target.value);
              setErrorType(null);
              if (applied) setDirty(true);
            }}
          />
          <textarea
            className="ts-code"
            hidden={tab !== "css"}
            spellCheck={false}
            aria-label={t("ts.input.css.label")}
            placeholder={t("ts.input.css.placeholder")}
            value={css}
            onChange={(e) => {
              setCss(e.target.value);
              setErrorType(null);
              if (applied) setDirty(true);
            }}
          />

          <div className="ts-editor-foot">
            <button
              className="ts-apply"
              type="button"
              onClick={handleApply}
              disabled={phase !== "idle"}
            >
              {t("ts.action.apply")}
            </button>
            <span className="ts-count">
              HTML {html.length.toLocaleString()} / {LIMITS.maxHtmlChars.toLocaleString()}
              {" · "}
              CSS {css.length.toLocaleString()} / {LIMITS.maxCssChars.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 프리셋·viewport 제어 */}
        <div className="ts-controls">
          <fieldset className="ts-control-group">
            <legend>{t("ts.preset.legend")}</legend>
            <div className="ts-choices">
              {PRESETS.map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={preset === key}
                  onClick={() => setPreset(key)}
                >
                  <b>{t(`ts.preset.${key}`)}</b>
                  <span>
                    WCAG {PRESET_CRITERION[key].sc} {PRESET_CRITERION[key].level}
                  </span>
                </button>
              ))}
            </div>
            <p className="ts-hint">{t(`ts.preset.${preset}.desc`)}</p>
          </fieldset>

          <fieldset className="ts-control-group">
            <legend>{t("ts.viewport.legend")}</legend>
            <div className="ts-choices is-compact">
              {VIEWPORTS.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={preset !== "reflow-320" && viewport === value}
                  disabled={preset === "reflow-320"}
                  onClick={() => setViewport(value)}
                >
                  <b>{value}px</b>
                </button>
              ))}
            </div>
            <p className="ts-hint">
              {preset === "reflow-320"
                ? `${t("ts.viewport.locked")} · ${t("ts.viewport.reflowNote")}`
                : t("ts.notice.resourceLimit")}
            </p>
          </fieldset>
        </div>

        {/* 원본 · 검사 preview */}
        <div className="ts-stage" ref={stageRef}>
          {(["origin", "test"] as const).map((side) => (
            <figure className="ts-frame" key={side}>
              <figcaption>
                <b>{t(`ts.preview.${side}`)}</b>
                <span>
                  {t("ts.preview.inner")} {viewports[side]} CSS px · {t("ts.preview.fit")}{" "}
                  {Math.round(fit * 100)}%
                </span>
              </figcaption>
              <div
                className="ts-frame-fit"
                style={{ width: `${frameW}px`, height: `${Math.round(FRAME_HEIGHT * fit)}px` }}
              >
                {/* 사용자 HTML 은 Kitfolio 의 활성 DOM 이 아니라 이 sandbox 안에서만 렌더된다.
                    상호작용 대상이 아니므로 tab order 와 screen reader 흐름에서 제외한다. */}
                <iframe
                  ref={side === "origin" ? originRef : testRef}
                  title={t(`ts.preview.${side}`)}
                  aria-hidden="true"
                  tabIndex={-1}
                  sandbox="allow-same-origin"
                  style={{
                    width: `${viewports[side]}px`,
                    height: `${FRAME_HEIGHT}px`,
                    transform: `scale(${fit})`,
                  }}
                />
              </div>
            </figure>
          ))}
        </div>

        <div className="ts-status">
          {dirty && applied && <span className="ts-badge">{t("ts.state.dirty")}</span>}
          <span role="status" aria-live="polite">
            {status}
          </span>
        </div>

        {notices.length > 0 && (
          <ul className="ts-notices">
            {notices.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}
      </div>

      <section className="ts-results" aria-labelledby="ts-results-title">
        <h2 id="ts-results-title">{t("ts.result.title")}</h2>

        <dl className="ts-summary">
          <div>
            <dt>{t("ts.summary.preset")}</dt>
            <dd>
              {t(`ts.preset.${shown?.preset ?? preset}`)} · WCAG{" "}
              {PRESET_CRITERION[shown?.preset ?? preset].sc}{" "}
              {PRESET_CRITERION[shown?.preset ?? preset].level}
            </dd>
          </div>
          <div>
            <dt>{t("ts.summary.viewport")}</dt>
            <dd>
              {(shown?.viewports ?? viewports).origin}px → {(shown?.viewports ?? viewports).test}px
            </dd>
          </div>
          <div>
            <dt>{t("ts.summary.candidates")}</dt>
            <dd>
              {shown?.candidates.length ?? 0}
              {t("ts.summary.unit")}
            </dd>
          </div>
          <div>
            <dt>{t("ts.summary.pageOverflow")}</dt>
            <dd>{shown?.summary.pageOverflow ? t("ts.summary.detected") : t("ts.summary.none")}</dd>
          </div>
        </dl>

        {shown && shown.candidates.length > 0 ? (
          <ol className="ts-candidates">
            {shown.candidates.map((c) => (
              <li
                key={c.nodeId}
                className={"ts-candidate" + (selected === c.nodeId ? " is-selected" : "")}
              >
                <div className="ts-candidate-head">
                  <code>{c.nodeId === DOCUMENT_NODE ? t("ts.result.document") : c.path}</code>
                  <span className={"ts-origin-tag" + (c.preexisting ? " is-pre" : "")}>
                    {c.preexisting ? t("ts.result.preexisting") : t("ts.result.introduced")}
                  </span>
                </div>
                {c.text && <p className="ts-candidate-text">{c.text}</p>}
                <ul className="ts-reasons">
                  {c.reasons.map((r) => (
                    <li key={r.ruleId}>
                      <span className="ts-rule">
                        {t(`ts.rule.${r.ruleId}.label`)} <em>{r.ruleId}</em>
                      </span>
                      <code className="ts-metrics">{r.detail}</code>
                      <p>
                        <b>{t("ts.result.why")}</b> {t(`ts.rule.${r.ruleId}.why`)}
                      </p>
                      <p>
                        <b>{t("ts.result.fix")}</b> {t(`ts.rule.${r.ruleId}.fix`)}
                      </p>
                    </li>
                  ))}
                </ul>
                {c.nodeId !== DOCUMENT_NODE && (
                  <button className="ts-locate" type="button" onClick={() => locate(c.nodeId)}>
                    {t("ts.result.locate")}
                  </button>
                )}
              </li>
            ))}
          </ol>
        ) : (
          <p className="ts-empty">{shown ? t("ts.state.clean") : t("ts.state.initial")}</p>
        )}

        <p className="ts-always">{t("ts.state.always")}</p>

        <div className="ts-manual">
          <h3>
            {t("ts.result.manual")} · {t(`ts.preset.${shown?.preset ?? preset}`)}
          </h3>
          <ul>
            {MANUAL_CHECKS[shown?.preset ?? preset].map((key) => (
              <li key={key}>{t(`ts.manual.${key}`)}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ts-criteria" aria-labelledby="ts-criteria-title">
        <h2 id="ts-criteria-title">{t("ts.criteria.title")}</h2>
        <div className="ts-criteria-grid">
          {PRESETS.map((key) => (
            <div key={key}>
              <h3>{t(`ts.preset.${key}`)}</h3>
              <p className="ts-criteria-sc">
                WCAG {PRESET_CRITERION[key].sc} {PRESET_CRITERION[key].level}
              </p>
              <p>{t(`ts.preset.${key}.desc`)}</p>
            </div>
          ))}
        </div>
      </section>

      <ToolGuide slug={SLUG} />
      <Faq slug={SLUG} />
      <RelatedTools slug={SLUG} />
    </>
  );
}
