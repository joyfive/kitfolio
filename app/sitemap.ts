import type { MetadataRoute } from "next";
import { LEGAL_SLUGS, SITE, localizedHref, publishedTools } from "./lib/content";
import { getAllSlugs } from "./lib/blog";
import { getPromptSlugs } from "./lib/prompts";

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

  // 업무 프롬프트: 한쪽 언어만 있을 수 있어 언어별로 넣는다 (없는 언어 URL 은 404 이므로 제외).
  // 목록 페이지도 그 언어로 공개된 글이 있을 때만 존재한다.
  const promptKo = new Set(getPromptSlugs("ko"));
  const promptEn = new Set(getPromptSlugs("en"));
  const promptPaths = [
    ...(promptKo.size || promptEn.size ? ["/prompts"] : []),
    ...[...new Set([...promptKo, ...promptEn])].map((s) => "/prompts/" + s),
  ];
  for (const p of promptPaths) {
    const slug = p.split("/")[2];
    const inKo = slug ? promptKo.has(slug) : promptKo.size > 0;
    const inEn = slug ? promptEn.has(slug) : promptEn.size > 0;
    const languages: Record<string, string> = {};
    if (inKo) languages.ko = SITE.url + localizedHref("ko", p);
    if (inEn) languages.en = SITE.url + localizedHref("en", p);
    for (const url of Object.values(languages)) {
      entries.push({ url, changeFrequency: "weekly", priority: 0.7, alternates: { languages } });
    }
  }
  return entries;
}
