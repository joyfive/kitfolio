import AdMetricCalculator from "../components/marketing/AdMetricCalculator";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("cpm-calculator", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("cpm-calculator", "ko")} />
      <AdMetricCalculator metricKey="cpm" />
    </>
  );
}
