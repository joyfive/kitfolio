/* ============================================================
   텍스트 확대·간격 검사기: JSX·TSX → 정적 HTML 변환

   React 프로젝트의 화면은 HTML 파일로 존재하지 않는다. 확대·리플로 검사를
   하려면 붙여넣은 컴포넌트 코드를 먼저 "레이아웃을 만드는 마크업"으로
   바꿔야 한다.

   원칙:
   - **코드를 실행하지 않는다.** @babel/parser 로 AST 만 만들고 그 트리에서
     마크업을 조립한다. 사용자 코드가 이 페이지에서 평가되는 경로는 없다.
   - 값은 알 수 없으므로 만들어내지 않는다. `{user.name}` 같은 표현식은
     식 자체를 자리표시자 텍스트로 남긴다. 빈칸으로 지우면 확대 검사에서
     가장 중요한 "글자 길이"가 사라지기 때문이다.
   - 여기서 나온 HTML 은 곧바로 preview 로 가지 않는다. 기존 sanitizeHtml 을
     그대로 통과한다: 안전 규칙은 한곳에만 둔다.
   ============================================================ */
import { parse } from "@babel/parser";
import type * as t from "@babel/types";
import { escapeHtml } from "./sanitize";
import { LIST_REPEAT, PreviewError } from "./types";

export { LIST_REPEAT };

/** 자리표시자로 남기는 표현식 텍스트의 최대 길이 */
export const PLACEHOLDER_CHARS = 60;

/** React 전용 prop: 마크업에는 대응하는 속성이 없다 */
const DROP_PROPS = new Set([
  "key",
  "ref",
  "dangerouslySetInnerHTML",
  "suppressHydrationWarning",
  "suppressContentEditableWarning",
]);

/** React prop 이름 → HTML 속성 이름 */
const PROP_TO_ATTR: Record<string, string> = {
  className: "class",
  htmlFor: "for",
  tabIndex: "tabindex",
  readOnly: "readonly",
  maxLength: "maxlength",
  minLength: "minlength",
  colSpan: "colspan",
  rowSpan: "rowspan",
  autoComplete: "autocomplete",
  autoFocus: "autofocus",
  autoPlay: "autoplay",
  spellCheck: "spellcheck",
  contentEditable: "contenteditable",
  dateTime: "datetime",
  noValidate: "novalidate",
  encType: "enctype",
  formAction: "formaction",
  acceptCharset: "accept-charset",
  httpEquiv: "http-equiv",
  crossOrigin: "crossorigin",
  srcSet: "srcset",
  useMap: "usemap",
  cellPadding: "cellpadding",
  cellSpacing: "cellspacing",
  inputMode: "inputmode",
  playsInline: "playsinline",
  allowFullScreen: "allowfullscreen",
  itemProp: "itemprop",
  itemType: "itemtype",
  itemScope: "itemscope",
  // 값이 없는 화면에서도 control 의 폭이 실제와 비슷하도록 초기값을 살린다
  defaultValue: "value",
  defaultChecked: "checked",
};

/** 이름만 보고 host 요소를 짐작할 수 있는 컴포넌트.
 *  control·링크·이미지는 잘림과 최소 크기 판정에 직접 영향을 주므로
 *  div 로 뭉개지 않고 대응하는 요소로 그린다. */
const COMPONENT_TO_TAG: Record<string, string> = {
  button: "button",
  iconbutton: "button",
  link: "a",
  navlink: "a",
  anchor: "a",
  image: "img",
  img: "img",
  avatar: "img",
  input: "input",
  textfield: "input",
  textarea: "textarea",
  select: "select",
  option: "option",
  label: "label",
};

/** 닫는 태그가 없는 요소 */
const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);

/** 숫자를 그대로 쓰는 CSS 속성 (나머지 숫자는 px 로 본다: React 와 같은 규칙) */
const UNITLESS_STYLE = new Set([
  "animationIterationCount",
  "aspectRatio",
  "borderImageOutset",
  "borderImageSlice",
  "borderImageWidth",
  "columnCount",
  "flex",
  "flexGrow",
  "flexShrink",
  "fontWeight",
  "gridArea",
  "gridColumn",
  "gridColumnEnd",
  "gridColumnStart",
  "gridRow",
  "gridRowEnd",
  "gridRowStart",
  "lineClamp",
  "lineHeight",
  "opacity",
  "order",
  "orphans",
  "scale",
  "tabSize",
  "widows",
  "zIndex",
  "zoom",
  "fillOpacity",
  "strokeOpacity",
  "strokeWidth",
]);

