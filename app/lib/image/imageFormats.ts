/* ============================================================
   이미지 최적화 도구: 포맷 정의 · 파일명 규칙 · 용량 표기.

   순수 함수만 둔다 (브라우저 API 의존 없음 → 테스트 가능).
   실제 디코딩/인코딩은 optimize.ts 에 있다.
   ============================================================ */

/** 입출력 모두 지원하는 이미지 포맷 */
export type ImageFormat = "png" | "jpeg" | "webp";

/** 출력 포맷 선택 순서 (기본값 = 첫 항목) */
export const OUTPUT_FORMATS: readonly ImageFormat[] = ["webp", "jpeg", "png"] as const;

/** 기본 출력 포맷 */
export const DEFAULT_FORMAT: ImageFormat = "webp";

/** WebP/JPG 기본 품질 (1~100) */
export const DEFAULT_QUALITY = 80;

export const MIME: Record<ImageFormat, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

/** 다운로드 파일 확장자 (jpeg 는 통용 표기인 jpg 를 쓴다) */
export const EXT: Record<ImageFormat, string> = {
  png: "png",
  jpeg: "jpg",
  webp: "webp",
};

/** UI 표기용 짧은 라벨 */
export const FORMAT_LABEL: Record<ImageFormat, string> = {
  png: "PNG",
  jpeg: "JPG",
  webp: "WebP",
};

/** 손실 압축 품질을 조절할 수 있는 포맷인가 (PNG 는 무손실 재인코딩만) */
export function supportsQuality(format: ImageFormat): boolean {
  return format === "jpeg" || format === "webp";
}

/** 투명 채널을 보존하는 포맷인가 (JPG 는 알파를 지원하지 않는다) */
export function supportsAlpha(format: ImageFormat): boolean {
  return format !== "jpeg";
}

/** JPG 로 저장할 때 투명 영역을 채우는 배경색 (MVP 고정값) */
export const JPEG_MATTE = "#FFFFFF";

/** 파일 입력 accept 속성 */
export const ACCEPT = "image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp";

/** MIME 타입 또는 확장자로 입력 포맷 판별. 지원하지 않으면 null. */
export function detectFormat(file: { name: string; type: string }): ImageFormat | null {
  switch (file.type) {
    case "image/png":
      return "png";
    case "image/jpeg":
    case "image/jpg":
      return "jpeg";
    case "image/webp":
      return "webp";
  }
  // 일부 환경에서 type 이 비어 오므로 확장자로 한 번 더 판별한다.
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  if (ext === "png") return "png";
  if (ext === "jpg" || ext === "jpeg") return "jpeg";
  if (ext === "webp") return "webp";
  return null;
}

/** 파일명에서 경로 구분자·제어문자를 제거한다. */
function sanitize(name: string): string {
  let out = "";
  for (const ch of name || "") {
    const code = ch.codePointAt(0) ?? 0;
    if (code < 0x20 || code === 0x7f) continue;
    out += "\\/:*?\"<>|".includes(ch) ? "-" : ch;
  }
  return out.trim();
}

/** 확장자를 제외한 베이스 이름. */
export function baseName(name: string): string {
  const stripped = sanitize(name).replace(/\.(png|jpe?g|webp)$/i, "");
  return stripped || "image";
}

/**
 * 결과 파일명: 원본 베이스 이름을 유지하고 확장자만 출력 포맷에 맞춘다.
 * 입력과 출력 포맷이 같으면 원본을 덮어쓴 것으로 오인하지 않도록
 * `-optimized` 접미사를 붙인다 (hero.jpg → hero-optimized.jpg).
 */
export function outputFileName(
  inputName: string,
  inputFormat: ImageFormat,
  outputFormat: ImageFormat,
): string {
  const base = baseName(inputName);
  const suffix = inputFormat === outputFormat ? "-optimized" : "";
  return `${base}${suffix}.${EXT[outputFormat]}`;
}

/**
 * ZIP 안에서 파일명이 겹치지 않게 번호를 붙인다.
 * 같은 이름이 다시 나오면 `name-2.webp`, `name-3.webp` 로 이어진다.
 */
export function dedupeNames(names: string[]): string[] {
  const seen = new Map<string, number>();
  return names.map((name) => {
    const key = name.toLowerCase();
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);
    if (count === 0) return name;

    const dot = name.lastIndexOf(".");
    const stem = dot > 0 ? name.slice(0, dot) : name;
    const ext = dot > 0 ? name.slice(dot) : "";
    return `${stem}-${count + 1}${ext}`;
  });
}

/** 용량 절감 결과. 결과가 더 크면 larger=true 이고 saved 는 늘어난 바이트다. */
export type Savings = {
  /** 줄어든(또는 늘어난) 바이트의 절대값 */
  saved: number;
  /** 변화율 (%). 음수로 표시하지 않고 방향은 larger 로 읽는다. */
  percent: number;
  /** 결과가 원본보다 큰가 */
  larger: boolean;
};

/**
 * 원본 대비 결과 용량 비교.
 * 절감률을 음수로 표시하지 않기 위해 방향(larger)과 크기(saved)를 분리한다.
 */
export function savings(inputBytes: number, outputBytes: number): Savings {
  const diff = inputBytes - outputBytes;
  const larger = diff < 0;
  const percent = inputBytes > 0 ? (Math.abs(diff) / inputBytes) * 100 : 0;
  return { saved: Math.abs(diff), percent, larger };
}

/** 사람이 읽는 파일 용량 표기 (예: 214 KB · 1.84 MB) */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B";
  if (bytes < 1024) return `${Math.round(bytes)} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  const mb = kb / 1024;
  return `${mb >= 100 ? mb.toFixed(0) : mb.toFixed(2)} MB`;
}

/** 변화율 표기 (소수 첫째 자리) */
export function formatPercent(percent: number): string {
  return `${percent.toFixed(1)}%`;
}

/** 분석 이벤트용 파일 크기 버킷: 실제 용량 대신 구간만 보낸다. */
export function fileSizeBucket(bytes: number): string {
  if (bytes < 100 * 1024) return "lt_100kb";
  if (bytes < 1024 * 1024) return "lt_1mb";
  if (bytes < 5 * 1024 * 1024) return "lt_5mb";
  if (bytes < 20 * 1024 * 1024) return "lt_20mb";
  return "gte_20mb";
}
