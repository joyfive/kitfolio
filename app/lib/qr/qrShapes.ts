/* ============================================================
   QR 전체 모양 (Approach A: 코어 QR + 장식 실루엣).
     - square  : 풀 스퀘어 QR (원형 그대로)
     - rounded : 풀 QR + 둥근 셀 + 바깥 테두리
     - arch    : 코어 사각형 + 상단 반원 돔 장식
     - heart   : 45° 회전 코어(다이아몬드) + 위쪽 두 변 반원 로브 장식
   실제 렌더는 art.ts 가 담당하고, 여기서는 타입·순서·아이콘만 정의한다.
   ============================================================ */

export type QrShape = "square" | "rounded" | "arch" | "heart";

/** UI 노출 순서 */
export const SHAPE_ORDER: QrShape[] = ["square", "rounded", "arch", "heart"];

/** 장식(감성 코드) 모양: 오류 복원 H 강제 대상 */
export function forcesHighEc(shape: QrShape): boolean {
  return shape === "arch" || shape === "heart";
}

const n = (v: number) => Math.round(v * 1000) / 1000;

/** 모양별 실루엣 아이콘 path (선택기 미리보기용). box: (x,y,s) */
export function iconPath(shape: QrShape, x: number, y: number, s: number): string {
  switch (shape) {
    case "square":
      return roundedRectPath(x, y, s, s * 0.12);
    case "rounded":
      return roundedRectPath(x, y, s, s * 0.34);
    case "arch":
      return archPath(x, y, s);
    case "heart":
      return heartPath(x, y, s);
  }
}

function roundedRectPath(x: number, y: number, s: number, r: number): string {
  const x2 = x + s;
  const y2 = y + s;
  return (
    `M${n(x + r)} ${n(y)}` +
    `H${n(x2 - r)}A${n(r)} ${n(r)} 0 0 1 ${n(x2)} ${n(y + r)}` +
    `V${n(y2 - r)}A${n(r)} ${n(r)} 0 0 1 ${n(x2 - r)} ${n(y2)}` +
    `H${n(x + r)}A${n(r)} ${n(r)} 0 0 1 ${n(x)} ${n(y2 - r)}` +
    `V${n(y + r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + r)} ${n(y)}Z`
  );
}

/** 아치형 아이콘: 상단 반원(돔), 좌우 수직, 하단 수평 (코어+돔 실루엣) */
function archPath(x: number, y: number, s: number): string {
  const r = s / 2;
  const base = y + r; // 반원 바닥선
  const bottom = y + s;
  return (
    `M${n(x)} ${n(bottom)}` +
    `L${n(x)} ${n(base)}` +
    `A${n(r)} ${n(r)} 0 0 1 ${n(x + s)} ${n(base)}` +
    `L${n(x + s)} ${n(bottom)}` +
    "Z"
  );
}

/** 하트 아이콘: 45° 사각형 + 위쪽 두 로브 실루엣 */
function heartPath(x: number, y: number, s: number): string {
  const p = (nx: number, ny: number) => `${n(x + nx * s)} ${n(y + ny * s)}`;
  const c = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    ex: number,
    ey: number,
  ) => `C${p(x1, y1)} ${p(x2, y2)} ${p(ex, ey)}`;
  return (
    `M${p(0.5, 0.3)}` +
    c(0.5, 0.12, 0.28, 0.02, 0.14, 0.14) +
    c(0.0, 0.27, 0.03, 0.5, 0.22, 0.66) +
    `L${p(0.5, 0.95)}` +
    `L${p(0.78, 0.66)}` +
    c(0.97, 0.5, 1.0, 0.27, 0.86, 0.14) +
    c(0.72, 0.02, 0.5, 0.12, 0.5, 0.3) +
    "Z"
  );
}