/** 변환 과정에서 사용자에게 알려야 하는 손실 */
export type JsxNotes = {
  /** 대체한 컴포넌트: "Button → button" 형태 */
  components: string[];
  /** 자리표시자 텍스트로 바꾼 표현식 수 */
  expressions: number;
  /** 반복 렌더한 목록(map) 수 */
  lists: number;
  /** 값을 알 수 없어 무시한 spread prop 수 */
  spreads: number;
  /** 무시한 React 전용 prop 이름 */
  dropped: string[];
};

export type JsxResult = {
  /** sanitizeHtml 에 그대로 넘길 마크업 */
  html: string;
  notes: JsxNotes;
};

type Ctx = { source: string; notes: JsxNotes; components: Set<string>; dropped: Set<string> };

type JsxRoot = t.JSXElement | t.JSXFragment;

/**
 * JSX·TSX 소스에서 화면을 이루는 마크업을 뽑아낸다.
 *
 * @throws PreviewError "jsx-parse-failed" 파싱 자체가 불가능할 때
 * @throws PreviewError "jsx-no-element" JSX 가 하나도 없을 때
 */
export function jsxToHtml(source: string): JsxResult {
  const { file, text } = parseTolerant(source);
  const root = pickRoot(file);
  if (!root) throw new PreviewError("jsx-no-element");

  const ctx: Ctx = {
    source: text,
    notes: { components: [], expressions: 0, lists: 0, spreads: 0, dropped: [] },
    components: new Set(),
    dropped: new Set(),
  };
  const html = renderNode(root, ctx);
  ctx.notes.components = [...ctx.components].sort();
  ctx.notes.dropped = [...ctx.dropped].sort();
  return { html, notes: ctx.notes };
}

/* ------------------------------------------------------------
   파싱
   ------------------------------------------------------------ */

const PARSE_OPTIONS: Parameters<typeof parse>[1] = {
  sourceType: "module",
  errorRecovery: true,
  allowReturnOutsideFunction: true,
  allowAwaitOutsideFunction: true,
  allowSuperOutsideMethod: true,
  plugins: ["jsx", "typescript", "decorators-legacy"],
};

/**
 * 파일 전체든 잘라 온 조각이든 받아들인다.
 *
 * 붙여넣기는 대개 컴포넌트 파일 전체지만, 에디터에서 return 안쪽만 긁어 온
 * 여러 형제 요소인 경우도 많다. 후자는 module 로는 문법 오류라서 fragment 로
 * 한 번 더 감싸 본다.
 */
function parseTolerant(source: string): { file: t.File; text: string } {
  try {
    return { file: parse(source, PARSE_OPTIONS) as t.File, text: source };
  } catch {
    const wrapped = `<>\n${source}\n</>`;
    try {
      return { file: parse(wrapped, PARSE_OPTIONS) as t.File, text: wrapped };
    } catch {
      throw new PreviewError("jsx-parse-failed");
    }
  }
}

/** 한 파일에 컴포넌트가 여러 개일 수 있다. 화면을 대표하는 JSX 하나를 고른다. */
function pickRoot(file: t.File): JsxRoot | null {
  const roots: { node: JsxRoot; inDefault: boolean; span: number }[] = [];

  (function walk(value: unknown, inDefault: boolean) {
    if (Array.isArray(value)) {
      for (const item of value) walk(item, inDefault);
      return;
    }
    if (!value || typeof value !== "object") return;
    const node = value as t.Node;
    if (typeof node.type !== "string") return;

    if (node.type === "JSXElement" || node.type === "JSXFragment") {
      // 중첩된 JSX 는 바깥 것에 이미 포함돼 있으므로 따로 후보로 두지 않는다
      roots.push({ node, inDefault, span: (node.end ?? 0) - (node.start ?? 0) });
      return;
    }

    const next = inDefault || node.type === "ExportDefaultDeclaration";
    for (const key of Object.keys(node)) {
      if (key === "loc" || key === "extra" || key.endsWith("Comments")) continue;
      walk((node as unknown as Record<string, unknown>)[key], next);
    }
  })(file.program, false);

  if (roots.length === 0) return null;
  const preferred = roots.filter((r) => r.inDefault);
  const pool = preferred.length > 0 ? preferred : roots;
  return pool.reduce((best, r) => (r.span > best.span ? r : best)).node;
}

