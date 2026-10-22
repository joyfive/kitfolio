/* ============================================================
   실업급여(구직급여) 계산 엔진 테스트

   방침: 타 계산기의 최종 금액과 하드코딩 비교하지 않는다.
   60% · 상한 · 하한 산식을 테스트 안에서 정책 상수로 다시 세워 대조하고,
   정책 기간 경계 · [별표 1] 경계 · 나이 경계 · 수급기간 날짜를 따로 검사한다.
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  ageOn,
  benefitDaysFor,
  calculateUnemployment,
  calendarDaysFor,
  dailyBenefit,
  estimateUnitDays,
  monthsForUnitDays,
  type UnemploymentInput,
} from "../calculator.ts";
import { BENEFIT_DAYS_TABLE, POLICY_PERIODS, policyOn } from "../policy.ts";
import { parseDate } from "../../wage/average.ts";

const BASE: UnemploymentInput = {
  lastWorkDate: "2026-10-31",
  wage3m: 9_000_000,
  dailyHours: 8,
  insuredMonths: 50,
  reason: "involuntary",
};

const calc = (over: Partial<UnemploymentInput> = {}) => {
  const r = calculateUnemployment({ ...BASE, ...over });
  assert.ok(r.ok, "계산 결과가 실패");
  return r.result;
};

const P2026 = policyOn("2026-10-31")!;
const P2025 = policyOn("2025-06-30")!;
const P2024 = policyOn("2024-06-30")!;

describe("정책 상수와 기간 경계", () => {
  test("2026 이직: 기초일액 상한 113,500 · 최저임금 10,320", () => {
    assert.equal(P2026.baseDailyCap, 113_500);
    assert.equal(P2026.minWageHourly, 10_320);
    assert.equal(P2026.replacementRate, 0.6);
    assert.equal(P2026.floorRate, 0.8);
    assert.equal(P2026.paidDaysPerWeek, 7);
  });

  test("2025 · 2024 이직: 상한 110,000 · 최저임금 10,030 · 9,860", () => {
    assert.equal(P2025.baseDailyCap, 110_000);
    assert.equal(P2025.minWageHourly, 10_030);
    assert.equal(P2024.baseDailyCap, 110_000);
    assert.equal(P2024.minWageHourly, 9_860);
  });

  test("경계: 2025-12-31 은 2025 · 2026-01-01 은 2026 · 2023 은 미지원", () => {
    assert.equal(policyOn("2025-12-31")!.label, "2025");
    assert.equal(policyOn("2026-01-01")!.label, "2026");
    assert.equal(policyOn("2023-12-31"), null);
    const r = calculateUnemployment({ ...BASE, lastWorkDate: "2023-12-31" });
    assert.deepEqual(r, { ok: false, error: "unsupportedDate" });
  });

  test("기간이 겹치거나 비지 않는다", () => {
    for (let i = 1; i < POLICY_PERIODS.length; i += 1) {
      const prevTo = parseDate(POLICY_PERIODS[i - 1].effectiveTo!)!;
      const from = parseDate(POLICY_PERIODS[i].effectiveFrom)!;
      assert.equal(from.getTime() - prevTo.getTime(), 86_400_000);
    }
  });
});

describe("구직급여일액: 60% · 상한 · 하한", () => {
  test("상한: 2026 이직 68,100 (= 113,500 × 60%) · 2025 이직 66,000", () => {
    assert.equal(dailyBenefit(P2026, 200_000, 0, 8).daily, 68_100);
    assert.equal(dailyBenefit(P2026, 200_000, 0, 8).band, "cap");
    assert.equal(dailyBenefit(P2025, 200_000, 0, 8).daily, 66_000);
  });

  test("하한: 최저임금 × 8시간 × 80%", () => {
    assert.equal(dailyBenefit(P2026, 50_000, 0, 8).daily, Math.floor(10_320 * 8 * 0.8));
    assert.equal(dailyBenefit(P2026, 50_000, 0, 8).daily, 66_048);
    assert.equal(dailyBenefit(P2025, 50_000, 0, 8).daily, 64_192);
    assert.equal(dailyBenefit(P2024, 50_000, 0, 8).daily, 63_104);
  });

  test("구간 경계: 110,079 하한 · 110,080 ~ 113,499 비례 · 113,500 상한 (2026)", () => {
    assert.equal(dailyBenefit(P2026, 110_079, 0, 8).band, "floor");
    const lo = dailyBenefit(P2026, 110_080, 0, 8);
    assert.equal(lo.band, "proportional");
    assert.equal(lo.daily, 66_048);
    const mid = dailyBenefit(P2026, 112_000, 0, 8);
    assert.equal(mid.band, "proportional");
    assert.equal(mid.daily, Math.floor(112_000 * 0.6));
    assert.equal(dailyBenefit(P2026, 113_499, 0, 8).band, "proportional");
    assert.equal(dailyBenefit(P2026, 113_500, 0, 8).band, "cap");
  });

  test("단시간: 1일 4시간 하한 33,024 · 8시간 초과는 8시간으로 본다", () => {
    assert.equal(dailyBenefit(P2026, 30_000, 0, 4).daily, Math.floor(10_320 * 4 * 0.8));
    assert.equal(dailyBenefit(P2026, 30_000, 0, 4).daily, 33_024);
    assert.equal(dailyBenefit(P2026, 30_000, 0, 10).floorHours, 8);
  });

  test("통상임금이 평균임금보다 크면 통상임금을 기초일액으로", () => {
    const b = dailyBenefit(P2026, 100_000, 112_000, 8);
    assert.equal(b.usedOrdinaryWage, true);
    assert.equal(b.baseDaily, 112_000);
    assert.equal(b.daily, Math.floor(112_000 * 0.6));
    assert.equal(dailyBenefit(P2026, 100_000, 90_000, 8).usedOrdinaryWage, false);
  });

  test("하한 연동 상한(개편안 대비): 하한 × 비율", () => {
    const linked = { ...P2026, upperRule: { kind: "floorLinked" as const, ratio: 1.03 } };
    const b = dailyBenefit(linked, 300_000, 0, 8);
    assert.equal(b.cap, Math.floor(66_048 * 1.03));
    assert.equal(b.daily, b.cap);
  });
});

describe("소정급여일수 [별표 1]", () => {
  test("10칸 전부", () => {
    const months = [0, 12, 36, 60, 120];
    months.forEach((m, i) => {
      assert.equal(benefitDaysFor(m, false), BENEFIT_DAYS_TABLE.under50[i]);
      assert.equal(benefitDaysFor(m, true), BENEFIT_DAYS_TABLE.over50[i]);
    });
    assert.deepEqual([...BENEFIT_DAYS_TABLE.under50], [120, 150, 180, 210, 240]);
    assert.deepEqual([...BENEFIT_DAYS_TABLE.over50], [120, 180, 210, 240, 270]);
  });

  test("경계: 1년 · 3년 · 5년 · 10년 직전과 정확히", () => {
    assert.equal(benefitDaysFor(11, false), 120);
    assert.equal(benefitDaysFor(12, false), 150);
    assert.equal(benefitDaysFor(35, false), 150);
    assert.equal(benefitDaysFor(36, false), 180);
    assert.equal(benefitDaysFor(59, true), 210);
    assert.equal(benefitDaysFor(60, true), 240);
    assert.equal(benefitDaysFor(119, true), 240);
    assert.equal(benefitDaysFor(120, true), 270);
  });

  test("장애인은 50세 미만이어도 50세 이상 행", () => {
    assert.equal(calc({ insuredMonths: 50, disabled: true }).benefitDays, 210);
    assert.equal(calc({ insuredMonths: 50 }).benefitDays, 180);
  });

  test("나이 경계: 이직일에 49세면 아래 행, 50세 생일이면 위 행", () => {
    assert.equal(ageOn(parseDate("1976-11-01")!, parseDate("2026-10-31")!), 49);
    assert.equal(ageOn(parseDate("1976-10-31")!, parseDate("2026-10-31")!), 50);
    assert.equal(calc({ birthDate: "1976-11-01", insuredMonths: 150 }).benefitDays, 240);
    assert.equal(calc({ birthDate: "1976-10-31", insuredMonths: 150 }).benefitDays, 270);
  });

  test("생년월일이 있으면 50세 이상 체크보다 우선", () => {
    assert.equal(calc({ over50: true, birthDate: "1990-01-01" }).olderRow, false);
    assert.equal(calc({ over50: true }).olderRow, true);
  });

  test("총액 = 일액 × 일수, 월 환산 = 일액 × 28", () => {
    const r = calc();
    assert.equal(r.total, r.benefit.daily * r.benefitDays);
    assert.equal(r.monthly, r.benefit.daily * 28);
  });
});

describe("평균임금: 퇴직금과 같은 공용 산식", () => {
  test("3개월 임금 ÷ 산정기간 일수, 상여·연차수당 3/12", () => {
    const r = calc({ annualBonus: 1_200_000, annualLeaveAllowance: 400_000 });
    assert.equal(r.wagePeriodStart, "2026-08-01");
    assert.equal(r.wagePeriodDays, 92);
    assert.equal(r.bonusApplied, 300_000);
    assert.equal(r.leaveApplied, 100_000);
    assert.equal(r.benefit.averageDailyWage, Math.round((9_000_000 + 400_000) / 92));
  });

  test("월 300만 원은 2026 하한 구간", () => {
    assert.equal(calc().benefit.band, "floor");
    assert.equal(calc().benefit.daily, 66_048);
  });
});

describe("수급기간과 신청 마감", () => {
  test("마지막 근무일 2026-10-31 → 수급기간 2026-11-01 ~ 2027-10-31", () => {
    const s = calc().schedule;
    assert.equal(s.periodStart, "2026-11-01");
    assert.equal(s.periodEnd, "2027-10-31");
  });

  test("마지막 신청일 = 만료일 − (일수 − 1) − 대기 7일", () => {
    const r = calc({ birthDate: "1974-01-01", insuredMonths: 144 });
    assert.equal(r.benefitDays, 270);
    const end = parseDate(r.schedule.periodEnd)!;
    const latest = parseDate(r.schedule.latestFullApplyDate)!;
    assert.equal((end.getTime() - latest.getTime()) / 86_400_000, 269 + 7);
    assert.equal(r.schedule.slackDays, 88);
  });

  test("마지막 신청일에 신청하면 다 받고, 하루 늦으면 1일 놓친다", () => {
    const r0 = calc({ insuredMonths: 144, over50: true });
    const latest = r0.schedule.latestFullApplyDate;
    const onTime = calc({ insuredMonths: 144, over50: true, applyDate: latest }).schedule.apply!;
    assert.equal(onTime.receivableDays, 270);
    assert.equal(onTime.lostDays, 0);
    const d = parseDate(latest)!;
    d.setUTCDate(d.getUTCDate() + 1);
    const late = calc({
      insuredMonths: 144,
      over50: true,
      applyDate: d.toISOString().slice(0, 10),
    }).schedule.apply!;
    assert.equal(late.receivableDays, 269);
    assert.equal(late.lostDays, 1);
  });

  test("만료일 이후 신청은 0일 · 이직일 이전 신청은 tooEarly", () => {
    assert.equal(calc({ applyDate: "2027-11-01" }).schedule.apply!.receivableDays, 0);
    assert.equal(calc({ applyDate: "2026-10-31" }).schedule.apply!.tooEarly, true);
  });

  test("지급 시작 = 신청일 + 7일", () => {
    assert.equal(calc({ applyDate: "2026-11-03" }).schedule.apply!.payStart, "2026-11-10");
  });

  test("주 6일 지급이면 달력 일수가 늘어난다 (개편안 대비)", () => {
    assert.equal(calendarDaysFor(270, 7), 270);
    assert.equal(calendarDaysFor(270, 6), 315);
    assert.equal(calendarDaysFor(120, 6), 140);
  });
});

describe("피보험단위기간 180일 추정", () => {
  test("주 5일: 7개월 충족 · 6개월 미달", () => {
    assert.ok(estimateUnitDays(7, 5) >= 180);
    assert.ok(estimateUnitDays(6, 5) < 180);
    assert.equal(monthsForUnitDays(5), 7);
  });

  test("기준기간 18개월을 넘는 근무 기간은 18개월로 본다", () => {
    const e = calc({ recentWorkMonths: 30 }).eligibility;
    assert.equal(e.monthsUsed, 18);
  });

  test("근무 기간이 없으면 총 피보험기간으로 추정", () => {
    const e = calc({ insuredMonths: 6 }).eligibility;
    assert.equal(e.fromInsuredPeriod, true);
    assert.equal(e.meetsUnitDays, false);
  });

  test("65세 이상은 생년월일이 있을 때만 표시", () => {
    assert.equal(calc({ birthDate: "1960-01-01" }).eligibility.age65Plus, true);
    assert.equal(calc({ over50: true }).eligibility.age65Plus, false);
  });
});

describe("조기재취업수당", () => {
  test("남은 일수가 절반 이상이면 남은 일수 × 일액 × 1/2", () => {
    // 신청 2026-11-01 → 지급 시작 2026-11-08, 2026-12-08 재취업 → 30일 지급
    const r = calc({ applyDate: "2026-11-01", reemployDate: "2026-12-08" });
    const e = r.early!;
    assert.equal(e.paidDays, 30);
    assert.equal(e.remainingDays, r.benefitDays - 30);
    assert.equal(e.eligible, true);
    assert.equal(e.amount, Math.floor(e.remainingDays * r.benefit.daily * 0.5));
  });

  test("절반 미만이면 0", () => {
    // 180일 중 100일 지급 후 재취업
    const r = calc({ applyDate: "2026-11-01", reemployDate: "2027-02-16" });
    assert.equal(r.early!.paidDays, 100);
    assert.equal(r.early!.eligible, false);
    assert.equal(r.early!.amount, 0);
  });

  test("정확히 절반 남으면 대상", () => {
    const r = calc({ applyDate: "2026-11-01", reemployDate: "2027-02-06" });
    assert.equal(r.early!.remainingDays, 90);
    assert.equal(r.early!.eligible, true);
  });
});
