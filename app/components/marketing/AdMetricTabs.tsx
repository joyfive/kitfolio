"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "../../lib/i18n";
import { localizedHref } from "../../lib/content";

const TABS = [
  { slug: "roas-calculator", label: "ROAS" },
  { slug: "cpa-calculator", label: "CPA" },
  { slug: "cpc-calculator", label: "CPC" },
  { slug: "cpm-calculator", label: "CPM" },
  { slug: "ctr-calculator", label: "CTR" },
] as const;

export default function AdMetricTabs() {
  const { lang } = useLang();
  const pathname = usePathname();

  return (
    <div className="adm-tabs" role="navigation" aria-label="Ad metric calculators">
      {TABS.map((tab) => {
        const href = localizedHref(lang, `/${tab.slug}`);
        const isActive = pathname === href || pathname === `/${tab.slug}`;
        return (
          <Link
            key={tab.slug}
            href={href}
            className={`adm-tab${isActive ? " is-active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
