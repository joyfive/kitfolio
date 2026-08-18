/* ============================================================
   4대보험 정책 데이터 테스트

   목적: "포털 계산기와 총액이 같은가"가 아니라
   "공식 요율 상수가 맞는가 + 기준일에 따라 올바른 기간이 선택되는가"를 검증한다.
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  policyOn,
  ratesOn,
  pensionBaseOn,
  toIsoDate,
  RATE_PERIODS,
  PENSION_BASE_PERIODS,
} from "../insurance.ts";

describe("2026년 공식 요율 상수", () => {
  test("국민연금 근로자 부담 4.75% (총 9.5%의 절반)", () => {
    assert.equal(ratesOn("2026-08-18").nationalPension, 0.0475);
    // 총 요율로 환산하면 9.5%
    assert.equal(ratesOn("2026-08-18").nationalPension * 2, 0.095);
  });

  test("건강보험 근로자 부담 3.595% (총 7.19%의 절반)", () => {
    assert.equal(ratesOn("2026-08-18").healthInsurance, 0.03595);
    assert.equal(
      Number((ratesOn("2026-08-18").healthInsurance * 2).toFixed(5)),
      0.0719,
    );
  });

  test("장기요양보험 건강보험료 대비 13.14% = 소득 대비 0.9448%", () => {
    const r = ratesOn("2026-08-18");
    assert.equal(r.longTermCare, 0.1314);
    // 소득 대비 총 요율: 건강보험 총요율 7.19% × 13.14% = 0.9448%
    const incomeRate = r.healthInsurance * 2 * r.longTermCare;
    assert.equal(Number((incomeRate * 100).toFixed(4)), 0.9448);
  });

  test("고용보험(실업급여) 근로자 부담 0.9% — 2025년과 동일", () => {
    assert.equal(ratesOn("2026-08-18").employmentInsurance, 0.009);
    assert.equal(ratesOn("2025-06-01").employmentInsurance, 0.009);
  });

  test("2025년 요율은 2026년과 구분되어 보존된다", () => {
    const r25 = ratesOn("2025-12-31");
    assert.equal(r25.nationalPension, 0.045);
    assert.equal(r25.healthInsurance, 0.03545);
    assert.equal(r25.longTermCare, 0.1295);
  });
});

describe("요율 기간 경계 (1월 1일 개정)", () => {
  test("2025-12-31 → 2025년 요율 / 2026-01-01 → 2026년 요율", () => {
    assert.equal(ratesOn("2025-12-31").nationalPension, 0.045);
    assert.equal(ratesOn("2026-01-01").nationalPension, 0.0475);
  });
});

describe("국민연금 기준소득월액 기간 경계 (7월 1일 개정)", () => {
  test("2026-06-30 → 상한 6,370,000 / 하한 400,000", () => {
    const b = pensionBaseOn("2026-06-30");
    assert.equal(b.upperLimit, 6_370_000);
    assert.equal(b.lowerLimit, 400_000);
  });

  test("2026-07-01 → 상한 6,590,000 / 하한 410,000", () => {
    const b = pensionBaseOn("2026-07-01");
    assert.equal(b.upperLimit, 6_590_000);
    assert.equal(b.lowerLimit, 410_000);
  });

  test("2026년 8월(현재)에는 인상된 상·하한이 적용된다", () => {
    const p = policyOn("2026-08-18");
    assert.equal(p.pensionUpperLimit, 6_590_000);
    assert.equal(p.pensionLowerLimit, 410_000);
    assert.equal(p.rateLabel, "2026");
    assert.equal(p.pensionBaseLabel, "2026.07–2027.06");
  });
});

describe("기간 테이블 무결성", () => {
  test("요율 기간이 시간순이고 서로 겹치지 않는다", () => {
    for (let i = 1; i < RATE_PERIODS.length; i++) {
      const prev = RATE_PERIODS[i - 1];
      const cur = RATE_PERIODS[i];
      assert.ok(prev.effectiveTo, `${prev.label}: 중간 기간은 종료일이 필요`);
      assert.ok(prev.effectiveTo! < cur.effectiveFrom, "기간이 겹침");
    }
    // 마지막 기간만 열린 구간
    assert.equal(RATE_PERIODS[RATE_PERIODS.length - 1].effectiveTo, undefined);
  });

  test("기준소득월액 기간이 시간순이고 하한 < 상한", () => {
    for (const p of PENSION_BASE_PERIODS) {
      assert.ok(p.lowerLimit < p.upperLimit, `${p.label}: 하한이 상한보다 큼`);
    }
    for (let i = 1; i < PENSION_BASE_PERIODS.length; i++) {
      assert.ok(
        PENSION_BASE_PERIODS[i - 1].effectiveTo! <
          PENSION_BASE_PERIODS[i].effectiveFrom,
      );
    }
  });

  test("표 범위 밖 날짜는 가장 가까운 기간으로 폴백한다", () => {
    assert.equal(ratesOn("2019-01-01").nationalPension, 0.045); // 최초 기간
    assert.equal(ratesOn("2099-01-01").nationalPension, 0.0475); // 최신 기간
  });
});

describe("toIsoDate", () => {
  test("Date와 문자열 모두 YYYY-MM-DD로 정규화", () => {
    assert.equal(toIsoDate(new Date(2026, 7, 18)), "2026-08-18");
    assert.equal(toIsoDate("2026-08-18T09:30:00Z"), "2026-08-18");
  });
});
