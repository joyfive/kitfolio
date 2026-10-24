# 분류 개편 실행 계획: 직군 필터 → 주제 카테고리 + 작업

작성 2026-10-24 · 상태: **반영 완료** (2026-10-24, Phase 1~6)

## 1. 왜 바꾸는가

현재 분류는 두 축이다.

| 필드 | 값 | 문제 |
|---|---|---|
| `cat` | `dev` · `design` · `text` | 레이아웃(IDE·Canvas·Clean)과 겸용이라 용도를 설명하지 못한다. 연봉·광고 계산기가 전부 "텍스트", PDF·QR이 "디자인"이다. |
| `targets` | PM · 디자이너 · 개발자 등 7종 | 개발자 태그 24개, PM 태그 23개. 35종 중 절반 이상이 같은 칩에 걸려 필터로서 구분력이 없다. |

사용자는 직업이 아니라 **지금 해결할 작업**으로 도구를 찾는다. 분류를 "어떤 문제를 다루는가(카테고리)"와 "그 안에서 무엇을 하려는가(작업)"로 바꾼다.

## 2. 확정 방향

### 2.1 브랜드 중심

| 항목 | 내용 |
|---|---|
| 제품 정의 | 계산·변환·생성·점검에 필요한 작은 웹 도구 모음 |
| 핵심 사용자 | 프로그램을 설치하거나 복잡한 작업을 시작하지 않고, 필요한 결과를 바로 얻으려는 사람 |
| 제공 가치 | 찾기 쉽고, 사용이 짧고, 결과를 바로 활용할 수 있음 |
| 브랜드 메시지 방향 | 필요한 도구를 찾아, 하던 일을 계속하세요. |

PM·디자이너 같은 직군은 개별 도구의 사용 사례(`content.aeo.who`, FAQ)에서만 다룬다. 서비스 전체 타깃을 직군 목록으로 정의하지 않는다.

### 2.2 탐색 화면에 노출하는 값

- **노출**: 주제 카테고리 8개(1단 칩) · 작업 태그 7종(2단 칩) · 검색 · 즐겨찾기
- **제외**: 직군(PM·직장인 등), 화면 테마(Clean·IDE·Canvas)
- **적용 범위·검증 정보**(한국 기준 · 2026년 적용 · WCAG 2.2 등)는 탐색 태그가 아니라 도구 상세의 범위·검증 표시로 둔다.
- **화면 템플릿(layout)은 분류에 종속시키지 않는다.** 같은 코드·웹 안에서도 그라디언트는 미리보기, JSON은 편집기가 필요하다. `layout` 은 내부 필드로 남는다.

### 2.3 주제 카테고리 8개 (도구당 정확히 1개)

| 순서 | id | KO 라벨 | EN 라벨 | 정의 |
|---|---|---|---|---|
| 1 | `docs-images` | 문서·이미지 | Docs & Images | 글·문서·이미지 파일을 확인하고 가공 |
| 2 | `qr` | QR 코드 | QR Codes | QR 코드를 만들고 읽기 |
| 3 | `date-time` | 날짜·시간 | Date & Time | 시각·시간대·시간량·달력 날짜를 변환하고 계산 |
| 4 | `work-leave` | 근무·휴가 | Work Hours & Leave | 근무시간과 연차 일수를 계산 |
| 5 | `pay-tax` | 급여·세금 | Pay & Tax | 소득에서 받거나 내야 할 금액을 계산 |
| 6 | `ads-growth` | 광고·성과 | Ads & Growth | 성과의 변화·효율·목표 달성 가능성을 계산 |
| 7 | `code-web` | 코드·웹 제작 | Code & Web | 코드·웹 화면·서비스 연동에 쓸 결과물을 작성·변환 |
| 8 | `accessibility` | 웹 접근성 | Web Accessibility | 다양한 사용자가 웹 콘텐츠를 이용할 수 있는지 점검 |

> 초안의 6개 안(시간·일정 통합, QR을 문서·이미지에 포함)은 위 8개 안으로 대체한다. QR은 도구가 2개뿐이지만 이름만 보고 찾을 수 있으므로 독립 분류로 둔다.

### 2.4 작업 태그 7종 (2단 칩 · 도구당 대표 1개 + 보조 최대 2개)

| id | 라벨 | 정의 |
|---|---|---|
| `calculate` | 계산 | 입력 조건으로 수치·날짜를 산출 |
| `convert` | 변환 | 같은 정보를 다른 형식·단위로 변경 |
| `generate` | 생성 | 입력이나 설정으로 새 결과물을 작성 |
| `edit` | 편집 | 기존 내용의 구성·크기·표현을 변경 |
| `check` | 검사 | 기준 충족 여부와 문제를 확인 |
| `analyze` | 분석 | 관계·차이·효율을 해석 |
| `read` | 읽기 | 인코딩되거나 바로 읽기 어려운 내용을 추출 |

