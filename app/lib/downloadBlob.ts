/* ============================================================
   Blob 다운로드 헬퍼 (도구 공통).
   Object URL 을 만들고 클릭 후 정리합니다.
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
