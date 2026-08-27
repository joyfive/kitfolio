# Kitfolio

개발자·디자이너를 위한 무료 웹 도구 모음. 프론트 단독으로 동작하며, 모든 처리는
브라우저 안에서 끝납니다 (DB·서버 전송 없음). SEO 최적화된 단일 도메인 + 서브패스 구조.

> Claude Design 핸드오프(HTML/CSS/JS 프로토타입)를 Next.js(App Router) + Tailwind v4로
> 옮긴 초안입니다.

## 기술 스택

- **Next.js 15** (App Router): 폴더명이 곧 URL 서브패스 (`app/json-formatter` → `/json-formatter`)
- **TypeScript**
- **Tailwind CSS v4**: `app/globals.css`의 `@theme` 블록에 디자인 토큰을 1:1 매핑
- **URL 기반 다국어(i18n)**: KO는 루트, EN은 `/en` 프리픽스. 각 URL이 서버에서 해당
  언어로 렌더되어 양국어 모두 색인됨 + `hreflang` 연결
- Vercel 배포 대상

## SEO 구조

- **콘텐츠 단일 출처**: `app/lib/content.ts` 한 파일에 페이지별 **제목 / 설명 / 키워드**를
  KO·EN로 모아두고 → 메타데이터·화면 카피·JSON-LD·허브 검색 색인에 모두 재사용.
  텍스트 수정은 이 파일만 고치면 됩니다.
- **메타데이터**: 페이지별 title/description/keywords + `canonical` + `hreflang`(ko/en/x-default) + OpenGraph
- **구조화 데이터(JSON-LD)**: 도구=`WebApplication`, 허브=`WebSite`+`ItemList`
- `sitemap.xml`(양 언어 + alternates) · `robots.txt` 자동 생성
- **색인 정책: `ready` 와 `indexable` 분리**:
  `ready` 는 "도구를 쓸 수 있는가"(허브 목록·검색·관련 도구 노출),
  `indexable` 은 "검색 랜딩 페이지로 낼 품질이 확보됐는가"(sitemap·robots·허브 ItemList).
  `indexable=false` 도구도 **페이지는 정상 동작하고 UI에 그대로 노출되며**,
  sitemap에서 빠지고 `robots: noindex, follow` 만 적용됩니다.
  동일 컴포넌트·동일 구조의 파생 페이지는 계열별 대표 1개만 색인합니다.
- **콘텐츠 품질 게이트**: `indexable=true` 는 `validateIndexableTools()` 의 조건
  (guide 2섹션 · examples · limitations · faq · relatedTools · og, **ko/en 양쪽**)을
  통과해야 합니다. 글자 수가 아니라 필수 콘텐츠 구조의 존재 여부로 판정합니다.

## 구현된 기능 (도구 37종)

각 도구는 KO(루트)·EN(`/en`) 양 언어로 서버 렌더되며, 메타데이터·JSON-LD·OG·FAQ/AEO를
`app/lib/content.ts` 레지스트리에서 단일 출처로 관리합니다. 허브(`/`, `/en`)는 전체 도구의
검색·필터·디스커버리 진입점입니다.

