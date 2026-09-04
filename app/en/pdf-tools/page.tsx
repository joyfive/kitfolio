import PdfTools from "../../components/PdfTools";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("pdf-tools", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("pdf-tools", "en")} />
      <PdfTools defaultTab="merge" />
    </>
  );
}
