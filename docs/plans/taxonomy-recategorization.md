# 분류 개편 실행 계획: 직군 필터 → 주제 카테고리 + 작업

작성 2026-10-24 · 상태: 계획 (코드 미반영)

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

- **노출**: 주제 카테고리 8개 · 카테고리별 작업 · 검색 · 즐겨찾기
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

### 2.4 카테고리별 작업 (도구당 1~2개, 첫 값이 대표)

| 카테고리 | 작업 id: KO 라벨 |
|---|---|
| 문서·이미지 | `count`: 글자 수 확인 · `pdf`: PDF 편집 · `compress`: 용량 줄이기 · `resize`: 크기 조절·자르기 |
| QR 코드 | `make`: 만들기 · `read`: 읽기 |
| 날짜·시간 | `timezone`: 시간대 변환 · `time-math`: 시간 계산 · `date-convert`: 날짜 변환 |
| 근무·휴가 | `hours`: 근무시간 계산 · `leave`: 연차 확인 |
| 급여·세금 | `take-home`: 받을 금액 계산 · `tax`: 세금 계산 · `benefit`: 환급·지원 확인 |
| 광고·성과 | `ad-efficiency`: 광고 효율 · `budget`: 예산 관리 · `conversion`: 전환 분석 · `growth`: 성장 분석 |
| 코드·웹 제작 | `data`: 데이터 정리 · `message`: 메시지 작성 · `css-color`: CSS·색상 · `share-preview`: 공유 미리보기 |
| 웹 접근성 | `structure`: 구조·레이블 · `color`: 색상 · `text`: 텍스트 · `checklist`: 종합 체크리스트 |

작업 칩은 카테고리를 고른 뒤에만 보이고, 그 카테고리 안의 작업만 보인다. 모든 페이지에 같은 계산·생성 태그를 붙이지 않는다.

### 2.5 작업 유형 7종 (내부 메타데이터)

작업 유형은 "무엇을 하는 도구인가"를 사이트 전체에서 같은 말로 기록하는 내부 값이다. 허브 필터로는 쓰지 않고(카테고리별 작업이 그 역할을 한다) 분류 일관성 검사·분석·JSON-LD 보조에 쓴다.

| id | 라벨 | 정의 |
|---|---|---|
| `calculate` | 계산 | 입력 조건으로 수치·날짜를 산출 |
| `convert` | 변환 | 같은 정보를 다른 형식·단위로 변경 |
| `generate` | 생성 | 입력이나 설정으로 새 결과물을 작성 |
| `edit` | 편집 | 기존 내용의 구성·크기·표현을 변경 |
| `check` | 검사 | 기준 충족 여부와 문제를 확인 |
| `analyze` | 분석 | 관계·차이·효율을 해석 |
| `read` | 읽기 | 인코딩되거나 바로 읽기 어려운 내용을 추출 |

대표 1개 + 보조 최대 2개. 모든 계산기에 `analyze` 를 붙이는 식으로 넓히지 않는다.

### 2.6 검색어 (`searchTerms`)

도구명·SEO 키워드와 별도로, 사용자가 작업으로 입력하는 말을 등록한다. 화면에 태그로 노출하지 않고 허브 검색 색인에만 쓴다.
예: PDF 도구 → "계약서 합치기", "PDF 한 장만 빼기" · 이미지 최적화 → "사진 용량 줄이기".

## 3. 35종 배치표

