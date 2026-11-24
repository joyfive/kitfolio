"use client";

import "../folio.css";
import PageHead from "./PageHead";
import ToolGuide from "./ToolGuide";
import RelatedTools from "./RelatedTools";
import FolioBuilder from "./folio/FolioBuilder";

export default function PortfolioBuilder() {
  return (
    <>
      <PageHead slug="portfolio-builder" />
      <FolioBuilder kind="portfolio" />
      <ToolGuide slug="portfolio-builder" />
      <RelatedTools slug="portfolio-builder" />
    </>
  );
}
