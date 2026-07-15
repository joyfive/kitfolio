/* ============================================================
   Canvas 렌더러 — 미리보기 · PNG 다운로드 · 자체 판독 검증에 사용.
   Quiet Zone 은 항상 포함(기본 4 modules). 배경색을 채운다.
   ============================================================ */
import { buildQrPath } from "./buildQrPath";
import type { QrMatrix } from "./createQrMatrix";
import type { QrModuleShape } from "./qrShapes";

export const QUIET_ZONE = 4; // 고정 — 사용자가 축소/제거 불가

export type QrRenderOptions = {
  shape: QrModuleShape;
  fg: string; // QR(전경) 색
  bg: string; // 배경 색
};

/** 목표 픽셀 크기에 맞춰, 흐림 방지를 위해 정수 module 크기로 보정한 캔버스 변. */
export function crispCanvasSize(matrixSize: number, target: number): number {
  const total = matrixSize + QUIET_ZONE * 2;
  const cell = Math.max(1, Math.floor(target / total));
  return cell * total;
}

/** 캔버스에 QR 을 렌더한다. pixelSize 는 캔버스 한 변(px). */
export function renderQrCanvas(
  canvas: HTMLCanvasElement,
  matrix: QrMatrix,
  opts: QrRenderOptions,
  pixelSize: number,
): void {
  const total = matrix.size + QUIET_ZONE * 2;
  const cell = pixelSize / total;

  canvas.width = pixelSize;
  canvas.height = pixelSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, pixelSize, pixelSize);
  ctx.fillStyle = opts.bg;
  ctx.fillRect(0, 0, pixelSize, pixelSize);

  const d = buildQrPath(matrix, opts.shape, cell, QUIET_ZONE);
  if (d) {
    ctx.fillStyle = opts.fg;
    ctx.fill(new Path2D(d));
  }
}
