import PdfPageDelete from "../components/PdfPageDelete";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("pdf-page-delete", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("pdf-page-delete", "ko")} />
      <PdfPageDelete />
    </>
  );
}
