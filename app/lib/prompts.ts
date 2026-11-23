/* ============================================================
   Kitfolio: 업무 프롬프트 (/prompts)

   "일할 때 필요한 도구"의 한 종류로, 업무에 바로 붙여 쓰는 프롬프트를 글로 제공한다.
   AI 생성 기능은 없다. 운영자가 직접 써서 커밋·배포하면 게시된다 (CMS·DB 없음).
   블로그와 같은 마크다운 파이프라인을 쓰되, 대표 이미지 대신 제목으로 썸네일을 만든다.

   ── 파일 규칙 ────────────────────────────────────────────
   content/prompts/<slug>.ko.md   (한국어)
   content/prompts/<slug>.en.md   (영어, 선택)
   - 한쪽 언어만 있어도 된다. 있는 언어에만 페이지·목록·sitemap 이 생긴다.
   - "_" 로 시작하는 파일은 읽지 않는다 (작성 템플릿용).

   ── 프론트매터 ───────────────────────────────────────────
   title:        <제목>                (필수 · 썸네일·OG 이미지 문구로도 쓰인다)
   description:  <메타 설명>            (필수)
   date:         YYYY-MM-DD            (필수 · 게재일, 정렬 기준)
   updated:      YYYY-MM-DD            (선택 · 내용 수정일)
   tags:         태그1, 태그2           (선택)
   relatedTools: slug-a, slug-b        (선택 · 레지스트리 도구 slug)
   draft:        true                  (선택 · 프로덕션 빌드에서 제외, 개발 서버에서만 보임)

   본문의 메뉴 경로는 {{ui:<id>}} 토큰으로 쓴다 (app/lib/ui-paths.ts).
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import type { Metadata } from "next";
import { AUTHOR, PUBLISHER_JSONLD, SITE, type Lang } from "./content";
import { fixCjkEmphasis, parseFrontmatter, toList } from "./blog";
import { resolveUiPaths, type UiPathUse } from "./ui-paths";

const PROMPTS_DIR = path.join(process.cwd(), "content", "prompts");

/** 초안 노출 여부: 프로덕션 빌드에서는 draft 를 전부 제외한다. */
function showDrafts(): boolean {
  return process.env.NODE_ENV !== "production";
}

export type PromptMeta = {
  slug: string;
  lang: Lang;
  title: string;
  description: string;
  /** 게재일 */
  date: string;
  updated?: string;
  tags: string[];
  relatedTools: string[];
  draft: boolean;
  author: string;
};

export type PromptPost = {
  meta: PromptMeta;
  html: string;
  /** 본문에서 쓴 메뉴 경로 (확인일 안내용) */
  uiPaths: UiPathUse[];
};

function fileFor(slug: string, lang: Lang): string {
  return path.join(PROMPTS_DIR, `${slug}.${lang}.md`);
}

function readMeta(slug: string, lang: Lang): { meta: PromptMeta; body: string } | null {
  const file = fileFor(slug, lang);
  if (!fs.existsSync(file)) return null;
  const { data, body } = parseFrontmatter(fs.readFileSync(file, "utf8"));
  const meta: PromptMeta = {
    slug,
    lang,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ?? "1970-01-01",
    updated: data.updated || undefined,
    tags: toList(data.tags),
    relatedTools: toList(data.relatedTools),
    draft: data.draft === "true",
    author: AUTHOR.name[lang],
  };
  if (meta.draft && !showDrafts()) return null;
  return { meta, body };
}

/** 해당 언어로 공개된 프롬프트 slug */
export function getPromptSlugs(lang: Lang): string[] {
  if (!fs.existsSync(PROMPTS_DIR)) return [];
  const out: string[] = [];
  for (const f of fs.readdirSync(PROMPTS_DIR)) {
    const m = /^([a-z0-9][a-z0-9-]*)\.(ko|en)\.md$/.exec(f);
    if (!m || m[2] !== lang) continue;
    if (readMeta(m[1], lang)) out.push(m[1]);
  }
  return out.sort();
}

/** 같은 프롬프트가 다른 언어로도 공개돼 있는가 (hreflang 연결 여부) */
export function hasPromptIn(slug: string, lang: Lang): boolean {
  return readMeta(slug, lang) !== null;
}

/** 목록용: 해당 언어로 공개된 프롬프트, 게재일 최신순 */
export function getAllPromptsMeta(lang: Lang): PromptMeta[] {
  return getPromptSlugs(lang)
    .map((s) => readMeta(s, lang)!.meta)
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.slug.localeCompare(b.slug)));
}

