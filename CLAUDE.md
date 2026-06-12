# Toolbox 프로젝트

## 목적
프론트 단독으로 동작하는 웹 도구를 다수 제작해 광고 수익 파이프라인 구축.
SEO 최적화된 단일 도메인 + 서브패스 구조로 운영.

---

## 제품 방향 & 아키텍처 (2026-06-12 확정)

> 아래 방향이 기존 "개발자 도구 사이트" 컨셉을 대체한다. 다른 섹션과 충돌 시 이 섹션이 우선.

### Overview
**Kitfolio는 개발자 도구 사이트가 아니다.**
초기에 추가된 Character Counter, CSS Gradient Generator, Slack Timestamp Converter 등은
브랜드 방향 확정 전 MVP 단계에서 생성된 초기 도구들이다.

### 브랜드 포지셔닝
- **Brand Message**: *Small tools for modern knowledge workers*
- **Supporting Message (SEO/AEO)**: *Work calculators, generators and utilities*
- **제품 정의**: 모던 지식 노동자를 위한 브라우저 기반 마이크로 SaaS 도구 모음.
  업무·일상 직업 활동에서 반복되는 작은 문제를 푸는 계산기·생성기·변환기·포매터·유틸리티.
  전부 브라우저에서 실행 — **No login / No installation / No server-side processing.**

### 타겟 유저
PM · Designer · Developer · Job Seeker · Office Worker · Small Business Owner

**중요**: 타겟은 URL 카테고리가 **아니다**. 필터링·디스커버리·분석용 **내부 메타데이터 태그**로만 사용.
```ts
{ slug: "flex-work-calculator", targets: ["office-worker"] }
```

### 사이트 아키텍처
- **URL은 플랫 구조 유지. 카테고리 기반 URL 도입 금지.** 모든 도구는 1뎁스 라우트.
  예: `/character-counter` `/slack-timestamp-converter` `/flex-work-calculator`
  `/meeting-cost-calculator` `/prd-generator` `/resume-bullet-generator`
- **홈페이지는 SEO 랜딩이 아니다.** 홈 = Tool Directory · Discovery Hub · 검색 진입점
  (검색 / 브라우즈 / 필터 / 디스커버리). **실제 SEO 랜딩은 각 도구 페이지.**

### SEO 전략
- 각 도구 페이지가 구체적인 검색 의도 1개를 타겟. 사용자는 "Kitfolio"를 검색하지 않는다 —
  "Character Counter", "Flex Work Calculator", "Resume Bullet Generator"를 검색한다.
- **도구 페이지 필수 구성**: ① Tool Title ② Tool Description ③ 동작하는 도구 UI
  ④ How It Works ⑤ FAQ ⑥ Related Tools ⑦ 구조화 메타데이터 ⑧ 개별 OG 메타데이터
- 도구 자체가 본질적 가치. SEO 콘텐츠는 발견성(discoverability) 보조.

### AEO 전략
AI 검색 엔진은 페이지 구조와 명시적 설명을 소비한다. 각 도구 페이지는 다음 질문에 답해야 한다:
- What is this tool? / Who is it for? / How does it work? / Why would someone use it?
- 예: "What is a Slack Timestamp Converter?" → "A Slack Timestamp Converter converts Unix
  timestamps used by Slack into human-readable dates and times."
- 이 설명은 **본문 콘텐츠와 구조화 데이터 양쪽에** 보여야 한다.

### 콘텐츠 전략
- **Kitfolio는 콘텐츠 플랫폼이 아니다. CMS 불필요.** 텍스트는 SEO·AEO·메타데이터·도구 설명 지원용.
- 목표는 콘텐츠 발행이 아니라 **도구를 이해 가능하고 발견 가능하게** 만드는 것.
- **Single Source of Truth**: 모든 텍스트는 중앙 레지스트리에서 관리. 페이지에 카피 하드코딩 금지.
  (현재 구현: `app/lib/content.ts`)
- **다국어**: 모든 도구는 ko·en 양 언어 세트 필수 정의.

### 도구 레지스트리 구조 (권장 스키마)
각 도구는 레지스트리 항목 하나에 완결 정의:
```ts
{
  slug: "slack-timestamp-converter",
  layout: "ide",                       // 레이아웃 타입
  targets: ["pm", "developer"],        // 내부 타겟 태그
  seo:     { ko: { title, description, keywords }, en: {...} },
  content: { ko: { title, description, howItWorks, relatedTools }, en: {...} },
  faq:     { ko: [{ question, answer }], en: [...] },
  og:      { ko: { title, subtitle }, en: {...} },
}
```

