"use client";

/* ============================================================
   단일 PDF 의 pdf.js 문서 수명주기 관리 훅.
   bytes 가 바뀌거나 언마운트되면 이전 문서를 destroy 해 메모리를 정리합니다.
   ============================================================ */
import { useEffect, useState } from "react";
import { getPdfjsDocument, type PDFDocumentProxy } from "./pdfjs";

export function usePdfjsDoc(
  bytes: Uint8Array | null | undefined,
): PDFDocumentProxy | null {
  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null);

  useEffect(() => {
    let cancelled = false;
    let created: PDFDocumentProxy | null = null;
    setDoc(null);
    if (!bytes) return;

    getPdfjsDocument(bytes)
      .then((d) => {
        if (cancelled) {
          void d.loadingTask.destroy();
          return;
        }
        created = d;
        setDoc(d);
      })
      .catch(() => {
        /* 썸네일 실패는 무시: 편집은 pdf-lib 로 계속 가능 */
      });

    return () => {
      cancelled = true;
      if (created) void created.loadingTask.destroy();
    };
  }, [bytes]);

  return doc;
}