- 허브에서 카테고리(1단)를 고르면, 그 카테고리 도구가 실제로 가진 작업 태그만 2단 칩으로 보인다 (빈 칩 없음).
- 2단 필터는 대표·보조 작업을 모두 본다. 카드에는 대표 작업 1개만 보인다.
- 모든 계산기에 `analyze` 를 붙이는 식으로 넓히지 않는다. 넓히면 2단 칩의 구분력이 사라진다.
- 초안의 "카테고리별 작업"(용량 줄이기·받을 금액 계산 등)은 채택하지 않았다. 그 의도는 `searchTerms` 가 맡는다.

### 2.5 depth 구분 스타일

| depth | 허브 칩 | 카드 태그 |
|---|---|---|
| 1단 주제 카테고리 | 둥근 pill · 실선 · 활성 시 primary 채움 | `.cat-tag` 둥근 pill · primary-100 채움 |
| 2단 작업 태그 | 작은 사각(6px) · 점선 · 활성 시 primary-100 + 실선 | `.action-tag` 작은 사각 · 회색 테두리 |

### 2.5.1 도구명 병기

KO 화면은 국문명이 메인·영문명이 보조, EN 화면은 영문명이 메인·국문명이 보조다. 허브 카드 · 관련 도구 · 블로그 관련 도구 · 도구 상세 h1 모두 `toolNames(tool, lang)` 하나로 통일한다. 보조 이름에는 `lang` 속성을 붙인다.

### 2.6 검색어 (`searchTerms`)

도구명·SEO 키워드와 별도로, 사용자가 작업으로 입력하는 말을 등록한다. 화면에 태그로 노출하지 않고 허브 검색 색인에만 쓴다.
예: PDF 도구 → "계약서 합치기", "PDF 한 장만 빼기" · 이미지 최적화 → "사진 용량 줄이기".

## 3. 35종 배치표

