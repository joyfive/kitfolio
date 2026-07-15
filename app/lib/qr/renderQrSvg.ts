/* ============================================================
   SVG 렌더러 — 실제 벡터 path 로 출력한다.
   - Canvas 를 이미지로 캡처해 삽입하지 않는다 (raster 금지).
   - viewBox 사용으로 확대해도 선명하다.
   - metadata / 외부 참조 / 스크립트를 포함하지 않는다.
   ============================================================ */
import { buildQrPath } from "./buildQrPath";
import type { QrMatrix } from "./createQrMatrix";
import { QUIET_ZONE, type QrRenderOptions } from "./renderQrCanvas";

/** 좌표계 단위: 1 module = 1 unit. viewBox 로 스케일 독립. */
export function renderQrSvg(matrix: QrMatrix, opts: QrRenderOptions): string {
  const total = matrix.size + QUIET_ZONE * 2;
  const d = buildQrPath(matrix, opts.shape, 1, QUIET_ZONE);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${total} ${total}" ` +
    `width="${total}" height="${total}" shape-rendering="crispEdges">` +
    `<rect width="${total}" height="${total}" fill="${opts.bg}"/>` +
    (d ? `<path d="${d}" fill="${opts.fg}"/>` : "") +
    `</svg>`
  );
}