| No | 기능명 | KO 경로 | EN 경로 | 기능 요약 |
|---|---|---|---|---|
| 1 | JSON 포매터 / JSON Formatter | `/json-formatter` | `/en/json-formatter` | JSON 문자열을 들여쓰기·색상 강조로 포맷팅. 문법 오류 감지와 유효성 검사 포함. |
| 2 | 슬랙 타임스탬프 변환기 / Slack Timestamp Converter | `/slack-timestamp-converter` | `/en/slack-timestamp-converter` | Unix 타임스탬프 ↔ 날짜 ↔ Slack date 구문 양방향 변환. 현재 타임스탬프 실시간 표시. |
| 3 | Rem → Px 변환기 / Rem to Px Converter | `/rem-to-px` | `/en/rem-to-px` | rem ↔ px 즉시 변환. 루트 폰트 크기 설정 지원. |
| 4 | Em → Px 변환기 / Em to Px Converter | `/em-to-px` | `/en/em-to-px` | em ↔ px 즉시 변환. 부모 폰트 크기 설정 지원. |
| 5 | Vw → Px 변환기 / Vw to Px Converter | `/vw-to-px` | `/en/vw-to-px` | vw ↔ px 즉시 변환. 반응형 뷰포트 너비 프리셋 지원. |
| 6 | % → Px 변환기 / Percent to Px Converter | `/percent-to-px` | `/en/percent-to-px` | CSS % ↔ px 즉시 변환. 부모 요소 너비 설정 지원. |
| 7 | Ms → S 변환기 / Ms to S Converter | `/ms-to-s` | `/en/ms-to-s` | ms ↔ s 즉시 변환. CSS 애니메이션·트랜지션 시간 계산에 유용. |
| 8 | 그라디언트 생성기 / CSS Gradient | `/css-gradient` | `/en/css-gradient` | linear·radial·conic 그라디언트를 시각적으로 편집하고 CSS 코드를 즉시 복사. |
| 9 | Tailwind 팔레트 생성기 / Tailwind Palette | `/tailwind-palette-generator` | `/en/tailwind-palette-generator` | 베이스 HEX 하나로 Tailwind용 11단계 팔레트(50~950)를 만들고 코드로 복사. |
| 10 | OG 미리보기 테스트 / Open Graph Preview Tester | `/open-graph-preview` | `/en/open-graph-preview` | OG 이미지와 제목·설명이 주요 플랫폼에서 어떻게 보이는지 비교합니다. |
| 11 | 글자 수·단어 수 카운터 / Character Counter | `/character-counter` | `/en/character-counter` | 글자·단어·문장·줄 수를 실시간 집계. SNS 글자 수 제한 안내 포함. |
| 12 | 연봉 실수령액 계산기 / Salary Net Pay Calculator | `/salary-calculator` | `/en/salary-calculator` | 세전 연봉·월급으로 4대보험·세금을 뺀 예상 실수령액과 공제 내역을 즉시 계산. |
| 13 | 퇴직금 계산기 / Severance Pay Calculator | `/severance-pay-calculator` | `/en/severance-pay-calculator` | 입사일과 퇴직 전 3개월 임금으로 1일 평균임금과 예상 퇴직금(세전)을 계산. |
| 14 | 유연근무 잔여시간 계산기 / Flex Work Calculator | `/flex-work-calculator` | `/en/flex-work-calculator` | 유연근무 목표·남은 근무시간과 하루 평균 필요시간을 계산. 휴가 차감·공휴일 반영. |
| 15 | 시간 더하기 빼기 계산기 / Time Calculator | `/time-calculator` | `/en/time-calculator` | 시간 블록을 자유롭게 더하고 빼서 총 근무시간 계산. 타임시트·청구 시간에 유용. |
| 16 | 시간 단위 변환기 / Time Converter | `/time-converter` | `/en/time-converter` | 시간·일·주·월·년 단위 즉시 변환. 근무 기준(8h/일)과 캘린더 기준 선택 가능. |
| 17 | 음력 양력 변환기 / Lunar-Solar Converter | `/lunar-solar-converter` | `/en/lunar-solar-converter` | 양력 ↔ 음력 날짜를 즉시 변환. 1901~2100년 범위, 윤달·갑자·띠 정보 포함. |
| 18 | 성장률 계산기 / Growth Rate Calculator | `/growth-rate-calculator` | `/en/growth-rate-calculator` | 이전값·현재값으로 성장률·퍼센트 증감률·MoM·YoY·QoQ·WoW를 즉시 계산. |
| 19 | 퍼센트 차이 계산기 / Percent Difference Calculator | `/percent-difference-calculator` | `/en/percent-difference-calculator` | 두 값 A·B의 상대적 퍼센트 차이 계산. |
| 20 | 목표 성장률 계산기 / Goal Growth Calculator | `/goal-growth-calculator` | `/en/goal-growth-calculator` | 현재 값과 목표 값으로 필요 성장률 즉시 계산. |
| 21 | 필요 증가량 계산기 / Required Growth Calculator | `/required-growth-calculator` | `/en/required-growth-calculator` | 현재값·목표값으로 필요 증가량·달성률 즉시 계산. |
| 22 | 역산 계산기 / Reverse Growth Calculator | `/reverse-growth-calculator` | `/en/reverse-growth-calculator` | 최종 값과 성장률로 원래 값 역산. |
| 23 | CAGR 계산기 / CAGR Calculator | `/cagr-calculator` | `/en/cagr-calculator` | 시작값·종료값·기간으로 CAGR 즉시 계산. |
| 24 | 복리 성장 계산기 / Compound Growth Calculator | `/compound-growth-calculator` | `/en/compound-growth-calculator` | 초기(현재)값·성장률·기간으로 복리 최종값·미래 예측값 즉시 계산. |
| 25 | 광고 예산 페이싱 계산기 / Ad Budget Pacing Calculator | `/ad-budget-pacing-calculator` | `/en/ad-budget-pacing-calculator` | 캠페인 기간 진행률 대비 예산 소진율을 비교해 과다·부족 집행 상태를 즉시 확인. |
| 26 | ROAS 계산기 / ROAS Calculator | `/roas-calculator` | `/en/roas-calculator` | 광고비·매출로 ROAS 즉시 계산. 목표 매출·허용 광고비 역산과 손익분기 ROAS 포함. |
| 27 | CPA 계산기 / CPA Calculator | `/cpa-calculator` | `/en/cpa-calculator` | 광고비·전환 수로 CPA 즉시 계산. 예상 전환 수·필요 예산 역산 포함. |
| 28 | CPC 계산기 / CPC Calculator | `/cpc-calculator` | `/en/cpc-calculator` | 광고비·클릭 수로 CPC 즉시 계산. 예상 클릭 수·필요 예산 역산 포함. |
| 29 | CPM 계산기 / CPM Calculator | `/cpm-calculator` | `/en/cpm-calculator` | 광고비·노출 수로 CPM 즉시 계산. 예상 노출 수·필요 예산 역산 포함. |
| 30 | CTR 계산기 / CTR Calculator | `/ctr-calculator` | `/en/ctr-calculator` | 클릭 수·노출 수로 CTR 즉시 계산. 필요 클릭 수·필요 노출 수 역산 포함. |
| 31 | 퍼널 전환율 계산기 / Funnel Conversion Calculator | `/funnel-conversion-calculator` | `/en/funnel-conversion-calculator` | 마케팅 퍼널 단계별 전환율·이탈률 분석과 목표 달성을 위한 필요 트래픽 역산. |
| 32 | QR 코드 생성기 / QR Code Generator | `/qr-code-generator` | `/en/qr-code-generator` | 링크를 QR 코드로 만들고 색상과 모양을 설정해 PNG·SVG로 다운로드합니다. |
| 33 | QR 코드 읽기 / QR Code Reader | `/qr-code-reader` | `/en/qr-code-reader` | QR 이미지를 붙여넣거나 업로드하고 카메라로 스캔해 링크와 내용을 확인합니다. |
| 34 | PDF 병합 / Merge PDF | `/pdf-merge` | `/en/pdf-merge` | 여러 PDF를 업로드해 원하는 순서로 정렬하고 하나의 PDF로 합칩니다. |
| 35 | PDF 분할 / Split PDF | `/pdf-split` | `/en/pdf-split` | PDF를 모든 페이지 또는 지정한 범위별로 나눠 새 PDF로 만듭니다. |
| 36 | PDF 회전 / Rotate PDF | `/pdf-rotate` | `/en/pdf-rotate` | PDF 전체 또는 선택한 페이지만 90도 단위로 회전해 새 PDF로 저장합니다. |
| 37 | PDF 페이지 삭제 / Delete PDF Pages | `/pdf-page-delete` | `/en/pdf-page-delete` | 필요 없는 페이지를 골라 제거한 새 PDF를 만듭니다. |

