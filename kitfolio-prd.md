## 1. 목적 (Goal)

Kitfolio는 반복되는 계산·변환·포맷팅 문제를 브라우저에서 바로 해결하기 위한 단일 목적 웹 도구
모음이다. PM, 디자이너, 개발자, 마케터, 구직자, 직장인, 소상공인처럼 업무 중 작은 계산과 형식
변환을 자주 마주치는 사용자를 대상으로 한다. 회원가입, 설치, 별도 설정 없이 URL에 접근하면 바로
사용할 수 있는 도구를 제공한다.

핵심 원칙은 모든 처리가 브라우저 내에서 완결되고, 사용자의 입력값을 서버로 전송하지 않는 것이다.
별도 백엔드나 데이터베이스 없이 클라이언트 로직만으로 각 도구의 계산·변환이 동작하며, 외부 API
호출도 사용하지 않는다.

Kitfolio의 기본 단위는 게시글이 아니라 개별 도구 페이지다. 사이트에 실리는 텍스트(제목·설명·FAQ
등)는 콘텐츠 소비 대상이 아니라 도구를 검색 가능하게 만들기 위한 메타데이터로 취급된다. 홈페이지는
SEO 랜딩이 아니라 검색·필터를 통해 개별 도구를 찾아가는 디스커버리 허브이고, 실제 검색 유입과
색인의 단위는 도구별 개별 페이지다.

## 2. 범위 (Scope)

2026-07-07 기준 Kitfolio에는 KO·EN 양 언어로 공개된 도구 38종이 등록되어 있다.

도구는 Developer(7종) · Design(3종) · Text(28종) 3개 카테고리로 구분한다. 카테고리는 URL 구조에
반영하지 않고, 허브 화면의 섹션 분류와 디자인 테마 분기에만 사용한다. 이와 별도로 각 도구는
PM·디자이너·개발자·구직자·직장인·소상공인·마케터 중 해당 직군을 태그로 가지는데, 이는 URL이나
카테고리가 아니라 허브의 직군 필터와 관련 도구 추천에 쓰이는 내부 메타데이터다.

대표 도구는 다음과 같다. 전체 목록은 부록에 정리했다.

| 카테고리 | 대표 도구 |
|---|---|
| Developer | JSON Formatter, Slack Timestamp Converter, CSS 단위 변환기(rem/em/vw/%/ms → px) |
| Design | CSS Gradient, Tailwind Palette Generator, Open Graph Preview Tester |
| Text | Salary Calculator, Flex Work Calculator, 성장률·퍼센트 계산기 15종, 광고 지표 계산기 7종 |

| 포함 | 제외 |
|---|---|
| 브라우저에서 완결되는 단일 목적 도구 | 회원가입·계정 관리 |
| KO/EN 다국어 페이지 | 결제 기능 |
| 도구별 개별 상세 페이지 | 커뮤니티 기능 |
| 홈 검색 및 직군 필터 | CMS 기반 실시간 편집 |
| 관련 도구 추천 · FAQ/AEO 문답 | 서버 사이드 데이터 처리 |
| JSON-LD 구조화 데이터 · sitemap/robots/OG/canonical | 유료 API·외부 서버 의존 로직 |

## 3. 정보 구조 (IA)

Kitfolio는 단일 도메인과 1뎁스 플랫 라우트 구조로 운영한다. 카테고리 경로 없이 모든 도구가
`/{slug}` 형태로 배치되며, 과거 존재했던 2뎁스 경로는 308(permanent) 리다이렉트로 신규 URL에
연결된다.

```
/
├─ 허브 (/)
├─ 도구
│   ├─ /json-formatter
│   ├─ /slack-timestamp-converter
│   ├─ /salary-calculator
│   └─ /{slug}  (총 38종, 1뎁스 플랫 라우트)
├─ 약관
│   ├─ /privacy-policy
│   └─ /terms-of-service
└─ 영어 버전
    ├─ /en
    └─ /en/{slug}
```

