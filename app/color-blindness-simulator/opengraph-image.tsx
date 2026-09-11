import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "색각이상 시뮬레이터 | Kitfolio";

export default function Image() {
  return toolOgImage("color-blindness-simulator", "ko");
}
