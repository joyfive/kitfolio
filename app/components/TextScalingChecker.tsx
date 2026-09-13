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
import { sampleCss, sampleHtml, sampleJsx, sampleTailwindCss } from "../lib/textscale/sample";
import type { JsxNotes } from "../lib/textscale/jsx";
import {
  DEFAULT_PRESET,
  DEFAULT_SOURCE_FORMAT,
  DEFAULT_VIEWPORT,
  LIMITS,
  LIST_REPEAT,
  PRESET_CRITERION,
  PreviewError,
  SOURCE_FORMATS,
  VIEWPORTS,
  type Candidate,
  type InputKind,
  type Preset,
  type PreviewErrorType,
  type SourceFormat,
  type Viewport,
} from "../lib/textscale/types";

/* 컨트롤 마이크로카피만 로컬 dict.
   페이지 콘텐츠(제목·설명·가이드·FAQ)는 content.ts 레지스트리,
   감지 규칙 문구와 직접 확인 목록은 lib/textscale/messages.ts. */
const CONTROLS: Record<"ko" | "en", Record<string, string>> = {
  ko: {
    "ts.tab.html": "HTML·텍스트",
    "ts.tab.jsx": "JSX·TSX",
    "ts.tab.css": "CSS",
    "ts.tab.tailwind": "CSS·Tailwind",
    "ts.input.html.label": "검사할 HTML 또는 텍스트",
    "ts.input.html.placeholder": "<section>...</section> 또는 일반 텍스트를 붙여넣으세요.",
    "ts.input.jsx.label": "검사할 JSX 또는 TSX",
    "ts.input.jsx.placeholder":
      "export default function Card() { return <section className=\"...\">...</section> }",
    "ts.input.css.label": "적용할 CSS · 선택",
    "ts.input.css.placeholder": ".card { max-width: 40rem; }",
    "ts.input.tailwind.label": "적용할 CSS · @theme 정의 · 선택",
    "ts.input.tailwind.placeholder": "@theme { --color-brand: #2d5dc8; }",

    "ts.format.legend": "소스 형식",
    "ts.format.html": "HTML",
    "ts.format.jsx": "JSX·TSX",
    "ts.format.html.sub": "markup",
    "ts.format.jsx.sub": "React",
    "ts.format.html.desc":
      "HTML 또는 일반 텍스트를 그대로 읽습니다. 스타일은 CSS 입력 영역에서 가져옵니다.",
    "ts.format.jsx.desc":
      "컴포넌트 코드를 실행하지 않고 구문만 읽어 마크업으로 바꿉니다. 값을 알 수 없는 표현식은 식 자체를 자리표시자 텍스트로 넣습니다.",
    "ts.tailwind.label": "Tailwind 클래스로 스타일 만들기",
    "ts.tailwind.desc":
      "마크업에 쓰인 클래스만 골라 브라우저 안에서 Tailwind CSS를 만듭니다. 프로젝트의 @theme·@utility 정의는 CSS 입력 영역에 함께 붙여넣으세요.",
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
    "ts.error.jsx-parse-failed":
      "JSX 또는 TSX를 해석하지 못했습니다. 괄호와 태그가 맞는 조각인지 확인하고 다시 시도해 주세요.",
    "ts.error.jsx-no-element":
      "JSX 요소를 찾지 못했습니다. 컴포넌트가 화면을 그리는 부분까지 함께 붙여넣어 주세요.",
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
    "ts.notice.jsx.components":
      "컴포넌트 {count}개를 이름으로 짐작한 요소로 대체했습니다: {list}. 실제 컴포넌트 내부 마크업과 다를 수 있습니다.",
    "ts.notice.jsx.expressions":
      "값을 알 수 없는 표현식 {count}개를 코드 그대로 자리표시자 텍스트로 넣었습니다. 실제 문구 길이로 다시 확인하세요.",
    "ts.notice.jsx.lists": "map으로 그리는 목록 {count}개를 항목 {repeat}개씩 반복해 그렸습니다.",
    "ts.notice.jsx.spreads":
      "전개 prop({...props}) {count}개는 값이 호출하는 쪽에 있어 적용하지 않았습니다.",
    "ts.notice.jsx.dropped": "마크업에 대응이 없는 prop은 제외했습니다: {list}",
    "ts.notice.tailwind.version": "Tailwind CSS v{version} 기준으로 스타일을 만들었습니다.",
    "ts.notice.tailwind.unknown":
      "CSS가 만들어지지 않은 클래스 {count}개: {list}. 프로젝트에서 정의한 토큰이라면 @theme 블록을 CSS 입력 영역에 함께 붙여넣으세요.",
    "ts.notice.tailwind.failed":
      "Tailwind 스타일을 만들지 못해 CSS 입력을 그대로 적용했습니다. CSS 문법을 확인해 주세요.",

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
    "ts.tab.jsx": "JSX or TSX",
    "ts.tab.css": "CSS",
    "ts.tab.tailwind": "CSS · Tailwind",
    "ts.input.html.label": "HTML or text to check",
    "ts.input.html.placeholder": "Paste <section>...</section> or plain text.",
    "ts.input.jsx.label": "JSX or TSX to check",
    "ts.input.jsx.placeholder":
      "export default function Card() { return <section className=\"...\">...</section> }",
    "ts.input.css.label": "CSS to apply · optional",
    "ts.input.css.placeholder": ".card { max-width: 40rem; }",
    "ts.input.tailwind.label": "CSS and @theme definitions · optional",
    "ts.input.tailwind.placeholder": "@theme { --color-brand: #2d5dc8; }",

    "ts.format.legend": "Source format",
    "ts.format.html": "HTML",
    "ts.format.jsx": "JSX or TSX",
    "ts.format.html.sub": "markup",
    "ts.format.jsx.sub": "React",
    "ts.format.html.desc":
      "Reads HTML or plain text as written. Styles come from the CSS field.",
    "ts.format.jsx.desc":
      "Reads component syntax without running it and turns it into markup. Expressions whose values are unknown become placeholder text made of the expression itself.",
    "ts.tailwind.label": "Build styles from Tailwind classes",
    "ts.tailwind.desc":
      "Generates Tailwind CSS in your browser for the classes found in the markup. Paste your project @theme and @utility definitions into the CSS field to reuse custom tokens.",
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
    "ts.error.jsx-parse-failed":
      "The JSX or TSX could not be parsed. Check that brackets and tags are balanced, then try again.",
    "ts.error.jsx-no-element":
      "No JSX element was found. Include the part of the component that renders the markup.",
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
    "ts.notice.jsx.components":
      "Components replaced with elements guessed from their names: {count} ({list}). The real component markup may differ.",
    "ts.notice.jsx.expressions":
      "Expressions with unknown values: {count}. Each became placeholder text made of the expression source, so re-check with real copy lengths.",
    "ts.notice.jsx.lists": "Lists rendered with map: {count}, each repeated as {repeat} items.",
    "ts.notice.jsx.spreads":
      "Spread props ({...props}) skipped because their values live in the calling component: {count}.",
    "ts.notice.jsx.dropped": "Props with no markup equivalent were skipped: {list}",
    "ts.notice.tailwind.version": "Styles were generated with Tailwind CSS v{version}.",
    "ts.notice.tailwind.unknown":
      "Classes that produced no CSS: {count} ({list}). If they come from your own tokens, paste the @theme block into the CSS field.",
    "ts.notice.tailwind.failed":
      "Tailwind styles could not be generated, so the CSS field was applied as plain CSS. Check the CSS syntax.",

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
/** 안내 문구에 나열하는 이름 개수 (전부 늘어놓으면 읽히지 않는다) */
const NOTICE_LIST_MAX = 4;

/** {key} 자리를 값으로 바꾼다 */
function fill(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (out, [key, value]) => out.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

/** 이름 목록을 앞의 몇 개만 남겨 한 줄로 만든다 */
function listOf(values: string[]): string {
  const head = values.slice(0, NOTICE_LIST_MAX).join(", ");
  const rest = values.length - NOTICE_LIST_MAX;
  return rest > 0 ? `${head} +${rest}` : head;
}

/** Tailwind 모드의 결과 요약 (안내 문구 생성용) */
type TailwindNotes = {
  unknown: string[];
  unknownMore: number;
  version: string;
  /** 컴파일에 실패해 CSS 입력을 그대로 적용했다 */
  failed: boolean;
};

/** 적용된 source snapshot: 프리셋·viewport 를 바꿔도 이 입력은 그대로 쓴다 */
type Applied = {
  body: string;
  /** 그대로 넣을 사용자 CSS. Tailwind 모드에서는 frameworkCss 안에 이미 들어 있다. */
  css: string;
  /** Tailwind 가 만들어 준 stylesheet (없으면 빈 문자열) */
  frameworkCss: string;
  kind: InputKind;
  preset: Preset;
  viewport: Viewport;
  notices: {
    styleTag: boolean;
    external: boolean;
    jsx: JsxNotes | null;
    tailwind: TailwindNotes | null;
  };
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
  const [format, setFormat] = useState<SourceFormat>(DEFAULT_SOURCE_FORMAT);
  const [tailwind, setTailwind] = useState(false);
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

    const common = {
      body: applied.body,
      css: applied.css,
      frameworkCss: applied.frameworkCss,
      lang,
    };
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
    (sourceHtml: string, sourceCss: string, mode?: { format: SourceFormat; tailwind: boolean }) => {
      const useFormat = mode?.format ?? format;
      const useTailwind = mode?.tailwind ?? tailwind;

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

      // 파서(parse5·@babel/parser)와 Tailwind 엔진은 여기서 처음 내려받는다.
      // 페이지의 SEO 본문만 읽고 가는 방문자가 파서 번들을 받지 않게 한다.
      void (async () => {
        try {
          const { detectInputKind, sanitizeHtml, textToParagraphs } = await import(
            "../lib/textscale/sanitize"
          );

          let kind: InputKind;
          let body: string;
          let styleTag = false;
          let external = false;
          let classNames: string[] = [];
          let jsxNotes: JsxNotes | null = null;

          if (useFormat === "jsx") {
            const { jsxToHtml } = await import("../lib/textscale/jsx");
            const converted = jsxToHtml(sourceHtml);
            jsxNotes = converted.notes;
            // JSX 에서 나온 마크업도 HTML 과 똑같은 정제를 거친다
            const clean = sanitizeHtml(converted.html);
            if (clean.elementCount > LIMITS.maxElements) {
              setErrorType("too-many-elements");
              setPhase("idle");
              return;
            }
            kind = "jsx";
            body = clean.html;
            styleTag = clean.hadStyleTag;
            external = clean.hadExternalResource || clean.hadImage;
            classNames = clean.classNames;
          } else {
            kind = detectInputKind(sourceHtml);
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
              classNames = clean.classNames;
            }
          }

          let frameworkCss = "";
          let tailwindNotes: TailwindNotes | null = null;
          if (useTailwind) {
            const { compileTailwind, TAILWIND_VERSION } = await import(
              "../lib/textscale/tailwind"
            );
            try {
              const built = await compileTailwind(classNames, sourceCss);
              frameworkCss = built.css;
              tailwindNotes = {
                unknown: built.unknown,
                unknownMore: built.unknownMore,
                version: built.version,
                failed: false,
              };
            } catch {
              // Tailwind 가 읽지 못하는 CSS 라도 검사 자체는 계속한다
              tailwindNotes = {
                unknown: [],
                unknownMore: 0,
                version: TAILWIND_VERSION,
                failed: true,
              };
            }
          }

          setApplied({
            body,
            // Tailwind 가 사용자 CSS 까지 함께 컴파일했다면 중복으로 넣지 않는다
            css: frameworkCss ? "" : sourceCss,
            frameworkCss,
            kind,
            preset,
            viewport,
            notices: {
              styleTag,
              external: external || cssRequestsExternal(sourceCss),
              jsx: jsxNotes,
              tailwind: tailwindNotes,
            },
            seq: ++seqRef.current,
          });
        } catch (error) {
          // 이전 정상 결과는 유지한다
          setErrorType(error instanceof PreviewError ? error.type : "parse-failed");
          setPhase("idle");
        }
      })();
    },
    [format, preset, tailwind, viewport],
  );

  function handleApply() {
    build(html, css);
  }

  /** 소스 형식을 바꾸면 입력 의미가 달라지므로 결과를 다시 적용해야 한다.
   *  JSX 를 고르면 Tailwind 를 함께 켠다: React 화면은 대부분 이 조합이다. */
  function handleFormat(next: SourceFormat) {
    if (next === format) return;
    setFormat(next);
    if (next === "jsx") setTailwind(true);
    setErrorType(null);
    if (applied) setDirty(true);
  }

  function handleTailwind(next: boolean) {
    setTailwind(next);
    setErrorType(null);
    if (applied) setDirty(true);
  }

  function handleSample() {
    if ((html.trim() || css.trim()) && !window.confirm(t("ts.confirm.sample"))) return;
    const isJsx = format === "jsx";
    const nextHtml = isJsx ? sampleJsx(lang) : sampleHtml(lang);
    const nextCss = isJsx ? sampleTailwindCss() : sampleCss();
    const nextTailwind = isJsx ? true : tailwind;
    setHtml(nextHtml);
    setCss(nextCss);
    setTailwind(nextTailwind);
    setTab("html");
    build(nextHtml, nextCss, { format, tailwind: nextTailwind });
  }

  function handleReset() {
    runIdRef.current += 1;
    setHtml("");
    setCss("");
    setTab("html");
    setFormat(DEFAULT_SOURCE_FORMAT);
    setTailwind(false);
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

  /** 안내 문구는 적용된 snapshot 에서 매번 다시 만든다 (언어 전환을 따라가야 한다) */
  const notices: string[] = [];
  if (applied?.notices.styleTag) notices.push(t("ts.notice.styleTag"));
  if (applied?.notices.external) notices.push(t("ts.notice.external"));
  if (applied?.kind === "text") notices.push(t("ts.notice.textInput"));

  const jsxNotes = applied?.notices.jsx;
  if (jsxNotes) {
    if (jsxNotes.components.length > 0) {
      notices.push(
        fill(t("ts.notice.jsx.components"), {
          count: jsxNotes.components.length,
          list: listOf(jsxNotes.components),
        }),
      );
    }
    if (jsxNotes.expressions > 0) {
      notices.push(fill(t("ts.notice.jsx.expressions"), { count: jsxNotes.expressions }));
    }
    if (jsxNotes.lists > 0) {
      notices.push(
        fill(t("ts.notice.jsx.lists"), { count: jsxNotes.lists, repeat: LIST_REPEAT }),
      );
    }
    if (jsxNotes.spreads > 0) {
      notices.push(fill(t("ts.notice.jsx.spreads"), { count: jsxNotes.spreads }));
    }
    if (jsxNotes.dropped.length > 0) {
      notices.push(fill(t("ts.notice.jsx.dropped"), { list: listOf(jsxNotes.dropped) }));
    }
  }

  const tailwindNotes = applied?.notices.tailwind;
  if (tailwindNotes) {
    if (tailwindNotes.failed) {
      notices.push(t("ts.notice.tailwind.failed"));
    } else {
      notices.push(fill(t("ts.notice.tailwind.version"), { version: tailwindNotes.version }));
      if (tailwindNotes.unknown.length > 0) {
        const shown = tailwindNotes.unknown.join(", ");
        notices.push(
          fill(t("ts.notice.tailwind.unknown"), {
            count: tailwindNotes.unknown.length + tailwindNotes.unknownMore,
            list: shown,
          }),
        );
      }
    }
  }

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

  /* 입력 영역의 이름은 선택한 소스 형식·Tailwind 사용 여부를 따라간다 */
  const sourceTab = t(format === "jsx" ? "ts.tab.jsx" : "ts.tab.html");
  const sourceLabel = t(format === "jsx" ? "ts.input.jsx.label" : "ts.input.html.label");
  const sourcePlaceholder = t(
    format === "jsx" ? "ts.input.jsx.placeholder" : "ts.input.html.placeholder",
  );
  const styleTab = t(tailwind ? "ts.tab.tailwind" : "ts.tab.css");
  const styleLabel = t(tailwind ? "ts.input.tailwind.label" : "ts.input.css.label");
  const stylePlaceholder = t(
    tailwind ? "ts.input.tailwind.placeholder" : "ts.input.css.placeholder",
  );

  return (
    <>
      <PageHead slug={SLUG} />

      <div className="ts-work">
        {/* 입력: 소스(HTML·텍스트 또는 JSX·TSX) / CSS 두 탭 */}
        <div className="ts-editor">
          <div className="ts-tabs" role="group" aria-label={sourceLabel}>
            {(["html", "css"] as const).map((key) => (
              <button
                key={key}
                type="button"
                aria-pressed={tab === key}
                onClick={() => setTab(key)}
              >
                {key === "html" ? sourceTab : styleTab}
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
            aria-label={sourceLabel}
            placeholder={sourcePlaceholder}
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
            aria-label={styleLabel}
            placeholder={stylePlaceholder}
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
              {sourceTab} {html.length.toLocaleString()} /{" "}
              {LIMITS.maxHtmlChars.toLocaleString()}
              {" · "}
              CSS {css.length.toLocaleString()} / {LIMITS.maxCssChars.toLocaleString()}
            </span>
          </div>
        </div>

        {/* 소스 형식·프리셋·viewport 제어 */}
        <div className="ts-controls">
          <fieldset className="ts-control-group">
            <legend>{t("ts.format.legend")}</legend>
            <div className="ts-choices">
              {SOURCE_FORMATS.map((key) => (
                <button
                  key={key}
                  type="button"
                  aria-pressed={format === key}
                  onClick={() => handleFormat(key)}
                >
                  <b>{t(`ts.format.${key}`)}</b>
                  <span>{t(`ts.format.${key}.sub`)}</span>
                </button>
              ))}
            </div>
            <label className="ts-switch">
              <input
                type="checkbox"
                checked={tailwind}
                onChange={(e) => handleTailwind(e.target.checked)}
              />
              <span>{t("ts.tailwind.label")}</span>
            </label>
            <p className="ts-hint">
              {t(`ts.format.${format}.desc`)}
              {tailwind ? ` ${t("ts.tailwind.desc")}` : ""}
            </p>
          </fieldset>

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