언어는 URL로만 결정된다. 한국어는 루트 경로, 영어는 `/en` 프리픽스 경로를 쓰며, 각 언어는
서버에서 완전히 렌더링된 별도 페이지다. 언어 전환 UI는 브라우저에 저장된 설정을 바꾸는 방식이
아니라 현재 페이지를 상대 로케일 URL(`/foo` ↔ `/en/foo`)로 이동시키는 링크로 구현되어 있으며,
이 덕분에 두 언어 버전이 각각 독립적인 페이지로 색인된다.

## 4. 페이지 정의

### 허브 페이지 (`/`, `/en`)
허브 페이지는 다음 요소로 구성된다: 히어로 영역(타이틀·서브타이틀), 텍스트 검색 인풋(도구 이름·카드
설명·키워드를 대상으로 하는 실시간 필터링), 직군별 필터 칩 바(전체/PM/마케터/디자이너/개발자/구직자/
직장인/소상공인, 데스크톱·모바일 두 형태로 제공), 즐겨찾기 토글(선택 상태를 브라우저에 저장), 필터링된
도구를 카드 그리드로 나열하는 카탈로그 섹션. 카드에는 아이콘, 국문/영문 이름, 한 줄 설명, 타겟 태그,
즐겨찾기 버튼이 표시된다.

### 도구 페이지 (`/{slug}`, `/en/{slug}`)
모든 도구 페이지는 언어별 메타데이터와 구조화 데이터를 갖는 얇은 래퍼 위에 도구 UI를 얹는 구조다.
화면 구성은 공통 패턴을 따른다: 상단에 카테고리·테마 뱃지, 제목, 리드 문단, 3단계 사용 가이드를
배치하고, 그 아래 레이아웃 타입(좌우 분할 또는 카드형 입력·출력)에 따른 도구 UI를 두며, 하단에는
AEO 문답("이 도구에 대하여")과 FAQ를 탭으로 전환하는 동일한 아코디언 구조, 이어서 관련 도구 추천
섹션을 순서대로 배치한다. 각 도구는 레지스트리의 OG 타이틀/서브타이틀을 그대로 소비하는 1200×630
OG 이미지를 빌드 시 정적으로 생성한다.

## 5. 콘텐츠 레지스트리 정책

Kitfolio는 콘텐츠 플랫폼이 아니라 도구 모음이며, 모든 도구의 렌더링 텍스트(제목, 설명, 카드 문구,
사용 가이드, AEO 문답, FAQ, OG 타이틀/서브타이틀, SEO 키워드)를 `content.ts`라는 단일 레지스트리
한 곳에서 KO·EN 세트로 관리한다. 메타데이터, 화면에 노출되는 카피, 구조화 데이터, 허브 검색 색인,
관련 도구 추천은 전부 이 레지스트리 값을 그대로 재사용하므로 콘텐츠를 한 번만 수정하면 모든 노출
지점에 동시에 반영된다. 페이지에는 카피가 하드코딩되지 않으며, 버튼·인풋 라벨 같은 UI 마이크로카피만
예외적으로 전역 공통 사전 또는 도구별 로컬 사전에서 관리한다.

도구가 늘어나도 운영 방식은 동일하다. 새 도구를 추가하는 작업은 이 레지스트리에 항목 하나
(KO·EN 두 세트)를 추가하는 것으로 귀결되며, 메타데이터·구조화 데이터·허브 노출·관련 도구 추천이
그 항목으로부터 자동으로 뒤따른다.

## 6. 도구 설계 원칙

- **단일 목적**: 각 도구는 하나의 검색 의도와 하나의 계산·변환 문제만 다룬다. 여러 기능을 한
  페이지에 묶지 않는다.
