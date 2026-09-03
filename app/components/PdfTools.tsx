"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import PageHead from "./PageHead";
import Faq from "./Faq";
import ToolGuide from "./ToolGuide";
import RelatedTools from "./RelatedTools";
import PdfToolTabs, { type PdfTab } from "./PdfToolTabs";
import PdfMerge from "./PdfMerge";
import PdfSplit from "./PdfSplit";
import PdfRotate from "./PdfRotate";
import PdfPageDelete from "./PdfPageDelete";

const SLUG = "pdf-tools";
const TABS: PdfTab[] = ["merge", "split", "rotate", "page-delete"];

/** PDF 도구 4종(병합·분할·회전·페이지 삭제) 통합 셸.
 *  탭 전환은 ?mode= 쿼리스트링과 동기화되며, 각 작업은 자기 파일 상태를 독립적으로 관리한다. */
export default function PdfTools({ defaultTab }: { defaultTab: PdfTab }) {
  const pathname = usePathname();
  const [tab, setTab] = useState<PdfTab>(defaultTab);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("mode") as PdfTab | null;
    if (q && (TABS as string[]).includes(q)) setTab(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function switchTab(next: PdfTab) {
    if (next === tab) return;
    setTab(next);
    window.history.replaceState(null, "", `${pathname}?mode=${next}`);
  }

  return (
    <>
      <PageHead slug={SLUG} />
      <PdfToolTabs active={tab} onChange={switchTab} />

      {tab === "merge" && <PdfMerge />}
      {tab === "split" && <PdfSplit />}
      {tab === "rotate" && <PdfRotate />}
      {tab === "page-delete" && <PdfPageDelete />}

      <ToolGuide slug={SLUG} />
      <Faq slug={SLUG} />
      <RelatedTools slug={SLUG} />
    </>
  );
}
