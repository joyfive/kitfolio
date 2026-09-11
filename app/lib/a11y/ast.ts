/* ============================================================
   HTML 접근성 검사기: 파서 래퍼 + AST 인덱스

   사용자 HTML 을 **렌더링하지 않는다.** parse5 로 트리만 만들고,
   그 트리를 한 번 순회해 요소 배열·id 인덱스·소스 위치를 구축한다.
   (브라우저 DOMParser 는 img·iframe 리소스를 받아올 수 있어 쓰지 않는다:
    기획서 6.1 참고)

   script·style·template·noscript 내부는 순회에서 제외한다. 컨테이너 요소
   자체는 문서에 존재하므로 세지만, 그 안의 내용은 화면에 노출되는 콘텐츠가
   아니거나(script·style) 활성화 시점에만 나타나므로(template·noscript)
   정적 접근성 판정 대상으로 삼지 않는다.
   ============================================================ */
import { parse, parseFragment } from "parse5";
import type { DefaultTreeAdapterTypes, ParserError } from "parse5";
import { LIMITS, type ParseNote, type Scope } from "./types";

export type Node = DefaultTreeAdapterTypes.Node;
export type Element = DefaultTreeAdapterTypes.Element;
export type ParentNode = DefaultTreeAdapterTypes.ParentNode;
export type ChildNode = DefaultTreeAdapterTypes.ChildNode;

export const NS_HTML = "http://www.w3.org/1999/xhtml";
export const NS_SVG = "http://www.w3.org/2000/svg";

/** 순회에서 내부를 건너뛰는 컨테이너 */
const OPAQUE_TAGS = new Set(["script", "style", "template", "noscript"]);

export function isElement(node: Node): node is Element {
  return "tagName" in node && typeof (node as Element).tagName === "string";
}

export function isText(node: Node): node is DefaultTreeAdapterTypes.TextNode {
  return node.nodeName === "#text";
}

/** 속성값 (없으면 undefined). parse5 는 HTML 네임스페이스 속성명을 소문자로 준다. */
export function attr(el: Element, name: string): string | undefined {
  const found = el.attrs.find((a) => a.name === name);
  return found?.value;
}

export function hasAttr(el: Element, name: string): boolean {
  return el.attrs.some((a) => a.name === name);
}

/** 태그명 소문자 (SVG 는 camelCase 가 보존되므로 비교 전에 내린다) */
export function tag(el: Element): string {
  return el.tagName.toLowerCase();
}

export function isSvg(el: Element): boolean {
  return el.namespaceURI === NS_SVG;
}

export function children(node: Node): ChildNode[] {
  return "childNodes" in node ? ((node as ParentNode).childNodes ?? []) : [];
}

export function parentOf(node: Node): ParentNode | null {
  return "parentNode" in node ? ((node as ChildNode).parentNode ?? null) : null;
}

/** 시작 태그의 소스 위치. 파서가 보완한 요소는 위치가 없다 (= undefined). */
export function locationOf(el: Element): { line: number; column: number } | undefined {
  const loc = el.sourceCodeLocation;
  if (!loc) return undefined;
  const start = loc.startTag ?? loc;
  return { line: start.startLine, column: start.startCol };
}

/** 원본에 실제로 적혀 있던 요소인가 (파서가 암시적으로 만든 html·head·body 구분) */
export function isExplicit(el: Element): boolean {
  return Boolean(el.sourceCodeLocation);
}

/* ---------- 요소 경로 ---------- */

/** CSS 선택자가 아니라 사람이 위치를 찾기 위한 경로: main > form:nth-of-type(1) > input#email
 *
 *  class 는 넣지 않는다. 프로젝트명·상태값이 불필요하게 드러나고 경로만 길어진다. */
export function elementPath(el: Element): string {
  const parts: string[] = [];
  let cur: Element | null = el;
  while (cur) {
    const name = tag(cur);
    if (name === "html" || name === "#document") break;
    const id = attr(cur, "id");
    if (id) {
      parts.unshift(`${name}#${id}`);
      break; // id 는 문서 안에서 유일해야 하므로 위로 더 올라가지 않는다
    }
    const parent: ParentNode | null = parentOf(cur);
    let seg = name;
    if (parent) {
      const sameTag = children(parent).filter(
        (c): c is Element => isElement(c) && tag(c) === name,
      );
      if (sameTag.length > 1) {
        seg = `${name}:nth-of-type(${sameTag.indexOf(cur) + 1})`;
      }
    }
    parts.unshift(seg);
    cur = parent && isElement(parent as Node) ? (parent as Element) : null;
  }
  return parts.join(" > ");
}

/* ---------- 코드 조각 ---------- */

/** 시작 태그를 우선해 소스에서 잘라낸 조각. 반드시 텍스트로만 렌더한다. */
export function snippetOf(el: Element, source: string): string | undefined {
  const loc = el.sourceCodeLocation;
  if (!loc) return undefined;
  const start = loc.startTag ?? loc;
  const raw = source.slice(start.startOffset, start.endOffset).replace(/\s+/g, " ").trim();
  if (!raw) return undefined;
  return raw.length > LIMITS.snippetChars
    ? raw.slice(0, LIMITS.snippetChars - 1) + "…"
    : raw;
}

