import { OG_SIZE, toolOgImage } from "../../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Image Resizer & Cropper | Kitfolio";

export default function Image() {
  return toolOgImage("image-resizer-cropper", "en");
}
