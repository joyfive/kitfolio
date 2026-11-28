"use client";

import { toast } from "./toast";

const isEn = () => typeof document !== "undefined" && document.documentElement.lang.startsWith("en");

/** 클립보드 복사 + 결과 토스트. 실패하면 에러 토스트를 띄우고 예외를 다시 던진다(호출부 흐름 유지). */
export async function copyText(text: string, opts: { success?: string; fail?: string } = {}): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    toast.error(opts.fail ?? (isEn() ? "Could not copy. Select the text and copy it manually." : "복사하지 못했어요. 직접 선택해서 복사해 주세요."), { key: "copy-fail" });
    throw e;
  }
  toast.success(opts.success ?? (isEn() ? "Copied" : "복사했어요"), { key: "copy-ok" });
}
