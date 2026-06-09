export type ToolCat = "dev" | "design" | "text";

export type Tool = {
  cat: ToolCat;
  en: string;
  ko: string;
  ico?: string;
  icoClass?: string;
  href?: string;
  ready?: boolean;
  theme: "IDE" | "Canvas" | "Clean";
  d_ko: string;
  d_en: string;
};

export const TOOLS: Tool[] = [
  // Developer
  {
    cat: "dev",
    en: "JSON Formatter",
    ko: "JSON 포매터",
    ico: "{ }",
    href: "/json-formatter",
    ready: true,
    theme: "IDE",
    d_ko: "JSON 문자열을 들여쓰기·색상 강조로 포맷팅. 문법 오류 감지와 유효성 검사 포함.",
    d_en: "Format JSON with indentation and syntax highlighting. Detects errors and validates.",
  },
  {
    cat: "dev",
    en: "Base64 Encoder / Decoder",
    ko: "Base64 인코더·디코더",
    ico: "b64",
    theme: "IDE",
    d_ko: "텍스트·파일을 Base64로 인코딩하거나 디코딩. 완전 클라이언트 사이드 처리.",
    d_en: "Encode or decode text and files to Base64. Fully client-side.",
  },
  {
    cat: "dev",
    en: "URL Encoder / Decoder",
    ko: "URL 인코더·디코더",
    ico: "%",
    theme: "IDE",
    d_ko: "URL 특수문자를 퍼센트 인코딩으로 변환하거나 원래 문자열로 복원.",
    d_en: "Percent-encode URL special characters or restore the original string.",
  },
  {
    cat: "dev",
    en: "Unix Timestamp Converter",
    ko: "타임스탬프 변환기",
    ico: "Ts",
    theme: "IDE",
    d_ko: "Unix timestamp ↔ 사람이 읽는 날짜·시간 양방향 변환. 현재 시각 실시간 표시.",
    d_en: "Convert Unix timestamps to and from human dates. Live current time.",
  },
  {
    cat: "dev",
    en: "JWT Decoder",
    ko: "JWT 디코더",
    ico: "JWT",
    theme: "IDE",
    d_ko: "JWT 토큰을 header·payload·signature로 분리 표시. 만료 여부 확인.",
    d_en: "Split a JWT into header, payload and signature. Checks expiry.",
  },
  {
    cat: "dev",
    en: "Regex Tester",
    ko: "정규식 테스터",
    ico: ".*",
    theme: "IDE",
    d_ko: "정규식 패턴과 테스트 문자열의 매칭 결과를 실시간 하이라이트.",
    d_en: "Live-highlight regex matches against your test string.",
  },
  {
    cat: "dev",
    en: "Cron Generator",
    ko: "크론 표현식 생성기",
    ico: "* *",
    theme: "IDE",
    d_ko: "크론 스케줄을 UI로 설정하면 표현식 자동 생성. 다음 실행 시각 미리보기.",
    d_en: "Build cron schedules visually. Previews the next run times.",
  },

  // Design
  {
    cat: "design",
    en: "CSS Gradient Generator",
    ko: "CSS 그라디언트 생성기",
    ico: "",
    icoClass: "ico-grad",
    href: "/css-gradient",
    ready: true,
    theme: "Canvas",
    d_ko: "linear·radial·conic 그라디언트를 시각적으로 편집하고 CSS 코드를 즉시 복사.",
    d_en: "Edit linear, radial and conic gradients visually and copy the CSS instantly.",
  },
  {
    cat: "design",
    en: "Color Converter",
    ko: "색상 변환기",
    ico: "",
    icoClass: "ico-color",
    theme: "Canvas",
    d_ko: "HEX·RGB·HSL·HSV 상호 변환. 컬러 피커 UI와 팔레트 저장 기능.",
    d_en: "Convert between HEX, RGB, HSL and HSV with a picker and saved palettes.",
  },
  {
    cat: "design",
    en: "Aspect Ratio Calculator",
    ko: "화면 비율 계산기",
    ico: "16:9",
    theme: "Canvas",
    d_ko: "가로·세로 입력 시 비율 산출 및 비율 유지 리사이즈 계산. 프리셋 제공.",
    d_en: "Compute ratios and aspect-locked resizes from width and height. Includes presets.",
  },

  // Text
  {
    cat: "text",
    en: "Character / Word Counter",
    ko: "글자 수·단어 수 카운터",
    ico: "¶",
    href: "/character-counter",
    ready: true,
    theme: "Clean",
    d_ko: "글자·단어·문장·줄 수를 실시간 집계. SNS 글자 수 제한 안내 포함.",
    d_en: "Live counts of characters, words, sentences and lines. With social limits.",
  },
  {
    cat: "text",
    en: "Markdown to HTML",
    ko: "마크다운 → HTML",
    ico: "M↓",
    theme: "Clean",
    d_ko: "마크다운을 실시간 HTML로 변환. 좌우 분할 미리보기 제공.",
    d_en: "Convert Markdown to HTML in real time with a side-by-side preview.",
  },
  {
    cat: "text",
    en: "Lorem Ipsum Generator",
    ko: "로렘 입숨 생성기",
    ico: "¶¶",
    theme: "Clean",
    d_ko: "단락·단어·문장 수를 지정해 더미 텍스트 생성. 한국어 옵션 포함.",
    d_en: "Generate dummy text by paragraphs, words or sentences. Korean option included.",
  },
  {
    cat: "text",
    en: "Image to Base64",
    ko: "이미지 → Base64",
    ico: "IMG",
    theme: "Clean",
    d_ko: "이미지 파일을 Base64 Data URL로 변환. 복사 및 미리보기 제공.",
    d_en: "Convert image files to a Base64 Data URL with copy and preview.",
  },
];

export const CATS: { id: ToolCat; key: string; sub: string }[] = [
  { id: "dev", key: "cat.dev", sub: "cat.dev.sub" },
  { id: "design", key: "cat.design", sub: "cat.design.sub" },
  { id: "text", key: "cat.text", sub: "cat.text.sub" },
];
