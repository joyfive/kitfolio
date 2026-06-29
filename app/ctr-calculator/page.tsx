import AdMetricCalculator from "../components/marketing/AdMetricCalculator";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("ctr-calculator", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("ctr-calculator", "ko")} />
      <AdMetricCalculator metricKey="ctr" />
    </>
  );
}
