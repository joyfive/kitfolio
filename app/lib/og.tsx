import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { HUB, OG_BADGE, SITE, getTool, type Lang } from "./content";

/* ============================================================
   동적 OG 이미지 (1200×630) — 레지스트리의 og.title / og.subtitle 소비.
   각 라우트의 opengraph-image.tsx 가 toolOgImage()/hubOgImage() 호출.
   폰트는 빌드 시 로컬 파일에서 로드 (한글 글리프 필요 → Noto Sans KR).
   ============================================================ */

export const OG_SIZE = { width: 1200, height: 630 };

/* 브랜드 심볼 (app/icon.svg 와 동일) — Satori 는 SVG 데이터 URI 이미지를 렌더 */
const LOGO_SVG =
  '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M1 7V1H2.76471V3.15858H3.58824L5.02353 1H6.92941L5.14118 3.78698L7 7H5.07059L3.6 4.55385H2.76471V7H1Z" fill="#50535E"/>' +
  '<rect x="1" y="9" width="6" height="6" rx="1" fill="#D4D9E5"/>' +
  '<rect x="9" y="9" width="6" height="6" rx="1" fill="#9B9FAB"/>' +
  '<rect x="9" y="1" width="6" height="6" rx="1" fill="#737782"/></svg>';
const LOGO_DATA_URI =
  "data:image/svg+xml;base64," + Buffer.from(LOGO_SVG).toString("base64");

let fontsPromise: Promise<{ bold: Buffer; medium: Buffer }> | null = null;
function loadFonts() {
  const dir = join(process.cwd(), "app", "lib", "fonts");
  fontsPromise ??= Promise.all([
    readFile(join(dir, "NotoSansKR-Bold.ttf")),
    readFile(join(dir, "NotoSansKR-Medium.ttf")),
  ]).then(([bold, medium]) => ({ bold, medium }));
  return fontsPromise;
}

async function renderOg(title: string, subtitle: string, badge: string) {
  const { bold, medium } = await loadFonts();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#F2F5FF",
          fontFamily: "NotoSansKR",
        }}
      >
        {/* 브랜드 */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_DATA_URI} width={56} height={56} alt="" />
          <div style={{ fontSize: 34, fontWeight: 700, color: "#434650" }}>
            {SITE.name}
          </div>
        </div>

        {/* 타이틀 / 서브타이틀 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 68,
              fontWeight: 700,
              color: "#21242D",
              letterSpacing: "-2px",
              lineHeight: 1.15,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 31,
                fontWeight: 500,
                color: "#737782",
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: 24, fontWeight: 500, color: "#9B9FAB" }}>
            kitfolio.app
          </div>
          <div
            style={{
              display: "flex",
              padding: "10px 22px",
              borderRadius: 999,
              background: "#e3e7fc",
              color: "#2d5dc8",
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            {badge}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "NotoSansKR", data: bold, weight: 700, style: "normal" },
        { name: "NotoSansKR", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}

/** 도구 페이지 OG 이미지 */
export function toolOgImage(slug: string, lang: Lang) {
  const t = getTool(slug);
  const og = t.og?.[lang];
  return renderOg(
    og?.title ?? t.seo[lang].title ?? t.name.en,
    og?.subtitle ?? "",
    OG_BADGE[lang],
  );
}

/** 허브 OG 이미지 */
export function hubOgImage(lang: Lang) {
  return renderOg(SITE.name, HUB.seo[lang].title, OG_BADGE[lang]);
}
