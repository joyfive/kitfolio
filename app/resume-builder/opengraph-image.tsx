import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "경력기술서 빌더 | Kitfolio";

export default function Image() {
  return toolOgImage("resume-builder", "ko");
}
