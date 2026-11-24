/* 경력기술서·포트폴리오 빌더: 변환 · 폼 텍스트 · yml · 저장 정규화 */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { buildPortfolio, buildResume, deepMerge, normalizeHex, softTint, splitActivities, toPortfolio, toResume } from "../transform.ts";
import { listToText, richToText, rowsToText, textToList, textToRich, textToRows } from "../text.ts";
import { dumpYaml, parseYaml, prune } from "../yaml.ts";
import { activeEntry, normalizeWorkspace } from "../storage.ts";
import { sampleWorkspace, sampleProfile, samplePortfolio, sampleResume } from "../sample.ts";

describe("deepMerge", () => {
  test("문서 값이 프로필을 덮어쓰고, 없는 키는 프로필 값을 쓴다", () => {
    const out = deepMerge({ name: "A", lead: "공통", education: { school: "X", period: "1" } }, { lead: "회사별", education: { period: "2" } });
    assert.deepEqual(out, { name: "A", lead: "회사별", education: { school: "X", period: "2" } });
  });
  test("배열은 항목 단위로 합치지 않고 통째로 바꾼다", () => {
    assert.deepEqual(deepMerge({ career: [1, 2] }, { career: [3] }), { career: [3] });
  });
});

describe("splitActivities", () => {
  test("year 가 있으면 수상, 없으면 활동", () => {
    const r = splitActivities({ etc: [{ title: "스터디", detail: ["a"] }, { year: 2024, items: ["상"] }] });
    assert.deepEqual(r.etc, [{ title: "스터디", detail: ["a"] }]);
    assert.deepEqual(r.awards, [{ year: "2024", items: ["상"] }]);
  });
});

describe("toResume", () => {
  test("모양이 다른 값은 렌더 가능한 빈 값으로 바꾼다", () => {
    const r = toResume({ name: 3, career: "oops", projects: [{ title: "P", solution: [{ text: "s", children: ["c"] }, 5] }], contact: ["a@b.c"] });
    assert.equal(r.header.name, "3");
    assert.deepEqual(r.career, []);
    assert.deepEqual(r.header.contact, [{ value: "a@b.c" }]);
    assert.deepEqual(r.projects[0].solution, [{ text: "s", children: ["c"] }, "5"]);
    assert.equal(r.projects[0].role, undefined);
  });
  test("강조색이 hex 가 아니면 기본값", () => {
    assert.equal(toResume({ primary: "red" }).brand.primary, "#2D5DC8");
    assert.equal(toResume({ primary: "#abc" }).brand.primary, "#AABBCC");
  });
  test("예시 문서가 렌더 데이터로 변환된다", () => {
    for (const lang of ["ko", "en"] as const) {
      const r = buildResume(sampleProfile(lang), sampleResume(lang));
      assert.ok(r.header.name);
      assert.equal(r.career.length, 2);
      assert.equal(r.projects.length, 1);
      assert.equal(r.appendix.awards.length, 1);
    }
  });
});

describe("toPortfolio", () => {
  test("overview 연결 프로젝트는 번호만 써도 제목을 찾는다", () => {
    const p = toPortfolio({ projects: [{ title: "첫 프로젝트" }], overview: [{ title: "o", projects: [{ no: 1 }, { no: 9 }] }] });
    assert.deepEqual(p.fixed.overview[0].projects, [{ no: 1, title: "첫 프로젝트" }]);
  });
  test("수상은 '그 외 활동'으로 합친다", () => {
    const p = toPortfolio({ etc: [{ title: "a", detail: ["x"] }, { year: 2023, items: ["상"] }] });
    assert.deepEqual(p.fixed.etc, [{ title: "a", detail: ["x"] }, { title: "2023", detail: ["상"] }]);
  });
  test("성과는 강조형 객체와 문자열을 함께 받는다", () => {
    const p = toPortfolio({ projects: [{ title: "P", outcome: { results: [{ label: "L", from: "1", value: "2" }, "텍스트"] } }] });
    assert.deepEqual(p.projects[0].outcome?.results, [{ label: "L", from: "1", value: "2" }, "텍스트"]);
  });
  test("동료 평가 점수는 0~100 으로 자른다", () => {
    const p = toPortfolio({ peer_review: { title: "t", metrics: [{ label: "a", value: 140 }, { label: "b", value: -3 }] } });
    assert.deepEqual(p.fixed.peer_review?.metrics?.map((m) => m.value), [100, 0]);
  });
  test("예시 포트폴리오: 프로젝트 페이지 구성", () => {
    for (const lang of ["ko", "en"] as const) {
      const p = buildPortfolio(sampleProfile(lang), samplePortfolio(lang));
      const proj = p.projects[0];
      assert.ok(proj.overview && proj.problem && proj.outcome);
      assert.equal(proj.hypothesis, undefined);
      assert.equal(proj.solutions?.length, 1);
      assert.equal(proj.solutions?.[0].sections?.[0].element?.type, "diagram");
    }
  });
});

