"use client";

import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "../lib/pdf/pdfjs";
import { getPdfjsDocument } from "../lib/pdf/pdfjs";
import { renderPageToCanvas } from "../lib/pdf/renderThumbnail";

/**
 * 지연 렌더링 페이지 썸네일.
 * - `doc` 을 주면 공유 문서에서 해당 페이지를 렌더 (분할·회전·삭제 그리드).
 * - `bytes` 를 주면 자체 문서를 만들어 첫 페이지를 렌더하고 즉시 destroy (병합 파일 카드).
 * IntersectionObserver 로 뷰포트에 들어올 때만 렌더한다.
 */
export default function PdfPageThumbnail({
  doc,
  bytes,
  pageNumber = 1,
  rotation = 0,
  width = 220,
}: {
  doc?: PDFDocumentProxy | null;
  bytes?: Uint8Array;
  pageNumber?: number;
  rotation?: number;
  width?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
          }
        }
      },
      { rootMargin: "300px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let cancelled = false;
    let ownDoc: PDFDocumentProxy | null = null;
    setReady(false);

    (async () => {
      try {
        let target = doc ?? null;
        if (!target && bytes) {
          ownDoc = await getPdfjsDocument(bytes);
          target = ownDoc;
        }
        if (!target || cancelled) return;
        await renderPageToCanvas(target, pageNumber, canvas, width, rotation);
        if (!cancelled) setReady(true);
      } catch {
        /* 렌더 실패 시 스켈레톤 유지 */
      } finally {
        // 자체 생성 문서는 렌더 후 즉시 정리 (병합 카드 다중 파일 메모리 절약)
        if (ownDoc) void ownDoc.loadingTask.destroy();
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, doc, bytes, pageNumber, rotation, width]);

  return (
    <div ref={wrapRef} className="pdf-thumb-canvas-wrap">
      <canvas
        ref={canvasRef}
        className={"pdf-thumb-canvas" + (ready ? " is-ready" : "")}
      />
      {!ready && <span className="pdf-thumb-skel" aria-hidden />}
    </div>
  );
}
