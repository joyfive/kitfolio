"use client";

import { useEffect } from "react";
import { useLang } from "../lib/i18n";
import { pdfErrorMessage, type PdfErrorType } from "../lib/pdf/pdfErrors";
import { toast } from "../lib/toast";

export type PdfProcessState = "idle" | "processing" | "error";

/** 처리 상태 알림: 화면에는 아무것도 그리지 않고 진행 · 오류 · 완료를 토스트로 알린다. */
export default function PdfProcessingStatus({
  state,
  error,
  processingLabel,
  done = false,
}: {
  state: PdfProcessState;
  error?: PdfErrorType | null;
  processingLabel: string;
  /** 결과가 만들어졌을 때 true: 완료 토스트 */
  done?: boolean;
}) {
  const { lang } = useLang();

  useEffect(() => {
    if (state === "error" && error) toast.error(pdfErrorMessage(error, lang), { key: "pdf-error" });
  }, [state, error, lang]);

  useEffect(() => {
    if (state === "processing" && processingLabel) toast.info(processingLabel, { key: "pdf-busy" });
  }, [state, processingLabel]);

  useEffect(() => {
    if (done) toast.success(lang === "ko" ? "처리를 마쳤어요. 결과를 내려받아 주세요." : "Done. Download the result below.", { key: "pdf-done" });
  }, [done, lang]);

  return null;
}
