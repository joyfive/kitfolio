import { OG_SIZE, hubOgImage } from "./lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Kitfolio — Small tools for modern knowledge workers";

export default function Image() {
  return hubOgImage("ko");
}
