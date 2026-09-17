/* ============================================================
   체크리스트 분류 라벨 (KO·EN)

   축·역할·단계·상태처럼 **데이터 도메인에 속한 라벨**만 여기 둔다.
   화면·Markdown·CSV 가 같은 문자열을 써야 하므로 컴포넌트 DICT 가 아니라
   lib 에 둔다 (lib/textscale/messages.ts 와 같은 역할).
   버튼·플레이스홀더 같은 순수 컨트롤 마이크로카피는 컴포넌트 DICT 에 있다.
   ============================================================ */
import type {
  Axis,
  Environment,
  FeatureId,
  Level,
  Organization,
  Phase,
  Role,
  Standard,
  Status,
} from "./types";

type Lang = "ko" | "en";
type L10n<K extends string> = Record<Lang, Record<K, string>>;

export const AXIS_LABEL: L10n<Axis> = {
  ko: {
    color: "색",
    "typography-reflow": "타이포·확대",
    "target-pointer": "타겟·포인터",
    "keyboard-focus": "키보드·포커스",
    "structure-semantics": "구조·의미",
    "dynamic-status": "동적·상태",
    "cognitive-process": "인지·절차",
  },
  en: {
    color: "Color",
    "typography-reflow": "Typography and scaling",
    "target-pointer": "Target and pointer",
    "keyboard-focus": "Keyboard and focus",
    "structure-semantics": "Structure and semantics",
    "dynamic-status": "Motion and status",
    "cognitive-process": "Process and comprehension",
  },
};

export const ROLE_LABEL: L10n<Role> = {
  ko: { planning: "기획", design: "디자인", publishing: "퍼블리싱" },
  en: { planning: "Planning", design: "Design", publishing: "Development" },
};

export const PHASE_LABEL: L10n<Phase> = {
  ko: {
    planning: "기획",
    design: "설계",
    implementation: "구현",
    qa: "QA",
    operation: "운영",
  },
  en: {
    planning: "Requirements",
    design: "Design",
    implementation: "Implementation",
    qa: "QA",
    operation: "Operation",
  },
};

export const STATUS_LABEL: L10n<Status> = {
  ko: {
    not_started: "미검토",
    in_review: "검토 중",
    pass: "통과",
    issue: "이슈",
    not_applicable: "해당 없음",
  },
  en: {
    not_started: "Not started",
    in_review: "In review",
    pass: "Passed",
    issue: "Issue",
    not_applicable: "Not applicable",
  },
};

/** 상태의 의미. 진행률을 준수율로 읽지 않도록 정의를 화면에 노출한다. */
export const STATUS_MEANING: L10n<Status> = {
  ko: {
    not_started: "아직 검토하지 않은 상태입니다.",
    in_review: "테스트를 시작했지만 아직 결론이 나지 않은 상태입니다.",
    pass: "확인을 마쳤고 현재 검토 범위에서 문제를 찾지 못한 상태입니다.",
    issue: "수정이 필요한 문제를 발견한 상태입니다.",
    not_applicable: "프로젝트에 적용되지 않는 이유를 확인한 상태입니다.",
  },
  en: {
    not_started: "Not reviewed yet.",
    in_review: "Testing started but no conclusion has been reached.",
    pass: "Reviewed, and no issue was found within the scope you checked.",
    issue: "A problem that needs fixing was found.",
    not_applicable: "Confirmed not to apply to this project, with a recorded reason.",
  },
};

export const STANDARD_LABEL: L10n<Standard> = {
  ko: { "kwcag-2.2": "KWCAG 2.2", "wcag-2.2": "WCAG 2.2" },
  en: { "kwcag-2.2": "KWCAG 2.2", "wcag-2.2": "WCAG 2.2" },
};

export const STANDARD_NOTE: L10n<Standard> = {
  ko: {
    "kwcag-2.2":
      "국내 웹 콘텐츠 접근성 표준의 33개 검사항목으로 구성합니다. A/AA 등급을 사용하지 않습니다.",
    "wcag-2.2":
      "선택한 목표 레벨까지의 성공 기준을 포함합니다. AA를 선택하면 A와 AA 항목이 함께 생성됩니다.",
  },
  en: {
    "kwcag-2.2":
      "Builds the 33 requirements of the Korean web content accessibility standard. It does not use A or AA levels.",
    "wcag-2.2":
      "Includes success criteria up to the target level. Choosing AA generates both Level A and Level AA items.",
  },
};

