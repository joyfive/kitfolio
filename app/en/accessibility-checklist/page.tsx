import AccessibilityChecklist from "../../components/AccessibilityChecklist";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("accessibility-checklist", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("accessibility-checklist", "en")} />
      <AccessibilityChecklist />
    </>
  );
}
