import GrowthCalculator from "../components/GrowthCalculator/GrowthCalculator";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("yoy-growth-calculator", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("yoy-growth-calculator", "ko")} />
      <GrowthCalculator mode="yoy-growth" />
    </>
  );
}
