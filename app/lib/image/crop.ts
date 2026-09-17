/* ============================================================
   크롭 영역 기하 계산.

   좌표계는 항상 "디코딩된 표시 방향 기준의 원본 픽셀"이다.
   미리보기 배율(zoom)은 화면 표시에만 쓰고 이 모듈에 들어오지 않는다.
   덕분에 결과 픽셀은 미리보기를 확대·축소해도 달라지지 않는다.

   순수 함수만 둔다 (브라우저 API 의존 없음 → 테스트 가능).
   ============================================================ */

/** 원본 픽셀 기준 크롭 사각형 */
export type Rect = { x: number; y: number; w: number; h: number };

/** 비율 프리셋 식별자 */
export type RatioId = "free" | "1:1" | "4:3" | "3:2" | "16:9" | "9:16";

/** 프리셋 노출 순서 (기본값 = 첫 항목) */
export const RATIOS: readonly RatioId[] = ["free", "1:1", "4:3", "3:2", "16:9", "9:16"] as const;

/** 조작 불가능한 0px 영역을 막는 최소 크롭 변 길이 */
export const MIN_CROP = 16;

/** 드래그로 크기를 바꿀 수 있는 핸들 */
export type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export const HANDLES: readonly Handle[] = ["nw", "n", "ne", "e", "se", "s", "sw", "w"] as const;

