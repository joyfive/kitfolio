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
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#2d5dc8",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 700,
            }}
          >
            K
          </div>
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
