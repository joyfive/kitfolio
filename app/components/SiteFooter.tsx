"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TARGET_LABELS, localizedHref, type TargetTag } from "../lib/content";
import { LangProvider, routeLang, useT, type Lang } from "../lib/i18n";

const FEEDBACK_EMAIL = "joy_five@kakao.com";
const GITHUB_URL = "https://github.com/joyfive/kitfolio";

const TARGET_ORDER: TargetTag[] = [
  "pm",
  "designer",
  "developer",
  "job-seeker",
  "office-worker",
  "small-business-owner",
];

/** 전 페이지 공통 푸터 (루트 layout.tsx에서 렌더). 언어는 URL에서 도출.
 *  Header = Brand / Footer = 태그라인 + 타겟 리스트 + 외부 링크. */
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
        {/* 상단: 브랜드 */}
        <div className="foot-brandrow">
          <span className="kf-logomark">K</span>
          <b>Kitfolio</b>
        </div>

        {/* 1행: 태그라인(좌) ↔ 타겟별 서비스 리스트(우) */}
        <div className="foot-row">
          <p className="foot-tagline">
            Small tools for modern knowledge workers
          </p>
          <nav className="foot-targets" aria-label="By role">
            {TARGET_ORDER.map((tag) => (
              <Link key={tag} href={`${home}?target=${tag}`}>
                {TARGET_LABELS[tag][lang]}
              </Link>
            ))}
          </nav>
        </div>

        {/* 2행: 카피라이트(좌) ↔ 외부 링크(우) */}
        <div className="foot-row">
          <p className="foot-copy">© 2026 Kitfolio. All rights reserved.</p>
          <nav className="foot-ext" aria-label="Links">
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
