import { OG_SIZE, toolOgImage } from "../../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "JSON Formatter & Validator — Kitfolio";

export default function Image() {
  return toolOgImage("json-formatter", "en");
}
