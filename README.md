# Kitfolio

개발자·디자이너를 위한 무료 웹 도구 모음. 프론트 단독으로 동작하며, 모든 처리는
브라우저 안에서 끝납니다 (DB·서버 전송 없음). SEO 최적화된 단일 도메인 + 서브패스 구조.

> Claude Design 핸드오프(HTML/CSS/JS 프로토타입)를 Next.js(App Router) + Tailwind v4로
> 옮긴 초안입니다.

## 기술 스택

- **Next.js 15** (App Router) — 폴더명이 곧 URL 서브패스 (`app/json-formatter` → `/json-formatter`)
- **TypeScript**
- **Tailwind CSS v4** — `app/globals.css`의 `@theme` 블록에 디자인 토큰을 1:1 매핑
- 클라이언트 사이드 i18n (KO/EN, `localStorage` 영속)
- Vercel 배포 대상

## 구현 범위 (초안)

| 페이지 | 경로 | 테마 |
|--------|------|------|
| 허브 | `/` | Clean SaaS |
| JSON 포매터 | `/json-formatter` | IDE / Editor (다크) |
| CSS 그라디언트 생성기 | `/css-gradient` | Canvas |
| 글자 수·단어 수 카운터 | `/character-counter` | Clean SaaS |

나머지 10개 도구는 허브에 "준비 중" 카드로 노출됩니다.

## 디렉토리 구조

```
app/
├── layout.tsx              # 루트 레이아웃 + 폰트 + LangProvider
├── globals.css             # Tailwind v4 @theme 토큰 + 컴포넌트/페이지 CSS
├── page.tsx                # 허브 (/)
├── sitemap.ts · robots.ts  # SEO
├── lib/
│   ├── i18n.tsx            # LangProvider · useT
│   └── tools.ts            # 도구 카탈로그 데이터
├── components/
│   ├── Hub.tsx             # 허브 (검색·카테고리·즐겨찾기)
│   ├── SiteHeader.tsx      # 도구 페이지 공통 헤더
│   ├── LangToggle.tsx      # KO/EN 토글
│   └── useBodyTheme.ts     # 페이지별 body 배경 테마
├── json-formatter/         # /json-formatter
├── css-gradient/           # /css-gradient
└── character-counter/      # /character-counter
```

## 개발

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드
```

## 디자인 시스템 메모

- 컬러/폰트 토큰은 스펙의 `@theme` 토큰명(`--color-blue-primary-700` 등)을 그대로 사용
- 레이아웃은 **960px 기준 자동 반응형** (이상 좌우분할 · 미만 상하분할) — 토글 없이 시스템 판단
- 모든 도구 페이지에 공통 타이틀+설명+사용 가이드(`.kf-pagehead`) — 개별 인입 대비
- 폰트(Pretendard·Inter·JetBrains Mono)는 현재 CDN 로드 — 핸드오프 권고대로 추후 로컬 폰트
  (`next/font`)로 교체 권장
