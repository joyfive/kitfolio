/* ============================================================
   브라우저 안에서 이미지를 잘라내고 크기를 바꿔 다시 인코딩한다.

   이 모듈의 책임은 "픽셀 크기와 남길 영역"이다. 포맷·품질은 결과 파일을
   저장하기 위한 옵션으로만 받는다 (용량 최적화는 optimize.ts 의 책임).

   처리 경로: File → createImageBitmap → (단계 축소) → canvas.drawImage → Blob.
   추가 라이브러리 없이 브라우저 표준 API 만 쓴다.

   ── 단계 축소를 쓰는 이유 ─────────────────────────────────
   drawImage 로 한 번에 크게 줄이면 원본 픽셀을 드문드문 샘플링해서
   가는 선과 글자가 끊겨 보인다. 최종 크기의 2배에 가까워질 때까지 절반씩
   줄인 뒤 마지막 한 번만 목표 크기로 그리면 같은 API 로 훨씬 고르게 줄어든다.
   ============================================================ */
import {
  JPEG_MATTE,
  MIME,
  supportsAlpha,
  supportsQuality,
  type ImageFormat,
} from "./imageFormats";
import { ImageError } from "./imageErrors";
import { withinPixelLimits } from "./imageLimits";
import {
  canvasContext,
  canvasToBlob,
  createCanvas,
  releaseCanvas,
  type AnyCanvas,
} from "./canvas";
import { clampQuality, decodeImage } from "./optimize";

/**
 * 원본에서 잘라낼 영역(sx·sy·sw·sh)과 저장할 크기(outWidth·outHeight).
 * Resize 모드는 영역이 이미지 전체인 특수한 경우일 뿐이라 같은 타입을 쓴다.
 */
export type Transform = {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  outWidth: number;
  outHeight: number;
};

export type TransformedImage = {
  blob: Blob;
  bytes: number;
  width: number;
  height: number;
};

/** 출력 포맷 선택: "original" 은 입력 포맷을 그대로 유지한다. */
export type OutputChoice = "original" | ImageFormat;

export const OUTPUT_CHOICES: readonly OutputChoice[] = [
  "original",
  "png",
  "jpeg",
  "webp",
] as const;

/** 선택값과 입력 포맷으로 실제 출력 포맷을 정한다. */
export function resolveFormat(choice: OutputChoice, inputFormat: ImageFormat): ImageFormat {
  return choice === "original" ? inputFormat : choice;
}

/** 이미지 전체를 그대로 쓰는 Transform (Resize 모드) */
export function fullTransform(
  imgWidth: number,
  imgHeight: number,
  outWidth: number,
  outHeight: number,
): Transform {
  return { sx: 0, sy: 0, sw: imgWidth, sh: imgHeight, outWidth, outHeight };
}

/**
 * 단계 축소로 비트맵을 목표 크기의 캔버스에 그린다.
 * 중간 캔버스는 만들어진 즉시 다음 단계에서 버려지므로 메모리 점유가
 * 원본 한 장을 크게 넘지 않는다.
 */
function drawScaled(bitmap: ImageBitmap, t: Transform, matte: string | null): AnyCanvas {
  let step: AnyCanvas | null = null;
  let w = t.sw;
  let h = t.sh;

  while (w > t.outWidth * 2 && h > t.outHeight * 2) {
    const nw = Math.max(t.outWidth, Math.round(w / 2));
    const nh = Math.max(t.outHeight, Math.round(h / 2));
    const next = createCanvas(nw, nh);
    const ctx = canvasContext(next, "process-failed");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    if (step) ctx.drawImage(step, 0, 0, w, h, 0, 0, nw, nh);
    else ctx.drawImage(bitmap, t.sx, t.sy, t.sw, t.sh, 0, 0, nw, nh);
    releaseCanvas(step);
    step = next;
    w = nw;
    h = nh;
  }

  const out = createCanvas(t.outWidth, t.outHeight);
  const ctx = canvasContext(out, "process-failed");
  // JPG 는 알파 채널이 없다. 투명 영역이 검게 저장되지 않도록 흰색을 먼저 깐다.
  if (matte) {
    ctx.fillStyle = matte;
    ctx.fillRect(0, 0, t.outWidth, t.outHeight);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if (step) ctx.drawImage(step, 0, 0, w, h, 0, 0, t.outWidth, t.outHeight);
  else ctx.drawImage(bitmap, t.sx, t.sy, t.sw, t.sh, 0, 0, t.outWidth, t.outHeight);
  releaseCanvas(step);
  return out;
}

/**
 * 결과가 UI 에 표시한 Output 값과 정말 같은 픽셀 크기인지 확인한다.
 *
 * 인코더는 크기를 조용히 바꿀 수 있다 (WebP 는 한 변이 16383px 를 넘으면
 * 오류 없이 잘라낸 이미지를 돌려준다). 이 도구가 약속하는 것이 "정확한
 * width × height" 이므로, 어긋난 파일을 건네는 대신 실패로 처리한다.
 */
async function assertOutputSize(blob: Blob, width: number, height: number): Promise<void> {
  let check: ImageBitmap;
  try {
    check = await createImageBitmap(blob);
  } catch {
    throw new ImageError("process-failed");
  }
  const changed = check.width !== width || check.height !== height;
  check.close();
  if (changed) throw new ImageError("output-too-large");
}

/**
 * 파일 하나를 잘라내고 크기를 바꿔 다시 인코딩한다.
 * decodeImage 가 EXIF 회전을 픽셀에 적용하므로, 좌표와 결과는 사용자가
 * 화면에서 보는 방향과 항상 일치한다.
 */
export async function transformImage(
  file: Blob,
  transform: Transform,
  format: ImageFormat,
  quality: number,
): Promise<TransformedImage> {
  if (!withinPixelLimits(transform.outWidth, transform.outHeight)) {
    throw new ImageError("output-too-large");
  }

  const image = await decodeImage(file);
  let canvas: AnyCanvas | null = null;
  try {
    const matte = supportsAlpha(format) ? null : JPEG_MATTE;
    canvas = drawScaled(image.bitmap, transform, matte);

    const q = supportsQuality(format) ? clampQuality(quality) / 100 : undefined;
    const blob = await canvasToBlob(canvas, MIME[format], q);

    // 브라우저가 요청한 포맷을 지원하지 않으면 조용히 PNG 로 떨어진다. 이는 실패로 본다.
    if (blob.type && blob.type !== MIME[format]) throw new ImageError("process-failed");
    if (blob.size === 0) throw new ImageError("process-failed");

    await assertOutputSize(blob, transform.outWidth, transform.outHeight);
    return {
      blob,
      bytes: blob.size,
      width: transform.outWidth,
      height: transform.outHeight,
    };
  } finally {
    releaseCanvas(canvas);
    image.bitmap.close();
  }
}

/**
 * 파일의 표시 방향 기준 픽셀 크기만 읽는다.
 * 업로드 직후 원본 정보를 보여주기 위한 용도이며, 비트맵은 바로 해제한다.
 */
export async function readImageSize(file: Blob): Promise<{ width: number; height: number }> {
  const image = await decodeImage(file);
  const { width, height } = image;
  image.bitmap.close();
  return { width, height };
}
