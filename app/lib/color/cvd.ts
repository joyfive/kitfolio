/* ============================================================
   색각이상(CVD) 시뮬레이션 · 흑백 점검 픽셀 변환

   UI에서 분리해 테스트 가능하게 둔다 (app/lib/color/__tests__/cvd.test.ts).

   ── 변환 모델 ────────────────────────────────────────────
   Protan·Deutan·Tritan 변환은 생리학 기반 모델을 쓴다:

     G. M. Machado, M. M. Oliveira, L. A. F. Fernandes,
     "A Physiologically-based Model for Simulation of Color Vision Deficiency",
     IEEE Transactions on Visualization and Computer Graphics,
     vol. 15, no. 6, pp. 1291-1298, 2009. doi:10.1109/TVCG.2009.113

   아래 행렬은 저자가 공개한 사전 계산 데이터(강도 0~100%, 10% 단위)이며,
   이미 프로젝트 의존성인 culori(MIT)가 싣고 있는 같은 표를 기저색으로 역산해
   옮겼다. culori 는 출처를 다음과 같이 밝힌다:

     https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html
     (colorspace R 패키지 문서 경유)

   __tests__/cvd.test.ts 가 이 표를 culori 의 filterDeficiency* 에서 다시 역산한
   값과 대조하므로, 옮겨 적는 과정의 오차는 테스트가 잡는다.

   10% 단위 값을 그대로 쓰고 중간값을 임의로 보간하지 않는다.

   ── 색 공간 ──────────────────────────────────────────────
   Machado 모델은 **선형 RGB** 위에서 정의된다. 따라서 sRGB 8비트 입력을
   선형화하고 → 행렬을 곱한 뒤 → 다시 sRGB 로 인코딩한다. 감마가 적용된
   sRGB 값에 행렬을 바로 곱하는 구현도 흔하지만(culori·colorspace 포함),
   그 경우 결과 밝기가 논문 모델과 달라진다. 색 공간 처리는 이 파일의
   linearize/encodeSrgb 두 함수에만 있으므로 바꿔야 할 때 여기만 고치면 된다.
   ============================================================ */

/** 색각 유형 3종 */
export type CvdType = "protan" | "deutan" | "tritan";

/** 보기 유형: 색각 3종 + 색을 완전히 제거하는 흑백 점검 */
export type ViewType = CvdType | "grayscale";

export const CVD_TYPES: CvdType[] = ["protan", "deutan", "tritan"];
export const VIEW_TYPES: ViewType[] = [...CVD_TYPES, "grayscale"];

/** 강도 단계: 0~100%, 10% 단위 */
export const STRENGTH_STEP = 10;
export const STRENGTH_MIN = 0;
export const STRENGTH_MAX = 100;
export const DEFAULT_STRENGTH = 100;
export const DEFAULT_VIEW: ViewType = "deutan";

