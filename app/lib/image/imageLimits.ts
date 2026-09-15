/* ============================================================
   이미지 최적화 도구의 입력 제한값.

   제한을 정한 근거 (2026-09, Chromium 실측 + 브라우저 공통 제약):
   · 디코딩된 비트맵은 픽셀당 4바이트(RGBA)를 쓴다. 100 MP 이미지 한 장이면
     디코딩에만 약 400MB 가 필요하므로, 파일 용량이 아니라 픽셀 수가
     실질적인 상한이다.
   · 한 변의 최대 길이는 캔버스가 아니라 **WebP 포맷 자체**가 결정한다.
     WebP 는 한 변을 16383px 까지만 표현할 수 있고, 그보다 큰 캔버스를 넘기면
     Chromium 은 오류 없이 16383px 로 잘라낸 유효한 WebP 를 돌려준다(실측).
     이 도구의 핵심 약속이 "픽셀 크기를 바꾸지 않는다" 이므로, 그런 조용한
     잘림이 일어날 수 있는 입력은 아예 받지 않는다. (JPG·PNG 는 더 큰 변도
     처리되지만, 출력 포맷은 언제든 바뀔 수 있으므로 상한을 하나로 맞춘다.)
     optimize.ts 가 인코딩 후 결과 크기를 한 번 더 검증하는 것도 같은 이유다.
   · 파일 수·총 용량은 순차 처리로 메모리를 한 장씩만 잡기 때문에
     한 장 제한보다 여유가 있다.

   제한 이하에서도 기기 메모리에 따라 실패할 수 있으므로, UI 는 제한값과
   함께 "기기에 따라 실패할 수 있다"는 안내를 같이 노출한다.
   ============================================================ */

export const MB = 1024 * 1024;

export const IMAGE_LIMITS = {
  /** 파일 1개 최대 크기 */
  maxFileBytes: 50 * MB,
  /** 한 번에 추가할 수 있는 파일 총합 */
  maxTotalBytes: 300 * MB,
  /** 최대 파일 수 */
  maxFiles: 30,
  /** 이미지 한 변의 최대 픽셀 (WebP 포맷 상한) */
  maxSide: 16383,
  /** 이미지 전체 픽셀 수 상한 (디코딩 메모리 기준) */
  maxPixels: 100_000_000,
} as const;

/** UI 안내용 요약값 */
export const LIMIT_SUMMARY = {
  maxFileMb: IMAGE_LIMITS.maxFileBytes / MB,
  maxFiles: IMAGE_LIMITS.maxFiles,
  maxMegapixels: IMAGE_LIMITS.maxPixels / 1_000_000,
  maxSide: IMAGE_LIMITS.maxSide,
} as const;

/** 픽셀 크기가 처리 가능한 범위 안인가 */
export function withinPixelLimits(width: number, height: number): boolean {
  return (
    width > 0 &&
    height > 0 &&
    width <= IMAGE_LIMITS.maxSide &&
    height <= IMAGE_LIMITS.maxSide &&
    width * height <= IMAGE_LIMITS.maxPixels
  );
}
