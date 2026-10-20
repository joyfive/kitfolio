/* ============================================================
   KST ↔ UTC 변환 엔진 테스트

   방침: KST = UTC+9 고정 오프셋을 테스트 안에서 직접 epoch 산식으로 다시 세워
   대조한다. 날짜 경계(전날·다음 날·연말)와 오류 코드를 따로 검사한다.
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { convert, formatInput, formatIso, nowIn } from "../convert.ts";
import { buildSnippet, CODE_LANGS } from "../snippets.ts";

const H = 3_600_000;

describe("UTC → KST", () => {
  test("9시간을 더하고 같은 날이면 dayShift 0", () => {
    const r = convert("2026-10-20 12:30:00", "UTC");
    assert.ok(r.ok);
    assert.equal(r.epochMs, Date.UTC(2026, 9, 20, 12, 30));
    assert.equal(r.targetIso, "2026-10-20T21:30:00.000+09:00");
    assert.equal(r.sourceIso, "2026-10-20T12:30:00.000Z");
    assert.equal(r.dayShift, 0);
  });

  test("UTC 15시 이후는 KST 다음 날", () => {
    const r = convert("2026-10-20T18:30", "UTC");
    assert.ok(r.ok);
    assert.equal(r.targetIso, "2026-10-21T03:30:00.000+09:00");
    assert.equal(r.dayShift, 1);
  });

  test("연말을 넘으면 다음 해 1월 1일 · dayShift +1", () => {
    const r = convert("2026-12-31 20:00", "UTC");
    assert.ok(r.ok);
    assert.equal(r.targetIso, "2027-01-01T05:00:00.000+09:00");
    assert.equal(r.dayShift, 1);
  });

  test("윤년 2월 29일을 지난다", () => {
    const r = convert("2028-02-28 23:00", "UTC");
    assert.ok(r.ok);
    assert.equal(r.targetIso, "2028-02-29T08:00:00.000+09:00");
  });
});

describe("KST → UTC", () => {
  test("9시간을 빼고 KST 09시 전이면 UTC 전날", () => {
    const r = convert("2026-10-21 08:00:00", "KST");
    assert.ok(r.ok);
    assert.equal(r.epochMs, Date.UTC(2026, 9, 21, 8) - 9 * H);
    assert.equal(r.targetIso, "2026-10-20T23:00:00.000Z");
    assert.equal(r.dayShift, -1);
  });

  test("연초를 넘으면 이전 해 · dayShift -1", () => {
    const r = convert("2027-01-01 03:00", "KST");
    assert.ok(r.ok);
    assert.equal(r.targetIso, "2026-12-31T18:00:00.000Z");
    assert.equal(r.dayShift, -1);
  });

  test("날짜만 입력하면 00:00 으로 본다", () => {
    const r = convert("2026-10-21", "KST");
    assert.ok(r.ok);
    assert.equal(r.targetIso, "2026-10-20T15:00:00.000Z");
  });
});

describe("입력 형식", () => {
  test("밀리초를 보존한다", () => {
    const r = convert("2026-10-20T12:30:05.7Z", "UTC");
    assert.ok(r.ok);
    assert.equal(r.targetIso, "2026-10-20T21:30:05.700+09:00");
    assert.equal(r.explicitZone, true);
    assert.equal(r.truncated, false);
  });

  test("밀리초 아래 자리는 버리고 truncated 로 알린다", () => {
    const r = convert("2026-10-20 12:30:05.123456+00:00", "UTC");
    assert.ok(r.ok);
    assert.equal(r.targetIso, "2026-10-20T21:30:05.123+09:00");
    assert.equal(r.truncated, true);
  });

  test("뒤 자리가 0이면 truncated 아님", () => {
    const r = convert("2026-10-20 12:30:05.123000", "UTC");
    assert.ok(r.ok);
    assert.equal(r.truncated, false);
  });

  test("/ · . 날짜 구분자와 시간대 표기 변형", () => {
    for (const s of ["2026/10/20 21:30 KST", "2026.10.20 21:30+09:00", "2026-10-20T21:30+0900", "2026-10-20 21:30 +09"]) {
      const r = convert(s, "KST");
      assert.ok(r.ok, s);
      assert.equal(r.targetIso, "2026-10-20T12:30:00.000Z", s);
    }
    for (const s of ["2026-10-20 12:30 UTC", "2026-10-20 12:30 GMT", "2026-10-20 12:30z", "2026-10-20 12:30-00:00"]) {
      const r = convert(s, "UTC");
      assert.ok(r.ok, s);
      assert.equal(r.targetIso, "2026-10-20T21:30:00.000+09:00", s);
    }
  });
});

describe("오류", () => {
  const code = (s: string, z: "UTC" | "KST" = "UTC") => {
    const r = convert(s, z);
    return r.ok ? "ok" : r.code;
  };

  test("형식 오류", () => {
    assert.equal(code("hello"), "format");
    assert.equal(code("2026-10"), "format");
    assert.equal(code("2026-10/20 10:00"), "format");
    assert.equal(code("2026-10-20 10:00 PST"), "format");
  });

  test("존재하지 않는 날짜·시각", () => {
    assert.equal(code("2026-02-29"), "invalid-date");
    assert.equal(code("2026-13-01"), "invalid-date");
    assert.equal(code("2026-04-31"), "invalid-date");
    assert.equal(code("2026-10-20 24:00"), "invalid-date");
    assert.equal(code("2026-10-20 10:60"), "invalid-date");
    assert.equal(code("2026-10-20 10:00:60"), "invalid-date");
    assert.equal(code("2028-02-29"), "ok");
  });

  test("선택한 시간대와 문자열 시간대가 다르면 충돌", () => {
    assert.equal(code("2026-10-20T12:30Z", "KST"), "zone-conflict");
    assert.equal(code("2026-10-20 21:30 KST", "UTC"), "zone-conflict");
    assert.equal(code("2026-10-20 21:30+09:00", "UTC"), "zone-conflict");
  });

  test("UTC·KST 외 오프셋은 지원하지 않음", () => {
    assert.equal(code("2026-10-20T12:30+05:30"), "unsupported-zone");
    assert.equal(code("2026-10-20T12:30-07:00"), "unsupported-zone");
  });

  test("0001~9999년 밖", () => {
    assert.equal(code("0000-01-01"), "out-of-range");
    assert.equal(code("9999-12-31 20:00", "UTC"), "out-of-range");
    assert.equal(code("0001-01-01 03:00", "KST"), "out-of-range");
    assert.equal(code("0001-01-01 12:00", "KST"), "ok");
  });
});

describe("보조 함수", () => {
  test("nowIn: 같은 순간을 각 시간대 벽시계로", () => {
    const now = Date.UTC(2026, 9, 20, 18, 0, 0, 250);
    assert.equal(formatIso(nowIn("UTC", now), "UTC"), "2026-10-20T18:00:00.250Z");
    assert.equal(formatIso(nowIn("KST", now), "KST"), "2026-10-21T03:00:00.250+09:00");
  });

  test("formatInput: 밀리초 0이면 생략하고 다시 읽으면 같은 값", () => {
    const w = nowIn("UTC", Date.UTC(2026, 9, 20, 18, 0, 0));
    assert.equal(formatInput(w), "2026-10-20 18:00:00");
    const r = convert(formatInput(nowIn("KST", Date.UTC(2026, 9, 20, 18, 0, 0, 5))), "KST");
    assert.ok(r.ok);
    assert.equal(r.epochMs, Date.UTC(2026, 9, 20, 18, 0, 0, 5));
  });
});

describe("코드 예제", () => {
  test("모든 언어·방향에 함수와 전체 예제가 있고, 전체 예제에 입력·예상 출력이 들어간다", () => {
    for (const { id } of CODE_LANGS) {
      for (const from of ["UTC", "KST"] as const) {
        const r = convert(from === "UTC" ? "2026-10-20 18:30" : "2026-10-21 08:00", from);
        assert.ok(r.ok);
        const s = buildSnippet(id, from, r.sourceIso, r.targetIso);
        assert.ok(!s.fn.includes(r.sourceIso), `${id} fn 은 입력값과 무관해야 한다`);
        assert.ok(s.full.includes(r.sourceIso), id);
        assert.ok(s.full.includes(r.targetIso), id);
      }
    }
  });

  test("JavaScript 함수를 실제로 실행하면 엔진과 같은 결과", () => {
    const cases: [string, "UTC" | "KST"][] = [
      ["2026-10-20 18:30:05.120", "UTC"],
      ["2026-12-31 20:00", "UTC"],
      ["2026-10-21 08:00", "KST"],
      ["2027-01-01 03:00:00.999", "KST"],
    ];
    for (const [input, from] of cases) {
      const r = convert(input, from);
      assert.ok(r.ok);
      const { fn } = buildSnippet("javascript", from, r.sourceIso, r.targetIso);
      const name = from === "UTC" ? "utcToKst" : "kstToUtc";
      const run = new Function(`${fn}\nreturn ${name};`)() as (s: string) => string;
      assert.equal(run(r.sourceIso), r.targetIso, input);
    }
  });
});
