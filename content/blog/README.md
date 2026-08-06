# Kitfolio 블로그 — 아티클 작성 가이드

아티클은 이 폴더의 마크다운 파일로 관리합니다. **CMS·DB 없음** — 파일을 커밋하고 배포하면 게시됩니다.

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
---
```

- `title`·`description`·`date` 는 필수.
- `relatedTools` 에 넣은 slug 는 글 하단 "관련 도구" 카드로 렌더됩니다 (레지스트리에 있는 도구만).

## 대표 이미지

- 이미지 파일은 `public/blog/` 에 둡니다. 예: `public/blog/growth-rate-explained.png`.
- 프론트매터 `cover` 에 `/blog/<파일명>` 형태로 경로를 적으면 목록 카드와 글 상단 히어로, OG 이미지에 사용됩니다.
- `cover` 가 없으면 목록 카드는 그라디언트 플레이스홀더로 표시됩니다 (이미지를 나중에 추가해도 됩니다).
- 권장 비율 16:9 (예: 1200×675).

## 본문 (마크다운)

- 표준 마크다운 + GFM(표, 체크박스 등) 지원.
- 내부 링크는 절대경로로: `[성장률 계산기](/growth-rate-calculator)` (EN 글은 `/en/...`).
- 본문 이미지: `![대체텍스트](/blog/이미지.png)`.
- 제목은 본문에서 `##`(h2)부터 사용 — h1 은 프론트매터 `title` 이 자동 렌더합니다.

## 게시

1. `content/blog/` 에 `.ko.md` / `.en.md` 추가 (+ 필요 시 `public/blog/` 이미지).
2. 커밋 → main 배포. sitemap·목록·hreflang 은 빌드 시 자동 갱신됩니다.