| 도구 | slug | 카테고리 | 작업 태그 (대표 · 보조) | 검색어 예 |
|---|---|---|---|---|
| 글자 수·단어 수 카운터 | `character-counter` | 문서·이미지 | 계산 | 자소서 글자 수, 공백 제외 |
| PDF 도구 | `pdf-tools` | 문서·이미지 | 편집 | 계약서 합치기, PDF 나누기, 페이지 삭제 |
| 이미지 최적화 | `image-optimizer` | 문서·이미지 | 편집 · 변환 | 사진 용량 줄이기, WebP 변환 |
| 이미지 리사이즈·크롭 | `image-resizer-cropper` | 문서·이미지 | 편집 | 프로필 사진 자르기, 1:1 비율 |
| QR 코드 생성기 | `qr-code-generator` | QR 코드 | 생성 | 링크 QR 만들기, 명함 QR |
| QR 코드 읽기 | `qr-code-reader` | QR 코드 | 읽기 | 사진 속 QR 읽기, 카메라 스캔 |
| KST UTC 변환기 | `kst-utc-converter` | 날짜·시간 | 변환 | 한국 시간, 서버 로그 시간 |
| 슬랙 타임스탬프 변환기 | `slack-timestamp-converter` | 날짜·시간 | 변환 · 생성 | 유닉스 시간, 슬랙 날짜 표시 |
| 시간 더하기 빼기 계산기 | `time-calculator` | 날짜·시간 | 계산 | 근무시간 합계, 청구 시간 |
| 시간 단위 변환기 | `time-converter` | 날짜·시간 | 변환 | 시간을 일로, 주 단위 |
| 음력 양력 변환기 | `lunar-solar-converter` | 날짜·시간 | 변환 | 음력 생일, 띠 |
| 유연근무 잔여시간 계산기 | `flex-work-calculator` | 근무·휴가 | 계산 | 이번 달 남은 근무시간 |
| 연차 계산기 | `annual-leave-calculator` | 근무·휴가 | 계산 | 연차 발생일, 연차 소멸, 퇴사 연차 |
| 연봉 실수령액 계산기 | `salary-calculator` | 급여·세금 | 계산 | 월급 실수령, 세후 연봉 |
| 퇴직금 계산기 | `severance-pay-calculator` | 급여·세금 | 계산 | 퇴직금 얼마, 평균임금 |
| 프리랜서 3.3% 계산기 | `freelancer-tax-calculator` | 급여·세금 | 계산 | 외주비 실수령, 원천징수 |
| 종합소득세 계산기 | `income-tax-calculator` | 급여·세금 | 계산 | 5월 환급, 경비율 |
| 부가세 계산기 | `vat-calculator` | 급여·세금 | 계산 | 공급가액 역산, 간이과세 |
| 실업급여 계산기 | `unemployment-benefit-calculator` | 급여·세금 | 계산 | 구직급여 얼마, 신청 마감 |
| 광고 지표 계산기 | `ad-metrics-calculator` | 광고·성과 | 계산 | ROAS, CPA, CTR |
| 광고 예산 페이싱 계산기 | `ad-budget-pacing-calculator` | 광고·성과 | 분석 · 계산 | 예산 소진 속도, 일 예산 |
| 퍼널 전환율 계산기 | `funnel-conversion-calculator` | 광고·성과 | 분석 | 단계별 이탈률 |
| 성장률 계산기 | `growth-rate-calculator` | 광고·성과 | 계산 | 전월 대비, YoY |
| CAGR 계산기 | `cagr-calculator` | 광고·성과 | 계산 | 연평균 성장률, 미래 예측 |
| JSON 포매터 | `json-formatter` | 코드·웹 제작 | 편집 · 검사 | JSON 들여쓰기, 압축, 문법 오류 |
| 슬랙 메시지 빌더 | `slack-message-builder` | 코드·웹 제작 | 생성 · 변환 | Block Kit, 봇 메시지 |
| CSS 단위 변환기 | `css-unit-converter` | 코드·웹 제작 | 변환 | rem px |
| 그라디언트 생성기 | `css-gradient` | 코드·웹 제작 | 생성 | 배경 그라디언트 |
| Tailwind 팔레트 생성기 | `tailwind-palette-generator` | 코드·웹 제작 | 생성 | 브랜드 색 팔레트 |
| OG 미리보기 테스트 | `open-graph-preview` | 코드·웹 제작 | 검사 | 카톡 링크 미리보기, 썸네일 |
| HTML 접근성 검사기 | `html-accessibility-checker` | 웹 접근성 | 검사 | alt 누락, label, 헤딩 순서 |
| 명도대비 검사기 | `color-contrast-checker` | 웹 접근성 | 검사 | 글자색 대비, 4.5:1 |
| 색각이상 시뮬레이터 | `color-blindness-simulator` | 웹 접근성 | 검사 | 적록색약 보기 |
| 텍스트 확대·간격 검사기 | `text-scaling-checker` | 웹 접근성 | 검사 | 200% 확대, 줄 간격 |
| 웹접근성 체크리스트 빌더 | `accessibility-checklist` | 웹 접근성 | 생성 · 검사 | KWCAG, 접근성 점검표 |

카테고리별 도구 수: 문서·이미지 4 · QR 2 · 날짜·시간 5 · 근무·휴가 2 · 급여·세금 6 · 광고·성과 5 · 코드·웹 제작 6 · 웹 접근성 5 = 35.

판단이 갈린 배치:
- **슬랙 타임스탬프 → 날짜·시간**: 결과물이 슬랙용 문자열이어도 다루는 문제는 시각 변환이다.
- **CSS 도구 → 코드·웹 제작**, **명도대비·색각이상 → 웹 접근성**: 색을 다루는 건 같지만, 앞은 결과물을 만들고 뒤는 기준 충족을 점검한다.
- **OG 미리보기 → 코드·웹 제작**: 마케팅에서도 쓰지만 확인 대상은 페이지 메타 태그다. 광고·성과 도구에서는 관련 도구로 연결한다.
- **연차 → 근무·휴가, 퇴직금 → 급여·세금**: 결과가 일수인가 금액인가로 나눈다. 두 도구와 실업급여는 "퇴사할 때 확인할 도구"로 `relatedTools` 를 서로 연결한다.

## 4. 레지스트리 스키마 (반영됨)

```ts
type CategoryId = "docs-images" | "qr" | "date-time" | "work-leave"
  | "pay-tax" | "ads-growth" | "code-web" | "accessibility";
type ActionId = "calculate" | "convert" | "generate" | "edit" | "check" | "analyze" | "read";

CATEGORIES: { id, label: { ko, en }, appCategory }[]   // 허브 1단 칩 순서 = 배열 순서
ACTIONS:    { id, label: { ko, en } }[]                // 허브 2단 칩 순서

type Tool = {
  category: CategoryId;                        // 정확히 1개
  actions: [ActionId, ...];                    // 1~3개, 첫 값이 대표
  searchTerms: { ko: string[]; en: string[] }; // 2개 이상씩, 화면 미노출
  scope?: { ko: string; en: string };          // 상세 eyebrow 의 적용 범위
  layout: "card" | "ide" | "canvas";           // 화면 템플릿 · 분류와 무관
  // 제거됨: cat, targets, badge, CATS, TARGET_LABELS, TargetTag, LAYOUT_LABEL
};
```

