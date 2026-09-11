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

## 구현된 기능 (도구 24종)

각 도구는 KO(루트)·EN(`/en`) 양 언어로 서버 렌더되며, 메타데이터·JSON-LD·OG·FAQ/AEO를
`app/lib/content.ts` 레지스트리에서 단일 출처로 관리합니다. 허브(`/`, `/en`)는 전체 도구의
검색·필터·디스커버리 진입점입니다.

| No | 기능명 | KO 경로 | EN 경로 | 기능 요약 |
|---|---|---|---|---|
| 1 | JSON 포매터 / JSON Formatter | `/json-formatter` | `/en/json-formatter` | JSON 문자열을 들여쓰기·색상 강조로 포맷팅. 문법 오류 감지와 유효성 검사 포함. |
| 2 | 슬랙 타임스탬프 변환기 / Slack Timestamp Converter | `/slack-timestamp-converter` | `/en/slack-timestamp-converter` | Unix 타임스탬프 ↔ 날짜 ↔ Slack date 구문 양방향 변환. 현재 타임스탬프 실시간 표시. |
| 3 | CSS 단위 변환기 / CSS Unit Converter | `/css-unit-converter` | `/en/css-unit-converter` | rem·em·vw·%·ms를 px(또는 초)로 즉시 변환. CSS 단위 변환 5종을 한 곳에서. |
| 4 | HTML 접근성 검사기 / HTML Accessibility Checker | `/html-accessibility-checker` | `/en/html-accessibility-checker` | HTML을 붙여넣어 헤딩·랜드마크·alt·label·탭 순서를 정적으로 점검하고 수정 위치를 확인합니다. |
| 5 | 그라디언트 생성기 / CSS Gradient | `/css-gradient` | `/en/css-gradient` | linear·radial·conic 그라디언트를 시각적으로 편집하고 CSS 코드를 즉시 복사. |
| 6 | Tailwind 팔레트 생성기 / Tailwind Palette | `/tailwind-palette-generator` | `/en/tailwind-palette-generator` | 베이스 HEX 하나로 Tailwind용 11단계 팔레트(50~950)를 만들고 코드로 복사. |
| 7 | OG 미리보기 테스트 / Open Graph Preview Tester | `/open-graph-preview` | `/en/open-graph-preview` | OG 이미지와 제목·설명이 주요 플랫폼에서 어떻게 보이는지 비교합니다. |
| 8 | 명도대비 검사기 / Color Contrast Checker | `/color-contrast-checker` | `/en/color-contrast-checker` | 전경색·배경색의 WCAG 명도대비를 검사하고, 미달하면 통과하는 색상 후보를 제안합니다. |
| 9 | 색각이상 시뮬레이터 / Color Blindness Simulator | `/color-blindness-simulator` | `/en/color-blindness-simulator` | 시안·스크린샷을 색각 조건별로 변환해 색상에만 의존한 구분을 찾습니다. |
| 10 | 글자 수·단어 수 카운터 / Character Counter | `/character-counter` | `/en/character-counter` | 글자·단어·문장·줄 수를 실시간 집계. SNS 글자 수 제한 안내 포함. |
| 11 | 연봉 실수령액 계산기 / Salary Net Pay Calculator | `/salary-calculator` | `/en/salary-calculator` | 세전 연봉·월급으로 4대보험·세금을 뺀 예상 실수령액과 공제 내역을 즉시 계산. |
| 12 | 퇴직금 계산기 / Severance Pay Calculator | `/severance-pay-calculator` | `/en/severance-pay-calculator` | 입사일과 퇴직 전 3개월 임금으로 1일 평균임금과 예상 퇴직금(세전)을 계산. |
| 13 | 유연근무 잔여시간 계산기 / Flex Work Calculator | `/flex-work-calculator` | `/en/flex-work-calculator` | 유연근무 목표·남은 근무시간과 하루 평균 필요시간을 계산. 휴가 차감·공휴일 반영. |
| 14 | 시간 더하기 빼기 계산기 / Time Calculator | `/time-calculator` | `/en/time-calculator` | 시간 블록을 자유롭게 더하고 빼서 총 근무시간 계산. 타임시트·청구 시간에 유용. |
| 15 | 시간 단위 변환기 / Time Converter | `/time-converter` | `/en/time-converter` | 시간·일·주·월·년 단위 즉시 변환. 근무 기준(8h/일)과 캘린더 기준 선택 가능. |
| 16 | 음력 양력 변환기 / Lunar-Solar Converter | `/lunar-solar-converter` | `/en/lunar-solar-converter` | 양력 ↔ 음력 날짜를 즉시 변환. 1901~2100년 범위, 윤달·갑자·띠 정보 포함. |
| 17 | 성장률 계산기 / Growth Rate Calculator | `/growth-rate-calculator` | `/en/growth-rate-calculator` | 이전값·현재값으로 성장률·MoM·YoY 계산. 목표 성장률·필요 증가량·역산·퍼센트 차이도 탭 전환으로. |
| 18 | CAGR 계산기 / CAGR Calculator | `/cagr-calculator` | `/en/cagr-calculator` | 시작값·종료값·기간으로 CAGR 즉시 계산. 탭 전환으로 복리 최종값·미래 예측값도. |
| 19 | 광고 예산 페이싱 계산기 / Ad Budget Pacing Calculator | `/ad-budget-pacing-calculator` | `/en/ad-budget-pacing-calculator` | 캠페인 기간 진행률 대비 예산 소진율을 비교해 과다·부족 집행 상태를 즉시 확인. |
| 20 | 광고 지표 계산기 / Ad Metrics Calculator | `/ad-metrics-calculator` | `/en/ad-metrics-calculator` | ROAS·CPA·CPC·CPM·CTR을 탭 전환으로 즉시 계산. 역산 모드로 목표 매출·예상 전환·필요 예산까지. |
| 21 | 퍼널 전환율 계산기 / Funnel Conversion Calculator | `/funnel-conversion-calculator` | `/en/funnel-conversion-calculator` | 마케팅 퍼널 단계별 전환율·이탈률 분석과 목표 달성을 위한 필요 트래픽 역산. |
| 22 | QR 코드 생성기 / QR Code Generator | `/qr-code-generator` | `/en/qr-code-generator` | 링크를 QR 코드로 만들고 색상과 모양을 설정해 PNG·SVG로 다운로드합니다. |
| 23 | QR 코드 읽기 / QR Code Reader | `/qr-code-reader` | `/en/qr-code-reader` | QR 이미지를 붙여넣거나 업로드하고 카메라로 스캔해 링크와 내용을 확인합니다. |
| 24 | PDF 도구 / PDF Tools | `/pdf-tools` | `/en/pdf-tools` | PDF 병합·분할·회전·페이지 삭제를 탭 전환으로. 모든 처리는 브라우저 안에서. |

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
