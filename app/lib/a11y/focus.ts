/* ============================================================
   HTML 접근성 검사기: 포커스 가능 요소와 예상 탭 순서 (기획서 4.5 · 5.9)

   "예상"이라는 표현을 유지한다. 정적 마크업만으로는 CSS 의 display·
   visibility·order, 화면 위치, JavaScript 로 열린 대화상자, shadow DOM,
   포커스 트랩을 알 수 없다.

   정렬 규칙 (브라우저의 순차 탐색과 같은 모양):
     1. 양수 tabindex: 숫자 오름차순, 같은 값은 DOM 순서
     2. 그다음 native focusable + tabindex="0": DOM 순서
   ============================================================ */
import {
  attr,
  closest,
  hasAttr,
  isSvg,
  tag,
  type Element,
} from "./ast";
import { explicitRole, inputType, nameSignal, type NameContext } from "./name";
import type { TabRow } from "./types";
import { elementPath, locationOf } from "./ast";

/** tabindex 파싱: HTML 정수 규칙에 맞지 않으면 invalid */
export type TabIndexInfo =
  | { kind: "absent" }
  | { kind: "valid"; value: number }
  | { kind: "invalid"; raw: string };

export function tabIndexOf(el: Element): TabIndexInfo {
  const raw = attr(el, "tabindex");
  if (raw === undefined) return { kind: "absent" };
  const trimmed = raw.trim();
  if (!/^[+-]?\d+$/.test(trimmed)) return { kind: "invalid", raw };
  return { kind: "valid", value: Number(trimmed) };
}

/** disabled 를 가질 수 있는 요소 */
const DISABLEABLE = new Set([
  "button",
  "fieldset",
  "input",
  "optgroup",
  "option",
  "select",
  "textarea",
]);

export function isDisabled(el: Element): boolean {
  if (DISABLEABLE.has(tag(el)) && hasAttr(el, "disabled")) return true;
  // fieldset[disabled] 안의 컨트롤도 비활성이다 (legend 예외는 다루지 않는다)
  return closest(el, (e) => tag(e) === "fieldset" && hasAttr(e, "disabled")) !== null;
}

/** 정적으로 확실하게 제외되는 경우만 제외한다: hidden · inert · disabled */
export function isStaticallyExcluded(el: Element): boolean {
  if (isDisabled(el)) return true;
  if (closest(el, (e) => hasAttr(e, "hidden") || hasAttr(e, "inert"))) return true;
  return hasAttr(el, "hidden") || hasAttr(el, "inert");
}

/** 기본적으로 포커스를 받는 native 요소인가 (tabindex 없이) */
export function isNativelyFocusable(el: Element): boolean {
  if (isSvg(el)) return false;
  const name = tag(el);
  switch (name) {
    case "a":
    case "area":
      return hasAttr(el, "href");
    case "button":
    case "select":
    case "textarea":
    case "summary":
    case "iframe":
      return true;
    case "input":
      return inputType(el) !== "hidden";
    case "audio":
    case "video":
      return hasAttr(el, "controls");
    default: {
      const ce = attr(el, "contenteditable");
      return ce !== undefined && ce.toLowerCase() !== "false";
    }
  }
}

/** 정적 마크업 기준 포커스 가능 판정.
 *  tabindex="-1" 도 포함한다: 순차 탐색에는 들어오지 않지만 프로그램으로는
 *  포커스를 받을 수 있어 aria-hidden 안에 있으면 문제가 된다. */
export function isFocusable(el: Element): boolean {
  if (isStaticallyExcluded(el)) return false;
  const ti = tabIndexOf(el);
  if (ti.kind === "valid") return true;
  // 유효하지 않은 tabindex 는 브라우저가 무시하므로 native 동작만 남는다
  return isNativelyFocusable(el);
}

/** 순차 탐색(Tab)에 들어오는가: tabindex="-1" 은 프로그램 포커스 전용이라 빠진다 */
export function isInTabSequence(el: Element): boolean {
  if (isStaticallyExcluded(el)) return false;
  const ti = tabIndexOf(el);
  if (ti.kind === "valid") return ti.value >= 0;
  // 유효하지 않은 tabindex 는 브라우저가 무시하므로 native 동작이 남는다
  return isNativelyFocusable(el);
}

/** 요소 유형 표시 문자열: button · a · input[type=email] */
export function focusKind(el: Element): string {
  const name = tag(el);
  if (name === "input") return `input[type=${inputType(el)}]`;
  const role = explicitRole(el);
  return role ? `${name}[role=${role}]` : name;
}

/** 예상 탭 순서 */
export function tabOrder(elements: Element[], ctx: NameContext): TabRow[] {
  const entries = elements
    .filter((el) => isInTabSequence(el))
    .map((el, domIndex) => {
      const ti = tabIndexOf(el);
      return {
        el,
        domIndex,
        tabindex: ti.kind === "valid" ? ti.value : null,
      };
    });

  const positive = entries
    .filter((e) => e.tabindex !== null && e.tabindex > 0)
    .sort((a, b) => a.tabindex! - b.tabindex! || a.domIndex - b.domIndex);
  const rest = entries.filter((e) => e.tabindex === null || e.tabindex === 0);

  return [...positive, ...rest].map((e, i) => {
    const loc = locationOf(e.el);
    return {
      order: i + 1,
      kind: focusKind(e.el),
      name: nameSignal(e.el, ctx).name,
      tabindex: e.tabindex,
      path: elementPath(e.el),
      line: loc?.line,
      column: loc?.column,
    };
  });
}
