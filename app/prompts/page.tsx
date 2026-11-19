import { notFound } from "next/navigation";
import JsonLd from "../components/JsonLd";
import PromptList from "../components/PromptList";
import { SITE } from "../lib/content";
import { buildPromptListMetadata, getPromptSlugs, promptLabel } from "../lib/prompts";

export const metadata = buildPromptListMetadata("ko");

export default function Page() {
  // 공개된 글이 없으면 빈 목록을 색인시키지 않는다 (헤더 링크·sitemap 도 같은 조건).
  if (getPromptSlugs("ko").length === 0) notFound();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${promptLabel("ko").title} | ${SITE.name}`,
    url: `${SITE.url}/prompts`,
    inLanguage: "ko-KR",
  };
  return (
    <>
      <JsonLd data={jsonLd} />
      <PromptList lang="ko" />
    </>
  );
}