| 도구 | slug | 카테고리 | 작업(대표, 보조) | 작업 유형 | 검색어 예 |
|---|---|---|---|---|---|
| 글자 수·단어 수 카운터 | `character-counter` | 문서·이미지 | 글자 수 확인 | 계산 | 자소서 글자 수, 공백 제외 |
| PDF 도구 | `pdf-tools` | 문서·이미지 | PDF 편집 | 편집 | 계약서 합치기, PDF 나누기, 페이지 삭제 |
| 이미지 최적화 | `image-optimizer` | 문서·이미지 | 용량 줄이기 | 편집 · 변환 | 사진 용량 줄이기, WebP 변환 |
| 이미지 리사이즈·크롭 | `image-resizer-cropper` | 문서·이미지 | 크기 조절·자르기 | 편집 | 프로필 사진 자르기, 1:1 비율 |
| QR 코드 생성기 | `qr-code-generator` | QR 코드 | 만들기 | 생성 | 링크 QR 만들기, 명함 QR |
| QR 코드 읽기 | `qr-code-reader` | QR 코드 | 읽기 | 읽기 | 사진 속 QR 읽기, 카메라 스캔 |
| KST UTC 변환기 | `kst-utc-converter` | 날짜·시간 | 시간대 변환 | 변환 | 한국 시간, 서버 로그 시간 |
| 슬랙 타임스탬프 변환기 | `slack-timestamp-converter` | 날짜·시간 | 시간대 변환, 날짜 변환 | 변환 · 생성 | 유닉스 시간, 슬랙 날짜 표시 |
| 시간 더하기 빼기 계산기 | `time-calculator` | 날짜·시간 | 시간 계산 | 계산 | 근무시간 합계, 청구 시간 |
| 시간 단위 변환기 | `time-converter` | 날짜·시간 | 시간 계산 | 변환 | 시간을 일로, 주 단위 |
| 음력 양력 변환기 | `lunar-solar-converter` | 날짜·시간 | 날짜 변환 | 변환 | 음력 생일, 띠 |
| 유연근무 잔여시간 계산기 | `flex-work-calculator` | 근무·휴가 | 근무시간 계산 | 계산 | 이번 달 남은 근무시간 |
| 연차 계산기 | `annual-leave-calculator` | 근무·휴가 | 연차 확인 | 계산 | 연차 발생일, 연차 소멸, 퇴사 연차 |
| 연봉 실수령액 계산기 | `salary-calculator` | 급여·세금 | 받을 금액 계산 | 계산 | 월급 실수령, 세후 연봉 |
| 퇴직금 계산기 | `severance-pay-calculator` | 급여·세금 | 받을 금액 계산 | 계산 | 퇴직금 얼마, 평균임금 |
| 프리랜서 3.3% 계산기 | `freelancer-tax-calculator` | 급여·세금 | 받을 금액 계산, 세금 계산 | 계산 | 외주비 실수령, 원천징수 |
| 종합소득세 계산기 | `income-tax-calculator` | 급여·세금 | 세금 계산, 환급·지원 확인 | 계산 | 5월 환급, 경비율 |
| 부가세 계산기 | `vat-calculator` | 급여·세금 | 세금 계산 | 계산 | 공급가액 역산, 간이과세 |
| 실업급여 계산기 | `unemployment-benefit-calculator` | 급여·세금 | 환급·지원 확인, 받을 금액 계산 | 계산 | 구직급여 얼마, 신청 마감 |
| 광고 지표 계산기 | `ad-metrics-calculator` | 광고·성과 | 광고 효율 | 계산 | ROAS, CPA, CTR |
| 광고 예산 페이싱 계산기 | `ad-budget-pacing-calculator` | 광고·성과 | 예산 관리 | 분석 · 계산 | 예산 소진 속도, 일 예산 |
| 퍼널 전환율 계산기 | `funnel-conversion-calculator` | 광고·성과 | 전환 분석 | 분석 | 단계별 이탈률 |
| 성장률 계산기 | `growth-rate-calculator` | 광고·성과 | 성장 분석 | 계산 | 전월 대비, YoY |
| CAGR 계산기 | `cagr-calculator` | 광고·성과 | 성장 분석 | 계산 | 연평균 성장률, 미래 예측 |
| JSON 포매터 | `json-formatter` | 코드·웹 제작 | 데이터 정리 | 편집 · 검사 | JSON 들여쓰기, 압축, 문법 오류 |
| 슬랙 메시지 빌더 | `slack-message-builder` | 코드·웹 제작 | 메시지 작성 | 생성 · 변환 | Block Kit, 봇 메시지 |
| CSS 단위 변환기 | `css-unit-converter` | 코드·웹 제작 | CSS·색상 | 변환 | rem px |
| 그라디언트 생성기 | `css-gradient` | 코드·웹 제작 | CSS·색상 | 생성 | 배경 그라디언트 |
| Tailwind 팔레트 생성기 | `tailwind-palette-generator` | 코드·웹 제작 | CSS·색상 | 생성 | 브랜드 색 팔레트 |
| OG 미리보기 테스트 | `open-graph-preview` | 코드·웹 제작 | 공유 미리보기 | 검사 | 카톡 링크 미리보기, 썸네일 |
| HTML 접근성 검사기 | `html-accessibility-checker` | 웹 접근성 | 구조·레이블 | 검사 | alt 누락, label, 헤딩 순서 |
| 명도대비 검사기 | `color-contrast-checker` | 웹 접근성 | 색상 | 검사 | 글자색 대비, 4.5:1 |
| 색각이상 시뮬레이터 | `color-blindness-simulator` | 웹 접근성 | 색상 | 검사 | 적록색약 보기 |
| 텍스트 확대·간격 검사기 | `text-scaling-checker` | 웹 접근성 | 텍스트 | 검사 | 200% 확대, 줄 간격 |
| 웹접근성 체크리스트 빌더 | `accessibility-checklist` | 웹 접근성 | 종합 체크리스트 | 생성 · 검사 | KWCAG, 접근성 점검표 |

