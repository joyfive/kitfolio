import { OG_SIZE, toolOgImage } from "../../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Color Blindness Simulator | Kitfolio";

export default function Image() {
  return toolOgImage("color-blindness-simulator", "en");
}
