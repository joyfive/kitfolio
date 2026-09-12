/* ============================================================
   HTML 접근성 검사기: 검사 규칙 (기획서 5장)

   판정 단계
     issue  오류 가능성 높음 · 필수 속성 누락, 끊어진 참조, 이름 없는 native control
     review 검토 필요       · 목적·문맥·CSS·저자 의도를 알아야 최종 판단 가능
     manual 수동 검사       · 실제 렌더링·상호작용 없이는 확인 불가 (고정 목록)

   issue 도 페이지 전체의 WCAG 불합격 선언이 아니다. 해당 마크업에서
   수정 가능성이 높은 구체적 위치를 뜻한다.

   각 규칙은 AST 인덱스를 입력으로 받는 순수 함수에 가깝게 유지한다.
   ============================================================ */
import {
  attr,
  children,
  closest,
  elementPath,
  findWithin,
  hasAncestor,
  hasAttr,
  isElement,
  isExplicit,
  isSvg,
  locationOf,
  normalizeText,
  snippetOf,
  tag,
  visibleText,
  type Ast,
  type Element,
} from "./ast";
import {
  explicitRole,
  idRefs,
  inputType,
  isLabelable,
  labelledByTargets,
  nameSignal,
  visibleLabelText,
  type NameContext,
} from "./name";
import {
  collectHeadings,
  collectLandmarks,
  isExposed,
  type HeadingInfo,
  type LandmarkInfo,
} from "./structure";
import { isFocusable, isInTabSequence, isNativelyFocusable, tabIndexOf } from "./focus";
import { MANUAL_CHECKS, RULES, type RuleId, type RuleMeta } from "./catalog";
import type { Finding, Scope } from "./types";

/* ---------- Finding 생성 ---------- */

/** 같은 규칙 안에서 이유·수정 문구가 갈리는 경우(variant)만 키에 접미사를 붙인다. */
function at(
  ruleId: RuleId,
  el: Element | null,
  ast: Ast,
  vars?: Record<string, string>,
  variant?: string,
): Finding {
  const meta = RULES[ruleId] as RuleMeta;
  const loc = el ? locationOf(el) : undefined;
  const suffix = variant ? `.${variant}` : "";
  return {
    ruleId,
    level: meta.level,
    category: meta.category,
    wcag: [...meta.wcag],
    titleKey: `a11y.rule.${ruleId}.title`,
    reasonKey: `a11y.rule.${ruleId}.reason${suffix}`,
    fixKey: `a11y.rule.${ruleId}.fix${suffix}`,
    ...(vars ? { vars } : {}),
    line: loc?.line,
    column: loc?.column,
    elementPath: el ? elementPath(el) : undefined,
    snippet: el ? snippetOf(el, ast.source) : undefined,
  };
}

/* ---------- 공통 술어 ---------- */

/** aria-hidden="true" 로 접근성 트리에서 저자가 의도적으로 제거한 영역인가.
 *  이름 관련 규칙은 이 안을 검사하지 않는다 (의도된 제거이므로).
 *  [hidden] 은 토글로 다시 노출되는 경우가 많아 검사 대상에 남긴다. */
function inAriaHiddenSubtree(el: Element): boolean {
  if (attr(el, "aria-hidden") === "true") return true;
  return hasAncestor(el, (e) => attr(e, "aria-hidden") === "true");
}

const PRESENTATIONAL = new Set(["presentation", "none"]);

/** 이름이 필요 없다고 저자가 명시한 요소 */
function isPresentational(el: Element): boolean {
  const role = explicitRole(el);
  return role !== null && PRESENTATIONAL.has(role);
}

/** 이름 신호가 없는가 */
function unnamed(el: Element, ctx: NameContext): boolean {
  return nameSignal(el, ctx).name === "";
}

/** FORM-001 에서 제외하는 input 유형 (버튼 계열은 value·alt 규칙으로 따로 본다) */
const NON_TEXTUAL_INPUTS = new Set(["hidden", "button", "submit", "reset", "image"]);

const NATIVE_INTERACTIVE = new Set(["button", "select", "textarea", "summary"]);

