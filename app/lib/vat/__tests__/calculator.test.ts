/* ============================================================
   부가세 계산 엔진 테스트

   방침: 타 계산기의 최종 금액과 하드코딩 비교하지 않는다.
   법령 산식을 테스트 안에서 직접 다시 세워 대조하고,
   1원 미만 처리·역산·납부 면제·기간 경계를 따로 검사한다.
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  divide,
  truncate10,
  grossFromSupply,
  supplyFromGross,
  calculateSimplified,
  type SimplifiedInput,
} from "../calculator.ts";
import {
  VAT_RATE_PCT,
  PURCHASE_CREDIT_PERMILLE,
  INDUSTRIES,
  simplifiedPolicyOn,
  cardCreditOn,
} from "../policy.ts";

const ASOF = "2026-10-22";

function simplified(over: Partial<SimplifiedInput>) {
  return calculateSimplified({
    industry: "construction",
    sales: 60_000_000,
    purchases: 22_000_000,
    cardSales: 0,
    months: 12,
    asOf: ASOF,
    ...over,
  });
}

describe("정책 상수", () => {
  test("세율 10% · 매입공제 0.5%", () => {
    assert.equal(VAT_RATE_PCT, 10);
    assert.equal(PURCHASE_CREDIT_PERMILLE, 5);
  });
  test("업종별 부가가치율: 시행령 제111조 제2항 표 6구분", () => {
    const byRow = new Map<number, number>();
    for (const x of INDUSTRIES) {
      const prev = byRow.get(x.row);
      if (prev !== undefined) assert.equal(prev, x.valueAddedPct, `구분 ${x.row} 불일치`);
      byRow.set(x.row, x.valueAddedPct);
    }
    assert.deepEqual(
      [...byRow.entries()].sort((a, b) => a[0] - b[0]),
      [[1, 15], [2, 20], [3, 25], [4, 30], [5, 40], [6, 30]],
    );
  });
  test("간이과세 기준: 2024-06-30 은 8천만 원 · 2024-07-01 은 1억 400만 원", () => {
    assert.equal(simplifiedPolicyOn("2024-06-30").threshold, 80_000_000);
    assert.equal(simplifiedPolicyOn("2024-07-01").threshold, 104_000_000);
    assert.equal(simplifiedPolicyOn(ASOF).exemptionThreshold, 48_000_000);
    assert.equal(simplifiedPolicyOn(ASOF).rentalThreshold, 48_000_000);
  });
  test("카드발행공제: 2026-12-31 까지 1.3%·1천만 원, 2027-01-01 부터 1%·500만 원", () => {
    assert.deepEqual(
      [cardCreditOn("2026-12-31").permille, cardCreditOn("2026-12-31").annualCap],
      [13, 10_000_000],
    );
    assert.deepEqual(
      [cardCreditOn("2027-01-01").permille, cardCreditOn("2027-01-01").annualCap],
      [10, 5_000_000],
    );
  });
});

describe("divide · truncate10", () => {
  test("절사 · 반올림 · 올림", () => {
    assert.equal(divide(123_450, 100, "floor"), 1_234);
    assert.equal(divide(123_450, 100, "round"), 1_235);
    assert.equal(divide(123_450, 100, "ceil"), 1_235);
    assert.equal(divide(123_440, 100, "round"), 1_234);
    assert.equal(divide(1_000, 100, "ceil"), 10);
  });
  test("10원 미만 버림", () => {
    assert.equal(truncate10(3_454_545), 3_454_540);
    assert.equal(truncate10(9), 0);
  });
});

describe("일반과세: 공급가액 → 합계", () => {
  test("100만 원", () => {
    assert.deepEqual(grossFromSupply(1_000_000), { supply: 1_000_000, vat: 100_000, gross: 1_100_000 });
  });
  test("1원 미만 처리: 12,345", () => {
    assert.equal(grossFromSupply(12_345, "floor").vat, 1_234);
    assert.equal(grossFromSupply(12_345, "round").vat, 1_235);
    assert.equal(grossFromSupply(12_345, "ceil").vat, 1_235);
  });
  test("0원·음수·소수 입력", () => {
    assert.equal(grossFromSupply(0).gross, 0);
    assert.equal(grossFromSupply(-5).supply, 0);
    assert.equal(grossFromSupply(1000.9).supply, 1000);
  });
});

describe("일반과세: 합계 → 공급가액", () => {
  test("부동소수점 오차 없음: 110,000 → 100,000", () => {
    const r = supplyFromGross(110_000);
    assert.equal(r.inclusive.supply, 100_000);
    assert.equal(r.exact?.supply, 100_000);
  });
  test("두 방식 일치: 1,100,000 · 1,000,000", () => {
    assert.equal(supplyFromGross(1_100_000).inclusive.supply, 1_000_000);
    assert.equal(supplyFromGross(1_100_000).exact?.supply, 1_000_000);
    assert.deepEqual(supplyFromGross(1_000_000).inclusive, { supply: 909_091, vat: 90_909, gross: 1_000_000 });
    assert.deepEqual(supplyFromGross(1_000_000).exact, { supply: 909_091, vat: 90_909, gross: 1_000_000 });
  });
  test("두 방식 1원 차이: 99,999", () => {
    const r = supplyFromGross(99_999);
    assert.deepEqual(r.inclusive, { supply: 90_908, vat: 9_091, gross: 99_999 });
    assert.deepEqual(r.exact, { supply: 90_909, vat: 9_090, gross: 99_999 });
  });
  test("정확 역산 해 없음: 21 → 이웃 합계 20 · 22", () => {
    const r = supplyFromGross(21);
    assert.equal(r.exact, null);
    assert.equal(r.nearestBelow?.gross, 20);
    assert.equal(r.nearestAbove?.gross, 22);
  });
  test("무작위 표본: A 는 합계 보존, B 는 정방향 합계와 일치", () => {
    let seed = 7;
    const rand = () => (seed = (seed * 48_271) % 2_147_483_647);
    for (let i = 0; i < 3_000; i++) {
      const g = 1 + (rand() % 1_000_000_000);
      for (const rounding of ["floor", "round", "ceil"] as const) {
        const r = supplyFromGross(g, rounding);
        assert.equal(r.inclusive.supply + r.inclusive.vat, g);
        assert.ok(Math.abs(r.inclusive.supply * 1.1 - g) <= 1, `A 범위 ${g}`);
        if (r.exact) {
          assert.equal(grossFromSupply(r.exact.supply, rounding).gross, g);
        } else {
          assert.ok(r.nearestBelow && r.nearestBelow.gross < g, `아래 이웃 ${g}`);
          assert.ok(r.nearestAbove && r.nearestAbove.gross > g, `위 이웃 ${g}`);
          assert.equal(r.nearestAbove.supply, r.nearestBelow.supply + 1);
        }
      }
    }
  });
});

describe("간이과세", () => {
  test("업종별 납부세액: 매출 6,000만 · 매입 2,200만", () => {
    for (const [industry, pct] of [["retail", 15], ["construction", 30], ["professional", 40]] as const) {
      const r = simplified({ industry });
      const payable = (60_000_000 * pct * 10) / 10_000;
      const credit = (22_000_000 * 5) / 1_000;
      assert.equal(r.payable, payable);
      assert.equal(r.purchaseCredit, credit);
      assert.equal(r.due, truncate10(payable - credit));
    }
    assert.equal(simplified({ industry: "construction" }).due, 1_690_000);
  });
  test("일반과세 비교: 매출세액 − 매입세액", () => {
    const r = simplified({});
    const diff = Math.floor(60_000_000 / 11) - Math.floor(22_000_000 / 11);
    assert.equal(r.generalComparison, truncate10(diff));
    assert.equal(r.generalComparison, 3_454_540);
  });
  test("환급 없음: 공제가 납부세액을 넘으면 0 (제63조 제6항)", () => {
    const r = simplified({ industry: "retail", sales: 50_000_000, purchases: 200_000_000 });
    assert.equal(r.payable, 750_000);
    assert.equal(r.creditsApplied, 750_000);
    assert.equal(r.creditsLost, 1_000_000 - 750_000);
    assert.equal(r.due, 0);
    assert.ok(r.generalComparison < 0, "일반과세라면 환급");
  });
  test("카드발행공제 1.3% · 연 1천만 원 한도", () => {
    const r = simplified({ sales: 100_000_000, purchases: 0, cardSales: 40_000_000 });
    assert.equal(r.cardCredit, 520_000);
    assert.equal(r.cardCapped, false);
    const big = simplified({ industry: "professional", sales: 1_000_000_000, purchases: 0, cardSales: 1_000_000_000 });
    assert.equal(big.cardCredit, 10_000_000);
    assert.equal(big.cardCapped, true);
    const next = simplified({ sales: 100_000_000, purchases: 0, cardSales: 40_000_000, asOf: "2027-01-01" });
    assert.equal(next.cardCredit, 400_000);
  });
  test("카드 매출은 전체 매출을 넘을 수 없다", () => {
    assert.equal(simplified({ sales: 10_000_000, cardSales: 50_000_000 }).cardCredit, 130_000);
  });
  test("납부 면제 경계: 47,999,999 면제 · 48,000,000 납부", () => {
    const a = simplified({ sales: 47_999_999, purchases: 0 });
    assert.equal(a.exempt, true);
    assert.equal(a.due, 0);
    assert.ok(a.netBeforeExemption > 0);
    const b = simplified({ sales: 48_000_000, purchases: 0 });
    assert.equal(b.exempt, false);
    assert.equal(b.due, 1_440_000);
  });
  test("12개월 환산: 6개월 2,500만 원 → 5,000만 원, 면제 아님", () => {
    const r = simplified({ sales: 25_000_000, months: 6 });
    assert.equal(r.annualizedSales, 50_000_000);
    assert.equal(r.exempt, false);
  });
  test("간이과세 기준: 1억 400만 원 · 부동산임대업 4,800만 원", () => {
    assert.equal(simplified({ sales: 103_999_999 }).overThreshold, false);
    assert.equal(simplified({ sales: 104_000_000 }).overThreshold, true);
    const rental = simplified({ industry: "rental", sales: 48_000_000 });
    assert.equal(rental.simplifiedThreshold, 48_000_000);
    assert.equal(rental.overThreshold, true);
  });
  test("배제 가능 업종 표시", () => {
    assert.equal(simplified({ industry: "manufacturing" }).mayBeExcluded, true);
    assert.equal(simplified({ industry: "retail" }).mayBeExcluded, false);
  });
  test("10원 미만 절사", () => {
    const r = simplified({ industry: "retail", sales: 48_123_457, purchases: 0 });
    assert.equal(r.payable, Math.floor((48_123_457 * 15) / 1_000));
    assert.equal(r.due % 10, 0);
    assert.equal(r.due, truncate10(r.payable));
  });
});
