/* ============================================================
   Kitfolio — 사이트 전체 텍스트 단일 출처 (Single Source of Truth)

   "모든 페이지의 모든 텍스트(KO·EN)"를 이 파일 한곳에서 관리합니다.
   도구가 50개로 늘어나도 이 파일 하나에 50개 × 2개 언어 세트를
   추가하면 됩니다. 텍스트 수정은 이 파일만 고치면 됩니다.

   ── 구조 (페이지 텍스트 영역별) ────────────────────────────
   ① COMMON : 전역 공통 UI — 헤더 네비·푸터·복사/지우기 버튼 등
              (lib/i18n.tsx 의 t() 가 fallback 으로 사용)
   ② HUB    : 허브 페이지 — 히어로·검색 플레이스홀더·빈 결과 등
   ③ CATS   : 카테고리 라벨 (허브 섹션 헤더)
   ④ TOOLS  : 도구별 페이지 텍스트 — 각 항목이 화면 영역과 1:1 매핑
       ├ themeLabel  : 뱃지(eyebrow) 보조 텍스트       ── 뱃지 영역
       ├ name        : h1 (영문 메인 + 국문 보조)      ── 타이틀 영역
       ├ description : meta description = 페이지 설명  ── 리드 문단 영역
       ├ steps       : 3단계 사용 가이드                ── 스텝 영역
       ├ faq         : FAQ 섹션 Q&A (+ FAQPage JSON-LD) ── FAQ 영역
       ├ ui          : 해당 도구 화면의 컨트롤 마이크로카피
       ├ card        : 허브 카드 한 줄 설명
       ├ keywords    : meta keywords + 허브 검색 색인
       └ title       : <title> 태그

   이 데이터는 →
     · 메타데이터 (buildToolMetadata / buildHubMetadata)
     · 화면 카피 (PageHead · Faq · 각 도구 컨트롤)
     · 구조화 데이터 (toolJsonLd: WebApplication + FAQPage / hubJsonLd)
     · 허브 검색 색인 (keywords)
   에 모두 재사용됩니다.
   ============================================================ */
import type { Metadata } from "next";

export type Lang = "ko" | "en";
type L<T = string> = { ko: T; en: T };

/** FAQ 한 문항 */
export type QA = { q: string; a: string };

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
  faq?: L<QA[]>; // FAQ 섹션 (3~5문항) — FAQPage JSON-LD에도 재사용
  ui?: L<Record<string, string>>; // 도구 화면 컨트롤 마이크로카피
};

export const SITE = {
  name: "Kitfolio",
  url: "https://kitfolio.app",
};

/* ============================================================
   ① COMMON — 전역 공통 UI 텍스트 (헤더 / 푸터 / 공용 버튼)
   ============================================================ */
export const COMMON: Record<Lang, Record<string, string>> = {
  en: {
    "nav.all": "All tools",
    "nav.dev": "Developer",
    "nav.design": "Design",
    "nav.text": "Text",
    "header.search": "Search tools…",
    "header.favorites": "Favorites",
    "common.copy": "Copy",
    "common.copied": "Copied",
    "common.clear": "Clear",
    "common.paste": "Paste",
    "common.sample": "Sample",
    "faq.eyebrow": "Frequently Asked Questions",
    "faq.title": "Ask us anything",
    "faq.sub": "The questions we hear most often about this tool.",
    "faq.more": "Didn’t find what you’re looking for?",
    "faq.moreLink": "Send feedback →",
    "common.privacy": "Runs entirely in your browser — nothing is uploaded.",
    "foot.tools": "Tools",
    "foot.about": "About",
    "foot.privacy": "Privacy",
    "foot.feedback": "Feedback",
    "foot.madeby": "Free web tools for developers & designers",
  },
  ko: {
    "nav.all": "전체 도구",
    "nav.dev": "개발",
    "nav.design": "디자인",
    "nav.text": "텍스트",
    "header.search": "도구 검색…",
    "header.favorites": "즐겨찾기",
    "common.copy": "복사",
    "common.copied": "복사됨",
    "common.clear": "지우기",
    "common.paste": "붙여넣기",
    "common.sample": "예시",
    "faq.eyebrow": "자주 묻는 질문",
    "faq.title": "무엇이든 물어보세요",
    "faq.sub": "이 도구를 쓰면서 가장 많이 받는 질문들을 모았습니다.",
    "faq.more": "찾는 답이 없나요?",
    "faq.moreLink": "피드백 보내기 →",
    "common.privacy": "모든 처리는 브라우저 안에서만 — 어떤 데이터도 전송되지 않습니다.",
    "foot.tools": "도구",
    "foot.about": "소개",
    "foot.privacy": "개인정보",
    "foot.feedback": "피드백",
    "foot.madeby": "개발자·디자이너를 위한 무료 웹 도구",
  },
};

