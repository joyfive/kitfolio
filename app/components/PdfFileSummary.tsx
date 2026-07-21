"use client";

import { formatBytes } from "../lib/pdf/pdfLimits";

/** 단일 PDF 파일 요약 카드 (분할·회전·삭제의 파일 정보). */
export default function PdfFileSummary({
  name,
  size,
  pageCount,
  pagesLabel,
  onClear,
  clearLabel,
}: {
  name: string;
  size: number;
  pageCount: number;
  pagesLabel: string;
  onClear?: () => void;
  clearLabel?: string;
}) {
  return (
    <div className="pdf-file-summary">
      <span className="pdf-file-ico" aria-hidden>
        PDF
      </span>
      <div className="pdf-file-meta">
        <span className="pdf-file-name" title={name}>
          {name}
        </span>
        <span className="pdf-file-sub">
          {formatBytes(size)} · {pageCount} {pagesLabel}
        </span>
      </div>
      {onClear && (
        <button
          type="button"
          className="btn btn-sm btn-ghost pdf-file-clear"
          onClick={onClear}
        >
          {clearLabel}
        </button>
      )}
    </div>
  );
}
