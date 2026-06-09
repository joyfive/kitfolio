import type { Metadata } from "next";
import "./globals.css";
import { LangProvider } from "./lib/i18n";

export const metadata: Metadata = {
  metadataBase: new URL("https://kitfolio.app"),
  title: {
    default: "Kitfolio — 개발자·디자이너를 위한 무료 웹 도구",
    template: "%s — Kitfolio",
  },
  description:
    "JSON 포매터, CSS 그라디언트 생성기, 글자 수 카운터 등 브라우저에서 바로 쓰는 무료 웹 도구 모음. 설치 없이, 데이터 전송 없이 클라이언트에서 동작합니다.",
  openGraph: {
    title: "Kitfolio — 개발자·디자이너를 위한 무료 웹 도구",
    description:
      "브라우저에서 바로 쓰는 무료 웹 도구 모음. 설치도 가입도 필요 없고, 모든 처리는 클라이언트에서 끝납니다.",
    siteName: "Kitfolio",
    type: "website",
    locale: "ko_KR",
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
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
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
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
