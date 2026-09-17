/* ============================================================
   텍스트 확대·간격 검사기: preview 문서(srcdoc) 생성 (기획서 6.2 · 6.3)

   정제 → sandbox → CSP 세 겹 중 세 번째 겹.
   iframe 은 sandbox="allow-same-origin" 만 쓰고, 문서 첫 head 요소로 CSP meta 를
   넣어 스크립트·이미지·폰트·미디어·네트워크·폼 제출을 전부 막는다.
   parent 가 computed style 과 overflow 를 읽어야 하므로 same-origin 만 유지한다.
   ============================================================ */
import type { Viewport } from "./types";

/** preview 문서에 적용하는 CSP.
 *  style-src 는 사용자 CSS 와 parent 가 주입하는 프리셋 override 때문에
 *  'unsafe-inline' 만 허용한다. 나머지는 전부 차단한다.
 *  보고 endpoint 는 설정하지 않는다: 사용자 CSS 의 URL 이 보고 payload 에
 *  실려 나갈 수 있기 때문이다 (기획서 9장). */
export const PREVIEW_CSP = [
  "default-src 'none'",
  "script-src 'none'",
  "style-src 'unsafe-inline'",
  "img-src 'none'",
  "font-src 'none'",
  "media-src 'none'",
  "connect-src 'none'",
  "form-action 'none'",
  "base-uri 'none'",
].join("; ");

/** preview 기본 stylesheet. 사용자 CSS 보다 먼저 넣어 언제나 덮어쓸 수 있게 한다.
 *  외부 웹폰트를 쓰지 않으므로 system fallback 만 지정한다. */
const BASE_CSS = `
html {
  font-family: system-ui, -apple-system, "Segoe UI", "Noto Sans KR", sans-serif;
  font-size: 16px;
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
  color: #21242d;
  background: #ffffff;
}
body { margin: 0; }
/* 이미지는 source 를 제거하고 크기만 유지한 중립 placeholder 로 보여준다 */
.kf-img-placeholder {
  background: repeating-linear-gradient(45deg, #e5eaf6, #e5eaf6 6px, #f2f5ff 6px, #f2f5ff 12px);
  border: 1px solid #d4d9e5;
  min-width: 24px;
  min-height: 24px;
}
`.trim();

/** style 요소 안에서 </style 이 나오면 HTML 토크나이저가 거기서 끊는다.
 *  CSS 에서 \\/ 는 / 의 이스케이프라 의미는 같고 태그로는 읽히지 않는다. */
export function neutralizeStyleEnd(css: string): string {
  return css.replace(/<\/(style)/gi, "<\\/$1");
}

/** 사용자 CSS 에 외부 리소스를 부르는 규칙이 있는가 (안내용) */
export function cssRequestsExternal(css: string): boolean {
  return /@import\b/i.test(css) || /url\s*\(\s*["']?(?:https?:)?\/\//i.test(css);
}

/** @import 규칙 전체 */
const IMPORT_RULE = /@import\s+[^;]*;?/gi;
/** url() 함수. 문서 내부 참조(#id)만 남기고 나머지는 지운다. */
const URL_FN = /url\s*\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/gi;

/**
 * 사용자 CSS 에서 리소스를 부르는 부분을 제거한다.
 *
 * CSP 가 이미 전부 차단하지만(확인: Chromium 이 차단 사유 "csp" 로 실패시킨다),
 * 차단 여부를 브라우저의 CSP 지원에만 기대지 않는다. 요청이 아예 시도되지
 * 않아야 입력한 CSS 의 URL 이 외부로 드러날 여지가 사라진다.
 * SVG filter·gradient 참조처럼 문서 안을 가리키는 url(#id) 는 유지한다.
 */
export function stripCssResources(css: string): string {
  return css.replace(IMPORT_RULE, "").replace(URL_FN, (full, dq, sq, bare) => {
    const target = (dq ?? sq ?? bare ?? "").trim();
    return target.startsWith("#") ? full : "none";
  });
}

export type SrcdocOptions = {
  /** 정제를 마친 body 마크업 */
  body: string;
  /** 사용자 CSS (빈 문자열 허용) */
  css: string;
  /** 프레임워크가 만들어 준 stylesheet (Tailwind 모드의 컴파일 결과).
   *  이 값이 있으면 사용자 CSS 는 이미 그 안에 포함돼 있다. */
  frameworkCss?: string;
  /** 내부 layout viewport (CSS px) */
  viewport: Viewport | number;
  lang: string;
};

/**
 * preview iframe 의 srcdoc 문서를 만든다.
 *
 * viewport 는 iframe **요소의 너비**로 만들고 여기서는 meta viewport 만 맞춘다.
 * 화면 맞춤 배율은 iframe 바깥 wrapper 의 transform 으로만 적용해서
 * 내부 layout·media query·측정값이 배율에 영향을 받지 않게 한다.
 */
export function buildSrcdoc({ body, css, frameworkCss, viewport, lang }: SrcdocOptions): string {
  const generatedCss = frameworkCss ? neutralizeStyleEnd(frameworkCss) : "";
  const userCss = neutralizeStyleEnd(stripCssResources(css));
  return [
    "<!doctype html>",
    `<html lang="${lang === "en" ? "en" : "ko"}">`,
    "<head>",
    `<meta http-equiv="Content-Security-Policy" content="${PREVIEW_CSP}">`,
    '<meta charset="utf-8">',
    `<meta name="viewport" content="width=${viewport}, initial-scale=1">`,
    `<style>${BASE_CSS}</style>`,
    generatedCss ? `<style>${generatedCss}</style>` : "",
    userCss ? `<style>${userCss}</style>` : "",
    "</head>",
    "<body>",
    body,
    "</body>",
    "</html>",
  ]
    .filter(Boolean)
    .join("\n");
}