/* ============================================================
   ② HUB — 허브 페이지 (/ , /en)
   ============================================================ */
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
  /** 허브 화면 마이크로카피 */
  ui: {
    ko: {
      soon: "준비 중",
      open: "열기",
      empty: "검색 결과가 없습니다.",
      searchPlaceholder: "어떤 도구가 필요하세요? (예: JSON, 그라디언트, 글자 수)",
    },
    en: {
      soon: "Soon",
      open: "Open",
      empty: "No tools match your search.",
      searchPlaceholder: "What do you need? (e.g. JSON, gradient, word count)",
    },
  } as L<Record<string, string>>,
};

/* ============================================================
   ③ CATS — 카테고리 라벨 (허브 섹션 헤더 + 네비 키)
   ============================================================ */
export const CATS: {
  id: "dev" | "design" | "text";
  navKey: string;
  label: L<{ big: string; small: string }>;
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
   ④ TOOLS — 도구별 페이지 텍스트
   ============================================================ */
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
    faq: {
      ko: [
        {
          q: "입력한 JSON이 서버로 전송되나요?",
          a: "아니요. 포맷팅·검증·압축은 전부 브라우저 안에서 JavaScript로 처리됩니다. 어떤 데이터도 서버로 전송되거나 저장되지 않으므로 민감한 데이터도 안심하고 사용할 수 있습니다.",
        },
        {
          q: "JSON 문법 오류는 어떻게 찾아주나요?",
          a: "유효하지 않은 JSON을 붙여넣으면 하단 상태 표시줄에 오류 내용과 함께 줄·열 위치를 표시합니다. 해당 위치를 수정하면 결과가 실시간으로 다시 검증됩니다.",
        },
        {
          q: "들여쓰기 간격을 바꾸거나 한 줄로 압축할 수 있나요?",
          a: "툴바에서 2칸·4칸·탭 들여쓰기를 선택할 수 있고, 압축 버튼을 누르면 공백을 제거한 한 줄(minify) JSON으로 변환됩니다.",
        },
        {
          q: "어느 정도 크기의 JSON까지 처리할 수 있나요?",
          a: "처리가 브라우저 메모리에서 이루어지므로 일반적인 수 MB 수준의 JSON은 문제없이 다룰 수 있습니다. 매우 큰 파일은 기기 성능에 따라 느려질 수 있습니다.",
        },
      ],
      en: [
        {
          q: "Is my JSON sent to a server?",
          a: "No. Formatting, validation and minification all happen in your browser with JavaScript. Nothing is uploaded or stored, so it is safe to use with sensitive data.",
        },
        {
          q: "How are syntax errors reported?",
          a: "When you paste invalid JSON, the status bar shows the error message along with the line and column. Fix the spot and the result re-validates in real time.",
        },
        {
          q: "Can I change the indentation or minify to one line?",
          a: "Pick 2-space, 4-space or tab indentation from the toolbar, or press Minify to strip whitespace into a single-line JSON string.",
        },
        {
          q: "How large a JSON document can it handle?",
          a: "Everything is processed in browser memory, so documents up to a few megabytes work fine. Very large files may slow down depending on your device.",
        },
      ],
    },
    ui: {
      ko: {
        "json.indent": "들여쓰기",
        "json.format": "포맷",
        "json.minify": "압축",
        "json.status.idle": "입력 대기 중",
        "json.status.valid": "유효한 JSON",
        "json.status.invalid": "문법 오류",
        "json.lines": "줄",
        "json.keys": "키",
      },
      en: {
        "json.indent": "Indent",
        "json.format": "Format",
        "json.minify": "Minify",
        "json.status.idle": "Waiting for input",
        "json.status.valid": "Valid JSON",
        "json.status.invalid": "Syntax error",
        "json.lines": "lines",
        "json.keys": "keys",
      },
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
    faq: {
      ko: [
        {
          q: "어떤 입력 형식을 인식하나요?",
          a: "Unix 초·밀리초·마이크로초 타임스탬프, ISO 8601 같은 일반 날짜·시간 문자열, 그리고 <!date^...> Slack date 구문을 자동으로 감지해 변환합니다.",
        },
        {
          q: "Slack date 구문은 어디에 쓰나요?",
          a: "변환 결과의 Slack 구문을 메시지에 붙여넣으면, 받는 사람의 타임존과 언어 설정에 맞춰 날짜·시간이 자동으로 표시됩니다. 타임존이 다른 글로벌 팀 공지에 유용합니다.",
        },
        {
          q: "타임존은 어떻게 처리되나요?",
          a: "같은 시각을 UTC와 현재 브라우저의 로컬 타임존으로 동시에 보여주고, 지금 시점 기준의 상대 시간(예: 3시간 전)도 함께 표시합니다.",
        },
        {
          q: "입력한 값이 서버로 전송되나요?",
          a: "아니요. 모든 변환은 브라우저 안에서 처리되며 어떤 데이터도 서버로 전송되지 않습니다.",
        },
      ],
      en: [
        {
          q: "Which input formats are recognized?",
          a: "Unix timestamps in seconds, milliseconds or microseconds, common date-time strings such as ISO 8601, and Slack's <!date^...> syntax are all auto-detected and converted.",
        },
        {
          q: "What is the Slack date syntax for?",
          a: "Paste the generated Slack syntax into a message and Slack renders the date and time in each reader's own timezone and locale — handy for announcements across global teams.",
        },
        {
          q: "How are timezones handled?",
          a: "The same instant is shown in UTC and in your browser's local timezone side by side, along with a live relative time such as “3 hours ago”.",
        },
        {
          q: "Is anything I enter sent to a server?",
          a: "No. Every conversion happens inside your browser and no data ever leaves it.",
        },
      ],
    },
    ui: {
      ko: {
        "in.panel": "입력",
        "in.clear": "지우기",
        "in.ph": "Unix 타임스탬프 또는 날짜·시간 입력…",
        "in.ph2": "예: 1718071200 · 1718071200.123 · 2026-06-11T15:00:00\n또는 <!date^...> Slack 구문",
        "out.panel": "변환 결과",
        "row.utc": "UTC",
        "row.local": "Local",
        "row.readable": "Readable",
        "row.relative": "Relative",
        "row.unix": "Unix (초)",
        "row.slack": "Slack 구문",
        "now.label": "현재 타임스탬프",
        "err.empty": "타임스탬프 또는 날짜를 입력하세요",
        "kind.unix-s": "Unix seconds",
        "kind.unix-ms": "Unix ms",
        "kind.unix-us": "Unix μs",
        "kind.datetime": "DateTime",
        "kind.slack": "Slack syntax",
        "kind.invalid": "Invalid",
      },
      en: {
        "in.panel": "Input",
        "in.clear": "Clear",
        "in.ph": "Enter Unix timestamp or date / time…",
        "in.ph2": "e.g. 1718071200 · 1718071200.123 · 2026-06-11T15:00:00\nor <!date^...> Slack syntax",
        "out.panel": "Output",
        "row.utc": "UTC",
        "row.local": "Local",
        "row.readable": "Readable",
        "row.relative": "Relative",
        "row.unix": "Unix (seconds)",
        "row.slack": "Slack syntax",
        "now.label": "Current Timestamp",
        "err.empty": "Enter a timestamp or date to convert",
        "kind.unix-s": "Unix seconds",
        "kind.unix-ms": "Unix ms",
        "kind.unix-us": "Unix μs",
        "kind.datetime": "DateTime",
        "kind.slack": "Slack syntax",
        "kind.invalid": "Invalid",
      },
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
    faq: {
      ko: [
        {
          q: "어떤 그라디언트 타입을 지원하나요?",
          a: "linear(선형)·radial(원형)·conic(원뿔형) 세 가지 타입을 지원합니다. 타입을 바꾸면 각도·중심 위치 등 조절할 수 있는 옵션이 함께 바뀝니다.",
        },
        {
          q: "색상 정지점은 어떻게 추가하고 옮기나요?",
          a: "그라디언트 트랙의 빈 곳을 클릭하거나 ‘정지점 추가’ 버튼을 누르면 추가됩니다. 정지점을 드래그해 위치를 옮길 수 있고, HEX 색상값과 % 위치를 직접 입력할 수도 있습니다.",
        },
        {
          q: "복사한 CSS는 모든 브라우저에서 동작하나요?",
          a: "linear·radial 그라디언트는 모든 모던 브라우저에서 동작합니다. conic-gradient도 최신 브라우저에서 폭넓게 지원되지만, 매우 오래된 브라우저에서는 표시되지 않을 수 있습니다.",
        },
        {
          q: "만든 그라디언트를 저장할 수 있나요?",
          a: "생성된 CSS 코드를 복사해 프로젝트나 메모에 보관하는 방식을 권장합니다. 같은 코드를 다시 붙여넣으면 언제든 동일한 그라디언트를 재현할 수 있습니다.",
        },
      ],
      en: [
        {
          q: "Which gradient types are supported?",
          a: "Linear, radial and conic gradients are all supported. Switching the type also switches the available options such as angle and center position.",
        },
        {
          q: "How do I add and move color stops?",
          a: "Click an empty spot on the gradient track or press “Add stop”. Drag a stop to reposition it, or type an exact HEX value and % position directly.",
        },
        {
          q: "Will the copied CSS work in every browser?",
          a: "Linear and radial gradients work in all modern browsers. conic-gradient is also widely supported in current browsers, though very old ones may not render it.",
        },
        {
          q: "Can I save a gradient I made?",
          a: "Copy the generated CSS and keep it in your project or notes — pasting the same code reproduces the exact gradient any time.",
        },
      ],
    },
    ui: {
      ko: {
        "grad.type": "타입",
        "grad.angle": "각도",
        "grad.position": "중심 위치",
        "grad.stops": "색상 정지점",
        "grad.addStop": "정지점 추가",
        "grad.css": "CSS",
        "grad.random": "랜덤",
        "grad.reverse": "반전",
      },
      en: {
        "grad.type": "Type",
        "grad.angle": "Angle",
        "grad.position": "Center",
        "grad.stops": "Color Stops",
        "grad.addStop": "Add stop",
        "grad.css": "CSS",
        "grad.random": "Random",
        "grad.reverse": "Reverse",
      },
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
    faq: {
      ko: [
        {
          q: "글자 수에 공백이 포함되나요?",
          a: "공백 포함 글자 수를 기본으로 보여주고, 같은 카드 안에 공백 제외 글자 수도 함께 표시합니다. 한글·이모지도 한 글자 단위로 정확하게 계산합니다.",
        },
        {
          q: "어떤 SNS 글자 수 제한을 확인할 수 있나요?",
          a: "X(트위터) 280자, 스레드 500자, 인스타그램 2,200자, 블루스카이 300자, SMS 90자를 기준으로 남은 글자 수를 실시간 게이지로 보여줍니다.",
        },
        {
          q: "입력한 글이 어딘가에 저장되나요?",
          a: "아니요. 집계는 전부 브라우저 안에서 처리되며 어떤 텍스트도 서버로 전송되거나 저장되지 않습니다. 탭을 닫으면 내용도 사라집니다.",
        },
        {
          q: "예상 읽기 시간은 어떻게 계산하나요?",
          a: "분당 200단어 읽기 속도와 분당 130단어 발화 속도를 기준으로 계산합니다. 발표 대본이나 영상 스크립트 길이를 가늠할 때 활용하세요.",
        },
      ],
      en: [
        {
          q: "Do the character counts include spaces?",
          a: "The main number includes spaces, and the count without spaces is shown right below it. Korean characters and emoji are counted accurately as single characters.",
        },
        {
          q: "Which social media limits can I check?",
          a: "Live gauges show your remaining length against X (Twitter) 280, Threads 500, Instagram 2,200, Bluesky 300 and SMS 90 characters.",
        },
        {
          q: "Is my text stored anywhere?",
          a: "No. Counting happens entirely in your browser and nothing is uploaded or saved. Close the tab and the text is gone.",
        },
        {
          q: "How is the reading time estimated?",
          a: "It assumes a reading speed of 200 words per minute and a speaking speed of 130 words per minute — useful for sizing scripts and presentations.",
        },
      ],
    },
    ui: {
      ko: {
        "cc.editorLabel": "텍스트 입력",
        "cc.placeholder": "여기에 텍스트를 입력하거나 붙여넣으세요…",
        "cc.chars": "글자 수",
        "cc.noSpace": "(공백 제외)",
        "cc.words": "단어 수",
        "cc.sentences": "문장",
        "cc.lines": "줄",
        "cc.paras": "단락",
        "cc.readTime": "예상 읽기",
        "cc.speakTime": "예상 발화",
        "cc.size": "바이트",
        "cc.limitsTitle": "SNS 글자 수 제한",
        "cc.limitsSub": "현재 글자 수 기준 남은 분량입니다.",
        "cc.left": "남음",
        "cc.over": "초과",
      },
      en: {
        "cc.editorLabel": "Your text",
        "cc.placeholder": "Type or paste your text here…",
        "cc.chars": "Characters",
        "cc.noSpace": "(no spaces)",
        "cc.words": "Words",
        "cc.sentences": "Sentences",
        "cc.lines": "Lines",
        "cc.paras": "Paragraphs",
        "cc.readTime": "Read time",
        "cc.speakTime": "Speak time",
        "cc.size": "Bytes",
        "cc.limitsTitle": "Social character limits",
        "cc.limitsSub": "Remaining length based on current count.",
        "cc.left": "left",
        "cc.over": "over",
      },
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

/** 도구 페이지 JSON-LD — WebApplication (+ FAQ가 있으면 FAQPage 포함 배열) */
export function toolJsonLd(slug: string, lang: Lang) {
  const t = getTool(slug);
  const url = SITE.url + localizedHref(lang, "/" + t.slug);
  const app = {
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
  if (!t.faq) return app;
  return [
    app,
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: t.faq[lang].map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
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
