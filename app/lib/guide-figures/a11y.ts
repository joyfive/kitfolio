/* 웹 접근성 */
import type { GuideFigureMap } from "./types";

export const A11Y_FIGURES: GuideFigureMap = {
  "html-accessibility-checker": {
    ko: {
      caption: "검사 범위를 고르고 HTML을 붙여 넣어 검사하면 문제와 위치가 심각도별로 나옵니다.",
      parts: [
        { t: "tabs", label: "검사 범위", items: ["컴포넌트 조각", "전체 문서"], active: 1, m: 1 },
        { t: "text", label: "검사할 HTML", value: "<html>\n  <head><title></title></head>\n  <body><img src=\"logo.png\"> …", mono: true, m: 2 },
        { t: "buttons", items: ["예시 HTML", "검사하기"], m: 3 },
        { t: "rows", items: [{ label: "IMG-001 alt 누락 · 3행", value: "오류 가능성 높음", tone: "bad" }, { label: "HEAD-002 h1 다음 h3", value: "검토 필요", tone: "warn" }], m: 4 },
      ],
      notes: [
        { title: "검사 범위", body: "컴포넌트 일부만 붙인다면 컴포넌트 조각, html·head·body까지 있는 페이지라면 전체 문서를 고르세요. 범위에 따라 lang·title 같은 문서 규칙이 켜지고 꺼집니다." },
        { title: "검사할 HTML", body: "브라우저 개발자 도구나 빌드 결과에서 복사한 마크업을 붙여 넣습니다. 코드는 서버로 보내지 않고 브라우저에서 분석합니다." },
        { title: "검사하기", body: "헤딩·랜드마크·레이블·이미지·포커스 규칙을 정적으로 검사합니다. 처음이라면 예시 HTML로 결과 모양을 먼저 보세요." },
        { title: "결과", body: "규칙 번호와 줄 위치가 오류 가능성 높음·검토 필요·수동 검사로 나뉘어 나옵니다. 고친 뒤 다시 검사하거나 Markdown 보고서로 복사해 PR에 붙이세요." },
      ],
    },
    en: {
      caption: "Choose a scope, paste the HTML and run the check to see issues and locations by level.",
      parts: [
        { t: "tabs", label: "Scope", items: ["HTML fragment", "Full document"], active: 1, m: 1 },
        { t: "text", label: "HTML to check", value: "<html>\n  <head><title></title></head>\n  <body><img src=\"logo.png\"> …", mono: true, m: 2 },
        { t: "buttons", items: ["Sample HTML", "Run check"], m: 3 },
        { t: "rows", items: [{ label: "IMG-001 missing alt · line 3", value: "High-confidence issue", tone: "bad" }, { label: "HEAD-002 h1 followed by h3", value: "Needs review", tone: "warn" }], m: 4 },
      ],
      notes: [
        { title: "Scope", body: "Choose HTML fragment for part of a component, or Full document for a page with html, head and body. The scope turns document rules such as lang and title on or off." },
        { title: "HTML to check", body: "Paste markup copied from browser developer tools or a build. It is analyzed in your browser and never sent to a server." },
        { title: "Run check", body: "Runs static rules for headings, landmarks, labels, images and focus. Try Sample HTML first to see what results look like." },
        { title: "Results", body: "Rule IDs and line locations are grouped as high-confidence issues, review items and manual tests. Fix and check again, or copy the Markdown report into your PR." },
      ],
    },
  },

  "color-contrast-checker": {
    ko: {
      caption: "전경색과 배경색을 넣으면 대비 비율과 WCAG 기준별 통과 여부, 통과 색상 후보가 나옵니다.",
      parts: [
        { t: "tabs", items: ["단일 색상 검사", "팔레트 감사"], m: 1 },
        { t: "fields", items: [{ label: "전경색", value: "#9CA3AF" }, { label: "배경색", value: "#FFFFFF" }], m: 2 },
        { t: "result", label: "대비 비율", value: "2.54:1", m: 3 },
        { t: "rows", title: "WCAG 2.2 판정", items: [{ label: "일반 텍스트 AA", value: "미달", tone: "bad" }, { label: "큰 텍스트 AA", value: "미달", tone: "bad" }, { label: "UI 컴포넌트·그래픽 AA", value: "미달", tone: "bad" }] },
        { t: "buttons", items: ["통과 색상 제안 적용"], m: 4 },
      ],
      notes: [
        { title: "검사 방식", body: "한 쌍을 확인하려면 단일 색상 검사, 디자인 시스템의 여러 색을 한꺼번에 보려면 팔레트 감사를 고르세요." },
        { title: "전경색 · 배경색", body: "실제 화면에 쓰는 HEX를 넣거나 색상 선택기로 고릅니다. 교환 버튼으로 두 색을 바꿔 볼 수 있습니다." },
        { title: "대비 비율과 판정", body: "본문은 4.5:1, 큰 텍스트와 UI 요소는 3:1이 AA 기준입니다. 쓰려는 용도의 줄이 통과인지 확인하세요." },
        { title: "통과 색상 제안", body: "미달이면 목표 기준을 넘는 가장 가까운 색을 제안합니다. 적용을 누르면 그 색으로 다시 검사합니다." },
      ],
    },
    en: {
      caption: "Enter foreground and background colors to see the ratio, the result for each WCAG level and passing alternatives.",
      parts: [
        { t: "tabs", items: ["Single pair", "Palette audit"], m: 1 },
        { t: "fields", items: [{ label: "Foreground", value: "#9CA3AF" }, { label: "Background", value: "#FFFFFF" }], m: 2 },
        { t: "result", label: "Contrast ratio", value: "2.54:1", m: 3 },
        { t: "rows", title: "WCAG 2.2 results", items: [{ label: "Normal text AA", value: "Fail", tone: "bad" }, { label: "Large text AA", value: "Fail", tone: "bad" }, { label: "UI components and graphics AA", value: "Fail", tone: "bad" }] },
        { t: "buttons", items: ["Apply a passing suggestion"], m: 4 },
      ],
      notes: [
        { title: "Mode", body: "Use Single pair to check one combination, or Palette audit to review many design system colors at once." },
        { title: "Foreground and background", body: "Enter the exact HEX values your design uses, or pick them. The swap button reverses the pair." },
        { title: "Ratio and results", body: "AA needs 4.5:1 for body text and 3:1 for large text and UI parts. Check the row for how you will use the color." },
        { title: "Passing suggestions", body: "When a pair fails, the closest colors that reach the target are suggested. Apply one to check it again." },
      ],
    },
  },

  "color-blindness-simulator": {
    ko: {
      caption: "시안을 올리고 색각 유형을 고르면 원본과 나란히 비교할 수 있습니다.",
      parts: [
        { t: "drop", title: "검수할 시안 이미지를 올려 주세요.", hint: "또는 예시 시안으로 체험", m: 1 },
        { t: "chips", label: "보기 유형", items: ["Protan", "Deutan", "Tritan", "흑백 점검"], active: [1], m: 2 },
        { t: "slider", label: "시뮬레이션 강도", value: "100%", pct: 100, m: 3 },
        { t: "swatches", colors: ["#16A34A", "#958951", "#DC2626", "#8F801B"], labels: ["원본", "Deutan", "원본", "Deutan"], m: 4 },
      ],
      notes: [
        { title: "시안 올리기", body: "화면 시안이나 스크린샷을 올리세요. 이미지는 서버로 보내지 않고 브라우저에서 처리합니다." },
        { title: "보기 유형", body: "적색 계열(Protan), 녹색 계열(Deutan), 청황 계열(Tritan), 흑백 점검 중 고릅니다. 빨강·초록 상태 구분이 있다면 Deutan부터 보세요." },
        { title: "시뮬레이션 강도", body: "100%는 해당 색각이 완전히 없는 경우, 낮은 값은 약한 경우에 가깝습니다." },
        { title: "원본과 비교", body: "두 화면을 나란히 보고 색만으로 구분하던 요소가 비슷해지는지 찾으세요. 예시처럼 초록과 빨강이 비슷해지면 아이콘이나 문구를 더해야 합니다." },
      ],
    },
    en: {
      caption: "Add a design and choose a color vision type to compare it side by side with the original.",
      parts: [
        { t: "drop", title: "Add the design you want to review.", hint: "or try the sample design", m: 1 },
        { t: "chips", label: "View", items: ["Protan", "Deutan", "Tritan", "Grayscale"], active: [1], m: 2 },
        { t: "slider", label: "Simulation strength", value: "100%", pct: 100, m: 3 },
        { t: "swatches", colors: ["#16A34A", "#958951", "#DC2626", "#8F801B"], labels: ["Orig", "Deutan", "Orig", "Deutan"], m: 4 },
      ],
      notes: [
        { title: "Add a design", body: "Add a mockup or screenshot. Images are processed in your browser and never uploaded." },
        { title: "View", body: "Choose the red range (Protan), green range (Deutan), blue-yellow range (Tritan) or a grayscale check. Start with Deutan if you separate states by red and green." },
        { title: "Simulation strength", body: "100% models the full condition, lower values a milder form." },
        { title: "Compare with the original", body: "Look at both views side by side for elements that only differed by color. If green and red converge as in the sample, add an icon or label." },
      ],
    },
  },

  "text-scaling-checker": {
    ko: {
      caption: "코드를 넣고 검사 프리셋을 고르면 원본과 확대·간격 적용 결과를 나란히 비교합니다.",
      parts: [
        { t: "tabs", label: "소스 형식", items: ["HTML·텍스트", "JSX·TSX"], m: 1 },
        { t: "text", label: "검사할 HTML 또는 텍스트", value: "<section class=\"summary-card\">\n  <h2>이번 달 사용량</h2> …", mono: true },
        { t: "tabs", label: "검사 프리셋", items: ["텍스트 200%", "리플로 320px", "텍스트 간격"], m: 2 },
        { t: "buttons", items: ["예시 불러오기", "미리보기 적용"], m: 3 },
        { t: "rows", title: "감지된 문제 후보 1개", items: [{ label: "CLIP-001 세로 내용 잘림 가능성", value: "section", tone: "warn" }], m: 4 },
      ],
      notes: [
        { title: "소스 형식", body: "마크업은 HTML·텍스트, React 컴포넌트는 JSX·TSX를 고르고 코드와 CSS를 넣으세요. Tailwind 클래스를 쓰면 스타일을 만드는 옵션을 켭니다." },
        { title: "검사 프리셋", body: "글자를 두 배로 키우는 텍스트 200%, 좁은 화면을 재현하는 리플로 320px, WCAG 간격을 적용하는 텍스트 간격 중 고릅니다." },
        { title: "미리보기 적용", body: "실행하면 원본과 검사 결과가 나란히 나옵니다. 처음이라면 예시 불러오기로 결과 모양을 먼저 보세요." },
        { title: "문제 후보", body: "넘치거나 잘릴 가능성이 있는 요소를 보여줍니다. 후보는 자동 추정이므로 미리보기에서 직접 확인하고, 수동 확인 항목도 함께 점검하세요." },
      ],
    },
    en: {
      caption: "Add your code and choose a preset to compare the original with the scaled or spaced result.",
      parts: [
        { t: "tabs", label: "Source format", items: ["HTML or text", "JSX or TSX"], m: 1 },
        { t: "text", label: "HTML or text to check", value: "<section class=\"summary-card\">\n  <h2>Usage this month</h2> …", mono: true },
        { t: "tabs", label: "Test preset", items: ["200% text", "320px reflow", "Text spacing"], m: 2 },
        { t: "buttons", items: ["Load sample", "Build preview"], m: 3 },
        { t: "rows", title: "1 candidate detected", items: [{ label: "CLIP-001 possible vertical clipping", value: "section", tone: "warn" }], m: 4 },
      ],
      notes: [
        { title: "Source format", body: "Choose HTML or text for markup and JSX or TSX for React components, then add the code and CSS. Turn on the Tailwind option if you use its classes." },
        { title: "Test preset", body: "Choose 200% text to double the font size, 320px reflow to mimic a narrow screen, or text spacing to apply the WCAG spacing values." },
        { title: "Build preview", body: "Shows the original and the test result side by side. Load sample first to see what results look like." },
        { title: "Candidates", body: "Lists elements that may overflow or clip. Candidates are automatic guesses, so confirm them in the preview and work through the manual checks too." },
      ],
    },
  },

  "accessibility-checklist": {
    ko: {
      caption: "기준과 환경을 정해 체크리스트를 만들고, 항목마다 상태와 근거를 기록해 내보냅니다.",
      parts: [
        { t: "fields", items: [{ label: "프로젝트명", value: "고객센터 리뉴얼" }, { label: "적용 기준", value: "KWCAG 2.2", select: true }], m: 1 },
        { t: "check", label: "서비스 기능 · 입력 폼이 있나요? 예", on: true, m: 2 },
        { t: "rows", items: [{ label: "1.1.1 적절한 대체 텍스트", value: "통과", tone: "ok" }, { label: "3.3.2 레이블 제공", value: "이슈", tone: "bad" }, { label: "1.2.2 자막 제공", value: "해당 없음" }], m: 3 },
        { t: "buttons", items: ["CSV 다운로드", "Markdown 복사"], m: 4 },
      ],
      notes: [
        { title: "체크리스트 만들기", body: "프로젝트명, 적용 기준(KWCAG·WCAG 2.2), 목표 레벨, 테스트 환경, 운영 유형을 고르세요. AA를 고르면 A 항목도 함께 들어갑니다." },
        { title: "서비스 기능", body: "입력 폼·동영상·인증 같은 기능이 있는지 답하면 관련 없는 항목은 해당 없음 후보로 표시됩니다." },
        { title: "항목별 상태", body: "통과·이슈·검토 중·해당 없음을 고르고 메모와 근거 URL을 남깁니다. 역할·검사 축·상태로 걸러 볼 수 있고, 내용은 이 브라우저에 자동 저장됩니다." },
        { title: "내보내기", body: "Markdown으로 복사·다운로드하거나 CSV로 받아 이슈 트래커나 시트에 옮기세요." },
      ],
    },
    en: {
      caption: "Set the standard and environment to build a checklist, record status and evidence for each item, then export it.",
      parts: [
        { t: "fields", items: [{ label: "Project name", value: "Support center redesign" }, { label: "Standard", value: "KWCAG 2.2", select: true }], m: 1 },
        { t: "check", label: "Product features · has forms? Yes", on: true, m: 2 },
        { t: "rows", items: [{ label: "1.1.1 Text alternatives", value: "Passed", tone: "ok" }, { label: "3.3.2 Labels", value: "Issue", tone: "bad" }, { label: "1.2.2 Captions", value: "Not applicable" }], m: 3 },
        { t: "buttons", items: ["Download CSV", "Copy Markdown"], m: 4 },
      ],
      notes: [
        { title: "Build a checklist", body: "Choose the project name, standard (KWCAG or WCAG 2.2), target level, test environment and organization type. Choosing AA includes the Level A criteria." },
        { title: "Product features", body: "Answer whether the product has forms, video, authentication and so on. Unrelated items are marked as not applicable candidates." },
        { title: "Status per item", body: "Set passed, issue, in review or not applicable, and add notes and evidence URLs. Filter by role, axis or status. Everything saves automatically in this browser." },
        { title: "Export", body: "Copy or download Markdown, or download CSV to move the list into an issue tracker or sheet." },
      ],
    },
  },
};
