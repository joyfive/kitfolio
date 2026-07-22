import PdfRotate from "../../components/PdfRotate";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("pdf-rotate", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("pdf-rotate", "en")} />
      <PdfRotate />
    </>
  );
}
