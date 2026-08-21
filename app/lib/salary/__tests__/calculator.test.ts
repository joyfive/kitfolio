/* ============================================================
   실수령액 계산 엔진 테스트

   방침: 특정 포털 계산기의 최종 금액과 하드코딩 비교하지 않는다.
   각 공제 항목을 공식 산식으로 직접 계산해 대조한다.
     · 국민연금  = clamp(과세소득, 하한, 상한) × 연금요율
     · 건강보험  = 과세소득 × 건강요율
     · 장기요양  = 건강보험료 × 장기요양요율
     · 고용보험  = 과세소득 × 고용요율
     · 지방소득세 = 근로소득세 × 10%
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateSalary, type SalaryInput } from "../calculator.ts";
import { policyOn } from "../insurance.ts";

const BASE: SalaryInput = {
  mode: "annual",
  amount: 52_000_000,
  nonTaxable: 200_000,
  dependents: 1,
  childrenUnder20: 0,
  withholdingRate: 100,
  asOf: "2026-08-18",
};

const calc = (over: Partial<SalaryInput> = {}) => {
  const r = calculateSalary({ ...BASE, ...over });
  assert.ok(r, "계산 결과가 null");
  return r;
};

/** 과세소득에서 4대보험 근로자 부담분을 공식 산식으로 직접 계산 */
function expectedInsurance(taxableMonthly: number, asOf: string) {
  const p = policyOn(asOf);
  const pensionBase = Math.min(
    Math.max(taxableMonthly, p.pensionLowerLimit),
    p.pensionUpperLimit,
  );
  const nationalPension = Math.round(pensionBase * p.nationalPension);
  const healthInsurance = Math.round(taxableMonthly * p.healthInsurance);
  const longTermCare = Math.round(healthInsurance * p.longTermCare);
  const employmentInsurance = Math.round(taxableMonthly * p.employmentInsurance);
  return { nationalPension, healthInsurance, longTermCare, employmentInsurance };
}

describe("1. 2026년 1월 기준 계산", () => {
  const asOf = "2026-01-15";
  const r = calc({ asOf });

  test("2026년 요율 + 개정 전(2025.07~) 기준소득월액이 적용된다", () => {
    assert.equal(r.policy.rateLabel, "2026");
    assert.equal(r.policy.pensionUpperLimit, 6_370_000);
    assert.equal(r.policy.asOf, asOf);
  });

  test("각 보험료가 공식 산식과 일치한다", () => {
    const e = expectedInsurance(r.taxableMonthly, asOf);
    assert.deepEqual(
      {
        nationalPension: r.deductions.nationalPension,
        healthInsurance: r.deductions.healthInsurance,
        longTermCare: r.deductions.longTermCare,
        employmentInsurance: r.deductions.employmentInsurance,
      },
      e,
    );
  });
});

describe("2. 2026년 8월 기준 계산", () => {
  const asOf = "2026-08-18";
  const r = calc({ asOf });

  test("2026년 7월 개정 기준소득월액(상한 6,590,000)이 반영된다", () => {
    assert.equal(r.policy.pensionUpperLimit, 6_590_000);
    assert.equal(r.policy.pensionLowerLimit, 410_000);
  });

  test("각 보험료가 공식 산식과 일치한다", () => {
    const e = expectedInsurance(r.taxableMonthly, asOf);
    assert.equal(r.deductions.nationalPension, e.nationalPension);
    assert.equal(r.deductions.healthInsurance, e.healthInsurance);
    assert.equal(r.deductions.longTermCare, e.longTermCare);
    assert.equal(r.deductions.employmentInsurance, e.employmentInsurance);
  });

  test("총 공제 = 항목 합계, 실수령 = 세전 − 총 공제", () => {
    const d = r.deductions;
    const sum =
      d.nationalPension +
      d.healthInsurance +
      d.longTermCare +
      d.employmentInsurance +
      d.incomeTax +
      d.localIncomeTax;
    assert.equal(r.totalDeduction, sum);
    assert.equal(r.netMonthly, r.monthlyGross - r.totalDeduction);
    assert.equal(r.netAnnual, r.netMonthly * 12);
  });

  test("지방소득세 = 근로소득세의 10%", () => {
    assert.equal(r.deductions.localIncomeTax, Math.round(r.deductions.incomeTax * 0.1));
  });
});

describe("3. 국민연금 상한 초과 급여", () => {
  // 월 과세소득 7,800,000 → 상한(6,590,000) 초과
  const high = calc({ mode: "monthly", amount: 8_000_000 });

  test("연금 보험료가 상한액 기준으로 고정된다", () => {
    assert.ok(high.taxableMonthly > high.policy.pensionUpperLimit);
    assert.equal(
      high.deductions.nationalPension,
      Math.round(high.policy.pensionUpperLimit * high.policy.nationalPension),
    );
    // 2026.07~ 상한 6,590,000 × 4.75% = 313,025
    assert.equal(high.deductions.nationalPension, 313_025);
  });

  test("급여가 더 올라도 연금 보험료는 그대로지만 건강보험료는 늘어난다", () => {
    const higher = calc({ mode: "monthly", amount: 12_000_000 });
    assert.equal(
      higher.deductions.nationalPension,
      high.deductions.nationalPension,
    );
    assert.ok(higher.deductions.healthInsurance > high.deductions.healthInsurance);
  });

  test("2026년 1월이면 개정 전 상한(6,370,000)이 적용돼 금액이 다르다", () => {
    const jan = calc({ mode: "monthly", amount: 8_000_000, asOf: "2026-01-15" });
    assert.equal(jan.deductions.nationalPension, 302_575); // 6,370,000 × 4.75%
    assert.notEqual(jan.deductions.nationalPension, high.deductions.nationalPension);
  });
});