헬퍼: `categoryOf` · `actionOf` · `toolNames` · `categoryHref` · `validateTaxonomy` (모두 `app/lib/content.ts`).
`applicationCategory`: 문서·이미지 · QR · 날짜·시간 → UtilitiesApplication / 근무·휴가 · 광고·성과 → BusinessApplication / 급여·세금 → FinanceApplication / 코드·웹 · 접근성 → DeveloperApplication.

## 5. 실행 단계

| Phase | 내용 | 상태 |
|---|---|---|
| 0 | 결정 확정 (8번) | 완료 |
| 1 | 타입 · `CATEGORIES` · `ACTIONS` · `validateTaxonomy()` · `taxonomy.test.ts` | 완료 |
| 2 | 35종 `category` · `actions` · `searchTerms` · `scope` 입력, `cat`·`targets`·`badge` 제거 | 완료 |
| 3 | 허브: 1단 카테고리 칩 · 2단 작업 칩 · `?cat=&action=` 동기화 · 단어 단위 검색 · 카드 태그 · 카테고리 순 정렬 | 완료 |
| 4 | 상세: eyebrow = 카테고리 링크 · 적용 범위, h1 = 페이지 언어 메인 | 완료 |
| 5 | `applicationCategory` 를 카테고리에서 도출, 미사용 i18n·CSS 정리 | 완료 |
| 6 | 허브·소개 카피 새 브랜드 메시지, CLAUDE.md · PROJECT_CONTEXT · 스킬 갱신 | 완료 |
| 7 | 배포 후 확인: 대표 흐름 · 검색 · 모바일 칩 | 배포 후 |
| 2 | 퇴사 묶음 `relatedTools`: 퇴직금 ↔ 연차 ↔ 실업급여 서로 연결 | 완료 |

확인할 흐름 (배포 후):
- 문서·이미지 → 편집 → PDF 도구 · 이미지 최적화 · 리사이즈·크롭
- 급여·세금 → 계산 → 연봉 · 퇴직금 · 프리랜서 · 종소세 · 부가세 · 실업급여
- 웹 접근성 → 검사 → HTML 접근성 · 명도대비 · 색각이상 · 텍스트 확대 · 체크리스트
- 검색 "계약서 합치기" → PDF 도구, "사진 용량 줄이기" → 이미지 최적화 (단어 단위 일치)

## 6. 영향 범위

| 파일 | 변경 |
|---|---|
| `app/lib/content.ts` | 타입 · `CATEGORIES` · 35종 데이터 · JSON-LD · 허브 카피 |
| `app/components/Hub.tsx` | 필터 구조 전면 교체 |
| `app/components/PageHead.tsx` | eyebrow |
| `app/lib/i18n.tsx` | 미사용 nav 키 제거 |
| `app/globals.css` | 허브 칩·카드 태그 |
| `app/lib/__tests__/taxonomy.test.ts` | 신규 |
| `CLAUDE.md` · `docs/ai/*` · `.claude/skills/*` | 문서 |

URL · sitemap · canonical · 도구 페이지 h1 · `indexable` 은 바뀌지 않는다.

## 7. 위험과 대응

- **허브 검색 회귀**: `seo.keywords` 는 그대로 색인에 남기고 `searchTerms` 를 더하므로 기존 검색어는 계속 맞는다.
- **즐겨찾기**: `localStorage` 키(`kitfolio-favs`)와 slug 기반이라 영향 없음.
- **빈 작업 칩**: Phase 1 테스트가 막는다. 도구를 비공개(`ready: false`)로 돌려 작업이 비면 테스트가 실패하므로 그때 작업 목록을 함께 정리한다.
- **카테고리 남발**: 새 카테고리는 스킬 절차상 사용자 승인 없이 추가하지 않는다.

## 8. 결정 기록 (2026-10-24)

1. 영문 브랜드 메시지: "Find the tool. Get back to work." 채택.
2. 카드에 대표 작업 태그 표시: 채택.
3. 작업 태그 7종: 허브 2단 칩으로 노출 (카테고리별 작업 목록은 쓰지 않음). 1단·2단은 칩 스타일로 구분.
4. 도구명: KO·EN 모두 병기하고 페이지 언어 이름이 메인. 리스트·상세 통일 (h1 포함).
5. 슬랙 타임스탬프 대표 작업: 변환.