### FAQ 정책
- **모든 도구 페이지에 FAQ 필수.** 목적: SEO · AEO · 롱테일 검색 유입 · AI 답변 노출.
- FAQ 콘텐츠는 중앙 레지스트리에서만 관리. **페이지 컴포넌트에 하드코딩 금지.**

### 메타데이터 철학
- 콘텐츠를 **아티클이 아니라 메타데이터로** 취급한다.
- ❌ Tool + Content = Content Platform → ⭕ **Tool + Metadata = Searchable Tool**
- 도구가 제품이고, 텍스트는 발견을 돕는다.

### OG 전략
- 모든 도구는 **자기만의 OG 메타데이터**를 가진다. 전 도구 공용 OG 타이틀 금지.
- OG는 레지스트리에서 생성. 향후 동적 OG 이미지 생성도 이 값을 소비.

### 디자인 시스템 — 레이아웃 3종 (추가 금지)
| 타입 | 이름 | 패턴 | 예 |
|------|------|------|-----|
| **A** | Card | Input → Result | Character Counter, Flex Work Calculator, Meeting Cost Calculator, Salary Calculator |
| **B** | IDE | Input → Transform → Output | Slack Timestamp Converter, Prompt Formatter, Markdown Formatter, JSON Formatter |
| **C** | Full Width / Canvas | Controls → Live Visual Output | Gradient Generator, Banner Generator, OG Generator |

(현행 테마 명칭 매핑: Clean SaaS = A · IDE/Editor = B · Canvas = C)

### 신규 도구 평가 기준
1. 내가 직접 쓸 도구인가?  2. 반복되는 실제 문제가 존재하는가?  3. 검색 수요가 있는가?
4. 완전히 브라우저에서 실행 가능한가?  5. 하루 안에 구현 가능한가?
→ generic 유틸리티보다 **실용적인 도구** 우선.

### 장기 비전
Kitfolio = **a searchable library of browser-based micro SaaS tools for modern knowledge workers.**
해자(moat)는 단일 도구가 아니라, 강한 검색 의도 + 무마찰 접근으로 반복 업무 문제를 푸는
**커지는 실용 도구 컬렉션**이다. 성공 요인: 유용한 도구 · 강한 검색 의도 · 빠른 접근 ·
일관된 UX · 확장 가능한 메타데이터 관리 — 콘텐츠 생산이 아님.

---

## 기술 스택
- Next.js (App Router)
- Tailwind CSS v4
- Vercel 배포
- Google AdSense
- Google Analytics 4 + Search Console

---

## 구조 원칙
- DB 없음
- 외부 API는 무료 API만 활용 (유료 API, LLM API 사용 금지)
- 모든 로직은 클라이언트 사이드
- 각 도구는 독립 페이지 (`/tool-name`)
- 허브페이지 (`/`)는 전체 도구 목록 + 카테고리 + 설명

---

## SEO 원칙
- 각 페이지 독립 메타태그 (title, description, OG)
- 구조화 데이터 (JSON-LD) 적용
- 페이지별 h1 고유, 설명 텍스트 최소 150자
- sitemap.xml 자동 생성

---

## 도구 추가 프로세스
1. 키워드 수요 확인
2. 기존 도구 UX 분석
3. 구현
4. 메타태그 + 설명 텍스트 작성
5. 허브페이지 목록 업데이트

## 우선순위 기준
검색량 > 구현 난이도 낮음 > 기존 도구 UX 열악

---

## 디자인 시스템

### 레이아웃 구조
- 공통 헤더 + 허브페이지: **Clean SaaS** 스타일 (Flex HR 툴 참고)
- 도구 페이지: 도구 성격에 따라 3가지 테마 중 하나 적용

### 테마 분기

| 테마 | 타겟 | 적용 도구 |
|------|------|-----------|
| **IDE / Editor** | 개발자 | JSON Formatter, Base64, URL Encoder, Timestamp, JWT Decoder, Regex Tester, Cron Generator |
| **Canvas** | 디자이너 | CSS Gradient, Color Picker, Aspect Ratio |
| **Clean SaaS** | 일반 사용자 | Character Counter, Markdown→HTML, Lorem Ipsum, Image→Base64 |

