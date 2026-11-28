/* ============================================================
   경력기술서·포트폴리오 문서 글꼴 (문서마다 하나, yml 의 `font` 키)

   Pretendard 는 사이트 전체에 이미 로드된다. 나머지는 고른 문서가 있을 때만
   스타일시트를 붙인다. 출처는 개인정보처리방침 2항에 적힌 웹 폰트 CDN
   (jsDelivr · Google Fonts) 안에서만 고른다: 새 외부 호스트를 늘리지 않는다.
   jsDelivr 경로는 npm 패키지 버전을 고정한다 (패키지 안 CSS 경로·family 이름 확인함).
   ============================================================ */

export type FolioFontId = "pretendard" | "suit" | "nanumsquare" | "nanumgothic";

export type FolioFont = {
  id: FolioFontId;
  /** 화면 표시명 */
  label: { ko: string; en: string };
  /** CSS font-family 이름 (스타일시트의 @font-face 와 같아야 한다) */
  family: string;
  /** 불러올 스타일시트. null 이면 사이트 공통으로 이미 로드됨 */
  css: string | null;
};

export const FOLIO_FONTS: FolioFont[] = [
  { id: "pretendard", label: { ko: "Pretendard", en: "Pretendard" }, family: "Pretendard", css: null },
  {
    id: "suit",
    label: { ko: "SUIT", en: "SUIT" },
    family: "SUIT",
    css: "https://cdn.jsdelivr.net/npm/@sun-typeface/suit@2.0.5/fonts/static/woff2/SUIT.css",
  },
  {
    id: "nanumsquare",
    label: { ko: "나눔스퀘어", en: "NanumSquare" },
    family: "나눔스퀘어",
    css: "https://cdn.jsdelivr.net/npm/@kfonts/nanum-square@0.2.0/index.css",
  },
  {
    id: "nanumgothic",
    label: { ko: "나눔고딕", en: "Nanum Gothic" },
    family: "Nanum Gothic",
    css: "https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap",
  },
];

export const DEFAULT_FONT: FolioFontId = "pretendard";

/** yml 값 → 글꼴. id·표시명·family 이름 모두 받는다 (auto-folio 는 `font: Pretendard`). */
export function resolveFont(v: unknown): FolioFont {
  const key = typeof v === "string" ? v.trim().toLowerCase().replace(/\s+/g, "") : "";
  return (
    FOLIO_FONTS.find(
      (f) =>
        f.id === key ||
        f.family.toLowerCase().replace(/\s+/g, "") === key ||
        f.label.ko.toLowerCase().replace(/\s+/g, "") === key ||
        f.label.en.toLowerCase().replace(/\s+/g, "") === key,
    ) ?? FOLIO_FONTS[0]
  );
}

/** 문서 루트의 --font-base 값 (없는 글자는 Pretendard·시스템 글꼴로 대체) */
export function fontStack(f: FolioFont): string {
  const fallback = "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif";
  return f.id === "pretendard" ? fallback : `'${f.family}', ${fallback}`;
}

/** 브라우저에서 글꼴 스타일시트를 한 번만 붙인다 */
export function ensureFontLoaded(f: FolioFont): void {
  if (typeof document === "undefined" || !f.css) return;
  const id = `kf-folio-font-${f.id}`;
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = f.css;
  document.head.appendChild(link);
}
