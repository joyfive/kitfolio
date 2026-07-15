import QrCodeGenerator from "../../components/QrCodeGenerator";
import JsonLd from "../../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../../lib/content";

export const metadata = buildToolMetadata("qr-code-generator", "en");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("qr-code-generator", "en")} />
      <QrCodeGenerator />
    </>
  );
}
