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
import { rotatePages } from "../lib/pdf/operations";
import { parsePageRanges, rangeToIndices, type ParseIssueCode } from "../lib/pdf/parsePageRanges";
import { normalizePdfError, PdfError, type PdfErrorType } from "../lib/pdf/pdfErrors";
import { downloadBlob, pdfBytesToBlob, safePdfName } from "../lib/pdf/downloadBlob";

const DICT: Dict = {
  ko: {
    "r.drop": "PDF 파일을 여기로 끌어다 놓거나 선택하세요",
    "r.dropHint": "PDF 1개 · 최대 300페이지 · 100MB",
    "r.select": "페이지 선택",
    "r.all": "전체 선택",
    "r.none": "선택 해제",
    "r.rangeLabel": "범위로 선택",
    "r.rangeExample": "예: 1-3, 5",
    "r.apply": "적용",
    "r.selected": "선택된 페이지",
    "r.applyTo": "선택한 페이지에 적용 (선택이 없으면 전체)",
    "r.rotate": "회전",
    "r.left": "왼쪽 90°",
    "r.right": "오른쪽 90°",
    "r.flip": "180°",
    "r.resetSel": "선택 원상 복구",
    "r.resetAll": "전체 원상 복구",
    "r.name": "출력 파일명",
    "r.run": "회전된 PDF 저장",
    "r.running": "PDF를 회전하고 있습니다…",
    "r.download": "회전된 PDF 다운로드",
    "r.pages": "페이지",
    "r.reset": "다른 파일",
    "r.err.empty": "",
    "r.err.invalid-token": "형식이 올바르지 않습니다 (예: 1-3, 5).",
    "r.err.zero-or-negative": "페이지는 1부터 시작합니다.",
    "r.err.start-after-end": "시작 페이지가 끝 페이지보다 클 수 없습니다.",
    "r.err.out-of-bounds": "총 페이지 수를 초과했습니다.",
    "r.memoryHint": "회전은 페이지 속성만 변경하므로 원본 품질이 유지됩니다.",
  },
  en: {
    "r.drop": "Drag a PDF here, or choose a file",
    "r.dropHint": "One PDF · up to 300 pages · 100MB",
    "r.select": "Select pages",
    "r.all": "Select all",
    "r.none": "Clear selection",
    "r.rangeLabel": "Select by range",
    "r.rangeExample": "e.g. 1-3, 5",
    "r.apply": "Apply",
    "r.selected": "Selected pages",
    "r.applyTo": "Applies to selected pages (or all if none selected)",
    "r.rotate": "Rotate",
    "r.left": "Left 90°",
    "r.right": "Right 90°",
    "r.flip": "180°",
    "r.resetSel": "Reset selected",
    "r.resetAll": "Reset all",
    "r.name": "Output file name",
    "r.run": "Save rotated PDF",
    "r.running": "Rotating PDF…",
    "r.download": "Download rotated PDF",
    "r.pages": "pages",
    "r.reset": "Choose another file",
    "r.err.empty": "",
    "r.err.invalid-token": "Invalid format (e.g. 1-3, 5).",
    "r.err.zero-or-negative": "Pages start at 1.",
    "r.err.start-after-end": "The start page cannot be greater than the end page.",
    "r.err.out-of-bounds": "Exceeds the total number of pages.",
    "r.memoryHint": "Rotation only changes the page attribute, so quality is preserved.",
  },
};

type Result = { blob: Blob; name: string } | null;

