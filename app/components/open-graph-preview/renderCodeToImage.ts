// 생성 코드(SVG · 정적 HTML/CSS) → 이미지 변환.
//
// 보안 요구사항:
//  - 정제하지 않은 코드를 dangerouslySetInnerHTML 등에 전달하지 않는다.
//  - <script>, 이벤트 핸들러, iframe/object/embed/form, javascript: URL 제거.
//  - JavaScript는 어떤 경우에도 실행하지 않는다 (DOMPurify 정제 + html-to-image 스냅샷만 사용).
//  - 코드 최대 길이 100KB.
//  - 렌더 완료 후 임시 DOM 제거, 페이지 기존 DOM/스타일과 격리.
import DOMPurify from "dompurify";
import { toPng } from "html-to-image";

export const OUTPUT_WIDTH = 1200;
export const OUTPUT_HEIGHT = 630;
const MAX_CODE_LENGTH = 100 * 1024; // 100KB

export type RenderErrorKind = "unsupported" | "render" | "externalImage";

export type RenderResult =
  | { ok: true; src: string; width: number; height: number }
  | { ok: false; error: RenderErrorKind };

// JavaScript / React / Next.js OG 코드로 보이는 입력은 렌더하지 않고 안내.
const JS_MARKERS =
  /\b(import\s|export\s|require\(|useState|className=|ImageResponse|=>)/;

function isSvg(code: string): boolean {
  return /^\s*<svg[\s>]/i.test(code);
}

const FORBID_TAGS = ["script", "iframe", "object", "embed", "form", "base", "link"];

/** SVG 마크업을 정제하고 width/height(없으면 1200×630)를 보정해 Data URL로 변환 */
function renderSvg(code: string): RenderResult {
  const clean = DOMPurify.sanitize(code, {
    USE_PROFILES: { svg: true, svgFilters: true },
    FORBID_TAGS,
  });
  if (!clean || !/<svg/i.test(clean)) return { ok: false, error: "unsupported" };

  const doc = new DOMParser().parseFromString(clean, "image/svg+xml");
  const svg = doc.querySelector("svg");
  if (!svg || doc.querySelector("parsererror")) {
    return { ok: false, error: "render" };
  }
  if (!svg.getAttribute("width") && !svg.getAttribute("height")) {
    svg.setAttribute("width", String(OUTPUT_WIDTH));
    svg.setAttribute("height", String(OUTPUT_HEIGHT));
    if (!svg.getAttribute("viewBox")) {
      svg.setAttribute("viewBox", `0 0 ${OUTPUT_WIDTH} ${OUTPUT_HEIGHT}`);
    }
  }
  const serialized = new XMLSerializer().serializeToString(svg);
  const src =
    "data:image/svg+xml;charset=utf-8," + encodeURIComponent(serialized);
  return { ok: true, src, width: OUTPUT_WIDTH, height: OUTPUT_HEIGHT };
}

/** 정적 HTML/CSS를 정제 후 격리된 1200×630 컨테이너에 삽입하고 PNG Data URL로 스냅샷 */
async function renderHtml(code: string): Promise<RenderResult> {
  const clean = DOMPurify.sanitize(code, {
    FORBID_TAGS,
    ADD_TAGS: ["style"],
    ALLOWED_ATTR: undefined,
  });
  if (!clean.trim()) return { ok: false, error: "unsupported" };

  // 외부 이미지 포함 여부 — 변환 실패 시 원인 분기에 사용
  const hasExternalImage = /<img[^>]+src=["']https?:/i.test(clean);

  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  Object.assign(host.style, {
    position: "fixed",
    left: "-99999px",
    top: "0",
    width: `${OUTPUT_WIDTH}px`,
    height: `${OUTPUT_HEIGHT}px`,
    overflow: "hidden",
    background: "#ffffff",
    margin: "0",
    padding: "0",
    contain: "strict",
  } as Partial<CSSStyleDeclaration>);
  host.innerHTML = clean;
  document.body.appendChild(host);

  try {
    const src = await toPng(host, {
      width: OUTPUT_WIDTH,
      height: OUTPUT_HEIGHT,
      cacheBust: true,
      backgroundColor: "#ffffff",
      pixelRatio: 1,
    });
    return { ok: true, src, width: OUTPUT_WIDTH, height: OUTPUT_HEIGHT };
  } catch {
    return { ok: false, error: hasExternalImage ? "externalImage" : "render" };
  } finally {
    host.remove();
  }
}

export async function renderCodeToImage(code: string): Promise<RenderResult> {
  const trimmed = code.trim();
  if (!trimmed) return { ok: false, error: "unsupported" };
  if (code.length > MAX_CODE_LENGTH) return { ok: false, error: "unsupported" };

  if (isSvg(trimmed)) return renderSvg(trimmed);

  // SVG가 아니면서 JS/React/TSX 신호가 보이면 미지원 처리
  if (JS_MARKERS.test(trimmed)) return { ok: false, error: "unsupported" };

  return renderHtml(trimmed);
}
