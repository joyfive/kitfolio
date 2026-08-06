/* ============================================================
   Kitfolio — 블로그(아티클) 시스템

   아티클은 소스의 마크다운 파일로 작성하고, 빌드 시 HTML로 렌더한다.
   CMS·DB 없음 — 파일을 커밋하고 배포하면 게시된다.

   ── 파일 규칙 ────────────────────────────────────────────
   content/blog/<slug>.ko.md   (한국어)
   content/blog/<slug>.en.md   (영어)
   각 파일은 프론트매터(--- ... ---) + 마크다운 본문으로 구성.

   ── 프론트매터 필드 ──────────────────────────────────────
   title:        <제목>                (필수)
   description:  <메타 설명>            (필수)
   date:         YYYY-MM-DD            (필수, 정렬 기준)
   updated:      YYYY-MM-DD            (선택)
   cover:        /blog/<slug>.png      (선택, public/ 기준 절대경로)
   coverAlt:     <대체 텍스트>          (선택)
   relatedTools: slug-a, slug-b        (선택, 쉼표 구분)
   tags:         태그1, 태그2           (선택, 쉼표 구분)
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import type { Metadata } from "next";
import { SITE, type Lang } from "./content";

marked.use({ gfm: true, breaks: false });

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

export type PostMeta = {
  slug: string;
  lang: Lang;
  title: string;
  description: string;
  date: string;
  updated?: string;
  cover?: string;
  coverAlt?: string;
  relatedTools: string[];
  tags: string[];
};

export type Post = { meta: PostMeta; html: string };

/** 아주 단순한 프론트매터 파서 — key: value, 리스트는 쉼표 구분.
 *  아티클은 신뢰된 소스(리포 커밋)이므로 최소 파서로 충분하다. */
function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const m = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/.exec(raw);
  if (!m) return { data: {}, body: raw };
  const data: Record<string, string> = {};
  for (const line of m[1].split("\n")) {
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key) data[key] = val;
  }
  return { data, body: m[2] };
}

function toList(v?: string): string[] {
  if (!v) return [];
  return v
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((s) => s.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

function fileFor(slug: string, lang: Lang): string {
  return path.join(BLOG_DIR, `${slug}.${lang}.md`);
}

/** content/blog 에 존재하는 모든 아티클 slug (양 언어 파일이 있는 것 기준) */
export function getAllSlugs(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  const slugs = new Set<string>();
  for (const f of fs.readdirSync(BLOG_DIR)) {
    const m = /^(.+)\.(ko|en)\.md$/.exec(f);
    if (m) slugs.add(m[1]);
  }
  return [...slugs];
}

function metaFromData(
  slug: string,
  lang: Lang,
  data: Record<string, string>,
): PostMeta {
  return {
    slug,
    lang,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ?? "1970-01-01",
    updated: data.updated || undefined,
    cover: data.cover || undefined,
    coverAlt: data.coverAlt || undefined,
    relatedTools: toList(data.relatedTools),
    tags: toList(data.tags),
  };
}

/** 단일 아티클 (프론트매터 + 렌더된 HTML). 없으면 null. */
export function getPost(slug: string, lang: Lang): Post | null {
  const file = fileFor(slug, lang);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, body } = parseFrontmatter(raw);
  const html = marked.parse(body) as string;
  return { meta: metaFromData(slug, lang, data), html };
}

/** 목록용 메타데이터만 (해당 언어 파일이 있는 아티클, 최신순). */
export function getAllPostsMeta(lang: Lang): PostMeta[] {
  return getAllSlugs()
    .map((slug) => {
      const file = fileFor(slug, lang);
      if (!fs.existsSync(file)) return null;
      const { data } = parseFrontmatter(fs.readFileSync(file, "utf8"));
      return metaFromData(slug, lang, data);
    })
    .filter((m): m is PostMeta => m !== null)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

/** 날짜 포맷 (ko: 2026년 8월 6일 / en: August 6, 2026) */
export function formatDate(iso: string, lang: Lang): string {
  const d = new Date(iso + "T00:00:00Z");
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(lang === "ko" ? "ko-KR" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

const BLOG_LABEL = {
  ko: { title: "블로그", tagline: "도구를 더 잘 쓰기 위한 이야기 — 계산·지표·CSS·업무 팁" },
  en: { title: "Blog", tagline: "Notes for getting more out of the tools — calculations, metrics, CSS and work tips" },
};

export function blogLabel(lang: Lang) {
  return BLOG_LABEL[lang];
}

/* ── 메타데이터 / JSON-LD ─────────────────────────────── */

function abs(p: string): string {
  return p.startsWith("http") ? p : SITE.url + p;
}

export function buildBlogListMetadata(lang: Lang): Metadata {
  const l = BLOG_LABEL[lang];
  const koUrl = "/blog";
  const enUrl = "/en/blog";
  const url = lang === "ko" ? koUrl : enUrl;
  const title = `${l.title} — ${SITE.name}`;
  return {
    title: { absolute: title },
    description: l.tagline,
    alternates: {
      canonical: url,
      languages: { "ko-KR": koUrl, "en-US": enUrl, "x-default": koUrl },
    },
    openGraph: {
      title,
      description: l.tagline,
      url,
      siteName: SITE.name,
      type: "website",
      locale: lang === "ko" ? "ko_KR" : "en_US",
    },
  };
}

export function buildPostMetadata(slug: string, lang: Lang): Metadata {
  const post = getPost(slug, lang);
  if (!post) return {};
  const { meta } = post;
  const koUrl = `/blog/${slug}`;
  const enUrl = `/en/blog/${slug}`;
  const url = lang === "ko" ? koUrl : enUrl;
  return {
    title: { absolute: `${meta.title} — ${SITE.name}` },
    description: meta.description,
    alternates: {
      canonical: url,
      languages: { "ko-KR": koUrl, "en-US": enUrl, "x-default": koUrl },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      siteName: SITE.name,
      type: "article",
      locale: lang === "ko" ? "ko_KR" : "en_US",
      publishedTime: meta.date,
      modifiedTime: meta.updated ?? meta.date,
      images: meta.cover ? [{ url: abs(meta.cover) }] : undefined,
    },
  };
}

export function postJsonLd(meta: PostMeta) {
  const url = abs((meta.lang === "ko" ? "" : "/en") + `/blog/${meta.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    dateModified: meta.updated ?? meta.date,
    inLanguage: meta.lang === "ko" ? "ko-KR" : "en-US",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    image: meta.cover ? abs(meta.cover) : undefined,
    author: { "@type": "Organization", name: SITE.name, url: SITE.url },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
  };
}
