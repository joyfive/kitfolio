/* ============================================================
   Kitfolio — 페이지 콘텐츠 단일 출처 (Single Source of Truth)

   SEO 최적화를 위해 "제목 / 설명 / 키워드" 3요소를 페이지마다
   국문·영문으로 여기 한곳에 모읍니다. 텍스트 수정은 이 파일만 고치면 됩니다.

   이 데이터는 →
     ① 메타데이터 (buildToolMetadata / buildHubMetadata)
     ② 화면 카피 (h1 · 설명 · 사용 가이드)
     ③ 구조화 데이터 (toolJsonLd / hubJsonLd)
     ④ 허브 검색 색인 (keywords)
   에 모두 재사용됩니다.
   ============================================================ */
import type { Metadata } from "next";

export type Lang = "ko" | "en";
type L<T = string> = { ko: T; en: T };

export type Tool = {
  slug: string;
  cat: "dev" | "design" | "text";
  theme: "IDE" | "Canvas" | "Clean";
  themeLabel: string;
  ico: string;
  icoClass?: string;
  ready: boolean;
  /** h1 영문 표기(메인) + 국문 표기(보조) */
  name: L;
  /** 허브 카드용 짧은 한 줄 설명 */
  card: L;
  /** 검색 태그 키워드 — 카피 기준 + meta 태그 + 허브 검색 색인 */
  keywords: L<string[]>;
  /** 아래는 실제 페이지가 있는(ready) 도구만 */
  title?: L; // <title> (50~60자)
  description?: L; // meta description = 화면 설명 겸용 (1~3줄)
  steps?: L<[string, string, string]>; // 3단계 사용 가이드
};

export const SITE = {
  name: "Kitfolio",
  url: "https://kitfolio.app",
};

/* ---------------- 허브 (/ , /en) ---------------- */
export const HUB = {
  title: {
    ko: "Kitfolio — 개발자·디자이너를 위한 무료 웹 도구",
    en: "Kitfolio — Free web tools for developers & designers",
  } as L,
  description: {
    ko: "JSON 포매터, CSS 그라디언트 생성기, 글자 수 카운터 등 브라우저에서 바로 쓰는 무료 웹 도구 모음. 설치 없이, 데이터 전송 없이 클라이언트에서 동작합니다.",
    en: "A collection of free web tools — JSON formatter, CSS gradient generator, character counter and more. No install, no sign-up, everything runs in your browser.",
  } as L,
  keywords: {
    ko: ["무료 웹 도구", "개발자 도구", "온라인 유틸리티"],
    en: ["free web tools", "developer tools", "online utilities"],
  } as L<string[]>,
  eyebrow: {
    ko: "설치 없이 · 가입 없이 · 브라우저에서 바로",
    en: "No install · No sign-up · Right in your browser",
  } as L,
  subtitle: {
    ko: "개발자와 디자이너를 위한 가볍고 빠른 유틸리티 모음. 모든 처리는 브라우저 안에서 끝나고, 어떤 데이터도 서버로 전송되지 않습니다.",
    en: "A lightweight set of utilities for developers and designers. Everything runs in your browser — no data is ever sent to a server.",
  } as L,
};

