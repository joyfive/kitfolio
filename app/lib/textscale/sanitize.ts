/* ============================================================
   텍스트 확대·간격 검사기: HTML 정제 (기획서 6.1)

   HTML 접근성 검사기(3번 도구)의 pure parser 를 공유하되, 규칙은 분리한다.
   그쪽은 "원본을 그대로 읽어 판정"하고, 여기는 "안전하게 다시 그릴 수 있는
   마크업만 남긴다".

   parse5 로 파싱해 AST 에서 실행·외부 요청·탐색을 만들 수 있는 요소와 속성을
   제거한 뒤 다시 직렬화한다. 브라우저 DOMParser 로 먼저 파싱하면 그 시점에
   img·iframe 리소스 요청이 나갈 수 있어 쓰지 않는다.

   sandbox·CSP·정제 세 겹 중 첫 번째 겹이다. 하나만 믿지 않는다.
   ============================================================ */
import { serialize } from "parse5";
import {
  children,
  isElement,
  isText,
  parseHtml,
  tag,
  type ChildNode,
  type Element,
  type ParentNode,
} from "../a11y/ast";
import { NS_HTML } from "../a11y/ast";
import { IMG_PLACEHOLDER_CLASS, NODE_ID_ATTR } from "./nodeId";
import { LIMITS, type InputKind } from "./types";

