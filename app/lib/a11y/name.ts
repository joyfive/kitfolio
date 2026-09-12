/* ============================================================
   HTML 접근성 검사기: 제한된 이름 신호 계산 (기획서 5.6)

   W3C Accessible Name Computation 전체를 재구현하지 않는다.
   CSS 가시성·pseudo element·shadow DOM·slot·브라우저별 HTML-AAM 동작은
   정적 소스만으로 알 수 없으므로 계산하지 않는다.
   그래서 결과 UI 에서도 "접근 가능한 이름"이라고 단정하지 않고
   "이름 신호"로 표시한다.

   확인 순서:
     1. 유효한 aria-labelledby 가 참조하는 텍스트
     2. 공백이 아닌 aria-label
     3. labelable control 에 연결된 명시적·암시적 <label> 텍스트
     4. button · a · summary 의 노출 가능한 descendant text (+ 이름 있는 이미지)
     5. input[type=button|submit|reset] 의 value
     6. input[type=image] · img 의 alt
     7. 허용되는 요소의 title 대체값
   ============================================================ */
import {
  attr,
  children,
  closest,
  findWithin,
  hasAttr,
  isElement,
  isSvg,
  normalizeText,
  rawText,
  tag,
  visibleText,
  type Ast,
  type Element,
} from "./ast";

export type NameSource =
  | "labelledby"
  | "aria-label"
  | "label"
  | "content"
  | "value"
  | "alt"
  | "svg-title"
  | "title";

export type NameSignal = {
  /** 추정 이름. 빈 문자열이면 이름 신호가 없다고 본다. */
  name: string;
  source: NameSource | null;
  /** aria-labelledby 가 숨은 노드를 직접 참조함 (표준 예외가 복잡해 review 로 남긴다) */
  hiddenRef: boolean;
};

const EMPTY: NameSignal = { name: "", source: null, hiddenRef: false };

/** <label> 이 이름을 줄 수 있는 요소 */
export const LABELABLE = new Set([
  "button",
  "input",
  "meter",
  "output",
  "progress",
  "select",
  "textarea",
]);

/** 자체 value 가 이름이 되는 input 유형 */
const VALUE_INPUT_TYPES = new Set(["button", "submit", "reset"]);

export function isLabelable(el: Element): boolean {
  const name = tag(el);
  if (!LABELABLE.has(name)) return false;
  if (name === "input") return inputType(el) !== "hidden";
  return true;
}

export function inputType(el: Element): string {
  return (attr(el, "type") ?? "text").trim().toLowerCase();
}

/** 검사 한 번 동안 재사용하는 이름 계산 문맥 */
export type NameContext = {
  ast: Ast;
  /** control -> 연결된 label 들 (명시적 for + 암시적 wrapping) */
  labelsFor: Map<Element, Element[]>;
  /** [hidden] · aria-hidden="true" 안에 있는 요소 */
  hidden: Set<Element>;
};

export function buildNameContext(ast: Ast): NameContext {
  const labelsFor = new Map<Element, Element[]>();
  const add = (control: Element, label: Element) => {
    const list = labelsFor.get(control);
    if (list) list.push(label);
    else labelsFor.set(control, [label]);
  };

  for (const el of ast.elements) {
    if (tag(el) !== "label") continue;
    const forId = attr(el, "for");
    if (forId !== undefined) {
      const target = ast.byId.get(forId);
      if (target && isLabelable(target)) add(target, el);
      continue;
    }
    // 암시적 연결: label 안에 처음 나오는 labelable control 하나
    const inner = findWithin(el, (e) => isLabelable(e))[0];
    if (inner) add(inner, el);
  }

  const hidden = new Set<Element>();
  for (const el of ast.elements) {
    if (hasAttr(el, "hidden") || attr(el, "aria-hidden") === "true") {
      hidden.add(el);
      for (const inner of findWithin(el, () => true)) hidden.add(inner);
    }
  }

  return { ast, labelsFor, hidden };
}

/** aria-labelledby 가 가리키는, 실제로 존재하는 요소들 (작성 순서 유지) */
export function labelledByTargets(el: Element, ctx: NameContext): Element[] {
  const raw = attr(el, "aria-labelledby");
  if (!raw) return [];
  return idRefs(raw)
    .map((id) => ctx.ast.byId.get(id))
    .filter((x): x is Element => Boolean(x));
}

export function idRefs(value: string): string[] {
  return value.split(/\s+/).filter(Boolean);
}

