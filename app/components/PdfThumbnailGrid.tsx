"use client";

import PdfPageThumbnail from "./PdfPageThumbnail";
import type { PDFDocumentProxy } from "../lib/pdf/pdfjs";

/** 페이지 썸네일 그리드: 선택/삭제표시/회전 미리보기를 공용으로 처리. */
export default function PdfThumbnailGrid({
  doc,
  pageCount,
  selected,
  markDeleted,
  rotations,
  onToggle,
  pageLabel,
}: {
  doc: PDFDocumentProxy | null;
  pageCount: number;
  /** 0-based 선택 페이지 */
  selected?: Set<number>;
  /** 0-based 삭제 예정 페이지 (흐리게 + 오버레이) */
  markDeleted?: Set<number>;
  /** 0-based 페이지별 회전 델타(도) */
  rotations?: Map<number, number>;
  onToggle?: (index: number) => void;
  /** 1-based 페이지 번호 → 표시 라벨 */
  pageLabel: (n: number) => string;
}) {
  const clickable = !!onToggle;

  return (
    <div className="pdf-thumb-grid">
      {Array.from({ length: pageCount }, (_, i) => {
        const isSel = selected?.has(i) ?? false;
        const isDel = markDeleted?.has(i) ?? false;
        const rot = ((rotations?.get(i) ?? 0) % 360 + 360) % 360;
        return (
          <div
            key={i}
            className={
              "pdf-thumb" +
              (isSel ? " is-selected" : "") +
              (isDel ? " is-deleted" : "") +
              (clickable ? " is-clickable" : "")
            }
            onClick={clickable ? () => onToggle!(i) : undefined}
            role={clickable ? "checkbox" : undefined}
            aria-checked={clickable ? isSel : undefined}
            aria-label={pageLabel(i + 1)}
            tabIndex={clickable ? 0 : undefined}
            onKeyDown={
              clickable
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onToggle!(i);
                    }
                  }
                : undefined
            }
          >
            <PdfPageThumbnail doc={doc} pageNumber={i + 1} rotation={rot} />
            {isSel && (
              <span className="pdf-thumb-check" aria-hidden>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3.5 8.5l3 3 6-6.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
            {isDel && (
              <span className="pdf-thumb-trash" aria-hidden>
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M4 6h12M8 6V4h4v2M6 6l.7 9a1 1 0 0 0 1 .9h4.6a1 1 0 0 0 1-.9L14 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            )}
            {rot !== 0 && <span className="pdf-thumb-rot">{rot}°</span>}
            <span className="pdf-thumb-num">{pageLabel(i + 1)}</span>
          </div>
        );
      })}
    </div>
  );
}
