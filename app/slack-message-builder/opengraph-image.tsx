import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "슬랙 메시지 빌더 | Kitfolio";

export default function Image() {
  return toolOgImage("slack-message-builder", "ko");
}
