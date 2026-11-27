/* 코드·웹 제작 */
import type { GuideFigureMap } from "./types";

const BLUE = ["#f1f3fd", "#e3e7fc", "#c4cdf9", "#a7b6f6", "#899ff3", "#6486ef", "#3a70eb", "#2d5dc8", "#22499f", "#18377c", "#0a1d48"];
const STOPS = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];

export const WEB_FIGURES: GuideFigureMap = {
  "json-formatter": {
    ko: {
      caption: "한 줄 JSON을 붙여 넣으면 바로 정리되고, 오류가 있으면 위치를 알려줍니다.",
      parts: [
        { t: "tabs", items: ["포맷", "압축"], m: 1 },
        { t: "text", label: "입력", value: "{\"id\":1042,\"user\":{\"name\":\"김서연\",\"roles\":[\"admin\",\"editor\"]},\"active\":true}", mono: true, m: 2 },
        { t: "rows", items: [{ label: "상태", value: "유효한 JSON", tone: "ok" }], m: 3 },
        { t: "code", title: "결과", lines: ["{", "  \"id\": 1042,", "  \"user\": {", "    \"name\": \"김서연\",", "    \"roles\": [\"admin\", \"editor\"]", "  },", "  \"active\": true", "}"], m: 4 },
      ],
      notes: [
        { title: "포맷 · 압축", body: "읽기 쉽게 줄을 나누려면 포맷, 요청 본문처럼 한 줄로 줄이려면 압축을 고르세요. 포맷에서는 들여쓰기 칸 수도 정할 수 있습니다." },
        { title: "입력", body: "로그나 응답에서 복사한 JSON을 붙여 넣으세요. 입력하는 대로 자동으로 정리됩니다." },
        { title: "상태", body: "유효한 JSON인지, 문법 오류라면 몇 번째 줄 몇 번째 글자인지 알려줍니다. 줄 수와 키 개수도 함께 보여줍니다." },
        { title: "결과", body: "오류가 없는지 확인한 뒤 결과를 복사하세요. 입력한 내용은 브라우저 밖으로 보내지 않습니다." },
      ],
    },
    en: {
      caption: "Paste one-line JSON and it is formatted at once, or the error location is shown.",
      parts: [
        { t: "tabs", items: ["Format", "Minify"], m: 1 },
        { t: "text", label: "Input", value: "{\"id\":1042,\"user\":{\"name\":\"Seoyeon Kim\",\"roles\":[\"admin\",\"editor\"]},\"active\":true}", mono: true, m: 2 },
        { t: "rows", items: [{ label: "Status", value: "Valid JSON", tone: "ok" }], m: 3 },
        { t: "code", title: "Result", lines: ["{", "  \"id\": 1042,", "  \"user\": {", "    \"name\": \"Seoyeon Kim\",", "    \"roles\": [\"admin\", \"editor\"]", "  },", "  \"active\": true", "}"], m: 4 },
      ],
      notes: [
        { title: "Format or Minify", body: "Choose Format to break JSON into readable lines, or Minify to put a request body on one line. Format also lets you set the indent width." },
        { title: "Input", body: "Paste JSON copied from a log or response. It is reformatted as you type." },
        { title: "Status", body: "Shows whether the JSON is valid, or the line and column of a syntax error, along with line and key counts." },
        { title: "Result", body: "Copy the result once there are no errors. Nothing you enter leaves your browser." },
      ],
    },
  },

  "slack-message-builder": {
    ko: {
      caption: "블록으로 메시지를 조립하고 미리본 뒤, 원하는 형식의 코드로 복사합니다.",
      parts: [
        { t: "chips", label: "템플릿", items: ["배포 알림", "장애 알림", "릴리즈 노트"], active: [0], m: 1 },
        { t: "rows", title: "블록 5개", items: [{ label: "제목", value: "v2.4.0 배포 완료" }, { label: "텍스트", value: "production 환경에 배포되었습니다" }, { label: "필드", value: "환경 · 버전 · 배포자 · 소요 시간" }, { label: "버튼 묶음", value: "변경 사항 · 롤백" }], m: 2 },
        { t: "tabs", items: ["미리보기", "JSON", "curl", "Node.js", "Python"], active: 1, m: 3 },
        { t: "code", lines: ["{", "  \"blocks\": [", "    { \"type\": \"header\", \"text\": { \"type\": \"plain_text\", \"text\": \"v2.4.0 배포 완료\" } },", "    …", "  ]", "}"] },
        { t: "buttons", items: ["코드 복사"], m: 4 },
      ],
      notes: [
        { title: "템플릿", body: "자주 쓰는 알림 구조로 시작하거나, 모두 지우기 후 빈 메시지에서 시작하세요." },
        { title: "블록", body: "제목·텍스트·필드·이미지·버튼 묶음 같은 블록을 추가하고 위아래로 옮깁니다. 텍스트에는 *굵게* _기울임_ `코드` 를 쓸 수 있습니다." },
        { title: "미리보기와 코드 탭", body: "미리보기로 모양을 확인하고, 한도를 넘는 블록이 있으면 경고를 확인하세요. 그다음 JSON이나 쓰려는 언어의 탭을 고릅니다." },
        { title: "코드 복사", body: "코드는 토큰을 환경 변수에서 읽습니다. 이 페이지에는 토큰을 넣지 말고, 채널 ID만 바꿔 실행하세요." },
      ],
    },
    en: {
      caption: "Assemble a message from blocks, preview it, then copy the code in the format you need.",
      parts: [
        { t: "chips", label: "Templates", items: ["Deploy", "Incident", "Release notes"], active: [0], m: 1 },
        { t: "rows", title: "5 blocks", items: [{ label: "Header", value: "v2.4.0 deployed" }, { label: "Text", value: "Deployed to production" }, { label: "Fields", value: "Environment · version · by · duration" }, { label: "Buttons", value: "Changes · roll back" }], m: 2 },
        { t: "tabs", items: ["Preview", "JSON", "curl", "Node.js", "Python"], active: 1, m: 3 },
        { t: "code", lines: ["{", "  \"blocks\": [", "    { \"type\": \"header\", \"text\": { \"type\": \"plain_text\", \"text\": \"v2.4.0 deployed\" } },", "    …", "  ]", "}"] },
        { t: "buttons", items: ["Copy code"], m: 4 },
      ],
      notes: [
        { title: "Templates", body: "Start from a common notification layout, or clear everything and start from a blank message." },
        { title: "Blocks", body: "Add header, text, fields, image or button blocks and move them up or down. Text supports *bold* _italic_ `code`." },
        { title: "Preview and code tabs", body: "Check the layout in Preview and look for limit warnings, then pick JSON or the tab for your language." },
        { title: "Copy code", body: "The code reads the token from an environment variable. Never paste a token into this page. Just change the channel ID and run it." },
      ],
    },
  },

  "css-unit-converter": {
    ko: {
      caption: "단위 탭을 고르고 값과 기준값을 넣으면 변환 결과가 바로 나옵니다.",
      parts: [
        { t: "tabs", items: ["rem ↔ px", "em ↔ px", "vw ↔ px", "% ↔ px", "ms ↔ s"], m: 1 },
        { t: "field", label: "px 값", value: "24", unit: "px", m: 2 },
        { t: "field", label: "루트 폰트 크기 (px)", value: "16", unit: "px", m: 3 },
        { t: "result", label: "결과", value: "1.5rem", m: 4 },
      ],
      notes: [
        { title: "단위 탭", body: "바꿀 단위 쌍을 고르세요. 각 탭은 같은 페이지 안의 모드라 주소의 ?mode= 만 바뀝니다." },
        { title: "값", body: "변환할 값을 넣습니다. 방향 전환 버튼을 누르면 rem → px처럼 반대 방향으로 계산합니다." },
        { title: "기준값", body: "rem은 루트 폰트 크기, em은 부모 폰트 크기, vw는 뷰포트 너비, %는 부모 너비가 기준입니다. 프로젝트 설정과 같은 값을 넣으세요." },
        { title: "결과", body: "변환된 값을 복사해 CSS에 붙이세요. 빠른 예시로 자주 쓰는 값을 바로 확인할 수 있습니다." },
      ],
    },
    en: {
      caption: "Pick a unit tab, enter the value and its base, and the result appears at once.",
      parts: [
        { t: "tabs", items: ["rem ↔ px", "em ↔ px", "vw ↔ px", "% ↔ px", "ms ↔ s"], m: 1 },
        { t: "field", label: "px value", value: "24", unit: "px", m: 2 },
        { t: "field", label: "Root font size (px)", value: "16", unit: "px", m: 3 },
        { t: "result", label: "Result", value: "1.5rem", m: 4 },
      ],
      notes: [
        { title: "Unit tabs", body: "Pick the unit pair. Each tab is a mode on the same page, so only ?mode= in the address changes." },
        { title: "Value", body: "Enter the value to convert. The swap button reverses the direction, for example rem → px." },
        { title: "Base value", body: "rem uses the root font size, em the parent font size, vw the viewport width and % the parent width. Match your project's settings." },
        { title: "Result", body: "Copy the converted value into your CSS. Quick examples show common values right away." },
      ],
    },
  },

  "css-gradient": {
    ko: {
      caption: "타입과 각도를 정하고 색상 정지점을 고치면 미리보기와 CSS가 함께 바뀝니다.",
      parts: [
        { t: "tabs", label: "타입", items: ["linear", "radial", "conic"], m: 1 },
        { t: "slider", label: "각도", value: "135°", pct: 37, m: 2 },
        { t: "swatches", colors: ["#3A70EB", "#6486EF"], labels: ["0%", "100%"], m: 3 },
        { t: "preview", background: "linear-gradient(135deg, #3A70EB 0%, #6486EF 100%)", ratio: "16 / 5" },
        { t: "code", title: "CSS", lines: ["background: linear-gradient(135deg, #3A70EB 0%, #6486EF 100%);"], m: 4 },
      ],
      notes: [
        { title: "타입", body: "한 방향으로 번지는 linear, 중심에서 퍼지는 radial, 중심을 따라 도는 conic 중 고르세요." },
        { title: "각도 · 중심 위치", body: "linear는 각도, radial·conic은 중심 위치를 조절합니다. 미리보기가 바로 바뀝니다." },
        { title: "색상 정지점", body: "정지점을 끌어 위치를 바꾸고 색을 고릅니다. 정지점 추가·랜덤·반전 버튼도 쓸 수 있습니다." },
        { title: "CSS 복사", body: "완성된 background 선언을 복사해 스타일에 붙이세요." },
      ],
    },
    en: {
      caption: "Set the type and angle, adjust the color stops, and the preview and CSS update together.",
      parts: [
        { t: "tabs", label: "Type", items: ["linear", "radial", "conic"], m: 1 },
        { t: "slider", label: "Angle", value: "135°", pct: 37, m: 2 },
        { t: "swatches", colors: ["#3A70EB", "#6486EF"], labels: ["0%", "100%"], m: 3 },
        { t: "preview", background: "linear-gradient(135deg, #3A70EB 0%, #6486EF 100%)", ratio: "16 / 5" },
        { t: "code", title: "CSS", lines: ["background: linear-gradient(135deg, #3A70EB 0%, #6486EF 100%);"], m: 4 },
      ],
      notes: [
        { title: "Type", body: "Choose linear to blend in one direction, radial to spread from a center, or conic to sweep around a center." },
        { title: "Angle or center", body: "Linear uses an angle, radial and conic use a center position. The preview updates immediately." },
        { title: "Color stops", body: "Drag stops to move them and pick their colors. Add stop, Random and Reverse are available too." },
        { title: "Copy the CSS", body: "Copy the finished background declaration into your styles." },
      ],
    },
  },

  "tailwind-palette-generator": {
    ko: {
      caption: "베이스 HEX 하나로 11단계 팔레트를 만들고, 쓰는 형식의 코드로 복사합니다.",
      parts: [
        { t: "fields", items: [{ label: "베이스 색상", value: "#3A70EB" }, { label: "색상 이름", value: "brand" }], m: 1 },
        { t: "swatches", colors: BLUE, labels: STOPS, m: 2 },
        { t: "tabs", items: ["Tailwind v4", "Tailwind v3", "CSS"], m: 3 },
        { t: "code", lines: ["@theme {", "  --color-brand-50: #F1F3FD;", "  …", "  --color-brand-600: #3A70EB;", "}"], m: 4 },
      ],
      notes: [
        { title: "베이스 색상 · 이름", body: "브랜드 색의 HEX를 넣고, 코드에 쓸 색상 이름을 정하세요." },
        { title: "팔레트 (50~950)", body: "밝은 50부터 어두운 950까지 11단계가 만들어지고, 입력한 색은 명도가 가장 가까운 단계에 그대로 들어갑니다. 스와치를 누르면 그 HEX가 복사됩니다." },
        { title: "코드 형식", body: "프로젝트에 맞춰 v4의 @theme, v3의 config 객체, 일반 CSS 변수 중 고르세요." },
        { title: "코드", body: "전체를 복사해 설정 파일에 붙입니다. 버튼·배경·경계에 어떤 단계를 쓸지는 대비 검사로 확인하세요." },
      ],
    },
    en: {
      caption: "Turn one base HEX into an 11-shade palette and copy it in the format you use.",
      parts: [
        { t: "fields", items: [{ label: "Base color", value: "#3A70EB" }, { label: "Color name", value: "brand" }], m: 1 },
        { t: "swatches", colors: BLUE, labels: STOPS, m: 2 },
        { t: "tabs", items: ["Tailwind v4", "Tailwind v3", "CSS"], m: 3 },
        { t: "code", lines: ["@theme {", "  --color-brand-50: #F1F3FD;", "  …", "  --color-brand-600: #3A70EB;", "}"], m: 4 },
      ],
      notes: [
        { title: "Base color and name", body: "Enter your brand HEX and the color name to use in code." },
        { title: "Palette (50-950)", body: "Eleven steps run from light 50 to dark 950, and your color sits unchanged at the step closest in lightness. Click a swatch to copy its HEX." },
        { title: "Code format", body: "Choose v4 @theme, a v3 config object or plain CSS variables to match your project." },
        { title: "Code", body: "Copy it all into your config. Use a contrast check to decide which steps work for buttons, backgrounds and borders." },
      ],
    },
  },

  "open-graph-preview": {
    ko: {
      caption: "이미지와 제목·설명을 넣으면 플랫폼마다 어떻게 잘리고 보이는지 나란히 비교합니다.",
      parts: [
        { t: "tabs", label: "이미지 소스", items: ["이미지 첨부", "이미지 URL", "생성 코드"], m: 1 },
        { t: "fields", items: [{ label: "제목", value: "Kitfolio | 일하는 사람을 위한 작은 웹 도구 모음" }, { label: "표시 도메인", value: "kitfolio.app" }], m: 2 },
        { t: "chips", items: ["카카오톡", "Facebook", "X", "LinkedIn", "네이버 블로그"], active: [0], m: 3 },
        { t: "preview", background: "linear-gradient(135deg, #2d5dc8, #899ff3)", caption: "Kitfolio | 일하는 사람을 위한 작은 웹 도구…", ratio: "1.91 / 1", m: 4 },
      ],
      notes: [
        { title: "이미지 소스", body: "OG 이미지 파일을 올리거나, 이미지 파일 URL을 넣거나, 지원하는 이미지 생성 코드를 붙여 넣으세요. 웹페이지 주소를 분석하는 기능은 아닙니다." },
        { title: "제목 · 설명 · 도메인", body: "og:title과 og:description에 넣을 문구, 카드에 보일 도메인을 입력합니다. 글자 수도 함께 표시됩니다." },
        { title: "플랫폼", body: "전체 플랫폼 비교로 한꺼번에 보거나, 플랫폼 하나를 골라 실제 크기에 가깝게 봅니다." },
        { title: "미리보기와 경고", body: "이미지가 어디서 잘리는지, 제목이 몇 줄에서 끊기는지 확인하세요. 비율이나 크기가 권장값과 다르면 경고가 나옵니다." },
      ],
    },
    en: {
      caption: "Add an image, title and description to compare how each platform crops and displays the card.",
      parts: [
        { t: "tabs", label: "Image source", items: ["Upload image", "Image URL", "Source code"], m: 1 },
        { t: "fields", items: [{ label: "Title", value: "Kitfolio | Small tools for modern knowledge workers" }, { label: "Display domain", value: "kitfolio.app" }], m: 2 },
        { t: "chips", items: ["KakaoTalk", "Facebook", "X", "LinkedIn", "Naver Blog"], active: [1], m: 3 },
        { t: "preview", background: "linear-gradient(135deg, #2d5dc8, #899ff3)", caption: "Kitfolio | Small tools for modern knowledge…", ratio: "1.91 / 1", m: 4 },
      ],
      notes: [
        { title: "Image source", body: "Upload the OG image, enter a direct image file URL, or paste supported image source code. It does not analyze web page addresses." },
        { title: "Title, description, domain", body: "Enter the og:title and og:description text and the domain shown on the card. Character counts are shown as you type." },
        { title: "Platform", body: "Compare all platforms at once, or pick one to see it closer to actual size." },
        { title: "Preview and warnings", body: "Check where the image is cropped and where the title is cut off. A warning appears when the ratio or size differs from what platforms recommend." },
      ],
    },
  },
};
