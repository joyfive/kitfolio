import type { MetadataRoute } from "next";
import { LEGAL_SLUGS, SITE, TOOLS, localizedHref } from "./lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const toolPaths = TOOLS.filter((t) => t.ready).map((t) => "/" + t.slug);
  const legalPaths = LEGAL_SLUGS.map((s) => "/" + s);
  const paths = ["/", ...toolPaths, ...legalPaths];
  const legal = new Set(legalPaths);
  const entries: MetadataRoute.Sitemap = [];

  for (const p of paths) {
    const koUrl = SITE.url + localizedHref("ko", p);
    const enUrl = SITE.url + localizedHref("en", p);
    const languages = { ko: koUrl, en: enUrl };
    for (const url of [koUrl, enUrl]) {
      entries.push({
        url,
        changeFrequency: legal.has(p) ? "yearly" : "weekly",
        priority: p === "/" ? 1 : legal.has(p) ? 0.3 : 0.8,
        alternates: { languages },
      });
    }
  }
  return entries;
}
