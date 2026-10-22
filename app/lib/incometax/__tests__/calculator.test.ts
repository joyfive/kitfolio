/* ============================================================
   종합소득세 계산 엔진 테스트

   방침: 타 계산기의 최종 금액과 하드코딩 비교하지 않는다.
   산식을 테스트 안에서 다시 세워 대조하고, 대상 판정 경계 ·
   초과율 경계 · 배율 상한 · 무기장가산세 · 끝수 · 역산 최소성을 따로 검사한다.
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  calculate,
  eligibility,
  simpleExpenses,
  prepaidTaxes,
  type IncomeTaxInput,
} from "../calculator.ts";
import { INCOME_TAX_POLICIES, policyFor } from "../policy.ts";
import { EXPENSE_RATE_NOTICES, noticeFor } from "../expense-rates.ts";
import { TAX_BRACKETS, progressiveTax } from "../../tax/brackets.ts";
import { WITHHOLDING_POLICY } from "../../freelancer/policy.ts";

const P = policyFor(2026);
const RATES = { simple: 641, simpleExcess: 497, standard: 134 };

function input(over: Partial<IncomeTaxInput> = {}): IncomeTaxInput {
  return {
    year: 2026,
    revenue: 30_000_000,
    prevRevenue: 28_000_000,
    isNew: false,
    rates: RATES,
    majorExpenses: 0,
    actualExpenses: null,
    dependents: 0,
    elderly: 0,
    disabled: 0,
    pension: 0,
    prepaid: null,
    ...over,
  };
}

const pick = (r: ReturnType<typeof calculate>, k: string) => r.methods.find((m) => m.kind === k)!;

describe("기본세율 (소득세법 제55조)", () => {
  /** 구간별 누적 방식으로 다시 세운 기준 구현 */
  function cumulative(base: number): number {
    let tax = 0;
    let lower = 0;
    for (const b of TAX_BRACKETS) {
      const top = Math.min(base, b.upTo);
      if (top > lower) tax += (top - lower) * b.rate;
      if (base <= b.upTo) break;
      lower = b.upTo;
    }
    return tax;
  }
  test("구간 경계에서 누진공제 방식 = 누적 방식", () => {
    for (const b of TAX_BRACKETS.slice(0, -1)) {
      for (const x of [b.upTo - 1, b.upTo, b.upTo + 1]) {
        assert.ok(Math.abs(progressiveTax(x) - cumulative(x)) < 1e-6, String(x));
      }
    }
  });
  test("8단계 · 6%~45%", () => {
    assert.equal(TAX_BRACKETS.length, 8);
    assert.equal(TAX_BRACKETS[0].rate, 0.06);
    assert.equal(TAX_BRACKETS[0].upTo, 14_000_000);
    assert.equal(TAX_BRACKETS.at(-1)!.rate, 0.45);
  });
});

describe("정책 상수", () => {
  test("공제 · 기준금액 · 가산세", () => {
    assert.equal(P.basicDeduction, 1_500_000);
    assert.equal(P.elderlyDeduction, 1_000_000);
    assert.equal(P.disabledDeduction, 2_000_000);
    assert.equal(P.standardTaxCredit, 70_000);
    assert.equal(P.simpleThreshold, 36_000_000);
    assert.equal(P.doubleEntryThreshold, 75_000_000);
    assert.equal(P.smallBusinessThreshold, 48_000_000);
    assert.equal(P.simpleExcessFrom, 40_000_000);
    assert.equal(P.standardCapMultiplierX10, 28);
    assert.equal(P.noBookPenaltyPct, 20);
    assert.equal(P.noBookRevenuePermyriad, 7);
    assert.equal(P.localRatePct, 10);
  });
  test("정책 기간: 시작 연도 이전 귀속도 첫 행으로", () => {
    assert.equal(policyFor(2020), INCOME_TAX_POLICIES[0]);
    assert.equal(policyFor(2030).fromYear, 2023);
  });
});

describe("경비율 고시 테이블", () => {
  test("모든 업종에 필수 필드 · 비율 범위", () => {
    for (const n of EXPENSE_RATE_NOTICES) {
      assert.ok(n.notice.length > 0);
      for (const r of n.rates) {
        assert.match(r.code, /^\d{6}$/);
        assert.ok(r.name.ko && r.name.en);
        for (const v of [r.simple, r.simpleExcess, r.standard]) assert.ok(v >= 0 && v <= 1000);
        assert.ok(r.simpleExcess <= r.simple, "초과율은 일반율 이하");
      }
    }
  });
  test("고시가 없는 연도는 직전 고시 + estimated", () => {
    const latest = Math.max(...EXPENSE_RATE_NOTICES.map((n) => n.year));
    assert.equal(noticeFor(latest).estimated, false);
    const next = noticeFor(latest + 2);
    assert.equal(next.estimated, true);
    assert.equal(next.notice.year, latest);
  });
});