카테고리별 도구 수: 문서·이미지 4 · QR 2 · 날짜·시간 5 · 근무·휴가 2 · 급여·세금 6 · 광고·성과 5 · 코드·웹 제작 6 · 웹 접근성 5 = 35.

판단이 갈린 배치:
- **슬랙 타임스탬프 → 날짜·시간**: 결과물이 슬랙용 문자열이어도 다루는 문제는 시각 변환이다.
- **CSS 도구 → 코드·웹 제작**, **명도대비·색각이상 → 웹 접근성**: 색을 다루는 건 같지만, 앞은 결과물을 만들고 뒤는 기준 충족을 점검한다.
- **OG 미리보기 → 코드·웹 제작**: 마케팅에서도 쓰지만 확인 대상은 페이지 메타 태그다. 광고·성과 도구에서는 관련 도구로 연결한다.
- **연차 → 근무·휴가, 퇴직금 → 급여·세금**: 결과가 일수인가 금액인가로 나눈다. 두 도구와 실업급여는 "퇴사할 때 확인할 도구"로 `relatedTools` 를 서로 연결한다.

## 4. 레지스트리 스키마 변경

```ts
type CategoryId =
  | "docs-images" | "qr" | "date-time" | "work-leave"
  | "pay-tax" | "ads-growth" | "code-web" | "accessibility";

type Action = "calculate" | "convert" | "generate" | "edit" | "check" | "analyze" | "read";

// 카테고리 정의: 라벨·설명·작업 목록의 단일 출처
export const CATEGORIES: {
  id: CategoryId;
  label: { ko: string; en: string };
  summary: { ko: string; en: string };       // 허브 카테고리 설명 한 줄
  tasks: { id: string; label: { ko: string; en: string } }[];
  appCategory: string;                         // JSON-LD applicationCategory
}[];

type Tool = {
  // 추가
  category: CategoryId;
  tasks: [string] | [string, string];          // CATEGORIES[category].tasks 의 id, 첫 값이 대표
  actions: [Action] | [Action, Action] | [Action, Action, Action];  // 대표 + 보조 최대 2
  searchTerms: { ko: string[]; en: string[] }; // 화면 미노출 · 허브 검색 전용
  scope?: { ko: string; en: string };          // 적용 범위 한 줄 (예: "한국 기준 · 2026년 적용")
  // 제거
  // cat, targets, badge  (TargetTag · TARGET_LABELS · CATS 도 제거)
  // 유지
  // layout: 화면 템플릿 · 분류와 무관
};
```

`applicationCategory` 매핑(초안): `code-web` → DeveloperApplication · `accessibility` → DeveloperApplication · `ads-growth` · `pay-tax` → FinanceApplication · 나머지 → UtilitiesApplication.

## 5. 실행 단계

각 단계는 독립 커밋으로 끊어 `npm test` · `npm run validate:content` · `npx tsc --noEmit` 를 통과시킨 뒤 다음으로 간다.

### Phase 0: 결정 확정 (코드 변경 없음)
- [ ] 8번 "남은 결정" 항목 답변 받기

### Phase 1: 스키마 + 검증
- [ ] `content.ts` 에 `CategoryId` · `Action` · `CATEGORIES` 추가
- [ ] `Tool` 에 `category` · `tasks` · `actions` · `searchTerms` · `scope?` 추가 (이 단계에선 기존 `cat`·`targets`·`badge` 유지: 병행 기간)
- [ ] `validateTaxonomy()` 와 테스트 `app/lib/__tests__/taxonomy.test.ts`
  - 도구마다 카테고리 정확히 1개, `tasks` 1~2개이고 모두 해당 카테고리 작업
  - `actions` 1~3개, 중복 없음
  - 모든 카테고리에 ready 도구 1개 이상, 모든 작업에 ready 도구 1개 이상 (빈 칩 금지)
  - `searchTerms` ko·en 각 2개 이상