function isNativeInteractive(el: Element): boolean {
  if (isSvg(el)) return false;
  const t = tag(el);
  if (NATIVE_INTERACTIVE.has(t)) return true;
  if (t === "a" || t === "area") return hasAttr(el, "href");
  if (t === "input") return inputType(el) !== "hidden";
  return false;
}

/** 명시적으로 상호작용 역할을 선언한 요소 (NAME-004) */
const INTERACTIVE_ROLES = new Set([
  "button",
  "checkbox",
  "combobox",
  "link",
  "menuitem",
  "menuitemcheckbox",
  "menuitemradio",
  "option",
  "radio",
  "searchbox",
  "slider",
  "spinbutton",
  "switch",
  "tab",
  "textbox",
  "treeitem",
]);

/** ARIA IDREF 속성: 값이 가리키는 요소가 문서에 있어야 한다 */
const IDREF_ATTRS = [
  "aria-labelledby",
  "aria-describedby",
  "aria-controls",
  "aria-owns",
  "aria-errormessage",
  "aria-activedescendant",
] as const;

/* ---------- 규칙 실행 ---------- */

export type RuleInput = {
  ast: Ast;
  ctx: NameContext;
  scope: Scope;
  headings: HeadingInfo[];
  landmarks: LandmarkInfo[];
};

export function evaluate(input: RuleInput): Finding[] {
  const findings: Finding[] = [];
  documentRules(input, findings);
  headingRules(input, findings);
  landmarkRules(input, findings);
  formRules(input, findings);
  nameRules(input, findings);
  imageRules(input, findings);
  ariaRules(input, findings);
  focusRules(input, findings);
  return findings;
}

/* 5.2 문서 규칙 */
function documentRules({ ast, scope }: RuleInput, out: Finding[]) {
  if (scope === "document") {
    // HTML5 는 html·head·body 태그를 생략할 수 있다. 파서가 보완한 <html> 을
    // 근거로 lang 누락을 판정하면 조각 입력에 오탐이 생긴다.
    const html = ast.elements.find((e) => tag(e) === "html" && isExplicit(e));
    if (!html) {
      out.push(at("DOC-005", null, ast));
    } else {
      const lang = attr(html, "lang");
      if (lang === undefined || lang.trim() === "") {
        out.push(at("DOC-001", html, ast));
      } else if (!isCanonicalLocale(lang.trim())) {
        out.push(at("DOC-002", html, ast, { lang: lang.trim() }));
      }
    }

    const title = ast.elements.find((e) => tag(e) === "title" && !isSvg(e));
    if (!title || visibleText(title) === "") {
      out.push(at("DOC-003", title ?? null, ast));
    }
  }

  for (const [id, list] of ast.duplicateIds) {
    // 첫 번째는 원본으로 두고, 두 번째부터 수정 위치로 표시한다
    for (const el of list.slice(1)) {
      out.push(at("DOC-004", el, ast, { id, count: String(list.length) }));
    }
  }
}

function isCanonicalLocale(value: string): boolean {
  try {
    return Intl.getCanonicalLocales(value).length > 0;
  } catch {
    return false;
  }
}

/* 5.3 헤딩 규칙 */
function headingRules({ ast, scope, headings }: RuleInput, out: Finding[]) {
  let previous: number | null = null;
  for (const h of headings) {
    if (h.level === null) {
      out.push(at("HEAD-005", h.el, ast));
      continue;
    }
    if (!h.aria && h.name === "" && !inAriaHiddenSubtree(h.el)) {
      out.push(at("HEAD-001", h.el, ast, { level: `h${h.level}` }));
    }
    // 아래 단계로 두 칸 이상 내려갈 때만. 위로 돌아가는 것은 섹션 종료일 수 있다.
    if (previous !== null && h.level > previous + 1) {
      out.push(
        at("HEAD-002", h.el, ast, { from: `h${previous}`, to: `h${h.level}` }),
      );
    }
    previous = h.level;
  }

  if (scope !== "document") return;
  const h1s = headings.filter((h) => h.level === 1 && !inAriaHiddenSubtree(h.el));
  if (h1s.length === 0) out.push(at("HEAD-003", null, ast));
  else if (h1s.length > 1) {
    for (const h of h1s.slice(1)) {
      out.push(at("HEAD-004", h.el, ast, { count: String(h1s.length) }));
    }
  }
}

