"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "../lib/i18n";

/** KO/EN 토글. localStorage가 아니라 상대 로케일 URL로 이동한다 (SEO 정합). */
export default function LangToggle() {
  const { lang } = useLang();
  const pathname = usePathname() || "/";

  // 현재 경로를 KO 기준 경로로 환원
  const barePath = pathname.startsWith("/en")
    ? pathname.slice(3) || "/"
    : pathname;
  const koHref = barePath;
  const enHref = barePath === "/" ? "/en" : "/en" + barePath;

  return (
    <span className="kf-lang">
      <Link href={koHref} className={lang === "ko" ? "is-active" : ""}>
        KO
      </Link>
      <Link href={enHref} className={lang === "en" ? "is-active" : ""}>
        EN
      </Link>
    </span>
  );
}
