/* ============================================================
   WCAG 2.2 명도대비 계산 · 통과 색상 제안 · 팔레트 파싱

   UI에서 분리해 테스트 가능하게 둔다 (app/lib/color/__tests__/contrast.test.ts).
   판정은 항상 **반올림 전 원시 값**으로 한다: 4.499:1 은 4.5:1 기준을 통과하지 않는다.
   ============================================================ */
import { clampChroma, formatHex, oklab, oklch } from "culori";

/* ── HEX 파싱 ─────────────────────────────────────────── */

export type HexParse =
  | { ok: true; hex: string }
  | { ok: false; reason: "empty" | "alpha" | "invalid" };

const HEX3 = /^[0-9a-fA-F]{3}$/;
const HEX6 = /^[0-9a-fA-F]{6}$/;
const HEX_ALPHA = /^([0-9a-fA-F]{4}|[0-9a-fA-F]{8})$/;

/** '#RGB' · 'RGB' · '#RRGGBB' · 'RRGGBB' 를 대문자 6자리 HEX로 정규화.
 *  알파가 포함된 4·8자리는 "지원하지 않는 형식"으로 구분해 돌려준다. */
export function parseHexColor(raw: string): HexParse {
  const body = raw.trim().replace(/^#/, "");
  if (!body) return { ok: false, reason: "empty" };
  if (HEX3.test(body)) {
    const full = body
      .split("")
      .map((c) => c + c)
      .join("");
    return { ok: true, hex: "#" + full.toUpperCase() };
  }
  if (HEX6.test(body)) return { ok: true, hex: "#" + body.toUpperCase() };
  if (HEX_ALPHA.test(body)) return { ok: false, reason: "alpha" };
  return { ok: false, reason: "invalid" };
}

/* ── 상대 휘도 · 대비 비율 ─────────────────────────────── */

/** sRGB 8비트 채널을 선형화 (WCAG 2.2 relative luminance) */
function toLinear(channel8: number): number {
  const c = channel8 / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** WCAG 2.2 상대 휘도 L = 0.2126R + 0.7152G + 0.0722B (선형화된 채널) */
export function relativeLuminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

/** 대비 비율 (L1 + 0.05) / (L2 + 0.05) · 전경·배경을 바꿔도 값은 같다 */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

/* ── 기준값 · 판정 ─────────────────────────────────────── */

/** 소수점 셋째 자리까지 보여줄 판정 경계값 */
const BOUNDARIES = [3, 4.5, 7];

/** 기본은 둘째 자리. 경계값과 0.01 미만 차이면 셋째 자리까지 보여준다
 *  (4.499 가 "4.50" 으로 보여 통과처럼 읽히는 것을 막는다). */
export function formatRatio(ratio: number): string {
  const nearBoundary = BOUNDARIES.some((b) => Math.abs(ratio - b) < 0.01);
  return ratio.toFixed(nearBoundary ? 3 : 2);
}

export type CriterionId = "body-aa" | "body-aaa" | "large-aa" | "large-aaa" | "ui-aa";

/** 화면 결과 카드가 그대로 소비하는 WCAG 2.2 판정 기준 목록 */
export const CRITERIA: { id: CriterionId; min: number }[] = [
  { id: "body-aa", min: 4.5 },
  { id: "body-aaa", min: 7 },
  { id: "large-aa", min: 3 },
  { id: "large-aaa", min: 4.5 },
  { id: "ui-aa", min: 3 },
];

/** 통과 판정: 반올림 전 원시 값으로만 비교한다 */
export function meets(ratio: number, min: number): boolean {
  return ratio >= min;
}

/** 매트릭스 셀이 표시할 "충족하는 가장 높은 실무 범주" */
export type Band = "aaa-body" | "aa-body" | "aa-large" | "fail";

export function contrastBand(ratio: number): Band {
  if (ratio >= 7) return "aaa-body";
  if (ratio >= 4.5) return "aa-body";
  if (ratio >= 3) return "aa-large";
  return "fail";
}

/** 통과 색상 제안의 목표 기준 */
export type TargetId = "large-ui-aa" | "body-aa" | "body-aaa";

export const TARGET_RATIO: Record<TargetId, number> = {
  "large-ui-aa": 3,
  "body-aa": 4.5,
  "body-aaa": 7,
};

/* ── 통과 색상 제안 ────────────────────────────────────── */

export type Suggestion = { hex: string; ratio: number };

/** OKLCH 후보를 sRGB 색역 안으로 넣고 HEX로 되돌린다.
 *  색역을 벗어나면 hue 는 유지한 채 chroma 만 필요한 만큼 낮춘다. */
function gamutHex(l: number, c: number, h: number | undefined): string | null {
  const clamped = clampChroma({ mode: "oklch", l, c, h }, "oklch");
  const hex = formatHex(clamped);
  return hex ? hex.toUpperCase() : null;
}

/** OKLab 지각 거리: 원본과 가장 가까운 후보를 고르는 기준 */
function deltaEOk(a: string, b: string): number {
  const x = oklab(a);
  const y = oklab(b);
  if (!x || !y) return Infinity;
  return Math.hypot((x.l ?? 0) - (y.l ?? 0), (x.a ?? 0) - (y.a ?? 0), (x.b ?? 0) - (y.b ?? 0));
}

/** 명도 탐색 간격: sRGB 8비트 단계보다 촘촘하면 충분하다 */
const L_STEP = 0.002;

/**
 * 한쪽 색만 조정해 목표 대비를 만족하는 후보를 찾는다.
 *
 * 1. 조정 대상 색을 OKLCH 로 변환하고 hue 는 고정한다.
 * 2. 밝은 방향·어두운 방향으로 L 을 훑어 목표 이상인 첫 후보를 각각 찾는다.
 * 3. 두 후보 중 원본과의 OKLab 지각 거리가 작은 쪽을 고른다.
 * 4. 최종 HEX 로 되돌린 뒤 다시 WCAG 대비를 계산해 통과를 검증한다
 *    (검증에 실패한 후보는 제안하지 않는다).
 *
 * 한 색만으로 목표에 도달할 수 없으면 null 을 돌려준다: 극단값을 억지로 통과로 만들지 않는다.
 */
export function suggestPassingColor(
  adjustHex: string,
  fixedHex: string,
  target: number,
): Suggestion | null {
  const base = oklch(adjustHex);
  if (!base) return null;
  const baseL = base.l ?? 0;
  const baseC = base.c ?? 0;
  const hue = base.h;

  const searchDirection = (dir: 1 | -1): Suggestion | null => {
    for (let step = 1; ; step++) {
      let l = baseL + dir * step * L_STEP;
      const past = dir === 1 ? l > 1 : l < 0;
      if (past) l = dir === 1 ? 1 : 0;
      const hex = gamutHex(l, baseC, hue);
      if (hex) {
        const ratio = contrastRatio(hex, fixedHex);
        if (meets(ratio, target)) return { hex, ratio };
      }
      if (past) return null;
    }
  };

  const candidates = [searchDirection(1), searchDirection(-1)].filter(
    (c): c is Suggestion => c !== null,
  );
  if (candidates.length === 0) return null;

  return candidates.reduce((best, c) =>
    deltaEOk(c.hex, adjustHex) < deltaEOk(best.hex, adjustHex) ? c : best,
  );
}

/* ── 팔레트 파싱 ───────────────────────────────────────── */

export const PALETTE_MIN = 2;
export const PALETTE_MAX = 12;

export type PaletteParse = {
  /** 중복을 제거하고 첫 등장 순서를 유지한 6자리 대문자 HEX 목록 */
  colors: string[];
  /** '#' 으로 시작했지만 HEX 로 읽을 수 없어 제외한 토큰 수 */
  invalid: number;
};

/**
 * 붙여넣은 텍스트에서 HEX 색상만 추출한다.
 *
 * '#' 접두가 있는 토큰만 색상 후보로 본다. CSS 변수명·속성명·일반 텍스트에는
 * 3자리 16진수로 읽히는 문자열(예: --primary-500 의 500)이 흔히 섞여 있어,
 * 접두 없는 토큰까지 받으면 색이 아닌 값을 색으로 만들어 버린다.
 */
export function parsePalette(raw: string): PaletteParse {
  const tokens = raw.match(/#[0-9a-zA-Z]+/g) ?? [];
  const seen = new Set<string>();
  const colors: string[] = [];
  let invalid = 0;

  for (const token of tokens) {
    const parsed = parseHexColor(token);
    if (!parsed.ok) {
      invalid++;
      continue;
    }
    if (seen.has(parsed.hex)) continue;
    seen.add(parsed.hex);
    colors.push(parsed.hex);
  }

  return { colors, invalid };
}
