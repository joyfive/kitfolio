import AdMetricCalculator from "../../components/marketing/AdMetricCalculator";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("roas-calculator", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("roas-calculator", "en")} />
      <AdMetricCalculator metricKey="roas" />
    </>
  );
}
