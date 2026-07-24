"use client";

import { useMemo, useState } from "react";
import Faq from "./Faq";
import ToolGuide from "./ToolGuide";
import RelatedTools from "./RelatedTools";
import PageHead from "./PageHead";
import { useLang, useT, type Dict } from "../lib/i18n";
import { calculateSalary, type PayMode } from "../lib/salary/calculator";
import { formatNumber, formatWon } from "../lib/salary/formatter";
import { DEFAULT_YEAR } from "../lib/salary/insurance";

// 컨트롤 마이크로카피(레이블·단위)만 로컬 dict.
// 페이지 콘텐츠(제목·설명·가이드·FAQ)는 content.ts 레지스트리.
const DICT: Dict = {
  ko: {
    "sc.inputHead": "급여 정보",
    "sc.reset": "초기화",
    "sc.payType": "급여 형태",
    "sc.annual": "연봉",
    "sc.monthly": "월급",
    "sc.amount": "금액",
    "sc.amountPh": "예) 52,000,000",
    "sc.amountPhMonthly": "예) 4,300,000",
    "sc.nonTaxable": "비과세 금액 (월)",
    "sc.dependents": "부양가족 수",
    "sc.dependentsSub": "본인 포함",
    "sc.children": "20세 이하 자녀 수",
    "sc.withholding": "원천징수",
    "sc.netMonthly": "예상 월 실수령액",
    "sc.totalDeduction": "예상 총 공제 (월)",
    "sc.netAnnual": "예상 연 실수령",
    "sc.grossMonthly": "세전 월 급여",
    "sc.breakdown": "공제 상세 (월)",
    "sc.nationalPension": "국민연금",
    "sc.healthInsurance": "건강보험",
    "sc.longTermCare": "장기요양보험",
    "sc.employmentInsurance": "고용보험",
    "sc.incomeTax": "근로소득세",
    "sc.localIncomeTax": "지방소득세",
    "sc.totalRow": "총 공제",
    "sc.netRow": "실수령액",
    "sc.empty": "금액을 입력하면 예상 실수령액이 표시됩니다.",
    "sc.invalid": "0보다 큰 금액을 입력해 주세요.",
    "sc.disclaimer":
      "본 계산 결과는 대한민국 4대보험 및 근로소득 간이세액표를 기반으로 한 예상값입니다. 실제 급여명세서와 차이가 발생할 수 있습니다.",
    "sc.yearNote": "{y}년 요율 기준",
    "sc.won": "원",
    "sc.people": "명",
  },
  en: {
    "sc.inputHead": "Salary details",
    "sc.reset": "Reset",
    "sc.payType": "Pay type",
    "sc.annual": "Annual",
    "sc.monthly": "Monthly",
    "sc.amount": "Amount",
    "sc.amountPh": "e.g. 52,000,000",
    "sc.amountPhMonthly": "e.g. 4,300,000",
    "sc.nonTaxable": "Non-taxable (monthly)",
    "sc.dependents": "Dependents",
    "sc.dependentsSub": "incl. yourself",
    "sc.children": "Children under 20",
    "sc.withholding": "Withholding",
    "sc.netMonthly": "Est. monthly take-home",
    "sc.totalDeduction": "Est. total deductions (monthly)",
    "sc.netAnnual": "Est. yearly take-home",
    "sc.grossMonthly": "Gross monthly pay",
    "sc.breakdown": "Deduction breakdown (monthly)",
    "sc.nationalPension": "National Pension",
    "sc.healthInsurance": "Health Insurance",
    "sc.longTermCare": "Long-Term Care",
    "sc.employmentInsurance": "Employment Insurance",
    "sc.incomeTax": "Income Tax",
    "sc.localIncomeTax": "Local Income Tax",
    "sc.totalRow": "Total deductions",
    "sc.netRow": "Take-home pay",
    "sc.empty": "Enter an amount to see your estimated take-home pay.",
    "sc.invalid": "Please enter an amount greater than 0.",
    "sc.disclaimer":
      "This estimate is based on Korea's four major insurances and the simplified withholding tax table. It may differ from your actual payslip.",
    "sc.yearNote": "Based on {y} rates",
    "sc.won": "KRW",
    "sc.people": "",
  },
};

const DEFAULTS = {
  mode: "annual" as PayMode,
  amount: "",
  nonTaxable: "200,000",
  dependents: 1,
  children: 0,
  withholding: 100 as 80 | 100 | 120,
};

