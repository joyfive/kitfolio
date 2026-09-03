"use client";

import { useEffect, useRef } from "react";
import { useT, type Dict } from "../lib/i18n";

// PDF 4종 도구 공통 상단 탭. pdf-tools 한 페이지 안에서 ?mode= 쿼리로 작업을
// 전환한다 (다른 통합 도구와 동일 패턴). 모바일은 가로 스크롤.
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

export type PdfTab = "merge" | "split" | "rotate" | "page-delete";

const TABS: PdfTab[] = ["merge", "split", "rotate", "page-delete"];

export default function PdfToolTabs({
  active,
  onChange,
}: {
  active: PdfTab;
  onChange: (tab: PdfTab) => void;
}) {
  const t = useT(DICT);
  const activeRef = useRef<HTMLButtonElement>(null);

  // 모바일에서 현재 탭이 보이도록 스크롤 위치 조정
  useEffect(() => {
    activeRef.current?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "auto",
    });
  }, [active]);

  return (
    <nav className="pdf-tabs" aria-label="PDF tools">
      {TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          ref={tab === active ? activeRef : undefined}
          className={`pdf-tab${tab === active ? " is-active" : ""}`}
          aria-current={tab === active ? "page" : undefined}
          onClick={() => onChange(tab)}
        >
          {t(tab)}
        </button>
      ))}
    </nav>
  );
}
