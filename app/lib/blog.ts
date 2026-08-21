/* ============================================================
   Kitfolio: 블로그(아티클) 시스템

   아티클은 소스의 마크다운 파일로 작성하고, 빌드 시 HTML로 렌더한다.
   CMS·DB 없음: 파일을 커밋하고 배포하면 게시된다.

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

   ── 신뢰 정보 필드 (선택) ────────────────────────────────
   author:       <작성자명>             (생략 시 사이트 운영자 AUTHOR)
   authorRole:   <역할>                 (생략 시 AUTHOR.role)
   reviewedAt:   YYYY-MM-DD            (내용을 마지막으로 사실 확인한 날짜)
   sources:      라벨|URL, 라벨|URL     (공식 출처, 쉼표 구분 / 라벨과 URL은 | 로 구분)

   ⚠️ sources 는 모든 글에 강제하지 않는다. 세금·보험·플랫폼 정책·기술 명세처럼
   외부 기준에 의존하는 글에만 붙이고, 기관·표준 1차 자료만 사용한다.
   ============================================================ */
import fs from "node:fs";
import path from "node:path";
import { marked } from "marked";
import type { Metadata } from "next";
import { AUTHOR, SITE, type Lang } from "./content";

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
  /** 작성자명: 프론트매터 author 또는 사이트 운영자 */
  author: string;
  /** 작성자 역할: 프론트매터 authorRole 또는 AUTHOR.role */
  authorRole: string;
  /** 내용을 마지막으로 사실 확인한 날짜 (선택) */
  reviewedAt?: string;
  /** 공식 출처 (선택): 외부 기준에 의존하는 글에만 */
  sources: { label: string; url: string }[];
};

export type Post = { meta: PostMeta; html: string };

/** 아주 단순한 프론트매터 파서: key: value, 리스트는 쉼표 구분.
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

/** "라벨|URL, 라벨|URL" → [{label, url}]. URL 이 없는 항목은 버린다. */
function toSources(v?: string): { label: string; url: string }[] {
  return toList(v)
    .map((item) => {
      const i = item.indexOf("|");
      if (i === -1) return null;
      const label = item.slice(0, i).trim();
      const url = item.slice(i + 1).trim();
      return label && url ? { label, url } : null;
    })
    .filter((x): x is { label: string; url: string } => x !== null);
}

/* ── 한국어 강조 보정 ──────────────────────────────────
   CommonMark 는 닫는 `**` 가 "right-flanking delimiter run" 일 때만 강조로 인정한다.
   그 조건 중 하나가 **앞이 문장부호라면 뒤는 공백이나 문장부호여야 한다**는 것이다.

     **400%**입니다        → 앞 `%`(문장부호) + 뒤 `입`(글자)  ✗ 강조 안 됨, `**` 그대로 출력
     **rem(root em)**은    → 앞 `)`           + 뒤 `은`        ✗
     **굵게**입니다         → 앞 `게`(글자)                     ✓ 정상
     **400%** 입니다       → 뒤가 공백                        ✓ 정상

   영어는 강조 뒤에 공백이 오는 게 보통이라 거의 드러나지 않지만, 한국어는 조사가
   곧바로 붙어 자주 걸린다. marked 의 버그가 아니라 사양대로 동작한 결과라
   파서 설정으로는 해결되지 않는다.

   그래서 "닫는 `**` 직전이 문장부호이고 직후가 글자·숫자"인 경우에 한해
   미리 <strong> 으로 바꿔 준다. 글쓴이는 계속 평범하게 `**` 만 쓰면 된다.
   코드 블록과 인라인 코드는 건드리지 않는다. */

/** 코드 펜스(```/~~~)와 인라인 코드(`…`): 이 안의 내용은 보정 대상에서 제외 */
const CODE_SEGMENT = /(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`)/g;

/** 닫는 `**` 앞이 문장부호/기호이고 뒤에 글자·숫자가 바로 붙는 강조 구간 */
const CJK_STRONG = /\*\*(?=\S)([^*\n]*[\p{P}\p{S}])\*\*(?=[\p{L}\p{N}])/gu;

/**
 * CommonMark 규칙상 강조로 인정되지 않는 `**…**` 를 <strong> 으로 바꾼다.
 * 정상적으로 파싱되는 강조는 그대로 두어 marked 가 처리하게 한다.
 */
export function fixCjkEmphasis(md: string): string {
  // split 에 캡처 그룹이 있으면 구분자도 배열에 남는다 → 홀수 인덱스가 코드 구간
  return md
    .split(CODE_SEGMENT)
    .map((seg, i) =>
      i % 2 === 1 ? seg : seg.replace(CJK_STRONG, "<strong>$1</strong>"),
    )
    .join("");
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
    author: data.author?.trim() || AUTHOR.name,
    authorRole: data.authorRole?.trim() || AUTHOR.role[lang],
    reviewedAt: data.reviewedAt || undefined,
    sources: toSources(data.sources),
  };
}

/** 단일 아티클 (프론트매터 + 렌더된 HTML). 없으면 null. */
export function getPost(slug: string, lang: Lang): Post | null {
  const file = fileFor(slug, lang);
  if (!fs.existsSync(file)) return null;
  const raw = fs.readFileSync(file, "utf8");
  const { data, body } = parseFrontmatter(raw);
  // 본문 하이퍼링크는 새 탭으로 열기 (chip 스타일은 globals.css)
  const html = (marked.parse(fixCjkEmphasis(body)) as string).replace(
    /<a /g,
    '<a target="_blank" rel="noopener noreferrer" ',
  );
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
  ko: { title: "블로그", tagline: "도구를 더 잘 쓰기 위한 이야기 · 계산·지표·CSS·업무 팁" },
  en: { title: "Blog", tagline: "Notes for getting more out of the tools · calculations, metrics, CSS and work tips" },
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
  const title = `${l.title} | ${SITE.name}`;
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
    title: { absolute: `${meta.title} | ${SITE.name}` },
    description: meta.description,
    authors: [{ name: meta.author, url: abs(AUTHOR.path) }],
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
    // 작성자(사람)와 발행자(조직)를 분리한다: 둘 다 Organization 이면
    // "누가 썼는가"가 드러나지 않는다.
    author: {
      "@type": "Person",
      name: meta.author,
      jobTitle: meta.authorRole,
      url: abs(AUTHOR.path),
    },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    // 사실 확인 날짜가 있으면 검토 기록으로 함께 노출
    ...(meta.reviewedAt
      ? {
          lastReviewed: meta.reviewedAt,
          reviewedBy: { "@type": "Person", name: meta.author },
        }
      : {}),
    ...(meta.sources.length
      ? { citation: meta.sources.map((x) => ({ "@type": "CreativeWork", name: x.label, url: x.url })) }
      : {}),
  };
}
