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

const PRIVACY: Record<Lang, [string, string]> = {
  ko: [
    "모든 처리는 브라우저 안에서 이루어집니다.",
    "어떤 데이터도 서버로 전송되지 않습니다.",
  ],
  en: [
    "Everything runs in your browser.",
    "No data is ever sent to a server.",
  ],
};

/** 전 페이지 공통 푸터 (루트 layout.tsx에서 렌더). 언어는 URL에서 도출.
 *  Header = Brand / Footer = Sitemap(타겟) + Trust(개인정보) 의 간결한 마감. */
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
  const [line1, line2] = PRIVACY[lang];

  return (
    <footer className="kf-footer">
      <div className="kf-footer-inner">
        <div className="foot-top">
          {/* 좌측: 브랜드 */}
          <div className="foot-brand-block">
            <div className="foot-brandrow">
              <span className="kf-logomark">K</span>
              <b>Kitfolio</b>
            </div>
            <p className="foot-tagline">
              Small tools for modern knowledge workers
            </p>
            <p className="foot-privacy">
              {line1}
              <br />
              {line2}
            </p>
          </div>

          {/* 우측: 타겟(직군) + 외부 링크 */}
          <div className="foot-links-block">
            <nav className="foot-targets" aria-label="By role">
              {TARGET_ORDER.map((tag) => (
                <Link key={tag} href={`${home}?target=${tag}`}>
                  {TARGET_LABELS[tag][lang]}
                </Link>
              ))}
            </nav>
            <nav className="foot-ext" aria-label="Links">
              <a href={`mailto:${FEEDBACK_EMAIL}`}>{t("foot.feedback")}</a>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </nav>
          </div>
        </div>

        <p className="foot-copy">© 2026 Kitfolio. All rights reserved.</p>
      </div>
    </footer>
  );
}
