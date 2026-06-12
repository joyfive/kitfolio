"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { localizedHref } from "../lib/content";
import { LangProvider, routeLang, useT, type Lang } from "../lib/i18n";

/** 전 페이지 공통 푸터 (루트 layout.tsx에서 렌더). 언어는 URL에서 도출. */
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
  const home = localizedHref(lang, "/");

  return (
    <footer className="kf-footer">
      <div className="kf-footer-inner">
        <div className="foot-brand">
          <div className="foot-brandrow">
            <span className="kf-logomark">K</span>
            <b>Kitfolio</b>
          </div>
          <div className="foot-privacy">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 1.5l5 2v3.5c0 3-2.1 5.4-5 6.5-2.9-1.1-5-3.5-5-6.5V3.5z" />
              <path d="M6 8l1.5 1.5L10.5 6.5" />
            </svg>
            <span>{t("common.privacy")}</span>
          </div>
        </div>
        <div className="foot-links">
          <div className="foot-col">
            <span className="foot-h">{t("foot.tools")}</span>
            <Link href={home + "#dev"}>{t("nav.dev")}</Link>
            <Link href={home + "#design"}>{t("nav.design")}</Link>
            <Link href={home + "#text"}>{t("nav.text")}</Link>
          </div>
          <div className="foot-col">
            <span className="foot-h">{t("foot.about")}</span>
            <a href="#">{t("foot.privacy")}</a>
            <a href="#">{t("foot.feedback")}</a>
            <a
              href="https://github.com/joyfive/kitfolio"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
      <div className="foot-bottom">
        <span>© 2026 Kitfolio</span>
        <span className="dotsep" />
        <span>{t("foot.madeby")}</span>
      </div>
    </footer>
  );
}