/* ---------------- 도구 목록 ---------------- */
export const TOOLS: Tool[] = [
  // ── Developer ─────────────────────────────
  {
    slug: "json-formatter",
    cat: "dev",
    theme: "IDE",
    themeLabel: "IDE / Editor",
    ico: "{ }",
    ready: true,
    name: { ko: "JSON 포매터", en: "JSON Formatter" },
    card: {
      ko: "JSON 문자열을 들여쓰기·색상 강조로 포맷팅. 문법 오류 감지와 유효성 검사 포함.",
      en: "Format JSON with indentation and syntax highlighting. Detects errors and validates.",
    },
    keywords: {
      ko: ["JSON 포매터", "JSON 정렬", "JSON 유효성 검사"],
      en: ["json formatter", "json beautifier", "json validator"],
    },
    title: { ko: "JSON 포매터 · 검증기", en: "JSON Formatter & Validator" },
    description: {
      ko: "JSON 문자열을 붙여넣으면 들여쓰기와 색상 강조로 즉시 정리하고, 문법 오류가 있으면 줄·열 위치까지 짚어 유효성을 검사합니다. 한 줄로 압축(minify)할 수도 있어요. 모든 처리는 브라우저 안에서만 이루어집니다.",
      en: "Paste a JSON string and it is instantly formatted with indentation and syntax highlighting. Syntax errors are pinpointed by line and column, and you can minify to a single line too. Everything runs entirely in your browser.",
    },
    steps: {
      ko: ["왼쪽 칸에 JSON 붙여넣기", "자동 포맷 · 유효성 확인", "오른쪽 결과 복사"],
      en: [
        "Paste JSON on the left",
        "Auto-format & validate",
        "Copy the result on the right",
      ],
    },
  },
  {
    slug: "base64",
    cat: "dev",
    theme: "IDE",
    themeLabel: "IDE / Editor",
    ico: "b64",
    ready: false,
    name: { ko: "Base64 인코더·디코더", en: "Base64 Encoder / Decoder" },
    card: {
      ko: "텍스트·파일을 Base64로 인코딩하거나 디코딩. 완전 클라이언트 사이드 처리.",
      en: "Encode or decode text and files to Base64. Fully client-side.",
    },
    keywords: {
      ko: ["Base64 인코딩", "Base64 디코더", "Base64 변환"],
      en: ["base64 encode", "base64 decode", "base64 converter"],
    },
  },
  {
    slug: "url-encoder",
    cat: "dev",
    theme: "IDE",
    themeLabel: "IDE / Editor",
    ico: "%",
    ready: false,
    name: { ko: "URL 인코더·디코더", en: "URL Encoder / Decoder" },
    card: {
      ko: "URL 특수문자를 퍼센트 인코딩으로 변환하거나 원래 문자열로 복원.",
      en: "Percent-encode URL special characters or restore the original string.",
    },
    keywords: {
      ko: ["URL 인코딩", "퍼센트 인코딩", "URL 디코더"],
      en: ["url encode", "percent encoding", "url decoder"],
    },
  },
  {
    slug: "timestamp",
    cat: "dev",
    theme: "IDE",
    themeLabel: "IDE / Editor",
    ico: "Ts",
    ready: false,
    name: { ko: "타임스탬프 변환기", en: "Unix Timestamp Converter" },
    card: {
      ko: "Unix timestamp ↔ 사람이 읽는 날짜·시간 양방향 변환. 현재 시각 실시간 표시.",
      en: "Convert Unix timestamps to and from human dates. Live current time.",
    },
    keywords: {
      ko: ["유닉스 타임스탬프", "타임스탬프 변환", "epoch 변환"],
      en: ["unix timestamp", "epoch converter", "timestamp to date"],
    },
  },
  {
    slug: "tools/slack-timestamp-converter",
    cat: "dev",
    theme: "IDE",
    themeLabel: "IDE / Editor",
    ico: "ts",
    ready: true,
    name: { ko: "슬랙 타임스탬프 변환기", en: "Slack Timestamp Converter" },
    card: {
      ko: "Unix 타임스탬프 ↔ 날짜 ↔ Slack date 구문 양방향 변환. 현재 타임스탬프 실시간 표시.",
      en: "Convert Unix timestamps to dates and Slack date syntax. Live current timestamp.",
    },
    keywords: {
      ko: ["슬랙 타임스탬프", "유닉스 타임스탬프", "타임스탬프 변환", "슬랙 날짜", "unix time 변환"],
      en: ["slack timestamp", "unix timestamp", "timestamp converter", "slack date format", "unix time to date"],
    },
    title: {
      ko: "슬랙 타임스탬프 변환기 — Unix 시간·날짜 변환기",
      en: "Slack Timestamp Converter — Convert Unix Time to Date",
    },
    description: {
      ko: "Slack에서 쓰는 Unix 타임스탬프를 읽기 쉬운 날짜·시간으로 변환합니다. UTC·로컬 타임존·상대 시간 표시와 Slack date 구문 생성을 지원합니다.",
      en: "Convert Slack Unix timestamps into readable dates and times. Supports UTC, local timezone, relative time, and Slack date syntax generation.",
    },
    steps: {
      ko: ["타임스탬프 또는 날짜 입력", "자동 변환 결과 확인", "원하는 형식 복사"],
      en: ["Paste timestamp or date", "See converted results", "Copy the format you need"],
    },
  },
  {
    slug: "jwt-decoder",
    cat: "dev",
    theme: "IDE",
    themeLabel: "IDE / Editor",
    ico: "JWT",
    ready: false,
    name: { ko: "JWT 디코더", en: "JWT Decoder" },
    card: {
      ko: "JWT 토큰을 header·payload·signature로 분리 표시. 만료 여부 확인.",
      en: "Split a JWT into header, payload and signature. Checks expiry.",
    },
    keywords: {
      ko: ["JWT 디코더", "JWT 파싱", "토큰 디코딩"],
      en: ["jwt decoder", "jwt parser", "decode token"],
    },
  },
  {
    slug: "regex-tester",
    cat: "dev",
    theme: "IDE",
    themeLabel: "IDE / Editor",
    ico: ".*",
    ready: false,
    name: { ko: "정규식 테스터", en: "Regex Tester" },
    card: {
      ko: "정규식 패턴과 테스트 문자열의 매칭 결과를 실시간 하이라이트.",
      en: "Live-highlight regex matches against your test string.",
    },
    keywords: {
      ko: ["정규식 테스터", "정규표현식", "regex 매칭"],
      en: ["regex tester", "regular expression", "regex match"],
    },
  },
  {
    slug: "cron-generator",
    cat: "dev",
    theme: "IDE",
    themeLabel: "IDE / Editor",
    ico: "* *",
    ready: false,
    name: { ko: "크론 표현식 생성기", en: "Cron Generator" },
    card: {
      ko: "크론 스케줄을 UI로 설정하면 표현식 자동 생성. 다음 실행 시각 미리보기.",
      en: "Build cron schedules visually. Previews the next run times.",
    },
    keywords: {
      ko: ["크론 표현식", "cron 생성기", "스케줄 표현식"],
      en: ["cron generator", "cron expression", "crontab"],
    },
  },

  // ── Design ─────────────────────────────
  {
    slug: "css-gradient",
    cat: "design",
    theme: "Canvas",
    themeLabel: "Canvas",
    ico: "",
    icoClass: "ico-grad",
    ready: true,
    name: { ko: "그라디언트 생성기", en: "CSS Gradient" },
    card: {
      ko: "linear·radial·conic 그라디언트를 시각적으로 편집하고 CSS 코드를 즉시 복사.",
      en: "Edit linear, radial and conic gradients visually and copy the CSS instantly.",
    },
    keywords: {
      ko: ["CSS 그라디언트", "그라디언트 생성기", "linear gradient"],
      en: ["css gradient generator", "linear gradient", "conic gradient"],
    },
    title: {
      ko: "CSS 그라디언트 생성기",
      en: "CSS Gradient Generator",
    },
    description: {
      ko: "linear·radial·conic 그라디언트를 시각적으로 편집합니다. 정지점을 드래그해 색과 위치를 맞추고 각도·중심을 조절한 뒤, 완성된 CSS 코드를 바로 복사하세요. 모든 처리는 브라우저 안에서 이루어집니다.",
      en: "Edit linear, radial and conic gradients visually. Drag the stops to set colors and positions, tune the angle and center, then copy the finished CSS. Everything runs in your browser.",
    },
    steps: {
      ko: ["타입·각도 선택", "정지점 드래그로 색 조절", "CSS 복사"],
      en: ["Pick type & angle", "Drag stops to set colors", "Copy the CSS"],
    },
  },
  {
    slug: "color-converter",
    cat: "design",
    theme: "Canvas",
    themeLabel: "Canvas",
    ico: "",
    icoClass: "ico-color",
    ready: false,
    name: { ko: "색상 변환기", en: "Color Converter" },
    card: {
      ko: "HEX·RGB·HSL·HSV 상호 변환. 컬러 피커 UI와 팔레트 저장 기능.",
      en: "Convert between HEX, RGB, HSL and HSV with a picker and saved palettes.",
    },
    keywords: {
      ko: ["색상 변환기", "HEX RGB 변환", "컬러 피커"],
      en: ["color converter", "hex to rgb", "color picker"],
    },
  },
  {
    slug: "aspect-ratio",
    cat: "design",
    theme: "Canvas",
    themeLabel: "Canvas",
    ico: "16:9",
    ready: false,
    name: { ko: "화면 비율 계산기", en: "Aspect Ratio Calculator" },
    card: {
      ko: "가로·세로 입력 시 비율 산출 및 비율 유지 리사이즈 계산. 프리셋 제공.",
      en: "Compute ratios and aspect-locked resizes from width and height. Includes presets.",
    },
    keywords: {
      ko: ["화면 비율 계산기", "비율 계산", "aspect ratio"],
      en: ["aspect ratio calculator", "ratio calculator", "resize ratio"],
    },
  },

  // ── Text ─────────────────────────────
  {
    slug: "character-counter",
    cat: "text",
    theme: "Clean",
    themeLabel: "Clean SaaS",
    ico: "¶",
    ready: true,
    name: { ko: "글자 수·단어 수 카운터", en: "Character Counter" },
    card: {
      ko: "글자·단어·문장·줄 수를 실시간 집계. SNS 글자 수 제한 안내 포함.",
      en: "Live counts of characters, words, sentences and lines. With social limits.",
    },
    keywords: {
      ko: ["글자 수 세기", "단어 수 카운터", "글자수 제한"],
      en: ["character counter", "word counter", "letter count"],
    },
    title: { ko: "글자 수·단어 수 카운터", en: "Character & Word Counter" },
    description: {
      ko: "텍스트를 입력하거나 붙여넣으면 글자·단어·문장·줄·단락 수를 실시간으로 집계합니다. 공백 포함·제외 글자 수와 예상 읽기 시간, 트위터·스레드·인스타그램 등 SNS 글자 수 제한까지 한눈에 확인하세요. 모든 처리는 브라우저 안에서만 이루어집니다.",
      en: "Type or paste text and it counts characters, words, sentences, lines and paragraphs in real time. See counts with and without spaces, estimated reading time, and character limits for X, Threads, Instagram and more. Everything runs in your browser.",
    },
    steps: {
      ko: ["텍스트 입력·붙여넣기", "실시간 집계 확인", "SNS 글자 수 제한 점검"],
      en: [
        "Type or paste your text",
        "Watch the live counts",
        "Check social limits",
      ],
    },
  },
  {
    slug: "markdown-to-html",
    cat: "text",
    theme: "Clean",
    themeLabel: "Clean SaaS",
    ico: "M↓",
    ready: false,
    name: { ko: "마크다운 → HTML", en: "Markdown to HTML" },
    card: {
      ko: "마크다운을 실시간 HTML로 변환. 좌우 분할 미리보기 제공.",
      en: "Convert Markdown to HTML in real time with a side-by-side preview.",
    },
    keywords: {
      ko: ["마크다운 변환", "마크다운 HTML", "markdown 미리보기"],
      en: ["markdown to html", "markdown converter", "markdown preview"],
    },
  },
  {
    slug: "lorem-ipsum",
    cat: "text",
    theme: "Clean",
    themeLabel: "Clean SaaS",
    ico: "¶¶",
    ready: false,
    name: { ko: "로렘 입숨 생성기", en: "Lorem Ipsum Generator" },
    card: {
      ko: "단락·단어·문장 수를 지정해 더미 텍스트 생성. 한국어 옵션 포함.",
      en: "Generate dummy text by paragraphs, words or sentences. Korean option included.",
    },
    keywords: {
      ko: ["로렘 입숨", "더미 텍스트", "샘플 텍스트 생성"],
      en: ["lorem ipsum generator", "dummy text", "placeholder text"],
    },
  },
  {
    slug: "image-to-base64",
    cat: "text",
    theme: "Clean",
    themeLabel: "Clean SaaS",
    ico: "IMG",
    ready: false,
    name: { ko: "이미지 → Base64", en: "Image to Base64" },
    card: {
      ko: "이미지 파일을 Base64 Data URL로 변환. 복사 및 미리보기 제공.",
      en: "Convert image files to a Base64 Data URL with copy and preview.",
    },
    keywords: {
      ko: ["이미지 Base64", "Data URL 변환", "이미지 인코딩"],
      en: ["image to base64", "data url", "image encoder"],
    },
  },
];

