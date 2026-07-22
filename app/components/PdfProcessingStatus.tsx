"use client";

import { useLang } from "../lib/i18n";
import { pdfErrorMessage, type PdfErrorType } from "../lib/pdf/pdfErrors";

export type PdfProcessState = "idle" | "processing" | "error";

/** 처리 상태 알림 — 진행 스피너 또는 정규화된 오류 메시지. */
export default function PdfProcessingStatus({
  state,
  error,
  processingLabel,
}: {
  state: PdfProcessState;
  error?: PdfErrorType | null;
  processingLabel: string;
}) {
  const { lang } = useLang();

  if (state === "error" && error) {
    return (
      <div className="pdf-status pdf-status-error" role="alert">
        {pdfErrorMessage(error, lang)}
      </div>
    );
  }
  if (state === "processing") {
    return (
      <div className="pdf-status pdf-status-busy" role="status" aria-live="polite">
        <span className="pdf-spinner" aria-hidden />
        <span>{processingLabel}</span>
      </div>
    );
  }
  return null;
}
