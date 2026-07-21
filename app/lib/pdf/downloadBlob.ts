/* ============================================================
   Blob 다운로드 헬퍼. Object URL 을 만들고 클릭 후 즉시 정리합니다.
   ============================================================ */

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // 브라우저가 다운로드를 시작할 시간을 준 뒤 메모리 해제
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/** Uint8Array (pdf-lib 출력) → application/pdf Blob */
export function pdfBytesToBlob(bytes: Uint8Array): Blob {
  // 안전한 ArrayBuffer 복사본으로 Blob 생성 (원본 버퍼 detach 영향 방지)
  const copy = new Uint8Array(bytes);
  return new Blob([copy], { type: "application/pdf" });
}

/** 파일명에서 확장자를 제거한 베이스 이름 */
export function baseName(name: string): string {
  return name.replace(/\.pdf$/i, "");
}

/** 다운로드 파일명 정규화 — 경로 구분자/제어문자 제거, .pdf 보장 */
export function safePdfName(name: string, fallback = "kitfolio.pdf"): string {
  let n = (name || "").trim().replace(/[\\/:*?"<>|]+/g, "-");
  if (!n) n = fallback;
  if (!/\.pdf$/i.test(n)) n += ".pdf";
  return n;
}