export const CATS: { id: "dev" | "design" | "text"; navKey: string }[] = [
  { id: "dev", navKey: "nav.dev" },
  { id: "design", navKey: "nav.design" },
  { id: "text", navKey: "nav.text" },
];

/* ---------------- helpers ---------------- */
export function getTool(slug: string): Tool {
  const t = TOOLS.find((x) => x.slug === slug);
  if (!t) throw new Error(`Unknown tool slug: ${slug}`);
  return t;
}

/** KO는 루트, EN은 /en 프리픽스. path는 KO 기준 경로('/json-formatter', '/'). */
export function localizedHref(lang: Lang, path: string): string {
  if (lang === "ko") return path;
  return path === "/" ? "/en" : "/en" + path;
}

const APP_CATEGORY: Record<Tool["cat"], string> = {
  dev: "DeveloperApplication",
  design: "DesignApplication",
  text: "UtilitiesApplication",
};

function ogLocale(lang: Lang) {
  return lang === "ko" ? "ko_KR" : "en_US";
}

/** 도구 페이지 메타데이터 (title/description/keywords/canonical/hreflang/OG) */
export function buildToolMetadata(slug: string, lang: Lang): Metadata {
  const t = getTool(slug);
  const path = "/" + t.slug;
  const koUrl = path;
  const enUrl = "/en" + path;
  const url = lang === "ko" ? koUrl : enUrl;
  return {
    title: t.title![lang],
    description: t.description![lang],
    keywords: t.keywords[lang],
    alternates: {
      canonical: url,
      languages: { "ko-KR": koUrl, "en-US": enUrl, "x-default": koUrl },
    },
    openGraph: {
      title: `${t.title![lang]} — Kitfolio`,
      description: t.description![lang],
      url,
      siteName: SITE.name,
      type: "website",
      locale: ogLocale(lang),
    },
  };
}

