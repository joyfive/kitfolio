import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "유연근무 잔여시간 계산기 | Kitfolio";

export default function Image() {
  return toolOgImage("flex-work-calculator", "ko");
}
