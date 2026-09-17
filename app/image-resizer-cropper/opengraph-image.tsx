import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "이미지 리사이즈·크롭 | Kitfolio";

export default function Image() {
  return toolOgImage("image-resizer-cropper", "ko");
}
