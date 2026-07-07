## 개요

Kitfolio는 모던 지식 노동자(PM · 디자이너 · 개발자 · 구직자 · 직장인 · 소상공인 · 마케터)를 대상으로,
업무·일상 직업 활동에서 반복되는 작은 계산·변환·포맷팅 문제를 해결하는 브라우저 기반 웹 도구
모음이다. 회원가입이나 설치 없이 URL에 바로 접근해 사용할 수 있는 단일 목적 도구를 다수
운영하는 것을 목표로 한다.

핵심 제품 원칙은 **모든 처리가 브라우저 내에서 완결되고 어떤 사용자 입력값도 서버로 전송되지 않는다**는
점이다. 별도 백엔드나 데이터베이스 없이 Next.js 클라이언트 컴포넌트만으로 각 도구의 계산·변환
로직이 동작하며, 외부 API 호출도 사용하지 않는다.

Kitfolio는 콘텐츠 플랫폼이 아니라 도구 모음이며, 사이트에 실리는 텍스트(제목·설명·FAQ 등)는
전부 도구를 검색 가능하게 만들기 위한 메타데이터로 취급된다. 홈페이지는 SEO 랜딩이 아니라
검색·필터를 통해 개별 도구를 찾아가는 디스커버리 허브이고, 실제 검색 유입과 색인의 단위는
도구별 개별 페이지다.

## 범위

2026-07-07 기준 `app/lib/content.ts` 레지스트리에 `ready: true`로 등록되어 KO·EN 양 언어로
라이브 중인 도구는 총 38종이며, 다음 3개 카테고리로 분류된다.

- **Developer** — 개발 관련 포맷팅·단위 변환 도구 (JSON 포매터, 타임스탬프 변환기, CSS 단위 변환기 등)
- **Design** — 색상·그라디언트·이미지 메타데이터 등 시각 자산 생성 도구
- **Text** — 텍스트·업무 계산기 (급여, 근무시간, 성장률/퍼센트 계산, 광고 지표 계산기 등)

카테고리(`cat`)는 URL 구조에 반영되지 않으며 디자인 테마 분기와 허브 섹션 라벨에만 쓰인다.
이와 별도로 각 도구는 `targets`(PM·디자이너·개발자·구직자·직장인·소상공인·마케터) 태그를 가지는데,
이는 URL이나 카테고리가 아니라 허브의 직군 필터 칩과 관련 도구 추천에 쓰이는 내부 메타데이터다.

