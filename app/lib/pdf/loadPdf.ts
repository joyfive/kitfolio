/* ============================================================
   PDF 로드 + 깊은 검증. File → 검증된 LoadedPdf(원본 바이트 보관).
   원본 바이트는 마스터 사본으로 유지하고, 편집·썸네일에는 항상 복사본을
   넘겨 detach(버퍼 무효화) 를 방지합니다.
   ============================================================ */
import { PDFDocument, EncryptedPDFError } from "pdf-lib";
import { PdfError } from "./pdfErrors";
import { PDF_LIMITS } from "./pdfLimits";
import { assertPdfFile, assertFileSize } from "./validatePdf";

export type LoadedPdf = {
  id: string;
  file: File;
  name: string;
  size: number;
  /** 원본 바이트 (마스터 사본) */
  bytes: Uint8Array;
  pageCount: number;
};

export async function readFileBytes(file: File): Promise<Uint8Array> {
  const buf = await file.arrayBuffer();
  return new Uint8Array(buf);
}

/** File 을 검증하고 LoadedPdf 로 로드. 실패 시 PdfError 를 던집니다. */
export async function loadPdfFile(file: File): Promise<LoadedPdf> {
  assertPdfFile(file);
  assertFileSize(file);

  const bytes = await readFileBytes(file);

  let doc: PDFDocument;
  try {
    doc = await PDFDocument.load(bytes, {
      ignoreEncryption: false,
      updateMetadata: false,
    });
  } catch (e) {
    if (e instanceof EncryptedPDFError) throw new PdfError("encrypted-file");
    throw new PdfError("corrupted-file");
  }

  if (doc.isEncrypted) throw new PdfError("encrypted-file");

  const pageCount = doc.getPageCount();
  if (pageCount < 1) throw new PdfError("corrupted-file");
  if (pageCount > PDF_LIMITS.maxPages) throw new PdfError("too-many-pages");

  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `pdf-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    file,
    name: file.name,
    size: file.size,
    bytes,
    pageCount,
  };
}
