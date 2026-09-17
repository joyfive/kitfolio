/* ============================================================
   캔버스 생성·인코딩 공통 헬퍼.

   이미지 최적화(optimize.ts)와 리사이즈·크롭(transform.ts)이 같은 경로로
   인코딩하도록 한곳에 모았다. OffscreenCanvas 가 있으면 우선 사용하고,
   없으면 DOM 캔버스로 떨어진다.
   ============================================================ */
import { ImageError } from "./imageErrors";

export type AnyCanvas = OffscreenCanvas | HTMLCanvasElement;
export type AnyContext = OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;

/** 캔버스 생성: OffscreenCanvas 가 있으면 우선 사용 (메인 스레드 DOM 부담 감소) */
export function createCanvas(width: number, height: number): AnyCanvas {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(width, height);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/** 2D 컨텍스트. 얻지 못하면 인코딩을 진행할 수 없으므로 실패로 본다. */
export function canvasContext(canvas: AnyCanvas, fallback: "encode-failed" | "process-failed"): AnyContext {
  const ctx = canvas.getContext("2d") as AnyContext | null;
  if (!ctx) throw new ImageError(fallback);
  return ctx;
}

/** 캔버스를 Blob 으로 인코딩 (OffscreenCanvas / HTMLCanvasElement 양쪽 지원) */
export async function canvasToBlob(
  canvas: AnyCanvas,
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
 * 중간 캔버스의 픽셀 버퍼를 즉시 놓아준다.
 * 단계 축소는 캔버스를 여러 개 만들기 때문에, GC 를 기다리지 않고
 * 크기를 0 으로 줄여 큰 버퍼를 바로 반납한다.
 */
export function releaseCanvas(canvas: AnyCanvas | null): void {
  if (!canvas) return;
  canvas.width = 0;
  canvas.height = 0;
}
