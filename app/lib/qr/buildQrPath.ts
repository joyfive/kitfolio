/* ============================================================
   QR 행렬 → 단일 SVG path 'd' 문자열.
   finder pattern 영역은 모양 설정과 무관하게 사각형으로 렌더한다.
   Canvas(Path2D)·SVG(<path>) 양쪽에서 동일한 'd' 를 사용한다.
   ============================================================ */
import { isFinderRegion, type QrMatrix } from "./createQrMatrix";
import { modulePath, squarePath, type QrModuleShape } from "./qrShapes";

/**
 * @param cellSize  한 모듈의 픽셀 크기
 * @param quietZone Quiet Zone(모듈 수) — 좌·상 오프셋으로 반영
 */
export function buildQrPath(
  matrix: QrMatrix,
  shape: QrModuleShape,
  cellSize: number,
  quietZone: number,
): string {
  const { size, modules } = matrix;
  let d = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!modules[y * size + x]) continue;
      const px = (x + quietZone) * cellSize;
      const py = (y + quietZone) * cellSize;
      d += isFinderRegion(x, y, size)
        ? squarePath(px, py, cellSize)
        : modulePath(shape, px, py, cellSize);
    }
  }
  return d;
}
