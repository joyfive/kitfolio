import HtmlAccessibilityChecker from "../components/HtmlAccessibilityChecker";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("html-accessibility-checker", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("html-accessibility-checker", "ko")} />
      <HtmlAccessibilityChecker />
    </>
  );
}
