import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "시간 단위 변환기 | Kitfolio";

export default function Image() {
  return toolOgImage("time-converter", "ko");
}
