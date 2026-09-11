/* ============================================================
   텍스트 확대·간격 검사기: 감지 규칙 문구와 직접 확인 목록 (KO / EN)

   사용자 HTML·CSS 를 번역 딕셔너리에 넣지 않는다. 측정값은 Candidate 의
   detail 문자열로 따로 전달하고, 여기에는 고정 문구만 둔다.
   컨트롤 마이크로카피(버튼·필드·상태)는 컴포넌트의 로컬 DICT 에 있다.
   ============================================================ */
import type { Dict } from "../i18n";
import type { Preset, RuleId } from "./types";

/** 프리셋별 고정 "직접 확인" 목록 (기획서 7.8) */
export const MANUAL_CHECKS: Record<Preset, string[]> = {
  "text-200": ["t200.a", "t200.b", "t200.c", "t200.d", "t200.e"],
  "reflow-320": ["r320.a", "r320.b", "r320.c", "r320.d", "r320.e"],
  "text-spacing": ["spacing.a", "spacing.b", "spacing.c", "spacing.d", "spacing.e"],
};

export const RULE_IDS: RuleId[] = [
  "REFLOW-001",
  "REFLOW-002",
  "CLIP-001",
  "CLIP-002",
  "NOWRAP-001",
  "CONTROL-001",
  "FIXED-001",
  "SCROLL-001",
];