/** 허브 메타데이터 */
export function buildHubMetadata(lang: Lang): Metadata {
  const koUrl = "/";
  const enUrl = "/en";
  const url = lang === "ko" ? koUrl : enUrl;
  return {
    title: { absolute: HUB.title[lang] },
    description: HUB.description[lang],
    keywords: HUB.keywords[lang],
    alternates: {
      canonical: url,
      languages: { "ko-KR": koUrl, "en-US": enUrl, "x-default": koUrl },
    },
    openGraph: {
      title: HUB.title[lang],
      description: HUB.description[lang],
      url,
      siteName: SITE.name,
      type: "website",
      locale: ogLocale(lang),
    },
  };
}

/** 도구 페이지 JSON-LD (WebApplication) */
export function toolJsonLd(slug: string, lang: Lang) {
  const t = getTool(slug);
  const url = SITE.url + localizedHref(lang, "/" + t.slug);
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t.title![lang],
    url,
    description: t.description![lang],
    applicationCategory: APP_CATEGORY[t.cat],
    operatingSystem: "Any (web browser)",
    browserRequirements: "Requires JavaScript",
    inLanguage: lang === "ko" ? "ko-KR" : "en-US",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
  };
}

/** 허브 JSON-LD (WebSite + ItemList) */
export function hubJsonLd(lang: Lang) {
  const baseUrl = SITE.url + localizedHref(lang, "/");
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: SITE.name,
      url: baseUrl,
      description: HUB.description[lang],
      inLanguage: lang === "ko" ? "ko-KR" : "en-US",
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: TOOLS.filter((t) => t.ready).map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.title![lang],
        url: SITE.url + localizedHref(lang, "/" + t.slug),
      })),
    },
  ];
}
