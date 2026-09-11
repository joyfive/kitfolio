import ColorBlindnessSimulator from "../components/ColorBlindnessSimulator";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("color-blindness-simulator", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("color-blindness-simulator", "ko")} />
      <ColorBlindnessSimulator />
    </>
  );
}
