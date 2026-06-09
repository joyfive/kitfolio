import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { LangProvider } from "./lib/i18n";
import { HUB, SITE } from "./lib/content";

const ADSENSE_CLIENT = "ca-pub-7537584957079478";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: HUB.title.ko,
    template: "%s — Kitfolio",
  },
  description: HUB.description.ko,
  // AdSense 사이트 확인용 메타태그
  other: { "google-adsense-account": ADSENSE_CLIENT },
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
        {/* 루트 = KO. /en 서브트리가 LangProvider lang="en"으로 덮어씀 */}
        <LangProvider lang="ko">{children}</LangProvider>
      </body>
    </html>
  );
}