/* 5.4 랜드마크 규칙 */
function landmarkRules({ ast, scope, landmarks }: RuleInput, out: Finding[]) {
  const exposed = landmarks.filter((l) => isExposed(l.el));

  if (scope === "document") {
    const mains = exposed.filter((l) => l.role === "main");
    if (mains.length === 0) out.push(at("LAND-001", null, ast));
    else if (mains.length > 1) {
      for (const l of mains.slice(1)) {
        out.push(at("LAND-002", l.el, ast, { count: String(mains.length) }));
      }
    }
  }

  // 같은 역할이 여러 개인데 이름이 없거나 이름이 겹치면 구분할 수 없다.
  // 역할이 불확실한 header·footer 는 판정에서 뺀다.
  for (const role of ["navigation", "complementary", "form", "region"] as const) {
    const group = exposed.filter((l) => l.role === role && !l.ambiguous);
    if (group.length < 2) continue;
    const counts = new Map<string, number>();
    for (const l of group) counts.set(l.name, (counts.get(l.name) ?? 0) + 1);
    for (const l of group) {
      if (l.name === "" || (counts.get(l.name) ?? 0) > 1) {
        out.push(at("LAND-003", l.el, ast, { role, count: String(group.length) }));
      }
    }
  }

  for (const l of landmarks) {
    if (l.implicit) continue;
    if (l.role !== "region" && l.role !== "form") continue;
    if (l.name === "") out.push(at("LAND-004", l.el, ast, { role: l.role }));
  }
}

/* 5.5 폼 규칙 */
function formRules({ ast, ctx }: RuleInput, out: Finding[]) {
  for (const el of ast.elements) {
    const t = tag(el);

    if (t === "label" && !isSvg(el)) {
      const forId = attr(el, "for");
      if (forId !== undefined && forId.trim() !== "") {
        const target = ast.byId.get(forId);
        if (!target) out.push(at("FORM-002", el, ast, { for: forId }, "missing"));
        else if (!isLabelable(target)) {
          out.push(at("FORM-002", el, ast, { for: forId, tag: tag(target) }, "notLabelable"));
        }
      }
      continue;
    }

    if (t !== "input" && t !== "select" && t !== "textarea") continue;
    if (isSvg(el) || inAriaHiddenSubtree(el)) continue;
    if (t === "input" && NON_TEXTUAL_INPUTS.has(inputType(el))) continue;
    if (isPresentational(el)) continue;

    if (unnamed(el, ctx)) {
      const placeholder = normalizeText(attr(el, "placeholder") ?? "");
      // placeholder 는 입력을 시작하면 사라져 이름 신호로 계산하지 않는다.
      // 다만 저자가 레이블 의도로 쓴 흔적이므로 FORM-001 대신 FORM-003 으로 분리한다.
      if (placeholder) out.push(at("FORM-003", el, ast, { placeholder }));
      else out.push(at("FORM-001", el, ast, { tag: t }));
    }
  }

  // 같은 name 을 공유하는 radio·checkbox 는 공통 fieldset·legend 로 묶어야
  // 그룹 전체의 질문이 전달된다.
  const groups = new Map<string, Element[]>();
  for (const el of ast.elements) {
    if (tag(el) !== "input" || isSvg(el)) continue;
    const type = inputType(el);
    if (type !== "radio" && type !== "checkbox") continue;
    const name = attr(el, "name");
    if (!name) continue;
    const key = `${type}:${name}`;
    const list = groups.get(key);
    if (list) list.push(el);
    else groups.set(key, [el]);
  }
  for (const [key, members] of groups) {
    if (members.length < 2) continue;
    const fieldsets = members.map((m) =>
      closest(m, (e) => tag(e) === "fieldset" && hasLegend(e)),
    );
    const shared = fieldsets[0];
    if (shared && fieldsets.every((f) => f === shared)) continue;
    out.push(
      at("FORM-004", members[0], ast, {
        name: key.slice(key.indexOf(":") + 1),
        count: String(members.length),
      }),
    );
  }
}

