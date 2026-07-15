import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "QR 코드 읽기 — Kitfolio";

export default function Image() {
  return toolOgImage("qr-code-reader", "ko");
}