/* ------------------------------------------------------------
   마크업 조립
   ------------------------------------------------------------ */

function renderNode(node: t.Node, ctx: Ctx): string {
  switch (node.type) {
    case "JSXFragment":
      return renderChildren(node.children, ctx);
    case "JSXElement":
      return renderElement(node, ctx);
    case "JSXText":
      return escapeHtml(collapseJsxText(node.value));
    case "JSXExpressionContainer":
      return renderExpression(node.expression, ctx);
    default:
      return "";
  }
}

function renderChildren(children: readonly t.Node[], ctx: Ctx): string {
  return children.map((child) => renderNode(child, ctx)).join("");
}

function renderElement(node: t.JSXElement, ctx: Ctx): string {
  const name = jsxName(node.openingElement.name);
  const isHost = /^[a-z]/.test(name) && !name.includes(".");
  const attrs = readAttributes(node.openingElement.attributes, ctx);
  const inner = renderChildren(node.children, ctx);

  if (isHost) return wrap(name, attrs, inner);

  // 컴포넌트 본문은 여기 없다. 이름으로 짐작되는 요소가 있으면 그것으로,
  // 없으면 스타일을 걸친 컨테이너로, 그마저 없으면 자식만 남긴다.
  const short = name.split(".").pop() ?? name;
  const mapped = COMPONENT_TO_TAG[short.toLowerCase()];
  const tag = mapped ?? (attrs.has("class") || attrs.has("style") ? "div" : null);
  ctx.components.add(`${name} → ${tag ?? "(생략)"}`);
  if (!tag) return inner;
  attrs.set("data-kf-component", name);
  return wrap(tag, attrs, inner);
}

function wrap(tag: string, attrs: Map<string, string>, inner: string): string {
  const open = `<${tag}${serializeAttrs(attrs)}>`;
  return VOID_TAGS.has(tag) ? open : `${open}${inner}</${tag}>`;
}

function serializeAttrs(attrs: Map<string, string>): string {
  let out = "";
  for (const [name, value] of attrs) {
    if (!/^[A-Za-z_:][-A-Za-z0-9_:.]*$/.test(name)) continue;
    out += value === "" ? ` ${name}` : ` ${name}="${escapeHtml(value)}"`;
  }
  return out;
}

/** JSX 요소 이름을 문자열로 (`Dialog.Title` · `svg:use` 포함) */
function jsxName(name: t.JSXOpeningElement["name"]): string {
  if (name.type === "JSXIdentifier") return name.name;
  if (name.type === "JSXNamespacedName") return `${name.namespace.name}:${name.name.name}`;
  return `${jsxName(name.object)}.${name.property.name}`;
}

/* ------------------------------------------------------------
   속성
   ------------------------------------------------------------ */

function readAttributes(
  attributes: readonly (t.JSXAttribute | t.JSXSpreadAttribute)[],
  ctx: Ctx,
): Map<string, string> {
  const attrs = new Map<string, string>();

  for (const attribute of attributes) {
    if (attribute.type === "JSXSpreadAttribute") {
      // {...props} 의 내용은 호출하는 쪽에 있다: 여기서는 알 수 없다
      ctx.notes.spreads += 1;
      continue;
    }
    const prop = jsxName(attribute.name);
    if (DROP_PROPS.has(prop)) {
      ctx.dropped.add(prop);
      continue;
    }
    // 이벤트 핸들러는 실행하지 않으므로 레이아웃과 무관하다
    if (/^on[A-Z]/.test(prop)) continue;

    if (prop === "className" || prop === "class") {
      const classes = classNamesOf(attribute.value);
      if (classes.length === 0) continue;
      const existing = attrs.get("class");
      attrs.set("class", existing ? `${existing} ${classes.join(" ")}` : classes.join(" "));
      continue;
    }

    const value = attributeValue(prop, attribute.value);
    if (value === null) continue;
    attrs.set(PROP_TO_ATTR[prop] ?? prop.toLowerCase(), value);
  }

  return attrs;
}

