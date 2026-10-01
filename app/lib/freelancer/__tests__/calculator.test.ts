/* ============================================================
   프리랜서 3.3% 계산 엔진 테스트

   방침: 타 계산기의 최종 금액과 하드코딩 비교하지 않는다.
   법령 산식을 테스트 안에서 직접 다시 세워 대조하고,
   절사·과세최저한·소액 부징수 경계와 역산의 최소성을 따로 검사한다.
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  calculateWithholding,
  reverseWithholding,
  nominalRate,
  truncate10,
  type IncomeMode,
} from "../calculator.ts";
import { WITHHOLDING_POLICY as P } from "../policy.ts";

/** 법령 산식을 그대로 다시 세운 기준 구현 */
function reference(gross: number, mode: IncomeMode) {
  const taxable = mode === "business" ? gross : Math.floor(gross * 0.4);
  let incomeTax = 0;
  if (mode === "business") incomeTax = Math.floor((gross * 3) / 100 / 10) * 10;
  else if (taxable > 50_000) incomeTax = Math.floor((taxable * 20) / 100 / 10) * 10;
  if (mode === "other" && incomeTax > 0 && incomeTax < 1_000) incomeTax = 0;
  const localTax = Math.floor(incomeTax / 10 / 10) * 10;
  return { incomeTax, localTax, net: gross - incomeTax - localTax };
}

describe("정책 상수", () => {
  test("법령 원문과 일치", () => {
    assert.equal(P.businessRatePct, 3);
    assert.equal(P.otherRatePct, 20);
    assert.equal(P.otherExpensePct, 60);
    assert.equal(P.otherMinimumIncome, 50_000);
    assert.equal(P.smallAmountThreshold, 1_000);
    assert.equal(P.localRatePct, 10);
  });
  test("계속적·반복적 인적용역 사업소득은 소액 부징수 제외 (시행령 제149조의3)", () => {
    assert.equal(P.businessSmallAmountExempt, false);
  });
  test("명목율 3.3% · 8.8%", () => {
    assert.ok(Math.abs(nominalRate("business") - 0.033) < 1e-12);
    assert.ok(Math.abs(nominalRate("other") - 0.088) < 1e-12);
  });
});

describe("truncate10", () => {
  test("10원 미만 버림", () => {
    assert.equal(truncate10(93_071.1), 93_070);
    assert.equal(truncate10(9), 0);
    assert.equal(truncate10(30_000), 30_000);
  });
});

describe("사업소득 3.3%", () => {
  test("100만 원", () => {
    const r = calculateWithholding(1_000_000, "business");
    assert.equal(r.incomeTax, 30_000);
    assert.equal(r.localTax, 3_000);
    assert.equal(r.net, 967_000);
  });
  test("지방소득세는 절사된 소득세 기준", () => {
    const r = calculateWithholding(3_102_370, "business");
    assert.equal(r.incomeTax, 93_070); // 93,071.1 → 93,070
    assert.equal(r.localTax, 9_300); // 9,307 → 9,300
    assert.equal(r.net, 3_000_000);
  });
  test("소득세 1,000원 미만이어도 징수", () => {
    const r = calculateWithholding(20_000, "business");
    assert.equal(r.incomeTax, 600);
    assert.equal(r.localTax, 60);
    assert.equal(r.smallAmountExempt, false);
  });
  test("0원·음수·소수 입력", () => {
    assert.equal(calculateWithholding(0, "business").net, 0);
    assert.equal(calculateWithholding(-5, "business").gross, 0);
    assert.equal(calculateWithholding(1000.9, "business").gross, 1000);
  });
});

describe("기타소득 8.8%", () => {
  test("100만 원", () => {
    const r = calculateWithholding(1_000_000, "other");
    assert.equal(r.expense, 600_000);
    assert.equal(r.taxable, 400_000);
    assert.equal(r.incomeTax, 80_000);
    assert.equal(r.localTax, 8_000);
    assert.equal(r.net, 912_000);
  });
  test("과세최저한 경계: 기타소득금액 5만 원 이하", () => {
    const at = calculateWithholding(125_000, "other");
    assert.equal(at.taxable, 50_000);
    assert.equal(at.belowMinimum, true);
    assert.equal(at.totalTax, 0);

    // 125,002 × 40% = 50,000.8 → 1원 미만 버림 → 50,000 → 여전히 최저한
    assert.equal(calculateWithholding(125_002, "other").belowMinimum, true);

    const over = calculateWithholding(125_003, "other");
    assert.equal(over.taxable, 50_001);
    assert.equal(over.belowMinimum, false);
    assert.equal(over.incomeTax, 10_000);
  });
});

describe("기준 구현과 대조", () => {
  test("표본 금액 전체", () => {
    const samples = [1, 9, 10, 33_333, 33_334, 125_000, 125_003, 500_000, 1_234_567, 98_765_432];
    for (let g = 0; g < 2_000; g += 7) samples.push(g * 997);
    for (const mode of ["business", "other"] as IncomeMode[]) {
      for (const g of samples) {
        const r = calculateWithholding(g, mode);
        const e = reference(g, mode);
        assert.equal(r.incomeTax, e.incomeTax, `${mode} ${g} 소득세`);
        assert.equal(r.localTax, e.localTax, `${mode} ${g} 지방소득세`);
        assert.equal(r.net, e.net, `${mode} ${g} 실수령`);
      }
    }
  });
});

describe("역산", () => {
  test("단순 나눗셈보다 정확한 최소 지급액", () => {
    const r = reverseWithholding(3_000_000, "business");
    assert.equal(r.result.gross, 3_102_370);
    assert.equal(r.result.net, 3_000_000);
    assert.equal(r.exact, true);
    // 단순 나눗셈 3,102,379 는 최소가 아니다
    assert.ok(Math.ceil(3_000_000 / 0.967) > r.result.gross);
  });

  test("과세최저한 안쪽 목표는 그대로", () => {
    const r = reverseWithholding(120_000, "other");
    assert.equal(r.result.gross, 120_000);
    assert.equal(r.result.totalTax, 0);
  });

  test("비과세 경계 주변 목표는 전수 탐색과 일치", () => {
    for (const mode of ["business", "other"] as IncomeMode[]) {
      for (let target = 0; target <= 140_000; target += 37) {
        let brute = target;
        while (calculateWithholding(brute, mode).net < target) brute++;
        assert.equal(reverseWithholding(target, mode).result.gross, brute, `${mode} ${target}`);
      }
    }
  });

  test("최소성: 결과 지급액에서는 목표 이상, 그보다 작은 모든 지급액은 목표 미만", () => {
    let seed = 42;
    const rand = () => ((seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648) / 2_147_483_648);
    for (const mode of ["business", "other"] as IncomeMode[]) {
      for (let i = 0; i < 300; i++) {
        const target = Math.floor(10_000 + rand() * 100_000_000);
        const { result } = reverseWithholding(target, mode);
        assert.ok(result.net >= target, `${mode} ${target}: 목표 미달`);
        // 답 아래 100원 범위를 전부 확인 (실수령액이 비단조라 바로 아래만 보면 부족하다)
        for (let g = Math.max(0, result.gross - 100); g < result.gross; g++) {
          assert.ok(calculateWithholding(g, mode).net < target, `${mode} ${target}: ${g} 가 더 작다`);
        }
      }
    }
  });
});