/** 프리셋의 가로/세로 비율값. free 는 비율을 고정하지 않으므로 null. */
export function ratioValue(id: RatioId): number | null {
  switch (id) {
    case "1:1":
      return 1;
    case "4:3":
      return 4 / 3;
    case "3:2":
      return 3 / 2;
    case "16:9":
      return 16 / 9;
    case "9:16":
      return 9 / 16;
    default:
      return null;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** 이미지가 최소 크롭 크기보다 작을 수 있으므로 최소값도 이미지에 맞춘다. */
function minSide(imgW: number, imgH: number): number {
  return Math.max(1, Math.min(MIN_CROP, imgW, imgH));
}

/**
 * 사각형을 이미지 안으로 넣고 정수 픽셀로 맞춘다.
 * 크기를 먼저 이미지 범위로 자른 뒤 위치를 밀어 넣으므로,
 * 어떤 입력이 와도 결과는 항상 이미지 경계 안에 있다.
 */
export function clampRect(rect: Rect, imgW: number, imgH: number): Rect {
  const min = minSide(imgW, imgH);
  const w = clamp(Math.round(rect.w), min, imgW);
  const h = clamp(Math.round(rect.h), min, imgH);
  return {
    x: clamp(Math.round(rect.x), 0, imgW - w),
    y: clamp(Math.round(rect.y), 0, imgH - h),
    w,
    h,
  };
}

/** 이미지 전체를 선택한 초기 크롭 영역 */
export function initialCrop(imgW: number, imgH: number): Rect {
  return { x: 0, y: 0, w: imgW, h: imgH };
}

/** 크롭 영역 이동 (크기는 유지, 경계를 넘지 않는다) */
export function moveRect(rect: Rect, dx: number, dy: number, imgW: number, imgH: number): Rect {
  const w = Math.min(Math.round(rect.w), imgW);
  const h = Math.min(Math.round(rect.h), imgH);
  return {
    x: clamp(Math.round(rect.x + dx), 0, imgW - w),
    y: clamp(Math.round(rect.y + dy), 0, imgH - h),
    w,
    h,
  };
}

/**
 * 중심점을 유지한 채 주어진 비율에 맞는 가장 큰 유효 영역을 만든다.
 * 프리셋 전환 시 사용자가 잡아둔 구도를 최대한 지키기 위한 것이다.
 * ratio 가 null(free)이면 현재 영역을 경계 안으로만 보정한다.
 */
export function fitRatio(rect: Rect, ratio: number | null, imgW: number, imgH: number): Rect {
  const base = clampRect(rect, imgW, imgH);
  if (!ratio || ratio <= 0) return base;

  const cx = base.x + base.w / 2;
  const cy = base.y + base.h / 2;

  // 현재 영역의 면적을 유지하는 크기에서 출발해, 이미지 밖으로 나가면 줄인다.
  let w = Math.sqrt(base.w * base.h * ratio);
  let h = w / ratio;
  if (w > imgW) {
    w = imgW;
    h = w / ratio;
  }
  if (h > imgH) {
    h = imgH;
    w = h * ratio;
  }

  const min = minSide(imgW, imgH);
  if (w < min || h < min) {
    // 최소 크기를 만족시키려 키우다가 다시 이미지를 넘지 않도록 한 번 더 줄인다.
    const grow = Math.max(min / w, min / h);
    w = Math.min(imgW, w * grow);
    h = Math.min(imgH, w / ratio);
    w = h * ratio;
  }

  return clampRect({ x: cx - w / 2, y: cy - h / 2, w, h }, imgW, imgH);
}

/** 핸들이 움직이는 변: 사각형의 어느 모서리를 고정할지 결정한다. */
function handleAxes(handle: Handle): { left: boolean; right: boolean; top: boolean; bottom: boolean } {
  return {
    left: handle === "nw" || handle === "w" || handle === "sw",
    right: handle === "ne" || handle === "e" || handle === "se",
    top: handle === "nw" || handle === "n" || handle === "ne",
    bottom: handle === "sw" || handle === "s" || handle === "se",
  };
}

/**
 * 핸들 드래그로 크기 변경.
 *
 * start 는 드래그를 시작한 시점의 사각형이고 dx/dy 는 원본 픽셀 기준 누적
 * 이동량이다. 비율이 고정된 경우에는 움직인 변에서 얻은 길이를 기준으로
 * 반대 축을 계산한 뒤, 고정된 모서리를 축으로 다시 배치한다.
 */
export function resizeRect(
  start: Rect,
  handle: Handle,
  dx: number,
  dy: number,
  imgW: number,
  imgH: number,
  ratio: number | null,
): Rect {
  const min = minSide(imgW, imgH);
  const axes = handleAxes(handle);

  // 고정되는 모서리 좌표
  const anchorX = axes.left ? start.x + start.w : start.x;
  const anchorY = axes.top ? start.y + start.h : start.y;

  let w = start.w;
  let h = start.h;
  if (axes.left) w = start.w - dx;
  if (axes.right) w = start.w + dx;
  if (axes.top) h = start.h - dy;
  if (axes.bottom) h = start.h + dy;

  // 가능한 최대 크기: 고정 모서리에서 이미지 경계까지의 거리
  const maxW = axes.left ? anchorX : imgW - anchorX;
  const maxH = axes.top ? anchorY : imgH - anchorY;

  if (ratio && ratio > 0) {
    // 변 하나만 잡는 핸들(n·s·e·w)은 그 변을 기준으로, 모서리 핸들은 더 크게
    // 움직인 쪽을 기준으로 삼아야 드래그가 자연스럽다.
    const drivenByWidth =
      axes.left || axes.right
        ? !(axes.top || axes.bottom) || Math.abs(dx) >= Math.abs(dy)
        : false;
    if (drivenByWidth) h = w / ratio;
    else w = h * ratio;

    const limit = Math.min(maxW, maxH * ratio);
    w = clamp(w, Math.max(min, min * ratio), Math.max(min, min * ratio, limit));
    h = w / ratio;
  } else {
    w = clamp(w, min, Math.max(min, maxW));
    h = clamp(h, min, Math.max(min, maxH));
  }

  w = Math.round(w);
  h = Math.round(h);

  const x = axes.left ? anchorX - w : anchorX;
  const y = axes.top ? anchorY - h : anchorY;
  return clampRect({ x, y, w, h }, imgW, imgH);
}

/**
 * 키보드로 크롭 영역 크기 조절 (Alt + 방향키).
 * 오른쪽·아래 변을 움직이고, 비율이 고정돼 있으면 함께 맞춘다.
 */
export function nudgeSize(
  rect: Rect,
  dw: number,
  dh: number,
  imgW: number,
  imgH: number,
  ratio: number | null,
): Rect {
  const handle: Handle = dw !== 0 ? "e" : "s";
  return resizeRect(rect, handle, dw, dh, imgW, imgH, ratio);
}

/** 사각형을 백분율 좌표로 (미리보기 오버레이 배치용) */
export function toPercent(rect: Rect, imgW: number, imgH: number) {
  return {
    left: (rect.x / imgW) * 100,
    top: (rect.y / imgH) * 100,
    width: (rect.w / imgW) * 100,
    height: (rect.h / imgH) * 100,
  };
}

/** 사람이 읽는 비율 표기 (예: 3:2 · 1.91:1) */
export function ratioLabel(w: number, h: number): string {
  if (!(w > 0 && h > 0)) return "";
  const divisor = gcd(w, h);
  const rw = w / divisor;
  const rh = h / divisor;
  // 기약분수가 너무 크면 읽히지 않으므로 소수 표기로 바꾼다.
  if (rw <= 32 && rh <= 32) return `${rw}:${rh}`;
  return w >= h ? `${(w / h).toFixed(2)}:1` : `1:${(h / w).toFixed(2)}`;
}

function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    [x, y] = [y, x % y];
  }
  return x || 1;
}
