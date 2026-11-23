"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import PageHead from "./PageHead";
import { getTool, localizedHref } from "../lib/content";
import { useLang } from "../lib/i18n";
import { PDF_WORKFLOWS } from "../lib/pdf/workflow-copy";
import ToolSupport from "./ToolSupport";
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
  const { lang } = useLang();
  const tool = getTool(SLUG);
  const ko = lang === "ko";
  const [tab, setTab] = useState<PdfTab>(defaultTab);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("mode") as PdfTab | null;
    if (q && (TABS as string[]).includes(q)) setTab(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function switchTab(next: PdfTab) {
    if (next === tab) return;
    setTab(next);
    const query = new URLSearchParams(window.location.search);
    query.set("mode", next);
    window.history.replaceState(null, "", `${pathname}?${query}${window.location.hash}`);
  }

  return (
    <>
      <div id="tool" tabIndex={-1} className="kf-support-tool">
        <PageHead slug={SLUG} toolAnchor={false} />
        <a className="kf-support-link" href="#guide">{ko ? "선택한 작업의 사용 가이드" : "Guide for the selected task"} ↓</a>
        <PdfToolTabs active={tab} onChange={switchTab} />

        {tab === "merge" && <PdfMerge />}
        {tab === "split" && <PdfSplit />}
        {tab === "rotate" && <PdfRotate />}
        {tab === "page-delete" && <PdfPageDelete />}
        <p className="kf-support-privacy">{ko ? "선택한 파일은 브라우저 안에서 처리됩니다." : "Selected files are processed in your browser."}</p>
      </div>

      <ToolSupport
        lang={lang}
        guide={PDF_WORKFLOWS[lang][tab]}
        faq={tool.faq?.[lang] ?? []}
        reading={{
          title: ko ? "PDF를 합치면 압축도 될까요?" : "Does merging compress a PDF?",
          text: ko
            ? "병합은 페이지를 원하는 순서로 이어 붙이는 작업입니다. 이미지 품질을 낮춰 용량을 줄이는 압축은 따로 해야 합니다. 크기나 방향이 다른 페이지도 합칠 수 있으므로, 필요한 페이지만 먼저 회전한 뒤 병합하세요."
            : "Merging joins the pages in your chosen order. Compression, which can reduce image quality to make files smaller, is a separate step. Pages keep their sizes and orientations, so rotate any sideways pages before merging.",
          limitations: tool.content[lang].limitations,
        }}
        articleHref={localizedHref(lang, "/blog/pdf-tasks-in-browser")}
      />
      <RelatedTools slug={SLUG} />
    </>
  );
}