/** 행 우선 3x3 행렬 · 인덱스 0~10 = 강도 0~100% */
export const CVD_MATRICES: Record<CvdType, readonly (readonly number[])[]> = {
  protan: [
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [0.856167, 0.182038, -0.038205, 0.029342, 0.955115, 0.015544, -0.00288, -0.001563, 1.004443],
    [0.734766, 0.334872, -0.069637, 0.05184, 0.919198, 0.028963, -0.004928, -0.004209, 1.009137],
    [0.630323, 0.465641, -0.095964, 0.069181, 0.890046, 0.040773, -0.006308, -0.007724, 1.014032],
    [0.539009, 0.579343, -0.118352, 0.082546, 0.866121, 0.051332, -0.007136, -0.011959, 1.019095],
    [0.458064, 0.679578, -0.137642, 0.092785, 0.846313, 0.060902, -0.007494, -0.016807, 1.024301],
    [0.38545, 0.769005, -0.154455, 0.100526, 0.829802, 0.069673, -0.007442, -0.02219, 1.029632],
    [0.319627, 0.849633, -0.169261, 0.106241, 0.815969, 0.07779, -0.007025, -0.028051, 1.035076],
    [0.259411, 0.923008, -0.18242, 0.110296, 0.80434, 0.085364, -0.006276, -0.034346, 1.040622],
    [0.203876, 0.990338, -0.194214, 0.112975, 0.794542, 0.092483, -0.005222, -0.041043, 1.046265],
    [0.152286, 1.052583, -0.204868, 0.114503, 0.786281, 0.099216, -0.003882, -0.048116, 1.051998],
  ],
  deutan: [
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [0.866435, 0.177704, -0.044139, 0.049567, 0.939063, 0.01137, -0.003453, 0.007233, 0.99622],
    [0.760729, 0.319078, -0.079807, 0.090568, 0.889315, 0.020117, -0.006027, 0.013325, 0.992702],
    [0.675425, 0.43385, -0.109275, 0.125303, 0.847755, 0.026942, -0.00795, 0.018572, 0.989378],
    [0.605511, 0.52856, -0.134071, 0.155318, 0.812366, 0.032316, -0.009376, 0.023176, 0.9862],
    [0.547494, 0.607765, -0.155259, 0.181692, 0.781742, 0.036566, -0.01041, 0.027275, 0.983136],
    [0.498864, 0.674741, -0.173604, 0.205199, 0.754872, 0.039929, -0.011131, 0.030969, 0.980162],
    [0.457771, 0.731899, -0.18967, 0.226409, 0.731012, 0.042579, -0.011595, 0.034333, 0.977261],
    [0.422823, 0.781057, -0.203881, 0.245752, 0.709602, 0.044646, -0.011843, 0.037423, 0.974421],
    [0.392952, 0.82361, -0.216562, 0.263559, 0.69021, 0.046232, -0.01191, 0.040281, 0.97163],
    [0.367322, 0.860646, -0.227968, 0.280085, 0.672501, 0.047413, -0.01182, 0.04294, 0.968881],
  ],
  tritan: [
    [1, 0, 0, 0, 1, 0, 0, 0, 1],
    [0.92667, 0.092514, -0.019184, 0.021191, 0.964503, 0.014306, 0.008437, 0.054813, 0.93675],
    [0.89572, 0.13333, -0.02905, 0.029997, 0.9454, 0.024603, 0.013027, 0.104707, 0.882266],
    [0.905871, 0.127791, -0.033662, 0.026856, 0.941251, 0.031893, 0.01341, 0.148296, 0.838294],
    [0.948035, 0.08949, -0.037526, 0.014364, 0.946792, 0.038844, 0.010853, 0.193991, 0.795156],
    [1.017277, 0.027029, -0.044306, -0.006113, 0.958479, 0.047634, 0.006379, 0.248708, 0.744913],
    [1.104996, -0.046633, -0.058363, -0.032137, 0.971635, 0.060503, 0.001336, 0.317922, 0.680742],
    [1.193214, -0.109812, -0.083402, -0.058496, 0.97941, 0.079086, -0.002346, 0.403492, 0.598854],
    [1.257728, -0.139648, -0.118081, -0.078003, 0.975409, 0.102594, -0.003316, 0.501214, 0.502102],
    [1.278864, -0.125333, -0.153531, -0.084748, 0.957674, 0.127074, -0.000989, 0.601151, 0.399838],
    [1.255528, -0.076749, -0.178779, -0.078411, 0.930809, 0.147602, 0.004733, 0.691367, 0.3039],
  ],
};

/** 강도(%)가 10% 단위 0~100 범위인지 확인하고 행렬을 고른다. */
export function matrixFor(type: CvdType, strength: number): readonly number[] {
  const index = Math.round(strength / STRENGTH_STEP);
  if (index < 0 || index > 10) {
    throw new RangeError(`strength must be between 0 and 100: ${strength}`);
  }
  return CVD_MATRICES[type][index];
}

/* ── sRGB ↔ 선형 RGB ─────────────────────────────────────── */

