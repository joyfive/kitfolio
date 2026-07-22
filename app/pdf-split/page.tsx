import PdfSplit from "../components/PdfSplit";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("pdf-split", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("pdf-split", "ko")} />
      <PdfSplit />
    </>
  );
}
