import TimeCalculator from "../../components/TimeCalculator";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("time-calculator", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("time-calculator", "en")} />
      <TimeCalculator />
    </>
  );
}
