import TimeConverter from "../components/TimeConverter";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("time-converter", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("time-converter", "ko")} />
      <TimeConverter />
    </>
  );
}
