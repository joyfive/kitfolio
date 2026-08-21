/* ============================================================
   pdf.js (pdfjs-dist) 설정: 페이지 썸네일 렌더링 전용.
   pdf.js 는 브라우저 전역(DOMMatrix 등)에 의존하므로 모듈 최상위가 아니라
   실제 호출 시점에 동적 import 한다 (서버 프리렌더에서 평가되지 않도록).
   worker 는 public/pdf.worker.min.mjs (버전 동기화용 커밋본) 사용.
   PDF 편집(병합·분할·회전·삭제)은 pdf-lib 가 담당하고 여기서는 미리보기만 처리한다.
   ============================================================ */
import type { PDFDocumentProxy } from "pdfjs-dist";

let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;

async function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((mod) => {
      mod.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      return mod;
    });
  }
  return pdfjsPromise;
}

/** bytes 로 pdf.js 문서 로드. 원본 버퍼가 detach 되지 않도록 복사본을 넘깁니다. */
export async function getPdfjsDocument(
  bytes: Uint8Array,
): Promise<PDFDocumentProxy> {
  const pdfjsLib = await loadPdfjs();
  const task = pdfjsLib.getDocument({ data: new Uint8Array(bytes) });
  return task.promise;
}

export type { PDFDocumentProxy };
