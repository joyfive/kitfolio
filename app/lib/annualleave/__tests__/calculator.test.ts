/* ============================================================
   연차 계산 엔진 테스트

   방침: 타 계산기의 결과 총액과 하드코딩 비교하지 않는다.
   근로기준법 제60조 · 민법 제160조 · 시행령 [별표 2] 규칙과
   고용노동부 2018-05 설명자료의 예시를 직접 검사한다.
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  calculateLeave,
  annualDays,
  periodEnd,
  accrualDate,
  parseDate,
  toIso,
  toHours,
  type LeaveInput,
} from "../calculator.ts";
import { ANNUAL_LEAVE_POLICY as P } from "../policy.ts";

const d = (s: string) => parseDate(s)!;
const base = (over: Partial<LeaveInput>): LeaveInput => ({
  mode: "hire",
  joinDate: "2025-03-01",
  asOf: "2026-10-01",
  ...over,
});

describe("정책 상수", () => {
  test("법령 원문과 일치", () => {
    assert.equal(P.baseDays, 15);
    assert.equal(P.bonusEveryYears, 2);
    assert.equal(P.maxDays, 25);
    assert.equal(P.firstYearMonthlyMax, 11);
    assert.equal(P.attendanceThresholdPct, 80);
    assert.equal(P.minWeeklyHours, 15);
    assert.equal(P.hoursPerDay, 8);
    assert.equal(P.proratedDenominator, 365);
    assert.equal(P.noDeductionJoinFrom, "2017-05-30");
  });
});

describe("가산 연차 (제60조 제4항)", () => {
  test("n = 1~30 이 min(15 + floor((n − 1) ÷ 2), 25) 와 일치", () => {
    for (let n = 1; n <= 30; n++) {
      assert.equal(annualDays(n), Math.min(15 + Math.floor((n - 1) / 2), 25), `n=${n}`);
    }
  });
  test("3년차 첫 가산 16일 · 21년에 처음 25일", () => {
    assert.equal(annualDays(2), 15);
    assert.equal(annualDays(3), 16);
    assert.equal(annualDays(20), 24);
    assert.equal(annualDays(21), 25);
  });
});

describe("기간 계산 (민법 제160조)", () => {
  test("1일 입사: 만료일은 전달 말일", () => {
    assert.equal(toIso(periodEnd(d("2025-03-01"), 1)), "2025-03-31");
    assert.equal(toIso(periodEnd(d("2025-03-01"), 12)), "2026-02-28");
  });
  test("1월 31일 입사: 제3항 말일 처리 (3/1 · 3/31 · 5/1 · 5/31)", () => {
    const j = d("2027-01-31");
    assert.deepEqual(
      [1, 2, 3, 4].map((k) => toIso(accrualDate(j, k))),
      ["2027-03-01", "2027-03-31", "2027-05-01", "2027-05-31"],
    );
  });
  test("31일 입사 12개월: 매번 입사일에서 다시 계산 (이어 붙이기 회귀 방지)", () => {
    const j = d("2025-01-31");
    for (let k = 1; k <= 12; k++) {
      const end = periodEnd(j, k);
      const y = 2025 + Math.floor(k / 12);
      const m = k % 12; // 0-based 목표 월
      const last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
      const expected = last < 31 ? last : 30;
      assert.equal(end.getUTCDate(), expected, `k=${k}`);
    }
  });
  test("윤년 2월 29일 입사: 1년 만료 2/28 · 3/1 발생", () => {
    const j = d("2024-02-29");
    assert.equal(toIso(periodEnd(j, 12)), "2025-02-28");
    assert.equal(toIso(accrualDate(j, 12)), "2025-03-01");
  });
});

describe("입사일 기준", () => {
  test("2025-03-01 입사 · 2026-10-01: 월 단위 11일 + 15일", () => {
    const r = calculateLeave(base({}))!;
    const monthly = r.accrued.filter((g) => g.kind === "monthly");
    assert.equal(monthly.length, 11);
    assert.equal(monthly[0].date, "2025-04-01");
    assert.equal(monthly[10].date, "2026-02-01");
    assert.ok(monthly.every((g) => g.expires === "2026-02-28"));
    const annual = r.accrued.filter((g) => g.kind === "annual");
    assert.equal(annual.length, 1);
    assert.equal(annual[0].date, "2026-03-01");
    assert.equal(annual[0].days, 15);
    assert.equal(annual[0].expires, "2027-02-28");
    assert.equal(r.totalAccrued, 26);
    // 월 단위 연차는 2026-02-28 에 소멸, 15일만 남는다
    assert.equal(r.validBalance, 15);
    assert.equal(r.next?.date, "2027-03-01");
    assert.equal(r.next?.days, 15);
  });
  test("12번째 월 단위 연차는 없다", () => {
    const r = calculateLeave(base({ asOf: "2026-02-28" }))!;
    assert.equal(r.accrued.length, 11);
    assert.equal(r.next?.kind, "annual");
  });
  test("1년 + 1일: 마지막 근무일 2026-02-28 이면 15일 미발생", () => {
    const r = calculateLeave(base({ lastWorkDate: "2026-02-28" }))!;
    assert.equal(r.totalAccrued, 11);
    assert.equal(r.next, null);
    const r2 = calculateLeave(base({ lastWorkDate: "2026-03-01" }))!;
    assert.equal(r2.totalAccrued, 26);
  });
  test("월 단위 경계: 개근 1개월 마지막 날 퇴사면 그 1일은 미발생", () => {
    assert.equal(calculateLeave(base({ lastWorkDate: "2025-03-31" }))!.totalAccrued, 0);
    assert.equal(calculateLeave(base({ lastWorkDate: "2025-04-01" }))!.totalAccrued, 1);
  });
  test("입사일 당일: 발생 0 · 다음 발생 한 달 뒤", () => {
    const r = calculateLeave(base({ asOf: "2025-03-01" }))!;
    assert.equal(r.totalAccrued, 0);
    assert.equal(r.next?.date, "2025-04-01");
  });
  test("평가일이 입사일보다 앞서면 null", () => {
    assert.equal(calculateLeave(base({ asOf: "2025-02-28" })), null);
    assert.equal(calculateLeave(base({ joinDate: "2025-02-30" })), null);
  });
  test("10년 근속: 근속 n년마다 가산 일수", () => {
    const r = calculateLeave(base({ joinDate: "2016-03-02", asOf: "2026-03-02" }))!;
    const annual = r.accrued.filter((g) => g.kind === "annual");
    assert.equal(annual.length, 10);
    assert.deepEqual(annual.map((g) => g.days), [15, 15, 16, 16, 17, 17, 18, 18, 19, 19]);
    assert.equal(r.preAmendment, true);
  });
  test("2017-05-30 이후 입사자는 차감 규정 안내 대상 아님", () => {
    assert.equal(calculateLeave(base({ joinDate: "2017-05-30", asOf: "2018-06-01" }))!.preAmendment, false);
    assert.equal(calculateLeave(base({ joinDate: "2017-05-29", asOf: "2018-06-01" }))!.preAmendment, true);
  });
});

describe("출근율 80% 미만 (설명자료 Ⅲ-3 예시)", () => {
  test("1년차 1~5월 개근 · 이후 결근: 1년차 5일 + 2년차 5일", () => {
    const r = calculateLeave({
      mode: "hire",
      joinDate: "2018-01-01",
      asOf: "2019-01-01",
      lowAttendance: { year: 1, perfectMonths: 5 },
    })!;
    const monthly = r.accrued.filter((g) => g.kind === "monthly");
    const att = r.accrued.filter((g) => g.kind === "attendance");
    assert.equal(monthly.length, 5);
    assert.equal(att.length, 1);
    assert.equal(att[0].days, 5);
    assert.equal(r.totalAccrued, 10);
    assert.equal(r.compare, null);
  });
  test("3년차 80% 미만: 그 다음 해만 개근 월 수, 이후 가산은 계속근로 연수로", () => {
    const r = calculateLeave({
      mode: "hire",
      joinDate: "2020-01-01",
      asOf: "2024-01-01",
      lowAttendance: { year: 3, perfectMonths: 7 },
    })!;
    const yearly = r.accrued.filter((g) => g.kind !== "monthly").map((g) => g.days);
    assert.deepEqual(yearly, [15, 15, 7, 16]);
  });
});

describe("회계연도 기준 (설명자료 Ⅲ-5)", () => {
  test("2017-07-01 입사: 월 단위 11일 + 비례 15 × 184 ÷ 365", () => {
    const r = calculateLeave({ mode: "fiscal", joinDate: "2017-07-01", asOf: "2018-07-01" })!;
    const prorated = r.accrued.find((g) => g.kind === "prorated")!;
    assert.equal(prorated.date, "2018-01-01");
    assert.ok(Math.abs(prorated.days - (15 * 184) / 365) < 1e-9);
    assert.equal(prorated.expires, "2018-12-31");
    assert.equal(r.accrued.filter((g) => g.kind === "monthly").length, 11);
    assert.equal(r.totalAccrued, Math.round((11 + (15 * 184) / 365) * 100) / 100);
  });
  test("다음 해부터 1월 1일 15일 · 가산은 입사일 기준 근속 연수", () => {
    const r = calculateLeave({ mode: "fiscal", joinDate: "2017-07-01", asOf: "2022-01-01" })!;
    const annual = r.accrued.filter((g) => g.kind === "annual");
    assert.deepEqual(annual.map((g) => g.date), ["2019-01-01", "2020-01-01", "2021-01-01", "2022-01-01"]);
    // 2019-01-01: 1년 · 2020: 2년 · 2021: 3년 · 2022: 4년
    assert.deepEqual(annual.map((g) => g.index), [1, 2, 3, 4]);
    assert.deepEqual(annual.map((g) => g.days), [15, 15, 16, 16]);
  });
  test("1월 1일 입사는 두 기준의 총 발생이 같다", () => {
    const r = calculateLeave({ mode: "fiscal", joinDate: "2020-01-01", lastWorkDate: "2025-06-30", asOf: "" })!;
    assert.equal(r.compare?.diff, 0);
  });
  test("퇴사 정산: 회계연도 기준이 적으면 차이 > 0", () => {
    // 7월 입사 후 2년 하루 근무: 입사일 기준 11 + 15 + 15 = 41, 회계연도 11 + 7.56 + 15
    const r = calculateLeave({ mode: "fiscal", joinDate: "2017-07-01", lastWorkDate: "2019-07-01", asOf: "" })!;
    assert.equal(r.compare?.hire, 41);
    assert.ok((r.compare?.diff ?? 0) > 0);
  });
});

describe("사용 · 소멸 · 수당", () => {
  test("사용량은 먼저 발생한 것부터 차감", () => {
    const r = calculateLeave(base({ asOf: "2026-01-15", used: 3 }))!;
    // 2026-01-15: 월 단위 10일 발생 (2025-04-01 ~ 2026-01-01), 모두 2026-02-28 소멸 예정
    assert.equal(r.validBalance, 10);
    assert.equal(r.remaining, 7);
    assert.deepEqual(r.nextExpiry, { date: "2026-02-28", amount: 7 });
  });
  test("사용량은 남은 양을 넘지 않는다", () => {
    const r = calculateLeave(base({ asOf: "2026-01-15", used: 99 }))!;
    assert.equal(r.used, 10);
    assert.equal(r.remaining, 0);
    assert.equal(r.nextExpiry, null);
  });
  test("미사용 연차수당 = 1일 통상임금 × 남은 일수", () => {
    const r = calculateLeave(base({ lastWorkDate: "2026-03-01", used: 5, dailyWage: 100_000 }))!;
    // 퇴사일 기준 월 단위 11일은 이미 소멸, 15일 중 5일 사용
    assert.equal(r.remaining, 10);
    assert.equal(r.allowance, 1_000_000);
  });
});

describe("적용 제외 · 단시간 근로자 ([별표 1] · 제18조 제3항 · [별표 2])", () => {
  test("4명 이하 사업장 · 주 15시간 미만은 발생 0 + 사유", () => {
    assert.equal(calculateLeave(base({ smallBusiness: true }))!.excluded, "smallBusiness");
    const r = calculateLeave(base({ weeklyHours: 14.9 }))!;
    assert.equal(r.excluded, "underWeeklyHours");
    assert.equal(r.totalAccrued, 0);
    assert.equal(calculateLeave(base({ weeklyHours: 15 }))!.excluded, null);
  });
  test("시간 환산: 15일 · 주 20/40 → 60시간 · 주 25/40 → 75시간", () => {
    assert.equal(toHours(15, 20 / 40), 60);
    assert.equal(toHours(15, 25 / 40), 75);
    assert.equal(toHours(15, 18 / 40), 54);
  });
  test("1시간 미만은 1시간: 주 18/40 1일분 3.6 → 4시간 (건별 올림)", () => {
    assert.equal(toHours(1, 18 / 40), 4);
    const r = calculateLeave(base({ weeklyHours: 18, asOf: "2026-03-01" }))!;
    assert.equal(r.unit, "hour");
    const monthly = r.accrued.filter((g) => g.kind === "monthly");
    assert.ok(monthly.every((g) => g.amount === 4));
    assert.equal(r.totalAccrued, 11 * 4 + 54);
  });
});