function hasLegend(fieldset: Element): boolean {
  return children(fieldset).some((c) => isElement(c) && tag(c) === "legend");
}

/* 5.5 이름 규칙 */
function nameRules({ ast, ctx }: RuleInput, out: Finding[]) {
  for (const el of ast.elements) {
    if (isSvg(el) || inAriaHiddenSubtree(el) || isPresentational(el)) continue;
    const t = tag(el);

    if (t === "input" && inputType(el) === "image" && unnamed(el, ctx)) {
      out.push(at("NAME-003", el, ast));
    }

    const isNativeNamed = t === "button" || t === "summary" || (t === "a" && hasAttr(el, "href"));
    if (isNativeNamed && unnamed(el, ctx) && !isImageOnlyLink(el, ctx)) {
      out.push(at("NAME-001", el, ast, { tag: t }));
    }

    const role = explicitRole(el);
    if (role && INTERACTIVE_ROLES.has(role) && !isNativeInteractive(el) && unnamed(el, ctx)) {
      out.push(at("NAME-004", el, ast, { role, tag: t }));
    }

    // 2.5.3 Label in Name: 보이는 문구가 명시적 이름 안에 들어 있어야
    // 음성 입력 사용자가 화면에 보이는 말로 컨트롤을 부를 수 있다.
    const hasExplicitName =
      normalizeText(attr(el, "aria-label") ?? "") !== "" ||
      labelledByTargets(el, ctx).length > 0;
    if (!hasExplicitName) continue;
    if (!isNativeInteractive(el) && !(role && INTERACTIVE_ROLES.has(role))) continue;
    const visible = visibleLabelText(el, ctx);
    if (!visible) continue;
    const accName = nameSignal(el, ctx).name;
    if (!labelInName(visible, accName)) {
      out.push(at("NAME-002", el, ast, { visible, name: accName }));
    }
  }
}

/** 링크 안에 이미지만 있고 텍스트가 없는가 */
function isImageOnlyLink(el: Element, ctx: NameContext): boolean {
  if (tag(el) !== "a" || !hasAttr(el, "href")) return false;
  if (visibleText(el) !== "") return false;
  return findWithin(el, (e) => tag(e) === "img" || tag(e) === "svg" || explicitRole(e) === "img")
    .some((img) => !ctx.hidden.has(img));
}

