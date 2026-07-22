"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import PageHead from "./PageHead";
import Faq from "./Faq";
import RelatedTools from "./RelatedTools";
import PdfToolTabs from "./PdfToolTabs";
import PdfDropzone from "./PdfDropzone";
import PdfFileSummary from "./PdfFileSummary";
import PdfThumbnailGrid from "./PdfThumbnailGrid";
import PdfPageRangeInput from "./PdfPageRangeInput";
import PdfProcessingStatus, { type PdfProcessState } from "./PdfProcessingStatus";
import { useLang, useT, type Dict } from "../lib/i18n";
import { loadPdfFile, type LoadedPdf } from "../lib/pdf/loadPdf";
import { usePdfjsDoc } from "../lib/pdf/usePdfjsDoc";
import { deletePages } from "../lib/pdf/operations";
import { parsePageRanges, rangeToIndices, type ParseIssueCode } from "../lib/pdf/parsePageRanges";
import { normalizePdfError, PdfError, type PdfErrorType } from "../lib/pdf/pdfErrors";
import { downloadBlob, pdfBytesToBlob, safePdfName } from "../lib/pdf/downloadBlob";

const DICT: Dict = {
  ko: {
    "d.drop": "PDF 파일을 여기로 끌어다 놓거나 선택하세요",
    "d.dropHint": "PDF 1개 · 최대 300페이지 · 100MB",
    "d.select": "삭제할 페이지 선택",
    "d.all": "전체 선택",
    "d.none": "선택 해제",
    "d.invert": "선택 반전",
    "d.rangeLabel": "범위로 선택",
    "d.rangeExample": "예: 2, 5-7",
    "d.apply": "적용",
    "d.marked": "삭제 예정",
    "d.remain": "삭제 후 남는 페이지",
    "d.name": "출력 파일명",
    "d.run": "선택 페이지 삭제",
    "d.running": "페이지를 삭제하고 있습니다…",
    "d.download": "삭제된 PDF 다운로드",
    "d.undo": "실행 취소",
    "d.resetAll": "전체 원상 복구",
    "d.pages": "페이지",
    "d.reset": "다른 파일",
    "d.confirm": "선택한 페이지를 삭제한 새 PDF를 만들까요? 원본 파일은 변경되지 않습니다.",
    "d.minOne": "최소 1페이지는 남아야 합니다. 모든 페이지를 삭제할 수 없습니다.",
    "d.err.invalid-token": "형식이 올바르지 않습니다 (예: 2, 5-7).",
    "d.err.zero-or-negative": "페이지는 1부터 시작합니다.",
    "d.err.start-after-end": "시작 페이지가 끝 페이지보다 클 수 없습니다.",
    "d.err.out-of-bounds": "총 페이지 수를 초과했습니다.",
    "d.memoryHint": "원본 파일은 변경되지 않으며 삭제 결과는 새 파일로 저장됩니다.",
  },
  en: {
    "d.drop": "Drag a PDF here, or choose a file",
    "d.dropHint": "One PDF · up to 300 pages · 100MB",
    "d.select": "Select pages to delete",
    "d.all": "Select all",
    "d.none": "Clear selection",
    "d.invert": "Invert selection",
    "d.rangeLabel": "Select by range",
    "d.rangeExample": "e.g. 2, 5-7",
    "d.apply": "Apply",
    "d.marked": "Marked for deletion",
    "d.remain": "Pages remaining after delete",
    "d.name": "Output file name",
    "d.run": "Delete selected pages",
    "d.running": "Deleting pages…",
    "d.download": "Download trimmed PDF",
    "d.undo": "Undo",
    "d.resetAll": "Reset all",
    "d.pages": "pages",
    "d.reset": "Choose another file",
    "d.confirm": "Create a new PDF without the selected pages? The original file is not changed.",
    "d.minOne": "At least one page must remain. You cannot delete every page.",
    "d.err.invalid-token": "Invalid format (e.g. 2, 5-7).",
    "d.err.zero-or-negative": "Pages start at 1.",
    "d.err.start-after-end": "The start page cannot be greater than the end page.",
    "d.err.out-of-bounds": "Exceeds the total number of pages.",
    "d.memoryHint": "The original file is never modified; the result is saved as a new file.",
  },
};

