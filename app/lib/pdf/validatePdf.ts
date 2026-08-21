/* ============================================================
   PDF 파일 사전 검증: 바이트를 읽기 전에 형식/크기를 빠르게 확인합니다.
   깊은 검증(암호화·손상·페이지 수)은 loadPdf.ts 에서 pdf-lib 로 수행합니다.
   ============================================================ */
import { PDF_LIMITS } from "./pdfLimits";
import { PdfError } from "./pdfErrors";

export function isPdfFile(file: File): boolean {
  return file.type === "application/pdf" || /\.pdf$/i.test(file.name);
}

export function assertPdfFile(file: File): void {
  if (!isPdfFile(file)) throw new PdfError("invalid-file");
}

export function assertFileSize(file: File): void {
  if (file.size > PDF_LIMITS.maxFileBytes) throw new PdfError("file-too-large");
}