/** CSS 의 url() 함수: 인라인 style 에 남은 외부 참조를 지운다 */
const URL_FN = /url\s*\((?:[^()"']*|"[^"]*"|'[^']*')\)/gi;

/** 통째로 제거하는 요소: 실행·외부 로드·문서 기준 변경·탐색을 만들 수 있다.
 *  noscript 는 목록에 없지만 함께 제거한다: 스크립트가 꺼진 preview 에서는
 *  내용이 렌더링되어 운영 화면과 레이아웃이 달라지기 때문이다. */
const DROP_ELEMENTS = new Set([
  "script",
  "iframe",
  "object",
  "embed",
  "portal",
  "base",
  "link",
  "meta",
  "style",
  "noscript",
  "template",
  "audio",
  "video",
  "source",
  "track",
  "canvas",
  "applet",
  "frame",
  "frameset",
]);

/** 외부 요청이나 제출을 만들 수 있는 속성 */
const DROP_ATTRS = new Set([
  "src",
  "srcset",
  "srcdoc",
  "poster",
  "data",
  "action",
  "formaction",
  "background",
  "ping",
  "manifest",
  "codebase",
  "archive",
  "profile",
  "usemap",
  "longdesc",
  "cite",
  "target",
  "download",
  "integrity",
  "crossorigin",
  "nonce",
  "http-equiv",
]);

/** 정제 결과와 사용자에게 알릴 제한 사항 */
export type SanitizeResult = {
  /** iframe srcdoc 의 body 안에 넣을 마크업 */
  html: string;
  /** 검사 대상 요소 수 */
  elementCount: number;
  /** HTML 안에 style 태그가 있었다 (CSS 입력 영역으로 옮기라고 안내) */
  hadStyleTag: boolean;
  /** 외부 리소스를 부르는 속성이나 요소가 있었다 */
  hadExternalResource: boolean;
  /** 이미지가 중립 placeholder 로 바뀌었다 */
  hadImage: boolean;
};

/**
 * 입력이 HTML 인지 일반 텍스트인지 판별한다.
 *
 * 텍스트 안의 `<3` 같은 문자를 HTML 로 오판하지 않도록 실제 tag-name 패턴을
 * 먼저 보고, 파싱 결과에 element 가 생겼는지까지 확인한다.
 */
export function detectInputKind(source: string): InputKind {
  if (!/<[a-zA-Z][a-zA-Z0-9-]*(\s|\/|>)/.test(source)) return "text";
  const ast = parseHtml(source, "fragment");
  return ast.elements.length > 0 ? "html" : "text";
}

/** 일반 텍스트를 안전한 문단 마크업으로 바꾼다.
 *  빈 줄이 문단 경계이고, HTML 특수문자는 escape 해서 태그로 해석되지 않게 한다. */
export function textToParagraphs(source: string): string {
  const blocks = source
    .replace(/\r\n?/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);
  if (!blocks.length) return "";
  return blocks
    .map((b) => `<p>${escapeHtml(b).replace(/\n/g, "<br>")}</p>`)
    .join("\n");
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * 사용자 HTML 을 preview 에서 렌더링해도 안전한 마크업으로 정제한다.
 *
 * @throws 요소 수 상한을 넘으면 호출자가 판정할 수 있도록 elementCount 를 그대로 돌려준다.
 */
export function sanitizeHtml(source: string): SanitizeResult {
  const ast = parseHtml(source, "fragment");
  const root = ast.root;

  let hadStyleTag = false;
  let hadExternalResource = false;
  let hadImage = false;
  let elementCount = 0;
  let nextId = 0;

  (function walk(parent: ParentNode) {
    // 제거하면서 순회하므로 복사본을 돈다
    for (const child of [...children(parent)]) {
      if (!isElement(child)) {
        // 주석은 레이아웃에 영향을 주지 않지만 원본 코드를 그대로 남기므로 지운다
        if (!isText(child)) removeChild(parent, child);
        continue;
      }
      const name = tag(child);

      if (DROP_ELEMENTS.has(name)) {
        if (name === "style") hadStyleTag = true;
        if (name === "link" || name === "iframe" || name === "object" || name === "embed") {
          hadExternalResource = true;
        }
        removeChild(parent, child);
        continue;
      }

      if (scrubAttributes(child)) hadExternalResource = true;
      if (name === "img" || name === "picture") hadImage = true;

      elementCount += 1;
      child.attrs.push({ name: NODE_ID_ATTR, value: `n${nextId++}` });

      if (elementCount > LIMITS.maxElements) return; // 호출자가 한도로 판정한다
      walk(child);
    }
  })(root);

  return {
    html: serialize(root),
    elementCount,
    hadStyleTag,
    hadExternalResource,
    hadImage,
  };
}

function removeChild(parent: ParentNode, child: ChildNode) {
  const list = children(parent);
  const i = list.indexOf(child);
  if (i >= 0) list.splice(i, 1);
}

/** 위험한 속성을 제거하고 외부 리소스 참조가 있었는지 알려준다 */
function scrubAttributes(el: Element): boolean {
  const name = tag(el);
  let hadExternal = false;
  const kept: typeof el.attrs = [];

  const isSvgLike = el.namespaceURI !== NS_HTML;

  for (const a of el.attrs) {
    // parse5 는 네임스페이스 속성을 prefix 로 분리해 준다 (xlink:href 등)
    const key = (a.prefix ? `${a.prefix}:${a.name}` : a.name).toLowerCase();

    // on* 이벤트 핸들러는 CSP·sandbox 와 별개로 마크업에서 지운다
    if (key.startsWith("on")) continue;
    if (DROP_ATTRS.has(key)) {
      if (key === "src" || key === "srcset" || key === "poster" || key === "data") {
        hadExternal = true;
      }
      continue;
    }
    if (key === "href" || key === "xlink:href") {
      // SVG 의 href 는 외부 문서 참조가 될 수 있고 레이아웃에 필요하지도 않다
      if (isSvgLike) {
        if (!a.value.startsWith("#")) hadExternal = true;
        continue;
      }
      // 링크는 구조와 :link 스타일 hook 유지를 위해 남기되 실제 이동은 막는다
      if (!a.value.startsWith("#")) hadExternal = true;
      kept.push({ ...a, value: "#" });
      continue;
    }
    if (key === "style" && URL_FN.test(a.value)) {
      // CSP 가 막지만, CSP 지원 여부와 무관하게 요청이 0건이도록 여기서도 지운다
      hadExternal = true;
      kept.push({ ...a, value: a.value.replace(URL_FN, "none") });
      continue;
    }
    kept.push(a);
  }

  if (name === "img") {
    // alt 를 남기면 src 없는 이미지가 대체 텍스트를 그려 레이아웃이 달라진다.
    // 크기를 유지한 중립 placeholder 로 만들고 원래 값은 내부 속성으로만 보관한다.
    const alt = kept.find((a) => a.name === "alt");
    if (alt) {
      alt.name = "data-kf-alt";
    }
    const cls = kept.find((a) => a.name === "class");
    if (cls) cls.value = `${cls.value} ${IMG_PLACEHOLDER_CLASS}`.trim();
    else kept.push({ name: "class", value: IMG_PLACEHOLDER_CLASS });
  }

  el.attrs = kept;
  return hadExternal;
}

export { IMG_PLACEHOLDER_CLASS, NODE_ID_ATTR };