describe("대상 판정 (시행령 제143조 · 제208조 · 제147조의2)", () => {
  test("직전연도 3,600만원 경계", () => {
    assert.equal(eligibility(input({ prevRevenue: 35_999_999 })).simple, true);
    const over = eligibility(input({ prevRevenue: 36_000_000 }));
    assert.equal(over.simple, false);
    assert.equal(over.simpleReason, "prevOver");
  });
  test("직전연도 7,500만원 이상이면 복식부기의무자", () => {
    assert.equal(eligibility(input({ prevRevenue: 74_999_999 })).doubleEntry, false);
    const d = eligibility(input({ prevRevenue: 75_000_000 }));
    assert.equal(d.doubleEntry, true);
    assert.equal(d.simpleReason, "doubleEntry");
  });
  test("올해 수입이 7,500만원 이상이면 단순경비율 불가 (신규도)", () => {
    const e = eligibility(input({ isNew: true, revenue: 75_000_000 }));
    assert.equal(e.simple, false);
    assert.equal(e.simpleReason, "currentOver");
    assert.equal(e.doubleEntry, false);
    assert.equal(eligibility(input({ isNew: true, revenue: 74_999_999 })).simple, true);
  });
  test("신규사업자는 직전연도 수입을 보지 않는다", () => {
    assert.equal(eligibility(input({ isNew: true, prevRevenue: 90_000_000 })).simple, true);
  });
  test("소규모사업자: 직전연도 4,800만원 미만 또는 신규", () => {
    assert.equal(eligibility(input({ prevRevenue: 47_999_999 })).smallBusiness, true);
    assert.equal(eligibility(input({ prevRevenue: 48_000_000 })).smallBusiness, false);
    assert.equal(eligibility(input({ isNew: true, prevRevenue: 60_000_000 })).smallBusiness, true);
  });
});

describe("단순경비율", () => {
  test("4,000만원 초과분 초과율 경계", () => {
    assert.equal(simpleExpenses(40_000_000, RATES, P), Math.floor((40_000_000 * 641) / 1000));
    assert.equal(
      simpleExpenses(40_000_001, RATES, P),
      Math.floor((40_000_000 * 641) / 1000) + Math.floor((1 * 497) / 1000),
    );
    assert.equal(
      simpleExpenses(50_000_000, RATES, P),
      Math.floor((40_000_000 * 641) / 1000) + Math.floor((10_000_000 * 497) / 1000),
    );
  });
  test("산식 재구성 (본인 1인 · 국민연금 0)", () => {
    const r = calculate(input());
    const s = pick(r, "simple");
    const income = 30_000_000 - Math.floor((30_000_000 * 641) / 1000);
    const base = income - 1_500_000;
    const computed = Math.floor(progressiveTax(base));
    const determined = Math.floor((computed - 70_000) / 10) * 10;
    assert.equal(s.income, income);
    assert.equal(s.taxBase, base);
    assert.equal(s.computedTax, computed);
    assert.equal(s.penalty, 0);
    assert.equal(s.determinedTax, determined);
    assert.equal(s.localTax, Math.floor(determined / 10 / 10) * 10);
    assert.equal(s.payable, determined - 900_000);
    assert.equal(r.best, "simple");
    assert.equal(r.estimateKind, "simple");
  });
});

describe("기준경비율", () => {
  test("주요경비 · 기준경비율 차감", () => {
    const r = calculate(input({ prevRevenue: 40_000_000, majorExpenses: 2_000_000 }));
    const s = pick(r, "standard");
    assert.equal(s.eligible, true);
    assert.equal(s.capped, false);
    assert.equal(s.income, 30_000_000 - 2_000_000 - Math.floor((30_000_000 * 134) / 1000));
    assert.equal(pick(r, "simple").eligible, false);
  });
  test("배율 상한: 단순경비율 소득금액 × 2.8", () => {
    // 단순경비율 90% 가정 → 소득 10% × 2.8 = 28% < 기준경비율 소득 86.6%
    const rates = { simple: 900, simpleExcess: 900, standard: 134 };
    const r = calculate(input({ prevRevenue: 40_000_000, rates }));
    const s = pick(r, "standard");
    const simpleIncome = 30_000_000 - Math.floor((30_000_000 * 900) / 1000);
    assert.equal(s.capped, true);
    assert.equal(s.income, Math.floor((simpleIncome * 28) / 10));
  });
});

