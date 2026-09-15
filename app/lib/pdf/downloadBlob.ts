/* ============================================================
   PDF 도구용 다운로드 헬퍼.
   일반 Blob 다운로드는 도구 공통 모듈(lib/downloadBlob)에 있고,
   여기에는 PDF 전용 변환·파일명 규칙만 둔다.
   ============================================================ */

export { downloadBlob } from "../downloadBlob";

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

/** 다운로드 파일명 정규화: 경로 구분자/제어문자 제거, .pdf 보장 */
export function safePdfName(name: string, fallback = "kitfolio.pdf"): string {
  let n = (name || "").trim().replace(/[\\/:*?"<>|]+/g, "-");
  if (!n) n = fallback;
  if (!/\.pdf$/i.test(n)) n += ".pdf";
  return n;
}
