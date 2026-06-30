import SalaryCalculator from "../../components/SalaryCalculator";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("salary-calculator", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("salary-calculator", "en")} />
      <SalaryCalculator />
    </>
  );
}
