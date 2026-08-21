import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "광고 예산 페이싱 계산기 | Kitfolio";

export default function Image() {
  return toolOgImage("ad-budget-pacing-calculator", "ko");
}
