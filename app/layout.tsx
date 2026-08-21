import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { LangProvider } from "./lib/i18n";
import { HUB, SITE } from "./lib/content";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";

const ADSENSE_CLIENT = "ca-pub-7537584957079478";
const GA_ID = "G-BW26VT6W47";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: HUB.seo.ko.title,
    template: "%s | Kitfolio",
  },
  description: HUB.seo.ko.description,
  // 사이트 확인용 메타태그 (AdSense · 네이버 서치어드바이저)
  other: {
    "google-adsense-account": ADSENSE_CLIENT,
    "naver-site-verification": "2674011389c2cf98abc4b445f1edf09e973f6e74",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 모든 라우트의 초기 SSR HTML 은 lang="ko" 로 내려간다 (KO = 기본/x-default).
  // 루트 레이아웃은 서버 컴포넌트라 경로를 알 수 없어 라우트별로 바꿀 수 없다.
  // /en 은 app/en/layout.tsx 의 lang="en" 래퍼와 헤더·푸터 엘리먼트로 서브트리를
  // 표기하고, documentElement.lang 은 hydration 이후 SetHtmlLang 이 보정한다.
  // 루트까지 SSR 로 맞추려면 route group 재구성이 필요하다 (미적용).
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
          rel="stylesheet"
        />
        {/* Google AdSense 로더 (모든 페이지 공통, head 삽입) */}
        <script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
        />
      </head>
      <body>
        {/* 공통 레이아웃: 헤더 / 본문(max 1216px) / 푸터.
            헤더·푸터는 URL에서 언어를 스스로 도출한다. */}
        <SiteHeader />
        <main className="kf-main">
          {/* 루트 = KO. /en 서브트리가 LangProvider lang="en"으로 덮어씀 */}
          <LangProvider lang="ko">{children}</LangProvider>
        </main>
        <SiteFooter />
      </body>
      {/* GA4 (페이지뷰 자동 추적, SPA 라우팅 포함) */}
      <GoogleAnalytics gaId={GA_ID} />
    </html>
  );
}
