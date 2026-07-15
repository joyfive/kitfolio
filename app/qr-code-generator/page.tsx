import QrCodeGenerator from "../components/QrCodeGenerator";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("qr-code-generator", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("qr-code-generator", "ko")} />
      <QrCodeGenerator />
    </>
  );
}
