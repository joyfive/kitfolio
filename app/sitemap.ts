import type { MetadataRoute } from "next";
import { LEGAL_SLUGS, SITE, localizedHref, publishedTools } from "./lib/content";
import { getAllSlugs } from "./lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  // 도구는 페이지 기준: 공개된(ready) 도구 페이지는 전부 넣는다 (2026-10-24).
  // 허브 카드와 같은 목록(publishedTools)이라 새 도구 페이지는 레지스트리에 추가하는
  // 순간 카드·sitemap 에 함께 들어온다. ?mode= 탭은 페이지가 아니므로 넣지 않는다.
  const toolPaths = publishedTools().map((t) => "/" + t.slug);
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