/** 숫자 문자열에서 숫자만 추출 */
function digits(s: string): number {
  const n = parseInt(s.replace(/[^\d]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
}

/** 입력 중 천 단위 콤마 표시 (빈 값은 그대로) */
function withCommas(s: string): string {
  const clean = s.replace(/[^\d]/g, "");
  return clean === "" ? "" : Number(clean).toLocaleString("en-US");
}

export default function SalaryCalculator() {
  const { lang } = useLang();
  const t = useT(DICT);

  const [mode, setMode] = useState<PayMode>(DEFAULTS.mode);
  const [amount, setAmount] = useState(DEFAULTS.amount);
  const [nonTaxable, setNonTaxable] = useState(DEFAULTS.nonTaxable);
  const [dependents, setDependents] = useState(DEFAULTS.dependents);
  const [children, setChildren] = useState(DEFAULTS.children);
  const [withholding, setWithholding] = useState<80 | 100 | 120>(
    DEFAULTS.withholding,
  );

  function reset() {
    setMode(DEFAULTS.mode);
    setAmount(DEFAULTS.amount);
    setNonTaxable(DEFAULTS.nonTaxable);
    setDependents(DEFAULTS.dependents);
    setChildren(DEFAULTS.children);
    setWithholding(DEFAULTS.withholding);
  }

  const amountNum = digits(amount);
  const result = useMemo(
    () =>
      calculateSalary({
        mode,
        amount: amountNum,
        nonTaxable: digits(nonTaxable),
        dependents,
        childrenUnder20: children,
        withholdingRate: withholding,
      }),
    [mode, amountNum, nonTaxable, dependents, children, withholding],
  );

  const hasInput = amount.trim() !== "";
  const invalid = hasInput && amountNum <= 0;

  const rows = result
    ? [
        { k: t("sc.nationalPension"), v: result.deductions.nationalPension },
        { k: t("sc.healthInsurance"), v: result.deductions.healthInsurance },
        { k: t("sc.longTermCare"), v: result.deductions.longTermCare },
        {
          k: t("sc.employmentInsurance"),
          v: result.deductions.employmentInsurance,
        },
        { k: t("sc.incomeTax"), v: result.deductions.incomeTax },
        { k: t("sc.localIncomeTax"), v: result.deductions.localIncomeTax },
      ]
    : [];

  return (
    <>
      <PageHead slug="salary-calculator" />

      <div className="sc-work">
        {/* ── 입력 ── */}
        <div className="fw-inputs">
          <div className="fw-inputs-head">
            <span className="lbl">{t("sc.inputHead")}</span>
            <span className="spacer" />
            <button className="mini-act" onClick={reset}>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M13 8a5 5 0 11-1.5-3.5M13 2v3h-3" />
              </svg>
              <span>{t("sc.reset")}</span>
            </button>
          </div>

          <div className="fw-form">
            <div className="fw-field">
              <span className="fw-field-lbl">{t("sc.payType")}</span>
              <div className="seg sc-seg">
                <button
                  className={mode === "annual" ? "is-active" : ""}
                  onClick={() => setMode("annual")}
                >
                  {t("sc.annual")}
                </button>
                <button
                  className={mode === "monthly" ? "is-active" : ""}
                  onClick={() => setMode("monthly")}
                >
                  {t("sc.monthly")}
                </button>
              </div>
            </div>

            <label className="fw-field">
              <span className="fw-field-lbl">{t("sc.amount")}</span>
              <span className="fw-field-input">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={
                    mode === "annual"
                      ? t("sc.amountPh")
                      : t("sc.amountPhMonthly")
                  }
                  value={amount}
                  onChange={(e) => setAmount(withCommas(e.target.value))}
                />
                <span className="fw-field-suffix">{t("sc.won")}</span>
              </span>
            </label>

            <label className="fw-field">
              <span className="fw-field-lbl">{t("sc.nonTaxable")}</span>
              <span className="fw-field-input">
                <input
                  type="text"
                  inputMode="numeric"
                  value={nonTaxable}
                  onChange={(e) => setNonTaxable(withCommas(e.target.value))}
                />
                <span className="fw-field-suffix">{t("sc.won")}</span>
              </span>
            </label>

            <div className="fw-row fw-row-2">
              <div className="fw-field">
                <span className="fw-field-lbl">
                  {t("sc.dependents")}
                  <span className="sc-lbl-sub"> · {t("sc.dependentsSub")}</span>
                </span>
                <Stepper
                  value={dependents}
                  min={1}
                  onChange={setDependents}
                  suffix={t("sc.people")}
                />
              </div>
              <div className="fw-field">
                <span className="fw-field-lbl">{t("sc.children")}</span>
                <Stepper
                  value={children}
                  min={0}
                  onChange={setChildren}
                  suffix={t("sc.people")}
                />
              </div>
            </div>

            <div className="fw-field">
              <span className="fw-field-lbl">{t("sc.withholding")}</span>
              <div className="seg sc-seg">
                {([80, 100, 120] as const).map((r) => (
                  <button
                    key={r}
                    className={withholding === r ? "is-active" : ""}
                    onClick={() => setWithholding(r)}
                  >
                    {r}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── 결과 ── */}
        <div className="fw-results">
          {!hasInput || invalid ? (
            <div className="sc-placeholder">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 10h18M7 15h4" />
              </svg>
              <p>{invalid ? t("sc.invalid") : t("sc.empty")}</p>
            </div>
          ) : (
            result && (
              <>
                <div className="sc-kpis">
                  <div className="fw-emph-card primary">
                    <div className="ec-label">{t("sc.netMonthly")}</div>
                    <div className="ec-value num">
                      {formatWon(result.netMonthly)}
                    </div>
                    <div className="ec-sub">
                      {t("sc.grossMonthly")} {formatWon(result.monthlyGross)}
                    </div>
                  </div>
                  <div className="fw-emph-card">
                    <div className="ec-label">{t("sc.totalDeduction")}</div>
                    <div className="ec-value num">
                      {formatWon(result.totalDeduction)}
                    </div>
                  </div>
                  <div className="fw-emph-card">
                    <div className="ec-label">{t("sc.netAnnual")}</div>
                    <div className="ec-value num">
                      {formatWon(result.netAnnual)}
                    </div>
                  </div>
                </div>

                <div className="fw-breakdown">
                  <div className="sc-bd-head">
                    <h3>{t("sc.breakdown")}</h3>
                    <span className="sc-year">
                      {t("sc.yearNote").replace("{y}", String(DEFAULT_YEAR))}
                    </span>
                  </div>
                  {rows.map((row) => (
                    <div className="bd-row" key={row.k}>
                      <span className="k">{row.k}</span>
                      <span className="v num">−{formatNumber(row.v)}</span>
                    </div>
                  ))}
                  <div className="bd-row total">
                    <span className="k">{t("sc.totalRow")}</span>
                    <span className="v num">
                      −{formatNumber(result.totalDeduction)}
                    </span>
                  </div>
                  <div className="bd-row total sc-net-row">
                    <span className="k">{t("sc.netRow")}</span>
                    <span className="v num">
                      {formatWon(result.netMonthly)}
                    </span>
                  </div>
                </div>

                <p className="sc-disclaimer">{t("sc.disclaimer")}</p>
              </>
            )
          )}

          <div className="privacy">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M8 1.5l5 2v3.5c0 3-2.1 5.4-5 6.5-2.9-1.1-5-3.5-5-6.5V3.5z" />
              <path d="M6 8l1.5 1.5L10.5 6.5" />
            </svg>
            <span>{t("common.privacy")}</span>
          </div>
        </div>
      </div>

      <ToolGuide slug="salary-calculator" />
      <Faq slug="salary-calculator" />
      <RelatedTools slug="salary-calculator" />
    </>
  );
}

function Stepper({
  value,
  min,
  onChange,
  suffix,
}: {
  value: number;
  min: number;
  onChange: (n: number) => void;
  suffix?: string;
}) {
  const clamp = (n: number) => Math.max(min, Math.min(99, n));
  return (
    <div className="sc-stepper">
      <button
        type="button"
        aria-label="decrease"
        disabled={value <= min}
        onClick={() => onChange(clamp(value - 1))}
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(e) => {
          const n = parseInt(e.target.value.replace(/[^\d]/g, ""), 10);
          onChange(clamp(Number.isFinite(n) ? n : min));
        }}
      />
      {suffix ? <span className="sc-stepper-suffix">{suffix}</span> : null}
      <button
        type="button"
        aria-label="increase"
        onClick={() => onChange(clamp(value + 1))}
      >
        +
      </button>
    </div>
  );
}
