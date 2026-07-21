"use client";

import { useCallback, useRef, useState } from "react";
import PageHead from "./PageHead";
import Faq from "./Faq";
import RelatedTools from "./RelatedTools";
import PdfToolTabs from "./PdfToolTabs";
import PdfDropzone from "./PdfDropzone";
import PdfPageThumbnail from "./PdfPageThumbnail";
import PdfProcessingStatus, { type PdfProcessState } from "./PdfProcessingStatus";
import { useLang, useT, type Dict } from "../lib/i18n";
import { loadPdfFile, type LoadedPdf } from "../lib/pdf/loadPdf";
import { mergePdfs } from "../lib/pdf/operations";
import { normalizePdfError, PdfError, type PdfErrorType } from "../lib/pdf/pdfErrors";
import { PDF_LIMITS, formatBytes } from "../lib/pdf/pdfLimits";
import { downloadBlob, pdfBytesToBlob, safePdfName } from "../lib/pdf/downloadBlob";

const DICT: Dict = {
  ko: {
    "m.drop": "PDF 파일을 여기로 끌어다 놓거나 선택하세요",
    "m.dropHint": "여러 파일 선택 가능 · 최대 30개 · 파일당 100MB",
    "m.add": "파일 추가",
    "m.clearAll": "전체 초기화",
    "m.files": "파일 목록",
    "m.up": "위로",
    "m.down": "아래로",
    "m.remove": "삭제",
    "m.result": "병합 결과",
    "m.fileCount": "파일 수",
    "m.totalPages": "총 페이지 수",
    "m.estSize": "예상 원본 합계",
    "m.name": "출력 파일명",
    "m.run": "PDF 병합",
    "m.running": "PDF를 병합하고 있습니다…",
    "m.download": "병합된 PDF 다운로드",
    "m.needTwo": "병합하려면 PDF가 2개 이상 필요합니다.",
    "m.pages": "페이지",
    "m.memoryHint":
      "브라우저 메모리는 기기마다 다릅니다. 제한 이하에서도 대용량 파일은 실패할 수 있습니다.",
    "m.order": "병합 순서",
  },
  en: {
    "m.drop": "Drag PDF files here, or choose files",
    "m.dropHint": "Select multiple files · up to 30 · 100MB each",
    "m.add": "Add files",
    "m.clearAll": "Clear all",
    "m.files": "Files",
    "m.up": "Move up",
    "m.down": "Move down",
    "m.remove": "Remove",
    "m.result": "Merge result",
    "m.fileCount": "Files",
    "m.totalPages": "Total pages",
    "m.estSize": "Combined source size",
    "m.name": "Output file name",
    "m.run": "Merge PDF",
    "m.running": "Merging PDFs…",
    "m.download": "Download merged PDF",
    "m.needTwo": "You need at least 2 PDFs to merge.",
    "m.pages": "pages",
    "m.memoryHint":
      "Browser memory varies by device. Large files may fail even below the limits.",
    "m.order": "Merge order",
  },
};

type ResultState = { blob: Blob; url: string; name: string; pages: number } | null;

