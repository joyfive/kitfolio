/* ============================================================
   HTML 접근성 검사기: 규칙 문구 (KO / EN)

   사용자 HTML 을 번역 딕셔너리에 넣지 않기 위해, 검사 엔진은 고정 키만
   돌려주고 실제 문구는 여기서 언어별로 관리한다. 사용자 입력에서 온 값
   (id · alt · tabindex 값 등)은 Finding.vars 로 전달되어 {중괄호} 자리에만
   끼워 넣는다.

   도구별 컨트롤 마이크로카피(버튼·필드 라벨)는 컴포넌트의 로컬 DICT 에 있다.
   이 파일은 규칙 카탈로그의 문구만 담당한다 (항목이 많아 분리).
   ============================================================ */
import type { Dict } from "../i18n";

export const RULE_COPY: Dict = {
  ko: {
    /* 문서 */
    "a11y.rule.DOC-001.title": "html 요소에 lang 속성이 없습니다",
    "a11y.rule.DOC-001.reason":
      "페이지 언어가 선언되지 않으면 스크린리더가 어떤 언어의 음성 엔진으로 읽을지 판단할 수 없어 발음이 어긋날 수 있습니다.",
    "a11y.rule.DOC-001.fix": '<html lang="ko"> 처럼 문서의 주 언어를 선언하세요.',
    "a11y.rule.DOC-002.title": "lang 값을 언어 태그로 해석할 수 없습니다",
    "a11y.rule.DOC-002.reason":
      '선언된 값 "{lang}" 은 표준 언어 태그로 해석되지 않습니다. 보조 기술이 이 값을 무시하거나 잘못 처리할 수 있습니다.',
    "a11y.rule.DOC-002.fix":
      'BCP 47 언어 태그를 사용하세요. 한국어는 "ko" 또는 "ko-KR", 영어는 "en" 또는 "en-US" 입니다.',
    "a11y.rule.DOC-003.title": "title 요소가 없거나 비어 있습니다",
    "a11y.rule.DOC-003.reason":
      "제목은 여러 탭이나 창, 방문 기록에서 페이지를 구분하는 첫 단서입니다. 비어 있으면 어떤 페이지인지 알 수 없습니다.",
    "a11y.rule.DOC-003.fix":
      "head 안에 페이지 내용을 설명하는 title 을 넣으세요. 앞쪽에 고유한 내용을, 뒤쪽에 사이트명을 두는 편이 읽기 쉽습니다.",
    "a11y.rule.DOC-004.title": "같은 id 가 여러 번 사용됐습니다",
    "a11y.rule.DOC-004.reason":
      'id "{id}" 가 문서에서 {count}번 사용됐습니다. label[for] 과 ARIA 참조는 첫 번째 요소만 찾으므로 나머지는 연결이 끊깁니다.',
    "a11y.rule.DOC-004.fix":
      "id 는 문서 안에서 유일해야 합니다. 컴포넌트를 반복 렌더링한다면 인덱스나 고유 접두사를 붙여 생성하세요.",
    "a11y.rule.DOC-005.title": "명시된 html 요소가 없어 lang 을 확인할 수 없습니다",
    "a11y.rule.DOC-005.reason":
      "HTML5 는 html·head·body 태그를 생략할 수 있어 파서가 이를 보완합니다. 원본에 html 태그가 없으면 페이지 언어 선언 여부를 판정할 수 없습니다.",
    "a11y.rule.DOC-005.fix":
      "전체 페이지를 검사하려면 <!doctype html> 과 <html lang=\"...\"> 을 포함한 원본을 붙여넣거나, 컴포넌트 조각 범위로 바꿔 검사하세요.",

    /* 헤딩 */
    "a11y.rule.HEAD-001.title": "헤딩에 읽을 수 있는 텍스트가 없습니다",
    "a11y.rule.HEAD-001.reason":
      "{level} 요소에 텍스트도 이름 신호도 없습니다. 보조 기술의 헤딩 목록에 빈 항목으로 나타나 탐색을 방해합니다.",
    "a11y.rule.HEAD-001.fix":
      "섹션 내용을 설명하는 텍스트를 넣으세요. 여백이나 간격이 목적이라면 헤딩 대신 CSS 로 처리합니다.",
    "a11y.rule.HEAD-002.title": "헤딩 단계를 건너뛰었습니다",
    "a11y.rule.HEAD-002.reason":
      "{from} 다음에 {to} 가 나와 중간 단계가 비었습니다. 헤딩 목록만 훑는 사용자는 빠진 섹션이 있다고 느낄 수 있습니다.",
    "a11y.rule.HEAD-002.fix":
      "콘텐츠의 포함 관계에 맞게 한 단계씩 내려가세요. 글자 크기가 목적이라면 단계를 바꾸지 말고 CSS 로 조정합니다.",
    "a11y.rule.HEAD-003.title": "문서에 h1 이 없습니다",
    "a11y.rule.HEAD-003.reason":
      "페이지 전체를 대표하는 제목이 없으면 문서의 주제를 한 번에 파악하기 어렵습니다.",
    "a11y.rule.HEAD-003.fix":
      "페이지의 주요 콘텐츠를 대표하는 제목 하나를 h1 으로 두세요. 보통 main 안의 첫 제목입니다.",
    "a11y.rule.HEAD-004.title": "문서에 h1 이 여러 개입니다",
    "a11y.rule.HEAD-004.reason":
      "h1 이 {count}개 있습니다. 그 자체로 실패는 아니지만, 최상위 제목이 여럿이면 문서 구조의 기준점이 흐려집니다.",
    "a11y.rule.HEAD-004.fix":
      "페이지를 대표하는 제목 하나만 h1 으로 두고 나머지는 h2 이하로 내려 구조를 정리하세요.",
    "a11y.rule.HEAD-005.title": 'role="heading" 에 유효한 aria-level 이 없습니다',
    "a11y.rule.HEAD-005.reason":
      "heading 역할을 선언했지만 단계를 알 수 없어 보조 기술이 문서 구조에서 어느 위치인지 전달하지 못합니다.",
    "a11y.rule.HEAD-005.fix":
      'aria-level 에 1 이상의 정수를 지정하거나, 가능하면 h1~h6 native 요소를 그대로 사용하세요.',

    /* 랜드마크 */
    "a11y.rule.LAND-001.title": "노출된 main 랜드마크가 없습니다",
    "a11y.rule.LAND-001.reason":
      "주요 콘텐츠 영역이 표시되지 않으면 보조 기술 사용자가 반복되는 헤더와 탐색을 건너뛰고 본문으로 바로 이동하기 어렵습니다.",
    "a11y.rule.LAND-001.fix":
      "페이지의 핵심 콘텐츠를 main 요소로 감싸세요. 페이지마다 하나만 노출합니다.",
    "a11y.rule.LAND-002.title": "노출된 main 랜드마크가 여러 개입니다",
    "a11y.rule.LAND-002.reason":
      "main 이 {count}개 노출돼 있습니다. 주요 콘텐츠가 어디인지 기준이 흐려집니다.",
    "a11y.rule.LAND-002.fix":
      "하나만 남기고 나머지는 section 이나 div 로 바꾸거나, 화면에 노출되지 않는 영역이라면 hidden 으로 감추세요.",
    "a11y.rule.LAND-003.title": "같은 역할의 랜드마크를 이름으로 구분할 수 없습니다",
    "a11y.rule.LAND-003.reason":
      "{role} 역할이 {count}개인데 이름이 없거나 서로 같습니다. 랜드마크 목록에서 어느 영역인지 구분되지 않습니다.",
    "a11y.rule.LAND-003.fix":
      'aria-label 로 목적을 구분하세요. 예: aria-label="주요 메뉴" 와 aria-label="푸터 메뉴".',
    "a11y.rule.LAND-004.title": "이름 없는 region·form 랜드마크입니다",
    "a11y.rule.LAND-004.reason":
      '역할을 {role} 로 선언했지만 이름 신호가 없습니다. 이름 없는 영역은 랜드마크 목록에서 목적을 알 수 없습니다.',
    "a11y.rule.LAND-004.fix":
      "aria-label 또는 aria-labelledby 로 이름을 주세요. 별도 영역으로 안내할 필요가 없다면 역할 선언을 빼는 편이 낫습니다.",

    /* 폼 · 이름 */
    "a11y.rule.FORM-001.title": "폼 컨트롤에 이름 신호가 없습니다",
    "a11y.rule.FORM-001.reason":
      "{tag} 요소에 연결된 label 도 aria-label 도 없습니다. 스크린리더가 무엇을 입력하는 칸인지 읽어줄 수 없습니다.",
    "a11y.rule.FORM-001.fix":
      '<label for="필드id"> 로 명시적으로 연결하세요. 화면에 레이블을 두지 않는 디자인이라면 aria-label 을 사용합니다.',
    "a11y.rule.FORM-002.title": "label 의 for 가 대상을 찾지 못합니다",
    "a11y.rule.FORM-002.reason.missing":
      'for="{for}" 가 가리키는 id 를 가진 요소가 문서에 없습니다. 레이블과 입력 필드의 연결이 끊어져 있습니다.',
    "a11y.rule.FORM-002.fix.missing":
      "for 값과 입력 필드의 id 를 정확히 일치시키세요. 컴포넌트를 복제하며 id 만 바뀐 경우가 많습니다.",
    "a11y.rule.FORM-002.reason.notLabelable":
      'for="{for}" 가 가리키는 요소는 {tag} 로, label 을 받을 수 있는 폼 컨트롤이 아닙니다.',
    "a11y.rule.FORM-002.fix.notLabelable":
      "for 는 input·select·textarea·button·meter·output·progress 만 가리킬 수 있습니다. 대상 요소를 다시 확인하세요.",
    "a11y.rule.FORM-003.title": "placeholder 외에 이름 신호가 없습니다",
    "a11y.rule.FORM-003.reason":
      'placeholder "{placeholder}" 만 있습니다. placeholder 는 입력을 시작하면 사라지고 이름 계산에서도 마지막 대체값이라 레이블을 대신하지 못합니다.',
    "a11y.rule.FORM-003.fix":
      "placeholder 는 보조 힌트로 두고, label 또는 aria-label 로 필드 이름을 따로 제공하세요.",
    "a11y.rule.FORM-004.title": "선택 그룹을 묶는 fieldset·legend 가 없습니다",
    "a11y.rule.FORM-004.reason":
      'name="{name}" 을 공유하는 선택 항목이 {count}개인데 공통 fieldset 과 legend 로 묶여 있지 않습니다. 각 항목의 레이블만 읽혀 무엇을 고르는 질문인지 전달되지 않습니다.',
    "a11y.rule.FORM-004.fix":
      "그룹 전체를 fieldset 으로 감싸고 첫 자식으로 legend 를 두어 질문을 적으세요.",

    "a11y.rule.NAME-001.title": "버튼·링크에 이름 신호가 없습니다",
    "a11y.rule.NAME-001.reason":
      "{tag} 요소에 읽을 수 있는 텍스트도 이름 신호도 없습니다. 링크 목록이나 버튼 안내에서 목적을 알 수 없습니다.",
    "a11y.rule.NAME-001.fix":
      "요소 안에 목적을 설명하는 텍스트를 넣으세요. 아이콘만 쓰는 디자인이라면 aria-label 로 동작을 설명합니다.",
    "a11y.rule.NAME-002.title": "보이는 문구가 접근 가능한 이름에 들어 있지 않습니다",
    "a11y.rule.NAME-002.reason":
      '화면에는 "{visible}" 이라고 쓰여 있는데 이름 신호는 "{name}" 입니다. 음성 입력 사용자가 보이는 대로 말해도 이 컨트롤을 지목하지 못할 수 있습니다.',
    "a11y.rule.NAME-002.fix":
      "보이는 문구를 이름 앞부분에 그대로 포함시키세요. 보통은 aria-label 을 지우고 화면 텍스트를 그대로 쓰는 편이 안전합니다.",
    "a11y.rule.NAME-003.title": "이미지 버튼에 alt 가 없습니다",
    "a11y.rule.NAME-003.reason":
      'input[type="image"] 는 버튼이므로 대체 텍스트가 곧 버튼 이름입니다. 지금은 이름 신호가 없습니다.',
    "a11y.rule.NAME-003.fix":
      'alt 에 이미지의 모양이 아니라 버튼의 동작을 적으세요. 예: alt="검색".',
    "a11y.rule.NAME-004.title": "상호작용 역할에 이름 신호가 없습니다",
    "a11y.rule.NAME-004.reason":
      '{tag} 요소가 role="{role}" 을 선언했지만 이름 신호가 없습니다. 보조 기술이 역할만 읽고 무엇을 하는 컨트롤인지 전달하지 못합니다.',
    "a11y.rule.NAME-004.fix":
      "텍스트 콘텐츠나 aria-label 로 이름을 주세요. 가능하면 button·a 같은 native 요소로 바꾸는 편이 상태와 키보드 동작까지 함께 얻습니다.",

    /* 이미지 */
    "a11y.rule.IMG-001.title": "img 에 alt 속성이 없습니다",
    "a11y.rule.IMG-001.reason":
      "alt 속성 자체가 없으면 일부 보조 기술이 파일명이나 경로를 대신 읽습니다. 장식 이미지인지 정보 이미지인지도 구분되지 않습니다.",
    "a11y.rule.IMG-001.fix":
      '정보를 전달하는 이미지라면 목적을 설명하는 alt 를, 순수 장식이라면 alt="" 를 넣으세요.',
    "a11y.rule.IMG-002.title": "alt 가 빈 문자열입니다",
    "a11y.rule.IMG-002.reason":
      'alt="" 는 보조 기술이 이미지를 건너뛰게 합니다. 장식 이미지라면 올바른 선택이지만, 정보를 전달하는 이미지라면 내용이 사라집니다.',
    "a11y.rule.IMG-002.fix":
      "이 이미지가 주변 텍스트에 없는 정보를 전달하는지 확인하세요. 전달한다면 alt 에 그 내용을 적습니다.",
    "a11y.rule.IMG-003.title": "alt 가 파일명이나 일반 단어처럼 보입니다",
    "a11y.rule.IMG-003.reason":
      'alt 값이 "{alt}" 입니다. 파일명·경로·일반 명사는 이미지의 의미를 전달하지 못합니다.',
    "a11y.rule.IMG-003.fix":
      "이미지가 그 자리에서 무엇을 전달하는지 적으세요. 같은 이미지라도 기사·상품 카드·링크에서 필요한 설명이 다릅니다.",
    "a11y.rule.IMG-004.title": "이미지만 있는 링크에 이름 신호가 없습니다",
    "a11y.rule.IMG-004.reason":
      "링크 안에 이미지만 있고 이름 신호가 없습니다. 링크 목록에서 이동 대상을 알 수 없습니다.",
    "a11y.rule.IMG-004.fix":
      "이미지의 alt 에 이동 대상이나 동작을 적으세요. 이미지가 장식이라면 링크 자체에 aria-label 을 두거나 화면에 보이는 텍스트를 추가합니다.",
    "a11y.rule.IMG-005.title": 'role="img" 에 이름 신호가 없습니다',
    "a11y.rule.IMG-005.reason":
      "{tag} 요소를 이미지 역할로 선언하면 안의 텍스트 대신 이름이 읽힙니다. 이름이 없으면 아무것도 전달되지 않습니다.",
    "a11y.rule.IMG-005.fix":
      "aria-label 이나 aria-labelledby 로 이름을 주세요. svg 라면 첫 자식으로 title 을 두고 aria-labelledby 로 연결할 수 있습니다.",

    /* ARIA 참조 */
    "a11y.rule.ARIA-001.title": "ARIA 속성이 존재하지 않는 id 를 참조합니다",
    "a11y.rule.ARIA-001.reason":
      "{attr} 이 가리키는 id 를 문서에서 찾을 수 없습니다: {ids}. 이름·설명·제어 관계가 전달되지 않습니다.",
    "a11y.rule.ARIA-001.fix":
      "참조하는 요소가 같은 문서 안에 있고 id 철자가 일치하는지 확인하세요. 조각만 검사했다면 나머지 마크업까지 포함해 다시 검사하세요.",
    "a11y.rule.ARIA-002.title": 'aria-hidden 영역 안에 포커스 가능한 요소가 있습니다',
    "a11y.rule.ARIA-002.reason":
      '이 영역은 aria-hidden="true" 로 접근성 트리에서 제거됐지만 안에 포커스 가능한 요소가 {count}개 있습니다. 키보드 포커스가 이름 없는 자리로 들어갈 수 있습니다.',
    "a11y.rule.ARIA-002.fix":
      "숨기려는 영역이라면 안의 컨트롤도 함께 비활성화하거나 순차 탐색에서 제외하세요. 실제로 보이는 영역이라면 aria-hidden 을 빼야 합니다.",
    "a11y.rule.ARIA-003.title": "aria-labelledby 참조 관계를 확인하세요",
    "a11y.rule.ARIA-003.reason.self":
      "aria-labelledby 가 자기 자신만 가리킵니다. 이름 계산이 의도대로 끝나지 않을 수 있습니다.",
    "a11y.rule.ARIA-003.fix.self":
      "이름이 될 텍스트를 가진 다른 요소를 가리키거나, 요소 안의 텍스트를 이름으로 쓰도록 속성을 빼세요.",
    "a11y.rule.ARIA-003.reason.cycle":
      "두 요소가 서로의 aria-labelledby 대상으로 지정돼 순환 참조가 됩니다.",
    "a11y.rule.ARIA-003.fix.cycle":
      "이름의 출처를 한 방향으로 정리하세요. 이름을 제공하는 요소는 보통 제목이나 레이블 텍스트입니다.",
    "a11y.rule.ARIA-003.reason.hidden":
      "aria-labelledby 가 숨겨진 노드를 직접 참조합니다. 표준 계산에는 예외가 있지만 브라우저와 보조 기술마다 결과가 다를 수 있습니다.",
    "a11y.rule.ARIA-003.fix.hidden":
      "실제 보조 기술에서 이름이 읽히는지 확인하세요. 가능하면 화면에 보이는 텍스트를 이름의 출처로 삼는 편이 안정적입니다.",

    /* 키보드 · 포커스 */
    "a11y.rule.FOCUS-001.title": "양수 tabindex 를 사용합니다",
    "a11y.rule.FOCUS-001.reason":
      'tabindex="{value}" 는 이 요소를 일반 DOM 순서보다 앞으로 당깁니다. 코드가 바뀔 때마다 관리해야 하는 별도의 순서가 생깁니다.',
    "a11y.rule.FOCUS-001.fix":
      'tabindex 를 빼고 DOM 순서를 원하는 탐색 순서에 맞추세요. 포커스만 받게 하려면 tabindex="0" 을 사용합니다.',
    "a11y.rule.FOCUS-002.title": "tabindex 값을 숫자로 해석할 수 없습니다",
    "a11y.rule.FOCUS-002.reason":
      'tabindex="{value}" 는 정수가 아닙니다. 브라우저가 값을 무시해 의도한 포커스 동작이 적용되지 않습니다.',
    "a11y.rule.FOCUS-002.fix": 'tabindex 에는 0 또는 -1 처럼 정수만 지정하세요.',
    "a11y.rule.FOCUS-003.title": "클릭 핸들러만 있고 키보드로 조작할 수 없습니다",
    "a11y.rule.FOCUS-003.reason":
      "{tag} 요소에 onclick 이 있지만 포커스를 받지 못하고 키보드 이벤트 속성도 없습니다. 마우스 없이 이 기능을 실행할 수 없습니다.",
    "a11y.rule.FOCUS-003.fix":
      "button 이나 a 같은 native 요소로 바꾸세요. 구조를 유지해야 한다면 역할·tabindex·키보드 이벤트를 모두 직접 구현해야 합니다.",
    "a11y.rule.FOCUS-004.title": 'native 컨트롤이 tabindex="-1" 로 제외됐습니다',
    "a11y.rule.FOCUS-004.reason":
      "{tag} 요소가 순차 탐색에서 빠졌습니다. 프로그램으로만 포커스를 옮기려는 의도일 수 있지만, 키보드 사용자가 이 기능에 닿지 못할 수 있습니다.",
    "a11y.rule.FOCUS-004.fix":
      "의도한 제외가 아니라면 tabindex 를 빼세요. 의도한 것이라면 같은 기능에 도달할 다른 키보드 경로가 있는지 확인하세요.",

    /* 고정 수동 검사 */
    "a11y.rule.MANUAL-001.title": "모든 기능을 키보드만으로 실행할 수 있나요?",
    "a11y.rule.MANUAL-001.reason":
      "마우스로만 가능한 조작이 남아 있으면 키보드와 보조 기술 사용자는 그 기능을 쓸 수 없습니다.",
    "a11y.rule.MANUAL-001.fix":
      "마우스를 치우고 Tab·Shift+Tab·Enter·Space·방향키만으로 처음부터 끝까지 실행해 보세요.",
    "a11y.rule.MANUAL-002.title": "모달·메뉴에서 포커스가 갇히지 않나요?",
    "a11y.rule.MANUAL-002.reason":
      "열린 대화상자 안에 포커스를 묶어야 하지만, 닫은 뒤 빠져나오지 못하면 키보드 사용자가 갇힙니다.",
    "a11y.rule.MANUAL-002.fix":
      "열 때 포커스가 대화상자로 들어가는지, Esc 로 닫힌 뒤 원래 트리거로 돌아오는지 확인하세요.",
    "a11y.rule.MANUAL-003.title": "포커스 표시가 충분히 보이나요?",
    "a11y.rule.MANUAL-003.reason":
      "포커스 표시가 없거나 고정 헤더·오버레이에 가려지면 지금 어디에 있는지 알 수 없습니다.",
    "a11y.rule.MANUAL-003.fix":
      "모든 컨트롤에서 Tab 을 눌러 표시가 보이는지, 스크롤된 상태에서도 가려지지 않는지 확인하세요.",
    "a11y.rule.MANUAL-004.title": "시각적 순서와 DOM·탭 순서가 일치하나요?",
    "a11y.rule.MANUAL-004.reason":
      "flex 나 grid 의 order, 절대 위치 지정은 화면 순서만 바꾸고 탐색 순서는 바꾸지 않습니다.",
    "a11y.rule.MANUAL-004.fix":
      "실제 화면에서 Tab 을 눌러 이동 경로가 눈으로 읽는 순서와 어긋나지 않는지 확인하세요.",
    "a11y.rule.MANUAL-005.title": "반복 영역을 건너뛸 수 있나요?",
    "a11y.rule.MANUAL-005.reason":
      "skip link 가 마크업에 있어도 실제로 포커스가 이동하고 표시되는지는 실행해야 알 수 있습니다.",
    "a11y.rule.MANUAL-005.fix":
      "첫 Tab 에서 skip link 가 나타나는지, 눌렀을 때 본문으로 포커스가 이동하는지 확인하세요.",
    "a11y.rule.MANUAL-006.title": "오류와 상태 변경이 텍스트로 전달되나요?",
    "a11y.rule.MANUAL-006.reason":
      "화면에만 나타나는 오류 메시지나 로딩 상태는 스크린리더 사용자에게 전달되지 않을 수 있습니다.",
    "a11y.rule.MANUAL-006.fix":
      "오류 문구가 해당 필드와 연결됐는지, 상태 변경이 aria-live 등으로 안내되는지 확인하세요.",
    "a11y.rule.MANUAL-007.title": "실제 화면의 명도대비가 충분한가요?",
    "a11y.rule.MANUAL-007.reason":
      "정적 HTML 검사는 CSS 색상과 실제 배경을 계산하지 않으므로 대비는 판정할 수 없습니다.",
    "a11y.rule.MANUAL-007.fix":
      "글자·아이콘·테두리 색을 명도대비 검사기에서 배경색과 함께 측정하세요.",
    "a11y.rule.MANUAL-008.title": "모든 상태에서 구조와 이름이 유지되나요?",
    "a11y.rule.MANUAL-008.reason":
      "호버·포커스·로딩·오류·비활성 상태에서 이름이나 구조가 달라지면 보조 기술이 읽는 내용도 달라집니다.",
    "a11y.rule.MANUAL-008.fix":
      "각 상태를 직접 재현하며 이름과 역할, 헤딩 구조가 그대로 유지되는지 확인하세요.",
  },

  en: {
    /* Document */
    "a11y.rule.DOC-001.title": "The html element has no lang attribute",
    "a11y.rule.DOC-001.reason":
      "Without a declared page language, a screen reader cannot choose the right speech engine and may pronounce the content incorrectly.",
    "a11y.rule.DOC-001.fix": 'Declare the primary language, for example <html lang="en">.',
    "a11y.rule.DOC-002.title": "The lang value is not a recognizable language tag",
    "a11y.rule.DOC-002.reason":
      'The declared value "{lang}" does not resolve to a standard language tag, so assistive technology may ignore or misapply it.',
    "a11y.rule.DOC-002.fix":
      'Use a BCP 47 language tag such as "en", "en-US" or "ko-KR".',
    "a11y.rule.DOC-003.title": "The title element is missing or empty",
    "a11y.rule.DOC-003.reason":
      "The title is the first way people tell one tab, window or history entry from another. An empty title says nothing about the page.",
    "a11y.rule.DOC-003.fix":
      "Add a title inside head that describes the page. Putting the unique part first and the site name last reads better.",
    "a11y.rule.DOC-004.title": "The same id is used more than once",
    "a11y.rule.DOC-004.reason":
      'The id "{id}" appears {count} times. label[for] and ARIA references resolve to the first match only, so the rest lose their connection.',
    "a11y.rule.DOC-004.fix":
      "Keep every id unique within the document. When a component repeats, generate ids with an index or a unique prefix.",
    "a11y.rule.DOC-005.title": "No explicit html element, so lang cannot be checked",
    "a11y.rule.DOC-005.reason":
      "HTML5 allows html, head and body to be omitted, and the parser inserts them. Without an html tag in the source, the page language declaration cannot be evaluated.",
    "a11y.rule.DOC-005.fix":
      'To check a whole page, paste source that includes <!doctype html> and <html lang="...">, or switch to fragment scope.',

    /* Headings */
    "a11y.rule.HEAD-001.title": "The heading has no readable text",
    "a11y.rule.HEAD-001.reason":
      "This {level} element has neither text nor a name signal, so it appears as an empty entry in a heading list and interrupts navigation.",
    "a11y.rule.HEAD-001.fix":
      "Add text that describes the section. If the element exists for spacing, use CSS instead of a heading.",
    "a11y.rule.HEAD-002.title": "A heading level was skipped",
    "a11y.rule.HEAD-002.reason":
      "{to} follows {from}, leaving the level between them empty. Someone scanning the heading list may think a section is missing.",
    "a11y.rule.HEAD-002.fix":
      "Move down one level at a time to match how the content nests. If the goal is type size, change the styling rather than the level.",
    "a11y.rule.HEAD-003.title": "The document has no h1",
    "a11y.rule.HEAD-003.reason":
      "Without a top-level heading, the subject of the page is harder to establish at a glance.",
    "a11y.rule.HEAD-003.fix":
      "Give the page one h1 that names its main content, usually the first heading inside main.",
    "a11y.rule.HEAD-004.title": "The document has more than one h1",
    "a11y.rule.HEAD-004.reason":
      "There are {count} h1 elements. That is not a failure on its own, but multiple top-level headings blur the reference point of the structure.",
    "a11y.rule.HEAD-004.fix":
      "Keep one h1 for the page and move the others to h2 or lower so the outline stays clear.",
    "a11y.rule.HEAD-005.title": 'role="heading" has no valid aria-level',
    "a11y.rule.HEAD-005.reason":
      "The heading role is declared but its level is unknown, so assistive technology cannot place it in the document outline.",
    "a11y.rule.HEAD-005.fix":
      "Set aria-level to an integer of 1 or greater, or use a native h1 to h6 element instead.",

    /* Landmarks */
    "a11y.rule.LAND-001.title": "No exposed main landmark",
    "a11y.rule.LAND-001.reason":
      "Without a primary content region, assistive-technology users cannot jump past the repeated header and navigation to reach the content.",
    "a11y.rule.LAND-001.fix":
      "Wrap the page's core content in a main element and expose only one per page.",
    "a11y.rule.LAND-002.title": "More than one exposed main landmark",
    "a11y.rule.LAND-002.reason":
      "{count} main landmarks are exposed, so there is no single answer to where the primary content is.",
    "a11y.rule.LAND-002.fix":
      "Keep one and change the others to section or div, or hide regions that are not currently displayed.",
    "a11y.rule.LAND-003.title": "Repeated landmarks cannot be told apart by name",
    "a11y.rule.LAND-003.reason":
      "There are {count} {role} landmarks with missing or identical names, so a landmark list cannot distinguish them.",
    "a11y.rule.LAND-003.fix":
      'Name each one by purpose with aria-label, for example aria-label="Primary" and aria-label="Footer".',
    "a11y.rule.LAND-004.title": "A region or form landmark has no name",
    "a11y.rule.LAND-004.reason":
      'The element declares role="{role}" but has no name signal, so its purpose is unknown in a landmark list.',
    "a11y.rule.LAND-004.fix":
      "Add a name with aria-label or aria-labelledby. If the area does not need to be announced as a region, remove the role instead.",

    /* Forms and names */
    "a11y.rule.FORM-001.title": "The form control has no name signal",
    "a11y.rule.FORM-001.reason":
      "This {tag} element has no associated label and no aria-label, so a screen reader cannot say what the field is for.",
    "a11y.rule.FORM-001.fix":
      'Associate a label explicitly with <label for="fieldId">. When no visible label fits the design, use aria-label.',
    "a11y.rule.FORM-002.title": "The label's for attribute has no valid target",
    "a11y.rule.FORM-002.reason.missing":
      'No element in the document has the id "{for}", so the label and its field are not connected.',
    "a11y.rule.FORM-002.fix.missing":
      "Make the for value match the field's id exactly. This often breaks when a component is copied and only the id changes.",
    "a11y.rule.FORM-002.reason.notLabelable":
      'The element with id "{for}" is a {tag}, which cannot receive a label.',
    "a11y.rule.FORM-002.fix.notLabelable":
      "for can only point to input, select, textarea, button, meter, output or progress. Check the target element.",
    "a11y.rule.FORM-003.title": "The only name signal is a placeholder",
    "a11y.rule.FORM-003.reason":
      'Only the placeholder "{placeholder}" is present. A placeholder disappears once typing starts and is the last fallback in name computation, so it does not replace a label.',
    "a11y.rule.FORM-003.fix":
      "Keep the placeholder as a hint and provide the field name separately with a label or aria-label.",
    "a11y.rule.FORM-004.title": "The choice group has no fieldset and legend",
    "a11y.rule.FORM-004.reason":
      'The {count} controls that share name="{name}" are not wrapped in a common fieldset with a legend, so only the individual labels are announced and the group question is lost.',
    "a11y.rule.FORM-004.fix":
      "Wrap the group in a fieldset and make a legend its first child to carry the question.",

    "a11y.rule.NAME-001.title": "The button or link has no name signal",
    "a11y.rule.NAME-001.reason":
      "This {tag} element has no readable text and no name signal, so its purpose is unknown in a list of links or controls.",
    "a11y.rule.NAME-001.fix":
      "Add text that describes the action. For icon-only controls, describe the action with aria-label.",
    "a11y.rule.NAME-002.title": "The visible text is not part of the accessible name",
    "a11y.rule.NAME-002.reason":
      'The control reads "{visible}" on screen but its name signal is "{name}". Someone using speech input may not be able to select it by saying what they see.',
    "a11y.rule.NAME-002.fix":
      "Include the visible text at the start of the name. Removing aria-label and relying on the visible text is usually the safest fix.",
    "a11y.rule.NAME-003.title": "The image button has no alt",
    "a11y.rule.NAME-003.reason":
      'An input[type="image"] is a button, so its alternative text is its name. Right now it has no name signal.',
    "a11y.rule.NAME-003.fix":
      'Describe the action rather than the picture, for example alt="Search".',
    "a11y.rule.NAME-004.title": "An interactive role has no name signal",
    "a11y.rule.NAME-004.reason":
      'This {tag} element declares role="{role}" but has no name signal, so assistive technology announces the role without saying what the control does.',
    "a11y.rule.NAME-004.fix":
      "Give it a name through text content or aria-label. Using a native button or link is usually better, since state and keyboard behavior come with it.",

    /* Images */
    "a11y.rule.IMG-001.title": "The img element has no alt attribute",
    "a11y.rule.IMG-001.reason":
      "With no alt attribute at all, some assistive technology reads the file name or path instead, and decorative and informative images cannot be told apart.",
    "a11y.rule.IMG-001.fix":
      'Add alt text that conveys the purpose of an informative image, or alt="" for a purely decorative one.',
    "a11y.rule.IMG-002.title": "The alt attribute is empty",
    "a11y.rule.IMG-002.reason":
      'alt="" tells assistive technology to skip the image. That is correct for decoration, but it removes the content of an informative image.',
    "a11y.rule.IMG-002.fix":
      "Check whether the image carries information that is not already in the surrounding text. If it does, describe it in alt.",
    "a11y.rule.IMG-003.title": "The alt value looks like a filename or a generic word",
    "a11y.rule.IMG-003.reason":
      'The alt value is "{alt}". File names, paths and generic nouns do not convey what the image means.',
    "a11y.rule.IMG-003.fix":
      "Describe what the image conveys in this position. The same picture needs different text in an article, a product card or a link.",
    "a11y.rule.IMG-004.title": "An image-only link has no name signal",
    "a11y.rule.IMG-004.reason":
      "The link contains only images and has no name signal, so its destination is unknown in a list of links.",
    "a11y.rule.IMG-004.fix":
      "Put the destination or action in the image's alt text. If the image is decorative, name the link itself with aria-label or add visible text.",
    "a11y.rule.IMG-005.title": 'role="img" has no name signal',
    "a11y.rule.IMG-005.reason":
      "Declaring this {tag} element as an image replaces its inner content with a name. With no name, nothing is conveyed.",
    "a11y.rule.IMG-005.fix":
      "Add a name with aria-label or aria-labelledby. For an svg, a first-child title element referenced by aria-labelledby also works.",

    /* ARIA references */
    "a11y.rule.ARIA-001.title": "An ARIA attribute points to an id that does not exist",
    "a11y.rule.ARIA-001.reason":
      "{attr} references ids that are not in the document: {ids}. The name, description or control relationship is lost.",
    "a11y.rule.ARIA-001.fix":
      "Confirm the referenced element is in the same document and the id spelling matches. If you checked a fragment, include the surrounding markup and run it again.",
    "a11y.rule.ARIA-002.title": "A focusable element sits inside an aria-hidden region",
    "a11y.rule.ARIA-002.reason":
      'This region is removed from the accessibility tree by aria-hidden="true", yet it contains {count} focusable elements. Keyboard focus can land somewhere with no name.',
    "a11y.rule.ARIA-002.fix":
      "If the region is genuinely hidden, disable or remove its controls from the tab sequence. If it is visible, remove aria-hidden.",
    "a11y.rule.ARIA-003.title": "Check the aria-labelledby reference",
    "a11y.rule.ARIA-003.reason.self":
      "aria-labelledby points only at the element itself, so name computation may not resolve as intended.",
    "a11y.rule.ARIA-003.fix.self":
      "Point at another element that holds the naming text, or remove the attribute and let the element's own text be the name.",
    "a11y.rule.ARIA-003.reason.cycle":
      "Two elements name each other through aria-labelledby, creating a circular reference.",
    "a11y.rule.ARIA-003.fix.cycle":
      "Make the naming flow in one direction. The naming element is usually a heading or a label.",
    "a11y.rule.ARIA-003.reason.hidden":
      "aria-labelledby references a hidden node directly. The specification allows this, but browsers and assistive technology can behave differently.",
    "a11y.rule.ARIA-003.fix.hidden":
      "Verify the name in real assistive technology. Naming from visible text is the more predictable option.",

    /* Keyboard and focus */
    "a11y.rule.FOCUS-001.title": "A positive tabindex is used",
    "a11y.rule.FOCUS-001.reason":
      'tabindex="{value}" pulls this element ahead of the normal DOM order and creates a separate sequence to maintain as the code changes.',
    "a11y.rule.FOCUS-001.fix":
      'Remove tabindex and order the DOM the way people should move through it. Use tabindex="0" when an element only needs to be focusable.',
    "a11y.rule.FOCUS-002.title": "The tabindex value is not an integer",
    "a11y.rule.FOCUS-002.reason":
      'tabindex="{value}" is not an integer, so the browser ignores it and the intended focus behavior does not apply.',
    "a11y.rule.FOCUS-002.fix": "Use an integer such as 0 or -1.",
    "a11y.rule.FOCUS-003.title": "A click handler with no keyboard path",
    "a11y.rule.FOCUS-003.reason":
      "This {tag} element has onclick but cannot receive focus and has no keyboard event attribute, so the action cannot be performed without a mouse.",
    "a11y.rule.FOCUS-003.fix":
      "Use a native button or link. If the structure must stay, you have to add the role, tabindex and keyboard handling yourself.",
    "a11y.rule.FOCUS-004.title": 'A native control is removed with tabindex="-1"',
    "a11y.rule.FOCUS-004.reason":
      "This {tag} element is out of the tab sequence. That can be deliberate for programmatic focus, but keyboard users may lose access to the feature.",
    "a11y.rule.FOCUS-004.fix":
      "Remove tabindex if the exclusion was not intended. If it was, confirm another keyboard path reaches the same feature.",

    /* Fixed manual checks */
    "a11y.rule.MANUAL-001.title": "Can every feature be operated from the keyboard?",
    "a11y.rule.MANUAL-001.reason":
      "Any action that works only with a mouse is unavailable to keyboard and assistive-technology users.",
    "a11y.rule.MANUAL-001.fix":
      "Put the mouse aside and complete each flow with Tab, Shift+Tab, Enter, Space and the arrow keys.",
    "a11y.rule.MANUAL-002.title": "Does focus escape modals and menus?",
    "a11y.rule.MANUAL-002.reason":
      "Focus should stay inside an open dialog, but a user is trapped if it cannot leave after the dialog closes.",
    "a11y.rule.MANUAL-002.fix":
      "Check that focus moves into the dialog when it opens and returns to the trigger after Esc closes it.",
    "a11y.rule.MANUAL-003.title": "Is the focus indicator clearly visible?",
    "a11y.rule.MANUAL-003.reason":
      "A missing indicator, or one hidden behind a sticky header or overlay, leaves people unsure where they are.",
    "a11y.rule.MANUAL-003.fix":
      "Tab through every control and confirm the indicator stays visible, including while the page is scrolled.",
    "a11y.rule.MANUAL-004.title": "Do visual order and DOM order agree?",
    "a11y.rule.MANUAL-004.reason":
      "Flex and grid order, along with absolute positioning, change the visual sequence without changing the focus sequence.",
    "a11y.rule.MANUAL-004.fix":
      "Tab through the rendered page and confirm the path matches the order people read.",
    "a11y.rule.MANUAL-005.title": "Can repeated regions be bypassed?",
    "a11y.rule.MANUAL-005.reason":
      "A skip link in the markup does not prove that focus actually moves and that the link becomes visible.",
    "a11y.rule.MANUAL-005.fix":
      "Press Tab once and confirm the skip link appears and moves focus into the main content.",
    "a11y.rule.MANUAL-006.title": "Are errors and status changes conveyed as text?",
    "a11y.rule.MANUAL-006.reason":
      "Error messages and loading states that exist only visually may never reach a screen reader.",
    "a11y.rule.MANUAL-006.fix":
      "Check that error text is associated with its field and that status changes are announced, for example with aria-live.",
    "a11y.rule.MANUAL-007.title": "Is the rendered color contrast sufficient?",
    "a11y.rule.MANUAL-007.reason":
      "Static HTML analysis does not resolve CSS colors or the actual background, so contrast cannot be evaluated here.",
    "a11y.rule.MANUAL-007.fix":
      "Measure text, icon and border colors together with their background in the contrast checker.",
    "a11y.rule.MANUAL-008.title": "Do all states keep the same structure and name?",
    "a11y.rule.MANUAL-008.reason":
      "If hover, focus, loading, error or disabled states change a name or the structure, what assistive technology announces changes too.",
    "a11y.rule.MANUAL-008.fix":
      "Reproduce each state and confirm names, roles and heading structure stay the same.",
  },
};

/** {변수} 자리에 Finding.vars 값을 끼워 넣는다. 값이 없으면 자리를 지운다. */
export function interpolate(template: string, vars?: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars?.[key] ?? "");
}
