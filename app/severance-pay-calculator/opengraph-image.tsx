import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "퇴직금 계산기 | Kitfolio";

export default function Image() {
  return toolOgImage("severance-pay-calculator", "ko");
}