export const RULE_COPY: Dict = {
  ko: {
    "ts.rule.REFLOW-001.label": "페이지 가로 오버플로",
    "ts.rule.REFLOW-001.why":
      "문서가 검사 viewport 보다 넓어졌습니다. 페이지 전체를 좌우로 움직이며 읽어야 하는 상태입니다.",
    "ts.rule.REFLOW-001.fix":
      "고정 px width, min-width, 줄바꿈되지 않는 긴 문자열을 먼저 확인하세요. 가로 스크롤이 필요한 영역은 페이지가 아니라 그 영역 안에서만 스크롤되게 합니다.",

    "ts.rule.REFLOW-002.label": "화면 밖으로 벗어난 요소",
    "ts.rule.REFLOW-002.why":
      "이 요소의 오른쪽 경계가 viewport 를 넘어갑니다. 페이지 가로 오버플로의 직접적인 원인일 수 있습니다.",
    "ts.rule.REFLOW-002.fix":
      "고정 width 를 max-width 로 바꾸거나, 좁은 화면에서 한 열로 쌓이도록 배치를 조정하세요.",

    "ts.rule.CLIP-001.label": "세로 내용 잘림 가능성",
    "ts.rule.CLIP-001.why":
      "내용의 높이가 보이는 영역보다 큰데 세로 overflow 가 숨김 처리돼 있습니다. 아래쪽 문구나 기능이 사라질 수 있습니다.",
    "ts.rule.CLIP-001.fix":
      "고정 높이를 제거하거나 min-height 로 바꿔 콘텐츠가 자연스럽게 늘어나게 하세요.",

    "ts.rule.CLIP-002.label": "가로 내용 잘림 가능성",
    "ts.rule.CLIP-002.why":
      "내용의 너비가 보이는 영역보다 큰데 가로 overflow 가 숨김 처리돼 있습니다. 오른쪽 문구가 사라질 수 있습니다.",
    "ts.rule.CLIP-002.fix":
      "고정 width 를 풀거나 줄바꿈을 허용하세요. 말줄임이 의도라면 전체 문구를 다른 방법으로도 확인할 수 있어야 합니다.",

    "ts.rule.NOWRAP-001.label": "줄바꿈 차단 오버플로",
    "ts.rule.NOWRAP-001.why":
      "줄바꿈을 막아 둔 텍스트가 영역을 넘어갑니다. 문구가 길어지거나 번역되면 더 심해집니다.",
    "ts.rule.NOWRAP-001.fix":
      "이 문구가 반드시 한 줄이어야 하는지 확인하세요. 날짜나 코드가 아니라면 줄바꿈을 허용하는 편이 안전합니다.",

    "ts.rule.CONTROL-001.label": "컨트롤 문구 잘림 가능성",
    "ts.rule.CONTROL-001.why":
      "버튼·입력창 같은 control 안에서 문구 영역이 보이는 상자를 넘습니다. 확대하면 조작 대상을 읽기 어려워집니다.",
    "ts.rule.CONTROL-001.fix":
      "control 의 고정 크기를 풀고 padding 과 줄바꿈으로 문구를 담을 수 있게 하세요.",

    "ts.rule.FIXED-001.label": "고정 크기 영역 검토",
    "ts.rule.FIXED-001.why":
      "프리셋 적용 후 콘텐츠 높이가 늘었는데 고정 높이와 숨김 처리가 함께 걸려 있습니다.",
    "ts.rule.FIXED-001.fix":
      "고정 높이 대신 min-height 를 쓰고, 카드 안의 버튼·링크가 아래로 밀려 사라지지 않는지 확인하세요.",

    "ts.rule.SCROLL-001.label": "수평 스크롤 영역 검토",
    "ts.rule.SCROLL-001.why":
      "이 영역이 자체 가로 스크롤을 가집니다. 표·지도·다이어그램이라면 허용되는 예외일 수 있습니다.",
    "ts.rule.SCROLL-001.fix":
      "2차원 배치가 의미상 필요한 영역인지 판단하세요. 필요하다면 스크롤이 페이지 전체가 아니라 이 영역에만 생기는지 확인합니다.",

    "ts.manual.t200.a": "모든 문구와 control 이름이 끝까지 보이나요?",
    "ts.manual.t200.b": "텍스트가 다른 텍스트·아이콘·버튼과 겹치지 않나요?",
    "ts.manual.t200.c": "말줄임된 정보를 focus 나 활성화로 전체 확인할 수 있나요?",
    "ts.manual.t200.d": "글자를 키운 뒤에도 모든 기능을 사용할 수 있나요?",
    "ts.manual.t200.e": "100%와 200% 사이의 중간 단계에서도 손실이 없나요?",

    "ts.manual.r320.a": "페이지 전체를 좌우로 반복 이동하지 않고 읽을 수 있나요?",
    "ts.manual.r320.b": "여러 열이 의미를 잃지 않고 한 열이나 적절한 구조로 재배치되나요?",
    "ts.manual.r320.c": "navigation·sticky header·fixed control 이 본문을 가리지 않나요?",
    "ts.manual.r320.d": "표·지도처럼 수평 스크롤이 필요한 예외 영역만 따로 스크롤되나요?",
    "ts.manual.r320.e": "숨겨진 기능을 다른 control 로 다시 열 수 있나요?",

    "ts.manual.spacing.a": "줄·문단·글자·단어 간격을 넓혀도 문구가 잘리지 않나요?",
    "ts.manual.spacing.b": "버튼·탭·배지가 텍스트를 담을 만큼 늘어나거나 줄바꿈되나요?",
    "ts.manual.spacing.c": "고정 높이 카드와 tooltip 에서 내용이 사라지지 않나요?",
    "ts.manual.spacing.d": "간격 재정의가 author 의 !important 에 막히지 않나요?",
    "ts.manual.spacing.e": "한글·영문·숫자가 섞인 실제 콘텐츠로도 확인했나요?",
  },

  en: {
    "ts.rule.REFLOW-001.label": "Page horizontal overflow",
    "ts.rule.REFLOW-001.why":
      "The document became wider than the test viewport, so the page has to be scrolled sideways to read.",
    "ts.rule.REFLOW-001.fix":
      "Look first at fixed px widths, min-width, and long unbreakable strings. Where horizontal scrolling is justified, keep it inside that region rather than on the page.",

    "ts.rule.REFLOW-002.label": "Element extends past the viewport",
    "ts.rule.REFLOW-002.why":
      "This element's right edge goes beyond the viewport and may be the direct cause of page-level overflow.",
    "ts.rule.REFLOW-002.fix":
      "Replace a fixed width with max-width, or let the layout stack into one column on narrow screens.",

    "ts.rule.CLIP-001.label": "Possible vertical clipping",
    "ts.rule.CLIP-001.why":
      "The content is taller than its visible box while vertical overflow is hidden, so text or controls at the bottom can disappear.",
    "ts.rule.CLIP-001.fix":
      "Remove the fixed height or switch to min-height so the content can grow naturally.",

    "ts.rule.CLIP-002.label": "Possible horizontal clipping",
    "ts.rule.CLIP-002.why":
      "The content is wider than its visible box while horizontal overflow is hidden, so text on the right can disappear.",
    "ts.rule.CLIP-002.fix":
      "Release the fixed width or allow wrapping. If truncation is intentional, the full text must be available another way.",

    "ts.rule.NOWRAP-001.label": "Overflow with wrapping blocked",
    "ts.rule.NOWRAP-001.why":
      "Text that cannot wrap extends past its container. Longer or translated copy makes this worse.",
    "ts.rule.NOWRAP-001.fix":
      "Decide whether one line is essential. Unless it is a date or a code value, allowing wrapping is safer.",

    "ts.rule.CONTROL-001.label": "Possible clipping inside a control",
    "ts.rule.CONTROL-001.why":
      "The text area inside a button or field exceeds its visible box, so the label becomes hard to read when enlarged.",
    "ts.rule.CONTROL-001.fix":
      "Let the control size itself from its content with padding and wrapping instead of a fixed box.",

    "ts.rule.FIXED-001.label": "Fixed-size region to review",
    "ts.rule.FIXED-001.why":
      "Content grew taller after the preset was applied while a fixed height and hidden overflow are both in place.",
    "ts.rule.FIXED-001.fix":
      "Use min-height instead of a fixed height and confirm that buttons or links inside the card are not pushed out of view.",

    "ts.rule.SCROLL-001.label": "Horizontal scroll region to review",
    "ts.rule.SCROLL-001.why":
      "This region scrolls horizontally on its own. For a table, map, or diagram that can be an acceptable exception.",
    "ts.rule.SCROLL-001.fix":
      "Decide whether a two-dimensional layout is required here. If it is, confirm the scrolling stays inside this region rather than the page.",

    "ts.manual.t200.a": "Is every label and control name still fully visible?",
    "ts.manual.t200.b": "Does any text overlap other text, icons, or buttons?",
    "ts.manual.t200.c": "Can truncated information be revealed through focus or activation?",
    "ts.manual.t200.d": "Is every feature still operable after text is enlarged?",
    "ts.manual.t200.e": "Do intermediate steps between 100% and 200% stay intact?",

    "ts.manual.r320.a": "Can the page be read without repeated sideways scrolling?",
    "ts.manual.r320.b": "Do columns rearrange into one column or another meaningful structure?",
    "ts.manual.r320.c": "Do navigation, sticky headers, or fixed controls obscure the content?",
    "ts.manual.r320.d": "Do only justified regions such as tables scroll horizontally?",
    "ts.manual.r320.e": "Can hidden functionality be reopened through another control?",

    "ts.manual.spacing.a": "Does text survive wider line, paragraph, letter, and word spacing?",
    "ts.manual.spacing.b": "Do buttons, tabs, and badges grow or wrap to fit their text?",
    "ts.manual.spacing.c": "Does content stay visible in fixed-height cards and tooltips?",
    "ts.manual.spacing.d": "Do the spacing overrides survive an author !important rule?",
    "ts.manual.spacing.e": "Did you test realistic product copy with mixed scripts and numbers?",
  },
};
