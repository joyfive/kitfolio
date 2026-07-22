/* ============================================================
   페이지 썸네일 렌더링 — pdf.js 문서의 한 페이지를 캔버스에 그립니다.
   회전 미리보기(rotationDelta)를 페이지 고유 회전에 더해 반영합니다.
   ============================================================ */
import type { PDFDocumentProxy } from "./pdfjs";

/**
 * pdf.js 페이지를 캔버스에 렌더.
 * @param doc          pdf.js 문서
 * @param pageNumber   1-based 페이지 번호
 * @param canvas       대상 캔버스
 * @param targetWidth  렌더 폭(css px). devicePixelRatio 로 선명도 보정.
 * @param rotationDelta 사용자 적용 회전 각(0/90/180/270). 페이지 고유 회전에 가산.
 */
export async function renderPageToCanvas(
  doc: PDFDocumentProxy,
  pageNumber: number,
  canvas: HTMLCanvasElement,
  targetWidth: number,
  rotationDelta = 0,
): Promise<void> {
  const page = await doc.getPage(pageNumber);
  const rotation = (page.rotate + rotationDelta + 360) % 360;
  const unscaled = page.getViewport({ scale: 1, rotation });
  const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
  const scale = (targetWidth / unscaled.width) * dpr;
  const viewport = page.getViewport({ scale, rotation });

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  canvas.style.width = "100%";
  canvas.style.height = "auto";

  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  page.cleanup();
}
