import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "종합소득세 계산기 | Kitfolio";

export default function Image() {
  return toolOgImage("income-tax-calculator", "ko");
}
