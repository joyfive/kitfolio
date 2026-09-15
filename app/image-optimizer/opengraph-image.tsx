import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "이미지 최적화 | Kitfolio";

export default function Image() {
  return toolOgImage("image-optimizer", "ko");
}
