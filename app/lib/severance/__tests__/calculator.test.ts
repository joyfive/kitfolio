/* ============================================================
   퇴직금 계산 엔진 테스트

   방침: 타 계산기의 최종 금액과 하드코딩 비교하지 않는다.
   법정 산식을 테스트 안에서 직접 다시 세워 대조하고,
   날짜 경계(퇴직일·산정기간·월말)와 지급 요건을 따로 검사한다.
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  calculateSeverance,
  MIN_SERVICE_DAYS,
  MIN_WEEKLY_HOURS,
  type SeveranceInput,
} from "../calculator.ts";

const BASE: SeveranceInput = {
  joinDate: "2021-03-02",
  lastWorkDate: "2026-08-27",
  weeklyHours: 40,
  wage3m: 12_000_000,
  annualBonus: 3_000_000,
  annualLeaveAllowance: 500_000,
  dailyOrdinaryWage: 0,
};

const calc = (over: Partial<SeveranceInput> = {}) => {
  const r = calculateSeverance({ ...BASE, ...over });
  assert.ok(r, "계산 결과가 null");
  return r;
};

describe("1. 날짜: 퇴직일과 계속근로일수", () => {
  test("퇴직일은 마지막 근무일의 다음 날이다", () => {
    assert.equal(calc().retireDate, "2026-08-28");
  });

  test("계속근로일수 = 퇴직일 - 입사일", () => {
    // 2021-01-01 입사, 2021-12-31 마지막 근무 → 퇴직일 2022-01-01 → 365일
    const r = calc({ joinDate: "2021-01-01", lastWorkDate: "2021-12-31" });
    assert.equal(r.serviceDays, 365);
    assert.deepEqual(r.service, { years: 1, months: 0, days: 0 });
  });

  test("윤년을 포함한 1년도 요건을 충족한다", () => {
    // 2020 은 윤년: 366일
    const r = calc({ joinDate: "2020-01-01", lastWorkDate: "2020-12-31" });
    assert.equal(r.serviceDays, 366);
    assert.ok(r.serviceDays >= MIN_SERVICE_DAYS);
  });

  test("계속근로기간을 연·월·일로 나눈다", () => {
    const r = calc({ joinDate: "2021-03-02", lastWorkDate: "2026-08-27" });
    // 2021-03-02 ~ 2026-08-28: 5년 5개월 26일
    assert.deepEqual(r.service, { years: 5, months: 5, days: 26 });
  });
});

describe("2. 평균임금 산정기간", () => {
  test("퇴직일 직전 3개월이 산정기간이다", () => {
    const r = calc();
    assert.equal(r.periodStart, "2026-05-28");
    assert.equal(r.periodEnd, "2026-08-27");
    // 5월 4일 + 6월 30일 + 7월 31일 + 8월 27일 = 92일
    assert.equal(r.periodDays, 92);
  });

  test("산정기간 일수는 실근무일이 아니라 달력상의 날짜다", () => {
    // 3개월 구간의 길이는 달마다 89~92일 사이에서만 달라진다.
    for (const lastWorkDate of [
      "2026-01-31",
      "2026-02-28",
      "2026-03-31",
      "2026-06-30",
    ]) {
      const r = calc({ joinDate: "2020-01-01", lastWorkDate });
      assert.ok(
        r.periodDays >= 89 && r.periodDays <= 92,
        `${lastWorkDate}: ${r.periodDays}일`,
      );
    }
  });

  test("월말 퇴직은 3개월 전 달의 말일로 맞춘다 (다음 달로 이월되지 않는다)", () => {
    // 마지막 근무일 2026-05-30 → 퇴직일 2026-05-31 → 3개월 전 2026-02-28
    const r = calc({ joinDate: "2020-01-01", lastWorkDate: "2026-05-30" });
    assert.equal(r.periodStart, "2026-02-28");
    assert.equal(r.periodDays, 92);
  });

  test("입사한 지 3개월이 안 되면 입사일부터 계산한다", () => {
    const r = calc({ joinDate: "2026-07-01", lastWorkDate: "2026-08-27" });
    assert.equal(r.periodStart, "2026-07-01");
    assert.equal(r.periodDays, 58);
  });
});

describe("3. 1일 평균임금", () => {
  test("(3개월 임금 + 상여 3/12 + 연차 3/12) ÷ 산정기간 일수", () => {
    const r = calc();
    const bonus = Math.round(BASE.annualBonus * (3 / 12));
    const leave = Math.round(BASE.annualLeaveAllowance * (3 / 12));
    assert.equal(r.bonusApplied, bonus);
    assert.equal(r.leaveApplied, leave);
    assert.equal(r.wageTotal, BASE.wage3m + bonus + leave);
    assert.equal(
      r.averageDailyWage,
      Math.round((BASE.wage3m + bonus + leave) / r.periodDays),
    );
  });

  test("상여금·연차수당이 없으면 3개월 임금만 반영한다", () => {
    const r = calc({ annualBonus: 0, annualLeaveAllowance: 0 });
    assert.equal(r.bonusApplied, 0);
    assert.equal(r.leaveApplied, 0);
    assert.equal(r.wageTotal, BASE.wage3m);
    assert.equal(r.averageDailyWage, Math.round(BASE.wage3m / r.periodDays));
  });
});

describe("4. 적용 1일 임금: 평균임금과 통상임금 중 큰 값", () => {
  test("통상임금이 더 크면 통상임금을 적용한다", () => {
    const avg = calc().averageDailyWage;
    const r = calc({ dailyOrdinaryWage: avg + 10_000 });
    assert.equal(r.usedOrdinaryWage, true);
    assert.equal(r.appliedDailyWage, avg + 10_000);
  });

  test("통상임금이 더 작으면 평균임금을 적용한다", () => {
    const avg = calc().averageDailyWage;
    const r = calc({ dailyOrdinaryWage: avg - 10_000 });
    assert.equal(r.usedOrdinaryWage, false);
    assert.equal(r.appliedDailyWage, avg);
  });

  test("통상임금을 입력하지 않으면 평균임금만 쓴다", () => {
    const r = calc({ dailyOrdinaryWage: undefined });
    assert.equal(r.usedOrdinaryWage, false);
    assert.equal(r.appliedDailyWage, r.averageDailyWage);
  });
});

describe("5. 예상 퇴직금", () => {
  test("적용 1일 임금 × 30 × 계속근로일수 ÷ 365", () => {
    const r = calc();
    assert.equal(
      r.severance,
      Math.round((r.appliedDailyWage * 30 * r.serviceDays) / 365),
    );
  });

  test("근속이 2배면 퇴직금도 2배에 가깝다", () => {
    const a = calc({ joinDate: "2024-08-28", lastWorkDate: "2026-08-27" });
    const b = calc({ joinDate: "2022-08-28", lastWorkDate: "2026-08-27" });
    const ratio = b.severance / a.severance;
    assert.ok(Math.abs(ratio - 2) < 0.01, `배수 ${ratio}`);
  });

  test("1년 근무하면 대략 30일치 임금이 된다", () => {
    const r = calc({ joinDate: "2025-08-28", lastWorkDate: "2026-08-27" });
    assert.equal(r.serviceDays, 365);
    assert.equal(r.severance, r.appliedDailyWage * 30);
  });
});

describe("6. 지급 요건", () => {
  test("계속근로기간 1년 미만은 요건 미충족", () => {
    const r = calc({ joinDate: "2026-01-02", lastWorkDate: "2026-08-27" });
    assert.ok(r.serviceDays < MIN_SERVICE_DAYS);
    assert.equal(r.eligible, false);
    assert.deepEqual(r.reasons, ["underOneYear"]);
  });

  test("주 소정근로시간 15시간 미만은 요건 미충족", () => {
    const r = calc({ weeklyHours: MIN_WEEKLY_HOURS - 1 });
    assert.equal(r.eligible, false);
    assert.deepEqual(r.reasons, ["underWeeklyHours"]);
  });

  test("두 요건을 모두 충족하면 eligible", () => {
    const r = calc({ weeklyHours: MIN_WEEKLY_HOURS });
    assert.equal(r.eligible, true);
    assert.deepEqual(r.reasons, []);
  });

  test("두 요건 모두 미달이면 사유 두 개를 반환한다", () => {
    const r = calc({ joinDate: "2026-06-01", weeklyHours: 10 });
    assert.deepEqual(r.reasons, ["underOneYear", "underWeeklyHours"]);
  });
});

describe("7. 잘못된 입력", () => {
  const nullCases: [string, Partial<SeveranceInput>][] = [
    ["입사일 없음", { joinDate: "" }],
    ["마지막 근무일 없음", { lastWorkDate: "" }],
    ["날짜 형식 오류", { joinDate: "2021/03/02" }],
    ["존재하지 않는 날짜", { joinDate: "2021-02-30" }],
    ["마지막 근무일이 입사일보다 앞", { lastWorkDate: "2020-01-01" }],
    ["3개월 임금 0", { wage3m: 0 }],
    ["3개월 임금 음수", { wage3m: -1 }],
  ];

  for (const [name, over] of nullCases) {
    test(`${name} → null`, () => {
      assert.equal(calculateSeverance({ ...BASE, ...over }), null);
    });
  }

  test("입사일과 마지막 근무일이 같으면 하루 근무로 계산한다", () => {
    const r = calc({ joinDate: "2026-08-27", lastWorkDate: "2026-08-27" });
    assert.equal(r.serviceDays, 1);
    assert.equal(r.periodDays, 1);
    assert.equal(r.eligible, false);
  });
});
