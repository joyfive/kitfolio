import PortfolioBuilder from "../components/PortfolioBuilder";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("portfolio-builder", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("portfolio-builder", "ko")} />
      <PortfolioBuilder />
    </>
  );
}