| 도구명 (KO/EN) | 경로 | 한 줄 요약 |
|---|---|---|
| JSON 포매터 / JSON Formatter | `/json-formatter` | JSON 문자열을 들여쓰기·색상 강조로 포맷팅. 문법 오류 감지와 유효성 검사 포함. |
| 슬랙 타임스탬프 변환기 / Slack Timestamp Converter | `/slack-timestamp-converter` | Unix 타임스탬프 ↔ 날짜 ↔ Slack date 구문 양방향 변환. 현재 타임스탬프 실시간 표시. |
| Rem → Px 변환기 / Rem to Px Converter | `/rem-to-px` | rem ↔ px 즉시 변환. 루트 폰트 크기 설정 지원. |
| Em → Px 변환기 / Em to Px Converter | `/em-to-px` | em ↔ px 즉시 변환. 부모 폰트 크기 설정 지원. |
| Vw → Px 변환기 / Vw to Px Converter | `/vw-to-px` | vw ↔ px 즉시 변환. 반응형 뷰포트 너비 프리셋 지원. |
| % → Px 변환기 / Percent to Px Converter | `/percent-to-px` | CSS % ↔ px 즉시 변환. 부모 요소 너비 설정 지원. |
| Ms → S 변환기 / Ms to S Converter | `/ms-to-s` | ms ↔ s 즉시 변환. CSS 애니메이션·트랜지션 시간 계산에 유용. |
| 그라디언트 생성기 / CSS Gradient | `/css-gradient` | linear·radial·conic 그라디언트를 시각적으로 편집하고 CSS 코드를 즉시 복사. |
| Tailwind 팔레트 생성기 / Tailwind Palette | `/tailwind-palette-generator` | 베이스 HEX 하나로 Tailwind용 11단계 팔레트(50~950)를 만들고 코드로 복사. |
| OG 미리보기 테스트 / Open Graph Preview Tester | `/open-graph-preview` | OG 이미지와 제목·설명이 주요 플랫폼에서 어떻게 보이는지 비교. |
| 글자 수·단어 수 카운터 / Character Counter | `/character-counter` | 글자·단어·문장·줄 수를 실시간 집계. SNS 글자 수 제한 안내 포함. |
| 연봉 실수령액 계산기 / Salary Net Pay Calculator | `/salary-calculator` | 세전 연봉·월급으로 4대보험·세금을 뺀 예상 실수령액과 공제 내역을 즉시 계산. |
| 유연근무 잔여시간 계산기 / Flex Work Calculator | `/flex-work-calculator` | 유연근무 목표·남은 근무시간과 하루 평균 필요시간을 계산. 휴가 차감·공휴일 반영. |
| 시간 더하기 빼기 계산기 / Time Calculator | `/time-calculator` | 시간 블록을 자유롭게 더하고 빼서 총 근무시간 계산. 타임시트·청구 시간에 유용. |
| 시간 단위 변환기 / Time Converter | `/time-converter` | 시간·일·주·월·년 단위 즉시 변환. 근무 기준(8h/일)과 캘린더 기준 선택 가능. |
| 음력 양력 변환기 / Lunar–Solar Converter | `/lunar-solar-converter` | 양력 ↔ 음력 날짜를 즉시 변환. 1901~2100년 범위, 윤달·갑자·띠 정보 포함. |
| 성장률 계산기 / Growth Rate Calculator | `/growth-rate-calculator` | 시작값·종료값으로 성장률·차이·배수 즉시 계산. |
| 퍼센트 변화율 계산기 / Percentage Change Calculator | `/percentage-change-calculator` | 이전 값과 현재 값으로 변화율·차이·배수 계산. |
| 증가율 계산기 / Percentage Increase Calculator | `/percentage-increase-calculator` | 원래 값과 증가된 값으로 증가율 즉시 계산. |
| 감소율 계산기 / Percentage Decrease Calculator | `/percentage-decrease-calculator` | 원래 값과 감소된 값으로 감소율 즉시 계산. |
| 퍼센트 차이 계산기 / Percent Difference Calculator | `/percent-difference-calculator` | 두 값 A·B의 상대적 퍼센트 차이 계산. |
| MoM 성장률 계산기 / MoM Growth Calculator | `/mom-growth-calculator` | 지난달·이번달 값으로 MoM 성장률 즉시 계산. |
| YoY 성장률 계산기 / YoY Growth Calculator | `/yoy-growth-calculator` | 작년·올해 값으로 YoY 성장률 즉시 계산. |
| QoQ 성장률 계산기 / QoQ Growth Calculator | `/qoq-growth-calculator` | 지난 분기·이번 분기 값으로 QoQ 성장률 즉시 계산. |
| WoW 성장률 계산기 / WoW Growth Calculator | `/wow-growth-calculator` | 지난주·이번주 값으로 WoW 성장률 즉시 계산. |
| 목표 성장률 계산기 / Goal Growth Calculator | `/goal-growth-calculator` | 현재 값과 목표 값으로 필요 성장률 즉시 계산. |
| 필요 증가량 계산기 / Required Growth Calculator | `/required-growth-calculator` | 현재값·목표값으로 필요 증가량·달성률 즉시 계산. |
| 역산 계산기 / Reverse Growth Calculator | `/reverse-growth-calculator` | 최종 값과 성장률로 원래 값 역산. |
| CAGR 계산기 / CAGR Calculator | `/cagr-calculator` | 시작값·종료값·기간으로 CAGR 즉시 계산. |
| 복리 성장 계산기 / Compound Growth Calculator | `/compound-growth-calculator` | 초기값·성장률·기간으로 복리 최종값 즉시 계산. |
| 성장 예측 계산기 / Growth Projection Calculator | `/growth-projection-calculator` | 현재값·성장률·기간으로 복리 기반 미래값 즉시 예측. |
| 광고 예산 페이싱 계산기 / Ad Budget Pacing Calculator | `/ad-budget-pacing-calculator` | 캠페인 기간 진행률 대비 예산 소진율을 비교해 과다·부족 집행 상태를 즉시 확인. |
| ROAS 계산기 / ROAS Calculator | `/roas-calculator` | 광고비·매출로 ROAS 즉시 계산. 목표 매출·허용 광고비 역산과 손익분기 ROAS 포함. |
| CPA 계산기 / CPA Calculator | `/cpa-calculator` | 광고비·전환 수로 CPA 즉시 계산. 예상 전환 수·필요 예산 역산 포함. |
| CPC 계산기 / CPC Calculator | `/cpc-calculator` | 광고비·클릭 수로 CPC 즉시 계산. 예상 클릭 수·필요 예산 역산 포함. |
| CPM 계산기 / CPM Calculator | `/cpm-calculator` | 광고비·노출 수로 CPM 즉시 계산. 예상 노출 수·필요 예산 역산 포함. |
| CTR 계산기 / CTR Calculator | `/ctr-calculator` | 클릭 수·노출 수로 CTR 즉시 계산. 필요 클릭 수·필요 노출 수 역산 포함. |
| 퍼널 전환율 계산기 / Funnel Conversion Calculator | `/funnel-conversion-calculator` | 마케팅 퍼널 단계별 전환율·이탈률 분석과 목표 달성을 위한 필요 트래픽 역산. |

