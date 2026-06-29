import GrowthCalculator from "../components/GrowthCalculator/GrowthCalculator";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("required-growth-calculator", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("required-growth-calculator", "ko")} />
      <GrowthCalculator mode="required-growth" />
    </>
  );
}
