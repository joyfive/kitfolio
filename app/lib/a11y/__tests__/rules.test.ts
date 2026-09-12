/* ============================================================
   검사 규칙: 규칙마다 발견되는 경우(positive)와 발견되지 않는 경우(negative)

   "무엇을 잡는가"만큼 "무엇을 잡지 않는가"가 중요하다. 오탐은 도구를
   신뢰할 수 없게 만들고, 사용자가 결과 전체를 무시하게 만든다.
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { analyzeHtml } from "../analyze";
import type { Scope } from "../types";

function rules(html: string, scope: Scope = "fragment"): string[] {
  return analyzeHtml(html, scope)
    .findings.filter((f) => f.level !== "manual")
    .map((f) => f.ruleId);
}

function has(html: string, ruleId: string, scope: Scope = "fragment") {
  assert.ok(
    rules(html, scope).includes(ruleId),
    `${ruleId} 를 찾지 못함: ${rules(html, scope).join(", ") || "(없음)"}`,
  );
}

function hasNot(html: string, ruleId: string, scope: Scope = "fragment") {
  assert.ok(!rules(html, scope).includes(ruleId), `${ruleId} 오탐`);
}

describe("문서 규칙", () => {
  test("DOC-001: 명시된 html 에 lang 이 없으면 잡고, 있으면 잡지 않는다", () => {
    has("<html><head><title>T</title></head><body><main>a</main></body></html>", "DOC-001", "document");
    hasNot(
      '<html lang="ko"><head><title>T</title></head><body><main>a</main></body></html>',
      "DOC-001",
      "document",
    );
  });

  test("DOC-001: 파서가 보완한 html 을 근거로 판정하지 않는다", () => {
    // 원본에 html 태그가 없으면 lang 누락이 아니라 확인 불가(DOC-005)다
    hasNot("<p>hello</p>", "DOC-001", "document");
    has("<p>hello</p>", "DOC-005", "document");
  });

  test("DOC-002: 해석할 수 없는 언어 태그만 검토 항목이 된다", () => {
    has('<html lang="한국어"><head><title>T</title></head><body></body></html>', "DOC-002", "document");
    hasNot('<html lang="ko-KR"><head><title>T</title></head><body></body></html>', "DOC-002", "document");
  });

  test("DOC-003: title 이 없거나 공백이면 잡는다", () => {
    has('<html lang="ko"><head><title></title></head><body></body></html>', "DOC-003", "document");
    has('<html lang="ko"><head></head><body></body></html>', "DOC-003", "document");
    hasNot('<html lang="ko"><head><title>설정</title></head><body></body></html>', "DOC-003", "document");
  });

  test("DOC-004: 중복 id 는 두 번째부터 수정 위치로 표시한다", () => {
    const found = analyzeHtml('<p id="a"></p><p id="a"></p><p id="a"></p>', "fragment").findings.filter(
      (f) => f.ruleId === "DOC-004",
    );
    assert.equal(found.length, 2);
    assert.equal(found[0].vars?.count, "3");
    hasNot('<p id="a"></p><p id="b"></p>', "DOC-004");
  });
});

describe("헤딩 규칙", () => {
  test("HEAD-001: 빈 헤딩은 잡고, 이름 신호가 있으면 잡지 않는다", () => {
    has("<h2></h2>", "HEAD-001");
    hasNot("<h2>프로필</h2>", "HEAD-001");
    hasNot('<h2><img src="a.png" alt="프로필"></h2>', "HEAD-001");
  });

  test("HEAD-002: 아래로 두 단계 이상 건너뛸 때만 잡는다", () => {
    has("<h2>a</h2><h4>b</h4>", "HEAD-002");
    hasNot("<h2>a</h2><h3>b</h3>", "HEAD-002");
    // 상위 단계로 돌아가는 것은 섹션 종료일 수 있다
    hasNot("<h2>a</h2><h3>b</h3><h4>c</h4><h2>d</h2>", "HEAD-002");
  });

  test("HEAD-003·HEAD-004: h1 개수는 전체 문서에서만 검토한다", () => {
    has('<html lang="ko"><head><title>T</title></head><body><h2>a</h2></body></html>', "HEAD-003", "document");
    has(
      '<html lang="ko"><head><title>T</title></head><body><h1>a</h1><h1>b</h1></body></html>',
      "HEAD-004",
      "document",
    );
    hasNot("<h2>a</h2>", "HEAD-003");
    hasNot("<h1>a</h1><h1>b</h1>", "HEAD-004");
  });

  test("HEAD-005: role=heading 에 유효한 aria-level 이 필요하다", () => {
    has('<div role="heading">제목</div>', "HEAD-005");
    hasNot('<div role="heading" aria-level="2">제목</div>', "HEAD-005");
    // native 헤딩에 role 을 얹으면 태그 단계가 남는다
    hasNot('<h2 role="heading">제목</h2>', "HEAD-005");
  });
});

describe("랜드마크 규칙", () => {
  test("LAND-001·LAND-002: main 개수는 전체 문서에서만 본다", () => {
    has('<html lang="ko"><head><title>T</title></head><body><p>a</p></body></html>', "LAND-001", "document");
    has(
      '<html lang="ko"><head><title>T</title></head><body><main>a</main><main>b</main></body></html>',
      "LAND-002",
      "document",
    );
    hasNot(
      '<html lang="ko"><head><title>T</title></head><body><main>a</main></body></html>',
      "LAND-001",
      "document",
    );
  });

  test("LAND-003: 같은 역할이 여러 개이고 이름이 없거나 겹치면 잡는다", () => {
    has("<nav><a href='/'>a</a></nav><nav><a href='/b'>b</a></nav>", "LAND-003");
    has('<nav aria-label="메뉴"></nav><nav aria-label="메뉴"></nav>', "LAND-003");
    hasNot('<nav aria-label="주요 메뉴"></nav><nav aria-label="푸터 메뉴"></nav>', "LAND-003");
    hasNot("<nav><a href='/'>a</a></nav>", "LAND-003");
  });

  test("LAND-004: 명시적 region·form 에는 이름이 필요하다", () => {
    has('<div role="region">내용</div>', "LAND-004");
    hasNot('<div role="region" aria-label="요약">내용</div>', "LAND-004");
    // 이름 없는 section 은 랜드마크로 노출되지 않으므로 대상이 아니다
    hasNot("<section>내용</section>", "LAND-004");
  });
});

describe("폼 규칙", () => {
  test("FORM-001: 이름 신호가 전혀 없는 컨트롤만 잡는다", () => {
    has("<input type='text'>", "FORM-001");
    has("<select></select>", "FORM-001");
    hasNot('<label for="a">이메일</label><input id="a">', "FORM-001");
    hasNot("<label>이메일 <input></label>", "FORM-001");
    hasNot('<input aria-label="이메일">', "FORM-001");
    hasNot('<p id="t">이메일</p><input aria-labelledby="t">', "FORM-001");
    hasNot('<input type="hidden">', "FORM-001");
  });

  test("FORM-002: for 가 없는 id 나 label 을 받을 수 없는 요소를 가리키면 잡는다", () => {
    has('<label for="none">이메일</label><input id="email">', "FORM-002");
    has('<label for="d">이메일</label><div id="d"></div>', "FORM-002");
    hasNot('<label for="email">이메일</label><input id="email">', "FORM-002");
  });

  test("FORM-003: placeholder 만 있는 필드는 검토 항목으로 분리한다", () => {
    has('<input placeholder="이메일">', "FORM-003");
    // 이름 신호가 따로 있으면 placeholder 는 문제가 아니다
    hasNot('<input placeholder="name@example.com" aria-label="이메일">', "FORM-003");
    // FORM-001 과 동시에 잡혀 같은 문제를 두 번 보고하지 않는다
    hasNot('<input placeholder="이메일">', "FORM-001");
  });

  test("FORM-004: 같은 name 의 선택 항목은 공통 fieldset·legend 로 묶여야 한다", () => {
    has('<input type="radio" name="plan" id="a"><label for="a">A</label><input type="radio" name="plan" id="b"><label for="b">B</label>', "FORM-004");
    hasNot(
      '<fieldset><legend>요금제</legend><input type="radio" name="plan" id="a"><label for="a">A</label><input type="radio" name="plan" id="b"><label for="b">B</label></fieldset>',
      "FORM-004",
    );
    hasNot('<input type="radio" name="plan" aria-label="A">', "FORM-004");
  });
});

describe("이름 규칙", () => {
  test("NAME-001: 이름 없는 버튼·링크·summary 를 잡는다", () => {
    has("<button></button>", "NAME-001");
    has('<a href="/x"></a>', "NAME-001");
    has("<details><summary></summary>본문</details>", "NAME-001");
    hasNot("<button>저장</button>", "NAME-001");
    hasNot('<button aria-label="닫기"></button>', "NAME-001");
    // href 없는 a 는 링크가 아니다
    hasNot("<a></a>", "NAME-001");
  });

  test("NAME-002: 보이는 문구가 이름에 없으면 검토 항목이 된다", () => {
    has('<button aria-label="저장">변경 내용 저장</button>', "NAME-002");
    hasNot('<button aria-label="변경 내용 저장 후 계속">변경 내용 저장</button>', "NAME-002");
    hasNot("<button>변경 내용 저장</button>", "NAME-002");
  });

  test("NAME-003: 이미지 버튼에는 alt 가 필요하다", () => {
    has('<input type="image" src="s.png">', "NAME-003");
    hasNot('<input type="image" src="s.png" alt="검색">', "NAME-003");
  });

  test("NAME-004: 상호작용 역할을 선언했으면 이름이 필요하다", () => {
    has('<div role="button" tabindex="0"></div>', "NAME-004");
    hasNot('<div role="button" tabindex="0">저장</div>', "NAME-004");
    // native 요소는 NAME-001 이 담당한다
    hasNot('<button role="button"></button>', "NAME-004");
  });
});

describe("이미지 규칙", () => {
  test("IMG-001·IMG-002: alt 누락은 오류 가능성, 빈 alt 는 검토로 나뉜다", () => {
    has('<img src="a.png">', "IMG-001");
    hasNot('<img src="a.png" alt="">', "IMG-001");
    has('<img src="a.png" alt="">', "IMG-002");
    hasNot('<img src="a.png" alt="프로필 사진 예시">', "IMG-002");
    hasNot('<img src="a.png" role="presentation">', "IMG-001");
  });

  test("IMG-003: 파일명·경로·일반 단어만 잡는다", () => {
    has('<img src="a.png" alt="banner-final-v3.jpg">', "IMG-003");
    has('<img src="a.png" alt="/assets/hero.png">', "IMG-003");
    has('<img src="a.png" alt="이미지">', "IMG-003");
    // 긴 설명 안에 일반 단어가 들어갔다는 이유로는 경고하지 않는다
    hasNot('<img src="a.png" alt="회의 중인 팀의 사진">', "IMG-003");
  });

  test("IMG-004: 이미지만 있는 링크에 이름이 없으면 잡는다", () => {
    has('<a href="/x"><img src="a.png" alt=""></a>', "IMG-004");
    hasNot('<a href="/x"><img src="a.png" alt="홈으로"></a>', "IMG-004");
    hasNot('<a href="/x"><img src="a.png" alt="">홈</a>', "IMG-004");
  });

  test("IMG-005: role=img 에는 이름이 필요하다", () => {
    has('<span role="img">:)</span>', "IMG-005");
    hasNot('<span role="img" aria-label="웃는 얼굴">:)</span>', "IMG-005");
    has('<svg role="img"><path d="M0 0"/></svg>', "IMG-005");
    hasNot('<svg role="img"><title>차트</title><path d="M0 0"/></svg>', "IMG-005");
  });
});

describe("ARIA 참조 규칙", () => {
  test("ARIA-001: 존재하지 않는 id 참조를 잡는다", () => {
    has('<input aria-describedby="hint">', "ARIA-001");
    hasNot('<input aria-describedby="hint"><p id="hint">형식 안내</p>', "ARIA-001");
  });

  test("ARIA-002: aria-hidden 안의 포커스 가능 요소를 잡는다", () => {
    has('<div aria-hidden="true"><button>저장</button></div>', "ARIA-002");
    hasNot('<div aria-hidden="true"><span>장식</span></div>', "ARIA-002");
    hasNot('<div aria-hidden="true"><button disabled>저장</button></div>', "ARIA-002");
  });

  test("ARIA-003: 자기 참조·순환·숨은 참조를 검토 항목으로 남긴다", () => {
    has('<div id="a" aria-labelledby="a">내용</div>', "ARIA-003");
    has('<div id="a" aria-labelledby="b"></div><div id="b" aria-labelledby="a"></div>', "ARIA-003");
    has('<span id="t" hidden>이메일</span><input aria-labelledby="t">', "ARIA-003");
    hasNot('<span id="t">이메일</span><input aria-labelledby="t">', "ARIA-003");
  });
});

describe("키보드·포커스 규칙", () => {
  test("FOCUS-001: 양수 tabindex 만 검토 항목이 된다", () => {
    has('<a href="/x" tabindex="2">링크</a>', "FOCUS-001");
    hasNot('<div tabindex="0">내용</div>', "FOCUS-001");
    hasNot('<div tabindex="-1">내용</div>', "FOCUS-001");
  });

  test("FOCUS-002: 정수가 아닌 tabindex 를 잡는다", () => {
    has('<div tabindex="첫번째">내용</div>', "FOCUS-002");
    hasNot('<div tabindex="0">내용</div>', "FOCUS-002");
  });

  test("FOCUS-003: 클릭 핸들러만 있고 키보드 경로가 없으면 잡는다", () => {
    has('<div onclick="save()">저장</div>', "FOCUS-003");
    hasNot('<div onclick="save()" tabindex="0" onkeydown="k()">저장</div>', "FOCUS-003");
    hasNot('<button onclick="save()">저장</button>', "FOCUS-003");
  });

  test("FOCUS-004: native 컨트롤의 tabindex=-1 을 검토 항목으로 남긴다", () => {
    has('<button tabindex="-1">저장</button>', "FOCUS-004");
    hasNot('<div tabindex="-1">내용</div>', "FOCUS-004");
    hasNot("<button>저장</button>", "FOCUS-004");
  });
});
