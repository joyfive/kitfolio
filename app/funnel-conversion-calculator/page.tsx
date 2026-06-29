import FunnelConversionCalculator from "../components/marketing/FunnelConversionCalculator";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("funnel-conversion-calculator", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("funnel-conversion-calculator", "ko")} />
      <FunnelConversionCalculator />
    </>
  );
}
