import type { MetadataRoute } from "next";
import { SITE, TOOLS, localizedHref } from "./lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["/", ...TOOLS.filter((t) => t.ready).map((t) => "/" + t.slug)];
  const entries: MetadataRoute.Sitemap = [];

  for (const p of paths) {
    const koUrl = SITE.url + localizedHref("ko", p);
    const enUrl = SITE.url + localizedHref("en", p);
    const languages = { ko: koUrl, en: enUrl };
    for (const url of [koUrl, enUrl]) {
      entries.push({
        url,
        changeFrequency: "weekly",
        priority: p === "/" ? 1 : 0.8,
        alternates: { languages },
      });
    }
  }
  return entries;
}