---

### 공통 레이아웃 / 스타일 규칙 (2026-06-12 개정)

> 아래 규칙은 기존 테마별 가이드보다 우선한다.

1. **배경**: 개발 / 디자인 / 텍스트 — 모든 테마의 페이지 배경은 `blue-gray-50`.
   글로벌 CSS(`body`)에 공통 적용. (IDE 다크는 페이지 전체가 아니라 **출력 박스 내부에만** 적용)
2. **콘텐츠 영역**: 모든 테마 공통 `max-width: 1216px` — 공통 레이아웃 컴포넌트(`.kf-main`)로 반영.
3. **공통 컴포넌트 구조**: 루트 `app/layout.tsx`가 헤더 / 본문 / 푸터를 공통 컴포넌트로 렌더.
   ```
   layout.tsx
   ├ SiteHeader.tsx          (공통 헤더 — 언어·액티브 카테고리는 URL에서 도출)
   ├ <main class="kf-main">{children}</main>
   └ SiteFooter.tsx          (공통 푸터)
   ```
4. **테마별 인풋-출력 박스 형태**
   - **개발 (IDE)**: 1개의 박스가 좌우 2열로 분할. 인풋 = 화이트 박스 → 출력 박스 = IDE(다크) 형태.
   - **디자인 (Canvas)**: 1개의 박스가 좌우 2열로 분할. 인풋 = 화이트 박스 → 출력 = 그레이 컬러 활용.
   - **텍스트 (Clean)**: 인풋과 출력 박스를 각각 별도로 배치. 출력은 카드 2열 그리드 또는
     1개 박스 내 요소 배치 등 유동적으로 적용. 인풋 = 화이트 박스 → 출력 = 그레이 컬러 활용.
5. **페이지 헤더 / 뱃지 / 설명 영역**: 모든 테마 공통 스타일 — `PageHead` 컴포넌트(`.kf-pagehead`) 사용.
6. **페이지 구성**: 좌측 = 인풋 / 우측 = 출력 기준. 단, 디자인(Canvas) 도구는 기능에 따라
   유동적으로 적용. 모바일은 상하 배치 (인풋 위 → 출력 아래).
7. **인풋 높이**: 모든 인풋은 모바일에서 height 최솟값 240px, 콘텐츠에 따라 유동적으로 늘어나되
   최대 600px로 제한.

---

### 컬러 토큰

Tailwind CSS v4 `@theme` 블록에 아래 토큰을 등록해서 사용한다.

#### Base — Blue Gray
```css
@theme {
  --color-blue-gray-50:  #f0f1f3;
  --color-blue-gray-100: #e4e5e9;
  --color-blue-gray-200: #c6c9d1;
  --color-blue-gray-300: #abb1bc;
  --color-blue-gray-400: #8f96a5;
  --color-blue-gray-500: #787f8c;
  --color-blue-gray-600: #636873;
  --color-blue-gray-700: #4c5059;
  --color-blue-gray-800: #383b42;
  --color-blue-gray-900: #23262b;
  --color-blue-gray-950: #1b1d21;
}
```

#### Point — Blue Primary
```css
@theme {
  --color-blue-primary-50:  #f1f3fd;
  --color-blue-primary-100: #e3e7fc;
  --color-blue-primary-200: #c4cdf9;
  --color-blue-primary-300: #a7b6f6;
  --color-blue-primary-400: #899ff3;
  --color-blue-primary-500: #6486ef;
  --color-blue-primary-600: #3a70eb;
  --color-blue-primary-700: #2d5dc8;
  --color-blue-primary-800: #22499f;
  --color-blue-primary-900: #18377c;
  --color-blue-primary-950: #0a1d48;
}
```

#### 테마별 컬러 사용 가이드

> 페이지 배경은 모든 테마 공통 `blue-gray-50`. 아래는 인풋/출력 박스 내부 기준.

