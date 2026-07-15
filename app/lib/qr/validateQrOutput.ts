/* ============================================================
   자체 판독 검증 — 생성한 QR 을 같은 브라우저에서 다시 판독해
   원본 URL 과 일치하는지 확인한다. (모든 단말 인식을 보장하지는 않음)
   ============================================================ */
import { decodeCanvas } from "./decodeQr";
import type { QrMatrix } from "./createQrMatrix";
import {
  crispCanvasSize,
  renderQrCanvas,
  type QrRenderOptions,
} from "./renderQrCanvas";

/**
 * 렌더 결과를 오프스크린 캔버스에 그린 뒤 판독해 expected 와 비교한다.
 * @returns true = 이 브라우저에서 판독 성공(다운로드 허용)
 */
export async function validateQrOutput(
  matrix: QrMatrix,
  opts: QrRenderOptions,
  expected: string,
): Promise<boolean> {
  const size = crispCanvasSize(matrix.size, 640);
  const canvas = document.createElement("canvas");
  renderQrCanvas(canvas, matrix, opts, size);
  const decoded = await decodeCanvas(canvas);
  return decoded === expected;
}