/** 값을 정적으로 알 수 없으면 null (= 속성 자체를 만들지 않는다) */
function attributeValue(prop: string, value: t.JSXAttribute["value"]): string | null {
  if (value === null || value === undefined) return ""; // <input disabled>
  if (value.type === "StringLiteral") return value.value;
  if (value.type !== "JSXExpressionContainer") return null;

  const expression = value.expression;
  if (prop === "style" && expression.type === "ObjectExpression") return styleOf(expression);

  switch (expression.type) {
    case "StringLiteral":
      return expression.value;
    case "NumericLiteral":
      return String(expression.value);
    case "UnaryExpression":
      // tabIndex={-1} 처럼 부호가 붙은 숫자
      return expression.argument.type === "NumericLiteral" &&
        (expression.operator === "-" || expression.operator === "+")
        ? `${expression.operator === "-" ? "-" : ""}${expression.argument.value}`
        : null;
    case "BooleanLiteral":
      return expression.value ? "" : null;
    case "TemplateLiteral":
      // 알 수 없는 조각은 비우고 확실한 부분만 남긴다
      return expression.quasis.map((q) => q.value.cooked ?? q.value.raw).join("").trim();
    default:
      return null;
  }
}

/** style={{ maxWidth: 400 }} → "max-width:400px" */
function styleOf(object: t.ObjectExpression): string {
  const parts: string[] = [];
  for (const property of object.properties) {
    if (property.type !== "ObjectProperty" || property.computed) continue;
    const key = property.key;
    const name =
      key.type === "Identifier" ? key.name : key.type === "StringLiteral" ? key.value : null;
    if (!name) continue;

    const raw = property.value;
    let value: string | null = null;
    if (raw.type === "StringLiteral") value = raw.value;
    else if (raw.type === "NumericLiteral") {
      value = UNITLESS_STYLE.has(name) || name.startsWith("--") ? String(raw.value) : `${raw.value}px`;
    } else if (raw.type === "TemplateLiteral" && raw.expressions.length === 0) {
      value = raw.quasis.map((q) => q.value.cooked ?? q.value.raw).join("");
    }
    if (value === null) continue;

    const cssName = name.startsWith("--") ? name : name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
    parts.push(`${cssName}:${value}`);
  }
  return parts.join(";");
}

/**
 * className 표현식에서 클래스 이름을 모은다.
 *
 * cn()·clsx()·twMerge() 처럼 조건부로 클래스를 조립하는 코드가 흔하다.
 * 조건의 값은 알 수 없으므로 "조건이 참인 화면"을 그린다: 확대 검사에서는
 * 내용이 더 많고 더 긴 상태가 문제를 드러내는 쪽이다. 삼항 연산자만
 * 앞 분기를 골라 서로 충돌하는 클래스가 동시에 붙지 않게 한다.
 */
export function classNamesOf(value: t.JSXAttribute["value"]): string[] {
  if (value === null || value === undefined) return [];
  if (value.type === "StringLiteral") return splitClasses(value.value);
  if (value.type !== "JSXExpressionContainer") return [];
  return dedupe(collectClasses(value.expression));
}

function collectClasses(node: t.Node): string[] {
  switch (node.type) {
    case "StringLiteral":
      return splitClasses(node.value);
    case "TemplateLiteral":
      return [
        ...node.quasis.flatMap((q) => splitClasses(q.value.cooked ?? q.value.raw)),
        ...node.expressions.flatMap((e) => collectClasses(e as t.Node)),
      ];
    case "ConditionalExpression":
      return collectClasses(node.consequent);
    case "LogicalExpression":
      return node.operator === "&&"
        ? collectClasses(node.right)
        : [...collectClasses(node.left), ...collectClasses(node.right)];
    case "CallExpression":
      return node.arguments.flatMap((a) => collectClasses(a as t.Node));
    case "ArrayExpression":
      return node.elements.flatMap((e) => (e ? collectClasses(e as t.Node) : []));
    case "ObjectExpression":
      // clsx({ "is-open": open }) 는 키가 클래스 이름이다
      return node.properties.flatMap((p) => {
        if (p.type !== "ObjectProperty" || p.computed) return [];
        if (p.key.type === "StringLiteral") return splitClasses(p.key.value);
        if (p.key.type === "Identifier") return splitClasses(p.key.name);
        return [];
      });
    default:
      return [];
  }
}

function splitClasses(value: string): string[] {
  return value.split(/\s+/).filter(Boolean);
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}

/* ------------------------------------------------------------
   표현식 자식
   ------------------------------------------------------------ */

