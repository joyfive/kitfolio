import UnitConverter from "../components/UnitConverter";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("ms-to-s", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("ms-to-s", "ko")} />
      <UnitConverter mode="ms-s" />
    </>
  );
}
