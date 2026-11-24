"use client";

import "../folio.css";
import PageHead from "./PageHead";
import ToolGuide from "./ToolGuide";
import RelatedTools from "./RelatedTools";
import FolioBuilder from "./folio/FolioBuilder";
import FolioTabs from "./folio/FolioTabs";

export default function ResumeBuilder() {
  return (
    <>
      <FolioTabs current="resume-builder" />
      <PageHead slug="resume-builder" />
      <FolioBuilder kind="resume" />
      <ToolGuide slug="resume-builder" />
      <RelatedTools slug="resume-builder" />
    </>
  );
}
