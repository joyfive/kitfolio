/* ============================================================
   QR 아트 렌더러 (Approach A: 코어 QR + 장식 실루엣)

   핵심 원칙: 진짜로 스캔되는 QR "코어"는 온전한 정사각형으로 유지한다.
   모양(아치·하트)은 코어 옆/위에 "장식 크럼(가짜 모듈)"을 얹어 만든다.
     - 아치형: 똑바른 코어 사각형 + 상단 반원(돔) 장식
     - 하트형: 45° 회전한 코어(다이아몬드) + 위쪽 두 변의 반원 로브 장식
   코어는 손상되지 않으므로 항상 스캔되고, 장식은 순수 시각 요소다.
   (원형/아치/하트는 오류 복원 H 강제 + 자체 판독 게이트로 최종 확인)

   중간 표현(Art)을 만들고 Canvas·SVG 양쪽에서 동일하게 렌더한다.
   ============================================================ */
import type { QrMatrix } from "./createQrMatrix";
import type { QrShape } from "./qrShapes";

export const QUIET = 4; // 코어 주변 Quiet Zone(모듈): 항상 유지

export type ArtOptions = { fg: string; bg: string };

type Rect = { x: number; y: number; w: number; h: number; r: number };
type Layer = { rot: number; px: number; py: number; rects: Rect[] };
type Border = { x: number; y: number; w: number; h: number; r: number; sw: number };

/** 월드 단위(1 = 모듈)로 구성한 뒤, 렌더 시 정사각 캔버스에 맞춰 스케일한다. */
type Art = {
  layers: Layer[];
  border?: Border;
};

/* ---------- 결정적 크럼(장식 모듈) 패턴 ---------- */
function crumbOn(x: number, y: number): boolean {
  let h = (Math.imul(x, 73856093) ^ Math.imul(y, 19349663)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  h ^= h >>> 16;
  return (h & 15) < 7; // ≈ 44% 밀도 (QR 텍스처, 과밀 시 오검출 방지)
}

/** region 판정(셀 중심 기준) 안의 정수 격자 셀을 크럼으로 채운다. */
function crumbCells(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  inRegion: (cx: number, cy: number) => boolean,
): Rect[] {
  const out: Rect[] = [];
  for (let y = Math.floor(y0); y < Math.ceil(y1); y++) {
    for (let x = Math.floor(x0); x < Math.ceil(x1); x++) {
      if (crumbOn(x, y) && inRegion(x + 0.5, y + 0.5)) {
        out.push({ x, y, w: 1, h: 1, r: 0 });
      }
    }
  }
  return out;
}

/** 코어 QR의 on-모듈을 사각형 rect 목록으로 (모서리 반경 r 옵션) */
function coreRects(matrix: QrMatrix, r: number): Rect[] {
  const { size, modules } = matrix;
  const out: Rect[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (modules[y * size + x]) out.push({ x, y, w: 1, h: 1, r });
    }
  }
  return out;
}

