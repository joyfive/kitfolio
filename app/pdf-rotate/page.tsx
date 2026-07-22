import PdfRotate from "../components/PdfRotate";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("pdf-rotate", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("pdf-rotate", "ko")} />
      <PdfRotate />
    </>
  );
}