export default function PdfMerge() {
  const { lang } = useLang();
  const t = useT(DICT);

  const [files, setFiles] = useState<LoadedPdf[]>([]);
  const [state, setState] = useState<PdfProcessState>("idle");
  const [error, setError] = useState<PdfErrorType | null>(null);
  const [warn, setWarn] = useState<string | null>(null);
  const [outName, setOutName] = useState("kitfolio-merged.pdf");
  const [result, setResult] = useState<ResultState>(null);
  const busyRef = useRef(false);
  const resultUrlRef = useRef<string | null>(null);

  const totalPages = files.reduce((s, f) => s + f.pageCount, 0);
  const totalBytes = files.reduce((s, f) => s + f.size, 0);

  const clearResult = useCallback(() => {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = null;
    setResult(null);
  }, []);

  const addFiles = useCallback(
    async (list: FileList | null) => {
      if (!list || list.length === 0) return;
      clearResult();
      setError(null);
      setWarn(null);

      const incoming = Array.from(list);
      const loaded: LoadedPdf[] = [];
      let firstError: PdfErrorType | null = null;

      let runningBytes = totalBytes;
      let runningCount = files.length;

      for (const file of incoming) {
        if (runningCount >= PDF_LIMITS.maxMergeFiles) {
          firstError = firstError ?? "too-many-files";
          break;
        }
        if (runningBytes + file.size > PDF_LIMITS.maxMergeTotalBytes) {
          firstError = firstError ?? "file-too-large";
          break;
        }
        try {
          const pdf = await loadPdfFile(file);
          loaded.push(pdf);
          runningBytes += pdf.size;
          runningCount += 1;
        } catch (e) {
          // 손상/암호화 파일은 제외하고 계속. 첫 오류 유형을 기록.
          const type = e instanceof PdfError ? e.type : normalizePdfError(e);
          firstError = firstError ?? type;
        }
      }

      if (loaded.length > 0) {
        setFiles((prev) => [...prev, ...loaded]);
      }
      if (firstError) setError(firstError);
    },
    [clearResult, files.length, totalBytes],
  );

  const move = useCallback(
    (index: number, dir: -1 | 1) => {
      clearResult();
      setFiles((prev) => {
        const next = [...prev];
        const j = index + dir;
        if (j < 0 || j >= next.length) return prev;
        [next[index], next[j]] = [next[j], next[index]];
        return next;
      });
    },
    [clearResult],
  );

  const remove = useCallback(
    (id: string) => {
      clearResult();
      setError(null);
      setFiles((prev) => prev.filter((f) => f.id !== id));
    },
    [clearResult],
  );

  const clearAll = useCallback(() => {
    clearResult();
    setError(null);
    setWarn(null);
    setFiles([]);
  }, [clearResult]);

  /* ---------- 드래그 정렬 ---------- */
  const dragId = useRef<string | null>(null);
  const onDragStart = (id: string) => (dragId.current = id);
  const onDropRow = (targetId: string) => {
    const from = dragId.current;
    dragId.current = null;
    if (!from || from === targetId) return;
    clearResult();
    setFiles((prev) => {
      const next = [...prev];
      const fi = next.findIndex((f) => f.id === from);
      const ti = next.findIndex((f) => f.id === targetId);
      if (fi < 0 || ti < 0) return prev;
      const [moved] = next.splice(fi, 1);
      next.splice(ti, 0, moved);
      return next;
    });
  };

  const run = useCallback(async () => {
    if (busyRef.current) return;
    if (files.length < 2) {
      setWarn(t("m.needTwo"));
      return;
    }
    busyRef.current = true;
    setState("processing");
    setError(null);
    setWarn(null);
    clearResult();
    try {
      const bytes = await mergePdfs(files.map((f) => ({ bytes: f.bytes })));
      const blob = pdfBytesToBlob(bytes);
      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;
      setResult({ blob, url, name: safePdfName(outName, "kitfolio-merged.pdf"), pages: totalPages });
      setState("idle");
    } catch (e) {
      setError(normalizePdfError(e));
      setState("error");
    } finally {
      busyRef.current = false;
    }
  }, [files, outName, totalPages, t, clearResult]);

  const download = useCallback(() => {
    if (!result) return;
    downloadBlob(result.blob, result.name);
  }, [result]);

  return (
    <>
      <PageHead slug="pdf-merge" />
      <PdfToolTabs active="merge" />

      <div className="pdf-work pdf-work-merge">
        {/* 좌: 파일 목록 · 순서 설정 */}
        <div className="pdf-panel">
          <div className="pdf-panel-inner">
            <PdfDropzone
              onFiles={addFiles}
              multiple
              title={t("m.drop")}
              hint={t("m.dropHint")}
              disabled={state === "processing"}
            />

            {files.length > 0 && (
              <>
                <div className="pdf-list-head">
                  <span className="field-label">
                    {t("m.files")} · {files.length}
                  </span>
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={clearAll}
                  >
                    {t("m.clearAll")}
                  </button>
                </div>

                <ul className="pdf-file-list">
                  {files.map((f, i) => (
                    <li
                      key={f.id}
                      className="pdf-file-card"
                      draggable
                      onDragStart={() => onDragStart(f.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onDropRow(f.id)}
                    >
                      <span className="pdf-file-order">{i + 1}</span>
                      <span className="pdf-file-thumb">
                        <PdfPageThumbnail bytes={f.bytes} pageNumber={1} width={64} />
                      </span>
                      <span className="pdf-file-info">
                        <span className="pdf-file-name" title={f.name}>
                          {f.name}
                        </span>
                        <span className="pdf-file-sub">
                          {formatBytes(f.size)} · {f.pageCount} {t("m.pages")}
                        </span>
                      </span>
                      <span className="pdf-file-actions">
                        <button
                          type="button"
                          className="pdf-icon-btn"
                          aria-label={t("m.up")}
                          disabled={i === 0}
                          onClick={() => move(i, -1)}
                        >
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7">
                            <path d="M8 12V4M4 8l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="pdf-icon-btn"
                          aria-label={t("m.down")}
                          disabled={i === files.length - 1}
                          onClick={() => move(i, 1)}
                        >
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7">
                            <path d="M8 4v8M4 8l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="pdf-icon-btn"
                          aria-label={t("m.remove")}
                          onClick={() => remove(f.id)}
                        >
                          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7">
                            <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                          </svg>
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* 우: 병합 결과 */}
        <div className="pdf-result-panel">
          <div className="pdf-result-inner">
            <span className="field-label">{t("m.result")}</span>

            <dl className="pdf-summary">
              <div>
                <dt>{t("m.fileCount")}</dt>
                <dd>{files.length}</dd>
              </div>
              <div>
                <dt>{t("m.totalPages")}</dt>
                <dd className="pdf-summary-hero">{totalPages}</dd>
              </div>
              <div>
                <dt>{t("m.estSize")}</dt>
                <dd>{formatBytes(totalBytes)}</dd>
              </div>
            </dl>

            <label className="field-label" htmlFor="pdf-merge-name">
              {t("m.name")}
            </label>
            <input
              id="pdf-merge-name"
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
            <PdfProcessingStatus state={state} error={error} processingLabel={t("m.running")} />

            <button
              type="button"
              className="btn btn-primary pdf-run"
              onClick={run}
              disabled={files.length < 2 || state === "processing"}
            >
              {t("m.run")}
            </button>

            {result && (
              <button type="button" className="btn btn-outline pdf-download" onClick={download}>
                {t("m.download")}
              </button>
            )}

            <p className="pdf-memory-hint">{t("m.memoryHint")}</p>
          </div>
        </div>
      </div>

      <Faq slug="pdf-merge" />
      <RelatedTools slug="pdf-merge" />
    </>
  );
}
