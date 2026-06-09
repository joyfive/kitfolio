# Toolbox 프로젝트

## 목적
프론트 단독으로 동작하는 웹 도구를 다수 제작해 광고 수익 파이프라인 구축.
SEO 최적화된 단일 도메인 + 서브패스 구조로 운영.

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

**IDE / Editor** (다크 전용)
- 배경: `blue-gray-950` (#1b1d21)
- 패널: `blue-gray-900` (#23262b)
- 라인 넘버 / 주석: `blue-gray-700` (#4c5059)
- 일반 텍스트: `blue-gray-200` (#c6c9d1)
- 신택스 — 키워드: `blue-primary-400` (#899ff3)
- 신택스 — 함수: `blue-primary-500` (#6486ef)
- 신택스 — 문자열: `blue-primary-300` (#a7b6f6)
- 액티브 탭 / 포인트: `blue-primary-700` (#2d5dc8)
- 성공 배지 배경: `blue-primary-900` (#18377c)

**Canvas** (라이트 전용)
- 캔버스 배경: `blue-gray-50` (#f0f1f3)
- 패널 / 사이드바: white
- 테두리: `blue-gray-200` (#c6c9d1)
- 포인트 / 액티브: `blue-primary-700` (#2d5dc8)
- 액티브 툴 배경: `blue-primary-100` (#e3e7fc)

**Clean SaaS** (라이트 전용)
- 배경: white
- 인풋 / 카드 배경: `blue-gray-50` (#f0f1f3)
- 테두리: `blue-gray-200` (#c6c9d1)
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
[로고마크 + Toolbox] [전체 도구 | 개발 | 디자인 | 텍스트] ··· [검색] [즐겨찾기]
```
- 높이: 48px
- 하단 보더: 0.5px `blue-gray-100`
- 네비 아이템: 라운드 6px, 액티브 시 `blue-primary-100` 배경
- 모바일: 햄버거 메뉴로 네비 축소

---

## 도구 로드맵

| # | 도구 | 국문명 | URL | 설명 | 상태 |
|---|------|--------|-----|------|------|
| 1 | JSON Formatter / Validator | JSON 포매터 | `/json-formatter` | JSON 문자열을 붙여넣으면 들여쓰기·색상 강조로 포맷팅. 문법 오류 감지 및 유효성 검사 포함 | ⬜ |
| 2 | Base64 Encoder / Decoder | Base64 인코더·디코더 | `/base64` | 텍스트 또는 파일을 Base64로 인코딩하거나 디코딩. 완전 클라이언트 사이드 처리 | ⬜ |
| 3 | URL Encoder / Decoder | URL 인코더·디코더 | `/url-encoder` | URL 특수문자를 퍼센트 인코딩으로 변환하거나 원래 문자열로 복원 | ⬜ |
| 4 | Unix Timestamp Converter | 유닉스 타임스탬프 변환기 | `/timestamp` | Unix timestamp ↔ 사람이 읽을 수 있는 날짜·시간 양방향 변환. 현재 시각 실시간 표시 | ⬜ |
| 5 | Character / Word Counter | 글자 수·단어 수 카운터 | `/character-counter` | 텍스트 입력 시 글자 수·단어 수·문장 수·줄 수 실시간 집계. SNS 글자 수 제한 안내 포함 | ⬜ |
| 6 | CSS Gradient Generator | CSS 그라디언트 생성기 | `/css-gradient` | linear/radial/conic 그라디언트를 시각적으로 편집하고 CSS 코드 즉시 복사 | ⬜ |
| 7 | Color Picker / HEX–RGB Converter | 색상 변환기 | `/color-converter` | HEX·RGB·HSL·HSV 간 상호 변환. 컬러 피커 UI와 팔레트 저장 기능 | ⬜ |
| 8 | Cron Expression Generator | 크론 표현식 생성기 | `/cron-generator` | 크론 스케줄을 UI로 설정하면 표현식 자동 생성. 다음 실행 시각 미리보기 포함 | ⬜ |
| 9 | Markdown to HTML | 마크다운 → HTML 변환기 | `/markdown-to-html` | 마크다운 텍스트를 실시간으로 HTML로 변환. 좌우 분할 미리보기 제공 | ⬜ |
| 10 | Lorem Ipsum Generator | 로렘 입숨 생성기 | `/lorem-ipsum` | 단락·단어·문장 수를 지정해 더미 텍스트 생성. 한국어 더미 텍스트 옵션 포함 | ⬜ |
| 11 | Image to Base64 | 이미지 → Base64 변환기 | `/image-to-base64` | 이미지 파일을 Base64 문자열로 변환. Data URL 형식 복사 및 미리보기 제공 | ⬜ |
| 12 | JWT Decoder | JWT 디코더 | `/jwt-decoder` | JWT 토큰을 붙여넣으면 header·payload·signature 분리 표시. 만료 여부 확인 | ⬜ |
| 13 | Regex Tester | 정규식 테스터 | `/regex-tester` | 정규식 패턴과 테스트 문자열을 입력하면 매칭 결과 실시간 하이라이트 | ⬜ |
| 14 | Aspect Ratio Calculator | 화면 비율 계산기 | `/aspect-ratio` | 가로·세로 입력 시 비율 산출 및 비율 유지 리사이즈 계산. 주요 비율 프리셋 제공 | ⬜ |

**범례:** ⬜ 미구현 · 🚧 진행 중 · ✅ 완료
