/* ============================================================
   자체 판독 검증: 생성한 QR(장식 포함)을 같은 브라우저에서 다시 판독해
   원본 URL 과 일치하는지 확인한다. 장식 크럼이 인식을 방해하지 않는지까지
   포함해 검사하므로, 통과한 결과만 다운로드를 허용한다.
   (모든 단말 인식을 보장하지는 않음)
   ============================================================ */
import { renderArtCanvas, type ArtOptions } from "./art";
import { decodeCanvas } from "./decodeQr";
import type { QrMatrix } from "./createQrMatrix";
import type { QrShape } from "./qrShapes";

/**
 * 렌더 결과를 오프스크린 캔버스에 그린 뒤 판독해 expected 와 비교한다.
 * @returns true = 이 브라우저에서 판독 성공(다운로드 허용)
 */
export async function validateQrOutput(
  matrix: QrMatrix,
  shape: QrShape,
  opts: ArtOptions,
  expected: string,
): Promise<boolean> {
  const canvas = document.createElement("canvas");
  renderArtCanvas(canvas, matrix, shape, opts, 720);
  const decoded = await decodeCanvas(canvas);
  return decoded === expected;
}
