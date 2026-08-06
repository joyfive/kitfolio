import { notFound } from "next/navigation";
import BlogArticle from "../../components/BlogArticle";
import JsonLd from "../../components/JsonLd";
import { getAllSlugs, getPost, buildPostMetadata, postJsonLd } from "../../lib/blog";

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return buildPostMetadata(slug, "ko");
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug, "ko");
  if (!post) notFound();
  return (
    <>
      <JsonLd data={postJsonLd(post.meta)} />
      <BlogArticle slug={slug} lang="ko" />
    </>
  );
}
