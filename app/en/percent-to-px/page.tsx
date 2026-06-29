import UnitConverter from "../../components/UnitConverter";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("percent-to-px", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("percent-to-px", "en")} />
      <UnitConverter mode="percent-px" />
    </>
  );
}
