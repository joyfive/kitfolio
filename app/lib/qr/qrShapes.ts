/* ============================================================
   QR 전체 실루엣(프레임) 모양.
   - 데이터 셀은 항상 사각형으로 렌더한다.
   - "모양"은 QR 전체를 감싸는 실루엣이며, 실루엣 밖 데이터 셀은
     그리지 않아 전체 윤곽을 만든다(마스킹).
   - 위치 탐지 패턴(finder) 3곳은 실루엣과 무관하게 항상 보존한다.
   - 원형/아치형/하트형처럼 데이터를 잘라내는 실루엣은 오류 복원 H를
     강제해, 잘려나간 셀을 EC 여유분으로 복구한다.

   각 모양은 절대 좌표 SVG path 'd' 조각으로도 생성해(아이콘·향후 확장용)
   Canvas(Path2D)와 SVG(<path>) 양쪽에서 재사용한다.
   ============================================================ */

export type QrShape = "square" | "rounded" | "circle" | "arch" | "heart";

/** UI 노출 순서 (사각형 → 둥근 사각형 → 원형 → 아치형 → 하트형) */
export const SHAPE_ORDER: QrShape[] = [
  "square",
  "rounded",
  "circle",
  "arch",
  "heart",
];

/** 데이터를 잘라내는 실루엣 — 오류 복원 레벨 H 강제 대상 */
export function forcesHighEc(shape: QrShape): boolean {
  return shape === "circle" || shape === "arch" || shape === "heart";
}

const n = (v: number) => Math.round(v * 1000) / 1000;

/* ---------- 실루엣 포함 판정 (모듈 중심 좌표 cx,cy ∈ [0, size]) ---------- */

/**
 * 모듈 중심이 실루엣 안에 있는지 판정한다.
 * (finder 모듈은 호출부에서 항상 포함 처리 — 이 함수를 거치지 않는다)
 */
export function containsModule(
  shape: QrShape,
  cx: number,
  cy: number,
  size: number,
): boolean {
  const u = cx / size;
  const v = cy / size;
  switch (shape) {
    case "square":
      return true;
    case "rounded":
      return inRoundedRect(u, v, 0.12);
    case "circle": {
      const dx = u - 0.5;
      const dy = v - 0.5;
      return dx * dx + dy * dy <= 0.25;
    }
    case "arch": {
      if (u < 0 || u > 1 || v < 0 || v > 1) return false;
      if (v >= 0.5) return true; // 하단 절반: 사각형(수직 측면·수평 하단)
      const dx = u - 0.5;
      const dy = v - 0.5;
      return dx * dx + dy * dy <= 0.25; // 상단 절반: 반원(돔)
    }
    case "heart":
      return inHeart(u, v);
  }
}

/**
 * "통통한" 하트 — 두 개의 큰 상단 로브(원) + 하단 V 삼각형의 합집합.
 * 정사각형의 넓은 영역을 채워, 잘려나가는 데이터 셀이 오류 복원 H(약 30%)
 * 여유분 안에 들도록 한다. (인식 안정성 확보)
 */
function inHeart(u: number, v: number): boolean {
  const r = 0.42;
  // 상단 좌·우 로브 (크게 → 상단 전체를 채움)
  if ((u - 0.27) ** 2 + (v - 0.32) ** 2 <= r * r) return true;
  if ((u - 0.73) ** 2 + (v - 0.32) ** 2 <= r * r) return true;
  // 하단 — 측면을 넓게 유지(볼록)하며 점(0.5, 0.9)으로 수렴 → 잘림 최소화
  if (v >= 0.3) {
    const tt = (v - 0.3) / (0.9 - 0.3);
    if (tt <= 1) {
      const halfW = 0.64 * Math.pow(1 - tt, 0.42);
      if (Math.abs(u - 0.5) <= halfW) return true;
    }
  }
  return false;
}

function inRoundedRect(u: number, v: number, rr: number): boolean {
  if (u < 0 || u > 1 || v < 0 || v > 1) return false;
  const rx = Math.min(u, 1 - u);
  const ry = Math.min(v, 1 - v);
  if (rx >= rr || ry >= rr) return true;
  const dx = rr - rx;
  const dy = rr - ry;
  return dx * dx + dy * dy <= rr * rr;
}

/* ---------- path 생성 (모듈 렌더 · 아이콘) ---------- */

/** 사각형 — 데이터 셀 전체를 채운다 (셀 사이 빈틈 없음) */
export function squarePath(x: number, y: number, s: number): string {
  return `M${n(x)} ${n(y)}H${n(x + s)}V${n(y + s)}H${n(x)}Z`;
}

/** 모양별 실루엣 아이콘 path (선택기 미리보기용) */
export function iconPath(shape: QrShape, x: number, y: number, s: number): string {
  switch (shape) {
    case "square":
      return roundedRectPath(x, y, s, s * 0.12);
    case "rounded":
      return roundedRectPath(x, y, s, s * 0.32);
    case "circle":
      return circlePath(x, y, s);
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

function circlePath(x: number, y: number, s: number): string {
  const r = s / 2;
  const cx = x + r;
  const cy = y + r;
  return `M${n(cx - r)} ${n(cy)}a${n(r)} ${n(r)} 0 1 0 ${n(2 * r)} 0a${n(r)} ${n(
    r,
  )} 0 1 0 ${n(-2 * r)} 0Z`;
}

/** 아치형 — 상단 반원(돔), 좌우 수직, 하단 수평 직선 */
function archPath(x: number, y: number, s: number): string {
  const r = s / 2;
  const cx = x + r;
  const archBase = y + r;
  const bottomY = y + s;
  return (
    `M${n(x)} ${n(bottomY)}` +
    `L${n(x)} ${n(archBase)}` +
    `A${n(r)} ${n(r)} 0 0 1 ${n(x + s)} ${n(archBase)}` +
    `L${n(x + s)} ${n(bottomY)}` +
    "Z"
  );
}

/** 하트 — 통통한 형태(상단 넓은 두 로브 + 하단 점). 실루엣 아이콘용. */
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
    `M${p(0.5, 0.26)}` +
    c(0.5, 0.05, 0.24, -0.03, 0.09, 0.12) +
    c(-0.04, 0.26, 0.02, 0.5, 0.24, 0.68) +
    `L${p(0.5, 0.97)}` +
    `L${p(0.76, 0.68)}` +
    c(0.98, 0.5, 1.04, 0.26, 0.91, 0.12) +
    c(0.76, -0.03, 0.5, 0.05, 0.5, 0.26) +
    "Z"
  );
}