/** 8비트 sRGB 값을 선형 RGB(0~1)로 (256칸 룩업) */
const SRGB_TO_LINEAR = new Float64Array(256);
for (let i = 0; i < 256; i++) {
  const c = i / 255;
  SRGB_TO_LINEAR[i] = c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/* 선형 → sRGB 인코딩을 픽셀마다 Math.pow 로 계산하면 2메가픽셀에서 700ms 를 넘어
   슬라이더가 끊긴다. 출력이 0~255 의 256가지뿐이라는 점을 이용해, 각 출력값의
   경계가 되는 선형값을 미리 구해 두고 이분 탐색으로 고른다 (pow 호출 0회).
   결과는 Math.round(encode(linear) * 255) 와 같은 값이다. */
const ENCODE_BOUNDARY = new Float64Array(256);
for (let v = 1; v <= 255; v++) {
  const s = (v - 0.5) / 255;
  ENCODE_BOUNDARY[v] = s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** 선형 RGB(0~1)를 8비트 sRGB로. 범위를 벗어난 값은 0~255로 자른다. */
function encodeSrgb(linear: number): number {
  if (linear <= 0) return 0;
  if (linear >= 1) return 255;
  let lo = 0;
  let hi = 255;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (ENCODE_BOUNDARY[mid] <= linear) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/** 캔버스 ImageData 와 같은 모양. 노드 테스트에서도 쓸 수 있도록 평범한 객체로 둔다. */
export type PixelBuffer = {
  /** ImageData.data 와 같은 버퍼 타입: ImageData 생성자에 그대로 넘길 수 있어야 한다 */
  data: Uint8ClampedArray<ArrayBuffer>;
  width: number;
  height: number;
};

function emptyLike(src: PixelBuffer): PixelBuffer {
  return {
    data: new Uint8ClampedArray(src.data.length),
    width: src.width,
    height: src.height,
  };
}

/**
 * 색각 유형 변환: 선형 RGB 에서 3x3 행렬을 적용한다.
 * 알파 채널은 변경하지 않는다. 강도 0% 는 원본 픽셀을 그대로 복사한다.
 */
export function simulateCvd(src: PixelBuffer, type: CvdType, strength: number): PixelBuffer {
  const m = matrixFor(type, strength);
  const out = emptyLike(src);
  const a = src.data;
  const b = out.data;

  if (strength === 0) {
    b.set(a);
    return out;
  }

  for (let i = 0; i < a.length; i += 4) {
    const r = SRGB_TO_LINEAR[a[i]];
    const g = SRGB_TO_LINEAR[a[i + 1]];
    const bl = SRGB_TO_LINEAR[a[i + 2]];
    b[i] = encodeSrgb(m[0] * r + m[1] * g + m[2] * bl);
    b[i + 1] = encodeSrgb(m[3] * r + m[4] * g + m[5] * bl);
    b[i + 2] = encodeSrgb(m[6] * r + m[7] * g + m[8] * bl);
    b[i + 3] = a[i + 3];
  }
  return out;
}

/**
 * 흑백 점검: 상대 휘도(0.2126R + 0.7152G + 0.0722B)를 선형 RGB 에서 구하고
 * 다시 sRGB 회색값으로 인코딩한다. 단순 채널 평균은 쓰지 않는다.
 */
export function toGrayscale(src: PixelBuffer): PixelBuffer {
  const out = emptyLike(src);
  const a = src.data;
  const b = out.data;

  for (let i = 0; i < a.length; i += 4) {
    const y =
      0.2126 * SRGB_TO_LINEAR[a[i]] +
      0.7152 * SRGB_TO_LINEAR[a[i + 1]] +
      0.0722 * SRGB_TO_LINEAR[a[i + 2]];
    const gray = encodeSrgb(y);
    b[i] = gray;
    b[i + 1] = gray;
    b[i + 2] = gray;
    b[i + 3] = a[i + 3];
  }
  return out;
}

/** 보기 유형 하나로 묶은 진입점. 흑백 점검은 강도를 받지 않는다. */
export function applyView(src: PixelBuffer, view: ViewType, strength: number): PixelBuffer {
  return view === "grayscale" ? toGrayscale(src) : simulateCvd(src, view, strength);
}

/* ── 입력 이미지 제약 ─────────────────────────────────────── */

export const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
/** 파일 크기 상한 10MB */
export const MAX_FILE_BYTES = 10 * 1024 * 1024;
/** 디코딩 상한 40메가픽셀 */
export const MAX_SOURCE_PIXELS = 40 * 1_000_000;
/** 인터랙티브 미리보기 처리 상한 2메가픽셀 */
export const MAX_PREVIEW_PIXELS = 2 * 1_000_000;

export type ImageIssue = "type" | "size" | "resolution" | "decode" | "process";

/** 형식·크기 등 파일 단계에서 바로 판정할 수 있는 문제 */
export function validateImageFile(file: File): ImageIssue | null {
  if (!(ACCEPTED_TYPES as readonly string[]).includes(file.type)) return "type";
  if (file.size > MAX_FILE_BYTES) return "size";
  return null;
}

/** 미리보기 처리 크기: 비율을 유지한 채 상한 픽셀 수 안으로 줄인다. */
export function previewSize(
  width: number,
  height: number,
  maxPixels = MAX_PREVIEW_PIXELS,
): { width: number; height: number } {
  const pixels = width * height;
  if (pixels <= maxPixels) return { width, height };
  const scale = Math.sqrt(maxPixels / pixels);
  return {
    width: Math.max(1, Math.floor(width * scale)),
    height: Math.max(1, Math.floor(height * scale)),
  };
}