/** 제한된 이름 신호 계산 */
export function nameSignal(el: Element, ctx: NameContext): NameSignal {
  // 1. aria-labelledby
  const refs = labelledByTargets(el, ctx);
  if (refs.length) {
    const text = normalizeText(refs.map((r) => rawText(r)).join(" "));
    if (text) {
      return {
        name: text,
        source: "labelledby",
        hiddenRef: refs.some((r) => ctx.hidden.has(r)),
      };
    }
  }

  // 2. aria-label
  const ariaLabel = normalizeText(attr(el, "aria-label") ?? "");
  if (ariaLabel) return { name: ariaLabel, source: "aria-label", hiddenRef: false };

  const name = tag(el);

  // 3. 연결된 <label>
  if (isLabelable(el)) {
    const text = labelText(el, ctx);
    if (text) return { name: text, source: "label", hiddenRef: false };
  }

  // 5·6. input 자체 속성 (4번보다 먼저: input 은 descendant 를 갖지 않는다)
  if (name === "input") {
    const type = inputType(el);
    if (VALUE_INPUT_TYPES.has(type)) {
      const value = normalizeText(attr(el, "value") ?? "");
      if (value) return { name: value, source: "value", hiddenRef: false };
    }
    if (type === "image") {
      const alt = normalizeText(attr(el, "alt") ?? "");
      if (alt) return { name: alt, source: "alt", hiddenRef: false };
    }
  }

  // 6. img
  if (name === "img" && !isSvg(el)) {
    const alt = normalizeText(attr(el, "alt") ?? "");
    if (alt) return { name: alt, source: "alt", hiddenRef: false };
  }

  // svg 는 자식 <title> 로 이름을 얻을 수 있다
  if (isSvg(el)) {
    const title = children(el).find((c) => isElement(c) && tag(c) === "title");
    if (title) {
      const text = rawText(title);
      if (text) return { name: text, source: "svg-title", hiddenRef: false };
    }
  }

  // 4. 콘텐츠에서 이름을 얻는 요소
  if (fromContent(el)) {
    const text = contentName(el, ctx);
    if (text) return { name: text, source: "content", hiddenRef: false };
  }

  // 7. title 대체값
  const title = normalizeText(attr(el, "title") ?? "");
  if (title) return { name: title, source: "title", hiddenRef: false };

  return EMPTY;
}

/** 콘텐츠가 이름이 되는 요소인가 */
const CONTENT_NAMED_TAGS = new Set([
  "button",
  "summary",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "legend",
  "caption",
  "figcaption",
  "td",
  "th",
]);

function fromContent(el: Element): boolean {
  const name = tag(el);
  if (CONTENT_NAMED_TAGS.has(name)) return true;
  if (name === "a") return hasAttr(el, "href");
  const role = explicitRole(el);
  return role === "button" || role === "link" || role === "heading" || role === "option";
}

/** 노출 가능한 descendant text. 없으면 안에 있는 이름 있는 이미지에서 가져온다. */
export function contentName(el: Element, ctx: NameContext): string {
  const text = visibleText(el);
  if (text) return text;
  for (const img of findWithin(el, (e) => isImageLike(e))) {
    if (ctx.hidden.has(img)) continue;
    const signal = imageName(img, ctx);
    if (signal) return signal;
  }
  return "";
}

export function isImageLike(el: Element): boolean {
  const name = tag(el);
  if (name === "img" || name === "svg") return true;
  if (name === "input" && inputType(el) === "image") return true;
  return explicitRole(el) === "img";
}

function imageName(el: Element, ctx: NameContext): string {
  const refs = labelledByTargets(el, ctx);
  if (refs.length) {
    const text = normalizeText(refs.map((r) => rawText(r)).join(" "));
    if (text) return text;
  }
  const ariaLabel = normalizeText(attr(el, "aria-label") ?? "");
  if (ariaLabel) return ariaLabel;
  const alt = normalizeText(attr(el, "alt") ?? "");
  if (alt) return alt;
  if (isSvg(el)) {
    const title = children(el).find((c) => isElement(c) && tag(c) === "title");
    if (title) {
      const text = rawText(title);
      if (text) return text;
    }
  }
  return normalizeText(attr(el, "title") ?? "");
}

/** 연결된 label 텍스트 (여러 개면 작성 순서대로 결합) */
export function labelText(el: Element, ctx: NameContext): string {
  const labels = ctx.labelsFor.get(el) ?? [];
  if (!labels.length) return "";
  return normalizeText(labels.map((l) => visibleText(l)).join(" "));
}

/** 명시적 role 속성 (첫 토큰만 사용) */
export function explicitRole(el: Element): string | null {
  const raw = attr(el, "role");
  if (!raw) return null;
  const first = raw.trim().split(/\s+/)[0];
  return first ? first.toLowerCase() : null;
}

/** 보이는 레이블 텍스트: Label in Name 검사용.
 *  요소 안의 노출 텍스트, 또는 연결된 label 의 텍스트. */
export function visibleLabelText(el: Element, ctx: NameContext): string {
  const own = visibleText(el);
  if (own) return own;
  if (isLabelable(el)) return labelText(el, ctx);
  return "";
}

/** 조상 중 aria-hidden="true" 인 요소가 있는가 */
export function inAriaHidden(el: Element): boolean {
  return closest(el, (e) => attr(e, "aria-hidden") === "true") !== null;
}
