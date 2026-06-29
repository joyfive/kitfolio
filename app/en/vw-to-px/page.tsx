import UnitConverter from "../../components/UnitConverter";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("vw-to-px", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("vw-to-px", "en")} />
      <UnitConverter mode="vw-px" />
    </>
  );
}
