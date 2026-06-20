import LunarSolarConverter from "../components/LunarSolarConverter";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("lunar-solar-converter", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("lunar-solar-converter", "ko")} />
      <LunarSolarConverter />
    </>
  );
}
