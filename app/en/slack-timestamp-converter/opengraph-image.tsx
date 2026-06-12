import { OG_SIZE, toolOgImage } from "../../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Slack Timestamp Converter — Kitfolio";

export default function Image() {
  return toolOgImage("slack-timestamp-converter", "en");
}