/** 단일 프롬프트 글. 없거나 (프로덕션에서) 초안이면 null. */
export function getPrompt(slug: string, lang: Lang): PromptPost | null {
  const r = readMeta(slug, lang);
  if (!r) return null;
  const { text, used } = resolveUiPaths(r.body, lang, `content/prompts/${slug}.${lang}.md`);
  const html = (marked.parse(fixCjkEmphasis(text)) as string).replace(
    /<a /g,
    '<a target="_blank" rel="noopener noreferrer" ',
  );
  return { meta: r.meta, html, uiPaths: used };
}

/** 글이 쓴 메뉴 경로 중 가장 오래된 확인일 (없으면 null) */
export function oldestUiVerifiedAt(uses: UiPathUse[]): string | null {
  if (!uses.length) return null;
  return uses.map((u) => u.verifiedAt).sort()[0];
}

const LABEL = {
  ko: {
    title: "업무 프롬프트",
    tagline: "일할 때 바로 붙여 쓰는 프롬프트 · 쓰는 곳과 적용 방법까지",
    published: "게재",
    updated: "업데이트",
    back: "업무 프롬프트",
    empty: "아직 게시된 프롬프트가 없습니다.",
    copy: "복사",
    copied: "복사됨",
    uiVerified: (date: string, services: string) =>
      `이 글의 메뉴 경로(${services})는 ${date}에 확인한 화면 기준입니다. 서비스 화면이 바뀌면 이름이나 위치가 다를 수 있습니다.`,
    related: "관련 도구",
    badge: "업무 프롬프트",
  },
  en: {
    title: "Work Prompts",
    tagline: "Prompts you can paste straight into your work, with where and how to use them",
    published: "Published",
    updated: "Updated",
    back: "Work Prompts",
    empty: "No prompts published yet.",
    copy: "Copy",
    copied: "Copied",
    uiVerified: (date: string, services: string) =>
      `Menu paths in this post (${services}) were checked against the screens on ${date}. If the service changes its screens, names or locations may differ.`,
    related: "Related tools",
    badge: "Work prompt",
  },
} as const;

export function promptLabel(lang: Lang) {
  return LABEL[lang];
}

/* ── 메타데이터 / JSON-LD ─────────────────────────────── */

const href = (lang: Lang, p: string) => (lang === "ko" ? p : "/en" + p);

export function buildPromptListMetadata(lang: Lang): Metadata {
  const l = LABEL[lang];
  const url = href(lang, "/prompts");
  const title = `${l.title} | ${SITE.name}`;
  const languages: Record<string, string> = {};
  if (getPromptSlugs("ko").length) languages["ko-KR"] = "/prompts";
  if (getPromptSlugs("en").length) languages["en-US"] = "/en/prompts";
  return {
    title: { absolute: title },
    description: l.tagline,
    alternates: { canonical: url, languages },
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

export function buildPromptMetadata(slug: string, lang: Lang): Metadata {
  const r = readMeta(slug, lang);
  if (!r) return {};
  const { meta } = r;
  const url = href(lang, `/prompts/${slug}`);
  const languages: Record<string, string> = {};
  for (const l of ["ko", "en"] as const) {
    if (hasPromptIn(slug, l)) languages[l === "ko" ? "ko-KR" : "en-US"] = href(l, `/prompts/${slug}`);
  }
  return {
    title: { absolute: `${meta.title} | ${SITE.name}` },
    description: meta.description,
    alternates: { canonical: url, languages },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url,
      siteName: SITE.name,
      type: "article",
      locale: lang === "ko" ? "ko_KR" : "en_US",
      publishedTime: meta.date,
      modifiedTime: meta.updated ?? meta.date,
    },
  };
}

export function promptJsonLd(meta: PromptMeta) {
  const url = SITE.url + href(meta.lang, `/prompts/${meta.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    datePublished: meta.date,
    dateModified: meta.updated ?? meta.date,
    inLanguage: meta.lang === "ko" ? "ko-KR" : "en-US",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    image: url + "/opengraph-image",
    author: { "@type": AUTHOR.type, name: meta.author, url: SITE.url + AUTHOR.path },
    publisher: PUBLISHER_JSONLD,
    ...(meta.tags.length ? { keywords: meta.tags.join(", ") } : {}),
  };
}
