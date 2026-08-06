import BlogList from "../components/BlogList";
import JsonLd from "../components/JsonLd";
import { buildBlogListMetadata } from "../lib/blog";
import { SITE } from "../lib/content";

export const metadata = buildBlogListMetadata("ko");

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE.name} 블로그`,
    url: `${SITE.url}/blog`,
    inLanguage: "ko-KR",
  };
  return (
    <>
      <JsonLd data={jsonLd} />
      <BlogList lang="ko" />
    </>
  );
}
