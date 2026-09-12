/* ============================================================
   내보내기 검사: Markdown 생략 규칙 · CSV 이스케이프 · BOM
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { createProject, definitionsFor } from "../catalog.ts";
import { csvCell, exportFilename, projectSlug, toCsv, toMarkdown } from "../export.ts";
import type { ChecklistProject } from "../types.ts";

const BOM = "﻿";

/** 테스트용 최소 CSV 파서: 따옴표 안의 쉼표·줄바꿈을 존중한다. */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else quoted = false;
      } else cell += ch;
      continue;
    }
    if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\r" && text[i + 1] === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      i += 1;
    } else cell += ch;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}


function project(overrides: Partial<ChecklistProject> = {}): ChecklistProject {
  return {
    ...createProject({
      projectName: "고객센터 리뉴얼",
      standard: "kwcag-2.2",
      targetLevel: null,
      environment: "responsive",
      organization: "public-certification",
      now: new Date("2026-09-12T01:00:00.000Z"),
    }),
    ...overrides,
  };
}

describe("Markdown", () => {
  test("모든 항목을 포함한다 (미검토도 빠지지 않는다)", () => {
    const p = project();
    const md = toMarkdown(p, "ko");
    for (const def of definitionsFor("kwcag-2.2", null)) {
      assert.ok(md.includes(def.title.ko), def.id);
    }
  });

  test("메모·근거가 비면 해당 줄을 생략한다", () => {
    const p = project();
    const md = toMarkdown(p, "ko");
    assert.ok(!md.includes("- 메모:"));
    assert.ok(!md.includes("- 근거:"));

    const id = definitionsFor("kwcag-2.2", null)[0].id;
    p.items[id] = {
      status: "issue",
      note: "본문 보조색 수정 필요",
      evidenceUrl: "https://example.com/a",
      updatedAt: "2026-09-12T02:00:00.000Z",
    };
    const md2 = toMarkdown(p, "ko");
    assert.ok(md2.includes("- 메모: 본문 보조색 수정 필요"));
    assert.ok(md2.includes("- 근거: https://example.com/a"));
    assert.ok(md2.includes("### [이슈]"));
  });

  test("헤더에 기준·환경·운영 유형·진행률이 들어간다", () => {
    const md = toMarkdown(project(), "ko");
    assert.ok(md.startsWith("# 고객센터 리뉴얼 웹접근성 체크리스트"));
    assert.ok(md.includes("- 기준: KWCAG 2.2"));
    assert.ok(md.includes("- 환경: 반응형 웹"));
    assert.ok(md.includes("- 운영 유형: 공공·품질인증 준비"));
    assert.ok(md.includes("- 검토 진행률: 0%"));
  });

  test("WCAG 는 목표 레벨을 함께 적는다", () => {
    const md = toMarkdown(
      project({ standard: "wcag-2.2", targetLevel: "AA" }),
      "en",
    );
    assert.ok(md.includes("- Standard: WCAG 2.2 Level AA"));
  });

  test("인증 비대체 안내를 항상 포함한다", () => {
    assert.ok(toMarkdown(project(), "ko").includes("공식 웹 접근성 품질인증 판정"));
    assert.ok(toMarkdown(project(), "en").includes("not a conformance claim"));
  });

  test("전체가 해당 없음이면 100% 대신 안내 문구를 쓴다", () => {
    const p = project();
    for (const id of Object.keys(p.items)) {
      p.items[id] = { ...p.items[id], status: "not_applicable" };
    }
    assert.ok(toMarkdown(p, "ko").includes("- 검토 진행률: 검토할 항목이 없습니다"));
  });
});

describe("CSV", () => {
  test("UTF-8 BOM 으로 시작한다", () => {
    assert.ok(toCsv(project(), "ko").startsWith(BOM));
  });

  test("열 순서가 명세와 같다", () => {
    const csv = toCsv(project(), "ko");
    const header = csv.slice(BOM.length).split("\r\n")[0];
    assert.equal(
      header,
      "프로젝트명,기준,기준 번호,레벨,검사 축,항목명,확인 질문,역할,단계,상태,N/A 후보,메모,근거 URL,공식 출처,수정 시각",
    );
  });

  test("헤더 1줄 + 항목 수만큼의 데이터 줄", () => {
    const csv = toCsv(project(), "ko").slice(BOM.length).trimEnd();
    // 메모에 줄바꿈이 없는 기본 상태에서는 물리 줄 수 = 논리 행 수
    assert.equal(csv.split("\r\n").length, 33 + 1);
  });

  test("쉼표·따옴표·줄바꿈이 있는 메모가 형식을 깨지 않는다", () => {
    const p = project();
    const id = definitionsFor("kwcag-2.2", null)[0].id;
    p.items[id] = {
      status: "issue",
      note: '버튼, 링크에서 발생\n재현: "상세" 탭 진입',
      evidenceUrl: "",
      updatedAt: null,
    };
    const csv = toCsv(p, "ko");
    assert.ok(csv.includes('"버튼, 링크에서 발생\n재현: ""상세"" 탭 진입"'));
  });

  test("csvCell 은 필요한 경우에만 감싼다", () => {
    assert.equal(csvCell("통과"), "통과");
    assert.equal(csvCell("a,b"), '"a,b"');
    assert.equal(csvCell('say "hi"'), '"say ""hi"""');
    assert.equal(csvCell("line1\nline2"), '"line1\nline2"');
  });

  test("N/A 후보 열은 기능 응답을 반영한다", () => {
    const csv = toCsv(project(), "ko");
    const rows = parseCsv(csv.slice(BOM.length));
    const naColumn = rows[0].indexOf("N/A 후보");
    const titleColumn = rows[0].indexOf("항목명");
    const cell = (title: string) =>
      rows.find((r) => r[titleColumn] === title)![naColumn];

    // 기본 응답에서 녹화·실시간 미디어는 모두 없음이므로 자막은 후보다.
    assert.equal(cell("자막 제공"), "예");
    // 입력 폼은 기본 응답이 있음이므로 후보가 아니다.
    assert.equal(cell("레이블 제공"), "아니요");
    // 기능 플래그가 없는 항목은 어떤 응답에서도 후보가 되지 않는다.
    assert.equal(cell("키보드 사용 보장"), "아니요");
  });
});

describe("파일명", () => {
  test("ASCII 영문·숫자만 슬러그로 남긴다", () => {
    assert.equal(projectSlug("Checkout v2 (2026)"), "checkout-v2-2026");
    assert.equal(projectSlug("  Trim Me  "), "trim-me");
  });

  test("한글 등 비 ASCII 이름은 슬러그에서 빠진다", () => {
    // Chromium 은 download 속성에 비 ASCII 가 섞이면 이름 전체를 버리고
    // 확장자 없는 "download" 로 저장한다. 확장자를 지키는 쪽을 택한다.
    assert.equal(projectSlug("고객센터 리뉴얼"), "");
    assert.equal(projectSlug("   "), "");
  });

  test("슬러그가 비면 그 자리를 생략하고 도구명과 날짜로 식별한다", () => {
    const name = exportFilename(project(), "ko", "csv");
    assert.match(name, /^accessibility-checklist-\d{4}-\d{2}-\d{2}\.csv$/);
    assert.ok(/^[\x20-\x7e]+$/.test(name), "파일명은 ASCII 범위여야 한다");
  });

  test("영문 프로젝트명은 파일명 앞에 남는다", () => {
    const name = exportFilename(project({ projectName: "Checkout v2" }), "en", "md");
    assert.match(name, /^checkout-v2-accessibility-checklist-\d{4}-\d{2}-\d{2}\.md$/);
  });
});
