/* ============================================================
   데이터 셀 모양 — 각 모양을 절대 좌표 SVG path 'd' 조각으로 생성.
   같은 'd' 문자열을 Canvas(Path2D) 와 SVG(<path>) 양쪽에서 재사용한다.

   외부 QR 스타일링 라이브러리에 의존하지 않고 직접 렌더한다.
   ============================================================ */

export type QrModuleShape = "square" | "circle" | "diamond" | "heart" | "arch";

/** UI 노출 순서 (사각형 → 원형 → 마름모 → 하트 → 아치형) */
export const SHAPE_ORDER: QrModuleShape[] = [
  "square",
  "circle",
  "diamond",
  "heart",
  "arch",
];

const n = (v: number) => Math.round(v * 1000) / 1000;

/**
 * (x, y) 위치, 한 변 s 픽셀 셀에 대한 모양별 path 'd' 조각.
 * square 는 finder pattern·기본 데이터 셀에 공통 사용한다.
 */
export function modulePath(
  shape: QrModuleShape,
  x: number,
  y: number,
  s: number,
): string {
  switch (shape) {
    case "square":
      return squarePath(x, y, s);
    case "circle":
      return circlePath(x, y, s);
    case "diamond":
      return diamondPath(x, y, s);
    case "heart":
      return heartPath(x, y, s);
    case "arch":
      return archPath(x, y, s);
  }
}

/** 사각형 — 셀 전체를 채운다 (셀 사이 빈틈 없음) */
export function squarePath(x: number, y: number, s: number): string {
  return `M${n(x)} ${n(y)}H${n(x + s)}V${n(y + s)}H${n(x)}Z`;
}

/** 원형 — 셀 중앙에 지름 ≈ 92% 원 */
function circlePath(x: number, y: number, s: number): string {
  const r = s * 0.46;
  const cx = x + s / 2;
  const cy = y + s / 2;
  // 두 개의 반원 호로 완전한 원 (Path2D 상대 호 지원)
  return `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(
    r,
  )} 0 1 0 ${n(-2 * r)} 0Z`;
}

/** 마름모 — 사각형을 45° 회전한 형태 (셀을 과도하게 벗어나지 않게 92%) */
function diamondPath(x: number, y: number, s: number): string {
  const m = s * 0.04; // 여백
  const cx = x + s / 2;
  const cy = y + s / 2;
  return `M${n(cx)} ${n(y + m)}L${n(x + s - m)} ${n(cy)}L${n(cx)} ${n(
    y + s - m,
  )}L${n(x + m)} ${n(cy)}Z`;
}

/** 하트 — 상단 두 곡선 + 하단 뾰족한 꼭짓점. 작은 셀에서도 굵고 단순하게. */
function heartPath(x: number, y: number, s: number): string {
  // 정규화 좌표(0~1)를 셀에 매핑. 살짝 축소해 인접 셀과 붙지 않게.
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
    `M${p(0.5, 0.34)}` +
    c(0.5, 0.2, 0.33, 0.08, 0.17, 0.16) +
    c(0.03, 0.24, 0.04, 0.46, 0.18, 0.6) +
    `L${p(0.5, 0.92)}` +
    `L${p(0.82, 0.6)}` +
    c(0.96, 0.46, 0.97, 0.24, 0.83, 0.16) +
    c(0.67, 0.08, 0.5, 0.2, 0.5, 0.34) +
    "Z"
  );
}

/**
 * 아치형 — 상단만 반원(돔), 좌우 수직, 하단 수평 직선.
 * 라운드 사각형/캡슐이 아님. 모든 아치는 위를 향한다.
 */
function archPath(x: number, y: number, s: number): string {
  const m = s * 0.05; // 좌우 여백
  const leftX = x + m;
  const rightX = x + s - m;
  const w = rightX - leftX;
  const r = w / 2;
  const topY = y + m;
  const bottomY = y + s - m; // 데이터 셀 높이를 충분히 채움
  const archBase = topY + r; // 반원이 시작되는 y (좌우 수직선의 위 끝)
  // 하단 왼쪽 → 왼쪽 수직선 → 상단 반원 → 오른쪽 수직선 → 하단 오른쪽 → 닫기
  return (
    `M${n(leftX)} ${n(bottomY)}` +
    `L${n(leftX)} ${n(archBase)}` +
    `A${n(r)} ${n(r)} 0 0 1 ${n(rightX)} ${n(archBase)}` +
    `L${n(rightX)} ${n(bottomY)}` +
    "Z"
  );
}
