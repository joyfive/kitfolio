/* ============================================================
   브라우저 안에서 이미지를 다시 인코딩한다.

   핵심 불변 조건: 가로·세로 픽셀 수와 비율은 바꾸지 않는다.
   이 모듈은 포맷과 압축 품질만 바꾼다 (리사이즈·크롭은 이 도구의 책임이 아님).

   처리 경로: File → createImageBitmap → canvas.drawImage → canvas.toBlob.
   추가 라이브러리 없이 브라우저 표준 API 만 쓴다.
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

/** 디코딩된 원본 이미지 */
export type DecodedImage = {
  bitmap: ImageBitmap;
  width: number;
  height: number;
};

/** 최적화 결과 */
export type OptimizedImage = {
  blob: Blob;
  bytes: number;
  width: number;
  height: number;
};

/**
 * 파일을 ImageBitmap 으로 디코딩한다.
 *
 * imageOrientation: "from-image" 로 EXIF 회전을 적용한다. 재인코딩 과정에서
 * EXIF 는 사라지므로, 회전을 미리 픽셀에 적용해야 결과가 원본과 같은 방향으로
 * 보인다. 이때 width/height 는 "사용자가 화면에서 보는" 크기이며, 결과도
 * 같은 값을 그대로 유지한다.
 */
export async function decodeImage(file: Blob): Promise<DecodedImage> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new ImageError("decode-failed");
  }

  const { width, height } = bitmap;
  if (!withinPixelLimits(width, height)) {
    bitmap.close();
    throw new ImageError("image-too-large");
  }
  return { bitmap, width, height };
}

/** 캔버스 생성: OffscreenCanvas 가 있으면 우선 사용 (메인 스레드 DOM 부담 감소) */
function createCanvas(width: number, height: number): OffscreenCanvas | HTMLCanvasElement {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(width, height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/** 캔버스를 Blob 으로 인코딩 (OffscreenCanvas / HTMLCanvasElement 양쪽 지원) */
async function canvasToBlob(
  canvas: OffscreenCanvas | HTMLCanvasElement,
  mime: string,
  quality: number | undefined,
): Promise<Blob> {
  if ("convertToBlob" in canvas) {
    return canvas.convertToBlob({ type: mime, quality });
  }
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new ImageError("encode-failed"))),
      mime,
      quality,
    );
  });
}

/**
 * 디코딩된 비트맵을 지정한 포맷·품질로 인코딩한다.
 * 캔버스 크기는 항상 원본 픽셀 크기와 같으므로 dimensions 는 변하지 않는다.
 */
export async function encodeImage(
  image: DecodedImage,
  format: ImageFormat,
  quality: number,
): Promise<Blob> {
  const { bitmap, width, height } = image;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d") as
    | OffscreenCanvasRenderingContext2D
    | CanvasRenderingContext2D
    | null;
  if (!ctx) throw new ImageError("encode-failed");

  // JPG 는 알파 채널이 없다. 투명 영역이 검게 저장되지 않도록 흰색을 먼저 깐다.
  if (!supportsAlpha(format)) {
    ctx.fillStyle = JPEG_MATTE;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(bitmap, 0, 0);

  const q = supportsQuality(format) ? clampQuality(quality) / 100 : undefined;
  const blob = await canvasToBlob(canvas, MIME[format], q);

  // 브라우저가 요청한 포맷을 지원하지 않으면 조용히 PNG 로 떨어진다. 이는 실패로 본다.
  if (blob.type && blob.type !== MIME[format]) throw new ImageError("encode-failed");
  if (blob.size === 0) throw new ImageError("encode-failed");
  return blob;
}

/**
 * 결과가 정말 원본과 같은 픽셀 크기인지 확인한다.
 *
 * 인코더는 크기를 조용히 바꿀 수 있다. 예를 들어 WebP 는 한 변이 16383px 를
 * 넘으면 오류 없이 잘라낸 이미지를 돌려준다. 입력 단계에서 걸러내고 있지만,
 * "픽셀 크기를 바꾸지 않는다"가 이 도구의 핵심 약속이므로 결과를 한 번 더
 * 검증해서, 크기가 달라졌다면 잘못된 파일을 건네는 대신 실패로 처리한다.
 */
async function assertSameSize(blob: Blob, width: number, height: number): Promise<void> {
  let check: ImageBitmap;
  try {
    check = await createImageBitmap(blob);
  } catch {
    throw new ImageError("encode-failed");
  }
  const changed = check.width !== width || check.height !== height;
  check.close();
  if (changed) throw new ImageError("encode-failed");
}

/** 품질 값을 1~100 정수로 고정 */
export function clampQuality(quality: number): number {
  if (!Number.isFinite(quality)) return 80;
  return Math.min(100, Math.max(1, Math.round(quality)));
}

/**
 * 파일 하나를 최적화한다: 디코딩 → 재인코딩 → 비트맵 해제.
 * 한 파일의 실패가 다른 파일을 막지 않도록, 호출부에서 파일 단위로 catch 한다.
 */
export async function optimizeImage(
  file: Blob,
  format: ImageFormat,
  quality: number,
): Promise<OptimizedImage> {
  const image = await decodeImage(file);
  try {
    const blob = await encodeImage(image, format, quality);
    await assertSameSize(blob, image.width, image.height);
    return { blob, bytes: blob.size, width: image.width, height: image.height };
  } finally {
    image.bitmap.close();
  }
}
