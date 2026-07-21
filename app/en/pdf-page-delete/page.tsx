import PdfPageDelete from "../../components/PdfPageDelete";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("pdf-page-delete", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("pdf-page-delete", "en")} />
      <PdfPageDelete />
    </>
  );
}
