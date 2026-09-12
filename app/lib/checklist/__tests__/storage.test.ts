/* ============================================================
   로컬 저장 검사

   핵심 규칙 두 가지를 고정한다.
   1. 읽을 수 없는 데이터를 자동으로 삭제하지 않는다.
   2. 저장에 실패해도 예외를 던지지 않고 false 만 돌려준다 (화면 입력 보존).
   ============================================================ */
import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { createProject } from "../catalog.ts";
import { clearProject, loadProject, saveProject } from "../storage.ts";
import { LIMITS, STORAGE_KEY } from "../types.ts";

/** node 환경에 최소 localStorage 를 심어 SSR 가드와 정규화를 검사한다. */
function installStorage(options: { failWrite?: boolean } = {}) {
  const data = new Map<string, string>();
  const storage = {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => {
      if (options.failWrite) throw new Error("QuotaExceededError");
      data.set(k, v);
    },
    removeItem: (k: string) => void data.delete(k),
  };
  (globalThis as { window?: unknown }).window = { localStorage: storage };
  return data;
}

function removeStorage() {
  delete (globalThis as { window?: unknown }).window;
}

const sample = () =>
  createProject({
    projectName: "고객센터 리뉴얼",
    standard: "wcag-2.2",
    targetLevel: "AA",
    environment: "mobile-first",
    organization: "public-certification",
  });

describe("localStorage", () => {
  afterEach(removeStorage);

  test("SSR (window 없음) 에서는 읽지도 쓰지도 않는다", () => {
    removeStorage();
    assert.deepEqual(loadProject(), { kind: "empty" });
    assert.equal(saveProject(sample()), false);
  });

  test("저장한 프로젝트를 그대로 복원한다", () => {
    installStorage();
    const p = sample();
    const first = Object.keys(p.items)[0];
    p.items[first] = {
      status: "issue",
      note: "본문 대비 미달",
      evidenceUrl: "https://example.com/a",
      updatedAt: "2026-09-12T00:00:00.000Z",
    };
    assert.equal(saveProject(p), true);

    const loaded = loadProject();
    assert.equal(loaded.kind, "ok");
    if (loaded.kind !== "ok") return;
    assert.equal(loaded.project.projectName, "고객센터 리뉴얼");
    assert.equal(loaded.project.targetLevel, "AA");
    assert.equal(loaded.project.environment, "mobile-first");
    assert.equal(loaded.project.organization, "public-certification");
    assert.equal(Object.keys(loaded.project.items).length, 55);
    assert.deepEqual(loaded.project.items[first], p.items[first]);
  });

  test("저장 실패는 예외가 아니라 false 로 알린다", () => {
    installStorage({ failWrite: true });
    assert.equal(saveProject(sample()), false);
  });

  test("깨진 JSON 은 unreadable 로 알리고 원본을 지우지 않는다", () => {
    const data = installStorage();
    data.set(STORAGE_KEY, "{ not json");
    const result = loadProject();
    assert.deepEqual(result, { kind: "unreadable", reason: "parse" });
    assert.equal(data.get(STORAGE_KEY), "{ not json");
  });

  test("지원하지 않는 schemaVersion 도 지우지 않는다", () => {
    const data = installStorage();
    const raw = JSON.stringify({ ...sample(), schemaVersion: 99 });
    data.set(STORAGE_KEY, raw);
    assert.deepEqual(loadProject(), { kind: "unreadable", reason: "schema" });
    assert.equal(data.get(STORAGE_KEY), raw);
  });

  test("알 수 없는 standard 는 shape 오류로 처리한다", () => {
    const data = installStorage();
    data.set(STORAGE_KEY, JSON.stringify({ ...sample(), standard: "wcag-3.0" }));
    assert.deepEqual(loadProject(), { kind: "unreadable", reason: "shape" });
  });

  test("알 수 없는 상태값과 과도한 길이는 정규화한다", () => {
    const data = installStorage();
    const p = sample();
    const first = Object.keys(p.items)[0];
    data.set(
      STORAGE_KEY,
      JSON.stringify({
        ...p,
        projectName: "x".repeat(200),
        environment: "hologram",
        items: {
          ...p.items,
          [first]: { status: "approved", note: "y".repeat(5000), evidenceUrl: 42 },
        },
      }),
    );
    const loaded = loadProject();
    assert.equal(loaded.kind, "ok");
    if (loaded.kind !== "ok") return;
    assert.equal(loaded.project.projectName.length, LIMITS.projectName);
    assert.equal(loaded.project.environment, "responsive");
    assert.equal(loaded.project.items[first].status, "not_started");
    assert.equal(loaded.project.items[first].note.length, LIMITS.note);
    assert.equal(loaded.project.items[first].evidenceUrl, "");
  });

  test("저장 시점보다 항목 정의가 늘어도 남은 항목은 id 로 다시 붙는다", () => {
    const data = installStorage();
    const p = sample();
    const first = Object.keys(p.items)[0];
    data.set(
      STORAGE_KEY,
      JSON.stringify({
        ...p,
        items: { [first]: { status: "pass", note: "", evidenceUrl: "", updatedAt: null } },
      }),
    );
    const loaded = loadProject();
    assert.equal(loaded.kind, "ok");
    if (loaded.kind !== "ok") return;
    assert.equal(Object.keys(loaded.project.items).length, 55);
    assert.equal(loaded.project.items[first].status, "pass");
  });

  test("clearProject 는 저장 데이터를 지운다", () => {
    const data = installStorage();
    saveProject(sample());
    clearProject();
    assert.equal(data.get(STORAGE_KEY), undefined);
    assert.deepEqual(loadProject(), { kind: "empty" });
  });
});
