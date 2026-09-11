import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "명도대비 검사기 | Kitfolio";

export default function Image() {
  return toolOgImage("color-contrast-checker", "ko");
}