EN 경로는 각 KO 경로에 `/en` 프리픽스를 붙인 동일 슬러그(예: `/en/json-formatter`)이며 표에서는
생략한다.

## IA / URL 구조

Kitfolio는 단일 도메인(`kitfolio.app`) + 서브패스 구조로 운영되며, 모든 도구는 카테고리 없이
1뎁스 플랫 라우트(`/{slug}`)에 배치된다. 과거 존재했던 2뎁스 경로(`/tools/{slug}`)는
`next.config.ts`의 `redirects()`에 308(permanent) 리다이렉트로 등록되어 신규 URL로 연결된다.

언어는 URL로만 결정된다. 한국어는 루트 경로(`/{slug}`), 영어는 `/en/{slug}` 프리픽스 경로를 쓰며,
각 언어는 서버에서 해당 언어로 렌더링된 별도 페이지다. `app/en/layout.tsx`가 서브트리 전체에
`LangProvider lang="en"`을 주입해 언어를 고정하고 `<html lang>`도 `en`으로 재설정한다. 언어 전환
UI(`LangToggle`)는 `localStorage` 값을 바꾸는 것이 아니라 현재 경로를 상대 로케일 URL(`/foo` ↔
`/en/foo`)로 매핑해 이동시키는 링크이며, 이로써 두 언어 버전이 각각 독립적으로 색인된다.

허브(도구 목록) 페이지도 동일한 패턴을 따라 KO는 `/`, EN은 `/en`에 위치한다.

## SEO / AEO 정책

### 콘텐츠 단일 출처 정책
모든 도구의 렌더링 텍스트(제목, 설명, 카드 문구, How It Works, AEO 문단, FAQ, OG 타이틀/서브타이틀,
SEO 키워드)는 `app/lib/content.ts`의 `TOOLS` 배열 한 곳에서 KO·EN 세트로 관리된다. 각 도구
레지스트리 항목은 `seo`(title/description/keywords), `content`(card/description/howItWorks/aeo),
`faq`, `og` 필드로 구성되며, 이 값들이 `buildToolMetadata()`(메타데이터), `PageHead`/`Faq`/`Hub`
컴포넌트(화면 카피), `toolJsonLd()`(구조화 데이터), 허브 검색 색인(키워드 매칭)에 그대로 재사용된다.
페이지 컴포넌트에는 카피가 하드코딩되지 않으며, 버튼·인풋 라벨 같은 UI 마이크로카피만 예외적으로
전역 공통(`lib/i18n.tsx`의 `COMMON`) 또는 도구별 컴포넌트 로컬 딕셔너리에서 관리한다.

### 다국어 색인 정책
각 도구 페이지는 KO·EN 페이지 쌍(`app/{slug}/page.tsx`, `app/en/{slug}/page.tsx`)으로 구현되고,
`buildToolMetadata(slug, lang)`가 언어별로 `canonical`과 `alternates.languages`(`ko-KR`, `en-US`,
`x-default`)를 생성한다. `x-default`는 KO URL로 고정된다. 두 언어 페이지는 서버에서 각각 완전히
렌더링되므로 클라이언트 사이드 언어 전환에 의존하지 않고 양쪽 URL이 독립적으로 색인된다.

### 구조화 데이터 정책
도구 페이지는 `toolJsonLd()`가 생성하는 `WebApplication` JSON-LD를 갖는다.
`applicationCategory`는 도구의 `cat` 값(dev/design/text)에 따라 `DeveloperApplication` /
`DesignApplication` / `UtilitiesApplication`으로 매핑되고, `isAccessibleForFree: true`와
`offers.price: "0"`으로 무료 도구임을 명시한다. 도구에 AEO 문단(`content.aeo`)이나 `faq`가 있으면
두 세트를 합친 Q&A가 `FAQPage` JSON-LD로 함께 배열에 추가된다. AEO 질문 문구는 도구 이름을 포함하도록
동적으로 생성되어(`aeoQA()`) "What is a Slack Timestamp Converter?" 형태의 AI 검색 질의와 직접
매칭되게 한다. 허브 페이지는 `hubJsonLd()`가 `WebSite` + `ItemList`(ready 상태인 도구 전체를
포함) JSON-LD를 생성한다.

