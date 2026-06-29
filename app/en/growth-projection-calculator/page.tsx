import GrowthCalculator from "../../components/GrowthCalculator/GrowthCalculator";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("growth-projection-calculator", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("growth-projection-calculator", "en")} />
      <GrowthCalculator mode="growth-projection" />
    </>
  );
}