describe("색", () => {
  test("normalizeHex · softTint", () => {
    assert.equal(normalizeHex("2d5dc8"), "#2D5DC8");
    assert.equal(softTint("#000000"), "#e6e6e6");
    assert.equal(softTint("#ffffff"), "#ffffff");
  });
});

describe("폼 텍스트 변환", () => {
  test("'- ' 줄이 없으면 문단", () => {
    assert.equal(textToRich("  그냥 문장  "), "그냥 문장");
    assert.equal(textToRich("   "), undefined);
  });
  test("리스트와 2칸 들여쓴 하위 항목", () => {
    const r = textToRich("- a\n  - a1\n  - a2\n- b");
    assert.deepEqual(r, [{ text: "a", children: ["a1", "a2"] }, "b"]);
    assert.equal(richToText(r), "- a\n  - a1\n  - a2\n- b");
  });
  test("항상 리스트: 줄머리 기호 없이도 항목", () => {
    assert.deepEqual(textToList("첫째\n  하위\n- 둘째"), [{ text: "첫째", children: ["하위"] }, "둘째"]);
    assert.equal(listToText([{ text: "첫째", children: ["하위"] }, "둘째"]), "첫째\n  하위\n둘째");
  });
  test("표 행: | 로 셀 구분", () => {
    const rows = textToRows("a | b\nc|d");
    assert.deepEqual(rows, [["a", "b"], ["c", "d"]]);
    assert.equal(rowsToText(rows), "a | b\nc | d");
  });
});

describe("yml", () => {
  test("왕복: dump → parse 가 같은 값", () => {
    const doc = sampleResume("ko");
    const r = parseYaml(dumpYaml(doc));
    assert.ok(r.ok);
    if (r.ok) assert.deepEqual(r.doc, doc);
  });
  test("콜론 뒤 공백이 있는 값은 따옴표로 감싸 쓴다", () => {
    const r = parseYaml(dumpYaml({ a: "법인: 세금계산서" }));
    assert.ok(r.ok && r.doc.a === "법인: 세금계산서");
  });
  test("문법 오류는 줄 번호와 함께 실패", () => {
    const r = parseYaml("a: 1\nb: [1, 2\nc: 3");
    assert.equal(r.ok, false);
  });
  test("최상위가 매핑이 아니면 실패", () => {
    assert.equal(parseYaml("- a\n- b").ok, false);
    assert.deepEqual(parseYaml(""), { ok: true, doc: {} });
  });
  test("prune: 빈 값 제거", () => {
    assert.deepEqual(prune({ a: "", b: [], c: {}, d: [{ x: "" }, "y"], e: 0 }), { d: ["y"], e: 0 });
  });
});

describe("저장 정규화", () => {
  test("스키마 버전이 다르면 null (자동 삭제 대상 아님)", () => {
    assert.equal(normalizeWorkspace({ schemaVersion: 2 }), null);
    assert.equal(normalizeWorkspace("x"), null);
  });
  test("모양이 틀린 문서는 버린다", () => {
    const ws = normalizeWorkspace({ schemaVersion: 1, profile: [], resume: [{ id: "a", doc: {} }, { id: "b" }, 3], portfolio: "x", active: { resume: "a" } });
    assert.ok(ws);
    assert.deepEqual(ws?.profile, {});
    assert.equal(ws?.resume.length, 1);
    assert.equal(ws?.resume[0].lang, "ko");
    assert.deepEqual(ws?.portfolio, []);
  });
  test("active id 가 없으면 첫 문서", () => {
    const ws = sampleWorkspace("en");
    assert.equal(activeEntry({ ...ws, active: {} }, "resume")?.id, ws.resume[0].id);
    assert.equal(activeEntry(ws, "portfolio")?.lang, "en");
  });
});
