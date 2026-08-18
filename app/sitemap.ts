import type { MetadataRoute } from "next";
import { LEGAL_SLUGS, SITE, TOOLS, localizedHref } from "./lib/content";
import { getAllSlugs } from "./lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  // sitemap 에는 "검색 랜딩 페이지로 제공할 품질이 확보된" 도구만 넣는다.
  // indexable=false 도구도 페이지는 정상 동작하고 허브·관련 도구 링크로 접근 가능하며,
  // robots noindex,follow (buildToolMetadata) 로만 색인에서 제외된다.
  const toolPaths = TOOLS.filter((t) => t.ready && t.indexable).map(
    (t) => "/" + t.slug,
  );
  const legalPaths = LEGAL_SLUGS.map((s) => "/" + s);
  const blogPaths = ["/blog", ...getAllSlugs().map((s) => "/blog/" + s)];
  const paths = ["/", ...toolPaths, ...blogPaths, ...legalPaths];
  const legal = new Set(legalPaths);
  const blog = new Set(blogPaths);
  const entries: MetadataRoute.Sitemap = [];

  for (const p of paths) {
    const koUrl = SITE.url + localizedHref("ko", p);
    const enUrl = SITE.url + localizedHref("en", p);
    const languages = { ko: koUrl, en: enUrl };
    for (const url of [koUrl, enUrl]) {
      entries.push({
        url,
        changeFrequency: legal.has(p) ? "yearly" : "weekly",
        priority: p === "/" ? 1 : legal.has(p) ? 0.3 : blog.has(p) ? 0.7 : 0.8,
        alternates: { languages },
      });
    }
  }
  return entries;
}