### sitemap/robots 자동 생성 정책
`app/sitemap.ts`는 `TOOLS` 중 `ready: true`인 항목과 약관 페이지(`LEGAL_SLUGS`), 허브 루트를
대상으로 KO·EN 두 URL을 각각 엔트리로 생성하고, 각 엔트리에 `alternates.languages`(ko/en 상호
참조)를 붙인다. `changeFrequency`/`priority`는 허브(`priority: 1`) > 일반 도구(`0.8`) > 약관
페이지(`0.3`, `yearly`) 순으로 차등 부여된다. `app/robots.ts`는 전체 허용(`allow: "/"`)과
sitemap 위치만 선언하는 최소 구성이다.

## 페이지 정의

### 허브 페이지 (`/`, `/en`)
`Hub` 컴포넌트가 렌더하며 다음 요소로 구성된다: 히어로 영역(타이틀·서브타이틀), 텍스트 검색 인풋(도구
이름·카드 설명·키워드를 대상으로 클라이언트 사이드 필터링), 직군(target) 필터 칩 바(전체/PM/마케터/
디자이너/개발자/구직자/직장인/소상공인, 데스크톱·모바일 두 형태로 렌더), 즐겨찾기 토글(선택 상태를
`localStorage`의 `kitfolio-favs` 키에 저장), 필터링된 도구를 카드 그리드로 나열하는 카탈로그
섹션. 카드에는 아이콘, 국문/영문 이름, 한 줄 설명, 타겟 태그, 즐겨찾기 버튼이 표시된다.

### 도구 페이지 (`/{slug}`, `/en/{slug}`)
모든 도구는 KO/EN 각각 별도의 `page.tsx`를 가지는 얇은 래퍼로 구현된다. `page.tsx`는
`buildToolMetadata(slug, lang)`로 메타데이터를 export하고, `toolJsonLd(slug, lang)`를 `JsonLd`
컴포넌트에 주입한 뒤, 도구별 클라이언트 컴포넌트(`app/components/*.tsx`) 하나를 렌더하는 것이
전부다. 도구 컴포넌트 내부는 공통 패턴을 따른다: `PageHead`(카테고리·테마 뱃지, h1, 리드 문단,
3단계 How It Works) → 도구 UI(레이아웃 타입에 따라 좌우 분할 또는 카드형 입력·출력) →
`Faq`(칩 탭으로 전환되는 아코디언 — "이 도구에 대하여" 탭은 AEO What/Who/How/Why를,
"자주 묻는 질문" 탭은 FAQ를 노출하며 둘 다 동일한 컴포넌트) → `RelatedTools`(레지스트리의
`relatedTools` slug 목록을 허브와 동일한 카드 스타일로 표시). 각 도구 라우트는 `opengraph-image.tsx`도
함께 두어 `app/lib/og.tsx`의 공통 렌더러가 레지스트리의 `og.title`/`og.subtitle`을 읽어 1200×630
OG 이미지를 빌드 시 정적 생성한다.

**예외**: 광고 지표 계산기 계열(ROAS/CPA/CPC/CPM/CTR)은 각각 별도 컴포넌트를 두지 않고
`app/components/marketing/AdMetricCalculator.tsx` 하나를 `metricKey` prop으로 구분해 재사용한다.
레지스트리·메타데이터·JSON-LD·URL 구조는 다른 도구와 동일하게 슬러그 단위로 독립적이다.

## 기술 스택

- **Next.js 15 (App Router) + React 19 + TypeScript** — 도구 페이지 단위로 `opengraph-image.tsx`,
  `sitemap.ts`, `robots.ts` 같은 파일 기반 컨벤션을 활용해 메타데이터·정적 자산 생성을 라우트에
  종속시키는 구조를 그대로 채택했다.
- **Tailwind CSS v4** — `@theme` 블록에 디자인 토큰(컬러·폰트)을 정의해 컴포넌트 스타일과 토큰을
  1:1로 매핑한다.
- **Vercel** — GitHub 저장소(`joyfive/kitfolio`)와 연결해 push 시 자동 배포하며, apex 도메인
  (`kitfolio.app`)의 SSL을 자동 발급·갱신한다.
- **`@next/third-parties`의 `GoogleAnalytics`** — GTM 없이 GA4 스크립트를 직접 로드한다.
- 도구별 계산 로직에 필요한 소규모 라이브러리(`culori`—색상 변환, `korean-lunar-calendar`/
  `lunar-javascript`—음력 변환, `html-to-image`—OG 미리보기 렌더링, `dompurify`—사용자 입력
  새니타이즈)만 의존성에 포함되어 있으며, 서버 API나 유료 API 의존성은 없다.