export const ENVIRONMENT_LABEL: L10n<Environment> = {
  ko: {
    responsive: "반응형 웹",
    "desktop-first": "데스크톱 웹 중심",
    "mobile-first": "모바일 웹 중심",
  },
  en: {
    responsive: "Responsive web",
    "desktop-first": "Desktop-first web",
    "mobile-first": "Mobile-first web",
  },
};

export const ORGANIZATION_LABEL: L10n<Organization> = {
  ko: { "general-private": "일반·민간", "public-certification": "공공·품질인증 준비" },
  en: { "general-private": "General or private", "public-certification": "Public sector or certification prep" },
};

/** 서비스 기능 질문. 답변은 N/A 후보 계산에만 쓰인다. */
export const FEATURE_QUESTION: L10n<FeatureId> = {
  ko: {
    media_prerecorded: "녹화 영상 또는 음성 콘텐츠가 있나요?",
    media_live: "실시간 영상 또는 음성이 있나요?",
    forms: "입력 폼이나 오류 메시지가 있나요?",
    authentication: "로그인이나 본인 인증 과정이 있나요?",
    timed_content: "시간 제한 또는 자동 종료가 있나요?",
    moving_content: "자동 재생·캐러셀·움직이는 콘텐츠가 있나요?",
    drag_gesture: "드래그나 다중·경로 기반 제스처가 있나요?",
    motion_input: "기기 흔들기·기울이기 등 동작 입력이 있나요?",
    data_tables: "데이터 표가 있나요?",
    web_app_widgets: "모달·탭·자동완성 등 복합 UI가 있나요?",
    epub_reference: "전자출판문서의 고정 참조 위치가 필요한가요?",
  },
  en: {
    media_prerecorded: "Does the product include prerecorded video or audio?",
    media_live: "Does it include live video or audio?",
    forms: "Does it include input forms or error messages?",
    authentication: "Does it include sign-in or identity verification?",
    timed_content: "Does it include time limits or automatic expiry?",
    moving_content: "Does it include autoplay, carousels, or moving content?",
    drag_gesture: "Does it include dragging or multipoint and path-based gestures?",
    motion_input: "Does it use device motion such as shaking or tilting?",
    data_tables: "Does it include data tables?",
    web_app_widgets: "Does it include composite UI such as dialogs, tabs, or comboboxes?",
    epub_reference: "Does it need a fixed reference location for publications?",
  },
};

/** 기능이 어떤 검토를 여는지 한 줄 설명 (질문 옆 보조 문구) */
export const FEATURE_EFFECT: L10n<FeatureId> = {
  ko: {
    media_prerecorded: "자막·음성 해설·미디어 대체수단",
    media_live: "실시간 자막",
    forms: "레이블·오류 식별·수정 제안",
    authentication: "접근 가능한 인증·중복 입력",
    timed_content: "응답시간 조절",
    moving_content: "정지·숨김·오디오 제어",
    drag_gesture: "단일 포인터 대안·드래그 대안",
    motion_input: "동작 기반 작동 대안",
    data_tables: "표 구조와 관계",
    web_app_widgets: "상태 메시지 전달",
    epub_reference: "고정된 참조 위치 정보",
  },
  en: {
    media_prerecorded: "Captions, audio description, media alternatives",
    media_live: "Live captions",
    forms: "Labels, error identification, error suggestion",
    authentication: "Accessible authentication, redundant entry",
    timed_content: "Timing adjustable",
    moving_content: "Pause, stop, hide, audio control",
    drag_gesture: "Single-pointer and non-dragging alternatives",
    motion_input: "Motion actuation alternatives",
    data_tables: "Table structure and relationships",
    web_app_widgets: "Status message announcements",
    epub_reference: "Fixed reference location information",
  },
};

/** 항목에서 이동할 수 있는 Kitfolio 검사 도구의 CTA 문구 */
export const TOOL_CTA: Record<Lang, Record<string, string>> = {
  ko: {
    "color-contrast-checker": "명도대비 검사하기",
    "color-blindness-simulator": "색각별 화면 확인하기",
    "html-accessibility-checker": "HTML 구조 검사하기",
    "text-scaling-checker": "확대와 간격 확인하기",
  },
  en: {
    "color-contrast-checker": "Check color contrast",
    "color-blindness-simulator": "Preview color vision types",
    "html-accessibility-checker": "Inspect HTML structure",
    "text-scaling-checker": "Test scaling and spacing",
  },
};

/** 목표 레벨 표시 (WCAG 전용). KWCAG 은 레벨 대신 표준명을 쓴다. */
export function levelLabel(level: Level): string {
  return level ?? "";
}
