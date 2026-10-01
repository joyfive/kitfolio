import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "프리랜서 3.3% 계산기 | Kitfolio";

export default function Image() {
  return toolOgImage("freelancer-tax-calculator", "ko");
}
