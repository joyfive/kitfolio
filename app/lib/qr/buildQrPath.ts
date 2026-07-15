/* ============================================================
   QR 행렬 → 단일 SVG path 'd' 문자열.
   - 데이터 셀은 사각형으로 그린다.
   - 선택한 실루엣(shape) 밖의 데이터 셀은 그리지 않아 전체 윤곽을 만든다.
   - finder pattern 3곳은 실루엣과 무관하게 항상 보존한다(인식 안정성).
   Canvas(Path2D)·SVG(<path>) 양쪽에서 동일한 'd' 를 사용한다.
   ============================================================ */
import type { QrMatrix } from "./createQrMatrix";
import { isFunctionModule } from "./functionPatterns";
import { containsModule, squarePath, type QrShape } from "./qrShapes";

/**
 * @param cellSize  한 모듈의 픽셀 크기
 * @param quietZone Quiet Zone(모듈 수) — 좌·상 오프셋으로 반영
 */
export function buildQrPath(
  matrix: QrMatrix,
  shape: QrShape,
  cellSize: number,
  quietZone: number,
): string {
  const { size, modules } = matrix;
  let d = "";
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!modules[y * size + x]) continue;
      // 기능 패턴(finder·타이밍·포맷·정렬 등)은 항상 보존,
      // 그 외 데이터/EC 셀은 실루엣 안에 있을 때만 렌더
      if (
        !isFunctionModule(x, y, size) &&
        !containsModule(shape, x + 0.5, y + 0.5, size)
      ) {
        continue;
      }
      const px = (x + quietZone) * cellSize;
      const py = (y + quietZone) * cellSize;
      d += squarePath(px, py, cellSize);
    }
  }
  return d;
}
