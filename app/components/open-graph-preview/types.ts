// OG 미리보기 테스트 — 공유 타입 정의

export type ImageSourceMode = "upload" | "url" | "code";

export type ImageSource = {
  mode: ImageSourceMode;
  /** 프리뷰에 사용할 이미지 URL (Object URL · 원격 URL · Data URL) */
  src: string;
  width: number;
  height: number;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
};

export type LoadStatus = "idle" | "loading" | "success" | "error";

export type LoadState = {
  status: LoadStatus;
  message?: string;
};

export type PlatformId =
  | "kakao"
  | "facebook"
  | "x"
  | "threads"
  | "linkedin"
  | "naver-blog"
  | "notion";

export type PreviewLayout =
  | "stacked"
  | "horizontal-left"
  | "horizontal-right";

export type PlatformPreset = {
  id: PlatformId;
  label: string;
  layout: PreviewLayout;
  /** 카드 이미지 영역 비율 (width / height) */
  imageAspectRatio: number;
  titleLines: number;
  descriptionLines: number;
  showDescription: boolean;
  showDomain: boolean;
  imagePosition: "left" | "right" | "top";
};
