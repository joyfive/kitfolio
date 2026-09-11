/* ============================================================
   텍스트 확대·간격 검사기: 프리셋 적용 (기획서 5.2 ~ 5.4)

   세 성공 기준을 하나의 400% 화면 효과로 합치지 않는다.
   - text-200     : 계산된 글자 크기만 2배 (1.4.4 stress test)
   - reflow-320   : iframe 의 layout viewport 자체를 320 CSS px 로 (1.4.10)
   - text-spacing : 네 속성만 WCAG 최소값 이상으로 (1.4.12)

   수치의 출처:
   https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html
   https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
   https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html

   계산은 순수 함수로 두고, DOM 을 도는 얇은 껍데기만 브라우저에서 실행한다.
   ============================================================ */
import type { Preset } from "./types";

/** WCAG 1.4.12 가 요구하는 배수 (font-size 기준) */
export const SPACING_RATIO = {
  lineHeight: 1.5,
  /** 문단 뒤 간격 */
  paragraphSpacing: 2,
  letterSpacing: 0.12,
  wordSpacing: 0.16,
} as const;

/** 텍스트 200%: 원래 계산값에서 직접 두 배로 만든다.
 *  부모와 자식에 연쇄로 적용해 4배·8배가 누적되지 않도록, 호출자는 반드시
 *  **모든 요소의 원래 계산값을 먼저 다 읽은 뒤** 한 번에 적용해야 한다. */
export function doubledFontSize(computedPx: number): number {
  return computedPx * 2;
}

/** 계산된 값 문자열을 px 숫자로 바꾼다. normal·비수치는 null. */
export function pxOf(value: string): number | null {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

export type SpacingComputed = {
  fontSizePx: number;
  /** getComputedStyle 의 line-height (px 또는 "normal") */
  lineHeight: string;
  /** letter-spacing (px 또는 "normal") */
  letterSpacing: string;
  /** word-spacing (px 또는 "normal") */
  wordSpacing: string;
  /** margin-bottom (px) · p 요소에만 의미 있다 */
  marginBottom: string;
};

export type SpacingOverride = {
  lineHeight: string;
  letterSpacing: string;
  wordSpacing: string;
  /** p 요소가 아니면 null */
  marginBottom: string | null;
};

/**
 * WCAG 텍스트 간격 override 를 계산한다.
 *
 * 기존 계산값이 기준보다 이미 크면 줄이지 않는다. 사용자가 그 값으로
 * 재정의해도 내용이 유지되는지 보는 검사이지, 기준값을 기본 디자인으로
 * 강요하는 것이 아니기 때문이다.
 * normal 인 letter·word spacing 은 0 으로 해석한 뒤 기준값을 적용한다.
 */
export function spacingOverride(
  computed: SpacingComputed,
  isParagraph: boolean,
): SpacingOverride {
  const fs = computed.fontSizePx;
  const atLeast = (current: string, ratio: number) => {
    const min = fs * ratio;
    const now = pxOf(current); // "normal" 은 null -> 0 으로 본다
    return Math.max(min, now ?? 0);
  };

  return {
    lineHeight: `${round(atLeast(computed.lineHeight, SPACING_RATIO.lineHeight))}px`,
    letterSpacing: `${round(atLeast(computed.letterSpacing, SPACING_RATIO.letterSpacing))}px`,
    wordSpacing: `${round(atLeast(computed.wordSpacing, SPACING_RATIO.wordSpacing))}px`,
    marginBottom: isParagraph
      ? `${round(atLeast(computed.marginBottom, SPACING_RATIO.paragraphSpacing))}px`
      : null,
  };
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** 프리셋이 원본·검사 preview 에 쓰는 내부 viewport */
export function viewportsFor(
  preset: Preset,
  selected: number,
): { origin: number; test: number } {
  if (preset === "reflow-320") return { origin: 1280, test: 320 };
  return { origin: selected, test: selected };
}

/* ---------- DOM 적용 (브라우저에서만 실행) ---------- */

/** 텍스트를 직접 담고 있거나 form control 인 요소만 글자 크기 대상이다.
 *  순수 래퍼까지 건드리면 상속 관계가 꼬여 배율이 누적된다. */
export function isTextBearing(el: Element): boolean {
  const tag = el.tagName.toLowerCase();
  if (tag === "button" || tag === "input" || tag === "select" || tag === "textarea") {
    return true;
  }
  for (const node of el.childNodes) {
    if (node.nodeType === 3 && (node.nodeValue ?? "").trim() !== "") return true;
  }
  return false;
}

/** 프리셋이 남기는 inline 스타일을 지울 때 쓰는 표시 속성 */
const APPLIED_ATTR = "data-kf-preset-applied";

/**
 * 검사 preview 문서에 프리셋을 적용한다.
 *
 * 두 단계로 나눈다: 먼저 모든 대상의 계산값을 읽고, 그다음 한 번에 쓴다.
 * 읽기와 쓰기를 섞으면 부모에 적용한 값이 자식의 계산값에 섞여 들어가
 * 2배가 4배로 누적된다.
 */
export function applyPreset(doc: Document, preset: Preset): void {
  clearPreset(doc);
  if (preset === "reflow-320") return; // viewport 자체로 검사한다: 스타일을 건드리지 않는다

  const view = doc.defaultView;
  if (!view) return;
  const elements = Array.from(doc.body.querySelectorAll<HTMLElement>("*"));

  if (preset === "text-200") {
    const targets: { el: HTMLElement; px: number }[] = [];
    for (const el of elements) {
      if (!isTextBearing(el)) continue;
      const px = pxOf(view.getComputedStyle(el).fontSize);
      if (px === null) continue;
      targets.push({ el, px: doubledFontSize(px) });
    }
    for (const { el, px } of targets) {
      el.style.setProperty("font-size", `${round(px)}px`, "important");
      el.setAttribute(APPLIED_ATTR, "");
    }
    return;
  }

  // text-spacing
  const targets: { el: HTMLElement; override: SpacingOverride }[] = [];
  for (const el of elements) {
    if (!isTextBearing(el)) continue;
    const cs = view.getComputedStyle(el);
    const fontSizePx = pxOf(cs.fontSize);
    if (fontSizePx === null) continue;
    targets.push({
      el,
      override: spacingOverride(
        {
          fontSizePx,
          lineHeight: cs.lineHeight,
          letterSpacing: cs.letterSpacing,
          wordSpacing: cs.wordSpacing,
          marginBottom: cs.marginBottom,
        },
        el.tagName.toLowerCase() === "p",
      ),
    });
  }
  for (const { el, override } of targets) {
    // author 의 !important 보다 우선해야 사용자 재정의를 재현할 수 있다
    el.style.setProperty("line-height", override.lineHeight, "important");
    el.style.setProperty("letter-spacing", override.letterSpacing, "important");
    el.style.setProperty("word-spacing", override.wordSpacing, "important");
    if (override.marginBottom !== null) {
      el.style.setProperty("margin-bottom", override.marginBottom, "important");
    }
    el.setAttribute(APPLIED_ATTR, "");
  }
}

/** 이전 프리셋이 남긴 inline 스타일을 되돌린다 */
export function clearPreset(doc: Document): void {
  for (const el of Array.from(doc.querySelectorAll<HTMLElement>(`[${APPLIED_ATTR}]`))) {
    for (const prop of [
      "font-size",
      "line-height",
      "letter-spacing",
      "word-spacing",
      "margin-bottom",
    ]) {
      el.style.removeProperty(prop);
    }
    el.removeAttribute(APPLIED_ATTR);
  }
}