- **3종 레이아웃 시스템**: 도구 성격에 따라 Clean(카드형 입력→결과) · IDE(좌우 분할, 다크 출력
  패널) · Canvas(컨트롤→실시간 시각 결과) 중 하나의 디자인 테마를 적용한다. 레이아웃 타입은
  Developer/Design/Text 카테고리와 대체로 겹치지만 도구 성격에 따라 예외도 있다.
- **계산 로직의 재사용**: 같은 계산 패턴을 공유하는 도구 묶음은 하나의 계산 엔진을 공유하고
  도구별로 파라미터만 다르게 준다. 성장률·퍼센트 계열 계산기 15종(성장률, YoY/MoM/QoQ/WoW,
  CAGR, 복리, 역산 등)이 하나의 설정 기반 계산 엔진을 공유하고, 광고 지표 계산기 중 ROAS/CPA/
  CPC/CPM/CTR 5종이 하나의 공용 계산기를 공유한다. 계산 로직은 공유되지만 각 도구의 URL·
  메타데이터·구조화 데이터·SEO 문구는 슬러그 단위로 완전히 독립적으로 등록된다.
- **콘텐츠는 메타데이터**: 도구 자체가 제품이고 텍스트는 발견을 돕는 보조 수단이라는 원칙 아래,
  모든 설명·FAQ는 읽을거리가 아니라 검색엔진과 AI 검색이 소비할 메타데이터로 설계된다.

## 7. SEO / AEO 정책

### 다국어 색인 정책
모든 도구는 KO·EN 페이지 쌍으로 존재하며, 각 언어 페이지는 언어별 canonical과 ko/en/x-default
상호 참조를 가진다. x-default는 KO URL로 고정된다. 두 언어 페이지는 각각 서버에서 완전히
렌더링되어 독립적으로 색인되며, 클라이언트 사이드 언어 전환에 의존하지 않는다.

### 구조화 데이터 정책
도구 페이지는 WebApplication 구조화 데이터를 가지며, 애플리케이션 분류는 도구가 속한 개발/디자인/
텍스트 카테고리에 따라 DeveloperApplication / DesignApplication / UtilitiesApplication으로
구분되고, 무료로 이용 가능함을 명시하는 가격 정보(0)가 포함된다. 도구에 AEO 문답이나 FAQ가 있으면
두 콘텐츠를 합친 질문·답변이 FAQPage 구조화 데이터로 함께 노출된다. AEO 질문 문구에는 도구 이름이
포함되어 "What is a Slack Timestamp Converter?"와 같은 AI 검색 질의와 직접 매칭되도록 구성된다.
허브 페이지는 WebSite와, 공개된 도구 전체를 담은 ItemList 구조화 데이터를 갖는다.

### sitemap/robots 자동 생성 정책
사이트맵은 공개 상태인 도구 전체와 약관 페이지, 허브 루트를 대상으로 KO·EN URL을 각각 엔트리로
생성하고, 각 엔트리에 ko/en 상호 참조를 붙인다. 갱신 빈도와 우선순위는 허브 > 일반 도구 > 약관
페이지 순으로 차등 부여된다. robots 정책은 전체 크롤링을 허용하고 사이트맵 위치만 선언하는
최소 구성이다.

## 8. 운영 상태

Google Analytics 4가 전 페이지에 연동되어 있다. Google AdSense 로더 스크립트와 사이트 소유
확인 메타태그가 삽입되어 있으나, 광고 단위는 현재 어떤 페이지에도 배치되어 있지 않아 실제 광고는
노출되지 않는다.

## 부록. 전체 도구 목록 (38종)

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

## 기술 스택

- Next.js 15 (App Router) + React 19 + TypeScript
- Tailwind CSS v4
- Vercel — GitHub 저장소 연동으로 push 시 자동 배포되며, apex 도메인의 SSL을 자동 발급·갱신한다.
- 도구별 계산 로직에 필요한 소규모 라이브러리(색상 변환, 음력 변환, OG 미리보기 렌더링, 사용자
  입력 새니타이즈)만 의존성에 포함되어 있으며, 서버 API나 유료 API 의존성은 없다.
