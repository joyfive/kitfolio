import UnitConverter from "../components/UnitConverter";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("em-to-px", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("em-to-px", "ko")} />
      <UnitConverter mode="em-px" />
    </>
  );
}
