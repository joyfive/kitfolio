"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localizedHref } from "../lib/content";
import { LangProvider, routeLang, useT, type Lang } from "../lib/i18n";
import { LogoMark } from "./Logo";

const FEEDBACK_EMAIL = "joy_five@kakao.com";
const GITHUB_URL = "https://github.com/joyfive/kitfolio";

/** 전 페이지 공통 푸터 (루트 layout.tsx에서 렌더). 언어는 URL에서 도출.
 *  Header = Brand / Footer = 태그라인 + 외부 링크.
 *
 *  ⚠️ 쿠팡 파트너스 배너(CoupangBanner)는 전역 렌더에서 제거된 상태다.
 *  AdSense 사이트 심사 중에는 콘텐츠 가치 평가와 무관한 제휴 배너를 전 페이지에
 *  노출하지 않는다. 컴포넌트 파일은 승인 이후 선택적으로 재사용하기 위해 남겨 둔다. */
export default function SiteFooter() {
  const pathname = usePathname() || "/";
  const lang = routeLang(pathname);
  return (
    <LangProvider lang={lang}>
      <FooterInner lang={lang} />
    </LangProvider>
  );
}

function FooterInner({ lang }: { lang: Lang }) {
  const t = useT();

  return (
    <footer className="kf-footer">
      <div className="kf-footer-inner">
        {/* 상단: 브랜드 */}
        <div className="foot-brandrow">
          <LogoMark title="Kitfolio" />
          <b>Kitfolio</b>
        </div>

        {/* 1행: 태그라인 */}
        <div className="foot-row foot-row--top">
          <p className="foot-tagline">
            Small tools for modern knowledge workers
          </p>
        </div>

        {/* 2행: 카피라이트(좌) ↔ 외부 링크(우) */}
        <div className="foot-row">
          <p className="foot-copy">© 2026 Kitfolio. All rights reserved.</p>
          <nav className="foot-ext" aria-label="Links">
            <Link href={localizedHref(lang, "/blog")}>
              {lang === "ko" ? "블로그" : "Blog"}
            </Link>
            <Link href={localizedHref(lang, "/about")}>
              {t("foot.about")}
            </Link>
            <Link href={localizedHref(lang, "/contact")}>
              {t("foot.contact")}
            </Link>
            <Link href={localizedHref(lang, "/privacy-policy")}>
              {t("foot.privacy")}
            </Link>
            <Link href={localizedHref(lang, "/terms-of-service")}>
              {t("foot.terms")}
            </Link>
            <a href={`mailto:${FEEDBACK_EMAIL}`}>{t("foot.feedback")}</a>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
