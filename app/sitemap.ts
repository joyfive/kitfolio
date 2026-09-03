import type { MetadataRoute } from "next";
import { LEGAL_SLUGS, SITE, TOOLS, localizedHref } from "./lib/content";
import { getAllSlugs } from "./lib/blog";

export default function sitemap(): MetadataRoute.Sitemap {
  // sitemap 에는 "검색 랜딩 페이지로 제공할 품질이 확보된" 도구만 넣는다.
  // indexable=false 도구도 페이지는 정상 동작하고 허브·관련 도구 링크로 접근 가능하다.
  // 2026-09부터 robots noindex는 전면 폐기했으므로(결정 G) sitemap 제외가
  // indexable=false 도구에 대한 유일한 "덜 보이는" 신호다: 실제 크롤링·색인
  // 자체를 막지는 않는다.
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
