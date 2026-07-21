"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { localizedHref } from "../lib/content";
import { useLang, useT, type Dict } from "../lib/i18n";

// PDF 4종 도구 공통 상단 탭. 탭은 실제 URL 로 이동하며, 같은 언어의
// 상대 도구 경로를 유지한다 (KO=루트, EN=/en). 모바일은 가로 스크롤.
const DICT: Dict = {
  ko: {
    merge: "PDF 병합",
    split: "PDF 분할",
    rotate: "PDF 회전",
    "page-delete": "페이지 삭제",
  },
  en: {
    merge: "Merge PDF",
    split: "Split PDF",
    rotate: "Rotate PDF",
    "page-delete": "Delete Pages",
  },
};

type PdfTab = "merge" | "split" | "rotate" | "page-delete";

const TABS: { key: PdfTab; slug: string }[] = [
  { key: "merge", slug: "/pdf-merge" },
  { key: "split", slug: "/pdf-split" },
  { key: "rotate", slug: "/pdf-rotate" },
  { key: "page-delete", slug: "/pdf-page-delete" },
];

export default function PdfToolTabs({ active }: { active: PdfTab }) {
  const { lang } = useLang();
  const t = useT(DICT);
  const activeRef = useRef<HTMLSpanElement>(null);

  // 모바일에서 현재 탭이 보이도록 스크롤 위치 조정
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "auto",
    });
  }, []);

  return (
    <nav className="pdf-tabs" aria-label="PDF tools">
      {TABS.map((tb) =>
        tb.key === active ? (
          <span
            key={tb.key}
            ref={activeRef}
            className="pdf-tab is-active"
            aria-current="page"
          >
            {t(tb.key)}
          </span>
        ) : (
          <Link
            key={tb.key}
            className="pdf-tab"
            href={localizedHref(lang, tb.slug)}
          >
            {t(tb.key)}
          </Link>
        ),
      )}
    </nav>
  );
}