/* ---------- 텍스트 ---------- */

/** 노출 가능한 descendant 텍스트.
 *  script·style·template·noscript 와 [hidden] · aria-hidden="true" 는 제외한다.
 *  CSS 로 숨긴 텍스트는 알 수 없다 (정적 한계). */
export function visibleText(node: Node): string {
  let out = "";
  (function walk(n: Node, root: boolean) {
    if (isText(n)) {
      out += n.value;
      return;
    }
    if (!isElement(n)) {
      for (const c of children(n)) walk(c, false);
      return;
    }
    if (OPAQUE_TAGS.has(tag(n))) return;
    if (!root && (hasAttr(n, "hidden") || attr(n, "aria-hidden") === "true")) return;
    for (const c of children(n)) walk(c, false);
  })(node, true);
  return normalizeText(out);
}

/** 숨김 여부를 무시하고 읽는 텍스트: aria-labelledby 가 직접 참조한 노드용 */
export function rawText(node: Node): string {
  let out = "";
  (function walk(n: Node) {
    if (isText(n)) {
      out += n.value;
      return;
    }
    if (isElement(n) && OPAQUE_TAGS.has(tag(n))) return;
    for (const c of children(n)) walk(c);
  })(node);
  return normalizeText(out);
}

export function normalizeText(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/* ---------- 파싱 ---------- */

export type Ast = {
  /** 문서 또는 프래그먼트 루트 */
  root: ParentNode;
  /** 순회 순서(DOM 순서)대로의 요소 배열. opaque 컨테이너 내부는 없다. */
  elements: Element[];
  /** id -> 가장 먼저 등장한 요소 */
  byId: Map<string, Element>;
  /** 같은 id 를 쓰는 요소들 (2개 이상인 항목만) */
  duplicateIds: Map<string, Element[]>;
  /** 원본 소스 (코드 조각 슬라이스용) */
  source: string;
  /** HTML 파싱 참고: 접근성 결과와 섞지 않는다 */
  parseNotes: ParseNote[];
};

/**
 * 사용자 HTML 을 파싱해 검사용 인덱스를 만든다.
 *
 * 요소 상한(20,000)을 넘으면 AnalysisError("too-many-elements") 대신 여기서는
 * 개수만 넘겨주고, 판정은 analyze() 가 한다 (에러 문구 단일화).
 */
export function parseHtml(source: string, scope: Scope): Ast {
  const parseNotes: ParseNote[] = [];
  const onParseError = (err: ParserError) => {
    if (parseNotes.length < 50) {
      parseNotes.push({ code: err.code, line: err.startLine, column: err.startCol });
    }
  };
  const options = {
    sourceCodeLocationInfo: true,
    scriptingEnabled: false,
    onParseError,
  } as const;

  const root: ParentNode =
    scope === "document" ? parse(source, options) : parseFragment(source, options);

  const elements: Element[] = [];
  const byId = new Map<string, Element>();
  const idBuckets = new Map<string, Element[]>();

  (function walk(n: Node) {
    for (const child of children(n)) {
      if (!isElement(child)) continue;
      elements.push(child);
      const id = attr(child, "id");
      if (id) {
        if (!byId.has(id)) byId.set(id, child);
        const bucket = idBuckets.get(id);
        if (bucket) bucket.push(child);
        else idBuckets.set(id, [child]);
      }
      if (OPAQUE_TAGS.has(tag(child))) continue; // 컨테이너는 세되 내부는 보지 않는다
      walk(child);
    }
  })(root);

  const duplicateIds = new Map<string, Element[]>();
  for (const [id, list] of idBuckets) {
    if (list.length > 1) duplicateIds.set(id, list);
  }

  return { root, elements, byId, duplicateIds, source, parseNotes };
}

/** 조상 중 조건을 만족하는 첫 요소 */
export function closest(el: Element, test: (e: Element) => boolean): Element | null {
  let cur = parentOf(el);
  while (cur && isElement(cur as Node)) {
    const e = cur as Element;
    if (test(e)) return e;
    cur = parentOf(e);
  }
  return null;
}

/** 조상 중 하나라도 조건을 만족하는가 */
export function hasAncestor(el: Element, test: (e: Element) => boolean): boolean {
  return closest(el, test) !== null;
}

/** el 자신 또는 descendant 중 조건을 만족하는 요소들 (opaque 내부 제외) */
export function findWithin(el: Element, test: (e: Element) => boolean): Element[] {
  const out: Element[] = [];
  (function walk(n: Node) {
    for (const child of children(n)) {
      if (!isElement(child)) continue;
      if (test(child)) out.push(child);
      if (OPAQUE_TAGS.has(tag(child))) continue;
      walk(child);
    }
  })(el);
  return out;
}
