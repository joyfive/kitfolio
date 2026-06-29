import AdMetricCalculator from "../../components/marketing/AdMetricCalculator";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("cpa-calculator", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("cpa-calculator", "en")} />
      <AdMetricCalculator metricKey="cpa" />
    </>
  );
}
