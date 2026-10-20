import KstUtcConverter from "../components/KstUtcConverter";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("kst-utc-converter", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("kst-utc-converter", "ko")} />
      <KstUtcConverter />
    </>
  );
}
