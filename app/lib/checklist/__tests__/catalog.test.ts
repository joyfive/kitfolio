/* ============================================================
   기준 생성·N/A 후보·진행률 검사

   표준별 항목 수는 외부 기준에서 온 값이므로 하드코딩으로 고정한다:
   KWCAG 33 · WCAG A 31 · WCAG AA 누적 55.
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { KWCAG_ITEMS } from "../kwcag.ts";
import { WCAG_ITEMS } from "../wcag.ts";
import {
  changeTargetLevel,
  computeProgress,
  createProject,
  definitionsFor,
  firstOpenAxis,
  isNaCandidate,
  itemsLostByLevelChange,
  summarizeByAxis,
} from "../catalog.ts";
import { AXIS_ORDER, DEFAULT_FEATURES, type FeatureId } from "../types.ts";

const ALL_OFF = Object.fromEntries(
  Object.keys(DEFAULT_FEATURES).map((k) => [k, false]),
) as Record<FeatureId, boolean>;

describe("기준 데이터셋", () => {
  test("KWCAG 2.2 는 33개 검사항목", () => {
    assert.equal(definitionsFor("kwcag-2.2", null).length, 33);
    assert.equal(KWCAG_ITEMS.length, 33);
  });

  test("KWCAG 항목에는 레벨이 없다", () => {
    assert.ok(KWCAG_ITEMS.every((d) => d.level === null));
  });

  test("WCAG A 는 31개, AA 는 A 를 포함해 55개", () => {
    assert.equal(definitionsFor("wcag-2.2", "A").length, 31);
    assert.equal(definitionsFor("wcag-2.2", "AA").length, 55);
  });

  test("AA 목록은 A 목록을 모두 포함한다", () => {
    const aa = new Set(definitionsFor("wcag-2.2", "AA").map((d) => d.id));
    for (const d of definitionsFor("wcag-2.2", "A")) assert.ok(aa.has(d.id), d.id);
  });

  test("WCAG 2.2 에서 제거된 4.1.1 Parsing 은 포함하지 않는다", () => {
    assert.ok(!WCAG_ITEMS.some((d) => d.criterion === "4.1.1"));
  });

  test("id 는 데이터셋 안에서 고유하다", () => {
    const all = [...KWCAG_ITEMS, ...WCAG_ITEMS];
    assert.equal(new Set(all.map((d) => d.id)).size, all.length);
  });

  test("모든 항목이 ko·en 문구와 확인 방법 2개 이상을 갖는다", () => {
    for (const d of [...KWCAG_ITEMS, ...WCAG_ITEMS]) {
      for (const lang of ["ko", "en"] as const) {
        assert.ok(d.title[lang].trim(), `${d.id} title.${lang}`);
        assert.ok(d.question[lang].trim(), `${d.id} question.${lang}`);
        assert.ok(d.evidence[lang].trim(), `${d.id} evidence.${lang}`);
        assert.ok(d.howToCheck[lang].length >= 2, `${d.id} howToCheck.${lang}`);
        assert.ok(d.howToCheck[lang].length <= 4, `${d.id} howToCheck.${lang} 는 4개 이하`);
      }
      assert.ok(AXIS_ORDER.includes(d.axis), `${d.id} axis`);
      assert.ok(d.roles.length > 0, `${d.id} roles`);
      assert.ok(d.phases.length > 0, `${d.id} phases`);
      assert.ok(/^https:\/\//.test(d.sourceUrl), `${d.id} sourceUrl`);
    }
  });

  test("기준 번호는 숫자 단위로 정렬된다 (1.4.4 앞, 1.4.10 뒤)", () => {
    const order = definitionsFor("wcag-2.2", "AA").map((d) => d.criterion);
    assert.ok(order.indexOf("1.4.4") < order.indexOf("1.4.10"));
    assert.ok(order.indexOf("2.4.7") < order.indexOf("2.4.11"));
  });
});

describe("해당 없음 후보", () => {
  test("기능 플래그가 없는 항목은 어떤 답변에서도 후보가 되지 않는다", () => {
    const keyboard = WCAG_ITEMS.find((d) => d.criterion === "2.1.1")!;
    assert.equal(isNaCandidate(keyboard, ALL_OFF), false);
  });

  test("광범위한 KWCAG 항목은 기능 질문으로 제외되지 않는다", () => {
    for (const criterion of ["10", "23", "33"]) {
      const def = KWCAG_ITEMS.find((d) => d.criterion === criterion)!;
      assert.equal(isNaCandidate(def, ALL_OFF), false, `KWCAG ${criterion}`);
    }
  });

  test("관련 기능이 전부 없다고 답해야 후보가 된다", () => {
    const captions = KWCAG_ITEMS.find((d) => d.criterion === "2")!;
    assert.deepEqual(captions.featureFlags, ["media_prerecorded", "media_live"]);
    assert.equal(isNaCandidate(captions, ALL_OFF), true);
    assert.equal(
      isNaCandidate(captions, { ...ALL_OFF, media_live: true }),
      false,
      "하나라도 있으면 후보가 아니다",
    );
  });

  test("후보여도 목록에서 빠지지 않고 분모에도 그대로 남는다", () => {
    const project = createProject({
      projectName: "t",
      standard: "kwcag-2.2",
      targetLevel: null,
      environment: "responsive",
      organization: "general-private",
      features: ALL_OFF,
    });
    const defs = definitionsFor("kwcag-2.2", null);
    assert.equal(defs.length, 33);
    assert.equal(computeProgress(defs, project.items).applicable, 33);
  });
});

describe("진행률", () => {
  const defs = definitionsFor("wcag-2.2", "A");

  function withStatuses(pairs: Array<[number, string]>) {
    const p = createProject({
      projectName: "t",
      standard: "wcag-2.2",
      targetLevel: "A",
      environment: "responsive",
      organization: "general-private",
    });
    for (const [i, status] of pairs) {
      p.items[defs[i].id] = { ...p.items[defs[i].id], status: status as never };
    }
    return p;
  }

  test("분모는 전체에서 해당 없음을 뺀 수다", () => {
    const p = withStatuses([
      [0, "not_applicable"],
      [1, "pass"],
    ]);
    const r = computeProgress(defs, p.items);
    assert.equal(r.total, 31);
    assert.equal(r.notApplicable, 1);
    assert.equal(r.applicable, 30);
    assert.equal(r.reviewed, 1);
    assert.equal(r.percent, Math.round((1 / 30) * 100));
  });

  test("검토 중도 진행률에 포함된다", () => {
    const p = withStatuses([[0, "in_review"]]);
    const r = computeProgress(defs, p.items);
    assert.equal(r.inReview, 1);
    assert.equal(r.reviewed, 1);
  });

  test("전체가 해당 없음이면 100% 가 아니라 null 을 돌려준다", () => {
    const p = withStatuses(defs.map((_, i) => [i, "not_applicable"] as [number, string]));
    const r = computeProgress(defs, p.items);
    assert.equal(r.applicable, 0);
    assert.equal(r.percent, null);
  });

  test("진행률은 소수점 없이 반올림한다", () => {
    const p = withStatuses([[0, "pass"]]);
    const r = computeProgress(defs, p.items);
    assert.equal(r.percent, 3); // 1/31 = 3.2%
    assert.ok(Number.isInteger(r.percent));
  });
});

describe("축 집계", () => {
  test("항목이 없는 축은 아코디언에 나오지 않는다", () => {
    const defs = definitionsFor("wcag-2.2", "A");
    const groups = summarizeByAxis(defs, createProject({
      projectName: "t",
      standard: "wcag-2.2",
      targetLevel: "A",
      environment: "responsive",
      organization: "general-private",
    }).items);
    // Level A 에는 타이포·확대 축 항목(1.4.4·1.4.10·1.4.12)이 없다: AA 기준이다.
    assert.ok(!groups.some((g) => g.axis === "typography-reflow"));
    assert.ok(groups.every((g) => g.defs.length > 0));
  });

  test("기본으로 펼치는 축은 첫 번째 미완료 축", () => {
    const defs = definitionsFor("kwcag-2.2", null);
    const p = createProject({
      projectName: "t",
      standard: "kwcag-2.2",
      targetLevel: null,
      environment: "responsive",
      organization: "general-private",
    });
    const groups = summarizeByAxis(defs, p.items);
    assert.equal(firstOpenAxis(groups), groups[0].axis);

    for (const d of groups[0].defs) p.items[d.id] = { ...p.items[d.id], status: "pass" };
    const next = summarizeByAxis(defs, p.items);
    assert.equal(firstOpenAxis(next), next[1].axis);
  });
});

describe("목표 레벨 변경", () => {
  const base = () =>
    createProject({
      projectName: "t",
      standard: "wcag-2.2",
      targetLevel: "A",
      environment: "responsive",
      organization: "general-private",
    });

  test("A → AA 는 기존 A 상태를 보존하고 AA 를 미검토로 추가한다", () => {
    const p = base();
    const first = definitionsFor("wcag-2.2", "A")[0].id;
    p.items[first] = { status: "pass", note: "확인함", evidenceUrl: "", updatedAt: null };

    const next = changeTargetLevel(p, "AA");
    assert.equal(Object.keys(next.items).length, 55);
    assert.deepEqual(next.items[first].status, "pass");
    assert.equal(next.items[first].note, "확인함");
    const aaOnly = definitionsFor("wcag-2.2", "AA").find((d) => d.level === "AA")!;
    assert.equal(next.items[aaOnly.id].status, "not_started");
  });

  test("AA → A 로 내릴 때 기록이 남은 AA 항목을 먼저 알려준다", () => {
    const p = changeTargetLevel(base(), "AA");
    const aaOnly = definitionsFor("wcag-2.2", "AA").filter((d) => d.level === "AA")[0];
    assert.deepEqual(itemsLostByLevelChange(p, "A"), []);

    p.items[aaOnly.id] = { status: "issue", note: "", evidenceUrl: "", updatedAt: null };
    assert.deepEqual(itemsLostByLevelChange(p, "A"), [aaOnly.id]);
  });

  test("KWCAG 프로젝트는 레벨이 null 로 정규화된다", () => {
    const p = createProject({
      projectName: "t",
      standard: "kwcag-2.2",
      targetLevel: "AA",
      environment: "responsive",
      organization: "general-private",
    });
    assert.equal(p.targetLevel, null);
    assert.equal(Object.keys(p.items).length, 33);
  });
});
