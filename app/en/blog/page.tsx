import BlogList from "../../components/BlogList";
import JsonLd from "../../components/JsonLd";
import { buildBlogListMetadata } from "../../lib/blog";
import { SITE } from "../../lib/content";

export const metadata = buildBlogListMetadata("en");

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${SITE.name} Blog`,
    url: `${SITE.url}/en/blog`,
    inLanguage: "en-US",
  };
  return (
    <>
      <JsonLd data={jsonLd} />
      <BlogList lang="en" />
    </>
  );
}