describe("무기장가산세 (제81조의5)", () => {
  test("소규모사업자가 아니면 max(산출세액 × 20%, 수입 × 0.07%)", () => {
    const r = calculate(input({ prevRevenue: 50_000_000 }));
    const s = pick(r, "standard");
    assert.equal(
      s.penalty,
      Math.max(Math.floor(s.computedTax * 0.2), Math.floor((30_000_000 * 7) / 10_000)),
    );
  });
  test("산출세액이 0이어도 수입금액 기준 하한", () => {
    const r = calculate(input({ prevRevenue: 50_000_000, dependents: 20 }));
    const s = pick(r, "standard");
    assert.equal(s.computedTax, 0);
    assert.equal(s.penalty, Math.floor((30_000_000 * 7) / 10_000));
  });
  test("소규모사업자 · 간편장부는 가산세 없음", () => {
    assert.equal(pick(calculate(input({ prevRevenue: 40_000_000 })), "standard").penalty, 0);
    const r = calculate(input({ prevRevenue: 50_000_000, actualExpenses: 1_000_000 }));
    assert.equal(pick(r, "ledger").penalty, 0);
  });
});

describe("공제 · 끝수 · 음수", () => {
  test("인적공제: 기본 · 경로 · 장애 · 국민연금", () => {
    const r = calculate(input({ dependents: 2, elderly: 1, disabled: 1, pension: 1_200_000 }));
    assert.equal(pick(r, "simple").deductions, 3 * 1_500_000 + 1_000_000 + 2_000_000 + 1_200_000);
  });
  test("경로·장애 인원은 공제 대상 인원을 넘지 않는다", () => {
    const r = calculate(input({ dependents: 0, elderly: 5, disabled: 5 }));
    assert.equal(pick(r, "simple").deductions, 1_500_000 + 1_000_000 + 2_000_000);
  });
  test("과세표준·결정세액 음수 → 0, 전액 환급", () => {
    const r = calculate(input({ revenue: 3_000_000, dependents: 3 }));
    const s = pick(r, "simple");
    assert.equal(s.taxBase, 0);
    assert.equal(s.determinedTax, 0);
    assert.equal(s.payable, -prepaidTaxes(input({ revenue: 3_000_000 })).prepaid);
  });
  test("표준세액공제는 산출세액 한도", () => {
    const r = calculate(input({ revenue: 6_000_000, prevRevenue: 0 }));
    const s = pick(r, "simple");
    assert.ok(s.taxCredit <= s.computedTax);
  });
  test("결정세액·지방소득세·납부세액 10원 단위", () => {
    for (const revenue of [12_345_678, 29_876_543, 61_111_111]) {
      const r = calculate(input({ revenue, prevRevenue: 20_000_000, actualExpenses: 3_333_333 }));
      for (const m of r.methods) {
        for (const v of [m.determinedTax, m.localTax, m.payable, m.localPayable]) {
          assert.equal(Math.abs(v) % 10, 0, `${m.kind} ${v}`);
        }
      }
    }
  });
});

describe("기납부세액", () => {
  test("기본값 = 수입 × 3% · 지방 = 그 10% (freelancer/policy 단일 출처)", () => {
    const { prepaid, prepaidLocal } = prepaidTaxes(input({ revenue: 12_345_678 }));
    assert.equal(WITHHOLDING_POLICY.businessRatePct, 3);
    assert.equal(prepaid, Math.floor((12_345_678 * 3) / 100 / 10) * 10);
    assert.equal(prepaidLocal, Math.floor(prepaid / 10 / 10) * 10);
  });
  test("직접 입력하면 그 값을 쓴다", () => {
    assert.equal(calculate(input({ prepaid: 500_000 })).prepaid, 500_000);
  });
});

describe("역산: 간편장부 손익분기 경비", () => {
  test("최소성: 결과 경비에서는 추계 이하, 1원 적으면 초과", () => {
    for (const prev of [20_000_000, 40_000_000, 50_000_000]) {
      for (const revenue of [15_000_000, 30_000_000, 55_000_000]) {
        const r = calculate(input({ revenue, prevRevenue: prev }));
        const e = r.breakEvenExpenses;
        const target = pick(r, r.estimateKind!).totalPayable;
        assert.notEqual(e, null);
        const at = (x: number) => pick(calculate(input({ revenue, prevRevenue: prev, actualExpenses: x })), "ledger").totalPayable;
        assert.ok(at(e!) <= target, `at ${e}`);
        if (e! > 0) assert.ok(at(e! - 1) > target, `below ${e}`);
      }
    }
  });
  test("복식부기의무자는 역산하지 않는다", () => {
    const r = calculate(input({ prevRevenue: 80_000_000 }));
    assert.equal(r.estimateKind, null);
    assert.equal(r.breakEvenExpenses, null);
  });
  test("best 는 신고할 수 있는 방식 중에서만", () => {
    const r = calculate(input({ prevRevenue: 40_000_000, actualExpenses: 0 }));
    assert.notEqual(r.best, "simple");
  });
});
