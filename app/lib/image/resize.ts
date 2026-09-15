/* ============================================================
   이미지 리사이즈·크롭 도구: 픽셀 크기 계산 · 입력 검증 · 파일명 규칙.

   순수 함수만 둔다 (브라우저 API 의존 없음 → 테스트 가능).
   실제 디코딩/그리기/인코딩은 transform.ts 에 있다.
   ============================================================ */
import { EXT, baseName, type ImageFormat } from "./imageFormats";
import { IMAGE_LIMITS } from "./imageLimits";

/** Scale 입력 범위 (원본 대비 %) */
export const MIN_SCALE = 1;
export const MAX_SCALE = 500;

/** Scale 빠른 선택값 */
export const SCALE_PRESETS: readonly number[] = [25, 50, 75, 100, 200] as const;

/** width/height 입력의 상한: 한 변의 처리 한계와 같다. */
export const MAX_DIMENSION = IMAGE_LIMITS.maxSide;

/**
 * 비율 잠금 상태에서 반대쪽 축을 계산한다.
 * value 는 from 축의 새 길이이고, 결과는 to 축의 길이다.
 * (예: width 를 바꿨다면 from=originalWidth · to=originalHeight)
 *
 * 1px 미만으로 내려가면 이미지가 사라지므로 최소 1px 로 둔다.
 */
export function lockedDimension(value: number, from: number, to: number): number {
  if (!(from > 0) || !(to > 0) || !(value > 0)) return 1;
  return Math.max(1, Math.round((value * to) / from));
}

/** 원본 대비 배율(%)로 출력 픽셀 크기를 계산한다. */
export function scaleDimensions(
  originalWidth: number,
  originalHeight: number,
  percent: number,
): { width: number; height: number } {
  const pct = clampScale(percent);
  return {
    width: Math.max(1, Math.round((originalWidth * pct) / 100)),
    height: Math.max(1, Math.round((originalHeight * pct) / 100)),
  };
}

/**
 * 현재 출력 width 가 원본 대비 몇 %인지 되돌려 계산한다.
 * width/height 를 직접 수정했을 때 Scale 표시를 갱신하는 용도이며,
 * 표시용이므로 소수 첫째 자리까지만 남긴다.
 */
export function scalePercent(width: number, originalWidth: number): number {
  if (!(originalWidth > 0)) return 100;
  return Math.round((width / originalWidth) * 1000) / 10;
}

/** Scale 입력을 허용 범위로 고정 */
export function clampScale(percent: number): number {
  if (!Number.isFinite(percent)) return 100;
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, percent));
}

/**
 * 사용자가 입력한 픽셀 값을 해석한다.
 * 빈 값·0·음수·소수·숫자가 아닌 값은 모두 null (= 처리하지 않음).
 */
export function parseDimension(raw: string): number | null {
  const text = raw.trim();
  if (!/^\d+$/.test(text)) return null;
  const n = Number(text);
  if (!Number.isSafeInteger(n) || n < 1) return null;
  return n;
}

/** 픽셀 입력을 1 ~ MAX_DIMENSION 범위로 고정 */
export function clampDimension(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(MAX_DIMENSION, Math.max(1, Math.round(n)));
}

/** 출력이 원본보다 커지는가 (확대 화질 안내 노출 기준) */
export function isUpscale(
  outWidth: number,
  outHeight: number,
  originalWidth: number,
  originalHeight: number,
): boolean {
  return outWidth > originalWidth || outHeight > originalHeight;
}

/** 두 변의 비율이 사실상 같은가 (반올림 오차 1px 허용) */
export function sameRatio(w1: number, h1: number, w2: number, h2: number): boolean {
  if (!(w1 > 0 && h1 > 0 && w2 > 0 && h2 > 0)) return false;
  return Math.abs(lockedDimension(w2, w1, h1) - h2) <= 1;
}

/**
 * 결과 파일명.
 *   Resize: {basename}-{width}x{height}.{ext}
 *   Crop:   {basename}-cropped-{width}x{height}.{ext}
 * 확장자는 출력 포맷을 따르며 JPEG 은 통용 표기인 .jpg 를 쓴다.
 */
export function outputName(
  inputName: string,
  mode: "resize" | "crop",
  width: number,
  height: number,
  format: ImageFormat,
): string {
  const suffix = mode === "crop" ? "-cropped" : "";
  return `${baseName(inputName)}${suffix}-${width}x${height}.${EXT[format]}`;
}