function renderExpression(expression: t.Expression | t.JSXEmptyExpression, ctx: Ctx): string {
  switch (expression.type) {
    case "JSXEmptyExpression": // {/* 주석 */}
      return "";
    case "JSXElement":
    case "JSXFragment":
      return renderNode(expression, ctx);
    case "StringLiteral":
      return escapeHtml(expression.value);
    case "NumericLiteral":
      return escapeHtml(String(expression.value));
    case "BooleanLiteral":
    case "NullLiteral":
      return "";
    case "TemplateLiteral":
      return renderTemplate(expression, ctx);
    case "ConditionalExpression":
      // 조건은 알 수 없다. JSX 를 그리는 분기를 우선 선택한다.
      return isRenderable(expression.consequent)
        ? renderExpression(expression.consequent, ctx)
        : renderExpression(expression.alternate, ctx);
    case "LogicalExpression":
      return renderExpression(expression.right, ctx);
    case "CallExpression":
      return renderCall(expression, ctx);
    case "ArrayExpression":
      return expression.elements
        .map((e) => (e && e.type !== "SpreadElement" ? renderExpression(e, ctx) : ""))
        .join("");
    default:
      return placeholder(expression, ctx);
  }
}

function renderTemplate(node: t.TemplateLiteral, ctx: Ctx): string {
  let out = "";
  node.quasis.forEach((quasi, i) => {
    out += escapeHtml(quasi.value.cooked ?? quasi.value.raw);
    const expression = node.expressions[i];
    if (expression) out += placeholder(expression as t.Expression, ctx);
  });
  return out;
}

function renderCall(node: t.CallExpression, ctx: Ctx): string {
  const listItem = mapCallbackJsx(node);
  if (!listItem) return placeholder(node, ctx);
  ctx.notes.lists += 1;
  let out = "";
  for (let i = 0; i < LIST_REPEAT; i += 1) out += renderNode(listItem, ctx);
  return out;
}

/** `items.map((item) => <li>...</li>)` 의 반복 단위를 찾는다 */
function mapCallbackJsx(node: t.CallExpression): JsxRoot | null {
  const callee = node.callee;
  if (callee.type !== "MemberExpression" || callee.computed) return null;
  if (callee.property.type !== "Identifier" || callee.property.name !== "map") return null;

  const callback = node.arguments[0];
  if (!callback) return null;
  if (callback.type !== "ArrowFunctionExpression" && callback.type !== "FunctionExpression") {
    return null;
  }

  const body = callback.body;
  if (body.type === "BlockStatement") {
    for (const statement of body.body) {
      if (statement.type === "ReturnStatement" && statement.argument) {
        return unwrapJsx(statement.argument);
      }
    }
    return null;
  }
  return unwrapJsx(body);
}

/** 반환식에서 실제로 그려지는 JSX 를 꺼낸다 (괄호·조건부 포함) */
function unwrapJsx(node: t.Expression): JsxRoot | null {
  if (node.type === "JSXElement" || node.type === "JSXFragment") return node;
  if (node.type === "ConditionalExpression") {
    return unwrapJsx(node.consequent) ?? unwrapJsx(node.alternate);
  }
  if (node.type === "LogicalExpression") return unwrapJsx(node.right);
  return null;
}

function isRenderable(node: t.Expression): boolean {
  return unwrapJsx(node) !== null;
}

/**
 * 값을 알 수 없는 표현식을 식 자체의 텍스트로 남긴다.
 *
 * 빈칸으로 지우면 글자가 사라져 확대·간격 검사가 헐거워진다. 실제 문구
 * 길이와는 다르므로 결과 화면에서 자리표시자였다고 따로 알린다.
 */
function placeholder(node: t.Expression, ctx: Ctx): string {
  const start = node.start ?? 0;
  const end = node.end ?? 0;
  const raw = ctx.source.slice(start, end).replace(/\s+/g, " ").trim();
  if (!raw) return "";
  ctx.notes.expressions += 1;
  const text = raw.length > PLACEHOLDER_CHARS ? `${raw.slice(0, PLACEHOLDER_CHARS)}…` : raw;
  return escapeHtml(text);
}

/**
 * JSX 텍스트의 공백 처리 (React 와 같은 규칙).
 * 줄바꿈이 포함된 앞뒤 공백은 지우고, 남은 줄은 공백 하나로 잇는다.
 */
export function collapseJsxText(raw: string): string {
  const lines = raw.split("\n");
  const kept: string[] = [];
  lines.forEach((line, i) => {
    let text = line;
    if (i !== 0) text = text.replace(/^[ \t\r]+/, "");
    if (i !== lines.length - 1) text = text.replace(/[ \t\r]+$/, "");
    if (text) kept.push(text);
  });
  return kept.join(" ");
}
