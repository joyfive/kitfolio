"use client";

import Link from "next/link";
import { localizedHref } from "../lib/content";
import { useLang, useT, type Dict } from "../lib/i18n";

// 생성기 ↔ 읽기 페이지 이동 탭. 두 페이지는 실제 분리된 URL 이며,
// 탭 클릭은 같은 언어의 상대 도구 URL 로 이동한다.
const DICT: Dict = {
  ko: { gen: "QR 코드 생성", read: "QR 코드 읽기" },
  en: { gen: "Generate QR Code", read: "Read QR Code" },
};

export default function QrToolTabs({
  active,
}: {
  active: "generator" | "reader";
}) {
  const { lang } = useLang();
  const t = useT(DICT);

  const tabs = [
    {
      key: "generator" as const,
      label: t("gen"),
      href: localizedHref(lang, "/qr-code-generator"),
    },
    {
      key: "reader" as const,
      label: t("read"),
      href: localizedHref(lang, "/qr-code-reader"),
    },
  ];

  return (
    <nav className="qr-tabs" aria-label="QR tools">
      {tabs.map((tb) =>
        tb.key === active ? (
          <span key={tb.key} className="qr-tab is-active" aria-current="page">
            {tb.label}
          </span>
        ) : (
          <Link key={tb.key} className="qr-tab" href={tb.href}>
            {tb.label}
          </Link>
        ),
      )}
    </nav>
  );
}
