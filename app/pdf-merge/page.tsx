import PdfMerge from "../components/PdfMerge";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("pdf-merge", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("pdf-merge", "ko")} />
      <PdfMerge />
    </>
  );
}