type Result = { blob: Blob; name: string } | null;

export default function PdfPageDelete() {
  const { lang } = useLang();
  const t = useT(DICT);

  const [pdf, setPdf] = useState<LoadedPdf | null>(null);
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [history, setHistory] = useState<Set<number>[]>([]);
  const [rangeText, setRangeText] = useState("");
  const [outName, setOutName] = useState("kitfolio-pages-removed.pdf");
  const [state, setState] = useState<PdfProcessState>("idle");
  const [error, setError] = useState<PdfErrorType | null>(null);
  const [warn, setWarn] = useState<string | null>(null);
  const [result, setResult] = useState<Result>(null);
  const busyRef = useRef(false);

  const doc = usePdfjsDoc(pdf?.bytes ?? null);

  const parsed = useMemo(
    () => (pdf && rangeText.trim() ? parsePageRanges(rangeText, pdf.pageCount) : null),
    [rangeText, pdf],
  );
  const rangeErrors = useMemo(
    () => (parsed?.errors ?? []).map((c: ParseIssueCode) => t("d.err." + c)).filter(Boolean),
    [parsed, t],
  );

  const remaining = pdf ? pdf.pageCount - marked.size : 0;
  const canDelete = !!pdf && marked.size > 0 && remaining >= 1 && state !== "processing";

  // 선택 변경 시 이전 상태를 히스토리에 저장 (실행 취소용)
  const commit = useCallback(
    (next: Set<number>) => {
      setResult(null);
      setWarn(null);
      setMarked((prev) => {
        setHistory((h) => [...h, prev]);
        return next;
      });
    },
    [],
  );

  const loadFile = useCallback(async (list: FileList | null) => {
    const file = list?.[0];
    if (!file) return;
    setError(null);
    setResult(null);
    try {
      const loaded = await loadPdfFile(file);
      setPdf(loaded);
      setMarked(new Set());
      setHistory([]);
      setRangeText("");
      setWarn(null);
    } catch (e) {
      setPdf(null);
      setError(e instanceof PdfError ? e.type : normalizePdfError(e));
    }
  }, []);

  const reset = useCallback(() => {
    setPdf(null);
    setMarked(new Set());
    setHistory([]);
    setResult(null);
    setError(null);
    setWarn(null);
    setRangeText("");
    setState("idle");
  }, []);

  const toggle = useCallback(
    (i: number) => {
      const next = new Set(marked);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      commit(next);
    },
    [marked, commit],
  );

  const selectAll = useCallback(() => {
    if (!pdf) return;
    commit(new Set(Array.from({ length: pdf.pageCount }, (_, i) => i)));
  }, [pdf, commit]);

  const clearSel = useCallback(() => commit(new Set()), [commit]);

  const invert = useCallback(() => {
    if (!pdf) return;
    const next = new Set<number>();
    for (let i = 0; i < pdf.pageCount; i++) if (!marked.has(i)) next.add(i);
    commit(next);
  }, [pdf, marked, commit]);

  const applyRange = useCallback(() => {
    if (!parsed) return;
    const next = new Set(marked);
    for (const r of parsed.ranges) for (const i of rangeToIndices(r)) next.add(i);
    commit(next);
  }, [parsed, marked, commit]);

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setMarked(prev);
      setResult(null);
      return h.slice(0, -1);
    });
  }, []);

  const resetAll = useCallback(() => {
    setResult(null);
    setWarn(null);
    setMarked(new Set());
    setHistory([]);
  }, []);

  const run = useCallback(async () => {
    if (busyRef.current || !pdf) return;
    if (remaining < 1) {
      setWarn(t("d.minOne"));
      return;
    }
    if (!window.confirm(t("d.confirm"))) return;

    busyRef.current = true;
    setState("processing");
    setError(null);
    setWarn(null);
    setResult(null);
    try {
      const bytes = await deletePages(pdf.bytes, marked);
      setResult({
        blob: pdfBytesToBlob(bytes),
        name: safePdfName(outName, "kitfolio-pages-removed.pdf"),
      });
      setState("idle");
    } catch (e) {
      setError(normalizePdfError(e));
      setState("error");
    } finally {
      busyRef.current = false;
    }
  }, [pdf, marked, remaining, outName, t]);

  const download = useCallback(() => {
    if (result) downloadBlob(result.blob, result.name);
  }, [result]);

  return (
    <>
      <PageHead slug="pdf-page-delete" />
      <PdfToolTabs active="page-delete" />

      {!pdf ? (
        <div className="pdf-work pdf-work-empty">
          <PdfDropzone onFiles={loadFile} title={t("d.drop")} hint={t("d.dropHint")} />
          {error && <PdfProcessingStatus state="error" error={error} processingLabel="" />}
        </div>
      ) : (
        <div className="pdf-work">
          <div className="pdf-panel">
            <div className="pdf-panel-inner">
              <PdfFileSummary
                name={pdf.name}
                size={pdf.size}
                pageCount={pdf.pageCount}
                pagesLabel={t("d.pages")}
                onClear={reset}
                clearLabel={t("d.reset")}
              />

              <div className="field-group">
                <span className="field-label">{t("d.select")}</span>
                <div className="pdf-btn-row">
                  <button type="button" className="btn btn-sm btn-outline" onClick={selectAll}>
                    {t("d.all")}
                  </button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={clearSel}>
                    {t("d.none")}
                  </button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={invert}>
                    {t("d.invert")}
                  </button>
                </div>
                <div className="pdf-range-apply">
                  <PdfPageRangeInput
                    value={rangeText}
                    onChange={setRangeText}
                    label={t("d.rangeLabel")}
                    placeholder="2, 5-7"
                    example={t("d.rangeExample")}
                    errors={rangeErrors as string[]}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={applyRange}
                    disabled={!parsed || parsed.ranges.length === 0 || rangeErrors.length > 0}
                  >
                    {t("d.apply")}
                  </button>
                </div>
              </div>

              <dl className="pdf-summary pdf-summary-inline">
                <div>
                  <dt>{t("d.marked")}</dt>
                  <dd>{marked.size}</dd>
                </div>
                <div>
                  <dt>{t("d.remain")}</dt>
                  <dd className={"pdf-summary-hero" + (remaining < 1 ? " is-danger" : "")}>
                    {remaining}
                  </dd>
                </div>
              </dl>

              <div className="pdf-btn-row">
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={undo}
                  disabled={history.length === 0}
                >
                  {t("d.undo")}
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={resetAll}
                  disabled={marked.size === 0}
                >
                  {t("d.resetAll")}
                </button>
              </div>

              <label className="field-label" htmlFor="pdf-delete-name">
                {t("d.name")}
              </label>
              <input
                id="pdf-delete-name"
                type="text"
                className="pdf-name-in"
                value={outName}
                onChange={(e) => setOutName(e.target.value)}
                spellCheck={false}
                autoComplete="off"
              />

              {warn && (
                <div className="pdf-status pdf-status-warn" role="status">
                  {warn}
                </div>
              )}
              <PdfProcessingStatus state={state} error={error} processingLabel={t("d.running")} />

              <button
                type="button"
                className="btn btn-primary pdf-run pdf-run-danger"
                onClick={run}
                disabled={!canDelete}
              >
                {t("d.run")}
              </button>
              {result && (
                <button type="button" className="btn btn-outline pdf-download" onClick={download}>
                  {t("d.download")}
                </button>
              )}
              <p className="pdf-memory-hint">{t("d.memoryHint")}</p>
            </div>
          </div>

          <div className="pdf-canvas">
            <PdfThumbnailGrid
              doc={doc}
              pageCount={pdf.pageCount}
              markDeleted={marked}
              onToggle={toggle}
              pageLabel={(n) => `${n}`}
            />
          </div>
        </div>
      )}

      <Faq slug="pdf-page-delete" />
      <RelatedTools slug="pdf-page-delete" />
    </>
  );
}
