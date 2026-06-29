import AdBudgetPacingCalculator from "../components/marketing/AdBudgetPacingCalculator";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("ad-budget-pacing-calculator", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("ad-budget-pacing-calculator", "ko")} />
      <AdBudgetPacingCalculator />
    </>
  );
}
