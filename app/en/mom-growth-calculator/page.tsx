import GrowthCalculator from "../../components/GrowthCalculator/GrowthCalculator";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("mom-growth-calculator", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("mom-growth-calculator", "en")} />
      <GrowthCalculator mode="mom-growth" />
    </>
  );
}
