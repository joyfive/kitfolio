"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import PdfDropzone from "./PdfDropzone";
import PdfFileSummary from "./PdfFileSummary";
import PdfThumbnailGrid from "./PdfThumbnailGrid";
import PdfPageRangeInput from "./PdfPageRangeInput";
import PdfProcessingStatus, { type PdfProcessState } from "./PdfProcessingStatus";
import { useLang, useT, type Dict } from "../lib/i18n";
import { loadPdfFile, type LoadedPdf } from "../lib/pdf/loadPdf";
import { usePdfjsDoc } from "../lib/pdf/usePdfjsDoc";
import { extractPages } from "../lib/pdf/operations";
import {
  parsePageRanges,
  rangeToIndices,
  isSinglePage,
  type ParseIssueCode,
} from "../lib/pdf/parsePageRanges";
import { normalizePdfError, PdfError, type PdfErrorType } from "../lib/pdf/pdfErrors";
import { PDF_LIMITS } from "../lib/pdf/pdfLimits";
import { downloadBlob, pdfBytesToBlob, baseName } from "../lib/pdf/downloadBlob";
import { zipPdfs } from "../lib/pdf/zip";

const DICT: Dict = {
  ko: {
    "s.drop": "PDF 파일을 여기로 끌어다 놓거나 선택하세요",
    "s.dropHint": "PDF 1개 · 최대 300페이지 · 100MB",
    "s.mode": "분할 방식",
    "s.each": "페이지별 분할",
    "s.range": "범위별 분할",
    "s.eachDesc": "모든 페이지를 각각 한 페이지짜리 PDF로 만듭니다.",
    "s.rangeLabel": "페이지 범위",
    "s.rangeExample": "예: 1-3, 4-7, 8, 9-12",
    "s.result": "분할 결과",
    "s.resultCount": "생성될 파일 수",
    "s.run": "PDF 분할",
    "s.running": "PDF를 분할하고 있습니다…",
    "s.download": "결과 다운로드",
    "s.pages": "페이지",
    "s.reset": "다른 파일",
    "s.zipNote": "결과가 2개 이상이면 ZIP으로 묶여 다운로드됩니다.",
    // parse issues
    "s.err.empty": "분할할 페이지 범위를 입력하세요.",
    "s.err.invalid-token": "형식이 올바르지 않습니다. 쉼표와 하이픈만 사용하세요 (예: 1-3, 5).",
    "s.err.zero-or-negative": "페이지는 1부터 시작합니다. 0이나 음수는 사용할 수 없습니다.",
    "s.err.start-after-end": "시작 페이지가 끝 페이지보다 클 수 없습니다.",
    "s.err.out-of-bounds": "총 페이지 수를 초과하는 범위가 있습니다.",
    "s.warn.duplicate": "중복되거나 겹치는 범위가 있습니다.",
    "s.memoryHint":
      "브라우저 메모리는 기기마다 다릅니다. 페이지가 많으면 실패할 수 있습니다.",
  },
  en: {
    "s.drop": "Drag a PDF here, or choose a file",
    "s.dropHint": "One PDF · up to 300 pages · 100MB",
    "s.mode": "Split mode",
    "s.each": "Split every page",
    "s.range": "Split by ranges",
    "s.eachDesc": "Turn every page into its own single-page PDF.",
    "s.rangeLabel": "Page ranges",
    "s.rangeExample": "e.g. 1-3, 4-7, 8, 9-12",
    "s.result": "Split result",
    "s.resultCount": "Files to create",
    "s.run": "Split PDF",
    "s.running": "Splitting PDF…",
    "s.download": "Download result",
    "s.pages": "pages",
    "s.reset": "Choose another file",
    "s.zipNote": "When there is more than one result, files download as a ZIP.",
    "s.err.empty": "Enter the page ranges to split.",
    "s.err.invalid-token": "Invalid format. Use commas and hyphens only (e.g. 1-3, 5).",
    "s.err.zero-or-negative": "Pages start at 1. Zero and negative values are not allowed.",
    "s.err.start-after-end": "The start page cannot be greater than the end page.",
    "s.err.out-of-bounds": "A range exceeds the total number of pages.",
    "s.warn.duplicate": "Some ranges are duplicated or overlapping.",
    "s.memoryHint":
      "Browser memory varies by device. A high page count may fail.",
  },
};

type Mode = "each" | "range";
type Result = { blob: Blob; name: string; count: number } | null;

