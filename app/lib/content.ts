/* ============================================================
   Kitfolio — 콘텐츠 레지스트리 (Single Source of Truth)

   "실제 렌더링되는 콘텐츠 텍스트(KO·EN)"를 이 파일 한곳에서 관리합니다.
   도구가 50개로 늘어나도 이 파일에 50개 × 2개 언어 세트를 추가하면 됩니다.

   ⚠️ 범위: 콘텐츠 텍스트만. 기능/버튼/인풋 등 UI 마이크로카피는 제외 —
   전역 공통 UI(헤더 네비·푸터·복사 버튼 등)는 lib/i18n.tsx 의 COMMON,
   도구별 컨트롤 라벨은 각 컴포넌트의 로컬 DICT 에서 관리합니다.

   ── 구조 ────────────────────────────────────────────────
   ① SITE        : 사이트 상수
   ② HUB         : 허브 — seo(메타) + hero(히어로 카피)
   ③ CATS        : 카테고리 라벨 (허브 섹션 헤더 · 도구 뱃지)
   ④ FAQ_SECTION : FAQ 섹션 공통 카피 (인트로·푸터 링크)
   ⑤ TOOLS       : 도구 레지스트리 — 항목 하나에 도구 완결 정의
       ├ slug          : 1뎁스 라우트 (플랫 URL)
       ├ layout        : 디자인 시스템 타입 (card=A · ide=B · canvas=C)
       ├ cat           : 허브 카테고리 (테마 분기 겸용)
       ├ targets       : 내부 타겟 태그 (URL 아님 — 필터/분석용)
       ├ badge         : 뱃지(eyebrow) 텍스트            ── 뱃지 영역
       ├ name          : h1 (en 메인 + ko 보조 병기)     ── 타이틀 영역
       ├ relatedTools  : 관련 도구 slug 목록
       ├ seo           : { ko, en } title·description·keywords (메타데이터)
       ├ content       : { ko, en } card(허브 카드 한 줄) ·
       │                 description(리드 문단 영역) · howItWorks(스텝 영역)
       ├ faq           : { ko, en } question·answer       ── FAQ 영역
       └ og            : { ko, en } title·subtitle (개별 OG · 향후 동적 OG 이미지)

   이 데이터는 → 메타데이터(buildToolMetadata/buildHubMetadata) ·
   화면 카피(PageHead/Faq/Hub) · 구조화 데이터(toolJsonLd: WebApplication
   + FAQPage / hubJsonLd) · 허브 검색 색인(keywords) 에 모두 재사용됩니다.
   ============================================================ */
import type { Metadata } from "next";

export type Lang = "ko" | "en";

/** 디자인 시스템 레이아웃 3종 — Type A(Card) · B(IDE) · C(Canvas) */
export type Layout = "card" | "ide" | "canvas";

/** 내부 타겟 태그 — URL 카테고리 아님, 필터링·디스커버리·분석용 */
export type TargetTag =
  | "pm"
  | "designer"
  | "developer"
  | "job-seeker"
  | "office-worker"
  | "small-business-owner";

export type QA = { question: string; answer: string };

type ToolSeo = {
  /** <title> (50~60자) — ready 도구만 */
  title?: string;
  /** meta description — ready 도구만 */
  description?: string;
  /** meta keywords + 허브 검색 색인 (전 도구) */
  keywords: string[];
};

type ToolCopy = {
  /** 허브 카드 한 줄 설명 (전 도구) */
  card: string;
  /** 페이지 리드 문단 (= meta description 겸용) — ready 도구만 */
  description?: string;
  /** How It Works — 3단계 사용 가이드 — ready 도구만 */
  howItWorks?: string[];
  /** AEO 명시 문단 — What is / Who is it for / How does it work / Why use it.
   *  본문(ToolAbout 섹션)과 FAQPage JSON-LD 양쪽에 노출 — ready 도구만 */
  aeo?: { what: string; who: string; how: string; why: string };
};

type ToolOg = { title: string; subtitle: string };

export type Tool = {
  slug: string;
  layout: Layout;
  cat: "dev" | "design" | "text";
  targets: TargetTag[];
  ico: string;
  icoClass?: string;
  ready: boolean;
  /** 뱃지(eyebrow) 보조 텍스트 */
  badge: string;
  /** h1 — 영문 메인 + 국문 보조 병기 */
  name: { ko: string; en: string };
  /** Related Tools 섹션용 slug 목록 */
  relatedTools?: string[];
  seo: { ko: ToolSeo; en: ToolSeo };
  content: { ko: ToolCopy; en: ToolCopy };
  faq?: { ko: QA[]; en: QA[] };
  og?: { ko: ToolOg; en: ToolOg };
};

/* ============================================================
   ① SITE
   ============================================================ */
export const SITE = {
  name: "Kitfolio",
  url: "https://kitfolio.app",
};

/** 허브 카드 등에서 쓰는 레이아웃 표시 라벨 */
export const LAYOUT_LABEL: Record<Layout, string> = {
  card: "Clean",
  ide: "IDE",
  canvas: "Canvas",
};

/* ============================================================
   ② HUB — 허브 페이지 (/ , /en)
   ============================================================ */
