/* ============================================================
   이미지 최적화 공통 오류 타입 + 다국어 메시지.
   컴포넌트는 ImageErrorType 만 다루고, 표시 문구는 이 파일에서 가져온다.
   ============================================================ */
import type { Lang } from "../content";
import { LIMIT_SUMMARY } from "./imageLimits";

export type ImageErrorType =
  | "unsupported-format"
  | "decode-failed"
  | "encode-failed"
  | "file-too-large"
  | "too-many-files"
  | "image-too-large";

/** 예외로 던져 상위에서 ImageErrorType 으로 잡을 수 있게 하는 에러 */
export class ImageError extends Error {
  type: ImageErrorType;
  constructor(type: ImageErrorType, message?: string) {
    super(message ?? type);
    this.name = "ImageError";
    this.type = type;
  }
}

const MESSAGES: Record<Lang, Record<ImageErrorType, string>> = {
  ko: {
    "unsupported-format": "PNG, JPG, WebP 이미지만 사용할 수 있습니다.",
    "decode-failed": "이미지를 불러올 수 없습니다.",
    "encode-failed": "이미지를 최적화하지 못했습니다. 다시 시도해 주세요.",
    "file-too-large": `파일 1개는 ${LIMIT_SUMMARY.maxFileMb}MB 까지 처리할 수 있습니다.`,
    "too-many-files": `한 번에 ${LIMIT_SUMMARY.maxFiles}개까지 추가할 수 있습니다.`,
    "image-too-large": `이미지가 너무 큽니다. 한 변 ${LIMIT_SUMMARY.maxSide}px, 전체 ${LIMIT_SUMMARY.maxMegapixels}메가픽셀까지 처리할 수 있습니다.`,
  },
  en: {
    "unsupported-format": "Only PNG, JPG, and WebP images are supported.",
    "decode-failed": "This image could not be loaded.",
    "encode-failed": "The image could not be optimized. Please try again.",
    "file-too-large": `Each file can be up to ${LIMIT_SUMMARY.maxFileMb}MB.`,
    "too-many-files": `You can add up to ${LIMIT_SUMMARY.maxFiles} files at a time.`,
    "image-too-large": `This image is too large. Images can be up to ${LIMIT_SUMMARY.maxSide}px per side and ${LIMIT_SUMMARY.maxMegapixels} megapixels.`,
  },
};

export function imageErrorMessage(type: ImageErrorType, lang: Lang): string {
  return MESSAGES[lang][type];
}

/** 임의의 예외를 ImageErrorType 으로 정규화 */
export function normalizeImageError(err: unknown): ImageErrorType {
  if (err instanceof ImageError) return err.type;
  const msg = String((err as Error)?.message ?? err ?? "").toLowerCase();
  if (msg.includes("decode") || msg.includes("load") || msg.includes("source image")) {
    return "decode-failed";
  }
  return "encode-failed";
}
