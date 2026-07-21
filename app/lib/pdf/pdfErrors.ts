/* ============================================================
   PDF 처리 공통 오류 타입 + 다국어 메시지.
   컴포넌트는 PdfErrorType 만 다루고, 표시 문구는 이 파일에서 가져옵니다.
   ============================================================ */
import type { Lang } from "../content";

export type PdfErrorType =
  | "invalid-file"
  | "encrypted-file"
  | "corrupted-file"
  | "file-too-large"
  | "too-many-pages"
  | "too-many-files"
  | "memory-error"
  | "processing-error";

/** 예외로 던져 상위에서 PdfErrorType 로 잡을 수 있게 하는 에러 */
export class PdfError extends Error {
  type: PdfErrorType;
  constructor(type: PdfErrorType, message?: string) {
    super(message ?? type);
    this.name = "PdfError";
    this.type = type;
  }
}

const MESSAGES: Record<Lang, Record<PdfErrorType, string>> = {
  ko: {
    "invalid-file": "PDF 파일만 업로드할 수 있습니다.",
    "encrypted-file": "암호로 보호된 PDF는 처리할 수 없습니다.",
    "corrupted-file": "PDF 파일을 읽을 수 없습니다. 다른 파일로 다시 시도해 주세요.",
    "file-too-large": "파일 크기가 처리 가능한 범위를 초과했습니다.",
    "too-many-pages": "페이지 수가 처리 가능한 범위를 초과했습니다.",
    "too-many-files": "파일 수가 처리 가능한 범위를 초과했습니다.",
    "memory-error":
      "브라우저 메모리가 부족합니다. 파일 수나 크기를 줄여 다시 시도해 주세요.",
    "processing-error": "PDF 처리 중 오류가 발생했습니다. 원본 파일을 확인해 주세요.",
  },
  en: {
    "invalid-file": "Only PDF files can be uploaded.",
    "encrypted-file": "Password-protected PDFs cannot be processed.",
    "corrupted-file": "This PDF could not be read. Please try a different file.",
    "file-too-large": "The file size exceeds the supported range.",
    "too-many-pages": "The page count exceeds the supported range.",
    "too-many-files": "The number of files exceeds the supported range.",
    "memory-error":
      "The browser is low on memory. Reduce the number or size of files and try again.",
    "processing-error":
      "An error occurred while processing the PDF. Please check the original file.",
  },
};

export function pdfErrorMessage(type: PdfErrorType, lang: Lang): string {
  return MESSAGES[lang][type];
}

/** 임의의 예외를 PdfErrorType 으로 정규화 */
export function normalizePdfError(err: unknown): PdfErrorType {
  if (err instanceof PdfError) return err.type;
  const msg = String((err as Error)?.message ?? err ?? "").toLowerCase();
  if (msg.includes("encrypt") || msg.includes("password")) return "encrypted-file";
  if (msg.includes("memory") || msg.includes("allocation")) return "memory-error";
  if (
    msg.includes("invalid") ||
    msg.includes("parse") ||
    msg.includes("corrupt") ||
    msg.includes("no pdf header") ||
    msg.includes("failed to load")
  )
    return "corrupted-file";
  return "processing-error";
}
