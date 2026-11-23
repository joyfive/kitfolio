import { notFound } from "next/navigation";
import JsonLd from "../../../components/JsonLd";
import PromptArticle from "../../../components/PromptArticle";
import { buildPromptMetadata, getPrompt, getPromptSlugs, promptJsonLd } from "../../../lib/prompts";

export const dynamicParams = false;

export function generateStaticParams() {
  return getPromptSlugs("en").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return buildPromptMetadata(slug, "en");
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPrompt(slug, "en");
  if (!post) notFound();
  return (
    <>
      <JsonLd data={promptJsonLd(post.meta)} />
      <PromptArticle slug={slug} lang="en" />
    </>
  );
}