## 디렉토리 구조

```
app/
├── layout.tsx              # 루트(KO) 레이아웃 + 폰트 + LangProvider
├── globals.css             # Tailwind v4 @theme 토큰 + 컴포넌트/페이지 CSS
├── page.tsx                # 허브 (/)
├── json-formatter/page.tsx # /json-formatter  (얇은 래퍼: 메타 + JSON-LD + 컴포넌트)
├── css-gradient/page.tsx
├── character-counter/page.tsx
├── en/                     # EN 서브트리 (lang=en 주입)
│   ├── layout.tsx
│   ├── page.tsx            # /en
│   └── <tool>/page.tsx     # /en/<tool>
├── sitemap.ts · robots.ts  # SEO
├── lib/
│   ├── content.ts          # ★ 페이지 콘텐츠 단일 출처 (제목/설명/키워드 KO·EN)
│   └── i18n.tsx            # LangProvider · useT (URL 기반)
└── components/
    ├── Hub.tsx             # 허브 (검색·카테고리·즐겨찾기)
    ├── JsonFormatter.tsx · CssGradient.tsx · CharacterCounter.tsx
    ├── SiteHeader.tsx      # 도구 페이지 공통 헤더
    ├── LangToggle.tsx      # KO/EN 토글 (로케일 URL 이동)
    ├── SetHtmlLang.tsx     # /en 에서 documentElement.lang 보정 (hydration 이후)
    ├── JsonLd.tsx          # 구조화 데이터 주입
    └── useBodyTheme.ts     # 페이지별 body 배경 테마
```

## 개발

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드

npm test                  # 계산 로직 테스트 (node --test + tsx)
npm run validate:content  # indexable 도구 콘텐츠 품질 게이트 (실패 시 exit 1)
```

- 테스트는 `app/lib/**/__tests__/*.test.ts` 를 실행합니다. 계산 검증은 타 계산기와
  총액을 비교하지 않고 **각 항목의 공식 산식**과 요율 상수·적용 기간 경계를 직접 확인합니다.
- 요율·세율처럼 기준일에 따라 바뀌는 데이터는 연도가 아니라 **적용 기간
  (`effectiveFrom`/`effectiveTo`)** 으로 관리합니다 (`app/lib/salary/insurance.ts`).

## 디자인 시스템 메모

- 컬러/폰트 토큰은 스펙의 `@theme` 토큰명(`--color-blue-primary-700` 등)을 그대로 사용
- 레이아웃은 **960px 기준 자동 반응형** (이상 좌우분할 · 미만 상하분할): 토글 없이 시스템 판단
- 모든 도구 페이지에 공통 타이틀+설명+사용 가이드(`.kf-pagehead`): 개별 인입 대비
- 폰트(Pretendard·Inter·JetBrains Mono)는 현재 CDN 로드: 핸드오프 권고대로 추후 로컬 폰트
  (`next/font`)로 교체 권장