export const HUB = {
  seo: {
    ko: {
      title: "Kitfolio — 일하는 사람을 위한 작은 웹 도구 모음",
      description:
        "글자 수 카운터, JSON 포매터, 그라디언트 생성기 등 업무에 필요한 계산기·생성기·유틸리티 모음. 설치 없이, 가입 없이, 모든 처리가 브라우저 안에서 끝납니다.",
      keywords: ["무료 웹 도구", "업무 계산기", "온라인 유틸리티"],
    },
    en: {
      title: "Kitfolio — Small tools for modern knowledge workers",
      description:
        "Work calculators, generators and utilities that run entirely in your browser — character counter, JSON formatter, gradient generator and more. No login, no installation, no server-side processing.",
      keywords: ["free web tools", "work calculators", "online utilities"],
    },
  },
  hero: {
    ko: {
      eyebrow: "설치 없이 · 가입 없이 · 브라우저에서 바로",
      h1: { pre: "일하는 사람을 위한 ", accent: "작은 도구들", post: ",\n한 곳에서 빠르게." },
      subtitle:
        "모던 지식 노동자를 위한 브라우저 기반 마이크로 도구 모음. 업무에서 반복되는 작은 문제를 푸는 계산기·생성기·변환기·유틸리티 — 모든 처리는 브라우저 안에서 끝나고, 어떤 데이터도 서버로 전송되지 않습니다.",
      stat: "개 도구",
    },
    en: {
      eyebrow: "No install · No sign-up · Right in your browser",
      h1: {
        pre: "Small ",
        accent: "tools",
        post: " for modern\nknowledge workers.",
      },
      subtitle:
        "Browser-based micro tools for modern knowledge workers — work calculators, generators, converters and utilities. Everything runs in your browser; no data ever leaves it.",
      stat: " tools",
    },
  },
};

/* ============================================================
   ③ CATS — 카테고리 라벨
   ============================================================ */
export const CATS: {
  id: "dev" | "design" | "text";
  navKey: string;
  label: { ko: { big: string; small: string }; en: { big: string; small: string } };
}[] = [
  {
    id: "dev",
    navKey: "nav.dev",
    label: {
      ko: { big: "개발", small: "Developer" },
      en: { big: "Developer", small: "IDE theme" },
    },
  },
  {
    id: "design",
    navKey: "nav.design",
    label: {
      ko: { big: "디자인", small: "Design" },
      en: { big: "Design", small: "Canvas theme" },
    },
  },
  {
    id: "text",
    navKey: "nav.text",
    label: {
      ko: { big: "텍스트", small: "Text" },
      en: { big: "Text", small: "Clean theme" },
    },
  },
];

/* ============================================================
   ④ FAQ_SECTION — FAQ 섹션 공통 카피
   ============================================================ */
/* FAQ / About 통합 섹션 — 탭(칩) 라벨 + 인트로 카피 */
export const FAQ_SECTION = {
  ko: {
    tab: "자주 묻는 질문",
    title: "무엇이든 물어보세요",
    sub: "이 도구를 쓰면서 가장 많이 받는 질문들을 모았습니다.",
    more: "찾는 답이 없나요?",
    moreLink: "피드백 보내기 →",
  },
  en: {
    tab: "FAQ",
    title: "Ask us anything",
    sub: "The questions we hear most often about this tool.",
    more: "Didn’t find what you’re looking for?",
    moreLink: "Send feedback →",
  },
};

/* AEO(About this tool) 섹션 — What is / Who for / How / Why */
export const AEO_SECTION = {
  ko: {
    tab: "이 도구에 대하여",
    title: "이 도구에 대하여",
    sub: "이 도구가 무엇인지, 누구에게·어떻게·왜 필요한지 한눈에 정리했습니다.",
  },
  en: {
    tab: "About this tool",
    title: "About this tool",
    sub: "What it is, who it's for, how it works and why you'd use it.",
  },
};

/* Related Tools 섹션 공통 카피 */
export const RELATED_SECTION = {
  ko: { title: "함께 쓰면 좋은 도구" },
  en: { title: "Related tools" },
};

/* 동적 OG 이미지 하단 배지 카피 */
export const OG_BADGE = {
  ko: "무료 · 브라우저에서 바로",
  en: "Free · Runs in your browser",
};

/* 타겟 태그 표시 라벨 — 허브 직군 필터 칩 */
export const TARGET_LABELS: Record<TargetTag, { ko: string; en: string }> = {
  pm: { ko: "PM", en: "PM" },
  designer: { ko: "디자이너", en: "Designer" },
  developer: { ko: "개발자", en: "Developer" },
  "job-seeker": { ko: "취업 준비생", en: "Job seeker" },
  "office-worker": { ko: "직장인", en: "Office worker" },
  "small-business-owner": { ko: "자영업자", en: "Small business" },
};

/* ============================================================
   ⑤ TOOLS — 도구 레지스트리
   ============================================================ */