export default function PdfSplit() {
  const { lang } = useLang();
  const t = useT(DICT);

  const [pdf, setPdf] = useState<LoadedPdf | null>(null);
  const [mode, setMode] = useState<Mode>("each");
  const [rangeText, setRangeText] = useState("");
  const [state, setState] = useState<PdfProcessState>("idle");
  const [error, setError] = useState<PdfErrorType | null>(null);
  const [result, setResult] = useState<Result>(null);
  const busyRef = useRef(false);

  const doc = usePdfjsDoc(pdf?.bytes ?? null);

  const parsed = useMemo(
    () => (pdf ? parsePageRanges(rangeText, pdf.pageCount) : null),
    [rangeText, pdf],
  );

  const errorMsgs = useMemo(
    () => parsed?.errors.map((c: ParseIssueCode) => t("s.err." + c)) ?? [],
    [parsed, t],
  );
  const warnMsgs = useMemo(
    () => parsed?.warnings.map((c: ParseIssueCode) => t("s.warn." + c)) ?? [],
    [parsed, t],
  );

  const resultCount = useMemo(() => {
    if (!pdf) return 0;
    if (mode === "each") return pdf.pageCount;
    return parsed?.ranges.length ?? 0;
  }, [pdf, mode, parsed]);

  const canRun =
    !!pdf &&
    state !== "processing" &&
    (mode === "each"
      ? pdf.pageCount >= 1
      : (parsed?.ranges.length ?? 0) > 0 && (parsed?.errors.length ?? 0) === 0) &&
    resultCount <= PDF_LIMITS.maxSplitResults;

  const loadFile = useCallback(async (list: FileList | null) => {
    const file = list?.[0];
    if (!file) return;
    setError(null);
    setResult(null);
    try {
      const loaded = await loadPdfFile(file);
      setPdf(loaded);
      setRangeText("");
    } catch (e) {
      setPdf(null);
      setError(e instanceof PdfError ? e.type : normalizePdfError(e));
    }
  }, []);

  const reset = useCallback(() => {
    setPdf(null);
    setResult(null);
    setError(null);
    setRangeText("");
    setState("idle");
  }, []);

  const run = useCallback(async () => {
    if (busyRef.current || !pdf) return;
    busyRef.current = true;
    setState("processing");
    setError(null);
    setResult(null);
    try {
      const base = baseName(pdf.name) || "kitfolio";
      const pad = String(pdf.pageCount).length;
      const outputs: { name: string; bytes: Uint8Array }[] = [];

      if (mode === "each") {
        for (let i = 0; i < pdf.pageCount; i++) {
          const bytes = await extractPages(pdf.bytes, [i]);
          const n = String(i + 1).padStart(pad, "0");
          outputs.push({ name: `${base}-page-${n}.pdf`, bytes });
        }
      } else {
        const ranges = parsed?.ranges ?? [];
        for (const r of ranges) {
          const bytes = await extractPages(pdf.bytes, rangeToIndices(r));
          const name = isSinglePage(r)
            ? `${base}-page-${r.start}.pdf`
            : `${base}-pages-${r.start}-${r.end}.pdf`;
          outputs.push({ name, bytes });
        }
      }

      if (outputs.length === 1) {
        setResult({
          blob: pdfBytesToBlob(outputs[0].bytes),
          name: outputs[0].name,
          count: 1,
        });
      } else {
        const zip = await zipPdfs(outputs);
        setResult({ blob: zip, name: "kitfolio-split-pdf.zip", count: outputs.length });
      }
      setState("idle");
    } catch (e) {
      setError(normalizePdfError(e));
      setState("error");
    } finally {
      busyRef.current = false;
    }
  }, [pdf, mode, parsed]);

  const download = useCallback(() => {
    if (result) downloadBlob(result.blob, result.name);
  }, [result]);

  return (
    <>
      {!pdf ? (
        <div className="pdf-work pdf-work-empty">
          <PdfDropzone onFiles={loadFile} title={t("s.drop")} hint={t("s.dropHint")} />
          {error && (
            <PdfProcessingStatus state="error" error={error} processingLabel="" />
          )}
        </div>
      ) : (
        <div className="pdf-work">
          {/* 좌: 작업 설정 */}
          <div className="pdf-panel">
            <div className="pdf-panel-inner">
              <PdfFileSummary
                name={pdf.name}
                size={pdf.size}
                pageCount={pdf.pageCount}
                pagesLabel={t("s.pages")}
                onClear={reset}
                clearLabel={t("s.reset")}
              />

              <div className="field-group">
                <span className="field-label">{t("s.mode")}</span>
                <div className="pdf-seg">
                  {(["each", "range"] as Mode[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={mode === m ? "is-active" : ""}
                      aria-pressed={mode === m}
                      onClick={() => {
                        setMode(m);
                        setResult(null);
                      }}
                    >
                      {t("s." + m)}
                    </button>
                  ))}
                </div>
                {mode === "each" ? (
                  <p className="pdf-hint">{t("s.eachDesc")}</p>
                ) : (
                  <PdfPageRangeInput
                    value={rangeText}
                    onChange={(v) => {
                      setRangeText(v);
                      setResult(null);
                    }}
                    label={t("s.rangeLabel")}
                    placeholder="1-3, 4-7, 8"
                    example={t("s.rangeExample")}
                    errors={rangeText.trim() ? errorMsgs : []}
                    warnings={warnMsgs}
                  />
                )}
              </div>

              <dl className="pdf-summary pdf-summary-inline">
                <div>
                  <dt>{t("s.resultCount")}</dt>
                  <dd className="pdf-summary-hero">{resultCount}</dd>
                </div>
              </dl>
              <p className="pdf-hint">{t("s.zipNote")}</p>

              <PdfProcessingStatus state={state} error={error} processingLabel={t("s.running")} />

              <button
                type="button"
                className="btn btn-primary pdf-run"
                onClick={run}
                disabled={!canRun}
              >
                {t("s.run")}
              </button>
              {result && (
                <button type="button" className="btn btn-outline pdf-download" onClick={download}>
                  {t("s.download")}
                </button>
              )}
              <p className="pdf-memory-hint">{t("s.memoryHint")}</p>
            </div>
          </div>

          {/* 우: 페이지 썸네일 */}
          <div className="pdf-canvas">
            <PdfThumbnailGrid
              doc={doc}
              pageCount={pdf.pageCount}
              pageLabel={(n) => `${n}`}
            />
          </div>
        </div>
      )}
    </>
  );
}
