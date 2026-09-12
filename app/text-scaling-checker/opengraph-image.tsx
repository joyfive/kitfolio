import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "텍스트 확대·간격 검사기 | Kitfolio";

export default function Image() {
  return toolOgImage("text-scaling-checker", "ko");
}