describe("4. 국민연금 하한 주변 급여", () => {
  test("하한 미만 소득은 하한액 기준으로 부과된다", () => {
    const low = calc({ mode: "monthly", amount: 300_000, nonTaxable: 0 });
    assert.ok(low.taxableMonthly < low.policy.pensionLowerLimit);
    // 2026.07~ 하한 410,000 × 4.75% = 19,475
    assert.equal(low.deductions.nationalPension, 19_475);
  });

  test("하한 바로 위 소득은 실제 소득 기준으로 부과된다", () => {
    const at = calc({ mode: "monthly", amount: 500_000, nonTaxable: 0 });
    assert.ok(at.taxableMonthly > at.policy.pensionLowerLimit);
    assert.equal(at.deductions.nationalPension, Math.round(500_000 * 0.0475));
  });

  test("과세소득이 0이면 연금 보험료도 0", () => {
    const zero = calc({ mode: "monthly", amount: 200_000, nonTaxable: 200_000 });
    assert.equal(zero.taxableMonthly, 0);
    assert.equal(zero.deductions.nationalPension, 0);
    assert.equal(zero.deductions.incomeTax, 0);
  });

  test("0 이하 금액은 계산 불가(null)", () => {
    assert.equal(calculateSalary({ ...BASE, amount: 0 }), null);
    assert.equal(calculateSalary({ ...BASE, amount: -1 }), null);
  });
});

describe("5. 비과세액 0 / 200,000", () => {
  const none = calc({ nonTaxable: 0 });
  const std = calc({ nonTaxable: 200_000 });

  test("비과세액만큼 과세소득이 줄어든다", () => {
    assert.equal(none.taxableMonthly - std.taxableMonthly, 200_000);
  });

  test("비과세가 있으면 보험료·세금이 모두 줄고 실수령액은 늘어난다", () => {
    assert.ok(std.deductions.healthInsurance < none.deductions.healthInsurance);
    assert.ok(std.deductions.nationalPension < none.deductions.nationalPension);
    assert.ok(std.deductions.incomeTax < none.deductions.incomeTax);
    assert.ok(std.netMonthly > none.netMonthly);
  });

  test("세전 급여 자체는 비과세와 무관하게 동일하다", () => {
    assert.equal(std.monthlyGross, none.monthlyGross);
  });
});

describe("6. 부양가족 수 변화", () => {
  const one = calc({ dependents: 1 });
  const three = calc({ dependents: 3 });
  const withKids = calc({ dependents: 3, childrenUnder20: 2 });

  test("부양가족이 늘면 근로소득세가 줄어든다", () => {
    assert.ok(three.deductions.incomeTax < one.deductions.incomeTax);
  });

  test("20세 이하 자녀는 추가로 세액을 낮춘다", () => {
    assert.ok(withKids.deductions.incomeTax < three.deductions.incomeTax);
  });

  test("부양가족 수는 4대보험료에 영향을 주지 않는다", () => {
    assert.equal(three.deductions.nationalPension, one.deductions.nationalPension);
    assert.equal(three.deductions.healthInsurance, one.deductions.healthInsurance);
    assert.equal(three.deductions.longTermCare, one.deductions.longTermCare);
    assert.equal(
      three.deductions.employmentInsurance,
      one.deductions.employmentInsurance,
    );
  });
});

describe("7. 원천징수 선택비율 80 / 100 / 120%", () => {
  const r80 = calc({ withholdingRate: 80 });
  const r100 = calc({ withholdingRate: 100 });
  const r120 = calc({ withholdingRate: 120 });

  test("선택비율이 높을수록 매달 떼는 근로소득세가 많다", () => {
    assert.ok(r80.deductions.incomeTax < r100.deductions.incomeTax);
    assert.ok(r100.deductions.incomeTax < r120.deductions.incomeTax);
  });

  test("세액은 100% 기준의 0.8배 / 1.2배 (원 단위 반올림 오차 허용)", () => {
    const base = r100.deductions.incomeTax;
    assert.ok(Math.abs(r80.deductions.incomeTax - base * 0.8) <= 1);
    assert.ok(Math.abs(r120.deductions.incomeTax - base * 1.2) <= 1);
  });

  test("선택비율이 높을수록 월 실수령액은 줄어든다", () => {
    assert.ok(r80.netMonthly > r100.netMonthly);
    assert.ok(r100.netMonthly > r120.netMonthly);
  });

  test("선택비율은 4대보험료를 바꾸지 않는다", () => {
    assert.equal(r80.deductions.nationalPension, r120.deductions.nationalPension);
    assert.equal(r80.deductions.healthInsurance, r120.deductions.healthInsurance);
  });
});

describe("연봉 / 월급 입력 동등성", () => {
  test("연봉 52,000,000과 월급 4,333,333…은 같은 월 기준으로 환산된다", () => {
    const annual = calc({ mode: "annual", amount: 52_000_000 });
    const monthly = calc({ mode: "monthly", amount: 52_000_000 / 12 });
    assert.equal(annual.monthlyGross, monthly.monthlyGross);
    assert.equal(annual.netMonthly, monthly.netMonthly);
  });
});

describe("기준일 미지정 시 오늘 기준", () => {
  test("asOf 없이 호출해도 정책이 선택된다", () => {
    const r = calculateSalary({ ...BASE, asOf: undefined });
    assert.ok(r);
    assert.match(r.policy.asOf, /^\d{4}-\d{2}-\d{2}$/);
  });
});
