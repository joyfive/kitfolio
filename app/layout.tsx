import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "./lib/i18n";
import { HUB, SITE } from "./lib/content";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: HUB.title.ko,
    template: "%s — Kitfolio",
  },
  description: HUB.description.ko,
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
        {/* 루트 = KO. /en 서브트리가 LangProvider lang="en"으로 덮어씀 */}
        <LangProvider lang="ko">{children}</LangProvider>
      </body>
    </html>
  );
}
