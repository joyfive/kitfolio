import type { Metadata } from "next";
import Script from "next/script";
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
    template: "%s — Kitfolio",
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
      </head>
      <body>
        {/* Google AdSense 로더 (모든 페이지 공통) */}
        <Script
          id="adsbygoogle-init"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
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
