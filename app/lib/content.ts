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
   *  ready 와 완전히 별개다. false 여도 페이지는 정상 동작하고 UI에도 그대로 노출되며,
   *  sitemap 제외 + robots noindex,follow 만 적용된다.
   *  true 로 올리려면 validateIndexableTools() 의 품질 조건을 통과해야 한다. */
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

/** 사이트 운영자: 블로그 author(Person) · About 페이지 · JSON-LD 가 공유하는 단일 출처.
 *
 *  실명을 공개하지 않되, **일관된 운영자명과 역할, 책임 주체**는 항상 확인되게 한다.
 *  (AdSense 심사·E-E-A-T 관점에서 "누가 쓰고 누가 책임지는가"가 드러나야 한다) */
export const AUTHOR = {
  /** 일관된 운영자명: 리포지토리·연락처와 동일한 식별자 */
  name: "joyfive",
  /** 프로필 대신 운영 정보를 담은 About 페이지를 author.url 로 쓴다 */
  path: "/about",
  role: { ko: "Kitfolio 운영자", en: "Maker of Kitfolio" },
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
export const LEGAL_EMAIL = "joy_five@kakao.com";
export const LEGAL_EFFECTIVE = { ko: "2026년 7월 1일", en: "July 1, 2026" };

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
              "Kitfolio는 개인이 직접 기획하고 운영하는 프로젝트이며, 실제 업무에서 필요하다고 느낀 도구를 우선 만듭니다. 도구 제안이나 의견은 언제든 환영합니다: 문의 페이지를 통해 연락해 주세요.",
            ],
          },
          {
            heading: "누가 운영하나요",
            body: [
              "Kitfolio는 **joyfive**라는 이름으로 활동하는 한 사람이 기획·개발·운영·콘텐츠 작성을 모두 담당합니다. 외부 기고자나 자동 생성 콘텐츠 공급자는 없으며, 사이트의 모든 도구와 글에 대한 책임은 운영자 개인에게 있습니다.",
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
              "Kitfolio is planned and run by an individual maker, prioritizing tools that were genuinely needed in real work. Tool suggestions and feedback are always welcome: please reach out via the Contact page.",
            ],
          },
          {
            heading: "Who runs Kitfolio",
            body: [
              "Kitfolio is planned, built, operated and written by one person, working under the name **joyfive**. There are no outside contributors and no syndicated or auto-generated content, so responsibility for every tool and every article on the site rests with the maker personally.",
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
              "아래 이메일 주소로 메시지를 보내주세요. 개인이 운영하는 서비스라 답변에 다소 시간이 걸릴 수 있는 점 양해 부탁드립니다.",
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
              "Please send a message to the email address below. As a service run by one person, replies may take a little time: thank you for your patience.",
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
          "Kitfolio(이하 '본 사이트')는 이용자의 개인정보를 중요시하며 「개인정보 보호법」 등 관련 법령을 준수합니다. 본 방침은 이용자의 개인정보가 어떤 용도와 방식으로 처리되며, 보호를 위해 어떤 조치가 취해지는지 안내합니다.",
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
              "본 사이트 이용 중 발생하는 개인정보 보호 관련 문의는 아래 이메일로 연락해 주시기 바랍니다.",
            ],
          },
        ],
        effectiveLabel: "시행일자",
        contactLabel: "문의 이메일",
      },
      en: {
        title: "Privacy Policy",
        intro:
          "Kitfolio (\"we\", \"our\", or \"the Website\") values the privacy of our users and complies with applicable data protection laws. This Privacy Policy explains how we handle information when you visit and use our website.",
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
            heading: "5. Contact",
            body: [
              "If you have any questions or concerns regarding this Privacy Policy, please contact us at the email address below.",
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
          "본 약관은 Kitfolio(이하 '본 사이트')가 제공하는 모든 웹 도구 및 서비스(이하 '서비스')의 이용 조건과 절차, 이용자와 본 사이트의 권리·의무 및 책임 사항을 규정합니다.",
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
              "본 사이트의 디자인·로고·소스코드 구조 및 콘텐츠 레지스트리에 대한 지적재산권은 본 사이트 운영자에게 있습니다.",
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
          "These Terms of Service (\"Terms\") govern the use of the web tools and services (the \"Service\") provided by Kitfolio (\"we\", \"our\", or \"the Website\"), defining the rights, obligations, and responsibilities of both users and the Website.",
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
              "All intellectual property rights concerning the Website's design, logo, source code structure, and content registry belong to the owner of Kitfolio.",
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
    indexable: false,
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
  {
    slug: "rem-to-px",
    layout: "card",
    cat: "dev",
    targets: ["developer", "designer"],
    ico: "rem",
    ready: true,
    indexable: true,
    badge: "Clean SaaS",
    name: { ko: "Rem → Px 변환기", en: "Rem to Px Converter" },
    relatedTools: ["tailwind-palette-generator", "css-gradient", "json-formatter"],
    seo: {
      ko: {
        title: "Rem to Px 변환기 | CSS 단위 변환",
        description:
          "rem 값을 픽셀(px)로, 또는 픽셀을 rem으로 즉시 변환합니다. 루트 폰트 크기를 직접 설정하고 자주 쓰는 예시값을 클릭해 바로 입력하세요. 모든 계산은 브라우저 안에서만 이루어집니다.",
        keywords: ["rem to px", "rem px 변환", "rem 변환기", "css 단위 변환", "px to rem"],
      },
      en: {
        title: "Rem to Px Converter | CSS Unit Converter",
        description:
          "Convert rem values to pixels (px) or pixels to rem instantly. Set a custom root font size and click quick examples to fill the input in one step. Everything runs in your browser: no login, no installation.",
        keywords: ["rem to px", "rem to pixels", "px to rem", "css unit converter", "rem converter"],
      },
    },
    content: {
      ko: {
        card: "rem ↔ px 즉시 변환. 루트 폰트 크기 설정 지원.",
        description:
          "rem 값을 픽셀(px)로, 또는 픽셀을 rem으로 즉시 변환합니다. 루트 폰트 크기를 직접 설정하고 자주 쓰는 예시값을 클릭해 바로 입력하세요. 모든 계산은 브라우저 안에서만 이루어집니다.",
        howItWorks: ["rem 또는 px 값 입력", "루트 폰트 크기 설정 (기본값 16)", "변환 결과 확인 및 복사"],
        aeo: {
          what: "Rem to Px 변환기는 CSS 상대 단위 rem 값을 픽셀(px)로, 또는 픽셀을 rem으로 즉시 변환해주는 도구입니다.",
          who: "CSS 레이아웃에서 rem과 픽셀 단위를 함께 쓰는 프론트엔드 개발자와 UI 디자이너를 위한 도구입니다.",
          how: "rem 또는 px 값을 입력하고 루트 폰트 크기를 설정하면 브라우저 안에서 즉시 변환 결과를 보여줍니다. Swap으로 방향을 바꿀 수 있습니다.",
          why: "반응형 디자인에서 px와 rem을 오갈 때 매번 계산할 필요 없이 빠르게 정확한 값을 얻을 수 있습니다.",
        },
        guide: [
          {
            heading: "rem은 왜 접근성에 유리할까",
            body: [
              "rem(root em)은 항상 HTML 루트 요소의 폰트 크기를 기준으로 계산됩니다. 사용자가 브라우저 기본 글자 크기를 키우면 rem으로 잡은 글꼴·여백·레이아웃이 함께 확대되어, 시력이 낮은 사용자에게도 화면이 자연스럽게 커집니다. 반면 px로 고정한 값은 사용자가 글자를 키워도 그대로라 접근성이 떨어집니다. 그래서 폰트 크기와 간격을 rem으로 설계하는 팀이 많습니다.",
              "디자인 시안은 보통 px로 전달되지만 구현은 rem으로 하는 경우가 많아, 둘 사이를 오가는 변환이 자주 필요합니다. 이 변환기는 그 왕복을 한 번에 처리합니다.",
            ],
          },
          {
            heading: "루트 폰트 크기를 프로젝트 값과 맞추세요",
            body: [
              "1rem은 루트 폰트 크기와 같습니다. 대부분의 브라우저 기본값은 16px이라 1rem = 16px, 1.5rem = 24px이 됩니다. 하지만 `html { font-size: 62.5% }`처럼 루트 크기를 바꾼 프로젝트에서는 1rem이 10px이 되기도 합니다. 정확한 변환을 위해 계산기의 루트 폰트 크기를 실제 프로젝트 설정과 동일하게 맞추세요.",
              "em은 부모 요소 기준이라 중첩되면 값이 누적되지만, rem은 언제나 루트 기준이라 예측이 쉽습니다. 모든 변환은 브라우저 안에서 이루어지며 입력값은 서버로 전송되지 않습니다.",
            ],
          },
        ],
              examples: [
          {
            title: "디자인 시안의 px 값을 rem으로 옮기기",
            input: "24px, 루트 폰트 크기 16px",
            result: "1.5rem",
            note: "디자인 도구는 px로 값을 주지만 접근성을 지키려면 폰트·여백을 rem으로 쓰는 편이 좋습니다. 16으로 나눈다는 규칙만 알면 되지만, 시안 하나에 수십 개 값이 있을 때는 계산기를 여는 편이 빠릅니다.",
          },
          {
            title: "루트 폰트 크기를 바꾼 프로젝트에서 환산하기",
            input: "24px, 루트 폰트 크기 10px",
            result: "2.4rem",
            note: "html에 font-size: 62.5%를 적용해 루트를 10px로 맞춘 코드베이스가 있습니다. 이때 16 기준으로 계산하면 값이 전부 어긋나므로, 루트 폰트 크기 입력을 실제 값으로 바꿔야 합니다.",
          },
          {
            title: "사용자가 브라우저 기본 글꼴을 키웠을 때의 실제 크기 확인",
            input: "1.5rem, 루트 폰트 크기 20px",
            result: "30px",
            note: "rem을 쓰는 이유가 여기 있습니다. 사용자가 브라우저 설정에서 기본 글꼴을 20px로 올리면 같은 1.5rem이 30px로 커집니다. px로 고정했다면 24px 그대로여서 확대가 반영되지 않습니다.",
          },
        ],
        limitations: [
          "rem은 항상 루트(html) 요소의 폰트 크기를 기준으로 합니다. 부모 요소 기준으로 커지는 값이 필요하다면 em을 써야 하며, 이때는 em → px 변환기를 사용하세요.",
          "여기서 쓰는 루트 폰트 크기는 입력값일 뿐입니다. 실제 페이지에서는 사용자의 브라우저 글꼴 설정이 루트 크기를 바꾸므로, 변환 결과는 \"루트가 이 값일 때의 px\"로 읽어야 합니다.",
          "미디어 쿼리 안의 rem은 루트 요소의 font-size가 아니라 브라우저 기본 글꼴을 기준으로 해석됩니다. html { font-size: 10px } 를 선언했더라도 @media (min-width: 40rem) 는 여전히 640px(16px 기준)입니다.",
          "border-width처럼 소수점 px가 기기 픽셀에 정확히 떨어지지 않는 속성에서는 브라우저가 반올림해 렌더링합니다. 변환 결과와 개발자 도구에 찍히는 실제 값이 0.5px 정도 다를 수 있습니다.",
        ],
      },
      en: {
        card: "Convert rem ↔ px instantly. Supports custom root font size.",
        description:
          "Convert rem values to pixels (px) or pixels to rem instantly. Set a custom root font size and click quick examples to fill the input in one step. Everything runs in your browser: no login, no installation.",
        howItWorks: ["Enter a rem or px value", "Set root font size (default 16)", "Copy the converted result"],
        aeo: {
          what: "Rem to Px Converter is a tool that instantly converts CSS rem values to pixels (px) and back.",
          who: "It is for front-end developers and UI designers who work with both rem and pixel units in CSS layouts.",
          how: "Enter a rem or px value and set your root font size; the converted result appears instantly in your browser. Use Swap to flip the direction.",
          why: "It saves repeated manual calculations when switching between px and rem in responsive design workflows.",
        },
        guide: [
          {
            heading: "Why rem is better for accessibility",
            body: [
              "rem (root em) is always calculated from the font size of the HTML root element. When a user increases their browser's default text size, everything sized in rem: fonts, spacing, layout: scales up with it, so the page grows naturally for people with low vision. Values fixed in px stay put no matter what the user does, which hurts accessibility. That's why many teams size typography and spacing in rem.",
              "Designs usually arrive in px while implementation happens in rem, so you constantly move between the two. This converter handles that round trip in one step.",
            ],
          },
          {
            heading: "Match the root font size to your project",
            body: [
              "1rem equals the root font size. Most browsers default to 16px, making 1rem = 16px and 1.5rem = 24px. But a project that changes the root (e.g. `html { font-size: 62.5% }`) can make 1rem equal 10px. For an accurate result, set the converter's root font size to match your actual project setup.",
              "Unlike em, which is relative to the parent and compounds when nested, rem is always relative to the root, so it stays predictable. All conversion runs in your browser and your input is never sent to a server.",
            ],
          },
        ],
              examples: [
          {
            title: "Porting px values from a design file to rem",
            input: "24px with a 16px root font size",
            result: "1.5rem",
            note: "Design tools hand you px, but font sizes and spacing are better expressed in rem for accessibility. The rule is just \"divide by 16\", yet with dozens of values in one screen it is faster to use the converter.",
          },
          {
            title: "Converting in a project that changed the root font size",
            input: "24px with a 10px root font size",
            result: "2.4rem",
            note: "Some codebases set html { font-size: 62.5% } to make the root 10px. Calculating against 16 there throws every value off, so set the root font size field to the real value.",
          },
          {
            title: "Checking the real size when a visitor enlarges their default font",
            input: "1.5rem with a 20px root font size",
            result: "30px",
            note: "This is the reason to use rem at all. If someone raises their browser's default font to 20px, the same 1.5rem grows to 30px. Hard-coded 24px would stay at 24px and ignore the preference.",
          },
        ],
        limitations: [
          "rem is always relative to the root (html) element's font size. If you need a value that scales with the parent element instead, use em and the em to px converter.",
          "The root font size here is only an input. On a real page the visitor's browser font setting determines it, so read the output as \"the px value when the root is this size\".",
          "Inside media queries, rem resolves against the browser's default font size, not the html element's font-size. Even with html { font-size: 10px }, @media (min-width: 40rem) still means 640px.",
          "For properties like border-width, fractional px values do not always land on device pixels and the browser rounds when rendering. The converted value and what DevTools reports can differ by around half a pixel.",
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "rem이란 무엇인가요?",
          answer:
            "rem(root em)은 HTML 루트 요소(<html>)의 폰트 크기를 기준으로 계산되는 CSS 상대 단위입니다. 루트 폰트 크기가 16px일 때 1rem = 16px, 2rem = 32px이 됩니다.",
        },
        {
          question: "루트 폰트 크기 기본값이 16인 이유는 무엇인가요?",
          answer:
            "대부분의 브라우저는 기본 폰트 크기를 16px로 설정합니다. CSS에서 html { font-size } 를 따로 지정하지 않으면 이 값이 적용됩니다.",
        },
        {
          question: "Swap을 누르면 URL이 바뀌나요?",
          answer:
            "아니요. Swap은 변환 방향만 바꾸고 URL은 /rem-to-px 그대로 유지됩니다. 검색 의도는 유지하면서 양방향 변환을 지원합니다.",
        },
        {
          question: "입력한 값이 서버로 전송되나요?",
          answer:
            "아니요. 모든 계산은 브라우저 안에서 처리되며 입력한 값은 서버로 전송되거나 저장되지 않습니다.",
        },
      ],
      en: [
        {
          question: "What is a rem unit?",
          answer:
            "rem (root em) is a CSS relative unit based on the font size of the root HTML element. When the root font size is 16px, 1rem = 16px, 2rem = 32px, and so on.",
        },
        {
          question: "Why is the default root font size 16?",
          answer:
            "Most browsers default to a 16px base font size. Unless you set a custom html { font-size } in your CSS, this is the value browsers use.",
        },
        {
          question: "Does pressing Swap change the URL?",
          answer:
            "No. Swap only flips the conversion direction while keeping the URL at /rem-to-px. It preserves the search intent while supporting bidirectional conversion.",
        },
        {
          question: "Is anything I enter sent to a server?",
          answer:
            "No. All calculations happen in your browser and the values you enter are never uploaded or stored.",
        },
      ],
    },
    og: {
      ko: { title: "Rem to Px 변환기", subtitle: "rem ↔ px 즉시 변환, 루트 폰트 크기 설정 지원" },
      en: { title: "Rem to Px Converter", subtitle: "Convert rem to pixels instantly with custom root size" },
    },
  },
  {
    slug: "em-to-px",
    layout: "card",
    cat: "dev",
    targets: ["developer", "designer"],
    ico: "em",
    ready: true,
    indexable: false,
    badge: "Clean SaaS",
    name: { ko: "Em → Px 변환기", en: "Em to Px Converter" },
    relatedTools: ["tailwind-palette-generator", "css-gradient", "json-formatter"],
    seo: {
      ko: {
        title: "Em to Px 변환기 | CSS 단위 변환",
        description:
          "em 값을 픽셀(px)로, 또는 픽셀을 em으로 즉시 변환합니다. 부모 요소 폰트 크기를 직접 설정하고 결과를 바로 복사하세요. 모든 계산은 브라우저 안에서만 이루어집니다.",
        keywords: ["em to px", "em px 변환", "em 변환기", "css em 단위", "px to em"],
      },
      en: {
        title: "Em to Px Converter | CSS Unit Converter",
        description:
          "Convert em values to pixels (px) or pixels to em instantly. Set a custom parent font size and copy the result in one click. Everything runs in your browser: no login, no installation.",
        keywords: ["em to px", "em to pixels", "px to em", "css em converter", "em unit converter"],
      },
    },
    content: {
      ko: {
        card: "em ↔ px 즉시 변환. 부모 폰트 크기 설정 지원.",
        description:
          "em 값을 픽셀(px)로, 또는 픽셀을 em으로 즉시 변환합니다. 부모 요소 폰트 크기를 직접 설정하고 결과를 바로 복사하세요. 모든 계산은 브라우저 안에서만 이루어집니다.",
        howItWorks: ["em 또는 px 값 입력", "부모 폰트 크기 설정 (기본값 16)", "변환 결과 확인 및 복사"],
        aeo: {
          what: "Em to Px 변환기는 CSS 상대 단위 em 값을 픽셀(px)로, 또는 픽셀을 em으로 즉시 변환해주는 도구입니다.",
          who: "중첩된 요소의 폰트 크기를 계산하거나 em 단위와 픽셀 단위를 함께 쓰는 프론트엔드 개발자를 위한 도구입니다.",
          how: "em 또는 px 값을 입력하고 부모 요소의 폰트 크기를 설정하면 브라우저 안에서 즉시 변환 결과를 보여줍니다.",
          why: "em 단위는 부모 요소 폰트 크기에 따라 달라지므로 매번 수동으로 계산하는 번거로움을 줄여줍니다.",
        },
        guide: [
          {
            heading: "em은 부모 폰트 크기를 기준으로 한다",
            body: [
              "em은 해당 요소가 상속받은 폰트 크기를 1로 보는 상대 단위입니다. 버튼의 padding을 0.75em으로 주면 글자 크기가 커질 때 여백도 함께 커져, 컴포넌트가 폰트 크기에 맞춰 통째로 스케일됩니다. 이렇게 '요소 하나가 자기 폰트 크기에 비례해 커지길' 원할 때 em이 rem보다 편리합니다.",
              "이 상대성 때문에 시안의 px 값을 em으로 옮기거나 그 반대로 확인할 일이 잦고, 이 변환기가 그 계산을 대신합니다. 부모 폰트 크기를 실제 값으로 설정해야 정확합니다.",
            ],
          },
          {
            heading: "중첩되면 값이 누적되는 함정",
            body: [
              "em의 가장 흔한 함정은 중첩 누적입니다. em은 부모의 폰트 크기를 기준으로 하므로, em으로 폰트 크기를 지정한 요소 안에 또 em을 쓰면 조상들의 배율이 곱해져 예상보다 크거나 작아집니다. 예를 들어 1.2em이 세 단계 중첩되면 실제로는 1.2 × 1.2 × 1.2 ≈ 1.73배가 됩니다.",
              "그래서 실제로 몇 px이 되는지 눈으로 확인하는 것이 중요합니다. 예측 가능한 값이 필요할 때는 루트 기준인 rem을 함께 고려하세요. 모든 계산은 브라우저 안에서만 이루어집니다.",
            ],
          },
        ],
      },
      en: {
        card: "Convert em ↔ px instantly. Supports custom parent font size.",
        description:
          "Convert em values to pixels (px) or pixels to em instantly. Set a custom parent font size and copy the result in one click. Everything runs in your browser: no login, no installation.",
        howItWorks: ["Enter an em or px value", "Set parent font size (default 16)", "Copy the converted result"],
        aeo: {
          what: "Em to Px Converter is a tool that instantly converts CSS em values to pixels (px) and back.",
          who: "It is for front-end developers working with nested font sizes and those who need to switch between em and pixel values in CSS.",
          how: "Enter an em or px value and set the parent element's font size; the conversion result appears instantly in your browser.",
          why: "em values depend on the parent element's font size, making manual calculation tedious: this tool gives you the answer instantly.",
        },
        guide: [
          {
            heading: "em is relative to the parent font size",
            body: [
              "em is a relative unit that treats the element's inherited font size as 1. Give a button 0.75em of padding and the spacing grows along with the text, so the whole component scales with its font size. When you want a single element to grow in proportion to its own font size, em is handier than rem.",
              "Because of this relativity you frequently move a design's px value into em or check it the other way, and this converter does that math for you. Set the parent font size to your real value for an accurate result.",
            ],
          },
          {
            heading: "The nesting trap where values compound",
            body: [
              "em's most common pitfall is compounding when nested. Since em is based on the parent's font size, using em inside an element that itself sets its font size in em multiplies the ancestors' ratios, so it ends up larger or smaller than expected. For example, 1.2em nested three levels deep is actually 1.2 × 1.2 × 1.2 ≈ 1.73×.",
              "That's why it helps to see the resulting px value directly. When you need predictable values, consider rem, which is relative to the root. All calculation runs in your browser.",
            ],
          },
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "em과 rem의 차이는 무엇인가요?",
          answer:
            "em은 해당 요소의 부모 요소 폰트 크기를 기준으로 계산됩니다. rem은 항상 루트(<html>) 요소의 폰트 크기를 기준으로 계산됩니다. 중첩된 요소에서 em은 값이 누적될 수 있어, 예측 가능한 rem이 선호되는 경우가 많습니다.",
        },
        {
          question: "font-size 외 다른 속성에도 em을 쓸 수 있나요?",
          answer:
            "네. em은 margin, padding, width, line-height 등 다양한 속성에 사용할 수 있습니다. font-size에 em을 쓸 때는 부모 폰트 크기가 기준이 되고, 다른 속성에서는 같은 요소의 font-size가 기준이 됩니다.",
        },
        {
          question: "Swap을 누르면 URL이 바뀌나요?",
          answer:
            "아니요. Swap은 변환 방향만 바꾸고 URL은 /em-to-px 그대로 유지됩니다.",
        },
        {
          question: "입력한 값이 서버로 전송되나요?",
          answer:
            "아니요. 모든 계산은 브라우저 안에서 처리되며 입력한 값은 서버로 전송되거나 저장되지 않습니다.",
        },
      ],
      en: [
        {
          question: "What is the difference between em and rem?",
          answer:
            "em is relative to the parent element's font size, while rem is always relative to the root (<html>) font size. In nested elements, em values can compound, which is why rem is often preferred for predictability.",
        },
        {
          question: "Can em be used for properties other than font-size?",
          answer:
            "Yes. em can be used for margin, padding, width, line-height and more. When used on font-size, it refers to the parent font size; on other properties, it refers to the element's own computed font-size.",
        },
        {
          question: "Does pressing Swap change the URL?",
          answer:
            "No. Swap only flips the conversion direction while keeping the URL at /em-to-px.",
        },
        {
          question: "Is anything I enter sent to a server?",
          answer:
            "No. All calculations happen in your browser and the values you enter are never uploaded or stored.",
        },
      ],
    },
    og: {
      ko: { title: "Em to Px 변환기", subtitle: "em ↔ px 즉시 변환, 부모 폰트 크기 설정 지원" },
      en: { title: "Em to Px Converter", subtitle: "Convert em to pixels instantly with custom parent size" },
    },
  },
  {
    slug: "vw-to-px",
    layout: "card",
    cat: "dev",
    targets: ["developer", "designer"],
    ico: "vw",
    ready: true,
    indexable: false,
    badge: "Clean SaaS",
    name: { ko: "Vw → Px 변환기", en: "Vw to Px Converter" },
    relatedTools: ["css-gradient", "tailwind-palette-generator", "json-formatter"],
    seo: {
      ko: {
        title: "Vw to Px 변환기 | CSS 뷰포트 단위 변환",
        description:
          "vw 값을 픽셀(px)로, 또는 픽셀을 vw로 즉시 변환합니다. 뷰포트 너비를 직접 입력하거나 390, 768, 1024, 1440, 1920 프리셋으로 선택하세요. 모든 계산은 브라우저 안에서만 이루어집니다.",
        keywords: ["vw to px", "vw px 변환", "viewport width 변환", "css vw 단위", "px to vw"],
      },
      en: {
        title: "Vw to Px Converter | CSS Viewport Unit Converter",
        description:
          "Convert vw values to pixels (px) or pixels to vw instantly. Enter a custom viewport width or pick a preset: 390, 768, 1024, 1440, 1920. Everything runs in your browser: no login, no installation.",
        keywords: ["vw to px", "vw to pixels", "px to vw", "viewport width converter", "css vw unit"],
      },
    },
    content: {
      ko: {
        card: "vw ↔ px 즉시 변환. 반응형 뷰포트 너비 프리셋 지원.",
        description:
          "vw 값을 픽셀(px)로, 또는 픽셀을 vw로 즉시 변환합니다. 뷰포트 너비를 직접 입력하거나 390, 768, 1024, 1440, 1920 프리셋으로 선택하세요. 모든 계산은 브라우저 안에서만 이루어집니다.",
        howItWorks: ["vw 또는 px 값 입력", "뷰포트 너비 설정 또는 프리셋 선택", "변환 결과 확인 및 복사"],
        aeo: {
          what: "Vw to Px 변환기는 CSS 뷰포트 너비 단위 vw 값을 픽셀(px)로, 또는 픽셀을 vw로 즉시 변환해주는 도구입니다.",
          who: "반응형 레이아웃을 설계하는 프론트엔드 개발자와 뷰포트 기반 크기를 계산해야 하는 디자이너를 위한 도구입니다.",
          how: "vw 또는 px 값을 입력하고 뷰포트 너비를 설정하면 브라우저 안에서 즉시 변환 결과를 보여줍니다. 일반 반응형 뷰포트 크기 프리셋도 제공합니다.",
          why: "다양한 화면 크기에서 vw와 px를 오갈 때 계산 실수 없이 빠르게 정확한 값을 확인할 수 있습니다.",
        },
        guide: [
          {
            heading: "vw는 뷰포트 너비의 1%",
            body: [
              "vw(viewport width)는 브라우저 표시 영역의 너비를 100으로 나눈 단위입니다. 100vw는 화면 전체 너비, 50vw는 그 절반입니다. 화면 크기에 따라 자동으로 값이 바뀌기 때문에 풀블리드 히어로 섹션이나 화면 폭에 비례해 커지는 반응형 타이포그래피에 자주 쓰입니다.",
              "핵심은 같은 vw라도 기기마다 실제 픽셀이 달라진다는 점입니다. 10vw는 1440px 데스크톱에서 144px이지만 390px 모바일에서는 39px입니다. 그래서 특정 기기 기준의 실제 크기를 확인하려면 뷰포트 너비를 지정해 변환해야 하고, 이 계산기는 대표 기기 프리셋을 제공합니다.",
            ],
          },
          {
            heading: "clamp와 함께, 과도한 확대·축소 막기",
            body: [
              "vw만 단독으로 쓰면 큰 화면에서는 지나치게 커지고 작은 화면에서는 읽기 힘들 만큼 작아지기 쉽습니다. 그래서 실무에서는 min()·max()·clamp()로 하한과 상한을 함께 지정하는 경우가 많습니다. 이때 각 뷰포트에서 vw가 몇 px이 되는지 미리 확인하면 경계값을 합리적으로 잡을 수 있습니다.",
              "이 변환기로 최소·최대 화면 폭에서의 px 값을 확인해 clamp 범위를 설계해 보세요. 모든 계산은 브라우저 안에서만 이루어지며 입력값은 서버로 전송되지 않습니다.",
            ],
          },
        ],
      },
      en: {
        card: "Convert vw ↔ px instantly. Includes responsive viewport width presets.",
        description:
          "Convert vw values to pixels (px) or pixels to vw instantly. Enter a custom viewport width or pick a preset: 390, 768, 1024, 1440, 1920. Everything runs in your browser: no login, no installation.",
        howItWorks: ["Enter a vw or px value", "Set viewport width or pick a preset", "Copy the converted result"],
        aeo: {
          what: "Vw to Px Converter is a tool that instantly converts CSS viewport width (vw) values to pixels and back.",
          who: "It is for front-end developers designing responsive layouts and designers who need to calculate viewport-based sizes.",
          how: "Enter a vw or px value and set the viewport width (or choose a preset like 1440); the result appears instantly in your browser.",
          why: "It eliminates manual vw-to-px math across different screen sizes, speeding up responsive design work.",
        },
        guide: [
          {
            heading: "vw is 1% of the viewport width",
            body: [
              "vw (viewport width) divides the browser's visible width into 100 parts. 100vw is the full screen width and 50vw is half of it. Because the value changes automatically with the screen size, vw is popular for full-bleed hero sections and responsive typography that scales with the viewport.",
              "The key point is that the same vw resolves to different pixels on different devices. 10vw is 144px on a 1440px desktop but 39px on a 390px phone. So to check the real size for a specific device you set the viewport width and convert, and this calculator ships common device presets.",
            ],
          },
          {
            heading: "Pair it with clamp to avoid extremes",
            body: [
              "Used alone, vw tends to get too large on wide screens and too small to read on narrow ones. That's why in practice people bound it with min(), max(), or clamp(). Checking how many pixels a vw value becomes at each viewport first lets you pick sensible boundaries.",
              "Use this converter to read the px values at your minimum and maximum screen widths and design your clamp range around them. All calculation runs in your browser and your input is never sent to a server.",
            ],
          },
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "1vw는 몇 픽셀인가요?",
          answer:
            "1vw는 뷰포트(브라우저 화면) 너비의 1%입니다. 뷰포트 너비가 1440px이면 1vw = 14.4px, 1024px이면 1vw = 10.24px이 됩니다.",
        },
        {
          question: "vw와 %의 차이는 무엇인가요?",
          answer:
            "vw는 브라우저 뷰포트 전체 너비를 기준으로 하고, %는 부모 요소의 너비를 기준으로 합니다. 루트 요소(<html>)에서는 동일하지만 중첩 요소 안에서는 다른 값이 나올 수 있습니다.",
        },
        {
          question: "모바일 화면 크기도 확인할 수 있나요?",
          answer:
            "네. 390px(iPhone), 768px(태블릿) 등 모바일 뷰포트 프리셋을 선택해 빠르게 확인할 수 있습니다.",
        },
        {
          question: "입력한 값이 서버로 전송되나요?",
          answer:
            "아니요. 모든 계산은 브라우저 안에서 처리되며 입력한 값은 서버로 전송되거나 저장되지 않습니다.",
        },
      ],
      en: [
        {
          question: "What is 1vw in pixels?",
          answer:
            "1vw is 1% of the viewport (browser window) width. At a viewport width of 1440px, 1vw = 14.4px. At 1024px, 1vw = 10.24px.",
        },
        {
          question: "What is the difference between vw and %?",
          answer:
            "vw is relative to the full browser viewport width, while % is relative to the parent element's width. On the root element they are equal, but inside nested elements they can differ.",
        },
        {
          question: "Can I check mobile screen sizes?",
          answer:
            "Yes. Select the 390px (iPhone) or 768px (tablet) preset to quickly check vw values at common mobile viewport sizes.",
        },
        {
          question: "Is anything I enter sent to a server?",
          answer:
            "No. All calculations happen in your browser and the values you enter are never uploaded or stored.",
        },
      ],
    },
    og: {
      ko: { title: "Vw to Px 변환기", subtitle: "vw ↔ px 즉시 변환, 반응형 뷰포트 프리셋 지원" },
      en: { title: "Vw to Px Converter", subtitle: "Convert vw to pixels instantly with viewport presets" },
    },
  },
  {
    slug: "percent-to-px",
    layout: "card",
    cat: "dev",
    targets: ["developer", "designer"],
    ico: "%px",
    ready: true,
    indexable: false,
    badge: "Clean SaaS",
    name: { ko: "% → Px 변환기", en: "Percent to Px Converter" },
    relatedTools: ["css-gradient", "tailwind-palette-generator", "json-formatter"],
    seo: {
      ko: {
        title: "Percent to Px 변환기 | CSS % 단위 변환",
        description:
          "CSS 퍼센트(%) 값을 픽셀(px)로, 또는 픽셀을 퍼센트로 즉시 변환합니다. 부모 요소 너비를 직접 설정하고 결과를 바로 복사하세요. 모든 계산은 브라우저 안에서만 이루어집니다.",
        keywords: ["percent to px", "퍼센트 px 변환", "% to px", "css percent 단위", "px to percent"],
      },
      en: {
        title: "Percent to Px Converter | CSS Unit Converter",
        description:
          "Convert CSS percentage (%) values to pixels (px) or pixels to percent instantly. Set a custom parent width and copy the result in one click. Everything runs in your browser: no login, no installation.",
        keywords: ["percent to px", "% to pixels", "px to percent", "css percent converter", "percentage unit converter"],
      },
    },
    content: {
      ko: {
        card: "CSS % ↔ px 즉시 변환. 부모 요소 너비 설정 지원.",
        description:
          "CSS 퍼센트(%) 값을 픽셀(px)로, 또는 픽셀을 퍼센트로 즉시 변환합니다. 부모 요소 너비를 직접 설정하고 결과를 바로 복사하세요. 모든 계산은 브라우저 안에서만 이루어집니다.",
        howItWorks: ["% 또는 px 값 입력", "부모 요소 너비 설정", "변환 결과 확인 및 복사"],
        aeo: {
          what: "Percent to Px 변환기는 CSS 퍼센트(%) 값을 픽셀(px)로, 또는 픽셀을 퍼센트로 즉시 변환해주는 도구입니다.",
          who: "반응형 레이아웃에서 퍼센트 기반 크기와 픽셀 크기를 오가야 하는 프론트엔드 개발자와 디자이너를 위한 도구입니다.",
          how: "% 또는 px 값을 입력하고 부모 요소 너비를 설정하면 브라우저 안에서 즉시 변환 결과를 보여줍니다.",
          why: "퍼센트와 픽셀 단위 계산을 빠르게 처리해 반응형 레이아웃 설계 시간을 줄여줍니다.",
        },
        guide: [
          {
            heading: "CSS %는 '무엇의 100%'인지가 핵심",
            body: [
              "CSS 퍼센트는 속성마다 기준이 다릅니다. width는 부모 요소의 너비, height는 부모의 높이, font-size는 부모의 폰트 크기를 기준으로 하고, 흥미롭게도 padding과 margin은 세로 값이라도 부모의 '너비'를 기준으로 계산됩니다. 이 변환기는 가장 흔한 경우인 부모 요소 너비를 기준으로 % ↔ px를 변환합니다.",
              "즉 50%는 언제나 '부모 너비의 절반'입니다. 부모가 800px이면 50% = 400px, 부모가 1200px이면 600px이 됩니다. 정확한 값을 얻으려면 부모 요소의 실제 너비를 입력해야 합니다.",
            ],
          },
          {
            heading: "% vs vw: 무엇을 기준으로 삼는가",
            body: [
              "퍼센트와 vw는 헷갈리기 쉽지만 기준이 다릅니다. %는 부모(컨테이너)를 기준으로 하고, vw는 화면(뷰포트) 전체를 기준으로 합니다. 그래서 컨테이너 안에서의 비율 배분에는 %가, 화면 폭에 직접 비례해야 할 때는 vw가 맞습니다. 중첩된 레이아웃에서 실제 픽셀이 얼마가 되는지 확인할 때 이 변환기가 유용합니다.",
              "모든 계산은 브라우저 안에서만 이루어지며 입력한 값은 서버로 전송되지 않습니다.",
            ],
          },
        ],
      },
      en: {
        card: "Convert CSS % ↔ px instantly. Supports custom parent width.",
        description:
          "Convert CSS percentage (%) values to pixels (px) or pixels to percent instantly. Set a custom parent width and copy the result in one click. Everything runs in your browser: no login, no installation.",
        howItWorks: ["Enter a % or px value", "Set the parent element width", "Copy the converted result"],
        aeo: {
          what: "Percent to Px Converter is a tool that instantly converts CSS percentage (%) values to pixels and back.",
          who: "It is for front-end developers and designers working with percentage-based and pixel-based sizes in responsive layouts.",
          how: "Enter a % or px value and set the parent element width; the converted result appears instantly in your browser.",
          why: "It handles the division and multiplication instantly so you can focus on the layout instead of the arithmetic.",
        },
        guide: [
          {
            heading: "With CSS %, the question is '100% of what?'",
            body: [
              "CSS percentages are relative to different things depending on the property. width is relative to the parent's width, height to the parent's height, font-size to the parent's font size, and, notably, padding and margin are calculated from the parent's width even for vertical values. This converter handles the most common case, converting % ↔ px relative to the parent element's width.",
              "So 50% is always 'half the parent's width': with an 800px parent, 50% = 400px; with a 1200px parent, 600px. Enter the parent's real width to get an accurate value.",
            ],
          },
          {
            heading: "% vs vw: what each is relative to",
            body: [
              "Percent and vw are easy to confuse, but their references differ: % is relative to the parent (container), while vw is relative to the whole viewport. Use % to divide space within a container and vw when something must scale directly with the screen width. This converter is handy for seeing the real pixel value inside a nested layout.",
              "All calculation runs in your browser and your input is never sent to a server.",
            ],
          },
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "CSS에서 퍼센트(%)는 무엇을 기준으로 하나요?",
          answer:
            "속성에 따라 기준이 다릅니다. width에 쓴 %는 부모 요소의 width 기준이고, height의 %는 부모 요소의 height 기준입니다. margin, padding의 %는 부모 요소의 width를 기준으로 합니다.",
        },
        {
          question: "퍼센트와 vw의 차이는 무엇인가요?",
          answer:
            "퍼센트(%)는 부모 요소를 기준으로 하고, vw는 브라우저 전체 뷰포트 너비를 기준으로 합니다. 루트 요소에서는 동일하지만, 중첩된 요소 안에서는 값이 달라집니다.",
        },
        {
          question: "음수 값도 입력할 수 있나요?",
          answer:
            "네. 음수 px 또는 % 값을 입력할 수 있습니다. CSS에서 margin 같은 속성은 음수 값을 허용합니다.",
        },
        {
          question: "입력한 값이 서버로 전송되나요?",
          answer:
            "아니요. 모든 계산은 브라우저 안에서 처리되며 입력한 값은 서버로 전송되거나 저장되지 않습니다.",
        },
      ],
      en: [
        {
          question: "What does percent (%) refer to in CSS?",
          answer:
            "It depends on the property. For width, % is relative to the parent's width. For height, it is relative to the parent's height. For margin and padding, % is always relative to the parent's width.",
        },
        {
          question: "What is the difference between % and vw?",
          answer:
            "Percent (%) is relative to the parent element's size, while vw is relative to the entire browser viewport width. They are equal on the root element but differ inside nested elements.",
        },
        {
          question: "Can I enter negative values?",
          answer:
            "Yes. Negative px or % values are accepted. Some CSS properties such as margin allow negative values.",
        },
        {
          question: "Is anything I enter sent to a server?",
          answer:
            "No. All calculations happen in your browser and the values you enter are never uploaded or stored.",
        },
      ],
    },
    og: {
      ko: { title: "Percent to Px 변환기", subtitle: "CSS % ↔ px 즉시 변환, 부모 너비 설정 지원" },
      en: { title: "Percent to Px Converter", subtitle: "Convert CSS percentages to pixels instantly" },
    },
  },
  {
    slug: "ms-to-s",
    layout: "card",
    cat: "dev",
    targets: ["developer", "designer"],
    ico: "ms",
    ready: true,
    indexable: false,
    badge: "Clean SaaS",
    name: { ko: "Ms → S 변환기", en: "Ms to S Converter" },
    relatedTools: ["json-formatter", "slack-timestamp-converter", "time-converter"],
    seo: {
      ko: {
        title: "Ms to S 변환기 | 밀리초·초 단위 변환",
        description:
          "밀리초(ms)를 초(s)로, 또는 초를 밀리초로 즉시 변환합니다. CSS 애니메이션·트랜지션 작업 시 자주 쓰이는 단위를 빠르게 변환하세요. 모든 계산은 브라우저 안에서만 이루어집니다.",
        keywords: ["ms to s", "밀리초 초 변환", "milliseconds to seconds", "css animation 시간", "ms 변환기"],
      },
      en: {
        title: "Ms to S Converter | Milliseconds to Seconds",
        description:
          "Convert milliseconds (ms) to seconds (s) or seconds to milliseconds instantly. Handy for CSS animations, transitions and JavaScript timing. Everything runs in your browser: no login, no installation.",
        keywords: ["ms to s", "milliseconds to seconds", "seconds to milliseconds", "css animation time", "ms converter"],
      },
    },
    content: {
      ko: {
        card: "ms ↔ s 즉시 변환. CSS 애니메이션·트랜지션 시간 계산에 유용.",
        description:
          "밀리초(ms)를 초(s)로, 또는 초를 밀리초로 즉시 변환합니다. CSS 애니메이션·트랜지션 작업 시 자주 쓰이는 단위를 빠르게 변환하세요. 모든 계산은 브라우저 안에서만 이루어집니다.",
        howItWorks: ["ms 또는 s 값 입력", "Swap으로 변환 방향 전환", "변환 결과 확인 및 복사"],
        aeo: {
          what: "Ms to S 변환기는 밀리초(ms)를 초(s)로, 또는 초를 밀리초로 즉시 변환해주는 도구입니다.",
          who: "CSS 애니메이션·트랜지션 지속 시간을 계산하거나 JavaScript setTimeout/setInterval 값을 ms와 s 단위로 오가야 하는 프론트엔드 개발자를 위한 도구입니다.",
          how: "ms 또는 s 값을 입력하면 브라우저 안에서 즉시 상대 단위로 변환합니다. Swap 버튼으로 변환 방향을 바꿀 수 있습니다.",
          why: "1000ms = 1s 계산이 단순하지만 큰 값에서 자주 실수하므로, 빠르게 검증하고 복사하는 데 유용합니다.",
        },
        guide: [
          {
            heading: "ms와 s, CSS·JS에서 언제 무엇을 쓰나",
            body: [
              "1초(s)는 1,000밀리초(ms)입니다. CSS의 transition·animation duration은 `0.3s`와 `300ms` 두 표기를 모두 허용하는데, 코드베이스마다 컨벤션이 달라 값을 오갈 일이 생깁니다. 일반적으로 짧은 시간은 ms(예: 150ms)가, 긴 시간은 s(예: 1.5s)가 읽기 편해 팀 단위로 표기를 통일하는 경우가 많습니다.",
              "JavaScript의 setTimeout·setInterval은 항상 ms 단위를 받기 때문에, 디자이너가 'S' 단위로 정한 모션 스펙을 코드로 옮길 때 변환이 필요합니다. 이 변환기가 그 왕복을 즉시 처리합니다.",
            ],
          },
          {
            heading: "체감 속도의 감을 잡는 데도 유용",
            body: [
              "UI 인터랙션에서 트랜지션 시간은 체감 품질을 좌우합니다. 보통 150~300ms가 자연스러운 마이크로 인터랙션 구간으로 여겨지고, 500ms를 넘어가면 굼떠 보이기 쉽습니다. 값을 ms와 s로 오가며 보면 애니메이션이 실제로 얼마나 길지 감을 잡는 데 도움이 됩니다.",
              "변환은 전부 브라우저 안에서 이루어지며 입력값은 서버로 전송되지 않습니다.",
            ],
          },
        ],
      },
      en: {
        card: "Convert ms ↔ s instantly. Useful for CSS animations and transitions.",
        description:
          "Convert milliseconds (ms) to seconds (s) or seconds to milliseconds instantly. Handy for CSS animations, transitions and JavaScript timing. Everything runs in your browser: no login, no installation.",
        howItWorks: ["Enter an ms or s value", "Flip direction with Swap", "Copy the converted result"],
        aeo: {
          what: "Ms to S Converter is a tool that instantly converts milliseconds (ms) to seconds (s) and back.",
          who: "It is for front-end developers calculating CSS animation and transition durations, or converting between ms and s for JavaScript setTimeout and setInterval.",
          how: "Enter an ms or s value and the result appears instantly in your browser. Use the Swap button to flip the conversion direction.",
          why: "While 1000ms = 1s seems simple, larger values are easy to miscalculate: this tool gives the answer instantly so you can copy and move on.",
        },
        guide: [
          {
            heading: "ms vs s: when to use each in CSS and JS",
            body: [
              "One second (s) is 1,000 milliseconds (ms). CSS transition and animation durations accept both `0.3s` and `300ms`, and since conventions differ between codebases you often move between the two. As a rule, short durations read better in ms (e.g. 150ms) and longer ones in s (e.g. 1.5s), so teams tend to standardize on one style.",
              "JavaScript's setTimeout and setInterval always take milliseconds, so when a designer specifies a motion spec in seconds you need to convert it for code. This tool handles that round trip instantly.",
            ],
          },
          {
            heading: "Also useful for gauging perceived speed",
            body: [
              "In UI interactions, transition timing drives how the experience feels. Roughly 150-300ms is considered the natural range for micro-interactions, while anything over 500ms tends to feel sluggish. Flipping a value between ms and s helps you sense how long an animation will actually run.",
              "All conversion happens in your browser and your input is never sent to a server.",
            ],
          },
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "CSS animation-duration에 ms와 s 중 어느 단위가 좋은가요?",
          answer:
            "둘 다 유효합니다. CSS 명세에서 s와 ms 단위를 모두 지원합니다. 0.3s처럼 1초 미만의 짧은 시간은 s로 쓰는 것이 더 읽기 쉽고, 길고 정밀한 타이밍은 ms로 관리하는 편이 유리합니다.",
        },
        {
          question: "음수 값(animation-delay)도 처리할 수 있나요?",
          answer:
            "네. 음수 ms 또는 s 값을 입력할 수 있습니다. CSS animation-delay에 음수 값을 사용하면 애니메이션이 도중부터 시작됩니다.",
        },
        {
          question: "소수점은 몇 자리까지 지원하나요?",
          answer:
            "최대 4자리 소수점까지 지원하며 불필요한 소수점은 자동으로 제거합니다. 예: 1000ms → 1s, 150ms → 0.15s.",
        },
        {
          question: "입력한 값이 서버로 전송되나요?",
          answer:
            "아니요. 모든 계산은 브라우저 안에서 처리되며 입력한 값은 서버로 전송되거나 저장되지 않습니다.",
        },
      ],
      en: [
        {
          question: "Should I use ms or s for CSS animation-duration?",
          answer:
            "Both are valid CSS units. For values under 1 second, s is more readable (e.g., 0.3s). For larger or more precise timing, ms is easier to work with. Most developers use both interchangeably.",
        },
        {
          question: "Can I use negative values for animation-delay?",
          answer:
            "Yes. Negative ms or s values are accepted. A negative CSS animation-delay starts the animation partway through its cycle.",
        },
        {
          question: "How many decimal places are supported?",
          answer:
            "Up to 4 decimal places are shown, with trailing zeros removed automatically. For example: 1000ms → 1s, 150ms → 0.15s.",
        },
        {
          question: "Is anything I enter sent to a server?",
          answer:
            "No. All calculations happen in your browser and the values you enter are never uploaded or stored.",
        },
      ],
    },
    og: {
      ko: { title: "Ms to S 변환기", subtitle: "밀리초 ↔ 초 즉시 변환" },
      en: { title: "Ms to S Converter", subtitle: "Convert milliseconds to seconds instantly" },
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
    indexable: false,
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
    indexable: false,
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
    relatedTools: ["cagr-calculator", "goal-growth-calculator", "compound-growth-calculator"],
    seo: {
      ko: {
        title: "성장률 계산기 | 퍼센트 증감률·MoM·YoY·QoQ·WoW 계산",
        description:
          "이전 값과 현재 값을 입력하면 성장률·퍼센트 증감률·차이·배수를 즉시 계산합니다. 변화율·증가율·감소율은 물론 MoM·YoY·QoQ·WoW 성장률까지 이 계산기 하나로 구합니다. 매출·사용자 수·트래픽 등 어떤 수치에도 쓰이며 브라우저 안에서만 동작합니다.",
        keywords: [
          "성장률 계산기", "퍼센트 증감률 계산기", "변화율 계산기", "증가율 계산기", "감소율 계산기",
          "MoM 계산기", "YoY 계산기", "QoQ 계산기", "WoW 계산기",
          "MoM 성장률", "YoY 성장률", "QoQ 성장률", "WoW 성장률",
          "growth rate calculator", "percentage change calculator",
        ],
      },
      en: {
        title: "Growth Rate Calculator | % Change, MoM, YoY, QoQ, WoW",
        description:
          "Enter a previous and current value to instantly calculate growth rate, percentage change, difference, and multiplier. One calculator covers percentage increase and decrease as well as MoM, YoY, QoQ, and WoW growth. Works for revenue, users, traffic, or any metric, entirely in your browser.",
        keywords: [
          "growth rate calculator", "percentage change calculator", "percentage increase calculator",
          "percentage decrease calculator", "MoM growth calculator", "YoY growth calculator",
          "QoQ growth calculator", "WoW growth calculator", "percent change calculator",
        ],
      },
    },
    content: {
      ko: {
        card: "이전값·현재값으로 성장률·퍼센트 증감률·MoM·YoY·QoQ·WoW를 즉시 계산.",
        description:
          "이전 값과 현재 값을 입력하면 성장률(%), 퍼센트 증감률, 차이, 배수를 즉시 계산합니다. 변화율·증가율·감소율은 물론 지난달 대비(MoM)·전년 대비(YoY)·전분기 대비(QoQ)·전주 대비(WoW) 성장률까지 모두 같은 공식이라 이 계산기 하나로 구할 수 있습니다. 매출·사용자 수·트래픽 등 어떤 수치에도 사용 가능하며, 모든 계산은 브라우저 안에서만 이루어집니다.",
        howItWorks: ["비교 기준이 되는 이전(시작) 값 입력", "현재(종료) 값 입력", "성장률·증감률·차이·배수 확인 및 복사"],
        aeo: {
          what: "성장률 계산기는 성장률·퍼센트 증감률·MoM·YoY·QoQ·WoW를 빠르게 계산하기 위한 통합 도구입니다. 성장률 계산기 · MoM 계산기 · YoY 계산기 · QoQ 계산기 · WoW 계산기 · 변화율(증가율·감소율) 계산기가 모두 동일한 (현재−이전)÷이전×100 공식을 쓰기 때문에, 이전 값과 현재 값만 입력하면 성장률과 증감률, 차이, 배수를 한 화면에서 보여줍니다.",
          who: "매출·사용자 수·트래픽·지표 변화를 분석하는 PM, 마케터, 데이터 담당자, 소상공인, 개발자를 위한 도구입니다. 월간(MoM)·연간(YoY)·분기(QoQ)·주간(WoW) 성장률을 보고서에 담아야 하는 사람에게 특히 유용합니다.",
          how: "이전 값과 현재 값을 입력하면 (현재−이전)÷이전×100 공식으로 성장률을 즉시 계산합니다. 결과가 양수면 증가율, 음수면 감소율이며, 비교 기간을 지난달·작년·지난 분기·지난주로 두면 각각 MoM·YoY·QoQ·WoW 성장률이 됩니다.",
          why: "성장률·변화율·MoM·YoY·QoQ·WoW를 계산하려고 서로 다른 도구를 오갈 필요 없이, 수기 계산 없이 정확한 값을 한 번에 얻어 보고서 작성과 데이터 분석 시간을 줄일 수 있습니다.",
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
        ],
        limitations: [
          "이전 값이 0이면 성장률을 정의할 수 없습니다. 0에서 100으로 늘어난 것은 \"무한대 성장\"이 아니라 증가량(+100)으로 표현해야 합니다.",
          "이전 값이 음수인 경우(적자에서 흑자 전환 등) 퍼센트 성장률은 수학적으로는 계산되지만 해석이 뒤집혀 오해를 부릅니다. 이때는 퍼센트 대신 절대 금액 변화를 쓰세요.",
          "두 시점만 비교하므로 그 사이의 등락은 보이지 않습니다. 3개월 이상 흐름을 하나의 연율로 요약하려면 CAGR 계산기를 쓰는 편이 정확합니다.",
          "퍼센트포인트(%p)와 퍼센트(%)를 구분하지 않습니다. 전환율이 2%에서 3%가 된 경우 이 도구는 +50%로 계산하며, 이를 \"1%p 상승\"으로 표현할지는 보고 맥락에 따라 직접 선택해야 합니다.",
        ],
      },
      en: {
        card: "Instantly calculate growth rate, % change, and MoM/YoY/QoQ/WoW from two values.",
        description:
          "Enter a previous and current value to instantly calculate growth rate (%), percentage change, difference, and multiplier. Percentage increase and decrease, plus month-over-month (MoM), year-over-year (YoY), quarter-over-quarter (QoQ), and week-over-week (WoW) growth all share the same formula, so this one calculator covers them all. Works for revenue, users, traffic, or any metric, entirely in your browser.",
        howItWorks: ["Enter the previous (starting) value", "Enter the current (ending) value", "Read or copy the growth rate, change, difference, and multiplier"],
        aeo: {
          what: "A Growth Rate Calculator is a unified tool for quickly calculating growth rate, percentage change, and MoM, YoY, QoQ, and WoW growth. A growth rate calculator, MoM calculator, YoY calculator, QoQ calculator, WoW calculator, and percentage increase/decrease calculator all use the same (Current − Previous) / Previous × 100 formula, so entering a previous and current value shows the growth rate, change, difference, and multiplier on one screen.",
          who: "It is for PMs, marketers, analysts, small business owners, and developers who measure changes in revenue, users, traffic, or any metric: especially anyone reporting monthly (MoM), yearly (YoY), quarterly (QoQ), or weekly (WoW) growth.",
          how: "Enter a previous and current value and it applies (Current − Previous) / Previous × 100. A positive result is a percentage increase and a negative one a decrease; set the comparison period to last month, last year, last quarter, or last week to read it as MoM, YoY, QoQ, or WoW growth.",
          why: "Instead of hopping between separate tools for growth rate, percentage change, and MoM/YoY/QoQ/WoW, you get an accurate number in one place with no manual math: saving time on reports and analysis.",
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
        ],
        limitations: [
          "Growth is undefined when the previous value is 0. Going from 0 to 100 is not \"infinite growth\"; report it as an absolute change of +100.",
          "When the previous value is negative (for example a loss turning into a profit), a percentage is mathematically computable but reads backwards and misleads. Use the absolute change instead.",
          "Only two points are compared, so anything that happened in between is invisible. To summarize three or more periods as a single annual figure, use the CAGR calculator.",
          "The tool does not distinguish percentage points from percent. A conversion rate moving from 2% to 3% is reported as +50%; whether to describe that as \"up 1pp\" is a judgment call for your report.",
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
        { question: "입력한 숫자가 서버로 전송되나요?", answer: "아니요. 모든 계산은 브라우저 안에서 처리되며 입력값은 서버로 전송·저장되지 않습니다." },
      ],
      en: [
        { question: "What is growth rate?", answer: "Growth rate is the percentage change between two values, calculated as (Current − Previous) / Previous × 100. It is the same calculation as percentage change." },
        { question: "Can I calculate MoM, YoY, QoQ, and WoW growth here?", answer: "Yes. MoM (vs last month), YoY (vs last year), QoQ (vs last quarter), and WoW (vs last week) growth all use the same percentage-change formula. Just enter the two periods' values as previous and current." },
        { question: "How are percentage increase and decrease different?", answer: "The calculation is identical. A positive result is a percentage increase and a negative result is a percentage decrease, so no separate increase or decrease calculator is needed." },
        { question: "Are percentage change and growth rate different?", answer: "Only the name differs: the math is the same relative change between two values expressed as a percent, called growth rate, percentage change, or percent change depending on context." },
        { question: "What happens if the previous value is zero?", answer: "Division by zero is undefined, so the growth rate cannot be calculated. An error message appears and you should choose a non-zero starting point." },
        { question: "Are the numbers I enter sent to a server?", answer: "No. Every calculation happens in your browser and your inputs are never uploaded or stored." },
      ],
    },
    og: {
      ko: { title: "성장률 계산기", subtitle: "성장률·퍼센트 증감률·MoM·YoY·QoQ·WoW 즉시 계산" },
      en: { title: "Growth Rate Calculator", subtitle: "Growth rate, % change and MoM/YoY/QoQ/WoW instantly" },
    },
  },

  {
    slug: "percent-difference-calculator",
    layout: "card",
    cat: "text",
    targets: ["pm", "office-worker", "developer"],
    ico: "|Δ|",
    ready: true,
    indexable: false,
    badge: "Calculator",
    name: { ko: "퍼센트 차이 계산기", en: "Percent Difference Calculator" },
    relatedTools: ["growth-rate-calculator", "cagr-calculator", "goal-growth-calculator"],
    seo: {
      ko: {
        title: "퍼센트 차이 계산기 | 두 값의 상대적 차이",
        description:
          "두 값 A와 B 사이의 퍼센트 차이를 계산합니다. 방향이 없는 상대적 차이를 구할 때 사용하는 계산기입니다.",
        keywords: ["퍼센트 차이 계산기", "percent difference calculator", "두 값 비교", "상대적 차이"],
      },
      en: {
        title: "Percent Difference Calculator | Relative Difference Between Two Values",
        description:
          "Calculate the percent difference between two values A and B. Use this when you need the relative difference without a defined direction (not increase or decrease).",
        keywords: ["percent difference calculator", "percentage difference calculator", "relative difference", "compare two values"],
      },
    },
    content: {
      ko: {
        card: "두 값 A·B의 상대적 퍼센트 차이 계산.",
        description:
          "두 값 A와 B 사이의 퍼센트 차이를 계산합니다. 방향이 없는 상대적 차이를 구할 때 사용하는 계산기입니다. 모든 계산은 브라우저 안에서만 이루어집니다.",
        howItWorks: ["값 A 입력", "값 B 입력", "퍼센트 차이 확인"],
        aeo: {
          what: "퍼센트 차이 계산기는 두 값의 상대적 차이를 퍼센트로 계산하는 도구입니다. 증가·감소 방향이 아닌 두 값 사이의 크기 차이를 구할 때 사용합니다.",
          who: "두 그룹·두 측정값을 비교해야 하는 연구자, 분석가, 비즈니스 담당자를 위한 도구입니다.",
          how: "|A − B| ÷ ((A + B) / 2) × 100 공식으로 두 값의 평균을 기준으로 한 상대적 차이를 계산합니다.",
          why: "퍼센트 변화율과 달리 기준 방향이 없으므로, 어느 쪽이 이전/이후인지 관계없이 두 값의 차이를 구할 때 유용합니다.",
        },
      },
      en: {
        card: "Calculate the relative percent difference between values A and B.",
        description:
          "Calculate the percent difference between two values A and B. Use this when you need the relative difference without a defined direction.",
        howItWorks: ["Enter value A", "Enter value B", "Read the percent difference"],
        aeo: {
          what: "A Percent Difference Calculator computes the relative difference between two values as a percentage of their average. It has no directional bias: neither value is 'before' or 'after'.",
          who: "It is for researchers, analysts, and business users who need to compare two measurements, test results, or data points without implying which came first.",
          how: "The formula |A − B| / ((A + B) / 2) × 100 uses the average of the two values as the reference point, making the result symmetric.",
          why: "Unlike percentage change, it does not require you to designate a 'before' and 'after': ideal for comparing two independent measurements.",
        },
      },
    },
    faq: {
      ko: [
        { question: "퍼센트 변화율과 퍼센트 차이의 차이는 무엇인가요?", answer: "퍼센트 변화율은 이전 값을 기준으로 변화를 계산하고 방향(증가/감소)을 나타냅니다. 퍼센트 차이는 두 값의 평균을 기준으로 계산하며 방향이 없습니다." },
        { question: "A와 B의 순서가 결과에 영향을 주나요?", answer: "영향을 주지 않습니다. 퍼센트 차이 공식은 절댓값을 사용하므로 A·B의 순서와 관계없이 동일한 결과가 나옵니다." },
        { question: "두 값이 모두 0이면 어떻게 되나요?", answer: "평균이 0이 되어 0으로 나누기가 발생하므로 계산할 수 없습니다." },
      ],
      en: [
        { question: "What is the difference between percent difference and percent change?", answer: "Percent change uses the original value as the base and has a direction (increase/decrease). Percent difference uses the average of both values and is non-directional." },
        { question: "Does the order of A and B affect the result?", answer: "No. The formula uses an absolute value, so swapping A and B produces the same result." },
        { question: "What if both values are zero?", answer: "The average would be zero, causing a division by zero error. A result cannot be computed." },
      ],
    },
    og: {
      ko: { title: "퍼센트 차이 계산기", subtitle: "두 값의 방향 없는 상대적 차이를 퍼센트로 계산" },
      en: { title: "Percent Difference Calculator", subtitle: "Calculate the relative % difference between two values" },
    },
  },

  {
    slug: "goal-growth-calculator",
    layout: "card",
    cat: "text",
    targets: ["pm", "small-business-owner", "office-worker"],
    ico: "→%",
    ready: true,
    indexable: false,
    badge: "Calculator",
    name: { ko: "목표 성장률 계산기", en: "Goal Growth Calculator" },
    relatedTools: ["required-growth-calculator", "growth-rate-calculator", "cagr-calculator"],
    seo: {
      ko: {
        title: "목표 성장률 계산기 | 목표 달성에 필요한 성장률",
        description:
          "현재 값과 목표 값을 입력하면 목표 달성에 필요한 성장률(%)을 즉시 계산합니다. 매출 목표·KPI 달성률 계획에 활용하세요.",
        keywords: ["목표 성장률 계산기", "goal growth calculator", "필요 성장률", "target growth calculator"],
      },
      en: {
        title: "Goal Growth Calculator | Growth Rate Needed to Hit Your Target",
        description:
          "Enter your current value and target value to instantly calculate the growth rate required to reach your goal. Great for revenue targets, KPI planning, and business goals.",
        keywords: ["goal growth calculator", "target growth calculator", "required growth rate", "how much growth do I need"],
      },
    },
    content: {
      ko: {
        card: "현재 값과 목표 값으로 필요 성장률 즉시 계산.",
        description:
          "현재 값과 목표 값을 입력하면 목표 달성에 필요한 성장률(%)을 즉시 계산합니다. 매출 목표·KPI 달성률 계획에 활용하세요.",
        howItWorks: ["현재 값 입력", "목표 값 입력", "필요 성장률·차이·배수 확인"],
        aeo: {
          what: "목표 성장률 계산기는 현재 값에서 목표 값까지 달성하기 위해 필요한 성장률을 계산해주는 도구입니다.",
          who: "매출 목표·KPI를 계획하는 PM, 스타트업 창업자, 소상공인, 영업 담당자를 위한 도구입니다.",
          how: "(목표 − 현재) ÷ 현재 × 100 공식으로 필요 성장률을 즉시 계산합니다.",
          why: "목표를 숫자로 설정했을 때 '얼마나 성장해야 하는가'를 즉시 알 수 있어 현실적인 계획을 세우는 데 도움이 됩니다.",
        },
      },
      en: {
        card: "Calculate the growth rate needed to reach your target from your current value.",
        description:
          "Enter your current value and target value to instantly calculate the required growth rate. Great for revenue targets, KPI planning, and business goals.",
        howItWorks: ["Enter the current value", "Enter the target value", "Read the required growth rate and multiplier"],
        aeo: {
          what: "A Goal Growth Calculator computes the percentage growth rate required to move from a current value to a target value.",
          who: "It is for PMs, startup founders, sales teams, and small business owners who set numeric targets and want to know exactly what growth rate is needed.",
          how: "The formula (Target − Current) / Current × 100 is applied; the result shows the required growth rate, difference, and multiplier needed.",
          why: "It turns a vague goal into a concrete growth percentage, making targets more actionable and easier to communicate.",
        },
      },
    },
    faq: {
      ko: [
        { question: "목표가 현재 값보다 작으면 어떻게 되나요?", answer: "음수 성장률이 나옵니다. 이는 목표 달성을 위해 수치를 줄여야 한다는 의미입니다(예: 비용 절감 목표)." },
        { question: "기간을 반영할 수 있나요?", answer: "이 계산기는 단순 성장률만 계산합니다. 연도별 성장률이 필요하다면 CAGR 계산기를 사용하세요." },
        { question: "목표를 달성하기 위해 필요한 배수란 무엇인가요?", answer: "현재 값에 곱해야 하는 수입니다. 예를 들어 현재 1,000에서 1,500이 목표면, 배수는 1.5입니다." },
      ],
      en: [
        { question: "What if the target is less than the current value?", answer: "The result will be a negative growth rate, meaning you need to reduce the metric (e.g., cutting costs to hit a lower target)." },
        { question: "Can I factor in a time period?", answer: "This calculator returns a total growth rate. If you need an annualized rate across multiple years, use the CAGR Calculator." },
        { question: "What does the multiplier needed mean?", answer: "The multiplier is the number you multiply the current value by to reach the target. A multiplier of 1.5 means the target is 1.5× the current value." },
      ],
    },
    og: {
      ko: { title: "목표 성장률 계산기", subtitle: "현재값·목표값으로 필요 성장률·배수 즉시 계산" },
      en: { title: "Goal Growth Calculator", subtitle: "Find the growth rate needed to hit your target instantly" },
    },
  },

  {
    slug: "required-growth-calculator",
    layout: "card",
    cat: "text",
    targets: ["pm", "small-business-owner", "office-worker"],
    ico: "req",
    ready: true,
    indexable: false,
    badge: "Calculator",
    name: { ko: "필요 증가량 계산기", en: "Required Growth Calculator" },
    relatedTools: ["goal-growth-calculator", "reverse-growth-calculator", "growth-rate-calculator"],
    seo: {
      ko: {
        title: "필요 증가량 계산기 | 목표 달성에 필요한 증가량",
        description:
          "현재 값과 목표 값을 입력하면 목표 달성에 필요한 증가량, 성장률, 달성률을 즉시 계산합니다.",
        keywords: ["필요 증가량 계산기", "required growth calculator", "목표 달성률", "growth target calculator"],
      },
      en: {
        title: "Required Growth Calculator | How Much Do You Need to Grow?",
        description:
          "Enter your current value and target value to instantly see the required increase, growth rate, remaining gap, and current progress toward your goal.",
        keywords: ["required growth calculator", "growth target calculator", "how much do I need to grow", "target progress calculator"],
      },
    },
    content: {
      ko: {
        card: "현재값·목표값으로 필요 증가량·달성률 즉시 계산.",
        description:
          "현재 값과 목표 값을 입력하면 목표 달성에 필요한 증가량, 성장률, 남은 갭, 달성률을 즉시 계산합니다.",
        howItWorks: ["현재 값 입력", "목표 값 입력", "필요 증가량·달성률·남은 갭 확인"],
        aeo: {
          what: "필요 증가량 계산기는 현재 값에서 목표 값까지 도달하기 위해 필요한 증가량과 달성률을 계산해주는 도구입니다.",
          who: "매출·KPI 목표를 추적하고 얼마나 더 성장해야 하는지 파악하려는 PM, 영업 담당자, 소상공인을 위한 도구입니다.",
          how: "현재 값과 목표 값을 입력하면 필요 증가량(목표−현재), 필요 성장률, 달성률(현재÷목표×100)을 즉시 계산합니다.",
          why: "목표까지 얼마나 남았는지 숫자로 확인해 팀과 공유하고 우선순위를 설정하는 데 도움이 됩니다.",
        },
      },
      en: {
        card: "Calculate the required increase, growth rate, and progress to your goal.",
        description:
          "Enter your current value and target value to instantly see the required increase, growth rate, remaining gap, and current progress toward your goal.",
        howItWorks: ["Enter the current value", "Enter the target value", "Read required increase, growth rate, gap, and progress"],
        aeo: {
          what: "A Required Growth Calculator shows exactly how much a metric needs to increase to reach a target, along with the current progress percentage.",
          who: "It is for PMs, sales reps, and business owners who track targets and want to know the gap between where they are and where they need to be.",
          how: "Required Increase = Target − Current; Progress = Current / Target × 100; Required Growth Rate = (Target − Current) / Current × 100.",
          why: "It quantifies the gap to goal in multiple ways: absolute increase, percentage growth, and progress, so you can plan and communicate clearly.",
        },
      },
    },
    faq: {
      ko: [
        { question: "필요 증가량과 남은 갭의 차이는 무엇인가요?", answer: "이 계산기에서는 두 값이 동일합니다(목표−현재). 필요 증가량은 '얼마나 늘려야 하는가', 남은 갭은 '얼마나 부족한가'의 관점에서 같은 수치를 나타냅니다." },
        { question: "달성률이 100%를 넘을 수 있나요?", answer: "네. 현재 값이 목표보다 크면 달성률이 100%를 초과합니다. 이미 목표를 달성했다는 의미입니다." },
        { question: "목표가 현재 값보다 작으면 어떻게 되나요?", answer: "필요 증가량이 음수로 나옵니다. 이는 수치를 줄여야 목표를 달성할 수 있음을 의미합니다(예: 비용 절감)." },
      ],
      en: [
        { question: "What is the difference between required increase and remaining gap?", answer: "In this calculator they are the same value (Target − Current). Required Increase frames it as 'how much to add'; Remaining Gap frames it as 'how far you are from the goal'." },
        { question: "Can progress to target exceed 100%?", answer: "Yes. If the current value is already above the target, progress will be above 100%, meaning the goal has been exceeded." },
        { question: "What if the target is lower than the current value?", answer: "The required increase will be negative, indicating you need to reduce the metric to hit a lower target (e.g., cost reduction goals)." },
      ],
    },
    og: {
      ko: { title: "필요 증가량 계산기", subtitle: "현재값·목표값으로 필요 증가량·달성률 즉시 계산" },
      en: { title: "Required Growth Calculator", subtitle: "See how much you need to grow to hit your target" },
    },
  },

  {
    slug: "reverse-growth-calculator",
    layout: "card",
    cat: "text",
    targets: ["pm", "developer", "office-worker"],
    ico: "÷%",
    ready: true,
    indexable: false,
    badge: "Calculator",
    name: { ko: "역산 계산기", en: "Reverse Growth Calculator" },
    relatedTools: ["goal-growth-calculator", "growth-rate-calculator", "cagr-calculator"],
    seo: {
      ko: {
        title: "역산 계산기 | 최종값과 성장률로 원래 값 역산",
        description:
          "최종 값과 성장률(%)을 입력하면 원래 값을 역산합니다. 성장 전 기준값이나 세전 금액을 계산할 때 사용하세요.",
        keywords: ["역산 계산기", "reverse growth calculator", "원래 값 역산", "성장률 역산"],
      },
      en: {
        title: "Reverse Growth Calculator | Find the Original Value from Final Value and Growth Rate",
        description:
          "Enter the final value and growth rate to calculate the original starting value. Useful for finding base values, pre-tax amounts, or starting points before a known percentage change.",
        keywords: ["reverse growth calculator", "reverse percentage calculator", "find original value", "reverse percent change"],
      },
    },
    content: {
      ko: {
        card: "최종 값과 성장률로 원래 값 역산.",
        description:
          "최종 값과 성장률(%)을 입력하면 원래 값을 역산합니다. 성장 전 기준값이나 세전 금액을 계산할 때 사용하세요.",
        howItWorks: ["최종 값 입력", "성장률(%) 입력", "원래 값·차이·배수 확인"],
        aeo: {
          what: "역산 계산기는 최종 값과 성장률을 알고 있을 때 원래 값을 계산해주는 도구입니다.",
          who: "기준값·세전 금액·할인 전 가격 등 성장 전 원래 수치를 알아야 하는 비즈니스 담당자, 회계 담당자, PM을 위한 도구입니다.",
          how: "원래 값 = 최종 값 ÷ (1 + 성장률 ÷ 100) 공식으로 역산합니다.",
          why: "최종 값과 변화율만 알고 시작값을 모를 때, 역방향으로 계산해 원래 수치를 빠르게 구할 수 있습니다.",
        },
      },
      en: {
        card: "Calculate the original value from a final value and a known growth rate.",
        description:
          "Enter the final value and growth rate to calculate the original starting value. Useful for finding base values, pre-tax amounts, or starting points before a known percentage change.",
        howItWorks: ["Enter the final value", "Enter the growth rate (%)", "Read the original value and difference"],
        aeo: {
          what: "A Reverse Growth Calculator finds the original value when you know the final value and the percentage change applied to it.",
          who: "It is for business analysts, accountants, and PMs who need to back-calculate a base figure from a final number and a known rate.",
          how: "Original Value = Final Value / (1 + Growth Rate / 100). This reverses any standard percentage growth calculation.",
          why: "When the end result and growth rate are known but the starting point is not, this calculator solves it in one step without manual algebra.",
        },
      },
    },
    faq: {
      ko: [
        { question: "언제 역산 계산기를 사용하나요?", answer: "최종 값과 성장률은 알지만 시작 값을 모를 때 사용합니다. 예를 들어 성장 후 125가 됐고 성장률이 25%였다면, 원래 값은 100입니다." },
        { question: "성장률이 음수일 수 있나요?", answer: "네. 감소율을 입력하면 최종 값보다 큰 원래 값이 계산됩니다." },
        { question: "성장률이 -100%이면 어떻게 되나요?", answer: "-100%이면 분모가 0이 되어 계산이 불가능합니다. 오류 메시지가 표시됩니다." },
      ],
      en: [
        { question: "When do I use a reverse growth calculator?", answer: "Use it when you know the final value and the growth rate but not the starting value. For example, if a value grew 25% to reach 125, the original value was 100." },
        { question: "Can the growth rate be negative?", answer: "Yes. A negative growth rate means the value decreased; the calculator will return an original value larger than the final value." },
        { question: "What happens if the growth rate is -100%?", answer: "A growth rate of -100% makes the denominator zero, which is undefined. An error message will appear." },
      ],
    },
    og: {
      ko: { title: "역산 계산기", subtitle: "최종값과 성장률로 원래 값 역산" },
      en: { title: "Reverse Growth Calculator", subtitle: "Find the original value from final value and growth rate" },
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
    relatedTools: ["compound-growth-calculator", "growth-rate-calculator", "goal-growth-calculator"],
    seo: {
      ko: {
        title: "CAGR 계산기 | 연평균 성장률 계산",
        description:
          "시작값·종료값·기간을 입력하면 연평균 성장률(CAGR)을 즉시 계산합니다. 투자 수익률·매출 성장률 분석에 활용하세요.",
        keywords: ["CAGR 계산기", "CAGR calculator", "연평균 성장률", "annual growth rate calculator"],
      },
      en: {
        title: "CAGR Calculator | Compound Annual Growth Rate",
        description:
          "Enter a start value, end value, and number of years to instantly calculate the Compound Annual Growth Rate (CAGR). Use it for investment returns, revenue growth analysis, and business planning.",
        keywords: ["CAGR calculator", "compound annual growth rate calculator", "CAGR formula", "annual growth rate calculator"],
      },
    },
    content: {
      ko: {
        card: "시작값·종료값·기간으로 CAGR 즉시 계산.",
        description:
          "시작값·종료값·기간을 입력하면 연평균 성장률(CAGR)을 즉시 계산합니다. 투자 수익률·매출 성장률 분석에 활용하세요.",
        howItWorks: ["시작 값 입력", "종료 값 입력", "기간(년) 입력 후 CAGR·총 성장률 확인"],
        aeo: {
          what: "CAGR 계산기는 시작값과 종료값, 기간을 사용해 연평균 복리 성장률(CAGR)을 계산해주는 도구입니다. CAGR은 Compound Annual Growth Rate의 약자입니다.",
          who: "투자 수익률을 분석하거나 다년간의 비즈니스 성장률을 비교하려는 PM, 투자자, 소상공인을 위한 도구입니다.",
          how: "CAGR = (종료 ÷ 시작)^(1÷기간) − 1 공식으로 연평균 성장률을 계산합니다.",
          why: "단순 성장률과 달리 복리 효과를 반영해 여러 해에 걸친 성장을 단일 연율로 표현하므로 비교가 용이합니다.",
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
              "반대 방향의 계산이 필요하다면, 즉 시작값과 성장률로 미래 값을 구하고 싶다면 복리 성장 계산기를 쓰세요. 같은 수식을 반대로 푸는 도구입니다.",
            ],
          },
          {
            heading: "결과를 어떻게 읽을 것인가",
            body: [
              "CAGR은 과거를 요약하는 지표이지 미래를 보장하는 값이 아닙니다. 지난 3년 CAGR이 20%라는 사실이 내년에도 20% 성장한다는 뜻은 아닙니다. 특히 시작 시점이 유난히 낮았던 해라면 CAGR이 부풀려지므로, 시작·종료 연도를 한 해씩 옮겨 보면서 숫자가 크게 흔들리는지 확인하는 습관이 좋습니다.",
              "기간을 셀 때는 연도 개수가 아니라 구간 수를 넣어야 합니다. 2023년 말부터 2026년 말까지라면 연도는 네 개지만 기간은 3년입니다. 이 한 칸 차이로 CAGR이 눈에 띄게 달라집니다.",
            ],
          },
        ],
        examples: [
          {
            title: "3년간 매출 성장을 연율로 환산",
            input: "시작 120,000,000 · 종료 210,000,000 · 기간 3년",
            result: "CAGR 약 20.5% (총 성장률 75%)",
            note: "\"3년간 75% 성장\"보다 \"연평균 20.5% 성장\"이 다른 기간의 사업과 비교하기 쉽습니다. 검산: 1.205를 세 번 곱하면 약 1.75가 됩니다.",
          },
          {
            title: "요동친 성과의 실제 연평균 구하기",
            input: "시작 100 · 종료 100 · 기간 2년 (1년 차 +100%, 2년 차 −50%)",
            result: "CAGR 0%",
            note: "연도별 성장률의 산술평균은 +25%로 나오지만, 실제로는 제자리입니다. 성장률을 평균 낼 때 CAGR을 써야 하는 이유가 이 차이입니다.",
          },
          {
            title: "감소한 지표의 연평균 하락률",
            input: "시작 50,000 · 종료 32,000 · 기간 2년",
            result: "CAGR 약 −20%",
            note: "감소도 같은 수식으로 계산되며 음수 CAGR로 표시됩니다. 이탈률·해지 건수처럼 줄어드는 것이 목표인 지표에도 그대로 쓸 수 있습니다.",
          },
        ],
        limitations: [
          "시작값은 반드시 0보다 커야 합니다. 시작값이 0이거나 음수면 (종료÷시작) 자체가 성립하지 않아 CAGR을 정의할 수 없습니다.",
          "중간 경로를 전부 지운 값입니다. CAGR이 같은 두 사업도 하나는 꾸준히 성장했고 다른 하나는 한 해에 몰아서 성장했을 수 있으므로, 변동성 판단에는 쓸 수 없습니다.",
          "기간은 연도 개수가 아니라 구간 수입니다. 2023년 말 → 2026년 말은 3년이며, 4를 넣으면 성장률이 실제보다 낮게 나옵니다.",
          "물가상승률을 반영하지 않은 명목 성장률입니다. 장기간(5년 이상) 금액을 비교할 때는 실질 가치 기준으로 따로 보정해야 합니다.",
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
              "If you need the reverse: a future value from a start value and a rate: use the compound growth calculator, which solves the same equation in the other direction.",
            ],
          },
          {
            heading: "How to read the result",
            body: [
              "CAGR summarizes the past; it does not promise the future. A 20% CAGR over the last three years does not mean next year will be 20%. It is especially inflated when the starting year happened to be unusually low, so it is worth shifting the start and end years by one and checking whether the number moves a lot.",
              "Count periods, not years. From the end of 2023 to the end of 2026 there are four calendar years but only three periods. That off-by-one changes the CAGR noticeably.",
            ],
          },
        ],
        examples: [
          {
            title: "Turning three years of revenue growth into an annual rate",
            input: "Start 120,000,000 · End 210,000,000 · 3 years",
            result: "CAGR about 20.5% (total growth 75%)",
            note: "\"20.5% a year\" compares across time spans in a way that \"75% over three years\" cannot. Check it: multiply 1.205 by itself three times and you get roughly 1.75.",
          },
          {
            title: "Finding the real average behind a volatile run",
            input: "Start 100 · End 100 · 2 years (+100% then −50%)",
            result: "CAGR 0%",
            note: "Averaging the yearly rates arithmetically gives +25%, yet nothing actually changed. That gap is exactly why growth rates should be averaged with CAGR.",
          },
          {
            title: "The annual rate of a metric that is shrinking",
            input: "Start 50,000 · End 32,000 · 2 years",
            result: "CAGR about −20%",
            note: "Declines use the same formula and come out as a negative CAGR, which works just as well for metrics like churn or cancellations where going down is the goal.",
          },
        ],
        limitations: [
          "The start value must be greater than zero. With a start of zero or a negative start, End ÷ Start breaks down and CAGR is undefined.",
          "It erases the path in between. Two businesses with identical CAGR may have grown steadily or in a single burst, so it says nothing about volatility.",
          "Years means the number of periods, not the number of calendar years. End of 2023 to end of 2026 is 3; entering 4 understates the growth rate.",
          "It is a nominal rate with no inflation adjustment. When comparing money over five years or more, deflate to real terms separately.",
        ],
      },
    },
    faq: {
      ko: [
        { question: "CAGR이란 무엇인가요?", answer: "CAGR(Compound Annual Growth Rate)은 연평균 복리 성장률입니다. 시작값에서 종료값까지 매년 동일한 비율로 성장했다면 그 비율이 CAGR입니다." },
        { question: "CAGR과 단순 성장률의 차이는 무엇인가요?", answer: "단순 성장률은 시작과 끝 두 시점만 비교합니다. CAGR은 복리를 적용해 매년 균등한 성장률을 구하므로, 다년간 비교에 더 정확합니다." },
        { question: "CAGR이 음수가 될 수 있나요?", answer: "네. 종료 값이 시작 값보다 작으면 CAGR은 음수가 됩니다. 다만 시작 값은 반드시 양수여야 합니다." },
      ],
      en: [
        { question: "What does CAGR mean?", answer: "CAGR stands for Compound Annual Growth Rate. It is the constant annual rate at which a value would have grown from the start value to the end value over a given number of years." },
        { question: "How is CAGR different from simple growth rate?", answer: "Simple growth rate compares only two points in time. CAGR compounds the growth evenly across each year, making it more useful for comparing growth over different time periods." },
        { question: "Can CAGR be negative?", answer: "Yes. If the end value is lower than the start value, CAGR will be negative, indicating an average annual decline. The start value must always be positive." },
      ],
    },
    og: {
      ko: { title: "CAGR 계산기", subtitle: "시작값·종료값·기간으로 연평균 성장률(CAGR) 즉시 계산" },
      en: { title: "CAGR Calculator", subtitle: "Calculate Compound Annual Growth Rate instantly" },
    },
  },

  {
    slug: "compound-growth-calculator",
    layout: "card",
    cat: "text",
    targets: ["pm", "small-business-owner", "office-worker"],
    ico: "^n",
    ready: true,
    indexable: true,
    badge: "Calculator",
    name: { ko: "복리 성장 계산기", en: "Compound Growth Calculator" },
    relatedTools: ["cagr-calculator", "goal-growth-calculator", "growth-rate-calculator"],
    seo: {
      ko: {
        title: "복리 성장 계산기 | 미래값 예측·성장 시나리오",
        description:
          "초기(현재) 값, 성장률(%), 기간을 입력하면 복리로 계산된 최종값과 총 성장률을 즉시 계산합니다. 매출·사용자 수·트래픽의 미래값 예측과 성장 시나리오 플래닝에 활용하세요.",
        keywords: [
          "복리 성장 계산기", "복리 계산기", "성장 예측 계산기", "미래값 계산기", "성장 시나리오",
          "compound growth calculator", "future value calculator", "growth projection calculator",
        ],
      },
      en: {
        title: "Compound Growth Calculator | Future Value & Projection",
        description:
          "Enter an initial (current) value, growth rate, and number of periods to instantly calculate the compounded final value and total growth. Great for projecting revenue, users, or investments and for growth scenario planning.",
        keywords: [
          "compound growth calculator", "compounding calculator", "future value calculator",
          "growth projection calculator", "revenue projection calculator", "growth forecast calculator",
        ],
      },
    },
    content: {
      ko: {
        card: "초기(현재)값·성장률·기간으로 복리 최종값·미래 예측값 즉시 계산.",
        description:
          "초기(현재) 값, 성장률(%), 기간을 입력하면 복리로 계산된 최종값과 총 성장률을 즉시 계산합니다. 초기 투자금의 복리 성장은 물론, 현재 매출·사용자 수·트래픽이 일정 성장률로 커졌을 때의 미래값 예측(성장 시나리오)까지 같은 공식으로 구할 수 있습니다.",
        howItWorks: ["초기(현재) 값 입력", "기간당 성장률(%) 입력", "기간(회차) 입력 후 최종값·미래 예측값·총 성장률 확인"],
        aeo: {
          what: "복리 성장 계산기는 초기(현재) 값에 성장률을 복리로 적용해 일정 기간 후의 최종값을 계산하는 도구입니다. 초기 투자금의 복리 최종값 계산과 현재 지표의 미래값 예측(성장 예측)이 모두 최종값 = 초기값 × (1 + 성장률/100)^기간이라는 동일한 공식이라, 이 계산기 하나로 처리합니다.",
          who: "복리로 성장하는 매출·투자·사용자 수의 최종값이나 미래 예측값을 구하려는 PM, 스타트업 창업자, 투자자, 소상공인을 위한 도구입니다.",
          how: "최종값 = 초기값 × (1 + 성장률/100)^기간 공식으로 계산합니다. '초기 값'에 현재 지표를 넣으면 그대로 미래 예측값(성장 예측)이 됩니다.",
          why: "복리의 힘을 직관적으로 확인하고, 성장률·기간을 바꿔가며 여러 성장 시나리오의 결과를 즉시 비교해 계획 수립과 의사결정을 빠르게 할 수 있습니다.",
        },
        guide: [
          {
            heading: "복리 성장과 미래값 예측은 같은 계산",
            body: [
              "'복리 성장'과 '성장 예측(미래값)'은 이름과 쓰는 맥락이 다를 뿐 계산은 동일합니다. 둘 다 최종값 = 초기값 × (1 + 성장률/100)^기간 공식을 씁니다. 초기 투자금 1,000만원이 매년 10%씩 복리로 늘면 5년 뒤 얼마인지 구하는 것과, 이번 달 사용자 5,000명이 매달 8%씩 성장하면 1년 뒤 몇 명일지 예측하는 것은 수식상 완전히 같은 문제입니다.",
              "그래서 '초기 값' 칸에 투자 원금을 넣으면 복리 최종값 계산기가 되고, 현재 매출·사용자·트래픽 같은 비즈니스 지표를 넣으면 그대로 미래값을 내다보는 성장 예측 계산기가 됩니다.",
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
            heading: "기간 단위와 활용",
            body: [
              "기간 단위는 성장률과 일치시키면 무엇이든 됩니다. 성장률이 월 기준이면 기간도 개월 수로, 연 기준이면 연수로 넣으세요. 같은 초기값이라도 성장률과 기간을 조금만 바꾸면 최종값이 크게 달라지므로, 낙관·기본·보수 시나리오를 각각 넣어 비교하면 계획의 폭을 가늠할 수 있습니다.",
              "모든 계산은 브라우저 안에서만 이루어지며 입력한 숫자는 서버로 전송되지 않습니다. 참고로 미래 예측은 '성장률이 매 기간 일정하다'는 가정에 기반하므로, 성장률이 변동한다면 구간을 나눠 계산하세요.",
            ],
          },
        ],
              examples: [
          {
            title: "연 12% 성장 가정으로 5년 뒤 매출 예측",
            input: "현재 값 50,000,000 · 성장률 12% · 기간 5년",
            result: "약 88,117,000 (총 증가 약 76%)",
            note: "단리로 계산하면 50,000,000 × (1 + 0.12 × 5) = 80,000,000입니다. 5년만 지나도 복리와 단리의 차이가 800만원 넘게 벌어집니다.",
          },
          {
            title: "사업계획서의 성장 시나리오 비교",
            input: "같은 현재 값에 성장률 8% / 12% / 20%를 각각 입력",
            result: "5년 뒤 약 73,466,000 / 88,117,000 / 124,416,000",
            note: "보수·기본·공격 세 가지 시나리오를 나란히 두면, 목표 숫자가 어느 가정에 기대고 있는지 한눈에 보입니다.",
          },
          {
            title: "감소 시나리오(이탈) 예측",
            input: "현재 값 12,000 · 성장률 −5% · 기간 8분기",
            result: "약 7,963",
            note: "성장률에 음수를 넣으면 복리 감소가 됩니다. 기간 단위는 연이 아니어도 되며, 분기 이탈률을 넣으면 분기 단위로 계산됩니다.",
          },
        ],
        limitations: [
          "성장률이 매 기간 동일하다고 가정합니다. 실제 사업은 시장 포화·경쟁 진입·계절성으로 성장률이 변하므로, 기간이 길어질수록 예측 오차가 급격히 커집니다.",
          "5년을 넘는 예측은 참고용으로만 쓰세요. 연 20% 성장을 10년간 유지하면 6.2배가 되는데, 이 규모를 실제로 달성하는 사업은 드뭅니다.",
          "기간 단위는 성장률의 단위와 반드시 같아야 합니다. 연 성장률에 기간 12를 넣으면 12개월이 아니라 12년이 계산됩니다.",
          "물가상승률·환율·세금을 반영하지 않은 명목 값입니다. 투자 수익을 볼 때는 실질 수익률로 따로 환산해야 합니다.",
        ],
      },
      en: {
        card: "Compute compounded final value and future projection from a value, rate, and periods.",
        description:
          "Enter an initial (current) value, growth rate, and number of periods to instantly calculate the compounded final value and total growth. It covers both compounding an initial investment and projecting the future value of a current metric: the same formula either way.",
        howItWorks: ["Enter the initial (current) value", "Enter the growth rate per period (%)", "Enter the number of periods, then read the final / projected value"],
        aeo: {
          what: "A Compound Growth Calculator applies a growth rate repeatedly over a number of periods to compute the final value. Compounding an initial investment and projecting a current metric into the future both use Final Value = Initial × (1 + Rate / 100) ^ Periods, so this one calculator handles both.",
          who: "It is for PMs, startup founders, investors, and business owners projecting revenue, users, or investments that grow at a constant periodic rate.",
          how: "Final Value = Initial Value × (1 + Rate / 100) ^ Periods. Put your current metric in the initial value field and the result is your future projection.",
          why: "Compound growth diverges sharply from simple growth at scale: vary the rate and periods to compare growth scenarios and ground your planning in concrete numbers.",
        },
        guide: [
          {
            heading: "Compound growth and future projection are the same math",
            body: [
              "'Compound growth' and 'growth projection (future value)' differ only in name and context: the calculation is identical. Both use Final Value = Initial × (1 + Rate / 100) ^ Periods. Working out what an initial 10,000 becomes after growing 10% a year for five years, and projecting what this month's 5,000 users become after a year of 8% monthly growth, are the exact same problem in formula terms.",
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
            heading: "Period units and how to use it",
            body: [
              "Any period unit works as long as it matches the rate: use months if your rate is monthly, years if it's annual. Because the same starting value can end up very differently with small changes to rate or periods, entering optimistic, base, and conservative scenarios side by side helps you size the range of outcomes.",
              "Everything runs in your browser and your inputs are never sent to a server. Note that a projection assumes a constant rate every period, so if growth varies, split the horizon into segments and calculate each.",
            ],
          },
        ],
              examples: [
          {
            title: "Projecting revenue five years out at 12% a year",
            input: "Current 50,000,000 · Rate 12% · 5 periods",
            result: "About 88,117,000 (roughly 76% total growth)",
            note: "Simple interest would give 50,000,000 × (1 + 0.12 × 5) = 80,000,000. Even at five years the compounding gap is over 8 million.",
          },
          {
            title: "Comparing growth scenarios in a business plan",
            input: "The same current value at 8% / 12% / 20%",
            result: "About 73,466,000 / 88,117,000 / 124,416,000 after five periods",
            note: "Lining up conservative, base and aggressive cases makes it obvious which assumption your target number is leaning on.",
          },
          {
            title: "Modelling a decline instead of growth",
            input: "Current 12,000 · Rate −5% · 8 quarters",
            result: "About 7,963",
            note: "A negative rate compounds downward. The period does not have to be a year: feed it a quarterly churn rate and the result is quarterly.",
          },
        ],
        limitations: [
          "It assumes the same rate every period. Real businesses see growth change with saturation, new competitors and seasonality, so the error grows sharply the further out you project.",
          "Treat anything beyond five periods as illustrative. Sustaining 20% for ten years implies a 6.2x increase, which very few businesses actually achieve.",
          "The period unit must match the rate unit. Entering 12 with an annual rate models twelve years, not twelve months.",
          "Results are nominal, with no inflation, currency or tax effects. Convert to a real rate separately when evaluating investment returns.",
        ],
      },
    },
    faq: {
      ko: [
        { question: "복리 성장이란 무엇인가요?", answer: "복리 성장은 각 기간의 성장이 이전 기간까지 누적된 값에 적용되는 방식입니다. 단리와 달리 시간이 지날수록 성장 속도가 빨라집니다." },
        { question: "성장 예측(미래값)도 이 계산기로 구하나요?", answer: "네. 미래값 예측은 복리 성장과 동일한 공식을 씁니다. '초기 값' 칸에 현재 매출·사용자 수 등을 넣으면 그대로 미래 예측값이 됩니다." },
        { question: "성장률이 매 기간 동일하다고 가정하나요?", answer: "네. 모든 기간에 같은 성장률이 적용된다고 가정합니다. 성장률이 변동한다면 구간을 나눠 각각 계산하세요." },
        { question: "기간(회차)을 0으로 설정하면 어떻게 되나요?", answer: "0 기간은 허용됩니다. 최종값은 초기값과 동일합니다." },
        { question: "음수 성장률을 입력할 수 있나요?", answer: "네. 음수 성장률을 입력하면 기간이 지날수록 값이 줄어드는 복리 감소를 계산합니다." },
      ],
      en: [
        { question: "What is compound growth?", answer: "Compound growth applies a growth rate to the accumulated total at the end of each period, not just the original value, causing exponential growth over time." },
        { question: "Can I project a future value here too?", answer: "Yes. A future-value projection uses the same formula as compound growth. Put your current revenue, users, or metric in the initial value field and the result is your projection." },
        { question: "Does it assume a constant growth rate each period?", answer: "Yes. It assumes the same rate every period. For variable rates, split the horizon into segments and calculate each separately." },
        { question: "What happens if I set periods to 0?", answer: "Zero periods is allowed. The final value equals the initial value: no growth has occurred." },
        { question: "Can I enter a negative growth rate?", answer: "Yes. A negative rate models compound decline, where the value decreases by the specified percentage each period." },
      ],
    },
    og: {
      ko: { title: "복리 성장 계산기", subtitle: "복리 최종값·미래 예측값·성장 시나리오 즉시 계산" },
      en: { title: "Compound Growth Calculator", subtitle: "Compounded final value and future projection instantly" },
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
    indexable: false,
    badge: "Marketing Calculator",
    name: { ko: "광고 예산 페이싱 계산기", en: "Ad Budget Pacing Calculator" },
    relatedTools: ["roas-calculator", "cpa-calculator", "funnel-conversion-calculator"],
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
    slug: "roas-calculator",
    layout: "card",
    cat: "text",
    targets: ["marketer", "small-business-owner", "pm"],
    ico: "ROAS",
    ready: true,
    indexable: true,
    badge: "Marketing Calculator",
    name: { ko: "ROAS 계산기", en: "ROAS Calculator" },
    relatedTools: ["cpa-calculator", "ad-budget-pacing-calculator", "funnel-conversion-calculator"],
    seo: {
      ko: {
        title: "ROAS 계산기 | 광고 수익률·목표 매출·허용 광고비 계산",
        description:
          "광고비와 광고 매출을 입력해 ROAS(광고 수익률)를 즉시 계산합니다. 목표 ROAS로 필요 매출을 역산하거나 목표 매출로 허용 광고비를 역산할 수도 있습니다. 매출총이익률 입력 시 손익분기 ROAS도 함께 계산됩니다. 모든 계산은 브라우저에서만 처리됩니다.",
        keywords: [
          "ROAS 계산기",
          "광고 수익률 계산",
          "광고비 대비 매출",
          "목표 ROAS 계산",
          "손익분기 ROAS",
          "return on ad spend calculator",
        ],
      },
      en: {
        title: "ROAS Calculator | Return on Ad Spend, Target Revenue & Budget",
        description:
          "Enter your ad spend and revenue to calculate ROAS instantly. Reverse-calculate the required revenue from a target ROAS, or find the allowable ad budget from a target revenue. Add a gross margin percentage to see your break-even ROAS. Every calculation runs in your browser and the figures you enter are never uploaded.",
        keywords: [
          "ROAS calculator",
          "return on ad spend calculator",
          "target ROAS calculator",
          "ad revenue calculator",
          "break even ROAS",
          "advertising ROI calculator",
        ],
      },
    },
    content: {
      ko: {
        card: "광고비·매출로 ROAS 즉시 계산. 목표 매출·허용 광고비 역산과 손익분기 ROAS 포함.",
        description:
          "광고비와 광고 매출을 입력해 ROAS(광고 수익률)를 즉시 계산합니다. 목표 ROAS로 필요 매출을 역산하거나 목표 매출로 허용 광고비를 역산할 수도 있습니다. 매출총이익률 입력 시 손익분기 ROAS도 함께 계산됩니다. 모든 계산은 브라우저에서만 처리됩니다.",
        howItWorks: [
          "계산 모드 선택(ROAS·목표 매출·허용 광고비)",
          "광고비·매출 또는 목표값 입력",
          "ROAS와 관련 수치 즉시 확인",
        ],
        aeo: {
          what: "ROAS 계산기는 광고비 대비 매출 비율인 ROAS(Return on Ad Spend)를 계산하고, 목표 ROAS에서 필요 매출과 허용 광고비를 역산하며, 매출총이익률로 손익분기 ROAS를 도출하는 도구입니다.",
          who: "광고 성과를 추적하는 마케터, 디지털 광고를 운영하는 소상공인, 캠페인 예산을 계획하는 PM을 위한 도구입니다.",
          how: "ROAS 계산 모드에서는 광고비와 광고 매출을 입력하면 ROAS(%)와 ROAS 배수를 즉시 계산합니다. 목표 매출·허용 광고비 모드에서는 목표값을 역산합니다. 매출총이익률을 추가로 입력하면 손익분기 ROAS도 계산됩니다.",
          why: "ROAS는 광고 효율을 가장 직관적으로 나타내는 지표입니다. 목표 ROAS를 설정하고 역산하면 광고 예산을 더 정확하게 계획할 수 있습니다.",
        },
        guide: [
          {
            heading: "ROAS란 무엇이고 어떻게 읽나",
            body: [
              "ROAS(Return on Ad Spend)는 광고비 대비 매출을 나타내는 지표로, 매출 ÷ 광고비로 계산합니다. ROAS 400%(또는 4:1)는 광고에 1원을 써서 4원의 매출이 났다는 뜻입니다. 채널·캠페인·소재별로 ROAS를 비교하면 어디에 예산을 더 넣고 어디를 줄일지 판단할 수 있어, 퍼포먼스 마케팅에서 가장 먼저 보는 숫자입니다.",
              "이 계산기는 광고비와 매출로 ROAS를 즉시 구하고, 목표 매출이나 허용 광고비를 거꾸로 역산하는 것도 지원합니다.",
            ],
          },
          {
            heading: "손익분기 ROAS를 알아야 진짜 수익이 보인다",
            body: [
              "ROAS가 높다고 무조건 이익은 아닙니다. 제품 마진을 고려해야 하기 때문입니다. 마진율이 25%라면 광고비를 회수하는 손익분기 ROAS는 400%이고, 그보다 높아야 비로소 이익이 남습니다. 즉 같은 ROAS 300%라도 마진이 높은 상품이면 흑자, 낮은 상품이면 적자일 수 있습니다.",
              "그래서 목표 ROAS는 마진 구조 위에서 세워야 합니다. 목표 ROAS를 정하고 허용 광고비·필요 매출을 역산하면 예산을 감이 아니라 숫자로 계획할 수 있습니다. 모든 계산은 브라우저 안에서 이루어집니다.",
            ],
          },
        ],
              examples: [
          {
            title: "캠페인 ROAS 계산",
            input: "광고비 3,000,000 · 광고 매출 12,600,000",
            result: "ROAS 420%",
            note: "광고비 1원당 매출 4.2원이라는 뜻입니다. ROAS는 매출 기준이라 원가와 수수료를 빼기 전 숫자이며, 이 값만으로는 흑자인지 알 수 없습니다.",
          },
          {
            title: "손익분기 ROAS로 흑자 여부 판단",
            input: "기여이익률 25%",
            result: "손익분기 ROAS 400%",
            note: "손익분기 ROAS = 1 ÷ 기여이익률입니다. 마진이 25%면 400%를 넘어야 본전이므로, 위 예시의 420%는 겨우 흑자 구간입니다. 마진율을 모른 채 \"ROAS 400% 달성\"을 성과로 보고하면 적자 캠페인을 성공으로 착각할 수 있습니다.",
          },
          {
            title: "목표 매출에서 허용 광고비 역산",
            input: "목표 매출 50,000,000 · 목표 ROAS 500%",
            result: "허용 광고비 10,000,000",
            note: "월 예산을 짤 때 쓰는 방향입니다. 목표 ROAS를 마진율에서 먼저 정하고, 거기서 쓸 수 있는 광고비를 도출하는 순서가 안전합니다.",
          },
        ],
        limitations: [
          "ROAS는 매출 기준 지표입니다. 원가·배송비·결제 수수료·반품을 반영하지 않으므로, 수익성 판단에는 반드시 기여이익률과 손익분기 ROAS를 함께 봐야 합니다.",
          "광고 매출은 플랫폼이 자기 기여로 집계한 값입니다. 클릭 후 7일 이내 구매 같은 기여 기간(attribution window) 설정에 따라 같은 캠페인의 ROAS가 크게 달라지며, 여러 채널의 ROAS를 단순 합산하면 같은 주문이 중복 계상됩니다.",
          "신규 고객 획득 캠페인은 첫 구매만으로 평가하면 ROAS가 낮게 나옵니다. 재구매가 있는 사업이라면 고객 생애 가치(LTV) 기준으로 함께 판단해야 합니다.",
          "브랜드 검색처럼 광고가 없어도 발생했을 매출은 걷어내지 않습니다. 증분 효과를 보려면 캠페인을 끄고 비교하는 실험이 필요합니다.",
        ],
      },
      en: {
        card: "Calculate ROAS from ad spend and revenue. Reverse-calculate target revenue or allowable budget.",
        description:
          "Enter your ad spend and revenue to calculate ROAS instantly. Reverse-calculate the required revenue from a target ROAS, or find the allowable ad budget from a target revenue. Add a gross margin percentage to see your break-even ROAS. Every calculation runs in your browser and the figures you enter are never uploaded.",
        howItWorks: [
          "Choose a calculation mode (ROAS, target revenue, or allowable budget)",
          "Enter ad spend, revenue, or target values",
          "See ROAS and related metrics instantly",
        ],
        aeo: {
          what: "ROAS Calculator is a tool that computes Return on Ad Spend (ad revenue ÷ ad spend × 100), reverse-calculates target revenue or allowable ad budget from a target ROAS, and derives break-even ROAS from a gross margin percentage.",
          who: "It is for marketers tracking ad performance, small business owners running digital ads, and PMs planning campaign budgets.",
          how: "In ROAS mode, enter ad spend and revenue to get ROAS (%) and ROAS multiple instantly. In target modes, enter the target value to reverse-calculate the missing number. Enter a gross margin percentage to see the break-even ROAS.",
          why: "ROAS is the most direct measure of advertising efficiency. Setting a target ROAS and reverse-calculating required inputs lets you plan budgets with precision rather than guesswork.",
        },
        guide: [
          {
            heading: "What ROAS is and how to read it",
            body: [
              "ROAS (Return on Ad Spend) is revenue relative to ad spend, calculated as revenue ÷ ad spend. A ROAS of 400% (or 4:1) means every 1 spent on ads produced 4 in revenue. Comparing ROAS across channels, campaigns, and creatives shows where to add budget and where to cut, which is why it's the first number performance marketers look at.",
              "This calculator turns ad spend and revenue into ROAS instantly, and also reverse-calculates the target revenue or allowable ad spend you'd need.",
            ],
          },
          {
            heading: "Know your break-even ROAS to see real profit",
            body: [
              "A high ROAS isn't automatically profitable, because you have to account for product margin. At a 25% margin, the break-even ROAS that just recovers ad cost is 400%, and you only profit above that. So the same ROAS of 300% can be profitable on a high-margin product and a loss on a low-margin one.",
              "That means your target ROAS should be built on your margin structure. Setting a target and reverse-calculating allowable spend and required revenue lets you plan budgets by the numbers rather than by feel. Everything runs in your browser.",
            ],
          },
        ],
              examples: [
          {
            title: "Calculating campaign ROAS",
            input: "Ad spend 3,000,000 · Attributed revenue 12,600,000",
            result: "ROAS 420%",
            note: "That is 4.2 in revenue per 1 spent. ROAS is a revenue figure taken before cost of goods and fees, so on its own it does not tell you whether the campaign made money.",
          },
          {
            title: "Using break-even ROAS to judge profitability",
            input: "Contribution margin 25%",
            result: "Break-even ROAS 400%",
            note: "Break-even ROAS = 1 ÷ contribution margin. At a 25% margin you need to clear 400% just to break even, so the 420% above is barely profitable. Reporting \"we hit 400% ROAS\" without knowing the margin can dress up a losing campaign as a win.",
          },
          {
            title: "Working backwards from a revenue target to an allowable budget",
            input: "Target revenue 50,000,000 · Target ROAS 500%",
            result: "Allowable ad spend 10,000,000",
            note: "This is the direction to use when planning a monthly budget: set the target ROAS from your margin first, then derive the spend it allows.",
          },
        ],
        limitations: [
          "ROAS is measured on revenue. It ignores cost of goods, shipping, payment fees and returns, so profitability decisions need contribution margin and break-even ROAS alongside it.",
          "Attributed revenue is whatever the ad platform claims credit for. The attribution window (say, purchases within seven days of a click) can move the same campaign's ROAS substantially, and adding ROAS across channels double-counts the same orders.",
          "Prospecting campaigns look weak when judged on the first purchase alone. If customers buy again, evaluate against lifetime value as well.",
          "It does not strip out revenue that would have happened anyway, such as branded search. Measuring incrementality requires an experiment that turns the campaign off.",
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "ROAS는 무엇인가요?",
          answer:
            "ROAS(Return on Ad Spend)는 광고 수익률로, 광고비 1원을 투자했을 때 매출이 얼마나 발생했는지를 나타냅니다. ROAS(%) = 광고 매출 ÷ 광고비 × 100으로 계산합니다. 예를 들어 광고비 100만 원으로 400만 원의 매출을 달성하면 ROAS는 400%입니다.",
        },
        {
          question: "ROAS와 ROI의 차이는 무엇인가요?",
          answer:
            "ROAS는 광고비 대비 매출만 비교하는 단순 지표입니다. ROI(Return on Investment)는 광고비 외에 제조원가·운영비 등 전체 비용을 고려한 순이익 기준 지표입니다. 광고 효율만 빠르게 비교할 때는 ROAS를, 전체 사업 수익성을 볼 때는 ROI를 사용합니다.",
        },
        {
          question: "손익분기 ROAS는 어떻게 계산하나요?",
          answer:
            "손익분기 ROAS = 100 ÷ 매출총이익률(소수)로 계산합니다. 예를 들어 매출총이익률이 30%이면 손익분기 ROAS는 100 ÷ 0.3 = 333.33%입니다. 이 값 이상의 ROAS를 달성해야 광고비를 제외하고도 이익이 발생합니다.",
        },
        {
          question: "입력한 광고비와 매출 데이터가 서버로 전송되나요?",
          answer:
            "아니요. 모든 계산은 브라우저에서만 처리됩니다. 입력한 데이터는 어떤 서버에도 전송되거나 저장되지 않습니다.",
        },
      ],
      en: [
        {
          question: "What is ROAS?",
          answer:
            "ROAS (Return on Ad Spend) measures how much revenue you earn for every dollar spent on advertising. ROAS (%) = ad revenue ÷ ad spend × 100. For example, spending $1,000 on ads and generating $4,000 in revenue gives you a ROAS of 400%.",
        },
        {
          question: "What is the difference between ROAS and ROI?",
          answer:
            "ROAS only compares ad revenue to ad spend. ROI (Return on Investment) factors in all costs: cost of goods, operations, etc., and measures net profit. Use ROAS for a quick read on ad efficiency; use ROI for overall profitability.",
        },
        {
          question: "How is break-even ROAS calculated?",
          answer:
            "Break-even ROAS = 100 ÷ gross margin (as a decimal). For example, a 30% gross margin gives a break-even ROAS of 100 ÷ 0.3 = 333.33%. You need to achieve at least this ROAS for ads to be profitable after accounting for cost of goods.",
        },
        {
          question: "Is my ad spend and revenue data sent to a server?",
          answer:
            "No. Every calculation runs entirely in your browser. The budget and spend figures you enter are never uploaded or stored.",
        },
      ],
    },
    og: {
      ko: { title: "ROAS 계산기", subtitle: "광고 수익률 · 목표 매출 · 허용 광고비 역산" },
      en: { title: "ROAS Calculator", subtitle: "Return on ad spend, target revenue and allowable budget" },
    },
  },
  {
    slug: "cpa-calculator",
    layout: "card",
    cat: "text",
    targets: ["marketer", "small-business-owner", "pm"],
    ico: "CPA",
    ready: true,
    indexable: false,
    badge: "Marketing Calculator",
    name: { ko: "CPA 계산기", en: "CPA Calculator" },
    relatedTools: ["roas-calculator", "cpc-calculator", "funnel-conversion-calculator"],
    seo: {
      ko: {
        title: "CPA 계산기 | 전환당 광고비·예상 전환 수·필요 예산 계산",
        description:
          "광고비와 전환 수를 입력해 CPA(전환당 비용)를 즉시 계산합니다. 목표 CPA로 예상 전환 수를 역산하거나, 목표 전환 수와 CPA로 필요 예산을 계산할 수도 있습니다. 모든 계산은 브라우저에서만 처리됩니다.",
        keywords: [
          "CPA 계산기",
          "전환당 비용 계산",
          "목표 CPA 계산",
          "전환 광고비 계산",
          "cost per acquisition calculator",
          "cost per action calculator",
        ],
      },
      en: {
        title: "CPA Calculator | Cost Per Acquisition, Conversions & Budget",
        description:
          "Enter ad spend and conversions to calculate CPA (cost per acquisition) instantly. Reverse-calculate expected conversions from a target CPA and budget, or find the required budget for a target conversion count. Every calculation runs in your browser and the figures you enter are never uploaded.",
        keywords: [
          "CPA calculator",
          "cost per acquisition calculator",
          "cost per action calculator",
          "conversion cost calculator",
          "target CPA calculator",
        ],
      },
    },
    content: {
      ko: {
        card: "광고비·전환 수로 CPA 즉시 계산. 예상 전환 수·필요 예산 역산 포함.",
        description:
          "광고비와 전환 수를 입력해 CPA(전환당 비용)를 즉시 계산합니다. 목표 CPA로 예상 전환 수를 역산하거나, 목표 전환 수와 CPA로 필요 예산을 계산할 수도 있습니다. 모든 계산은 브라우저에서만 처리됩니다.",
        howItWorks: [
          "계산 모드 선택(CPA·예상 전환 수·필요 예산)",
          "광고비·전환 수 또는 목표값 입력",
          "CPA와 관련 수치 즉시 확인",
        ],
        aeo: {
          what: "CPA 계산기는 광고비 ÷ 전환 수로 전환당 광고비(CPA, Cost Per Acquisition)를 계산하고, 목표 CPA와 예산으로 예상 전환 수를 역산하거나 목표 전환 수와 CPA로 필요 예산을 계산하는 도구입니다.",
          who: "전환 성과를 추적하는 마케터, 퍼포먼스 광고를 운영하는 소상공인, 캠페인 KPI를 관리하는 PM을 위한 도구입니다.",
          how: "CPA 계산 모드에서는 광고비와 전환 수를 입력하면 CPA를 즉시 계산합니다. 목표 CPA 역산 모드에서는 예산과 목표 CPA로 예상 전환 수를, 필요 예산 모드에서는 목표 전환 수와 CPA로 필요 예산을 계산합니다.",
          why: "CPA는 광고 효율을 전환 기준으로 측정하는 핵심 지표입니다. 목표 CPA를 설정하고 역산하면 광고 예산을 더 정밀하게 계획할 수 있습니다.",
        },
        guide: [
          {
            heading: "CPA는 '성과 1건'의 비용",
            body: [
              "CPA(Cost per Acquisition)는 전환(구매·가입·문의 등) 1건을 얻는 데 든 광고비로, 광고비 ÷ 전환 수로 계산합니다. 클릭이나 노출이 아니라 실제로 원하는 행동이 일어난 건수를 기준으로 하기 때문에, 비즈니스 목표에 가장 가까운 효율 지표입니다. CPC·CTR이 좋아도 전환이 없으면 CPA는 나빠집니다.",
              "이 계산기는 광고비와 전환 수로 CPA를 즉시 구하고, 목표 CPA에 맞춘 예상 전환 수나 필요 예산을 역산할 수 있습니다.",
            ],
          },
          {
            heading: "CPA는 고객 가치(LTV·마진)와 비교해야 한다",
            body: [
              "CPA 자체의 높고 낮음보다 중요한 건 고객 한 명이 주는 가치와의 관계입니다. 고객 생애 가치(LTV)나 첫 구매 마진보다 CPA가 낮아야 광고가 지속 가능합니다. 예컨대 평균 마진이 3만원인데 CPA가 4만원이면, 전환이 늘수록 손해가 커집니다.",
              "그래서 목표 CPA는 '고객 한 명에게 쓸 수 있는 최대 금액'에서 출발해 정합니다. 목표 CPA를 정하고 필요 전환·예산을 역산하면 캠페인을 실제 수익 구조 위에서 계획할 수 있습니다. 계산은 브라우저 안에서만 이루어집니다.",
            ],
          },
        ],
      },
      en: {
        card: "Calculate CPA from ad spend and conversions. Reverse-calculate expected conversions or required budget.",
        description:
          "Enter ad spend and conversions to calculate CPA (cost per acquisition) instantly. Reverse-calculate expected conversions from a target CPA and budget, or find the required budget for a target conversion count. Every calculation runs in your browser and the figures you enter are never uploaded.",
        howItWorks: [
          "Choose a calculation mode (CPA, expected conversions, or required budget)",
          "Enter ad spend, conversions, or target values",
          "See CPA and related metrics instantly",
        ],
        aeo: {
          what: "CPA Calculator is a tool that computes Cost Per Acquisition (ad spend ÷ conversions), reverse-calculates expected conversions from a budget and target CPA, and finds the required budget for a target number of conversions.",
          who: "It is for marketers tracking conversion performance, small business owners running performance ads, and PMs managing campaign KPIs.",
          how: "In CPA mode, enter ad spend and conversions to see CPA instantly. In reverse modes, enter a target CPA with a budget to get expected conversions, or a target conversion count with a CPA to get the required budget.",
          why: "CPA measures advertising efficiency in terms of outcomes rather than clicks or impressions. Setting a target CPA lets you plan budgets around actual business goals.",
        },
        guide: [
          {
            heading: "CPA is the cost of one outcome",
            body: [
              "CPA (Cost per Acquisition) is the ad spend it takes to win one conversion: a purchase, sign-up, or lead: calculated as ad spend ÷ conversions. Because it's based on the action you actually want rather than clicks or impressions, it's the efficiency metric closest to your business goal. Even with a good CPC and CTR, no conversions means a bad CPA.",
              "This calculator turns ad spend and conversions into CPA instantly, and reverse-calculates the expected conversions or budget needed to hit a target CPA.",
            ],
          },
          {
            heading: "Compare CPA against customer value (LTV, margin)",
            body: [
              "What matters isn't CPA on its own but its relationship to what a customer is worth. Your CPA needs to be lower than customer lifetime value (LTV) or first-purchase margin for advertising to be sustainable. If your average margin is 30 and CPA is 40, more conversions just mean bigger losses.",
              "So a target CPA starts from 'the most you can spend to acquire one customer.' Setting that target and reverse-calculating the conversions and budget you need lets you plan the campaign on top of your real profit structure. All calculation runs in your browser.",
            ],
          },
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "CPA란 무엇인가요?",
          answer:
            "CPA(Cost Per Acquisition 또는 Cost Per Action)는 전환 1건을 달성하는 데 든 광고비를 나타냅니다. CPA = 광고비 ÷ 전환 수로 계산합니다. 전환은 구매·회원가입·신청·다운로드 등 목표로 정한 행동을 의미합니다.",
        },
        {
          question: "예상 전환 수는 왜 소수점이 아닌 정수로 표시되나요?",
          answer:
            "예상 전환 수는 달성 가능한 최대값이므로 floor(내림) 처리합니다. 예를 들어 예산 100만 원, 목표 CPA 30만 원이면 예상 전환 수는 floor(1,000,000 ÷ 300,000) = 3건입니다.",
        },
        {
          question: "CPA와 CPC의 차이는 무엇인가요?",
          answer:
            "CPC(Cost Per Click)는 클릭 1번당 광고비이고, CPA(Cost Per Acquisition)는 전환 1건당 광고비입니다. CPC는 트래픽 비용을, CPA는 실제 성과(구매·신청 등) 비용을 측정합니다.",
        },
        {
          question: "입력한 데이터가 서버로 전송되나요?",
          answer:
            "아니요. 모든 계산은 브라우저에서만 처리됩니다. 입력한 데이터는 어떤 서버에도 전송되거나 저장되지 않습니다.",
        },
      ],
      en: [
        {
          question: "What is CPA?",
          answer:
            "CPA (Cost Per Acquisition or Cost Per Action) is the average cost of achieving one conversion. CPA = ad spend ÷ conversions. A conversion can be a purchase, sign-up, application, download: any goal action you define.",
        },
        {
          question: "Why is the expected conversion count a whole number?",
          answer:
            "Expected conversions use floor (round down) because you can only achieve whole conversions. For example, with a $1,000 budget and $300 target CPA, expected conversions = floor(1000 ÷ 300) = 3.",
        },
        {
          question: "What is the difference between CPA and CPC?",
          answer:
            "CPC (Cost Per Click) measures the cost of each click on your ad. CPA (Cost Per Acquisition) measures the cost of each actual conversion: a purchase, sign-up, etc. CPC tracks traffic cost; CPA tracks outcome cost.",
        },
        {
          question: "Is my data sent to a server?",
          answer:
            "No. Every calculation runs entirely in your browser. The budget and spend figures you enter are never uploaded or stored.",
        },
      ],
    },
    og: {
      ko: { title: "CPA 계산기", subtitle: "전환당 광고비 · 예상 전환 수 · 필요 예산 역산" },
      en: { title: "CPA Calculator", subtitle: "Cost per acquisition, expected conversions and required budget" },
    },
  },
  {
    slug: "cpc-calculator",
    layout: "card",
    cat: "text",
    targets: ["marketer", "small-business-owner", "pm"],
    ico: "CPC",
    ready: true,
    indexable: false,
    badge: "Marketing Calculator",
    name: { ko: "CPC 계산기", en: "CPC Calculator" },
    relatedTools: ["ctr-calculator", "cpm-calculator", "cpa-calculator"],
    seo: {
      ko: {
        title: "CPC 계산기 | 클릭당 광고비·예상 클릭 수·필요 예산 계산",
        description:
          "광고비와 클릭 수를 입력해 CPC(클릭당 비용)를 즉시 계산합니다. 목표 CPC와 예산으로 예상 클릭 수를 역산하거나, 목표 클릭 수와 CPC로 필요 예산을 계산할 수도 있습니다. 모든 계산은 브라우저에서만 처리됩니다.",
        keywords: [
          "CPC 계산기",
          "클릭당 비용 계산",
          "목표 CPC 계산",
          "광고 클릭 비용",
          "cost per click calculator",
          "average CPC calculator",
        ],
      },
      en: {
        title: "CPC Calculator | Cost Per Click, Expected Clicks & Budget",
        description:
          "Enter ad spend and clicks to calculate CPC (cost per click) instantly. Reverse-calculate expected clicks from a target CPC and budget, or find the required budget for a target click count. Every calculation runs in your browser and the figures you enter are never uploaded.",
        keywords: [
          "CPC calculator",
          "cost per click calculator",
          "average CPC calculator",
          "ad click cost",
          "target CPC calculator",
          "PPC calculator",
        ],
      },
    },
    content: {
      ko: {
        card: "광고비·클릭 수로 CPC 즉시 계산. 예상 클릭 수·필요 예산 역산 포함.",
        description:
          "광고비와 클릭 수를 입력해 CPC(클릭당 비용)를 즉시 계산합니다. 목표 CPC와 예산으로 예상 클릭 수를 역산하거나, 목표 클릭 수와 CPC로 필요 예산을 계산할 수도 있습니다. 모든 계산은 브라우저에서만 처리됩니다.",
        howItWorks: [
          "계산 모드 선택(CPC·예상 클릭 수·필요 예산)",
          "광고비·클릭 수 또는 목표값 입력",
          "CPC와 관련 수치 즉시 확인",
        ],
        aeo: {
          what: "CPC 계산기는 광고비 ÷ 클릭 수로 클릭당 광고비(CPC, Cost Per Click)를 계산하고, 목표 CPC와 예산으로 예상 클릭 수를 역산하거나 목표 클릭 수와 CPC로 필요 예산을 계산하는 도구입니다.",
          who: "검색·디스플레이 광고를 운영하는 마케터, PPC 캠페인을 관리하는 소상공인, 클릭 기반 트래픽 예산을 계획하는 PM을 위한 도구입니다.",
          how: "CPC 계산 모드에서는 광고비와 클릭 수를 입력하면 CPC를 즉시 계산합니다. 역산 모드에서는 목표값을 입력하면 예상 클릭 수 또는 필요 예산을 계산합니다.",
          why: "CPC를 파악하면 광고비 대비 트래픽 효율을 측정할 수 있습니다. 목표 CPC를 기준으로 예산과 클릭 수를 역산하면 SEM·PPC 캠페인 계획을 더 정확하게 세울 수 있습니다.",
        },
        guide: [
          {
            heading: "CPC는 클릭 1회의 비용",
            body: [
              "CPC(Cost per Click)는 광고 클릭 한 번에 든 비용으로, 광고비 ÷ 클릭 수로 계산합니다. 검색광고(SEM)와 클릭당 과금(PPC) 캠페인의 기본 단위이며, 키워드 경쟁 강도와 광고 품질점수(관련성·랜딩 경험)에 따라 오르내립니다. 같은 예산이라도 CPC가 낮으면 더 많은 방문을 살 수 있습니다.",
              "이 계산기는 광고비와 클릭 수로 CPC를 즉시 구하고, 목표 CPC 기준의 예상 클릭 수나 필요 예산을 역산합니다.",
            ],
          },
          {
            heading: "낮은 CPC가 항상 좋은 건 아니다",
            body: [
              "CPC는 트래픽의 '단가'일 뿐, 그 트래픽이 전환으로 이어지는지는 별개입니다. CPC가 아무리 낮아도 방문자가 아무 행동도 하지 않으면 의미가 없고, 반대로 CPC가 다소 높아도 전환율(CVR)이 좋으면 최종 CPA는 낮아질 수 있습니다. 그래서 CPC는 CTR·CVR과 함께 봐야 합니다.",
              "관계를 정리하면 CPC는 CPM ÷ (CTR×10)으로도 볼 수 있고, 목표 CPC × 필요 클릭 수로 예산을 잡을 수 있습니다. 목표 CPC를 정해 필요 예산·클릭을 역산해 보세요. 계산은 브라우저 안에서만 이루어집니다.",
            ],
          },
        ],
      },
      en: {
        card: "Calculate CPC from ad spend and clicks. Reverse-calculate expected clicks or required budget.",
        description:
          "Enter ad spend and clicks to calculate CPC (cost per click) instantly. Reverse-calculate expected clicks from a target CPC and budget, or find the required budget for a target click count. Every calculation runs in your browser and the figures you enter are never uploaded.",
        howItWorks: [
          "Choose a calculation mode (CPC, expected clicks, or required budget)",
          "Enter ad spend, clicks, or target values",
          "See CPC and related metrics instantly",
        ],
        aeo: {
          what: "CPC Calculator is a tool that computes Cost Per Click (ad spend ÷ clicks), reverse-calculates expected clicks from a budget and target CPC, and finds the required budget for a target number of clicks.",
          who: "It is for marketers running search and display ads, small business owners managing PPC campaigns, and PMs planning click-based traffic budgets.",
          how: "In CPC mode, enter ad spend and clicks to see CPC instantly. In reverse modes, enter a target CPC with a budget to get expected clicks, or a target click count with a CPC to get the required budget.",
          why: "Knowing your CPC lets you measure traffic efficiency per advertising dollar. Reverse-calculating from a target CPC helps you plan SEM and PPC budgets with precision.",
        },
        guide: [
          {
            heading: "CPC is the cost of one click",
            body: [
              "CPC (Cost per Click) is what one ad click costs, calculated as ad spend ÷ clicks. It's the base unit of search (SEM) and pay-per-click (PPC) campaigns, rising and falling with keyword competition and quality score (relevance and landing experience). For the same budget, a lower CPC buys more visits.",
              "This calculator turns ad spend and clicks into CPC instantly, and reverse-calculates the expected clicks or budget needed for a target CPC.",
            ],
          },
          {
            heading: "A low CPC isn't always good",
            body: [
              "CPC is only the 'unit price' of traffic; whether that traffic converts is a separate question. A very low CPC means nothing if visitors don't act, while a somewhat higher CPC can still yield a low final CPA if the conversion rate (CVR) is strong. That's why CPC should be read alongside CTR and CVR.",
              "As a relationship, CPC can also be seen as CPM ÷ (CTR×10), and you can size budget as target CPC × clicks needed. Set a target CPC and reverse-calculate the budget and clicks you need. All calculation runs in your browser.",
            ],
          },
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "CPC란 무엇인가요?",
          answer:
            "CPC(Cost Per Click)는 광고 클릭 1번당 지불한 광고비를 나타냅니다. CPC = 광고비 ÷ 클릭 수로 계산합니다. Google Ads, Meta Ads 등 대부분의 퍼포먼스 광고에서 핵심 효율 지표로 사용됩니다.",
        },
        {
          question: "예상 클릭 수는 왜 소수점이 아닌 정수로 표시되나요?",
          answer:
            "예상 클릭 수는 달성 가능한 최대값이므로 floor(내림) 처리합니다. 예를 들어 예산 10만 원, 목표 CPC 300원이면 예상 클릭 수는 floor(100,000 ÷ 300) = 333건입니다.",
        },
        {
          question: "CPC와 CPM의 차이는 무엇인가요?",
          answer:
            "CPC는 클릭 1번당 광고비이고, CPM은 노출 1,000회당 광고비입니다. 클릭 기반 과금 방식에서는 CPC를, 노출 기반 과금 방식에서는 CPM을 주요 지표로 사용합니다.",
        },
        {
          question: "입력한 데이터가 서버로 전송되나요?",
          answer:
            "아니요. 모든 계산은 브라우저에서만 처리됩니다. 입력한 데이터는 어떤 서버에도 전송되거나 저장되지 않습니다.",
        },
      ],
      en: [
        {
          question: "What is CPC?",
          answer:
            "CPC (Cost Per Click) is the average amount you pay for each click on your ad. CPC = ad spend ÷ clicks. It is a core efficiency metric in Google Ads, Meta Ads, and most performance advertising platforms.",
        },
        {
          question: "Why is the expected click count a whole number?",
          answer:
            "Expected clicks use floor (round down) because you can only receive whole clicks. For example, with a $100 budget and a $0.30 target CPC, expected clicks = floor(100 ÷ 0.30) = 333.",
        },
        {
          question: "What is the difference between CPC and CPM?",
          answer:
            "CPC is cost per click; CPM is cost per 1,000 impressions. Use CPC for click-based (CPC bidding) campaigns and CPM for impression-based (CPM bidding) campaigns.",
        },
        {
          question: "Is my data sent to a server?",
          answer:
            "No. Every calculation runs entirely in your browser. The budget and spend figures you enter are never uploaded or stored.",
        },
      ],
    },
    og: {
      ko: { title: "CPC 계산기", subtitle: "클릭당 광고비 · 예상 클릭 수 · 필요 예산 역산" },
      en: { title: "CPC Calculator", subtitle: "Cost per click, expected clicks and required budget" },
    },
  },
  {
    slug: "cpm-calculator",
    layout: "card",
    cat: "text",
    targets: ["marketer", "small-business-owner", "pm"],
    ico: "CPM",
    ready: true,
    indexable: false,
    badge: "Marketing Calculator",
    name: { ko: "CPM 계산기", en: "CPM Calculator" },
    relatedTools: ["ctr-calculator", "cpc-calculator", "ad-budget-pacing-calculator"],
    seo: {
      ko: {
        title: "CPM 계산기 | 천 회 노출당 광고비·예상 노출 수·필요 예산 계산",
        description:
          "광고비와 노출 수를 입력해 CPM(천 회 노출당 비용)을 즉시 계산합니다. 목표 CPM과 예산으로 예상 노출 수를 역산하거나, 목표 노출 수와 CPM으로 필요 예산을 계산할 수도 있습니다. 모든 계산은 브라우저에서만 처리됩니다.",
        keywords: [
          "CPM 계산기",
          "천 회 노출당 비용",
          "광고 노출 비용 계산",
          "목표 CPM 계산",
          "cost per mille calculator",
          "cost per thousand impressions",
        ],
      },
      en: {
        title: "CPM Calculator | Cost Per Mille, Impressions & Budget",
        description:
          "Enter ad spend and impressions to calculate CPM (cost per 1,000 impressions) instantly. Reverse-calculate expected impressions from a target CPM and budget, or find the required budget for a target impression count. Every calculation runs in your browser and the figures you enter are never uploaded.",
        keywords: [
          "CPM calculator",
          "cost per mille calculator",
          "cost per thousand impressions",
          "ad impression cost",
          "target CPM calculator",
        ],
      },
    },
    content: {
      ko: {
        card: "광고비·노출 수로 CPM 즉시 계산. 예상 노출 수·필요 예산 역산 포함.",
        description:
          "광고비와 노출 수를 입력해 CPM(천 회 노출당 비용)을 즉시 계산합니다. 목표 CPM과 예산으로 예상 노출 수를 역산하거나, 목표 노출 수와 CPM으로 필요 예산을 계산할 수도 있습니다. 모든 계산은 브라우저에서만 처리됩니다.",
        howItWorks: [
          "계산 모드 선택(CPM·예상 노출 수·필요 예산)",
          "광고비·노출 수 또는 목표값 입력",
          "CPM과 관련 수치 즉시 확인",
        ],
        aeo: {
          what: "CPM 계산기는 광고비 ÷ 노출 수 × 1,000으로 천 회 노출당 광고비(CPM, Cost Per Mille)를 계산하고, 목표 CPM과 예산으로 예상 노출 수를 역산하거나 목표 노출 수와 CPM으로 필요 예산을 계산하는 도구입니다.",
          who: "디스플레이·영상·소셜 광고를 운영하는 마케터, 브랜드 인지도 캠페인을 집행하는 소상공인, 노출 기반 광고 예산을 계획하는 PM을 위한 도구입니다.",
          how: "CPM 계산 모드에서는 광고비와 노출 수를 입력하면 CPM을 즉시 계산합니다. 역산 모드에서는 목표 CPM과 예산으로 예상 노출 수를, 또는 목표 노출 수와 CPM으로 필요 예산을 계산합니다.",
          why: "CPM은 브랜드 인지도 캠페인에서 광고비 효율을 측정하는 핵심 지표입니다. 목표 CPM을 기준으로 역산하면 노출 기반 광고 예산을 더 정확하게 계획할 수 있습니다.",
        },
        guide: [
          {
            heading: "CPM은 노출 1,000회당 비용",
            body: [
              "CPM(Cost per Mille)은 광고 노출 1,000회에 드는 비용으로, 광고비 ÷ 노출 수 × 1,000으로 계산합니다. 'Mille'는 라틴어로 1,000을 뜻합니다. 클릭이나 전환이 아니라 '얼마나 많은 사람에게 보였는가(도달·노출)'를 기준으로 하기 때문에, 브랜드 인지도 캠페인의 효율을 가늠하는 기본 지표입니다.",
              "이 계산기는 광고비와 노출 수로 CPM을 즉시 구하고, 목표 CPM 기준의 예상 노출 수나 필요 예산을 역산합니다.",
            ],
          },
          {
            heading: "CPM은 언제 보고, 무엇에 좌우되나",
            body: [
              "목표에 따라 봐야 할 지표가 다릅니다. 브랜드 인지·도달이 목적이면 CPM이, 성과가 목적이면 CPA·ROAS가 우선입니다. 같은 매체라도 타겟팅이 좁을수록, 경쟁이 치열한 시즌일수록 CPM이 올라가는 경향이 있어 매체·오디언스별로 비교하는 것이 좋습니다.",
              "CPM은 CPC·CTR과도 연결됩니다. CPC ≈ CPM ÷ (CTR×10) 관계이므로, 같은 CPM에서 CTR이 높을수록 실질 클릭 단가는 낮아집니다. 목표 CPM으로 도달 목표별 예산을 역산해 보세요. 계산은 브라우저 안에서만 이루어집니다.",
            ],
          },
        ],
      },
      en: {
        card: "Calculate CPM from ad spend and impressions. Reverse-calculate expected impressions or required budget.",
        description:
          "Enter ad spend and impressions to calculate CPM (cost per 1,000 impressions) instantly. Reverse-calculate expected impressions from a target CPM and budget, or find the required budget for a target impression count. Every calculation runs in your browser and the figures you enter are never uploaded.",
        howItWorks: [
          "Choose a calculation mode (CPM, expected impressions, or required budget)",
          "Enter ad spend, impressions, or target values",
          "See CPM and related metrics instantly",
        ],
        aeo: {
          what: "CPM Calculator is a tool that computes Cost Per Mille (ad spend ÷ impressions × 1,000), reverse-calculates expected impressions from a budget and target CPM, and finds the required budget for a target number of impressions.",
          who: "It is for marketers running display, video, and social ads, small business owners running brand awareness campaigns, and PMs planning impression-based ad budgets.",
          how: "In CPM mode, enter ad spend and impressions to see CPM instantly. In reverse modes, enter a target CPM with a budget to get expected impressions, or a target impression count with a CPM to get the required budget.",
          why: "CPM is the standard metric for measuring cost efficiency in brand awareness campaigns. Reverse-calculating from a target CPM helps you plan impression-based budgets accurately.",
        },
        guide: [
          {
            heading: "CPM is the cost per 1,000 impressions",
            body: [
              "CPM (Cost per Mille) is the cost of 1,000 ad impressions, calculated as ad spend ÷ impressions × 1,000: 'mille' is Latin for thousand. Because it's based on how many people saw the ad (reach and impressions) rather than clicks or conversions, it's the go-to metric for gauging the efficiency of brand awareness campaigns.",
              "This calculator turns ad spend and impressions into CPM instantly, and reverse-calculates the expected impressions or budget needed for a target CPM.",
            ],
          },
          {
            heading: "When to watch CPM, and what drives it",
            body: [
              "Different goals call for different metrics: when the aim is brand awareness and reach, CPM leads; when the aim is results, CPA and ROAS come first. Even on the same platform, CPM tends to rise as targeting narrows and during competitive seasons, so it's worth comparing across placements and audiences.",
              "CPM also connects to CPC and CTR: since CPC ≈ CPM ÷ (CTR×10), a higher CTR at the same CPM means a lower effective cost per click. Use a target CPM to reverse-calculate budgets for each reach goal. All calculation runs in your browser.",
            ],
          },
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "CPM이란 무엇인가요?",
          answer:
            "CPM(Cost Per Mille)은 광고 노출 1,000회당 지불한 광고비를 나타냅니다. CPM = 광고비 ÷ 노출 수 × 1,000으로 계산합니다. 'Mille'는 라틴어로 1,000을 의미합니다.",
        },
        {
          question: "예상 노출 수는 왜 소수점이 아닌 정수로 표시되나요?",
          answer:
            "예상 노출 수는 달성 가능한 최대값이므로 floor(내림) 처리합니다. 예를 들어 예산 10만 원, 목표 CPM 500원이면 예상 노출 수는 floor(100,000 ÷ 500 × 1,000) = 200,000회입니다.",
        },
        {
          question: "CPM과 CPC의 차이는 무엇인가요?",
          answer:
            "CPM은 노출 1,000회당 광고비이고, CPC는 클릭 1번당 광고비입니다. 브랜드 인지도·도달 중심 캠페인에는 CPM이, 트래픽·전환 중심 캠페인에는 CPC가 더 적합한 지표입니다.",
        },
        {
          question: "입력한 데이터가 서버로 전송되나요?",
          answer:
            "아니요. 모든 계산은 브라우저에서만 처리됩니다. 입력한 데이터는 어떤 서버에도 전송되거나 저장되지 않습니다.",
        },
      ],
      en: [
        {
          question: "What is CPM?",
          answer:
            "CPM (Cost Per Mille) is the average cost you pay for 1,000 ad impressions. CPM = ad spend ÷ impressions × 1,000. 'Mille' is Latin for 1,000.",
        },
        {
          question: "Why is the expected impression count a whole number?",
          answer:
            "Expected impressions use floor (round down) because you can only serve whole impressions. For example, with a $100 budget and a $5 target CPM, expected impressions = floor(100 ÷ 5 × 1,000) = 20,000.",
        },
        {
          question: "What is the difference between CPM and CPC?",
          answer:
            "CPM is cost per 1,000 impressions; CPC is cost per click. CPM is the standard metric for brand awareness and reach campaigns. CPC is better suited for traffic and conversion campaigns.",
        },
        {
          question: "Is my data sent to a server?",
          answer:
            "No. Every calculation runs entirely in your browser. The budget and spend figures you enter are never uploaded or stored.",
        },
      ],
    },
    og: {
      ko: { title: "CPM 계산기", subtitle: "천 회 노출당 광고비 · 예상 노출 수 · 필요 예산 역산" },
      en: { title: "CPM Calculator", subtitle: "Cost per mille, expected impressions and required budget" },
    },
  },
  {
    slug: "ctr-calculator",
    layout: "card",
    cat: "text",
    targets: ["marketer", "small-business-owner", "pm"],
    ico: "CTR",
    ready: true,
    indexable: false,
    badge: "Marketing Calculator",
    name: { ko: "CTR 계산기", en: "CTR Calculator" },
    relatedTools: ["cpc-calculator", "cpm-calculator", "funnel-conversion-calculator"],
    seo: {
      ko: {
        title: "CTR 계산기 | 클릭률·필요 클릭 수·필요 노출 수 계산",
        description:
          "클릭 수와 노출 수를 입력해 CTR(클릭률)을 즉시 계산합니다. 목표 CTR과 노출 수로 필요 클릭 수를 역산하거나, 목표 CTR과 클릭 수로 필요 노출 수를 계산할 수도 있습니다. 모든 계산은 브라우저에서만 처리됩니다.",
        keywords: [
          "CTR 계산기",
          "클릭률 계산",
          "광고 클릭률",
          "목표 CTR 계산",
          "click through rate calculator",
          "CTR percentage calculator",
        ],
      },
      en: {
        title: "CTR Calculator | Click-Through Rate, Clicks & Impressions",
        description:
          "Enter clicks and impressions to calculate CTR (click-through rate) instantly. Reverse-calculate required clicks from a target CTR and impressions, or find the required impressions for a target CTR and click count. Every calculation runs in your browser and the figures you enter are never uploaded.",
        keywords: [
          "CTR calculator",
          "click through rate calculator",
          "CTR percentage calculator",
          "ad click rate",
          "target CTR calculator",
        ],
      },
    },
    content: {
      ko: {
        card: "클릭 수·노출 수로 CTR 즉시 계산. 필요 클릭 수·필요 노출 수 역산 포함.",
        description:
          "클릭 수와 노출 수를 입력해 CTR(클릭률)을 즉시 계산합니다. 목표 CTR과 노출 수로 필요 클릭 수를 역산하거나, 목표 CTR과 클릭 수로 필요 노출 수를 계산할 수도 있습니다. 모든 계산은 브라우저에서만 처리됩니다.",
        howItWorks: [
          "계산 모드 선택(CTR·필요 클릭 수·필요 노출 수)",
          "클릭 수·노출 수 또는 목표값 입력",
          "CTR과 관련 수치 즉시 확인",
        ],
        aeo: {
          what: "CTR 계산기는 클릭 수 ÷ 노출 수 × 100으로 클릭률(CTR, Click-Through Rate)을 계산하고, 목표 CTR과 노출 수로 필요 클릭 수를 역산하거나 목표 CTR과 클릭 수로 필요 노출 수를 계산하는 도구입니다.",
          who: "광고·이메일·콘텐츠 성과를 분석하는 마케터, 디지털 광고를 운영하는 소상공인, 클릭률 목표를 설정하는 PM을 위한 도구입니다.",
          how: "CTR 계산 모드에서는 클릭 수와 노출 수를 입력하면 CTR(%)을 즉시 계산합니다. 역산 모드에서는 목표 CTR을 기준으로 필요 클릭 수 또는 노출 수를 계산합니다.",
          why: "CTR은 광고·이메일·콘텐츠의 참여도를 측정하는 핵심 지표입니다. 목표 CTR을 기준으로 역산하면 도달 목표와 클릭 목표를 더 정확하게 계획할 수 있습니다.",
        },
        guide: [
          {
            heading: "CTR은 노출 대비 클릭 비율",
            body: [
              "CTR(Click-Through Rate)은 노출된 광고·링크가 실제로 클릭된 비율로, 클릭 수 ÷ 노출 수 × 100으로 계산합니다. 광고 배너, 검색 결과, 이메일 링크, 콘텐츠 썸네일이 사람들의 흥미를 얼마나 끌었는지를 보여주는 참여도 지표입니다. 같은 노출이라도 CTR이 높다는 건 소재와 메시지가 오디언스와 잘 맞았다는 신호입니다.",
              "이 계산기는 클릭 수와 노출 수로 CTR을 즉시 구하고, 목표 CTR을 달성하는 데 필요한 클릭 수나 노출 수를 역산합니다.",
            ],
          },
          {
            heading: "CTR을 움직이는 것과 다른 지표와의 관계",
            body: [
              "CTR은 주로 소재(크리에이티브), 타겟팅, 카피, 노출 위치에 좌우됩니다. 관련성 높은 오디언스에게 매력적인 문구를 보여줄수록 올라갑니다. 다만 CTR이 높아도 랜딩 이후 전환이 약하면 최종 성과는 아쉬울 수 있어, 전환율(CVR)과 함께 봐야 합니다.",
              "CTR은 비용 지표와도 얽혀 있습니다. 같은 CPM에서 CTR이 높으면 실질 CPC가 낮아집니다(CPC ≈ CPM ÷ (CTR×10)). 목표 CTR을 정해 필요 노출·클릭을 역산하면 도달·클릭 목표를 함께 계획할 수 있습니다. 계산은 브라우저 안에서만 이루어집니다.",
            ],
          },
        ],
      },
      en: {
        card: "Calculate CTR from clicks and impressions. Reverse-calculate required clicks or required impressions.",
        description:
          "Enter clicks and impressions to calculate CTR (click-through rate) instantly. Reverse-calculate required clicks from a target CTR and impressions, or find the required impressions for a target CTR and click count. Every calculation runs in your browser and the figures you enter are never uploaded.",
        howItWorks: [
          "Choose a calculation mode (CTR, required clicks, or required impressions)",
          "Enter clicks, impressions, or target values",
          "See CTR and related metrics instantly",
        ],
        aeo: {
          what: "CTR Calculator is a tool that computes Click-Through Rate (clicks ÷ impressions × 100), reverse-calculates required clicks from a target CTR and impression count, and finds the required impressions for a target CTR and click count.",
          who: "It is for marketers analyzing ad, email, and content performance, small business owners running digital ads, and PMs setting click-rate targets.",
          how: "In CTR mode, enter clicks and impressions to see CTR (%) instantly. In reverse modes, enter a target CTR with impressions to get required clicks, or with clicks to get required impressions.",
          why: "CTR measures audience engagement with your ads, emails, and content. Reverse-calculating from a target CTR lets you plan reach and click goals with precision.",
        },
        guide: [
          {
            heading: "CTR is clicks as a share of impressions",
            body: [
              "CTR (Click-Through Rate) is the share of impressions that turned into clicks, calculated as clicks ÷ impressions × 100. It's an engagement metric that shows how well an ad banner, search result, email link, or content thumbnail captured people's interest. For the same impressions, a higher CTR signals that the creative and message resonated with the audience.",
              "This calculator turns clicks and impressions into CTR instantly, and reverse-calculates the clicks or impressions you'd need to hit a target CTR.",
            ],
          },
          {
            heading: "What moves CTR, and how it relates to other metrics",
            body: [
              "CTR is driven mostly by creative, targeting, copy, and placement: the more relevant the audience and the more compelling the wording, the higher it climbs. But a high CTR with weak post-click conversion can still disappoint, so read it alongside conversion rate (CVR).",
              "CTR is also tied to cost metrics: at the same CPM, a higher CTR means a lower effective CPC (CPC ≈ CPM ÷ (CTR×10)). Set a target CTR and reverse-calculate the impressions and clicks you need to plan reach and click goals together. All calculation runs in your browser.",
            ],
          },
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "CTR이란 무엇인가요?",
          answer:
            "CTR(Click-Through Rate, 클릭률)은 광고가 노출된 횟수 중 실제로 클릭된 비율을 나타냅니다. CTR(%) = 클릭 수 ÷ 노출 수 × 100으로 계산합니다. 광고·이메일·검색 결과의 참여도를 측정하는 핵심 지표입니다.",
        },
        {
          question: "필요 클릭 수와 필요 노출 수는 왜 올림으로 처리되나요?",
          answer:
            "목표를 달성하는 데 필요한 수량은 부족하면 안 되므로 ceil(올림) 처리합니다. 예를 들어 노출 수 10,000회에서 목표 CTR 2.5%를 달성하려면 ceil(10,000 × 0.025) = 250번의 클릭이 필요합니다.",
        },
        {
          question: "클릭 수가 노출 수보다 많을 수도 있나요?",
          answer:
            "일반적으로 클릭 수는 노출 수를 초과할 수 없습니다. 다만 리타겟팅·교차 디바이스 트래킹 등 특수한 측정 방식에서 이런 현상이 나타날 수 있습니다. 이 계산기는 계산 자체는 허용하되 경고를 표시합니다.",
        },
        {
          question: "입력한 데이터가 서버로 전송되나요?",
          answer:
            "아니요. 모든 계산은 브라우저에서만 처리됩니다. 입력한 데이터는 어떤 서버에도 전송되거나 저장되지 않습니다.",
        },
      ],
      en: [
        {
          question: "What is CTR?",
          answer:
            "CTR (Click-Through Rate) is the percentage of ad impressions that result in a click. CTR (%) = clicks ÷ impressions × 100. It is a core metric for measuring engagement with ads, emails, and search results.",
        },
        {
          question: "Why are required clicks and impressions rounded up?",
          answer:
            "Required quantities use ceil (round up) because you need at least that many to hit your target. For example, to achieve a 2.5% CTR on 10,000 impressions, you need ceil(10,000 × 0.025) = 250 clicks.",
        },
        {
          question: "Can clicks ever exceed impressions?",
          answer:
            "Normally, clicks cannot exceed impressions. However, retargeting, cross-device tracking, and certain measurement setups can produce this. This calculator allows the calculation but shows a warning.",
        },
        {
          question: "Is my data sent to a server?",
          answer:
            "No. Every calculation runs entirely in your browser. The budget and spend figures you enter are never uploaded or stored.",
        },
      ],
    },
    og: {
      ko: { title: "CTR 계산기", subtitle: "클릭률 · 필요 클릭 수 · 필요 노출 수 역산" },
      en: { title: "CTR Calculator", subtitle: "Click-through rate, required clicks and required impressions" },
    },
  },
  {
    slug: "funnel-conversion-calculator",
    layout: "card",
    cat: "text",
    targets: ["marketer", "pm", "small-business-owner"],
    ico: "⇢%",
    ready: true,
    indexable: false,
    badge: "Marketing Calculator",
    name: { ko: "퍼널 전환율 계산기", en: "Funnel Conversion Calculator" },
    relatedTools: ["ctr-calculator", "cpa-calculator", "ad-budget-pacing-calculator"],
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
    indexable: false,
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
    slug: "pdf-merge",
    layout: "canvas",
    cat: "design",
    targets: ["office-worker", "pm", "small-business-owner", "designer"],
    ico: "⊞",
    ready: true,
    indexable: true,
    badge: "Canvas",
    name: { ko: "PDF 병합", en: "Merge PDF" },
    relatedTools: ["pdf-split", "pdf-rotate", "pdf-page-delete"],
    seo: {
      ko: {
        title: "PDF 병합 | 여러 PDF를 하나로 합치기",
        description:
          "여러 PDF 파일을 업로드하고 원하는 순서로 정렬한 뒤 하나의 PDF로 합칩니다. 파일은 브라우저 안에서만 처리되어 서버로 전송되지 않으며, 드래그 정렬·위아래 이동·개별 삭제로 병합 순서를 자유롭게 조정할 수 있습니다.",
        keywords: [
          "PDF 병합",
          "PDF 합치기",
          "PDF 합치기 무료",
          "여러 PDF 하나로",
          "PDF 파일 합치기",
          "온라인 PDF 병합",
        ],
      },
      en: {
        title: "Merge PDF | Combine PDF Files in Order",
        description:
          "Upload multiple PDF files, arrange them in any order, and combine them into a single PDF. Everything runs in your browser and no file is uploaded to a server. Reorder by drag-and-drop, move files up or down, or remove them before merging.",
        keywords: [
          "merge PDF",
          "combine PDF",
          "merge PDF files",
          "join PDF online",
          "PDF merger free",
          "combine PDF files",
        ],
      },
    },
    content: {
      ko: {
        card: "여러 PDF를 업로드해 원하는 순서로 정렬하고 하나의 PDF로 합칩니다.",
        description:
          "여러 PDF 파일을 업로드하고 원하는 순서로 정렬한 뒤 하나의 PDF로 합칩니다. 파일은 브라우저 안에서만 처리되어 서버로 전송되지 않으며, 드래그 정렬·위아래 이동·개별 삭제로 병합 순서를 자유롭게 조정할 수 있습니다.",
        howItWorks: [
          "PDF 파일 여러 개를 업로드합니다.",
          "드래그하거나 위아래로 이동해 병합 순서를 정합니다.",
          "PDF 병합을 눌러 합쳐진 파일을 내려받습니다.",
        ],
        aeo: {
          what: "PDF 병합은 여러 PDF 파일을 지정한 순서대로 하나의 PDF로 합치는 브라우저 도구입니다.",
          who: "보고서·계약서·스캔본 등 나뉜 PDF를 한 파일로 정리해야 하는 사무직·PM·소상공인을 위한 도구입니다.",
          how: "업로드한 PDF의 페이지를 순서대로 복사해 새 PDF를 만들며, 병합 순서는 드래그·이동·삭제로 조정합니다.",
          why: "설치나 로그인 없이, 파일을 서버에 올리지 않고 브라우저에서 바로 여러 PDF를 하나로 합칠 수 있습니다.",
        },
        guide: [
          {
            heading: "PDF를 합쳐야 하는 순간",
            body: [
              "업무 문서는 조각으로 흩어지기 쉽습니다. 각자 만든 슬라이드를 모아 하나의 발표 자료로 묶거나, 여러 장을 따로 스캔한 계약서를 한 파일로 정리하거나, 견적서·명세서·증빙을 붙여 한 번에 제출해야 할 때가 그렇습니다. 파일이 여러 개로 나뉘어 있으면 받는 사람이 순서를 맞춰 열어야 하고, 이메일 첨부도 번거로워집니다.",
              "PDF 병합은 이렇게 나뉜 PDF들을 원하는 순서대로 이어 붙여 하나의 파일로 만들어 줍니다. 파일을 업로드한 뒤 드래그하거나 위아래로 옮겨 순서를 정하고, 필요 없는 파일은 목록에서 빼면 됩니다. 목록에 보이는 위에서 아래 순서 그대로 합쳐집니다.",
            ],
          },
          {
            heading: "합치기 전에 순서를 확인하세요",
            body: [
              "병합에서 가장 흔한 실수는 순서입니다. 계약서 뒤에 부록이 와야 하는데 뒤바뀌거나, 표지가 중간에 끼는 식이죠. 이 도구는 병합을 실행하기 전에 파일 목록을 눈으로 보며 순서를 조정할 수 있어, 합친 뒤 다시 만드는 수고를 덜어 줍니다.",
              "여러 파일을 한 번에 올린 경우 이름순으로 정렬해 두면 순서를 맞추기 쉽습니다. 스캔 파일이라면 파일명에 01, 02처럼 번호를 붙여 두는 습관이 병합 순서를 자동으로 정리해 줍니다.",
            ],
          },
          {
            heading: "문서를 업로드하지 않고 처리합니다",
            body: [
              "계약서, 명세서, 신분증 스캔본처럼 PDF에는 민감한 문서가 담기는 경우가 많습니다. 파일을 서버에 올려 처리하는 온라인 도구를 쓰면, 그 문서가 외부 서버에 잠시라도 머물게 됩니다. Kitfolio의 PDF 병합은 모든 처리를 브라우저 안에서 수행하며, 업로드한 파일을 어떤 서버로도 전송하거나 저장하지 않습니다.",
              "파일은 여러분의 기기를 벗어나지 않고, 병합이 끝난 결과물은 그 자리에서 바로 내려받습니다. 민감한 문서를 다룰 때도 안심할 수 있고, 인터넷이 불안정한 환경에서도 동작합니다.",
            ],
          },
        ],
              examples: [
          {
            title: "견적서·계약서·부속서류를 한 파일로",
            input: "PDF 3개 업로드 후 드래그로 순서 정렬",
            result: "지정한 순서대로 이어 붙인 단일 PDF",
            note: "업로드 순서가 아니라 목록에서 지정한 순서로 합쳐집니다. 파일명이 1, 2, 10처럼 되어 있으면 이름순 정렬이 의도와 다를 수 있으니 병합 전 순서를 눈으로 확인하세요.",
          },
          {
            title: "스캔한 서류 여러 장을 하나로 제출",
            input: "페이지별로 나뉘어 스캔된 PDF 여러 개",
            result: "한 번에 제출할 수 있는 단일 PDF",
            note: "온라인 제출 서식이 파일 1개만 허용할 때 쓰는 방식입니다. 파일이 서버로 올라가지 않으므로 신분증·계약서처럼 민감한 서류도 그대로 다룰 수 있습니다.",
          },
          {
            title: "페이지 크기가 다른 문서 합치기",
            input: "A4 문서와 가로 방향 슬라이드 PDF",
            result: "각 페이지가 원래 크기와 방향을 유지한 채로 이어짐",
            note: "PDF는 페이지마다 다른 크기를 가질 수 있어 강제로 통일되지 않습니다. 인쇄할 계획이라면 병합 전에 크기를 맞추는 편이 낫습니다.",
          },
        ],
        limitations: [
          "파일 1개당 100MB, 병합 총합 200MB, 최대 30개 파일까지 처리합니다. 브라우저 메모리 안에서 처리하므로 저사양 기기에서는 이 한도보다 낮은 용량에서도 실패할 수 있습니다.",
          "열기 암호가 걸린 PDF는 병합할 수 없습니다. 암호를 먼저 해제한 뒤 업로드하세요.",
          "북마크(목차)·양식 필드·전자서명은 병합 과정에서 유지되지 않을 수 있습니다. 전자서명은 문서가 변경되면 무효가 되는 것이 정상 동작입니다.",
          "페이지 순서만 이어 붙입니다. 페이지 크기 통일, 여백 조정, 압축 같은 후처리는 하지 않습니다.",
        ],
      },
      en: {
        card: "Upload several PDFs, arrange the order, and combine them into one PDF.",
        description:
          "Upload multiple PDF files, arrange them in any order, and combine them into a single PDF. Everything runs in your browser and no file is uploaded to a server. Reorder by drag-and-drop, move files up or down, or remove them before merging.",
        howItWorks: [
          "Upload multiple PDF files.",
          "Set the merge order by dragging or moving files up and down.",
          "Press Merge PDF and download the combined file.",
        ],
        aeo: {
          what: "Merge PDF is a browser tool that combines several PDF files into a single PDF in the order you choose.",
          who: "It is for office workers, PMs, and small business owners who need to combine split reports, contracts, or scans into one file.",
          how: "It copies the pages of each uploaded PDF in order into a new PDF, with the order controlled by drag, move, and remove actions.",
          why: "It combines multiple PDFs into one directly in the browser, with no install, no login, and no file upload to a server.",
        },
        guide: [
          {
            heading: "When you need to merge PDFs",
            body: [
              "Work documents tend to arrive in pieces. Slides each person built need to be joined into one deck; a contract scanned a page at a time needs to become a single file; a quote, an invoice, and receipts have to be submitted together. When files stay separate, the recipient has to open them in the right order, and email attachments get unwieldy.",
              "Merge PDF stitches these separate PDFs together into one file in the order you choose. Upload the files, set the order by dragging or moving them up and down, and drop any you don't need from the list. They combine top to bottom, exactly as the list shows.",
            ],
          },
          {
            heading: "Check the order before you merge",
            body: [
              "The most common merging mistake is order: an appendix ending up ahead of the contract it belongs to, or a cover page landing in the middle. This tool lets you review and rearrange the file list before you run the merge, saving you from rebuilding the combined file afterward.",
              "If you uploaded many files at once, sorting them by name makes the order easy to set. For scans, getting into the habit of numbering filenames (01, 02, and so on) lines up the merge order automatically.",
            ],
          },
          {
            heading: "Nothing gets uploaded",
            body: [
              "PDFs often hold sensitive material: contracts, statements, ID scans. Online tools that process files by uploading them leave your document sitting on an outside server, if only briefly. Kitfolio's Merge PDF does all of its work inside your browser and never transmits or stores the files you add.",
              "Your files never leave your device, and the merged result downloads right there. That makes it safe for sensitive documents and keeps it working even on an unreliable connection.",
            ],
          },
        ],
              examples: [
          {
            title: "Combining a quote, a contract and appendices",
            input: "Upload three PDFs, then drag to set the order",
            result: "A single PDF joined in the order you specified",
            note: "Files merge in list order, not upload order. Names like 1, 2 and 10 sort alphabetically in ways you may not expect, so check the order visually before merging.",
          },
          {
            title: "Submitting several scanned pages as one file",
            input: "Multiple PDFs scanned one page at a time",
            result: "A single PDF ready for submission",
            note: "This is what you need when an online form accepts only one attachment. Your files are never uploaded to a server, so ID documents and contracts can be handled as-is.",
          },
          {
            title: "Merging documents with different page sizes",
            input: "An A4 document and a landscape slide deck",
            result: "Each page keeps its original size and orientation in the combined file",
            note: "PDF allows per-page dimensions, so nothing is forced to match. If the result is going to print, normalize the sizes before merging.",
          },
        ],
        limitations: [
          "Limits are 100MB per file, 200MB combined, and 30 files. Processing happens in browser memory, so lower-spec devices can fail below those numbers.",
          "Password-protected PDFs cannot be merged. Remove the open password before uploading.",
          "Bookmarks, form fields and digital signatures may not survive the merge. A digital signature becoming invalid once the document changes is expected behavior, not a bug.",
          "It concatenates pages only. There is no page-size normalization, margin adjustment or compression.",
        ],
      },
    },
    faq: {
      ko: [
        {
          question: "업로드한 PDF 파일이 서버로 전송되나요?",
          answer:
            "아니요. 병합은 사용자의 브라우저 안에서만 처리되며 파일은 서버로 전송되거나 저장되지 않습니다.",
        },
        {
          question: "병합 순서를 어떻게 바꾸나요?",
          answer:
            "파일 카드를 드래그하거나 위·아래 이동 버튼으로 순서를 바꿀 수 있습니다. 목록의 위에서 아래 순서대로 병합됩니다.",
        },
        {
          question: "몇 개의 파일까지 합칠 수 있나요?",
          answer:
            "최대 30개 파일, 총합 200MB, 파일당 100MB까지 지원합니다. 브라우저 메모리에 따라 제한 이하에서도 실패할 수 있습니다.",
        },
        {
          question: "암호가 걸린 PDF도 합칠 수 있나요?",
          answer:
            "아니요. 암호로 보호된 PDF는 처리할 수 없습니다. 암호를 해제한 뒤 다시 시도해 주세요.",
        },
        {
          question: "원본 파일이 바뀌나요?",
          answer:
            "아니요. 원본은 변경되지 않으며 병합 결과는 새 PDF 파일로 다운로드됩니다.",
        },
      ],
      en: [
        {
          question: "Are my uploaded PDF files sent to a server?",
          answer:
            "No. Merging happens entirely in your browser. Files are never uploaded or stored on a server.",
        },
        {
          question: "How do I change the merge order?",
          answer:
            "Drag a file card or use the up and down buttons. Files are merged from top to bottom of the list.",
        },
        {
          question: "How many files can I combine?",
          answer:
            "Up to 30 files, 200MB in total, and 100MB per file. Depending on browser memory, it may fail even below these limits.",
        },
        {
          question: "Can I merge password-protected PDFs?",
          answer:
            "No. Encrypted PDFs cannot be processed. Remove the password first and try again.",
        },
        {
          question: "Does merging change my original files?",
          answer:
            "No. Originals are left untouched; the merged result downloads as a new PDF file.",
        },
      ],
    },
    og: {
      ko: { title: "PDF 병합", subtitle: "여러 PDF를 원하는 순서로 하나로 합치기" },
      en: { title: "Merge PDF", subtitle: "Combine several PDFs into one, in your order" },
    },
  },

  {
    slug: "pdf-split",
    layout: "canvas",
    cat: "design",
    targets: ["office-worker", "pm", "small-business-owner", "designer"],
    ico: "⊟",
    ready: true,
    indexable: false,
    badge: "Canvas",
    name: { ko: "PDF 분할", en: "Split PDF" },
    relatedTools: ["pdf-merge", "pdf-page-delete", "pdf-rotate"],
    seo: {
      ko: {
        title: "PDF 분할 | 페이지·범위별로 PDF 나누기",
        description:
          "하나의 PDF를 모든 페이지로 나누거나 1-3, 4-7 같은 범위별로 나눠 별도 PDF로 만듭니다. 파일은 브라우저 안에서만 처리되며, 결과가 여러 개면 ZIP으로 한 번에 내려받을 수 있습니다.",
        keywords: [
          "PDF 분할",
          "PDF 나누기",
          "PDF 페이지 분할",
          "PDF 범위 분할",
          "PDF 쪼개기",
          "온라인 PDF 분할",
        ],
      },
      en: {
        title: "Split PDF | Split by Page or Page Range",
        description:
          "Split one PDF into every single page, or into custom ranges like 1-3, 4-7. Each part becomes its own PDF. Everything runs in your browser, and when there are multiple results they download together as a ZIP.",
        keywords: [
          "split PDF",
          "split PDF pages",
          "split PDF by range",
          "separate PDF pages",
          "extract PDF pages",
          "PDF splitter free",
        ],
      },
    },
    content: {
      ko: {
        card: "PDF를 모든 페이지 또는 지정한 범위별로 나눠 새 PDF로 만듭니다.",
        description:
          "하나의 PDF를 모든 페이지로 나누거나 1-3, 4-7 같은 범위별로 나눠 별도 PDF로 만듭니다. 파일은 브라우저 안에서만 처리되며, 결과가 여러 개면 ZIP으로 한 번에 내려받을 수 있습니다.",
        howItWorks: [
          "PDF 파일 하나를 업로드합니다.",
          "페이지별 분할 또는 범위(예: 1-3, 4-7)를 선택합니다.",
          "PDF 분할을 눌러 결과 파일 또는 ZIP을 내려받습니다.",
        ],
        aeo: {
          what: "PDF 분할은 하나의 PDF를 페이지별 또는 지정한 범위별로 여러 개의 PDF로 나누는 브라우저 도구입니다.",
          who: "긴 PDF에서 특정 구간만 따로 저장하거나 페이지를 개별 파일로 분리해야 하는 사용자를 위한 도구입니다.",
          how: "선택한 페이지 또는 범위를 각각 새 PDF로 추출하며, 결과가 2개 이상이면 ZIP으로 묶어 제공합니다.",
          why: "설치나 업로드 없이 브라우저에서 바로 원하는 페이지 구간을 별도 PDF로 나눌 수 있습니다.",
        },
      },
      en: {
        card: "Split a PDF into every page or into custom page ranges as new PDFs.",
        description:
          "Split one PDF into every single page, or into custom ranges like 1-3, 4-7. Each part becomes its own PDF. Everything runs in your browser, and when there are multiple results they download together as a ZIP.",
        howItWorks: [
          "Upload a single PDF file.",
          "Choose split-every-page or enter ranges like 1-3, 4-7.",
          "Press Split PDF and download the files or a ZIP.",
        ],
        aeo: {
          what: "Split PDF is a browser tool that divides one PDF into several PDFs by page or by page range.",
          who: "It is for people who need to save specific sections of a long PDF or separate its pages into individual files.",
          how: "It extracts each selected page or range into its own new PDF, bundling the results into a ZIP when there is more than one.",
          why: "It splits a PDF into the sections you want right in the browser, with no install and no upload.",
        },
      },
    },
    faq: {
      ko: [
        {
          question: "PDF 파일이 서버로 전송되나요?",
          answer:
            "아니요. 분할은 브라우저 안에서만 처리되며 파일은 서버로 전송되거나 저장되지 않습니다.",
        },
        {
          question: "페이지 범위는 어떻게 입력하나요?",
          answer:
            "쉼표와 하이픈을 사용해 1-3, 4-7, 8 처럼 입력합니다. 페이지는 1부터 시작하며 총 페이지 수를 넘을 수 없습니다.",
        },
        {
          question: "결과 파일은 어떻게 받나요?",
          answer:
            "결과가 1개면 PDF로 바로 다운로드되고, 2개 이상이면 kitfolio-split-pdf.zip 파일로 묶여 다운로드됩니다.",
        },
        {
          question: "페이지별 분할은 무엇인가요?",
          answer:
            "모든 페이지를 각각 한 페이지짜리 PDF로 만드는 방식입니다. 예를 들어 10페이지 PDF는 10개의 PDF로 나뉩니다.",
        },
        {
          question: "몇 페이지까지 분할할 수 있나요?",
          answer:
            "PDF 1개당 최대 300페이지, 결과 최대 300개 파일까지 지원합니다. 브라우저 메모리에 따라 제한 이하에서도 실패할 수 있습니다.",
        },
      ],
      en: [
        {
          question: "Is my PDF sent to a server?",
          answer:
            "No. Splitting happens entirely in your browser. The file is never uploaded or stored on a server.",
        },
        {
          question: "How do I enter page ranges?",
          answer:
            "Use commas and hyphens, for example 1-3, 4-7, 8. Pages start at 1 and cannot exceed the total page count.",
        },
        {
          question: "How do I receive the result files?",
          answer:
            "A single result downloads directly as a PDF. Multiple results are bundled into kitfolio-split-pdf.zip.",
        },
        {
          question: "What does splitting every page do?",
          answer:
            "It turns each page into its own single-page PDF. A 10-page PDF, for example, becomes 10 separate PDFs.",
        },
        {
          question: "How many pages can I split?",
          answer:
            "Up to 300 pages per PDF and up to 300 result files. Depending on browser memory, it may fail even below these limits.",
        },
      ],
    },
    og: {
      ko: { title: "PDF 분할", subtitle: "PDF를 페이지·범위별로 나누기" },
      en: { title: "Split PDF", subtitle: "Split a PDF by page or by page range" },
    },
  },

  {
    slug: "pdf-rotate",
    layout: "canvas",
    cat: "design",
    targets: ["office-worker", "pm", "small-business-owner", "designer"],
    ico: "⟳",
    ready: true,
    indexable: false,
    badge: "Canvas",
    name: { ko: "PDF 회전", en: "Rotate PDF" },
    relatedTools: ["pdf-merge", "pdf-split", "pdf-page-delete"],
    seo: {
      ko: {
        title: "PDF 회전 | 전체·선택 페이지 90도 회전",
        description:
          "PDF 전체 또는 선택한 페이지만 왼쪽·오른쪽 90도, 180도로 회전합니다. 페이지를 이미지로 변환하지 않고 회전 속성만 바꿔 원본 품질을 유지하며, 파일은 브라우저 안에서만 처리됩니다.",
        keywords: [
          "PDF 회전",
          "PDF 페이지 회전",
          "PDF 돌리기",
          "PDF 90도 회전",
          "PDF 방향 변경",
          "온라인 PDF 회전",
        ],
      },
      en: {
        title: "Rotate PDF | Rotate All or Selected Pages",
        description:
          "Rotate an entire PDF or only selected pages left, right, or 180 degrees. Pages are not converted to images: only the rotation attribute changes, so quality is preserved. Everything runs in your browser.",
        keywords: [
          "rotate PDF",
          "rotate PDF pages",
          "turn PDF pages",
          "rotate PDF 90 degrees",
          "change PDF orientation",
          "rotate PDF online",
        ],
      },
    },
    content: {
      ko: {
        card: "PDF 전체 또는 선택한 페이지만 90도 단위로 회전해 새 PDF로 저장합니다.",
        description:
          "PDF 전체 또는 선택한 페이지만 왼쪽·오른쪽 90도, 180도로 회전합니다. 페이지를 이미지로 변환하지 않고 회전 속성만 바꿔 원본 품질을 유지하며, 파일은 브라우저 안에서만 처리됩니다.",
        howItWorks: [
          "PDF 파일 하나를 업로드합니다.",
          "회전할 페이지를 선택하거나 전체를 대상으로 방향을 정합니다.",
          "회전된 PDF 저장을 눌러 결과를 내려받습니다.",
        ],
        aeo: {
          what: "PDF 회전은 PDF 전체 또는 선택한 페이지를 90도 단위로 회전하는 브라우저 도구입니다.",
          who: "가로로 스캔되었거나 방향이 뒤집힌 페이지를 바로잡아야 하는 사용자를 위한 도구입니다.",
          how: "페이지 콘텐츠를 이미지로 변환하지 않고 PDF 페이지의 회전 속성만 변경해 원본 품질을 유지합니다.",
          why: "설치나 업로드 없이 브라우저에서 원하는 페이지의 방향만 손쉽게 바로잡을 수 있습니다.",
        },
      },
      en: {
        card: "Rotate an entire PDF or only selected pages by 90 degrees and save a new PDF.",
        description:
          "Rotate an entire PDF or only selected pages left, right, or 180 degrees. Pages are not converted to images: only the rotation attribute changes, so quality is preserved. Everything runs in your browser.",
        howItWorks: [
          "Upload a single PDF file.",
          "Select the pages to rotate, or target all pages, and pick a direction.",
          "Press Save rotated PDF and download the result.",
        ],
        aeo: {
          what: "Rotate PDF is a browser tool that rotates an entire PDF or selected pages in 90-degree steps.",
          who: "It is for people who need to fix sideways scans or upside-down pages in a PDF.",
          how: "It changes only the rotation attribute of each PDF page instead of converting content to images, so original quality is preserved.",
          why: "It fixes the orientation of the pages you choose directly in the browser, with no install and no upload.",
        },
      },
    },
    faq: {
      ko: [
        {
          question: "PDF 파일이 서버로 전송되나요?",
          answer:
            "아니요. 회전은 브라우저 안에서만 처리되며 파일은 서버로 전송되거나 저장되지 않습니다.",
        },
        {
          question: "회전하면 화질이 떨어지나요?",
          answer:
            "아니요. 페이지를 이미지로 다시 그리지 않고 회전 속성만 바꾸기 때문에 원본 품질이 그대로 유지됩니다.",
        },
        {
          question: "일부 페이지만 회전할 수 있나요?",
          answer:
            "네. 썸네일에서 페이지를 클릭해 선택하거나 범위로 선택한 뒤 회전할 수 있습니다. 선택이 없으면 전체 페이지에 적용됩니다.",
        },
        {
          question: "임의 각도로 회전할 수 있나요?",
          answer:
            "아니요. 이 도구는 90도 단위(왼쪽 90도·오른쪽 90도·180도) 회전만 지원합니다. 기울기 보정은 제공하지 않습니다.",
        },
        {
          question: "회전을 되돌릴 수 있나요?",
          answer:
            "네. 선택 원상 복구 또는 전체 원상 복구로 저장 전에 회전 상태를 초기화할 수 있으며, 원본 파일은 변경되지 않습니다.",
        },
      ],
      en: [
        {
          question: "Is my PDF sent to a server?",
          answer:
            "No. Rotation happens entirely in your browser. The file is never uploaded or stored on a server.",
        },
        {
          question: "Does rotating reduce quality?",
          answer:
            "No. Pages are not re-rendered as images; only the rotation attribute changes, so original quality is preserved.",
        },
        {
          question: "Can I rotate only some pages?",
          answer:
            "Yes. Click page thumbnails to select them, or select by range, then rotate. With no selection, rotation applies to all pages.",
        },
        {
          question: "Can I rotate by an arbitrary angle?",
          answer:
            "No. This tool rotates in 90-degree steps only (left 90, right 90, 180). It does not correct skew.",
        },
        {
          question: "Can I undo a rotation?",
          answer:
            "Yes. Use Reset selected or Reset all to clear rotation before saving. The original file is never changed.",
        },
      ],
    },
    og: {
      ko: { title: "PDF 회전", subtitle: "전체 또는 선택 페이지를 90도 단위로 회전" },
      en: { title: "Rotate PDF", subtitle: "Rotate all or selected pages in 90° steps" },
    },
  },

  {
    slug: "pdf-page-delete",
    layout: "canvas",
    cat: "design",
    targets: ["office-worker", "pm", "small-business-owner", "designer"],
    ico: "⌦",
    ready: true,
    indexable: false,
    badge: "Canvas",
    name: { ko: "PDF 페이지 삭제", en: "Delete PDF Pages" },
    relatedTools: ["pdf-split", "pdf-merge", "pdf-rotate"],
    seo: {
      ko: {
        title: "PDF 페이지 삭제 | 필요 없는 페이지 제거",
        description:
          "PDF에서 필요 없는 페이지를 선택해 제거한 새 PDF를 만듭니다. 썸네일에서 삭제할 페이지를 고르면 남는 페이지 수를 바로 확인할 수 있고, 파일은 브라우저 안에서만 처리되어 서버로 전송되지 않습니다.",
        keywords: [
          "PDF 페이지 삭제",
          "PDF 페이지 제거",
          "PDF 특정 페이지 삭제",
          "PDF 페이지 지우기",
          "PDF 페이지 빼기",
          "온라인 PDF 페이지 삭제",
        ],
      },
      en: {
        title: "Delete PDF Pages | Remove Unwanted Pages",
        description:
          "Select the pages you do not need and create a new PDF without them. Choose pages from thumbnails and see how many pages remain instantly. Everything runs in your browser and no file is uploaded to a server.",
        keywords: [
          "delete PDF pages",
          "remove PDF pages",
          "delete page from PDF",
          "remove pages from PDF",
          "PDF page remover",
          "delete PDF pages online",
        ],
      },
    },
    content: {
      ko: {
        card: "필요 없는 페이지를 골라 제거한 새 PDF를 만듭니다.",
        description:
          "PDF에서 필요 없는 페이지를 선택해 제거한 새 PDF를 만듭니다. 썸네일에서 삭제할 페이지를 고르면 남는 페이지 수를 바로 확인할 수 있고, 파일은 브라우저 안에서만 처리되어 서버로 전송되지 않습니다.",
        howItWorks: [
          "PDF 파일 하나를 업로드합니다.",
          "썸네일에서 삭제할 페이지를 선택합니다.",
          "선택 페이지 삭제를 눌러 남은 페이지로 만든 PDF를 내려받습니다.",
        ],
        aeo: {
          what: "PDF 페이지 삭제는 PDF에서 선택한 페이지를 제거해 나머지 페이지로 새 PDF를 만드는 브라우저 도구입니다.",
          who: "빈 페이지, 표지, 중복 페이지 등 불필요한 페이지를 빼고 문서를 정리해야 하는 사용자를 위한 도구입니다.",
          how: "삭제로 표시한 페이지를 제외한 나머지 페이지를 복사해 새 PDF를 만들며, 최소 1페이지는 남아야 합니다.",
          why: "설치나 업로드 없이 브라우저에서 원하지 않는 페이지만 제거해 깔끔한 PDF를 만들 수 있습니다.",
        },
      },
      en: {
        card: "Pick the pages you do not need and build a new PDF without them.",
        description:
          "Select the pages you do not need and create a new PDF without them. Choose pages from thumbnails and see how many pages remain instantly. Everything runs in your browser and no file is uploaded to a server.",
        howItWorks: [
          "Upload a single PDF file.",
          "Select the pages to remove from the thumbnails.",
          "Press Delete selected pages and download the trimmed PDF.",
        ],
        aeo: {
          what: "Delete PDF Pages is a browser tool that removes selected pages from a PDF and builds a new PDF from the remaining pages.",
          who: "It is for people who need to clean up a document by removing blank pages, cover sheets, or duplicates.",
          how: "It copies every page except the ones marked for deletion into a new PDF, and at least one page must remain.",
          why: "It removes only the pages you do not want, right in the browser, with no install and no upload.",
        },
      },
    },
    faq: {
      ko: [
        {
          question: "PDF 파일이 서버로 전송되나요?",
          answer:
            "아니요. 페이지 삭제는 브라우저 안에서만 처리되며 파일은 서버로 전송되거나 저장되지 않습니다.",
        },
        {
          question: "원본 파일이 변경되나요?",
          answer:
            "아니요. 원본은 그대로 유지되며 선택한 페이지를 제외한 결과는 새 PDF 파일로 다운로드됩니다.",
        },
        {
          question: "모든 페이지를 삭제할 수 있나요?",
          answer:
            "아니요. 최소 1페이지는 남아야 합니다. 남는 페이지가 없으면 실행이 차단됩니다.",
        },
        {
          question: "삭제 선택을 되돌릴 수 있나요?",
          answer:
            "네. 실행 취소로 직전 선택을 되돌리거나 전체 원상 복구로 선택을 모두 초기화할 수 있습니다. 삭제 실행 전에는 확인 절차도 제공됩니다.",
        },
        {
          question: "여러 페이지를 한 번에 선택할 수 있나요?",
          answer:
            "네. 썸네일을 개별 클릭하거나, 전체 선택·선택 반전·범위로 선택(예: 2, 5-7)을 사용해 여러 페이지를 한 번에 지정할 수 있습니다.",
        },
      ],
      en: [
        {
          question: "Is my PDF sent to a server?",
          answer:
            "No. Page deletion happens entirely in your browser. The file is never uploaded or stored on a server.",
        },
        {
          question: "Does this change my original file?",
          answer:
            "No. The original is kept intact; the result without the selected pages downloads as a new PDF file.",
        },
        {
          question: "Can I delete every page?",
          answer:
            "No. At least one page must remain. If no page would be left, the action is blocked.",
        },
        {
          question: "Can I undo a deletion selection?",
          answer:
            "Yes. Use Undo to revert the last change or Reset all to clear the selection. A confirmation step is shown before deleting.",
        },
        {
          question: "Can I select multiple pages at once?",
          answer:
            "Yes. Click thumbnails individually, or use Select all, Invert selection, or select by range (e.g. 2, 5-7).",
        },
      ],
    },
    og: {
      ko: { title: "PDF 페이지 삭제", subtitle: "필요 없는 페이지를 제거한 새 PDF 만들기" },
      en: { title: "Delete PDF Pages", subtitle: "Remove unwanted pages and save a new PDF" },
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
    // 기능 공개(ready)와 검색 색인(indexable)은 별개다.
    // indexable=false 도구는 페이지·기능은 그대로 두고 색인만 막는다.
    // follow 는 유지: 관련 도구/허브로 이어지는 링크 가치는 그대로 흐르게 한다.
    robots: t.indexable ? undefined : { index: false, follow: true },
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