/** 비교 전 정규화: 소문자 + 공백 정리 + 장식용 문장부호 제거 */
function labelInName(visible: string, accName: string): boolean {
  const clean = (s: string) =>
    s
      .toLowerCase()
      .replace(/[.,:;!?'"()[\]{}·…]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const v = clean(visible);
  if (!v) return true;
  return clean(accName).includes(v);
}

/* 5.7 이미지 규칙 */
const IMAGE_FILE_EXT = /\.(png|jpe?g|gif|webp|svg)$/i;
const IMAGE_PATHISH = /^(https?:\/\/|\/|\.{1,2}\/)/i;
const GENERIC_ALT = new Set([
  "이미지",
  "사진",
  "그림",
  "image",
  "photo",
  "picture",
  "graphic",
]);

export function looksLikeFilenameAlt(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (IMAGE_FILE_EXT.test(v)) return true;
  if (IMAGE_PATHISH.test(v)) return true;
  // 값 전체가 일반 단어 하나일 때만. 긴 설명 안에 포함됐다는 이유로는 경고하지 않는다.
  return GENERIC_ALT.has(v.toLowerCase());
}

function imageRules({ ast, ctx }: RuleInput, out: Finding[]) {
  for (const el of ast.elements) {
    if (inAriaHiddenSubtree(el)) continue;
    const t = tag(el);
    const role = explicitRole(el);

    if (t === "img" && !isSvg(el)) {
      const alt = attr(el, "alt");
      if (alt === undefined) {
        const named = nameSignal(el, ctx).name !== "";
        if (!named && !isPresentational(el)) out.push(at("IMG-001", el, ast));
      } else if (alt.trim() === "") {
        out.push(at("IMG-002", el, ast));
      } else if (looksLikeFilenameAlt(alt)) {
        out.push(at("IMG-003", el, ast, { alt: alt.trim() }));
      }
    }

    if (isImageOnlyLink(el, ctx) && unnamed(el, ctx)) {
      out.push(at("IMG-004", el, ast));
    }

    const isRoleImg = role === "img" || (isSvg(el) && tag(el) === "svg" && role === "img");
    if (isRoleImg && unnamed(el, ctx)) {
      out.push(at("IMG-005", el, ast, { tag: t }));
    }
  }
}

/* 5.8 ARIA 참조 규칙 */
function ariaRules({ ast, ctx }: RuleInput, out: Finding[]) {
  for (const el of ast.elements) {
    for (const name of IDREF_ATTRS) {
      const raw = attr(el, name);
      if (raw === undefined) continue;
      const ids = idRefs(raw);
      if (!ids.length) continue;
      const missing = ids.filter((id) => !ast.byId.has(id));
      if (missing.length) {
        out.push(at("ARIA-001", el, ast, { attr: name, ids: missing.join(", ") }));
      }
    }

    if (attr(el, "aria-hidden") === "true") {
      const focusable = [el, ...findWithin(el, () => true)].filter((e) => isFocusable(e));
      if (focusable.length) {
        out.push(at("ARIA-002", el, ast, { count: String(focusable.length) }));
      }
    }

    const ownId = attr(el, "id");
    const refs = idRefs(attr(el, "aria-labelledby") ?? "");
    if (!refs.length) continue;
    if (ownId && refs.includes(ownId)) {
      out.push(at("ARIA-003", el, ast, undefined, "self"));
      continue;
    }
    // 서로를 가리키는 2단계 순환
    for (const id of refs) {
      const target = ast.byId.get(id);
      if (!target || !ownId) continue;
      if (idRefs(attr(target, "aria-labelledby") ?? "").includes(ownId)) {
        out.push(at("ARIA-003", el, ast, undefined, "cycle"));
        break;
      }
    }
  }

  // aria-labelledby 가 숨은 노드를 직접 참조하면 표준 계산의 예외가 복잡해
  // 확정 판정 대신 검토로 남긴다.
  for (const el of ast.elements) {
    if (!attr(el, "aria-labelledby")) continue;
    const signal = nameSignal(el, ctx);
    if (signal.hiddenRef) {
      out.push(at("ARIA-003", el, ast, undefined, "hidden"));
    }
  }
}

/* 5.9 키보드·포커스 규칙 */
const KEYBOARD_ATTRS = ["onkeydown", "onkeyup", "onkeypress"];

function focusRules({ ast }: RuleInput, out: Finding[]) {
  for (const el of ast.elements) {
    const ti = tabIndexOf(el);
    if (ti.kind === "invalid") {
      out.push(at("FOCUS-002", el, ast, { value: ti.raw }));
    } else if (ti.kind === "valid") {
      if (ti.value > 0) {
        out.push(at("FOCUS-001", el, ast, { value: String(ti.value) }));
      } else if (ti.value < 0 && isNativeInteractive(el)) {
        out.push(at("FOCUS-004", el, ast, { tag: tag(el), value: String(ti.value) }));
      }
    }

    if (!hasAttr(el, "onclick")) continue;
    if (isNativeInteractive(el) || isInTabSequence(el)) continue;
    if (KEYBOARD_ATTRS.some((a) => hasAttr(el, a))) continue;
    out.push(at("FOCUS-003", el, ast, { tag: tag(el) }));
  }
}

/* 헤딩·랜드마크 수집을 규칙 실행과 함께 쓰기 위한 재수출 */
export { collectHeadings, collectLandmarks };

/* 카탈로그 재수출: 검사 엔진 쪽에서 한 곳만 import 하면 되게 한다 */
export { MANUAL_CHECKS, RULES, type RuleId, type RuleMeta };