export default function PdfRotate() {
  const { lang } = useLang();
  const t = useT(DICT);

  const [pdf, setPdf] = useState<LoadedPdf | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [rotations, setRotations] = useState<Map<number, number>>(new Map());
  const [rangeText, setRangeText] = useState("");
  const [outName, setOutName] = useState("kitfolio-rotated.pdf");
  const [state, setState] = useState<PdfProcessState>("idle");
  const [error, setError] = useState<PdfErrorType | null>(null);
  const [result, setResult] = useState<Result>(null);
  const busyRef = useRef(false);

  const doc = usePdfjsDoc(pdf?.bytes ?? null);

  const parsed = useMemo(
    () => (pdf && rangeText.trim() ? parsePageRanges(rangeText, pdf.pageCount) : null),
    [rangeText, pdf],
  );
  const rangeErrors = useMemo(
    () =>
      (parsed?.errors ?? [])
        .map((c: ParseIssueCode) => t("r.err." + c))
        .filter((m) => m.length > 0),
    [parsed, t],
  );

  const hasRotation = useMemo(
    () => [...rotations.values()].some((d) => d % 360 !== 0),
    [rotations],
  );

  const loadFile = useCallback(async (list: FileList | null) => {
    const file = list?.[0];
    if (!file) return;
    setError(null);
    setResult(null);
    try {
      const loaded = await loadPdfFile(file);
      setPdf(loaded);
      setSelected(new Set());
      setRotations(new Map());
      setRangeText("");
    } catch (e) {
      setPdf(null);
      setError(e instanceof PdfError ? e.type : normalizePdfError(e));
    }
  }, []);

  const reset = useCallback(() => {
    setPdf(null);
    setSelected(new Set());
    setRotations(new Map());
    setResult(null);
    setError(null);
    setRangeText("");
    setState("idle");
  }, []);

  const toggle = useCallback((i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    if (!pdf) return;
    setSelected(new Set(Array.from({ length: pdf.pageCount }, (_, i) => i)));
  }, [pdf]);

  const clearSel = useCallback(() => setSelected(new Set()), []);

  const applyRange = useCallback(() => {
    if (!parsed) return;
    const idx = parsed.ranges.flatMap((r) => rangeToIndices(r));
    setSelected(new Set(idx));
  }, [parsed]);

  // 회전 적용 대상: 선택이 있으면 선택, 없으면 전체
  const targets = useCallback((): number[] => {
    if (!pdf) return [];
    if (selected.size > 0) return [...selected];
    return Array.from({ length: pdf.pageCount }, (_, i) => i);
  }, [pdf, selected]);

  const rotate = useCallback(
    (delta: number) => {
      setResult(null);
      setRotations((prev) => {
        const next = new Map(prev);
        for (const i of targets()) {
          const cur = next.get(i) ?? 0;
          next.set(i, ((cur + delta) % 360 + 360) % 360);
        }
        return next;
      });
    },
    [targets],
  );

  const resetSelected = useCallback(() => {
    setResult(null);
    setRotations((prev) => {
      const next = new Map(prev);
      for (const i of targets()) next.set(i, 0);
      return next;
    });
  }, [targets]);

  const resetAll = useCallback(() => {
    setResult(null);
    setRotations(new Map());
  }, []);

  const run = useCallback(async () => {
    if (busyRef.current || !pdf) return;
    busyRef.current = true;
    setState("processing");
    setError(null);
    setResult(null);
    try {
      const bytes = await rotatePages(pdf.bytes, rotations);
      setResult({
        blob: pdfBytesToBlob(bytes),
        name: safePdfName(outName, "kitfolio-rotated.pdf"),
      });
      setState("idle");
    } catch (e) {
      setError(normalizePdfError(e));
      setState("error");
    } finally {
      busyRef.current = false;
    }
  }, [pdf, rotations, outName]);

  const download = useCallback(() => {
    if (result) downloadBlob(result.blob, result.name);
  }, [result]);

  return (
    <>
      {!pdf ? (
        <div className="pdf-work pdf-work-empty">
          <PdfDropzone onFiles={loadFile} title={t("r.drop")} hint={t("r.dropHint")} />
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
                pagesLabel={t("r.pages")}
                onClear={reset}
                clearLabel={t("r.reset")}
              />

              <div className="field-group">
                <span className="field-label">{t("r.select")}</span>
                <div className="pdf-btn-row">
                  <button type="button" className="btn btn-sm btn-outline" onClick={selectAll}>
                    {t("r.all")}
                  </button>
                  <button type="button" className="btn btn-sm btn-outline" onClick={clearSel}>
                    {t("r.none")}
                  </button>
                </div>
                <div className="pdf-range-apply">
                  <PdfPageRangeInput
                    value={rangeText}
                    onChange={setRangeText}
                    label={t("r.rangeLabel")}
                    placeholder="1-3, 5"
                    example={t("r.rangeExample")}
                    errors={rangeErrors}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={applyRange}
                    disabled={!parsed || parsed.ranges.length === 0 || rangeErrors.length > 0}
                  >
                    {t("r.apply")}
                  </button>
                </div>
                <p className="pdf-hint">
                  {t("r.selected")}: {selected.size} · {t("r.applyTo")}
                </p>
              </div>

              <div className="field-group">
                <span className="field-label">{t("r.rotate")}</span>
                <div className="pdf-rotate-btns">
                  <button type="button" className="btn btn-outline" onClick={() => rotate(-90)}>
                    <RotIcon dir="left" /> {t("r.left")}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => rotate(90)}>
                    <RotIcon dir="right" /> {t("r.right")}
                  </button>
                  <button type="button" className="btn btn-outline" onClick={() => rotate(180)}>
                    {t("r.flip")}
                  </button>
                </div>
                <div className="pdf-btn-row">
                  <button type="button" className="btn btn-sm btn-ghost" onClick={resetSelected}>
                    {t("r.resetSel")}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={resetAll}
                    disabled={!hasRotation}
                  >
                    {t("r.resetAll")}
                  </button>
                </div>
              </div>

              <label className="field-label" htmlFor="pdf-rotate-name">
                {t("r.name")}
              </label>
              <input
                id="pdf-rotate-name"
                type="text"
                className="pdf-name-in"
                value={outName}
                onChange={(e) => setOutName(e.target.value)}
                spellCheck={false}
                autoComplete="off"
              />

              <PdfProcessingStatus state={state} error={error} processingLabel={t("r.running")} />

              <button
                type="button"
                className="btn btn-primary pdf-run"
                onClick={run}
                disabled={state === "processing" || !hasRotation}
              >
                {t("r.run")}
              </button>
              {result && (
                <button type="button" className="btn btn-outline pdf-download" onClick={download}>
                  {t("r.download")}
                </button>
              )}
              <p className="pdf-memory-hint">{t("r.memoryHint")}</p>
            </div>
          </div>

          <div className="pdf-canvas">
            <PdfThumbnailGrid
              doc={doc}
              pageCount={pdf.pageCount}
              selected={selected}
              rotations={rotations}
              onToggle={toggle}
              pageLabel={(n) => `${n}`}
            />
          </div>
        </div>
      )}
    </>
  );
}

function RotIcon({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
      style={{ transform: dir === "left" ? "scaleX(-1)" : undefined }}
    >
      <path d="M9 3a5 5 0 1 1-5 5" strokeLinecap="round" />
      <path d="M9 1.5V4H6.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