**IDE / Editor** (출력 박스만 다크)
- 작업 박스 / 인풋 패널: white (텍스트 `blue-gray-900`, 테두리 `blue-gray-200`)
- 출력 패널 배경: `blue-gray-950` (#1b1d21)
- 출력 패널 헤더: `blue-gray-900` (#23262b)
- 라인 넘버 / 주석: `blue-gray-700` (#4c5059)
- 출력 일반 텍스트: `blue-gray-200` (#c6c9d1)
- 신택스 — 키워드: `blue-primary-400` (#899ff3)
- 신택스 — 함수: `blue-primary-500` (#6486ef)
- 신택스 — 문자열: `blue-primary-300` (#a7b6f6)
- 액티브 탭 / 포인트: `blue-primary-700` (#2d5dc8)
- 상태 배지(라이트 영역): `blue-primary-100` bg + `blue-primary-700` text

**Canvas** (라이트)
- 작업 박스 / 인풋(컨트롤) 패널: white
- 출력(프리뷰) 영역: `blue-gray-50` + `blue-gray-100` 체커보드 (그레이 활용)
- 테두리: `blue-gray-200` (#c6c9d1)
- 포인트 / 액티브: `blue-primary-700` (#2d5dc8)
- 액티브 툴 배경: `blue-primary-100` (#e3e7fc)

**Clean SaaS** (라이트)
- 인풋 카드: white
- 출력 카드: `blue-gray-100` bg + `blue-gray-200` border (그레이 활용)
- CTA 버튼: `blue-primary-700` (#2d5dc8)
- 배지: `blue-primary-100` bg + `blue-primary-700` text

**공통 헤더**
- 배경: white
- 하단 보더: `blue-gray-100` (#e4e5e9)
- 로고마크 배경: `blue-primary-700` (#2d5dc8)
- 네비 액티브: `blue-primary-100` bg + `blue-primary-700` text
- CTA: `blue-primary-700` (#2d5dc8)

---

### 폰트

#### Google Fonts 로드
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css" rel="stylesheet">
```

#### 폰트 스택
```css
@theme {
  --font-sans: 'Pretendard', 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

#### 용도별 규칙

| 용도 | 폰트 | 굵기 |
|------|------|------|
| 영문 UI, 숫자, 배지, 버튼 | Inter | 400 / 500 / 700 |
| 국문 본문, 설명, 레이블 | Pretendard | 400 / 500 / 700 |
| IDE 테마 전체, 코드 블록 | JetBrains Mono | 400 / 500 |
| 기본 폰트 스택 | Pretendard → Inter fallback | — |

- **700은 페이지 타이틀, 히어로 헤드라인에만** 사용. UI 컴포넌트 내부에서는 500까지.
- 숫자 메트릭 (글자 수, 타임스탬프 등) 표시 시 Inter 500 사용 → 숫자 가독성 최적화.
- IDE 테마에서는 JetBrains Mono만 사용. sans-serif 혼용 금지.

---

### 공통 헤더 구조
```
[로고마크 + Kitfolio] [전체 도구 | 개발 | 디자인 | 텍스트] ··· [KO/EN 토글]
```
- 높이: 48px
- 하단 보더: 0.5px `blue-gray-100`
- 네비 아이템: 라운드 6px, 액티브 시 `blue-primary-100` 배경
- 검색·즐겨찾기는 허브 히어로 영역에 배치 (헤더 아님)
- 모바일: 네비 숨김 (허브는 스티키 카테고리 칩 바로 대체)

---

## 도구 로드맵

| # | 도구 | 국문명 | URL | 설명 | 상태 |
|---|------|--------|-----|------|------|
| 1 | JSON Formatter / Validator | JSON 포매터 | `/json-formatter` | JSON 문자열을 붙여넣으면 들여쓰기·색상 강조로 포맷팅. 문법 오류 감지 및 유효성 검사 포함 | ✅ |
| 2 | Base64 Encoder / Decoder | Base64 인코더·디코더 | `/base64` | 텍스트 또는 파일을 Base64로 인코딩하거나 디코딩. 완전 클라이언트 사이드 처리 | ⬜ |
| 3 | URL Encoder / Decoder | URL 인코더·디코더 | `/url-encoder` | URL 특수문자를 퍼센트 인코딩으로 변환하거나 원래 문자열로 복원 | ⬜ |
| 4 | Unix Timestamp Converter | 유닉스 타임스탬프 변환기 | `/timestamp` | Unix timestamp ↔ 사람이 읽을 수 있는 날짜·시간 양방향 변환. 현재 시각 실시간 표시 | ⬜ |
| 5 | Character / Word Counter | 글자 수·단어 수 카운터 | `/character-counter` | 텍스트 입력 시 글자 수·단어 수·문장 수·줄 수 실시간 집계. SNS 글자 수 제한 안내 포함 | ✅ |
| 6 | CSS Gradient Generator | CSS 그라디언트 생성기 | `/css-gradient` | linear/radial/conic 그라디언트를 시각적으로 편집하고 CSS 코드 즉시 복사 | ✅ |
| 7 | Color Picker / HEX–RGB Converter | 색상 변환기 | `/color-converter` | HEX·RGB·HSL·HSV 간 상호 변환. 컬러 피커 UI와 팔레트 저장 기능 | ⬜ |
| 8 | Cron Expression Generator | 크론 표현식 생성기 | `/cron-generator` | 크론 스케줄을 UI로 설정하면 표현식 자동 생성. 다음 실행 시각 미리보기 포함 | ⬜ |
| 9 | Markdown to HTML | 마크다운 → HTML 변환기 | `/markdown-to-html` | 마크다운 텍스트를 실시간으로 HTML로 변환. 좌우 분할 미리보기 제공 | ⬜ |
| 10 | Lorem Ipsum Generator | 로렘 입숨 생성기 | `/lorem-ipsum` | 단락·단어·문장 수를 지정해 더미 텍스트 생성. 한국어 더미 텍스트 옵션 포함 | ⬜ |
| 11 | Image to Base64 | 이미지 → Base64 변환기 | `/image-to-base64` | 이미지 파일을 Base64 문자열로 변환. Data URL 형식 복사 및 미리보기 제공 | ⬜ |
| 12 | JWT Decoder | JWT 디코더 | `/jwt-decoder` | JWT 토큰을 붙여넣으면 header·payload·signature 분리 표시. 만료 여부 확인 | ⬜ |
| 13 | Regex Tester | 정규식 테스터 | `/regex-tester` | 정규식 패턴과 테스트 문자열을 입력하면 매칭 결과 실시간 하이라이트 | ⬜ |
| 14 | Aspect Ratio Calculator | 화면 비율 계산기 | `/aspect-ratio` | 가로·세로 입력 시 비율 산출 및 비율 유지 리사이즈 계산. 주요 비율 프리셋 제공 | ⬜ |

**범례:** ⬜ 미구현 · 🚧 진행 중 · ✅ 완료

---

## 구현 현황 (2026-06-09 기준)

### 코드/아키텍처
- **Next.js 15 App Router + TypeScript + Tailwind v4** 로 구현. 디자인 토큰은
  `app/globals.css` `@theme` 블록에 스펙과 1:1 매핑.
- **다국어 = URL 기반**: KO는 루트(`/json-formatter`), EN은 `/en/json-formatter`.
  각 URL이 서버에서 해당 언어로 렌더 → 양국어 모두 색인 + `hreflang` 연결.
  (localStorage 토글 아님)
- **사이트 전체 텍스트 단일 출처**: `app/lib/content.ts` 한 파일에서 모든 텍스트(KO·EN)를 관리.
  ① `COMMON`(전역 공통 UI — i18n `t()`의 fallback) ② `HUB`(+`ui` 마이크로카피) ③ `CATS`(카테고리 라벨)
  ④ `TOOLS`(도구별 — 뱃지 `themeLabel` / h1 `name` / 리드 `description` / `steps` / **`faq`** / 컨트롤 `ui` /
  허브 카드 `card` / `keywords` / `title`). 화면 영역과 필드가 1:1 매핑.
  → 메타데이터·화면 카피·JSON-LD·허브 검색 색인에 전부 재사용. **텍스트 수정은 이 파일만 고치면 됨.**
  도구 50개로 늘어도 이 파일에 50개 × 2개 언어 세트를 추가하는 구조.
- **FAQ**: 도구 상세 페이지마다 공통 `Faq` 컴포넌트(`<Faq slug="..." />`, `.kf-faq` 아코디언) 렌더.
  콘텐츠는 `content.ts`의 `faq` 필드에서, `toolJsonLd()`가 같은 데이터로 `FAQPage` JSON-LD도 함께 생성.
- 도구 클라이언트 컴포넌트는 `app/components/` 에. 페이지(`page.tsx`)는 메타+JSON-LD+컴포넌트를 묶는 얇은 래퍼.
- **공통 레이아웃**: 루트 `layout.tsx` = `SiteHeader` + `<main class="kf-main">`(max 1216px) + `SiteFooter`.
  헤더·푸터는 `usePathname()`으로 언어(`/en` 프리픽스)와 액티브 카테고리를 도출 (`routeLang()` in `lib/i18n`).
- 페이지 헤더(뱃지·제목·설명·3단계 가이드)는 공통 `PageHead` 컴포넌트 (`<PageHead slug="..." />`).
- 레이아웃: 960px 기준 자동 반응형(≥좌우분할/<상하분할). 인풋은 모바일 min 240px / max 600px (`field-sizing: content`).

### SEO
- 페이지별 title/description/keywords + `canonical` + `hreflang`(ko-KR/en-US/x-default) + OpenGraph
- JSON-LD: 도구 `WebApplication` + `FAQPage`(FAQ 보유 시), 허브 `WebSite`+`ItemList`
- `sitemap.xml`(양 언어 + alternates) · `robots.txt` 자동 생성
- 구글 서치콘솔(DNS 인증) · 네이버 서치어드바이저(메타태그 `naver-site-verification`) 등록

### 인프라
- **배포**: Vercel (GitHub `joyfive/kitfolio` 연결, main 푸시 시 자동 배포)
- **도메인**: `kitfolio.app` (가비아 구매, 기본 네임서버 + DNS 레코드 A `@`→76.76.21.21 / CNAME `www`→cname.vercel-dns.com)
- **SSL**: Vercel 자동 발급·자동 갱신 (Let's Encrypt)
- 대표 도메인 = apex `kitfolio.app` → 코드의 `SITE.url`과 일치

### 광고 / 분석
- **AdSense**: pub `ca-pub-7537584957079478`. 로더 스크립트(layout) + 확인 메타태그 + `public/ads.txt` 적용.
  광고 단위 컴포넌트 `app/components/AdUnit.tsx` 준비됨 (슬롯 ID만 넣으면 동작, dev는 플레이스홀더).
  **단, AdSense 사이트 승인은 아직 안 받음 → 실제 광고 미노출 상태.**
- **GA4**: `G-BW26VT6W47`. `@next/third-parties` `<GoogleAnalytics>` 로 연동 (GTM 미사용).

---

## 다음 세션 TODO

0. **제품 방향(2026-06-12)과 현행 코드의 갭 해소**
   - [ ] `/tools/slack-timestamp-converter` → `/slack-timestamp-converter` 플랫 URL로 이동 (+ 301 리다이렉트, sitemap 갱신)
   - [ ] `Tool` 타입에 `targets` 태그 추가 (pm/designer/developer/job-seeker/office-worker/small-business-owner)
   - [ ] 도구 페이지에 **Related Tools** 섹션 추가 (레지스트리 `relatedTools` 필드)
   - [ ] AEO용 **What is / Who for / How / Why** 명시 문단(How It Works 확장) — 현재는 description+steps+FAQ로 부분 충족
   - [ ] `og.subtitle` 필드 + (향후) 동적 OG 이미지 생성
   - [ ] 허브·푸터 브랜드 카피를 "knowledge workers" 메시지로 교체
     (현재 "개발자·디자이너를 위한…" — content.ts `HUB`/`COMMON`만 고치면 됨)
   - [ ] 카테고리(dev/design/text) 노출을 타겟 태그 기반 필터로 점진 전환 검토

1. **AdSense 승인 받기** → 승인 후 광고 단위(슬롯) 생성 → `<AdUnit slot="..." />` 를 실제 배치
   - 배치 후보: 허브 카테고리 섹션 사이 / 도구 페이지 페이지헤드 아래 / 결과 영역 하단
   - 콘텐츠 분량이 승인 기준에 빠듯할 수 있음 → 도구를 더 채운 뒤 신청하는 편이 유리
2. **나머지 11개 도구 구현** (우선순위: 검색량 > 구현 난이도 낮음 > 기존 UX 열악)
   - 각 도구: `app/<slug>/page.tsx`(KO) + `app/en/<slug>/page.tsx`(EN) + `app/components/<Tool>.tsx`
   - `content.ts` 의 해당 항목에 `title/description/steps/faq/ui` 추가 + `ready: true` 전환
   - 컴포넌트 끝에 `<Faq slug="..." />` 추가 (FAQ 콘텐츠는 content.ts에서)
   - 테마: dev=IDE / design=Canvas / text=Clean
3. (선택) GA4 ↔ AdSense 연결, 핵심 이벤트(복사·생성 클릭) GA4 커스텀 이벤트 추가
4. (선택) 폰트 CDN → `next/font` 로컬화 (핸드오프 권고)
