/* ============================================================
   WCAG 2.2 성공 기준: Level A 31개 + Level AA 24개

   AA 목표는 AA 항목만 고르는 것이 아니라 **A 와 AA 를 모두 포함한다.**
   그래서 A 선택 시 31개, AA 선택 시 55개가 생성된다.
   4.1.1 Parsing 은 WCAG 2.2 에서 제거됐으므로 포함하지 않는다.
   AAA 는 1차 출시 범위에서 제외한다.
   ============================================================ */
import { wcagUnderstanding, type ChecklistDefinition } from "./types";

/** 정의 하나를 만들 때 반복되는 필드를 채운다. Understanding 문서 slug 로 출처를 만든다. */
type Spec = Omit<ChecklistDefinition, "id" | "standard" | "sourceUrl"> & {
  /** W3C Understanding 문서 slug */
  doc: string;
};

function sc(spec: Spec): ChecklistDefinition {
  const { doc, ...rest } = spec;
  return {
    ...rest,
    id: `wcag-${spec.criterion}`,
    standard: "wcag-2.2",
    sourceUrl: wcagUnderstanding(doc),
  };
}

export const WCAG_ITEMS: ChecklistDefinition[] = [
  /* ── 1. 인식 가능 (Perceivable) ───────────────────────── */
  sc({
    criterion: "1.1.1",
    level: "A",
    doc: "non-text-content",
    title: { ko: "비텍스트 콘텐츠", en: "Non-text Content" },
    question: {
      ko: "이미지·아이콘·차트·캡차 등 모든 비텍스트 콘텐츠에 목적에 맞는 대체 텍스트가 있나요?",
      en: "Does every non-text item have a text alternative that serves an equivalent purpose?",
    },
    howToCheck: {
      ko: [
        "이미지를 정보·장식·기능 세 종류로 나누고 각각 다른 규칙을 적용합니다.",
        "장식용에는 빈 alt 를, 기능용에는 수행할 동작을 적습니다.",
        "차트·지도처럼 정보가 많은 대상은 본문·표로 같은 정보를 제공합니다.",
      ],
      en: [
        "Classify images as informative, decorative, or functional and apply a different rule to each.",
        "Use an empty alt for decoration and describe the action for functional images.",
        "For charts and maps, provide the same information as text or a table nearby.",
      ],
    },
    evidence: {
      ko: "검토 화면과 이미지 분류 결과, 수정한 alt 문구를 메모에 남깁니다.",
      en: "Record the screens reviewed, how images were classified, and the alt text changed.",
    },
    axis: "structure-semantics",
    roles: ["planning", "publishing"],
    phases: ["design", "implementation", "qa"],
    featureFlags: [],
    relatedTool: "html-accessibility-checker",
  }),
  sc({
    criterion: "1.2.1",
    level: "A",
    doc: "audio-only-and-video-only-prerecorded",
    title: {
      ko: "오디오 전용 및 비디오 전용(사전 녹화)",
      en: "Audio-only and Video-only (Prerecorded)",
    },
    question: {
      ko: "소리만 있는 콘텐츠에 원고를, 소리 없는 영상에 설명이나 원고를 제공하나요?",
      en: "Do audio-only items have a transcript and video-only items a description or transcript?",
    },
    howToCheck: {
      ko: [
        "팟캐스트·안내 음성 등 오디오 전용 자료에 텍스트 원고가 있는지 확인합니다.",
        "자막 없는 무성 영상에 내용을 설명하는 텍스트나 음성 설명이 있는지 확인합니다.",
      ],
      en: [
        "Confirm audio-only assets such as podcasts and voice guides have a text transcript.",
        "Confirm silent video has a text description or an audio description of the content.",
      ],
    },
    evidence: {
      ko: "해당 자료 목록과 제공한 대체 수단을 메모에 남깁니다.",
      en: "Record the assets and the alternative provided for each.",
    },
    axis: "structure-semantics",
    roles: ["planning"],
    phases: ["planning", "implementation", "operation"],
    featureFlags: ["media_prerecorded"],
  }),
  sc({
    criterion: "1.2.2",
    level: "A",
    doc: "captions-prerecorded",
    title: { ko: "자막(사전 녹화)", en: "Captions (Prerecorded)" },
    question: {
      ko: "녹화된 영상의 모든 음성에 동기화된 자막이 있나요?",
      en: "Do all prerecorded videos with audio have synchronized captions?",
    },
    howToCheck: {
      ko: [
        "영상 목록을 만들고 자막 트랙이 붙어 있는지 확인합니다.",
        "자동 생성 자막이라면 표본을 실제 발화와 대조합니다.",
        "대사 외 의미 있는 소리와 화자 구분이 자막에 있는지 확인합니다.",
      ],
      en: [
        "List the videos and confirm a caption track is attached.",
        "If captions are auto-generated, sample them against the actual speech.",
        "Confirm meaningful sounds and speaker changes appear in the captions.",
      ],
    },
    evidence: {
      ko: "영상 목록과 자막 생성·검수 담당을 메모에 남깁니다.",
      en: "Record the video list and who produces and reviews the captions.",
    },
    axis: "structure-semantics",
    roles: ["planning"],
    phases: ["planning", "implementation", "operation"],
    featureFlags: ["media_prerecorded"],
  }),
  sc({
    criterion: "1.2.3",
    level: "A",
    doc: "audio-description-or-media-alternative-prerecorded",
    title: {
      ko: "음성 해설 또는 미디어 대체 수단(사전 녹화)",
      en: "Audio Description or Media Alternative (Prerecorded)",
    },
    question: {
      ko: "영상에서 말로 설명되지 않는 시각 정보를 음성 해설이나 텍스트로 제공하나요?",
      en: "Is visual information not spoken in the video provided as audio description or text?",
    },
    howToCheck: {
      ko: [
        "화면에만 나오는 수치·도표·동작이 음성으로도 전달되는지 확인합니다.",
        "전달되지 않는다면 음성 해설 트랙 또는 전체 대본을 제공했는지 확인합니다.",
      ],
      en: [
        "Check whether numbers, diagrams, and actions shown only on screen are also spoken.",
        "If not, confirm an audio description track or a full text alternative exists.",
      ],
    },
    evidence: {
      ko: "영상별 시각 정보 유무와 제공한 대체 수단을 메모에 남깁니다.",
      en: "Record which videos carry visual-only information and the alternative provided.",
    },
    axis: "structure-semantics",
    roles: ["planning"],
    phases: ["planning", "implementation"],
    featureFlags: ["media_prerecorded"],
  }),
  sc({
    criterion: "1.3.1",
    level: "A",
    doc: "info-and-relationships",
    title: { ko: "정보와 관계", en: "Info and Relationships" },
    question: {
      ko: "시각적으로 표현된 구조와 관계가 마크업으로도 전달되나요?",
      en: "Are visually conveyed structure and relationships also available in the markup?",
    },
    howToCheck: {
      ko: [
        "제목·목록·표·인용을 시각 스타일이 아니라 의미 요소로 작성했는지 확인합니다.",
        "폼의 레이블·그룹·설명이 프로그래밍적으로 연결됐는지 확인합니다.",
        "랜드마크(header·nav·main·footer)가 화면 구역과 일치하는지 확인합니다.",
      ],
      en: [
        "Confirm headings, lists, tables, and quotes use semantic elements rather than styling.",
        "Confirm form labels, groups, and descriptions are programmatically associated.",
        "Confirm landmarks such as header, nav, main, and footer match the visual regions.",
      ],
    },
    evidence: {
      ko: "구조를 바꾼 컴포넌트와 적용한 의미 요소를 메모에 남깁니다.",
      en: "Record the components restructured and the semantic elements applied.",
    },
    axis: "structure-semantics",
    roles: ["publishing"],
    phases: ["implementation", "qa"],
    featureFlags: [],
    relatedTool: "html-accessibility-checker",
  }),
  sc({
    criterion: "1.3.2",
    level: "A",
    doc: "meaningful-sequence",
    title: { ko: "의미 있는 순서", en: "Meaningful Sequence" },
    question: {
      ko: "읽는 순서가 중요한 콘텐츠에서 DOM 순서가 의미를 유지하나요?",
      en: "Where reading order matters, does the DOM order preserve the meaning?",
    },
    howToCheck: {
      ko: [
        "CSS 를 끈 상태로 문서를 위에서 아래로 읽어 봅니다.",
        "flex order·grid 배치·absolute 위치로 순서를 바꾼 영역을 찾습니다.",
      ],
      en: [
        "Read the page top to bottom with author styles disabled.",
        "Find regions where flex order, grid placement, or absolute positioning changed the sequence.",
      ],
    },
    evidence: {
      ko: "순서가 어긋난 컴포넌트와 재배치 방법을 메모에 남깁니다.",
      en: "Record which components were out of order and how you rearranged them.",
    },
    axis: "structure-semantics",
    roles: ["design", "publishing"],
    phases: ["design", "implementation"],
    featureFlags: [],
    relatedTool: "html-accessibility-checker",
  }),
  sc({
    criterion: "1.3.3",
    level: "A",
    doc: "sensory-characteristics",
    title: { ko: "감각 특성", en: "Sensory Characteristics" },
    question: {
      ko: "안내 문구가 모양·위치·크기·소리에만 의존하지 않나요?",
      en: "Do instructions avoid relying only on shape, location, size, or sound?",
    },
    howToCheck: {
      ko: [
        "\"오른쪽\", \"아래 원형 버튼\", \"초록 항목\" 같은 표현을 검색합니다.",
        "각 표현에 이름·레이블·순서 같은 다른 단서를 덧붙였는지 확인합니다.",
      ],
      en: [
        "Search for wording such as on the right, the round button below, or the green item.",
        "Confirm each also names the control, its label, or its position in a sequence.",
      ],
    },
    evidence: {
      ko: "수정한 문구 목록을 메모에 남깁니다.",
      en: "Record the instructions you rewrote.",
    },
    axis: "structure-semantics",
    roles: ["planning", "design"],
    phases: ["planning", "design", "qa"],
    featureFlags: [],
  }),
  sc({
    criterion: "1.3.4",
    level: "AA",
    doc: "orientation",
    title: { ko: "방향", en: "Orientation" },
    question: {
      ko: "가로·세로 중 한 방향으로만 볼 수 있게 강제하지 않나요?",
      en: "Does the content avoid restricting the view to a single display orientation?",
    },
    howToCheck: {
      ko: [
        "기기를 가로·세로로 돌려 레이아웃이 모두 동작하는지 확인합니다.",
        "\"가로 모드로 돌려주세요\" 같은 차단 화면이 있는지 확인합니다.",
        "본질적으로 한 방향이 필요한 기능(악보·은행 수표 촬영 등)인지 따로 판단합니다.",
      ],
      en: [
        "Rotate the device and confirm both orientations work.",
        "Look for blocking screens that require the user to rotate.",
        "Decide separately whether a single orientation is essential for that feature.",
      ],
    },
    evidence: {
      ko: "회전 테스트 결과와 예외로 둔 화면을 메모에 남깁니다.",
      en: "Record the rotation test result and any screen treated as an exception.",
    },
    axis: "structure-semantics",
    roles: ["design", "publishing"],
    phases: ["design", "qa"],
    featureFlags: [],
  }),
  sc({
    criterion: "1.3.5",
    level: "AA",
    doc: "identify-input-purpose",
    title: { ko: "입력 목적 식별", en: "Identify Input Purpose" },
    question: {
      ko: "이름·연락처·주소 같은 개인정보 입력란에 autocomplete 속성을 지정했나요?",
      en: "Do fields that collect a user's own information declare an autocomplete value?",
    },
    howToCheck: {
      ko: [
        "이름, 이메일, 전화, 주소, 생년월일, 카드 정보 필드를 모읍니다.",
        "각 필드에 표준 autocomplete 토큰이 지정됐는지 확인합니다.",
        "자동완성을 일부러 막고 있는 코드가 있는지 확인합니다.",
      ],
      en: [
        "List fields for name, email, phone, address, birth date, and payment details.",
        "Confirm each declares the correct standard autocomplete token.",
        "Check whether any code deliberately blocks autofill.",
      ],
    },
    evidence: {
      ko: "필드별 autocomplete 값과 예외를 메모에 남깁니다.",
      en: "Record the autocomplete value for each field and any exception.",
    },
    axis: "structure-semantics",
    roles: ["publishing"],
    phases: ["implementation", "qa"],
    featureFlags: ["forms"],
    relatedTool: "html-accessibility-checker",
  }),
  sc({
    criterion: "1.2.4",
    level: "AA",
    doc: "captions-live",
    title: { ko: "자막(실시간)", en: "Captions (Live)" },
    question: {
      ko: "실시간 방송·웨비나에 실시간 자막을 제공하나요?",
      en: "Are live captions provided for real-time audio content?",
    },
    howToCheck: {
      ko: [
        "라이브 방송·웨비나·실시간 상담 중 음성이 포함된 것을 모읍니다.",
        "실시간 자막 제공 수단(속기·자동 자막)과 담당을 확인합니다.",
      ],
      en: [
        "List live broadcasts, webinars, and real-time sessions that include audio.",
        "Confirm how live captions are produced and who is responsible.",
      ],
    },
    evidence: {
      ko: "실시간 콘텐츠 유형과 자막 제공 방식을 메모에 남깁니다.",
      en: "Record the live content types and how captions are supplied.",
    },
    axis: "structure-semantics",
    roles: ["planning"],
    phases: ["planning", "operation"],
    featureFlags: ["media_live"],
  }),
  sc({
    criterion: "1.2.5",
    level: "AA",
    doc: "audio-description-prerecorded",
    title: { ko: "음성 해설(사전 녹화)", en: "Audio Description (Prerecorded)" },
    question: {
      ko: "녹화 영상에 음성 해설 트랙을 제공하나요?",
      en: "Is an audio description track provided for prerecorded video?",
    },
    howToCheck: {
      ko: [
        "영상에서 시각으로만 전달되는 정보를 목록으로 만듭니다.",
        "음성 해설 트랙을 제공했는지, 대본으로 대신하고 있지는 않은지 확인합니다.",
      ],
      en: [
        "List the information each video conveys visually only.",
        "Confirm an audio description track exists rather than only a transcript.",
      ],
    },
    evidence: {
      ko: "영상별 해설 제공 여부와 제작 일정을 메모에 남깁니다.",
      en: "Record which videos have descriptions and the production schedule.",
    },
    axis: "structure-semantics",
    roles: ["planning"],
    phases: ["planning", "operation"],
    featureFlags: ["media_prerecorded"],
  }),
  sc({
    criterion: "1.4.1",
    level: "A",
    doc: "use-of-color",
    title: { ko: "색의 사용", en: "Use of Color" },
    question: {
      ko: "색만으로 정보를 구분하거나 상태를 알리는 곳이 없나요?",
      en: "Is color never the only way information or state is conveyed?",
    },
    howToCheck: {
      ko: [
        "상태 배지, 그래프 범례, 필수 표시, 유효성 오류, 본문 링크를 모읍니다.",
        "각각에 텍스트·아이콘·밑줄·패턴 중 하나가 함께 있는지 확인합니다.",
        "색각이상 시뮬레이터로 구분이 사라지는 조합을 찾습니다.",
      ],
      en: [
        "List status badges, chart legends, required markers, validation errors, and inline links.",
        "Confirm each also carries text, an icon, an underline, or a pattern.",
        "Use the color blindness simulator to find pairs that stop being distinguishable.",
      ],
    },
    evidence: {
      ko: "확인한 조합과 추가한 비색상 단서를 메모에 남깁니다.",
      en: "Record the pairs reviewed and the non-color cues you added.",
    },
    axis: "color",
    roles: ["design"],
    phases: ["design", "qa"],
    featureFlags: [],
    relatedTool: "color-blindness-simulator",
  }),
  sc({
    criterion: "1.4.2",
    level: "A",
    doc: "audio-control",
    title: { ko: "오디오 제어", en: "Audio Control" },
    question: {
      ko: "3초 넘게 자동 재생되는 소리를 멈추거나 음량을 따로 조절할 수 있나요?",
      en: "Can audio that plays automatically for more than three seconds be paused or controlled?",
    },
    howToCheck: {
      ko: [
        "진입 직후 소리가 나는 배경 음악·영상·광고를 확인합니다.",
        "정지·음소거 컨트롤이 페이지 앞부분에서 키보드로 도달 가능한지 확인합니다.",
      ],
      en: [
        "Check for background music, video, or ads that sound on load.",
        "Confirm a pause or mute control is early in the page and reachable by keyboard.",
      ],
    },
    evidence: {
      ko: "자동 재생 요소와 제어 방법을 메모에 남깁니다.",
      en: "Record the autoplaying elements and how they can be controlled.",
    },
    axis: "dynamic-status",
    roles: ["planning", "publishing"],
    phases: ["implementation", "qa", "operation"],
    featureFlags: ["moving_content", "media_prerecorded"],
  }),
  sc({
    criterion: "1.4.3",
    level: "AA",
    doc: "contrast-minimum",
    title: { ko: "명도 대비(최소)", en: "Contrast (Minimum)" },
    question: {
      ko: "일반 텍스트 4.5:1, 큰 텍스트 3:1 기준을 실제 사용 색상에서 만족하나요?",
      en: "Does text meet 4.5:1, or 3:1 for large text, in the colors actually shipped?",
    },
    howToCheck: {
      ko: [
        "본문·버튼·플레이스홀더·비활성 안내 등 실제 색상 조합을 수집합니다.",
        "명도대비 검사기로 각 조합을 측정합니다.",
        "이미지·그라디언트 위 텍스트는 가장 밝은 지점과 어두운 지점을 각각 측정합니다.",
      ],
      en: [
        "Collect the real pairs: body text, buttons, placeholders, and hint text.",
        "Measure each pair with the contrast checker.",
        "For text over images or gradients, measure the lightest and darkest points behind it.",
      ],
    },
    evidence: {
      ko: "검사한 조합, 비율, 수정한 토큰 값을 메모에 남깁니다.",
      en: "Record the pairs tested, their ratios, and the token values you changed.",
    },
    axis: "color",
    roles: ["design"],
    phases: ["design", "qa"],
    featureFlags: [],
    relatedTool: "color-contrast-checker",
  }),
  sc({
    criterion: "1.4.4",
    level: "AA",
    doc: "resize-text",
    title: { ko: "텍스트 크기 조정", en: "Resize Text" },
    question: {
      ko: "텍스트를 200%까지 키워도 내용과 기능이 잘리거나 가려지지 않나요?",
      en: "Can text be resized up to 200% without losing content or functionality?",
    },
    howToCheck: {
      ko: [
        "텍스트 확대 검사기로 200% 조건에서 잘림 후보를 찾습니다.",
        "실제 브라우저 확대를 100%부터 200%까지 단계별로 확인합니다.",
        "고정 height 와 overflow: hidden 을 함께 쓴 카드·버튼을 우선 확인합니다.",
      ],
      en: [
        "Use the text scaling checker to find clipping candidates at 200%.",
        "Step through real browser zoom from 100% to 200%.",
        "Start with cards and buttons that combine a fixed height with hidden overflow.",
      ],
    },
    evidence: {
      ko: "확대 테스트한 화면과 수정한 CSS 를 메모에 남깁니다.",
      en: "Record the screens tested and the CSS you changed.",
    },
    axis: "typography-reflow",
    roles: ["design", "publishing"],
    phases: ["implementation", "qa"],
    featureFlags: [],
    relatedTool: "text-scaling-checker",
  }),
  sc({
    criterion: "1.4.5",
    level: "AA",
    doc: "images-of-text",
    title: { ko: "이미지로 된 텍스트", en: "Images of Text" },
    question: {
      ko: "실제 텍스트로 표현할 수 있는 내용을 이미지로 만들지 않았나요?",
      en: "Is text presented as real text rather than an image wherever possible?",
    },
    howToCheck: {
      ko: [
        "배너·프로모션·인포그래픽에 글자가 이미지로 들어간 곳을 찾습니다.",
        "로고처럼 시각 표현이 본질적인 경우만 예외로 남깁니다.",
      ],
      en: [
        "Find banners, promotions, and infographics that bake text into an image.",
        "Keep only cases where the particular presentation is essential, such as a logo.",
      ],
    },
    evidence: {
      ko: "이미지 텍스트 위치와 대체 계획을 메모에 남깁니다.",
      en: "Record where images of text appear and the plan to replace them.",
    },
    axis: "typography-reflow",
    roles: ["design", "publishing"],
    phases: ["design", "operation"],
    featureFlags: [],
    relatedTool: "text-scaling-checker",
  }),
  sc({
    criterion: "1.4.10",
    level: "AA",
    doc: "reflow",
    title: { ko: "리플로", en: "Reflow" },
    question: {
      ko: "320 CSS px 너비에서 가로·세로 두 방향 스크롤 없이 내용을 볼 수 있나요?",
      en: "Does content work at 320 CSS pixels wide without two-dimensional scrolling?",
    },
    howToCheck: {
      ko: [
        "텍스트 확대 검사기의 리플로 320px 프리셋으로 가로 오버플로를 찾습니다.",
        "320px 보다 큰 고정 width, min-width, 고정 위치 요소를 찾습니다.",
        "표·지도·다이어그램처럼 2차원 배치가 필요한 예외를 따로 기록합니다.",
      ],
      en: [
        "Use the 320px reflow preset in the text scaling checker to find horizontal overflow.",
        "Find fixed widths, min-widths, and fixed-position elements larger than 320px.",
        "Note exceptions that genuinely need two dimensions, such as tables, maps, and diagrams.",
      ],
    },
    evidence: {
      ko: "오버플로가 생긴 컴포넌트와 수정한 레이아웃을 메모에 남깁니다.",
      en: "Record the overflowing components and the layout changes you made.",
    },
    axis: "typography-reflow",
    roles: ["design", "publishing"],
    phases: ["design", "implementation", "qa"],
    featureFlags: [],
    relatedTool: "text-scaling-checker",
  }),
  sc({
    criterion: "1.4.11",
    level: "AA",
    doc: "non-text-contrast",
    title: { ko: "비텍스트 명도 대비", en: "Non-text Contrast" },
    question: {
      ko: "컨트롤 경계, 상태 표시, 의미 있는 그래픽이 인접 색과 3:1 이상 대비되나요?",
      en: "Do control boundaries, states, and meaningful graphics reach 3:1 against adjacent colors?",
    },
    howToCheck: {
      ko: [
        "입력창 테두리, 체크박스, 토글, 초점 표시, 차트 선·막대를 모읍니다.",
        "각 요소를 인접 배경과 비교해 3:1 이상인지 측정합니다.",
        "비활성 상태처럼 예외로 볼 수 있는 경우를 구분해 기록합니다.",
      ],
      en: [
        "List input borders, checkboxes, toggles, focus indicators, and chart lines or bars.",
        "Measure each against its adjacent background for at least 3:1.",
        "Note cases treated as exceptions, such as disabled controls.",
      ],
    },
    evidence: {
      ko: "측정한 요소와 비율, 조정한 색상 토큰을 메모에 남깁니다.",
      en: "Record the elements measured, their ratios, and the color tokens you adjusted.",
    },
    axis: "color",
    roles: ["design"],
    phases: ["design", "qa"],
    featureFlags: [],
    relatedTool: "color-contrast-checker",
  }),
  sc({
    criterion: "1.4.12",
    level: "AA",
    doc: "text-spacing",
    title: { ko: "텍스트 간격", en: "Text Spacing" },
    question: {
      ko: "줄·문단·글자·단어 간격을 기준값으로 넓혀도 내용이 사라지지 않나요?",
      en: "Does content survive user overrides of line, paragraph, letter, and word spacing?",
    },
    howToCheck: {
      ko: [
        "텍스트 확대 검사기의 텍스트 간격 프리셋으로 잘림 후보를 찾습니다.",
        "버튼·배지·단일 행 입력처럼 높이가 제한된 컴포넌트를 우선 확인합니다.",
        "한국어·영어·숫자가 섞인 실제 문구로 확인합니다.",
      ],
      en: [
        "Use the text spacing preset in the text scaling checker to find clipping candidates.",
        "Start with height-constrained components: buttons, badges, and single-line fields.",
        "Test with realistic strings that mix languages and numbers.",
      ],
    },
    evidence: {
      ko: "간격 적용 시 깨진 컴포넌트와 수정 내용을 메모에 남깁니다.",
      en: "Record the components that broke under the spacing values and how you fixed them.",
    },
    axis: "typography-reflow",
    roles: ["design", "publishing"],
    phases: ["implementation", "qa"],
    featureFlags: [],
    relatedTool: "text-scaling-checker",
  }),
  sc({
    criterion: "1.4.13",
    level: "AA",
    doc: "content-on-hover-or-focus",
    title: { ko: "포인터 호버 또는 포커스 시 콘텐츠", en: "Content on Hover or Focus" },
    question: {
      ko: "호버·포커스로 나타나는 콘텐츠를 닫을 수 있고, 가리키는 동안 유지되나요?",
      en: "Can hover or focus content be dismissed, hovered over, and kept visible?",
    },
    howToCheck: {
      ko: [
        "툴팁·드롭다운·미리보기 팝오버를 모읍니다.",
        "Esc 등으로 닫히는지, 팝업 위로 포인터를 옮겨도 사라지지 않는지 확인합니다.",
        "팝업이 원래 콘텐츠를 가리지 않는지 확인합니다.",
      ],
      en: [
        "List tooltips, dropdowns, and preview popovers.",
        "Confirm they can be dismissed, for example with Esc, and stay open when hovered.",
        "Confirm the popup does not obscure the content that triggered it.",
      ],
    },
    evidence: {
      ko: "확인한 팝업 컴포넌트와 닫기·유지 동작을 메모에 남깁니다.",
      en: "Record the popup components reviewed and their dismiss and persist behavior.",
    },
    axis: "dynamic-status",
    roles: ["design", "publishing"],
    phases: ["design", "implementation", "qa"],
    featureFlags: [],
  }),

  /* ── 2. 운용 가능 (Operable) ──────────────────────────── */
  sc({
    criterion: "2.1.1",
    level: "A",
    doc: "keyboard",
    title: { ko: "키보드", en: "Keyboard" },
    question: {
      ko: "모든 기능을 키보드만으로 실행할 수 있나요?",
      en: "Can all functionality be operated through a keyboard interface?",
    },
    howToCheck: {
      ko: [
        "주요 과업을 Tab·Enter·Space·방향키만으로 끝까지 수행합니다.",
        "div·span 에 클릭 핸들러만 붙은 가짜 버튼을 찾습니다.",
        "hover 로만 열리는 메뉴가 키보드로도 열리는지 확인합니다.",
      ],
      en: [
        "Complete each key task using only Tab, Enter, Space, and arrow keys.",
        "Find div or span elements that behave as buttons with a click handler only.",
        "Confirm hover-only menus can also be opened from the keyboard.",
      ],
    },
    evidence: {
      ko: "테스트한 과업과 키보드로 막힌 지점을 메모에 남깁니다.",
      en: "Record the tasks tested and every point where the keyboard failed.",
    },
    axis: "keyboard-focus",
    roles: ["publishing"],
    phases: ["implementation", "qa"],
    featureFlags: [],
  }),
  sc({
    criterion: "2.1.2",
    level: "A",
    doc: "no-keyboard-trap",
    title: { ko: "키보드 함정 없음", en: "No Keyboard Trap" },
    question: {
      ko: "키보드로 들어간 영역에서 표준 키만으로 빠져나올 수 있나요?",
      en: "Can keyboard focus always leave a component using standard keys?",
    },
    howToCheck: {
      ko: [
        "모달, 날짜 선택기, 에디터, 임베드 플레이어에 들어갔다 나와 봅니다.",
        "빠져나오는 방법이 표준과 다르면 화면에 안내가 있는지 확인합니다.",
      ],
      en: [
        "Enter and leave dialogs, date pickers, editors, and embedded players.",
        "If leaving requires a non-standard key, confirm the method is documented on screen.",
      ],
    },
    evidence: {
      ko: "초점이 갇혔던 컴포넌트와 수정 방법을 메모에 남깁니다.",
      en: "Record the components that trapped focus and how you fixed them.",
    },
    axis: "keyboard-focus",
    roles: ["publishing"],
    phases: ["implementation", "qa"],
    featureFlags: [],
  }),
  sc({
    criterion: "2.1.4",
    level: "A",
    doc: "character-key-shortcuts",
    title: { ko: "문자 키 단축키", en: "Character Key Shortcuts" },
    question: {
      ko: "수식키 없는 한 글자 단축키를 끄거나 바꾸거나 초점 한정으로 만들 수 있나요?",
      en: "Can single-character shortcuts be turned off, remapped, or limited to focus?",
    },
    howToCheck: {
      ko: [
        "keydown·keypress 핸들러에서 수식키 없는 단일 문자 처리를 찾습니다.",
        "해당 단축키를 끄거나 재설정할 설정이 있는지 확인합니다.",
      ],
      en: [
        "Search keydown and keypress handlers for single characters without a modifier.",
        "Confirm a setting exists to disable or remap them.",
      ],
    },
    evidence: {
      ko: "단축키 목록과 설정 위치를 메모에 남깁니다.",
      en: "Record the shortcuts and where they can be configured.",
    },
    axis: "keyboard-focus",
    roles: ["publishing"],
    phases: ["implementation", "qa"],
    featureFlags: [],
  }),
  sc({
    criterion: "2.2.1",
    level: "A",
    doc: "timing-adjustable",
    title: { ko: "시간 조절 가능", en: "Timing Adjustable" },
    question: {
      ko: "시간 제한을 끄거나 조절하거나 연장할 수 있나요?",
      en: "Can each time limit be turned off, adjusted, or extended?",
    },
    howToCheck: {
      ko: [
        "세션 만료, 자동 로그아웃, 인증번호 유효시간, 예약 대기를 모읍니다.",
        "만료 전 경고와 연장 수단이 있는지 확인합니다.",
        "실시간 경매처럼 제한이 본질적인 경우인지 따로 판단합니다.",
      ],
      en: [
        "List session expiry, auto sign-out, one-time code validity, and booking holds.",
        "Confirm a warning appears before expiry and the limit can be extended.",
        "Decide separately whether the limit is essential, as in a real-time auction.",
      ],
    },
    evidence: {
      ko: "시간 제한 목록, 경고 시점, 연장 방법을 메모에 남깁니다.",
      en: "Record each limit, when the warning appears, and how it can be extended.",
    },
    axis: "cognitive-process",
    roles: ["planning", "publishing"],
    phases: ["planning", "implementation", "qa"],
    featureFlags: ["timed_content", "authentication"],
  }),
  sc({
    criterion: "2.2.2",
    level: "A",
    doc: "pause-stop-hide",
    title: { ko: "일시 정지, 정지, 숨기기", en: "Pause, Stop, Hide" },
    question: {
      ko: "자동으로 움직이거나 갱신되는 콘텐츠를 멈추거나 숨길 수 있나요?",
      en: "Can moving, blinking, or auto-updating content be paused, stopped, or hidden?",
    },
    howToCheck: {
      ko: [
        "캐러셀, 티커, 자동 갱신 목록, 애니메이션 배너를 모읍니다.",
        "각각에 키보드로 도달 가능한 정지·숨김 컨트롤이 있는지 확인합니다.",
        "prefers-reduced-motion 에서 움직임이 줄어드는지 확인합니다.",
      ],
      en: [
        "List carousels, tickers, auto-updating lists, and animated banners.",
        "Confirm each has a keyboard-reachable pause or hide control.",
        "Confirm motion reduces when prefers-reduced-motion is set.",
      ],
    },
    evidence: {
      ko: "움직이는 요소와 제공한 정지 수단을 메모에 남깁니다.",
      en: "Record the moving elements and the pause mechanism provided.",
    },
    axis: "dynamic-status",
    roles: ["planning", "publishing"],
    phases: ["design", "implementation", "qa"],
    featureFlags: ["moving_content"],
  }),
  sc({
    criterion: "2.3.1",
    level: "A",
    doc: "three-flashes-or-below-threshold",
    title: { ko: "3회 섬광 또는 threshold 이하", en: "Three Flashes or Below Threshold" },
    question: {
      ko: "1초에 3회를 넘는 섬광이 없나요?",
      en: "Is there nothing that flashes more than three times in one second?",
    },
    howToCheck: {
      ko: [
        "로딩 애니메이션, 강조 효과, 영상·광고 소재의 빠른 명멸을 확인합니다.",
        "외부에서 들어오는 배너·임베드도 같은 기준으로 확인합니다.",
      ],
      en: [
        "Check loading animations, highlight effects, and video or ad assets for rapid flashing.",
        "Apply the same check to third-party banners and embeds.",
      ],
    },
    evidence: {
      ko: "검토한 소재와 판단 근거를 메모에 남깁니다.",
      en: "Record the assets reviewed and the basis for your decision.",
    },
    axis: "dynamic-status",
    roles: ["design", "publishing"],
    phases: ["design", "qa", "operation"],
    featureFlags: [],
  }),
  sc({
    criterion: "2.4.1",
    level: "A",
    doc: "bypass-blocks",
    title: { ko: "블록 건너뛰기", en: "Bypass Blocks" },
    question: {
      ko: "여러 페이지에서 반복되는 블록을 건너뛸 수단이 있나요?",
      en: "Is there a mechanism to bypass blocks repeated across pages?",
    },
    howToCheck: {
      ko: [
        "첫 Tab 에서 본문 바로가기 링크가 보이는지 확인합니다.",
        "링크를 눌렀을 때 초점이 실제로 본문으로 가는지 확인합니다.",
        "랜드마크와 헤딩으로도 건너뛸 수 있는 구조인지 확인합니다.",
      ],
      en: [
        "Confirm a skip link becomes visible on the first Tab press.",
        "Confirm activating it moves focus into the main content.",
        "Confirm landmarks and headings offer an alternative way to jump.",
      ],
    },
    evidence: {
      ko: "바로가기 구현 위치와 테스트 결과를 메모에 남깁니다.",
      en: "Record where the skip link lives and the result of testing it.",
    },
    axis: "keyboard-focus",
    roles: ["publishing"],
    phases: ["implementation", "qa"],
    featureFlags: [],
    relatedTool: "html-accessibility-checker",
  }),
  sc({
    criterion: "2.4.2",
    level: "A",
    doc: "page-titled",
    title: { ko: "페이지 제목", en: "Page Titled" },
    question: {
      ko: "각 페이지에 주제나 목적을 설명하는 고유한 title 이 있나요?",
      en: "Does every page have a title that describes its topic or purpose?",
    },
    howToCheck: {
      ko: [
        "주요 페이지의 title 이 서로 다른지 확인합니다.",
        "단일 페이지 앱이라면 라우트 변경 시 title 도 바뀌는지 확인합니다.",
      ],
      en: [
        "Confirm the key pages all have different titles.",
        "In a single-page app, confirm the title updates when the route changes.",
      ],
    },
    evidence: {
      ko: "페이지별 title 규칙과 수정 대상을 메모에 남깁니다.",
      en: "Record the page title convention and anything you changed.",
    },
    axis: "structure-semantics",
    roles: ["planning", "publishing"],
    phases: ["implementation", "qa"],
    featureFlags: [],
    relatedTool: "html-accessibility-checker",
  }),
  sc({
    criterion: "2.4.3",
    level: "A",
    doc: "focus-order",
    title: { ko: "초점 순서", en: "Focus Order" },
    question: {
      ko: "초점이 의미와 조작 흐름을 유지하는 순서로 이동하나요?",
      en: "Does focus move in an order that preserves meaning and operability?",
    },
    howToCheck: {
      ko: [
        "Tab 순서와 화면 읽기 순서를 비교합니다.",
        "양수 tabindex 가 쓰인 곳이 있는지 찾습니다.",
        "모달을 열면 초점이 안으로, 닫으면 원래 버튼으로 돌아오는지 확인합니다.",
      ],
      en: [
        "Compare the tab sequence with the visual reading order.",
        "Search for positive tabindex values.",
        "Confirm focus enters a dialog on open and returns to the trigger on close.",
      ],
    },
    evidence: {
      ko: "순서가 어긋난 화면과 수정 방법을 메모에 남깁니다.",
      en: "Record the screens with a broken order and how you fixed them.",
    },
    axis: "keyboard-focus",
    roles: ["design", "publishing"],
    phases: ["implementation", "qa"],
    featureFlags: [],
    relatedTool: "html-accessibility-checker",
  }),
  sc({
    criterion: "2.4.4",
    level: "A",
    doc: "link-purpose-in-context",
    title: { ko: "링크 목적(문맥 내)", en: "Link Purpose (In Context)" },
    question: {
      ko: "링크 텍스트나 문맥으로 링크의 목적을 알 수 있나요?",
      en: "Can the purpose of each link be determined from its text or context?",
    },
    howToCheck: {
      ko: [
        "\"더보기\", \"여기\" 처럼 문맥 없이 이해할 수 없는 링크를 찾습니다.",
        "아이콘만 있는 링크에 접근 가능한 이름이 있는지 확인합니다.",
      ],
      en: [
        "Find links whose text alone is meaningless, such as More or Here.",
        "Confirm icon-only links have an accessible name.",
      ],
    },
    evidence: {
      ko: "수정한 링크 문구를 메모에 남깁니다.",
      en: "Record the link text you rewrote.",
    },
    axis: "structure-semantics",
    roles: ["planning", "publishing"],
    phases: ["planning", "implementation", "qa"],
    featureFlags: [],
    relatedTool: "html-accessibility-checker",
  }),
  sc({
    criterion: "2.4.5",
    level: "AA",
    doc: "multiple-ways",
    title: { ko: "여러 가지 방법", en: "Multiple Ways" },
    question: {
      ko: "한 페이지에 도달하는 방법이 두 가지 이상 있나요?",
      en: "Is there more than one way to locate a page within the site?",
    },
    howToCheck: {
      ko: [
        "내비게이션, 검색, 사이트맵, 목록 페이지 중 무엇이 있는지 확인합니다.",
        "절차의 한 단계처럼 순서가 본질적인 페이지는 예외로 기록합니다.",
      ],
      en: [
        "Check which of navigation, search, sitemap, or index pages exist.",
        "Note pages that are a step in a process as exceptions.",
      ],
    },
    evidence: {
      ko: "제공하는 탐색 수단과 예외 페이지를 메모에 남깁니다.",
      en: "Record the navigation mechanisms provided and any exception pages.",
    },
    axis: "structure-semantics",
    roles: ["planning"],
    phases: ["planning", "design"],
    featureFlags: [],
  }),
  sc({
    criterion: "2.4.6",
    level: "AA",
    doc: "headings-and-labels",
    title: { ko: "제목과 레이블", en: "Headings and Labels" },
    question: {
      ko: "제목과 레이블이 주제나 목적을 설명하나요?",
      en: "Do headings and labels describe the topic or purpose?",
    },
    howToCheck: {
      ko: [
        "헤딩만 뽑아 읽었을 때 페이지 개요가 이해되는지 확인합니다.",
        "\"정보\", \"내용\" 같은 모호한 레이블을 찾습니다.",
      ],
      en: [
        "Read the headings alone and confirm they outline the page.",
        "Find vague labels such as Information or Content.",
      ],
    },
    evidence: {
      ko: "수정한 헤딩·레이블 문구를 메모에 남깁니다.",
      en: "Record the headings and labels you rewrote.",
    },
    axis: "structure-semantics",
    roles: ["planning", "design"],
    phases: ["planning", "design", "qa"],
    featureFlags: [],
    relatedTool: "html-accessibility-checker",
  }),
  sc({
    criterion: "2.4.7",
    level: "AA",
    doc: "focus-visible",
    title: { ko: "초점 표시", en: "Focus Visible" },
    question: {
      ko: "키보드로 조작할 때 현재 초점 위치가 눈에 보이나요?",
      en: "Is the keyboard focus indicator visible during keyboard operation?",
    },
    howToCheck: {
      ko: [
        "outline: none 뒤에 대체 스타일이 없는 코드를 검색합니다.",
        "커스텀 초점 표시가 배경과 충분히 구분되는지 확인합니다.",
        "다크·라이트 테마 모두에서 확인합니다.",
      ],
      en: [
        "Search for outline: none without a replacement style.",
        "Confirm the custom focus indicator stands out against its background.",
        "Check both light and dark themes.",
      ],
    },
    evidence: {
      ko: "초점 스타일 규칙과 누락 컴포넌트를 메모에 남깁니다.",
      en: "Record the focus style rule and the components that were missing one.",
    },
    axis: "keyboard-focus",
    roles: ["design", "publishing"],
    phases: ["design", "implementation", "qa"],
    featureFlags: [],
  }),
  sc({
    criterion: "2.4.11",
    level: "AA",
    doc: "focus-not-obscured-minimum",
    title: { ko: "초점 가려지지 않음(최소)", en: "Focus Not Obscured (Minimum)" },
    question: {
      ko: "초점을 받은 요소가 다른 콘텐츠에 완전히 가려지지 않나요?",
      en: "Is the focused element never entirely hidden by other content?",
    },
    howToCheck: {
      ko: [
        "sticky 헤더·하단 고정 바·쿠키 배너가 있는 화면에서 Tab 을 끝까지 눌러 봅니다.",
        "긴 폼에서 스크롤된 상태의 초점 위치를 확인합니다.",
        "모바일 화면에서도 같은 확인을 반복합니다.",
      ],
      en: [
        "Tab through screens that have a sticky header, fixed bottom bar, or cookie banner.",
        "Check focus position inside long forms while scrolled.",
        "Repeat the check at phone width.",
      ],
    },
    evidence: {
      ko: "가림이 발생한 컴포넌트와 scroll-margin 등 수정 내용을 메모에 남깁니다.",
      en: "Record the components that obscured focus and the fix, such as scroll-margin.",
    },
    axis: "keyboard-focus",
    roles: ["design", "publishing"],
    phases: ["implementation", "qa"],
    featureFlags: [],
  }),
  sc({
    criterion: "2.5.1",
    level: "A",
    doc: "pointer-gestures",
    title: { ko: "포인터 제스처", en: "Pointer Gestures" },
    question: {
      ko: "다중 지점·경로 기반 제스처에 단일 포인터 대안이 있나요?",
      en: "Does every multipoint or path-based gesture have a single-pointer alternative?",
    },
    howToCheck: {
      ko: [
        "핀치 줌, 스와이프, 드래그 정렬, 그리기 제스처를 모읍니다.",
        "각각에 버튼·메뉴 같은 단순 탭 대안이 있는지 확인합니다.",
      ],
      en: [
        "List pinch zoom, swipe, drag to reorder, and drawing gestures.",
        "Confirm each has a simple tap alternative such as a button or menu.",
      ],
    },
    evidence: {
      ko: "제스처와 대안 컨트롤을 메모에 남깁니다.",
      en: "Record each gesture and its alternative control.",
    },
    axis: "target-pointer",
    roles: ["planning", "publishing"],
    phases: ["planning", "implementation", "qa"],
    featureFlags: ["drag_gesture"],
  }),
  sc({
    criterion: "2.5.2",
    level: "A",
    doc: "pointer-cancellation",
    title: { ko: "포인터 취소", en: "Pointer Cancellation" },
    question: {
      ko: "누른 뒤 떼기 전에 밖으로 빼서 실행을 취소할 수 있나요?",
      en: "Can a pointer action be aborted before the up event completes it?",
    },
    howToCheck: {
      ko: [
        "중요한 동작이 mousedown·touchstart 가 아니라 클릭·mouseup 에서 실행되는지 확인합니다.",
        "삭제·결제·전송처럼 되돌리기 어려운 동작을 우선 확인합니다.",
      ],
      en: [
        "Confirm important actions run on click or mouseup rather than a down event.",
        "Start with actions that are hard to undo: delete, pay, and send.",
      ],
    },
    evidence: {
      ko: "확인한 이벤트 바인딩과 예외 처리를 메모에 남깁니다.",
      en: "Record the event bindings reviewed and how exceptions are handled.",
    },
    axis: "target-pointer",
    roles: ["publishing"],
    phases: ["implementation", "qa"],
    featureFlags: [],
  }),
  sc({
    criterion: "2.5.3",
    level: "A",
    doc: "label-in-name",
    title: { ko: "이름 속의 레이블", en: "Label in Name" },
    question: {
      ko: "보이는 문구가 접근 가능한 이름에 그대로 들어 있나요?",
      en: "Does the accessible name contain the text presented visually?",
    },
    howToCheck: {
      ko: [
        "보이는 버튼 문구와 aria-label 이 어긋난 곳을 찾습니다.",
        "아이콘 + 텍스트 조합에서 보이는 문구가 이름 앞에 오는지 확인합니다.",
      ],
      en: [
        "Find controls whose visible text differs from their aria-label.",
        "Confirm the visible text comes first in the accessible name of icon plus text controls.",
      ],
    },
    evidence: {
      ko: "불일치한 컨트롤과 수정한 이름을 메모에 남깁니다.",
      en: "Record the mismatched controls and the names you corrected.",
    },
    axis: "structure-semantics",
    roles: ["design", "publishing"],
    phases: ["implementation", "qa"],
    featureFlags: [],
    relatedTool: "html-accessibility-checker",
  }),
  sc({
    criterion: "2.5.4",
    level: "A",
    doc: "motion-actuation",
    title: { ko: "동작 기반 작동", en: "Motion Actuation" },
    question: {
      ko: "기기 동작으로 실행되는 기능에 일반 컨트롤 대안이 있고 끌 수 있나요?",
      en: "Can motion-operated functions also use a control, and can motion be disabled?",
    },
    howToCheck: {
      ko: [
        "흔들기·기울이기로 실행되는 기능을 모읍니다.",
        "각각에 버튼·메뉴 대안이 있고 센서 반응을 끌 수 있는지 확인합니다.",
      ],
      en: [
        "List features triggered by shaking or tilting the device.",
        "Confirm each has a control alternative and the motion response can be disabled.",
      ],
    },
    evidence: {
      ko: "동작 기반 기능과 대안·끄기 설정을 메모에 남깁니다.",
      en: "Record the motion features, alternatives, and the disable setting.",
    },
    axis: "target-pointer",
    roles: ["planning", "publishing"],
    phases: ["planning", "implementation"],
    featureFlags: ["motion_input"],
  }),
  sc({
    criterion: "2.5.7",
    level: "AA",
    doc: "dragging-movements",
    title: { ko: "끌기 동작", en: "Dragging Movements" },
    question: {
      ko: "드래그로 하는 모든 동작을 드래그 없이 한 번의 포인터 조작으로도 할 수 있나요?",
      en: "Can every dragging action also be completed without dragging?",
    },
    howToCheck: {
      ko: [
        "목록 순서 변경, 슬라이더, 지도 이동, 파일 끌어놓기를 모읍니다.",
        "각각에 버튼·입력·메뉴 같은 비드래그 대안이 있는지 확인합니다.",
      ],
      en: [
        "List reordering, sliders, map panning, and drag and drop upload.",
        "Confirm each has a non-dragging alternative such as a button, field, or menu.",
      ],
    },
    evidence: {
      ko: "드래그 기능과 제공한 대안을 메모에 남깁니다.",
      en: "Record each dragging feature and the alternative provided.",
    },
    axis: "target-pointer",
    roles: ["planning", "publishing"],
    phases: ["design", "implementation", "qa"],
    featureFlags: ["drag_gesture"],
  }),
  sc({
    criterion: "2.5.8",
    level: "AA",
    doc: "target-size-minimum",
    title: { ko: "타겟 크기(최소)", en: "Target Size (Minimum)" },
    question: {
      ko: "포인터 타겟이 24×24 CSS px 이상이거나 충분한 간격 예외에 해당하나요?",
      en: "Are pointer targets at least 24 by 24 CSS pixels, or covered by an exception?",
    },
    howToCheck: {
      ko: [
        "아이콘 버튼, 체크박스, 페이지네이션, 닫기 버튼의 실제 크기를 측정합니다.",
        "작다면 인접 타겟과의 간격이 예외 조건을 만족하는지 확인합니다.",
        "본문 안 인라인 링크처럼 명시된 예외를 구분해 기록합니다.",
      ],
      en: [
        "Measure icon buttons, checkboxes, pagination, and close buttons.",
        "Where a target is smaller, check whether the spacing exception applies.",
        "Note documented exceptions such as inline links inside a sentence.",
      ],
    },
    evidence: {
      ko: "측정값, 적용한 예외, 조정한 크기를 메모에 남깁니다.",
      en: "Record the measurements, the exceptions applied, and the sizes you changed.",
    },
    axis: "target-pointer",
    roles: ["design", "publishing"],
    phases: ["design", "implementation", "qa"],
    featureFlags: [],
  }),

  /* ── 3. 이해 가능 (Understandable) ────────────────────── */
  sc({
    criterion: "3.1.1",
    level: "A",
    doc: "language-of-page",
    title: { ko: "페이지의 언어", en: "Language of Page" },
    question: {
      ko: "각 페이지의 기본 언어가 프로그래밍적으로 선언돼 있나요?",
      en: "Is the default human language of each page programmatically determined?",
    },
    howToCheck: {
      ko: [
        "서버 렌더 결과의 html lang 값을 확인합니다.",
        "언어 전환 시 lang 값도 함께 바뀌는지 확인합니다.",
      ],
      en: [
        "Check the lang attribute in the server-rendered HTML.",
        "Confirm the value changes when the user switches language.",
      ],
    },
    evidence: {
      ko: "확인한 URL 과 lang 값을 메모에 남깁니다.",
      en: "Record the URLs checked and the lang values found.",
    },
    axis: "structure-semantics",
    roles: ["publishing"],
    phases: ["implementation", "qa"],
    featureFlags: [],
    relatedTool: "html-accessibility-checker",
  }),
  sc({
    criterion: "3.1.2",
    level: "AA",
    doc: "language-of-parts",
    title: { ko: "부분의 언어", en: "Language of Parts" },
    question: {
      ko: "본문 중간의 다른 언어 구절에 해당 언어를 선언했나요?",
      en: "Are passages in another language marked with their own lang value?",
    },
    howToCheck: {
      ko: [
        "국문 페이지 안의 긴 영문 인용·설명 블록을 찾습니다.",
        "해당 요소에 lang 속성이 붙었는지 확인합니다.",
        "제품명·고유명사처럼 예외로 볼 수 있는 경우를 구분합니다.",
      ],
      en: [
        "Find long passages in a second language inside a page.",
        "Confirm those elements carry their own lang attribute.",
        "Separate proper nouns and product names, which can be exceptions.",
      ],
    },
    evidence: {
      ko: "적용한 위치와 예외 판단 기준을 메모에 남깁니다.",
      en: "Record where you applied lang and how you judged exceptions.",
    },
    axis: "structure-semantics",
    roles: ["publishing"],
    phases: ["implementation", "qa"],
    featureFlags: [],
    relatedTool: "html-accessibility-checker",
  }),
  sc({
    criterion: "3.2.1",
    level: "A",
    doc: "on-focus",
    title: { ko: "포커스 시", en: "On Focus" },
    question: {
      ko: "요소에 초점이 들어갔다는 이유만으로 맥락이 바뀌지 않나요?",
      en: "Does receiving focus alone never initiate a change of context?",
    },
    howToCheck: {
      ko: [
        "Tab 으로 이동만 했을 때 페이지 이동·모달 열림·자동 제출이 일어나는지 확인합니다.",
        "select 요소에 초점만 줘도 동작이 발생하는지 확인합니다.",
      ],
      en: [
        "Tab through the page and watch for navigation, dialogs, or submissions on focus alone.",
        "Check whether focusing a select element triggers an action.",
      ],
    },
    evidence: {
      ko: "발견한 자동 동작과 수정 내용을 메모에 남깁니다.",
      en: "Record the automatic behavior found and what you changed.",
    },
    axis: "dynamic-status",
    roles: ["publishing"],
    phases: ["implementation", "qa"],
    featureFlags: [],
  }),
  sc({
    criterion: "3.2.2",
    level: "A",
    doc: "on-input",
    title: { ko: "입력 시", en: "On Input" },
    question: {
      ko: "값을 바꾸는 것만으로 사전 안내 없이 맥락이 바뀌지 않나요?",
      en: "Does changing a value never cause an unexpected change of context?",
    },
    howToCheck: {
      ko: [
        "선택만 해도 이동하는 드롭다운이 있는지 확인합니다.",
        "입력 자리수가 차면 자동으로 다음 필드나 제출로 넘어가는 폼을 확인합니다.",
        "불가피하다면 사전 안내가 있는지 확인합니다.",
      ],
      en: [
        "Look for select elements that navigate on change.",
        "Look for forms that jump fields or submit once a field fills up.",
        "Where it is required, confirm the behavior is announced in advance.",
      ],
    },
    evidence: {
      ko: "해당 컴포넌트와 변경한 동작을 메모에 남깁니다.",
      en: "Record the components involved and the behavior you changed.",
    },
    axis: "dynamic-status",
    roles: ["planning", "publishing"],
    phases: ["implementation", "qa"],
    featureFlags: [],
  }),
  sc({
    criterion: "3.2.3",
    level: "AA",
    doc: "consistent-navigation",
    title: { ko: "일관된 내비게이션", en: "Consistent Navigation" },
    question: {
      ko: "반복되는 내비게이션이 페이지마다 같은 순서로 나오나요?",
      en: "Do repeated navigation mechanisms appear in the same relative order?",
    },
    howToCheck: {
      ko: [
        "여러 페이지에서 헤더 메뉴 순서와 푸터 링크 순서를 비교합니다.",
        "일부 페이지에서만 순서가 바뀌는 곳을 찾습니다.",
      ],
      en: [
        "Compare header menu order and footer link order across pages.",
        "Find pages where the order differs.",
      ],
    },
    evidence: {
      ko: "비교한 페이지와 발견한 차이를 메모에 남깁니다.",
      en: "Record the pages compared and the differences found.",
    },
    axis: "cognitive-process",
    roles: ["planning", "design"],
    phases: ["design", "qa"],
    featureFlags: [],
  }),
  sc({
    criterion: "3.2.4",
    level: "AA",
    doc: "consistent-identification",
    title: { ko: "일관된 식별", en: "Consistent Identification" },
    question: {
      ko: "같은 기능을 하는 컴포넌트가 페이지마다 같은 이름으로 불리나요?",
      en: "Are components with the same function identified consistently?",
    },
    howToCheck: {
      ko: [
        "검색·저장·다운로드 같은 공통 기능의 문구와 아이콘을 페이지별로 비교합니다.",
        "같은 아이콘이 서로 다른 의미로 쓰이는 곳을 찾습니다.",
      ],
      en: [
        "Compare the wording and icons for shared actions such as search, save, and download.",
        "Find places where the same icon means something different.",
      ],
    },
    evidence: {
      ko: "통일한 문구·아이콘 규칙을 메모에 남깁니다.",
      en: "Record the wording and icon conventions you unified.",
    },
    axis: "cognitive-process",
    roles: ["planning", "design"],
    phases: ["design", "qa"],
    featureFlags: [],
  }),
  sc({
    criterion: "3.2.6",
    level: "A",
    doc: "consistent-help",
    title: { ko: "일관된 도움", en: "Consistent Help" },
    question: {
      ko: "도움 수단이 제공되는 페이지들에서 같은 상대 위치에 나오나요?",
      en: "Does help appear in the same relative order on the pages that provide it?",
    },
    howToCheck: {
      ko: [
        "고객센터·챗봇·연락처·도움말 링크의 위치를 페이지별로 확인합니다.",
        "같은 상대 위치(헤더·푸터 등)를 유지하는지 확인합니다.",
      ],
      en: [
        "Check where the help center, chat, contact details, and help links appear per page.",
        "Confirm they stay in the same relative position.",
      ],
    },
    evidence: {
      ko: "도움 수단의 위치 규칙과 예외를 메모에 남깁니다.",
      en: "Record the placement rule for help and any exception.",
    },
    axis: "cognitive-process",
    roles: ["planning", "design"],
    phases: ["planning", "design"],
    featureFlags: [],
  }),
  sc({
    criterion: "3.3.1",
    level: "A",
    doc: "error-identification",
    title: { ko: "오류 식별", en: "Error Identification" },
    question: {
      ko: "입력 오류를 자동으로 감지했을 때 어느 항목이 문제인지 글로 알려주나요?",
      en: "When an input error is detected, is the item identified and described in text?",
    },
    howToCheck: {
      ko: [
        "빈 필수값·형식 오류·서버 거절을 실제로 발생시켜 봅니다.",
        "오류 문구가 어떤 필드의 무엇이 문제인지 말하는지 확인합니다.",
        "오류가 보조기술에도 전달되는지 확인합니다.",
      ],
      en: [
        "Trigger real errors: empty required fields, wrong formats, and server rejections.",
        "Confirm each message names the field and the problem.",
        "Confirm the error is also announced to assistive technology.",
      ],
    },
    evidence: {
      ko: "재현한 오류와 화면 문구를 메모에 남깁니다.",
      en: "Record the errors reproduced and the messages shown.",
    },
    axis: "cognitive-process",
    roles: ["planning", "publishing"],
    phases: ["implementation", "qa"],
    featureFlags: ["forms"],
  }),
  sc({
    criterion: "3.3.2",
    level: "A",
    doc: "labels-or-instructions",
    title: { ko: "레이블 또는 지시문", en: "Labels or Instructions" },
    question: {
      ko: "입력이 필요한 모든 항목에 레이블이나 안내가 제공되나요?",
      en: "Are labels or instructions provided wherever user input is required?",
    },
    howToCheck: {
      ko: [
        "label for 와 input id 가 실제로 연결됐는지 확인합니다.",
        "플레이스홀더만으로 레이블을 대신한 필드를 찾습니다.",
        "필수 여부와 입력 형식 안내가 제공되는지 확인합니다.",
      ],
      en: [
        "Confirm label for and input id are connected.",
        "Find fields that use a placeholder instead of a label.",
        "Confirm required state and format hints are available.",
      ],
    },
    evidence: {
      ko: "레이블이 없던 필드와 연결 방식을 메모에 남깁니다.",
      en: "Record the unlabeled fields and how you associated labels.",
    },
    axis: "cognitive-process",
    roles: ["design", "publishing"],
    phases: ["design", "implementation", "qa"],
    featureFlags: ["forms"],
    relatedTool: "html-accessibility-checker",
  }),
  sc({
    criterion: "3.3.3",
    level: "AA",
    doc: "error-suggestion",
    title: { ko: "오류 수정 제안", en: "Error Suggestion" },
    question: {
      ko: "오류를 고칠 방법을 알 수 있다면 그 방법을 함께 제안하나요?",
      en: "When a correction is known, is it suggested to the user?",
    },
    howToCheck: {
      ko: [
        "날짜·전화·이메일 형식 오류에 올바른 예시를 함께 보여주는지 확인합니다.",
        "선택 가능한 값이 정해져 있다면 그 목록을 제시하는지 확인합니다.",
        "보안상 제안하면 안 되는 경우를 구분해 기록합니다.",
      ],
      en: [
        "Confirm format errors for dates, phone numbers, and email show a correct example.",
        "Where values come from a fixed set, confirm the options are offered.",
        "Note cases where a suggestion would harm security.",
      ],
    },
    evidence: {
      ko: "오류별 제안 문구와 예외를 메모에 남깁니다.",
      en: "Record the suggestion text per error and any exception.",
    },
    axis: "cognitive-process",
    roles: ["planning", "publishing"],
    phases: ["implementation", "qa"],
    featureFlags: ["forms"],
  }),
  sc({
    criterion: "3.3.4",
    level: "AA",
    doc: "error-prevention-legal-financial-data",
    title: {
      ko: "오류 방지(법적·금전적·데이터)",
      en: "Error Prevention (Legal, Financial, Data)",
    },
    question: {
      ko: "법적·금전적 효력이 있거나 데이터를 지우는 제출에 되돌리기·확인·검토 수단이 있나요?",
      en: "Do legal, financial, or data-deleting submissions offer reversal, checking, or review?",
    },
    howToCheck: {
      ko: [
        "결제, 계약 동의, 계정 삭제, 데이터 영구 삭제 흐름을 모읍니다.",
        "각 흐름에 취소·수정 가능한 확인 단계가 있는지 확인합니다.",
        "제출 전에 입력값을 검토할 수 있는 화면이 있는지 확인합니다.",
      ],
      en: [
        "List payment, contract acceptance, account deletion, and permanent data deletion flows.",
        "Confirm each has a confirmation step that can be cancelled or corrected.",
        "Confirm the user can review the entered values before submitting.",
      ],
    },
    evidence: {
      ko: "각 흐름의 확인 단계와 되돌리기 정책을 메모에 남깁니다.",
      en: "Record the confirmation step and reversal policy for each flow.",
    },
    axis: "cognitive-process",
    roles: ["planning", "publishing"],
    phases: ["planning", "implementation", "qa"],
    featureFlags: ["forms"],
  }),
  sc({
    criterion: "3.3.7",
    level: "A",
    doc: "redundant-entry",
    title: { ko: "중복 입력", en: "Redundant Entry" },
    question: {
      ko: "같은 절차 안에서 이미 입력한 정보를 다시 입력하게 하지 않나요?",
      en: "Is previously entered information auto-populated or available to select?",
    },
    howToCheck: {
      ko: [
        "여러 단계 가입·주문·신청 절차를 끝까지 진행합니다.",
        "이전 단계 값이 채워지거나 선택 가능하게 제공되는지 확인합니다.",
        "보안상 재확인이 필요한 경우를 구분합니다.",
      ],
      en: [
        "Walk through multi-step sign-up, order, and application flows.",
        "Confirm earlier answers are prefilled or selectable.",
        "Separate cases where re-entry is essential for security.",
      ],
    },
    evidence: {
      ko: "반복 입력이 있던 단계와 개선 방법을 메모에 남깁니다.",
      en: "Record the steps that asked twice and how you fixed them.",
    },
    axis: "cognitive-process",
    roles: ["planning", "publishing"],
    phases: ["planning", "implementation"],
    featureFlags: ["forms", "authentication"],
  }),
  sc({
    criterion: "3.3.8",
    level: "AA",
    doc: "accessible-authentication-minimum",
    title: { ko: "접근 가능한 인증(최소)", en: "Accessible Authentication (Minimum)" },
    question: {
      ko: "인증 과정이 기억하기나 글자 옮겨쓰기 같은 인지 기능 테스트에만 의존하지 않나요?",
      en: "Does authentication avoid relying on a cognitive function test with no alternative?",
    },
    howToCheck: {
      ko: [
        "로그인·재설정·본인 확인 단계를 각각 확인합니다.",
        "비밀번호 붙여넣기와 브라우저 자동완성을 막고 있지 않은지 확인합니다.",
        "퍼즐·문자 판독을 요구한다면 다른 대안이 함께 있는지 확인합니다.",
      ],
      en: [
        "Review sign-in, reset, and verification separately.",
        "Confirm password paste and browser autofill are not blocked.",
        "If a puzzle or transcription is required, confirm an alternative exists.",
      ],
    },
    evidence: {
      ko: "인증 단계별 방식과 제공한 대안을 메모에 남깁니다.",
      en: "Record each authentication step and the alternative offered.",
    },
    axis: "cognitive-process",
    roles: ["planning", "publishing"],
    phases: ["planning", "implementation", "qa"],
    featureFlags: ["authentication"],
  }),

  /* ── 4. 견고함 (Robust) ───────────────────────────────── */
  sc({
    criterion: "4.1.2",
    level: "A",
    doc: "name-role-value",
    title: { ko: "이름·역할·값", en: "Name, Role, Value" },
    question: {
      ko: "모든 UI 컴포넌트의 이름·역할·상태·값을 보조기술이 알 수 있나요?",
      en: "Can assistive technology determine the name, role, state, and value of every component?",
    },
    howToCheck: {
      ko: [
        "직접 만든 탭·아코디언·모달·자동완성·트리를 모읍니다.",
        "role 과 aria 상태(expanded·selected·checked)가 화면과 일치하는지 확인합니다.",
        "스크린리더로 각 컴포넌트를 한 번씩 조작해 봅니다.",
      ],
      en: [
        "List the custom tabs, accordions, dialogs, comboboxes, and trees you built.",
        "Confirm role and aria state match what is shown on screen.",
        "Operate each component once with a screen reader.",
      ],
    },
    evidence: {
      ko: "컴포넌트 목록, 사용한 보조기술과 버전, 남은 이슈를 메모에 남깁니다.",
      en: "Record the components, the assistive technology and version used, and open issues.",
    },
    axis: "structure-semantics",
    roles: ["publishing"],
    phases: ["implementation", "qa"],
    featureFlags: [],
    relatedTool: "html-accessibility-checker",
  }),
  sc({
    criterion: "4.1.3",
    level: "AA",
    doc: "status-messages",
    title: { ko: "상태 메시지", en: "Status Messages" },
    question: {
      ko: "초점을 옮기지 않고 나타나는 상태 메시지를 보조기술이 알 수 있나요?",
      en: "Are status messages announced without moving focus?",
    },
    howToCheck: {
      ko: [
        "저장 완료 toast, 검색 결과 개수, 장바구니 담김, 유효성 통과 표시를 모읍니다.",
        "각 메시지 영역에 적절한 role 또는 aria-live 가 있는지 확인합니다.",
        "메시지가 나타날 때 초점이 강제로 이동하지 않는지 확인합니다.",
      ],
      en: [
        "List save toasts, result counts, cart confirmations, and validation success markers.",
        "Confirm each region has a suitable role or aria-live value.",
        "Confirm focus is not forcibly moved when the message appears.",
      ],
    },
    evidence: {
      ko: "상태 메시지 목록과 적용한 live region 설정을 메모에 남깁니다.",
      en: "Record the status messages and the live region settings applied.",
    },
    axis: "dynamic-status",
    roles: ["publishing"],
    phases: ["implementation", "qa"],
    featureFlags: ["web_app_widgets"],
  }),
];
