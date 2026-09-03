import AdMetricCalculator from "../../components/marketing/AdMetricCalculator";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("ad-metrics-calculator", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("ad-metrics-calculator", "en")} />
      <AdMetricCalculator defaultMetric="roas" />
    </>
  );
}