/* ---------- 모양별 Art 구성 ---------- */
export function buildArt(matrix: QrMatrix, shape: QrShape): Art {
  const size = matrix.size;
  switch (shape) {
    case "square":
      return { layers: [{ rot: 0, px: 0, py: 0, rects: coreRects(matrix, 0) }] };

    case "rounded": {
      // 데이터 셀 모서리를 살짝 둥글게 + 바깥 테두리(프레임)
      const rects = coreRects(matrix, 0.28);
      const m = 1.6; // 테두리와 코어 간 간격(모듈)
      return {
        layers: [{ rot: 0, px: 0, py: 0, rects }],
        border: {
          x: -m,
          y: -m,
          w: size + m * 2,
          h: size + m * 2,
          r: 3,
          sw: 0.5,
        },
      };
    }

    case "arch": {
      // 코어(똑바른 사각형) + 상단 반원 돔 장식
      const R = size / 2;
      const gap = 1; // 돔과 코어 사이 최소 여백
      const core = coreRects(matrix, 0).map((c) => ({ ...c, y: c.y + R + gap }));
      const cx = size / 2;
      const cy = R + gap; // 돔 바닥선(코어 상단)
      const dome = crumbCells(0, 0, size, cy - gap, (x, y) => {
        const dx = x - cx;
        const dy = y - cy;
        return dx * dx + dy * dy <= R * R && y <= cy;
      });
      return {
        layers: [
          { rot: 0, px: 0, py: 0, rects: dome },
          { rot: 0, px: 0, py: 0, rects: core },
        ],
      };
    }

    case "heart": {
      // 코어를 45° 회전(다이아몬드) + 위쪽 두 변에 반원 로브 장식
      const c = size / 2;
      const core = coreRects(matrix, 0);
      // 다이아몬드 꼭짓점(월드): 코어 코너를 중심 기준 45° 회전
      const rot = (ax: number, ay: number) => {
        const rx = ax - c;
        const ry = ay - c;
        const cs = Math.SQRT1_2;
        return [c + (rx - ry) * cs, c + (rx + ry) * cs] as const;
      };
      const top = rot(0, 0);
      const right = rot(size, 0);
      const left = rot(0, size);
      const R = size / 2;
      const GAP = 0; // 로브를 코어에 딱 붙임. 값을 키우면 코어 주변 quiet zone 확보(finder 보호)
      const cs = Math.SQRT1_2;
      // 월드 좌표를 코어 로컬(비회전) 좌표로 역변환한 뒤 [0,size]² 박스와의 거리
      const distToCore = (wx: number, wy: number) => {
        const dx = wx - c;
        const dy = wy - c;
        const lx = c + dx * cs + dy * cs;
        const ly = c - dx * cs + dy * cs;
        const ox = Math.max(0 - lx, 0, lx - size);
        const oy = Math.max(0 - ly, 0, ly - size);
        return Math.hypot(ox, oy);
      };
      // 위쪽 두 변(왼→위, 위→오)에 반원 로브 (코어와 GAP 이상 떨어진 영역만)
      const lobe = (
        a: readonly [number, number],
        b: readonly [number, number],
      ) => {
        const mx = (a[0] + b[0]) / 2;
        const my = (a[1] + b[1]) / 2;
        const ex = b[0] - a[0];
        const ey = b[1] - a[1];
        const len = Math.hypot(ex, ey);
        let nx = -ey / len;
        let ny = ex / len;
        if (ny > 0) {
          nx = -nx;
          ny = -ny;
        } // 위쪽(−y)로 향하게
        return crumbCells(
          mx - R - GAP - 1,
          my - R - GAP - 1,
          mx + R + GAP + 1,
          my + R + GAP + 1,
          (x, y) => {
            const dx = x - mx;
            const dy = y - my;
            if (dx * dx + dy * dy > R * R) return false;
            if (dx * nx + dy * ny < 0) return false; // 변 바깥(로브 쪽)만
            return distToCore(x, y) >= GAP; // 코어 Quiet Zone 침범 금지
          },
        );
      };
      return {
        layers: [
          { rot: 0, px: 0, py: 0, rects: lobe(left, top) },
          { rot: 0, px: 0, py: 0, rects: lobe(top, right) },
          { rot: 45, px: c, py: c, rects: core },
        ],
      };
    }
  }
}

/* ---------- 월드 → 정사각 캔버스 fit ---------- */
function corners(rect: Rect, layer: Layer): [number, number][] {
  const pts: [number, number][] = [
    [rect.x, rect.y],
    [rect.x + rect.w, rect.y],
    [rect.x + rect.w, rect.y + rect.h],
    [rect.x, rect.y + rect.h],
  ];
  if (!layer.rot) return pts;
  const rad = (layer.rot * Math.PI) / 180;
  const cs = Math.cos(rad);
  const sn = Math.sin(rad);
  return pts.map(([x, y]) => {
    const dx = x - layer.px;
    const dy = y - layer.py;
    return [layer.px + dx * cs - dy * sn, layer.py + dx * sn + dy * cs];
  });
}

function bbox(art: Art) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const acc = (x: number, y: number) => {
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  };
  for (const layer of art.layers) {
    for (const rect of layer.rects) {
      for (const [x, y] of corners(rect, layer)) acc(x, y);
    }
  }
  if (art.border) {
    acc(art.border.x, art.border.y);
    acc(art.border.x + art.border.w, art.border.y + art.border.h);
  }
  return { minX, minY, maxX, maxY };
}