### Phase 2: 데이터 이관
- [ ] 3번 배치표대로 35종에 새 필드 입력
- [ ] 퇴사 묶음 `relatedTools` 정리: 퇴직금 ↔ 연차 ↔ 실업급여
- [ ] `scope` 입력: 한국 기준 계산기(연봉·퇴직금·3.3%·종소세·부가세·실업급여·연차), WCAG 도구 5종

### Phase 3: 허브 탐색 UI (`Hub.tsx`)
- [ ] 직군 칩 제거 → 카테고리 칩 `전체 + 8개` (데스크톱 · 모바일 스티키 바 공통)
- [ ] 카테고리 선택 시 그 카테고리의 작업 칩 행 표시, 선택 시 한 번 더 좁힘
- [ ] 상태는 쿼리스트링 `/?cat=pay-tax&task=take-home` (경로 카테고리 URL 금지 원칙 유지, canonical 은 `/`)
- [ ] 검색 색인에 `searchTerms` 추가
- [ ] 카드: KO 페이지는 한국어 도구명을 주 표기로, 한 줄 설명, 대표 작업 라벨. 직군 태그 제거
- [ ] 기존 `/?target=` 진입은 무시(전체 표시)

### Phase 4: 도구 상세 (`PageHead`)
- [ ] eyebrow `카테고리 · 테마(Clean SaaS)` → `카테고리 링크(/?cat=…) · scope`
- [ ] h1 은 이번 범위에서 바꾸지 않는다 (SEO 영향 분리)
- [ ] Related Tools 는 기존 유지 (다음 작업에 필요한 도구 연결)

### Phase 5: 구조화 데이터 · 정리
- [ ] `toolJsonLd` 의 `applicationCategory` 를 `CATEGORIES[].appCategory` 에서 도출
- [ ] `cat` · `targets` · `badge` · `CATS` · `TARGET_LABELS` · `TargetTag` · i18n `nav.dev/design/text` 제거
- [ ] 허브 CSS 의 `.target-tag` · `.hub-targets` 정리

### Phase 6: 문서 · 브랜드 카피
- [ ] `CLAUDE.md`: 제품 방향(브랜드 포지셔닝·타겟 유저), 테마 분기표("카테고리별 테마" 삭제), 공통 헤더 구조, 레지스트리 스키마, 구현 목록 표에 카테고리 열
- [ ] `docs/ai/PROJECT_CONTEXT.md` 영문 동기화
- [ ] 허브 카피(`HUB.seo` · `hero` · `about`)를 새 브랜드 메시지로
- [ ] 스킬: `/branding` · `/product-review` · `/new-tool` 평가 기준 2번 문구
- [x] 스킬: `/build-tool` · `/new-tool` 의 자동 분류 절차 (이번 커밋에서 선반영)

### Phase 7: 확인
- [ ] 허브에서 대표 흐름 3개 직접 확인
  - 문서·이미지 → 용량 줄이기 → 이미지 최적화
  - 급여·세금 → 받을 금액 계산 → 연봉·퇴직금·프리랜서·실업급여
  - 웹 접근성 → 색상 → 명도대비·색각이상
- [ ] 검색 "계약서 합치기" → PDF 도구, "사진 용량 줄이기" → 이미지 최적화
- [ ] 모바일 칩 바 가로 스크롤 · 작업 칩 줄바꿈

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

## 8. 남은 결정

1. **영문 브랜드 메시지**: KO "필요한 도구를 찾아, 하던 일을 계속하세요." 의 EN 안: "Find the tool. Get back to work." (권장)
2. **카드의 작업 표시**: 대표 작업 라벨(예: "용량 줄이기")을 카드에 보일지. 권장: 보인다. 카테고리를 고르지 않은 "전체" 화면에서도 무엇을 하는 도구인지 바로 읽힌다.
3. **작업 유형 7종의 노출**: 권장: 내부 값으로만 두고 허브 필터에는 쓰지 않는다 (카테고리별 작업과 겹친다).
4. **카드 도구명 순서**: KO 화면에서 한국어명을 위로 올리면 도구 상세 h1(영문 주 + 국문 보조)과 순서가 달라진다. 권장: 카드만 바꾸고 h1 은 SEO 영향을 따로 본 뒤 결정.
5. **슬랙 타임스탬프의 대표 작업**: 시간대 변환(권장) / 날짜 변환.
