import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // 동일 수식 계산기 통합: 변화율/증가율/감소율 · MoM/YoY/QoQ/WoW →
    // 성장률 계산기(growth-rate-calculator) 한 페이지로 병합. 구 URL은 영구 리다이렉트.
    const mergedIntoGrowthRate = [
      "percentage-change-calculator",
      "percentage-increase-calculator",
      "percentage-decrease-calculator",
      "mom-growth-calculator",
      "yoy-growth-calculator",
      "qoq-growth-calculator",
      "wow-growth-calculator",
    ];
    const growthRedirects = mergedIntoGrowthRate.flatMap((slug) => [
      { source: `/${slug}`, destination: "/growth-rate-calculator", permanent: true },
      { source: `/en/${slug}`, destination: "/en/growth-rate-calculator", permanent: true },
    ]);

    // 복리 성장 ≡ 성장 예측(동일 수식) → 복리 성장 계산기로 병합.
    const projectionRedirects = [
      { source: "/growth-projection-calculator", destination: "/compound-growth-calculator", permanent: true },
      { source: "/en/growth-projection-calculator", destination: "/en/compound-growth-calculator", permanent: true },
    ];

    // 2026-09 URL 통합: CSS 단위 변환기 5종 → css-unit-converter 한 페이지(?mode=)로 병합.
    const cssUnitModes: Record<string, string> = {
      "rem-to-px": "rem-px",
      "em-to-px": "em-px",
      "vw-to-px": "vw-px",
      "percent-to-px": "percent-px",
      "ms-to-s": "ms-s",
    };
    const cssUnitRedirects = Object.entries(cssUnitModes).flatMap(([slug, mode]) => [
      { source: `/${slug}`, destination: `/css-unit-converter?mode=${mode}`, permanent: true },
      { source: `/en/${slug}`, destination: `/en/css-unit-converter?mode=${mode}`, permanent: true },
    ]);

    return [
      // 구 2뎁스 URL → 플랫 URL (제품 방향: 모든 도구는 1뎁스 라우트)
      {
        source: "/tools/slack-timestamp-converter",
        destination: "/slack-timestamp-converter",
        permanent: true,
      },
      {
        source: "/en/tools/slack-timestamp-converter",
        destination: "/en/slack-timestamp-converter",
        permanent: true,
      },
      ...growthRedirects,
      ...projectionRedirects,
      ...cssUnitRedirects,
    ];
  },
};

export default nextConfig;
