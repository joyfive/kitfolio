/* ============================================================
   PDF 도구 공통 제한값 (상수).
   브라우저 메모리는 기기마다 다르므로 제한 이하에서도 실패할 수 있습니다.
   그 안내는 각 도구 UI/FAQ 에서 제공합니다.
   ============================================================ */

export const MB = 1024 * 1024;

export const PDF_LIMITS = {
  /** 파일 1개 최대 크기 */
  maxFileBytes: 100 * MB,
  /** 병합 시 파일 총합 최대 크기 */
  maxMergeTotalBytes: 200 * MB,
  /** PDF 1개 최대 페이지 수 */
  maxPages: 300,
  /** 병합 최대 파일 수 */
  maxMergeFiles: 30,
  /** 분할 결과 최대 파일 수 */
  maxSplitResults: 300,
} as const;

/** 사람이 읽는 파일 크기 표기 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < MB) return `${(bytes / 1024).toFixed(0)} KB`;
  const mb = bytes / MB;
  return `${mb >= 10 ? mb.toFixed(0) : mb.toFixed(1)} MB`;
}
