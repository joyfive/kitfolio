# Kitfolio 블로그 · 아티클 작성 가이드

아티클은 이 폴더의 마크다운 파일로 관리합니다. **CMS·DB 없음.** 파일을 커밋하고 배포하면 게시됩니다.

## 파일 규칙

각 아티클은 언어별로 두 개의 파일:

```
content/blog/<slug>.ko.md   # 한국어
content/blog/<slug>.en.md   # 영어
```

- `<slug>` 이 그대로 URL이 됩니다: `/blog/<slug>` (KO), `/en/blog/<slug>` (EN).
- slug 은 소문자·하이픈만 (예: `growth-rate-explained`).
- 두 언어 파일이 모두 있어야 hreflang 이 정상 연결됩니다. 한쪽만 있으면 그 언어 목록에만 노출됩니다.

## 프론트매터 (파일 맨 위 `---` 블록)

```yaml
---
title: 글 제목
description: 검색 결과·목록에 쓰이는 한두 문장 요약
date: 2026-08-06            # 발행일 (정렬 기준, YYYY-MM-DD)
updated: 2026-08-10         # (선택) 수정일
cover: /blog/<slug>.png     # (선택) 대표 이미지, public/blog/ 기준
coverAlt: 이미지 대체 텍스트   # (선택)
relatedTools: growth-rate-calculator, cagr-calculator   # (선택) 관련 도구 slug, 쉼표 구분
tags: 성장률, 지표            # (선택) 태그, 쉼표 구분

author: joyfive             # (선택) 생략 시 사이트 운영자(content.ts AUTHOR)
authorRole: Kitfolio 운영자   # (선택) 생략 시 AUTHOR.role
reviewedAt: 2026-08-18      # (선택) 내용을 마지막으로 사실 확인한 날짜
sources: 국세청 · 근로소득 간이세액표|https://www.nts.go.kr/...   # (선택) 공식 출처
---
```

- `title`·`description`·`date` 는 필수.
- `relatedTools` 에 넣은 slug 는 글 하단 "관련 도구" 카드로 렌더됩니다 (레지스트리에 있는 도구만).

## 신뢰 정보 필드 (author / reviewedAt / sources)

AdSense·검색엔진은 "누가 썼고 누가 책임지는가"를 봅니다. 아래 필드가 화면과
`BlogPosting` JSON-LD 에 함께 반영됩니다.

| 필드 | 화면 표시 | JSON-LD |
|---|---|---|
| `author` / `authorRole` | 제목 아래 바이라인 | `author` → **Person** (publisher 는 Organization 으로 분리) |
| `reviewedAt` | 바이라인의 "최근 검증" | `lastReviewed` · `reviewedBy` |
| `sources` | 본문 하단 "참고한 공식 자료" | `citation` |

- `author`·`authorRole` 은 생략해도 됩니다. 비우면 `app/lib/content.ts` 의 `AUTHOR`
  (운영자명·역할)가 언어에 맞게 자동으로 들어갑니다. 대부분의 글은 생략이 정답입니다.
- `sources` 형식은 `라벨|URL` 이며 여러 개는 쉼표로 구분합니다. URL 이 없는 항목은 무시됩니다.

### sources 는 언제 붙이나

**모든 글에 억지로 넣지 않습니다.** 외부 기준에 의존하는 글에만 붙이고,
**정부·공공기관·표준 문서 등 1차 자료만** 사용합니다. 개인 블로그나 타사 계산기는
근거로 쓰지 않습니다.

- 붙여야 하는 글: 세금·보험료율, 법·제도 기준, 플랫폼 정책·제한값, 기술 명세(RFC·W3C 등)
- 붙이지 않아도 되는 글: 도구 사용법, 업무 팁, 개념 설명처럼 외부 기준이 없는 내용

`reviewedAt` 은 기준이 바뀔 수 있는 글(세율·플랫폼 제한 등)에 특히 중요합니다.
내용을 다시 확인했다면 본문을 고치지 않았더라도 이 날짜를 갱신하세요.

## 대표 이미지

- 이미지 파일은 `public/blog/` 에 둡니다. 예: `public/blog/growth-rate-explained.png`.
- 프론트매터 `cover` 에 `/blog/<파일명>` 형태로 경로를 적으면 목록 카드와 글 상단 히어로, OG 이미지에 사용됩니다.
- `cover` 가 없으면 목록 카드는 그라디언트 플레이스홀더로 표시됩니다 (이미지를 나중에 추가해도 됩니다).
- 권장 비율 16:9 (예: 1200×675).

## 본문 (마크다운)

- 표준 마크다운 + GFM(표, 체크박스 등) 지원.
- 내부 링크는 절대경로로: `[성장률 계산기](/growth-rate-calculator)` (EN 글은 `/en/...`).
- 본문 이미지: `![대체텍스트](/blog/이미지.png)`.
- 제목은 본문에서 `##`(h2)부터 사용. h1 은 프론트매터 `title` 이 자동 렌더합니다.

### 문장부호

**엠대시(`-`)와 엔대시(`-`)는 쓰지 않습니다.** 라벨과 설명을 잇는 자리에는 콜론(`:`),
같은 층위의 항목을 나열할 때는 가운뎃점(`·`)을 씁니다.

```
- **국민연금 4.75%**: 2026년 1월부터 …     ← 라벨 뒤 설명
## 오독 1: 절대량 없이 퍼센트만 말한다        ← 소제목
sources: 국세청 · 근로소득 간이세액표|https://…   ← 출처 라벨
```

숫자 범위는 물결(`150~160`)이나 하이픈(`150-160`)을 씁니다.
이 규칙도 `npm test` 에서 검사합니다.

### 한국어 강조(`**굵게**`)와 조사

CommonMark 는 닫는 `**` 앞이 문장부호이고 뒤에 글자가 바로 붙으면 강조로 인정하지 않습니다.
한국어는 조사가 곧바로 붙어 이 조건에 자주 걸립니다.

```
**400%**입니다        ← 앞이 % (문장부호), 뒤가 글자
**rem(root em)**은    ← 앞이 ) , 뒤가 글자
```

`app/lib/blog.ts` 의 `fixCjkEmphasis()` 가 이 경우를 렌더 전에 `<strong>` 으로 보정하므로
**평소처럼 `**` 만 쓰면 됩니다.** 다만 코드 블록과 인라인 코드 안은 보정하지 않습니다
(코드 예시를 그대로 보여줘야 하므로).

회귀 검사는 `npm test` 에 포함되어 있습니다. 모든 아티클을 렌더해 리터럴 `**` 가
남으면 실패합니다.

## 게시

1. `content/blog/` 에 `.ko.md` / `.en.md` 추가 (+ 필요 시 `public/blog/` 이미지).
2. 커밋 → main 배포. sitemap·목록·hreflang 은 빌드 시 자동 갱신됩니다.
