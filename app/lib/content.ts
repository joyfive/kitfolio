/* ============================================================
   Kitfolio: 콘텐츠 레지스트리 (Single Source of Truth)

   "실제 렌더링되는 콘텐츠 텍스트(KO·EN)"를 이 파일 한곳에서 관리합니다.
   도구가 50개로 늘어나도 이 파일에 50개 × 2개 언어 세트를 추가하면 됩니다.

   ⚠️ 범위: 콘텐츠 텍스트만. 기능/버튼/인풋 등 UI 마이크로카피는 제외:
   전역 공통 UI(헤더 네비·푸터·복사 버튼 등)는 lib/i18n.tsx 의 COMMON,
   도구별 컨트롤 라벨은 각 컴포넌트의 로컬 DICT 에서 관리합니다.

   ── 구조 ────────────────────────────────────────────────
   ① SITE        : 사이트 상수
   ② HUB         : 허브 · seo(메타) + hero(히어로 카피)
   ③ CATS        : 카테고리 라벨 (허브 섹션 헤더 · 도구 뱃지)
   ④ FAQ_SECTION : FAQ 섹션 공통 카피 (인트로·푸터 링크)
   ⑤ TOOLS       : 도구 레지스트리 · 항목 하나에 도구 완결 정의
       ├ slug          : 1뎁스 라우트 (플랫 URL)
       ├ layout        : 디자인 시스템 타입 (card=A · ide=B · canvas=C)
       ├ cat           : 허브 카테고리 (테마 분기 겸용)
       ├ targets       : 내부 타겟 태그 (URL 아님 · 필터/분석용)
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
// 실수령 계산기의 공식 출처·검증일은 정책 데이터 레이어(lib/salary/insurance)가 단일 출처다.
// 여기서 URL을 다시 적으면 요율 개정 때 한쪽만 갱신되어 어긋나므로 그대로 가져다 쓴다.
import { OFFICIAL_SOURCES, POLICY_VERIFIED_AT } from "./salary/insurance";
// 퇴직금 계산기도 같은 이유로 출처·검증일을 정책 데이터 레이어에서 가져온다.
import { SEVERANCE_SOURCES, SEVERANCE_VERIFIED_AT } from "./severance/sources";

export type Lang = "ko" | "en";

/** 디자인 시스템 레이아웃 3종: Type A(Card) · B(IDE) · C(Canvas) */
export type Layout = "card" | "ide" | "canvas";

/** 내부 타겟 태그: URL 카테고리 아님, 필터링·디스커버리·분석용 */
export type TargetTag =
  | "pm"
  | "designer"
  | "developer"
  | "job-seeker"
  | "office-worker"
  | "small-business-owner"
  | "marketer";

export type QA = { question: string; answer: string };

type ToolSeo = {
  /** <title> (50~60자): ready 도구만 */
  title?: string;
  /** meta description: ready 도구만 */
  description?: string;
  /** meta keywords + 허브 검색 색인 (전 도구) */
  keywords: string[];
};

/** 심화 가이드 한 섹션 */
export type GuideSection = { heading: string; body: string[] };

/** 실전 사용 예제: 상황 / 입력 / 결과 / 해석 */
export type GuideExample = {
  /** 상황 한 줄 (예: "연봉 5,200만원, 부양가족 1명") */
  title: string;
  /** 입력값 요약 */
  input: string;
  /** 결과 요약: 가능하면 구체 숫자 */
  result: string;
  /** 결과를 어떻게 읽어야 하는지 (선택) */
  note?: string;
};

/** 공식 출처 링크 */
export type SourceLink = { label: string; url: string };

type ToolCopy = {
  /** 허브 카드 한 줄 설명 (전 도구) */
  card: string;
  /** 페이지 리드 문단 (= meta description 겸용): ready 도구만 */
  description?: string;
  /** How It Works: 3단계 사용 가이드 (ready 도구만) */
  howItWorks?: string[];
  /** AEO 명시 문단: What is / Who is it for / How does it work / Why use it.
   *  본문(ToolAbout 섹션)과 FAQPage JSON-LD 양쪽에 노출: ready 도구만 */
  aeo?: { what: string; who: string; how: string; why: string };
  /** 심화 가이드: 대표(간판) 도구에 한해 렌더하는 긴 산문 콘텐츠.
   *  사용 맥락·실전 예시·팁 등 고유 본문으로 페이지 가치를 보강한다.
   *  ToolGuide 컴포넌트가 소비 (섹션 = heading + 문단 배열). */
  guide?: GuideSection[];
  /** 실전 사용 예제: 구체적인 입력값과 결과 숫자가 있는 사례.
   *  "이 도구를 실제로 어떻게 쓰는가"를 보여준다. indexable 도구 필수. */
  examples?: GuideExample[];
  /** 제약·엣지케이스: 이 도구가 다루지 못하는 것, 결과가 어긋날 수 있는 조건.
   *  indexable 도구 필수. */
  limitations?: string[];
  /** 공식 출처: 세법·요율·플랫폼 정책·기술 명세처럼 외부 기준에 의존하는
   *  도구에만. 기관·표준 1차 자료만 사용하고 블로그·타사 계산기는 쓰지 않는다. */
  sources?: SourceLink[];
};

type ToolOg = { title: string; subtitle: string };

export type Tool = {
  slug: string;
  layout: Layout;
  cat: "dev" | "design" | "text";
  targets: TargetTag[];
  ico: string;
  icoClass?: string;
  /** 기능 공개: 사용자가 이 도구를 실제로 쓸 수 있는가.
   *  허브 목록·검색·관련 도구 노출은 전부 이 값을 기준으로 한다. */
  ready: boolean;
  /** 검색 색인: 독립적인 검색 랜딩 페이지로 제공할 콘텐츠 품질이 확보됐는가.
   *  ready 와 완전히 별개다. false 여도 페이지는 정상 동작하고 UI에도 그대로 노출된다.
   *  2026-09부터 robots noindex는 전면 폐기(URL 통합 작업지시서 결정 G)했으므로
   *  false 라도 검색엔진 색인 자체는 막지 않는다: 대신 sitemap·허브 ItemList
   *  JSON-LD에서 빠지고, AdUnit 광고 가드(isToolIndexable)가 광고를 렌더링하지
   *  않는 안전장치로만 쓰인다. true 로 올리려면 validateIndexableTools() 의
   *  품질 조건을 통과해야 한다. */
  indexable: boolean;
  /** 외부 기준 데이터(요율·세법·플랫폼 정책)에 의존하는 도구의 최근 검증일 */
  verifiedAt?: string;
  /** 뱃지(eyebrow) 보조 텍스트 */
  badge: string;
  /** h1: 영문 메인 + 국문 보조 병기 */
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

/** 운영 주체 · 대표자. 약관·개인정보처리방침의 사업자 표시 단일 출처.
 *  문서 본문에 상호·대표자명을 직접 적지 않고 여기서만 관리한다. */
export const LEGAL_OPERATOR = {
  ko: { name: "VIVASPACE", rep: "오기쁨", repTitle: "대표" },
  en: { name: "VIVASPACE", rep: "Kibbeum Oh", repTitle: "Representative" },
} as const;

/** 기본 작성자: 블로그 author · About 페이지 · JSON-LD 가 공유하는 단일 출처.
 *
 *  사이트의 글은 개인 바이라인이 아니라 **운영 주체(법인) 명의로 발행**한다.
 *  그래도 "누가 쓰고 누가 책임지는가"는 항상 확인되어야 하므로
 *  (AdSense 심사·E-E-A-T 관점) 상호·역할·About 링크를 항상 함께 노출한다. */
export const AUTHOR = {
  /** 작성자명: 약관·개인정보처리방침의 운영 주체와 같은 상호를 쓴다 */
  name: LEGAL_OPERATOR.en.name,
  /** JSON-LD author 의 @type. 조직 명의 발행이므로 Organization 이다. */
  type: "Organization",
  /** 프로필 대신 운영 정보를 담은 About 페이지를 author.url 로 쓴다 */
  path: "/about",
  role: { ko: "Kitfolio 운영 주체", en: "Operator of Kitfolio" },
} as const;

/** 허브 카드 등에서 쓰는 레이아웃 표시 라벨 */
export const LAYOUT_LABEL: Record<Layout, string> = {
  card: "Clean",
  ide: "IDE",
  canvas: "Canvas",
};

/* ============================================================
   ② HUB: 허브 페이지 (/ , /en)
   ============================================================ */
export const HUB = {
  seo: {
    ko: {
      title: "Kitfolio | 일하는 사람을 위한 작은 웹 도구 모음",
      description:
        "글자 수 카운터, JSON 포매터, 연봉 계산기 등 업무용 계산기·생성기·유틸리티 모음. 설치·가입 없이 브라우저에서 무료로 사용하세요.",
      keywords: ["무료 웹 도구", "업무 계산기", "온라인 유틸리티"],
    },
    en: {
      title: "Kitfolio | Small tools for modern knowledge workers",
      description:
        "Work calculators, generators and utilities that run entirely in your browser: character counter, JSON formatter, gradient generator and more. No login, no installation, no server-side processing.",
      keywords: ["free web tools", "work calculators", "online utilities"],
    },
  },
  hero: {
    ko: {
      eyebrow: "설치 없이 · 가입 없이 · 브라우저에서 바로",
      h1: { pre: "일하는 사람을 위한 ", accent: "작은 도구들", post: ",\n한 곳에서 빠르게." },
      subtitle:
        "모던 지식 노동자를 위한 브라우저 기반 마이크로 도구 모음. 업무에서 반복되는 작은 문제를 푸는 계산기·생성기·변환기·유틸리티: 도구에 입력한 텍스트·숫자·파일은 Kitfolio 서버로 업로드되지 않고 브라우저 안에서 처리됩니다.",
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
        "Browser-based micro tools for modern knowledge workers: work calculators, generators, converters and utilities. The text, numbers and files you enter are processed in your browser and never uploaded to Kitfolio's servers.",
      stat: " tools",
    },
  },
  /** 허브 하단 설명 콘텐츠: 사이트 성격을 산문으로 소개 (SEO·AEO·심사 첫인상 보강) */
  about: {
    ko: {
      heading: "Kitfolio는 어떤 서비스인가요?",
      sections: [
        {
          h: "일하는 사람을 위한 작은 도구 모음",
          p: "Kitfolio는 기획자·디자이너·개발자·마케터·구직자·직장인·소상공인이 업무 중 반복해서 마주치는 작은 문제를 빠르게 푸는 브라우저 기반 도구 모음입니다. 글자 수를 세거나, JSON을 정리하거나, 연봉 실수령액을 계산하거나, QR 코드를 만들거나, PDF를 병합하는 것처럼 자주 필요하지만 매번 검색해서 찾기는 번거로운 작업들을 한 곳에 모았습니다. 무거운 프로그램을 설치할 필요도, 회원가입을 할 필요도 없이 페이지를 열면 바로 씁니다.",
        },
        {
          h: "모든 처리는 브라우저 안에서",
          p: "Kitfolio의 모든 도구는 서버가 아니라 여러분의 브라우저 안에서 동작합니다. 도구에 입력한 텍스트·숫자·파일은 Kitfolio 서버로 업로드되지 않으며, 계산과 변환은 전부 기기 내부에서 끝납니다. 민감한 문서를 다룰 때도 그 내용 자체는 기기 밖으로 나가지 않고, 네트워크가 느린 환경에서도 빠르게 반응합니다. 다만 이는 '도구에 입력한 내용'에 대한 이야기입니다. 사이트를 여는 과정에서는 웹 폰트·방문 통계·광고 같은 제3자 서비스로의 네트워크 요청이 별도로 발생할 수 있으며, 무엇이 전송되지 않고 무엇이 처리될 수 있는지는 개인정보처리방침에 구분해 두었습니다.",
        },
        {
          h: "필요한 도구를 빠르게 찾기",
          p: "상단 검색창에 하려는 작업을 입력하거나 직군 필터로 좁혀서 원하는 도구를 바로 찾을 수 있습니다. 각 도구 페이지에는 사용법과 자주 묻는 질문이 함께 정리되어 있어 처음 쓰는 도구도 헤매지 않습니다. Kitfolio는 하나의 거대한 앱이 아니라, 각자 뚜렷한 목적을 가진 작고 실용적인 도구들이 계속 늘어나는 컬렉션입니다.",
        },
      ],
    },
    en: {
      heading: "What is Kitfolio?",
      sections: [
        {
          h: "Small tools for people who work",
          p: "Kitfolio is a collection of browser-based tools that help PMs, designers, developers, marketers, job seekers, office workers, and small business owners quickly solve the small, repetitive problems they run into during the workday. Counting characters, formatting JSON, calculating take-home pay, generating a QR code, merging PDFs: tasks you need often but would rather not search for every time are gathered in one place. There's nothing to install and no account to create; open the page and start using it.",
        },
        {
          h: "Everything runs in your browser",
          p: "Every Kitfolio tool runs inside your browser, not on a server. The text, numbers, and files you enter are never uploaded to Kitfolio's servers: all calculation and conversion happens on your device. That means the contents of a sensitive document stay on your machine, and the tools stay fast even on a slow connection. That promise is about what you enter into the tools. Loading the site itself still makes separate network requests to third-party services such as web fonts, analytics, and advertising, and the Privacy Policy sets out which is which.",
        },
        {
          h: "Find the right tool fast",
          p: "Type what you're trying to do into the search box at the top, or narrow the list by role to jump straight to the tool you need. Each tool page includes clear how-it-works steps and a set of frequently asked questions, so even a tool you've never used is easy to pick up. Kitfolio isn't one giant app: it's a growing library of small, focused, practical tools, each with a clear purpose.",
        },
      ],
    },
  },
};

/* ============================================================
   ③ CATS: 카테고리 라벨
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
   ④ FAQ_SECTION: FAQ 섹션 공통 카피
   ============================================================ */
/* FAQ / About 통합 섹션: 탭(칩) 라벨 + 인트로 카피 */
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

/* AEO(About this tool) 섹션: What is / Who for / How / Why */
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

/* 타겟 태그 표시 라벨: 허브 직군 필터 칩 */
export const TARGET_LABELS: Record<TargetTag, { ko: string; en: string }> = {
  pm: { ko: "PM", en: "PM" },
  designer: { ko: "디자이너", en: "Designer" },
  developer: { ko: "개발자", en: "Developer" },
  "job-seeker": { ko: "취업 준비생", en: "Job seeker" },
  "office-worker": { ko: "직장인", en: "Office worker" },
  "small-business-owner": { ko: "자영업자", en: "Small business" },
  marketer: { ko: "마케터", en: "Marketer" },
};

/* ============================================================
   ⑥ LEGAL: 약관/정책 페이지 (도구 아님, 별도 레지스트리)

   개인정보처리방침 · 이용약관. 도구가 아니므로 TOOLS(허브·검색·sitemap
   tool 목록)에 넣지 않고 별도 관리한다. 콘텐츠 텍스트는 여기 단일 출처.
   본문 문자열은 최소 인라인 마크업 지원: **굵게**, [라벨](url).
   ============================================================ */
export const LEGAL_EMAIL = "support@kitfolio.app";
/** 약관·개인정보처리방침 시행일자 (최근 개정일).
 *  2026-08-16 개정: 운영 주체를 VIVASPACE 로 명시하고 문의처를 통일했다. */
export const LEGAL_EFFECTIVE = { ko: "2026년 8월 16일", en: "August 16, 2026" };

/** 소개·문의 페이지의 최종 업데이트일. 시행일자와 성격이 달라 따로 관리한다.
 *  (약관은 개정 시점, 안내 페이지는 내용을 마지막으로 손본 시점) */
export const LEGAL_UPDATED = { ko: "2026년 9월 17일", en: "September 17, 2026" };

/** 문서별 날짜 선택: 약관·방침은 시행일자, 안내 페이지는 최종 업데이트일. */
export function legalDateOf(slug: LegalSlug, lang: Lang): string {
  return slug === "privacy-policy" || slug === "terms-of-service"
    ? LEGAL_EFFECTIVE[lang]
    : LEGAL_UPDATED[lang];
}

export const LEGAL_SLUGS = ["about", "contact", "privacy-policy", "terms-of-service"] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

export type LegalSection = { heading: string; body: string[] };
export type LegalDoc = {
  title: string;
  /** 리드 문단 (선택) */
  intro?: string;
  sections: LegalSection[];
  /** "시행일자" 라벨 */
  effectiveLabel: string;
  /** "문의 이메일" 라벨 */
  contactLabel: string;
};

type LegalEntry = {
  /** 푸터·네비 짧은 라벨 */
  navLabel: { ko: string; en: string };
  seo: {
    ko: { title: string; description: string };
    en: { title: string; description: string };
  };
  doc: { ko: LegalDoc; en: LegalDoc };
};

export const LEGAL: Record<LegalSlug, LegalEntry> = {
  about: {
    navLabel: { ko: "소개", en: "About" },
    seo: {
      ko: {
        title: "Kitfolio 소개 | 일하는 사람을 위한 작은 웹 도구",
        description:
          "Kitfolio는 모던 지식 노동자를 위한 브라우저 기반 마이크로 도구 모음입니다. 서비스의 목적, 운영 방식, 개인정보 비수집 원칙과 만드는 사람을 소개합니다.",
      },
      en: {
        title: "About Kitfolio | Small Web Tools for People Who Work",
        description:
          "Kitfolio is a collection of browser-based micro tools for modern knowledge workers. Learn what the site is for, how it is run, its no-data-collection principle, and who builds it.",
      },
    },
    doc: {
      ko: {
        title: "Kitfolio 소개",
        intro:
          "Kitfolio는 기획자·디자이너·개발자·마케터·구직자·직장인·소상공인이 업무 중 반복해서 마주치는 작은 문제를 빠르게 푸는 브라우저 기반 도구 모음입니다.",
        sections: [
          {
            heading: "무엇을 하는 서비스인가요",
            body: [
              "Kitfolio는 계산기·생성기·변환기·포매터·유틸리티처럼 자주 필요하지만 매번 찾기는 번거로운 작은 도구들을 한곳에 모은 서비스입니다. 글자 수 세기, JSON 정리, 연봉 실수령액 계산, 성장률·광고 지표 계산, QR 코드 생성, PDF 병합처럼 서로 다른 업무 상황의 반복 작업을 다룹니다.",
              "각 도구는 하나의 뚜렷한 목적을 가지며, 무거운 프로그램 설치나 회원가입 없이 페이지를 여는 즉시 사용할 수 있습니다.",
            ],
          },
          {
            heading: "어떻게 동작하나요 (입력 데이터는 서버로 가지 않습니다)",
            body: [
              "Kitfolio의 모든 도구는 서버가 아니라 이용자의 브라우저 안에서 동작합니다. 도구에 입력한 텍스트·숫자·파일은 Kitfolio 서버로 업로드되지 않으며, 계산과 변환은 전부 기기 내부에서 끝납니다.",
              "회원가입이나 로그인이 없고, 이름·이메일 같은 개인정보를 직접 수집하지 않습니다. 다만 사이트 운영을 위해 방문 통계·광고·웹 폰트 등 제3자 서비스를 이용하며, 이들 서비스는 접속 정보나 쿠키를 별도로 처리할 수 있습니다. 즉 도구에 입력한 내용은 전송되지 않지만, 사이트 이용 중 아무 통신도 일어나지 않는다는 뜻은 아닙니다. 무엇이 전송되지 않고 무엇이 처리될 수 있는지는 개인정보처리방침에 구분해 정리했습니다.",
            ],
          },
          {
            heading: "왜 만드나요",
            body: [
              "좋은 도구는 작은 마찰을 없애 하루의 흐름을 지켜 줍니다. Kitfolio의 목표는 콘텐츠를 많이 발행하는 것이 아니라, 반복되는 업무 문제를 무료로·빠르게·프라이버시를 지키며 풀 수 있는 실용적인 도구를 하나씩 늘려가는 것입니다.",
              `Kitfolio는 ${LEGAL_OPERATOR.ko.name}에서 직접 기획하고 운영하는 프로젝트이며, 실제 업무에서 필요하다고 느낀 도구를 우선 만듭니다. 도구 제안이나 의견은 언제든 환영합니다: 문의 페이지를 통해 연락해 주세요.`,
            ],
          },
          {
            heading: "누가 운영하나요",
            body: [
              `Kitfolio는 **${LEGAL_OPERATOR.ko.name}**에서 운영하며, 기획·개발·운영·콘텐츠 작성을 직접 담당합니다. 외부 기고자나 자동 생성 콘텐츠 공급자는 없으며, 사이트의 모든 도구와 글에 대한 책임은 운영 주체에 있습니다.`,
              "소스코드는 [GitHub 저장소](https://github.com/joyfive/kitfolio)에서 공개되어 있어, 각 도구가 실제로 어떻게 계산하는지 직접 확인할 수 있습니다. 문의는 아래 이메일로 받으며 운영자가 직접 답변합니다.",
            ],
          },
          {
            heading: "도구를 만들고 검증하는 원칙",
            body: [
              "**직접 쓸 도구만 만듭니다.** 검색량이 높다는 이유만으로 도구를 늘리지 않고, 실제 업무에서 반복해서 겪은 문제를 우선합니다.",
              "**계산 로직은 UI와 분리해 검증합니다.** 연봉 실수령액처럼 공식 기준이 있는 계산은 요율·정책 데이터를 별도 모듈로 분리하고, 각 항목의 공식 산식을 자동화된 테스트로 검증합니다. 다른 계산기 사이트의 결과와 총액을 맞추는 방식이 아니라, 기관이 고시한 산식 자체를 기준으로 삼습니다.",
              "**외부 기준에 의존하는 도구에는 출처와 검증일을 표시합니다.** 세율·보험료율·플랫폼 정책처럼 바뀌는 값을 쓰는 도구는 어느 시점 기준인지, 마지막으로 언제 공식 자료와 대조했는지를 페이지에서 확인할 수 있게 합니다. 출처는 정부·공공기관 등 1차 자료만 사용하며 개인 블로그나 타사 계산기는 근거로 삼지 않습니다.",
              "**한계를 함께 적습니다.** 각 도구 페이지에는 그 도구가 다루지 못하는 상황과 결과가 어긋날 수 있는 조건을 명시합니다. 예상 계산을 확정 금액처럼 쓰지 않도록 하기 위해서입니다.",
            ],
          },
          {
            heading: "최신성이 필요한 도구는 어떻게 갱신하나요",
            body: [
              "보험료율·세율처럼 기준일에 따라 값이 바뀌는 데이터는 연도 하나로 관리하지 않고 **적용 기간(시행일~종료일) 단위**로 관리합니다. 예를 들어 4대보험 요율은 매년 1월, 국민연금 기준소득월액 상·하한은 매년 7월에 개정되므로 두 기준을 별도의 기간 표로 나누어 두고, 계산기가 오늘 날짜에 해당하는 기준을 자동으로 선택합니다.",
              "제도가 개정되면 공식 기관 자료를 확인해 새 기간을 추가하고, 검증일을 갱신한 뒤 관련 도구와 아티클을 함께 수정합니다. 과거 기간의 값은 지우지 않고 남겨 둡니다. 지난 시점 기준으로 확인해야 하는 경우가 있기 때문입니다.",
            ],
          },
          {
            heading: "오류 제보와 수정 정책",
            body: [
              "**오류 제보:** 계산 결과가 이상하거나 설명이 사실과 다르다면 아래 이메일 또는 [GitHub 이슈](https://github.com/joyfive/kitfolio/issues)로 알려주세요. 어떤 도구에서 어떤 값을 넣었을 때 어떤 결과가 나왔는지 함께 적어주시면 재현이 빨라집니다.",
              "**수정 정책:** 계산 오류나 사실 오류는 확인되는 대로 우선 수정합니다. 내용이 실질적으로 바뀐 아티클에는 수정일을, 기준 데이터가 바뀐 도구에는 새 검증일을 표시해 언제 무엇이 달라졌는지 확인할 수 있게 합니다. 오탈자나 표현 다듬기처럼 내용에 영향이 없는 변경은 별도로 표시하지 않습니다.",
              "**도구 중단:** 도구를 없애야 할 경우에는 URL을 그대로 두고 대체 도구로 연결하며, 기존 링크가 끊기지 않도록 합니다.",
            ],
          },
        ],
        effectiveLabel: "최종 업데이트",
        contactLabel: "문의 이메일",
      },
      en: {
        title: "About Kitfolio",
        intro:
          "Kitfolio is a collection of browser-based tools that help PMs, designers, developers, marketers, job seekers, office workers, and small business owners quickly solve the small, repetitive problems they hit during the workday.",
        sections: [
          {
            heading: "What the site does",
            body: [
              "Kitfolio gathers small tools: calculators, generators, converters, formatters, and utilities: that you need often but would rather not hunt for each time. It covers repetitive tasks across different work situations: counting characters, formatting JSON, calculating take-home pay, working out growth and ad metrics, generating QR codes, merging PDFs.",
              "Each tool has one clear purpose and is ready the moment you open the page, with no heavy software to install and no account to create.",
            ],
          },
          {
            heading: "How it works (your input never leaves your browser)",
            body: [
              "Every Kitfolio tool runs inside your browser, not on a server. The text, numbers, and files you enter are never uploaded to Kitfolio's servers: all calculation and conversion happens on your device.",
              "There is no sign-up or login, and we do not directly collect personal information such as names or email addresses. The site does use third-party services for analytics, advertising and web fonts, and those may process connection information or cookies separately. In other words, what you enter into a tool is never transmitted, but that does not mean no network communication happens while you use the site. The Privacy Policy sets out exactly which is which.",
            ],
          },
          {
            heading: "Why we build it",
            body: [
              "Good tools remove small frictions and protect the flow of your day. Kitfolio's goal is not to publish a lot of content, but to keep adding practical tools that solve recurring work problems for free, fast, and privately.",
              `Kitfolio is planned and run by ${LEGAL_OPERATOR.en.name}, prioritizing tools that were genuinely needed in real work. Tool suggestions and feedback are always welcome: please reach out via the Contact page.`,
            ],
          },
          {
            heading: "Who runs Kitfolio",
            body: [
              `Kitfolio is planned, built, operated and written by **${LEGAL_OPERATOR.en.name}**. There are no outside contributors and no syndicated or auto-generated content, so responsibility for every tool and every article on the site rests with the operator.`,
              "The source code is public in the [GitHub repository](https://github.com/joyfive/kitfolio), so you can check exactly how each tool calculates. Questions go to the email address below and are answered directly.",
            ],
          },
          {
            heading: "How tools are built and verified",
            body: [
              "**Only tools we would use ourselves.** Search volume alone is not a reason to add a tool; problems actually hit repeatedly in real work come first.",
              "**Calculation logic is separated from the UI and tested.** Where an official standard exists, as with Korean take-home pay, the rate and policy data lives in its own module and each component of the calculation is checked against its official formula by automated tests. The benchmark is the formula published by the responsible authority, not matching totals with another calculator site.",
              "**Tools that depend on external standards show their sources and verification date.** Anything built on tax rates, insurance rates or platform policies states which point in time it reflects and when it was last checked against official material. Only primary sources from government bodies and public institutions are used: never personal blogs or third-party calculators.",
              "**Limitations are published alongside the tool.** Each tool page states what it cannot handle and the conditions under which its results diverge, so an estimate is not mistaken for a confirmed figure.",
            ],
          },
          {
            heading: "How time-sensitive tools are kept current",
            body: [
              "Data that changes by effective date, such as insurance and tax rates, is not filed under a single year but managed as **effective periods with a start and end date**. Korea's four major insurance rates change every January while the National Pension income ceiling and floor change every July, so the two live in separate period tables and the calculator picks whichever rules apply to today's date.",
              "When a rule changes, the official source is checked, a new period is added, the verification date is updated, and the related tools and articles are revised together. Past periods are kept rather than deleted, because there are times you need to check a figure as it stood on an earlier date.",
            ],
          },
          {
            heading: "Reporting errors, and how corrections are handled",
            body: [
              "**Reporting an error:** if a result looks wrong or an explanation does not match the facts, email the address below or open a [GitHub issue](https://github.com/joyfive/kitfolio/issues). Including which tool, which inputs and what result you saw makes it much faster to reproduce.",
              "**Correction policy:** calculation errors and factual errors are fixed as soon as they are confirmed. Articles whose substance changed carry an updated date, and tools whose underlying data changed carry a new verification date, so you can see when something changed. Typo fixes and wording changes that do not affect meaning are not separately marked.",
              "**Retiring a tool:** if a tool has to be removed, its URL stays in place and points to a replacement so existing links do not break.",
            ],
          },
        ],
        effectiveLabel: "Last updated",
        contactLabel: "Contact email",
      },
    },
  },
  contact: {
    navLabel: { ko: "문의", en: "Contact" },
    seo: {
      ko: {
        title: "문의하기 | Kitfolio",
        description:
          "Kitfolio에 대한 도구 제안, 오류 신고, 제휴·광고 문의를 이메일로 보내주세요. 운영자가 직접 확인합니다.",
      },
      en: {
        title: "Contact | Kitfolio",
        description:
          "Send tool suggestions, bug reports, or partnership and advertising inquiries about Kitfolio by email. Messages are read by the maker directly.",
      },
    },
    doc: {
      ko: {
        title: "문의하기",
        intro:
          "Kitfolio에 대한 의견·제안·오류 신고·제휴 문의를 환영합니다. 아래 이메일로 연락해 주시면 운영자가 직접 확인하고 답변드립니다.",
        sections: [
          {
            heading: "이런 내용을 보내주세요",
            body: [
              "**도구 제안:** 자주 반복하는 업무가 있는데 마땅한 도구가 없다면 알려주세요. 실제 필요가 도구 추가의 우선순위 기준입니다.",
              "**오류·개선 신고:** 계산 결과가 이상하거나 화면이 깨지는 등 문제를 발견하면 어떤 도구에서 어떤 상황이었는지 함께 알려주시면 빠르게 확인합니다.",
              "**제휴·광고 문의:** 협업이나 광고 관련 문의도 아래 이메일로 받습니다.",
            ],
          },
          {
            heading: "연락 방법",
            body: [
              "아래 이메일 주소로 메시지를 보내주세요. 소규모로 운영하는 서비스라 답변에 다소 시간이 걸릴 수 있는 점 양해 부탁드립니다.",
            ],
          },
        ],
        effectiveLabel: "최종 업데이트",
        contactLabel: "문의 이메일",
      },
      en: {
        title: "Contact",
        intro:
          "We welcome your feedback, suggestions, bug reports, and partnership inquiries about Kitfolio. Email us at the address below and the maker will read and reply personally.",
        sections: [
          {
            heading: "What to send",
            body: [
              "**Tool suggestions:** If you have a repetitive task with no good tool for it, let us know. Real need is how tool additions get prioritized.",
              "**Bugs and improvements:** If a result looks wrong or something breaks, tell us which tool and what you were doing so we can check it quickly.",
              "**Partnership and advertising:** Collaboration and advertising inquiries are welcome at the same address.",
            ],
          },
          {
            heading: "How to reach us",
            body: [
              "Please send a message to the email address below. As a small operation, replies may take a little time: thank you for your patience.",
            ],
          },
        ],
        effectiveLabel: "Last updated",
        contactLabel: "Contact email",
      },
    },
  },
  "privacy-policy": {
    navLabel: { ko: "개인정보처리방침", en: "Privacy Policy" },
    seo: {
      ko: {
        title: "개인정보처리방침 | Kitfolio",
        description:
          "Kitfolio는 회원가입·로그인이 없으며 도구에 입력한 데이터는 서버로 전송되지 않고 브라우저 안에서만 처리됩니다. 사이트 운영을 위해 이용하는 Google Analytics·Google AdSense 등 제3자 서비스와 쿠키 처리 안내를 확인하세요.",
      },
      en: {
        title: "Privacy Policy | Kitfolio",
        description:
          "Kitfolio requires no account and never transmits the data you enter to any server: everything is processed in your browser. Learn which third-party services (Google Analytics, Google AdSense) the site uses and how cookies are handled.",
      },
    },
    doc: {
      ko: {
        title: "개인정보처리방침",
        intro:
          `Kitfolio(이하 '본 사이트')는 ${LEGAL_OPERATOR.ko.name}가 운영합니다. 본 사이트는 이용자의 개인정보를 중요시하며 「개인정보 보호법」 등 관련 법령을 준수합니다. 본 방침은 이용자의 개인정보가 어떤 용도와 방식으로 처리되며, 보호를 위해 어떤 조치가 취해지는지 안내합니다.`,
        sections: [
          {
            heading: "1. 도구에 입력한 내용은 서버로 전송되지 않습니다",
            body: [
              "본 사이트는 모던 지식 노동자를 위한, 브라우저에서 단독으로 동작하는 웹 도구 모음 서비스입니다.",
              "**비회원제 운영:** 본 사이트는 회원가입이나 로그인 절차가 없으며, 이용자의 이름·이메일·연락처 등 개인정보를 직접 수집하지 않습니다.",
              "**입력 데이터 비전송:** 이용자가 각 도구에 입력하는 텍스트·숫자·파일(PDF·이미지 포함)은 이용자의 브라우저 안에서만 처리되며, 본 사이트의 서버나 외부 데이터베이스로 전송되지 않습니다. 브라우저를 닫거나 새로고침하면 입력된 데이터는 즉시 소멸합니다.",
              "**이 원칙의 범위:** 위 내용은 '이용자가 도구에 입력한 콘텐츠'에 한정됩니다. 사이트를 여는 것 자체는 웹 페이지를 내려받는 통신이므로, 아래 2항에 안내한 제3자 서비스가 접속 정보를 별도로 처리할 수 있습니다. 즉 **도구에 넣은 내용은 전송되지 않지만, 사이트 이용 과정에서 아무런 네트워크 통신도 일어나지 않는다는 뜻은 아닙니다.**",
            ],
          },
          {
            heading: "2. 사이트 운영을 위해 이용하는 제3자 서비스",
            body: [
              "본 사이트는 서비스 운영과 개선을 위해 아래의 외부 서비스를 이용하며, 이들 서비스는 각자의 개인정보처리방침에 따라 이용자의 브라우저·접속 정보 또는 쿠키를 처리할 수 있습니다.",
              "**Google Analytics 4 (방문 통계):** 어떤 도구가 얼마나 이용되는지 파악하기 위해 방문 페이지, 대략적인 접속 지역, 기기·브라우저 종류 등 익명의 이용 통계를 수집합니다. 도구에 입력한 내용은 전송되지 않습니다. 수집을 원치 않으면 [Google 애널리틱스 차단 브라우저 부가기능](https://tools.google.com/dlpage/gaoptout)을 설치할 수 있습니다.",
              "**Google AdSense (광고):** 본 사이트는 구글이 제공하는 광고를 게재합니다. 구글은 이용자가 본 사이트 또는 다른 웹사이트를 방문한 기록을 바탕으로 맞춤형 광고를 제공하기 위해 쿠키 및 광고 식별자를 사용할 수 있습니다. 맞춤형 광고를 원치 않으면 [Google 광고 설정](https://www.google.com/settings/ads)에서 차단할 수 있습니다.",
              "**웹 폰트 (Google Fonts · jsDelivr):** 화면 글꼴을 불러오기 위해 외부 CDN에 요청이 발생하며, 이 과정에서 해당 사업자에게 IP 주소 등 표준적인 접속 정보가 전달될 수 있습니다.",
              "**호스팅 (Vercel):** 사이트가 배포·제공되는 인프라로, 서비스 제공에 필요한 범위에서 접속 로그가 처리될 수 있습니다.",
              "본 사이트는 위에 명시한 것 외의 광고·제휴·트래킹 서비스를 사용하지 않습니다.",
            ],
          },
          {
            heading: "3. 쿠키 설정 및 거부 방법",
            body: [
              "이용자는 브라우저 설정을 통해 모든 쿠키의 저장을 거부하거나, 쿠키가 저장될 때마다 확인을 거치도록 설정할 수 있습니다. 쿠키 저장을 거부해도 본 사이트의 도구 기능은 정상적으로 동작합니다.",
              "각 서비스별 개인정보 처리에 관한 자세한 내용은 [Google 개인정보처리방침](https://policies.google.com/privacy)에서 확인할 수 있습니다.",
            ],
          },
          {
            heading: "4. 제3자 제공 및 위탁",
            body: [
              "본 사이트는 이용자의 개인정보를 직접 수집하지 않으므로 이를 제3자에게 제공하거나 판매하지 않습니다. 다만 위 2항에 명시된 서비스들이 각자의 방침에 따라 익명의 이용 통계 및 광고 데이터를 처리할 수 있습니다.",
            ],
          },
          {
            heading: "5. 개인정보 보호책임자 및 문의처",
            body: [
              `본 사이트는 ${LEGAL_OPERATOR.ko.name}가 운영하며, 개인정보 처리에 관한 업무를 총괄해서 책임지고 관련 불만 처리 및 피해 구제를 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.`,
              `**성명:** ${LEGAL_OPERATOR.ko.rep}`,
              `**직책:** ${LEGAL_OPERATOR.ko.repTitle}`,
              `**연락처:** ${LEGAL_EMAIL}`,
              "본 사이트 이용 중 발생하는 개인정보 보호 관련 문의는 위 이메일로 연락해 주시기 바랍니다.",
            ],
          },
        ],
        effectiveLabel: "시행일자",
        contactLabel: "문의 이메일",
      },
      en: {
        title: "Privacy Policy",
        intro:
          `Kitfolio ("we", "our", or "the Website") is operated by ${LEGAL_OPERATOR.en.name}. We value the privacy of our users and comply with applicable data protection laws. This Privacy Policy explains how we handle information when you visit and use our website.`,
        sections: [
          {
            heading: "1. What You Enter Into the Tools Is Never Transmitted",
            body: [
              "Kitfolio is a collection of browser-based web tools for modern knowledge workers that operates entirely on the client side.",
              "**No Registration Required:** There is no account or login, and we do not directly collect personal information such as names, email addresses, or contact details.",
              "**Input Data Stays Local:** The text, numbers, and files (including PDFs and images) you enter into any tool are processed entirely within your browser. They are never transmitted to our servers or to any external database. Closing or refreshing the browser clears them immediately.",
              "**Scope of this principle:** the statement above applies to *the content you enter into the tools*. Loading the site is itself a network request, and the third-party services listed in section 2 may process connection information separately. In other words, **what you put into a tool is not transmitted, but that does not mean no network communication occurs while you use the site.**",
            ],
          },
          {
            heading: "2. Third-Party Services Used to Operate the Site",
            body: [
              "We use the following external services to operate and improve the site. Each may process browser or connection information, or cookies, under its own privacy policy.",
              "**Google Analytics 4 (usage statistics):** collects anonymous usage data such as pages visited, approximate region, and device and browser type, so we can see which tools are actually used. Content entered into the tools is never sent. To opt out, you can install the [Google Analytics Opt-out Browser Add-on](https://tools.google.com/dlpage/gaoptout).",
              "**Google AdSense (advertising):** this site displays advertisements served by Google. Google may use cookies and advertising identifiers to serve personalized ads based on your prior visits to this or other websites. You can opt out of personalized advertising on the [Google Ads Settings](https://www.google.com/settings/ads) page.",
              "**Web fonts (Google Fonts and jsDelivr):** loading the site's typefaces makes requests to external CDNs, which may receive standard connection information such as your IP address.",
              "**Hosting (Vercel):** the infrastructure the site is deployed on, which may process access logs as required to deliver the service.",
              "We do not use any advertising, affiliate, or tracking service other than those listed above.",
            ],
          },
          {
            heading: "3. Managing and Refusing Cookies",
            body: [
              "You can refuse all cookies through your browser settings, or configure your browser to prompt before storing one. Refusing cookies does not prevent the site's tools from working normally.",
              "For details on how each service handles data, see the [Google Privacy Policy](https://policies.google.com/privacy).",
            ],
          },
          {
            heading: "4. Third-Party Data Sharing",
            body: [
              "Because we do not directly collect personal data, we do not share or sell any personal information to third parties. The services named in section 2 may process anonymous usage and advertising data under their own policies.",
            ],
          },
          {
            heading: "5. Privacy Officer and Contact",
            body: [
              `The Website is operated by ${LEGAL_OPERATOR.en.name}, which oversees all personal data processing and designates the privacy officer below to handle related complaints and remedies.`,
              `**Name:** ${LEGAL_OPERATOR.en.rep}`,
              `**Title:** ${LEGAL_OPERATOR.en.repTitle}`,
              `**Contact:** ${LEGAL_EMAIL}`,
              "If you have any questions or concerns regarding this Privacy Policy, please contact us at the email address above.",
            ],
          },
        ],
        effectiveLabel: "Effective date",
        contactLabel: "Contact email",
      },
    },
  },
  "terms-of-service": {
    navLabel: { ko: "이용약관", en: "Terms of Service" },
    seo: {
      ko: {
        title: "이용약관 | Kitfolio",
        description:
          "Kitfolio가 제공하는 무료 웹 도구 서비스의 이용 조건, 이용자의 의무, 계산·처리 결과에 대한 면책 조항과 지적재산권 안내입니다.",
      },
      en: {
        title: "Terms of Service | Kitfolio",
        description:
          "The terms of use for Kitfolio's free web tools: service provision, user obligations, disclaimer and limitation of liability for tool outputs, and intellectual property.",
      },
    },
    doc: {
      ko: {
        title: "이용약관",
        intro:
          `본 약관은 ${LEGAL_OPERATOR.ko.name}(이하 '운영자')가 운영하는 Kitfolio(이하 '본 사이트')가 제공하는 모든 웹 도구 및 서비스(이하 '서비스')의 이용 조건과 절차, 이용자와 본 사이트의 권리·의무 및 책임 사항을 규정합니다.`,
        sections: [
          {
            heading: "제1조 (서비스의 제공 및 변경)",
            body: [
              "본 사이트는 모던 지식 노동자를 위한 브라우저 기반 유틸리티 도구를 무료로 제공합니다.",
              "본 서비스는 전적으로 이용자의 웹 브라우저에서 동작하며, 별도의 회원가입 없이 누구나 자유롭게 이용할 수 있습니다.",
              "서비스의 내용·디자인·도구의 종류는 성능 개선 및 최적화를 위해 사전 고지 없이 변경되거나 중단될 수 있습니다.",
            ],
          },
          {
            heading: "제2조 (이용자의 의무 및 데이터 보안)",
            body: [
              "이용자는 본 사이트가 제공하는 도구를 합법적인 목적 및 용도로만 이용해야 합니다.",
              "본 사이트의 모든 도구는 입력된 데이터를 서버로 전송하지 않고 브라우저 내부에서만 처리하므로, 입력 데이터의 유실 방지 및 백업 책임은 전적으로 이용자에게 있습니다.",
            ],
          },
          {
            heading: "제3조 (면책 조항 · 책임의 제한)",
            body: [
              "**계산 및 처리 결과의 정확성:** 본 사이트가 제공하는 모든 도구(성장률 계산기, 실수령액 계산기, 마케팅 지표 계산기 등)의 결과 수치와 데이터 처리는 범용적인 수식·알고리즘을 기반으로 동작합니다. 본 사이트는 계산 결과의 완전성·정확성·최신성 및 특정 목적에의 적합성을 보장하지 않습니다.",
              "**책임의 제한:** 이용자가 본 사이트의 계산 결과나 도구 출력값을 신뢰하여 발생한 어떠한 재정적·법적·업무적 손실이나 손해(업무 중단, 세금 계산 착오, 시스템 오류 등 포함)에 대해서도 본 사이트는 법적 책임을 지지 않습니다. 모든 최종 의사결정과 검증의 책임은 이용자 본인에게 있습니다.",
            ],
          },
          {
            heading: "제4조 (지적재산권)",
            body: [
              `본 사이트의 디자인·로고·소스코드 구조 및 콘텐츠 레지스트리에 대한 지적재산권은 운영 주체인 ${LEGAL_OPERATOR.ko.name}에 있습니다.`,
              "이용자는 본 사이트의 서비스를 복제·수정·배포하여 상업적으로 재판매하는 행위를 할 수 없습니다.",
            ],
          },
          {
            heading: "제5조 (준거법)",
            body: [
              "본 서비스 이용과 관련하여 분쟁이 발생할 경우 대한민국 관련 법령에 따릅니다.",
            ],
          },
        ],
        effectiveLabel: "시행일자",
        contactLabel: "문의 이메일",
      },
      en: {
        title: "Terms of Service",
        intro:
          `These Terms of Service ("Terms") govern the use of the web tools and services (the "Service") provided by Kitfolio ("we", "our", or "the Website"), operated by ${LEGAL_OPERATOR.en.name}, defining the rights, obligations, and responsibilities of both users and the Website.`,
        sections: [
          {
            heading: "Article 1 (Provision and Modification of Services)",
            body: [
              "We provide free browser-based utility tools for modern knowledge workers.",
              "The Service runs entirely within the user's web browser and can be used freely without any account registration.",
              "The content, design, and types of tools provided may be modified, updated, or discontinued at any time without prior notice for optimization purposes.",
            ],
          },
          {
            heading: "Article 2 (User Obligations and Data Security)",
            body: [
              "Users agree to use the Service only for lawful purposes.",
              "Because all data is processed strictly client-side and never saved on our servers, users are solely responsible for managing and backing up their own data.",
            ],
          },
          {
            heading: "Article 3 (Disclaimer and Limitation of Liability)",
            body: [
              "**Accuracy of Outputs:** The calculations and processing provided by our tools (e.g., growth rate calculators, net pay calculator, marketing metric calculators) are based on generalized formulas and algorithms. We do not guarantee the absolute accuracy, completeness, timeliness, or fitness for a particular purpose of any output.",
              "**Limitation of Liability:** In no event shall Kitfolio be liable for any direct, indirect, incidental, or consequential damages (including, but not limited to, financial losses, business interruptions, tax miscalculations, or system errors) arising from the use of, or inability to use, the tools. Users are strictly advised to independently verify any critical output.",
            ],
          },
          {
            heading: "Article 4 (Intellectual Property)",
            body: [
              `All intellectual property rights concerning the Website's design, logo, source code structure, and content registry belong to ${LEGAL_OPERATOR.en.name}, the operator of Kitfolio.`,
              "Users are prohibited from copying, modifying, or distributing the Service for commercial resale.",
            ],
          },
          {
            heading: "Article 5 (Governing Law)",
            body: [
              "Any disputes arising from or relating to the use of the Service shall be governed by and construed in accordance with the laws of the Republic of Korea.",
            ],
          },
        ],
        effectiveLabel: "Effective date",
        contactLabel: "Contact email",
      },
    },
  },
};

export function buildLegalMetadata(slug: LegalSlug, lang: Lang): Metadata {
  const s = LEGAL[slug].seo[lang];
  const path = "/" + slug;
  const koUrl = path;
  const enUrl = "/en" + path;
  const url = lang === "ko" ? koUrl : enUrl;
  return {
    title: { absolute: s.title },
    description: s.description,
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

/* ============================================================
   ⑤ TOOLS: 도구 레지스트리
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
    indexable: true,
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
        guide: [
          {
            heading: "JSON 포매터는 언제 쓰나요?",
            body: [
              "JSON은 API가 데이터를 주고받는 표준 형식이지만, 실제로 마주치는 JSON은 한 줄로 길게 압축돼 있거나 들여쓰기가 뒤죽박죽인 경우가 많습니다. 이런 문자열은 눈으로 구조를 파악하기 어렵고, 어디서 중괄호가 닫히는지, 어떤 키가 어떤 값에 속하는지 한눈에 들어오지 않습니다. JSON 포매터는 이렇게 뭉친 문자열을 계층에 맞춰 들여쓰고 키·값·문자열·숫자를 색으로 구분해, 데이터의 형태를 즉시 읽을 수 있게 정리합니다.",
              "가장 흔한 사용 상황은 API 응답 확인입니다. 브라우저 개발자 도구나 서버 로그에서 복사한 응답을 붙여넣으면 어떤 필드가 비어 있는지, 배열에 항목이 몇 개인지, 중첩된 객체가 어떻게 구성됐는지 바로 확인할 수 있습니다. 설정 파일(package.json, tsconfig.json 등)을 손보기 전 구조를 파악하거나, 동료가 채팅으로 보낸 한 줄짜리 JSON을 읽기 좋게 펼칠 때도 유용합니다.",
            ],
          },
          {
            heading: "포맷팅과 유효성 검사는 다릅니다",
            body: [
              "이 도구는 두 가지 일을 동시에 합니다. 하나는 보기 좋게 정리하는 포맷팅이고, 다른 하나는 문법이 올바른지 확인하는 유효성 검사입니다. JSON은 마지막 항목 뒤에 쉼표를 붙이거나(trailing comma), 키를 큰따옴표 없이 쓰거나, 작은따옴표로 문자열을 감싸면 규칙 위반입니다. 사람 눈에는 사소해 보여도 파서는 이런 실수에서 멈춥니다.",
              "유효하지 않은 JSON을 붙여넣으면 어느 줄, 어느 열에서 문제가 생겼는지 짚어주므로, 긴 페이로드에서 오타 하나를 찾느라 눈으로 훑을 필요가 없습니다. 반대로 데이터 용량을 줄여야 할 때는 압축(minify) 기능으로 모든 공백과 줄바꿈을 제거해 한 줄로 만들 수 있습니다. 코드에 JSON을 인라인으로 넣거나 네트워크 전송량을 아껴야 할 때 쓰입니다.",
            ],
          },
          {
            heading: "안심하고 쓰는 이유",
            body: [
              "JSON에는 종종 토큰, 개인정보, 내부 식별자 같은 민감한 값이 담깁니다. 온라인 포매터 중에는 입력을 서버로 보내 처리하는 곳도 있어, 무심코 붙여넣은 데이터가 외부에 남을 수 있습니다. Kitfolio의 JSON 포매터는 파싱·포맷·검증·압축을 전부 브라우저 안에서 처리하며, 입력한 내용을 어떤 서버로도 전송하지 않습니다.",
              "따라서 사내 API 응답이나 인증 토큰이 포함된 데이터도 걱정 없이 붙여넣을 수 있고, 네트워크가 없는 환경에서도 동작합니다. 설치나 로그인 없이 페이지를 여는 순간 바로 쓸 수 있다는 점도 반복적인 디버깅 작업의 마찰을 크게 줄여줍니다.",
            ],
          },
        ],
              examples: [
          {
            title: "로그에서 복사한 한 줄짜리 API 응답 읽기",
            input: "{\"id\":1042,\"user\":{\"name\":\"김서연\",\"roles\":[\"admin\",\"editor\"]},\"active\":true}",
            result: "2단 들여쓰기로 펼쳐지고 user 객체와 roles 배열이 각각 접을 수 있는 블록으로 표시됩니다.",
            note: "터미널 로그나 브라우저 네트워크 탭에서 복사한 응답은 개행이 없어 눈으로 구조를 파악하기 어렵습니다. 붙여넣기만 하면 어떤 필드가 어느 깊이에 있는지 바로 보입니다.",
          },
          {
            title: "파싱이 실패하는데 원인을 못 찾을 때",
            input: "{\"name\":\"kitfolio\",\"tags\":[\"work\",\"tools\",]}",
            result: "배열 마지막 쉼표 위치를 가리키는 오류 메시지가 표시됩니다.",
            note: "마지막 요소 뒤의 쉼표(trailing comma)는 JavaScript 객체 리터럴에서는 허용되지만 JSON 표준에서는 오류입니다. 손으로 편집한 설정 파일에서 가장 자주 나오는 실수라, 오류 위치만 알아도 대부분 바로 고칠 수 있습니다.",
          },
          {
            title: "커밋 전 설정 파일 들여쓰기 통일",
            input: "탭과 공백이 섞여 들여쓰기가 어긋난 package.json 조각",
            result: "전체가 동일한 들여쓰기 폭으로 다시 출력되고, 키 순서는 원본 그대로 유지됩니다.",
            note: "포매터는 값이나 키 순서를 바꾸지 않으므로 diff에는 공백 변경만 남습니다.",
          },
        ],
        limitations: [
          "JSON5·JSONC 문법은 표준 JSON이 아니므로 오류로 처리됩니다. 주석(//, /* */), 따옴표 없는 키, 작은따옴표 문자열이 들어간 tsconfig.json 같은 파일은 해당 부분을 지운 뒤 넣어야 합니다.",
          "숫자는 JavaScript 표준대로 배정밀도 부동소수점으로 해석됩니다. 2^53(약 9,007조)을 넘는 정수 ID를 다룬다면 표시된 값이 원본과 다를 수 있으니 원문 문자열을 함께 확인하세요.",
          "전체 문서를 브라우저 메모리에서 한 번에 파싱합니다. 수십 MB 이상의 대용량 파일은 탭이 느려질 수 있어 필요한 부분만 잘라 넣는 편이 안전합니다.",
          "포맷팅과 유효성 검사만 합니다. 키 정렬, JSONPath 질의, 스키마 검증, 값 변환 같은 기능은 제공하지 않습니다.",
        ],
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
          how: "Paste JSON into the left pane and it is parsed instantly in your browser: the formatted result appears on the right, errors are pinpointed by line and column, and you can switch indentation or minify to one line.",
          why: "It runs entirely in your browser with no upload, so sensitive data stays safe, and with no install or sign-up, debugging gets faster.",
        },
        guide: [
          {
            heading: "When do you use a JSON formatter?",
            body: [
              "JSON is the standard format APIs use to exchange data, but the JSON you actually encounter is often minified onto a single long line or indented inconsistently. Strings like that are hard to read: it's not obvious where a brace closes, which key owns which value, or how deeply objects are nested. A JSON formatter re-indents the string along its hierarchy and colors keys, values, strings, and numbers differently so the shape of the data becomes readable at a glance.",
              "The most common situation is inspecting an API response. Paste a response copied from your browser's dev tools or a server log and you can immediately see which fields are empty, how many items an array holds, and how nested objects are structured. It's just as useful for understanding a config file (package.json, tsconfig.json) before editing it, or for expanding a one-line JSON blob a teammate dropped into chat.",
            ],
          },
          {
            heading: "Formatting and validation are different",
            body: [
              "This tool does two jobs at once: it pretty-prints the data, and it checks that the syntax is valid. JSON forbids a trailing comma after the last item, requires keys to be wrapped in double quotes, and rejects strings wrapped in single quotes. These look trivial to a human, but a parser stops dead on any of them.",
              "When you paste invalid JSON, the tool points to the exact line and column where the problem is, so you don't have to scan a long payload hunting for a stray character. When you need to shrink the data instead, the minify function strips every space and line break into a single line: handy for inlining JSON in code or trimming what you send over the network.",
            ],
          },
          {
            heading: "Why it's safe to use",
            body: [
              "JSON frequently carries sensitive values: tokens, personal data, internal identifiers. Some online formatters send your input to a server to process it, which means data you pasted without thinking can end up stored elsewhere. Kitfolio's JSON formatter parses, formats, validates, and minifies entirely in your browser and never transmits your input to any server.",
              "That means you can paste internal API responses or data containing auth tokens without worry, and it works even with no network connection. Because there's nothing to install and no login, the tool is ready the moment the page opens: which removes a lot of friction from repetitive debugging.",
            ],
          },
        ],
              examples: [
          {
            title: "Reading a one-line API response copied from a log",
            input: "{\"id\":1042,\"user\":{\"name\":\"Seoyeon Kim\",\"roles\":[\"admin\",\"editor\"]},\"active\":true}",
            result: "Expanded with two-space indentation; the user object and roles array each become a collapsible block.",
            note: "Responses copied from a terminal log or the browser network tab have no line breaks, so the shape is hard to see. Pasting it shows immediately which field sits at which depth.",
          },
          {
            title: "Parsing fails and you can't find the cause",
            input: "{\"name\":\"kitfolio\",\"tags\":[\"work\",\"tools\",]}",
            result: "An error message pointing at the position of the trailing comma in the array.",
            note: "A trailing comma after the last element is legal in a JavaScript object literal but invalid in JSON. It is the most common mistake in hand-edited config files, and knowing the position is usually enough to fix it.",
          },
          {
            title: "Normalizing indentation before a commit",
            input: "A package.json fragment with mixed tabs and spaces",
            result: "Re-emitted with a single consistent indent width, key order untouched.",
            note: "The formatter never reorders keys or rewrites values, so the diff contains whitespace changes only.",
          },
        ],
        limitations: [
          "JSON5 and JSONC are not standard JSON and are reported as errors. Files like tsconfig.json that contain comments (// or /* */), unquoted keys, or single-quoted strings need those parts removed first.",
          "Numbers are parsed as IEEE-754 doubles, exactly as JavaScript does. If you work with integer IDs above 2^53 (about 9.0 quadrillion), the displayed value may differ from the original, so check the raw string as well.",
          "The whole document is parsed in browser memory at once. Files of tens of megabytes or more can make the tab sluggish, so it is safer to paste only the section you need.",
          "It formats and validates only. There is no key sorting, JSONPath querying, schema validation, or value transformation.",
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "입력한 JSON이 서버로 전송되나요?",
          answer:
            "아니요. 포맷팅·검증·압축은 전부 브라우저 안에서 JavaScript로 처리됩니다. 붙여넣은 JSON은 서버로 전송되거나 저장되지 않으므로 민감한 데이터도 안심하고 사용할 수 있습니다.",
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
            "No. Formatting, validation and minification all happen in your browser with JavaScript. The JSON you paste is never uploaded or stored, so it is safe to use with sensitive data.",
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
    indexable: true,
    badge: "IDE / Editor",
    name: { ko: "슬랙 타임스탬프 변환기", en: "Slack Timestamp Converter" },
    relatedTools: ["json-formatter", "character-counter", "tailwind-palette-generator"],
    seo: {
      ko: {
        title: "슬랙 타임스탬프 변환기 | Unix 시간·날짜 변환기",
        description:
          "Slack에서 쓰는 Unix 타임스탬프를 읽기 쉬운 날짜·시간으로 변환합니다. UTC·로컬 타임존·상대 시간 표시와 Slack date 구문 생성을 지원합니다.",
        keywords: ["슬랙 타임스탬프", "유닉스 타임스탬프", "타임스탬프 변환", "슬랙 날짜", "unix time 변환"],
      },
      en: {
        title: "Slack Timestamp Converter | Convert Unix Time to Date",
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
        guide: [
          {
            heading: "Slack이 Unix 타임스탬프를 쓰는 이유",
            body: [
              "Slack API와 웹훅 응답의 `ts` 필드는 사람이 읽는 날짜가 아니라 1970년 1월 1일 자정(UTC)부터 흐른 초를 나타내는 Unix 타임스탬프입니다. 예를 들어 메시지 객체의 `\"ts\": \"1718071200.123456\"`처럼 소수부에 마이크로초까지 붙어 나오기도 합니다. 서버·로그·API 사이에서는 타임존 표기 없이 값을 주고받을 수 있어 이 형식을 쓰지만, 로그를 눈으로 확인하거나 디버깅할 때는 바로 읽을 수가 없습니다.",
              "이 변환기는 이런 원시 타임스탬프를 붙여넣으면 UTC·로컬 시간·상대 시간(예: 3시간 전)으로 동시에 보여줘, 로그에 찍힌 시각이 실제로 언제인지 바로 확인할 수 있게 합니다.",
            ],
          },
          {
            heading: "Slack date 구문으로 타임존 문제를 없애는 법",
            body: [
              "여러 시간대에 흩어진 팀에 회의나 배포 시각을 공지할 때, 고정된 텍스트로 \"오후 3시\"라고 쓰면 어느 타임존 기준인지 매번 오해가 생깁니다. Slack의 `<!date^...>` 구문은 다릅니다: 메시지 안에 Unix 타임스탬프와 표시 형식을 심어두면, Slack이 그 메시지를 읽는 사람의 로컬 타임존에 맞춰 자동으로 다시 표시합니다.",
              "이 도구는 같은 시각을 `{date_short_pretty} at {time}`, `{date_long_pretty} at {time_secs}`처럼 자주 쓰는 형식별로 미리 만들어 보여주므로, 원하는 형식을 그대로 복사해 메시지에 붙여넣기만 하면 됩니다.",
            ],
          },
          {
            heading: "입력 형식을 자동으로 구분합니다",
            body: [
              "Unix 초·밀리초·마이크로초 타임스탬프는 자릿수만 다를 뿐 겉보기엔 비슷한 숫자라 헷갈리기 쉽습니다(10자리 vs 13자리 vs 16자리). 이 도구는 입력값의 자릿수를 보고 세 형식을 자동으로 구분하며, ISO 8601 같은 일반 날짜·시간 문자열이나 이미 만들어진 `<!date^...>` Slack 구문을 붙여넣어도 그대로 인식합니다.",
              "그래서 Slack 메시지에 이미 박혀 있는 구문을 역으로 붙여넣어 원래 시각이 언제였는지 확인하는 용도로도 쓸 수 있습니다.",
            ],
          },
        ],
        examples: [
          {
            title: "Slack API 응답의 ts 필드 해석",
            input: "1718071200.123456 (Slack 메시지 객체의 ts 필드)",
            result: "2024-06-11 06:00:00 UTC · 소수부는 마이크로초",
            note: "Slack API 응답을 로그로 찍어보면 ts 필드가 이런 형식으로 나옵니다. 소수점 아래 자리는 초 미만 정밀도이며, 그대로 붙여넣으면 자동으로 인식됩니다.",
          },
          {
            title: "글로벌 팀 공지에 쓸 Slack 구문 만들기",
            input: "2026-06-11T15:00:00 (한국 시간 기준 회의 시각)",
            result: "<!date^1749621600^{date_short_pretty} at {time}|Jun 11, 2026 3:00 PM> 형식의 구문",
            note: "이 구문을 메시지에 붙여넣으면, 뉴욕에 있는 동료에게는 뉴욕 시간으로, 서울에 있는 동료에게는 서울 시간으로 각자 다르게 표시됩니다.",
          },
          {
            title: "초 단위와 밀리초 단위 타임스탬프 구분하기",
            input: "1718071200 (10자리, 초) vs 1718071200000 (13자리, 밀리초)",
            result: "둘 다 같은 시각(2024-06-11 06:00:00 UTC)으로 변환",
            note: "JavaScript의 Date.now()는 밀리초를, 대부분의 서버 로그는 초를 씁니다. 자릿수를 세지 않아도 도구가 자동으로 구분해 같은 결과를 냅니다.",
          },
        ],
        limitations: [
          "Slack 구문 미리보기는 근사치입니다. 실제 렌더링 결과(요일 표기, 12/24시간제 등)는 메시지를 읽는 사람의 Slack 클라이언트 언어·지역 설정에 따라 달라지며, 최종 확인은 실제 Slack에서 해야 합니다.",
          "초·밀리초·마이크로초 판별은 입력값의 자릿수를 보는 휴리스틱입니다. 극단적으로 과거이거나 미래인 날짜의 초 단위 타임스탬프는 밀리초로 잘못 판별될 수 있습니다.",
          "상대 시간(예: 3시간 전)은 이 페이지를 보는 기기의 시스템 시계를 기준으로 계산됩니다. 기기 시간이 실제 시간과 어긋나 있으면 상대 시간도 함께 어긋납니다.",
          "로컬 시간은 브라우저에 설정된 타임존만 보여줍니다. UTC 외에 제3의 타임존을 지정해 미리 보는 기능은 제공하지 않습니다.",
        ],
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
        guide: [
          {
            heading: "Why Slack uses Unix timestamps",
            body: [
              "The `ts` field in Slack API and webhook responses isn't a human-readable date: it's a Unix timestamp, the number of seconds since midnight UTC on January 1, 1970. A message object might show `\"ts\": \"1718071200.123456\"`, with microsecond precision after the decimal point. Servers, logs, and APIs pass this format around because it needs no timezone notation, but you can't read it at a glance when you're staring at a log or debugging.",
              "Paste a raw timestamp like that into this converter and it shows UTC, your local time, and relative time (like \"3 hours ago\") side by side, so you can immediately tell what a logged moment actually was.",
            ],
          },
          {
            heading: "Eliminating timezone confusion with Slack date syntax",
            body: [
              "When you announce a meeting or deploy time to a team spread across timezones, writing a fixed \"3 PM\" invites confusion about whose 3 PM you mean. Slack's `<!date^...>` syntax solves this differently: embed a Unix timestamp and a display format in the message, and Slack re-renders it in each reader's own local timezone automatically.",
              "This tool pre-builds the same instant in commonly used formats, like `{date_short_pretty} at {time}` and `{date_long_pretty} at {time_secs}`, so you can copy whichever one you need straight into your message.",
            ],
          },
          {
            heading: "It auto-detects the input format",
            body: [
              "Unix timestamps in seconds, milliseconds, and microseconds look like similar numbers at a glance and are easy to mix up (10 digits vs. 13 vs. 16). This tool reads the digit count and tells the three apart automatically, and it also recognizes plain date-time strings like ISO 8601 or an already-built `<!date^...>` Slack syntax pasted back in.",
              "That means you can paste a syntax already embedded in a Slack message to check exactly what moment it originally referred to.",
            ],
          },
        ],
        examples: [
          {
            title: "Reading the ts field from a Slack API response",
            input: "1718071200.123456 (the ts field of a Slack message object)",
            result: "2024-06-11 06:00:00 UTC, with sub-second precision",
            note: "Logging a Slack API response shows the ts field in this shape. The digits after the decimal are sub-second precision, and pasting the value as-is is recognized automatically.",
          },
          {
            title: "Building Slack syntax for a global team announcement",
            input: "2026-06-11T15:00:00 (a meeting time in Korea Standard Time)",
            result: "A syntax like <!date^1749621600^{date_short_pretty} at {time}|Jun 11, 2026 3:00 PM>",
            note: "Paste this into a message and a colleague in New York sees New York time while one in Seoul sees Seoul time, each rendered locally.",
          },
          {
            title: "Telling second and millisecond timestamps apart",
            input: "1718071200 (10 digits, seconds) vs. 1718071200000 (13 digits, milliseconds)",
            result: "Both convert to the same instant (2024-06-11 06:00:00 UTC)",
            note: "JavaScript's Date.now() returns milliseconds while most server logs use seconds. You don't have to count digits yourself; the tool tells them apart and lands on the same result.",
          },
        ],
        limitations: [
          "The Slack syntax preview is an approximation. The actual rendering (weekday format, 12- vs 24-hour clock, and so on) depends on each reader's Slack client language and locale settings, so verify the final look inside Slack itself.",
          "Detecting seconds vs. milliseconds vs. microseconds is a heuristic based on digit count. A seconds-based timestamp for an extremely distant past or future date can be misread as milliseconds.",
          "Relative time (like \"3 hours ago\") is computed from the system clock of the device viewing this page. If that clock is off, the relative time will be off too.",
          "Local time only reflects the timezone set in your browser. There is no way to preview an arbitrary third timezone.",
        ],
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
          answer: "아니요. 모든 변환은 브라우저 안에서 처리되며 입력한 값은 서버로 전송되지 않습니다.",
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
            "Paste the generated Slack syntax into a message and Slack renders the date and time in each reader's own timezone and locale: handy for announcements across global teams.",
        },
        {
          question: "How are timezones handled?",
          answer:
            "The same instant is shown in UTC and in your browser's local timezone side by side, along with a live relative time such as “3 hours ago”.",
        },
        {
          question: "Is anything I enter sent to a server?",
          answer: "No. Every conversion happens inside your browser and the values you enter are never uploaded.",
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

  // ── CSS Unit Converters (Developer) ───────────────────────────
  // 2026-09: rem/em/vw/percent/ms 다섯 개 단위 변환기를 이 한 엔트리로 통합.
  // 구 URL(각 /*-to-px, /ms-to-s)은 next.config.js 301로 이 URL의 ?mode=로 연결한다.
  {
    slug: "css-unit-converter",
    layout: "card",
    cat: "dev",
    targets: ["developer", "designer"],
    ico: "px",
    ready: true,
    indexable: true,
    badge: "Clean SaaS",
    name: { ko: "CSS 단위 변환기", en: "CSS Unit Converter" },
    relatedTools: ["tailwind-palette-generator", "css-gradient", "json-formatter"],
    seo: {
      ko: {
        title: "CSS 단위 변환기 | rem·em·vw·%·ms → px 변환",
        description:
          "rem·em·vw·퍼센트·ms, 자주 쓰는 CSS 상대 단위 다섯 가지를 px(또는 초)로 즉시 변환합니다. 루트 폰트 크기·부모 폰트 크기·뷰포트 너비 같은 기준값을 직접 설정하고 결과를 바로 복사하세요. 모든 계산은 브라우저 안에서만 이루어집니다.",
        keywords: ["css 단위 변환기", "rem to px", "em to px", "vw to px", "ms to s", "px to rem"],
      },
      en: {
        title: "CSS Unit Converter | rem, em, vw, %, ms to px",
        description:
          "Convert five common CSS relative units, rem, em, vw, percent and ms, to pixels (or seconds) instantly. Set the base value each unit depends on (root font size, parent font size, viewport width) and copy the result in one click. Everything runs entirely in your browser.",
        keywords: ["css unit converter", "rem to px", "em to px", "vw to px", "ms to s", "px to rem"],
      },
    },
    content: {
      ko: {
        card: "rem·em·vw·%·ms를 px(또는 초)로 즉시 변환. CSS 단위 변환 5종을 한 곳에서.",
        description:
          "rem·em·vw·퍼센트·ms, 자주 쓰는 CSS 상대 단위 다섯 가지를 px(또는 초)로 즉시 변환합니다. 루트 폰트 크기·부모 폰트 크기·뷰포트 너비 같은 기준값을 직접 설정하고 결과를 바로 복사하세요. 모든 계산은 브라우저 안에서만 이루어집니다.",
        howItWorks: [
          "상단 탭에서 변환할 단위 선택",
          "값과 기준값(루트·부모 폰트, 뷰포트 너비 등) 입력",
          "변환 결과 확인 및 복사",
        ],
        aeo: {
          what: "CSS 단위 변환기는 rem·em·vw·퍼센트·ms 다섯 가지 CSS 상대 단위를 픽셀(px) 또는 초(s)로, 혹은 그 반대로 즉시 변환해주는 도구입니다.",
          who: "반응형 레이아웃과 애니메이션을 다루며 상대 단위와 절대 단위를 자주 오가는 프론트엔드 개발자와 UI 디자이너를 위한 도구입니다.",
          how: "상단 탭에서 변환할 단위를 고르고 값과 기준값(루트 폰트 크기, 부모 폰트 크기, 뷰포트 너비 등)을 입력하면 브라우저 안에서 즉시 결과를 보여줍니다. Swap으로 방향을 바꿀 수 있습니다.",
          why: "단위마다 따로 계산기를 찾아다니지 않고 한 페이지에서 다섯 가지 CSS 단위를 전부 변환할 수 있어 반응형 작업의 반복 계산을 줄여줍니다.",
        },
        guide: [
          {
            heading: "다섯 개 CSS 단위를 왜 한 곳에 모았나",
            body: [
              "CSS에는 화면 크기·부모 요소·루트 요소에 따라 실제 크기가 달라지는 상대 단위가 여러 개 있습니다. rem과 em은 폰트 크기를, vw는 뷰포트 너비를, 퍼센트는 부모 요소의 너비를, ms는 애니메이션·트랜지션의 지속 시간을 기준으로 합니다. 다섯 단위 모두 '기준값 × 배율 = 절대값(px 또는 초)'이라는 같은 형태의 계산이지만, 기준값이 무엇인지는 매번 다릅니다.",
              "실무에서는 디자인 시안이 px로 오고 구현은 상대 단위로 하는 경우가 많아, 이 다섯 단위와 px 사이를 하루에도 여러 번 오가게 됩니다. 단위마다 다른 페이지를 열어 계산하는 대신, 탭을 눌러 같은 화면에서 바로 전환할 수 있게 모았습니다.",
            ],
          },
          {
            heading: "rem ↔ px: 루트 폰트 크기가 기준",
            body: [
              "rem(root em)은 HTML 루트 요소의 폰트 크기를 기준으로 합니다. 계산식은 px = rem × 루트 폰트 크기입니다. 기본값 16px 기준으로 1rem = 16px이지만, html { font-size: 62.5% }처럼 루트를 바꾼 프로젝트에서는 값이 달라지므로 루트 폰트 크기 입력을 실제 프로젝트 값과 맞춰야 합니다.",
              "사용자가 브라우저 기본 글자 크기를 키우면 rem으로 잡은 값도 함께 커져 접근성에 유리합니다. 폰트 크기·여백처럼 화면 전체와 함께 스케일되어야 하는 값에 주로 씁니다.",
            ],
          },
          {
            heading: "em ↔ px: 부모 폰트 크기가 기준, 중첩되면 누적",
            body: [
              "em의 계산식은 rem과 같은 px = em × 부모 폰트 크기지만, 기준이 루트가 아니라 해당 요소가 상속받은 부모의 폰트 크기입니다. em으로 폰트 크기를 지정한 요소 안에 또 em을 쓰면 배율이 곱해져 누적되므로, 여러 단계 중첩된 값을 확인할 때는 실제 부모 크기를 정확히 입력해야 합니다.",
              "버튼 padding처럼 '이 요소가 자기 폰트 크기에 비례해 커지길' 원할 때는 em이, 화면 전체 기준의 예측 가능한 값이 필요할 때는 rem이 더 적합합니다.",
            ],
          },
          {
            heading: "vw ↔ px: 뷰포트 너비가 기준",
            body: [
              "vw(viewport width)는 계산식이 px = vw × 뷰포트 너비 ÷ 100으로, 브라우저 창(뷰포트) 전체 너비의 1%를 1vw로 봅니다. 반응형 히어로 타이틀이나 화면 너비에 정비례해 커지는 요소에 자주 쓰입니다.",
              "뷰포트 너비 입력값을 실제 확인하려는 화면 크기(모바일 390px, 데스크톱 1440px 등)로 바꾸면 그 브레이크포인트에서 몇 px이 되는지 바로 알 수 있습니다.",
            ],
          },
          {
            heading: "% ↔ px: 부모 요소의 계산된 너비가 기준",
            body: [
              "퍼센트는 px = % × 부모 너비 ÷ 100으로 계산되며, 여기서 부모 너비는 CSS 선언값이 아니라 브라우저가 실제로 계산한(computed) 값입니다. 부모가 유동적인 레이아웃(flex·grid)에 속해 있다면 이 값 자체가 화면 크기에 따라 달라진다는 점을 기억하세요.",
              "고정폭 컨테이너 안에서 요소 너비를 퍼센트로 설계할 때, 특정 화면 크기에서 실제 몇 px이 되는지 미리 확인하는 용도로 씁니다.",
            ],
          },
          {
            heading: "ms ↔ s: 애니메이션·트랜지션 지속 시간",
            body: [
              "ms와 s는 단순 비례식(1s = 1000ms)이라 기준값 입력이 필요 없습니다. CSS의 transition-duration, animation-duration은 두 단위 모두 허용하므로, 디자인 스펙에 적힌 밀리초 값을 코드에 초 단위로 옮기거나 그 반대로 확인할 때 씁니다.",
              "단위 변환일 뿐이며, 실제 체감 속도는 easing 함수와 애니메이션 대상에 따라 달라진다는 점은 별도로 고려해야 합니다.",
            ],
          },
        ],
        examples: [
          {
            title: "디자인 시안의 px 값을 rem으로 옮기기",
            input: "24px, 루트 폰트 크기 16px",
            result: "1.5rem",
            note: "디자인 도구는 보통 px 값을 주지만 접근성을 지키려면 폰트·여백은 rem으로 구현하는 편이 좋습니다. 시안 하나에 수십 개 값이 있을 때는 계산기로 한 번에 확인하는 편이 빠릅니다.",
          },
          {
            title: "중첩된 요소의 em 값을 실제 px로 확인하기",
            input: "0.75em, 부모 폰트 크기 20px",
            result: "15px",
            note: "부모 요소의 font-size가 이미 확대·축소된 상태라면 em 값만 보고는 실제 크기를 가늠하기 어렵습니다. 부모의 계산된 폰트 크기를 입력해야 정확한 px 값이 나옵니다.",
          },
          {
            title: "반응형 히어로 타이틀이 화면별로 몇 px인지 확인하기",
            input: "5vw, 뷰포트 너비 1440px",
            result: "72px",
            note: "뷰포트 너비를 390px(모바일)로 바꾸면 같은 5vw가 19.5px이 됩니다. vw로 폰트 크기를 스케일할 때 최소·최대 크기를 벗어나지 않는지 여러 화면 너비에서 확인하는 용도로 씁니다.",
          },
          {
            title: "고정폭 컨테이너 안에서 퍼센트 너비를 px로 환산하기",
            input: "75%, 부모 너비 1200px",
            result: "900px",
            note: "그리드 컬럼이나 사이드바 너비를 퍼센트로 설계했을 때, 특정 브레이크포인트에서 실제 몇 px이 되는지 미리 확인해 다른 고정폭 요소와 나란히 배치할 수 있는지 가늠할 수 있습니다.",
          },
          {
            title: "디자인 스펙의 트랜지션 시간을 CSS 값으로 옮기기",
            input: "300ms",
            result: "0.3s",
            note: "디자인 스펙 문서는 밀리초로, 코드베이스는 초 단위 관례를 쓰는 경우가 섞여 있습니다. transition-duration에 어느 쪽을 적어도 동작은 같으므로 팀 컨벤션에 맞는 쪽으로 바꿔 적으면 됩니다.",
          },
        ],
        limitations: [
          "rem은 루트(html) 요소, em은 부모 요소의 폰트 크기를 기준으로 합니다. em이 여러 단계 중첩되면 배율이 곱해져 누적되므로, 중첩이 깊은 경우 실제 계산값을 개발자 도구에서 함께 확인하세요.",
          "미디어 쿼리 안의 rem·em은 요소의 font-size가 아니라 브라우저 기본 글꼴 크기를 기준으로 해석됩니다. html에 font-size: 10px를 선언했더라도 @media (min-width: 40rem)은 여전히 16px 기준(640px)에 가깝게 동작합니다.",
          "100vw는 스크롤바 너비를 포함하지 않는 뷰포트 전체 너비를 기준으로 하므로, 세로 스크롤바가 있는 페이지에서는 100vw 요소가 뷰포트보다 살짝 넓어져 가로 스크롤이 생길 수 있습니다.",
          "퍼센트 변환에 쓰는 부모 너비는 CSS 선언값이 아니라 실제 렌더링된 계산값입니다. 유동적인 flex·grid 레이아웃에서는 이 값 자체가 화면 크기·형제 요소 수에 따라 달라지므로, 입력한 부모 너비는 그 순간의 스냅샷으로만 보세요.",
          "border-width처럼 소수점 px가 기기 픽셀에 정확히 떨어지지 않는 속성은 브라우저가 렌더링 시 반올림합니다. 계산기의 값과 개발자 도구에 찍히는 실제 값이 0.5px 정도 다를 수 있습니다.",
        ],
      },
      en: {
        card: "Convert rem, em, vw, % and ms to px (or seconds) instantly. Five CSS unit converters in one place.",
        description:
          "Convert five common CSS relative units, rem, em, vw, percent and ms, to pixels (or seconds) instantly. Set the base value each unit depends on (root font size, parent font size, viewport width) and copy the result in one click. Everything runs entirely in your browser.",
        howItWorks: [
          "Pick a unit pair from the tabs above",
          "Enter the value and its base (root/parent font size, viewport width, etc.)",
          "Copy the converted result",
        ],
        aeo: {
          what: "CSS Unit Converter instantly converts five common CSS relative units, rem, em, vw, percent, and ms, into pixels (or seconds) and back.",
          who: "It is for front-end developers and UI designers who work with responsive layouts and animations and constantly move between relative and absolute units.",
          how: "Pick a unit pair from the tabs above, enter a value and its base (root font size, parent font size, viewport width, and so on), and the result appears instantly in your browser. Use Swap to flip direction.",
          why: "Instead of hunting down a separate converter for each unit, you get all five CSS unit conversions on one page, cutting down the repeated math in responsive work.",
        },
        guide: [
          {
            heading: "Why five CSS units live on one page",
            body: [
              "CSS has several relative units whose actual size depends on the screen, the parent element, or the root element. rem and em are relative to a font size, vw to the viewport width, percent to the parent's width, and ms to how long an animation or transition runs. All five reduce to the same shape of math, base value times a multiplier equals an absolute value (px or seconds), but what counts as the base changes every time.",
              "In practice, designs arrive in px while implementation uses relative units, so you move between these five units and px many times a day. Instead of opening a different page for each unit, this page keeps them one tab-click away on the same screen.",
            ],
          },
          {
            heading: "rem to px: relative to the root font size",
            body: [
              "rem (root em) is relative to the HTML root element's font size. The formula is px = rem x root font size. At the default 16px, 1rem = 16px, but a project that changes the root (e.g. html { font-size: 62.5% }) shifts that, so set the root font size input to match your actual project.",
              "When a visitor increases their browser's default text size, values sized in rem grow with it, which helps accessibility. rem is the usual choice for font sizes and spacing that should scale with the whole page.",
            ],
          },
          {
            heading: "em to px: relative to the parent font size, and it compounds when nested",
            body: [
              "em uses the same formula as rem, px = em x parent font size, but the base is the font size the element inherits from its parent, not the root. Using em inside an element that already sets its own font size in em multiplies the ratios together, so when you check a value nested several levels deep, enter the real parent size for an accurate result.",
              "em suits a single element that should scale in proportion to its own font size, like button padding; rem suits values that need to scale predictably against the whole page.",
            ],
          },
          {
            heading: "vw to px: relative to the viewport width",
            body: [
              "vw (viewport width) uses px = vw x viewport width / 100: 1vw is 1% of the browser window's full width. It shows up often in responsive hero titles and elements meant to scale directly with screen width.",
              "Set the viewport width input to the screen size you actually want to check, mobile at 390px, desktop at 1440px, and so on, to see how many pixels that value becomes at that breakpoint.",
            ],
          },
          {
            heading: "Percent to px: relative to the parent's computed width",
            body: [
              "Percent uses px = % x parent width / 100, where the parent width is the browser's actual computed value, not whatever the CSS declares. If the parent sits in a fluid layout (flex or grid), remember that this base value itself changes with the screen size.",
              "It is useful for checking, ahead of time, how many pixels a percentage-based width becomes inside a fixed-width container at a specific screen size.",
            ],
          },
          {
            heading: "Ms to s: animation and transition duration",
            body: [
              "ms and s are a plain ratio (1s = 1000ms), so no base value is needed. CSS's transition-duration and animation-duration both accept either unit, so this is for moving a millisecond value from a design spec into seconds in code, or checking it the other way.",
              "This only converts the unit; how fast an animation actually feels still depends on its easing function and what it's animating, which is a separate consideration.",
            ],
          },
        ],
        examples: [
          {
            title: "Porting a px value from a design file to rem",
            input: "24px with a 16px root font size",
            result: "1.5rem",
            note: "Design tools usually hand you px, but font sizes and spacing are better implemented in rem for accessibility. With dozens of values in one screen, it's faster to check them with the converter than to divide by 16 by hand each time.",
          },
          {
            title: "Checking the real px value of a nested em",
            input: "0.75em with a 20px parent font size",
            result: "15px",
            note: "If the parent element's font-size has already been scaled up or down, the em value alone doesn't tell you the real size. Enter the parent's computed font size to get an accurate px value.",
          },
          {
            title: "Checking how many px a responsive hero title becomes at different sizes",
            input: "5vw with a 1440px viewport",
            result: "72px",
            note: "Change the viewport width to 390px (mobile) and the same 5vw becomes 19.5px. This is for checking, across several screen widths, that a font size scaled with vw stays within its intended min and max.",
          },
          {
            title: "Converting a percentage width to px inside a fixed-width container",
            input: "75% with a 1200px parent",
            result: "900px",
            note: "When a grid column or sidebar width is designed as a percentage, this checks how many pixels it becomes at a specific breakpoint, so you can tell whether it will line up with other fixed-width elements.",
          },
          {
            title: "Moving a spec's transition duration into a CSS value",
            input: "300ms",
            result: "0.3s",
            note: "Design specs are often written in milliseconds while a codebase's convention is seconds, or the reverse. transition-duration behaves the same either way, so use whichever matches your team's convention.",
          },
        ],
        limitations: [
          "rem is relative to the root (html) element's font size, em to the parent's. When em is nested several levels deep, the ratios multiply and compound, so for deeply nested cases check the actual computed value in DevTools too.",
          "Inside media queries, rem and em resolve against the browser's default font size, not an element's font-size. Even with html { font-size: 10px } declared, @media (min-width: 40rem) still behaves close to the 16px-based value (640px).",
          "100vw is relative to the full viewport width and does not subtract the scrollbar's width, so on a page with a vertical scrollbar, a 100vw element can end up slightly wider than the viewport and cause horizontal scrolling.",
          "The parent width used for percent conversion is the actual rendered, computed value, not whatever the CSS declares. In a fluid flex or grid layout that value itself shifts with screen size and sibling count, so treat the parent width you enter as a snapshot of one moment.",
          "For properties like border-width, where a fractional px doesn't land evenly on a device pixel, the browser rounds it when rendering. The converter's value and what DevTools reports can differ by around half a pixel.",
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "다섯 개 단위를 각각 다른 페이지에서 찾아야 하나요?",
          answer:
            "아니요. 상단 탭에서 rem·em·vw·%·ms 중 원하는 단위를 누르면 같은 페이지 안에서 바로 전환됩니다. URL은 ?mode= 쿼리로 현재 선택한 단위를 반영하지만, 검색 색인용 대표 URL(canonical)은 항상 /css-unit-converter 하나입니다.",
        },
        {
          question: "탭을 누르면 입력했던 값이 사라지나요?",
          answer:
            "네, 단위를 바꾸면 그 단위의 기본값으로 초기화됩니다. 단위마다 기준값의 의미(루트 폰트 크기, 부모 폰트 크기, 뷰포트 너비 등)가 달라 이전 값을 그대로 이어 쓰면 오히려 혼동을 줄 수 있기 때문입니다.",
        },
        {
          question: "rem과 em 중 어떤 걸 써야 하나요?",
          answer:
            "화면 전체 기준으로 예측 가능하게 스케일되길 원하면 rem을, 버튼처럼 특정 요소가 자기 폰트 크기에 비례해 커지길 원하면 em을 쓰는 경우가 많습니다. 다만 이는 관례일 뿐 정해진 규칙은 아닙니다.",
        },
        {
          question: "100vw인데 왜 페이지에 가로 스크롤이 생기나요?",
          answer:
            "세로 스크롤바가 있는 브라우저에서 100vw는 스크롤바 너비를 포함한 값이라, 실제 콘텐츠 영역보다 넓어질 수 있습니다. 요소 너비를 100%로 바꾸거나 box-sizing과 overflow 설정을 함께 확인하세요.",
        },
        {
          question: "입력한 값이 서버로 전송되나요?",
          answer: "아니요. 모든 변환은 브라우저 안에서 처리되며 입력한 값은 서버로 전송되거나 저장되지 않습니다.",
        },
      ],
      en: [
        {
          question: "Do I need to visit a different page for each of the five units?",
          answer:
            "No. Click rem, em, vw, %, or ms in the tabs above and it switches instantly on the same page. The URL reflects the current unit via a ?mode= query, but the canonical URL used for search indexing is always the single /en/css-unit-converter.",
        },
        {
          question: "Does switching tabs clear the value I entered?",
          answer:
            "Yes, switching units resets the fields to that unit's default. Each unit's base value means something different (root font size, parent font size, viewport width, and so on), so carrying over the previous value would likely cause confusion instead of helping.",
        },
        {
          question: "Should I use rem or em?",
          answer:
            "rem is common when you want predictable scaling relative to the whole page; em is common when a specific element, like button padding, should scale in proportion to its own font size. These are conventions, not hard rules.",
        },
        {
          question: "Why does my page get horizontal scroll even though I used 100vw?",
          answer:
            "In a browser with a vertical scrollbar, 100vw includes the scrollbar's width, so it can end up wider than the actual content area. Try width: 100% instead, or check your box-sizing and overflow settings.",
        },
        {
          question: "Is anything I enter sent to a server?",
          answer: "No. All conversion happens in your browser and the values you enter are never uploaded or stored.",
        },
      ],
    },
    og: {
      ko: { title: "CSS 단위 변환기", subtitle: "rem·em·vw·%·ms를 px로 한 번에 변환" },
      en: { title: "CSS Unit Converter", subtitle: "Convert rem, em, vw, % and ms to px in one place" },
    },
  },
  {
    slug: "html-accessibility-checker",
    layout: "ide",
    cat: "dev",
    targets: ["developer", "designer", "pm"],
    ico: "a11y",
    ready: true,
    indexable: true,
    verifiedAt: "2026-09-11",
    badge: "IDE / Editor",
    name: { ko: "HTML 접근성 검사기", en: "HTML Accessibility Checker" },
    // 정적 HTML 검사가 판정하지 못하는 두 영역(렌더링된 색상 대비 · 색상 의존)을
    // 그대로 이어받는 도구만 연결한다. 관련성이 약한 개발 도구를 채워 넣지 않는다.
    relatedTools: ["color-contrast-checker", "color-blindness-simulator"],
    seo: {
      ko: {
        title: "HTML 접근성 검사기 | 헤딩·alt·label 구조 점검",
        description:
          "HTML 접근성 검사기에 코드를 붙여넣어 헤딩 계층, 랜드마크, 이미지 alt, 폼 label 연결, 접근 가능한 이름, tabindex와 ARIA 참조를 점검하세요. 자동으로 확인할 수 있는 문제와 수동 검사 항목을 구분해 보여주며, 입력한 마크업은 로그인이나 업로드 없이 브라우저에서만 분석됩니다.",
        keywords: [
          "HTML 접근성 검사",
          "HTML 접근성 검사기",
          "웹접근성 검사",
          "마크업 접근성 검사",
          "헤딩 구조 확인",
          "HTML 헤딩 검사",
          "alt 속성 검사",
          "이미지 대체 텍스트 검사",
          "label for 검사",
          "폼 레이블 검사",
          "tabindex 검사",
          "ARIA 검사",
        ],
      },
      en: {
        title: "HTML Accessibility Checker | Headings, Alt, Labels",
        description:
          "Paste HTML into this accessibility checker to review heading hierarchy, landmarks, image alt text, form labels, accessible name signals, ARIA references, and estimated tab order. It separates high-confidence issues from items that require manual testing, and analyzes your markup locally in the browser without sign-in or upload.",
        keywords: [
          "html accessibility checker",
          "accessibility html validator",
          "html accessibility test",
          "heading structure checker",
          "alt attribute checker",
          "alt text checker",
          "form label checker",
          "label for checker",
          "tabindex checker",
          "aria reference checker",
          "wcag html checker",
        ],
      },
    },
    content: {
      ko: {
        card: "HTML을 붙여넣어 헤딩·랜드마크·alt·label·탭 순서를 정적으로 점검하고 수정 위치를 확인합니다.",
        description:
          "HTML을 붙여넣어 헤딩 구조, 랜드마크, 이미지 대체 텍스트, 폼 레이블과 예상 탭 순서를 확인하세요. 코드만으로 판단하기 어려운 항목은 수동 검사로 분리해 과도한 합격 판정을 피합니다. 검사는 붙여넣은 마크업을 렌더링하지 않는 파서로 이루어지며, 결과는 규칙 ID·소스 위치·수정 방향과 함께 Markdown 보고서로 복사할 수 있습니다.",
        howItWorks: [
          "컴포넌트 조각 또는 전체 문서를 선택하고 HTML 붙여넣기",
          "헤딩·랜드마크·레이블·이미지·포커스 정적 규칙 검사",
          "문제 위치 확인 또는 Markdown 보고서로 복사",
        ],
        aeo: {
          what: "HTML 접근성 검사기는 붙여넣은 HTML의 구조, 대체 텍스트, 폼 레이블, 이름 신호와 포커스 순서를 정적으로 분석하는 브라우저 도구입니다.",
          who: "구현 중인 마크업을 PR이나 웹접근성 QA 전에 점검하려는 프론트엔드 개발자, 퍼블리셔, QA 담당자와 PM을 위한 도구입니다.",
          how: "HTML을 렌더링하지 않는 파서로 요소와 속성을 읽고, 규칙별 문제 위치·관련 WCAG 기준·수정 방향과 수동 검사 목록을 보여줍니다.",
          why: "설치나 배포 전에 반복되는 마크업 오류를 빠르게 찾고, 자동 검사 결과를 전체 접근성 준수로 오해하지 않도록 검사 범위를 구분하기 위해 사용합니다.",
        },
        guide: [
          {
            heading: "HTML 접근성 검사기는 무엇을 확인하나요?",
            body: [
              "HTML 접근성 검사기는 화면이 완성되기 전에도 마크업에서 반복적으로 발생하는 문제를 찾는 도구입니다. 헤딩 단계가 갑자기 건너뛰는지, 이미지에 alt가 있는지, 폼 필드와 label이 연결됐는지, 버튼과 링크에 읽을 수 있는 이름이 있는지, ARIA 속성이 실제 요소를 참조하는지 확인할 수 있습니다. 코드 리뷰 전에 실행하면 수정 위치를 좁히고, QA에서는 수동으로 확인할 항목을 놓치지 않는 데 도움이 됩니다.",
              "다만 HTML만으로 웹접근성을 전부 판정할 수는 없습니다. 키보드로 실제 기능을 실행할 수 있는지, 포커스 표시가 보이는지, CSS가 적용된 시각적 순서와 DOM 순서가 일치하는지, 동적 상태가 스크린리더에 전달되는지는 실행 화면에서 확인해야 합니다. 따라서 이 도구는 페이지에 점수를 주지 않고 오류 가능성 높음, 검토 필요, 수동 검사를 나눠 보여줍니다.",
            ],
          },
          {
            heading: "컴포넌트 조각과 전체 문서는 어떻게 다른가요?",
            body: [
              "버튼, 카드, 폼 일부처럼 페이지 안에 들어갈 코드만 검사할 때는 컴포넌트 조각을 선택하세요. 이 범위에서는 해당 조각 안의 헤딩, 이미지, 폼, 이름, ARIA 참조와 포커스 요소를 확인합니다. 조각에는 원래 html의 lang이나 title, main이 없으므로 이런 항목을 오류로 표시하지 않습니다.",
              "페이지 전체 HTML을 붙여넣었다면 전체 문서를 선택하세요. 이 범위에서는 페이지 언어, 제목, 주요 랜드마크와 반복 영역 우회 방법까지 함께 검토합니다. 도구가 전체 문서처럼 보이는 입력을 발견하면 전환을 제안하지만, 검사 범위를 자동으로 바꾸지는 않습니다. 사용자가 어떤 문맥을 검사하는지 아는 것이 오탐을 줄이는 가장 확실한 방법이기 때문입니다.",
            ],
          },
          {
            heading: "헤딩 구조는 왜 중요한가요?",
            body: [
              "헤딩은 글자를 크게 보이게 하는 장식이 아니라 문서의 목차 역할을 합니다. 스크린리더와 보조 기술은 헤딩 목록을 제공하고 사용자가 원하는 섹션으로 바로 이동할 수 있게 합니다. 가장 중요한 제목은 보통 h1, 그 아래 주요 섹션은 h2, 하위 항목은 h3처럼 콘텐츠의 포함 관계를 단계로 표현합니다.",
              "h2 다음에 바로 h4가 나오면 중간 단계가 생략됐다고 느낄 수 있습니다. 반대로 h4에서 h2로 돌아가는 것은 앞선 하위 섹션이 끝난 정상적인 구조일 수 있습니다. 검사기는 아래 단계로 두 칸 이상 내려갈 때만 검토 항목을 만들며, 여러 h1이나 h1 부재는 WCAG 위반으로 단정하지 않고 전체 문서의 구조를 다시 확인하도록 안내합니다.",
              "헤딩 문구 자체가 다음 내용을 정확히 설명하는지도 중요하지만, 이는 문자열만으로 판정할 수 없습니다. 상세, 기타, 더보기처럼 문맥 없이는 목적을 알기 어려운 헤딩이 있다면 사람이 직접 수정 여부를 판단해야 합니다.",
            ],
          },
          {
            heading: "랜드마크는 페이지 탐색을 어떻게 돕나요?",
            body: [
              "header, nav, main, aside, footer와 ARIA landmark role은 페이지를 큰 영역으로 나눕니다. 보조 기술 사용자는 전체 링크를 하나씩 지나가지 않고 주요 콘텐츠나 탐색 영역으로 이동할 수 있습니다. 특히 전체 문서에는 현재 페이지의 핵심 콘텐츠를 나타내는 main이 있는지 확인할 가치가 있습니다.",
              "같은 역할의 랜드마크가 여러 개라면 이름으로 구분해야 합니다. 예를 들어 상단 주요 탐색과 푸터 탐색이 모두 nav라면 각각에 주요 메뉴, 푸터 메뉴 같은 aria-label을 주어 목적을 알려줄 수 있습니다. 이름 없이 navigation이 반복되면 스크린리더의 랜드마크 목록에서도 서로 구분하기 어렵습니다.",
              "랜드마크를 많이 추가하는 것이 목표는 아닙니다. 콘텐츠 구조에 필요한 영역만 사용하고, 반복되는 역할에 명확한 이름을 붙이는 것이 중요합니다. 모든 섹션에 role=\"region\"을 붙이면 탐색 목록이 오히려 복잡해질 수 있습니다.",
            ],
          },
          {
            heading: "폼의 label과 접근 가능한 이름은 무엇이 다른가요?",
            body: [
              "시각적 레이블은 화면에서 사용자가 보는 이름이고, 접근 가능한 이름은 브라우저가 접근성 API를 통해 보조 기술에 전달하는 이름입니다. 일반적인 폼 필드는 label의 for와 input의 id를 정확히 일치시키는 방법이 가장 명확합니다. label 안에 입력 필드를 넣는 암시적 연결도 가능하지만, 명시적 연결은 코드 리뷰와 유지보수에서 관계를 확인하기 쉽습니다.",
              "placeholder는 입력을 시작하면 사라지고 레이블 역할을 안정적으로 대신하지 못합니다. aria-label은 화면에 텍스트가 없는 아이콘 버튼처럼 필요한 상황에 사용할 수 있지만, 보이는 레이블이 있다면 그 문구가 접근 가능한 이름에도 포함되어야 합니다. 화면에 검색이라고 쓰인 버튼의 aria-label이 항목 찾기라면 음성 명령 사용자가 화면에 보이는 말을 그대로 사용해 버튼을 찾기 어려울 수 있습니다.",
              "이 도구는 aria-labelledby, aria-label, 연결된 label, 요소 안의 텍스트와 일부 native 대체값을 이용해 이름 신호를 추정합니다. 실제 accessible name 계산은 CSS 가시성, shadow DOM, host language 규칙과 재귀 관계가 얽힌 표준 알고리즘이므로, 복잡한 custom control은 브라우저 접근성 트리에서도 확인해야 합니다.",
            ],
          },
          {
            heading: "이미지 alt는 존재 여부보다 목적이 중요합니다",
            body: [
              "정보를 전달하는 이미지는 같은 목적을 제공하는 대체 텍스트가 필요합니다. 링크나 버튼 안의 이미지라면 이미지 모양보다 동작의 목적을 설명해야 합니다. 반대로 순수 장식 이미지는 빈 alt를 사용해 보조 기술이 건너뛰게 하는 것이 적절할 수 있습니다. 그래서 검사기는 alt 누락은 높은 가능성 문제로, 빈 alt는 장식 여부를 확인할 검토 항목으로 구분합니다.",
              "alt 값이 image, 사진, banner-final-v3.jpg 같은 형태라면 사용자가 이미지의 의미를 이해하는 데 거의 도움이 되지 않습니다. 파일명이나 일반 단어만 들어간 경우 검사기가 경고하지만, 적절한 설명의 길이나 내용은 자동으로 판단하지 않습니다. 같은 이미지도 뉴스 기사, 상품 카드, 링크 버튼 등 사용 문맥에 따라 필요한 대체 텍스트가 달라집니다.",
              "복잡한 차트와 다이어그램은 짧은 alt 하나만으로 모든 정보를 전달하기 어렵습니다. 핵심 요약을 대체 텍스트에 제공하고, 근처 본문이나 데이터 표에서 상세 내용을 제공하는 방식을 함께 검토하세요.",
            ],
          },
          {
            heading: "ARIA 참조는 왜 끊어지기 쉬운가요?",
            body: [
              "aria-labelledby, aria-describedby, aria-controls 같은 속성은 하나 이상의 요소 ID를 가리킵니다. 컴포넌트를 복제하거나 ID를 변경하면서 참조 속성만 남으면 보조 기술이 이름, 설명 또는 제어 관계를 찾지 못할 수 있습니다. 검사기는 참조된 ID가 문서 안에 실제로 존재하는지 확인하고, 중복 ID도 함께 찾습니다.",
              "ARIA는 native HTML의 의미를 대체하는 만능 패치가 아닙니다. 가능한 경우 button, nav, main, label처럼 이미 역할과 동작이 정의된 HTML 요소를 먼저 사용하세요. custom role의 필수 상태와 키보드 동작 전체를 이 도구가 검증하지는 않으므로, 복잡한 위젯은 WAI-ARIA Authoring Practices와 실제 보조 기술 테스트가 필요합니다.",
            ],
          },
          {
            heading: "tabindex와 예상 탭 순서는 어떻게 읽어야 하나요?",
            body: [
              "대부분의 인터페이스는 DOM 순서와 native 요소의 기본 포커스 동작을 유지하는 편이 안전합니다. tabindex에 1, 2 같은 양수 값을 사용하면 해당 요소들이 일반적인 DOM 순서보다 먼저 이동하고, 코드가 바뀔 때 관리하기 어려운 별도 순서를 만들 수 있습니다. 검사기는 양수 값을 검토 항목으로 표시하고, 숫자 순서와 DOM 순서를 조합해 예상 탭 순서를 보여줍니다.",
              "이 목록은 실제 브라우저 테스트를 대체하지 않습니다. CSS로 숨긴 요소, display: contents, flex와 grid의 order, JavaScript로 열린 모달, 비활성 상태와 shadow DOM은 붙여넣은 HTML만으로 완전히 알 수 없습니다. 결과를 보고 의심되는 위치를 찾은 다음 실제 화면에서 Tab과 Shift+Tab으로 순서를 확인하세요.",
              "tabindex가 -1인 경우는 프로그램으로 포커스를 옮겨야 하지만 일반 탭 순서에는 들어오지 않는 요소에 의도적으로 사용할 수 있습니다. native 버튼이나 링크에 적용됐다면 핵심 기능을 키보드로 놓칠 가능성이 있으므로 사용 이유를 검토해야 합니다.",
            ],
          },
          {
            heading: "자동 검사 결과를 어떻게 해석해야 하나요?",
            body: [
              "오류 가능성 높음은 누락된 alt, 끊어진 label 연결, 이름 없는 버튼처럼 코드만으로도 수정 위치가 비교적 분명한 항목입니다. 검토 필요는 빈 alt가 정말 장식용인지, 건너뛴 헤딩 단계가 문서 구조상 문제인지처럼 문맥을 확인해야 하는 항목입니다. 수동 검사는 포커스 표시, 키보드 트랩, 색상 대비, 동적 상태처럼 실제 화면을 실행해야 확인할 수 있는 항목입니다.",
              "발견 항목이 0개라고 해서 접근성이 완성됐다는 뜻은 아닙니다. 자동 검사는 사람이 볼 범위를 줄이는 필터에 가깝습니다. W3C도 평가 도구가 잠재적인 문제를 빠르게 찾는 데 도움을 주지만 모든 접근성 측면을 판정할 수 없고, 잘못되거나 오해를 부르는 결과가 생길 수 있다고 설명합니다.",
            ],
          },
          {
            heading: "PR 전에 확인하는 권장 순서",
            body: [
              "먼저 구현한 컴포넌트의 HTML 조각을 붙여넣고 높은 가능성 문제부터 수정합니다. 그다음 헤딩 트리와 랜드마크 목록에서 콘텐츠 구조와 영역 이름을 확인하고, 예상 탭 순서에서 양수 tabindex와 이름 없는 상호작용 요소를 찾습니다. 정리가 끝나면 Markdown 보고서를 복사해 PR이나 QA 티켓에 첨부하세요.",
              "마지막은 실제 화면입니다. 키보드 조작, 포커스 표시, 시각적 순서와 동적 상태를 직접 테스트하고, CSS가 적용된 색상 대비는 명도대비 검사기에서 따로 측정하세요. 오류·선택·차트가 색상에만 의존하는지는 색각이상 시뮬레이터로 확인할 수 있습니다.",
            ],
          },
        ],
        examples: [
          {
            title: "내장 예시 HTML을 전체 문서로 검사",
            input: "예시 HTML 버튼으로 불러온 계정 설정 페이지 · 검사 범위 전체 문서",
            result:
              "요소 15개에서 오류 가능성 높음 5건(DOC-001 lang 누락 · DOC-003 빈 title · IMG-001 alt 누락 · FORM-002 끊어진 label[for] · NAME-001 이름 없는 링크)과 검토 필요 4건(HEAD-002 h1 다음 h3 · FORM-003 placeholder만 있는 입력 · NAME-002 보이는 문구와 다른 이름 · FOCUS-001 양수 tabindex)",
            note: "수동 검사 8개는 발견 항목과 무관하게 항상 함께 표시됩니다. 자동 검사에서 잡히지 않는 영역을 시야에서 놓치지 않기 위해서입니다.",
          },
          {
            title: "카드 컴포넌트 조각만 검사",
            input:
              'section 안에 h4 제목, 이미지만 있는 링크(alt 없음), placeholder만 있는 input, onclick 만 있는 div role="button" · 검사 범위 컴포넌트 조각',
            result:
              "요소 6개에서 오류 가능성 높음 2건(IMG-004 이미지 링크에 이름 없음 · IMG-001 alt 누락)과 검토 필요 2건(FORM-003 placeholder만 있는 입력 · FOCUS-003 키보드 경로 없는 클릭 핸들러)",
            note: "같은 조각이라도 h4 하나만 있는 것은 건너뛴 헤딩으로 보지 않습니다. 앞선 헤딩이 없어 단계를 비교할 수 없기 때문이며, 조각 범위에서는 lang·title·main 규칙도 실행되지 않습니다.",
          },
          {
            title: "양수 tabindex가 섞인 폼의 예상 탭 순서 확인",
            input: 'tabindex="1"인 바로가기 링크, 검색 input, 검색 button, tabindex="3"인 도움말 링크 순서로 작성된 form',
            result:
              "예상 탭 순서는 1) tabindex=1 바로가기 링크 2) tabindex=3 도움말 링크 3) 검색 input 4) 검색 button. 양수 tabindex 2건이 검토 필요로 표시됨",
            note: "DOM에서는 도움말 링크가 마지막인데 탭으로는 두 번째로 이동합니다. 양수 값을 모두 제거하면 순서가 DOM 순서와 다시 일치합니다.",
          },
        ],
        limitations: [
          "CSS를 계산하지 않습니다. display, visibility, flex와 grid의 order, 화면 위치, 색상 대비는 붙여넣은 HTML만으로 알 수 없으므로 판정 대상에서 제외하고 수동 검사로 남깁니다.",
          "JavaScript를 실행하지 않습니다. 프레임워크가 연결한 이벤트 핸들러, 스크립트로 열리는 모달, 런타임에 바뀌는 속성은 확인할 수 없고 inline 이벤트 속성만 읽습니다.",
          "React JSX, Vue SFC, Svelte 같은 빌드 전 템플릿 문법은 정확히 해석하지 않습니다. 브라우저가 읽는 HTML로 변환한 뒤 붙여넣거나 프레임워크 전용 린터를 함께 사용하세요.",
          "접근 가능한 이름은 표준 알고리즘 전체가 아니라 제한된 이름 신호로 추정합니다. shadow DOM, slot, pseudo element, CSS로 숨긴 텍스트와 브라우저별 HTML-AAM 동작은 반영되지 않으므로 복잡한 custom control은 접근성 트리에서 다시 확인하세요.",
          "발견 항목이 0개라는 결과는 WCAG나 한국형 웹 콘텐츠 접근성 지침을 준수한다는 뜻이 아닙니다. 이 도구는 점수나 합격 여부를 제공하지 않고, 정적 소스에서 확인 가능한 항목만 다룹니다.",
          "입력은 500,000자, 요소는 20,000개까지 검사합니다. 더 큰 문서는 컴포넌트나 섹션 단위로 나눠 검사하세요.",
          "URL을 입력해 페이지를 가져오거나 사이트 전체를 크롤링하지 않습니다. 붙여넣은 HTML은 렌더링하지 않고 파서로만 읽으므로 이미지·iframe·스타일시트 같은 외부 리소스도 요청하지 않습니다.",
        ],
        sources: [
          {
            label: "W3C · WCAG 2.2 Understanding Non-text Content",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html",
          },
          {
            label: "W3C · WCAG 2.2 Understanding Info and Relationships",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html",
          },
          {
            label: "W3C · WCAG 2.2 Understanding Focus Order",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html",
          },
          {
            label: "W3C · WCAG 2.2 Understanding Label in Name",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html",
          },
          {
            label: "W3C · Selecting Web Accessibility Evaluation Tools",
            url: "https://www.w3.org/WAI/test-evaluate/tools/selecting/",
          },
          {
            label: "W3C · Accessible Name and Description Computation",
            url: "https://www.w3.org/TR/accname-1.2/",
          },
        ],
      },
      en: {
        card: "Paste HTML to statically review headings, landmarks, alt text, labels and tab order.",
        description:
          "Paste an HTML fragment or document to review its heading structure, landmarks, image alternatives, form labels, and estimated tab order. Checks that need rendering or human judgment stay clearly marked for manual testing. The markup is read by a parser that never renders it, and every finding comes with a rule ID, a source location and a suggested fix you can copy as a Markdown report.",
        howItWorks: [
          "Choose fragment or document scope and paste your HTML",
          "Run static checks for headings, landmarks, labels, images and focus",
          "Review each location and fix, or copy the Markdown report",
        ],
        aeo: {
          what: "An HTML accessibility checker statically analyzes pasted markup for structure, text alternatives, form labels, name signals, ARIA references, and focus order.",
          who: "It is for front-end developers, HTML authors, QA testers, designers, and product managers reviewing markup before a pull request or accessibility QA.",
          how: "It parses HTML without rendering it and reports each issue with its source location, related WCAG criterion, suggested fix, and a separate manual-test list.",
          why: "It helps teams find repeatable markup problems before deployment while keeping checks that require rendering or human judgment outside the automatic result.",
        },
        guide: [
          {
            heading: "What does an HTML accessibility checker inspect?",
            body: [
              "An HTML accessibility checker finds repeatable markup problems before a page is fully deployed. It can inspect heading levels, image alt attributes, associations between controls and labels, name signals for buttons and links, ARIA references, landmarks, and the order suggested by tabindex. Running it before a pull request narrows the places that need correction and creates a practical checklist for QA.",
              "Static HTML cannot establish full accessibility. It cannot confirm whether every feature works from a keyboard, whether focus indicators are visible, whether visual and DOM order match after CSS, or whether dynamic status messages reach assistive technology. This tool therefore separates high-confidence issues, items that require review, and checks that must be performed manually. It does not produce a conformance score.",
            ],
          },
          {
            heading: "When should you choose fragment or document scope?",
            body: [
              "Choose HTML fragment for a button, card, form section, or another piece that will be inserted into a larger page. Fragment scope checks headings, images, forms, names, ARIA references, and focusable elements inside that piece. It does not report missing page-level metadata such as a document language, a title, or a main landmark.",
              "Choose Full document when the input represents a complete page. This adds checks for page language, title, primary landmarks, and ways to bypass repeated regions. The tool can suggest document scope when it sees a doctype or document elements, but it does not silently change the selection. Explicit scope prevents page-level rules from becoming false alarms in component reviews.",
            ],
          },
          {
            heading: "Why does heading structure matter?",
            body: [
              "Headings are not merely large text. They communicate the organization of a document, and browsers and assistive technologies can use them for in-page navigation. A common hierarchy uses h1 for the main title, h2 for major sections, and h3 for subsections that belong to an h2.",
              "Moving directly from h2 to h4 can imply a missing level. Moving from h4 back to h2 can be valid because it closes nested sections. The checker only flags jumps that move down by more than one level. A missing or repeated h1 is presented as a review item for full documents, not an automatic WCAG failure.",
              "The wording of each heading must also describe its section, but source analysis cannot reliably judge that meaning. Review vague headings such as More, Other, or Details in their actual content context.",
            ],
          },
          {
            heading: "How do landmarks support navigation?",
            body: [
              "Elements such as header, nav, main, aside, and footer, along with ARIA landmark roles, divide a page into larger regions. Assistive-technology users can move to main content or navigation without traversing every link. A full document should be reviewed for a clear primary content region.",
              "Repeated landmarks need distinct names. If a header and footer both contain a nav element, names such as Primary and Footer applied with aria-label help users distinguish them in a landmark list. Adding more landmarks is not the goal: use only meaningful regions and label repeated roles clearly.",
            ],
          },
          {
            heading: "What is the difference between a label and an accessible name?",
            body: [
              "A visible label is the text a person sees, while an accessible name is the name exposed by the browser through accessibility APIs. For a typical form field, an explicit association between a label's for attribute and the control's id is clear and maintainable. Wrapping a control inside a label can also create an implicit association.",
              "A placeholder disappears when typing begins and is not a stable replacement for a label. An aria-label can name an icon-only control, but when visible text exists, the accessible name should contain that text. A button that visibly says Search but is named Find items can be difficult to operate with speech input because the spoken visible label does not match its programmatic name.",
              "The checker estimates name signals from aria-labelledby, aria-label, associated labels, descendant text, and selected native fallbacks. The complete accessible-name algorithm also depends on host-language rules, hidden content, shadow DOM, and recursive references. Confirm complex custom controls in the browser accessibility tree.",
            ],
          },
          {
            heading: "How should you review image alt text?",
            body: [
              "An informative image needs a text alternative that serves the same purpose. If an image is the only content of a link or button, its alternative should describe the action or destination. A purely decorative image can correctly use an empty alt so assistive technology ignores it. The checker therefore treats a missing alt as a high-confidence issue and an empty alt as an item that requires context.",
              "Values such as image, photo, or banner-final-v3.jpg rarely explain purpose. The checker warns when an alternative looks like a filename, URL, or generic word, but it does not score writing quality. The correct text depends on whether the same image appears in an article, product card, functional link, or decorative layout.",
              "Complex charts and diagrams may need more than a short alt. Provide a concise summary and make detailed information available in nearby text or a data table when appropriate.",
            ],
          },
          {
            heading: "Why do ARIA references break?",
            body: [
              "Attributes such as aria-labelledby, aria-describedby, and aria-controls point to element IDs. Copying a component or renaming an ID without updating every reference can remove a control's name, description, or relationship. The checker identifies missing targets and duplicate IDs.",
              "ARIA is not a universal patch for missing native semantics. Prefer elements such as button, nav, main, and label when they match the intended role and behavior. This tool does not validate every required state and keyboard interaction for custom widgets. Use the WAI-ARIA Authoring Practices and test complex controls with actual assistive technology.",
            ],
          },
          {
            heading: "How should you interpret estimated tab order?",
            body: [
              "Interfaces are usually easier to maintain when DOM order and native focus behavior provide the sequence. Positive tabindex values move those elements before the regular sequence and create a separate ordering system that can become inconsistent as the page changes. The checker marks positive values for review and estimates their order before native focusable elements and elements with tabindex zero.",
              "The list is not a substitute for browser testing. Pasted HTML does not reveal every CSS-hidden element, flex or grid reordering, script-opened dialog, disabled state, shadow root, or focus trap. Use the result to locate suspicious markup, then test Tab and Shift+Tab in the implemented interface.",
              "A tabindex of -1 can be intentional for an element that receives programmatic focus but should not appear in sequential keyboard navigation. When it is added to a native button or link, review whether keyboard users can still reach the feature.",
            ],
          },
          {
            heading: "How should you read the result levels?",
            body: [
              "High-confidence issue covers cases with a relatively clear source location, such as a missing alt, a broken label association, or a native button without a name. Needs review covers cases that depend on context, such as whether an empty alt is truly decorative or whether a heading jump reflects the intended structure. Manual test covers focus visibility, keyboard traps, visual order, contrast, and dynamic updates that require a running page.",
              "Zero automatic findings do not mean the interface is accessible. Automated checks reduce the area a person needs to inspect. W3C guidance also notes that evaluation tools can quickly identify potential issues but cannot test every accessibility aspect and can produce inaccurate or misleading results.",
            ],
          },
          {
            heading: "A practical pre-PR review sequence",
            body: [
              "Start by pasting the component HTML and fixing high-confidence issues first. Review the heading tree and landmark list for meaningful structure and names, then inspect the estimated tab order for positive tabindex values and unnamed controls. When the markup is clean, copy the Markdown report into the pull request or QA ticket.",
              "Finish in the running interface. Test keyboard operation, focus visibility, visual order, and dynamic updates, and measure rendered text, icon, and component colors in the contrast checker. Capture states and charts in the color blindness simulator to find information conveyed by color alone.",
            ],
          },
        ],
        examples: [
          {
            title: "Checking the built-in sample as a full document",
            input: "The account settings page loaded with the Sample HTML button, in full document scope",
            result:
              "Across 15 elements: 5 high-confidence issues (DOC-001 missing lang, DOC-003 empty title, IMG-001 missing alt, FORM-002 broken label association, NAME-001 unnamed link) and 4 review items (HEAD-002 h1 followed by h3, FORM-003 placeholder-only input, NAME-002 visible text missing from the name, FOCUS-001 positive tabindex)",
            note: "The 8 manual checks are always listed regardless of the findings, so the areas automation cannot reach stay in view.",
          },
          {
            title: "Checking a card component in fragment scope",
            input:
              'A section with an h4 heading, an image-only link without alt, a placeholder-only input, and a div with role="button" and only an onclick handler, in fragment scope',
            result:
              "Across 6 elements: 2 high-confidence issues (IMG-004 unnamed image-only link, IMG-001 missing alt) and 2 review items (FORM-003 placeholder-only input, FOCUS-003 click handler with no keyboard path)",
            note: "A lone h4 is not reported as a skipped level, because there is no earlier heading to compare it with. Fragment scope also skips the page-level lang, title and main rules.",
          },
          {
            title: "Reading estimated tab order with positive tabindex",
            input: 'A form containing a skip link with tabindex="1", a search input, a search button, and a help link with tabindex="3", in that source order',
            result:
              "The estimated order is 1) the skip link with tabindex 1, 2) the help link with tabindex 3, 3) the search input, 4) the search button, with 2 positive tabindex values marked for review",
            note: "The help link is last in the DOM but second in the tab sequence. Removing both positive values restores an order that matches the source.",
          },
        ],
        limitations: [
          "CSS is not evaluated. Display, visibility, flex and grid order, screen position and color contrast cannot be derived from pasted HTML, so they stay in the manual-test list rather than the automatic result.",
          "JavaScript is not executed. Framework-attached event handlers, script-opened dialogs and attributes changed at runtime are invisible to the checker, which reads inline event attributes only.",
          "Pre-build template syntax such as React JSX, Vue SFC and Svelte is not parsed accurately. Convert the markup to browser-readable HTML first, or use a framework-specific linter alongside this tool.",
          "Accessible names are estimated from a limited set of name signals rather than the full standard algorithm. Shadow DOM, slots, pseudo elements, CSS-hidden text and browser-specific HTML-AAM behavior are not represented, so confirm complex custom controls in the accessibility tree.",
          "A result with no findings does not mean the markup conforms to WCAG or to another accessibility standard. This tool reports no score and no pass or fail, and covers only what static source can show.",
          "Input is limited to 500,000 characters and 20,000 elements. Check a larger document one component or section at a time.",
          "The checker does not fetch a URL or crawl a site. Pasted HTML is parsed rather than rendered, so external resources such as images, iframes and stylesheets are never requested.",
        ],
        sources: [
          {
            label: "W3C · WCAG 2.2 Understanding Non-text Content",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html",
          },
          {
            label: "W3C · WCAG 2.2 Understanding Info and Relationships",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html",
          },
          {
            label: "W3C · WCAG 2.2 Understanding Focus Order",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html",
          },
          {
            label: "W3C · WCAG 2.2 Understanding Label in Name",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/label-in-name.html",
          },
          {
            label: "W3C · Selecting Web Accessibility Evaluation Tools",
            url: "https://www.w3.org/WAI/test-evaluate/tools/selecting/",
          },
          {
            label: "W3C · Accessible Name and Description Computation",
            url: "https://www.w3.org/TR/accname-1.2/",
          },
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "HTML 접근성 검사기는 어떤 문제를 찾나요?",
          answer:
            "헤딩 단계, 페이지 언어와 제목, 랜드마크, 이미지 alt, 폼 label 연결, 이름 없는 버튼·링크, 끊어진 ARIA 참조, 양수 tabindex와 예상 탭 순서를 검사합니다. 전체 문서와 컴포넌트 조각은 적용되는 규칙이 다릅니다.",
        },
        {
          question: "검사 결과가 없으면 WCAG 2.2를 준수한 것인가요?",
          answer:
            "아닙니다. 정적 HTML에서 자동으로 확인 가능한 항목만 발견되지 않았다는 뜻입니다. 키보드 조작, 포커스 표시, 색상 대비, 시각적 순서, 동적 상태와 대체 텍스트의 실제 적절성은 구현 화면에서 수동으로 확인해야 합니다.",
        },
        {
          question: "HTML 조각과 전체 문서 중 무엇을 선택해야 하나요?",
          answer:
            "컴포넌트나 페이지 일부만 붙여넣는다면 HTML 조각을, doctype·html·head·body를 포함한 페이지 전체를 검사한다면 전체 문서를 선택하세요. 전체 문서 모드에서만 lang, title, main 같은 페이지 수준 항목을 검사합니다.",
        },
        {
          question: "React JSX나 Vue·Svelte 파일도 검사할 수 있나요?",
          answer:
            "1차 버전은 브라우저가 해석하는 HTML만 지원합니다. JSX의 htmlFor, Vue directive, Svelte 문법처럼 빌드 전 템플릿 문법은 정확히 해석하지 않습니다. 실제 렌더링된 HTML을 복사하거나 프레임워크 전용 린터를 함께 사용하세요.",
        },
        {
          question: "붙여넣은 HTML이 실제 화면에 실행되나요?",
          answer:
            "아닙니다. 코드는 렌더링하거나 활성 DOM에 삽입하지 않고 순수 HTML 파서로 구조만 분석합니다. script, inline event handler와 외부 이미지·iframe을 실행하거나 불러오지 않습니다.",
        },
        {
          question: "입력한 코드나 검사 결과가 서버로 전송되나요?",
          answer:
            "아닙니다. HTML 분석과 보고서 생성은 브라우저에서 이루어지며 원본 코드, 코드 조각과 요소 경로는 Kitfolio 서버나 분석 이벤트로 전송하거나 저장하지 않습니다.",
        },
      ],
      en: [
        {
          question: "What issues does the HTML accessibility checker find?",
          answer:
            "It checks heading levels, page language and title, landmarks, image alt attributes, form-label associations, unnamed buttons and links, broken ARIA references, positive tabindex values, and estimated tab order. Document and fragment scope use different rule sets.",
        },
        {
          question: "Does a result with no findings mean the HTML meets WCAG 2.2?",
          answer:
            "No. It only means the static checks did not find an issue in the pasted markup. Keyboard operation, focus appearance, color contrast, visual order, dynamic states, and the quality of text alternatives still require testing in the implemented interface.",
        },
        {
          question: "Should I choose HTML fragment or full document?",
          answer:
            "Choose HTML fragment for a component or part of a page. Choose full document when the input contains the complete page, including document-level elements. Checks for lang, title, and the primary main landmark only run in document scope.",
        },
        {
          question: "Can the checker inspect React JSX, Vue, or Svelte files?",
          answer:
            "The first release supports browser-readable HTML only. It does not accurately parse framework syntax such as the JSX htmlFor attribute, Vue directives, or Svelte templates. Paste the rendered HTML or use a framework-specific linter alongside this tool.",
        },
        {
          question: "Does the checker execute or render the HTML I paste?",
          answer:
            "No. It parses the structure without inserting the markup into the active page. Scripts and inline event handlers are not executed, and external image or iframe resources are not loaded by the parser.",
        },
        {
          question: "Is my HTML or report sent to a server?",
          answer:
            "No. Parsing and report generation run in your browser. The source, snippets, and element paths are not uploaded to or stored by the Kitfolio server and are not included in analytics events.",
        },
      ],
    },
    og: {
      ko: {
        title: "HTML 접근성 검사기",
        subtitle: "헤딩·alt·label·탭 순서를 코드에서 바로 점검",
      },
      en: {
        title: "HTML Accessibility Checker",
        subtitle: "Review headings, alt text, labels and tab order before your PR",
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
    indexable: true,
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
        guide: [
          {
            heading: "세 가지 그라디언트 타입 이해하기",
            body: [
              "CSS 그라디언트는 크게 세 종류입니다. linear-gradient는 지정한 각도를 따라 색이 직선으로 번지는 가장 흔한 형태로, 버튼·배경·히어로 섹션에 두루 쓰입니다. radial-gradient는 한 점에서 바깥으로 퍼지는 원형으로 은은한 조명 효과나 스포트라이트 느낌을 낼 때 좋고, conic-gradient는 중심을 축으로 각도에 따라 색이 도는 원뿔형으로 파이 차트나 컬러 휠 같은 표현에 적합합니다.",
              "이 도구에서는 타입을 바꿀 때마다 조절 가능한 옵션(각도, 중심 위치 등)이 함께 바뀌고, 미리보기가 실시간으로 갱신됩니다. 세 타입을 직접 전환해 보며 어떤 형태가 원하는 느낌에 가까운지 눈으로 비교하는 것이 가장 빠릅니다.",
            ],
          },
          {
            heading: "색상 정지점으로 분위기 만들기",
            body: [
              "그라디언트의 인상은 색상 정지점(color stop)의 개수와 위치에서 결정됩니다. 두 색만 부드럽게 잇는 2정지점 그라디언트는 차분하고 신뢰감 있는 느낌을 주고, 정지점을 여러 개 두면 화려하고 생동감 있는 배경을 만들 수 있습니다. 정지점 위치를 한쪽으로 몰면 색 전환이 급해지고, 고르게 벌리면 전환이 완만해집니다.",
              "자연스러운 그라디언트를 만드는 요령은 명도뿐 아니라 색상(hue)도 함께 조금씩 옮기는 것입니다. 같은 색의 밝기만 바꾸면 칙칙해 보이기 쉬우므로, 인접한 색상으로 살짝 이동시키면 훨씬 생기 있는 결과가 나옵니다.",
            ],
          },
          {
            heading: "복사한 CSS를 바로 쓰기",
            body: [
              "완성된 그라디언트는 background 속성에 그대로 넣을 수 있는 CSS 코드로 복사됩니다. 별도의 이미지 파일이 아니라 코드이기 때문에 화면 크기에 따라 깨지지 않고, 용량 부담도 없으며, 나중에 색만 살짝 바꾸기도 쉽습니다.",
              "linear·radial 그라디언트는 모든 모던 브라우저에서 동작하고 conic-gradient도 최신 브라우저에서 폭넓게 지원됩니다. 만든 그라디언트를 보관하고 싶다면 생성된 CSS 코드를 복사해 두면 됩니다. 같은 코드를 다시 붙여넣으면 언제든 동일한 결과를 재현할 수 있습니다.",
            ],
          },
        ],
              examples: [
          {
            title: "히어로 섹션 배경용 부드러운 대각선 그라디언트",
            input: "linear · 135deg · #3A70EB → #6486EF, 정지점 2개",
            result: "background: linear-gradient(135deg, #3A70EB 0%, #6486EF 100%);",
            note: "두 색의 명도 차가 작을수록 배경으로 쓰기 편합니다. 명도 차가 크면 그 위에 올라가는 텍스트의 대비가 위치마다 달라져 가독성이 떨어집니다.",
          },
          {
            title: "카드 위 이미지에 겹칠 어두운 오버레이",
            input: "linear · 180deg · rgba(0,0,0,0) 40% → rgba(0,0,0,0.7) 100%",
            result: "아래쪽으로 갈수록 어두워지는 투명 그라디언트 코드",
            note: "이미지 위 흰 텍스트를 읽히게 하는 표준적인 방법입니다. 투명한 쪽을 검정 투명(rgba(0,0,0,0))으로 지정해야 하며, transparent 키워드를 쓰면 일부 브라우저에서 회색기가 도는 중간색이 생깁니다.",
          },
          {
            title: "도넛 차트 느낌의 conic 그라디언트",
            input: "conic · 중심 50% 50% · 정지점 3개를 각도 단위로 배치",
            result: "background: conic-gradient(...); 코드와 실시간 미리보기",
            note: "border-radius: 50% 와 함께 쓰면 라이브러리 없이 간단한 진행률 원형 그래프를 만들 수 있습니다.",
          },
        ],
        limitations: [
          "생성되는 코드는 표준 CSS 문법입니다. -webkit- 같은 벤더 프리픽스는 붙이지 않으므로, 아주 오래된 브라우저를 지원해야 한다면 별도로 추가하세요.",
          "conic-gradient는 Internet Explorer와 구형 모바일 브라우저에서 동작하지 않습니다. 폴백이 필요하면 background-color를 먼저 선언한 뒤 그라디언트를 덮어쓰세요.",
          "그라디언트는 sRGB 색공간에서 보간됩니다. 보색에 가까운 두 색을 이으면 중간에 탁한 회색 구간이 생길 수 있는데, 이때는 중간 정지점을 하나 추가해 경로를 지정하는 편이 낫습니다.",
          "미리보기는 화면 표시용입니다. 인쇄물이나 색 프로파일이 다른 디스플레이에서는 같은 코드라도 다르게 보일 수 있습니다.",
        ],
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
        guide: [
          {
            heading: "Understanding the three gradient types",
            body: [
              "CSS gradients come in three kinds. linear-gradient spreads color in a straight line along an angle you set: the most common form, used for buttons, backgrounds, and hero sections. radial-gradient radiates outward from a point, great for soft lighting or a spotlight effect, and conic-gradient rotates color around a center by angle, well suited to pie charts and color wheels.",
              "In this tool, switching the type also switches the options you can adjust (angle, center position, and so on), and the preview updates live. The fastest way to choose is to flip between the three types and compare by eye which shape is closest to the feel you want.",
            ],
          },
          {
            heading: "Setting the mood with color stops",
            body: [
              "A gradient's character comes from the number and placement of its color stops. A two-stop gradient that eases between two colors feels calm and trustworthy, while several stops can build a vivid, energetic background. Bunching the stops to one side makes the color transition abrupt; spreading them evenly makes it gradual.",
              "The trick to a natural-looking gradient is to shift the hue a little, not just the brightness. Changing only the lightness of a single color tends to look muddy, so nudging toward an adjacent hue gives a far livelier result.",
            ],
          },
          {
            heading: "Putting the copied CSS to work",
            body: [
              "The finished gradient copies out as CSS you can drop straight into a background property. Because it's code rather than an image file, it never pixelates at different screen sizes, adds no file weight, and is easy to re-tint later.",
              "Linear and radial gradients work in every modern browser, and conic-gradient is widely supported in current ones. To keep a gradient you like, just copy the generated CSS: pasting the same code reproduces the exact result any time.",
            ],
          },
        ],
              examples: [
          {
            title: "A soft diagonal gradient for a hero background",
            input: "linear · 135deg · #3A70EB → #6486EF, two stops",
            result: "background: linear-gradient(135deg, #3A70EB 0%, #6486EF 100%);",
            note: "The smaller the lightness gap between the two colors, the easier the gradient is to use as a background. A large gap makes text contrast vary across the surface and hurts readability.",
          },
          {
            title: "A dark overlay to sit on top of a card image",
            input: "linear · 180deg · rgba(0,0,0,0) 40% → rgba(0,0,0,0.7) 100%",
            result: "A transparent-to-dark gradient you can layer over the image",
            note: "This is the standard way to keep white text legible over photos. Specify the transparent end as rgba(0,0,0,0): using the transparent keyword produces a washed-out grey midpoint in some browsers.",
          },
          {
            title: "A conic gradient for a donut-chart look",
            input: "conic · center 50% 50% · three stops placed by angle",
            result: "background: conic-gradient(...) with a live preview",
            note: "Combined with border-radius: 50% this gives you a simple circular progress graphic without pulling in a charting library.",
          },
        ],
        limitations: [
          "The generated code is standard CSS. Vendor prefixes such as -webkit- are not added, so add them yourself if you must support very old browsers.",
          "conic-gradient does not work in Internet Explorer or older mobile browsers. If you need a fallback, declare a background-color first and let the gradient override it.",
          "Gradients interpolate in the sRGB color space. Blending two near-complementary colors can produce a muddy grey band in the middle; adding an intermediate stop to steer the path usually fixes it.",
          "The preview is for on-screen use. The same code can look different in print or on a display with a different color profile.",
        ],
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
            "Copy the generated CSS and keep it in your project or notes: pasting the same code reproduces the exact gradient any time.",
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
    indexable: true,
    badge: "Canvas",
    name: { ko: "Tailwind 팔레트 생성기", en: "Tailwind Palette" },
    relatedTools: ["css-gradient", "json-formatter", "character-counter"],
    seo: {
      ko: {
        title: "Tailwind 팔레트 생성기 | HEX 하나로 11단계 색상",
        description:
          "베이스 색상 하나(HEX)를 입력하면 Tailwind용 11단계 팔레트(50~950)를 자동으로 생성합니다. 각 색상을 클릭해 복사하거나, Tailwind v4 @theme · v3 config · CSS 변수 형태로 코드를 바로 복사하세요. 모든 처리는 브라우저 안에서 이루어집니다.",
        keywords: ["Tailwind 팔레트 생성기", "Tailwind 색상 생성", "11단계 색상 팔레트"],
      },
      en: {
        title: "Tailwind Palette Generator | 11 shades from one HEX",
        description:
          "Enter a single base color (HEX) and instantly generate an 11-shade Tailwind palette (50-950). Click any shade to copy it, or copy the whole palette as a Tailwind v4 @theme block, v3 config or CSS variables. Everything runs in your browser.",
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
              guide: [
          {
            heading: "브랜드 컬러 하나에서 11단계를 만들어야 하는 이유",
            body: [
              "Tailwind로 UI를 만들면 색 하나로는 부족합니다. 버튼 기본 상태에 600, 호버에 700, 눌린 상태에 800, 배경 강조에 50이나 100, 테두리에 200: 이런 식으로 같은 계열 안에서 최소 대여섯 단계가 필요합니다. 그런데 디자인 가이드에서 받는 건 대개 브랜드 컬러 HEX 하나뿐입니다.",
              "손으로 만들려면 HSL의 명도만 균등하게 조정하는 방식을 쓰기 쉬운데, 이렇게 하면 노랑 계열은 중간 단계가 탁해지고 파랑 계열은 어두운 쪽이 뭉개집니다. 사람 눈이 색상마다 밝기를 다르게 느끼기 때문입니다.",
            ],
          },
          {
            heading: "OKLCH로 계산하는 이유",
            body: [
              "이 생성기는 입력한 HEX를 OKLCH 색공간으로 변환한 뒤 단계를 만듭니다. OKLCH는 밝기(L)가 사람이 실제로 느끼는 밝기와 거의 일치하도록 설계된 색공간이라, 같은 L 값이면 노랑이든 파랑이든 비슷한 밝기로 보입니다. 덕분에 색상 계열이 달라도 500은 500끼리, 700은 700끼리 대비가 비슷하게 맞습니다.",
              "먼저 입력한 색의 밝기를 보고 11단계 중 어디에 해당하는지 찾아 그 자리에 고정합니다. 브랜드 컬러가 팔레트 어딘가에 원본 그대로 남아야 하기 때문입니다. 그다음 나머지 단계의 밝기와 채도를 채우되, 색역을 벗어나는 조합은 표현 가능한 범위 안으로 당겨 넣습니다.",
            ],
          },
          {
            heading: "만든 팔레트를 코드에 넣기",
            body: [
              "Tailwind v4는 CSS의 @theme 블록에 --color-{이름}-{단계} 형태로 토큰을 선언합니다. v3라면 tailwind.config.js의 theme.extend.colors에 객체로 넣습니다. 두 형식 모두 복사할 수 있으므로 프로젝트 버전에 맞는 쪽을 고르면 됩니다.",
              "팔레트를 넣은 뒤에는 실제 조합으로 대비를 확인하세요. 본문 텍스트는 배경 대비 4.5:1, 큰 텍스트와 UI 요소는 3:1이 WCAG AA 기준입니다. 경험적으로 흰 배경에는 600 이상, 어두운 배경에는 300 이하가 안전한 출발점이지만, 노랑·연두 계열은 이보다 더 어두운 단계가 필요합니다.",
            ],
          },
        ],
        examples: [
          {
            title: "브랜드 블루로 전체 팔레트 만들기",
            input: "#3A70EB",
            result: "50부터 950까지 11단계가 생성되고, 입력한 색은 명도가 가장 가까운 단계(여기서는 600 부근)에 원본 그대로 배치",
            note: "생성 후 자기 브랜드 컬러가 팔레트 안에 그대로 있는지 확인하세요. 있어야 기존 디자인 자산과 색이 어긋나지 않습니다.",
          },
          {
            title: "밝은 파스텔 색을 입력했을 때",
            input: "#A7B6F6 (연한 라벤더)",
            result: "입력 색이 300 부근에 배치되고, 600~950 구간이 새로 만들어짐",
            note: "밝은 색을 넣으면 어두운 단계가 전부 새로 생성됩니다. 이 구간이 실제 텍스트·버튼에 쓰이므로 대비를 반드시 확인하세요.",
          },
          {
            title: "Tailwind v4 프로젝트에 적용",
            input: "팔레트 이름을 brand로 지정 후 CSS 형식 복사",
            result: "--color-brand-50 … --color-brand-950 토큰 선언 블록",
            note: "globals.css의 @theme 블록에 붙여 넣으면 bg-brand-600, text-brand-900 같은 클래스가 바로 동작합니다.",
          },
        ],
        limitations: [
          "생성된 팔레트는 출발점이지 최종안이 아닙니다. 실제 제품에서는 특정 단계만 미세 조정하는 경우가 많으므로, 접근성 대비를 확인한 뒤 손으로 다듬는 과정을 건너뛰지 마세요.",
          "무채색(회색) 계열은 채도가 거의 0이라 단계별 차이가 밝기로만 나타납니다. 브랜드 톤이 살짝 섞인 중성 회색을 원한다면 채도가 아주 낮은 색을 입력해야 합니다.",
          "OKLCH 계산 결과가 sRGB 색역을 벗어나면 표현 가능한 범위로 당겨집니다. 형광에 가까운 원색을 넣으면 일부 단계의 채도가 기대보다 낮게 나올 수 있습니다.",
          "Tailwind 기본 팔레트와 정확히 같은 값을 재현하지는 않습니다. Tailwind의 기본 색상은 수작업으로 조정된 값이라 어떤 알고리즘으로도 그대로 나오지 않습니다.",
        ],
      },
      en: {
        card: "Generate an 11-shade Tailwind palette (50-950) from one base HEX and copy the code.",
        description:
          "Enter a single base color (HEX) and instantly generate an 11-shade Tailwind palette (50-950). It uses an OKLCH lightness scale to spread shades evenly from a light 50 to a dark 950, pinning your input color to its nearest step. Click any shade to copy its HEX, or copy the whole palette as a Tailwind v4 @theme block, v3 config or CSS variables.",
        howItWorks: ["Enter a base color (HEX)", "Get an 11-shade palette", "Click a swatch or copy the code"],
        aeo: {
          what: "Tailwind Palette Generator is a tool that builds an 11-shade Tailwind CSS color palette (50-950) from a single base color.",
          who: "It is for front-end developers working with Tailwind CSS and designers who need to define color scales and design tokens.",
          how: "Enter a base HEX and shades from 50 to 950 are generated along an OKLCH lightness scale; copy a shade by clicking it, or copy the palette as Tailwind config, an @theme block or CSS variables.",
          why: "You get a consistent light-to-dark scale instantly without hand-tuning each step, speeding up design systems and theme tokens.",
        },
              guide: [
          {
            heading: "Why one brand color has to become eleven",
            body: [
              "Building UI in Tailwind, a single color is never enough. A button needs 600 at rest, 700 on hover, 800 when pressed, 50 or 100 for a tinted background, 200 for a border: at least half a dozen steps within the same family. What the design guide hands over, though, is usually one brand hex.",
              "The tempting shortcut is to step the lightness evenly in HSL, but that muddies the middle of yellow ramps and crushes the dark end of blue ones, because the eye reads brightness differently at different hues.",
            ],
          },
          {
            heading: "Why the math runs in OKLCH",
            body: [
              "This generator converts your hex into the OKLCH color space before building the ramp. OKLCH is designed so that its lightness channel matches perceived brightness, which means the same L value looks about equally bright whether the hue is yellow or blue. As a result, 500 sits at a comparable contrast to 500 and 700 to 700 even across different hue families.",
              "It first measures the lightness of your color to find which of the eleven steps it belongs to and pins the original there, so your brand color survives untouched somewhere in the palette. The remaining steps are then filled in, with any combination that falls outside the displayable gamut pulled back into range.",
            ],
          },
          {
            heading: "Getting the palette into your code",
            body: [
              "Tailwind v4 declares tokens in a CSS @theme block as --color-{name}-{step}. On v3 they go into theme.extend.colors in tailwind.config.js as an object. Both formats are available to copy, so pick the one matching your project.",
              "Once it is in, check contrast with the combinations you actually ship. WCAG AA asks for 4.5:1 for body text and 3:1 for large text and UI components. As a rough starting point, 600 and above works on white and 300 and below works on dark backgrounds, though yellow and lime ramps need to go darker still.",
            ],
          },
        ],
        examples: [
          {
            title: "Building a full ramp from a brand blue",
            input: "#3A70EB",
            result: "Eleven steps from 50 to 950, with your color placed unchanged at the step closest in lightness (around 600 here)",
            note: "After generating, confirm your brand color is still present verbatim. That is what keeps the palette consistent with existing brand assets.",
          },
          {
            title: "Starting from a light pastel",
            input: "#A7B6F6, a pale lavender",
            result: "The input lands near 300 and the entire 600-950 range is newly generated",
            note: "A light input means every dark step is invented. Those are the steps used for text and buttons, so check their contrast carefully.",
          },
          {
            title: "Applying it in a Tailwind v4 project",
            input: "Name the palette brand and copy the CSS format",
            result: "A block declaring --color-brand-50 through --color-brand-950",
            note: "Paste it into the @theme block in globals.css and classes like bg-brand-600 and text-brand-900 work immediately.",
          },
        ],
        limitations: [
          "The generated palette is a starting point, not a finished system. Real products usually nudge individual steps, so do not skip the pass where you check accessible contrast and adjust by hand.",
          "Near-grey inputs have almost no chroma, so the steps differ by lightness alone. For a neutral grey that carries a hint of the brand hue, feed in a color with very low but non-zero saturation.",
          "Where the OKLCH result falls outside the sRGB gamut it is clamped back into range. Very vivid, near-fluorescent inputs can therefore produce steps less saturated than expected.",
          "It does not reproduce Tailwind's built-in palettes exactly. Those default colors were hand-tuned, so no algorithm reconstructs them precisely.",
        ],
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
            "아니요. 색 계산은 전부 브라우저 안에서 이루어지며, 입력한 색상값은 서버로 전송되거나 저장되지 않습니다.",
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
            "No. All color math runs in your browser; the color values you enter are never uploaded or stored.",
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
  {
    slug: "open-graph-preview",
    layout: "canvas",
    cat: "design",
    targets: ["pm", "designer", "developer"],
    ico: "◧",
    ready: true,
    indexable: true,
    badge: "Canvas",
    name: { ko: "OG 미리보기 테스트", en: "Open Graph Preview Tester" },
    relatedTools: ["css-gradient", "tailwind-palette-generator", "character-counter"],
    seo: {
      ko: {
        title: "OG 미리보기 테스트 | 카카오톡·Facebook·X 공유 카드 확인",
        description:
          "OG 이미지 파일, 이미지 URL 또는 SVG·HTML/CSS 코드를 입력하고 제목과 설명이 카카오톡, Facebook, X, Threads, LinkedIn, 네이버 블로그, Notion에서 어떻게 보이는지 비교하세요. 모든 처리는 브라우저에서 진행되며 이미지 파일은 서버로 전송되지 않습니다.",
        keywords: [
          "OG 미리보기",
          "OG 이미지 테스트",
          "오픈그래프 미리보기",
          "카카오톡 링크 미리보기",
          "SNS 공유 이미지",
          "Open Graph 테스트",
          "링크 카드 미리보기",
        ],
      },
      en: {
        title: "Open Graph Preview Tester | Compare Social Link Cards",
        description:
          "Preview an Open Graph image, title, and description across KakaoTalk, Facebook, X, Threads, LinkedIn, Naver Blog, and Notion. Upload an image, enter an image URL, or render SVG and HTML/CSS code directly in your browser without sending files to a server.",
        keywords: [
          "Open Graph preview",
          "OG image tester",
          "social media preview",
          "link card preview",
          "Facebook link preview",
          "X card preview",
          "LinkedIn post preview",
        ],
      },
    },
    content: {
      ko: {
        card: "OG 이미지와 제목·설명이 주요 플랫폼에서 어떻게 보이는지 비교합니다.",
        description:
          "이미지 파일, 이미지 URL 또는 생성 코드를 입력하고 카카오톡, Facebook, X, Threads, LinkedIn, 네이버 블로그, Notion의 링크 카드 형태를 한 화면에서 비교하세요. 플랫폼별 이미지 크롭과 제목·설명 노출 형태를 배포 전에 확인할 수 있으며, 모든 처리는 브라우저 안에서 이루어집니다.",
        howItWorks: [
          "이미지 첨부, 이미지 URL 또는 생성 코드 중 하나를 선택합니다.",
          "제목과 설명, 표시 도메인을 입력합니다.",
          "플랫폼별 이미지 크롭과 텍스트 노출 형태를 비교합니다.",
        ],
        aeo: {
          what: "OG 미리보기 테스트는 이미지와 메타 텍스트가 주요 플랫폼의 링크 카드에서 어떻게 보이는지 시뮬레이션하는 도구입니다.",
          who: "웹페이지, 콘텐츠, 캠페인 또는 프로덕트의 공유 이미지를 검수하는 PM, 디자이너와 개발자를 위한 도구입니다.",
          how: "이미지 파일, 이미지 URL 또는 SVG·HTML/CSS 코드를 입력하고 제목과 설명을 추가하면 플랫폼별 프리뷰를 생성합니다.",
          why: "페이지를 배포하기 전에 이미지 크롭, 해상도, 제목과 설명의 잘림 가능성을 확인할 수 있습니다.",
        },
              guide: [
          {
            heading: "링크 카드는 플랫폼마다 다르게 잘린다",
            body: [
              "같은 URL을 공유해도 카카오톡, X, LinkedIn, 네이버 블로그, Notion에서 보이는 모습은 제각각입니다. 이미지 비율이 다르고, 제목을 몇 줄까지 보여줄지가 다르고, 설명을 아예 한 줄만 남기거나 이미지를 오른쪽 작은 썸네일로 밀어 넣기도 합니다. 그래서 한 곳에서 예쁘게 보이도록 맞춘 OG 태그가 다른 곳에서는 제목이 중간에 잘려 의미가 깨지는 일이 흔합니다.",
              "이 도구는 제목·설명·이미지·도메인을 넣고 플랫폼을 바꿔 가며 그 차이를 눈으로 비교하기 위한 것입니다. 실제 배포 전에 어느 플랫폼에서 무엇이 잘리는지 확인하면, 가장 빡빡한 곳을 기준으로 카피를 다듬을 수 있습니다.",
            ],
          },
          {
            heading: "안전하게 통하는 값의 범위",
            body: [
              "이미지는 1200×630(1.91:1)이 가장 무난합니다. X는 2:1에 가깝게, 네이버 블로그는 정사각형에 가깝게 잘라 쓰므로, 중요한 텍스트나 로고는 이미지 가장자리가 아니라 가운데 안전 영역에 두어야 어느 쪽으로 잘려도 살아남습니다.",
              "제목은 대체로 두 줄까지 보이지만 카드 폭이 좁은 곳에서는 40자 안팎에서 끊깁니다. 설명은 X·Threads·LinkedIn처럼 한 줄만 보이는 곳이 있어, 첫 문장에 핵심을 담고 뒤에 부연을 붙이는 순서가 안전합니다. 앞부분에 브랜드명을 반복해서 넣으면 정작 내용이 잘려 나갑니다.",
            ],
          },
          {
            heading: "미리보기가 실제와 다를 때",
            body: [
              "이 도구는 각 플랫폼의 레이아웃 규칙을 재현한 시뮬레이션입니다. 실제 카드는 플랫폼이 URL을 크롤링해 만들기 때문에, 태그를 고쳤는데도 예전 이미지가 계속 뜨는 일이 자주 생깁니다. 대부분 플랫폼이 OG 정보를 캐시하기 때문입니다.",
              "이럴 때는 각 플랫폼의 디버거(페이스북 공유 디버거, X 카드 밸리데이터, 카카오 개발자 도구 등)에서 캐시를 갱신해야 합니다. 또한 로그인이 필요한 페이지나 robots.txt로 크롤러를 막은 페이지는 아예 카드가 생성되지 않습니다.",
            ],
          },
        ],
        examples: [
          {
            title: "가장 빡빡한 플랫폼 기준으로 제목 다듬기",
            input: "제목 \"Kitfolio | 일하는 사람을 위한 작은 웹 도구 모음: 계산기·생성기·유틸리티\"",
            result: "카카오톡·Facebook에서는 두 줄로 보이지만 좁은 카드에서는 뒷부분이 잘림",
            note: "브랜드명을 앞에 두면 잘렸을 때 남는 것이 브랜드명뿐입니다. 페이지 내용을 앞에, 브랜드명을 뒤에 두는 순서가 더 안전합니다.",
          },
          {
            title: "이미지 비율에 따른 잘림 확인",
            input: "1200×630 이미지 · 플랫폼을 X와 네이버 블로그로 전환",
            result: "X는 위아래가, 네이버 블로그는 좌우가 잘려 다른 영역이 보임",
            note: "로고를 모서리에 배치했다면 한쪽 플랫폼에서는 사라집니다. 중요한 요소는 중앙 60% 안에 두세요.",
          },
          {
            title: "설명 한 줄 플랫폼 대응",
            input: "설명 \"설치 없이 브라우저에서 바로 쓰는 도구 모음입니다. 가입도 필요 없습니다.\"",
            result: "X·LinkedIn에서는 첫 문장만 노출",
            note: "두 번째 문장에 핵심 정보를 두면 주요 플랫폼에서 아예 보이지 않습니다.",
          },
        ],
        limitations: [
          "실제 플랫폼의 렌더링을 그대로 재현하지는 않습니다. 각 서비스는 디자인을 예고 없이 바꾸고 A/B 테스트도 하므로, 이 미리보기는 근사치로 보고 최종 확인은 해당 플랫폼에서 직접 하세요.",
          "URL을 크롤링해 OG 태그를 읽어 오지 않습니다. 제목·설명·이미지를 직접 입력해 비교하는 도구이며, 이미 배포된 페이지의 태그가 무엇인지 조회하려면 각 플랫폼의 공식 디버거를 쓰세요.",
          "플랫폼의 OG 캐시 갱신은 이 도구로 할 수 없습니다. 태그를 바꿨는데 옛 카드가 계속 보인다면 해당 플랫폼 디버거에서 다시 스크랩해야 합니다.",
          "지원 플랫폼은 카카오톡·Facebook·X·Threads·LinkedIn·네이버 블로그·Notion 일곱 가지입니다. 슬랙·디스코드 등 다른 서비스의 카드 형태는 포함되어 있지 않습니다.",
        ],
      },
      en: {
        card: "Compare how an Open Graph image, title, and description appear across major platforms.",
        description:
          "Upload an image, enter an image URL, or render SVG and HTML/CSS code to compare link card layouts across KakaoTalk, Facebook, X, Threads, LinkedIn, Naver Blog, and Notion. Spot image cropping and truncated titles or descriptions before you publish: everything runs in your browser.",
        howItWorks: [
          "Upload an image, enter an image URL, or paste supported image source code.",
          "Enter the title, description, and display domain.",
          "Compare image crops and text layouts across platforms.",
        ],
        aeo: {
          what: "The Open Graph Preview Tester simulates how an image and metadata text may appear in link cards across major platforms.",
          who: "It is designed for product managers, designers, and developers reviewing social sharing assets.",
          how: "The tool accepts an uploaded image, a direct image URL, or SVG and HTML/CSS code, then applies the content to platform-specific preview layouts.",
          why: "It helps identify image cropping, low resolution, and truncated titles or descriptions before a page is published.",
        },
              guide: [
          {
            heading: "Every platform crops link cards differently",
            body: [
              "Share the same URL and it looks different in KakaoTalk, X, LinkedIn, Naver Blog and Notion. Image ratios differ, the number of title lines differs, and some services cut the description to a single line or push the image into a small thumbnail on the right. So OG tags tuned to look good in one place routinely end up with a title truncated mid-phrase somewhere else.",
              "This tool exists to put a title, description, image and domain in one place and flip between platforms to see those differences. Checking before you ship lets you tune the copy against the tightest layout rather than discovering it after the fact.",
            ],
          },
          {
            heading: "Values that hold up across platforms",
            body: [
              "For images, 1200×630 (1.91:1) is the safest default. X crops closer to 2:1 and Naver Blog closer to a square, so any critical text or logo belongs in a central safe area rather than near the edges, where it survives either crop.",
              "Titles generally get two lines, but on narrow cards they break somewhere around 40 characters. Descriptions are cut to one line on X, Threads and LinkedIn, so lead with the point and put elaboration after it. Repeating the brand name up front means the actual content is what gets truncated.",
            ],
          },
          {
            heading: "When the preview and reality disagree",
            body: [
              "This is a simulation of each platform's layout rules. Real cards are built by the platform crawling your URL, which is why an old image often keeps appearing after you have already fixed the tags: most platforms cache OG data.",
              "The fix is to refresh the cache in that platform's own debugger, such as the Facebook Sharing Debugger, the X Card Validator, or Kakao's developer tools. Pages behind a login, or blocked from crawlers in robots.txt, will not produce a card at all.",
            ],
          },
        ],
        examples: [
          {
            title: "Tuning a title against the tightest layout",
            input: "Title: \"Kitfolio | Small tools for modern knowledge workers: calculators, generators, utilities\"",
            result: "Two lines on KakaoTalk and Facebook, with the tail cut off on narrower cards",
            note: "Leading with the brand name means the brand name is all that survives truncation. Putting the page subject first and the brand last is safer.",
          },
          {
            title: "Seeing how the image ratio crops",
            input: "A 1200×630 image, switching between X and Naver Blog",
            result: "X trims the top and bottom while Naver Blog trims the sides, exposing different regions",
            note: "A logo tucked into a corner disappears on one of them. Keep anything important within the central 60%.",
          },
          {
            title: "Writing for single-line description platforms",
            input: "Description: \"A set of tools that run in your browser. No installation and no sign-up needed.\"",
            result: "Only the first sentence appears on X and LinkedIn",
            note: "Anything essential placed in the second sentence is invisible on major platforms.",
          },
        ],
        limitations: [
          "It does not reproduce each platform's rendering exactly. Services redesign without notice and run A/B tests, so treat the preview as an approximation and confirm on the platform itself.",
          "It does not crawl a URL to read its OG tags. You enter the title, description and image yourself; to inspect tags on an already-published page, use the platform's official debugger.",
          "It cannot refresh a platform's OG cache. If you changed the tags and the old card persists, re-scrape the URL in that platform's debugger.",
          "Seven platforms are covered: KakaoTalk, Facebook, X, Threads, LinkedIn, Naver Blog and Notion. Card layouts for other services such as Slack or Discord are not included.",
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "OG 미리보기 테스트란 무엇인가요?",
          answer:
            "OG 이미지와 제목, 설명이 주요 플랫폼의 링크 카드에서 어떻게 보일지 비교하는 도구입니다. 이미지 크롭과 텍스트 잘림 가능성을 페이지 배포 전에 확인할 수 있습니다.",
        },
        {
          question: "어떤 방식으로 이미지를 입력할 수 있나요?",
          answer:
            "PNG, JPG, WebP 파일을 직접 첨부하거나 이미지 파일 URL을 입력할 수 있습니다. SVG 또는 정적 HTML/CSS 코드를 이미지로 렌더링하는 방식도 지원합니다.",
        },
        {
          question: "이미지 URL을 불러오지 못하는 이유는 무엇인가요?",
          answer:
            "외부 서버가 이미지 직접 접근을 차단하거나 CORS, 핫링크, 보안 정책을 적용하면 브라우저에서 이미지를 불러오지 못할 수 있습니다. 이 경우 이미지를 직접 첨부하여 확인해야 합니다.",
        },
        {
          question: "실제 플랫폼과 완전히 동일하게 표시되나요?",
          answer:
            "아닙니다. 각 프리뷰는 대표적인 링크 카드 구조를 기준으로 한 시뮬레이션입니다. 실제 결과는 플랫폼 앱 버전, 기기, 이미지 캐시 및 내부 처리 방식에 따라 달라질 수 있습니다.",
        },
        {
          question: "React 또는 Next.js OG 이미지 코드를 실행할 수 있나요?",
          answer:
            "지원하지 않습니다. MVP에서는 SVG와 정적 HTML/CSS 코드만 렌더링하며 JavaScript, React, TSX, Next.js ImageResponse 코드는 실행하지 않습니다.",
        },
        {
          question: "첨부한 이미지와 입력 내용이 서버에 저장되나요?",
          answer:
            "아닙니다. 이미지와 입력 내용은 서버로 전송되거나 저장되지 않으며 모든 처리는 현재 브라우저 안에서 진행됩니다.",
        },
      ],
      en: [
        {
          question: "What is an Open Graph Preview Tester?",
          answer:
            "It is a browser-based tool that simulates how an Open Graph image, title, and description may appear in link cards across major platforms. You can spot image cropping and text truncation before a page is published.",
        },
        {
          question: "How can I add an Open Graph image?",
          answer:
            "You can upload a PNG, JPG, or WebP file, enter a direct image URL, or render supported SVG and static HTML/CSS code.",
        },
        {
          question: "Why does an image URL fail to load?",
          answer:
            "The remote server may block direct image access through CORS, hotlink protection, or other security policies. Upload the image directly when the remote URL cannot be loaded.",
        },
        {
          question: "Are the previews identical to the actual platforms?",
          answer:
            "No. The previews simulate common link card layouts. Actual results may vary depending on the platform, app version, device, cache, and internal processing rules.",
        },
        {
          question: "Can the tool run React or Next.js Open Graph code?",
          answer:
            "No. The MVP supports SVG and static HTML/CSS only. It does not execute JavaScript, React, TSX, npm packages, or Next.js ImageResponse code.",
        },
        {
          question: "Are uploaded images or entered content stored?",
          answer:
            "No. Images and entered content are processed in the browser and are not uploaded to or stored on a server.",
        },
      ],
    },
    og: {
      ko: {
        title: "OG 미리보기 테스트",
        subtitle: "카카오톡·Facebook·X 등 주요 플랫폼의 링크 카드를 비교하세요.",
      },
      en: {
        title: "Open Graph Preview Tester",
        subtitle: "Compare link cards across major sharing platforms.",
      },
    },
  },
  {
    slug: "color-contrast-checker",
    layout: "canvas",
    cat: "design",
    targets: ["designer", "developer"],
    ico: "◐",
    ready: true,
    indexable: true,
    verifiedAt: "2026-09-11",
    badge: "Canvas",
    name: { ko: "명도대비 검사기", en: "Color Contrast Checker" },
    // 색각이상 시뮬레이터가 가장 직접적인 후속 작업이라 open-graph-preview 를 대체한다.
    relatedTools: ["color-blindness-simulator", "tailwind-palette-generator", "css-gradient"],
    seo: {
      ko: {
        title: "명도대비 검사기 | WCAG 색상 대비·팔레트 점검",
        description:
          "전경색과 배경색의 WCAG 2.2 명도대비를 확인하고 본문·큰 글자·UI 컴포넌트의 AA·AAA 충족 여부를 비교하세요. 기준에 미달하면 원래 색의 인상을 유지한 수정 후보를 제안하고, 여러 HEX 색상은 팔레트 매트릭스로 한 번에 점검합니다. 입력한 색상값은 서버로 전송되지 않고 브라우저에서 처리됩니다.",
        keywords: [
          "명도대비 검사",
          "명도 대비 검사기",
          "색상 대비 검사기",
          "WCAG 대비 비율",
          "웹접근성 색상",
          "배경색 글자색 대비",
          "팔레트 접근성 검사",
          "color contrast checker",
        ],
      },
      en: {
        title: "Color Contrast Checker | WCAG Palette Audit",
        description:
          "Check foreground and background colors against WCAG 2.2 contrast requirements for normal text, large text and interface components. Find a close passing color when a pair fails, or paste multiple HEX colors to audit every palette combination in a matrix. Your colors are processed locally in the browser and are never uploaded to a server.",
        keywords: [
          "color contrast checker",
          "wcag contrast checker",
          "accessibility color checker",
          "contrast ratio calculator",
          "accessible color palette",
          "palette contrast matrix",
          "foreground background contrast",
        ],
      },
    },
    content: {
      ko: {
        card: "전경색·배경색의 WCAG 명도대비를 검사하고, 미달하면 통과하는 색상 후보를 제안합니다.",
        description:
          "글자색과 배경색의 대비 비율을 계산해 WCAG 2.2 AA·AAA 충족 여부를 확인하세요. 본문 텍스트·큰 텍스트·UI 컴포넌트 기준을 한 화면에서 비교하고, 기준에 미달하면 원래 색조를 유지한 수정 후보를 제안합니다. 여러 HEX 색상을 붙여넣으면 전경색과 배경색의 모든 조합을 매트릭스로 한 번에 점검할 수 있습니다.",
        howItWorks: [
          "전경색·배경색 또는 HEX 팔레트 입력",
          "WCAG 2.2 대비 비율과 사용 가능한 범위 확인",
          "통과 색상 적용 또는 필요한 조합 선택",
        ],
        aeo: {
          what: "명도대비 검사기는 전경색과 배경색의 상대 휘도 차이를 계산해 WCAG 2.2 기준 충족 여부를 보여주는 브라우저 도구입니다.",
          who: "웹과 앱의 텍스트, 버튼, 입력창, 아이콘, 그래프 색상을 검수하는 디자이너와 프론트엔드 개발자를 위한 도구입니다.",
          how: "두 색의 sRGB 상대 휘도로 대비 비율을 계산하고, 여러 색상을 입력하면 모든 전경색·배경색 조합을 매트릭스로 비교합니다.",
          why: "낮은 대비로 인한 가독성 문제를 시안과 구현 단계에서 발견하고, 기준을 통과하는 대체 색상을 더 빠르게 찾기 위해 사용합니다.",
        },
        guide: [
          {
            heading: "웹접근성 명도대비, 무엇을 검사해야 하나요?",
            body: [
              "명도대비는 글자나 인터페이스 요소가 주변 배경과 얼마나 밝고 어둡게 구분되는지를 나타냅니다. 색상이 서로 달라 보여도 밝기가 비슷하면 대비 비율은 낮을 수 있습니다. 반대로 색조가 비슷해도 밝기 차이가 충분하면 더 높은 대비가 나올 수 있습니다.",
              "따라서 브랜드 컬러의 이름이나 육안 인상만으로 판단하지 말고, 실제 화면에서 함께 놓일 전경색과 배경색을 한 쌍으로 검사해야 합니다.",
            ],
          },
          {
            heading: "WCAG 대비 비율은 어떻게 계산되나요?",
            body: [
              "WCAG 2.2는 sRGB 색상의 상대 휘도를 이용합니다. 두 색 중 밝은 색의 상대 휘도를 L1, 어두운 색을 L2라고 하면 대비 비율은 (L1 + 0.05) / (L2 + 0.05)로 계산합니다. 같은 색끼리는 1:1이고 검정과 흰색은 최대 21:1입니다. 이 수치는 색이 예쁜지 평가하는 점수가 아니라, 특정 용도로 쓸 수 있는 최소한의 밝기 차이를 확인하는 기준입니다.",
              "판정 경계에서는 반올림하면 안 됩니다. 실제 계산값이 4.499:1이라면 화면상 4.50에 가까워 보여도 4.5:1 기준을 통과하지 않습니다. 이 도구는 원시 계산값으로 판정하고, 경계에 가까운 값은 소수점 셋째 자리까지 표시합니다.",
            ],
          },
          {
            heading: "본문·큰 글자·UI의 기준은 서로 다릅니다",
            body: [
              "일반 텍스트와 텍스트 이미지는 AA 4.5:1, AAA 7:1입니다. 큰 텍스트는 AA 3:1, AAA 4.5:1로 완화됩니다. UI 컴포넌트와 의미 있는 그래픽은 AA 3:1이며 별도의 AAA 기준이 없습니다.",
              "큰 텍스트는 일반적으로 18pt, CSS 기준 약 24px 이상인 텍스트를 말합니다. 굵은 글자는 14pt, 약 18.5px 이상이면 큰 텍스트 범주에 들어갈 수 있습니다. 다만 획이 매우 얇거나 형태가 특이한 글꼴은 같은 크기라도 실제로 더 흐리게 보일 수 있습니다. 기준을 간신히 통과한 색상이라면 글자 크기만 키우는 편법보다 대비 자체를 여유 있게 높이는 편이 안전합니다.",
              "로고와 순수 장식 텍스트, 비활성 상태의 UI는 일부 대비 요구에서 예외가 될 수 있습니다. 그러나 로고가 링크나 버튼 역할을 하거나, 비활성처럼 보이는 요소가 실제로 조작 가능하다면 별도 검토가 필요합니다.",
            ],
          },
          {
            heading: "버튼·입력창·아이콘은 어디를 재야 하나요?",
            body: [
              "UI 컴포넌트와 의미 있는 그래픽은 요소를 식별하거나 상태를 이해하는 데 필요한 부분이 인접한 색상과 3:1 이상 대비되어야 합니다. 입력창을 알아보는 유일한 단서가 테두리라면 테두리와 바깥 배경을 검사합니다. 체크박스의 체크 표시, 드롭다운 화살표, 선택 상태 표시, 사용자 정의 포커스 링처럼 기능이나 상태를 전달하는 시각 요소도 주변 색상과 비교해야 합니다.",
              "모든 버튼에 반드시 3:1 테두리가 필요한 것은 아닙니다. 버튼의 텍스트나 아이콘, 배치 맥락만으로 컨트롤의 존재가 분명하다면 전체 클릭 영역의 경계까지 표시할 의무는 없습니다. 대신 실제로 식별에 사용되는 텍스트·아이콘·상태 표시는 해당 기준을 충족해야 합니다.",
            ],
          },
          {
            heading: "팔레트 매트릭스는 이렇게 사용하세요",
            body: [
              "팔레트 감사는 각 색상을 전경색과 배경색으로 놓았을 때의 모든 조합을 보여줍니다. 먼저 본문 텍스트와 표면색 조합에서 4.5:1 이상인 셀을 찾고, 버튼 테두리·아이콘·차트 선처럼 비텍스트 요소에는 3:1 이상인 조합을 확인하세요. 브랜드의 강조색이 본문 텍스트에는 부족하더라도 큰 제목이나 굵은 아이콘에는 쓸 수 있습니다.",
              "매트릭스의 통과 셀이 많다고 좋은 팔레트인 것은 아닙니다. 실제 제품에서 함께 배치할 조합만 선택하고, 기본·호버·포커스·선택·오류 상태까지 확인해야 합니다. 같은 색이 밝은 배경에서는 통과하지만 어두운 배경에서는 실패할 수 있으므로 라이트·다크 테마가 있다면 각각 검사하세요.",
            ],
          },
          {
            heading: "기준에 미달한 색상은 어떤 순서로 수정하나요?",
            body: [
              "본문 텍스트라면 배경을 유지하고 글자색을 먼저 더 어둡거나 밝게 조정합니다. 브랜드 컬러를 반드시 유지해야 한다면, 그 색을 텍스트나 아이콘보다 넓은 배경 또는 장식 요소로 역할을 바꾸고 실제 정보에는 별도의 고대비 색상을 쓰는 편이 낫습니다.",
              "UI 테두리나 아이콘은 주변 배경과 3:1 이상이 되도록 조정합니다. 얇은 선은 수치상 통과해도 흐리게 보일 수 있으므로 대비에 여유를 둡니다. 큰 텍스트의 3:1 예외를 적용하려면 실제로 전달되는 크기와 굵기가 큰 텍스트 기준을 충족하는지 먼저 확인해야 합니다. 오류·성공·선택 상태는 색만 바꾸지 말고 텍스트, 아이콘, 패턴 또는 형태를 함께 제공합니다.",
              "이 도구의 수정 후보는 원래 hue를 유지하면서 밝기를 우선 조정하고, 화면에서 표현 가능한 sRGB 색역을 벗어날 때만 채도를 필요한 만큼 낮춥니다. 제안값은 빠른 출발점이지 브랜드 가이드와 실제 화면 검수를 대신하는 최종 정답은 아닙니다.",
            ],
          },
          {
            heading: "높은 명도대비만으로 색상 접근성이 끝나지는 않습니다",
            body: [
              "명도대비 기준과 '색상만으로 정보를 전달하지 말 것'은 별개의 요구사항입니다. 빨간색 오류와 초록색 성공 상태가 각각 배경과 충분히 대비되더라도, 색만 바뀌고 텍스트나 아이콘이 없다면 상태를 구분하지 못하는 사용자가 생깁니다. 오류 문구, 체크 아이콘, 선의 패턴, 직접적인 상태 라벨처럼 색 이외의 단서를 함께 제공해야 합니다.",
              "본문 속 링크를 밑줄 없이 색상만으로 구분한다면 링크색은 주변 일반 텍스트와 3:1 이상 차이가 나야 하고, 포커스나 호버 시에는 밑줄 같은 추가 시각 단서를 제공하는 방식이 권장됩니다. 가장 단순하고 안정적인 방법은 기본 상태에서도 링크에 밑줄이나 명확한 형태 차이를 두는 것입니다.",
            ],
          },
          {
            heading: "배포 전 색상 접근성 체크리스트",
            body: [
              "본문과 placeholder 텍스트가 실제 배경과 4.5:1 이상인지, 3:1 기준을 적용한 제목이 실제로 큰 텍스트 크기와 굵기를 충족하는지 확인합니다. 입력창 테두리, 아이콘, 포커스 표시, 선택 상태도 인접 색상과 3:1 이상이어야 합니다.",
              "라이트·다크 테마와 기본·호버·포커스·선택·오류 상태를 모두 확인하고, 그라디언트나 이미지 위 텍스트는 가장 대비가 낮은 영역에서도 읽히는지 봅니다. 마지막으로 오류와 상태, 차트 범례, 링크를 색상만으로 구분하고 있지 않은지 점검합니다.",
            ],
          },
        ],
        examples: [
          {
            title: "흰 배경 위 연한 회색 본문 텍스트",
            input: "전경색 #9CA3AF · 배경색 #FFFFFF",
            result: "2.54:1 · 본문 AA(4.5:1)는 물론 큰 텍스트·UI 기준(3:1)에도 미달",
            note: "본문 AA를 목표로 두고 전경색을 조정하면 #707782(4.52:1)가 제안됩니다. 회색 톤은 그대로 두고 밝기만 낮춘 값입니다.",
          },
          {
            title: "브랜드 블루 버튼 위의 흰 글자",
            input: "전경색 #FFFFFF · 배경색 #6486EF",
            result: "3.39:1 · 큰 텍스트와 UI 컴포넌트 기준(3:1)은 통과하지만 본문 AA(4.5:1)는 미달",
            note: "버튼 라벨이 작은 글자라면 조정 대상을 배경색으로 바꾸세요. #5170D7(4.52:1)이 제안되어 흰 글자를 그대로 쓸 수 있습니다.",
          },
          {
            title: "그레이 스케일 팔레트 5색 감사",
            input: "#0F172A #334155 #64748B #E2E8F0 #FFFFFF 붙여넣기",
            result: "5×5 매트릭스 25칸. 같은 색끼리인 5칸은 1:1이고, 나머지 20칸 중 본문 AA 이상이 10칸, 3:1 미만 미달이 6칸",
            note: "#64748B는 흰 배경에서 4.76:1로 본문에 쓸 수 있지만 #E2E8F0 위에서는 3.86:1이라 큰 글자·UI 용도까지만 가능합니다.",
          },
        ],
        limitations: [
          "입력한 두 개의 불투명 단색만 계산합니다. 그라디언트·사진·배경 이미지·반투명 오버레이는 위치마다 실제 배경색이 달라지므로, 가장 대비가 낮은 지점의 색을 직접 골라 따로 검사해야 합니다.",
          "투명도가 포함된 4자리·8자리 알파 HEX와 RGB·HSL·OKLCH 함수 표기는 아직 입력할 수 없습니다. 불투명 3자리·6자리 HEX로 변환해 입력하세요.",
          "한 쌍의 색상이 통과했다는 것은 그 조합이 기준을 만족한다는 뜻일 뿐, 페이지 전체가 WCAG나 한국형 웹 콘텐츠 접근성 지침을 준수한다는 뜻이 아닙니다. 키보드 접근, 대체 텍스트, 구조, 포커스, 상태 전달은 별도로 확인해야 합니다.",
          "수정 후보는 한쪽 색만 조정해서 목표에 도달할 수 있을 때만 제안합니다. 중간 밝기 배경처럼 어느 방향으로도 목표에 도달할 수 없는 조합에서는 억지로 후보를 만들지 않고 반대 색상도 함께 조정하도록 안내합니다.",
          "팔레트 감사는 한 번에 최대 12색까지 검사합니다. 색이 더 많다면 실제 화면에서 함께 쓰이는 색끼리 묶어 나눠 검사하세요.",
          "안티앨리어싱, 디스플레이 상태, 글꼴의 실제 획 두께는 계산에 반영되지 않습니다. 수치상 간신히 통과한 조합은 실제 화면에서 한 번 더 확인하는 편이 안전합니다.",
        ],
        sources: [
          {
            label: "W3C · WCAG 2.2 Understanding Contrast (Minimum)",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
          },
          {
            label: "W3C · WCAG 2.2 Understanding Non-text Contrast",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html",
          },
          {
            label: "W3C · WCAG 2.2 Understanding Use of Color",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html",
          },
          {
            label: "한국형 웹 콘텐츠 접근성 지침 2.2",
            url: "https://www.wa.or.kr/board/view.asp?sn=22592",
          },
        ],
      },
      en: {
        card: "Check WCAG contrast for a color pair and get a close passing color when it fails.",
        description:
          "Calculate the contrast ratio between foreground and background colors and check WCAG 2.2 AA and AAA results. Compare the normal text, large text and interface component thresholds on one screen, and when a pair fails, get a passing alternative that keeps the original hue. Paste several HEX colors to audit every foreground and background combination in one matrix.",
        howItWorks: [
          "Enter foreground and background colors or paste a HEX palette",
          "Review the WCAG 2.2 ratio and supported use cases",
          "Apply a passing suggestion or inspect a palette pair",
        ],
        aeo: {
          what: "A color contrast checker calculates the relative luminance difference between foreground and background colors and reports their WCAG 2.2 results.",
          who: "It is for designers and front-end developers reviewing text, controls, icons and data visualization colors for web or app interfaces.",
          how: "It calculates a contrast ratio from the sRGB relative luminance of two colors and compares every foreground and background pair when a palette is provided.",
          why: "It helps teams identify low-contrast combinations during design and implementation and find a close alternative that meets the selected target.",
        },
        guide: [
          {
            heading: "What should you test for accessible color contrast?",
            body: [
              "Color contrast describes how clearly foreground content differs in lightness from its background. Two colors can look different in hue while still having a low contrast ratio if their luminance is similar. The reverse is also true: similar hues can reach a high ratio when their lightness differs enough.",
              "Test the foreground and background colors that will actually appear together instead of judging a brand color by its name or by how it feels on its own.",
            ],
          },
          {
            heading: "How the WCAG contrast ratio is calculated",
            body: [
              "WCAG 2.2 uses the relative luminance of sRGB colors. If L1 is the relative luminance of the lighter color and L2 is that of the darker color, the ratio is (L1 + 0.05) / (L2 + 0.05). Identical colors have a ratio of 1:1, while black and white reach the maximum of 21:1. The ratio is not a visual quality score. It indicates whether a color pair reaches a minimum requirement for a specific use.",
              "Thresholds must be evaluated without rounding. A calculated ratio of 4.499:1 does not meet a 4.5:1 requirement. This tool uses the unrounded value for pass or fail and shows an additional decimal place near a threshold.",
            ],
          },
          {
            heading: "Text, large text and interface elements use different thresholds",
            body: [
              "Normal text and images of text need 4.5:1 for AA and 7:1 for AAA. Large text relaxes to 3:1 for AA and 4.5:1 for AAA. User interface components and meaningful graphics need 3:1 for AA and have no separate AAA threshold.",
              "Large text generally means at least 18pt, approximately 24 CSS pixels, or at least 14pt bold, approximately 18.5 CSS pixels. Very thin or unusual typefaces can appear less legible even when the calculated pair passes. When a result barely reaches the threshold, increasing the contrast is safer than relying on text size alone.",
              "Logotypes, purely decorative text and inactive controls can be exempt from some contrast requirements. A logo that also functions as a control, or a component that only appears disabled, requires separate review.",
            ],
          },
          {
            heading: "What to measure for controls and icons",
            body: [
              "Visual information required to identify a control or understand its state should have at least 3:1 contrast against adjacent colors. If a border is the only cue that an input exists, compare the border with the outer background. Check marks, dropdown arrows, selected-state indicators and custom focus rings should also be compared with the colors next to them.",
              "Not every button needs a 3:1 outline. If text, an icon or the surrounding context already identifies the control, the boundary of the full hit area does not have to be visible. The visual information people actually rely on must still meet its applicable contrast requirement.",
            ],
          },
          {
            heading: "How to use the palette matrix",
            body: [
              "The palette audit compares every color as both foreground and background. Start by finding text-and-surface pairs that reach 4.5:1. Use pairs at or above 3:1 for visible control boundaries, icons and essential chart lines. An accent color that fails for body text may still work for large text or a substantial icon.",
              "A palette is not automatically accessible because it contains many passing cells. Review only combinations that will appear together and include default, hover, focus, selected and error states. Audit light and dark themes separately, because the same foreground color can pass on one surface and fail on another.",
            ],
          },
          {
            heading: "How to fix a failing pair",
            body: [
              "For body text, keep the surface color and adjust the text lighter or darker first. If a brand color must remain unchanged, use it for a larger surface or for decoration and choose a separate high-contrast color for the information itself.",
              "Bring control boundaries and icons above 3:1 against their adjacent colors. Thin lines benefit from extra margin above the minimum. Apply the 3:1 large-text threshold only when the delivered size and weight actually meet the large-text definition. Add text, icons, patterns or shapes to error, success and selected states instead of relying on color alone.",
              "The suggested color keeps the original hue and adjusts lightness first. Chroma is reduced only when necessary to keep a candidate inside the sRGB gamut. Treat the result as a practical starting point, not a replacement for reviewing the actual interface and brand system.",
            ],
          },
          {
            heading: "Contrast is not the same as using color accessibly",
            body: [
              "Meeting a contrast ratio does not satisfy every color requirement. Red error and green success colors can each contrast strongly with the background while still being indistinguishable to a user when color is the only state cue. Add a visible label, icon, pattern or other non-color signal.",
              "When an inline link has no underline and color is the only difference, its color should differ from the surrounding text by at least 3:1 and gain another visual cue on focus or hover. Keeping an underline in the default state is the simpler and more robust choice.",
            ],
          },
          {
            heading: "Pre-release color accessibility checklist",
            body: [
              "Confirm that body text and placeholder text reach 4.5:1 against their actual backgrounds, and that every heading using the 3:1 threshold really is delivered at large-text size and weight. Input boundaries, icons, focus indicators and selected states should reach 3:1 against adjacent colors.",
              "Check light and dark themes along with default, hover, focus, selected and error states, and make sure text over an image or gradient stays readable in its lowest-contrast area. Finally, verify that links, errors, states and chart series are distinguishable without color alone.",
            ],
          },
        ],
        examples: [
          {
            title: "Light grey body text on white",
            input: "Foreground #9CA3AF, background #FFFFFF",
            result: "2.54:1, which misses body AA (4.5:1) and even the 3:1 large text and UI threshold",
            note: "Targeting body AA and adjusting the foreground suggests #707782 at 4.52:1: the same grey tone, only darker.",
          },
          {
            title: "White label on a brand blue button",
            input: "Foreground #FFFFFF, background #6486EF",
            result: "3.39:1, which passes the 3:1 large text and UI component threshold but misses body AA (4.5:1)",
            note: "If the label is small text, switch the adjusted role to the background. #5170D7 at 4.52:1 is suggested, so the white label can stay as it is.",
          },
          {
            title: "Auditing a five-color grey scale",
            input: "Paste #0F172A #334155 #64748B #E2E8F0 #FFFFFF",
            result: "A 5x5 matrix of 25 cells. Five same-color cells are 1:1, and of the remaining 20, ten reach body AA while six fall below 3:1",
            note: "#64748B reaches 4.76:1 on white and works for body text, but only 3.86:1 on #E2E8F0, where it is limited to large text and UI use.",
          },
        ],
        limitations: [
          "Only two opaque solid colors are calculated. Gradients, photographs, background images and translucent overlays create a different effective background across an element, so pick the color at the lowest-contrast point and test it separately.",
          "Four and eight digit alpha HEX values and rgb, hsl or oklch function syntax cannot be entered yet. Convert them to an opaque three or six digit HEX first.",
          "A passing pair means that combination meets the threshold, not that the page conforms to WCAG or to another accessibility standard. Keyboard support, text alternatives, document structure, focus behavior and status communication require separate testing.",
          "A suggestion is offered only when adjusting one color can reach the target. For combinations such as a mid-lightness background, where neither direction reaches the target, no candidate is forced and the tool asks you to adjust the other color too.",
          "The palette audit checks up to 12 colors at a time. For a larger system, split it into groups of colors that actually appear together.",
          "Anti-aliasing, display conditions and the real stroke weight of a typeface are not part of the calculation. A pair that barely passes on paper is worth checking once on the actual screen.",
        ],
        sources: [
          {
            label: "W3C · WCAG 2.2 Understanding Contrast (Minimum)",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
          },
          {
            label: "W3C · WCAG 2.2 Understanding Non-text Contrast",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html",
          },
          {
            label: "W3C · WCAG 2.2 Understanding Use of Color",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html",
          },
          {
            label: "Korean Web Content Accessibility Guidelines 2.2",
            url: "https://www.wa.or.kr/board/view.asp?sn=22592",
          },
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "WCAG 2.2에서 일반 텍스트의 최소 명도대비는 얼마인가요?",
          answer:
            "AA 기준은 4.5:1이고 AAA 기준은 7:1입니다. placeholder와 호버·포커스 시 나타나는 텍스트도 실제로 사용자에게 보이는 텍스트라면 같은 기준으로 확인해야 합니다.",
        },
        {
          question: "큰 텍스트에는 왜 3:1 기준을 적용하나요?",
          answer:
            "큰 글자는 획과 면적이 커서 상대적으로 낮은 대비에서도 읽기 쉽기 때문입니다. 일반적으로 18pt(약 24px) 이상 또는 굵은 14pt(약 18.5px) 이상이어야 큰 텍스트로 봅니다.",
        },
        {
          question: "버튼과 아이콘도 4.5:1을 충족해야 하나요?",
          answer:
            "버튼의 텍스트에는 텍스트 기준을 적용합니다. 다만 컨트롤의 존재나 상태를 식별하는 데 필요한 테두리·아이콘·그래픽에는 일반적으로 3:1 기준을 적용합니다.",
        },
        {
          question: "대비 비율을 통과하면 색상 접근성을 모두 충족한 건가요?",
          answer:
            "아닙니다. 오류, 성공, 선택 상태처럼 의미가 있는 정보는 색상만으로 전달해서는 안 됩니다. 텍스트, 아이콘, 패턴 또는 형태를 함께 사용해야 합니다.",
        },
        {
          question: "가장 가까운 통과 색상은 어떻게 찾나요?",
          answer:
            "원래 색조를 유지한 채 밝기를 우선 조정하고, sRGB 색역을 벗어날 때만 채도를 필요한 만큼 낮춥니다. 목표 대비를 만족하는 후보 중 원본과의 지각 거리가 가장 작은 색상을 제안합니다.",
        },
        {
          question: "입력한 색상이나 팔레트가 서버로 전송되나요?",
          answer:
            "아니요. 색상 파싱, 대비 계산, 수정 후보 생성은 모두 브라우저에서 처리되며 입력값 자체를 Kitfolio 서버로 전송하거나 저장하지 않습니다.",
        },
      ],
      en: [
        {
          question: "What is the minimum WCAG 2.2 contrast ratio for normal text?",
          answer:
            "The Level AA requirement is 4.5:1 and the Level AAA requirement is 7:1. Visible placeholder text and text shown on hover or focus should be checked against the same applicable threshold.",
        },
        {
          question: "Why can large text use a 3:1 contrast ratio?",
          answer:
            "Larger letterforms are generally easier to read at a lower contrast. Large text is usually at least 18pt, about 24 CSS pixels, or at least 14pt bold, about 18.5 CSS pixels.",
        },
        {
          question: "Do buttons and icons need a 4.5:1 contrast ratio?",
          answer:
            "Button text follows the text requirement. Visual information needed to identify a control or its state, including essential borders, icons and graphics, generally follows the 3:1 non-text contrast requirement.",
        },
        {
          question: "Does a passing ratio make a color system fully accessible?",
          answer:
            "No. Information such as errors, success and selected states should not be communicated by color alone. Add text, an icon, a pattern or another visible cue.",
        },
        {
          question: "How does the checker find the closest passing color?",
          answer:
            "It keeps the original hue, adjusts lightness first, and reduces chroma only when required to stay inside the sRGB gamut. It selects a passing candidate with the shortest perceptual distance from the original color.",
        },
        {
          question: "Are my colors or palette sent to a server?",
          answer:
            "No. Color parsing, contrast calculations and suggestions all run in your browser. The colors you enter are never uploaded to or stored on the Kitfolio server.",
        },
      ],
    },
    og: {
      ko: {
        title: "명도대비 검사기",
        subtitle: "WCAG 2.2 대비 검사 + 팔레트 매트릭스",
      },
      en: {
        title: "Color Contrast Checker",
        subtitle: "WCAG 2.2 results and a palette audit matrix",
      },
    },
  },
  {
    slug: "color-blindness-simulator",
    layout: "canvas",
    cat: "design",
    targets: ["designer", "developer", "pm"],
    ico: "◉",
    ready: true,
    indexable: true,
    verifiedAt: "2026-09-11",
    badge: "Canvas",
    name: { ko: "색각이상 시뮬레이터", en: "Color Blindness Simulator" },
    relatedTools: ["color-contrast-checker", "tailwind-palette-generator", "css-gradient"],
    seo: {
      ko: {
        title: "색각이상 시뮬레이터 | 색약·적록색약 시안 미리보기",
        description:
          "웹과 앱의 화면 시안·스크린샷을 Protan, Deutan, Tritan 색각 조건과 흑백 보기로 비교하세요. 강도를 조절하며 상태색, 차트, 링크, 선택 요소가 색상 없이도 구분되는지 확인할 수 있습니다. PNG·JPG·WebP 이미지는 서버에 업로드되지 않고 브라우저에서 처리됩니다.",
        keywords: [
          "색각이상 시뮬레이터",
          "색약 시뮬레이터",
          "적록색약 시뮬레이션",
          "색맹 시뮬레이터",
          "웹접근성 색상 검사",
          "색각이상 시안 검수",
          "color blindness simulator",
        ],
      },
      en: {
        title: "Color Blindness Simulator | Check UI Designs",
        description:
          "Preview a UI design or screenshot under protan, deutan and tritan color vision conditions, or remove color entirely with the grayscale check. Adjust the simulation strength and compare against the original to find status colors, charts, links and selected states that rely on color alone. PNG, JPG and WebP images are processed locally in your browser.",
        keywords: [
          "color blindness simulator",
          "color vision deficiency simulator",
          "color blind design checker",
          "protan deutan tritan simulator",
          "accessibility color checker",
          "ui color accessibility",
          "color blind screenshot preview",
        ],
      },
    },
    content: {
      ko: {
        card: "시안·스크린샷을 색각 조건별로 변환해 색상에만 의존한 구분을 찾습니다.",
        description:
          "화면 시안이나 스크린샷을 여러 색각 조건으로 변환해 색상에만 의존한 정보 구분이 사라지는 지점을 확인하세요. 원본과 결과를 나란히 비교하고 상태색·차트·선택 요소의 보조 단서를 점검할 수 있습니다. Protan·Deutan·Tritan 세 유형과 흑백 점검을 제공하며, 이미지는 브라우저 안에서만 처리됩니다.",
        howItWorks: [
          "검수할 화면 시안이나 스크린샷 올리기",
          "색각 유형과 시뮬레이션 강도 선택",
          "원본과 비교해 색상 없이 구분되지 않는 요소 찾기",
        ],
        aeo: {
          what: "색각이상 시뮬레이터는 화면 시안이나 스크린샷의 색상을 여러 색각 조건으로 변환해 원본과 비교하는 브라우저 도구입니다.",
          who: "상태색, 차트, 지도, 링크, 선택 요소의 색상 접근성을 검수하는 디자이너, 개발자와 PM을 위한 도구입니다.",
          how: "이미지를 브라우저에서 픽셀 단위로 변환하고 Protan·Deutan·Tritan 유형과 강도 또는 흑백 보기를 원본 옆에 표시합니다.",
          why: "색상 차이가 줄어들었을 때 의미와 상태도 함께 사라지는 디자인 문제를 개발 전달이나 배포 전에 찾기 위해 사용합니다.",
        },
        guide: [
          {
            heading: "색각이상 시뮬레이터로 무엇을 확인해야 하나요?",
            body: [
              "이 도구의 목적은 화면을 낯선 색으로 바꿔 보는 데 있지 않습니다. 색상 차이가 줄어들었을 때 정보의 의미, 상태, 우선순위까지 함께 사라지는지를 확인하는 것이 핵심입니다. 성공과 오류, 활성과 비활성, 차트의 여러 계열처럼 색상이 기능을 맡고 있는 영역을 중심으로 원본과 변환 결과를 비교해야 합니다.",
              "WCAG 2.2는 정보 전달, 동작 표시, 응답 유도, 시각 요소 구분에 색상만을 사용하지 않도록 요구합니다. 색을 없애야 한다는 뜻은 아닙니다. 색상을 쓰되 텍스트, 아이콘, 패턴, 형태, 위치 같은 다른 단서도 함께 제공해야 한다는 뜻입니다.",
            ],
          },
          {
            heading: "Protan·Deutan·Tritan은 무엇이 다른가요?",
            body: [
              "Protan은 적색 계열 신호가 달라지는 조건입니다. 일부 빨강이 어둡게 보이거나 녹색·갈색 계열과 가까워져 오류·성공 배지, 빨강·초록 차트 계열, 어두운 배경 위의 빨간 경고에서 문제가 드러나기 쉽습니다.",
              "Deutan은 녹색 계열 신호가 달라지는 조건입니다. 초록·빨강·갈색·주황의 구분이 함께 줄어들어 승인·대기 상태, 지도 범례, 완료율 색상 단계를 확인하기 좋습니다.",
              "Tritan은 청황 계열이 달라지는 조건입니다. 파랑·초록, 보라·빨강, 노랑·분홍 같은 조합의 차이가 줄어들어 파란 링크와 녹색 상태, 보라·빨강 계열 차트, 노란 강조 영역을 점검할 때 씁니다.",
              "이 구분은 검수할 위치를 찾기 위한 실무 요약입니다. 실제로 보이는 색은 원본 색상, 명도, 채도, 주변 배경과 시뮬레이션 강도에 따라 달라집니다. 이름만 보고 특정 색 조합이 반드시 실패한다고 단정하지 말고 실제 시안을 비교하세요.",
            ],
          },
          {
            heading: "시뮬레이션 강도는 어떻게 사용하나요?",
            body: [
              "강도 0%는 원본이고, 값을 높일수록 선택한 색각 조건에서 색상 차이가 더 크게 줄어든 결과를 보여줍니다. 100%는 가장 강한 조건에서도 정보가 유지되는지 확인하는 보수적인 검수값입니다. 먼저 100%에서 사라지는 구분을 찾고, 40~70% 구간에서도 같은 문제가 나타나는지 비교하면 수정 우선순위를 정하기 쉽습니다.",
              "사람마다 색 지각은 연속적으로 다르고 주변 조명, 디스플레이, 색 프로필도 결과에 영향을 줍니다. 한 강도의 이미지가 모든 사용자의 시야를 그대로 나타낸다고 보지 말고, 여러 조건에서도 의미가 유지되는 디자인을 목표로 삼으세요.",
            ],
          },
          {
            heading: "가장 먼저 봐야 할 화면 요소",
            body: [
              "상태와 피드백: 성공을 초록색으로만, 오류를 빨간색으로만 표시하면 두 색의 차이가 줄었을 때 의미도 사라집니다. 상태 텍스트와 서로 다른 아이콘을 함께 쓰세요. 입력 오류도 테두리 색상만 바꾸지 말고 해당 필드 가까이에 원인과 수정 방법을 적어야 합니다.",
              "차트와 데이터 시각화: 범례와 선·막대가 색으로만 연결되면 일부 계열이 합쳐져 보일 수 있습니다. 선 그래프에는 실선·점선·파선과 데이터 포인트 모양을 조합하고, 막대나 영역에는 패턴·테두리·직접 라벨을 쓸 수 있습니다. 순차 데이터는 색조를 늘리는 것보다 명도 단계를 충분히 벌리는 편이 안정적입니다.",
              "링크·탭·선택 상태: 본문 링크, 활성 탭, 선택된 카드가 색상만 달라지는지 확인하세요. 링크에는 밑줄을, 활성 탭에는 굵기나 하단 표시선을, 선택된 카드에는 체크 아이콘이나 테두리 형태를 더하면 색상 차이가 줄어도 상태가 남습니다.",
              "버튼·입력창·아이콘: 버튼 텍스트와 배경, 입력창 테두리와 바깥 배경, 의미 있는 아이콘과 인접 색상의 명도 차이를 확인해야 합니다. 시뮬레이션에서 흐려 보이는 조합은 명도대비 검사기에 두 색을 넣어 WCAG 비율을 수치로 확인하세요.",
            ],
          },
          {
            heading: "흑백 점검은 왜 필요한가요?",
            body: [
              "흑백 보기는 특정 색각 조건을 나타내는 기능이 아니라, 색상이라는 단서를 완전히 제거하는 스트레스 테스트입니다. 원본에서는 분명했던 상태·계열·선택 요소가 흑백에서 모두 같은 회색으로 합쳐진다면 색상 의존도가 높은 디자인일 가능성이 큽니다.",
              "이 도구의 흑백 변환은 채널 평균이 아니라 상대 휘도를 씁니다. 그래서 두 색의 명도대비 비율은 원본과 똑같이 유지되고 색상 단서만 사라집니다. 흑백에서도 구분되지 않는다면 그것은 대비 문제가 아니라 색상에만 의존한 설계라는 뜻입니다.",
              "흑백에서 모든 색이 서로 달라야 하는 것은 아닙니다. 텍스트 라벨, 아이콘, 패턴, 선의 형태로 같은 정보를 알아볼 수 있다면 목적을 달성한 것입니다. 중요한 질문은 '색이 없어도 원래 의미를 찾을 수 있는가'입니다.",
            ],
          },
          {
            heading: "문제를 발견했을 때 수정하는 순서",
            body: [
              "먼저 의미를 직접 말하는 텍스트 라벨을 추가하고, 성공·오류·주의·선택 상태에 서로 다른 아이콘이나 형태를 씁니다. 차트 계열에는 선 스타일, 포인트 모양, 패턴 또는 직접 라벨을 더합니다.",
              "그다음 전경색과 배경색, 인접한 데이터 색상의 명도 차이를 키웁니다. 중요한 상태를 작은 색 점 하나에 맡기지 말고 충분한 면적과 명확한 위치를 주세요. 수정한 시안은 세 가지 보기와 흑백에서 다시 확인합니다.",
              "색을 전부 없애거나 브랜드 팔레트를 버릴 필요는 없습니다. 색상은 빠른 인지와 강조에 유용합니다. 다만 색상 하나가 사라졌을 때 기능과 의미까지 사라지지 않도록 중복 단서를 설계해야 합니다.",
            ],
          },
          {
            heading: "색각 시뮬레이션과 명도대비 검사는 서로 다릅니다",
            body: [
              "색각 시뮬레이션은 서로 다른 색이 비슷하게 보일 가능성을 시각적으로 찾는 도구입니다. 명도대비 검사는 두 색의 상대 휘도 차이가 WCAG 기준을 충족하는지 수치로 판정합니다. 빨강과 초록이 각각 배경과 충분히 대비되어도 두 상태가 색으로만 구분된다면 여전히 문제가 될 수 있고, 반대로 색상 구분은 남아 있어도 글자와 배경의 명도대비가 부족할 수 있습니다.",
              "따라서 시뮬레이터에서 구분 문제를 찾은 뒤 명도대비 검사기로 실제 텍스트·UI 색상 쌍을 확인하는 순서가 좋습니다. 두 검사는 대체 관계가 아니라 보완 관계입니다.",
            ],
          },
          {
            heading: "배포 전 색상 접근성 체크리스트",
            body: [
              "성공·오류·주의·완료 상태에 텍스트나 아이콘이 함께 있는지, 차트 계열을 선 스타일·패턴·모양 또는 직접 라벨로도 구분할 수 있는지 확인합니다. 링크와 활성 탭, 선택된 카드에도 색상 외의 형태 차이가 있어야 합니다.",
              "글자와 아이콘, 입력창 테두리가 실제 배경과 충분히 대비되는지 보고, 라이트·다크 테마와 기본·호버·포커스·선택·오류 상태를 각각 확인합니다. 마지막으로 Protan·Deutan·Tritan과 흑백 보기에서 핵심 과업을 끝내는 데 필요한 정보가 남아 있는지 점검하세요.",
            ],
          },
        ],
        examples: [
          {
            title: "예시 시안의 상태 점을 Deutan 100%로 보기",
            input: "내장 예시 시안 · Deutan · 강도 100%",
            result: "완료 상태의 초록 #16A34A는 #958951로, 실패 상태의 빨강 #DC2626은 #8F801B로 수렴해 두 색의 대비 비율이 1.47:1에서 1.13:1로 떨어진다",
            note: "라벨 없이 점 색상만으로 상태를 표시한 영역은 사실상 구분되지 않습니다. 상태 텍스트나 서로 다른 아이콘을 함께 두어야 합니다.",
          },
          {
            title: "같은 시안을 Protan 100%와 비교",
            input: "내장 예시 시안 · Protan · 강도 100%",
            result: "같은 두 색이 #A49442와 #635923이 되어 색상은 비슷해지지만 명도 차이는 남아 대비 비율이 2.31:1이 된다",
            note: "유형에 따라 남는 단서가 다릅니다. Deutan에서 사라진 구분이 Protan에서는 밝기로 일부 남을 수 있으므로 세 유형을 모두 확인해야 합니다.",
          },
          {
            title: "흑백 점검으로 색상 의존도 확인",
            input: "내장 예시 시안 · 흑백 점검",
            result: "파란 링크 #2563EB는 #6D6D6D, 본문 글자 #334155는 #404040이 되어 명도대비 2.00:1은 그대로 유지되지만 색상 단서는 완전히 사라진다",
            note: "흑백 점검은 명도 차이를 그대로 두고 색상만 제거합니다. 여기서 합쳐지는 요소가 있다면 밑줄·아이콘·형태 같은 단서를 더해야 합니다.",
          },
        ],
        limitations: [
          "스크린샷에는 호버, 키보드 포커스, 로딩, 오류, 비활성, 드래그 같은 모든 상태가 담기지 않습니다. 중요한 상태마다 별도 이미지를 올리거나 실제 구현 화면에서 다시 확인해야 합니다.",
          "이미지 안의 요소가 색상 외 단서로 충분히 구분되는지는 사람이 판단해야 하므로 이 도구는 자동 합격 점수나 접근성 준수 판정을 제공하지 않습니다.",
          "시뮬레이션은 연구 모델을 사용한 근사 결과입니다. 개인별 색 지각과 실제 디스플레이 환경을 그대로 재현할 수는 없으므로, 픽셀 단위 절대값이 아니라 구분이 사라지는 위치를 찾는 검수 자료로 쓰세요.",
          "넓은 색역으로 저장된 이미지는 브라우저 캔버스의 처리 색 공간으로 변환되면서 원본과 색이 조금 달라질 수 있습니다.",
          "PNG·JPG·WebP만 지원하며 파일은 10MB, 해상도는 40메가픽셀까지 받습니다. 미리보기는 반응 속도를 위해 최대 2메가픽셀로 비율을 유지한 채 축소해 처리합니다.",
          "저시력 흐림, 백내장, 눈부심처럼 색각이상이 아닌 다른 시각 조건은 다루지 않습니다. 대비 부족 영역을 자동으로 표시하는 히트맵도 제공하지 않습니다.",
        ],
        sources: [
          {
            label: "W3C · WCAG 2.2 Understanding Use of Color",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html",
          },
          {
            label: "W3C · WCAG 2.2 Understanding Contrast (Minimum)",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
          },
          {
            label: "W3C · WCAG 2.2 Understanding Non-text Contrast",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html",
          },
          {
            label: "Machado, Oliveira, Fernandes · A Physiologically-based Model for Simulation of Color Vision Deficiency (2009)",
            url: "https://pubmed.ncbi.nlm.nih.gov/19834201/",
          },
          {
            label: "National Eye Institute · Types of Color Vision Deficiency",
            url: "https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/color-blindness/types-color-vision-deficiency",
          },
        ],
      },
      en: {
        card: "Simulate color vision conditions on a design to find distinctions that rely on color alone.",
        description:
          "Preview a UI design or screenshot under different color vision conditions to find where information depends on color alone. Compare the original and the simulated result side by side and review status colors, chart series and selected states for non-color cues. Protan, deutan and tritan views plus a grayscale check are available, and images are processed entirely in your browser.",
        howItWorks: [
          "Add a UI design or screenshot",
          "Choose a color vision type and simulation strength",
          "Compare both views and find elements that rely on color alone",
        ],
        aeo: {
          what: "A color blindness simulator transforms the colors in a UI design or screenshot and compares the simulated result with the original image.",
          who: "It is for designers, developers and product managers reviewing color accessibility in status indicators, charts, maps, links and selected controls.",
          how: "It processes image pixels locally and displays protan, deutan, tritan or grayscale views next to the original at the selected simulation strength.",
          why: "It helps teams find places where reduced color differences also remove meaning, state or visual separation before implementation or release.",
        },
        guide: [
          {
            heading: "What should you check with a color blindness simulator?",
            body: [
              "The purpose of this tool is not simply to recolor a screen. It is to reveal whether meaning, state and priority disappear when color differences become less distinct. Compare the original and simulated views around elements where color performs a function, including success and error states, active and inactive controls, and multiple chart series.",
              "WCAG 2.2 requires that color is not the only visual means of conveying information, indicating an action, prompting a response or distinguishing an element. This does not mean removing color. It means pairing color with text, icons, patterns, shapes, position or another visible cue.",
            ],
          },
          {
            heading: "How protan, deutan and tritan views differ",
            body: [
              "Protan describes a change in the red signal. Some reds appear darker or move closer to greens and browns, so red and green status badges, chart series, and red warnings on dark surfaces are where problems tend to show.",
              "Deutan describes a change in the green signal. Differences among greens, reds, browns and oranges decrease together, which makes it useful for approval states, map legends and progress color scales.",
              "Tritan affects the blue-yellow range. Differences can decrease among blue-green, purple-red and yellow-pink combinations, so use it to review blue links next to green states, purple and red charts, and yellow highlights.",
              "Treat these as a guide to where to look, not as a prediction that every listed pair will fail. The visible result depends on the source colors, luminance, saturation, background and the selected strength, so compare the actual design.",
            ],
          },
          {
            heading: "How to use simulation strength",
            body: [
              "At 0%, the result matches the original. Increasing the value reduces color differences according to the selected condition. A 100% view is a conservative stress test for checking whether information survives a strong transformation. Start at 100% to find lost distinctions, then compare intermediate values such as 40% to 70% to prioritize changes.",
              "Color perception varies continuously, and lighting, displays and color profiles also affect the result. Do not treat one setting as a universal view. Design so that meaning remains available across several conditions and strengths.",
            ],
          },
          {
            heading: "Elements to review first",
            body: [
              "Status and feedback: if success is only green and error is only red, the meaning can disappear when those colors move closer together. Add explicit status text and different icons. For form errors, do not rely on a colored border alone; place the cause and suggested correction near the field.",
              "Charts and data visualization: series connected to a legend by color alone can become indistinguishable. Combine solid, dashed and dotted lines with different point shapes, and use patterns, borders or direct labels for bars and areas. For sequential data, sufficiently separated luminance steps are often more reliable than adding more hues.",
              "Links, tabs and selected states: check whether inline links, active tabs and selected cards only change color. Add an underline to links, weight or an indicator line to active tabs, and a check icon or border treatment to selected cards.",
              "Controls and icons: review button text against its fill, input borders against the outer surface, and meaningful icons against adjacent colors. If a pair becomes difficult to see, enter its foreground and background colors in the contrast checker to measure the applicable WCAG ratio.",
            ],
          },
          {
            heading: "Why use a grayscale check?",
            body: [
              "Grayscale is a stress test that removes color as an information cue rather than a representation of any color vision condition. If states, series or selections collapse into the same gray, the design likely relies heavily on hue.",
              "This tool converts to gray using relative luminance rather than a channel average, so the contrast ratio between any two colors stays exactly what it was in the original and only the hue cue is removed. Anything that becomes indistinguishable here is a color-dependence problem, not a contrast problem.",
              "The goal is not to make every color look different in grayscale. The goal is to keep the same information available through labels, icons, patterns, line styles or other visible structure. Ask one practical question: can a user still identify the original meaning when color is removed?",
            ],
          },
          {
            heading: "How to fix a problem",
            body: [
              "Start by adding a text label that states the meaning directly, and use different icons or shapes for success, error, warning and selected states. Add line styles, point shapes, patterns or direct labels to chart series.",
              "Then increase the luminance difference between foreground and background or between adjacent data colors. Do not assign an important state to a tiny color dot; provide sufficient area and clear placement. Recheck the revised design in all three views and in grayscale.",
              "Color remains useful for fast recognition and emphasis. The objective is not to discard a brand palette but to ensure that removing a color difference does not also remove function or meaning.",
            ],
          },
          {
            heading: "Simulation and contrast checking answer different questions",
            body: [
              "A color vision simulation helps locate different colors that may become difficult to distinguish. A contrast checker measures whether the relative luminance between two colors reaches a WCAG threshold. Red and green states can each contrast strongly with their background while still failing when color is the only difference. A pair can also remain different in the simulation while the text-to-background contrast is too low.",
              "Use the simulator to locate a design risk, then measure the actual foreground and background pair in the contrast checker. The two tools complement each other.",
            ],
          },
          {
            heading: "Pre-release color accessibility checklist",
            body: [
              "Confirm that success, error, warning and completion states include text or an icon, and that chart series can be distinguished by line style, pattern, shape or a direct label. Links, active tabs and selected cards should carry a non-color cue as well.",
              "Check that text, icons and input boundaries have sufficient contrast against their actual background, and review light and dark themes along with default, hover, focus, selected and error states. Finally, confirm that the information required to complete the main task remains available in the protan, deutan, tritan and grayscale views.",
            ],
          },
        ],
        examples: [
          {
            title: "Viewing the sample design's status dots at deutan 100%",
            input: "Built-in sample design, deutan, strength 100%",
            result: "The completed state's green #16A34A becomes #958951 and the failed state's red #DC2626 becomes #8F801B, dropping the contrast between them from 1.47:1 to 1.13:1",
            note: "Anywhere status is shown by dot color without a label becomes effectively unreadable. Pair the dot with status text or a distinct icon.",
          },
          {
            title: "Comparing the same design at protan 100%",
            input: "Built-in sample design, protan, strength 100%",
            result: "The same two colors become #A49442 and #635923: the hues converge but a lightness difference remains, so the contrast between them is 2.31:1",
            note: "Different views leave different cues intact. A distinction lost under deutan can partly survive as lightness under protan, so check all three.",
          },
          {
            title: "Using the grayscale check for color dependence",
            input: "Built-in sample design, grayscale check",
            result: "The blue link #2563EB becomes #6D6D6D and body text #334155 becomes #404040, keeping the 2.00:1 contrast ratio intact while the hue cue disappears entirely",
            note: "Grayscale leaves luminance differences untouched and removes only color. Anything that merges here needs an underline, icon or shape cue.",
          },
        ],
        limitations: [
          "A screenshot does not include every hover, keyboard focus, loading, error, disabled or drag state. Upload separate images for important states and review the implemented interface as well.",
          "A person still needs to decide whether non-color cues preserve the information, so this tool does not produce an automatic accessibility score or conformance verdict.",
          "The simulation is an approximation based on a research model. It cannot reproduce every person's color perception or every display environment, so use it to locate lost distinctions rather than as an absolute pixel reference.",
          "Images saved in a wide gamut can shift slightly when the browser canvas converts them into its working color space.",
          "Only PNG, JPG and WebP are supported, up to 10MB and 40 megapixels. The preview is scaled down to at most 2 megapixels, preserving aspect ratio, to keep the controls responsive.",
          "Other visual conditions such as low-vision blur, cataracts or glare are out of scope, and no automatic heatmap of low-contrast areas is provided.",
        ],
        sources: [
          {
            label: "W3C · WCAG 2.2 Understanding Use of Color",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html",
          },
          {
            label: "W3C · WCAG 2.2 Understanding Contrast (Minimum)",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html",
          },
          {
            label: "W3C · WCAG 2.2 Understanding Non-text Contrast",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html",
          },
          {
            label: "Machado, Oliveira, Fernandes · A Physiologically-based Model for Simulation of Color Vision Deficiency (2009)",
            url: "https://pubmed.ncbi.nlm.nih.gov/19834201/",
          },
          {
            label: "National Eye Institute · Types of Color Vision Deficiency",
            url: "https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/color-blindness/types-color-vision-deficiency",
          },
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "색각이상 시뮬레이터는 어떤 디자인을 검사할 수 있나요?",
          answer:
            "웹·앱 화면, 대시보드, 차트, 지도, 배너처럼 PNG·JPG·WebP 이미지로 저장하거나 캡처할 수 있는 시안을 검사할 수 있습니다. 상태색, 차트 계열, 링크와 선택 요소처럼 색상이 기능을 맡는 영역을 중심으로 비교하세요.",
        },
        {
          question: "Protan, Deutan, Tritan 보기는 무엇이 다른가요?",
          answer:
            "Protan과 Deutan은 주로 적록 계열 색상 차이가 줄어드는 조건을, Tritan은 일부 청황 계열 색상 차이가 줄어드는 조건을 보여줍니다. 같은 시안도 유형에 따라 구분하기 어려운 조합이 달라질 수 있습니다.",
        },
        {
          question: "시뮬레이션 강도는 몇 퍼센트로 확인해야 하나요?",
          answer:
            "먼저 100%에서 정보 구분이 유지되는지 확인하고, 40~70% 같은 중간값에서도 비교하세요. 한 값만 통과 기준으로 쓰기보다 여러 강도에서 상태와 의미가 유지되는지 보는 것이 좋습니다.",
        },
        {
          question: "흑백 보기는 왜 제공하나요?",
          answer:
            "색상을 완전히 제거했을 때도 텍스트, 아이콘, 패턴과 형태로 같은 정보를 구분할 수 있는지 확인하기 위해서입니다. 상대 휘도로 변환하므로 두 색의 명도대비 비율은 그대로 유지되고 색상 단서만 사라집니다.",
        },
        {
          question: "시뮬레이션 결과만으로 웹접근성 준수 여부를 알 수 있나요?",
          answer:
            "아닙니다. 시뮬레이션은 색상에만 의존한 디자인 문제를 찾는 검수 단계입니다. 글자와 배경, UI 요소의 실제 대비 비율은 명도대비 검사기로 확인하고 키보드·구조·대체 텍스트 같은 다른 접근성 항목도 별도로 검수해야 합니다.",
        },
        {
          question: "업로드한 시안 이미지가 서버로 전송되나요?",
          answer:
            "아니요. 이미지 디코딩과 색상 변환은 브라우저에서 처리되며, 업로드한 이미지와 파일명은 Kitfolio 서버로 전송하거나 저장하지 않습니다.",
        },
      ],
      en: [
        {
          question: "What designs can I check with the color blindness simulator?",
          answer:
            "You can review web and app screens, dashboards, charts, maps and other designs saved or captured as PNG, JPG or WebP. Focus on places where color communicates a state, series, link or selection.",
        },
        {
          question: "What is the difference between protan, deutan and tritan views?",
          answer:
            "Protan and deutan views reduce differences across parts of the red-green range, while tritan affects some blue-yellow combinations. A pair that remains distinct in one view can become difficult to separate in another.",
        },
        {
          question: "Which simulation strength should I use?",
          answer:
            "Start at 100% as a conservative stress test, then compare intermediate values such as 40% to 70%. Review whether meaning and state remain available across several strengths instead of treating one value as a universal threshold.",
        },
        {
          question: "Why does the tool include a grayscale view?",
          answer:
            "Grayscale removes color as an information cue and reveals where labels, icons, patterns or shapes are missing. It converts using relative luminance, so contrast ratios stay exactly as they were and only the hue cue is removed.",
        },
        {
          question: "Does the simulation confirm that a design meets web accessibility requirements?",
          answer:
            "No. The simulation helps find design problems that rely on color alone. Measure actual foreground and background pairs with a contrast checker, and review other requirements such as keyboard support, structure and text alternatives separately.",
        },
        {
          question: "Is my uploaded design sent to a server?",
          answer:
            "No. Image decoding and color transformation run in your browser. The image and filename you provide are not uploaded to or stored on the Kitfolio server.",
        },
      ],
    },
    og: {
      ko: {
        title: "색각이상 시뮬레이터",
        subtitle: "시안의 상태색·차트·선택 요소를 색각 조건별로 비교",
      },
      en: {
        title: "Color Blindness Simulator",
        subtitle: "Compare UI states, charts and controls across color vision conditions",
      },
    },
  },

  {
    slug: "text-scaling-checker",
    layout: "canvas",
    cat: "design",
    targets: ["designer", "developer", "pm"],
    ico: "200%",
    ready: true,
    indexable: true,
    verifiedAt: "2026-09-13",
    badge: "Canvas",
    name: { ko: "텍스트 확대·간격 검사기", en: "Text Scaling & Spacing Checker" },
    // 확대 문제가 구조에서 비롯될 때의 다음 검사, 단위 조정, 색상 검사 순서로 잇는다.
    relatedTools: ["html-accessibility-checker", "css-unit-converter", "color-contrast-checker"],
    seo: {
      ko: {
        title: "웹접근성 텍스트 확대 검사기 | 200%·간격 테스트",
        description:
          "HTML·CSS는 물론 JSX·TSX와 Tailwind 클래스를 그대로 붙여넣어 웹접근성 텍스트 확대를 검사하세요. 200% 글자 확대, 320px 리플로와 WCAG 텍스트 간격을 원본과 나란히 비교하고 가로 오버플로·고정 영역의 내용 잘림 후보를 확인할 수 있습니다. 입력한 코드는 서버로 전송되지 않고 브라우저에서만 처리됩니다.",
        keywords: [
          "웹접근성 텍스트 확대",
          "웹접근성 글자 크기",
          "200% 확대 테스트",
          "400% 확대 테스트",
          "320px 리플로",
          "WCAG 리플로",
          "텍스트 간격 기준",
          "글자 간격 접근성",
          "줄간격 접근성",
          "WCAG 1.4.12",
          "텍스트 확대 검사기",
          "HTML 확대 테스트",
          "JSX 접근성 검사",
          "React 텍스트 확대 검사",
          "Tailwind 접근성 검사",
          "Tailwind 리플로 테스트",
        ],
      },
      en: {
        title: "Text Scaling & Spacing Checker | WCAG Reflow Test",
        description:
          "Paste HTML and CSS, or JSX and TSX with Tailwind classes, to test 200% text resizing, a 320 CSS pixel reflow viewport, and WCAG text spacing overrides side by side. The checker highlights horizontal overflow, clipped text, fixed containers, and nowrap candidates while processing your source locally in the browser without sign-in or upload.",
        keywords: [
          "text scaling checker",
          "wcag text resize test",
          "200 percent text resize",
          "400 percent zoom accessibility",
          "320 css pixel reflow test",
          "wcag reflow checker",
          "text spacing checker",
          "wcag 1.4.12 test",
          "letter spacing accessibility",
          "line height accessibility",
          "html css accessibility preview",
          "jsx accessibility checker",
          "react text resize test",
          "tailwind accessibility test",
          "tailwind reflow checker",
        ],
      },
    },
    content: {
      ko: {
        card: "HTML·CSS와 JSX·TSX·Tailwind에 200% 확대, 320px 리플로, WCAG 간격을 적용해 원본과 나란히 비교합니다.",
        description:
          "HTML과 CSS는 물론 React 컴포넌트의 JSX·TSX와 Tailwind 클래스에도 200% 텍스트 확대, 320 CSS px 리플로, WCAG 간격값을 적용해 보세요. 원본과 비교하며 고정된 카드, 버튼, 문단과 반응형 레이아웃에서 내용이 사라지는 위치를 찾을 수 있습니다. 컴포넌트 코드는 실행하지 않고 구문만 읽어 마크업으로 바꾸며, Tailwind 스타일도 브라우저 안에서 만듭니다. 붙여넣은 코드는 정제 후 스크립트 없이 격리된 미리보기에서만 렌더링되고, 외부 이미지·웹폰트·stylesheet는 불러오지 않습니다.",
        howItWorks: [
          "소스 형식(HTML·텍스트 또는 JSX·TSX) 선택 후 코드와 CSS 입력",
          "텍스트 200%·리플로 320px·텍스트 간격 중 선택",
          "원본과 비교하고 오버플로·잘림 후보와 수동 확인 항목 점검",
        ],
        aeo: {
          what: "텍스트 확대·간격 검사기는 HTML·CSS나 JSX·TSX와 Tailwind 클래스에 웹접근성 확대·리플로·간격 조건을 적용해 원본과 비교하는 브라우저 도구입니다.",
          who: "200% 글자 확대, 320px 반응형 재배치와 사용자 텍스트 간격 변경을 검수하는 퍼블리셔, React 개발자, 디자이너와 QA 담당자를 위한 도구입니다.",
          how: "JSX는 실행하지 않고 구문만 읽어 마크업으로 바꾸고, 마크업에 쓰인 Tailwind 클래스로 CSS를 만든 뒤, 격리된 preview에 텍스트 200%·320 CSS px viewport·WCAG 간격값을 적용해 오버플로와 잘림 후보를 측정합니다.",
          why: "고정 width·height, 줄바꿈 차단과 좁은 control 때문에 확대 시 정보나 기능이 사라지는 문제를 컴포넌트 단계에서, 배포 전에 찾기 위해 사용합니다.",
        },
        guide: [
          {
            heading: "웹접근성에서 글자 크기는 어떻게 검사하나요?",
            body: [
              "WCAG 2.2에는 모든 웹페이지가 반드시 사용해야 하는 하나의 최소 폰트 크기가 정해져 있지 않습니다. 작은 글자가 무조건 괜찮다는 뜻은 아닙니다. 사용자가 브라우저나 사용자 설정으로 텍스트를 키웠을 때 내용과 기능을 잃지 않는지가 핵심 검사 대상입니다. 글자 크기를 하나의 숫자로 고정해 검사하면 화면 크기, 글꼴, 언어와 사용자의 확대 방식에 따라 달라지는 실제 문제를 놓치기 쉽습니다.",
              "이 도구는 세 가지 조건을 분리해 보여줍니다. 텍스트 200%는 글자만 두 배가 됐을 때 고정된 카드와 control이 버티는지 확인합니다. 리플로 320px은 좁은 viewport에서 페이지가 한 방향으로 다시 배치되는지 확인합니다. 텍스트 간격은 사용자가 줄·문단·글자·단어 간격을 넓혀도 정보가 사라지지 않는지 확인합니다.",
            ],
          },
          {
            heading: "텍스트 200%와 브라우저 200% 확대는 같은가요?",
            body: [
              "WCAG 1.4.4의 목적은 텍스트를 최대 200%까지 키워도 내용이나 기능이 잘리거나 가려지지 않게 하는 것입니다. 브라우저는 전체 페이지 zoom, 텍스트 전용 확대, 사용자 글꼴 설정처럼 여러 방식을 제공할 수 있습니다. 이 검사기의 텍스트 200% 프리셋은 각 요소의 계산된 글자 크기만 두 배로 만들고 width·height·padding은 그대로 둡니다. 고정된 컨테이너가 텍스트 증가를 견디는지 빠르게 찾기 위한 보수적인 stress test입니다.",
              "따라서 preview가 실제 브라우저의 full-page zoom과 픽셀 단위로 같지는 않습니다. 운영 화면에서는 Chrome, Edge, Firefox 또는 Safari의 실제 확대 기능으로 100%부터 200% 사이의 단계도 확인해야 합니다. 특히 media query가 바뀌는 구간, sticky header, modal과 form control은 실제 페이지에서 다시 테스트하세요.",
            ],
          },
          {
            heading: "320px 리플로와 400% 확대는 어떤 관계인가요?",
            body: [
              "WCAG 1.4.10은 일반적으로 세로로 읽는 콘텐츠가 320 CSS px 너비에서 정보와 기능을 잃지 않고, 페이지 전체를 가로·세로 두 방향으로 반복 스크롤하지 않도록 요구합니다. 320 CSS px는 시작 viewport가 1280 CSS px일 때 브라우저를 400% 확대한 것과 동등한 폭입니다.",
              "그래서 이 도구는 화면을 단순히 네 배 확대하는 필터를 사용하지 않습니다. 원본 preview의 내부 viewport를 1280px, 검사 preview를 320px로 실제 변경합니다. 이렇게 해야 좁은 화면을 겨냥한 반응형 CSS가 동작하고 여러 열이 쌓이거나 navigation이 재배치되는 모습을 확인할 수 있습니다.",
              "데이터 표, 지도, 다이어그램처럼 의미를 이해하거나 조작하기 위해 2차원 배치가 필요한 영역은 수평 스크롤이 허용될 수 있습니다. 그렇더라도 페이지 전체가 아니라 해당 영역만 스크롤되는지, 표의 각 칸 안 텍스트가 불필요하게 잘리지 않는지는 확인해야 합니다.",
            ],
          },
          {
            heading: "WCAG 텍스트 간격 기준은 무엇인가요?",
            body: [
              "WCAG 1.4.12는 줄 높이 글자 크기의 1.5배, 문단 뒤 간격 2배, 글자 간격 0.12배, 단어 간격 0.16배를 동시에 적용했을 때 콘텐츠나 기능 손실이 없어야 한다고 설명합니다.",
              "이 값을 사이트의 기본 typography로 반드시 사용하라는 기준은 아닙니다. 사용자가 자신의 읽기 필요에 맞춰 author style을 덮어쓸 수 있어야 하고, 그 결과 문구·버튼·입력창·tooltip이 잘리거나 사라지지 않아야 한다는 뜻입니다. 검사기는 현재 값이 기준보다 이미 크다면 줄이지 않고 네 속성만 확대합니다.",
              "언어와 문자 체계에 따라 일부 간격 속성의 효과는 다릅니다. 한글은 띄어쓰기가 있는 문장에서 word-spacing 영향이 나타나지만, 실제 문구가 짧거나 공백이 없다면 차이가 작을 수 있습니다. 한국어·영어·숫자가 섞인 실제 서비스 문구로 확인하는 편이 안전합니다.",
            ],
          },
          {
            heading: "JSX·TSX와 Tailwind 화면은 어떻게 검사하나요?",
            body: [
              "React 프로젝트의 화면은 HTML 파일로 존재하지 않습니다. 브라우저에서 완성된 마크업을 복사해 오려면 이미 화면을 띄운 뒤여야 하고, 그때는 이미 수정 비용이 커진 상태입니다. 소스 형식을 JSX·TSX로 바꾸면 컴포넌트 코드를 그대로 붙여넣어 확대·리플로·간격을 컴포넌트 단계에서 확인할 수 있습니다.",
              "이 도구는 붙여넣은 코드를 실행하지 않습니다. 구문만 읽어 트리를 만들고 거기서 마크업을 조립합니다. className은 class로, style 객체는 CSS 문자열로 바꾸고, cn()·clsx()로 조립한 클래스는 문자열 부분을 모읍니다. 삼항 연산자는 서로 충돌하는 클래스가 함께 붙지 않도록 앞 분기를 사용합니다. 값을 알 수 없는 표현식은 비우지 않고 식 자체를 자리표시자 텍스트로 넣습니다. 글자가 사라지면 확대 검사에서 가장 중요한 길이 정보가 함께 사라지기 때문입니다.",
              "Tailwind 클래스로 스타일 만들기를 켜면 마크업에 실제로 쓰인 클래스만 골라 브라우저 안에서 Tailwind CSS를 만듭니다. CDN 스크립트나 빌드 서버를 부르지 않으므로 입력한 코드가 페이지 밖으로 나가지 않는다는 전제는 그대로입니다. 프로젝트가 정의한 색·간격 토큰이 있다면 @theme 블록을 CSS 입력 영역에 함께 붙여넣으세요. CSS가 만들어지지 않은 클래스는 결과 아래 안내로 따로 알려 줍니다.",
              "대신 컴포넌트 내부는 알 수 없습니다. 직접 만든 컴포넌트는 이름으로 짐작할 수 있으면 대응 요소(Button은 button, Link는 a)로, 아니면 스타일이 걸린 컨테이너로 그립니다. map으로 그리는 목록은 항목 3개로 반복해 좁은 화면에서 줄바꿈이 어떻게 일어나는지 볼 수 있게 합니다. 실제 데이터 길이와 컴포넌트 내부 마크업은 운영 화면에서 다시 확인하세요.",
            ],
          },
          {
            heading: "어떤 CSS에서 확대 문제가 자주 생기나요?",
            body: [
              "고정된 width와 height: 카드에 height 200px와 overflow: hidden을 함께 사용하면 기본 문구는 맞더라도 확대된 문구나 번역된 긴 문구가 잘릴 수 있습니다. 꼭 필요한 경우가 아니라면 자연스러운 높이, min-height, 내부 여백과 줄바꿈을 사용하세요. 고정 width가 320px viewport보다 크면 페이지 전체의 가로 오버플로 원인이 됩니다.",
              "줄바꿈을 막는 white-space: nowrap은 날짜, 코드, 한 줄 label에 유용하지만 긴 버튼 문구나 navigation 전체에 적용하면 좁은 화면에서 벗어날 수 있습니다. 문구가 반드시 한 줄이어야 하는지 확인하고, 필요하면 control이 늘어나거나 해당 영역만 스크롤되도록 설계하세요.",
              "절대 위치와 고정 위치: position absolute로 문구와 아이콘 위치를 픽셀에 맞추면 글자 크기나 줄 수가 바뀔 때 서로 겹칠 수 있습니다. position fixed인 header와 하단 액션도 확대 후 본문을 가릴 수 있습니다. flow layout, flex·grid의 자연스러운 크기 계산과 충분한 padding을 우선하세요.",
              "제한된 line-height와 overflow: 글자 크기는 커지는데 line-height를 고정된 작은 px로 유지하면 위아래 획이 겹치거나 control 안에서 잘릴 수 있습니다. 단일 행 입력처럼 높이가 제한된 컴포넌트도 실제 확대 상태에서 텍스트가 중앙에 보이는지 확인해야 합니다.",
              "viewport 단위만 사용한 글자 크기: font-size를 2vw처럼 viewport 변화에만 의존하게 하면 브라우저 확대와 breakpoint 변화에서 기대한 200% 증가가 나오지 않을 수 있습니다. clamp()를 쓰더라도 rem 기반 최소·기본값과 확대 결과를 함께 확인하세요.",
            ],
          },
          {
            heading: "px를 쓰면 접근성에 실패하고 rem을 쓰면 통과하나요?",
            body: [
              "그렇게 단순하지 않습니다. 현대 브라우저의 full-page zoom은 px로 지정한 글자도 함께 확대할 수 있으므로 px 사용이 곧 WCAG 실패라는 설명은 정확하지 않습니다. 반대로 rem을 사용해도 부모 컨테이너의 height가 고정돼 있거나 overflow를 숨기면 내용은 잘릴 수 있습니다. 최종 판단은 단위 이름이 아니라 확대 후 콘텐츠와 기능이 유지되는지에 달려 있습니다.",
              "다만 rem과 em은 사용자의 기본 글자 크기 설정을 반영하고 글자와 관련된 padding·gap·container가 함께 확장되도록 설계할 때 유용합니다. font-size는 rem, 컴포넌트 내부 간격은 em, 최대 너비는 rem처럼 의도를 나눠 사용할 수 있습니다. 기존 px 값을 바꿀 때는 CSS 단위 변환기를 사용하되, 변환만 하고 끝내지 말고 이 검사기와 실제 브라우저에서 결과를 다시 확인하세요.",
            ],
          },
          {
            heading: "이미지로 된 텍스트는 왜 별도로 봐야 하나요?",
            body: [
              "이미지 안의 글자는 일반 HTML 텍스트처럼 사용자가 글꼴, 크기, 색상과 간격을 바꾸기 어렵고 확대 시 선명도가 떨어질 수 있습니다. 로고처럼 시각 표현이 본질적인 경우를 제외하면 실제 텍스트와 CSS를 사용하는 편이 좋습니다. 이 도구는 외부 이미지를 불러오지 않고 이미지 안의 문자를 인식하지 않으므로, 시안과 구현 화면에서 이미지로 된 텍스트가 있는지 직접 확인해야 합니다.",
            ],
          },
          {
            heading: "검사 결과는 어떻게 해석해야 하나요?",
            body: [
              "페이지 가로 오버플로는 검사 viewport보다 document가 넓어진 상태입니다. 내용 잘림 가능성은 텍스트가 있는 영역에서 scroll 크기가 client box보다 크면서 overflow가 숨겨진 경우입니다. 수평 스크롤 영역 검토는 특정 컴포넌트가 별도 가로 스크롤을 갖는 상태로, 표나 다이어그램이라면 허용 가능한 예외일 수 있습니다.",
              "결과는 원본에도 있던 문제와 이 프리셋에서 새로 생긴 문제를 구분해 보여줍니다. 확대 때문에 생긴 문제인지, 원래부터 좁았던 컨테이너인지를 나눠 보면 수정 우선순위를 정하기 쉽습니다.",
              "자동 후보가 없다고 해서 기준을 통과한 것은 아닙니다. 텍스트끼리 겹쳤는지, 기능을 실행할 수 있는지, 말줄임된 전체 문구가 다른 방법으로 제공되는지와 실제 브라우저 확대는 사람이 확인해야 합니다. preview는 문제를 찾는 지도이지 합격 도장을 찍는 심사관이 아닙니다.",
            ],
          },
          {
            heading: "배포 전 권장 검사 순서",
            body: [
              "먼저 실제 서비스의 대표적인 짧은 문구와 가장 긴 문구를 각각 준비합니다. 텍스트 200%에서 카드, 버튼, 입력창, 탭과 tooltip의 내용 손실을 확인하고, 리플로 320px에서 페이지 전체 가로 스크롤과 고정 UI 가림을 확인합니다. 텍스트 간격에서는 문단·control·배지의 잘림과 겹침을 봅니다.",
              "감지된 요소의 고정 width·height, overflow와 nowrap 사용 이유를 검토한 다음, 실제 운영 화면에서 브라우저 확대와 키보드 조작을 다시 테스트하세요. 구조 문제가 의심되면 HTML 접근성 검사기로 헤딩·랜드마크·DOM 순서를 확인하고, 실제 색상은 명도대비 검사기에서 별도로 측정합니다.",
            ],
          },
        ],
        examples: [
          {
            title: "예시 카드를 텍스트 200%로 검사",
            input: "예시 불러오기로 채운 summary-card (width 560px · height 230px · overflow: hidden) · 프리셋 텍스트 200% · viewport 768px",
            result:
              "후보 1개. section 에서 CLIP-001 세로 내용 잘림 가능성: clientHeight 228px 안에 콘텐츠가 448px",
            note: "글자만 두 배가 됐을 뿐인데 콘텐츠 높이가 카드의 두 배에 가까워집니다. 카드 아래쪽의 저장 버튼과 링크가 화면에서 사라진다는 뜻이라 고정 height 를 min-height 로 바꿔야 합니다.",
          },
          {
            title: "같은 카드를 리플로 320px로 검사",
            input: "같은 입력 · 프리셋 리플로 320px (원본 1280px → 검사 320px)",
            result:
              "후보 2개. 문서 전체에서 REFLOW-001 페이지 가로 오버플로(scrollWidth 560px · clientWidth 320px), section 에서 REFLOW-002 화면 밖으로 벗어난 요소(오른쪽 경계 560px)",
            note: "고정 width 560px 하나가 원인입니다. 카드 안의 문단·버튼도 함께 넘치지만 원인이 되는 가장 바깥 요소만 카드로 묶어 수정 위치를 하나로 좁혀 줍니다.",
          },
          {
            title: "같은 카드를 텍스트 간격으로 검사",
            input: "같은 입력 · 프리셋 텍스트 간격 · viewport 768px",
            result:
              "후보 1개. section 에서 CLIP-001: clientHeight 228px 안에 콘텐츠가 260px. 문단의 line-height 는 28.8px에서 36px로, margin-bottom 은 6px에서 32px로, letter-spacing 은 0에서 1.92px로 늘어납니다",
            note: "글자 크기는 그대로인데 간격만 넓혀도 카드를 넘칩니다. 확대와 간격은 서로 다른 조건이라 프리셋을 나눠 각각 확인해야 하는 이유입니다.",
          },
          {
            title: "Tailwind 컴포넌트를 JSX 그대로 검사",
            input:
              "소스 형식 JSX·TSX · Tailwind 클래스로 스타일 만들기 켬 · 예시 불러오기로 채운 ReleaseSummaryCard (h-[230px] w-[560px] overflow-hidden · 배지 줄에 whitespace-nowrap) · CSS 영역에 @theme { --color-brand: #2d5dc8 } · 프리셋 리플로 320px",
            result:
              "후보 2개. 문서 전체에서 REFLOW-001 페이지 가로 오버플로(scrollWidth 560px · clientWidth 320px), section 에서 REFLOW-002 화면 밖으로 벗어난 요소. 안내에 표현식 4개를 자리표시자로 바꿨고 map 목록 1개를 항목 3개로 그렸다고 표시됩니다",
            note: "w-[560px] 하나가 320px 화면을 넘기는 원인입니다. @theme 를 함께 붙여넣었기 때문에 프로젝트 전용 토큰인 text-brand 도 미인식 클래스로 잡히지 않고 실제 색으로 그려집니다.",
          },
        ],
        limitations: [
          "실제 브라우저 확대를 그대로 복제하지 않습니다. 텍스트 200%는 계산된 글자 크기만 두 배로 만드는 보수적인 stress test이고, full-page zoom은 여백·이미지·media query까지 함께 바꿉니다. 최종 확인은 실제 브라우저의 확대 기능으로 해야 합니다.",
          "JavaScript를 실행하지 않습니다. JSX·TSX도 구문만 읽어 마크업으로 바꿉니다. React hydration, 스크립트로 열리는 모달, 런타임에 바뀌는 클래스와 동적 상태는 재현되지 않습니다.",
          "직접 만든 컴포넌트의 내부 마크업은 알 수 없습니다. 이름으로 짐작되는 것(Button·Link·Image 등)은 대응 요소로, 나머지는 스타일이 걸린 컨테이너로 그리거나 자식만 남깁니다. 전개 prop({...props})의 값도 호출하는 쪽에 있어 적용하지 않습니다.",
          "표현식의 실제 값은 알 수 없습니다. {user.name} 같은 부분은 식 자체를 자리표시자 텍스트로 넣으므로 실제 문구 길이와 다릅니다. map 목록은 항목 3개로 고정해 반복합니다.",
          "Tailwind 스타일은 이 도구에 포함된 기본 테마 기준으로 만듭니다. 프로젝트의 tailwind.config·플러그인·@theme 정의를 CSS 입력 영역에 함께 붙여넣지 않으면 해당 클래스는 CSS가 만들어지지 않고 안내에만 표시됩니다.",
          "외부 웹폰트·이미지·stylesheet를 불러오지 않습니다. 시스템 글꼴로 렌더링되므로 실제 운영 화면과 줄바꿈 위치가 달라질 수 있고, 이미지는 크기만 유지한 중립 placeholder로 표시됩니다.",
          "겹침은 자동으로 판정하지 않습니다. 두 텍스트가 실제로 겹쳤는지, 겹침 때문에 기능이 가려졌는지는 preview를 눈으로 확인해야 합니다.",
          "지도·데이터 표·다이어그램이 리플로 예외에 해당하는지 자동으로 분류하지 않습니다. 수평 스크롤 영역은 후보로만 표시하고 예외 여부는 사람이 판단합니다.",
          "입력은 HTML·텍스트 200,000자, CSS 100,000자, 요소 10,000개까지 검사합니다. 더 큰 화면은 컴포넌트 단위로 나눠 검사하세요.",
          "감지 결과가 0개라는 것은 WCAG나 한국형 웹 콘텐츠 접근성 지침을 준수한다는 뜻이 아닙니다. 이 도구는 점수나 합격 여부를 제공하지 않습니다.",
        ],
        sources: [
          {
            label: "W3C · WCAG 2.2 Understanding Resize Text",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html",
          },
          {
            label: "W3C · WCAG 2.2 Understanding Reflow",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/reflow.html",
          },
          {
            label: "W3C · WCAG 2.2 Understanding Text Spacing",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html",
          },
          {
            label: "W3C · WCAG 2.2 Understanding Images of Text",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/images-of-text.html",
          },
          {
            label: "MDN · iframe sandbox",
            url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#sandbox",
          },
          {
            label: "MDN · Content Security Policy",
            url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy",
          },
          {
            label: "React · Writing Markup with JSX",
            url: "https://react.dev/learn/writing-markup-with-jsx",
          },
          {
            label: "Tailwind CSS · Theme variables",
            url: "https://tailwindcss.com/docs/theme",
          },
        ],
      },
      en: {
        card: "Apply 200% text, 320px reflow and WCAG spacing to HTML, CSS, JSX, TSX and Tailwind classes, side by side with the original.",
        description:
          "Apply 200% text resizing, a 320 CSS pixel reflow viewport, or WCAG text spacing values to an HTML and CSS sample, or to a React component written in JSX or TSX with Tailwind classes. Compare the original and test views to find fixed containers, controls, and responsive layouts that lose content. Component code is never executed: only its syntax is read and turned into markup, and Tailwind styles are generated in your browser. Your source is sanitized and rendered only inside an isolated preview with scripts disabled, and external images, fonts and stylesheets are never loaded.",
        howItWorks: [
          "Choose the source format (HTML or JSX and TSX) and paste the code plus optional CSS",
          "Choose 200% text, 320px reflow, or WCAG text spacing",
          "Compare both previews and inspect overflow, clipping and manual checks",
        ],
        aeo: {
          what: "A text scaling and spacing checker applies accessibility resize, reflow, and spacing conditions to HTML and CSS, or to JSX and TSX with Tailwind classes, and compares the result with the original.",
          who: "It is for HTML authors, React developers, designers, and QA testers reviewing 200% text resize, 320px reflow, and user spacing overrides.",
          how: "It converts JSX syntax into markup without executing it, generates CSS for the Tailwind classes it finds, renders the result in isolated previews, applies one WCAG-related preset, and measures horizontal overflow and likely clipped text.",
          why: "It helps teams find fixed dimensions, blocked wrapping, and narrow controls that can hide content or functionality when text is enlarged or spaced out, while the screen is still a component.",
        },
        guide: [
          {
            heading: "How should text size be tested for web accessibility?",
            body: [
              "WCAG 2.2 does not define one minimum font size that every web page must use. That does not make very small text automatically acceptable. The important test is whether people can enlarge or restyle text without losing content or functionality. A single font-size number cannot represent every viewport, typeface, language, and user setting.",
              "This checker separates three conditions. 200% text doubles text size to stress fixed cards and controls. 320px reflow tests whether the layout adapts to a narrow viewport without page-level two-dimensional scrolling. Text spacing checks whether content survives user overrides for line, paragraph, letter, and word spacing.",
            ],
          },
          {
            heading: "Is 200% text the same as 200% browser zoom?",
            body: [
              "WCAG 1.4.4 aims to keep content and functionality available when text is resized up to 200%. Browsers can support this through full-page zoom, text-only resizing, or user font preferences. The checker doubles each element's computed font size while leaving width, height, padding, and other properties unchanged. This is a conservative stress test for containers that do not grow with text.",
              "The result is not a pixel-identical copy of full-page browser zoom. Test the implemented page at intermediate steps from 100% to 200% in the browsers your product supports. Pay particular attention to responsive breakpoints, sticky headers, dialogs, and form controls.",
            ],
          },
          {
            heading: "How are 320px reflow and 400% zoom related?",
            body: [
              "WCAG 1.4.10 expects vertically scrolling content to remain available at a width equivalent to 320 CSS pixels without requiring scrolling in two dimensions. A 320 CSS pixel viewport is equivalent to starting at 1280 CSS pixels and zooming to 400%.",
              "The checker does not create this view by visually scaling an image four times. It uses a 1280px layout viewport for the original and a real 320px layout viewport for the test. Responsive media queries can therefore rearrange columns, navigation, and controls.",
              "Some regions require a two-dimensional layout for their meaning or operation, including data tables, maps, and diagrams. These can be exceptions, but review whether scrolling is limited to the region and whether text inside it remains usable.",
            ],
          },
          {
            heading: "What are the WCAG text spacing values?",
            body: [
              "WCAG 1.4.12 describes four values that must be applicable together without loss of content or functionality: line height at least 1.5 times the font size, space after paragraphs at least 2 times, letter spacing at least 0.12 times, and word spacing at least 0.16 times.",
              "These are not mandatory default typography values. The requirement is that a user can override author styles to these values without clipping text or losing controls. The checker leaves an existing value unchanged when it is already larger and modifies only the four relevant properties.",
              "Some properties have different effects across languages and writing systems. Test realistic product strings, including mixed text, numbers, and longer localized labels.",
            ],
          },
          {
            heading: "How do you check JSX, TSX and Tailwind screens?",
            body: [
              "A React screen does not exist as an HTML file. Copying finished markup out of the browser means the screen already runs somewhere, and by then a layout fix costs more. Switching the source format to JSX or TSX lets you paste component code directly and check resizing, reflow and spacing while the screen is still a component.",
              "The code is never executed. Only its syntax is read into a tree, and the markup is assembled from that tree. className becomes class, a style object becomes a CSS string, and classes assembled with cn() or clsx() are collected from their string parts. A ternary uses the first branch so that conflicting classes are not applied together. Expressions whose values are unknown are not blanked out: the expression source itself becomes placeholder text, because removing the words would also remove the length that resize testing depends on.",
              "Turning on Tailwind class styling generates Tailwind CSS in your browser for exactly the classes found in the markup. No CDN script and no build server is contacted, so the promise that your code never leaves the page still holds. If your project defines its own color or spacing tokens, paste the @theme block into the CSS field as well. Classes that produced no CSS are listed in a notice under the result.",
              "What the tool cannot know is what is inside your components. A component is rendered as the element its name suggests where that is clear (Button becomes button, Link becomes a), and otherwise as a styled container. Mapped lists are repeated three times so you can see how a row of items wraps on a narrow screen. Re-check real data lengths and real component markup in the running app.",
            ],
          },
          {
            heading: "Which CSS patterns commonly break during resizing?",
            body: [
              "Fixed width and height: a card with height 200px and overflow hidden may fit the default copy but clip enlarged or translated text. Prefer natural height, min-height, flexible spacing, and wrapping unless a fixed dimension is essential. A fixed width larger than 320px can create page-level horizontal overflow.",
              "Blocked wrapping: white-space nowrap is useful for dates and code, but it can push long buttons or navigation beyond a narrow viewport. Decide whether one line is essential and allow the control to grow, wrap, or scroll only inside a justified region.",
              "Absolute and fixed positioning: pixel-positioned text and icons can overlap when line count or font size changes. Fixed headers and bottom actions can also obscure content at high zoom. Prefer normal flow and flexible grid or flex sizing where possible.",
              "Restricted line height and overflow: if font size grows while a fixed pixel line height remains small, glyphs and controls can overlap or clip. Test single-line fields and compact components with actual enlarged text.",
              "Viewport-only font sizing: a size such as 2vw can respond to viewport changes in ways that prevent the expected enlargement across zoom and breakpoints. If you use clamp(), combine it with sensible relative minimums and verify the outcome.",
            ],
          },
          {
            heading: "Does px fail accessibility while rem passes?",
            body: [
              "No. Modern full-page browser zoom can enlarge text sized in px, so the claim that px equals failure is not accurate. A rem-based interface can still clip content when its container has a fixed height or hidden overflow. Conformance depends on the result after resizing, not the name of the CSS unit.",
              "Relative units are still useful. rem can respond to a user's default font setting, and em can help spacing and control dimensions grow with local text. Use the CSS unit converter when changing values, then verify the final behavior in this checker and in a real browser.",
            ],
          },
          {
            heading: "Why review images of text separately?",
            body: [
              "Text embedded in an image cannot be restyled like HTML text and may lose clarity when enlarged. Except where a particular visual presentation is essential, use real text and CSS. This checker blocks external images and does not recognize text inside them, so inspect the design and implementation separately for images of text.",
            ],
          },
          {
            heading: "How should you interpret detected candidates?",
            body: [
              "Page horizontal overflow means the document became wider than the test viewport. Possible clipping means a text container has more scroll content than its visible box while overflow is hidden or clipped. Horizontal scroll region identifies a component that scrolls separately and may be justified for a table or diagram.",
              "Every candidate is marked as either already present in the original or introduced by the preset. Separating the two makes it easier to decide what the resize actually broke and what was already too tight.",
              "No detected candidates does not confirm conformance. A person still needs to inspect overlap, available functionality, access to truncated text, and actual browser zoom. The preview narrows the search; it does not replace an accessibility evaluation.",
            ],
          },
          {
            heading: "A practical pre-release sequence",
            body: [
              "Prepare representative short labels and the longest realistic content. Use 200% text to review cards, buttons, fields, tabs, and tooltips, then use 320px reflow to find page-level horizontal scrolling and fixed UI obstruction. Apply text spacing and inspect paragraphs, controls, and badges for clipping or overlap.",
              "Review fixed dimensions, overflow, and nowrap on every detected element, then retest the deployed interface with actual browser zoom and keyboard operation. Use the HTML accessibility checker when structure or DOM order appears incorrect, and measure rendered colors separately with the contrast checker.",
            ],
          },
        ],
        examples: [
          {
            title: "Checking the sample card with 200% text",
            input: "The summary-card loaded by Load sample (width 560px, height 230px, overflow hidden), preset 200% text, viewport 768px",
            result:
              "One candidate. CLIP-001 possible vertical clipping on section: 448px of content inside a 228px clientHeight",
            note: "Only the text doubled, yet the content is nearly twice the height of the card. The save button and link at the bottom disappear, so the fixed height should become a min-height.",
          },
          {
            title: "Checking the same card with 320px reflow",
            input: "The same input, preset 320px reflow (original 1280px, test 320px)",
            result:
              "Two candidates. REFLOW-001 page horizontal overflow on the document (scrollWidth 560px, clientWidth 320px) and REFLOW-002 on section (right edge 560px)",
            note: "A single fixed width of 560px is the cause. The paragraphs and buttons inside overflow too, but only the outermost element is listed so there is one place to fix.",
          },
          {
            title: "Checking the same card with WCAG text spacing",
            input: "The same input, preset text spacing, viewport 768px",
            result:
              "One candidate. CLIP-001 on section: 260px of content inside a 228px clientHeight. Paragraph line height goes from 28.8px to 36px, margin-bottom from 6px to 32px, and letter spacing from 0 to 1.92px",
            note: "Font size never changed, yet wider spacing alone overflows the card. Resizing and spacing are separate conditions, which is why each has its own preset.",
          },
          {
            title: "Checking a Tailwind component as JSX",
            input:
              "Source format JSX or TSX, Tailwind class styling on, the ReleaseSummaryCard loaded by Load sample (h-[230px] w-[560px] overflow-hidden, whitespace-nowrap on the badge row), @theme { --color-brand: #2d5dc8 } in the CSS field, preset 320px reflow",
            result:
              "Two candidates. REFLOW-001 page horizontal overflow on the document (scrollWidth 560px, clientWidth 320px) and REFLOW-002 on section. Notices report four expressions turned into placeholders and one mapped list rendered as three items",
            note: "A single w-[560px] is what breaks the 320px viewport. Because the @theme block was pasted along with the component, the project-only token text-brand is not reported as unknown and renders in its real color.",
          },
        ],
        limitations: [
          "This is not a copy of real browser zoom. The 200% text preset doubles computed font sizes only, while full-page zoom also scales spacing, images and media query behavior. Confirm the final result with the browser's own zoom.",
          "JavaScript is not executed. JSX and TSX are read as syntax only and turned into markup. React hydration, script-opened dialogs, runtime class changes and dynamic state are not reproduced.",
          "The markup inside your own components is unknown. Components whose names suggest an element (Button, Link, Image and similar) are rendered as that element; the rest become styled containers or are replaced by their children. Spread props ({...props}) are skipped because their values live in the calling component.",
          "Real expression values are unknown. A part such as {user.name} becomes placeholder text made of the expression source, so its length differs from the real copy, and mapped lists are always repeated three times.",
          "Tailwind styles are generated from the default theme bundled with this tool. Unless your tailwind.config, plugins or @theme definitions are pasted into the CSS field, those classes produce no CSS and are only listed in a notice.",
          "External web fonts, images and stylesheets are never loaded. System fonts change where lines break compared with production, and images appear as neutral placeholders that keep only their dimensions.",
          "Overlap is not detected automatically. Whether two pieces of text actually overlap, and whether that overlap hides functionality, has to be judged by looking at the preview.",
          "Maps, data tables and diagrams are not automatically classified as reflow exceptions. Horizontal scroll regions are listed as candidates and a person decides whether the exception applies.",
          "Input is limited to 200,000 characters of HTML or text, 100,000 characters of CSS, and 10,000 elements. Check a larger screen one component at a time.",
          "Zero detected candidates does not mean the markup conforms to WCAG or to another accessibility standard. This tool reports no score and no pass or fail.",
        ],
        sources: [
          {
            label: "W3C · WCAG 2.2 Understanding Resize Text",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html",
          },
          {
            label: "W3C · WCAG 2.2 Understanding Reflow",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/reflow.html",
          },
          {
            label: "W3C · WCAG 2.2 Understanding Text Spacing",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html",
          },
          {
            label: "W3C · WCAG 2.2 Understanding Images of Text",
            url: "https://www.w3.org/WAI/WCAG22/Understanding/images-of-text.html",
          },
          {
            label: "MDN · iframe sandbox",
            url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#sandbox",
          },
          {
            label: "MDN · Content Security Policy",
            url: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy",
          },
          {
            label: "React · Writing Markup with JSX",
            url: "https://react.dev/learn/writing-markup-with-jsx",
          },
          {
            label: "Tailwind CSS · Theme variables",
            url: "https://tailwindcss.com/docs/theme",
          },
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "웹접근성에 최소 글자 크기 기준이 있나요?",
          answer:
            "WCAG 2.2는 모든 콘텐츠에 적용되는 하나의 최소 폰트 크기를 정하지 않습니다. 대신 사용자가 텍스트를 최대 200%까지 키워도 내용과 기능이 잘리거나 가려지지 않는지 검사합니다. 작은 기본 글자는 사용성을 해칠 수 있으므로 실제 독해성도 별도로 검토해야 합니다.",
        },
        {
          question: "200% 텍스트 확대와 400% 확대는 무엇이 다른가요?",
          answer:
            "200% 텍스트 프리셋은 글자 크기를 두 배로 만들어 고정 컨테이너의 내성을 확인합니다. 400% 확대와 관련된 리플로 검사는 1280 CSS px viewport가 320 CSS px로 줄어든 조건을 사용해 페이지가 한 방향으로 재배치되는지 확인합니다.",
        },
        {
          question: "WCAG 텍스트 간격 기준값은 무엇인가요?",
          answer:
            "줄 높이 1.5배, 문단 뒤 간격 2배, 글자 간격 0.12배, 단어 간격 0.16배입니다. 사이트가 이 값을 기본 디자인으로 사용해야 한다는 뜻이 아니라, 사용자가 해당 값으로 바꿔도 콘텐츠와 기능이 유지되어야 한다는 뜻입니다.",
        },
        {
          question: "px 대신 rem을 사용하면 확대 문제를 해결할 수 있나요?",
          answer:
            "rem과 em은 사용자 기본 글자 크기와 컴포넌트 내부 비율을 반영하는 데 유용하지만 자동 해결책은 아닙니다. px도 브라우저 확대로 커질 수 있고, rem을 사용해도 고정 height나 숨김 overflow가 있으면 문구가 잘릴 수 있으므로 실제 결과를 검사해야 합니다.",
        },
        {
          question: "React JSX나 TSX 컴포넌트를 그대로 검사할 수 있나요?",
          answer:
            "네. 소스 형식을 JSX·TSX로 바꾸고 컴포넌트 코드를 붙여넣으면 됩니다. 코드는 실행하지 않고 구문만 읽어 마크업으로 바꿉니다. 다만 JavaScript 상태, 컴포넌트 내부 마크업과 실제 데이터 값은 재현하지 않으므로 마지막에는 실제 브라우저에서 다시 테스트하세요.",
        },
        {
          question: "Tailwind 클래스로 만든 화면도 검사할 수 있나요?",
          answer:
            "네. Tailwind 클래스로 스타일 만들기를 켜면 마크업에 쓰인 클래스만 골라 브라우저 안에서 Tailwind CSS를 만들어 미리보기에 적용합니다. 프로젝트가 @theme 로 정의한 색·간격 토큰을 쓰고 있다면 그 블록을 CSS 입력 영역에 함께 붙여넣으세요. CSS가 만들어지지 않은 클래스는 결과 아래 안내에 이름이 표시됩니다.",
        },
        {
          question: "{user.name} 같은 표현식은 어떻게 그려지나요?",
          answer:
            "값을 알 수 없으므로 식 자체를 자리표시자 텍스트로 넣습니다. 빈칸으로 지우면 확대 검사에서 가장 중요한 글자 길이가 사라지기 때문입니다. 자리표시자 길이는 실제 문구와 다르므로 가장 긴 실제 문구로 한 번 더 확인하는 편이 안전합니다. 목록을 그리는 map 은 항목 3개로 반복해 좁은 화면의 줄바꿈을 볼 수 있게 합니다.",
        },
        {
          question: "입력한 코드가 서버로 전송되나요?",
          answer:
            "아닙니다. 정제, JSX 변환, Tailwind CSS 생성, preview 렌더링과 측정이 모두 브라우저에서 이루어집니다. Tailwind 도 CDN 스크립트나 빌드 서버를 부르지 않습니다. 입력 원문, 요소 경로와 화면 문구는 Kitfolio 서버에 저장하거나 분석 이벤트로 전송하지 않습니다.",
        },
      ],
      en: [
        {
          question: "Does WCAG define a minimum font size?",
          answer:
            "WCAG 2.2 does not set one minimum font size for all content. It requires text to be resizable up to 200% without loss of content or functionality. Very small default text can still be a usability problem and should be reviewed separately.",
        },
        {
          question: "What is the difference between 200% text and 400% zoom?",
          answer:
            "The 200% text preset doubles computed font sizes to stress fixed containers. The reflow condition associated with 400% zoom uses a 320 CSS pixel viewport, equivalent to zooming a 1280 CSS pixel starting viewport to 400%, and checks whether content reflows in one direction.",
        },
        {
          question: "What are the WCAG text spacing values?",
          answer:
            "They are line height of at least 1.5 times font size, space after paragraphs of at least 2 times font size, letter spacing of at least 0.12 times font size, and word spacing of at least 0.16 times font size. Content must survive these overrides; they are not required default styles.",
        },
        {
          question: "Will replacing px with rem fix text resizing issues?",
          answer:
            "Relative units can help text and related dimensions respond to user settings, but they do not guarantee success. Browser zoom can enlarge px text, while a rem-based component can still clip content because of fixed height or hidden overflow. Test the rendered outcome.",
        },
        {
          question: "Can I test a React JSX or TSX component directly?",
          answer:
            "Yes. Switch the source format to JSX or TSX and paste the component. The code is never executed: its syntax is read and turned into markup. JavaScript state, the markup inside your components, and real data values are not reproduced, so finish the review in the real browser.",
        },
        {
          question: "Does it work with Tailwind classes?",
          answer:
            "Yes. Turn on Tailwind class styling and the checker generates Tailwind CSS in your browser for the classes it finds in the markup, then applies it to both previews. If your project defines color or spacing tokens with @theme, paste that block into the CSS field too. Classes that produced no CSS are named in a notice under the result.",
        },
        {
          question: "How are expressions such as {user.name} rendered?",
          answer:
            "Their values are unknown, so the expression source itself becomes placeholder text. Blanking it out would remove the text length that resize testing depends on. Placeholder length differs from real copy, so re-check with your longest real string. A mapped list is repeated as three items so you can see how the row wraps on a narrow screen.",
        },
        {
          question: "Is my code sent to a server?",
          answer:
            "No. Sanitization, JSX conversion, Tailwind CSS generation, preview rendering, and measurement all run in your browser, and the Tailwind step contacts no CDN script or build server. The source, element paths, and visible copy are not uploaded to or stored by Kitfolio and are not included in analytics events.",
        },
      ],
    },
    og: {
      ko: {
        title: "텍스트 확대·간격 검사기",
        subtitle: "200% 확대·320px 리플로·WCAG 간격을 한 화면에서 비교",
      },
      en: {
        title: "Text Scaling & Spacing Checker",
        subtitle: "Compare 200% text, 320px reflow and WCAG spacing side by side",
      },
    },
  },
  {
    slug: "accessibility-checklist",
    layout: "card",
    cat: "design",
    targets: ["pm", "designer", "developer"],
    ico: "☑",
    ready: true,
    indexable: true,
    verifiedAt: "2026-09-12",
    badge: "Clean SaaS",
    name: { ko: "웹접근성 체크리스트 빌더", en: "Web Accessibility Checklist Builder" },
    // 네 검사 도구보다 앞 단계에서 쓰는 도구라, 항목에서 각 검사 도구로 내려보낸다.
    relatedTools: [
      "html-accessibility-checker",
      "color-contrast-checker",
      "color-blindness-simulator",
      "text-scaling-checker",
    ],
    seo: {
      ko: {
        title: "웹접근성 체크리스트 빌더 | KWCAG·WCAG 2.2 검사항목",
        description:
          "KWCAG 2.2 33개 검사항목 또는 WCAG 2.2 Level A·AA 기준을 고르고 서비스 기능에 맞는 웹접근성 체크리스트를 만드세요. 기획·디자인·퍼블리싱 역할과 검토 상태, 메모, 근거 URL을 브라우저에 저장하고 Markdown·CSV로 내보낼 수 있습니다. 로그인과 업로드 없이 전부 브라우저에서 처리됩니다.",
        keywords: [
          "웹접근성 체크리스트",
          "KWCAG 2.2 검사항목",
          "WCAG 2.2 체크리스트",
          "한국형 웹 콘텐츠 접근성 지침",
          "웹접근성 점검표",
          "웹접근성 인증 준비",
          "접근성 QA",
          "접근성 검사 항목",
          "WCAG AA 체크리스트",
          "접근성 검수 체크리스트",
          "웹접근성 33개 항목",
        ],
      },
      en: {
        title: "Web Accessibility Checklist Builder | WCAG 2.2",
        description:
          "Choose WCAG 2.2 Level A or AA, or the 33 KWCAG 2.2 requirements, and generate an accessibility checklist that matches the features your product actually has. Assign planning, design, and development roles, track review status, notes, and evidence in your browser, and export the result as Markdown or CSV. No sign-in and no upload.",
        keywords: [
          "web accessibility checklist",
          "wcag 2.2 checklist",
          "accessibility qa checklist",
          "accessibility audit checklist",
          "wcag aa checklist",
          "website accessibility testing plan",
          "wcag level a criteria list",
          "kwcag 2.2 requirements",
          "accessibility review tracker",
          "accessibility checklist generator",
        ],
      },
    },
    content: {
      ko: {
        card: "KWCAG·WCAG 2.2 항목으로 프로젝트용 체크리스트를 만들고 역할·상태·근거를 관리합니다.",
        description:
          "적용 기준과 목표 레벨, 테스트 환경, 서비스가 가진 기능을 선택하면 기획·디자인·퍼블리싱 담당이 함께 관리할 수 있는 접근성 검토 목록을 만듭니다. 항목마다 실무 질문과 확인 방법, 완료 근거 예시를 제공하고 상태·메모·근거 URL을 기록할 수 있습니다. 결과는 이 브라우저에만 저장되며 Markdown 또는 CSV로 내보내 전달합니다.",
        howItWorks: [
          "기준·목표 레벨·테스트 환경과 서비스 기능 선택",
          "항목별 상태·메모·근거 URL 기록과 역할·축 필터",
          "Markdown 복사·다운로드 또는 CSV 다운로드",
        ],
        aeo: {
          what: "웹접근성 체크리스트 빌더는 KWCAG 2.2 또는 WCAG 2.2 기준을 프로젝트에서 실행할 수 있는 검토 항목으로 구성하고, 역할·진행 상태·메모·근거를 관리해 Markdown이나 CSV로 내보내는 브라우저 도구입니다.",
          who: "프로젝트 착수부터 출시 전 QA까지 접근성 업무를 나눠야 하는 PM, 서비스 기획자, 디자이너, 퍼블리셔, 프론트엔드 개발자와 QA 담당자에게 적합합니다.",
          how: "적용 기준, WCAG 목표 레벨, 테스트 환경과 서비스 기능을 선택하면 항목이 생성됩니다. 각 항목에서 상태와 메모·근거를 기록하고 역할이나 검사 축으로 필터링한 뒤 문서로 내보냅니다.",
          why: "기준 번호만 있는 긴 목록을 역할과 실행 단계에 맞게 바꾸고, 프로젝트에 없는 기능을 해당 없음 후보로 확인하며, 검토 이력과 이슈를 한 형식으로 전달할 수 있기 때문입니다.",
        },
        guide: [
          {
            heading: "웹접근성 체크리스트는 어떻게 시작해야 하나요?",
            body: [
              "웹접근성 체크리스트는 출시 직전 QA에서 갑자기 꺼내는 문서가 아닙니다. 대체 텍스트의 작성 책임, 색상 시스템, 키보드 인터랙션, 오류 안내와 인증 방식처럼 구조를 바꾸는 항목은 기획과 설계 단계에서 결정해야 수정 비용이 낮습니다. 프로젝트를 시작할 때 기준과 담당을 정하고, 디자인 리뷰와 구현 QA에서 같은 목록을 업데이트하는 방식이 효율적입니다.",
              "첫 단계는 적용 기준을 정하는 것입니다. 국내 웹 프로젝트에서 KWCAG 2.2를 기준으로 사전 점검할지, 국제 기준인 WCAG 2.2의 A 또는 AA를 목표로 할지 팀 안에서 명시해야 합니다. 두 기준은 공통된 원칙이 많지만 번호와 구성, 일부 세부 항목이 같지 않습니다. 따라서 하나를 다른 하나의 단순 번역본으로 취급하면 누락이나 잘못된 완료 판단이 생길 수 있습니다.",
            ],
          },
          {
            heading: "KWCAG 2.2와 WCAG 2.2는 무엇이 다른가요?",
            body: [
              "KWCAG 2.2는 국내 웹 콘텐츠 접근성 표준으로 4개 원칙, 14개 지침, 33개 검사항목을 제시합니다. A·AA·AAA 등급을 사용하지 않습니다. 국내 웹 접근성 품질인증 전문가 심사의 항목도 33개지만, 체크리스트에서 한 번 통과를 선택했다고 실제 인증 준수율이 되는 것은 아닙니다. 인증은 선정된 표본 페이지와 콘텐츠를 기준으로 별도 산정하며 사용자 심사도 포함합니다.",
              "WCAG 2.2는 성공 기준을 A, AA, AAA로 나눕니다. Level AA를 목표로 하면 AA 항목만 고르는 것이 아니라 A와 AA를 모두 포함해야 합니다. 이 도구는 A 31개와 AA 24개, 합쳐서 55개를 생성하고 실무에서 목표로 삼는 일이 드문 AAA는 제외합니다. WCAG 2.2에서 삭제된 4.1.1 Parsing도 포함하지 않습니다.",
              "기준 선택이 곧 법적 의무나 인증 범위를 결정하는 것은 아닙니다. 조직의 계약 조건, 발주 규격, 정책과 최신 심사 기준을 별도로 확인해야 합니다.",
            ],
          },
          {
            heading: "민간과 공공을 선택하면 왜 항목이 달라지지 않나요?",
            body: [
              "접근성은 사용자의 이용 가능성을 다루는 품질 기준입니다. 사이트 운영 주체가 민간인지 공공인지에 따라 적용 법령, 발주 조건, 인증 필요성은 달라질 수 있지만 버튼이 키보드로 동작해야 하는지, 이미지에 적절한 대체 텍스트가 필요한지 같은 기술 검토 항목을 임의로 제거할 근거는 되지 않습니다.",
              "그래서 이 도구의 운영 유형 선택은 보고서의 프로젝트 정보와 안내 문구에만 반영합니다. 공공·품질인증 준비를 고르면 공식 심사를 대체하지 않는다는 경고를 더 분명히 보여줍니다. 실제 항목의 적용 가능성은 사이트가 영상, 인증, 시간 제한, 드래그 같은 기능을 갖는지에 따라 판단합니다.",
            ],
          },
          {
            heading: "목표 레벨은 어떻게 선택하나요?",
            body: [
              "WCAG A는 기본적인 접근 장벽을 다루지만, 일반적인 제품 품질 목표로는 AA를 권장합니다. AA를 선택하면 텍스트 명도대비, 리플로, 텍스트 간격, 비텍스트 명도대비, 가려지지 않는 초점, 최소 타겟 크기 같은 항목이 추가됩니다. 다만 목표 레벨은 계약이나 정책에 따라 정해야 하므로 도구가 대신 결정하지 않습니다.",
              "레벨을 A에서 AA로 올리면 이미 기록한 A 항목의 상태와 메모는 그대로 두고 AA 항목만 미검토로 추가됩니다. 반대로 AA에서 A로 내리면 기록이 남은 AA 항목이 사라지므로 몇 개가 삭제되는지 먼저 확인합니다. KWCAG 2.2 모드에서는 레벨을 선택하지 않습니다. 33개 전체를 만든 뒤 실제 기능에 따라 해당 없음 여부를 검토합니다.",
            ],
          },
          {
            heading: "서비스 기능 질문은 왜 필요한가요?",
            body: [
              "모든 사이트에 녹화 영상, 실시간 방송, 로그인, 시간 제한, 드래그 기능이 있는 것은 아닙니다. 정적인 체크리스트는 이런 항목을 전부 보여주거나 반대로 너무 일찍 제외합니다. 기능 질문은 적용되지 않을 가능성이 높은 항목을 표시해 검토 순서를 줄이는 장치입니다.",
              "하지만 선택 결과만으로 항목을 삭제하면 안 됩니다. 예를 들어 팀이 자동 재생 콘텐츠가 없다고 답했어도 광고, 외부 위젯, 운영 단계의 캐러셀이 추가될 수 있습니다. 그래서 이 도구는 해당 없음 후보만 표시하고 최종 판단은 사용자가 이유를 확인한 뒤 선택하도록 합니다. 키보드 사용 보장, 이름·역할·값, 웹 애플리케이션 접근성처럼 범위가 넓은 항목은 어떤 답변에서도 후보가 되지 않습니다.",
            ],
          },
          {
            heading: "역할 태그는 책임을 어떻게 나누나요?",
            body: [
              "기획 담당은 오류 문구, 시간 제한, 인증, 중복 입력, 도움 정보 같은 절차를 정의합니다. 디자인 담당은 색, 대비, 초점 표현, 타겟 크기와 색 이외의 단서를 설계합니다. 퍼블리싱·개발 담당은 의미 구조, 키보드 동작, ARIA 상태와 실제 인터랙션을 구현합니다.",
              "한 항목에 역할이 여러 개 붙는 것은 책임이 불명확해서가 아닙니다. 접근성 문제는 한 단계에서만 해결되지 않기 때문입니다. 예를 들어 폼 레이블은 기획자가 이름을 정하고, 디자이너가 시각적 라벨을 배치하며, 개발자가 입력 요소와 연결해야 합니다. 팀에서는 역할 태그를 작업을 넘기는 순서로 사용하고 최종 검토 책임자를 별도로 합의하는 것이 좋습니다.",
            ],
          },
          {
            heading: "진행률과 통과 상태는 어떻게 해석해야 하나요?",
            body: [
              "검토 진행률은 팀이 몇 개 항목을 살펴봤는지 보여주는 작업 관리 수치입니다. 접근성 준수율이나 공식 합격 가능성이 아닙니다. 통과는 현재 프로젝트 범위와 확인한 화면에서 문제를 발견하지 못했다는 기록일 뿐, 모든 페이지와 보조기술 조합에서 완전한 준수를 보장하지 않습니다.",
              "이슈는 실패 선언이 아니라 수정 작업의 시작점입니다. 메모에 영향 화면, 재현 방법, 수정 담당과 재검수 조건을 남기면 체크리스트가 단순 보고용 표가 아니라 실행 가능한 백로그가 됩니다. 해당 없음에는 적용되지 않는 이유를 적어 나중에 기능이 추가됐을 때 다시 판단할 수 있게 해야 합니다.",
              "진행률의 분모는 전체 항목에서 해당 없음을 뺀 수입니다. 모든 항목을 해당 없음으로 두면 100%가 되는 대신 검토할 항목이 없다고 표시합니다. 분모가 없는데 완료처럼 보이는 숫자를 만들지 않기 위해서입니다.",
            ],
          },
          {
            heading: "자동 검사 도구와 수동 검수는 어떻게 조합하나요?",
            body: [
              "자동 검사기는 마크업 누락, 일부 대비 값, 특정 속성과 구조를 빠르게 찾는 데 유용합니다. 하지만 대체 텍스트가 상황에 적절한지, 초점 순서가 사용 흐름과 맞는지, 오류 설명이 이해 가능한지, 색 외 단서가 충분한지는 사람의 판단이 필요합니다.",
              "권장 순서는 이렇습니다. 기획 단계에서 서비스 기능과 절차 관련 항목을 분류하고, 디자인 리뷰에서 명도대비·색각 구분·타겟 크기·초점 표현을 확인합니다. 구현 중에는 HTML 구조와 키보드 동작을 검사하고, 확대·리플로·텍스트 간격을 실제 렌더링으로 확인합니다. 그다음 스크린리더와 키보드만 사용한 주요 과업 테스트를 수행하고, 발견한 이슈를 수정한 뒤 다른 화면에 같은 패턴이 없는지 회귀 검수합니다.",
              "Kitfolio의 개별 검사 도구는 이 중 디자인 리뷰와 구현 검사 단계를 돕습니다. 체크리스트는 각 도구의 결과를 자동으로 가져오지 않습니다. 검사한 범위와 수정 링크를 메모나 근거 URL에 직접 남겨야 나중에 무엇을 근거로 통과했는지 확인할 수 있습니다.",
            ],
          },
          {
            heading: "Markdown과 CSV는 언제 사용하나요?",
            body: [
              "Markdown은 GitHub Issue, 저장소 문서, Notion 본문처럼 사람이 읽고 리뷰하는 문서에 적합합니다. 축별 제목과 항목별 상태·메모가 계층적으로 정리됩니다. CSV는 스프레드시트에서 담당별로 필터링하거나 이슈 수를 집계할 때 유용하며, 한국어 Excel에서 깨지지 않도록 UTF-8 BOM을 붙여 내보냅니다.",
              "두 형식 모두 화면 필터와 상관없이 현재 체크리스트 전체를 포함합니다. 받는 사람이 빠진 항목을 알 수 없기 때문입니다. 중요한 프로젝트라면 브라우저 저장만 믿지 말고 정기적으로 파일을 내려받아 보관하세요. 브라우저 데이터 삭제나 다른 기기 사용 시 로컬 상태는 복원되지 않습니다.",
            ],
          },
          {
            heading: "품질인증 준비에 사용할 때 주의할 점",
            body: [
              "이 도구는 심사 준비 범위를 정리하는 데 사용할 수 있지만 품질인증 심사표 자체가 아닙니다. 공식 심사는 페이지 표본 선정, 콘텐츠 단위 판정, 항목별 준수율 산정, 사용자 심사 등 별도 절차를 사용합니다. 심사를 준비한다면 신청 시점의 최신 표준심사 지침과 인증기관 안내를 확인해야 합니다.",
              "체크리스트에서 모든 항목을 통과로 표시했더라도 이를 인증 통과나 준수율 100%로 보고하지 마세요. 내부 문서에는 사전 검토 완료와 검사 범위, 사용한 브라우저·보조기술, 날짜를 함께 기록하는 표현이 정확합니다.",
            ],
          },
          {
            heading: "배포 전 권장 운영 방식",
            body: [
              "프로젝트 착수 시점에는 기준·목표·주요 기능·역할을 정합니다. 와이어프레임 리뷰에서 정보 구조, 오류 절차, 인증, 시간 제한을 확인하고, UI 리뷰에서 색·대비·포커스·타겟과 상태 표현을 확인합니다. 구현 QA에서는 키보드, 의미 구조, 이름·역할·값, 상태 메시지를 확인하고, 출시 전에는 주요 과업을 실제 브라우저와 보조기술로 반복합니다. 출시 후에는 신규 컴포넌트와 운영 콘텐츠가 추가될 때 관련 항목을 다시 엽니다.",
              "접근성은 한 번 완료하고 닫는 인증 스티커가 아니라 제품 변경과 함께 유지해야 하는 품질 조건입니다. 체크리스트의 가장 중요한 값도 완벽해 보이는 숫자가 아니라, 누가 무엇을 언제 다시 확인할지 남기는 데 있습니다.",
            ],
          },
        ],
        examples: [
          {
            title: "국내 공공 리뉴얼 사전 점검",
            input:
              "프로젝트명 고객센터 리뉴얼 · 기준 KWCAG 2.2 · 환경 반응형 웹 · 운영 공공·품질인증 준비 · 기능은 입력 폼과 복합 UI만 있음",
            result:
              "33개 항목 생성. 자막 제공, 자동 재생 금지, 정지 기능 제공, 응답시간 조절, 단일 포인터 입력 지원, 동작 기반 작동, 표의 구성, 고정된 참조 위치 정보, 접근 가능한 인증까지 9개가 해당 없음 후보로 표시됩니다",
            note: "후보 9개는 목록에서 사라지지 않고 배지만 붙습니다. 영상이나 캐러셀이 운영 중에 추가될 수 있으므로 실제 화면을 본 뒤 직접 해당 없음을 선택해야 분모에서 빠집니다. 키보드 사용 보장처럼 범위가 넓은 항목은 어떤 응답에서도 후보가 되지 않습니다.",
          },
          {
            title: "WCAG 목표를 A에서 AA로 올리기",
            input:
              "WCAG 2.2 Level A로 31개를 만들고 1.1.1을 통과로, 2.1.1을 이슈로 기록한 뒤 설정 변경에서 레벨을 AA로 변경",
            result:
              "항목이 55개로 늘고 1.1.1 통과와 2.1.1 이슈 기록은 그대로 유지됩니다. 새로 들어온 AA 24개는 전부 미검토 상태입니다",
            note: "AA 목표는 A를 포함하므로 다시 만들 필요가 없습니다. 반대로 AA에서 A로 내리면 기록이 남은 AA 항목이 몇 개 삭제되는지 먼저 확인 대화상자로 알려줍니다.",
          },
          {
            title: "진행률과 이슈 목록 전달",
            input:
              "55개 중 통과 10 · 이슈 3 · 검토 중 3 · 해당 없음 2 로 기록한 뒤 이슈 먼저 정렬로 확인하고 Markdown 다운로드",
            result:
              "검토 진행률 30%. 분모는 55에서 해당 없음 2를 뺀 53이고 분자는 검토 중·통과·이슈를 더한 16입니다",
            note: "30%는 작업 진행 상황이지 준수율이 아닙니다. 내보낸 Markdown에는 축별 제목 아래 상태·메모·근거·공식 출처가 항목마다 들어가므로 이슈 3건을 그대로 수정 백로그로 옮길 수 있습니다.",
          },
        ],
        limitations: [
          "사이트를 크롤링하거나 자동으로 진단하지 않습니다. URL을 넣어 점수를 받는 도구가 아니라 검토해야 할 항목을 만들고 기록을 남기는 도구입니다.",
          "품질인증 합격 여부를 예측하지 않고 인증마크를 발급하지도 않습니다. 공식 심사는 표본 페이지 선정, 항목별 준수율 산정, 전문가 심사와 사용자 심사를 별도로 수행합니다.",
          "민간·공공 구분이나 법적 의무 여부를 판정하지 않습니다. 운영 유형 선택은 프로젝트 정보와 안내 문구에만 반영됩니다.",
          "WCAG는 Level A와 AA만 제공하고 AAA는 포함하지 않습니다. WCAG 2.2에서 제거된 4.1.1 Parsing도 포함하지 않습니다.",
          "모바일 네이티브 앱 접근성 항목은 다루지 않습니다. 웹과 모바일 웹을 기준으로 작성돼 있습니다.",
          "한 번에 한 프로젝트만 저장합니다. 새 체크리스트를 만들면 이전 기록은 이 브라우저에서 사라지므로 먼저 내보내야 합니다.",
          "브라우저 로컬 저장이라 다른 기기·다른 브라우저와 동기화되지 않고, 시크릿 모드 종료나 브라우저 데이터 삭제 후에는 복구할 수 없습니다.",
          "연결된 네 가지 검사 도구의 결과를 자동으로 가져오지 않습니다. 도구로 이동해 확인한 내용은 직접 메모와 근거 URL에 남겨야 합니다.",
        ],
        sources: [
          { label: "W3C · WCAG 2.2 Recommendation", url: "https://www.w3.org/TR/WCAG22/" },
          {
            label: "W3C · How to Meet WCAG 2.2 Quick Reference",
            url: "https://www.w3.org/WAI/WCAG22/quickref/",
          },
          {
            label: "한국정보접근성인증평가원 · 한국형 웹 콘텐츠 접근성 지침 2.2",
            url: "https://www.wa.or.kr/board/view.asp?BoardID=0004&sn=22592",
          },
          {
            label: "한국정보접근성인증평가원 · 정보통신접근성 품질인증 표준심사 지침 (2025-01-01 시행)",
            url: "https://www.wa.or.kr/board/view.asp?BoardID=0004&sn=35560",
          },
        ],
      },
      en: {
        card: "Turn KWCAG or WCAG 2.2 requirements into a project checklist with roles, status and evidence.",
        description:
          "Pick a standard, a WCAG target level, a test environment, and the features your product actually has, then get a review list that planning, design, and development can share. Every item carries a practical question, how to check it, and what evidence to record, alongside a status, a note, and an evidence URL. Everything stays in this browser and exports as Markdown or CSV.",
        howItWorks: [
          "Choose the standard, target level, environment and product features",
          "Record status, notes and evidence, and filter by role or axis",
          "Copy or download Markdown, or download CSV",
        ],
        aeo: {
          what: "A web accessibility checklist builder is a browser tool that turns KWCAG 2.2 or WCAG 2.2 requirements into project review tasks, tracks roles, status, notes, and evidence, and exports the checklist as Markdown or CSV.",
          who: "It is designed for product managers, designers, front-end developers, publishers, and QA specialists coordinating accessibility work from planning through release review.",
          how: "Choose a standard, WCAG target level, test environment, and the features present in your product. Review the generated items, record status and evidence, filter the list, and export it.",
          why: "It converts standards into actionable, role-based tasks, highlights likely non-applicable items without hiding them, preserves local progress, and creates a consistent handoff document.",
        },
        guide: [
          {
            heading: "How should you start a web accessibility checklist?",
            body: [
              "An accessibility checklist should begin before release QA. Decisions about alternative text ownership, color systems, keyboard interaction, error recovery, and authentication can affect product structure, and resolving them during planning and design is usually cheaper than fixing them after implementation.",
              "Start by naming the standard and target the project will use. Then keep the same checklist through requirements, design review, implementation, and release testing so that decisions and evidence stay connected to the criteria they belong to.",
            ],
          },
          {
            heading: "How are KWCAG 2.2 and WCAG 2.2 different?",
            body: [
              "KWCAG 2.2 is a Korean web content accessibility standard organized into four principles, 14 guidelines, and 33 requirements. It does not use A, AA, and AAA levels. WCAG 2.2 organizes success criteria into those three conformance levels, and a WCAG AA target includes both Level A and Level AA criteria.",
              "The standards overlap in purpose, but their numbering, grouping, and some requirements differ. Do not treat one as a direct translation of the other. This builder keeps them as separate datasets: KWCAG generates all 33 requirements, while WCAG generates 31 Level A criteria, or 55 criteria when AA is selected. Level AAA is out of scope, and 4.1.1 Parsing is excluded because it was removed in WCAG 2.2.",
            ],
          },
          {
            heading: "Why does organization type not remove requirements?",
            body: [
              "Public and private organizations may have different legal, procurement, or certification obligations, but organization type alone does not determine whether a control needs a keyboard interface or an image needs an appropriate text alternative. The selection is therefore recorded as project context and changes the guidance shown, not the technical checklist.",
              "Product features are far more useful for identifying likely non-applicable items. Media, authentication, time limits, gestures, and motion input each flag a specific set of criteria for review.",
            ],
          },
          {
            heading: "How should you choose a WCAG target level?",
            body: [
              "Level A covers foundational barriers. Level AA adds requirements commonly used as a product accessibility target, including minimum contrast, reflow, text spacing, non-text contrast, focus that is not obscured, and minimum target size. The correct target may be set by policy, contract, or regulation, so the builder does not decide it for the team.",
              "Raising the target from A to AA keeps the status and notes you already recorded on Level A items and adds the AA criteria as not started. Lowering it back to A removes AA items, so the builder first tells you how many of them already carry a record. KWCAG mode has no level control and always includes all 33 requirements.",
            ],
          },
          {
            heading: "Why are some items marked as not applicable candidates?",
            body: [
              "A product without prerecorded media may not need a caption review, and a product without authentication may not need an authentication criterion. However, a setup answer is not enough to prove that a requirement is inapplicable. Embedded content, an advertisement, or a feature added after launch can change the scope at any time.",
              "The builder therefore highlights candidates but keeps them visible and inside the progress denominator. A reviewer must explicitly choose Not applicable and should record the reason. Broad criteria such as keyboard operation, name, role, value, and overall web application accessibility are never flagged as candidates, because no single feature answer can rule them out.",
            ],
          },
          {
            heading: "How should roles share accessibility work?",
            body: [
              "Planning roles define flows such as error recovery, timing, authentication, redundant entry, and help. Designers specify color, contrast, focus presentation, target size, and non-color cues. Developers implement semantics, keyboard behavior, programmatic names, roles, values, and status announcements.",
              "Many criteria need more than one role. A form label, for example, is named during planning, positioned during design, and associated with its input during implementation. Treat role tags as a handoff path and agree on one final reviewer for each product area.",
            ],
          },
          {
            heading: "What does review progress mean?",
            body: [
              "Review progress measures workflow completion. It is not a conformance score, an accessibility percentage, or a certification prediction. Passed means no issue was found in the reviewed scope; it does not prove that every page, state, browser, and assistive technology combination conforms.",
              "Use Issue to start remediation work, and record the affected screen, reproduction steps, owner, and retest condition in the note. Record a reason for every Not applicable decision so it can be reconsidered when the product changes.",
              "The denominator is the total number of items minus the ones you marked Not applicable. When every item is Not applicable the builder reports that there is nothing to review instead of showing 100%, because a full bar with no denominator reads as completion that never happened.",
            ],
          },
          {
            heading: "How should automated and manual tests be combined?",
            body: [
              "Automated checks can find missing markup, some contrast problems, and specific structural failures. Human review is still needed to judge alternative text quality, logical focus order, understandable errors, complete non-color cues, and real task completion.",
              "A practical sequence is to classify product features and process requirements during planning, review contrast, color differentiation, target size, and focus design next, inspect HTML structure and keyboard behavior during implementation, test resizing, reflow, and text spacing in the rendered interface, complete key tasks with keyboard-only and screen reader workflows, then fix issues and run regression checks across reused patterns.",
              "The individual Kitfolio checkers support the design review and implementation steps. The checklist never collects their output automatically, so record what you tested and link the fix in the note and evidence fields.",
            ],
          },
          {
            heading: "When should you use Markdown or CSV export?",
            body: [
              "Markdown works well for repository documentation, issues, and readable review notes, grouping items under each review axis with their status, notes, and sources. CSV is useful for spreadsheet filtering, ownership views, and issue counts, and it carries a UTF-8 byte order mark so Korean text opens correctly in Excel.",
              "Both exports contain the complete current checklist regardless of the filters on screen, because the person receiving the file cannot tell which items were hidden. Browser storage is convenient but it is not a durable backup, so export important work regularly, especially before clearing browser data or moving to another device.",
            ],
          },
          {
            heading: "Can this checklist be used for Korean accessibility certification?",
            body: [
              "It can organize pre-review work, but it is not the official assessment sheet and cannot predict certification. Formal assessment can include page sampling, content-level evaluation, item-level conformance calculations, and user testing. Always confirm the current assessment instructions at the time of application.",
              "Describe the output as a pre-review record together with the scope you tested, the browsers and assistive technology you used, and the date. Do not describe it as proof of certification or as 100% conformance.",
            ],
          },
        ],
        examples: [
          {
            title: "Pre-review for a Korean public sector redesign",
            input:
              "Project Support center redesign, standard KWCAG 2.2, responsive web, public sector or certification prep, with only forms and composite UI answered as present",
            result:
              "33 items generated. Nine appear as not applicable candidates: captions, no automatic audio playback, pause control, adjustable response time, single pointer input, motion actuation, table structure, fixed reference location, and accessible authentication",
            note: "Those nine stay in the list with a badge rather than disappearing. Video or a carousel can be added after launch, so they leave the denominator only when a reviewer looks at the real screens and selects Not applicable. Broad items such as keyboard accessibility are never flagged, whatever you answer.",
          },
          {
            title: "Raising a WCAG target from A to AA",
            input:
              "Build 31 Level A items, mark 1.1.1 as Passed and 2.1.1 as Issue, then change the target level to AA in the settings card",
            result:
              "The list grows to 55 items while the 1.1.1 pass and the 2.1.1 issue stay exactly as recorded. The 24 newly added AA criteria all start as Not started",
            note: "An AA target includes Level A, so there is no need to rebuild. Going back down to A instead asks for confirmation and names how many AA items with a record would be deleted.",
          },
          {
            title: "Handing over progress and an issue list",
            input:
              "Of 55 items: 10 passed, 3 issues, 3 in review, 2 not applicable, sorted with Issues first, then exported as Markdown",
            result:
              "Review progress 30%. The denominator is 55 minus the 2 not applicable items, and the numerator is the 16 items in review, passed, or flagged as issues",
            note: "30% describes workflow, not conformance. The exported Markdown lists status, note, evidence, and the official source under each axis heading, so the three issues move straight into a remediation backlog.",
          },
        ],
        limitations: [
          "It does not crawl a site or run an automated audit. You do not enter a URL and receive a score; you generate the items to review and keep the record.",
          "It does not predict a certification result or issue any conformance mark. Formal assessment runs its own sampling, item-level scoring, expert review, and user testing.",
          "It does not decide whether a legal obligation applies to your organization. The organization type only changes project context and the guidance shown.",
          "WCAG coverage is Level A and AA only. Level AAA is excluded, and 4.1.1 Parsing is excluded because it was removed in WCAG 2.2.",
          "Mobile native app accessibility is out of scope. The requirements are written for web and mobile web.",
          "Only one project is stored at a time. Starting a new checklist removes the previous record from this browser, so export it first.",
          "Local browser storage does not sync across devices or browsers, and it cannot be recovered after clearing site data or closing a private window.",
          "Results from the four linked checkers are never imported automatically. Anything you verify in those tools has to be written back into the note and evidence fields yourself.",
        ],
        sources: [
          { label: "W3C · WCAG 2.2 Recommendation", url: "https://www.w3.org/TR/WCAG22/" },
          {
            label: "W3C · How to Meet WCAG 2.2 Quick Reference",
            url: "https://www.w3.org/WAI/WCAG22/quickref/",
          },
          {
            label: "Korean Web Content Accessibility Guidelines 2.2",
            url: "https://www.wa.or.kr/board/view.asp?BoardID=0004&sn=22592",
          },
          {
            label:
              "Korean ICT Accessibility Quality Certification Standard Assessment Guidelines (effective 2025-01-01)",
            url: "https://www.wa.or.kr/board/view.asp?BoardID=0004&sn=35560",
          },
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "웹접근성 체크리스트는 자동 검사 결과인가요?",
          answer:
            "아닙니다. 표준 항목을 프로젝트 업무로 관리하기 위한 도구입니다. 일부 항목은 연결된 검사 도구로 확인할 수 있지만 최종 판단에는 실제 화면, 키보드와 보조기술을 사용한 수동 검수가 필요합니다.",
        },
        {
          question: "WCAG 2.2에서 AA를 선택하면 A 항목도 포함되나요?",
          answer:
            "네. AA 목표는 Level A와 Level AA 성공 기준을 함께 포함합니다. 이 도구에서는 A 31개와 AA 24개, 총 55개 기준을 생성합니다. AAA는 제공하지 않고, WCAG 2.2에서 제거된 4.1.1 Parsing도 포함하지 않습니다.",
        },
        {
          question: "KWCAG 2.2에도 A와 AA 레벨이 있나요?",
          answer:
            "아닙니다. KWCAG 2.2는 4개 원칙, 14개 지침, 33개 검사항목으로 구성되며 A·AA·AAA 레벨을 사용하지 않습니다. 그래서 KWCAG를 선택하면 레벨 입력이 사라지고 33개 전체가 생성됩니다.",
        },
        {
          question: "공공기관을 선택하면 체크 항목이 더 많아지나요?",
          answer:
            "운영 유형만으로 기술 항목을 추가하거나 제거하지 않습니다. 공공·품질인증 준비 선택은 안내와 내보내기 정보에 반영되며, 실제 항목 적용 가능성은 서비스 기능과 공식 요구사항을 확인해 판단해야 합니다.",
        },
        {
          question: "체크리스트 데이터는 어디에 저장되나요?",
          answer:
            "현재 브라우저의 로컬 저장소에만 저장되고 서버로 전송되지 않습니다. 프로젝트명, 메모, 근거 URL은 분석 이벤트에도 포함하지 않습니다. 브라우저 데이터를 삭제하거나 다른 기기를 사용하면 복원되지 않으므로 중요한 결과는 Markdown 또는 CSV로 내려받으세요.",
        },
        {
          question: "모든 항목을 통과로 표시하면 웹 접근성 인증을 받을 수 있나요?",
          answer:
            "아닙니다. 이 결과는 내부 사전 검토 기록이며 공식 인증 판정이 아닙니다. 실제 인증은 최신 심사 지침에 따른 표본 선정, 전문가 심사와 사용자 심사 등 별도 절차를 거칩니다. 진행률도 준수율이 아니라 검토한 항목의 비율입니다.",
        },
      ],
      en: [
        {
          question: "Does this accessibility checklist automatically audit my website?",
          answer:
            "No. It organizes standards into project review tasks. Linked tools can help inspect selected issues, but conformance still requires testing the rendered product with keyboard and assistive technology workflows.",
        },
        {
          question: "Does WCAG 2.2 Level AA include Level A criteria?",
          answer:
            "Yes. An AA target includes all Level A and Level AA success criteria. The builder generates 31 A criteria and 24 AA criteria, for a total of 55. Level AAA is not offered, and 4.1.1 Parsing is excluded because it was removed in WCAG 2.2.",
        },
        {
          question: "Does KWCAG 2.2 use A and AA levels?",
          answer:
            "No. KWCAG 2.2 is organized into four principles, 14 guidelines, and 33 requirements without A, AA, or AAA levels. Choosing KWCAG hides the level control and generates all 33 requirements.",
        },
        {
          question: "Does choosing a public organization add more checklist items?",
          answer:
            "No items are added or removed based only on organization type. The choice changes project context and certification guidance. Applicability still depends on product features and current official requirements.",
        },
        {
          question: "Where is my checklist data stored?",
          answer:
            "It stays in local browser storage and is not sent to a server. The project name, notes, and evidence URLs are never included in analytics either. Export important work as Markdown or CSV, because clearing browser data or changing devices will remove access to the saved state.",
        },
        {
          question: "Does a completed checklist prove accessibility certification?",
          answer:
            "No. It is a pre-review workflow record, not a formal conformance or certification decision. Formal assessment uses its own sampling, expert review, user testing, and scoring procedures, and review progress reports how much you reviewed rather than how much conforms.",
        },
      ],
    },
    og: {
      ko: {
        title: "웹접근성 체크리스트 빌더",
        subtitle: "KWCAG·WCAG 2.2 항목을 역할·상태·근거와 함께 관리",
      },
      en: {
        title: "Web Accessibility Checklist Builder",
        subtitle: "Turn WCAG 2.2 criteria into a tracked, exportable review list",
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
    indexable: true,
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
        guide: [
          {
            heading: "글자 수는 왜 세어야 할까요",
            body: [
              "짧은 글일수록 길이 제한이 결과를 좌우합니다. 자기소개서 항목에는 '500자 이내'처럼 명확한 상한이 있고, SNS는 플랫폼마다 허용 글자 수가 다르며, 메타 설명이나 광고 문구는 일정 길이를 넘으면 뒤가 잘려 노출됩니다. 이런 글은 '대충 이 정도'로 쓰면 반드시 다시 손봐야 하므로, 쓰는 동안 실시간으로 길이를 보는 것이 가장 효율적입니다.",
              "이 카운터는 텍스트를 입력하거나 붙여넣는 즉시 글자·단어·문장·줄·단락 수를 갱신합니다. 공백을 포함한 수와 제외한 수를 함께 보여주기 때문에, '공백 제외 300자'처럼 조건이 붙는 지원서나 과제에도 바로 맞출 수 있습니다.",
            ],
          },
          {
            heading: "한글·영어·이모지를 어떻게 세나요",
            body: [
              "글자 수 계산은 언어에 따라 헷갈리기 쉽습니다. 이 도구는 한글 한 글자, 영문 한 글자, 숫자, 문장 부호를 모두 1글자로 세고, 이모지처럼 여러 코드로 이루어진 문자도 눈에 보이는 대로 한 글자로 계산합니다. 단어 수는 공백과 줄바꿈을 기준으로 구분하므로, 영문 글쓰기에서 흔히 요구하는 '단어 수' 기준에도 그대로 활용할 수 있습니다.",
              "발표 대본이나 영상 스크립트를 준비할 때는 예상 읽기·말하기 시간이 도움이 됩니다. 분당 읽기 속도와 발화 속도를 기준으로 대략적인 소요 시간을 알려주므로, 정해진 시간 안에 들어가는 분량인지 미리 가늠할 수 있습니다.",
            ],
          },
          {
            heading: "안전하게, 그리고 바로",
            body: [
              "자기소개서 초안이나 미공개 공지처럼 남에게 보이고 싶지 않은 글을 다룰 때가 많습니다. 이 카운터는 모든 집계를 브라우저 안에서만 처리하고, 입력한 텍스트를 서버로 전송하거나 저장하지 않습니다. 탭을 닫으면 내용도 함께 사라지므로 흔적이 남지 않습니다.",
              "설치나 로그인 없이 페이지를 열면 바로 쓸 수 있어, 글을 쓰다가 길이만 빠르게 확인하고 다시 작업으로 돌아오는 흐름을 끊지 않습니다.",
            ],
          },
        ],
              examples: [
          {
            title: "메타 디스크립션을 검색 결과에서 잘리지 않게 맞추기",
            input: "작성한 설명문 초안을 붙여넣기",
            result: "글자 수·공백 제외 글자 수·단어 수·문장 수·줄 수·바이트가 동시에 갱신됩니다.",
            note: "검색 결과 스니펫은 대략 150~160자 부근에서 잘립니다. 글자 수를 보면서 문장을 줄이면 중요한 문구가 잘려 나가는 일을 피할 수 있습니다.",
          },
          {
            title: "X(트위터) 280자, Threads 500자 안에 맞추기",
            input: "게시할 초안 텍스트",
            result: "SNS 제한 카드에서 플랫폼별 남은 글자 수가 실시간으로 표시되고, 한도를 넘으면 표시가 바뀝니다.",
            note: "여러 플랫폼에 같은 글을 올릴 때 가장 짧은 한도를 기준으로 먼저 줄이면 재작성을 한 번만 하면 됩니다.",
          },
          {
            title: "자기소개서 글자 수 제한 확인",
            input: "\"공백 포함 500자 이내\" 조건의 지원서 문항 답변",
            result: "공백 포함 글자 수와 공백 제외 글자 수가 따로 표시됩니다.",
            note: "채용 사이트마다 기준이 달라 같은 글이 한쪽에서는 통과하고 다른 쪽에서는 초과가 됩니다. 제출 전에 어느 기준인지 확인하고 해당 숫자를 보세요.",
          },
        ],
        limitations: [
          "글자 수는 유니코드 코드 포인트가 아니라 자바스크립트 문자열 길이 기준입니다. 이모지나 일부 결합 문자(예: 👨‍👩‍👧, 국기 이모지)는 화면에 한 글자로 보여도 2자 이상으로 집계될 수 있습니다.",
          "SNS 제한 안내는 참고용 기준값입니다. 각 플랫폼은 링크를 고정 길이로 환산하거나 유료 플랜에 다른 한도를 적용하기도 하므로, 발행 전 해당 플랫폼에서 최종 확인하세요.",
          "문장 수는 마침표·물음표·느낌표를 기준으로 셉니다. \"Dr.\", \"3.14\", \"등...\" 처럼 마침표가 문장 끝이 아닌 경우에는 실제보다 많게 집계될 수 있습니다.",
          "바이트 수는 UTF-8 기준입니다. EUC-KR 등 다른 인코딩을 요구하는 레거시 시스템의 한도와는 값이 다릅니다.",
        ],
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
        guide: [
          {
            heading: "Why count characters at all?",
            body: [
              "The shorter the text, the more a length limit shapes the outcome. Application fields cap you at something like 500 characters, social platforms each allow a different amount, and a meta description or ad headline gets truncated once it passes a certain length. Writing these by feel almost always means going back to trim, so watching the length live as you write is the efficient way.",
              "This counter updates characters, words, sentences, lines, and paragraphs the moment you type or paste. It shows the count both with and without spaces, so you can hit requirements phrased as 'up to 300 characters excluding spaces' without guessing.",
            ],
          },
          {
            heading: "How it counts Latin, CJK, and emoji",
            body: [
              "Counting is easy to get wrong across languages. This tool counts each Korean or Chinese character, each Latin letter, digit, and punctuation mark as one character, and treats an emoji: even one built from several code points: as the single character you actually see. Words are split on spaces and line breaks, so it works for the word-count requirements common in English writing too.",
              "When you're preparing a talk or a video script, the estimated reading and speaking time helps. Based on a per-minute reading and speaking rate, it gives you a rough duration so you can tell in advance whether your draft fits the time you have.",
            ],
          },
          {
            heading: "Private, and ready right away",
            body: [
              "You're often working with things you'd rather not share yet: a résumé draft, an unpublished announcement. This counter does all of its counting inside your browser and never uploads or stores the text you enter. Close the tab and the content is gone, leaving nothing behind.",
              "With no install and no login, it's ready the moment the page opens, so you can glance at the length and get straight back to writing without breaking your flow.",
            ],
          },
        ],
              examples: [
          {
            title: "Fitting a meta description so it isn't truncated in search results",
            input: "Paste your draft description",
            result: "Characters, characters without spaces, words, sentences, lines and bytes all update at once.",
            note: "Search snippets are typically cut around 150-160 characters. Trimming while watching the count keeps your key phrase from being clipped.",
          },
          {
            title: "Staying under 280 characters on X and 500 on Threads",
            input: "The draft post you want to publish",
            result: "The social limits card shows the remaining characters per platform in real time and flags anything over the limit.",
            note: "When cross-posting, trim to the tightest limit first so you only have to rewrite once.",
          },
          {
            title: "Checking an application field with a character cap",
            input: "An answer to a question capped at 500 characters including spaces",
            result: "Counts with and without spaces are shown separately.",
            note: "Different sites count differently, so the same text can pass one form and fail another. Check which rule applies before submitting and read the matching number.",
          },
        ],
        limitations: [
          "The character count uses JavaScript string length, not Unicode code points. Emoji and some combining sequences (family emoji, flags) can count as two or more characters even though they render as one glyph.",
          "The social limit figures are reference values. Platforms may count links as a fixed length or apply different limits on paid tiers, so confirm on the platform itself before publishing.",
          "Sentences are counted from periods, question marks and exclamation marks. Text containing \"Dr.\", \"3.14\" or ellipses can therefore report more sentences than it really has.",
          "The byte count is UTF-8. Legacy systems that require another encoding, such as EUC-KR, will have different limits.",
        ],
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
            "아니요. 집계는 전부 브라우저 안에서 처리되며 입력한 텍스트는 서버로 전송되거나 저장되지 않습니다. 탭을 닫으면 내용도 사라집니다.",
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
            "No. Counting happens entirely in your browser and the text you enter is never uploaded or saved. Close the tab and the text is gone.",
        },
        {
          question: "How is the reading time estimated?",
          answer:
            "It assumes a reading speed of 200 words per minute and a speaking speed of 130 words per minute: useful for sizing scripts and presentations.",
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
  {
    slug: "salary-calculator",
    layout: "card",
    cat: "text",
    targets: ["office-worker", "job-seeker", "pm", "developer"],
    ico: "₩",
    ready: true,
    indexable: true,
    verifiedAt: POLICY_VERIFIED_AT,
    badge: "Clean SaaS",
    name: { ko: "연봉 실수령액 계산기", en: "Salary Net Pay Calculator" },
    relatedTools: [
      "growth-rate-calculator",
      "time-converter",
      "flex-work-calculator",
    ],
    seo: {
      ko: {
        title: "연봉 실수령액 계산기 | 월급 실수령 계산",
        description:
          "세전 연봉이나 월급을 입력하면 4대보험과 근로소득세·지방소득세를 빼고 예상 월 실수령액·연 실수령액과 공제 내역을 바로 보여줍니다. 비과세액, 부양가족 수, 20세 이하 자녀 수, 원천징수 비율(80·100·120%)을 반영합니다. 모든 계산은 브라우저 안에서만 이루어집니다.",
        keywords: [
          "연봉 실수령액 계산기",
          "실수령액 계산기",
          "월급 실수령액",
          "연봉 계산기",
          "세후 연봉 계산",
          "4대보험 계산기",
          "연봉 실수령",
        ],
      },
      en: {
        title: "Salary Net Pay Calculator | Korea Take-Home Pay",
        description:
          "Enter your gross annual salary or monthly pay and instantly see estimated monthly and yearly take-home pay after Korea's four major insurances and income & local taxes, with a full deduction breakdown. Adjust non-taxable amount, dependents, children and withholding rate. Everything runs in your browser.",
        keywords: [
          "salary net pay calculator",
          "korea take-home pay calculator",
          "net salary calculator korea",
          "after tax salary korea",
          "korean income tax calculator",
          "monthly net pay",
        ],
      },
    },
    content: {
      ko: {
        card: "세전 연봉·월급으로 4대보험·세금을 뺀 예상 실수령액과 공제 내역을 즉시 계산.",
        description:
          "세전 연봉이나 월급을 입력하면 국민연금·건강보험·장기요양·고용보험과 근로소득세·지방소득세를 빼고 예상 월 실수령액과 연 실수령액, 그리고 항목별 공제 내역을 표로 보여줍니다. 비과세액, 부양가족 수, 20세 이하 자녀 수, 원천징수 선택비율(80·100·120%)을 반영해 입사·이직·연봉협상 때 빠르게 확인할 수 있습니다. 모든 계산은 브라우저 안에서만 이루어집니다.",
        howItWorks: [
          "연봉 또는 월급 금액 입력",
          "비과세·부양가족·자녀·원천징수 비율 설정",
          "월·연 실수령액과 공제 내역 확인",
        ],
        aeo: {
          what: "연봉 실수령액 계산기는 세전 연봉이나 월급을 입력하면 4대보험과 근로소득세·지방소득세를 공제한 예상 월·연 실수령액과 항목별 공제 내역을 보여주는 도구입니다.",
          who: "연봉협상이나 이직을 앞둔 직장인, 취업준비생, 제안받은 연봉을 비교하려는 사람, 그리고 대략적인 실수령액을 빠르게 확인해야 하는 HR·PM·개발자를 위한 도구입니다.",
          how: "연봉 또는 월급을 입력하면 비과세액을 뺀 과세소득으로 국민연금·건강보험·장기요양·고용보험을 계산하고, 근로소득 간이세액표 방식을 근사해 근로소득세와 지방소득세를 산출한 뒤 모두 더해 실수령액을 구합니다. 부양가족 수, 20세 이하 자녀 수, 원천징수 선택비율을 반영합니다.",
          why: "광고가 많고 입력이 복잡한 다른 계산기 대신, 입력하면 바로 결과가 나오는 빠른 예상 계산기로 연봉협상·이직 비교를 몇 초 만에 끝낼 수 있기 때문입니다.",
        },
        guide: [
          {
            heading: "세전 연봉과 실수령액은 왜 다를까",
            body: [
              "'연봉 4천만원'이라고 할 때의 금액은 세금과 보험료를 떼기 전의 세전 금액입니다. 실제로 통장에 들어오는 돈은 여기서 4대보험(국민연금·건강보험·장기요양보험·고용보험)과 근로소득세·지방소득세를 뺀 실수령액이며, 연봉 구간에 따라 세전 금액의 대략 8~18%가 공제됩니다. 그래서 같은 '연봉'이라도 세전으로 비교하느냐 실수령으로 비교하느냐에 따라 체감이 크게 달라집니다.",
              "이 계산기는 세전 연봉이나 월급을 입력하면 각 항목이 얼마씩 빠지는지 표로 나눠 보여주고, 월 실수령액과 연 실수령액을 함께 계산합니다. 어떤 공제가 실수령액을 가장 많이 줄이는지 눈으로 확인할 수 있어, 급여명세서를 처음 받아보는 사회초년생이 구조를 이해하는 데도 도움이 됩니다.",
            ],
          },
          {
            heading: "결과를 바꾸는 입력 항목들",
            body: [
              "실수령액은 연봉 금액만으로 정해지지 않습니다. 식대 같은 비과세 금액은 세금과 보험료 계산에서 빠지므로 비과세액이 클수록 실수령액이 늘어납니다. 부양가족 수와 20세 이하 자녀 수는 근로소득세를 줄이는 방향으로 작용하고, 매월 떼는 세금 비율을 정하는 원천징수 선택비율(80·100·120%)도 월 실수령액에 영향을 줍니다.",
              "특히 원천징수 비율은 오해하기 쉬운 항목입니다. 80%를 고르면 매달 세금을 덜 떼어 월 실수령액이 늘지만 연말정산에서 그만큼 더 낼 수 있고, 120%는 반대로 매달 더 떼는 대신 연말에 돌려받을 가능성이 커집니다. 연간 총 세액 자체는 같으므로, 매달 받는 금액과 연말 정산 시점 중 어느 쪽을 선호하는지의 문제입니다.",
            ],
          },
          {
            heading: "예상치로 현명하게 쓰는 법",
            body: [
              "이 계산기는 최신 4대보험 요율과 근로소득 간이세액표 방식을 근사한 예상값을 제공합니다. 회사별 비과세 항목, 상여·성과급, 중도 입퇴사, 각종 소득공제, 최종 연말정산 결과까지는 반영하지 않으므로 실제 급여명세서와는 차이가 있을 수 있습니다. 정확한 세액은 국세청 홈택스나 회사 급여 담당 부서를 통해 확인하는 것이 좋습니다.",
              "그럼에도 이런 빠른 예상 계산이 유용한 이유는, 이직 제안을 비교하거나 연봉협상 목표를 잡을 때 '이 연봉이면 매달 대략 얼마가 들어오는지'를 몇 초 안에 감 잡을 수 있기 때문입니다. 여러 금액을 바꿔 넣어보며 협상 구간을 잡는 용도로 활용해 보세요.",
            ],
          },
        ],
              examples: [
          {
            title: "연봉 5,200만원 직장인의 월 실수령액 (2026년 8월 기준)",
            input: "연봉 52,000,000 · 비과세 200,000 · 부양가족 1명 · 원천징수 100%",
            result: "세전 월 4,333,333원 → 총 공제 652,591원 → 월 실수령 3,680,742원",
            note: "공제 내역은 국민연금 196,333 · 건강보험 148,593 · 장기요양 19,525 · 고용보험 37,200 · 근로소득세 228,127 · 지방소득세 22,813원입니다. 세전 대비 약 85%가 남습니다.",
          },
          {
            title: "식대 비과세 20만원이 있고 없고의 차이",
            input: "같은 연봉 52,000,000에 비과세 0원과 200,000원을 각각 입력",
            result: "월 실수령 3,633,164원 vs 3,680,742원 (월 47,578원, 연 570,936원 차이)",
            note: "비과세 금액은 4대보험과 세금 계산의 기준 소득 자체를 줄이기 때문에 세금만 줄이는 것보다 효과가 큽니다. 이직 제안을 비교할 때 세전 연봉이 같아도 비과세 구성이 다르면 실수령이 달라집니다.",
          },
          {
            title: "국민연금 상한을 넘는 고소득 구간",
            input: "월급 8,000,000 · 비과세 200,000",
            result: "국민연금 313,025원에서 고정 (과세소득 7,800,000원이 상한 6,590,000원을 초과)",
            note: "급여가 더 올라도 국민연금 보험료는 그대로입니다. 반면 건강보험료는 상한이 훨씬 높아 계속 늘어나므로, 고소득 구간에서는 공제 구성이 달라집니다.",
          },
        ],
        sources: OFFICIAL_SOURCES.map((x) => ({ label: x.label.ko, url: x.url })),
        limitations: [
          "국세청 근로소득 간이세액표의 산출 방식을 근사한 예상값입니다. 실제 원천징수액은 국세청이 고시한 구간표에서 직접 찾은 금액이므로 수천 원 단위로 차이가 날 수 있습니다.",
          "국민연금 기준소득월액은 전년도 소득을 바탕으로 매년 7월에 새로 정해집니다. 따라서 실제 고지되는 연금 보험료는 지금 받는 급여가 아니라 작년 소득 기준일 수 있으며, 특히 최근에 연봉이 크게 오른 경우 이 계산 결과보다 낮게 나옵니다.",
          "매달 같은 급여를 받는다고 가정합니다. 상여금·성과급·연차수당, 중도 입사·퇴사에 따른 일할 계산은 반영되지 않습니다.",
          "비과세는 입력한 금액을 그대로 적용합니다. 회사마다 식대(월 20만원 한도)·자가운전보조금·육아수당 등 비과세 항목 구성이 다르므로, 실제 급여명세서의 비과세 합계를 넣어야 정확합니다.",
          "건강보험료 연말정산(전년도 보수총액 확정 후 이듬해 4월에 추가 납부하거나 환급받는 금액)과 연말정산에 따른 세금 정산은 계산에 포함되지 않습니다.",
          "4대보험이 적용되는 근로자 기준입니다. 사업소득 3.3% 원천징수를 받는 프리랜서, 일용근로자, 대표이사 등 다른 신분에는 맞지 않습니다.",
        ],
      },
      en: {
        card: "Estimate monthly & yearly take-home pay from gross salary after Korea's insurances and taxes, with a full breakdown.",
        description:
          "Enter your gross annual salary or monthly pay and this calculator deducts Korea's National Pension, Health Insurance, Long-Term Care and Employment Insurance, plus income and local income tax, to show estimated monthly and yearly take-home pay with an itemized deduction table. It accounts for your non-taxable amount, dependents, children under 20 and the withholding rate (80/100/120%), so you can check the number fast during hiring, a job change or a salary negotiation. Everything runs in your browser.",
        howItWorks: [
          "Enter your annual or monthly pay",
          "Set non-taxable, dependents, children & withholding rate",
          "See monthly & yearly net pay with the breakdown",
        ],
        aeo: {
          what: "A Salary Net Pay Calculator takes a gross annual salary or monthly pay in Korea and shows the estimated monthly and yearly take-home pay after the four major insurances and income & local taxes, with an itemized deduction breakdown.",
          who: "It is for office workers heading into a salary negotiation or job change, job seekers comparing offers, and HR, PMs or developers who need a quick estimate of net pay.",
          how: "Enter an annual or monthly amount; the calculator subtracts the non-taxable portion, computes National Pension, Health, Long-Term Care and Employment Insurance on the taxable base, and approximates income and local tax from Korea's simplified withholding tax table. It reflects the number of dependents, children under 20 and the chosen withholding rate.",
          why: "Unlike ad-heavy calculators with long forms, it returns a result the moment you type, so you can finish a salary comparison or negotiation check in seconds.",
        },
        guide: [
          {
            heading: "Why gross salary and take-home pay differ",
            body: [
              "The figure people mean by an annual salary is the gross amount, before taxes and insurance are withheld. What actually lands in your account is the take-home pay left after Korea's four major insurances (National Pension, Health Insurance, Long-Term Care, Employment Insurance) and income and local income tax: roughly 8-18% of the gross depending on the salary band. So the same 'salary' can feel very different depending on whether you compare it gross or net.",
              "Enter a gross annual or monthly figure and this calculator breaks out how much each item takes, and computes both monthly and yearly take-home pay. Seeing which deduction reduces your net pay the most makes it easier to understand the structure: useful especially for someone reading their first payslip.",
            ],
          },
          {
            heading: "The inputs that change the result",
            body: [
              "Take-home pay isn't set by the salary figure alone. A non-taxable amount such as a meal allowance is excluded from the tax and insurance base, so a larger non-taxable amount raises your net pay. The number of dependents and children under 20 lowers income tax, and the withholding rate you choose (80/100/120%) shifts how much tax is taken each month.",
              "The withholding rate is the piece most people misread. Choosing 80% withholds less each month: raising monthly net pay, but you may owe more at year-end settlement; 120% does the opposite, withholding more monthly with a better chance of a refund. The total annual tax is the same either way, so it comes down to whether you'd rather have the money monthly or at settlement.",
            ],
          },
          {
            heading: "Using it wisely as an estimate",
            body: [
              "This calculator gives an estimate that approximates the latest insurance rates and Korea's simplified withholding tax table. It does not account for company-specific non-taxable items, bonuses, mid-year joining or leaving, various deductions, or your final year-end settlement, so it can differ from your actual payslip. For an exact figure, check Hometax or your payroll department.",
              "It's still useful precisely because it's fast: when comparing job offers or setting a negotiation target, you can grasp roughly what a given salary means per month in seconds. Try several figures to map out your negotiation range.",
            ],
          },
        ],
              examples: [
          {
            title: "Monthly take-home on a 52,000,000 KRW salary (as of August 2026)",
            input: "Annual 52,000,000 · non-taxable 200,000 · 1 dependent · 100% withholding",
            result: "Gross 4,333,333/month → deductions 652,591 → take-home 3,680,742",
            note: "The breakdown is National Pension 196,333, Health Insurance 148,593, Long-Term Care 19,525, Employment Insurance 37,200, income tax 228,127 and local income tax 22,813. About 85% of gross survives.",
          },
          {
            title: "What a 200,000 non-taxable meal allowance is worth",
            input: "The same 52,000,000 salary entered with 0 and with 200,000 non-taxable",
            result: "3,633,164 vs 3,680,742 a month (a difference of 47,578 monthly, 570,936 a year)",
            note: "Non-taxable pay lowers the base for both insurance and tax, so it does more than a tax deduction alone. Two offers with identical gross salaries can pay differently once the non-taxable split differs.",
          },
          {
            title: "Earnings above the National Pension ceiling",
            input: "Monthly 8,000,000 · non-taxable 200,000",
            result: "National Pension fixed at 313,025 (taxable income of 7,800,000 exceeds the 6,590,000 ceiling)",
            note: "Further raises do not increase the pension contribution. Health insurance has a far higher cap and keeps rising, so the mix of deductions changes at higher salaries.",
          },
        ],
        sources: OFFICIAL_SOURCES.map((x) => ({ label: x.label.en, url: x.url })),
        limitations: [
          "This approximates the method behind the National Tax Service's simplified withholding tax table. Actual withholding is read from the published bracket table, so figures can differ by a few thousand won.",
          "The National Pension standard monthly income is reset each July from the previous year's earnings. The pension contribution actually billed may therefore reflect last year's income rather than your current salary, and will come out lower than this estimate if you recently had a large raise.",
          "It assumes the same pay every month. Bonuses, performance pay, unused-leave allowances and pro-rated pay for joining or leaving mid-month are not modelled.",
          "Non-taxable pay is applied exactly as entered. Companies structure it differently across meal allowances (capped at 200,000 a month), car allowances and childcare allowances, so use the non-taxable total from your actual payslip.",
          "The annual health insurance reconciliation (the extra payment or refund settled the following April once the prior year's total pay is finalized) and year-end tax settlement are not included.",
          "It assumes an employee covered by the four major insurances. It does not fit freelancers withheld at 3.3% business income tax, daily workers, or company representatives.",
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "실수령액 계산 결과가 실제 급여명세서와 다를 수 있나요?",
          answer:
            "네. 본 계산기는 대한민국 4대보험 요율과 근로소득 간이세액표 방식을 근사한 예상값입니다. 회사별 비과세 항목, 상여·성과급, 중도 입퇴사, 연말정산, 추가 소득공제 등은 반영하지 않으므로 실제 급여명세서와 차이가 발생할 수 있습니다.",
        },
        {
          question: "비과세 금액은 무엇이고 기본값은 왜 20만원인가요?",
          answer:
            "비과세 금액은 식대 등 세금과 4대보험에서 제외되는 월 급여 항목입니다. 2024년부터 식대 비과세 한도가 월 20만원이라 기본값으로 두었으며, 본인 급여 조건에 맞게 수정할 수 있습니다. 비과세액이 커지면 과세표준이 줄어 실수령액이 늘어납니다.",
        },
        {
          question: "부양가족 수와 자녀 수는 어떻게 입력하나요?",
          answer:
            "부양가족 수는 본인을 포함한 공제대상 가족 수로, 기본값은 1(본인만)입니다. 20세 이하 자녀 수는 추가로 입력하며, 근로소득 간이세액표 방식에 따라 공제대상 가족 수에 가산되어 근로소득세를 줄여줍니다.",
        },
        {
          question: "원천징수 80%·100%·120%는 무슨 뜻인가요?",
          answer:
            "근로자는 매월 떼는 근로소득세를 간이세액표의 80%·100%·120% 중에서 선택할 수 있습니다. 100%가 기본이며, 80%를 선택하면 매월 세금을 덜 떼는 대신 연말정산에서 더 낼 수 있고, 120%는 그 반대입니다. 연간 총세액은 동일합니다.",
        },
        {
          question: "4대보험 요율은 어느 연도 기준인가요?",
          answer:
            "국민연금·건강보험·장기요양·고용보험 요율은 연도별 상수로 분리해 관리하며, 계산기는 가장 최신 연도 요율을 기본으로 적용합니다. 요율이 바뀌면 상수만 갱신되므로 계산식은 그대로 유지됩니다.",
        },
        {
          question: "입력한 급여 정보가 서버로 전송되나요?",
          answer:
            "아니요. 모든 계산은 브라우저 안에서 JavaScript로 처리되며, 연봉·월급 등 입력한 정보는 서버로 전송되거나 저장되지 않습니다. 탭을 닫으면 입력값도 사라집니다.",
        },
      ],
      en: [
        {
          question: "Can the result differ from my actual payslip?",
          answer:
            "Yes. This is an estimate based on Korea's four-insurance rates and an approximation of the simplified withholding tax table. It does not account for company-specific non-taxable items, bonuses, mid-year joining/leaving, year-end settlement or extra deductions, so it can differ from your real payslip.",
        },
        {
          question: "What is the non-taxable amount and why is 200,000 the default?",
          answer:
            "The non-taxable amount is the part of monthly pay (such as a meal allowance) excluded from tax and insurance. Korea's meal-allowance exemption is 200,000 won per month, so that is the default; adjust it to match your own pay. A larger non-taxable amount lowers the taxable base and raises take-home pay.",
        },
        {
          question: "How do I enter dependents and children?",
          answer:
            "Dependents is the number of qualifying family members including yourself, defaulting to 1 (just you). Children under 20 are entered separately and, following the simplified tax-table method, are added to the dependent count to reduce income tax.",
        },
        {
          question: "What do the 80% / 100% / 120% withholding options mean?",
          answer:
            "Employees in Korea can choose to have 80%, 100% or 120% of the simplified-table income tax withheld each month. 100% is the default; 80% withholds less monthly but you may owe more at year-end settlement, while 120% is the reverse. The annual total tax is the same.",
        },
        {
          question: "Which year's insurance rates does it use?",
          answer:
            "National Pension, Health, Long-Term Care and Employment Insurance rates are kept as per-year constants, and the calculator applies the most recent year by default. When rates change, only the constants are updated and the formula stays the same.",
        },
        {
          question: "Is the salary information I enter sent to a server?",
          answer:
            "No. Every calculation runs in your browser with JavaScript, and no salary data is uploaded or stored. Close the tab and your inputs are gone.",
        },
      ],
    },
    og: {
      ko: {
        title: "연봉 실수령액 계산기",
        subtitle: "세전 연봉·월급으로 월·연 실수령액을 바로 계산",
      },
      en: {
        title: "Salary Net Pay Calculator",
        subtitle: "Gross salary to monthly & yearly take-home pay, instantly",
      },
    },
  },
  {
    slug: "severance-pay-calculator",
    layout: "card",
    cat: "text",
    targets: ["office-worker", "job-seeker", "small-business-owner"],
    ico: "₩30",
    ready: true,
    indexable: true,
    verifiedAt: SEVERANCE_VERIFIED_AT,
    badge: "Clean SaaS",
    name: { ko: "퇴직금 계산기", en: "Severance Pay Calculator" },
    relatedTools: ["salary-calculator", "flex-work-calculator"],
    seo: {
      ko: {
        title: "퇴직금 계산기 | 평균임금으로 예상 퇴직금 계산",
        description:
          "입사일, 마지막 근무일과 퇴직 전 3개월의 세전 임금을 입력해 예상 퇴직금을 계산하세요. 1일 평균임금과 계속근로일수를 기준으로 계산 과정을 그대로 보여주고, DB·DC 퇴직연금과 개인형 IRP 계좌, 퇴직금 수령 시 세금과 연금 절세 방법도 함께 정리했습니다. 모든 계산은 브라우저 안에서만 이루어집니다.",
        keywords: [
          "퇴직금 계산기",
          "퇴직금 계산",
          "예상 퇴직금",
          "퇴직금 계산법",
          "평균임금 계산",
          "퇴직금 지급기준",
          "IRP 퇴직금",
        ],
      },
      en: {
        title: "Severance Pay Calculator | Korea Statutory Severance",
        description:
          "Enter your start date, last working day and the gross wages from your final three months to estimate statutory severance pay in Korea. The calculator shows the average daily wage, the days of continuous service and the full formula behind the result, and the guide explains DB and DC retirement plans, IRP accounts and how retirement income is taxed. Everything runs in your browser.",
        keywords: [
          "severance pay calculator",
          "korea severance pay",
          "retirement pay calculator korea",
          "average wage calculator korea",
          "statutory severance korea",
          "korean severance formula",
        ],
      },
    },
    content: {
      ko: {
        card: "입사일과 퇴직 전 3개월 임금으로 1일 평균임금과 예상 퇴직금(세전)을 계산.",
        description:
          "입사일과 마지막 근무일, 퇴직 전 3개월의 세전 임금을 입력하면 1일 평균임금과 계속근로일수를 계산해 예상 법정 퇴직금(세전)을 보여줍니다. 상여금과 연차수당은 3개월분이 반영되고, 통상임금이 평균임금보다 높으면 통상임금을 기준으로 계산합니다. 산정기간과 대입한 숫자까지 그대로 보여주므로 결과를 직접 검산할 수 있습니다. 모든 계산은 브라우저 안에서만 이루어집니다.",
        howItWorks: [
          "입사일·마지막 근무일과 주 소정근로시간 입력",
          "퇴직 전 3개월 임금과 상여금·연차수당 입력",
          "1일 평균임금과 예상 퇴직금(세전) 확인",
        ],
        aeo: {
          what: "퇴직금 계산기는 입사일과 마지막 근무일, 퇴직 전 3개월의 임금을 입력하면 1일 평균임금과 계속근로일수를 계산해 예상 법정 퇴직금(세전)을 보여주는 도구입니다.",
          who: "퇴사를 준비하는 직장인, 이직 시점을 저울질하는 사람, 계약직·단시간 근로자, 그리고 직원의 퇴직급여를 미리 가늠해야 하는 소규모 사업주를 위한 도구입니다.",
          how: "마지막 근무일의 다음 날을 퇴직일로 잡아 계속근로일수를 세고, 퇴직일 직전 3개월의 임금에 연간 상여금과 연차수당의 3개월분을 더해 산정기간 일수로 나눠 1일 평균임금을 구합니다. 통상임금이 더 높으면 통상임금을 적용한 뒤, 적용 1일 임금 × 30 × 계속근로일수 ÷ 365 로 퇴직금을 계산합니다.",
          why: "퇴직금은 근속연수가 아니라 마지막 3개월의 임금과 하루 단위 근속일수로 정해지기 때문에, 퇴사 시점을 며칠만 옮겨도 금액이 달라집니다. 숫자를 바꿔가며 몇 초 안에 비교해 볼 수 있습니다.",
        },
        guide: [
          {
            heading: "퇴직금은 어떻게 계산하나요",
            body: [
              "일반적인 법정 퇴직금은 1일 평균임금 × 30일 × 계속근로일수 ÷ 365로 계산합니다. 여기서 계속근로일수는 입사일부터 퇴직일까지의 날수이고, 퇴직일은 마지막으로 근무한 날의 다음 날입니다. 이 계산기에서 마지막 근무일만 입력받는 이유가 여기에 있습니다: 퇴직일 환산은 도구가 대신합니다.",
              "평균임금은 퇴직 직전 3개월 동안 지급받은 임금을 그 기간의 총일수로 나눈 금액입니다. 이때 총일수는 실제 출근한 날만 세는 것이 아니라 주말과 휴일을 포함한 달력상의 날짜입니다. 그래서 같은 임금을 받아도 산정기간이 89일인 달과 92일인 달의 평균임금이 조금씩 달라집니다.",
              "상여금이나 연차수당처럼 일정 기간에 걸쳐 발생한 임금은 3개월분만 평균임금에 반영합니다. 이 계산기도 연간 상여금과 연차수당에 각각 3/12를 곱해 더합니다. 또한 계산된 평균임금이 통상임금보다 낮다면 통상임금을 기준으로 퇴직금을 산정하므로, 1일 통상임금을 알고 있다면 함께 입력하는 편이 정확합니다.",
              "다만 육아휴직, 출산전후휴가, 업무상 재해로 인한 휴업 등 평균임금 산정에서 제외되는 기간이 있다면 계산 방식이 달라집니다. 이 경우 제외기간과 그 기간의 임금을 빼고 계산해야 하므로, 결과를 그대로 쓰기보다 회사 담당 부서에 확인하는 것이 좋습니다.",
            ],
          },
          {
            heading: "퇴직금, DB형, DC형은 무엇이 다른가요",
            body: [
              "직장에서 말하는 '퇴직금'은 실제로 여러 형태의 퇴직급여제도를 함께 가리킵니다. 퇴직금제도는 근로자가 퇴직할 때 계속근로기간과 평균임금을 기준으로 회사가 퇴직금을 지급하는 방식입니다.",
              "DB형(확정급여형) 퇴직연금은 근로자가 퇴직할 때 받을 급여 수준이 미리 정해져 있습니다. 회사가 금융기관에 퇴직급여 재원을 적립하고 운용하며, 운용 성과에 대한 책임도 회사가 부담합니다. 받을 금액의 계산 구조가 퇴직금제도와 같기 때문에, 이 계산기의 결과를 참고하기에 적합합니다.",
              "DC형(확정기여형) 퇴직연금은 회사가 매년 근로자의 연간 임금총액의 일정 금액을 근로자의 퇴직연금 계좌에 납입하는 방식입니다. 적립된 자금은 근로자가 직접 운용하므로, 실제 퇴직 시점의 금액은 납입된 부담금과 투자수익 또는 손실에 따라 달라집니다.",
              "따라서 회사가 DC형을 운영한다면 마지막 3개월의 평균임금만으로 받을 돈이 정해지지 않습니다. 이 계산기의 결과는 대략의 규모를 가늠하는 용도로만 쓰고, 실제 금액은 본인의 퇴직연금 계좌 잔액으로 확인해야 합니다.",
            ],
          },
          {
            heading: "IRP는 무엇이고, 퇴직할 때 왜 필요한가요",
            body: [
              "IRP는 개인형퇴직연금계좌(Individual Retirement Pension)의 약자로, 퇴직급여를 받아 보관하거나 여러 직장에서 발생한 퇴직급여를 하나의 계좌에서 관리할 수 있는 연금계좌입니다.",
              "2022년 4월 14일부터 원칙적으로 근로자가 퇴직할 때 회사는 퇴직급여를 근로자가 지정한 IRP 계좌로 지급합니다. 퇴사를 앞두고 회사에서 IRP 계좌번호 제출을 요청받는 이유가 이것입니다. 다만 55세 이후에 퇴직하는 경우, 퇴직급여가 300만원 이하인 경우 등 법에서 정한 일부 사유에는 IRP로 지급하지 않아도 되는 예외가 있습니다.",
              "IRP로 퇴직금을 받았다고 해서 반드시 장기간 묶어 두어야 하는 것은 아닙니다. 이후 일시금으로 인출할 수도 있고, 요건을 충족하면 연금 형태로 나누어 받을 수도 있습니다. 다만 어떤 방식으로 수령하느냐에 따라 세금이 달라집니다.",
            ],
          },
          {
            heading: "퇴직금을 IRP에 두면 어떤 세금 차이가 있나요",
            body: [
              "퇴직금을 IRP로 이전하면 퇴직 시점에 바로 퇴직소득세를 내는 대신, 실제로 계좌에서 돈을 인출할 때까지 과세를 미룰 수 있습니다. 이것을 과세이연이라고 합니다.",
              "퇴직금을 곧바로 일시금으로 인출하면 퇴직소득에 대한 세금이 부과됩니다. 반대로 일정 요건을 갖춰 연금으로 나누어 받으면 이연된 퇴직소득에 대해 일시금보다 낮은 세율을 적용받을 수 있습니다. 2026년 기준으로 이연퇴직소득을 연금으로 받는 경우, 연금 실제 수령기간에 따라 연금 외 수령 시 세율의 70%(10년 이하), 60%(10년 초과 20년 이하), 50%(20년 초과) 수준이 적용됩니다.",
              "즉 장기간에 걸쳐 연금으로 받을수록 퇴직소득에 대한 세 부담이 낮아지는 구조입니다. 당장 퇴직금을 쓸 계획이 없다면 IRP에서 연금으로 수령하는 방법과 일시금으로 인출하는 방법의 세금 차이를 비교해 볼 필요가 있습니다.",
            ],
          },
          {
            heading: "IRP에 돈을 추가로 넣으면 세액공제도 받을 수 있나요",
            body: [
              "퇴직하면서 회사에서 IRP로 이전된 퇴직금 자체는 연금계좌 세액공제 대상이 아닙니다. 이미 퇴직소득세의 과세가 이연된 금액이기 때문입니다.",
              "대신 본인이 IRP나 연금저축에 별도로 추가 납입한 금액은 일정 한도 안에서 연금계좌 세액공제를 받을 수 있습니다. 연금저축은 연간 600만원, 연금저축과 IRP 등 퇴직연금계좌를 합한 세액공제 대상 한도는 연간 900만원입니다. 세액공제율은 소득 수준에 따라 달라져, 총급여 5,500만원 이하(종합소득금액 4,500만원 이하)는 소득세 기준 15%, 초과자는 12%가 적용됩니다.",
              "정리하면 IRP에는 두 가지 기능이 함께 있습니다. 하나는 퇴직금을 받아 과세를 미루고 노후자금으로 운용하는 기능이고, 다른 하나는 본인 자금을 추가 납입해 연말정산이나 종합소득세에서 세액공제를 받는 기능입니다. 두 금액은 세금 처리 방식이 다르므로 구분해서 이해해야 합니다.",
            ],
          },
          {
            heading: "계산 결과와 실제 퇴직금이 다른 경우",
            body: [
              "이 계산기는 일반적인 법정 산식을 적용한 예상 금액입니다. 실제 퇴직금은 임금에 포함되는 수당의 범위, 상여금과 연차수당의 반영 여부, 평균임금 산정 제외기간, 회사의 퇴직급여제도에 따라 달라질 수 있습니다.",
              "특히 회사가 DC형 퇴직연금을 운영한다면 퇴직 시 받을 금액이 마지막 3개월의 평균임금으로 결정되지 않습니다. 퇴직연금 계좌에 실제로 적립된 부담금과 운용 성과를 확인해야 합니다.",
              "또한 이 계산기는 퇴직소득세를 계산하지 않습니다. 세후 실수령액은 근속연수와 퇴직급여액에 따라 산출되는 퇴직소득세, 그리고 IRP 수령 방식에 따라 달라집니다. 정확한 금액은 회사 급여 담당 부서나 고용노동부·국세청의 공식 안내로 확인하세요.",
            ],
          },
        ],
        examples: [
          {
            title: "5년 5개월 근무하고 2026년 8월 27일에 퇴사하는 경우",
            input:
              "입사 2021-03-02 · 마지막 근무 2026-08-27 · 주 40시간 · 3개월 임금 12,000,000 · 연간 상여 3,000,000 · 연차수당 500,000",
            result:
              "1일 평균임금 139,946원 → 예상 퇴직금 23,062,334원 (세전)",
            note: "산정기간은 2026-05-28 ~ 2026-08-27로 92일이고, 상여금 750,000원과 연차수당 125,000원이 3개월분으로 반영되어 임금 총액은 12,875,000원입니다. 계속근로일수는 2,005일입니다.",
          },
          {
            title: "상여금·연차수당을 빼고 계산했을 때의 차이",
            input: "같은 조건에서 상여금과 연차수당을 0원으로 입력",
            result:
              "1일 평균임금 130,435원 → 예상 퇴직금 21,494,973원 (약 157만원 감소)",
            note: "연간 상여금 300만원의 3개월분인 75만원이 92일에 나뉘어 하루 8,152원을 올리고, 그 차이가 근속 2,005일에 곱해지면서 최종 금액이 크게 벌어집니다. 상여금 항목을 빠뜨리지 않는 것이 중요합니다.",
          },
          {
            title: "통상임금이 평균임금보다 높은 경우",
            input:
              "입사 2023-04-03 · 마지막 근무 2026-03-31 · 3개월 임금 10,500,000 · 1일 통상임금 125,000",
            result:
              "1일 평균임금 116,667원이지만 통상임금 125,000원이 적용되어 예상 퇴직금 11,239,726원",
            note: "연말·연초처럼 상여나 수당이 적은 달이 산정기간에 몰리면 평균임금이 통상임금보다 낮아질 수 있습니다. 이때는 통상임금이 기준이 되므로, 아는 경우 반드시 입력하세요.",
          },
          {
            title: "지급 요건을 채우지 못한 단시간 근로",
            input: "입사 2025-11-03 · 마지막 근무 2026-08-27 · 주 12시간",
            result: "계속근로 298일 · 주 15시간 미만으로 법정 퇴직금 지급 요건 미충족",
            note: "계속근로기간 1년 이상과 4주 평균 주 15시간 이상을 모두 충족해야 법정 퇴직금 대상입니다. 두 요건 중 어느 쪽이 걸렸는지 결과 화면에 함께 표시됩니다.",
          },
        ],
        sources: SEVERANCE_SOURCES.map((x) => ({ label: x.label.ko, url: x.url })),
        limitations: [
          "예상 법정 퇴직금(세전)까지만 계산합니다. 퇴직소득세와 IRP 운용수익은 계산하지 않으므로, 실제 손에 쥐는 금액은 이 결과보다 적습니다.",
          "육아휴직, 출산전후휴가, 육아기 근로시간 단축, 업무상 재해로 인한 휴업 등 평균임금 산정에서 제외되는 기간은 반영하지 않습니다. 이런 기간이 산정기간에 걸쳐 있으면 실제 평균임금과 달라집니다.",
          "DC형(확정기여형) 퇴직연금에는 맞지 않습니다. DC형은 회사가 납입한 부담금과 근로자의 운용 성과로 금액이 정해지므로, 퇴직연금 계좌 잔액을 직접 확인해야 합니다.",
          "상여금과 연차수당은 입력한 금액의 3개월분(3/12)을 그대로 반영합니다. 실제로 평균임금에 포함되는지는 지급 시점과 발생 사유, 취업규칙에 따라 달라질 수 있습니다.",
          "임금에 어떤 수당이 포함되는지는 판단하지 않습니다. 입력한 3개월 임금 총액을 그대로 사용하므로, 급여명세서에서 임금에 해당하는 항목을 골라 넣어야 합니다.",
          "계속근로일수는 입사일부터 퇴직일까지 달력 기준으로 셉니다. 휴직·정직 등으로 계속근로기간 산정이 달라지는 경우는 반영하지 않습니다.",
        ],
      },
      en: {
        card: "Estimate Korean statutory severance pay from your start date and the wages of your final three months.",
        description:
          "Enter your start date, last working day and the gross wages from your final three months, and this calculator works out the average daily wage and the days of continuous service to estimate statutory severance pay in Korea before tax. Bonuses and unused-leave pay are counted at three months' worth, and a higher ordinary wage replaces the average wage when you provide it. The calculation period and every number used are shown so you can check the result yourself. Everything runs in your browser.",
        howItWorks: [
          "Enter your dates and weekly contracted hours",
          "Enter the last 3 months of pay, bonuses and leave pay",
          "See the average daily wage and pre-tax severance estimate",
        ],
        aeo: {
          what: "A Severance Pay Calculator takes a start date, a last working day and the wages from the final three months of employment and returns the average daily wage, the days of continuous service and an estimate of Korean statutory severance pay before tax.",
          who: "It is for employees planning to resign, people weighing when to change jobs, fixed-term and part-time workers, and small business owners who need to budget an employee's retirement payout.",
          how: "The day after your last working day is treated as the retirement date, and continuous service is counted in days from your start date. The wages of the three calendar months before that date, plus three months' worth of annual bonuses and leave pay, are divided by the number of days in the period to give the average daily wage. If a daily ordinary wage is higher, it is used instead, and severance is the applied daily wage multiplied by 30, multiplied by days of service, divided by 365.",
          why: "Severance in Korea depends on the wages of your final three months and on service counted by the day, not by whole years, so moving a resignation date by a few days changes the amount. This lets you compare scenarios in seconds.",
        },
        guide: [
          {
            heading: "How severance pay is calculated in Korea",
            body: [
              "Statutory severance is the average daily wage multiplied by 30 days, multiplied by the days of continuous service, divided by 365. Continuous service runs from your start date to your retirement date, and the retirement date is the day after your last working day. That is why this calculator only asks for the last working day: it converts the retirement date for you.",
              "The average wage is the pay you received in the three months before leaving, divided by the total number of days in that period. Those days are calendar days including weekends and holidays, not the days you actually worked. So the same pay produces a slightly different average wage in a period of 89 days than in one of 92 days.",
              "Pay that accrues over a longer span, such as an annual bonus or unused-leave allowance, counts toward the average wage at three months' worth. This calculator multiplies each by 3/12 and adds it to the period's wages. If the resulting average wage is lower than your ordinary wage, severance is calculated on the ordinary wage instead, so enter your daily ordinary wage when you know it.",
              "Certain periods are excluded from the average wage calculation, including parental leave, maternity leave and absence from a work injury. When such a period overlaps your final three months, the excluded days and the pay for them are removed before the average is taken, so check with your payroll team rather than relying on this estimate.",
            ],
          },
          {
            heading: "Severance pay, DB plans and DC plans",
            body: [
              "What people call severance in Korea covers several different retirement benefit schemes. Under the classic severance scheme, the employer pays out at the end of employment based on continuous service and the average wage.",
              "A defined benefit (DB) plan fixes the level of benefit the employee will receive in advance. The employer sets aside and invests the funds with a financial institution and bears the investment risk. Because the payout is worked out the same way as classic severance, the result from this calculator is a reasonable reference for a DB plan.",
              "A defined contribution (DC) plan works the other way round: each year the employer pays a set amount, based on the employee's total annual wages, into the employee's retirement account. The employee invests those funds, so the amount available at retirement depends on the contributions made and on investment gains or losses.",
              "If your employer runs a DC plan, the wages of your last three months do not determine what you receive. Use this calculator only to get a sense of scale, and check the actual balance of your retirement pension account.",
            ],
          },
          {
            heading: "What an IRP is, and why it matters when you leave",
            body: [
              "IRP stands for Individual Retirement Pension, a pension account that receives retirement benefits and lets you keep benefits from several employers in one place.",
              "Since 14 April 2022, employers in Korea have as a rule been required to pay retirement benefits into an IRP account nominated by the employee. That is why companies ask departing staff for an IRP account number. There are statutory exceptions, including retirement at or after age 55 and a retirement benefit of 3 million won or less.",
              "Receiving severance into an IRP does not lock the money away for good. You can withdraw it as a lump sum later, or, if you meet the conditions, draw it as a pension in instalments. Which route you take changes the tax.",
            ],
          },
          {
            heading: "How keeping severance in an IRP changes the tax",
            body: [
              "Transferring severance into an IRP defers the retirement income tax: instead of paying at the moment you leave, tax is charged when you actually withdraw from the account.",
              "Withdrawing the money as a lump sum triggers retirement income tax. Drawing it as a pension, once the conditions are met, applies a lower rate to the deferred retirement income. As of 2026, deferred retirement income drawn as a pension is taxed at roughly 70% of the non-pension rate for the first 10 years of actual pension receipt, 60% beyond 10 years and up to 20 years, and 50% beyond 20 years.",
              "In other words, the longer you draw it as a pension, the lighter the tax on the retirement income. If you do not need the money immediately, it is worth comparing the tax on pension withdrawals against a lump sum.",
            ],
          },
          {
            heading: "Do extra IRP contributions qualify for a tax credit",
            body: [
              "The severance transferred into your IRP by your employer does not qualify for the pension account tax credit, because the retirement income tax on it has already been deferred.",
              "Money you pay into an IRP or a pension savings account yourself does qualify, up to a limit. Pension savings are capped at 6 million won a year, and the combined cap across pension savings and retirement pension accounts such as an IRP is 9 million won a year. The credit rate depends on income: 15% for total salary of 55 million won or less (global income of 45 million won or less) and 12% above that.",
              "So an IRP does two jobs at once: it holds retirement benefits with the tax deferred while the money is invested for later, and it accepts your own contributions for a tax credit at year-end settlement or on your income tax return. The two amounts are taxed differently, so it helps to keep them apart in your head.",
            ],
          },
          {
            heading: "When the estimate and your actual severance differ",
            body: [
              "This is an estimate produced with the standard statutory formula. Actual severance depends on which allowances count as wages, on whether bonuses and leave pay are included, on periods excluded from the average wage, and on your employer's retirement benefit scheme.",
              "If your employer runs a DC plan in particular, the payout is not set by your last three months of average wage at all. You need the contributions actually paid into the account and the investment result.",
              "This calculator also does not compute retirement income tax. What you finally receive depends on that tax, which is based on years of service and the size of the benefit, and on how you draw the money from an IRP. For an exact figure, check with your payroll department or the official guidance from the Ministry of Employment and Labor and the National Tax Service.",
            ],
          },
        ],
        examples: [
          {
            title: "Leaving on 27 August 2026 after five years and five months",
            input:
              "Started 2021-03-02 · last day 2026-08-27 · 40 hrs a week · 3-month pay 12,000,000 · annual bonus 3,000,000 · leave pay 500,000",
            result: "Average daily wage 139,946 → estimated severance 23,062,334 (pre-tax)",
            note: "The calculation period runs 2026-05-28 to 2026-08-27, which is 92 days, and three months' worth of the bonus (750,000) and leave pay (125,000) bring total wages in the period to 12,875,000. Continuous service is 2,005 days.",
          },
          {
            title: "What leaving out bonuses and leave pay costs",
            input: "The same case with bonus and leave pay entered as 0",
            result:
              "Average daily wage 130,435 → estimated severance 21,494,973 (about 1.57 million lower)",
            note: "Three months' worth of a 3,000,000 bonus is 750,000, which spread over 92 days adds 8,152 to the daily wage. Multiplied across 2,005 days of service, that small daily difference moves the final figure a long way, so do not omit the bonus.",
          },
          {
            title: "When the ordinary wage is higher than the average wage",
            input:
              "Started 2023-04-03 · last day 2026-03-31 · 3-month pay 10,500,000 · daily ordinary wage 125,000",
            result:
              "The average daily wage is 116,667, but the ordinary wage of 125,000 is applied, giving 11,239,726",
            note: "If months with few bonuses or allowances fall inside the calculation period, the average wage can drop below the ordinary wage. The ordinary wage then becomes the basis, so enter it whenever you know it.",
          },
          {
            title: "Part-time work that misses the statutory threshold",
            input: "Started 2025-11-03 · last day 2026-08-27 · 12 hrs a week",
            result: "298 days of service and under 15 hours a week, so statutory severance does not apply",
            note: "Both conditions must hold: one year or more of continuous service, and an average of at least 15 hours a week over four weeks. The result panel names whichever condition failed.",
          },
        ],
        sources: SEVERANCE_SOURCES.map((x) => ({ label: x.label.en, url: x.url })),
        limitations: [
          "It stops at estimated statutory severance before tax. Retirement income tax and IRP investment returns are not calculated, so what reaches your account will be less than this figure.",
          "Periods excluded from the average wage calculation, such as parental leave, maternity leave, reduced hours for childcare and absence from a work injury, are not modelled. If one overlaps your final three months, the real average wage will differ.",
          "It does not fit a defined contribution (DC) plan, where the payout comes from the contributions paid in and the employee's investment results. Check the balance of the retirement pension account instead.",
          "Bonuses and unused-leave pay are applied at exactly three months' worth (3/12) of what you enter. Whether they truly count toward the average wage depends on when and why they were paid and on your employment rules.",
          "It does not judge which allowances count as wages. The three-month total is used exactly as entered, so pick the qualifying items off your payslips yourself.",
          "Continuous service is counted in calendar days from the start date to the retirement date. Cases where leave of absence or suspension changes how continuous service is counted are not reflected.",
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "퇴직금은 몇 년 근무해야 받을 수 있나요?",
          answer:
            "원칙적으로 4주 평균 1주 소정근로시간이 15시간 이상이면서 계속근로기간이 1년 이상인 근로자가 법정 퇴직금 지급 대상입니다. 두 요건 중 하나라도 채우지 못하면 법정 퇴직금 대상이 아니며, 이 계산기도 어느 요건이 미달인지 결과에 표시합니다.",
        },
        {
          question: "퇴직금 계산에서 평균임금은 무엇인가요?",
          answer:
            "퇴직 사유가 발생하기 전 3개월 동안 지급된 임금총액을 같은 기간의 총일수로 나눈 금액입니다. 총일수는 실제 근무일이 아니라 주말과 휴일을 포함한 달력상의 날짜를 사용합니다. 산정기간이 89일인지 92일인지에 따라 1일 평균임금이 조금씩 달라집니다.",
        },
        {
          question: "퇴직일은 마지막 근무일과 같은가요?",
          answer:
            "다릅니다. 퇴직일은 마지막으로 근무한 날의 다음 날입니다. 헷갈리기 쉬운 부분이라 이 계산기는 마지막 근무일만 입력받고 퇴직일은 내부에서 자동으로 계산합니다. 계속근로일수와 평균임금 산정기간 모두 이 퇴직일을 기준으로 잡습니다.",
        },
        {
          question: "상여금도 퇴직금에 포함되나요?",
          answer:
            "상여금이 임금에 해당하는 경우 평균임금에 반영될 수 있으며, 이때 연간 상여금의 3개월분(3/12)을 산정기간 임금에 더합니다. 고용노동부 퇴직금 계산기도 같은 방식으로 반영합니다. 다만 실제 포함 여부는 지급 시점과 취업규칙에 따라 달라질 수 있습니다.",
        },
        {
          question: "퇴직금을 꼭 IRP로 받아야 하나요?",
          answer:
            "2022년 4월 14일 이후 원칙적으로 회사는 퇴직급여를 근로자가 지정한 IRP 등의 계좌로 지급해야 합니다. 다만 55세 이후에 퇴직하거나 퇴직급여가 300만원 이하인 경우 등 법에서 정한 예외가 있습니다.",
        },
        {
          question: "DC형 퇴직연금도 이 계산기로 계산할 수 있나요?",
          answer:
            "정확한 실제 수령액 계산에는 적합하지 않습니다. DC형은 회사가 납입한 부담금과 근로자의 운용 성과에 따라 퇴직급여가 결정되므로, 마지막 3개월의 평균임금만으로는 금액이 정해지지 않습니다. 실제 퇴직연금 계좌 잔액을 확인해야 합니다.",
        },
        {
          question: "계산 결과는 세후 금액인가요?",
          answer:
            "아닙니다. 결과는 세전 예상 퇴직금입니다. 퇴직소득세는 근속연수공제와 환산급여공제 등을 순차적으로 적용해 별도로 산정되며, IRP로 받아 연금으로 수령하면 세 부담이 달라집니다. 이 계산기는 퇴직소득세를 계산하지 않습니다.",
        },
        {
          question: "입력한 급여 정보가 서버로 전송되나요?",
          answer:
            "아니요. 모든 계산은 브라우저 안에서 JavaScript로 처리되며, 입사일·임금 등 입력한 정보는 서버로 전송되거나 저장되지 않습니다. 탭을 닫으면 입력값도 사라집니다.",
        },
      ],
      en: [
        {
          question: "How long do I have to work to receive severance pay in Korea?",
          answer:
            "As a rule, statutory severance applies to employees with at least one year of continuous service who work an average of at least 15 hours a week over four weeks. If either condition fails, statutory severance does not apply, and this calculator names the condition that failed.",
        },
        {
          question: "What is the average wage used for severance pay?",
          answer:
            "It is the total pay received in the three months before leaving, divided by the total number of days in that period. Those are calendar days including weekends and holidays, not days actually worked, so a period of 89 days and one of 92 days give slightly different daily averages.",
        },
        {
          question: "Is the retirement date the same as my last working day?",
          answer:
            "No. The retirement date is the day after your last working day. Because that trips people up, this calculator asks only for the last working day and derives the retirement date itself. Both the days of continuous service and the average wage period are anchored to that retirement date.",
        },
        {
          question: "Do bonuses count toward severance pay?",
          answer:
            "When a bonus qualifies as wages it can count toward the average wage, and three months' worth (3/12) of the annual bonus is added to the wages in the calculation period. The official Ministry of Employment and Labor calculator applies bonuses the same way, though whether a given bonus qualifies depends on when it was paid and on your employment rules.",
        },
        {
          question: "Must severance be paid into an IRP?",
          answer:
            "Since 14 April 2022, employers must as a rule pay retirement benefits into an IRP account nominated by the employee. Statutory exceptions include retiring at or after age 55 and a retirement benefit of 3 million won or less.",
        },
        {
          question: "Can I use this calculator for a DC retirement pension plan?",
          answer:
            "Not for an accurate payout. Under a DC plan the benefit comes from the contributions the employer paid in and the employee's investment results, so the last three months of average wage do not determine it. Check the balance of the retirement pension account instead.",
        },
        {
          question: "Is the result after tax?",
          answer:
            "No, the result is severance pay before tax. Retirement income tax is calculated separately, applying the service-year deduction and the converted-income deduction in sequence, and drawing the money as a pension from an IRP changes the burden again. This calculator does not compute that tax.",
        },
        {
          question: "Is the pay information I enter sent to a server?",
          answer:
            "No. Every calculation runs in your browser with JavaScript, and dates or wages you enter are never uploaded or stored. Close the tab and your inputs are gone.",
        },
      ],
    },
    og: {
      ko: {
        title: "퇴직금 계산기",
        subtitle: "평균임금으로 예상 퇴직금을 바로 계산",
      },
      en: {
        title: "Severance Pay Calculator",
        subtitle: "Average daily wage to estimated severance, instantly",
      },
    },
  },
  {
    slug: "flex-work-calculator",
    layout: "card",
    cat: "text",
    targets: ["office-worker", "pm", "developer", "designer"],
    ico: "Σh",
    ready: true,
    indexable: true,
    badge: "Clean SaaS",
    name: { ko: "유연근무 잔여시간 계산기", en: "Flex Work Calculator" },
    relatedTools: ["time-calculator", "time-converter", "salary-calculator"],
    seo: {
      ko: {
        title: "유연근무 잔여 근무시간 계산기",
        description:
          "이번 달 목표 근무시간과 남은 근무시간, 남은 영업일, 하루 평균 필요 근무시간을 한 번에 계산합니다. 연차·반차·시간차를 차감하고 공휴일을 자동 반영해, 지금 페이스면 시간이 남는지 부족한지 바로 확인하세요. 모든 계산은 브라우저 안에서만 이루어집니다.",
        keywords: [
          "유연근무 계산기",
          "남은 근무시간 계산기",
          "근무시간 계산기",
          "유연근무제",
          "목표 근무시간",
          "월 근무시간 계산",
        ],
      },
      en: {
        title: "Flex Work Calculator | Remaining Work Hours",
        description:
          "Calculate this month's target hours, remaining hours, remaining business days and the daily average you need under a flexible work schedule. It deducts annual, half-day and hourly leave, factors in public holidays, and shows whether you're ahead or behind. Everything runs in your browser.",
        keywords: [
          "flex work calculator",
          "remaining work hours calculator",
          "flexible work hours calculator",
          "monthly target hours",
          "work hours calculator",
        ],
      },
    },
    content: {
      ko: {
        card: "유연근무 목표·남은 근무시간과 하루 평균 필요시간을 계산. 휴가 차감·공휴일 반영.",
        description:
          "이번 달 목표 근무시간과 남은 근무시간, 남은 영업일, 하루 평균 필요 근무시간을 한 번에 계산합니다. 연차·반차·시간차를 소정근로시간 기준으로 차감하고 주말과 공휴일을 영업일에서 빼, 지금 페이스면 시간이 남는지 부족한지 바로 보여줍니다. 모든 계산은 브라우저 안에서만 이루어집니다.",
        howItWorks: [
          "연·월·소정근로시간 입력",
          "사용한 휴가·누적 근무시간 입력",
          "하루 평균·여유/부족 확인",
        ],
        aeo: {
          what: "유연근무 잔여시간 계산기는 유연근무제에서 이번 달 목표 근무시간 대비 남은 근무시간, 남은 영업일, 그리고 남은 기간 하루 평균 필요 근무시간을 계산해주는 도구입니다.",
          who: "선택적 근로시간제·시차출퇴근제 등 유연근무제를 쓰는 직장인과, 월 단위로 근무시간을 직접 관리해야 하는 PM·개발자·디자이너를 위한 도구입니다.",
          how: "연도·월·1일 소정근로시간을 입력하면 주말과 공휴일을 뺀 영업일로 월 목표시간을 구하고, 연차·반차·시간차를 차감해 실제 목표를 계산합니다. 현재 누적 근무시간을 넣으면 남은 목표를 남은 영업일로 나눠 하루 평균 필요시간과 여유·부족을 보여줍니다.",
          why: "매달 엑셀이나 수기로 반복하던 계산을 30초 만에 끝낼 수 있고, 공휴일과 휴가까지 반영해 '하루에 몇 시간씩 일해야 하는지'를 정확히 알려주기 때문입니다.",
        },
              guide: [
          {
            heading: "유연근무에서 진짜 어려운 건 계산이 아니라 페이스 조절",
            body: [
              "선택적 근로시간제나 시차출퇴근제를 쓰면 하루 몇 시간을 일할지는 자유롭지만, 정산 단위(보통 한 달) 안에서 총 근무시간은 맞춰야 합니다. 문제는 이 총량이 매달 다르다는 점입니다. 영업일이 20일인 달과 22일인 달은 목표가 16시간이나 차이 나고, 여기에 공휴일과 연차가 겹치면 감으로 계산하기 어려워집니다.",
              "그래서 대부분 월말에 가서야 시간이 모자란 걸 발견하고 며칠을 몰아서 일하게 됩니다. 이 계산기는 그 반대를 위한 도구입니다. 월 중간 아무 때나 열어서 \"남은 영업일 동안 하루 평균 몇 시간씩 일하면 되는가\"를 확인하면, 마지막 주에 몰아치는 상황을 미리 피할 수 있습니다.",
            ],
          },
          {
            heading: "계산이 이루어지는 순서",
            body: [
              "먼저 선택한 연·월에서 주말을 빼고, 공휴일 제외 옵션이 켜져 있으면 대한민국 공휴일(설날·추석 연휴와 대체공휴일 포함)까지 뺀 영업일 수를 셉니다. 여기에 1일 소정근로시간을 곱한 값이 그 달의 기본 목표 시간입니다.",
              "다음으로 사용한 휴가를 차감합니다. 연차는 소정근로시간 하루치, 반차는 그 절반, 시간차는 입력한 시간만큼 목표에서 빠집니다. 소정근로시간을 8시간이 아닌 값으로 바꾸면 연차·반차 차감량도 함께 조정되므로, 주 35시간제처럼 기준이 다른 회사도 그대로 쓸 수 있습니다.",
              "마지막으로 현재까지 누적 근무시간을 넣으면 남은 목표를 남은 영업일로 나눠 하루 평균 필요시간을 냅니다. 남은 영업일은 오늘을 기준으로 세며, 오늘 근무분을 이미 누적에 넣었는지에 따라 '오늘 포함' 옵션을 켜고 끄면 됩니다.",
            ],
          },
          {
            heading: "결과를 읽는 법",
            body: [
              "하루 평균 필요시간이 소정근로시간보다 크면 남은 기간에 더 일해야 한다는 뜻이고, 작으면 여유가 있다는 뜻입니다. 이 숫자가 10시간을 넘기 시작하면 한 달 안에 만회하기 어려운 구간이므로, 남은 연차 사용 계획을 조정하거나 관리자와 정산 방식을 상의하는 편이 현실적입니다.",
              "반대로 여유가 크게 남았다면 초과분이 이월되는지 확인하세요. 회사마다 정산 규정이 달라 초과 근무시간이 다음 달로 넘어가기도 하고, 그달에 소멸하기도 합니다. 이 계산기는 목표 대비 현재 위치만 보여줄 뿐 회사의 정산 규정까지는 알 수 없습니다.",
            ],
          },
        ],
        examples: [
          {
            title: "월 중간에 페이스 점검",
            input: "1일 소정근로 8시간 · 이번 달 영업일 21일 · 연차 1일 사용 · 현재까지 72시간 근무 · 남은 영업일 11일",
            result: "목표 160시간(168 − 8), 남은 88시간, 하루 평균 8시간",
            note: "정확히 소정근로시간과 같으면 지금 페이스를 유지하면 된다는 뜻입니다. 이 숫자가 8을 넘으면 이미 뒤처진 것이고, 밑돌면 여유가 있는 것입니다.",
          },
          {
            title: "연휴가 낀 달의 목표 확인",
            input: "추석 연휴가 포함된 달 · 공휴일 제외 옵션 켬",
            result: "연휴 일수만큼 영업일이 줄어 목표 시간도 함께 감소",
            note: "공휴일을 빼지 않으면 목표가 실제보다 20시간 넘게 부풀려집니다. 연휴가 있는 달에 \"이상하게 시간이 남는다\"고 느꼈다면 이 옵션을 확인해 보세요.",
          },
          {
            title: "주 35시간제 회사에서 사용",
            input: "1일 소정근로시간을 7시간으로 변경 · 반차 1회 사용",
            result: "월 목표가 7시간 기준으로 재계산되고, 반차는 3.5시간만 차감",
            note: "소정근로시간 입력 하나만 바꾸면 목표·연차·반차 계산이 모두 그 기준을 따릅니다.",
          },
        ],
        limitations: [
          "공휴일 데이터는 2025~2027년 대한민국 공휴일만 지원합니다. 그 밖의 연도나 다른 국가의 공휴일, 회사 창립기념일 같은 개별 휴무일은 반영되지 않으므로 직접 시간차로 차감해야 합니다.",
          "연장·야간·휴일근로 가산(각각 통상임금의 50% 가산)은 계산하지 않습니다. 이 도구는 시간 총량만 다루며 임금 정산 도구가 아닙니다.",
          "정산 단위를 한 달로 가정합니다. 3개월·6개월 단위 탄력근로제를 쓰는 회사라면 월별 결과를 그대로 적용할 수 없습니다.",
          "회사의 실제 근태 기록과 대조하지 않습니다. 누적 근무시간은 직접 입력한 값이므로, 근태 시스템 수치와 다르면 결과도 함께 어긋납니다.",
        ],
      },
      en: {
        card: "Target vs. remaining hours and the daily average you need under flex work. Leave & holidays included.",
        description:
          "Calculate this month's target hours, remaining hours, remaining business days and the daily average you need under a flexible work schedule. It deducts annual, half-day and hourly leave against your standard daily hours and removes weekends and public holidays from the business days, so you instantly see whether you're ahead or behind. Everything runs in your browser.",
        howItWorks: [
          "Enter year, month & daily hours",
          "Add leave used & hours worked",
          "See the daily average & balance",
        ],
        aeo: {
          what: "A Flex Work Calculator works out, under a flexible work schedule, how many hours you still need this month, how many business days remain, and the daily average required to hit your target.",
          who: "It is for office workers on flexible or flextime schedules, and for PMs, developers and designers who track their own monthly hours.",
          how: "Enter the year, month and your standard daily hours; it builds the monthly target from business days (weekends and public holidays removed), then deducts annual, half-day and hourly leave. Add your hours worked so far and it divides the remaining target by the remaining business days to show the daily average and your surplus or deficit.",
          why: "It replaces the spreadsheet math people redo every month, finishing in about 30 seconds while accounting for holidays and leave so you know exactly how many hours a day to work.",
        },
              guide: [
          {
            heading: "The hard part of flex work is pacing, not arithmetic",
            body: [
              "Under a flexible or flextime schedule you choose how long to work each day, but the total still has to land within the settlement period, usually a month. The catch is that the total moves every month. A 20-business-day month and a 22-day month differ by 16 hours, and once holidays and leave overlap it stops being something you can hold in your head.",
              "That is why people usually notice the shortfall at month end and cram several long days to catch up. This calculator exists for the opposite habit: open it mid-month, see how many hours a day you need across the remaining business days, and adjust before the last week turns into a scramble.",
            ],
          },
          {
            heading: "How the calculation runs",
            body: [
              "It starts by counting the business days in the selected month with weekends removed, and, if the holiday option is on, Korean public holidays too, including the Seollal and Chuseok periods and substitute holidays. Multiplying that by your standard daily hours gives the month's base target.",
              "Leave is then deducted: annual leave as one full day of standard hours, half-day leave as half of that, and hourly leave by the hours you enter. Because the deductions scale with the standard daily hours field, a company on a 35-hour week can use the tool as-is.",
              "Finally, entering the hours you have worked so far divides the remaining target by the remaining business days to produce the daily average. Remaining days are counted from today, and the \"count today\" option lets you match whether today's hours are already included in your total.",
            ],
          },
          {
            heading: "Reading the result",
            body: [
              "If the required daily average is higher than your standard daily hours, you are behind; lower means you have slack. Once that number climbs past ten hours it is rarely recoverable inside the month, so the practical move is to adjust remaining leave plans or talk to your manager about the settlement.",
              "If you have a large surplus instead, check whether it carries over. Company rules differ: some roll excess hours into the next period, others let them expire. This tool shows only your position against the target; it does not know your employer's settlement policy.",
            ],
          },
        ],
        examples: [
          {
            title: "A mid-month pace check",
            input: "8 standard hours · 21 business days · 1 day of annual leave used · 72 hours worked · 11 business days left",
            result: "Target 160 hours (168 − 8), 88 remaining, 8 hours per day",
            note: "Landing exactly on your standard hours means the current pace is right. Above 8 you are already behind; below it you have room.",
          },
          {
            title: "Checking the target in a month with a long holiday",
            input: "A month containing the Chuseok holidays, with the holiday option on",
            result: "Business days drop by the holiday length and the target falls with them",
            note: "Leaving holidays in inflates the target by more than 20 hours. If a holiday month ever felt oddly easy to finish, this setting is usually why.",
          },
          {
            title: "Using it at a company on a 35-hour week",
            input: "Standard daily hours set to 7 · one half-day of leave",
            result: "The monthly target is rebuilt on 7 hours and the half-day deducts only 3.5 hours",
            note: "Changing that single field makes the target, annual leave and half-day maths all follow the same basis.",
          },
        ],
        limitations: [
          "Holiday data covers Korean public holidays for 2025-2027 only. Other years, other countries, and company-specific days off such as a founding anniversary are not included and have to be entered as hourly leave.",
          "It does not calculate overtime, night or holiday premiums (each a 50% uplift on ordinary wages under Korean law). This tool deals in hours, not pay.",
          "It assumes a one-month settlement period. Companies running three- or six-month flexible schemes cannot apply the monthly result directly.",
          "It never checks your employer's attendance system. Hours worked is whatever you type, so if that differs from the official record the result differs too.",
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "공휴일은 어떻게 반영되나요?",
          answer:
            "‘공휴일 제외’ 옵션을 켜면 대한민국 공휴일(설날·추석·대체공휴일 포함)을 영업일에서 자동으로 빼고 계산합니다. 토요일 근무 등 공휴일을 따로 챙겨야 하는 경우 옵션을 꺼서 주말만 제외할 수도 있습니다. 현재 2025~2027년 공휴일을 지원합니다.",
        },
        {
          question: "연차·반차·시간차는 어떻게 차감되나요?",
          answer:
            "연차는 1일 소정근로시간만큼, 반차는 그 절반만큼, 시간차는 입력한 시간만큼 목표 근무시간에서 차감합니다. 소정근로시간을 8시간이 아닌 값(예: 7시간)으로 바꾸면 연차·반차 차감도 그 기준으로 함께 조정됩니다.",
        },
        {
          question: "‘남은 영업일’은 어느 날짜를 기준으로 하나요?",
          answer:
            "오늘 날짜를 기준으로, 이번 달 남은 영업일을 셉니다. ‘오늘 포함’ 옵션으로 오늘을 남은 영업일에 넣을지 뺄지 선택할 수 있어요. 과거 달을 선택하면 남은 영업일은 0이 되고, 미래 달은 그 달 전체 영업일을 보여줍니다.",
        },
        {
          question: "입력한 근무시간이 서버로 전송되나요?",
          answer:
            "아니요. 모든 계산은 브라우저 안에서 JavaScript로 처리되며, 입력한 근무 정보는 서버로 전송되거나 저장되지 않습니다. 탭을 닫으면 입력값도 사라집니다.",
        },
      ],
      en: [
        {
          question: "How are public holidays handled?",
          answer:
            "With “Exclude public holidays” on, Korean public holidays (including Seollal, Chuseok and substitute holidays) are removed from the business days automatically. If you work on holidays: say on Saturdays: turn it off to exclude weekends only. Holidays for 2025-2027 are currently supported.",
        },
        {
          question: "How is annual, half-day and hourly leave deducted?",
          answer:
            "Annual leave is deducted as one full day of your standard hours, half-day leave as half of that, and hourly leave by the hours you enter. If you set daily hours to something other than 8 (say 7), the annual and half-day deductions scale to that value too.",
        },
        {
          question: "Which date do the remaining business days use?",
          answer:
            "They are counted from today through the end of the selected month. The “Count today” option lets you include or exclude today. Pick a past month and remaining days is 0; pick a future month and it shows that month's full business days.",
        },
        {
          question: "Are the hours I enter sent to a server?",
          answer:
            "No. Every calculation runs in your browser with JavaScript, and no work data is uploaded or stored. Close the tab and your inputs are gone.",
        },
      ],
    },
    og: {
      ko: {
        title: "유연근무 잔여시간 계산기",
        subtitle: "남은 목표 · 하루 평균 · 여유/부족을 한 번에",
      },
      en: {
        title: "Flex Work Calculator",
        subtitle: "Remaining target, daily average and balance at a glance",
      },
    },
  },
  {
    slug: "time-calculator",
    layout: "card",
    cat: "text",
    targets: ["office-worker", "pm", "developer"],
    ico: "±h",
    ready: true,
    indexable: true,
    badge: "Clean SaaS",
    name: { ko: "시간 더하기 빼기 계산기", en: "Time Calculator" },
    relatedTools: ["time-converter", "flex-work-calculator", "slack-timestamp-converter"],
    seo: {
      ko: {
        title: "시간 더하기 빼기 계산기 | 근무시간 합산",
        description:
          "여러 시간 블록을 더하거나 빼서 총 근무시간을 계산합니다. 타임시트 작성, 청구 시간 합산, 초과·조기퇴근 계산에 사용하세요. 결과를 시:분:초, 소수점 시간, 분, 초로 한 번에 확인할 수 있습니다. 모든 계산은 브라우저 안에서만 이루어집니다.",
        keywords: ["시간 더하기 계산기", "시간 빼기 계산기", "근무시간 합산", "타임시트 계산기", "시간 계산"],
      },
      en: {
        title: "Time Calculator | Add and Subtract Hours Minutes",
        description:
          "Add or subtract multiple time blocks to calculate total work hours. Perfect for timesheets, billing hours, overtime and break calculations. Results shown in H:M:S, decimal hours, minutes and seconds all at once. Everything runs in your browser.",
        keywords: ["time calculator", "add subtract hours minutes", "timesheet calculator", "hours minutes calculator", "work hours calculator"],
      },
    },
    content: {
      ko: {
        card: "시간 블록을 자유롭게 더하고 빼서 총 근무시간 계산. 타임시트·청구 시간에 유용.",
        description:
          "여러 시간 블록을 더하거나 빼서 총 근무시간을 계산합니다. 타임시트 작성, 청구 시간 합산, 초과·조기퇴근 계산에 사용하세요. 결과를 시:분:초, 소수점 시간, 분, 초로 한 번에 확인할 수 있습니다. 모든 계산은 브라우저 안에서만 이루어집니다.",
        howItWorks: ["시간 블록 입력(+/- 선택)", "항목 추가·삭제로 조정", "합계 결과 확인 및 복사"],
        aeo: {
          what: "시간 더하기 빼기 계산기는 여러 시간값(시·분·초)을 더하거나 빼서 총 합계를 시:분:초, 소수점 시간, 총 분, 총 초 형식으로 보여주는 계산 도구입니다.",
          who: "타임시트를 작성하는 프리랜서, 청구 시간을 집계하는 PM, 출퇴근 시간이나 휴게 시간을 계산해야 하는 직장인을 위한 도구입니다.",
          how: "시간 블록(시·분·초)을 입력하고 각 항목에 더하기(+) 또는 빼기(-) 연산자를 선택하면, 실시간으로 총 합계를 계산해 여러 형식으로 보여줍니다. 항목을 자유롭게 추가하거나 삭제할 수 있습니다.",
          why: "머릿속에서 시간을 계산하다 실수하는 일 없이, 여러 근무 블록의 합계를 정확하게 구할 수 있고 청구 시간이나 타임시트 작성 시간을 줄여줍니다.",
        },
        guide: [
          {
            heading: "시:분:초는 60진법이라 암산이 자주 틀립니다",
            body: [
              "시간은 10진법이 아니라 60진법입니다. 1시간 45분에 40분을 더하면 1시간 85분이 아니라 2시간 25분이어야 하는데, 여러 블록을 손으로 더하다 보면 이런 자리올림을 놓치기 쉽습니다. 특히 오전·오후 근무를 나눠 기록했거나 휴게시간을 뺀 실근무시간을 따로 계산해야 할 때, 블록이 3~4개만 넘어가도 암산 오류가 잦아집니다.",
              "이 계산기는 각 시간 블록에 +/- 부호만 정해주면 60진법 자리올림을 자동으로 처리해 정확한 합계를 냅니다.",
            ],
          },
          {
            heading: "형식을 바꿔가며 결과를 확인하는 이유",
            body: [
              "같은 합계를 시:분:초, 소수점 시간, 총 분, 총 초로 동시에 보여주는 이유는 쓰임새가 다르기 때문입니다. 타임시트에는 시:분:초가, 시급 계산이나 인보이스에는 1시간 30분 = 1.5h처럼 소수점 시간이 필요합니다. 회의 시간을 분 단위로 예약 시스템에 입력해야 할 때는 총 분이 바로 쓰기 편합니다.",
              "매번 단위를 손으로 환산하는 대신, 필요한 형식을 그 자리에서 골라 복사하면 됩니다.",
            ],
          },
          {
            heading: "빼기 항목으로 초과·부족 근무를 확인하는 법",
            body: [
              "더하기(+) 항목만 쓰면 단순 합산 계산기지만, 빼기(-) 항목을 섞으면 목표 시간 대비 초과·부족분을 계산하는 용도로도 쓸 수 있습니다. 예를 들어 하루 8시간을 더하기로 넣고 실제 근무를 마친 시각까지의 시간을 빼기로 넣으면, 남은 근무 시간(또는 이미 초과한 시간)이 바로 나옵니다.",
              "뺄 항목이 더할 항목보다 크면 합계가 음수로 표시되어, 조기 퇴근인지 초과 근무인지도 부호로 바로 구분됩니다.",
            ],
          },
        ],
        examples: [
          {
            title: "오전·오후로 나눠 기록한 근무시간 합산",
            input: "오전 4시간 15분(+) · 오후 3시간 50분(+)",
            result: "8시간 5분 (8.083h · 485분)",
            note: "분 단위가 60을 넘는 자리올림(15+50=65분 → 1시간 5분)을 자동으로 처리합니다. 손으로 더하면 놓치기 쉬운 부분입니다.",
          },
          {
            title: "휴게시간을 뺀 실근무시간 계산",
            input: "출근~퇴근 9시간(+) · 점심 휴게 1시간(-)",
            result: "8시간 (8.0h)",
            note: "전체 재실 시간에서 휴게시간을 빼는 방식으로, 급여 계산 기준이 되는 실근무시간을 구합니다.",
          },
          {
            title: "목표 근무시간 대비 초과분 확인",
            input: "목표 8시간(+) · 실제 근무 9시간 20분(-)",
            result: "−1시간 20분",
            note: "결과가 음수면 목표보다 더 일했다는 뜻입니다. 부호만 보면 초과인지 부족인지 바로 판단할 수 있어 주간 근무시간 정산에 씁니다.",
          },
        ],
        limitations: [
          "이 도구는 시간의 '길이'(duration)를 더하고 빼는 계산기입니다. 특정 시각(예: 오후 3시)에 몇 시간을 더해 몇 시가 되는지 구하는 시각 계산과는 다릅니다.",
          "날짜 경계를 넘는 계산(예: 자정을 넘겨 다음 날까지 근무)은 시·분·초 값만으로 처리하므로, 날짜가 바뀌는 지점을 직접 반영해 입력해야 합니다.",
          "표준 근무 정책(연장·야간·휴일 근로수당 배율 등)은 계산하지 않습니다. 이 도구는 시간의 합계만 구하며, 급여 산정이 필요하면 연봉 실수령액 계산기를 함께 사용하세요.",
          "입력한 항목은 새로고침하거나 탭을 닫으면 저장되지 않습니다. 여러 날짜의 근무시간을 누적 기록하려면 결과를 별도로 옮겨 적어야 합니다.",
        ],
      },
      en: {
        card: "Add and subtract time blocks to total up work hours. Built for timesheets and billing.",
        description:
          "Add or subtract multiple time blocks to calculate total work hours. Perfect for timesheets, billing hours, overtime and break calculations. Results shown in H:M:S, decimal hours, minutes and seconds all at once. Everything runs in your browser.",
        howItWorks: ["Enter time blocks with + or −", "Add or remove rows freely", "Copy the total in any format"],
        aeo: {
          what: "Time Calculator is a tool that adds or subtracts multiple time values (hours, minutes, seconds) and displays the total as H:M:S, decimal hours, total minutes and total seconds.",
          who: "It is for freelancers filling out timesheets, PMs tallying billable hours, and office workers calculating shifts, breaks or overtime.",
          how: "Enter each time block in hours, minutes and seconds, choose + or − for each row, and the running total updates instantly in multiple formats. Add or remove rows as needed.",
          why: "It eliminates mental arithmetic errors when summing multiple time blocks, making timesheet entry and billing calculations faster and more accurate.",
        },
        guide: [
          {
            heading: "H:M:S is base 60, and mental math slips on it",
            body: [
              "Time isn't base 10; it's base 60. Adding 40 minutes to 1 hour 45 minutes should give 2 hours 25 minutes, not 1 hour 85 minutes, but that carry is easy to miss once you're adding several blocks by hand. Once you're past three or four rows, splitting morning and afternoon shifts or subtracting a break from total time on-site, mental math errors creep in fast.",
              "This calculator only needs a + or − sign per block; it handles the base-60 carrying automatically and lands on an exact total.",
            ],
          },
          {
            heading: "Why the same total is shown in several formats",
            body: [
              "The same total appears as H:M:S, decimal hours, total minutes, and total seconds because each suits a different use. A timesheet wants H:M:S; an hourly rate calculation or invoice wants decimal hours, where 1 hour 30 minutes becomes 1.5h. Entering a meeting length into a booking system in minutes is easiest with the total-minutes figure.",
              "Instead of converting units by hand each time, pick whichever format you need and copy it straight from the result.",
            ],
          },
          {
            heading: "Using subtraction to check overtime or a shortfall",
            body: [
              "With only + rows, this is a plain adder, but mixing in − rows turns it into a way to check actual time against a target. Add your target (say, 8 hours) as a + row and subtract the time you actually worked, and what's left (or how much you went over) comes out directly.",
              "When the subtracted rows outweigh the added ones, the total goes negative, so the sign alone tells you whether you left early or worked overtime.",
            ],
          },
        ],
        examples: [
          {
            title: "Totaling a shift logged as morning and afternoon blocks",
            input: "Morning 4h 15m (+), afternoon 3h 50m (+)",
            result: "8h 5m (8.083h, 485 minutes)",
            note: "The carry when minutes pass 60 (15 + 50 = 65 minutes, i.e. 1h 5m) is handled automatically: exactly the kind of thing that's easy to miss adding by hand.",
          },
          {
            title: "Calculating actual worked time minus a break",
            input: "Clock-in to clock-out 9h (+), lunch break 1h (−)",
            result: "8h (8.0h)",
            note: "Subtracting the break from total time on-site gives the actual worked time that pay is usually based on.",
          },
          {
            title: "Checking overtime against a target shift length",
            input: "Target 8h (+), actual worked 9h 20m (−)",
            result: "−1h 20m",
            note: "A negative result means more was worked than the target. The sign alone tells you overtime from a shortfall, handy for a weekly hours reconciliation.",
          },
        ],
        limitations: [
          "This tool adds and subtracts durations (lengths of time). It is not a clock-time calculator that answers \"what time is it 5 hours after 3 PM\".",
          "Calculations that cross a date boundary (a shift that runs past midnight into the next day) are handled purely as hour/minute/second values, so you need to account for the date change yourself in what you enter.",
          "It does not apply labor policy multipliers (overtime, night-shift, or holiday pay rates). This tool only totals durations; pair it with the Salary Calculator if you need an actual pay figure.",
          "Entries are not saved across a page reload or a closed tab. To track hours across multiple days, copy each result out somewhere else.",
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "소수점 시간 형식은 어디에 쓰나요?",
          answer:
            "청구 시간(billable hours) 계산에 주로 쓰입니다. 예를 들어 1시간 30분은 1.5h로 표시됩니다. 프리랜서 인보이스나 시급 계산 시 편리하게 활용하세요.",
        },
        {
          question: "시간이 음수(마이너스)가 될 수 있나요?",
          answer:
            "네. 빼기(-) 항목이 더하기(+) 항목보다 크면 결과가 음수로 표시됩니다. 예를 들어 초과 근무한 시간보다 조기 퇴근 시간이 많으면 마이너스로 나타납니다.",
        },
        {
          question: "초(seconds)도 입력할 수 있나요?",
          answer:
            "네. 각 시간 블록에 시·분·초를 모두 입력할 수 있습니다. 초 단위가 필요 없는 경우 0으로 두면 됩니다.",
        },
        {
          question: "입력한 데이터가 서버로 전송되나요?",
          answer:
            "아니요. 모든 계산은 브라우저 안에서 처리되며 입력한 데이터는 서버로 전송되거나 저장되지 않습니다. 탭을 닫으면 입력값도 사라집니다.",
        },
      ],
      en: [
        {
          question: "What is the decimal hours format used for?",
          answer:
            "Decimal hours are mainly used for billing calculations. For example, 1 hour 30 minutes is shown as 1.5h: handy for freelance invoices and hourly rate calculations.",
        },
        {
          question: "Can the total go negative?",
          answer:
            "Yes. If the subtracted time exceeds the added time the result goes negative. This is useful when calculating whether you left early versus overtime.",
        },
        {
          question: "Can I include seconds in a time block?",
          answer:
            "Yes. Each row accepts hours, minutes and seconds. If you don't need seconds, just leave them at 0.",
        },
        {
          question: "Is anything I enter sent to a server?",
          answer:
            "No. Every calculation runs in your browser and the data you enter is never uploaded or stored. Close the tab and your inputs are gone.",
        },
      ],
    },
    og: {
      ko: {
        title: "시간 더하기 빼기 계산기",
        subtitle: "시간 블록을 더하고 빼서 총 근무시간을 계산",
      },
      en: {
        title: "Time Calculator",
        subtitle: "Add and subtract time blocks to get the total",
      },
    },
  },
  {
    slug: "time-converter",
    layout: "card",
    cat: "text",
    targets: ["office-worker", "pm"],
    ico: "h↔d",
    ready: true,
    indexable: true,
    badge: "Clean SaaS",
    name: { ko: "시간 단위 변환기", en: "Time Converter" },
    relatedTools: ["time-calculator", "flex-work-calculator", "slack-timestamp-converter"],
    seo: {
      ko: {
        title: "시간 단위 변환기 | 시간·일·주·월 변환",
        description:
          "시간·분·초·일·주·월·년 단위를 서로 변환합니다. 캘린더 기준(24시간/일)과 근무 기준(8시간/일, 5일/주)을 선택해 프로젝트 기간 산출, 근무시간 단위 환산에 사용하세요. 모든 변환은 브라우저 안에서 이루어집니다.",
        keywords: ["시간 단위 변환", "시간 일 주 변환기", "시간 변환기", "hours to days", "분 시간 변환"],
      },
      en: {
        title: "Time Converter | Hours to Days, Weeks, Months",
        description:
          "Convert between seconds, minutes, hours, days, weeks, months and years instantly. Choose calendar basis (24h/day) or work basis (8h/day, 5d/week) to calculate project durations and work hour conversions. Everything runs in your browser.",
        keywords: ["time converter", "hours to days converter", "hours to weeks", "time unit converter", "hours days weeks months calculator"],
      },
    },
    content: {
      ko: {
        card: "시간·일·주·월·년 단위 즉시 변환. 근무 기준(8h/일)과 캘린더 기준 선택 가능.",
        description:
          "시간·분·초·일·주·월·년 단위를 서로 변환합니다. 캘린더 기준(24시간/일)과 근무 기준(8시간/일, 5일/주)을 선택해 프로젝트 기간 산출, 근무시간 단위 환산에 사용하세요. 모든 변환은 브라우저 안에서 이루어집니다.",
        howItWorks: ["숫자와 단위 입력", "캘린더/근무 기준 선택", "전체 단위 변환 결과 확인"],
        aeo: {
          what: "시간 단위 변환기는 초·분·시간·일·주·월·년 단위를 서로 변환하고, 캘린더 기준(24시간/일)과 근무 기준(8시간/일, 5일/주)을 선택해 결과를 동시에 보여주는 도구입니다.",
          who: "프로젝트 기간을 시간 단위로 환산해야 하는 PM, 근무시간을 일·주 단위로 파악해야 하는 직장인을 위한 도구입니다.",
          how: "숫자와 단위를 입력하면 모든 단위(초·분·시간·일·주·월·년)로 변환된 결과를 한 화면에 보여줍니다. 캘린더 기준과 근무 기준 중 계산 방식을 선택할 수 있습니다.",
          why: "프로젝트 견적에서 '200시간이 몇 주인지', 온보딩에서 '2주가 몇 시간인지' 같은 계산을 매번 직접 하지 않고 즉시 확인할 수 있습니다.",
        },
        guide: [
          {
            heading: "캘린더 기준과 근무 기준, 같은 '일'이 다른 시간이 되는 이유",
            body: [
              "\"3일\"이라는 말은 맥락에 따라 완전히 다른 시간을 뜻합니다. 캘린더 기준으로는 1일 = 24시간이라 3일은 72시간이지만, 업무 공수로 말하는 3일(맨데이)은 보통 1일 = 8시간 근무를 뜻해 24시간에 불과합니다. 이 차이를 모르고 프로젝트 견적에 캘린더 기준 일수를 그대로 쓰면 공수를 3배 과대 산정하게 됩니다.",
              "이 변환기는 두 기준을 나란히 계산해, 지금 다루는 숫자가 '흘러가는 시간'인지 '업무 공수'인지에 맞는 쪽을 바로 골라 쓸 수 있게 합니다.",
            ],
          },
          {
            heading: "월(month) 변환이 근사값인 이유",
            body: [
              "1개월은 28일부터 31일까지 달마다 길이가 다르기 때문에, 다른 단위처럼 고정된 환산 비율이 없습니다. 이 도구는 캘린더 기준에서 1개월 = 30.44일(365.25일 ÷ 12), 근무 기준에서 1개월 = 21.75 근무일(연 261 근무일 ÷ 12)이라는 평균값을 씁니다. 특정 달(예: 2월 28일)의 정확한 일수가 아니라 연간 평균에 기반한 근사치입니다.",
              "분기·반기 단위로 대략적인 기간을 추산할 때는 충분히 쓸 만하지만, 특정 월의 정확한 날짜 수가 필요하면 캘린더를 직접 확인해야 합니다.",
            ],
          },
        ],
        examples: [
          {
            title: "프로젝트 견적의 시간을 근무일로 환산",
            input: "200시간 (근무 기준)",
            result: "25근무일 (5주)",
            note: "8시간/일, 5일/주 기준으로 나눈 값입니다. 캘린더 기준으로 잘못 계산하면 200시간이 8.3일(24시간/일)로 나와 공수를 크게 과소평가하게 됩니다.",
          },
          {
            title: "온보딩 기간을 시간 단위로 확인",
            input: "2주 (근무 기준)",
            result: "80시간 (10근무일)",
            note: "신규 입사자 온보딩 프로그램이나 교육 일정을 시간 단위 커리큘럼으로 짤 때, 몇 주가 총 몇 시간인지 바로 확인할 수 있습니다.",
          },
          {
            title: "분기 프로젝트 기간을 개월로 추산",
            input: "90일 (캘린더 기준)",
            result: "약 2.96개월",
            note: "정확히 3개월이 아닌 이유는 1개월을 30.44일 평균으로 계산하기 때문입니다. 분기 단위 로드맵을 대략적인 개월 수로 표현할 때 씁니다.",
          },
        ],
        limitations: [
          "월(month) 단위는 실제 달력의 날짜 수가 아니라 연간 평균(캘린더 30.44일, 근무 21.75일)에 기반한 근사값입니다. 2월처럼 짧은 달이나 31일까지 있는 달의 실제 일수와는 차이가 납니다.",
          "근무 기준은 1일 8시간·1주 5일·연 261 근무일이라는 일반적인 값을 고정으로 씁니다. 실제 회사의 소정근로시간이나 주 4일제처럼 다른 근무 형태는 반영하지 않습니다.",
          "공휴일·연차·재량근무처럼 개별 일정에 따라 달라지는 변수는 계산하지 않습니다. 실제 근무일을 정확히 따지려면 유연근무 잔여시간 계산기를 함께 사용하세요.",
          "단순 단위 환산기입니다. 특정 날짜에서 특정 날짜까지의 실제 캘린더 일수를 세는 기능은 제공하지 않습니다.",
        ],
      },
      en: {
        card: "Convert hours, days, weeks and months instantly. Switch between calendar and work basis.",
        description:
          "Convert between seconds, minutes, hours, days, weeks, months and years instantly. Choose calendar basis (24h/day) or work basis (8h/day, 5d/week) to calculate project durations and work hour conversions. Everything runs in your browser.",
        howItWorks: ["Enter a number and pick a unit", "Choose calendar or work basis", "See all unit conversions at once"],
        aeo: {
          what: "Time Converter is a tool that converts between seconds, minutes, hours, days, weeks, months and years, with the option to switch between calendar basis (24h/day) and work basis (8h/day, 5d/week).",
          who: "It is for PMs translating project estimates into hours or weeks, and for office workers who need to convert between time units quickly.",
          how: "Enter a number and select a unit; the result appears in every other unit simultaneously. Toggle between calendar basis and work basis to match your context.",
          why: "It saves the mental calculation of questions like 'how many weeks is 200 hours?' or 'how many hours is 2 weeks?' that come up repeatedly in project planning and scheduling.",
        },
        guide: [
          {
            heading: "Why the same 'day' means different amounts of time",
            body: [
              "\"Three days\" means very different things depending on context. On a calendar basis, 1 day = 24 hours, so three days is 72 hours; but three person-days of work usually means 8-hour workdays, just 24 hours total. Applying calendar-basis day counts to a project estimate without noticing this triples the effort you think you have.",
              "This converter computes both bases side by side, so you can pick whichever matches whether you're dealing with elapsed time or work effort.",
            ],
          },
          {
            heading: "Why month conversions are approximate",
            body: [
              "A month runs anywhere from 28 to 31 days, so unlike the other units, there's no fixed ratio to convert with. This tool uses annual averages: 1 month = 30.44 days on a calendar basis (365.25 / 12), and 1 month = 21.75 working days on a work basis (261 working days / 12). That's an approximation based on the yearly average, not the exact day count of any specific month (like February's 28).",
              "It's accurate enough for rough quarter- or half-year estimates, but check an actual calendar if you need the precise day count of a particular month.",
            ],
          },
        ],
        examples: [
          {
            title: "Converting a project estimate's hours to working days",
            input: "200 hours (work basis)",
            result: "25 working days (5 weeks)",
            note: "Divided at 8 hours/day and 5 days/week. Using calendar basis by mistake would give 8.3 days (24 hours/day), badly underestimating the effort.",
          },
          {
            title: "Checking an onboarding period in hours",
            input: "2 weeks (work basis)",
            result: "80 hours (10 working days)",
            note: "Useful for turning a new-hire onboarding program or training schedule into an hour-based curriculum.",
          },
          {
            title: "Estimating a quarterly project length in months",
            input: "90 days (calendar basis)",
            result: "About 2.96 months",
            note: "It isn't exactly 3 months because a month is computed as the 30.44-day average. Handy for expressing a quarterly roadmap as an approximate month count.",
          },
        ],
        limitations: [
          "The month unit is an approximation based on the annual average (30.44 calendar days, 21.75 working days), not the actual number of days in a real calendar month. It differs from a short month like February or a 31-day month.",
          "Work basis uses fixed, generic figures: 8 hours a day, 5 days a week, 261 working days a year. It does not reflect a specific company's contracted hours or a 4-day workweek.",
          "It does not account for schedule-specific variables like public holidays, vacation days, or discretionary work arrangements. For an exact working-day count, pair it with the Flex Work Calculator.",
          "This is a plain unit converter. It does not count the actual calendar days between two specific dates.",
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "캘린더 기준과 근무 기준의 차이는 무엇인가요?",
          answer:
            "캘린더 기준은 1일 = 24시간, 1주 = 7일로 계산합니다. 근무 기준은 1일 = 8시간, 1주 = 5일(40시간)로 계산합니다. 프로젝트 공수 산정에는 근무 기준을, 시차 계산이나 일반 시간 변환에는 캘린더 기준을 사용하세요.",
        },
        {
          question: "월(month) 변환은 어떻게 계산되나요?",
          answer:
            "캘린더 기준에서 1개월 = 30.44일(365.25/12), 근무 기준에서 1개월 = 21.75일(261/12, 1년 261 근무일 기준)로 계산합니다. 정확한 월 수는 달마다 일수가 다르므로 근사값입니다.",
        },
        {
          question: "어떤 단위까지 지원하나요?",
          answer:
            "초(seconds), 분(minutes), 시간(hours), 일(days), 주(weeks), 월(months), 년(years) 7개 단위를 지원합니다. 입력 단위로 어느 단위든 선택할 수 있습니다.",
        },
        {
          question: "입력한 숫자가 서버로 전송되나요?",
          answer:
            "아니요. 모든 변환은 브라우저 안에서 처리되며 입력한 숫자는 서버로 전송되거나 저장되지 않습니다.",
        },
      ],
      en: [
        {
          question: "What is the difference between calendar and work basis?",
          answer:
            "Calendar basis uses 1 day = 24 hours and 1 week = 7 days. Work basis uses 1 day = 8 hours and 1 week = 5 days (40 hours). Use work basis for project effort estimation and calendar basis for time zone math or general time conversions.",
        },
        {
          question: "How is a month calculated?",
          answer:
            "On calendar basis, 1 month = 30.44 days (365.25 ÷ 12). On work basis, 1 month = 21.75 working days (261 ÷ 12, based on 261 working days per year). These are averages since months vary in length.",
        },
        {
          question: "Which units are supported?",
          answer:
            "Seconds, minutes, hours, days, weeks, months and years: 7 units in total. You can pick any of them as the input unit.",
        },
        {
          question: "Is anything I enter sent to a server?",
          answer:
            "No. All conversions run in your browser and the numbers you enter are never uploaded or stored.",
        },
      ],
    },
    og: {
      ko: {
        title: "시간 단위 변환기",
        subtitle: "시간·일·주·월·년 단위 즉시 변환, 근무 기준 지원",
      },
      en: {
        title: "Time Converter",
        subtitle: "Convert hours, days, weeks and months: with work basis",
      },
    },
  },
  {
    slug: "lunar-solar-converter",
    layout: "card",
    cat: "text",
    targets: ["office-worker", "pm", "small-business-owner"],
    ico: "☽↔",
    ready: true,
    indexable: true,
    badge: "Clean SaaS",
    name: { ko: "음력 양력 변환기", en: "Lunar-Solar Converter" },
    relatedTools: ["slack-timestamp-converter", "time-calculator", "flex-work-calculator"],
    seo: {
      ko: {
        title: "음력 양력 변환기 | 1901~2100년 날짜 변환",
        description:
          "양력 날짜를 음력으로, 음력 날짜를 양력으로 즉시 변환합니다. 1901년부터 2100년까지 지원하며 윤달 처리와 갑자·띠 정보도 함께 확인할 수 있습니다. 설치·가입 없이 브라우저에서 바로 사용하세요.",
        keywords: [
          "음력 양력 변환",
          "음력 변환기",
          "양력 음력 변환",
          "음력 날짜 변환",
          "음력 양력 계산기",
          "음력 계산기",
          "윤달 계산",
        ],
      },
      en: {
        title: "Lunar-Solar Date Converter | 1901 to 2100",
        description:
          "Convert solar (Gregorian) dates to Korean lunar dates and vice versa. Covers 1901-2100, handles intercalation (leap) months, and displays the traditional Korean ganzhi year name. Runs entirely in your browser: no login, no installation.",
        keywords: [
          "lunar solar converter",
          "korean lunar calendar",
          "lunar date converter",
          "solar to lunar",
          "lunar to solar",
          "korean calendar converter",
          "intercalation month",
        ],
      },
    },
    content: {
      ko: {
        card: "양력 ↔ 음력 날짜를 즉시 변환. 1901~2100년 범위, 윤달·갑자·띠 정보 포함.",
        description:
          "양력 날짜를 음력으로, 음력 날짜를 양력으로 즉시 변환합니다. 1901년부터 2100년까지 지원하며 윤달 처리와 갑자·띠 정보도 함께 확인할 수 있습니다. 설치·가입 없이 브라우저에서 바로 사용하세요.",
        howItWorks: [
          "변환 방향 선택 (양력→음력 또는 음력→양력)",
          "연·월·일 입력 (윤달 여부 선택 가능)",
          "변환 결과와 갑자·띠 확인",
        ],
        aeo: {
          what: "음력 양력 변환기는 양력(그레고리력) 날짜와 음력(한국 음력) 날짜를 양방향으로 변환해주는 도구입니다. 1901년부터 2100년까지 지원하며 윤달도 정확하게 처리합니다.",
          who: "제삿날·생일·명절처럼 음력 기준 날짜를 양력으로 확인해야 하는 직장인과 자영업자, 또는 양력 날짜가 음력으로 며칠인지 확인하려는 분을 위한 도구입니다.",
          how: "변환 방향을 선택한 뒤 연·월·일을 입력하면 브라우저 안에서 즉시 상대 역법의 날짜로 변환하고 갑자(干支)와 띠 정보를 함께 표시합니다.",
          why: "음력과 양력을 매년 달력을 뒤적이거나 검색하지 않고 1901~2100년 범위 어느 날짜든 한 번에 확인할 수 있기 때문입니다.",
        },
              guide: [
          {
            heading: "음력 날짜가 매년 옮겨 다니는 이유",
            body: [
              "음력은 달이 차고 기우는 주기(약 29.53일)를 한 달로 삼습니다. 12달을 모으면 354일 정도라 태양력 1년보다 11일쯤 짧고, 그래서 같은 음력 생일이 양력으로는 매년 11일씩 앞당겨집니다. 그대로 두면 몇 년 만에 설날이 여름에 오게 되므로, 약 2~3년에 한 번 같은 달을 두 번 넣어 계절을 맞춥니다. 이렇게 끼워 넣은 달이 윤달입니다.",
              "부모님 생신이나 제사를 음력으로 지내는 집이라면 매년 양력 날짜를 새로 확인해야 하는 이유가 여기 있습니다. 규칙이 단순한 나눗셈이 아니라 실제 천문 계산에 근거하기 때문에, 손으로 환산하는 것은 사실상 불가능합니다.",
            ],
          },
          {
            heading: "윤달을 만났을 때",
            body: [
              "윤달이 있는 해에는 예를 들어 6월이 두 번 나옵니다. 앞의 것이 평달 6월, 뒤의 것이 윤6월입니다. 음력 6월 15일이 생일인 사람은 윤6월이 든 해에 어느 쪽을 쇠는지 집안마다 다릅니다. 일반적으로는 평달을 따르지만, 제사는 윤달을 피해 평달에 지내는 관례가 넓게 쓰입니다.",
              "이 변환기에서는 해당 월에 윤달이 존재할 때만 윤달 선택을 켤 수 있습니다. 선택할 수 없다면 그 해 그 달에는 윤달이 없다는 뜻이므로, 평달 날짜를 그대로 쓰면 됩니다.",
            ],
          },
          {
            heading: "간지와 띠는 언제 바뀌는가",
            body: [
              "변환 결과에는 그 날짜의 간지(갑자·을축 등 60갑자)와 띠가 함께 표시됩니다. 여기서 자주 생기는 혼동은 띠가 바뀌는 시점입니다. 이 도구는 음력 정월 초하루를 해의 경계로 삼습니다. 즉 양력 1월에 태어난 사람은 음력으로는 아직 전년도에 속해 앞 해의 띠가 됩니다.",
              "다만 사주 명리에서는 입춘(양력 2월 4일경)을 해의 경계로 보는 관습도 있어, 1월~2월 초 출생자의 띠는 기준에 따라 달라질 수 있습니다. 공식적인 용도가 아니라면 음력설 기준을 쓰는 것이 일반적입니다.",
            ],
          },
        ],
        examples: [
          {
            title: "음력 생신을 올해 양력 날짜로 확인",
            input: "음력 1958년 3월 12일 · 평달",
            result: "해당 양력 날짜와 요일, 간지·띠가 함께 표시",
            note: "매년 양력 날짜가 달라지므로, 캘린더에 반복 일정으로 넣어 두면 어긋납니다. 해마다 다시 확인하는 편이 안전합니다.",
          },
          {
            title: "양력 날짜의 음력 확인",
            input: "양력 2026년 8월 18일",
            result: "대응하는 음력 연·월·일과 윤달 여부",
            note: "양력 → 음력 방향은 제사나 명절이 음력 며칠인지 역으로 확인할 때 씁니다.",
          },
          {
            title: "윤달이 든 해 확인",
            input: "윤달이 있는 연·월 선택",
            result: "윤달 선택이 활성화되고, 평달과 윤달의 양력 날짜가 서로 다르게 나옴",
            note: "윤달 선택을 켤 수 없다면 그 해 그 달에는 윤달이 없습니다.",
          },
        ],
        limitations: [
          "지원 범위는 1901년부터 2100년까지입니다. 이 범위를 벗어난 날짜는 변환되지 않으며, 조선시대 문헌의 날짜 고증 같은 용도에는 쓸 수 없습니다.",
          "한국 음력(대한민국 표준시 기준)을 따릅니다. 중국 농력이나 베트남 음력은 시차 때문에 삭(달이 완전히 어두워지는 순간)이 다른 날에 걸리는 경우가 있어, 하루 차이가 나거나 윤달 배치가 달라질 수 있습니다.",
          "띠는 음력 정월 초하루를 기준으로 바뀝니다. 입춘을 해의 경계로 보는 사주 관습과는 결과가 다를 수 있어, 양력 1월~2월 초 출생자는 용도에 맞는 기준을 확인해야 합니다.",
          "음력 날짜에는 시각 개념이 없습니다. 자시(밤 11시 이후)를 다음 날로 치는 전통 계산이 필요하다면 이 도구의 결과에 별도 보정이 필요합니다.",
        ],
      },
      en: {
        card: "Convert Gregorian dates to Korean lunar dates and back. Covers 1901-2100 with leap months.",
        description:
          "Convert solar (Gregorian) dates to Korean lunar dates and vice versa. Covers 1901-2100, handles intercalation (leap) months, and displays the traditional Korean ganzhi year name. Runs entirely in your browser: no login, no installation.",
        howItWorks: [
          "Choose conversion direction (solar → lunar or lunar → solar)",
          "Enter year, month and day (toggle intercalation if needed)",
          "See the converted date with ganzhi year and zodiac",
        ],
        aeo: {
          what: "A Lunar-Solar Converter converts dates between the Gregorian (solar) calendar and the Korean lunisolar calendar in both directions. It covers 1901 to 2100 and correctly handles intercalation (leap) months.",
          who: "It is for office workers and small business owners who need to look up lunar-calendar anniversaries, memorial days and traditional holidays in the Gregorian calendar, or the reverse.",
          how: "Select a conversion direction, enter a year, month and day, and the result is calculated instantly in your browser: including the traditional Korean ganzhi year name and zodiac animal.",
          why: "It saves the annual calendar-flipping or search needed to cross-reference lunar and solar dates for any date from 1901 to 2100.",
        },
              guide: [
          {
            heading: "Why lunar dates move around the solar calendar",
            body: [
              "The lunar calendar takes one month as a full cycle of moon phases, about 29.53 days. Twelve of those come to roughly 354 days, some eleven days short of a solar year, which is why the same lunar birthday lands about eleven days earlier on the solar calendar each year. Left alone that would drift Seollal into summer within a couple of decades, so roughly every two to three years an extra month is inserted to pull the calendar back in line. That inserted month is the intercalary, or leap, month.",
              "If your family keeps birthdays or ancestral rites on the lunar calendar, this is why the solar date has to be looked up again every year. The rule rests on real astronomical calculation rather than simple division, so converting by hand is not practical.",
            ],
          },
          {
            heading: "What to do when there is a leap month",
            body: [
              "In a year with an intercalary month, the sixth month, say, occurs twice: the ordinary sixth month and then the leap sixth month. For someone born on the fifteenth of the sixth lunar month, which one to observe in such a year varies by family. The ordinary month is the usual choice, and ancestral rites in particular are widely kept in the ordinary month rather than the leap one.",
              "In this converter the leap-month option can only be switched on for months that actually have one. If you cannot select it, that year and month simply has no leap month and the ordinary date applies.",
            ],
          },
          {
            heading: "When the sexagenary cycle and zodiac sign change",
            body: [
              "Each conversion also shows the date's ganzhi (the sixty-term sexagenary cycle) and its zodiac animal. The common confusion is when the animal changes. This tool uses the first day of the first lunar month as the boundary, so someone born in solar January still falls in the previous lunar year and takes the previous year's animal.",
              "Some traditions in Chinese astrology instead place the boundary at Lichun, around 4 February, which means the animal for anyone born between January and early February can differ depending on the convention. For everyday use, the lunar new year boundary is the usual one.",
            ],
          },
        ],
        examples: [
          {
            title: "Finding this year's solar date for a lunar birthday",
            input: "Lunar 12th day of the 3rd month, 1958, ordinary month",
            result: "The matching solar date and weekday, with ganzhi and zodiac sign",
            note: "Because the solar date shifts each year, a repeating calendar entry will drift out of sync. It is safer to look it up annually.",
          },
          {
            title: "Looking up the lunar date for a solar day",
            input: "Solar 18 August 2026",
            result: "The corresponding lunar year, month and day, and whether it is a leap month",
            note: "The solar-to-lunar direction is what you use to work out which lunar day a holiday or memorial falls on.",
          },
          {
            title: "Checking a year that has a leap month",
            input: "Select a year and month that contains an intercalary month",
            result: "The leap-month toggle becomes available, and the ordinary and leap months map to different solar dates",
            note: "If the toggle stays disabled, that year and month has no leap month.",
          },
        ],
        limitations: [
          "The supported range is 1901 to 2100. Dates outside it are not converted, so it cannot be used for dating historical records.",
          "It follows the Korean lunar calendar, based on Korea Standard Time. The Chinese and Vietnamese lunar calendars can place a new moon on a different day because of the time difference, giving a one-day shift or a different leap-month placement.",
          "The zodiac animal changes at the first day of the first lunar month. Traditions that use Lichun as the boundary will disagree for anyone born in January or early February, so check which convention your purpose needs.",
          "Lunar dates carry no time of day. If you need the traditional rule that counts the hours after 11pm as the next day, adjust the result yourself.",
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "음력 양력 변환기란 어떤 도구인가요?",
          answer:
            "양력(그레고리력) 날짜를 한국 음력 날짜로, 또는 음력 날짜를 양력 날짜로 변환해주는 도구입니다. 제삿날·생일·명절처럼 음력 기준 날짜를 양력으로 확인하거나, 반대로 양력 날짜가 음력으로 며칠인지 알고 싶을 때 사용합니다.",
        },
        {
          question: "윤달은 어떻게 처리하나요?",
          answer:
            "음력 입력 모드에서 특정 달을 선택하면 해당 달에 윤달이 존재할 경우 '윤달' 토글이 활성화됩니다. 윤달을 켜면 해당 윤달의 양력 날짜로 변환합니다. 양력→음력 변환 시에는 결과에 윤달 여부가 자동으로 표시됩니다.",
        },
        {
          question: "어느 기간의 날짜까지 변환할 수 있나요?",
          answer:
            "1901년 1월 1일부터 2100년 12월 31일까지의 양력 날짜를 지원합니다. 그 범위 안의 음력 날짜도 모두 변환 가능합니다.",
        },
        {
          question: "입력한 날짜가 서버로 전송되나요?",
          answer:
            "아니요. 모든 변환은 브라우저 안에서 처리됩니다. 입력한 날짜는 서버로 전송되거나 저장되지 않습니다.",
        },
        {
          question: "갑자(干支)와 띠는 어떤 기준으로 계산되나요?",
          answer:
            "음력 해당 연도를 기준으로 갑자(천간·지지)와 띠를 계산합니다. 양력→음력 변환 결과에 표시되는 갑자·띠는 그 날짜가 속한 음력 연도를 기준으로 합니다.",
        },
        {
          question: "음력 날짜를 잘못 입력하면 어떻게 되나요?",
          answer:
            "존재하지 않는 음력 날짜(예: 실제로 29일까지밖에 없는 달의 30일)를 입력하면 오류 메시지가 표시됩니다. 올바른 날짜를 다시 입력하면 정상 변환됩니다.",
        },
      ],
      en: [
        {
          question: "What is a Lunar-Solar Converter?",
          answer:
            "It is a tool that converts dates between the Gregorian (solar) calendar and the Korean lunisolar calendar in both directions. Use it to find the Gregorian date of a lunar anniversary or memorial day, or to find the lunar date that corresponds to a given Gregorian date.",
        },
        {
          question: "How are intercalation (leap) months handled?",
          answer:
            "In lunar-input mode, a leap-month toggle appears when the selected month has an intercalation counterpart in that year. Turning it on converts the intercalation-month date to the correct Gregorian date. In solar-to-lunar mode, the result automatically indicates whether the date falls in an intercalation month.",
        },
        {
          question: "What date range is supported?",
          answer:
            "Solar dates from January 1, 1901 to December 31, 2100 are supported, along with all corresponding lunar dates within that range.",
        },
        {
          question: "Is my data sent to a server?",
          answer:
            "No. All conversions run entirely in your browser. The dates you enter are never uploaded or stored.",
        },
        {
          question: "What standard does the Korean lunar calendar follow?",
          answer:
            "The Korean lunisolar calendar follows the traditional East Asian calendar system based on astronomical new moons. It matches the calendar published by the Korea Astronomy and Space Science Institute (KASI).",
        },
      ],
    },
    og: {
      ko: {
        title: "음력 양력 변환기",
        subtitle: "양력 ↔ 음력 날짜 즉시 변환 · 1901~2100년 지원",
      },
      en: {
        title: "Lunar-Solar Converter",
        subtitle: "Convert between Gregorian and Korean lunar dates instantly",
      },
    },
  },

  // ── Growth Calculator Series ─────────────────────────────

  {
    slug: "growth-rate-calculator",
    layout: "card",
    cat: "text",
    targets: ["pm", "marketer", "office-worker", "small-business-owner", "developer"],
    ico: "%↑",
    ready: true,
    indexable: true,
    badge: "Calculator",
    name: { ko: "성장률 계산기", en: "Growth Rate Calculator" },
    relatedTools: ["cagr-calculator", "ad-budget-pacing-calculator", "funnel-conversion-calculator"],
    seo: {
      ko: {
        title: "성장률 계산기 | MoM·YoY·목표·역산·퍼센트 차이 계산",
        description:
          "이전 값과 현재 값을 입력하면 성장률·퍼센트 증감률·차이·배수를 즉시 계산합니다. MoM·YoY·QoQ·WoW 성장률은 물론, 목표까지 필요한 성장률·필요 증가량·역산·퍼센트 차이까지 탭 전환만으로 한 페이지에서 구합니다. 매출·사용자 수·트래픽 등 어떤 수치에도 쓰이며 브라우저 안에서만 동작합니다.",
        keywords: [
          "성장률 계산기", "퍼센트 증감률 계산기", "변화율 계산기", "증가율 계산기", "감소율 계산기",
          "MoM 계산기", "YoY 계산기", "QoQ 계산기", "WoW 계산기",
          "목표 성장률 계산기", "필요 증가량 계산기", "역산 계산기", "퍼센트 차이 계산기",
          "growth rate calculator", "percentage change calculator",
        ],
      },
      en: {
        title: "Growth Rate Calculator | MoM, YoY, Goal, Reverse, % Diff",
        description:
          "Enter a previous and current value to instantly calculate growth rate, percentage change, difference, and multiplier. Beyond MoM, YoY, QoQ, and WoW growth, switch tabs on the same page to find the growth rate needed to hit a goal, the required increase, the reverse-calculated original value, or a plain percent difference. Works for revenue, users, traffic, or any metric, entirely in your browser.",
        keywords: [
          "growth rate calculator", "percentage change calculator", "percentage increase calculator",
          "percentage decrease calculator", "MoM growth calculator", "YoY growth calculator",
          "goal growth calculator", "required growth calculator", "reverse growth calculator", "percent difference calculator",
        ],
      },
    },
    content: {
      ko: {
        card: "이전값·현재값으로 성장률·MoM·YoY 계산. 목표 성장률·필요 증가량·역산·퍼센트 차이도 탭 전환으로.",
        description:
          "이전 값과 현재 값을 입력하면 성장률(%), 퍼센트 증감률, 차이, 배수를 즉시 계산합니다. 변화율·증가율·감소율은 물론 지난달 대비(MoM)·전년 대비(YoY)·전분기 대비(QoQ)·전주 대비(WoW) 성장률까지 모두 같은 공식이라 이 계산기 하나로 구할 수 있습니다. 목표까지 필요한 성장률·필요 증가량과 달성률·최종값에서 원래 값을 역산·방향 없는 퍼센트 차이까지, 상단 탭으로 전환해 같은 페이지에서 계산합니다. 매출·사용자 수·트래픽 등 어떤 수치에도 사용 가능하며, 모든 계산은 브라우저 안에서만 이루어집니다.",
        howItWorks: ["상단 탭에서 원하는 계산(성장률·목표·필요 증가량·역산·퍼센트 차이) 선택", "필요한 값 입력", "결과 확인 및 복사"],
        aeo: {
          what: "성장률 계산기는 성장률·퍼센트 증감률·MoM·YoY·QoQ·WoW 계산부터 목표 성장률·필요 증가량·역산·퍼센트 차이까지, 두 값 사이의 변화를 다루는 다섯 가지 계산을 한 페이지에 모은 통합 도구입니다. 성장률·MoM·YoY·QoQ·WoW·증가율·감소율은 모두 동일한 (현재−이전)÷이전×100 공식을 쓰고, 목표 성장률·필요 증가량·역산은 같은 관계식을 목표 값·최종 값 기준으로 다시 푼 것입니다.",
          who: "매출·사용자 수·트래픽·지표 변화를 분석하는 PM, 마케터, 데이터 담당자, 소상공인, 개발자를 위한 도구입니다. 월간(MoM)·연간(YoY)·분기(QoQ)·주간(WoW) 성장률 보고, 목표 대비 진척 확인, 역산이 필요한 사람에게 특히 유용합니다.",
          how: "상단 탭에서 계산하려는 항목(성장률·목표 성장률·필요 증가량·역산·퍼센트 차이)을 고르고 값을 입력하면 브라우저 안에서 즉시 결과를 보여줍니다. 탭마다 필요한 입력 필드와 공식이 달라집니다.",
          why: "성장률·변화율·목표 성장률·필요 증가량·역산·퍼센트 차이를 계산하려고 서로 다른 도구를 오갈 필요 없이, 수기 계산 없이 정확한 값을 한 번에 얻어 보고서 작성과 목표 관리 시간을 줄일 수 있습니다.",
        },
        guide: [
          {
            heading: "하나의 공식, 여러 이름",
            body: [
              "성장률, 퍼센트 증감률, 변화율, 증가율, 감소율은 이름은 달라도 계산 방법이 같습니다. 모두 (현재 값 − 이전 값) ÷ 이전 값 × 100이라는 하나의 공식으로 구합니다. 결과가 양수면 흔히 '증가율', 음수면 '감소율'이라고 부를 뿐, 계산 자체는 동일합니다. 그래서 증가율 계산기와 감소율 계산기를 따로 찾을 필요 없이 이 성장률 계산기 하나로 두 경우를 모두 처리할 수 있습니다.",
              "비교하는 두 값이 무엇이냐에 따라 부르는 이름만 달라집니다. 이전 값과 현재 값 자리에 어떤 숫자를 넣든 계산기는 같은 방식으로 증감률을 알려줍니다.",
            ],
          },
          {
            heading: "MoM · YoY · QoQ · WoW 성장률도 이 계산기로",
            body: [
              "비즈니스 지표에서 자주 쓰는 MoM·YoY·QoQ·WoW 성장률도 결국 같은 증감률 계산입니다. MoM(Month over Month) 성장률은 지난달 값과 이번달 값을, YoY(Year over Year) 성장률은 작년 값과 올해 값을, QoQ(Quarter over Quarter) 성장률은 지난 분기와 이번 분기를, WoW(Week over Week) 성장률은 지난주와 이번주 값을 비교하는 것뿐입니다.",
              "예를 들어 지난달 매출 10,000, 이번달 매출 12,500이라면 이전 값에 10,000, 현재 값에 12,500을 넣어 MoM 성장률 +25%를 얻습니다. 같은 방식으로 작년/올해 숫자를 넣으면 YoY, 분기 숫자를 넣으면 QoQ, 주간 숫자를 넣으면 WoW 성장률이 됩니다. 별도의 MoM 계산기·YoY 계산기·QoQ 계산기·WoW 계산기를 오갈 필요가 없습니다.",
            ],
          },
          {
            heading: "성장률을 읽는 법과 활용",
            body: [
              "계산기는 증감률(%)과 함께 절대 차이, 배수를 같이 보여줍니다. 배수는 현재 값이 이전 값의 몇 배인지를 뜻하며(예: 1.25×), 증감률과 함께 보면 변화의 크기를 더 직관적으로 파악할 수 있습니다. 이전 값이 0이면 0으로 나누게 되어 성장률을 계산할 수 없으므로, 이 경우 시작점을 0이 아닌 값으로 잡아야 합니다.",
              "매출·트래픽·구독자·전환 수 등 어떤 수치든 넣어 보고서의 성장 지표를 채우거나, 목표 대비 진척을 점검할 때 활용하세요. 모든 계산은 브라우저 안에서만 이루어지며 입력한 숫자는 서버로 전송되지 않습니다.",
            ],
          },
          {
            heading: "퍼센트 차이: 방향 없이 두 값의 격차만 볼 때",
            body: [
              "성장률은 '무엇에서 무엇으로'라는 방향이 있는 계산이라 이전 값과 현재 값을 바꿔 넣으면 결과가 달라집니다. 반면 퍼센트 차이는 |A − B| ÷ ((A + B) / 2) × 100으로, 두 값 중 어느 쪽이 기준인지 정하지 않고 격차의 크기만 대칭적으로 나타냅니다. A와 B의 자리를 바꿔도 결과는 같습니다.",
              "두 캠페인의 성과, 두 그룹의 평균처럼 '어느 쪽이 먼저인지'가 의미 없는 비교에는 성장률 탭 대신 퍼센트 차이 탭을 쓰는 편이 맞습니다.",
            ],
          },
          {
            heading: "목표 성장률: 목표까지 필요한 증가율 역산",
            body: [
              "목표 성장률 탭은 현재 값과 목표 값을 넣으면 (목표 − 현재) ÷ 현재 × 100으로 그 목표에 도달하는 데 필요한 성장률을 계산합니다. '다음 분기에 몇 % 성장해야 목표를 채우는가' 같은 역방향 질문에 씁니다.",
              "일반 성장률 계산과 입력값은 비슷해 보이지만 목적이 다릅니다. 성장률 탭은 이미 일어난 변화를 측정하고, 목표 성장률 탭은 앞으로 필요한 변화를 구합니다.",
            ],
          },
          {
            heading: "필요 증가량과 달성률: 목표까지 남은 거리",
            body: [
              "필요 증가량 탭은 목표 성장률과 같은 두 입력(현재 값·목표 값)을 쓰지만 결과를 퍼센트가 아니라 절대적인 크기로 보여줍니다: 목표까지 남은 증가량, 현재까지의 달성률(현재 ÷ 목표 × 100), 남은 갭(목표 − 현재)입니다. 팀 대시보드에 '목표 대비 몇 %를 채웠는가'를 표시할 때 달성률을 바로 씁니다.",
              "목표 성장률 탭이 '몇 % 성장해야 하는가'에 답한다면, 이 탭은 '지금 얼마나 왔고 얼마나 남았는가'에 답합니다.",
            ],
          },
          {
            heading: "역산: 최종 값과 성장률로 원래 값 구하기",
            body: [
              "역산 탭은 반대 방향 계산입니다. 최종 값과 그 값에 적용된 성장률(%)을 알 때, 원래 값 = 최종 값 ÷ (1 + 성장률 / 100)으로 변화 이전의 값을 구합니다. '이번 달 매출이 지난달보다 25% 늘어 12,500이 됐다는데, 지난달 매출은 얼마였나'처럼 결과만 알고 출발점을 모를 때 씁니다.",
              "성장률이 −100%면 분모가 0이 되어 계산할 수 없습니다. 이 경우는 값이 완전히 0으로 사라졌다는 뜻이라 역산으로 원래 값을 복원할 수 없습니다.",
            ],
          },
        ],
              examples: [
          {
            title: "월간 활성 사용자(MAU) 증가율 보고",
            input: "이전 값 1,250,000 · 현재 값 1,437,500",
            result: "성장률 +15%, 차이 +187,500, 배수 1.15배",
            note: "주간 보고에 \"15% 성장\"이라고 쓰기 전에 절대 증가량(187,500)도 함께 보세요. 모수가 작을 때의 15%와 큰 모수에서의 15%는 의미가 전혀 다릅니다.",
          },
          {
            title: "전년 동월 대비(YoY) 매출 비교",
            input: "이전 값 84,000,000 · 현재 값 71,400,000",
            result: "성장률 −15%, 차이 −12,600,000",
            note: "MoM·YoY·QoQ·WoW는 모두 같은 수식이고 비교 대상 기간만 다릅니다. 계절성이 있는 사업이라면 직전 달(MoM)보다 전년 동월(YoY)이 실제 추세를 더 정확히 보여줍니다.",
          },
          {
            title: "감소율을 되돌리는 데 필요한 증가율 확인",
            input: "100에서 80으로 떨어진 뒤(−20%) 다시 100으로 회복",
            result: "회복에 필요한 성장률은 +25% (20%가 아님)",
            note: "퍼센트는 기준값이 바뀌면 대칭이 아닙니다. −20% 뒤의 +20%는 원래 값이 아니라 96이 됩니다. 목표 복귀 수치가 필요할 때 자주 틀리는 부분입니다.",
          },
          {
            title: "두 광고 캠페인의 전환율 격차 비교",
            input: "캠페인 A 전환율 4%, 캠페인 B 전환율 5% (퍼센트 차이 탭)",
            result: "퍼센트 차이 약 22.2%",
            note: "어느 캠페인이 '기준'인지 정할 이유가 없는 비교라 성장률 대신 퍼센트 차이를 씁니다. A와 B 순서를 바꿔 넣어도 결과는 같습니다.",
          },
          {
            title: "다음 분기 목표를 채우려면 필요한 성장률",
            input: "현재 값 8,000 · 목표 값 10,000 (목표 성장률 탭)",
            result: "필요 성장률 +25%",
            note: "이번 분기 실적(8,000)에서 다음 분기 목표(10,000)까지 얼마나 성장해야 하는지를 미리 계산해 팀 목표로 공유할 때 씁니다.",
          },
          {
            title: "목표 대비 현재 진척률 확인",
            input: "현재 값 7,000 · 목표 값 10,000 (필요 증가량 탭)",
            result: "달성률 70%, 남은 갭 3,000",
            note: "분기 중간 점검에서 '목표의 몇 %를 채웠는가'를 바로 보여주므로, 목표 성장률 탭의 퍼센트보다 진행 상황 보고에 적합합니다.",
          },
          {
            title: "이번 달 결과에서 지난달 값을 역산",
            input: "최종 값 12,500 · 성장률 +25% (역산 탭)",
            result: "원래 값 10,000",
            note: "이번 달 수치와 알려진 성장률만 있고 지난달 원본 수치를 따로 기록하지 않았을 때, 역으로 계산해 복원합니다.",
          },
        ],
        limitations: [
          "이전 값이 0이면 성장률을 정의할 수 없습니다. 0에서 100으로 늘어난 것은 \"무한대 성장\"이 아니라 증가량(+100)으로 표현해야 합니다.",
          "이전 값이 음수인 경우(적자에서 흑자 전환 등) 퍼센트 성장률은 수학적으로는 계산되지만 해석이 뒤집혀 오해를 부릅니다. 이때는 퍼센트 대신 절대 금액 변화를 쓰세요.",
          "두 시점만 비교하므로 그 사이의 등락은 보이지 않습니다. 3개월 이상 흐름을 하나의 연율로 요약하려면 CAGR 계산기를 쓰는 편이 정확합니다.",
          "퍼센트포인트(%p)와 퍼센트(%)를 구분하지 않습니다. 전환율이 2%에서 3%가 된 경우 이 도구는 +50%로 계산하며, 이를 \"1%p 상승\"으로 표현할지는 보고 맥락에 따라 직접 선택해야 합니다.",
          "성장률 탭은 방향이 있고(A→B), 퍼센트 차이 탭은 방향이 없습니다(A와 B의 격차). 같은 두 숫자를 넣어도 두 탭의 결과 값 자체가 다르므로 어느 탭을 쓸지는 질문의 성격에 따라 먼저 정해야 합니다.",
          "역산 탭은 성장률이 −100%일 때 계산할 수 없습니다(분모가 0). 값이 완전히 사라진 경우이므로 원래 값을 복원할 수 없다는 의미로 해석해야 합니다.",
        ],
      },
      en: {
        card: "Growth rate, MoM, YoY from two values. Goal growth, required increase, reverse, and % difference too, via tabs.",
        description:
          "Enter a previous and current value to instantly calculate growth rate (%), percentage change, difference, and multiplier. Percentage increase and decrease, plus month-over-month (MoM), year-over-year (YoY), quarter-over-quarter (QoQ), and week-over-week (WoW) growth all share the same formula, so this one calculator covers them all. Switch tabs on the same page to find the growth rate needed to hit a goal, the required increase and progress toward it, the original value behind a known result, or a plain percent difference. Works for revenue, users, traffic, or any metric, entirely in your browser.",
        howItWorks: ["Pick a calculation from the tabs (growth rate, goal, required increase, reverse, % difference)", "Enter the values it needs", "Read or copy the result"],
        aeo: {
          what: "A Growth Rate Calculator is a unified tool covering five calculations about the change between two values: growth rate, percentage change, MoM, YoY, QoQ, and WoW growth, plus goal growth rate, required increase, reverse calculation, and percent difference. Growth rate, MoM, YoY, QoQ, WoW, and percentage increase/decrease all use the same (Current − Previous) / Previous × 100 formula; goal growth, required increase, and reverse calculation solve that same relationship for a target value or a final value instead.",
          who: "It is for PMs, marketers, analysts, small business owners, and developers who measure changes in revenue, users, traffic, or any metric: especially anyone reporting monthly (MoM), yearly (YoY), quarterly (QoQ), or weekly (WoW) growth, checking progress toward a goal, or working backward from a known result.",
          how: "Pick what you want to calculate from the tabs (growth rate, goal growth, required increase, reverse, percent difference), enter the values it needs, and the result appears instantly in your browser. Each tab has its own inputs and formula.",
          why: "Instead of hopping between separate tools for growth rate, percentage change, goal growth, required increase, reverse calculation, and percent difference, you get an accurate number in one place with no manual math: saving time on reports and goal tracking.",
        },
        guide: [
          {
            heading: "One formula, many names",
            body: [
              "Growth rate, percentage change, percent increase, and percent decrease are different names for the same calculation. Each is (Current − Previous) / Previous × 100. A positive result is usually called an increase and a negative one a decrease, but the math is identical, so there's no need for a separate percentage increase calculator and percentage decrease calculator; this growth rate calculator handles both.",
              "Only the label changes depending on which two values you compare. Whatever numbers you put in the previous and current fields, the calculator returns the change the same way.",
            ],
          },
          {
            heading: "MoM, YoY, QoQ, and WoW growth too",
            body: [
              "The MoM, YoY, QoQ, and WoW growth figures common in business reporting are the same percentage-change calculation. MoM (month over month) compares last month with this month, YoY (year over year) compares last year with this year, QoQ (quarter over quarter) compares consecutive quarters, and WoW (week over week) compares last week with this week.",
              "For example, with last month's revenue at 10,000 and this month's at 12,500, enter 10,000 as the previous value and 12,500 as the current value to get a MoM growth of +25%. Use last-year/this-year numbers for YoY, quarterly numbers for QoQ, and weekly numbers for WoW: no need to switch between a separate MoM, YoY, QoQ, or WoW calculator.",
            ],
          },
          {
            heading: "Reading and using the result",
            body: [
              "Alongside the percentage change, the calculator shows the absolute difference and the multiplier. The multiplier tells you how many times the previous value the current value is (e.g. 1.25×), which makes the size of the change easier to grasp. If the previous value is zero, the growth rate is undefined because it would divide by zero, so pick a non-zero starting point.",
              "Use it with any metric: revenue, traffic, subscribers, conversions: to fill in the growth figures in a report or to check progress toward a goal. Every calculation runs in your browser and the numbers you enter are never sent to a server.",
            ],
          },
          {
            heading: "Percent difference: comparing two values with no direction",
            body: [
              "Growth rate is directional (it goes from one value to another), so swapping the previous and current values changes the result. Percent difference instead computes |A − B| / ((A + B) / 2) × 100: it doesn't designate either value as the baseline, and reports the size of the gap symmetrically. Swapping A and B gives the same result.",
              "Use the percent difference tab instead of the growth rate tab when neither value is naturally \"first\": comparing two campaigns' performance, or two groups' averages, for example.",
            ],
          },
          {
            heading: "Goal growth: the rate needed to hit a target",
            body: [
              "The goal growth tab takes a current value and a target value and computes (Target − Current) / Current × 100: the growth rate required to reach that target. It answers a forward-looking question like \"how much do we need to grow next quarter to hit the goal?\"",
              "The inputs look similar to a plain growth rate calculation, but the purpose differs. The growth rate tab measures a change that already happened; the goal growth tab computes a change that still needs to happen.",
            ],
          },
          {
            heading: "Required increase and progress: how far is left to the goal",
            body: [
              "The required increase tab uses the same two inputs (current, target) as goal growth, but reports the answer as absolute amounts instead of a percentage: how much more is needed, the progress made so far (Current / Target × 100), and the remaining gap (Target − Current). Use the progress figure directly when a dashboard needs to show \"how much of the goal is filled.\"",
              "Where the goal growth tab answers \"what growth rate do we need,\" this tab answers \"how far have we come, and how far is left.\"",
            ],
          },
          {
            heading: "Reverse: finding the original value from a final value and a rate",
            body: [
              "The reverse tab runs the calculation backward. Given a final value and the growth rate that produced it, Original Value = Final Value / (1 + Growth Rate / 100) recovers the value before the change. Use it when you know this month's revenue grew 25% to reach 12,500 but didn't record last month's figure separately.",
              "When the growth rate is −100%, the denominator becomes zero and the calculation is undefined: the value dropped to nothing, so there is no original value to recover.",
            ],
          },
        ],
              examples: [
          {
            title: "Reporting monthly active user growth",
            input: "Previous 1,250,000 · Current 1,437,500",
            result: "Growth +15%, difference +187,500, multiple 1.15x",
            note: "Before writing \"15% growth\" in a weekly report, look at the absolute change (187,500) too. Fifteen percent off a small base and off a large base mean very different things.",
          },
          {
            title: "Year-over-year revenue comparison",
            input: "Previous 84,000,000 · Current 71,400,000",
            result: "Growth −15%, difference −12,600,000",
            note: "MoM, YoY, QoQ and WoW all use the same formula and differ only in the comparison period. For a seasonal business, YoY reflects the real trend far better than the previous month.",
          },
          {
            title: "Finding the increase needed to undo a decline",
            input: "A drop from 100 to 80 (−20%), then recovery back to 100",
            result: "The recovery requires +25%, not +20%",
            note: "Percentages are not symmetric because the base changes. Adding 20% after losing 20% lands at 96, not the original value. This trips people up whenever a recovery target is involved.",
          },
          {
            title: "Comparing the conversion rate gap between two ad campaigns",
            input: "Campaign A converts at 4%, Campaign B at 5% (Percent Difference tab)",
            result: "Percent difference of about 22.2%",
            note: "Neither campaign is naturally the \"baseline\" here, so percent difference is used instead of growth rate. Swapping A and B gives the same result.",
          },
          {
            title: "The growth rate needed to hit next quarter's target",
            input: "Current 8,000 · Target 10,000 (Goal Growth tab)",
            result: "Required growth rate +25%",
            note: "Used to work out, ahead of time, how much this quarter's result (8,000) needs to grow to reach next quarter's target (10,000), for sharing as a team goal.",
          },
          {
            title: "Checking current progress toward a target",
            input: "Current 7,000 · Target 10,000 (Required Increase tab)",
            result: "Progress 70%, remaining gap 3,000",
            note: "A mid-quarter check that shows \"how much of the goal is filled\" directly, which suits progress reporting better than the goal growth tab's percentage.",
          },
          {
            title: "Working out last month's value from this month's result",
            input: "Final value 12,500 · growth rate +25% (Reverse tab)",
            result: "Original value 10,000",
            note: "Used when you have this month's number and a known growth rate but never recorded last month's raw figure separately, to reconstruct it.",
          },
        ],
        limitations: [
          "Growth is undefined when the previous value is 0. Going from 0 to 100 is not \"infinite growth\"; report it as an absolute change of +100.",
          "When the previous value is negative (for example a loss turning into a profit), a percentage is mathematically computable but reads backwards and misleads. Use the absolute change instead.",
          "Only two points are compared, so anything that happened in between is invisible. To summarize three or more periods as a single annual figure, use the CAGR calculator.",
          "The tool does not distinguish percentage points from percent. A conversion rate moving from 2% to 3% is reported as +50%; whether to describe that as \"up 1pp\" is a judgment call for your report.",
          "The growth rate tab is directional (A to B); the percent difference tab is not (the gap between A and B). Feeding the same two numbers into each gives different results, so decide which tab fits your question first.",
          "The reverse tab cannot compute a result when the growth rate is −100% (division by zero). Read that as the value having dropped to nothing, with no original value to recover.",
        ],
      },
    },
    faq: {
      ko: [
        { question: "성장률이란 무엇인가요?", answer: "성장률은 두 시점 사이의 값 변화를 퍼센트로 나타낸 지표입니다. (현재−이전)÷이전×100으로 계산하며, 퍼센트 증감률·변화율과 같은 계산입니다." },
        { question: "MoM·YoY·QoQ·WoW 성장률도 이 계산기로 구하나요?", answer: "네. MoM(지난달 대비)·YoY(작년 대비)·QoQ(지난 분기 대비)·WoW(지난주 대비) 성장률은 모두 같은 증감률 공식을 씁니다. 비교할 두 기간의 값을 이전 값·현재 값에 넣으면 됩니다." },
        { question: "증가율과 감소율은 어떻게 구분되나요?", answer: "계산 방법은 같습니다. 결과가 양수(+)면 증가율, 음수(−)면 감소율로 표시됩니다. 별도의 증가율·감소율 계산기가 필요 없습니다." },
        { question: "퍼센트 증감률과 성장률은 다른가요?", answer: "부르는 이름만 다를 뿐 계산은 동일합니다. 두 값의 상대적 변화를 퍼센트로 나타낸 것으로, 상황에 따라 성장률·변화율·증감률로 불립니다." },
        { question: "이전 값이 0이면 어떻게 되나요?", answer: "0으로 나누기가 발생하므로 성장률을 계산할 수 없습니다. 오류 메시지가 표시되며, 시작점을 0이 아닌 값으로 잡아야 합니다." },
        { question: "퍼센트 차이는 성장률과 뭐가 다른가요?", answer: "성장률은 이전 값에서 현재 값으로 가는 방향이 있는 계산이라 두 값을 바꾸면 결과 부호가 바뀝니다. 퍼센트 차이는 방향이 없어 두 값을 바꿔도 같은 결과가 나오며, 어느 쪽이 기준인지 정할 필요가 없는 비교에 씁니다." },
        { question: "목표 성장률과 필요 증가량 탭은 어떻게 다른가요?", answer: "둘 다 현재 값과 목표 값을 입력받지만, 목표 성장률 탭은 결과를 퍼센트(몇 % 성장해야 하는가)로, 필요 증가량 탭은 절대적인 크기(얼마나 남았는가·몇 % 채웠는가)로 보여줍니다." },
        { question: "역산 탭은 언제 쓰나요?", answer: "최종 값과 그 값에 적용된 성장률만 알고 원래 값을 모를 때 씁니다. 원래 값 = 최종 값 ÷ (1 + 성장률 / 100)으로 계산하며, 성장률이 −100%이면 계산할 수 없습니다." },
        { question: "탭을 바꾸면 입력했던 값이 사라지나요?", answer: "네. 탭마다 입력 필드의 의미(이전값·현재값, 현재값·목표값, 최종값·성장률 등)가 달라 이전 탭의 값을 그대로 이어 쓰면 오히려 혼동을 줄 수 있어 기본값으로 초기화됩니다." },
        { question: "입력한 숫자가 서버로 전송되나요?", answer: "아니요. 모든 계산은 브라우저 안에서 처리되며 입력값은 서버로 전송·저장되지 않습니다." },
      ],
      en: [
        { question: "What is growth rate?", answer: "Growth rate is the percentage change between two values, calculated as (Current − Previous) / Previous × 100. It is the same calculation as percentage change." },
        { question: "Can I calculate MoM, YoY, QoQ, and WoW growth here?", answer: "Yes. MoM (vs last month), YoY (vs last year), QoQ (vs last quarter), and WoW (vs last week) growth all use the same percentage-change formula. Just enter the two periods' values as previous and current." },
        { question: "How are percentage increase and decrease different?", answer: "The calculation is identical. A positive result is a percentage increase and a negative result is a percentage decrease, so no separate increase or decrease calculator is needed." },
        { question: "Are percentage change and growth rate different?", answer: "Only the name differs: the math is the same relative change between two values expressed as a percent, called growth rate, percentage change, or percent change depending on context." },
        { question: "What happens if the previous value is zero?", answer: "Division by zero is undefined, so the growth rate cannot be calculated. An error message appears and you should choose a non-zero starting point." },
        { question: "How is percent difference different from growth rate?", answer: "Growth rate is directional, from a previous value to a current one, so swapping the two flips the sign of the result. Percent difference has no direction: swapping the two values gives the same result, and it's for comparisons where neither value is naturally the baseline." },
        { question: "What's the difference between the Goal Growth and Required Increase tabs?", answer: "Both take a current value and a target value, but Goal Growth reports the answer as a percentage (how much growth is needed), while Required Increase reports it as absolute amounts (how much is left, and what percent of the goal is already filled)." },
        { question: "When would I use the Reverse tab?", answer: "When you know a final value and the growth rate that produced it, but not the original value. It computes Original Value = Final Value / (1 + Growth Rate / 100); the calculation is undefined when the growth rate is −100%." },
        { question: "Does switching tabs clear the values I entered?", answer: "Yes. Each tab's fields mean something different (previous/current, current/target, final value/growth rate, and so on), so carrying a value over from another tab would likely cause confusion; fields reset to their defaults instead." },
        { question: "Are the numbers I enter sent to a server?", answer: "No. Every calculation happens in your browser and your inputs are never uploaded or stored." },
      ],
    },
    og: {
      ko: { title: "성장률 계산기", subtitle: "성장률·MoM·YoY부터 목표·역산·퍼센트 차이까지 한 페이지" },
      en: { title: "Growth Rate Calculator", subtitle: "Growth rate, MoM, YoY, goal, reverse and % diff in one place" },
    },
  },

  {
    slug: "cagr-calculator",
    layout: "card",
    cat: "text",
    targets: ["pm", "small-business-owner", "office-worker"],
    ico: "cagr",
    ready: true,
    indexable: true,
    badge: "Calculator",
    name: { ko: "CAGR 계산기", en: "CAGR Calculator" },
    relatedTools: ["growth-rate-calculator", "ad-budget-pacing-calculator", "salary-calculator"],
    seo: {
      ko: {
        title: "CAGR 계산기 | 연평균 성장률·복리 미래값 예측",
        description:
          "시작값·종료값·기간을 입력하면 연평균 성장률(CAGR)을 즉시 계산합니다. 탭을 전환하면 초기값·성장률·기간으로 복리 최종값과 미래 예측값도 같은 페이지에서 구할 수 있습니다. 투자 수익률·매출 성장률 분석과 성장 시나리오 플래닝에 활용하세요.",
        keywords: [
          "CAGR 계산기", "CAGR calculator", "연평균 성장률", "복리 성장 계산기", "미래값 계산기",
          "성장 예측 계산기", "annual growth rate calculator", "compound growth calculator",
        ],
      },
      en: {
        title: "CAGR Calculator | Annual Growth Rate & Compound Projection",
        description:
          "Enter a start value, end value, and number of years to instantly calculate the Compound Annual Growth Rate (CAGR). Switch tabs to project a compounded final value from an initial value, growth rate, and number of periods, on the same page. Use it for investment returns, revenue growth analysis, and scenario planning.",
        keywords: [
          "CAGR calculator", "compound annual growth rate calculator", "CAGR formula", "annual growth rate calculator",
          "compound growth calculator", "future value calculator", "growth projection calculator",
        ],
      },
    },
    content: {
      ko: {
        card: "시작값·종료값·기간으로 CAGR 즉시 계산. 탭 전환으로 복리 최종값·미래 예측값도.",
        description:
          "시작값·종료값·기간을 입력하면 연평균 성장률(CAGR)을 즉시 계산합니다. 탭을 전환하면 초기값·성장률·기간으로 복리 최종값과 미래 예측값도 같은 페이지에서 구할 수 있습니다. 두 계산은 서로 반대 방향으로 같은 수식을 풉니다: CAGR은 시작·종료값에서 연율을 역산하고, 복리 성장은 초기값과 연율에서 미래값을 구합니다. 투자 수익률·매출 성장률 분석과 성장 시나리오 플래닝에 활용하세요.",
        howItWorks: ["상단 탭에서 CAGR 또는 복리 성장 선택", "필요한 값(시작·종료·기간 또는 초기값·성장률·기간) 입력", "CAGR 또는 최종값·총 성장률 확인"],
        aeo: {
          what: "CAGR 계산기는 시작값과 종료값, 기간을 사용해 연평균 복리 성장률(CAGR)을 계산하고, 탭을 전환하면 초기값·성장률·기간으로 복리 최종값·미래 예측값도 계산하는 통합 도구입니다. CAGR은 Compound Annual Growth Rate의 약자이며, 두 계산 모두 최종값 = 초기값 × (1 + 연율/100)^기간이라는 같은 관계식을 반대 방향으로 풉니다.",
          who: "투자 수익률을 분석하거나 다년간의 비즈니스 성장률을 비교하려는 PM, 투자자, 소상공인, 그리고 매출·사용자 수의 미래값을 시나리오별로 예측해야 하는 스타트업 창업자를 위한 도구입니다.",
          how: "CAGR 탭에서는 CAGR = (종료 ÷ 시작)^(1÷기간) − 1 공식으로 연평균 성장률을 계산합니다. 복리 성장 탭에서는 최종값 = 초기값 × (1 + 성장률/100)^기간 공식으로 미래 값을 계산합니다.",
          why: "단순 성장률과 달리 복리 효과를 반영해 여러 해에 걸친 성장을 단일 연율로 표현하므로 비교가 쉽고, 그 연율로 미래를 내다보는 계산까지 같은 페이지에서 오갈 수 있어 성장 시나리오 검토가 빠릅니다.",
        },
              guide: [
          {
            heading: "CAGR이 필요한 순간",
            body: [
              "3년 동안 매출이 1.2억에서 2.1억이 됐다고 해봅시다. \"75% 성장\"은 사실이지만 다른 사업부와 비교할 수 없는 숫자입니다. 저쪽은 5년간 성장했을 수도, 2년간 성장했을 수도 있기 때문입니다. 기간이 다른 성장을 나란히 놓으려면 공통 단위가 필요하고, 그 단위가 연평균 성장률(CAGR)입니다.",
              "CAGR은 \"매년 똑같은 비율로 성장했다면 몇 %였겠는가\"를 되묻는 계산입니다. 실제로는 첫해에 몰아서 성장하고 이듬해에 정체했더라도, CAGR은 그 경로를 평탄하게 펴서 하나의 연율로 보여줍니다. 투자 수익률 비교, 시장 규모 전망, 사업계획서의 성장 가정이 대부분 CAGR로 표현되는 이유입니다.",
            ],
          },
          {
            heading: "산술평균으로 계산하면 왜 틀리는가",
            body: [
              "가장 흔한 실수는 연도별 성장률을 더해서 연수로 나누는 것입니다. 1년 차에 +100%, 2년 차에 −50%였다면 산술평균은 +25%지만, 실제로는 100 → 200 → 100으로 제자리입니다. 진짜 연평균은 0%입니다.",
              "CAGR = (종료값 ÷ 시작값)^(1 ÷ 기간) − 1 은 이 문제를 곱셈으로 풉니다. 성장은 더해지는 것이 아니라 곱해지며 쌓이기 때문에, 평균도 기하평균으로 내야 실제 도달점과 맞아떨어집니다. 이 계산기가 내는 CAGR로 시작값을 기간만큼 복리 성장시키면 정확히 종료값이 나옵니다.",
              "반대 방향의 계산이 필요하다면, 즉 시작값과 성장률로 미래 값을 구하고 싶다면 위 탭에서 복리 성장으로 전환하세요. 같은 수식을 반대로 푸는 계산입니다.",
            ],
          },
          {
            heading: "결과를 어떻게 읽을 것인가",
            body: [
              "CAGR은 과거를 요약하는 지표이지 미래를 보장하는 값이 아닙니다. 지난 3년 CAGR이 20%라는 사실이 내년에도 20% 성장한다는 뜻은 아닙니다. 특히 시작 시점이 유난히 낮았던 해라면 CAGR이 부풀려지므로, 시작·종료 연도를 한 해씩 옮겨 보면서 숫자가 크게 흔들리는지 확인하는 습관이 좋습니다.",
              "기간을 셀 때는 연도 개수가 아니라 구간 수를 넣어야 합니다. 2023년 말부터 2026년 말까지라면 연도는 네 개지만 기간은 3년입니다. 이 한 칸 차이로 CAGR이 눈에 띄게 달라집니다.",
            ],
          },
          {
            heading: "복리 성장과 미래값 예측은 CAGR의 역계산",
            body: [
              "'복리 성장'과 '성장 예측(미래값)'은 이름과 쓰는 맥락이 다를 뿐 계산은 동일하며, CAGR과 정반대 방향입니다. CAGR 탭이 시작·종료값에서 연율을 구한다면, 복리 성장 탭은 초기값과 연율에서 최종값 = 초기값 × (1 + 성장률/100)^기간 공식으로 미래 값을 구합니다. 초기 투자금 1,000만원이 매년 10%씩 복리로 늘면 5년 뒤 얼마인지 구하는 것과, 이번 달 사용자 5,000명이 매달 8%씩 성장하면 1년 뒤 몇 명일지 예측하는 것은 수식상 완전히 같은 문제입니다.",
              "그래서 '초기 값' 칸에 투자 원금을 넣으면 복리 최종값 계산이 되고, 현재 매출·사용자·트래픽 같은 비즈니스 지표를 넣으면 그대로 미래값을 내다보는 성장 예측이 됩니다.",
            ],
          },
          {
            heading: "복리와 단리의 차이",
            body: [
              "핵심은 각 기간의 성장이 원래 값이 아니라 '직전까지 누적된 값'에 적용된다는 점입니다. 단리라면 매 기간 같은 금액이 더해지지만, 복리는 늘어난 값에 다시 성장률이 붙어 시간이 지날수록 증가 속도가 빨라집니다. 기간이 길고 성장률이 높을수록 복리와 단리의 격차는 극적으로 벌어집니다.",
              "성장률에 음수를 넣으면 매 기간 일정 비율로 줄어드는 복리 감소를 계산합니다. 이탈률이 매달 붙는 사용자 수 감소나 감가 시나리오를 볼 때 유용합니다.",
            ],
          },
          {
            heading: "복리 성장 탭의 기간 단위와 활용",
            body: [
              "기간 단위는 성장률과 일치시키면 무엇이든 됩니다. 성장률이 월 기준이면 기간도 개월 수로, 연 기준이면 연수로 넣으세요. 같은 초기값이라도 성장률과 기간을 조금만 바꾸면 최종값이 크게 달라지므로, 낙관·기본·보수 시나리오를 각각 넣어 비교하면 계획의 폭을 가늠할 수 있습니다.",
              "미래 예측은 '성장률이 매 기간 일정하다'는 가정에 기반하므로, 성장률이 변동한다면 구간을 나눠 계산하세요. 모든 계산은 브라우저 안에서만 이루어지며 입력한 숫자는 서버로 전송되지 않습니다.",
            ],
          },
        ],
        examples: [
          {
            title: "3년간 매출 성장을 연율로 환산",
            input: "시작 120,000,000 · 종료 210,000,000 · 기간 3년 (CAGR 탭)",
            result: "CAGR 약 20.5% (총 성장률 75%)",
            note: "\"3년간 75% 성장\"보다 \"연평균 20.5% 성장\"이 다른 기간의 사업과 비교하기 쉽습니다. 검산: 1.205를 세 번 곱하면 약 1.75가 됩니다.",
          },
          {
            title: "요동친 성과의 실제 연평균 구하기",
            input: "시작 100 · 종료 100 · 기간 2년, 1년 차 +100%·2년 차 −50% (CAGR 탭)",
            result: "CAGR 0%",
            note: "연도별 성장률의 산술평균은 +25%로 나오지만, 실제로는 제자리입니다. 성장률을 평균 낼 때 CAGR을 써야 하는 이유가 이 차이입니다.",
          },
          {
            title: "감소한 지표의 연평균 하락률",
            input: "시작 50,000 · 종료 32,000 · 기간 2년 (CAGR 탭)",
            result: "CAGR 약 −20%",
            note: "감소도 같은 수식으로 계산되며 음수 CAGR로 표시됩니다. 이탈률·해지 건수처럼 줄어드는 것이 목표인 지표에도 그대로 쓸 수 있습니다.",
          },
          {
            title: "연 12% 성장 가정으로 5년 뒤 매출 예측",
            input: "초기값 50,000,000 · 성장률 12% · 기간 5년 (복리 성장 탭)",
            result: "약 88,117,000 (총 증가 약 76%)",
            note: "단리로 계산하면 50,000,000 × (1 + 0.12 × 5) = 80,000,000입니다. 5년만 지나도 복리와 단리의 차이가 800만원 넘게 벌어집니다.",
          },
          {
            title: "사업계획서의 성장 시나리오 비교",
            input: "같은 초기값에 성장률 8% / 12% / 20%를 각각 입력 (복리 성장 탭)",
            result: "5년 뒤 약 73,466,000 / 88,117,000 / 124,416,000",
            note: "보수·기본·공격 세 가지 시나리오를 나란히 두면, 목표 숫자가 어느 가정에 기대고 있는지 한눈에 보입니다.",
          },
        ],
        limitations: [
          "시작값은 반드시 0보다 커야 합니다. 시작값이 0이거나 음수면 (종료÷시작) 자체가 성립하지 않아 CAGR을 정의할 수 없습니다.",
          "CAGR은 중간 경로를 전부 지운 값입니다. CAGR이 같은 두 사업도 하나는 꾸준히 성장했고 다른 하나는 한 해에 몰아서 성장했을 수 있으므로, 변동성 판단에는 쓸 수 없습니다.",
          "기간은 연도 개수가 아니라 구간 수입니다. 2023년 말 → 2026년 말은 3년이며, 4를 넣으면 두 탭 모두 결과가 실제와 달라집니다.",
          "복리 성장 탭은 성장률이 매 기간 동일하다고 가정합니다. 실제 사업은 시장 포화·경쟁 진입·계절성으로 성장률이 변하므로, 기간이 길어질수록 예측 오차가 급격히 커집니다. 5년을 넘는 예측은 참고용으로만 쓰세요.",
          "두 탭 모두 물가상승률·환율·세금을 반영하지 않은 명목 값입니다. 장기간 금액을 비교하거나 투자 수익을 볼 때는 실질 가치·실질 수익률로 따로 환산해야 합니다.",
        ],
      },
      en: {
        card: "Calculate CAGR (Compound Annual Growth Rate) from start, end, and years.",
        description:
          "Enter a start value, end value, and number of years to instantly calculate CAGR. Use it for investment returns, revenue growth analysis, and business planning.",
        howItWorks: ["Enter the start value", "Enter the end value", "Enter the number of years, then read CAGR and total growth"],
        aeo: {
          what: "A CAGR Calculator computes the Compound Annual Growth Rate: the smoothed annual growth rate that describes how much a value grew each year on a compounded basis.",
          who: "It is for investors, PMs, and business owners who need to compare multi-year growth across different time periods or asset sizes.",
          how: "CAGR = (End / Start) ^ (1 / Years) − 1. The result is the annualized growth rate assuming constant compounding.",
          why: "CAGR normalizes growth across different time spans, making it the standard metric for comparing investment returns or business growth rates.",
        },
              guide: [
          {
            heading: "When you actually need CAGR",
            body: [
              "Say revenue went from 120M to 210M over three years. \"Grew 75%\" is true, but it cannot be compared with another business unit, because that one may have grown over five years or over two. Comparing growth across different time spans needs a common unit, and that unit is the compound annual growth rate.",
              "CAGR answers a single question: if this had grown by the same percentage every year, what percentage would that be? Even if all the growth landed in year one and year two was flat, CAGR flattens the path into one annual figure. That is why investment returns, market-size forecasts and business-plan assumptions are almost always stated as CAGR.",
            ],
          },
          {
            heading: "Why averaging the yearly rates gives the wrong answer",
            body: [
              "The most common mistake is adding up the annual growth rates and dividing by the number of years. With +100% in year one and −50% in year two, the arithmetic mean is +25%, but the value went 100 → 200 → 100 and ended exactly where it started. The true annual average is 0%.",
              "CAGR = (End ÷ Start) ^ (1 ÷ Years) − 1 solves this with multiplication. Growth compounds rather than adds, so the average has to be geometric to land on the real end value. Compounding the start value at this calculator's CAGR for the given number of years reproduces the end value exactly.",
              "If you need the reverse: a future value from a start value and a rate: switch to the Compound Growth tab above, which solves the same equation in the other direction.",
            ],
          },
          {
            heading: "How to read the result",
            body: [
              "CAGR summarizes the past; it does not promise the future. A 20% CAGR over the last three years does not mean next year will be 20%. It is especially inflated when the starting year happened to be unusually low, so it is worth shifting the start and end years by one and checking whether the number moves a lot.",
              "Count periods, not years. From the end of 2023 to the end of 2026 there are four calendar years but only three periods. That off-by-one changes the CAGR noticeably.",
            ],
          },
          {
            heading: "Compound growth and future projection are CAGR run in reverse",
            body: [
              "'Compound growth' and 'growth projection (future value)' differ only in name and context: the calculation is identical, and it runs the opposite direction from CAGR. Where the CAGR tab derives an annual rate from a start and end value, the Compound Growth tab derives a future value from an initial value and a rate: Final Value = Initial × (1 + Rate / 100) ^ Periods. Working out what an initial 10,000 becomes after growing 10% a year for five years, and projecting what this month's 5,000 users become after a year of 8% monthly growth, are the exact same problem in formula terms.",
              "So putting a principal amount in the initial value field makes it a compound final-value calculator, while putting in a current business metric: revenue, users, traffic: makes it a growth projection calculator that looks into the future.",
            ],
          },
          {
            heading: "Compound vs. simple growth",
            body: [
              "The key is that each period's growth applies to the accumulated total so far, not the original value. Simple growth adds the same amount each period, but compounding applies the rate to the grown value, so the increase accelerates over time. The longer the horizon and the higher the rate, the more dramatically compound and simple growth diverge.",
              "Enter a negative rate to model compound decline, where the value shrinks by a fixed percentage each period: useful for churn-driven user decline or depreciation scenarios.",
            ],
          },
          {
            heading: "Period units on the Compound Growth tab",
            body: [
              "Any period unit works as long as it matches the rate: use months if your rate is monthly, years if it's annual. Because the same starting value can end up very differently with small changes to rate or periods, entering optimistic, base, and conservative scenarios side by side helps you size the range of outcomes.",
              "A projection assumes a constant rate every period, so if growth varies, split the horizon into segments and calculate each. Everything runs in your browser and your inputs are never sent to a server.",
            ],
          },
        ],
        examples: [
          {
            title: "Turning three years of revenue growth into an annual rate",
            input: "Start 120,000,000 · End 210,000,000 · 3 years (CAGR tab)",
            result: "CAGR about 20.5% (total growth 75%)",
            note: "\"20.5% a year\" compares across time spans in a way that \"75% over three years\" cannot. Check it: multiply 1.205 by itself three times and you get roughly 1.75.",
          },
          {
            title: "Finding the real average behind a volatile run",
            input: "Start 100 · End 100 · 2 years, +100% then −50% (CAGR tab)",
            result: "CAGR 0%",
            note: "Averaging the yearly rates arithmetically gives +25%, yet nothing actually changed. That gap is exactly why growth rates should be averaged with CAGR.",
          },
          {
            title: "The annual rate of a metric that is shrinking",
            input: "Start 50,000 · End 32,000 · 2 years (CAGR tab)",
            result: "CAGR about −20%",
            note: "Declines use the same formula and come out as a negative CAGR, which works just as well for metrics like churn or cancellations where going down is the goal.",
          },
          {
            title: "Projecting revenue five years out at 12% a year",
            input: "Initial 50,000,000 · Rate 12% · 5 periods (Compound Growth tab)",
            result: "About 88,117,000 (roughly 76% total growth)",
            note: "Simple interest would give 50,000,000 × (1 + 0.12 × 5) = 80,000,000. Even at five years the compounding gap is over 8 million.",
          },
          {
            title: "Comparing growth scenarios in a business plan",
            input: "The same initial value at 8% / 12% / 20% (Compound Growth tab)",
            result: "About 73,466,000 / 88,117,000 / 124,416,000 after five periods",
            note: "Lining up conservative, base and aggressive cases makes it obvious which assumption your target number is leaning on.",
          },
        ],
        limitations: [
          "The start value must be greater than zero. With a start of zero or a negative start, End ÷ Start breaks down and CAGR is undefined.",
          "CAGR erases the path in between. Two businesses with identical CAGR may have grown steadily or in a single burst, so it says nothing about volatility.",
          "Years means the number of periods, not the number of calendar years. End of 2023 to end of 2026 is 3; entering 4 throws off both tabs.",
          "The Compound Growth tab assumes the same rate every period. Real businesses see growth change with saturation, new competitors and seasonality, so the error grows sharply the further out you project; treat anything beyond five periods as illustrative.",
          "Both tabs are nominal, with no inflation, currency or tax effects. Convert to a real rate separately when comparing money over long spans or evaluating investment returns.",
        ],
      },
    },
    faq: {
      ko: [
        { question: "CAGR이란 무엇인가요?", answer: "CAGR(Compound Annual Growth Rate)은 연평균 복리 성장률입니다. 시작값에서 종료값까지 매년 동일한 비율로 성장했다면 그 비율이 CAGR입니다." },
        { question: "CAGR과 단순 성장률의 차이는 무엇인가요?", answer: "단순 성장률은 시작과 끝 두 시점만 비교합니다. CAGR은 복리를 적용해 매년 균등한 성장률을 구하므로, 다년간 비교에 더 정확합니다." },
        { question: "CAGR과 복리 성장 탭은 어떻게 다른가요?", answer: "같은 관계식을 반대 방향으로 풉니다. CAGR 탭은 시작값과 종료값을 알 때 연율을 역산하고, 복리 성장 탭은 초기값과 연율을 알 때 미래 값을 구합니다. 알고 있는 것이 무엇이냐에 따라 탭을 고르면 됩니다." },
        { question: "복리 성장 탭으로 미래 예측(성장 시나리오)도 할 수 있나요?", answer: "네. '초기 값' 칸에 현재 매출·사용자 수 같은 지표를 넣으면 성장 예측이 되고, 성장률·기간을 여러 값으로 바꿔가며 낙관·기본·보수 시나리오를 비교할 수 있습니다." },
        { question: "탭을 바꾸면 입력했던 값이 사라지나요?", answer: "네. CAGR 탭은 시작값·종료값·기간을, 복리 성장 탭은 초기값·성장률·기간을 입력받아 필드 구성 자체가 달라 기본값으로 초기화됩니다." },
        { question: "입력한 숫자가 서버로 전송되나요?", answer: "아니요. 모든 계산은 브라우저 안에서 처리되며 입력값은 서버로 전송·저장되지 않습니다." },
      ],
      en: [
        { question: "What does CAGR mean?", answer: "CAGR stands for Compound Annual Growth Rate. It is the constant annual rate at which a value would have grown from the start value to the end value over a given number of years." },
        { question: "How is CAGR different from simple growth rate?", answer: "Simple growth rate compares only two points in time. CAGR compounds the growth evenly across each year, making it more useful for comparing growth over different time periods." },
        { question: "How is the CAGR tab different from the Compound Growth tab?", answer: "They solve the same relationship in opposite directions. The CAGR tab derives an annual rate when you know a start and end value; the Compound Growth tab derives a future value when you know an initial value and a rate. Pick the tab based on what you already know." },
        { question: "Can I use the Compound Growth tab to project a future value or scenario?", answer: "Yes. Put a current metric like revenue or users in the initial value field to get a projection, and vary the rate and periods to compare optimistic, base, and conservative scenarios." },
        { question: "Does switching tabs clear the values I entered?", answer: "Yes. The CAGR tab takes a start value, end value and years, while the Compound Growth tab takes an initial value, rate and periods, so the field set itself changes and resets to defaults." },
        { question: "Are the numbers I enter sent to a server?", answer: "No. Every calculation happens in your browser and your inputs are never uploaded or stored." },
      ],
    },
    og: {
      ko: { title: "CAGR 계산기", subtitle: "연평균 성장률(CAGR)과 복리 미래값 예측을 한 페이지에서" },
      en: { title: "CAGR Calculator", subtitle: "CAGR and compound growth projection in one place" },
    },
  },

  // ── Marketing Calculators ──────────────────
  {
    slug: "ad-budget-pacing-calculator",
    layout: "card",
    cat: "text",
    targets: ["marketer", "small-business-owner", "pm"],
    ico: "pace",
    ready: true,
    indexable: true,
    badge: "Marketing Calculator",
    name: { ko: "광고 예산 페이싱 계산기", en: "Ad Budget Pacing Calculator" },
    relatedTools: ["ad-metrics-calculator", "funnel-conversion-calculator", "growth-rate-calculator"],
    seo: {
      ko: {
        title: "광고 예산 페이싱 계산기 | 광고비 소진율·집행률 확인",
        description:
          "캠페인 기간 진행률과 예산 소진율을 비교해 광고비가 계획보다 빠르게 또는 느리게 집행되고 있는지 즉시 확인합니다. 남은 기간에 필요한 일평균 광고비와 예상 최종 지출액도 함께 계산합니다. 매일·평일 집행 기준 선택 가능. 모든 계산은 브라우저에서만 처리됩니다.",
        keywords: [
          "광고 예산 페이싱 계산기",
          "광고비 소진율 계산",
          "캠페인 예산 계산기",
          "광고 일예산 계산기",
          "광고 예산 진도",
          "광고비 집행률",
        ],
      },
      en: {
        title: "Ad Budget Pacing Calculator | Campaign Budget Burn Rate",
        description:
          "Compare your campaign's time progress with its budget burn rate to instantly see if your ad spend is ahead or behind schedule. Calculates the required daily budget for the remaining period and the projected final spend. Supports daily and weekday-only pacing. Every calculation runs in your browser and the figures you enter are never uploaded.",
        keywords: [
          "ad budget pacing calculator",
          "campaign budget pacing",
          "ad spend pacing calculator",
          "daily ad budget calculator",
          "campaign budget burn rate",
        ],
      },
    },
    content: {
      ko: {
        card: "캠페인 기간 진행률 대비 예산 소진율을 비교해 과다·부족 집행 상태를 즉시 확인.",
        description:
          "캠페인 기간 진행률과 예산 소진율을 비교해 광고비가 계획보다 빠르게 또는 느리게 집행되고 있는지 즉시 확인합니다. 남은 기간에 필요한 일평균 광고비와 예상 최종 지출액도 함께 계산합니다. 매일·평일 집행 기준 선택 가능. 모든 계산은 브라우저에서만 처리됩니다.",
        howItWorks: [
          "총예산·기간·누적 지출액 입력",
          "기간 진행률과 예산 소진율 비교",
          "페이싱 상태와 필요 일평균 광고비 확인",
        ],
        aeo: {
          what: "광고 예산 페이싱 계산기는 캠페인의 기간 진행률과 예산 소진율을 비교해 광고비가 계획 속도로 집행되고 있는지 확인하고, 남은 기간에 필요한 일평균 광고비와 예상 최종 지출액을 계산하는 도구입니다.",
          who: "광고 예산을 관리하는 마케터, 디지털 마케팅을 운영하는 소상공인과 자영업자, 캠페인 ROI를 추적하는 PM을 위한 도구입니다.",
          how: "총예산·시작일·종료일·기준일·누적 지출액을 입력하면 브라우저에서 즉시 기간 진행률, 예산 소진율, 페이싱 차이, 남은 예산, 필요 일평균 광고비를 계산합니다.",
          why: "광고비가 계획보다 빠르게 소진되면 캠페인 후반에 예산이 부족해지고, 너무 느리면 집행 효율이 떨어집니다. 페이싱 계산기로 매일 현황을 파악하면 예산을 최적으로 배분할 수 있습니다.",
        },
        guide: [
          {
            heading: "페이싱이 어긋났다는 걸 왜 중간에 알아야 하는가",
            body: [
              "한 달짜리 캠페인에서 15일째(진행률 50%)에 예산의 70%를 이미 썼다면, 이 상태를 캠페인이 끝난 뒤에야 정산 리포트로 확인하면 손쓸 방법이 없습니다. 페이싱 계산기는 '기간이 얼마나 지났는가'와 '예산을 얼마나 썼는가'라는 서로 다른 두 비율을 매일 비교해, 과다 집행이나 부족 집행을 캠페인이 진행되는 도중에 바로 알 수 있게 합니다.",
              "두 비율의 차이(페이싱 갭)가 크면 클수록 조정이 급합니다. 작은 차이는 자연스러운 요일별 변동일 수 있지만, 두 자릿수 퍼센트 차이는 입찰가나 타겟팅을 바로 점검해야 하는 신호입니다.",
            ],
          },
          {
            heading: "남은 기간의 일평균 광고비를 미리 계산하는 이유",
            body: [
              "과다 집행 상태를 발견했다면 다음 질문은 '남은 기간 동안 하루에 얼마씩 써야 예산을 맞출 수 있는가'입니다. 이 계산기는 남은 예산을 남은 집행일 수로 나눠 그 값을 바로 보여주므로, 캠페인 매니저가 입찰가를 낮추거나 타겟을 좁혀야 하는 정도를 감이 아니라 숫자로 판단할 수 있습니다.",
              "예상 일평균 광고비를 직접 입력하면(예: 프로모션 기간 지출이 늘어날 것을 미리 반영), 그 값을 기준으로 예상 최종 지출액도 함께 계산됩니다.",
            ],
          },
        ],
        examples: [
          {
            title: "캠페인 중반에 과다 집행 확인",
            input: "총예산 10,000,000 · 30일 캠페인 · 15일째 · 누적 지출 7,000,000",
            result: "기간 진행률 50%, 소진율 70%, 페이싱 갭 +20%p (과다 집행)",
            note: "이 시점에 개입하지 않으면 남은 15일 안에 예산이 소진돼 캠페인 후반부 노출이 끊길 수 있습니다. 입찰가를 낮추거나 일예산 상한을 걸어야 하는 신호입니다.",
          },
          {
            title: "남은 기간에 맞춰 하루 예산 재조정",
            input: "남은 예산 3,000,000 · 남은 집행일 15일",
            result: "필요 일평균 광고비 200,000",
            note: "지금까지의 실제 일평균(7,000,000÷15≈467,000)보다 훨씬 낮은 금액입니다. 이 페이스를 유지하도록 캠페인 관리자에서 일예산을 낮춰야 합니다.",
          },
          {
            title: "평일만 집행하는 B2B 캠페인 페이싱",
            input: "30일 캠페인을 평일 집행 기준으로 계산",
            result: "실제 집행일은 30일이 아닌 약 21~22일(평일만)",
            note: "주말에는 노출이 없는 B2B 캠페인처럼 평일만 집행할 때는 이 기준을 선택해야 기간 진행률이 실제 집행 상황과 맞아떨어집니다.",
          },
        ],
        limitations: [
          "평일만 집행 기준을 선택해도 공휴일은 자동으로 제외되지 않습니다. 공휴일에 집행을 멈추는 캠페인이라면 시작일·종료일을 수동으로 조정하거나 결과를 참고치로만 써야 합니다.",
          "예상 최종 지출액은 남은 기간에도 지금까지와 비슷한 페이스로 집행된다는 가정에 기반합니다. 실제로는 요일별·주차별 변동, 예산 소진으로 인한 자동 중단 등으로 달라질 수 있습니다.",
          "이 도구는 예산 소진 속도만 봅니다. ROAS·CPA 같은 성과 효율은 반영하지 않으므로, 예산을 다 썼다고 캠페인이 잘 되고 있다는 뜻은 아닙니다. 성과는 광고 지표 계산기로 별도 확인하세요.",
          "플랫폼(구글 광고·메타 광고 등)이 자체적으로 적용하는 일예산 변동 허용치(하루 최대 2배까지 집행 가능한 정책 등)는 반영하지 않습니다. 실제 플랫폼 리포트의 소진액과 다를 수 있습니다.",
        ],
      },
      en: {
        card: "Compare campaign time progress vs budget burn rate to spot overpacing or underpacing instantly.",
        description:
          "Compare your campaign's time progress with its budget burn rate to instantly see if your ad spend is ahead or behind schedule. Calculates the required daily budget for the remaining period and the projected final spend. Supports daily and weekday-only pacing. Every calculation runs in your browser and the figures you enter are never uploaded.",
        howItWorks: [
          "Enter total budget, campaign dates and spend to date",
          "Compare time progress vs budget burn rate",
          "See pacing status and required daily spend",
        ],
        aeo: {
          what: "Ad Budget Pacing Calculator is a tool that compares your campaign's time elapsed with its budget consumed to tell you whether your ad spend is on track, ahead, or behind schedule, and calculates the daily spend needed for the remaining period.",
          who: "It is for marketers managing ad budgets, small business owners running digital campaigns, and PMs tracking campaign ROI.",
          how: "Enter your total budget, campaign start and end dates, the reference date, and spend to date. The calculator instantly computes time progress, budget burn rate, pacing gap, remaining budget, and required daily spend: all in your browser.",
          why: "If ad spend burns too fast, your campaign runs dry before it ends. Too slow, and you under-deliver. Daily pacing checks let you reallocate budget at the right moment.",
        },
        guide: [
          {
            heading: "Why you need to catch a pacing problem mid-flight",
            body: [
              "If a month-long campaign has burned 70% of its budget by day 15 (50% time progress), finding out from an end-of-campaign report is too late to do anything about it. A pacing calculator compares two different ratios, time elapsed and budget consumed, every day, so you catch overpacing or underpacing while the campaign is still running.",
              "The bigger the gap between the two ratios, the more urgent the fix. A small gap can just be normal day-of-week variance, but a double-digit percentage-point gap is a signal to check bids or targeting right away.",
            ],
          },
          {
            heading: "Why it works out the daily budget needed for what's left",
            body: [
              "Once you've spotted overpacing, the next question is: how much can you spend per day for the rest of the campaign and still land on budget? This calculator divides the remaining budget by the remaining days and shows that number directly, so a campaign manager knows exactly how much to lower bids or narrow targeting instead of guessing.",
              "Enter a custom expected daily spend (say, to account for a promotion period that will spend more), and the projected final spend is calculated against that instead.",
            ],
          },
        ],
        examples: [
          {
            title: "Catching overpacing mid-campaign",
            input: "Total budget 10,000,000 · 30-day campaign · day 15 · spend to date 7,000,000",
            result: "Time progress 50%, burn rate 70%, pacing gap +20pp (overpacing)",
            note: "Without intervention here, the budget runs out well before the remaining 15 days end, cutting off impressions late in the campaign. This is the signal to lower bids or cap the daily budget.",
          },
          {
            title: "Rebalancing the daily budget for what's left",
            input: "Remaining budget 3,000,000 · 15 days remaining",
            result: "Required daily spend 200,000",
            note: "That's well below the actual daily average so far (7,000,000 / 15 ≈ 467,000). The daily budget in the ad platform needs to come down to hold this new pace.",
          },
          {
            title: "Pacing a weekday-only B2B campaign",
            input: "A 30-day campaign calculated on weekday-only pacing",
            result: "Actual running days are about 21-22, not 30 (weekdays only)",
            note: "For a B2B campaign with no weekend delivery, selecting this basis is what makes time progress line up with how the campaign actually runs.",
          },
        ],
        limitations: [
          "Selecting weekday-only pacing does not automatically exclude public holidays. If a campaign pauses on holidays too, adjust the dates manually or treat the result as a rough guide.",
          "Projected final spend assumes the remaining period runs at a similar pace to what's happened so far. Day-of-week or week-to-week variance and automatic pauses from exhausted budgets can change the actual outcome.",
          "This tool only looks at spend velocity. It does not factor in performance metrics like ROAS or CPA, so spending on pace doesn't mean the campaign is performing well. Check performance separately with the Ad Metrics Calculator.",
          "It does not account for a platform's own daily-budget overspend allowance (policies that let Google Ads or Meta Ads spend up to double a daily budget on a given day). Actual platform reports may differ from this result.",
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "기간 진행률과 예산 소진율의 차이는 무엇인가요?",
          answer:
            "기간 진행률은 전체 집행일 중 얼마나 지났는지를 나타내는 시간 기준 비율이고, 예산 소진율은 총예산 중 얼마를 사용했는지를 나타내는 금액 기준 비율입니다. 두 비율의 차이가 페이싱 상태를 결정합니다.",
        },
        {
          question: "시작일과 종료일은 집행일 수에 포함되나요?",
          answer:
            "네, 시작일과 종료일 모두 집행일 수에 포함됩니다. 기준일까지의 경과 집행일 수도 기준일 당일을 포함해 계산합니다.",
        },
        {
          question: "평일만 집행 기준으로 선택하면 어떻게 계산되나요?",
          answer:
            "평일만 옵션을 선택하면 월요일~금요일만 집행일로 계산합니다. 공휴일은 자동으로 제외되지 않습니다. 공휴일을 제외해야 한다면 매뉴얼로 날짜를 조정하거나 집행일 수를 직접 입력해야 합니다.",
        },
        {
          question: "예상 최종 지출액은 어떻게 계산되나요?",
          answer:
            "예상 최종 지출액은 현재 누적 지출액에 예상 일평균 광고비 × 남은 집행일 수를 더해 계산합니다. 예상 일평균 광고비를 별도로 입력하지 않으면 현재까지의 실제 일평균 광고비를 사용합니다.",
        },
        {
          question: "입력한 예산·지출 데이터가 서버로 전송되나요?",
          answer:
            "아니요. 모든 계산은 브라우저에서만 처리됩니다. 입력한 데이터는 어떤 서버에도 전송되거나 저장되지 않습니다.",
        },
      ],
      en: [
        {
          question: "What is the difference between time progress and budget burn rate?",
          answer:
            "Time progress is how far through the campaign period you are (elapsed days ÷ total days). Budget burn rate is how much of the total budget you have spent (spend to date ÷ total budget). The gap between the two is the pacing difference.",
        },
        {
          question: "Are the start date and end date included in the day count?",
          answer:
            "Yes, both the start date and the end date are included in the total day count. The elapsed days up to the reference date also include the reference date itself.",
        },
        {
          question: "How does the weekday-only pacing option work?",
          answer:
            "When you select weekdays only, only Monday through Friday are counted as running days. Public holidays are not automatically excluded. If you need to exclude holidays, adjust the dates manually.",
        },
        {
          question: "How is the projected final spend calculated?",
          answer:
            "Projected final spend = spend to date + (expected daily spend × remaining days). If you do not enter a custom expected daily spend, the calculator uses your current actual daily average (spend to date ÷ elapsed days).",
        },
        {
          question: "Is my budget data sent to a server?",
          answer:
            "No. Every calculation runs entirely in your browser. The budget and spend figures you enter are never uploaded or stored.",
        },
      ],
    },
    og: {
      ko: { title: "광고 예산 페이싱 계산기", subtitle: "기간 진행률 대비 예산 소진율 비교 · 일평균 광고비 역산" },
      en: { title: "Ad Budget Pacing Calculator", subtitle: "Compare time progress vs budget burn rate for your campaign" },
    },
  },
  {
    slug: "ad-metrics-calculator",
    layout: "card",
    cat: "text",
    targets: ["marketer", "small-business-owner", "pm"],
    ico: "ADS",
    ready: true,
    indexable: true,
    badge: "Marketing Calculator",
    name: { ko: "광고 지표 계산기", en: "Ad Metrics Calculator" },
    relatedTools: ["ad-budget-pacing-calculator", "funnel-conversion-calculator", "growth-rate-calculator"],
    seo: {
      ko: {
        title: "광고 지표 계산기 | ROAS·CPA·CPC·CPM·CTR 계산",
        description:
          "탭을 전환해 ROAS·CPA·CPC·CPM·CTR 다섯 개 광고 지표를 한 페이지에서 계산합니다. 정계산은 물론 목표 매출·허용 광고비·예상 전환(클릭·노출) 수·필요 예산까지 역산합니다. 매출총이익률 입력 시 손익분기 ROAS도 함께 계산되며, 모든 계산은 브라우저에서만 처리됩니다.",
        keywords: [
          "광고 지표 계산기", "ROAS 계산기", "CPA 계산기", "CPC 계산기", "CPM 계산기", "CTR 계산기",
          "광고 수익률 계산", "손익분기 ROAS", "return on ad spend calculator",
        ],
      },
      en: {
        title: "Ad Metrics Calculator | ROAS, CPA, CPC, CPM, CTR",
        description:
          "Switch tabs to calculate ROAS, CPA, CPC, CPM, and CTR, five ad metrics, on one page. Beyond the direct calculation, reverse-calculate target revenue, allowable budget, expected conversions (clicks, impressions), or the required budget. Add a gross margin percentage to see break-even ROAS. Every calculation runs in your browser.",
        keywords: [
          "ad metrics calculator", "ROAS calculator", "CPA calculator", "CPC calculator", "CPM calculator", "CTR calculator",
          "return on ad spend calculator", "break even ROAS", "advertising ROI calculator",
        ],
      },
    },
    content: {
      ko: {
        card: "ROAS·CPA·CPC·CPM·CTR을 탭 전환으로 즉시 계산. 역산 모드로 목표 매출·예상 전환·필요 예산까지.",
        description:
          "탭을 전환해 ROAS·CPA·CPC·CPM·CTR 다섯 개 광고 지표를 한 페이지에서 계산합니다. 정계산은 물론 목표 매출·허용 광고비·예상 전환(클릭·노출) 수·필요 예산까지 역산합니다. 매출총이익률 입력 시 손익분기 ROAS도 함께 계산되며, 모든 계산은 브라우저에서만 처리됩니다.",
        howItWorks: [
          "상단 탭에서 지표(ROAS·CPA·CPC·CPM·CTR) 선택",
          "계산 모드(정계산 또는 역산)와 값 입력",
          "결과와 계산식 확인 및 복사",
        ],
        aeo: {
          what: "광고 지표 계산기는 ROAS(광고 수익률)·CPA(전환당 비용)·CPC(클릭당 비용)·CPM(1,000회 노출당 비용)·CTR(클릭률) 다섯 개 광고 지표를 한 페이지에서 계산하는 통합 도구입니다. 각 지표는 정계산뿐 아니라 목표값에서 필요 예산·예상 전환(클릭·노출) 수를 역산하는 모드도 지원합니다.",
          who: "광고 성과를 추적하는 마케터, 디지털 광고를 운영하는 소상공인, 캠페인 예산을 계획하는 PM을 위한 도구입니다.",
          how: "상단 탭에서 지표를 고르고 계산 모드(정계산 또는 역산)를 선택해 값을 입력하면 브라우저 안에서 즉시 결과를 보여줍니다. 지표마다 입력 필드와 공식이 다릅니다.",
          why: "노출→클릭→전환→매출로 이어지는 광고 퍼널의 각 단계를 서로 다른 도구를 오가지 않고 한 페이지에서 확인하고, 목표값에서 예산·전환 수를 역산해 캠페인을 계획할 수 있습니다.",
        },
        guide: [
          {
            heading: "광고 지표 다섯 개를 왜 한 곳에 모았나",
            body: [
              "광고 캠페인은 노출(impression) → 클릭(click) → 전환(conversion) → 매출(revenue)로 이어지는 퍼널을 거칩니다. CPM은 노출 1,000회당 비용, CTR은 노출 대비 클릭 비율, CPC는 클릭 1회당 비용, CPA는 전환 1건당 비용, ROAS는 광고비 대비 매출 비율입니다. 다섯 지표 모두 '비용 ÷ 무언가' 또는 '무언가 ÷ 무언가'라는 같은 형태의 나눗셈이지만, 퍼널의 어느 단계를 보느냐가 다릅니다.",
              "캠페인이 기대만큼 성과가 안 나올 때, 어느 단계가 문제인지 진단하려면 다섯 지표를 나란히 봐야 합니다. CPM은 정상인데 CTR이 낮으면 소재 문제, CTR은 높은데 CPA가 높으면 랜딩페이지나 타겟팅 문제일 가능성이 큽니다.",
            ],
          },
          {
            heading: "ROAS: 광고비 대비 매출",
            body: [
              "ROAS(Return on Ad Spend)는 매출 ÷ 광고비 × 100으로 계산합니다. ROAS 400%는 광고비 1원당 매출 4원이 났다는 뜻입니다. ROAS가 높다고 무조건 이익은 아닙니다: 매출총이익률이 25%라면 손익분기 ROAS는 400%(=100÷마진율)이고, 그보다 높아야 비로소 이익이 남습니다.",
              "정계산 모드는 광고비·매출로 ROAS를 구하고, 역산 모드는 목표 ROAS에서 필요 매출 또는 허용 광고비를 거꾸로 계산합니다.",
            ],
          },
          {
            heading: "CPA: 전환 1건당 비용",
            body: [
              "CPA(Cost Per Acquisition)는 광고비 ÷ 전환 수로 계산합니다. 정계산 모드는 광고비·전환 수로 CPA를 구하고, 역산 모드는 예산과 목표 CPA로 예상 전환 수를, 목표 전환 수와 목표 CPA로 필요 예산을 계산합니다.",
              "CPA는 '전환'을 무엇으로 정의하느냐에 따라 값이 크게 달라집니다. 구매·회원가입·장바구니 담기 중 어느 것을 전환으로 잡았는지 캠페인 간 비교 전에 반드시 확인하세요.",
            ],
          },
          {
            heading: "CPC: 클릭 1회당 비용",
            body: [
              "CPC(Cost Per Click)는 광고비 ÷ 클릭 수로 계산합니다. 검색·디스플레이 광고의 입찰 기준으로 가장 흔히 쓰이는 지표입니다. 역산 모드는 예산과 목표 CPC로 예상 클릭 수를, 목표 클릭 수와 목표 CPC로 필요 예산을 계산합니다.",
              "CPC만 낮다고 좋은 캠페인은 아닙니다. 클릭이 저렴해도 전환으로 이어지지 않으면 CPA가 오히려 높아질 수 있으므로 CPC와 CPA를 함께 보는 편이 안전합니다.",
            ],
          },
          {
            heading: "CPM: 노출 1,000회당 비용",
            body: [
              "CPM(Cost Per Mille)은 광고비 ÷ 노출 수 × 1,000으로 계산합니다. 클릭이 아니라 노출 자체를 사는 브랜드 인지도 캠페인에서 주로 쓰이는 단가 기준입니다. 역산 모드는 예산과 목표 CPM으로 예상 노출 수를, 목표 노출 수와 목표 CPM으로 필요 예산을 계산합니다.",
              "CPM이 낮다고 항상 유리하지는 않습니다. 타겟이 넓을수록 CPM은 낮아지는 경향이 있지만, 캠페인 목적과 무관한 노출이 섞이면 다른 지표(CTR·CPA)가 오히려 나빠질 수 있습니다.",
            ],
          },
          {
            heading: "CTR: 노출 대비 클릭 비율",
            body: [
              "CTR(Click-Through Rate)은 클릭 수 ÷ 노출 수 × 100으로 계산합니다. 소재·카피가 타겟에게 얼마나 매력적으로 보이는지 가늠하는 지표입니다. 역산 모드는 노출 수와 목표 CTR로 필요 클릭 수를, 클릭 수와 목표 CTR로 필요 노출 수를 계산합니다.",
              "클릭 수가 노출 수보다 많으면 계산기가 경고를 표시합니다. 트래킹 중복 집계나 측정 기준 불일치로 흔히 발생하는 오류이니 데이터 소스를 다시 확인하세요.",
            ],
          },
        ],
        examples: [
          {
            title: "캠페인 ROAS 계산",
            input: "광고비 3,000,000 · 광고 매출 12,600,000 (ROAS 탭)",
            result: "ROAS 420%",
            note: "광고비 1원당 매출 4.2원이라는 뜻입니다. ROAS는 매출 기준이라 원가와 수수료를 빼기 전 숫자이며, 이 값만으로는 흑자인지 알 수 없습니다.",
          },
          {
            title: "목표 매출에서 허용 광고비 역산",
            input: "목표 매출 50,000,000 · 목표 ROAS 500% (ROAS 탭, 역산 모드)",
            result: "허용 광고비 10,000,000",
            note: "월 예산을 짤 때 쓰는 방향입니다. 목표 ROAS를 마진율에서 먼저 정하고, 거기서 쓸 수 있는 광고비를 도출하는 순서가 안전합니다.",
          },
          {
            title: "회원가입 캠페인의 CPA 확인",
            input: "광고비 2,000,000 · 전환(가입) 수 400건 (CPA 탭)",
            result: "CPA 5,000",
            note: "전환 1건을 얻는 데 5,000원이 들었다는 뜻입니다. 예산으로 예상 전환 수를 미리 가늠하려면 역산 모드에서 목표 CPA를 넣으면 됩니다.",
          },
          {
            title: "입찰가 조정을 위한 CPC 확인",
            input: "광고비 300,000 · 클릭 수 1,500회 (CPC 탭)",
            result: "CPC 200",
            note: "클릭 1회당 200원입니다. 목표 CPC와 예산을 넣으면 그 예산으로 얻을 수 있는 예상 클릭 수를 역산할 수 있습니다.",
          },
          {
            title: "브랜드 캠페인의 CPM 확인",
            input: "광고비 500,000 · 노출 수 2,000,000회 (CPM 탭)",
            result: "CPM 250",
            note: "노출 1,000회당 250원입니다. 노출 목표를 먼저 정했다면 역산 모드에서 목표 노출 수와 목표 CPM으로 필요 예산을 먼저 계산해 볼 수 있습니다.",
          },
          {
            title: "소재 성과 비교를 위한 CTR 확인",
            input: "클릭 수 2,500회 · 노출 수 100,000회 (CTR 탭)",
            result: "CTR 2.5%",
            note: "노출 100회당 2.5회 클릭이 났다는 뜻입니다. 여러 소재의 CTR을 나란히 비교하면 어떤 카피·이미지가 더 반응이 좋은지 판단할 수 있습니다.",
          },
          {
            title: "손익분기 ROAS로 흑자 여부 판단",
            input: "기여이익률 25% (ROAS 탭)",
            result: "손익분기 ROAS 400%",
            note: "손익분기 ROAS = 100 ÷ 기여이익률입니다. 마진이 25%면 400%를 넘어야 본전이므로, 첫 번째 예시의 420%는 겨우 흑자 구간입니다.",
          },
        ],
        limitations: [
          "ROAS·CPA는 매출·전환 기준 지표입니다. 원가·배송비·결제 수수료·반품을 반영하지 않으므로, 수익성 판단에는 기여이익률과 손익분기 ROAS를 함께 봐야 합니다.",
          "광고 매출·전환은 플랫폼이 자기 기여로 집계한 값입니다. 기여 기간(attribution window) 설정에 따라 같은 캠페인의 ROAS·CPA가 크게 달라지며, 여러 채널을 단순 합산하면 같은 주문·전환이 중복 계상됩니다.",
          "신규 고객 획득 캠페인은 첫 구매만으로 ROAS·CPA를 평가하면 낮게(나쁘게) 나옵니다. 재구매가 있는 사업이라면 고객 생애 가치(LTV) 기준으로 함께 판단해야 합니다.",
          "다섯 지표는 퍼널의 서로 다른 단계를 보므로, 하나만 보고 캠페인 전체를 판단할 수 없습니다. CPM·CTR·CPC가 모두 좋아도 CPA·ROAS가 나쁘면 랜딩페이지나 타겟팅 문제일 수 있습니다.",
          "브랜드 검색처럼 광고가 없어도 발생했을 매출·전환은 걷어내지 않습니다. 증분 효과를 보려면 캠페인을 끄고 비교하는 실험이 필요합니다.",
        ],
      },
      en: {
        card: "Calculate ROAS, CPA, CPC, CPM and CTR by tab. Reverse modes for target revenue, expected conversions, and required budget.",
        description:
          "Switch tabs to calculate ROAS, CPA, CPC, CPM, and CTR, five ad metrics, on one page. Beyond the direct calculation, reverse-calculate target revenue, allowable budget, expected conversions (clicks, impressions), or the required budget. Add a gross margin percentage to see break-even ROAS. Every calculation runs in your browser.",
        howItWorks: [
          "Pick a metric from the tabs (ROAS, CPA, CPC, CPM, CTR)",
          "Choose a calculation mode (direct or reverse) and enter values",
          "See the result and formula, and copy it",
        ],
        aeo: {
          what: "Ad Metrics Calculator is a unified tool that computes five advertising metrics on one page: ROAS (return on ad spend), CPA (cost per acquisition), CPC (cost per click), CPM (cost per 1,000 impressions), and CTR (click-through rate). Each metric supports both a direct calculation and reverse modes that derive the required budget or expected conversions (clicks, impressions) from a target.",
          who: "It is for marketers tracking ad performance, small business owners running digital ads, and PMs planning campaign budgets.",
          how: "Pick a metric from the tabs, choose a calculation mode (direct or reverse), and enter the values it needs; the result appears instantly in your browser. Each metric has its own inputs and formula.",
          why: "It lets you check every stage of the impression-to-click-to-conversion-to-revenue funnel on one page instead of hopping between tools, and reverse-calculate budget or expected conversions from a target to plan a campaign.",
        },
        guide: [
          {
            heading: "Why five ad metrics live on one page",
            body: [
              "An ad campaign runs through a funnel: impression, click, conversion, revenue. CPM is cost per 1,000 impressions, CTR is clicks relative to impressions, CPC is cost per click, CPA is cost per conversion, and ROAS is revenue relative to ad spend. All five reduce to the same shape of division, cost divided by something, or something divided by something, but each looks at a different stage of the funnel.",
              "When a campaign underperforms, diagnosing which stage is the problem means looking at all five side by side. Normal CPM with low CTR points to a creative problem; high CTR with high CPA more often points to the landing page or targeting.",
            ],
          },
          {
            heading: "ROAS: revenue relative to ad spend",
            body: [
              "ROAS (Return on Ad Spend) is Revenue / Ad Spend x 100. A ROAS of 400% means every 1 spent produced 4 in revenue. A high ROAS isn't automatically profitable: at a 25% gross margin, break-even ROAS is 400% (= 100 / margin), and you only profit above that.",
              "The direct mode turns ad spend and revenue into ROAS; the reverse mode derives the required revenue or allowable ad spend from a target ROAS.",
            ],
          },
          {
            heading: "CPA: cost per conversion",
            body: [
              "CPA (Cost Per Acquisition) is Ad Spend / Conversions. The direct mode turns ad spend and conversions into CPA; the reverse modes derive expected conversions from a budget and target CPA, or the required budget from a target conversion count and target CPA.",
              "CPA shifts a lot depending on what counts as a \"conversion\": purchase, sign-up, or add-to-cart. Confirm which definition each campaign is using before comparing CPA across them.",
            ],
          },
          {
            heading: "CPC: cost per click",
            body: [
              "CPC (Cost Per Click) is Ad Spend / Clicks, the most common bidding basis for search and display ads. The reverse modes derive expected clicks from a budget and target CPC, or the required budget from a target click count and target CPC.",
              "A low CPC alone doesn't make a good campaign. Cheap clicks that don't convert can still push CPA up, so it's safer to read CPC alongside CPA.",
            ],
          },
          {
            heading: "CPM: cost per 1,000 impressions",
            body: [
              "CPM (Cost Per Mille) is Ad Spend / Impressions x 1,000, the usual pricing basis for brand-awareness campaigns that buy impressions rather than clicks. The reverse modes derive expected impressions from a budget and target CPM, or the required budget from a target impression count and target CPM.",
              "A low CPM isn't always favorable. Broader targeting tends to lower CPM, but if the extra impressions are irrelevant to the campaign's goal, other metrics like CTR or CPA can get worse instead.",
            ],
          },
          {
            heading: "CTR: clicks relative to impressions",
            body: [
              "CTR (Click-Through Rate) is Clicks / Impressions x 100, a read on how compelling the creative and copy are to the target audience. The reverse modes derive the required clicks from an impression count and target CTR, or the required impressions from a click count and target CTR.",
              "If clicks exceed impressions, the calculator shows a warning. That usually means duplicate tracking or mismatched measurement sources, so double-check the data source.",
            ],
          },
        ],
        examples: [
          {
            title: "Calculating campaign ROAS",
            input: "Ad spend 3,000,000 · Attributed revenue 12,600,000 (ROAS tab)",
            result: "ROAS 420%",
            note: "That is 4.2 in revenue per 1 spent. ROAS is a revenue figure taken before cost of goods and fees, so on its own it does not tell you whether the campaign made money.",
          },
          {
            title: "Working backwards from a revenue target to an allowable budget",
            input: "Target revenue 50,000,000 · Target ROAS 500% (ROAS tab, reverse mode)",
            result: "Allowable ad spend 10,000,000",
            note: "This is the direction to use when planning a monthly budget: set the target ROAS from your margin first, then derive the spend it allows.",
          },
          {
            title: "Checking CPA for a sign-up campaign",
            input: "Ad spend 2,000,000 · Conversions (sign-ups) 400 (CPA tab)",
            result: "CPA 5,000",
            note: "Each conversion cost 5,000. To gauge expected conversions from a budget ahead of time, use the reverse mode with a target CPA.",
          },
          {
            title: "Checking CPC to adjust a bid",
            input: "Ad spend 300,000 · Clicks 1,500 (CPC tab)",
            result: "CPC 200",
            note: "Each click cost 200. Enter a target CPC and budget to reverse-calculate the expected clicks that budget would buy.",
          },
          {
            title: "Checking CPM for a brand campaign",
            input: "Ad spend 500,000 · Impressions 2,000,000 (CPM tab)",
            result: "CPM 250",
            note: "That's 250 per 1,000 impressions. If you set an impression target first, use the reverse mode with a target impression count and target CPM to work out the required budget.",
          },
          {
            title: "Comparing creative performance with CTR",
            input: "Clicks 2,500 · Impressions 100,000 (CTR tab)",
            result: "CTR 2.5%",
            note: "That's 2.5 clicks per 100 impressions. Comparing CTR across creatives side by side shows which copy or image resonates more.",
          },
          {
            title: "Using break-even ROAS to judge profitability",
            input: "Contribution margin 25% (ROAS tab)",
            result: "Break-even ROAS 400%",
            note: "Break-even ROAS = 100 / contribution margin. At a 25% margin you need to clear 400% just to break even, so the 420% in the first example is barely profitable.",
          },
        ],
        limitations: [
          "ROAS and CPA are measured on revenue and conversions. They ignore cost of goods, shipping, payment fees and returns, so profitability decisions need contribution margin and break-even ROAS alongside them.",
          "Attributed revenue and conversions are whatever the ad platform claims credit for. The attribution window can move the same campaign's ROAS or CPA substantially, and simply adding totals across channels double-counts the same orders or conversions.",
          "Prospecting campaigns look weak (a low ROAS, a high CPA) when judged on the first purchase alone. If customers buy again, evaluate against lifetime value as well.",
          "The five metrics look at different stages of the funnel, so no single one judges a whole campaign. Good CPM, CTR and CPC alongside a bad CPA or ROAS usually points to the landing page or targeting instead.",
          "None of them strip out revenue or conversions that would have happened anyway, such as branded search. Measuring incrementality requires an experiment that turns the campaign off.",
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "다섯 개 지표를 각각 다른 페이지에서 찾아야 하나요?",
          answer:
            "아니요. 상단 탭에서 ROAS·CPA·CPC·CPM·CTR 중 원하는 지표를 누르면 같은 페이지 안에서 바로 전환됩니다. URL은 ?mode= 쿼리로 현재 선택한 지표를 반영하지만, 검색 색인용 대표 URL(canonical)은 항상 /ad-metrics-calculator 하나입니다.",
        },
        {
          question: "ROAS와 ROI의 차이는 무엇인가요?",
          answer:
            "ROAS는 광고비 대비 매출만 비교하는 단순 지표입니다. ROI(Return on Investment)는 광고비 외에 제조원가·운영비 등 전체 비용을 고려한 순이익 기준 지표입니다. 광고 효율만 빠르게 비교할 때는 ROAS를, 전체 사업 수익성을 볼 때는 ROI를 사용합니다.",
        },
        {
          question: "CPA·CPC·CPM은 서로 어떻게 다른가요?",
          answer:
            "셋 다 '광고비 ÷ 무언가'지만 나누는 대상이 다릅니다. CPC는 클릭 수, CPM은 노출 수(1,000회 단위), CPA는 전환 수로 나눕니다. 광고 퍼널에서 노출·클릭·전환 중 어느 단계의 비용 효율을 보고 싶은지에 따라 골라 쓰면 됩니다.",
        },
        {
          question: "손익분기 ROAS는 어떻게 계산하나요?",
          answer:
            "손익분기 ROAS = 100 ÷ 매출총이익률(소수)로 계산합니다. 예를 들어 매출총이익률이 30%이면 손익분기 ROAS는 100 ÷ 0.3 = 333.33%입니다. 이 값 이상의 ROAS를 달성해야 광고비를 제외하고도 이익이 발생합니다.",
        },
        {
          question: "탭을 바꾸면 계산 모드와 값이 초기화되나요?",
          answer:
            "네. 지표마다 입력 필드 구성과 기본값이 달라 탭을 바꾸면 계산 모드(A/B/C)와 입력값이 그 지표의 기본값으로 초기화됩니다. 통화 설정은 유지됩니다.",
        },
        {
          question: "CTR 탭에서 클릭 수가 노출 수보다 많다는 경고가 뜨는 이유는 무엇인가요?",
          answer:
            "클릭 수가 노출 수를 넘는 것은 정상적인 상황이 아닙니다. 서로 다른 트래킹 도구의 중복 집계나 측정 기준(예: 고유 클릭 vs 전체 클릭) 불일치로 흔히 발생하니, 데이터 소스를 다시 확인하세요.",
        },
        {
          question: "입력한 광고비와 매출 데이터가 서버로 전송되나요?",
          answer:
            "아니요. 모든 계산은 브라우저에서만 처리됩니다. 입력한 데이터는 어떤 서버에도 전송되거나 저장되지 않습니다.",
        },
      ],
      en: [
        {
          question: "Do I need to visit a different page for each of the five metrics?",
          answer:
            "No. Click ROAS, CPA, CPC, CPM, or CTR in the tabs above and it switches instantly on the same page. The URL reflects the current metric via a ?mode= query, but the canonical URL used for search indexing is always the single /ad-metrics-calculator.",
        },
        {
          question: "What is the difference between ROAS and ROI?",
          answer:
            "ROAS only compares ad revenue to ad spend. ROI (Return on Investment) factors in all costs: cost of goods, operations, etc., and measures net profit. Use ROAS for a quick read on ad efficiency; use ROI for overall profitability.",
        },
        {
          question: "How are CPA, CPC, and CPM different from each other?",
          answer:
            "All three are \"ad spend divided by something,\" just a different something: CPC divides by clicks, CPM by impressions (in units of 1,000), and CPA by conversions. Pick whichever matches the funnel stage, impressions, clicks, or conversions, whose cost efficiency you want to see.",
        },
        {
          question: "How is break-even ROAS calculated?",
          answer:
            "Break-even ROAS = 100 / gross margin (as a decimal). For example, a 30% gross margin gives a break-even ROAS of 100 / 0.3 = 333.33%. You need to achieve at least this ROAS for ads to be profitable after accounting for cost of goods.",
        },
        {
          question: "Does switching tabs reset the calculation mode and values?",
          answer:
            "Yes. Each metric has its own set of fields and defaults, so switching tabs resets the calculation mode (A/B/C) and inputs to that metric's defaults. Your currency setting is kept.",
        },
        {
          question: "Why does the CTR tab warn that clicks exceed impressions?",
          answer:
            "Clicks outnumbering impressions isn't a normal state. It usually comes from duplicate counting across tracking tools or a mismatch in measurement definitions (say, unique clicks vs. all clicks), so double-check the data source.",
        },
        {
          question: "Is my ad spend and revenue data sent to a server?",
          answer:
            "No. Every calculation runs entirely in your browser. The budget and spend figures you enter are never uploaded or stored.",
        },
      ],
    },
    og: {
      ko: { title: "광고 지표 계산기", subtitle: "ROAS·CPA·CPC·CPM·CTR을 한 페이지에서 계산" },
      en: { title: "Ad Metrics Calculator", subtitle: "ROAS, CPA, CPC, CPM and CTR in one place" },
    },
  },
  {
    slug: "funnel-conversion-calculator",
    layout: "card",
    cat: "text",
    targets: ["marketer", "pm", "small-business-owner"],
    ico: "⇢%",
    ready: true,
    indexable: true,
    badge: "Marketing Calculator",
    name: { ko: "퍼널 전환율 계산기", en: "Funnel Conversion Calculator" },
    relatedTools: ["ad-metrics-calculator", "ad-budget-pacing-calculator", "growth-rate-calculator"],
    seo: {
      ko: {
        title: "퍼널 전환율 계산기 | 마케팅 퍼널 분석·목표 역산",
        description:
          "마케팅 퍼널 단계별 전환율과 이탈률을 계산하고, 최종 목표 전환 수를 달성하기 위해 각 상위 단계에서 필요한 수량을 역산합니다. 광고·리드·커머스 퍼널 프리셋 포함. 단계 추가·삭제·이름 변경 가능. 모든 계산은 브라우저에서만 처리됩니다.",
        keywords: [
          "퍼널 전환율 계산기",
          "마케팅 퍼널 계산",
          "전환율 역산",
          "목표 전환 수 계산",
          "퍼널 이탈률",
          "필요 트래픽 계산",
        ],
      },
      en: {
        title: "Funnel Conversion Calculator | Marketing Funnel Analysis & Reverse Planning",
        description:
          "Calculate stage-by-stage conversion rates and drop-off rates for your marketing funnel, then reverse-calculate how many visitors you need at each stage to hit your final conversion target. Includes ad, lead, and commerce funnel presets. Add, remove, and rename stages freely. Everything runs in your browser.",
        keywords: [
          "funnel conversion calculator",
          "reverse funnel calculator",
          "conversion funnel planner",
          "required traffic calculator",
          "funnel drop off calculator",
          "marketing funnel calculator",
        ],
      },
    },
    content: {
      ko: {
        card: "마케팅 퍼널 단계별 전환율·이탈률 분석과 목표 달성을 위한 필요 트래픽 역산.",
        description:
          "마케팅 퍼널 단계별 전환율과 이탈률을 계산하고, 최종 목표 전환 수를 달성하기 위해 각 상위 단계에서 필요한 수량을 역산합니다. 광고·리드·커머스 퍼널 프리셋 포함. 단계 추가·삭제·이름 변경 가능. 모든 계산은 브라우저에서만 처리됩니다.",
        howItWorks: [
          "퍼널 단계와 각 단계 수량 입력(또는 프리셋 선택)",
          "단계별 전환율·이탈률 즉시 확인",
          "목표 역산 모드로 필요 트래픽 계획",
        ],
        aeo: {
          what: "퍼널 전환율 계산기는 마케팅 퍼널의 단계별 전환율·이탈률을 계산하고, 목표 최종 전환 수를 달성하기 위해 각 상위 단계에서 필요한 수량을 역산하는 도구입니다.",
          who: "마케팅 퍼널을 분석하고 최적화하는 마케터, 전환율을 개선하려는 PM, 온라인 판매 전환율을 파악하려는 소상공인을 위한 도구입니다.",
          how: "퍼널 단계 이름과 각 단계 수량을 입력하면 단계별 전환율·이탈률과 전체 전환율이 즉시 계산됩니다. 목표 역산 모드에서는 최종 목표 수량과 단계별 예상 전환율을 입력하면 각 상위 단계에서 필요한 수량을 계산합니다.",
          why: "퍼널 분석으로 가장 많은 이탈이 발생하는 구간을 파악하면 개선 우선순위를 정할 수 있습니다. 목표 역산으로 필요 트래픽을 미리 계획하면 광고 예산도 더 정확하게 설정할 수 있습니다.",
        },
        guide: [
          {
            heading: "전체 전환율 하나만 보면 놓치는 것",
            body: [
              "\"방문자의 2%가 구매로 이어진다\"는 전체 전환율은 어디를 고쳐야 할지 알려주지 않습니다. 방문 → 장바구니 → 결제 시작 → 구매 4단계 퍼널에서 전체가 2%인 이유가 방문에서 장바구니로 넘어가는 첫 단계 때문인지, 결제 시작 직전 이탈 때문인지에 따라 손봐야 할 지점이 완전히 다릅니다.",
              "이 계산기는 인접한 두 단계 사이의 전환율·이탈률을 각각 계산해 보여주므로, 전체 숫자 하나가 아니라 어느 구간에서 사람이 가장 많이 빠져나가는지 바로 짚어낼 수 있습니다.",
            ],
          },
          {
            heading: "목표 역산: 결과에서 거꾸로 필요한 트래픽을 구하기",
            body: [
              "일반 모드가 '지금 수치로 전환율이 얼마인가'를 계산한다면, 목표 역산 모드는 반대 방향입니다. '이번 달 구매 100건을 만들려면 방문자가 몇 명 필요한가'처럼, 각 단계의 예상 전환율을 알고 있을 때 최종 목표에서 거슬러 올라가며 상위 단계마다 필요한 수량을 계산합니다.",
              "이전 단계 필요 수량 = ceil(다음 단계 목표 수량 ÷ 전환율)로, 목표에 못 미치는 일이 없도록 항상 올림 처리합니다. 캠페인을 시작하기 전에 필요한 트래픽 규모를 먼저 가늠하고, 여기서 나온 방문자 수를 광고 예산 계획의 출발점으로 쓸 수 있습니다.",
            ],
          },
          {
            heading: "퍼널 프리셋과 단계 커스터마이징",
            body: [
              "광고·리드·커머스처럼 자주 쓰는 퍼널 구조는 프리셋으로 바로 불러올 수 있고, 단계 이름과 개수(최소 2~최대 10단계)는 자유롭게 바꿀 수 있어 실제 사업 구조에 맞춰 조정할 수 있습니다. 다음 단계 수가 이전 단계보다 많이 나오는 경우(리타겟팅 유입, 중복 이벤트 등)에는 경고를 표시하되 계산 자체는 막지 않습니다.",
            ],
          },
        ],
        examples: [
          {
            title: "이커머스 퍼널에서 이탈 구간 찾기",
            input: "방문 10,000 → 장바구니 2,000 → 결제시작 800 → 구매 500",
            result: "방문→장바구니 20%, 장바구니→결제시작 40%, 결제시작→구매 62.5%, 전체 5%",
            note: "가장 큰 이탈은 방문에서 장바구니로 넘어가는 첫 구간(80% 이탈)입니다. 결제 단계보다 상품 페이지나 첫인상 개선이 우선순위임을 알 수 있습니다.",
          },
          {
            title: "이번 달 리드 100건 목표에서 필요 방문자 역산",
            input: "목표 리드 100건, 방문→리드폼 조회 30%, 리드폼 조회→제출 25%",
            result: "리드폼 조회 필요 334명, 방문 필요 1,113명",
            note: "역산 모드로 캠페인 시작 전에 필요한 트래픽 규모를 먼저 파악해, 이 방문자 수를 만들려면 광고 예산이 얼마나 필요한지 역으로 계획할 수 있습니다.",
          },
          {
            title: "리타겟팅 유입으로 다음 단계가 더 많아진 경우",
            input: "1단계 방문 500 → 2단계 재방문(리타겟팅 포함) 620",
            result: "전환율 124%, 경고 표시",
            note: "정상적인 퍼널이라면 하위 단계로 갈수록 줄어들지만, 리타겟팅 광고로 재유입된 사용자가 섞이면 이런 역전이 나타날 수 있습니다. 계산은 그대로 진행되고 경고만 표시됩니다.",
          },
        ],
        limitations: [
          "입력한 각 단계 수치를 그대로 신뢰합니다. 서로 다른 도구(광고 플랫폼·GA4·자체 DB)에서 가져온 숫자를 섞으면 집계 기준 차이로 전환율이 왜곡될 수 있습니다.",
          "목표 역산은 각 단계 전환율이 앞으로도 동일하게 유지된다는 가정입니다. 실제로는 트래픽 규모가 커지면 전환율이 낮아지는 경우가 많아(예: 리타겟팅 풀 소진), 역산 결과는 상한선이 아니라 참고치로 봐야 합니다.",
          "기간 개념이 없습니다. 이번 달 100건 목표처럼 기간 안에 트래픽을 어떻게 배분할지는 계산하지 않고, 전체 필요 수량만 보여줍니다.",
          "단계 정의(예: '리드'가 폼 제출인지 상담 신청인지)는 직접 일관되게 유지해야 합니다. 도구가 단계 이름의 의미를 검증하지는 않습니다.",
        ],
      },
      en: {
        card: "Analyze stage-by-stage conversion and drop-off rates for your funnel, then reverse-calculate required traffic.",
        description:
          "Calculate stage-by-stage conversion rates and drop-off rates for your marketing funnel, then reverse-calculate how many visitors you need at each stage to hit your final conversion target. Includes ad, lead, and commerce funnel presets. Add, remove, and rename stages freely. Everything runs in your browser.",
        howItWorks: [
          "Enter funnel stages and counts (or choose a preset)",
          "See stage-by-stage conversion and drop-off rates instantly",
          "Switch to reverse mode to plan required traffic",
        ],
        aeo: {
          what: "Funnel Conversion Calculator is a tool that computes stage-by-stage conversion rates and drop-off rates for a marketing funnel, and reverse-calculates the number of visitors needed at each upper stage to hit a final conversion target.",
          who: "It is for marketers analyzing and optimizing funnels, PMs improving conversion rates, and small business owners understanding their online sales funnel.",
          how: "Enter stage names and counts. The calculator instantly shows conversion rate, drop-off rate, and drop-off count for each step, plus the overall conversion rate. Switch to reverse mode, enter a final target and stage conversion rates, and it calculates how many visitors you need at every stage.",
          why: "Funnel analysis pinpoints where most visitors drop off, letting you prioritize improvements. Reverse-calculating required traffic helps you set realistic ad budgets before a campaign launches.",
        },
        guide: [
          {
            heading: "What a single overall conversion rate hides",
            body: [
              "\"2% of visitors convert to a purchase\" doesn't tell you what to fix. In a 4-stage funnel (visit, cart, checkout start, purchase), that 2% overall figure could come from a weak first step (visit to cart) or from people abandoning right before checkout, and the fix is completely different depending on which.",
              "This calculator computes the conversion and drop-off rate between each pair of adjacent stages, so instead of one aggregate number, you can point directly at where the most people are actually leaving.",
            ],
          },
          {
            heading: "Reverse mode: working backward from a result to required traffic",
            body: [
              "Where the normal mode answers \"what's my conversion rate right now,\" reverse mode runs the other direction. Given expected conversion rates at each stage, it answers something like \"how many visitors do I need to land 100 purchases this month,\" walking backward from the final target to the count needed at every stage above it.",
              "Required count at the previous stage = ceil(next stage's target / conversion rate), always rounded up so you never fall short of the target. Use it before a campaign launches to gauge the traffic scale you'll need, and treat that visitor count as the starting point for an ad budget plan.",
            ],
          },
          {
            heading: "Funnel presets and customizing stages",
            body: [
              "Common funnel shapes, ad, lead, and commerce, load instantly as presets, and stage names and count (2 to 10 stages) are fully editable to match how your business actually works. If a later stage comes out higher than the one before it (retargeting inflow, duplicate events, and so on), the calculator shows a warning but still runs the calculation.",
            ],
          },
        ],
        examples: [
          {
            title: "Finding the drop-off point in an e-commerce funnel",
            input: "Visit 10,000 → Cart 2,000 → Checkout start 800 → Purchase 500",
            result: "Visit→Cart 20%, Cart→Checkout 40%, Checkout→Purchase 62.5%, overall 5%",
            note: "The biggest drop-off is the first step, visit to cart (80% lost). That means the product page or first impression needs attention before the checkout flow does.",
          },
          {
            title: "Reverse-calculating visitors needed for 100 leads this month",
            input: "Target 100 leads, visit→form view 30%, form view→submit 25%",
            result: "334 form views needed, 1,113 visits needed",
            note: "Reverse mode surfaces the traffic scale you need before a campaign starts, letting you plan an ad budget backward from that visitor count.",
          },
          {
            title: "A later stage coming out higher due to retargeting inflow",
            input: "Stage 1 visits 500 → Stage 2 return visits (including retargeting) 620",
            result: "Conversion rate 124%, flagged with a warning",
            note: "A normal funnel shrinks at each stage, but mixing in users who returned via a retargeting ad can invert that. The calculation still runs; it's just flagged.",
          },
        ],
        limitations: [
          "It trusts the numbers you enter at each stage as-is. Mixing figures pulled from different tools (an ad platform, GA4, an internal database) can distort the rates if their counting definitions differ.",
          "Reverse calculation assumes each stage's conversion rate stays constant going forward. In practice, rates often drop as traffic scales up (a retargeting pool running dry, for example), so treat the result as a reference, not a hard ceiling.",
          "There is no concept of a time period. It shows the total traffic needed, not how to spread that traffic across a period like \"this month.\"",
          "You are responsible for keeping stage definitions consistent (whether \"lead\" means a form submission or a consultation request, for instance). The tool does not validate what a stage name actually means.",
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "단계 전환율과 전체 전환율의 차이는 무엇인가요?",
          answer:
            "단계 전환율은 인접한 두 단계 사이의 전환율(다음 단계 수 ÷ 이전 단계 수 × 100)이고, 전체 전환율은 첫 번째 단계부터 마지막 단계까지의 전환율(마지막 단계 수 ÷ 첫 번째 단계 수 × 100)입니다.",
        },
        {
          question: "퍼널 단계 이름을 변경하거나 단계를 추가·삭제할 수 있나요?",
          answer:
            "네. 단계 이름은 직접 수정할 수 있고, 단계 추가와 삭제 버튼으로 단계 수를 조절할 수 있습니다. 최소 2단계, 최대 10단계를 지원합니다.",
        },
        {
          question: "목표 역산 모드는 어떻게 계산하나요?",
          answer:
            "마지막 단계(목표 전환 수)부터 역순으로 계산합니다. 이전 단계 필요 수량 = ceil(다음 단계 목표 수량 ÷ 전환율)로 계산합니다. 달성에 필요한 수량이 부족하지 않도록 올림(ceil) 처리합니다.",
        },
        {
          question: "다음 단계 수량이 이전 단계보다 클 수 있나요?",
          answer:
            "일반적으로 퍼널에서는 다음 단계로 내려갈수록 수량이 감소합니다. 다만 리타겟팅·중복 이벤트·측정 기준 차이 등으로 이런 현상이 나타날 수 있으며, 이 경우 경고를 표시하되 계산은 허용합니다.",
        },
        {
          question: "입력한 데이터가 서버로 전송되나요?",
          answer:
            "아니요. 모든 계산은 브라우저에서만 처리됩니다. 입력한 데이터는 어떤 서버에도 전송되거나 저장되지 않습니다.",
        },
      ],
      en: [
        {
          question: "What is the difference between stage conversion rate and overall conversion rate?",
          answer:
            "Stage conversion rate is the rate between two adjacent stages (next stage count ÷ previous stage count × 100). Overall conversion rate is from the very first stage to the last (last stage count ÷ first stage count × 100).",
        },
        {
          question: "Can I rename stages or add and remove them?",
          answer:
            "Yes. Edit stage names directly in the input fields, and use the add and remove buttons to adjust the number of stages. The calculator supports 2 to 10 stages.",
        },
        {
          question: "How does the reverse calculation mode work?",
          answer:
            "Starting from the last stage (target conversions), it calculates backwards: required count at previous stage = ceil(next stage target ÷ conversion rate). Ceil (round up) is used to ensure you never fall short of the target.",
        },
        {
          question: "Can a lower stage have more visitors than the stage above it?",
          answer:
            "Normally, visitor counts decrease at each funnel stage. However, retargeting, duplicate events, or different measurement standards can cause this. The calculator allows it but shows a warning.",
        },
        {
          question: "Is my data sent to a server?",
          answer:
            "No. Every calculation runs entirely in your browser. The budget and spend figures you enter are never uploaded or stored.",
        },
      ],
    },
    og: {
      ko: { title: "퍼널 전환율 계산기", subtitle: "단계별 전환율·이탈률 분석과 목표 달성 트래픽 역산" },
      en: { title: "Funnel Conversion Calculator", subtitle: "Stage-by-stage conversion analysis and required traffic planning" },
    },
  },

  // ── Design ── QR 도구 2종 (생성기 ↔ 읽기 공통 탭)
  {
    slug: "qr-code-generator",
    layout: "canvas",
    cat: "design",
    targets: ["office-worker", "designer", "developer", "small-business-owner"],
    ico: "▦",
    ready: true,
    indexable: true,
    badge: "Canvas",
    name: { ko: "QR 코드 생성기", en: "QR Code Generator" },
    relatedTools: ["qr-code-reader", "css-gradient", "open-graph-preview"],
    seo: {
      ko: {
        title: "QR 코드 생성기 | 색상·모양 설정 및 PNG·SVG 다운로드",
        description:
          "URL을 입력해 QR 코드를 만들고 사각형, 둥근 사각형, 아치형, 하트형 모양과 색상, 인식 품질을 설정하세요. 아치형·하트형은 온전한 QR 코어에 장식을 더한 감성 디자인 QR로, 인식 안정성을 위해 오류 복원을 최고로 고정합니다. 청첩장·인쇄물용 디자인 QR을 브라우저에서 확인한 뒤 PNG 또는 SVG로 다운로드할 수 있으며 입력한 링크는 서버로 전송되지 않습니다.",
        keywords: [
          "QR 코드 생성기",
          "QR 만들기",
          "링크 QR 코드",
          "QR 코드 PNG",
          "QR 코드 SVG",
          "하트 QR 코드",
          "하트 QR",
          "감성 QR 생성",
          "디자인 QR 생성",
          "QR 디자인",
          "디자인 QR",
          "청첩장 QR 코드",
          "QR 코드 모양",
          "QR 코드 색상 변경",
        ],
      },
      en: {
        title: "QR Code Generator | Custom Shapes, Colors, PNG and SVG",
        description:
          "Create a QR code from a URL and customize its color, recognition quality, and overall shape: square, rounded, arch, or heart. Arch and heart are styled codes that add decoration around an intact QR core and lock error correction to maximum for reliable scanning. The result is re-decoded in your browser before you download it as PNG or SVG, and your URL is never sent to a server.",
        keywords: [
          "QR code generator",
          "custom QR code",
          "QR code PNG",
          "QR code SVG",
          "colored QR code",
          "heart QR code",
          "styled QR code",
          "design QR code",
          "heart shaped QR code",
          "QR code shape",
        ],
      },
    },
    content: {
      ko: {
        card: "링크를 QR 코드로 만들고 색상과 모양을 설정해 PNG·SVG로 다운로드합니다.",
        description:
          "URL을 입력해 QR 코드를 만들고 사각형, 둥근 사각형, 아치형, 하트형 모양과 색상, 인식 품질을 설정하세요. 아치형·하트형은 온전한 QR 코어에 장식을 더한 감성 디자인 QR로, 인식 안정성을 위해 오류 복원을 최고로 고정합니다. 청첩장·인쇄물용 디자인 QR을 브라우저에서 확인한 뒤 PNG 또는 SVG로 다운로드할 수 있으며 입력한 링크는 서버로 전송되지 않습니다.",
        howItWorks: [
          "QR 코드로 만들 URL을 입력합니다.",
          "인식 품질, 색상, 셀 모양을 설정합니다.",
          "판독 확인 후 PNG 또는 SVG로 다운로드합니다.",
        ],
        aeo: {
          what: "QR 코드 생성기는 URL을 QR 코드로 변환하고 사각형·둥근 사각형·아치형·하트형 등 전체 모양과 색상을 설정할 수 있는 브라우저 도구입니다.",
          who: "웹 링크를 인쇄물, 문서, 매장 안내, 청첩장·행사 자료 또는 온라인 콘텐츠에 넣어야 하는 사용자를 위한 도구입니다.",
          how: "URL을 온전한 QR 코어로 만든 뒤, 아치·하트 같은 모양은 코어 주위에 장식 셀을 더해 구성하고, 결과를 브라우저에서 다시 판독해 인식을 확인합니다.",
          why: "청첩장·인쇄물에 어울리는 감성 디자인 QR을 서버 전송 없이 만들고 PNG·SVG로 바로 내려받을 수 있습니다.",
        },
        guide: [
          {
            heading: "QR 코드는 어디에 쓰나요",
            body: [
              "QR 코드는 긴 링크를 카메라로 한 번에 열 수 있게 바꿔주는 사각형 코드입니다. 명함이나 전단지에 웹사이트 주소를 적어두면 사람들이 일일이 타이핑해야 하지만, QR 코드를 넣으면 스마트폰 카메라를 갖다 대는 것만으로 바로 페이지가 열립니다. 그래서 매장 메뉴판, 행사 안내, 제품 포장, 청첩장, 발표 슬라이드처럼 종이와 화면을 잇는 자리에 널리 쓰입니다.",
              "이 생성기는 URL을 입력하면 즉시 QR 코드를 만들고, 색상과 셀 모양, 인식 품질을 원하는 대로 조절할 수 있습니다. 완성한 코드는 인쇄에 적합한 PNG나, 크기를 키워도 깨지지 않는 벡터 형식인 SVG로 내려받을 수 있습니다.",
            ],
          },
          {
            heading: "디자인과 인식률의 균형",
            body: [
              "QR 코드는 색을 바꾸거나 모양을 꾸밀 수 있지만, 지나치게 손대면 스캔이 안 될 수 있습니다. 인식이 잘 되려면 코드의 어두운 부분과 밝은 배경 사이에 충분한 명암 대비가 있어야 하고, 코드 주변에 여백(콰이어트 존)이 남아 있어야 합니다. 배경색을 코드 색과 너무 비슷하게 두거나 여백을 없애면 카메라가 코드를 찾지 못합니다.",
              "이 도구의 아치형·하트형 같은 감성 디자인 QR은 온전한 QR 코어는 그대로 두고 주변에만 장식을 더하는 방식이며, 인식 안정성을 위해 오류 복원 수준을 최고로 고정합니다. 오류 복원이 높을수록 코드 일부가 로고나 장식에 가려져도 내용을 복원할 수 있습니다. 그래도 인쇄 전에는 반드시 실제 스마트폰으로 스캔해 확인하는 것이 좋습니다.",
            ],
          },
          {
            heading: "링크는 서버로 가지 않습니다",
            body: [
              "QR 코드에는 개인 행사 초대 링크나 미공개 페이지 주소처럼 아직 알리고 싶지 않은 URL이 담기기도 합니다. 이 생성기는 코드 생성과 판독 확인을 모두 브라우저 안에서 처리하며, 입력한 링크를 서버에 전송하거나 저장하지 않습니다.",
              "또한 여기서 만든 QR 코드는 입력한 주소를 직접 담는 정적 코드라, 중간에 다른 서비스를 거치지 않습니다. 즉 그 서비스가 사라져서 코드가 먹통이 될 걱정 없이, 코드가 인쇄된 종이가 남아 있는 한 계속 동작합니다.",
            ],
          },
        ],
              examples: [
          {
            title: "매장 테이블용 메뉴 링크 QR",
            input: "메뉴 페이지 URL · 오류 정정 레벨 H · SVG 다운로드",
            result: "인쇄해도 깨지지 않는 벡터 QR 파일",
            note: "인쇄물에는 반드시 SVG를 쓰세요. PNG는 확대하면 가장자리가 뭉개져 인식률이 떨어집니다. 오류 정정 레벨 H는 코드의 약 30%가 손상돼도 읽히므로, 지문이나 음식물이 묻기 쉬운 테이블 QR에 적합합니다.",
          },
          {
            title: "명함에 넣을 작은 QR",
            input: "짧은 URL · 여백(quiet zone) 유지 · 최소 2cm 크기로 배치",
            result: "명함 크기에서도 인식되는 QR",
            note: "URL이 길수록 모듈이 촘촘해져 작게 인쇄하면 읽히지 않습니다. 명함처럼 작은 지면에는 단축 URL을 먼저 만든 뒤 QR로 변환하세요.",
          },
          {
            title: "브랜드 컬러를 적용한 QR",
            input: "전경색 #22499F · 배경 흰색",
            result: "브랜드 색이 적용되면서도 인식되는 QR",
            note: "전경색은 배경보다 반드시 어두워야 합니다. 밝은 색을 전경에 쓰거나 명암 대비가 낮으면 카메라가 모듈을 구분하지 못합니다. 색을 바꾼 뒤에는 실제 휴대폰으로 반드시 스캔 테스트를 하세요.",
          },
        ],
        limitations: [
          "QR 코드에는 담긴 데이터가 그대로 들어갑니다. 만든 뒤에 링크를 바꿀 수 없으므로, 나중에 목적지를 변경할 가능성이 있다면 리다이렉트 가능한 단축 URL을 먼저 만들고 그 주소로 QR을 생성하세요.",
          "전경색이 배경보다 밝거나 대비가 부족하면 스캔되지 않습니다. 그라디언트나 사진 위에 얹는 디자인도 인식률을 크게 떨어뜨립니다.",
          "코드 주변 여백(quiet zone)을 잘라내면 인식이 실패합니다. 다른 그래픽과 붙여 배치할 때 여백을 침범하지 않도록 주의하세요.",
          "데이터가 길수록 모듈 수가 늘어 같은 크기에서 인식이 어려워집니다. 긴 텍스트나 URL은 인쇄 크기를 키우거나 내용을 줄여야 합니다.",
          "스캔 성공 여부는 기기 카메라·조명·인쇄 품질에 좌우됩니다. 대량 인쇄 전에 여러 기종으로 테스트하는 과정을 생략하지 마세요.",
        ],
      },
      en: {
        card: "Create a QR code from a URL, customize its shape and color, and download PNG or SVG.",
        description:
          "Create a QR code from a URL and customize its color, recognition quality, and overall shape: square, rounded, arch, or heart. Arch and heart are styled codes that add decoration around an intact QR core and lock error correction to maximum for reliable scanning. The result is re-decoded in your browser before you download it as PNG or SVG, and your URL is never sent to a server.",
        howItWorks: [
          "Enter the URL you want to encode.",
          "Choose the recognition quality, colors, and module shape.",
          "Verify the result and download it as PNG or SVG.",
        ],
        aeo: {
          what: "The QR Code Generator is a browser tool that turns a URL into a QR code and lets you customize its color and overall shape: square, rounded, arch, or heart.",
          who: "It is for people who need to place web links in documents, printed materials, store signage, invitations, event content, or digital media.",
          how: "It builds an intact QR core from the URL, forms arch or heart shapes by adding decorative cells around that core, and re-decodes the result in your browser to confirm it scans.",
          why: "It makes styled QR codes suited to invitations and print without sending the URL to a server, ready to download as PNG or SVG.",
        },
        guide: [
          {
            heading: "What QR codes are for",
            body: [
              "A QR code is a square pattern that turns a long link into something a camera can open in one step. Print a web address on a business card or flyer and people have to type it out; add a QR code and they just point their phone's camera at it to open the page. That's why they show up wherever paper meets screen: store menus, event signage, product packaging, wedding invitations, presentation slides.",
              "This generator creates a QR code the moment you enter a URL, and lets you adjust the color, module shape, and recognition quality. You can download the finished code as a PNG suited to printing, or as an SVG: a vector format that stays crisp at any size.",
            ],
          },
          {
            heading: "Balancing design and scannability",
            body: [
              "You can recolor and decorate a QR code, but overdo it and it stops scanning. For reliable reads there needs to be enough contrast between the code's dark modules and the light background, and a margin of empty space (the quiet zone) around it. Make the background too close in color to the code, or crop away the margin, and a camera can't find it.",
              "This tool's styled shapes like arch and heart keep the QR core intact and add decoration only around it, locking error correction to maximum for reliability. Higher error correction means the code can still be read even when part of it is covered by a logo or ornament. Even so, always scan the code with a real phone before printing.",
            ],
          },
          {
            heading: "Your link never leaves the browser",
            body: [
              "A QR code sometimes carries a URL you'd rather not publicize yet: a private event invite, an unlisted page. This generator does both the encoding and the scan verification inside your browser and never transmits or stores the link you enter.",
              "The codes it makes are also static: they embed your address directly rather than routing through another service. That means there's no third party that could shut down and leave your code dead: as long as the printed code exists, it keeps working.",
            ],
          },
        ],
              examples: [
          {
            title: "A menu link QR for restaurant tables",
            input: "Menu page URL · error correction level H · download as SVG",
            result: "A vector QR file that stays crisp in print",
            note: "Always use SVG for print; PNG softens at the edges when scaled up and scans less reliably. Level H stays readable with roughly 30% of the code damaged, which suits table codes that pick up fingerprints and spills.",
          },
          {
            title: "A small QR for a business card",
            input: "A short URL · quiet zone preserved · printed at least 2cm across",
            result: "A code that still scans at business-card size",
            note: "Longer URLs pack the modules more densely and fail at small print sizes. For tight layouts, shorten the URL first and then generate the code.",
          },
          {
            title: "A QR in brand colors",
            input: "Foreground #22499F on a white background",
            result: "A branded code that still scans",
            note: "The foreground must be darker than the background. Light foregrounds or low contrast stop the camera separating the modules. After any color change, test with a real phone.",
          },
        ],
        limitations: [
          "A QR code carries its data literally, so the destination cannot be changed after printing. If the target might move, generate the code against a redirectable short URL instead.",
          "Codes fail to scan when the foreground is lighter than the background or the contrast is too low. Gradients and photo backdrops behind the modules hurt reliability badly.",
          "Trimming the quiet zone around the code breaks scanning. Watch the margin when placing the code tight against other graphics.",
          "More data means more modules, which makes the same physical size harder to read. Long text or URLs need a larger print size or shorter content.",
          "Whether a scan succeeds depends on the camera, lighting and print quality. Do not skip testing on several devices before a large print run.",
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "QR 코드 생성기에 입력한 링크가 서버로 전송되나요?",
          answer:
            "아니요. QR 코드 생성과 판독 확인은 모두 사용자의 브라우저 안에서 이루어지며 입력한 링크를 서버에 저장하거나 전송하지 않습니다.",
        },
        {
          question: "QR 코드의 인식 품질은 무엇인가요?",
          answer:
            "인식 품질은 QR 코드 일부가 가려지거나 손상되었을 때 내용을 복원할 수 있는 오류 복원 수준입니다. 모양과 색상을 변경할 때는 높음 또는 최고 설정을 권장합니다.",
        },
        {
          question: "하트형·아치형 QR은 무엇인가요?",
          answer:
            "감성 디자인을 적용한 디자인 QR로, 인식 안정성을 위해 오류 복원률이 가장 높은 단계로만 생성됩니다. 실제로 스캔되는 QR 코어는 온전하게 유지하고 그 주위에 장식을 더해 모양을 만들지만, 입력한 링크와 생성된 QR의 형태에 따라 인식 오차가 생길 수 있습니다. 디자인 QR을 실제 인쇄물에 출력하기 전 반드시 모바일 카메라로 사전 테스트를 진행해 주세요.",
        },
        {
          question: "PNG와 SVG 중 어떤 형식을 사용해야 하나요?",
          answer:
            "웹 게시나 일반 문서에는 PNG가 편리하며, 인쇄물이나 크기 조절이 필요한 디자인 작업에는 확대해도 선명한 SVG가 적합합니다.",
        },
        {
          question: "만든 QR 코드가 다른 기기에서도 항상 인식되나요?",
          answer:
            "생성 결과는 현재 브라우저에서 다시 판독해 확인하지만 모든 카메라와 환경의 인식을 보장하지는 않습니다. 실제 사용 전 인쇄물이나 대상 기기에서 추가로 테스트해 주세요.",
        },
      ],
      en: [
        {
          question: "Is the URL entered in the QR Code Generator sent to a server?",
          answer:
            "No. QR code generation and validation run entirely in your browser. The URL is not uploaded or stored.",
        },
        {
          question: "What does QR code recognition quality mean?",
          answer:
            "Recognition quality controls the error correction level, which helps recover data when part of the QR code is damaged or obscured. High or maximum quality is recommended for styled QR codes.",
        },
        {
          question: "What are the heart and arch QR shapes?",
          answer:
            "They are design QR codes with a styled shape, generated only at the highest error-correction level for stability. The scannable core stays intact and decoration is added around it, but depending on your link and the resulting shape, recognition can occasionally be off. Always test a design QR with your phone camera before printing it.",
        },
        {
          question: "Should I download PNG or SVG?",
          answer:
            "PNG is convenient for websites and documents. SVG is better for print and design work because it remains sharp when resized.",
        },
        {
          question: "Will the generated QR code work with every scanner?",
          answer:
            "The tool checks the result in the current browser, but it cannot guarantee recognition by every camera or scanner. Test the final QR code in its actual usage environment.",
        },
      ],
    },
    og: {
      ko: {
        title: "QR 코드 생성기",
        subtitle: "감성 모양과 색상을 설정해 PNG·SVG로 다운로드",
      },
      en: {
        title: "QR Code Generator",
        subtitle: "Styled shapes and colors, download as PNG or SVG",
      },
    },
  },
  {
    slug: "qr-code-reader",
    layout: "canvas",
    cat: "design",
    targets: ["office-worker", "designer", "developer", "small-business-owner"],
    ico: "◲",
    ready: true,
    indexable: true,
    badge: "Canvas",
    name: { ko: "QR 코드 읽기", en: "QR Code Reader" },
    relatedTools: ["qr-code-generator", "open-graph-preview", "css-gradient"],
    seo: {
      ko: {
        title: "QR 코드 읽기 | 이미지 붙여넣기·업로드·카메라 스캔",
        description:
          "클립보드에 복사한 QR 이미지나 업로드한 사진, 모바일 또는 PC 카메라로 QR 코드를 읽으세요. URL이 포함된 경우 내용을 먼저 확인하고 안전하게 링크를 열거나 복사할 수 있으며 이미지와 카메라 영상은 서버로 전송되지 않습니다.",
        keywords: [
          "QR 코드 읽기",
          "QR 코드 스캔",
          "QR 이미지 인식",
          "QR 코드 업로드",
          "카메라 QR 코드",
          "QR 링크 확인",
        ],
      },
      en: {
        title: "QR Code Reader | Paste, Upload, or Scan with Camera",
        description:
          "Read a QR code from a pasted image, uploaded file, or device camera. Review the decoded content before opening or copying a URL. Images and camera video are processed locally in your browser and are not sent to a server.",
        keywords: [
          "QR code reader",
          "QR code scanner",
          "scan QR from image",
          "upload QR code",
          "camera QR scanner",
          "read QR code online",
        ],
      },
    },
    content: {
      ko: {
        card: "QR 이미지를 붙여넣거나 업로드하고 카메라로 스캔해 링크와 내용을 확인합니다.",
        description:
          "클립보드에 복사한 QR 이미지나 업로드한 사진, 모바일 또는 PC 카메라로 QR 코드를 읽으세요. URL이 포함된 경우 내용을 먼저 확인하고 안전하게 링크를 열거나 복사할 수 있으며 이미지와 카메라 영상은 서버로 전송되지 않습니다.",
        howItWorks: [
          "QR 이미지를 붙여넣거나 업로드하거나 카메라를 실행합니다.",
          "브라우저에서 QR 코드 내용을 판독합니다.",
          "URL을 확인해 열거나 내용을 복사합니다.",
        ],
        aeo: {
          what: "QR 코드 읽기는 이미지 또는 카메라 영상에 포함된 QR 코드를 판독하는 브라우저 도구입니다.",
          who: "사진이나 캡처 이미지 속 QR 코드의 링크 또는 텍스트 내용을 확인해야 하는 사용자를 위한 도구입니다.",
          how: "붙여넣은 이미지, 업로드 파일 또는 카메라 영상을 브라우저에서 분석하고 판독된 내용을 URL과 일반 텍스트로 구분합니다.",
          why: "별도 앱을 설치하거나 이미지를 서버에 업로드하지 않고 QR 코드 내용을 확인하고 복사할 수 있습니다.",
        },
        guide: [
          {
            heading: "QR 코드를 열기 전에 내용을 먼저 확인해야 하는 이유",
            body: [
              "스마트폰 카메라 앱은 QR을 인식하자마자 바로 링크를 열도록 유도하는 경우가 많아, 실제로 어떤 도메인으로 이동하는지 보지 못한 채 클릭하게 됩니다. 길거리 포스터나 출처가 불분명한 전단지의 QR처럼 신뢰할 수 없는 곳에서 발견한 코드는 특히 위험합니다.",
              "이 도구는 판독한 URL과 도메인을 화면에 먼저 보여주고, 사용자가 '링크 열기' 버튼을 직접 눌러야만 새 탭이 열립니다. 의심스러운 도메인이면 열지 않고 그대로 복사만 해서 별도로 확인할 수 있습니다.",
            ],
          },
          {
            heading: "세 가지 입력 방법: 붙여넣기·업로드·카메라",
            body: [
              "이미 캡처했거나 클립보드에 복사된 QR 이미지는 Ctrl+V(Cmd+V)로 바로 붙여넣어 읽을 수 있고, 저장된 이미지 파일은 업로드로 판독합니다. 인쇄물이나 화면에 떠 있는 QR을 그 자리에서 읽어야 한다면 카메라를 켜서 실시간으로 스캔합니다. 카메라가 여러 개인 기기에서는 전면·후면 카메라를 전환할 수 있습니다.",
              "세 방법 모두 브라우저 안에서만 이미지를 분석하며, 어떤 경우에도 이미지나 카메라 영상을 서버로 전송하지 않습니다.",
            ],
          },
          {
            heading: "URL이 아닌 QR도 읽을 수 있습니다",
            body: [
              "QR 코드에는 URL 말고도 Wi-Fi 접속 정보, 연락처(vCard), 일반 텍스트 같은 다양한 데이터가 담길 수 있습니다. 이 도구는 판독된 내용을 원문 그대로 보여주고 복사만 지원하며, Wi-Fi에 자동 접속하거나 연락처를 자동으로 저장하는 것 같은 동작은 하지 않습니다. 내용을 확인한 뒤 어떻게 쓸지는 사용자가 직접 판단합니다.",
            ],
          },
        ],
        examples: [
          {
            title: "출처가 불분명한 포스터의 QR 안전하게 확인",
            input: "길거리 포스터를 카메라로 스캔",
            result: "판독된 도메인 표시, 자동으로 열리지 않음",
            note: "도메인이 낯설거나 단축 URL이면 열지 않고 그대로 두거나, 텍스트를 복사해 별도로 검색해서 실제 목적지를 확인한 뒤 판단합니다.",
          },
          {
            title: "스크린샷 속 QR 코드 판독",
            input: "회의 자료 스크린샷에 포함된 QR 이미지 업로드",
            result: "이미지 안의 QR을 찾아 링크 또는 텍스트로 판독",
            note: "카메라로 다시 촬영할 필요 없이, 이미 찍어둔 스크린샷이나 저장된 이미지 파일을 그대로 업로드해 판독합니다.",
          },
          {
            title: "Wi-Fi 공유 QR에서 비밀번호 확인",
            input: "카페나 사무실에 붙어 있는 Wi-Fi QR 스캔",
            result: "SSID·비밀번호가 포함된 원문 텍스트 표시",
            note: "휴대폰의 QR 자동 연결 기능 없이도 비밀번호만 텍스트로 확인해 다른 기기에 수동으로 입력할 때 유용합니다.",
          },
        ],
        limitations: [
          "판독된 URL의 실제 안전성(악성 사이트 여부 등)은 검사하지 않습니다. 도메인과 원문을 보여줄 뿐이며, 열기 전 최종 판단은 사용자가 해야 합니다.",
          "심하게 훼손되거나 초점이 맞지 않는 이미지, 해상도가 너무 낮은 QR은 판독에 실패할 수 있습니다. 이 경우 더 선명한 사진을 다시 촬영하거나 업로드해야 합니다.",
          "이미지 한 장에 QR 코드가 여러 개 있으면 그중 하나만 판독될 수 있습니다. 여러 QR을 각각 확인하려면 코드별로 잘라서 따로 스캔하는 편이 안전합니다.",
          "카메라 스캔은 HTTPS 환경과 브라우저의 카메라 권한 허용이 필요합니다. 권한을 거부했거나 다른 앱이 카메라를 점유 중이면 실행되지 않습니다.",
        ],
      },
      en: {
        card: "Paste or upload a QR image, or scan it with your camera to view its link or text.",
        description:
          "Read a QR code from a pasted image, uploaded file, or device camera. Review the decoded content before opening or copying a URL. Images and camera video are processed locally in your browser and are not sent to a server.",
        howItWorks: [
          "Paste or upload a QR image, or start the camera.",
          "Decode the QR code in your browser.",
          "Review and open the URL or copy the decoded content.",
        ],
        aeo: {
          what: "The QR Code Reader is a browser tool that decodes QR codes from images or camera video.",
          who: "It is for people who need to inspect a link or text stored in a QR code from a photo, screenshot, or live camera.",
          how: "It analyzes a pasted image, uploaded file, or camera stream in the browser and classifies the decoded result as a URL or plain text.",
          why: "It reads QR codes without requiring an installed app or uploading images to a server.",
        },
        guide: [
          {
            heading: "Why you should check a QR's content before opening it",
            body: [
              "A phone's camera app often nudges you to open the link the instant it recognizes a QR code, so you end up tapping through without ever seeing which domain you're actually going to. A code found somewhere untrustworthy, a street poster or an unmarked flyer, is exactly where that matters most.",
              "This tool shows the decoded URL and domain on screen first, and a new tab only opens when you press \"Open link\" yourself. If the domain looks suspicious, you can leave it unopened and just copy the text to check it separately.",
            ],
          },
          {
            heading: "Three ways in: paste, upload, or camera",
            body: [
              "A QR image you've already captured or copied to the clipboard reads instantly with Ctrl+V (Cmd+V); a saved image file decodes through upload. When you need to read a QR that's printed or displayed live in front of you, turn on the camera and scan it in real time. On a device with more than one camera, you can switch between front and back.",
              "All three methods analyze the image entirely in your browser; none of them ever sends the image or camera video to a server.",
            ],
          },
          {
            heading: "It reads QR codes that aren't URLs too",
            body: [
              "A QR code can hold more than a URL: Wi-Fi credentials, a contact card (vCard), or plain text. This tool shows the decoded content exactly as-is and supports copying it, but it does not auto-connect to Wi-Fi or auto-save a contact. What to do with the content once you've seen it is up to you.",
            ],
          },
        ],
        examples: [
          {
            title: "Safely checking a QR from an unfamiliar poster",
            input: "Scanning a street poster with the camera",
            result: "The decoded domain is shown; nothing opens automatically",
            note: "If the domain looks unfamiliar or is a shortened URL, leave it unopened, or copy the text and search for it separately to confirm the real destination before deciding.",
          },
          {
            title: "Decoding a QR code inside a screenshot",
            input: "Uploading a screenshot of meeting slides that contains a QR image",
            result: "Finds the QR within the image and decodes it as a link or text",
            note: "No need to re-capture with a camera: upload an existing screenshot or saved image file and it decodes directly.",
          },
          {
            title: "Reading a password from a Wi-Fi sharing QR",
            input: "Scanning a Wi-Fi QR posted at a café or office",
            result: "The raw text containing the SSID and password is shown",
            note: "Useful for reading just the password as text and typing it into another device manually, without relying on a phone's auto-connect feature.",
          },
        ],
        limitations: [
          "It does not check whether a decoded URL is actually safe (malicious sites and so on). It only shows the domain and raw content; the final call on whether to open it is yours.",
          "A badly damaged, out-of-focus, or very low-resolution QR code may fail to decode. Retake a clearer photo or upload a better image in that case.",
          "If one image contains several QR codes, only one of them may get decoded. To check multiple codes, it's safer to crop and scan each one separately.",
          "Camera scanning requires HTTPS and the browser's camera permission. It will not start if permission was denied or another application is currently using the camera.",
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "QR 코드 이미지나 카메라 영상이 서버로 전송되나요?",
          answer:
            "아니요. 이미지 판독과 카메라 스캔은 사용자의 브라우저 안에서 처리되며 파일이나 영상은 서버로 전송되지 않습니다.",
        },
        {
          question: "클립보드에 복사한 QR 이미지를 어떻게 읽나요?",
          answer:
            "붙여넣기 영역을 선택한 뒤 Ctrl+V 또는 Cmd+V를 누르세요. 지원 브라우저에서는 클립보드에서 이미지 가져오기 버튼도 사용할 수 있습니다.",
        },
        {
          question: "카메라가 실행되지 않는 이유는 무엇인가요?",
          answer:
            "카메라 사용에는 HTTPS 환경과 브라우저 권한이 필요합니다. 권한이 거부되었거나 카메라를 다른 앱에서 사용 중이면 실행되지 않을 수 있습니다.",
        },
        {
          question: "QR 코드에 URL이 포함되어 있으면 자동으로 이동하나요?",
          answer:
            "아니요. 판독된 URL과 도메인을 먼저 표시하고 사용자가 링크 열기 버튼을 눌렀을 때만 새 탭으로 이동합니다.",
        },
        {
          question: "URL이 아닌 QR 코드도 읽을 수 있나요?",
          answer:
            "네. 일반 텍스트, Wi-Fi 설정 문자열, 연락처 데이터 등의 내용도 원문으로 표시하고 복사할 수 있습니다. 자동 실행이나 설정 적용은 하지 않습니다.",
        },
      ],
      en: [
        {
          question: "Are QR images or camera video sent to a server?",
          answer:
            "No. Image decoding and camera scanning run locally in your browser. Files and video are not uploaded.",
        },
        {
          question: "How do I read a QR image copied to the clipboard?",
          answer:
            "Focus the paste area and press Ctrl+V or Cmd+V. Supported browsers may also provide a button to read an image directly from the clipboard.",
        },
        {
          question: "Why does the camera not start?",
          answer:
            "Camera access requires HTTPS and browser permission. It may also fail if permission was denied or another application is currently using the camera.",
        },
        {
          question: "Does the reader automatically open a decoded URL?",
          answer:
            "No. It displays the URL and domain first. The link opens in a new tab only after you select the open button.",
        },
        {
          question: "Can the reader decode content other than URLs?",
          answer:
            "Yes. Plain text, Wi-Fi configuration strings, contact data, and other content are displayed as text and can be copied. The tool does not execute them automatically.",
        },
      ],
    },
    og: {
      ko: {
        title: "QR 코드 읽기",
        subtitle: "붙여넣기·업로드·카메라로 QR 코드를 판독",
      },
      en: {
        title: "QR Code Reader",
        subtitle: "Paste, upload, or scan a QR code with your camera",
      },
    },
  },

  // ── Design ── PDF 도구 4종 (병합·분할·회전·페이지 삭제, 공통 탭) ──
  {
    slug: "pdf-tools",
    layout: "canvas",
    cat: "design",
    targets: ["office-worker", "pm", "small-business-owner", "designer"],
    ico: "PDF",
    ready: true,
    indexable: true,
    badge: "Canvas",
    name: { ko: "PDF 도구", en: "PDF Tools" },
    relatedTools: ["qr-code-generator", "qr-code-reader", "open-graph-preview"],
    seo: {
      ko: {
        title: "PDF 도구 | 병합·분할·회전·페이지 삭제",
        description:
          "탭을 전환해 PDF 병합·분할·회전·페이지 삭제 네 가지 작업을 한 페이지에서 처리합니다. 여러 PDF를 원하는 순서로 합치거나, 페이지·범위별로 나누거나, 90도 단위로 회전하거나, 필요 없는 페이지를 제거할 수 있습니다. 모든 파일은 브라우저 안에서만 처리되어 서버로 전송되지 않습니다.",
        keywords: [
          "PDF 도구", "PDF 병합", "PDF 분할", "PDF 회전", "PDF 페이지 삭제",
          "PDF 합치기", "PDF 나누기", "온라인 PDF 편집",
        ],
      },
      en: {
        title: "PDF Tools | Merge, Split, Rotate, Delete Pages",
        description:
          "Switch tabs to merge, split, rotate, or delete pages from a PDF, all on one page. Combine several PDFs in your order, split by page or range, rotate in 90-degree steps, or remove pages you don't need. Every file is processed entirely in your browser and never uploaded to a server.",
        keywords: [
          "PDF tools", "merge PDF", "split PDF", "rotate PDF", "delete PDF pages",
          "combine PDF", "PDF editor online",
        ],
      },
    },
    content: {
      ko: {
        card: "PDF 병합·분할·회전·페이지 삭제를 탭 전환으로. 모든 처리는 브라우저 안에서.",
        description:
          "탭을 전환해 PDF 병합·분할·회전·페이지 삭제 네 가지 작업을 한 페이지에서 처리합니다. 여러 PDF를 원하는 순서로 합치거나, 페이지·범위별로 나누거나, 90도 단위로 회전하거나, 필요 없는 페이지를 제거할 수 있습니다. 모든 파일은 브라우저 안에서만 처리되어 서버로 전송되지 않습니다.",
        howItWorks: [
          "상단 탭에서 작업(병합·분할·회전·페이지 삭제) 선택",
          "PDF 파일 업로드",
          "결과를 확인하고 새 PDF로 다운로드",
        ],
        aeo: {
          what: "PDF 도구는 PDF 병합·분할·회전·페이지 삭제 네 가지 작업을 한 페이지에서 처리하는 통합 브라우저 도구입니다.",
          who: "보고서·계약서·스캔본을 정리해야 하는 사무직·PM·소상공인·디자이너를 위한 도구입니다.",
          how: "상단 탭에서 작업을 고르고 PDF를 업로드하면 브라우저 안에서 처리되어 새 PDF로 다운로드됩니다. 작업마다 업로드하는 파일 수와 조작 방식이 다릅니다.",
          why: "설치나 로그인 없이, 파일을 서버에 올리지 않고 브라우저에서 바로 PDF를 다룰 수 있어 민감한 문서도 안심하고 처리할 수 있습니다.",
        },
        guide: [
          {
            heading: "PDF 작업 네 가지를 한 곳에 모은 이유",
            body: [
              "PDF 병합·분할·회전·페이지 삭제는 서로 다른 결과물을 만들지만, '업로드한 PDF를 브라우저 안에서 재구성해 새 PDF로 내려받는다'는 처리 방식은 같습니다. 계약서, 신분증 스캔본, 내부 보고서처럼 PDF에는 민감한 문서가 자주 담기는데, 이 네 가지 작업 모두 파일을 어떤 서버로도 전송하거나 저장하지 않고 기기 안에서만 처리합니다.",
              "네 작업을 각각 다른 페이지로 흩어 두는 대신 탭으로 묶어, 예를 들어 스캔한 페이지 방향을 회전으로 바로잡은 뒤 필요 없는 페이지를 삭제하는 식의 연속 작업도 다시 도구를 찾아 이동할 필요 없이 처리할 수 있습니다.",
            ],
          },
          {
            heading: "PDF 병합: 여러 파일을 순서대로 하나로",
            body: [
              "여러 PDF 파일을 업로드하고 드래그하거나 위아래로 이동해 순서를 정하면, 목록의 위에서 아래 순서 그대로 이어 붙인 하나의 PDF를 만듭니다. 파일 1개당 100MB, 병합 총합 200MB, 최대 30개 파일까지 지원합니다.",
              "열기 암호가 걸린 PDF는 병합할 수 없어 먼저 암호를 해제해야 하며, 북마크(목차)·양식 필드·전자서명은 병합 과정에서 유지되지 않을 수 있습니다. 페이지 순서만 이어 붙일 뿐 페이지 크기 통일이나 압축 같은 후처리는 하지 않습니다.",
            ],
          },
          {
            heading: "PDF 분할: 페이지별 또는 범위별로",
            body: [
              "PDF 1개를 업로드해 모든 페이지를 한 장씩 나누거나, 1-3, 4-7처럼 범위를 지정해 구간별로 나눕니다. PDF 1개당 최대 300페이지, 결과 최대 300개 파일까지 지원하며, 결과가 2개 이상이면 ZIP 파일로 한 번에 다운로드됩니다.",
              "계약서에서 서명 페이지만 따로 저장하거나, 긴 보고서를 장별로 쪼갤 때 씁니다. 범위는 쉼표와 하이픈으로 입력하며 페이지는 1부터 시작하고 총 페이지 수를 넘을 수 없습니다.",
            ],
          },
          {
            heading: "PDF 회전: 90도 단위로 방향 바로잡기",
            body: [
              "PDF 전체 또는 썸네일에서 선택한 페이지만 왼쪽 90도·오른쪽 90도·180도로 회전합니다. 페이지 콘텐츠를 이미지로 다시 그리지 않고 회전 속성만 바꾸므로 원본 화질이 그대로 유지됩니다.",
              "가로로 스캔되었거나 방향이 뒤집힌 페이지를 바로잡을 때 씁니다. 90도 단위 회전만 지원하며, 스캔이 살짝 기울어진 경우의 미세 각도 보정(기울기 보정)은 지원하지 않습니다.",
            ],
          },
          {
            heading: "PDF 페이지 삭제: 필요 없는 페이지만 제거",
            body: [
              "썸네일에서 삭제할 페이지를 선택(개별 클릭·전체 선택·선택 반전·범위 입력)하면 남는 페이지 수가 바로 표시되고, 선택한 페이지를 뺀 나머지로 새 PDF를 만듭니다. 최소 1페이지는 남아야 실행할 수 있습니다.",
              "빈 페이지, 표지, 중복 스캔 페이지처럼 최종본에 필요 없는 페이지를 골라낼 때 씁니다. 실행 취소와 전체 원상 복구를 지원해 삭제 전 선택을 다시 조정할 수 있습니다.",
            ],
          },
        ],
        examples: [
          {
            title: "견적서·계약서·부속서류를 한 파일로",
            input: "PDF 3개 업로드 후 드래그로 순서 정렬 (병합 탭)",
            result: "지정한 순서대로 이어 붙인 단일 PDF",
            note: "업로드 순서가 아니라 목록에서 지정한 순서로 합쳐집니다. 파일명이 1, 2, 10처럼 되어 있으면 이름순 정렬이 의도와 다를 수 있으니 병합 전 순서를 눈으로 확인하세요.",
          },
          {
            title: "스캔한 서류 여러 장을 하나로 제출",
            input: "페이지별로 나뉘어 스캔된 PDF 여러 개 (병합 탭)",
            result: "한 번에 제출할 수 있는 단일 PDF",
            note: "온라인 제출 서식이 파일 1개만 허용할 때 쓰는 방식입니다. 파일이 서버로 올라가지 않으므로 신분증·계약서처럼 민감한 서류도 그대로 다룰 수 있습니다.",
          },
          {
            title: "긴 계약서에서 서명 페이지만 따로 저장",
            input: "12페이지 PDF에서 범위 10-12 지정 (분할 탭)",
            result: "10~12페이지만 담은 별도 PDF",
            note: "전체를 다시 스캔하거나 인쇄할 필요 없이, 필요한 구간만 빠르게 추려 서명본만 따로 보관하거나 공유할 때 씁니다.",
          },
          {
            title: "가로로 스캔된 페이지 방향 바로잡기",
            input: "5페이지 중 2, 4페이지가 옆으로 누워 스캔됨 (회전 탭)",
            result: "2, 4페이지만 오른쪽 90도 회전, 나머지는 그대로",
            note: "선택한 페이지에만 회전이 적용되므로 문서 전체를 다시 정렬할 필요가 없습니다.",
          },
          {
            title: "불필요한 표지·빈 페이지 제거",
            input: "10페이지 중 표지 1페이지·빈 페이지 1페이지 선택 (페이지 삭제 탭)",
            result: "8페이지로 줄어든 새 PDF",
            note: "스캔 과정에서 섞여 들어간 빈 페이지나 사내용 표지처럼 최종 배포본에는 필요 없는 페이지를 정리할 때 씁니다.",
          },
        ],
        limitations: [
          "병합은 파일 1개당 100MB, 총합 200MB, 최대 30개까지 지원합니다. 분할·회전·페이지 삭제는 PDF 1개당 최대 300페이지까지 지원합니다. 브라우저 메모리 안에서 처리하므로 저사양 기기에서는 이 한도보다 낮은 용량에서도 실패할 수 있습니다.",
          "열기 암호가 걸린 PDF는 네 작업 모두 처리할 수 없습니다. 암호를 먼저 해제한 뒤 업로드하세요.",
          "병합 과정에서 북마크(목차)·양식 필드·전자서명은 유지되지 않을 수 있습니다. 전자서명은 문서가 변경되면 무효가 되는 것이 정상 동작입니다.",
          "회전은 90도 단위(왼쪽·오른쪽 90도, 180도)만 지원하며, 스캔이 살짝 기울어진 경우의 미세 각도 보정은 제공하지 않습니다.",
          "페이지 삭제는 최소 1페이지가 남아야 실행됩니다. 네 작업 모두 페이지 내용 자체를 편집하거나 텍스트를 수정하는 기능은 제공하지 않습니다.",
        ],
      },
      en: {
        card: "Merge, split, rotate, or delete PDF pages by tab. Everything runs in your browser.",
        description:
          "Switch tabs to merge, split, rotate, or delete pages from a PDF, all on one page. Combine several PDFs in your order, split by page or range, rotate in 90-degree steps, or remove pages you don't need. Every file is processed entirely in your browser and never uploaded to a server.",
        howItWorks: [
          "Pick a task from the tabs (merge, split, rotate, delete pages)",
          "Upload your PDF file(s)",
          "Review the result and download the new PDF",
        ],
        aeo: {
          what: "PDF Tools is a unified browser tool that handles four PDF tasks on one page: merge, split, rotate, and delete pages.",
          who: "It is for office workers, PMs, small business owners, and designers who need to clean up reports, contracts, or scans.",
          how: "Pick a task from the tabs, upload your PDF, and it's processed in your browser and downloads as a new PDF. Each task takes a different number of files and works differently.",
          why: "No install, no login, and no file upload to a server, so even sensitive documents can be handled safely, right in your browser.",
        },
        guide: [
          {
            heading: "Why four PDF tasks live on one page",
            body: [
              "Merge, split, rotate, and delete pages produce different results, but they share the same processing model: reconstruct the uploaded PDF inside the browser and download a new one. PDFs often carry sensitive material: contracts, ID scans, internal reports: and all four tasks process files on-device, never transmitting or storing them on a server.",
              "Grouping the four under tabs instead of scattering them across separate pages means a sequence like rotating a scanned page upright and then deleting pages you don't need can happen without hunting down a different tool in between.",
            ],
          },
          {
            heading: "Merge: combine several files in your order",
            body: [
              "Upload several PDF files and set the order by dragging or moving them up and down; they combine top to bottom exactly as the list shows. Limits are 100MB per file, 200MB combined, and up to 30 files.",
              "Password-protected PDFs cannot be merged, so remove the open password first. Bookmarks, form fields, and digital signatures may not survive the merge. It concatenates pages only, with no page-size normalization or compression.",
            ],
          },
          {
            heading: "Split: by every page or by range",
            body: [
              "Upload one PDF and either split it into every single page or into custom ranges like 1-3, 4-7. Limits are 300 pages per PDF and 300 result files; when there is more than one result, they download together as a ZIP.",
              "Use it to pull out just the signature page of a contract, or to break a long report into chapters. Ranges use commas and hyphens; pages start at 1 and cannot exceed the total page count.",
            ],
          },
          {
            heading: "Rotate: fix orientation in 90-degree steps",
            body: [
              "Rotate an entire PDF or only the pages you select from thumbnails, left 90, right 90, or 180 degrees. Only the rotation attribute changes, not a re-render of the content, so original quality is preserved.",
              "Use it to fix sideways scans or upside-down pages. It supports 90-degree steps only; it does not correct a slight skew from an imperfectly aligned scan.",
            ],
          },
          {
            heading: "Delete pages: remove only what you don't need",
            body: [
              "Select pages to remove from thumbnails (individually, select all, invert, or by range), see the remaining page count update instantly, and build a new PDF from what's left. At least one page must remain to run it.",
              "Use it to clean up blank pages, cover sheets, or duplicate scans before sharing a final version. Undo and Reset all let you adjust the selection before deleting.",
            ],
          },
        ],
        examples: [
          {
            title: "Combining a quote, a contract and appendices",
            input: "Upload three PDFs, then drag to set the order (Merge tab)",
            result: "A single PDF joined in the order you specified",
            note: "Files merge in list order, not upload order. Names like 1, 2 and 10 sort alphabetically in ways you may not expect, so check the order visually before merging.",
          },
          {
            title: "Submitting several scanned pages as one file",
            input: "Multiple PDFs scanned one page at a time (Merge tab)",
            result: "A single PDF ready for submission",
            note: "This is what you need when an online form accepts only one attachment. Your files are never uploaded to a server, so ID documents and contracts can be handled as-is.",
          },
          {
            title: "Saving just the signature page of a long contract",
            input: "A 12-page PDF with range 10-12 (Split tab)",
            result: "A separate PDF containing only pages 10-12",
            note: "No need to rescan or reprint the whole document: pull out just the section you need to file or share the signed page on its own.",
          },
          {
            title: "Fixing pages that were scanned sideways",
            input: "Pages 2 and 4 of a 5-page PDF came out sideways (Rotate tab)",
            result: "Pages 2 and 4 rotated 90° right; the rest untouched",
            note: "Rotation only applies to the pages you select, so you don't have to realign the whole document.",
          },
          {
            title: "Removing an unneeded cover sheet and a blank page",
            input: "A cover sheet and one blank page selected out of 10 (Delete Pages tab)",
            result: "A new 8-page PDF",
            note: "Use it to clean up blank pages that snuck in during scanning, or internal cover sheets that shouldn't be in the final distributed version.",
          },
        ],
        limitations: [
          "Merge supports up to 100MB per file, 200MB combined, and 30 files. Split, rotate, and delete pages support up to 300 pages per PDF. Processing happens in browser memory, so lower-spec devices can fail below those numbers.",
          "Password-protected PDFs cannot be processed by any of the four tasks. Remove the password before uploading.",
          "Bookmarks, form fields, and digital signatures may not survive a merge. A digital signature becoming invalid once the document changes is expected behavior, not a bug.",
          "Rotation supports 90-degree steps only (left, right, 180); it does not correct a slight skew from an imperfectly aligned scan.",
          "Deleting pages requires at least one page to remain. None of the four tasks edit page content or text directly.",
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "네 가지 작업을 각각 다른 페이지에서 찾아야 하나요?",
          answer:
            "아니요. 상단 탭에서 병합·분할·회전·페이지 삭제 중 원하는 작업을 누르면 같은 페이지 안에서 바로 전환됩니다. URL은 ?mode= 쿼리로 현재 선택한 작업을 반영하지만, 검색 색인용 대표 URL(canonical)은 항상 /pdf-tools 하나입니다.",
        },
        {
          question: "업로드한 PDF가 서버로 전송되나요?",
          answer:
            "아니요. 병합·분할·회전·페이지 삭제 모두 브라우저 안에서만 처리되며, 업로드한 파일은 어떤 서버로도 전송되거나 저장되지 않습니다.",
        },
        {
          question: "탭을 바꾸면 업로드했던 파일이 사라지나요?",
          answer:
            "네. 각 작업은 파일 상태를 독립적으로 관리하므로, 예를 들어 회전 탭에서 업로드한 파일은 분할 탭으로 넘어가면 유지되지 않습니다. 작업을 마친 뒤 다음 작업으로 넘어가려면 결과를 다운로드한 파일을 다시 업로드하세요.",
        },
        {
          question: "암호가 걸린 PDF도 처리할 수 있나요?",
          answer:
            "아니요. 네 작업 모두 열기 암호가 걸린 PDF는 처리할 수 없습니다. 암호를 해제한 뒤 다시 시도해 주세요.",
        },
        {
          question: "회전은 화질에 영향을 주나요?",
          answer:
            "아니요. 페이지를 이미지로 다시 그리지 않고 회전 속성만 바꾸기 때문에 원본 품질이 그대로 유지됩니다.",
        },
        {
          question: "분할 결과는 어떻게 받나요?",
          answer:
            "결과가 1개면 PDF로 바로 다운로드되고, 2개 이상이면 ZIP 파일로 묶여 다운로드됩니다.",
        },
        {
          question: "페이지 삭제에서 모든 페이지를 삭제할 수 있나요?",
          answer:
            "아니요. 최소 1페이지는 남아야 합니다. 남는 페이지가 없으면 실행이 차단됩니다.",
        },
      ],
      en: [
        {
          question: "Do I need to visit a different page for each of the four tasks?",
          answer:
            "No. Click Merge, Split, Rotate, or Delete Pages in the tabs above and it switches instantly on the same page. The URL reflects the current task via a ?mode= query, but the canonical URL used for search indexing is always the single /pdf-tools.",
        },
        {
          question: "Are my uploaded PDFs sent to a server?",
          answer:
            "No. Merge, split, rotate, and delete pages all run entirely in your browser. Uploaded files are never transmitted or stored on a server.",
        },
        {
          question: "Does switching tabs clear the file I uploaded?",
          answer:
            "Yes. Each task manages its own file state independently, so a file uploaded on the Rotate tab, for example, is not carried over to the Split tab. To chain tasks, download the result of one and upload it again for the next.",
        },
        {
          question: "Can any of these handle password-protected PDFs?",
          answer:
            "No. None of the four tasks can process a PDF with an open password. Remove the password and try again.",
        },
        {
          question: "Does rotating reduce quality?",
          answer:
            "No. Pages are not re-rendered as images; only the rotation attribute changes, so original quality is preserved.",
        },
        {
          question: "How do I receive the split result files?",
          answer:
            "A single result downloads directly as a PDF. Multiple results are bundled into a ZIP file.",
        },
        {
          question: "Can I delete every page?",
          answer:
            "No. At least one page must remain. If no page would be left, the action is blocked.",
        },
      ],
    },
    og: {
      ko: { title: "PDF 도구", subtitle: "PDF 병합·분할·회전·페이지 삭제를 한 페이지에서" },
      en: { title: "PDF Tools", subtitle: "Merge, split, rotate and delete PDF pages in one place" },
    },
  },
  // ── Design ── 이미지 최적화 (포맷·품질만 조절, 픽셀 크기는 유지) ──
  {
    slug: "image-optimizer",
    layout: "canvas",
    cat: "design",
    targets: ["designer", "developer"],
    ico: "IMG",
    ready: true,
    indexable: true,
    badge: "Canvas",
    name: { ko: "이미지 최적화", en: "Image Optimizer" },
    relatedTools: ["image-resizer-cropper", "open-graph-preview", "css-gradient"],
    seo: {
      ko: {
        title: "이미지 최적화 | PNG·JPG·WebP 용량 줄이기",
        description:
          "PNG, JPG, WebP 이미지의 원본 크기는 그대로 유지하면서 포맷과 품질을 조절해 파일 용량을 줄입니다. 여러 장을 한 번에 처리하고 개별 또는 ZIP으로 받을 수 있으며, 이미지가 서버로 업로드되지 않고 브라우저에서 바로 처리되는 무료 이미지 최적화 도구입니다.",
        keywords: [
          "이미지 최적화",
          "이미지 용량 줄이기",
          "이미지 압축",
          "WebP 변환",
          "PNG WebP 변환",
          "JPG WebP 변환",
          "PNG JPG 변환",
          "웹 이미지 최적화",
          "사진 용량 줄이기",
        ],
      },
      en: {
        title: "Image Optimizer | Compress PNG, JPG & WebP",
        description:
          "Optimize PNG, JPG, and WebP images without changing their pixel dimensions. Adjust image format and quality to reduce file size, process several images at once, and download them individually or as a ZIP, with all processing performed locally in your browser and no image uploads.",
        keywords: [
          "image optimizer",
          "image compressor",
          "compress image",
          "WebP converter",
          "PNG to WebP",
          "JPG to WebP",
          "PNG to JPG",
          "optimize images for web",
        ],
      },
    },
    content: {
      ko: {
        card: "PNG·JPG·WebP의 픽셀 크기는 그대로 두고 포맷과 품질만 조절해 파일 용량을 줄입니다.",
        description:
          "PNG, JPG, WebP 이미지의 원본 크기는 그대로 유지하면서 포맷과 품질을 조절해 파일 용량을 줄입니다. 여러 장에 같은 설정을 적용해 한 번에 처리하고, 원본과 결과 용량을 비교한 뒤 개별 또는 ZIP으로 받을 수 있습니다. 이미지는 서버로 업로드되지 않고 브라우저 안에서만 처리됩니다.",
        howItWorks: [
          "PNG·JPG·WebP 이미지 추가",
          "출력 포맷과 품질 선택",
          "용량 비교 후 개별 또는 ZIP 다운로드",
        ],
        aeo: {
          what: "이미지 최적화 도구는 이미지의 가로·세로 픽셀 크기를 변경하지 않고 포맷 또는 압축 품질을 조절하여 파일 용량을 줄이는 브라우저 도구입니다.",
          who: "웹사이트, 블로그, 앱 스토어, 포트폴리오 등에 사용할 이미지의 용량을 줄여야 하는 디자이너, 개발자, 콘텐츠 제작자에게 적합합니다.",
          how: "PNG, JPG 또는 WebP 이미지를 추가하고 출력 포맷과 품질을 선택하면 브라우저에서 이미지를 다시 인코딩하여 결과 파일과 용량 차이를 보여줍니다.",
          why: "이미지를 외부 서버에 업로드하거나 별도 프로그램을 설치하지 않고도 웹에 사용할 이미지의 파일 용량을 빠르게 줄일 수 있습니다.",
        },
        guide: [
          {
            heading: "이미지 최적화는 가장 작은 파일을 만드는 일이 아니다",
            body: [
              "이미지 최적화는 단순히 파일 용량을 가장 작게 만드는 작업이 아닙니다. 이미지가 사용되는 목적에 맞는 포맷과 품질을 선택하면서 필요한 화질을 유지하고, 전송해야 하는 데이터의 양을 줄이는 과정입니다.",
              "이 도구는 이미지의 가로·세로 픽셀 크기를 변경하지 않습니다. 원본 이미지의 크기를 유지한 상태에서 출력 포맷과 압축 품질만 바꿔 더 작은 파일을 만듭니다. 픽셀 크기 자체를 줄이거나 특정 비율로 잘라야 한다면 별도의 리사이즈·크롭 도구가 필요합니다.",
            ],
          },
          {
            heading: "PNG, JPG, WebP 중 어떤 포맷을 선택해야 하나요?",
            body: [
              "이미지 포맷마다 적합한 용도가 다릅니다. 가장 작은 파일을 만드는 포맷을 일률적으로 선택하기보다 이미지의 특성과 사용 환경을 고려해야 합니다.",
              "WebP는 웹사이트에 사용할 이미지라면 우선 고려할 수 있는 포맷입니다. 사진과 그래픽 이미지 모두에 쓸 수 있고 손실·무손실 압축과 투명도를 지원합니다. 기존 PNG나 JPG를 WebP로 바꾸면 비슷한 시각적 품질에서 파일 크기가 줄어드는 경우가 많습니다. 웹사이트 콘텐츠 이미지, 랜딩 페이지 이미지, 썸네일과 카드 이미지, 제품·배경 이미지가 여기에 해당합니다.",
              "JPG는 사진처럼 색상과 명암 변화가 많은 이미지에 적합합니다. 압축 품질을 조절해 파일 크기를 크게 줄일 수 있지만 투명 배경을 지원하지 않습니다. 사진과 인물 이미지, 풍경 이미지, 투명 배경이 필요 없는 이미지에 맞습니다. PNG나 WebP의 투명 영역을 JPG로 바꾸면 투명도를 유지할 수 없고, 이 도구는 해당 영역을 흰색 배경으로 처리합니다.",
              "PNG는 로고, 아이콘, UI 캡처처럼 선명한 경계나 투명 배경이 중요한 이미지에 적합합니다. 무손실 포맷이라 이미지 정보를 유지하는 데 유리하지만 사진처럼 복잡한 이미지에서는 파일 크기가 커질 수 있습니다. 파일 크기보다 정확한 표현이 중요하다면 PNG를 유지하는 편이 낫습니다.",
            ],
          },
          {
            heading: "이미지 품질은 몇으로 설정해야 하나요?",
            body: [
              "WebP와 JPG의 품질 값은 무조건 높다고 좋은 것도, 낮다고 좋은 것도 아닙니다. 품질을 낮추면 일반적으로 파일 크기가 줄어들지만 압축 흔적이나 디테일 손실이 눈에 띌 수 있습니다. 반대로 지나치게 높은 품질은 사용자가 차이를 거의 느끼지 못하면서 파일 크기만 키웁니다. 이 도구의 기본 품질 값은 80입니다.",
              "출발점은 이렇게 잡습니다. 90~100은 이미지 품질을 우선해야 할 때, 75~89는 일반적인 웹 이미지, 60~74는 썸네일처럼 용량 절감이 더 중요할 때, 60 미만은 화질 저하를 직접 확인한 뒤에 쓰는 구간입니다.",
              "이 값은 절대적인 화질 기준이 아닙니다. 이미지 내용과 인코딩 방식에 따라 같은 품질 값에서도 결과가 달라지므로, 최종 파일 크기와 실제 이미지를 함께 확인하는 것이 중요합니다.",
            ],
          },
          {
            heading: "이미지 용량은 얼마나 줄여야 하나요?",
            body: [
              "모든 웹 이미지에 적용할 수 있는 하나의 정답은 없습니다. 필요한 파일 크기는 이미지의 실제 픽셀 크기, 콘텐츠의 복잡도, 페이지에서 차지하는 중요도와 사용 환경에 따라 달라집니다.",
              "특정 KB 이하로 만드는 것을 목표로 하기보다 다음 순서로 판단하는 편이 좋습니다. 먼저 필요한 이미지의 픽셀 크기가 이미 결정되어 있는지 확인하고, 사용 목적에 적합한 포맷을 선택합니다. WebP 또는 JPG라면 품질을 조절한 뒤 원본과 결과의 시각적 차이를 확인하고, 눈에 띄는 품질 저하가 없다면 더 작은 파일을 사용합니다.",
              "이미지 최적화의 목적은 최소 용량이 아니라, 필요한 품질을 만족하는 최소한의 용량을 찾는 것입니다.",
            ],
          },
          {
            heading: "이미지 용량이 웹사이트에 왜 중요한가요?",
            body: [
              "웹페이지를 열 때 브라우저는 HTML과 CSS, JavaScript뿐 아니라 페이지에 표시되는 이미지도 함께 내려받습니다. 이미지 파일이 크거나 이미지가 많은 페이지에서는 사용자가 받아야 하는 데이터의 양이 늘어납니다. 특히 모바일 네트워크나 느린 연결 환경에서는 이미지가 표시되기까지 더 오래 걸립니다.",
              "웹 이미지 최적화는 페이지가 전송하는 데이터 감소, 이미지 다운로드 시간 감소, 모바일 데이터 사용량 감소, 이미지가 많은 페이지의 로딩 부담 감소와 연결됩니다.",
              "다만 이미지 파일을 최적화하는 것만으로 모든 웹 성능 문제가 해결되지는 않습니다. 실제 성능은 이미지가 표시되는 방식, 로딩 전략, 캐시, CDN 등 여러 요소의 영향을 함께 받습니다.",
            ],
          },
          {
            heading: "이미지 크기와 이미지 용량은 무엇이 다른가요?",
            body: [
              "이미지 작업에서 '크기'는 서로 다른 두 의미로 쓰입니다. 이미지 크기(dimensions)는 1200 × 630 px처럼 이미지를 구성하는 가로·세로 픽셀 수이고, 파일 용량(file size)은 842 KB처럼 파일이 저장 공간이나 네트워크에서 차지하는 데이터의 양입니다.",
              "이 도구가 바꾸는 대상은 파일 용량입니다. 1200 × 630 PNG 1.84 MB를 넣으면 1200 × 630 WebP 214 KB가 나오는 식으로, 픽셀 크기는 그대로 두고 용량만 줄입니다. 가로·세로 픽셀을 바꾸거나 특정 비율로 잘라야 한다면 별도의 리사이즈·크롭 도구를 사용해야 합니다.",
            ],
          },
        ],
        examples: [
          {
            title: "큰 PNG 스크린샷을 웹용 WebP로",
            input: "1920 × 1080 PNG 1.84 MB · 출력 WebP · 품질 80",
            result: "1920 × 1080 WebP 214 KB · 절감 1.63 MB (88.4%)",
            note: "사진이나 그라디언트가 많은 PNG는 WebP로 바꿀 때 절감폭이 가장 큽니다. 픽셀 크기는 그대로입니다.",
          },
          {
            title: "투명 배경 로고를 JPG로 저장",
            input: "투명 배경 PNG · 출력 JPG · 품질 85",
            result: "투명 영역이 흰색으로 채워진 JPG",
            note: "흰색이 아닌 배경 위에 얹을 로고라면 JPG 대신 WebP나 PNG를 선택해야 경계가 드러나지 않습니다.",
          },
          {
            title: "이미 압축된 작은 JPG를 다시 저장",
            input: "82 KB JPG · 출력 JPG · 품질 95",
            result: "104 KB JPG · 원본보다 22 KB 큼",
            note: "이미 압축된 이미지를 높은 품질로 다시 인코딩하면 커질 수 있습니다. 결과가 커지면 원본을 그대로 쓰거나 품질을 낮춰 다시 시도하세요.",
          },
          {
            title: "블로그 이미지 12장을 한 번에",
            input: "PNG·JPG 섞인 12장 · 출력 WebP · 품질 75",
            result: "12개 결과를 kitfolio-optimized-images.zip 한 파일로 다운로드",
            note: "모든 파일에 같은 설정이 적용됩니다. 특정 이미지만 다른 품질이 필요하면 그 파일만 따로 처리하세요.",
          },
        ],
        limitations: [
          "가로·세로 픽셀 크기와 비율은 바꾸지 않습니다. 이미지를 더 작은 픽셀 크기로 줄이거나 특정 비율로 자르려면 별도의 리사이즈·크롭 도구가 필요합니다.",
          "최적화한다고 항상 용량이 줄지는 않습니다. 이미 잘 압축된 이미지나 이미지 특성과 맞지 않는 포맷을 고르면 결과가 원본보다 커질 수 있고, 이 경우 도구는 절감률 대신 '원본보다 N 큼'으로 표시합니다.",
          "PNG 출력은 브라우저의 무손실 인코더를 그대로 씁니다. 전용 PNG 최적화 프로그램만큼 줄어들지 않으며, 원본보다 커지는 경우도 있습니다.",
          "재인코딩 과정에서 EXIF, 촬영 정보, 색 프로파일 같은 메타데이터는 결과 파일에 남지 않습니다. EXIF 회전 정보는 픽셀에 미리 적용해 보이는 방향을 유지합니다.",
          "처리는 기기 메모리 안에서 이루어집니다. 파일당 50MB, 한 변 16383px, 전체 100메가픽셀까지를 상한으로 두지만, 기기 사양에 따라 그 이하에서도 실패할 수 있습니다. 한 변 상한은 WebP가 표현할 수 있는 최대 크기이며, 이보다 큰 이미지는 결과가 조용히 잘리지 않도록 아예 받지 않습니다.",
          "GIF, SVG, AVIF, HEIC 등 PNG·JPG·WebP가 아닌 형식은 입력·출력 모두 지원하지 않습니다.",
        ],
      },
      en: {
        card: "Reduce PNG, JPG and WebP file size by changing format and quality, never the pixel dimensions.",
        description:
          "Optimize PNG, JPG, and WebP images without changing their pixel dimensions. Adjust the output format and quality to reduce file size, apply the same settings to several images at once, compare original and optimized sizes, and download results individually or as a ZIP. All processing happens locally in your browser and no image is ever uploaded.",
        howItWorks: [
          "Add PNG, JPG or WebP images",
          "Pick an output format and quality",
          "Compare sizes, then download one file or a ZIP",
        ],
        aeo: {
          what: "Image Optimizer is a browser-based tool that reduces image file size by changing the format or compression quality without changing the image's pixel dimensions.",
          who: "It is designed for designers, developers, and content creators who need smaller image files for websites, blogs, app stores, portfolios, and other digital products.",
          how: "Add PNG, JPG, or WebP images, choose an output format and quality, and the tool re-encodes the images locally in your browser while showing the resulting file size.",
          why: "It lets you reduce image file sizes without uploading images to an external server or installing separate image-editing software.",
        },
        guide: [
          {
            heading: "Optimization is not about making the smallest possible file",
            body: [
              "Image optimization is not simply the process of making a file as small as possible. It means choosing a format and quality level suited to the image's purpose while preserving acceptable visual quality and reducing the amount of data that must be transferred.",
              "This tool does not change an image's width or height in pixels. It creates a new file by changing the output format and, where applicable, the compression quality, while preserving the original dimensions. Changing the pixel dimensions or cropping to a ratio needs a separate resizing tool.",
            ],
          },
          {
            heading: "Which format should I choose: PNG, JPG, or WebP?",
            body: [
              "Each image format is suited to different content. Instead of choosing one format solely because it produces the smallest file, consider the image itself and where it will be used.",
              "WebP is a strong first option for images used on websites. It supports both lossy and lossless compression as well as transparency, making it useful for photographs and graphics alike. Converting a PNG or JPG to WebP can often reduce file size while keeping similar visual quality. It suits website content images, landing-page images, thumbnails and cards, and product or background images.",
              "JPG is well suited to photographs and images with many color and tonal variations. Its adjustable compression can substantially reduce file size, but it does not support transparency. It suits photographs and portraits, landscape images, and anything that does not need a transparent background. When a transparent PNG or WebP is converted to JPG, this tool fills the transparent areas with white.",
              "PNG is useful when crisp edges, exact pixel reproduction, or transparency matters, as with logos, icons, and interface captures. Its lossless compression preserves image data but can produce large files for complex photographic content. Keeping PNG may be appropriate when faithful reproduction matters more than the smallest file.",
            ],
          },
          {
            heading: "What image quality should I use?",
            body: [
              "A higher WebP or JPG quality value is not always better, and a lower value is not always appropriate. Lower values generally reduce file size but may introduce visible compression artifacts or loss of detail. Very high values can increase file size without producing a difference most viewers can notice. The default quality here is 80.",
              "As starting points: 90-100 when preserving image quality is the priority, 75-89 for general web images, 60-74 for thumbnails or cases where a smaller file matters more, and below 60 only after checking the visible quality loss yourself.",
              "These ranges are starting points, not absolute visual standards. Results vary with image content and encoding, so compare both the resulting file size and the actual image.",
            ],
          },
          {
            heading: "How much should I reduce an image's file size?",
            body: [
              "There is no single target that applies to every web image. An appropriate file size depends on the pixel dimensions, visual complexity, importance of the image on the page, and the environment in which it will be viewed.",
              "Instead of aiming for an arbitrary number of kilobytes, confirm that the required pixel dimensions are already correct, choose a format suited to the image and its use, adjust quality when using WebP or JPG, compare the original and optimized images visually, and use the smaller file when there is no unacceptable loss of quality.",
              "The goal is not the lowest possible file size. It is the smallest file that still meets the required visual quality.",
            ],
          },
          {
            heading: "Why does image file size matter for websites?",
            body: [
              "When a web page loads, the browser downloads its images along with HTML, CSS, and JavaScript. Large files and image-heavy pages increase the amount of data a visitor must receive. This can make images take longer to appear, especially on mobile or slower connections.",
              "Optimizing web images can help reduce the amount of data transferred by a page, image download time, mobile data usage, and the loading burden on image-heavy pages.",
              "Image optimization alone does not solve every performance issue. Delivery method, loading strategy, caching, and CDN configuration also affect real-world performance.",
            ],
          },
          {
            heading: "What is the difference between image dimensions and file size?",
            body: [
              "The word 'size' can refer to two different properties of an image. Image dimensions are the number of horizontal and vertical pixels, such as 1200 × 630 px. File size is the amount of storage or network data used by the file, such as 842 KB.",
              "This tool changes file size, not dimensions: a 1200 × 630 PNG at 1.84 MB comes back as a 1200 × 630 WebP at 214 KB. Use a separate image resizing or cropping tool when you need to change pixel dimensions or crop to a specific aspect ratio.",
            ],
          },
        ],
        examples: [
          {
            title: "A large PNG screenshot converted to WebP for the web",
            input: "1920 × 1080 PNG at 1.84 MB, output WebP, quality 80",
            result: "1920 × 1080 WebP at 214 KB, saving 1.63 MB (88.4%)",
            note: "PNGs full of photographic detail or gradients gain the most from WebP. The pixel dimensions stay identical.",
          },
          {
            title: "Saving a transparent logo as JPG",
            input: "Transparent PNG, output JPG, quality 85",
            result: "A JPG whose transparent areas are filled with white",
            note: "If the logo sits on anything other than a white background, choose WebP or PNG so the fill does not show as a visible box.",
          },
          {
            title: "Re-saving an already compressed JPG",
            input: "82 KB JPG, output JPG, quality 95",
            result: "104 KB JPG, 22 KB larger than the original",
            note: "Re-encoding a compressed image at a high quality can grow it. When the result is larger, keep the original or try a lower quality.",
          },
          {
            title: "Twelve blog images in one pass",
            input: "12 mixed PNG and JPG files, output WebP, quality 75",
            result: "All 12 results downloaded together as kitfolio-optimized-images.zip",
            note: "One setting applies to every file. Process an image separately when it needs a different quality.",
          },
        ],
        limitations: [
          "Width, height, and aspect ratio are never changed. Reducing the pixel dimensions or cropping to a ratio requires a separate resize and crop tool.",
          "Optimizing does not always produce a smaller file. An already well-compressed image, or a format that does not match the content, can come out larger, in which case the tool reports how much larger instead of a savings percentage.",
          "PNG output uses the browser's own lossless encoder. It will not match a dedicated PNG optimizer and can be larger than the original file.",
          "Re-encoding drops metadata such as EXIF, capture information, and color profiles. EXIF rotation is baked into the pixels first so the image keeps the orientation you see.",
          "Processing happens in device memory. Limits are 50MB per file, 16383px per side, and 100 megapixels in total, but very large images can still fail below those limits on lower-memory devices. The per-side limit is the largest size WebP can represent, and anything above it is rejected rather than silently cropped.",
          "Formats other than PNG, JPG, and WebP, such as GIF, SVG, AVIF, and HEIC, are supported neither as input nor as output.",
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "이미지 크기도 줄어드나요?",
          answer:
            "아니요. 이미지의 가로·세로 픽셀 크기는 원본 그대로 유지됩니다. 이 도구는 포맷과 압축 품질을 변경해 파일 용량을 줄입니다.",
        },
        {
          question: "어떤 이미지 포맷을 지원하나요?",
          answer:
            "PNG, JPG/JPEG, WebP 이미지를 추가하고 WebP, JPG 또는 PNG 형식으로 저장할 수 있습니다.",
        },
        {
          question: "투명 이미지를 JPG로 바꾸면 어떻게 되나요?",
          answer:
            "JPG는 투명 배경을 지원하지 않습니다. PNG 또는 WebP의 투명 영역은 흰색 배경으로 저장됩니다.",
        },
        {
          question: "최적화하면 항상 용량이 줄어드나요?",
          answer:
            "아니요. 이미지 내용, 원본 포맷, 기존 압축 상태와 선택한 품질에 따라 결과가 원본보다 커질 수도 있습니다. 처리 후 원본과 결과 용량을 직접 비교할 수 있습니다.",
        },
        {
          question: "여러 이미지를 한 번에 처리할 수 있나요?",
          answer:
            "네. 여러 이미지를 추가해 같은 설정으로 처리할 수 있으며, 완료된 결과는 개별 다운로드하거나 ZIP으로 한 번에 받을 수 있습니다.",
        },
        {
          question: "이미지가 서버로 업로드되나요?",
          answer:
            "아니요. 이미지 처리는 사용자의 브라우저에서 이루어지며 Kitfolio 서버나 외부 이미지 처리 서비스로 전송되지 않습니다.",
        },
      ],
      en: [
        {
          question: "Does Image Optimizer change image dimensions?",
          answer:
            "No. The original width and height in pixels are preserved. The tool changes the format or compression quality to reduce file size.",
        },
        {
          question: "Which image formats does Image Optimizer support?",
          answer:
            "You can add PNG, JPG/JPEG, and WebP images and save them as WebP, JPG, or PNG files.",
        },
        {
          question: "What happens to transparency when I convert an image to JPG?",
          answer:
            "JPG does not support transparency. Transparent areas in PNG or WebP images are saved with a white background.",
        },
        {
          question: "Does image optimization always make a file smaller?",
          answer:
            "No. The result can be larger depending on the image content, original format, existing compression, and selected quality. You can compare the original and resulting file sizes after processing.",
        },
        {
          question: "Can I optimize multiple images at once?",
          answer:
            "Yes. You can add multiple images, apply the same settings to all of them, and download completed files individually or together in a ZIP file.",
        },
        {
          question: "Are my images uploaded to a server?",
          answer:
            "No. Image processing takes place in your browser, and your files are not sent to Kitfolio servers or external image-processing services.",
        },
      ],
    },
    og: {
      ko: {
        title: "이미지 최적화",
        subtitle: "원본 크기는 그대로, 파일 용량만 줄이기",
      },
      en: {
        title: "Image Optimizer",
        subtitle: "Smaller files, same pixel dimensions",
      },
    },
  },
  {
    slug: "image-resizer-cropper",
    layout: "canvas",
    cat: "design",
    targets: ["designer", "developer", "office-worker"],
    ico: "W×H",
    ready: true,
    indexable: true,
    badge: "Canvas",
    name: { ko: "이미지 리사이즈·크롭", en: "Image Resizer & Cropper" },
    relatedTools: ["image-optimizer", "open-graph-preview", "css-gradient"],
    seo: {
      ko: {
        title: "이미지 리사이즈·크롭 | 사진 크기 조절과 자르기",
        description:
          "PNG, JPG, WebP 이미지를 원하는 픽셀 크기로 조절하거나 1:1, 4:3, 16:9 비율로 자릅니다. 비율을 잠그고 가로·세로를 바꾸거나 남길 영역을 골라 결과 픽셀 크기를 직접 지정할 수 있고, 이미지가 서버로 업로드되지 않고 브라우저에서 바로 처리되는 무료 이미지 리사이즈·크롭 도구입니다.",
        keywords: [
          "이미지 리사이즈",
          "이미지 크기 조절",
          "이미지 자르기",
          "사진 크기 조절",
          "이미지 사이즈 변경",
          "이미지 픽셀 변경",
          "이미지 비율 자르기",
          "사진 자르기",
          "이미지 1:1 자르기",
          "이미지 16:9 자르기",
          "온라인 이미지 리사이즈",
        ],
      },
      en: {
        title: "Image Resizer & Cropper | Resize and Crop Images Online",
        description:
          "Resize PNG, JPG, and WebP images to exact pixel dimensions or crop them to common aspect ratios such as 1:1, 4:3, and 16:9. Lock the aspect ratio while changing width and height, choose exactly which area to keep, and set the output size yourself. All image processing happens locally in your browser with no uploads.",
        keywords: [
          "image resizer",
          "crop image",
          "image cropper",
          "resize image online",
          "change image dimensions",
          "resize image pixels",
          "crop image online",
          "crop image to aspect ratio",
          "square image crop",
          "resize PNG JPG WebP",
        ],
      },
    },
    content: {
      ko: {
        card: "이미지를 원하는 픽셀 크기로 조절하거나 1:1·16:9 같은 비율로 잘라 저장합니다.",
        description:
          "PNG, JPG, WebP 이미지를 원하는 픽셀 크기로 조절하거나 1:1, 4:3, 16:9 비율로 자릅니다. 비율을 잠그고 가로·세로를 바꾸거나 남길 영역을 골라 결과 픽셀 크기를 직접 지정할 수 있습니다. 이미지는 서버로 업로드되지 않고 브라우저 안에서만 처리됩니다.",
        howItWorks: [
          "PNG·JPG·WebP 이미지 추가",
          "Resize 또는 Crop에서 크기와 비율 설정",
          "결과 크기 확인 후 다운로드",
        ],
        aeo: {
          what: "이미지 리사이즈·크롭 도구는 이미지의 가로·세로 픽셀 크기를 변경하거나 원하는 비율과 영역으로 잘라 새 이미지 파일을 만드는 브라우저 도구입니다.",
          who: "웹사이트, SNS, 프로필, 썸네일, 문서 등에 사용할 이미지를 정확한 크기나 비율로 준비해야 하는 디자이너, 메이커, 콘텐츠 제작자에게 적합합니다.",
          how: "PNG, JPG 또는 WebP 이미지를 추가하고 Resize나 Crop 모드를 선택한 뒤 크기와 비율을 설정하면 브라우저에서 결과를 생성해 다운로드할 수 있습니다.",
          why: "별도 이미지 편집 프로그램을 설치하거나 파일을 외부 서버에 업로드하지 않고도 필요한 이미지 규격을 빠르게 만들 수 있습니다.",
        },
        guide: [
          {
            heading: "리사이즈와 크롭 중 무엇을 선택해야 하나요?",
            body: [
              "이미지 리사이즈와 크롭은 모두 결과 이미지의 크기를 바꾸지만 목적은 다릅니다. 리사이즈는 이미지 전체를 유지하면서 픽셀 수를 조절하고, 크롭은 필요한 구도와 비율을 만들기 위해 일부 영역을 제거합니다. 먼저 결과에서 전체 장면이 필요한지, 특정 영역만 남겨야 하는지 판단하면 적합한 모드를 고르기 쉽습니다.",
              "이미지 전체가 결과에 남아야 한다면 Resize를 사용합니다. 예를 들어 2400 × 1600 px 사진 전체를 1200 × 800 px로 줄이면 구도와 3:2 비율은 유지되고 픽셀 수만 감소합니다.",
              "정해진 프레임에 맞추기 위해 이미지 일부를 제거해도 된다면 Crop을 사용합니다. 가로 사진을 정사각형 프로필 이미지로 만들 때는 1:1 영역을 선택하고 피사체가 중앙에 오도록 위치를 조절합니다. 같은 원본이라도 Resize는 2400 × 1600을 1200 × 800으로 줄여 전체 장면을 남기고, Crop은 같은 원본에서 1080 × 1080 영역만 남깁니다.",
              "이미지를 억지로 다른 비율의 width와 height에 맞추면 늘어나거나 눌립니다. 비율이 다른 결과가 필요할 때는 비율 잠금을 해제하기보다 먼저 Crop으로 구도를 맞추는 편이 자연스럽습니다.",
            ],
          },
          {
            heading: "가로세로 비율을 유지해야 하는 이유",
            body: [
              "가로세로 비율은 width와 height의 관계입니다. 1200 × 800과 600 × 400은 픽셀 수는 다르지만 모두 3:2 비율입니다. 원본 비율을 유지해 리사이즈하면 인물이나 사물이 원래 형태대로 보입니다.",
              "비율 잠금을 해제하고 1200 × 800 이미지를 1200 × 630으로 직접 바꾸면 가로 방향으로 눌린 결과가 됩니다. 1200 × 630이 필요하다면 1.90:1에 해당하는 영역을 자르거나, 해당 규격에 가까운 프리셋에서 위치를 조절하는 것이 좋습니다.",
            ],
          },
          {
            heading: "어떤 크롭 비율을 선택해야 하나요?",
            body: [
              "비율은 사용처의 프레임을 기준으로 선택합니다. Free는 규격 없이 불필요한 가장자리만 제거할 때, 1:1은 정사각형 프로필·아바타·일부 피드 이미지에, 4:3은 일반적인 콘텐츠 이미지와 프레젠테이션 소재에 적합합니다.",
              "3:2는 사진 비율을 유지한 인쇄·웹 이미지에, 16:9는 영상 썸네일·와이드 배너·프레젠테이션 화면에, 9:16은 세로형 스토리와 숏폼용 이미지에 주로 쓰입니다.",
              "원형 프로필 이미지는 파일 자체가 원형이 아니라 정사각형입니다. 표시하는 서비스가 화면에서 둘레를 둥글게 깎아 보여줄 뿐이므로, 1:1로 자르고 중요한 부분을 중앙에 두면 됩니다.",
              "플랫폼 규격은 바뀔 수 있으므로 제출 전에 해당 서비스의 현재 권장 픽셀 크기를 확인합니다. 이 도구의 프리셋은 구도를 잡는 비율이며, 실제 제출 규격은 Output width와 height로 맞춥니다.",
            ],
          },
          {
            heading: "픽셀 크기는 어떻게 정해야 하나요?",
            body: [
              "먼저 이미지가 실제로 표시되거나 제출될 크기를 확인합니다. 결과 width와 height를 필요 이상으로 크게 만들면 파일과 처리 부담이 커지고, 너무 작게 만들면 확대해서 볼 때 흐릿해질 수 있습니다.",
              "판단 순서는 다음과 같습니다. 사용할 서비스나 디자인의 요구 규격을 확인하고, 같은 비율이라면 요구되는 실제 픽셀 크기를 Output에 입력합니다. 여러 크기로 사용한다면 가장 큰 실제 사용 크기를 기준으로 결과를 만들고 작은 버전은 별도로 생성합니다. 마지막으로 결과 미리보기에서 텍스트와 가장자리의 선명도를 확인합니다.",
              "웹의 CSS 표시 크기와 이미지 파일의 픽셀 크기는 다른 개념입니다. 브라우저에서 300px 너비로 보이더라도 고밀도 화면을 위해 더 큰 이미지가 필요할 수 있으므로, 프로젝트가 요구하는 이미지 정책이 있다면 그 기준을 우선합니다.",
            ],
          },
          {
            heading: "원본보다 이미지를 크게 만들어도 되나요?",
            body: [
              "기술적으로는 가능하지만 화질이 좋아지는 것은 아닙니다. 확대 과정은 기존 픽셀 사이의 값을 계산해 더 많은 픽셀을 만들 뿐, 원본에 없던 머리카락이나 글자 가장자리 같은 디테일을 복원하지 못합니다.",
              "작은 로고나 UI 캡처를 크게 만들면 경계가 흐려질 수 있고, 작은 사진은 뭉개짐이 눈에 띌 수 있습니다. 가능하면 필요한 결과 크기 이상의 원본을 사용하고, 확대가 불가피하다면 결과를 실제 사용 크기로 확인합니다.",
            ],
          },
          {
            heading: "자를 때 피사체가 어색해지지 않게 하려면",
            body: [
              "비율 프리셋을 선택한 뒤 크롭 박스를 바로 확정하지 말고, 중요한 피사체와 텍스트가 경계에 너무 가까운지 확인합니다. 프로필 이미지는 중앙에 얼굴을 두되 머리나 턱이 잘리지 않도록 여유를 남기고, 썸네일은 작은 화면에서도 주제가 식별되는지 확인합니다.",
              "텍스트가 포함된 이미지는 글자의 일부가 잘리지 않는지 특히 주의합니다. 여러 플랫폼에서 이미지 가장자리를 추가로 가리는 경우가 있으므로, 로고와 핵심 텍스트를 프레임 끝에 붙이지 않는 편이 안전합니다.",
            ],
          },
          {
            heading: "PNG, JPG, WebP 중 무엇으로 저장해야 하나요?",
            body: [
              "출력 포맷은 이미지의 내용과 사용할 환경을 기준으로 정합니다. PNG는 투명 배경, 로고, 아이콘, 텍스트가 포함된 그래픽처럼 선명한 경계가 중요할 때 쓰고, JPG는 투명도가 필요 없는 사진처럼 색 변화가 많은 이미지에 적합합니다.",
              "WebP는 웹사이트에서 사진과 그래픽을 효율적으로 쓰고 싶을 때 선택하며, Original은 제출처가 원본과 같은 포맷을 요구하거나 별도 변환이 필요하지 않을 때 씁니다.",
              "이 도구의 중심 목적은 픽셀 크기와 크롭 영역 조절입니다. 파일 용량을 비교하며 줄이는 것이 목적이라면 결과를 만든 뒤 이미지 최적화 도구를 사용합니다.",
            ],
          },
        ],
        examples: [
          {
            title: "가로 사진을 정사각형 프로필로",
            input: "4032 × 3024 JPG · Crop · 비율 1:1 · 결과 1080 × 1080",
            result: "profile-cropped-1080x1080.jpg",
            note: "1:1 프리셋을 고르면 현재 선택 영역의 중심을 유지한 정사각형이 만들어집니다. 얼굴이 중앙에 오도록 영역을 끌어 옮긴 뒤 결과 크기만 1080으로 바꿉니다.",
          },
          {
            title: "블로그 대표 이미지를 정해진 규격으로",
            input: "2400 × 1600 PNG · Resize · 비율 잠금 · 가로 1200",
            result: "1200 × 800 · 배율 50% · hero-1200x800.png",
            note: "비율 잠금이 켜져 있으면 가로만 입력해도 세로가 원본 비율로 계산됩니다. 50% 빠른 선택으로도 같은 결과가 나옵니다.",
          },
          {
            title: "투명 배경 로고를 JPG로 저장",
            input: "투명 배경 PNG · Resize · 출력 JPG · 품질 90",
            result: "투명 영역이 흰색으로 채워진 JPG",
            note: "흰색이 아닌 배경 위에 얹을 로고라면 JPG 대신 PNG나 WebP로 저장해야 경계가 드러나지 않습니다.",
          },
          {
            title: "세로형 숏폼 썸네일 만들기",
            input: "1920 × 1080 PNG · Crop · 비율 9:16 · 결과 1080 × 1920",
            result: "1080 × 1920 · thumb-cropped-1080x1920.png",
            note: "가로 원본에서 9:16을 고르면 선택 영역이 좌우로 좁아집니다. 이때 결과를 1080 × 1920으로 지정하면 선택 영역보다 커져 확대 안내가 함께 표시됩니다.",
          },
        ],
        limitations: [
          "한 번에 이미지 한 장만 편집합니다. 여러 장을 같은 설정으로 한 번에 리사이즈하는 일괄 처리는 지원하지 않습니다.",
          "회전·반전, 배경색 선택, 여백 추가, 밝기·대비 같은 보정은 다루지 않습니다. 이 도구가 바꾸는 것은 픽셀 크기와 남길 영역뿐입니다.",
          "원형 마스크 자체를 파일 모양으로 저장하지는 않습니다. 원형 프로필은 1:1로 자른 정사각형 파일로 준비합니다.",
          "원본보다 크게 만들 수는 있지만 없던 디테일이 생기지는 않습니다. 확대할수록 경계가 흐려질 수 있습니다.",
          "결과는 새로 인코딩된 파일입니다. EXIF, 촬영 정보, 색 프로파일 같은 메타데이터는 남지 않으며, EXIF 회전 정보는 픽셀에 미리 적용해 보이는 방향을 유지합니다.",
          "처리는 기기 메모리 안에서 이뤄집니다. 파일 50MB, 한 변 16383px, 전체 100메가픽셀을 입력·출력 상한으로 두지만, 기기 사양에 따라 그 이하에서도 실패할 수 있습니다.",
          "GIF, SVG, AVIF, HEIC 등 PNG·JPG·WebP가 아닌 형식은 입력·출력 모두 지원하지 않습니다.",
        ],
      },
      en: {
        card: "Resize an image to exact pixel dimensions, or crop it to ratios such as 1:1 and 16:9.",
        description:
          "Resize PNG, JPG, and WebP images to exact pixel dimensions or crop them to common aspect ratios such as 1:1, 4:3, and 16:9. Lock the aspect ratio while changing width and height, choose exactly which area of the image to keep, and set the output size yourself. Your image is processed in your browser and is never uploaded.",
        howItWorks: [
          "Add a PNG, JPG or WebP image",
          "Set the size or crop ratio in Resize or Crop",
          "Check the output dimensions, then download",
        ],
        aeo: {
          what: "Image Resizer & Cropper is a browser-based tool that changes an image's pixel dimensions or creates a new image from a selected area and aspect ratio.",
          who: "It is designed for designers, makers, and content creators who need images with exact dimensions or aspect ratios for websites, social media, profiles, thumbnails, and documents.",
          how: "Add a PNG, JPG, or WebP image, choose Resize or Crop, set the dimensions or crop ratio, and download the result created locally in your browser.",
          why: "It lets you prepare images to a required size without installing an image editor or uploading files to an external server.",
        },
        guide: [
          {
            heading: "Should I resize or crop an image?",
            body: [
              "Resizing and cropping can both change the dimensions of the resulting image, but they solve different problems. Resizing keeps the complete image and changes its pixel count. Cropping removes part of the image to create a particular composition or aspect ratio. Start by deciding whether the whole scene must remain or only a selected area is needed.",
              "Use Resize when the complete image must remain visible. Resizing a 2400 × 1600 px photo to 1200 × 800 px preserves the composition and its 3:2 aspect ratio while reducing the pixel dimensions.",
              "Use Crop when part of the image can be removed to fit a required frame. To create a square profile image from a landscape photo, select a 1:1 area and position the subject within it. From the same source, Resize turns 2400 × 1600 into 1200 × 800 with the full scene intact, while Crop keeps only a 1080 × 1080 region.",
              "Forcing an image into width and height values with a different ratio stretches or squeezes it. When you need a different aspect ratio, crop the composition instead of simply unlocking the ratio.",
            ],
          },
          {
            heading: "Why should I preserve the aspect ratio?",
            body: [
              "Aspect ratio describes the relationship between width and height. 1200 × 800 and 600 × 400 have different pixel counts but share a 3:2 ratio. Preserving that ratio keeps people and objects in their original proportions.",
              "Changing a 1200 × 800 image directly to 1200 × 630 with the ratio unlocked distorts the image. If you need 1200 × 630, crop a region with the required 1.90:1 ratio and then set the output dimensions.",
            ],
          },
          {
            heading: "Which crop ratio should I choose?",
            body: [
              "Choose a ratio based on the shape required by the destination. Free removes unwanted edges without a fixed format, 1:1 suits square profiles, avatars, and some feed images, and 4:3 suits general content images and presentation assets.",
              "3:2 keeps a photographic ratio for print and web, 16:9 suits video thumbnails, wide banners, and presentation screens, and 9:16 suits vertical stories and short-form media.",
              "A circular profile picture is still a square file. The destination service draws the round mask on screen, so crop to 1:1 and keep the important part centered.",
              "Platform requirements can change, so check the destination's current pixel specifications before submitting an image. The preset defines the crop shape; use Output width and height to match the exact required dimensions.",
            ],
          },
          {
            heading: "How should I choose image dimensions in pixels?",
            body: [
              "First check the size at which the image will be displayed or submitted. Making the file much larger than necessary adds processing and file weight, while an image that is too small may look blurry when enlarged.",
              "Check the required dimensions in the destination service or design, then enter those exact pixel dimensions while keeping the required ratio. If several sizes are needed, create the largest practical version first and generate smaller versions separately. Finally, inspect text and sharp edges in the result preview.",
              "CSS display size and image pixel dimensions are different. An image displayed at 300 CSS pixels may use a larger source on a high-density screen. Follow the image policy of the destination project when one exists.",
            ],
          },
          {
            heading: "Can I make an image larger than the original?",
            body: [
              "Yes, but increasing the pixel dimensions does not improve the original detail. Upscaling estimates new pixels between existing ones; it cannot recover details that were never present in the source.",
              "Small logos and UI captures may develop soft edges, and small photos may look blurred. Use a source at least as large as the required output whenever possible, and inspect an upscaled result at its actual display size.",
            ],
          },
          {
            heading: "How can I avoid awkward crops?",
            body: [
              "After choosing a ratio, check whether important subjects or text are too close to the crop boundary. Leave enough room around a face so the head and chin are not clipped, and make sure a thumbnail remains understandable at a small size.",
              "Be especially careful with text inside an image. Some destinations may cover or trim the edges, so keep logos and essential text away from the frame boundary.",
            ],
          },
          {
            heading: "Should I save the result as PNG, JPG, or WebP?",
            body: [
              "Choose the output format based on the image and destination. PNG suits transparent backgrounds, logos, icons, UI captures, and graphics with sharp text, while JPG suits photographs with no transparency requirement.",
              "WebP is an efficient choice for delivering both photos and graphics on the web, and Original keeps the incoming format for destinations that require it or when no conversion is needed.",
              "This tool focuses on pixel dimensions and crop regions. If the next goal is to compare and reduce file size, send the result to Image Optimizer.",
            ],
          },
        ],
        examples: [
          {
            title: "A landscape photo turned into a square profile picture",
            input: "4032 × 3024 JPG, Crop, 1:1 ratio, output 1080 × 1080",
            result: "profile-cropped-1080x1080.jpg",
            note: "Choosing 1:1 builds the largest square that keeps the current selection centered. Drag the area so the face sits in the middle, then set the output size to 1080.",
          },
          {
            title: "A blog hero image resized to a fixed width",
            input: "2400 × 1600 PNG, Resize, ratio locked, width 1200",
            result: "1200 × 800 at 50% scale, hero-1200x800.png",
            note: "With the ratio locked, entering only the width calculates the height from the original proportions. The 50% quick preset produces the same result.",
          },
          {
            title: "Saving a transparent logo as JPG",
            input: "Transparent PNG, Resize, output JPG, quality 90",
            result: "A JPG whose transparent areas are filled with white",
            note: "If the logo sits on anything other than a white background, save it as PNG or WebP so the fill does not show as a visible box.",
          },
          {
            title: "Building a vertical short-form thumbnail",
            input: "1920 × 1080 PNG, Crop, 9:16 ratio, output 1080 × 1920",
            result: "1080 × 1920, thumb-cropped-1080x1920.png",
            note: "A 9:16 crop of a landscape source is narrow, so asking for 1080 × 1920 upscales it and the tool shows the upscaling notice alongside the output size.",
          },
        ],
        limitations: [
          "One image is edited at a time. Batch resizing several files with the same settings is not supported.",
          "Rotation, flipping, background color, added padding, and adjustments such as brightness or contrast are out of scope. This tool changes pixel dimensions and the area you keep, nothing else.",
          "A circular mask is never saved as the shape of the file. Prepare round profile pictures as square 1:1 crops.",
          "You can make an image larger than the original, but upscaling cannot add detail that was not captured. Edges get softer the further you push it.",
          "The result is a newly encoded file. Metadata such as EXIF, capture information, and color profiles is not carried over; EXIF rotation is baked into the pixels first so the image keeps the orientation you see.",
          "Processing happens in device memory. Limits are 50MB per file and 16383px per side and 100 megapixels for both input and output, but very large images can still fail below those limits on lower-memory devices.",
          "Formats other than PNG, JPG, and WebP, such as GIF, SVG, AVIF, and HEIC, are supported neither as input nor as output.",
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "이미지 리사이즈와 크롭은 무엇이 다른가요?",
          answer:
            "리사이즈는 이미지 전체를 유지한 채 가로·세로 픽셀 수를 바꿉니다. 크롭은 이미지에서 남길 영역을 선택해 바깥 부분을 제거합니다.",
        },
        {
          question: "원본 비율을 유지하면서 크기를 바꿀 수 있나요?",
          answer:
            "네. Resize 모드의 비율 잠금은 기본으로 켜져 있으며, width나 height 중 하나를 바꾸면 다른 값이 원본 비율에 맞게 자동 계산됩니다.",
        },
        {
          question: "어떤 비율로 이미지를 자를 수 있나요?",
          answer:
            "자유 비율과 1:1, 4:3, 3:2, 16:9, 9:16 프리셋을 제공합니다. 선택한 비율 안에서 남길 위치를 직접 조절할 수 있습니다.",
        },
        {
          question: "이미지를 크게 만들면 화질도 좋아지나요?",
          answer:
            "아니요. 출력 픽셀 수는 늘릴 수 있지만 원본에 없던 디테일이 생기지는 않습니다. 원본보다 크게 확대하면 이미지가 흐릿해질 수 있습니다.",
        },
        {
          question: "어떤 이미지 포맷을 지원하나요?",
          answer:
            "PNG, JPG/JPEG, WebP 이미지를 불러오고 PNG, JPG 또는 WebP로 저장할 수 있습니다. 투명 이미지를 JPG로 저장하면 투명 영역은 흰색이 됩니다.",
        },
        {
          question: "휴대폰으로 찍은 사진의 방향도 그대로 유지되나요?",
          answer:
            "네. 미리보기와 크롭 좌표 모두 EXIF 회전이 적용된 표시 방향을 기준으로 계산되므로, 화면에서 보는 방향 그대로 결과가 저장됩니다.",
        },
        {
          question: "이미지가 서버로 업로드되나요?",
          answer:
            "아니요. 이미지는 사용자의 브라우저에서 처리되며 Kitfolio 서버나 외부 이미지 처리 서비스로 전송되지 않습니다.",
        },
      ],
      en: [
        {
          question: "What is the difference between resizing and cropping an image?",
          answer:
            "Resizing changes the width and height in pixels while keeping the entire image. Cropping removes areas outside the region you choose to keep.",
        },
        {
          question: "Can I resize an image without changing its aspect ratio?",
          answer:
            "Yes. Aspect ratio lock is enabled by default in Resize mode. Changing either width or height automatically calculates the other dimension from the original ratio.",
        },
        {
          question: "Which aspect ratios can I use for cropping?",
          answer:
            "You can crop freely or choose 1:1, 4:3, 3:2, 16:9, or 9:16. After choosing a ratio, you can move the crop area to control which part of the image remains.",
        },
        {
          question: "Does making an image larger improve its quality?",
          answer:
            "No. You can increase the output dimensions, but resizing cannot create detail that is missing from the original. Upscaling may make the result look blurry.",
        },
        {
          question: "Which image formats are supported?",
          answer:
            "You can open PNG, JPG/JPEG, and WebP images and save the result as PNG, JPG, or WebP. Transparent areas are filled with white when the result is saved as JPG.",
        },
        {
          question: "Do photos taken on a phone keep their orientation?",
          answer:
            "Yes. Both the preview and the crop coordinates use the display orientation with EXIF rotation applied, so the result is saved the way you see it on screen.",
        },
        {
          question: "Is my image uploaded to a server?",
          answer:
            "No. Your image is processed in your browser and is not sent to Kitfolio servers or external image-processing services.",
        },
      ],
    },
    og: {
      ko: {
        title: "이미지 리사이즈·크롭",
        subtitle: "원하는 픽셀 크기와 비율로 바로 조절하세요",
      },
      en: {
        title: "Image Resizer & Cropper",
        subtitle: "Resize and crop images to exact dimensions",
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

/** 도구가 검색 색인 대상인지(=noindex 아닌지). AdUnit 등 광고 렌더링 가드가 참조하는 단일 출처. */
export function isToolIndexable(slug: string): boolean {
  return getTool(slug).indexable;
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

/** AEO 명시 문단을 Q&A 목록으로 변환: ToolAbout 섹션과 FAQPage JSON-LD가 공유.
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
    // 2026-09: noindex 정책 전면 폐기, 전 페이지 색인 허용 (URL 통합 작업지시서 결정 G).
    // indexable 필드 자체는 남겨둔다: sitemap 포함 여부·허브 ItemList JSON-LD·
    // AdUnit 광고 가드(isToolIndexable)가 여전히 이 값을 참조하므로, 앞으로
    // 콘텐츠가 덜 갖춰진 새 도구를 추가할 때도 안전장치로 계속 쓴다.
    alternates: {
      canonical: url,
      languages: { "ko-KR": koUrl, "en-US": enUrl, "x-default": koUrl },
    },
    openGraph: {
      title: `${t.og?.[lang].title ?? s.title!} | Kitfolio`,
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

/** 도구 페이지 JSON-LD: WebApplication (+ FAQ가 있으면 FAQPage 포함 배열) */
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
  // AEO 명시 문단 + FAQ: 페이지에 보이는 Q&A 전부를 FAQPage로 노출
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
      // 검색엔진용 ItemList 는 색인 대상 도구만. (화면 목록은 ready 전체를 그대로 보여준다)
      itemListElement: TOOLS.filter((t) => t.ready && t.indexable).map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: t.seo[lang].title!,
        url: SITE.url + localizedHref(lang, "/" + t.slug),
      })),
    },
  ];
}


/* ============================================================
   ⑦ 콘텐츠 품질 게이트: indexable 도구 검증

   "검색 랜딩 페이지로 내보내도 되는가"를 구조로 판정한다.
   글자 수가 아니라 **필수 콘텐츠 구조의 존재 여부**를 본다:
   단순 AEO/FAQ만 있는 페이지는 indexable 이 될 수 없다.

   scripts/validate-content.ts 에서 실행 (npm run validate:content).
   ============================================================ */

/** indexable 도구가 갖춰야 하는 최소 구조 */
const INDEXABLE_RULES = {
  /** 심화 가이드 최소 섹션 수 */
  minGuideSections: 2,
  /** 실전 예제 최소 개수 */
  minExamples: 1,
  /** 제약·엣지케이스 최소 개수 */
  minLimitations: 2,
  /** FAQ 최소 개수 */
  minFaq: 3,
  /** 관련 도구 최소 개수 */
  minRelated: 1,
} as const;

export type ValidationIssue = { slug: string; problems: string[] };

/**
 * indexable=true 인 모든 도구가 품질 조건을 만족하는지 검사한다.
 * 위반 도구의 slug 와 누락 필드 목록을 반환 (빈 배열 = 통과).
 *
 * 언어별로 따로 검사한다: 한쪽 언어만 완성된 도구는 indexable 이 될 수 없다.
 */
export function validateIndexableTools(): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const langs: Lang[] = ["ko", "en"];

  for (const t of TOOLS) {
    if (!t.indexable) continue;
    const problems: string[] = [];

    if (!t.ready) problems.push("ready=false 인데 indexable=true (색인 대상은 동작하는 도구여야 함)");
    if ((t.relatedTools?.length ?? 0) < INDEXABLE_RULES.minRelated) {
      problems.push(`relatedTools: ${INDEXABLE_RULES.minRelated}개 이상 필요`);
    }
    for (const s of t.relatedTools ?? []) {
      if (!TOOLS.some((x) => x.slug === s)) problems.push(`relatedTools: 알 수 없는 slug "${s}"`);
    }

    for (const lang of langs) {
      const seo = t.seo[lang];
      const c = t.content[lang];
      const at = (msg: string) => problems.push(`[${lang}] ${msg}`);

      if (!seo?.title?.trim()) at("seo.title 누락");
      if (!seo?.description?.trim()) at("seo.description 누락");
      if (!c?.description?.trim()) at("content.description 누락");
      if (!c?.howItWorks?.length) at("content.howItWorks 누락");
      if (!c?.aeo) at("content.aeo 누락 (What/Who/How/Why)");

      const guide = c?.guide ?? [];
      if (guide.length < INDEXABLE_RULES.minGuideSections) {
        at(`content.guide: 섹션 ${INDEXABLE_RULES.minGuideSections}개 이상 필요 (현재 ${guide.length})`);
      }
      if (guide.some((g) => !g.heading?.trim() || !g.body?.length)) {
        at("content.guide: heading 또는 body 가 빈 섹션이 있음");
      }

      const examples = c?.examples ?? [];
      if (examples.length < INDEXABLE_RULES.minExamples) {
        at(`content.examples: 실전 예제 ${INDEXABLE_RULES.minExamples}개 이상 필요 (현재 ${examples.length})`);
      }
      if (examples.some((e) => !e.title?.trim() || !e.input?.trim() || !e.result?.trim())) {
        at("content.examples: title/input/result 가 빈 항목이 있음");
      }

      const limitations = c?.limitations ?? [];
      if (limitations.length < INDEXABLE_RULES.minLimitations) {
        at(`content.limitations: 엣지케이스·제약 ${INDEXABLE_RULES.minLimitations}개 이상 필요 (현재 ${limitations.length})`);
      }

      if ((t.faq?.[lang]?.length ?? 0) < INDEXABLE_RULES.minFaq) {
        at(`faq: ${INDEXABLE_RULES.minFaq}개 이상 필요 (현재 ${t.faq?.[lang]?.length ?? 0})`);
      }
      if (!t.og?.[lang]) at("og 누락 (개별 OG 메타데이터 필수)");

      // 외부 기준에 의존하는 도구는 출처와 검증일을 함께 요구한다.
      if (c?.sources?.length && !t.verifiedAt) {
        at("sources 가 있으면 verifiedAt(최근 검증일)도 필요");
      }
    }

    if (problems.length) issues.push({ slug: t.slug, problems });
  }
  return issues;
}