export const TOOLS: Tool[] = [
  // ── Developer ─────────────────────────────
  {
    slug: "json-formatter",
    layout: "ide",
    cat: "dev",
    targets: ["developer"],
    ico: "{ }",
    ready: true,
    badge: "IDE / Editor",
    name: { ko: "JSON 포매터", en: "JSON Formatter" },
    relatedTools: ["slack-timestamp-converter", "tailwind-palette-generator", "character-counter"],
    seo: {
      ko: {
        title: "JSON 포매터 · 검증기",
        description:
          "JSON 문자열을 붙여넣으면 들여쓰기와 색상 강조로 즉시 정리하고, 문법 오류가 있으면 줄·열 위치까지 짚어 유효성을 검사합니다. 한 줄로 압축(minify)할 수도 있어요. 모든 처리는 브라우저 안에서만 이루어집니다.",
        keywords: ["JSON 포매터", "JSON 정렬", "JSON 유효성 검사"],
      },
      en: {
        title: "JSON Formatter & Validator",
        description:
          "Paste a JSON string and it is instantly formatted with indentation and syntax highlighting. Syntax errors are pinpointed by line and column, and you can minify to a single line too. Everything runs entirely in your browser.",
        keywords: ["json formatter", "json beautifier", "json validator"],
      },
    },
    content: {
      ko: {
        card: "JSON 문자열을 들여쓰기·색상 강조로 포맷팅. 문법 오류 감지와 유효성 검사 포함.",
        description:
          "JSON 문자열을 붙여넣으면 들여쓰기와 색상 강조로 즉시 정리하고, 문법 오류가 있으면 줄·열 위치까지 짚어 유효성을 검사합니다. 한 줄로 압축(minify)할 수도 있어요. 모든 처리는 브라우저 안에서만 이루어집니다.",
        howItWorks: ["왼쪽 칸에 JSON 붙여넣기", "자동 포맷 · 유효성 확인", "오른쪽 결과 복사"],
        aeo: {
          what: "JSON 포매터는 한 줄로 뭉치거나 어지럽게 섞인 JSON 문자열을 들여쓰기와 색상 강조가 적용된 읽기 쉬운 형태로 정리하고, 동시에 문법 오류를 검사해주는 도구입니다.",
          who: "API 응답과 설정 파일을 다루는 개발자, 로그·데이터 페이로드를 확인해야 하는 PM과 데이터 작업자를 위한 도구입니다.",
          how: "왼쪽 입력 칸에 JSON을 붙여넣으면 브라우저 안에서 즉시 파싱해 오른쪽에 포맷된 결과를 보여줍니다. 오류가 있으면 줄·열 위치를 짚어주고, 들여쓰기 변경과 한 줄 압축(minify)도 지원합니다.",
          why: "서버 전송 없이 브라우저에서만 동작해 민감한 데이터도 안전하고, 설치·가입 없이 바로 쓸 수 있어 디버깅 시간을 줄여줍니다.",
        },
      },
      en: {
        card: "Format JSON with indentation and syntax highlighting. Detects errors and validates.",
        description:
          "Paste a JSON string and it is instantly formatted with indentation and syntax highlighting. Syntax errors are pinpointed by line and column, and you can minify to a single line too. Everything runs entirely in your browser.",
        howItWorks: [
          "Paste JSON on the left",
          "Auto-format & validate",
          "Copy the result on the right",
        ],
        aeo: {
          what: "JSON Formatter is a tool that turns a minified or messy JSON string into a readable, indented and syntax-highlighted document while validating it.",
          who: "It is for developers working with API responses and config files, and for PMs or data workers who need to inspect JSON logs and payloads.",
          how: "Paste JSON into the left pane and it is parsed instantly in your browser — the formatted result appears on the right, errors are pinpointed by line and column, and you can switch indentation or minify to one line.",
          why: "It runs entirely in your browser with no upload, so sensitive data stays safe — and with no install or sign-up, debugging gets faster.",
        },
      },
    },
    faq: {
      ko: [
        {
          question: "입력한 JSON이 서버로 전송되나요?",
          answer:
            "아니요. 포맷팅·검증·압축은 전부 브라우저 안에서 JavaScript로 처리됩니다. 어떤 데이터도 서버로 전송되거나 저장되지 않으므로 민감한 데이터도 안심하고 사용할 수 있습니다.",
        },
        {
          question: "JSON 문법 오류는 어떻게 찾아주나요?",
          answer:
            "유효하지 않은 JSON을 붙여넣으면 하단 상태 표시줄에 오류 내용과 함께 줄·열 위치를 표시합니다. 해당 위치를 수정하면 결과가 실시간으로 다시 검증됩니다.",
        },
        {
          question: "들여쓰기 간격을 바꾸거나 한 줄로 압축할 수 있나요?",
          answer:
            "툴바에서 2칸·4칸·탭 들여쓰기를 선택할 수 있고, 압축 버튼을 누르면 공백을 제거한 한 줄(minify) JSON으로 변환됩니다.",
        },
        {
          question: "어느 정도 크기의 JSON까지 처리할 수 있나요?",
          answer:
            "처리가 브라우저 메모리에서 이루어지므로 일반적인 수 MB 수준의 JSON은 문제없이 다룰 수 있습니다. 매우 큰 파일은 기기 성능에 따라 느려질 수 있습니다.",
        },
      ],
      en: [
        {
          question: "Is my JSON sent to a server?",
          answer:
            "No. Formatting, validation and minification all happen in your browser with JavaScript. Nothing is uploaded or stored, so it is safe to use with sensitive data.",
        },
        {
          question: "How are syntax errors reported?",
          answer:
            "When you paste invalid JSON, the status bar shows the error message along with the line and column. Fix the spot and the result re-validates in real time.",
        },
        {
          question: "Can I change the indentation or minify to one line?",
          answer:
            "Pick 2-space, 4-space or tab indentation from the toolbar, or press Minify to strip whitespace into a single-line JSON string.",
        },
        {
          question: "How large a JSON document can it handle?",
          answer:
            "Everything is processed in browser memory, so documents up to a few megabytes work fine. Very large files may slow down depending on your device.",
        },
      ],
    },
    og: {
      ko: {
        title: "JSON 포매터 · 검증기",
        subtitle: "JSON을 붙여넣으면 포맷·검증·압축까지 한 번에",
      },
      en: {
        title: "JSON Formatter & Validator",
        subtitle: "Paste JSON to format, validate and minify instantly",
      },
    },
  },
  {
    slug: "slack-timestamp-converter",
    layout: "ide",
    cat: "dev",
    targets: ["pm", "developer"],
    ico: "ts",
    ready: true,
    badge: "IDE / Editor",
    name: { ko: "슬랙 타임스탬프 변환기", en: "Slack Timestamp Converter" },
    relatedTools: ["json-formatter", "character-counter", "tailwind-palette-generator"],
    seo: {
      ko: {
        title: "슬랙 타임스탬프 변환기 — Unix 시간·날짜 변환기",
        description:
          "Slack에서 쓰는 Unix 타임스탬프를 읽기 쉬운 날짜·시간으로 변환합니다. UTC·로컬 타임존·상대 시간 표시와 Slack date 구문 생성을 지원합니다.",
        keywords: ["슬랙 타임스탬프", "유닉스 타임스탬프", "타임스탬프 변환", "슬랙 날짜", "unix time 변환"],
      },
      en: {
        title: "Slack Timestamp Converter — Convert Unix Time to Date",
        description:
          "Convert Slack Unix timestamps into readable dates and times. Supports UTC, local timezone, relative time, and Slack date syntax generation.",
        keywords: ["slack timestamp", "unix timestamp", "timestamp converter", "slack date format", "unix time to date"],
      },
    },
    content: {
      ko: {
        card: "Unix 타임스탬프 ↔ 날짜 ↔ Slack date 구문 양방향 변환. 현재 타임스탬프 실시간 표시.",
        description:
          "Slack에서 쓰는 Unix 타임스탬프를 읽기 쉬운 날짜·시간으로 변환합니다. UTC·로컬 타임존·상대 시간 표시와 Slack date 구문 생성을 지원합니다.",
        howItWorks: ["타임스탬프 또는 날짜 입력", "자동 변환 결과 확인", "원하는 형식 복사"],
        aeo: {
          what: "슬랙 타임스탬프 변환기는 Slack에서 쓰는 Unix 타임스탬프를 사람이 읽을 수 있는 날짜·시간으로 바꾸고, Slack date 구문까지 생성해주는 변환 도구입니다.",
          who: "Slack API·웹훅을 다루는 개발자, 타임존이 다른 글로벌 팀에 시간 공지를 보내는 PM을 위한 도구입니다.",
          how: "타임스탬프나 날짜를 입력하면 형식을 자동으로 감지해 UTC·로컬 시간·상대 시간과 Slack <!date> 구문으로 한 번에 변환합니다.",
          why: "타임존 계산 실수를 막아주고, 받는 사람의 시간대에 맞춰 표시되는 Slack 구문을 클릭 한 번으로 만들 수 있습니다.",
        },
      },
      en: {
        card: "Convert Unix timestamps to dates and Slack date syntax. Live current timestamp.",
        description:
          "Convert Slack Unix timestamps into readable dates and times. Supports UTC, local timezone, relative time, and Slack date syntax generation.",
        howItWorks: ["Paste timestamp or date", "See converted results", "Copy the format you need"],
        aeo: {
          what: "A Slack Timestamp Converter converts Unix timestamps used by Slack into human-readable dates and times, and generates Slack's <!date> syntax.",
          who: "It is for developers working with the Slack API and webhooks, and for PMs announcing times to teams across timezones.",
          how: "Enter a timestamp or date and the format is auto-detected, then converted to UTC, your local time, relative time and Slack date syntax all at once.",
          why: "It prevents timezone mistakes and produces Slack syntax that renders in each reader's own timezone with a single click.",
        },
      },
    },
    faq: {
      ko: [
        {
          question: "어떤 입력 형식을 인식하나요?",
          answer:
            "Unix 초·밀리초·마이크로초 타임스탬프, ISO 8601 같은 일반 날짜·시간 문자열, 그리고 <!date^...> Slack date 구문을 자동으로 감지해 변환합니다.",
        },
        {
          question: "Slack date 구문은 어디에 쓰나요?",
          answer:
            "변환 결과의 Slack 구문을 메시지에 붙여넣으면, 받는 사람의 타임존과 언어 설정에 맞춰 날짜·시간이 자동으로 표시됩니다. 타임존이 다른 글로벌 팀 공지에 유용합니다.",
        },
        {
          question: "타임존은 어떻게 처리되나요?",
          answer:
            "같은 시각을 UTC와 현재 브라우저의 로컬 타임존으로 동시에 보여주고, 지금 시점 기준의 상대 시간(예: 3시간 전)도 함께 표시합니다.",
        },
        {
          question: "입력한 값이 서버로 전송되나요?",
          answer: "아니요. 모든 변환은 브라우저 안에서 처리되며 어떤 데이터도 서버로 전송되지 않습니다.",
        },
      ],
      en: [
        {
          question: "Which input formats are recognized?",
          answer:
            "Unix timestamps in seconds, milliseconds or microseconds, common date-time strings such as ISO 8601, and Slack's <!date^...> syntax are all auto-detected and converted.",
        },
        {
          question: "What is the Slack date syntax for?",
          answer:
            "Paste the generated Slack syntax into a message and Slack renders the date and time in each reader's own timezone and locale — handy for announcements across global teams.",
        },
        {
          question: "How are timezones handled?",
          answer:
            "The same instant is shown in UTC and in your browser's local timezone side by side, along with a live relative time such as “3 hours ago”.",
        },
        {
          question: "Is anything I enter sent to a server?",
          answer: "No. Every conversion happens inside your browser and no data ever leaves it.",
        },
      ],
    },
    og: {
      ko: {
        title: "슬랙 타임스탬프 변환기",
        subtitle: "Slack Unix Timestamp를 읽기 쉬운 날짜로 변환",
      },
      en: {
        title: "Slack Timestamp Converter",
        subtitle: "Convert Slack Unix Timestamps into readable dates",
      },
    },
  },

  // ── Design ─────────────────────────────
  {
    slug: "css-gradient",
    layout: "canvas",
    cat: "design",
    targets: ["designer", "developer"],
    ico: "",
    icoClass: "ico-grad",
    ready: true,
    badge: "Canvas",
    name: { ko: "그라디언트 생성기", en: "CSS Gradient" },
    relatedTools: ["tailwind-palette-generator", "character-counter", "json-formatter"],
    seo: {
      ko: {
        title: "CSS 그라디언트 생성기",
        description:
          "linear·radial·conic 그라디언트를 시각적으로 편집합니다. 정지점을 드래그해 색과 위치를 맞추고 각도·중심을 조절한 뒤, 완성된 CSS 코드를 바로 복사하세요. 모든 처리는 브라우저 안에서 이루어집니다.",
        keywords: ["CSS 그라디언트", "그라디언트 생성기", "linear gradient"],
      },
      en: {
        title: "CSS Gradient Generator",
        description:
          "Edit linear, radial and conic gradients visually. Drag the stops to set colors and positions, tune the angle and center, then copy the finished CSS. Everything runs in your browser.",
        keywords: ["css gradient generator", "linear gradient", "conic gradient"],
      },
    },
    content: {
      ko: {
        card: "linear·radial·conic 그라디언트를 시각적으로 편집하고 CSS 코드를 즉시 복사.",
        description:
          "linear·radial·conic 그라디언트를 시각적으로 편집합니다. 정지점을 드래그해 색과 위치를 맞추고 각도·중심을 조절한 뒤, 완성된 CSS 코드를 바로 복사하세요. 모든 처리는 브라우저 안에서 이루어집니다.",
        howItWorks: ["타입·각도 선택", "정지점 드래그로 색 조절", "CSS 복사"],
        aeo: {
          what: "CSS 그라디언트 생성기는 linear·radial·conic 그라디언트를 시각적으로 편집하고, 완성된 CSS 코드를 만들어주는 디자인 도구입니다.",
          who: "웹사이트 배경·버튼·배너를 만드는 디자이너와 프론트엔드 개발자를 위한 도구입니다.",
          how: "타입과 각도를 고르고 트랙에서 색상 정지점을 드래그하면 미리보기가 실시간으로 갱신되고, 결과 CSS를 바로 복사할 수 있습니다.",
          why: "그라디언트 문법을 외울 필요 없이 눈으로 확인하며 만들 수 있어 시안 작업과 코드 작성이 모두 빨라집니다.",
        },
      },
      en: {
        card: "Edit linear, radial and conic gradients visually and copy the CSS instantly.",
        description:
          "Edit linear, radial and conic gradients visually. Drag the stops to set colors and positions, tune the angle and center, then copy the finished CSS. Everything runs in your browser.",
        howItWorks: ["Pick type & angle", "Drag stops to set colors", "Copy the CSS"],
        aeo: {
          what: "CSS Gradient Generator is a design tool for editing linear, radial and conic gradients visually and producing ready-to-use CSS code.",
          who: "It is for designers and front-end developers building website backgrounds, buttons and banners.",
          how: "Pick a type and angle, drag color stops on the track, watch the live preview update, then copy the resulting CSS.",
          why: "You can build gradients by eye without memorizing the syntax, speeding up both mockups and code.",
        },
      },
    },
    faq: {
      ko: [
        {
          question: "어떤 그라디언트 타입을 지원하나요?",
          answer:
            "linear(선형)·radial(원형)·conic(원뿔형) 세 가지 타입을 지원합니다. 타입을 바꾸면 각도·중심 위치 등 조절할 수 있는 옵션이 함께 바뀝니다.",
        },
        {
          question: "색상 정지점은 어떻게 추가하고 옮기나요?",
          answer:
            "그라디언트 트랙의 빈 곳을 클릭하거나 ‘정지점 추가’ 버튼을 누르면 추가됩니다. 정지점을 드래그해 위치를 옮길 수 있고, HEX 색상값과 % 위치를 직접 입력할 수도 있습니다.",
        },
        {
          question: "복사한 CSS는 모든 브라우저에서 동작하나요?",
          answer:
            "linear·radial 그라디언트는 모든 모던 브라우저에서 동작합니다. conic-gradient도 최신 브라우저에서 폭넓게 지원되지만, 매우 오래된 브라우저에서는 표시되지 않을 수 있습니다.",
        },
        {
          question: "만든 그라디언트를 저장할 수 있나요?",
          answer:
            "생성된 CSS 코드를 복사해 프로젝트나 메모에 보관하는 방식을 권장합니다. 같은 코드를 다시 붙여넣으면 언제든 동일한 그라디언트를 재현할 수 있습니다.",
        },
      ],
      en: [
        {
          question: "Which gradient types are supported?",
          answer:
            "Linear, radial and conic gradients are all supported. Switching the type also switches the available options such as angle and center position.",
        },
        {
          question: "How do I add and move color stops?",
          answer:
            "Click an empty spot on the gradient track or press “Add stop”. Drag a stop to reposition it, or type an exact HEX value and % position directly.",
        },
        {
          question: "Will the copied CSS work in every browser?",
          answer:
            "Linear and radial gradients work in all modern browsers. conic-gradient is also widely supported in current browsers, though very old ones may not render it.",
        },
        {
          question: "Can I save a gradient I made?",
          answer:
            "Copy the generated CSS and keep it in your project or notes — pasting the same code reproduces the exact gradient any time.",
        },
      ],
    },
    og: {
      ko: {
        title: "CSS 그라디언트 생성기",
        subtitle: "시각적으로 편집하고 CSS 코드를 바로 복사",
      },
      en: {
        title: "CSS Gradient Generator",
        subtitle: "Edit gradients visually and copy the CSS instantly",
      },
    },
  },
  {
    slug: "tailwind-palette-generator",
    layout: "canvas",
    cat: "design",
    targets: ["designer", "developer"],
    ico: "◧",
    ready: true,
    badge: "Canvas",
    name: { ko: "Tailwind 팔레트 생성기", en: "Tailwind Palette" },
    relatedTools: ["css-gradient", "json-formatter", "character-counter"],
    seo: {
      ko: {
        title: "Tailwind 팔레트 생성기 — HEX 하나로 11단계 색상",
        description:
          "베이스 색상 하나(HEX)를 입력하면 Tailwind용 11단계 팔레트(50~950)를 자동으로 생성합니다. 각 색상을 클릭해 복사하거나, Tailwind v4 @theme · v3 config · CSS 변수 형태로 코드를 바로 복사하세요. 모든 처리는 브라우저 안에서 이루어집니다.",
        keywords: ["Tailwind 팔레트 생성기", "Tailwind 색상 생성", "11단계 색상 팔레트"],
      },
      en: {
        title: "Tailwind Palette Generator — 11 shades from one HEX",
        description:
          "Enter a single base color (HEX) and instantly generate an 11-shade Tailwind palette (50–950). Click any shade to copy it, or copy the whole palette as a Tailwind v4 @theme block, v3 config or CSS variables. Everything runs in your browser.",
        keywords: ["tailwind palette generator", "tailwind color shades", "11 color palette"],
      },
    },
    content: {
      ko: {
        card: "베이스 HEX 하나로 Tailwind용 11단계 팔레트(50~950)를 만들고 코드로 복사.",
        description:
          "베이스 색상 하나(HEX)를 입력하면 Tailwind용 11단계 팔레트(50~950)를 자동으로 생성합니다. OKLCH 명도 스케일을 사용해 밝은 50부터 어두운 950까지 고르게 펼치고, 입력한 색은 가장 가까운 단계에 그대로 고정됩니다. 각 색을 클릭해 HEX를 복사하거나 Tailwind v4 @theme · v3 config · CSS 변수로 한 번에 복사하세요.",
        howItWorks: ["베이스 색상(HEX) 입력", "11단계 팔레트 자동 생성", "스와치 클릭 또는 코드 복사"],
        aeo: {
          what: "Tailwind 팔레트 생성기는 베이스 색상 하나로 Tailwind CSS용 11단계 색상 팔레트(50~950)를 만들어주는 도구입니다.",
          who: "Tailwind CSS로 작업하는 프론트엔드 개발자와, 디자인 토큰·컬러 스케일을 정의해야 하는 디자이너를 위한 도구입니다.",
          how: "베이스 HEX를 입력하면 OKLCH 명도 스케일을 따라 50부터 950까지 색이 생성되고, 결과를 스와치 클릭으로 복사하거나 Tailwind config·@theme·CSS 변수 코드로 복사합니다.",
          why: "색상 단계를 손으로 맞출 필요 없이 일관된 명암 스케일을 즉시 얻을 수 있어, 디자인 시스템과 테마 토큰 작업이 빨라집니다.",
        },
      },
      en: {
        card: "Generate an 11-shade Tailwind palette (50–950) from one base HEX and copy the code.",
        description:
          "Enter a single base color (HEX) and instantly generate an 11-shade Tailwind palette (50–950). It uses an OKLCH lightness scale to spread shades evenly from a light 50 to a dark 950, pinning your input color to its nearest step. Click any shade to copy its HEX, or copy the whole palette as a Tailwind v4 @theme block, v3 config or CSS variables.",
        howItWorks: ["Enter a base color (HEX)", "Get an 11-shade palette", "Click a swatch or copy the code"],
        aeo: {
          what: "Tailwind Palette Generator is a tool that builds an 11-shade Tailwind CSS color palette (50–950) from a single base color.",
          who: "It is for front-end developers working with Tailwind CSS and designers who need to define color scales and design tokens.",
          how: "Enter a base HEX and shades from 50 to 950 are generated along an OKLCH lightness scale; copy a shade by clicking it, or copy the palette as Tailwind config, an @theme block or CSS variables.",
          why: "You get a consistent light-to-dark scale instantly without hand-tuning each step, speeding up design systems and theme tokens.",
        },
      },
    },
    faq: {
      ko: [
        {
          question: "팔레트는 어떻게 생성되나요?",
          answer:
            "입력한 베이스 색상의 색조(hue)와 채도(chroma)를 유지한 채, OKLCH 색공간의 명도(lightness) 스케일을 따라 50(가장 밝음)부터 950(가장 어두움)까지 11단계를 만듭니다. 입력한 색은 명도가 가장 가까운 단계에 그대로 고정됩니다.",
        },
        {
          question: "왜 500이 입력한 색과 다를 수 있나요?",
          answer:
            "입력 색의 밝기에 따라 가장 가까운 단계에 고정되기 때문입니다. 예를 들어 밝은 색을 넣으면 300이나 400에 고정되고, 500은 같은 색조의 중간 명도 색으로 계산됩니다.",
        },
        {
          question: "어떤 형식으로 복사할 수 있나요?",
          answer:
            "스와치를 클릭하면 해당 HEX가 복사됩니다. 전체 팔레트는 Tailwind v4 @theme 블록, Tailwind v3 config 객체, 일반 CSS 변수 세 가지 형식으로 복사할 수 있습니다.",
        },
        {
          question: "데이터가 서버로 전송되나요?",
          answer:
            "아니요. 색 계산은 전부 브라우저 안에서 이루어지며, 어떤 색상값도 서버로 전송되거나 저장되지 않습니다.",
        },
      ],
      en: [
        {
          question: "How is the palette generated?",
          answer:
            "It keeps the hue and chroma of your base color and walks an OKLCH lightness scale to build 11 steps from 50 (lightest) to 950 (darkest). Your input color is pinned to the step whose lightness is closest to it.",
        },
        {
          question: "Why can 500 differ from the color I entered?",
          answer:
            "Your color is pinned to its nearest step by lightness. If you enter a light color it may pin to 300 or 400, and 500 is computed as the mid-lightness shade of the same hue.",
        },
        {
          question: "What copy formats are available?",
          answer:
            "Click a swatch to copy its HEX. The full palette can be copied as a Tailwind v4 @theme block, a Tailwind v3 config object, or plain CSS variables.",
        },
        {
          question: "Is any data sent to a server?",
          answer:
            "No. All color math runs in your browser; no color values are uploaded or stored anywhere.",
        },
      ],
    },
    og: {
      ko: {
        title: "Tailwind 팔레트 생성기",
        subtitle: "HEX 하나로 11단계 색상 + 코드 복사",
      },
      en: {
        title: "Tailwind Palette",
        subtitle: "11 shades from one HEX, ready to copy",
      },
    },
  },

  // ── Text ─────────────────────────────
  {
    slug: "character-counter",
    layout: "card",
    cat: "text",
    targets: ["office-worker", "pm", "job-seeker"],
    ico: "¶",
    ready: true,
    badge: "Clean SaaS",
    name: { ko: "글자 수·단어 수 카운터", en: "Character Counter" },
    relatedTools: ["json-formatter", "slack-timestamp-converter", "css-gradient"],
    seo: {
      ko: {
        title: "글자 수·단어 수 카운터",
        description:
          "텍스트를 입력하거나 붙여넣으면 글자·단어·문장·줄·단락 수를 실시간으로 집계합니다. 공백 포함·제외 글자 수와 예상 읽기 시간, 트위터·스레드·인스타그램 등 SNS 글자 수 제한까지 한눈에 확인하세요. 모든 처리는 브라우저 안에서만 이루어집니다.",
        keywords: ["글자 수 세기", "단어 수 카운터", "글자수 제한"],
      },
      en: {
        title: "Character & Word Counter",
        description:
          "Type or paste text and it counts characters, words, sentences, lines and paragraphs in real time. See counts with and without spaces, estimated reading time, and character limits for X, Threads, Instagram and more. Everything runs in your browser.",
        keywords: ["character counter", "word counter", "letter count"],
      },
    },
    content: {
      ko: {
        card: "글자·단어·문장·줄 수를 실시간 집계. SNS 글자 수 제한 안내 포함.",
        description:
          "텍스트를 입력하거나 붙여넣으면 글자·단어·문장·줄·단락 수를 실시간으로 집계합니다. 공백 포함·제외 글자 수와 예상 읽기 시간, 트위터·스레드·인스타그램 등 SNS 글자 수 제한까지 한눈에 확인하세요. 모든 처리는 브라우저 안에서만 이루어집니다.",
        howItWorks: ["텍스트 입력·붙여넣기", "실시간 집계 확인", "SNS 글자 수 제한 점검"],
        aeo: {
          what: "글자 수·단어 수 카운터는 텍스트의 글자·단어·문장·줄·단락 수를 실시간으로 집계해주는 글쓰기 보조 도구입니다.",
          who: "자기소개서를 다듬는 취업 준비생, SNS·공지 글을 쓰는 마케터와 직장인 등 글자 수 제한이 있는 글을 쓰는 모두를 위한 도구입니다.",
          how: "텍스트를 입력하거나 붙여넣으면 즉시 공백 포함·제외 글자 수와 예상 읽기 시간, 주요 SNS별 남은 글자 수를 보여줍니다.",
          why: "플랫폼별 글자 수 제한을 한 화면에서 확인할 수 있어, 글을 올리기 전에 따로 세어보거나 잘릴 걱정을 할 필요가 없습니다.",
        },
      },
      en: {
        card: "Live counts of characters, words, sentences and lines. With social limits.",
        description:
          "Type or paste text and it counts characters, words, sentences, lines and paragraphs in real time. See counts with and without spaces, estimated reading time, and character limits for X, Threads, Instagram and more. Everything runs in your browser.",
        howItWorks: ["Type or paste your text", "Watch the live counts", "Check social limits"],
        aeo: {
          what: "Character Counter is a writing aid that counts characters, words, sentences, lines and paragraphs in real time.",
          who: "It is for job seekers polishing application essays, and for marketers and office workers writing posts with length limits.",
          how: "Type or paste text and it instantly shows counts with and without spaces, estimated reading time, and remaining characters for major social platforms.",
          why: "You can check every platform's length limit on one screen, so nothing gets cut off after you post.",
        },
      },
    },
    faq: {
      ko: [
        {
          question: "글자 수에 공백이 포함되나요?",
          answer:
            "공백 포함 글자 수를 기본으로 보여주고, 같은 카드 안에 공백 제외 글자 수도 함께 표시합니다. 한글·이모지도 한 글자 단위로 정확하게 계산합니다.",
        },
        {
          question: "어떤 SNS 글자 수 제한을 확인할 수 있나요?",
          answer:
            "X(트위터) 280자, 스레드 500자, 인스타그램 2,200자, 블루스카이 300자, SMS 90자를 기준으로 남은 글자 수를 실시간 게이지로 보여줍니다.",
        },
        {
          question: "입력한 글이 어딘가에 저장되나요?",
          answer:
            "아니요. 집계는 전부 브라우저 안에서 처리되며 어떤 텍스트도 서버로 전송되거나 저장되지 않습니다. 탭을 닫으면 내용도 사라집니다.",
        },
        {
          question: "예상 읽기 시간은 어떻게 계산하나요?",
          answer:
            "분당 200단어 읽기 속도와 분당 130단어 발화 속도를 기준으로 계산합니다. 발표 대본이나 영상 스크립트 길이를 가늠할 때 활용하세요.",
        },
      ],
      en: [
        {
          question: "Do the character counts include spaces?",
          answer:
            "The main number includes spaces, and the count without spaces is shown right below it. Korean characters and emoji are counted accurately as single characters.",
        },
        {
          question: "Which social media limits can I check?",
          answer:
            "Live gauges show your remaining length against X (Twitter) 280, Threads 500, Instagram 2,200, Bluesky 300 and SMS 90 characters.",
        },
        {
          question: "Is my text stored anywhere?",
          answer:
            "No. Counting happens entirely in your browser and nothing is uploaded or saved. Close the tab and the text is gone.",
        },
        {
          question: "How is the reading time estimated?",
          answer:
            "It assumes a reading speed of 200 words per minute and a speaking speed of 130 words per minute — useful for sizing scripts and presentations.",
        },
      ],
    },
    og: {
      ko: {
        title: "글자 수·단어 수 카운터",
        subtitle: "글자·단어·문장 실시간 집계와 SNS 글자 수 제한",
      },
      en: {
        title: "Character & Word Counter",
        subtitle: "Live character, word and sentence counts with social limits",
      },
    },
  },
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

/** 마지막 글자 받침 여부 (한국어 조사 선택용) */
function hasJongseong(word: string): boolean {
  const code = word.charCodeAt(word.length - 1);
  if (code < 0xac00 || code > 0xd7a3) return false;
  return (code - 0xac00) % 28 > 0;
}

/** AEO 명시 문단을 Q&A 목록으로 변환 — ToolAbout 섹션과 FAQPage JSON-LD가 공유.
 *  질문에 도구 이름을 포함해 AI 검색 질의("What is a …?")와 직접 매칭되게 한다. */
export function aeoQA(slug: string, lang: Lang): QA[] {
  const t = getTool(slug);
  const aeo = t.content[lang].aeo;
  if (!aeo) return [];
  if (lang === "ko") {
    const p = hasJongseong(t.name.ko) ? "이란" : "란";
    return [
      { question: `${t.name.ko}${p} 어떤 도구인가요?`, answer: aeo.what },
      { question: "누구를 위한 도구인가요?", answer: aeo.who },
      { question: "어떻게 동작하나요?", answer: aeo.how },
      { question: "왜 사용하나요?", answer: aeo.why },
    ];
  }
  return [
    { question: `What is ${t.name.en}?`, answer: aeo.what },
    { question: "Who is it for?", answer: aeo.who },
    { question: "How does it work?", answer: aeo.how },
    { question: "Why use it?", answer: aeo.why },
  ];
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
  const s = t.seo[lang];
  const path = "/" + t.slug;
  const koUrl = path;
  const enUrl = "/en" + path;
  const url = lang === "ko" ? koUrl : enUrl;
  return {
    title: s.title!,
    description: s.description!,
    keywords: s.keywords,
    alternates: {
      canonical: url,
      languages: { "ko-KR": koUrl, "en-US": enUrl, "x-default": koUrl },
    },
    openGraph: {
      title: `${t.og?.[lang].title ?? s.title!} — Kitfolio`,
      description: t.og?.[lang].subtitle ?? s.description!,
      url,
      siteName: SITE.name,
      type: "website",
      locale: ogLocale(lang),
    },
  };
}

/** 허브 메타데이터 */
export function buildHubMetadata(lang: Lang): Metadata {
  const s = HUB.seo[lang];
  const koUrl = "/";
  const enUrl = "/en";
  const url = lang === "ko" ? koUrl : enUrl;
  return {
    title: { absolute: s.title },
    description: s.description,
    keywords: s.keywords,
    alternates: {
      canonical: url,
      languages: { "ko-KR": koUrl, "en-US": enUrl, "x-default": koUrl },
    },
    openGraph: {
      title: s.title,
      description: s.description,
      url,
      siteName: SITE.name,
      type: "website",
      locale: ogLocale(lang),
    },
  };
}

/** 도구 페이지 JSON-LD — WebApplication (+ FAQ가 있으면 FAQPage 포함 배열) */
export function toolJsonLd(slug: string, lang: Lang) {
  const t = getTool(slug);
  const url = SITE.url + localizedHref(lang, "/" + t.slug);
  const app = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: t.seo[lang].title!,
    url,
    description: t.seo[lang].description!,
    applicationCategory: APP_CATEGORY[t.cat],
    operatingSystem: "Any (web browser)",
    browserRequirements: "Requires JavaScript",
    inLanguage: lang === "ko" ? "ko-KR" : "en-US",
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
  };
  // AEO 명시 문단 + FAQ — 페이지에 보이는 Q&A 전부를 FAQPage로 노출
  const qa = [...aeoQA(slug, lang), ...(t.faq?.[lang] ?? [])];
  if (qa.length === 0) return app;
  return [
    app,
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: qa.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ];
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
      description: HUB.seo[lang].description,
      inLanguage: lang === "ko" ? "ko-KR" : "en-US",
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: TOOLS.filter((t) => t.ready).map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.seo[lang].title!,
        url: SITE.url + localizedHref(lang, "/" + t.slug),
      })),
    },
  ];
}