/** fit 변환: 월드 좌표에 quiet 여백을 더해 정사각 pixelSize 에 맞춘다. */
function fitTransform(art: Art, pixelSize: number) {
  const b = bbox(art);
  const w = b.maxX - b.minX;
  const h = b.maxY - b.minY;
  const span = Math.max(w, h) + QUIET * 2;
  const s = pixelSize / span;
  // 콘텐츠를 캔버스 중앙에 배치
  const tx = (pixelSize - w * s) / 2 - b.minX * s;
  const ty = (pixelSize - h * s) / 2 - b.minY * s;
  return { s, tx, ty };
}

/* ---------- Canvas 렌더 ---------- */
export function renderArtCanvas(
  canvas: HTMLCanvasElement,
  matrix: QrMatrix,
  shape: QrShape,
  opts: ArtOptions,
  pixelSize: number,
): void {
  const art = buildArt(matrix, shape);
  const { s, tx, ty } = fitTransform(art, pixelSize);
  canvas.width = pixelSize;
  canvas.height = pixelSize;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.fillStyle = opts.bg;
  ctx.fillRect(0, 0, pixelSize, pixelSize);
  ctx.fillStyle = opts.fg;
  ctx.strokeStyle = opts.fg;

  for (const layer of art.layers) {
    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(s, s);
    if (layer.rot) {
      ctx.translate(layer.px, layer.py);
      ctx.rotate((layer.rot * Math.PI) / 180);
      ctx.translate(-layer.px, -layer.py);
    }
    const path = new Path2D();
    for (const r of layer.rects) {
      if (r.r > 0) path.roundRect(r.x, r.y, r.w, r.h, r.r);
      else path.rect(r.x, r.y, r.w, r.h);
    }
    ctx.fill(path);
    ctx.restore();
  }

  if (art.border) {
    ctx.save();
    ctx.translate(tx, ty);
    ctx.scale(s, s);
    ctx.lineWidth = art.border.sw;
    const bp = new Path2D();
    bp.roundRect(
      art.border.x,
      art.border.y,
      art.border.w,
      art.border.h,
      art.border.r,
    );
    ctx.stroke(bp);
    ctx.restore();
  }
}

/* ---------- SVG 렌더 ---------- */
const nn = (v: number) => Math.round(v * 1000) / 1000;

export function renderArtSvg(
  matrix: QrMatrix,
  shape: QrShape,
  opts: ArtOptions,
  pixelSize = 1000,
): string {
  const art = buildArt(matrix, shape);
  const { s, tx, ty } = fitTransform(art, pixelSize);

  let inner = "";
  for (const layer of art.layers) {
    const rectsStr = layer.rects
      .map(
        (r) =>
          `<rect x="${nn(r.x)}" y="${nn(r.y)}" width="${nn(r.w)}" height="${nn(
            r.h,
          )}"${r.r > 0 ? ` rx="${nn(r.r)}"` : ""}/>`,
      )
      .join("");
    inner += layer.rot
      ? `<g transform="rotate(${nn(layer.rot)} ${nn(layer.px)} ${nn(
          layer.py,
        )})">${rectsStr}</g>`
      : rectsStr;
  }

  let borderStr = "";
  if (art.border) {
    const b = art.border;
    borderStr =
      `<rect x="${nn(b.x)}" y="${nn(b.y)}" width="${nn(b.w)}" height="${nn(
        b.h,
      )}" rx="${nn(b.r)}" fill="none" stroke="${opts.fg}" stroke-width="${nn(
        b.sw,
      )}"/>`;
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${pixelSize} ${pixelSize}" ` +
    `width="${pixelSize}" height="${pixelSize}" shape-rendering="geometricPrecision">` +
    `<rect width="${pixelSize}" height="${pixelSize}" fill="${opts.bg}"/>` +
    `<g transform="translate(${nn(tx)} ${nn(ty)}) scale(${nn(s)})" fill="${opts.fg}">` +
    inner +
    borderStr +
    `</g>` +
    `</svg>`
  );
}

/** 흐림 방지용: 정수 배율에 가까운 캔버스 변 계산(대략치). */
export function artCanvasSize(matrixSize: number, target: number): number {
  return target; // fit 단계에서 스케일하므로 목표 크기 그대로 사용
}
