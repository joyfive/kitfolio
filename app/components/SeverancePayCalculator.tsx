"use client";

import { useMemo, useState } from "react";
import Faq from "./Faq";
import ToolGuide from "./ToolGuide";
import RelatedTools from "./RelatedTools";
import PageHead from "./PageHead";
import { useLang, useT, type Dict } from "../lib/i18n";
import { calculateSeverance } from "../lib/severance/calculator";
import { SEVERANCE_VERIFIED_AT } from "../lib/severance/sources";
import { formatNumber, formatWon } from "../lib/salary/formatter";

// 컨트롤 마이크로카피(레이블·단위·도움말)만 로컬 dict.
// 페이지 콘텐츠(제목·설명·가이드·FAQ)는 content.ts 레지스트리.
const DICT: Dict = {
  ko: {
    "sv.inputHead": "근무 정보",
    "sv.reset": "초기화",
    "sv.groupWork": "근무 기간",
    "sv.groupWage": "퇴직 전 임금",
    "sv.joinDate": "입사일",
    "sv.lastWorkDate": "마지막 근무일",
    "sv.lastWorkHint": "퇴직일은 마지막 근무일의 다음 날로 자동 계산됩니다.",
    "sv.weeklyHours": "주 평균 소정근로시간",
    "sv.weeklyHoursHint": "4주 평균 주 15시간 이상이어야 법정 퇴직금 대상입니다.",
    "sv.wage3m": "퇴직 전 3개월 임금 총액",
    "sv.wage3mHint":
      "마지막 근무일 이전 3개월 동안 받은 기본급과 각종 수당의 세전 합계. 상여금·연차수당은 아래에 따로 입력합니다.",
    "sv.bonus": "최근 1년간 상여금",
    "sv.bonusHint": "퇴직 전 1년간 지급받은 상여금 총액. 계산에는 3개월분이 반영됩니다.",
    "sv.leave": "연차수당",
    "sv.leaveHint":
      "평균임금에 반영되는 연차수당이 있다면 입력하세요. 실제 반영 여부는 지급 시점과 발생 사유에 따라 달라질 수 있습니다.",
    "sv.ordinary": "1일 통상임금",
    "sv.ordinaryHint":
      "아는 경우에만 입력하세요. 1일 평균임금보다 통상임금이 높으면 통상임금을 기준으로 계산합니다.",
    "sv.optional": "선택",
    "sv.won": "원",
    "sv.hour": "시간",
    "sv.empty": "입사일·마지막 근무일과 퇴직 전 3개월 임금을 입력하면 예상 퇴직금이 표시됩니다.",
    "sv.invalidDate": "마지막 근무일이 입사일보다 빠릅니다. 날짜를 확인해 주세요.",
    "sv.severance": "예상 퇴직금",
    "sv.severanceSub": "세전 예상액입니다. 실제 지급액과 퇴직소득세는 회사의 임금 구성, 평균임금 산정 제외기간, 퇴직급여제도에 따라 달라질 수 있습니다.",
    "sv.avgDaily": "1일 평균임금",
    "sv.appliedDaily": "적용 1일 임금",
    "sv.notEligible": "지급 요건 미충족",
    "sv.notEligibleLead": "입력하신 근로조건은 일반적인 법정 퇴직금 지급 요건에 해당하지 않습니다.",
    "sv.reasonYear": "계속근로기간이 1년 미만입니다 (요건: 1년 이상).",
    "sv.reasonHours": "주 평균 소정근로시간이 15시간 미만입니다 (요건: 4주 평균 주 15시간 이상).",
    "sv.notEligibleNote":
      "아래 값은 참고용 계산 결과입니다. 회사 규정이나 근로계약에 따라 별도의 퇴직급여가 있을 수 있습니다.",
    "sv.detail": "상세 결과",
    "sv.servicePeriod": "계속근로기간",
    "sv.serviceDays": "계속근로일수",
    "sv.retireDate": "퇴직일",
    "sv.avgPeriod": "평균임금 산정기간",
    "sv.periodDays": "산정기간 일수",
    "sv.wage3mRow": "3개월 임금",
    "sv.bonusRow": "상여금 반영액",
    "sv.leaveRow": "연차수당 반영액",
    "sv.wageTotalRow": "산정기간 임금 총액",
    "sv.days": "일",
    "sv.yearUnit": "년",
    "sv.monthUnit": "개월",
    "sv.ordinaryUsed": "통상임금 적용",
    "sv.averageUsed": "평균임금 적용",
    "sv.formulaTitle": "계산 과정",
    "sv.formulaAvg": "1일 평균임금 = 산정기간 임금 총액 ÷ 산정기간 일수",
    "sv.formulaPay": "예상 퇴직금 = 적용 1일 임금 × 30 × 계속근로일수 ÷ 365",
    "sv.basisTitle": "계산 기준",
    "sv.basisRule": "적용 산식",
    "sv.basisRuleValue": "법정 퇴직금 (근로자퇴직급여 보장법)",
    "sv.basisEligibility": "지급 요건",
    "sv.basisEligibilityValue": "1년 이상 · 주 15시간 이상",
    "sv.basisTax": "퇴직소득세",
    "sv.basisTaxValue": "미포함 (세전)",
    "sv.basisVerified": "최근 검증",
    "sv.basisNote":
      "육아휴직, 출산전후휴가, 업무상 재해로 인한 휴업 등 평균임금 산정에서 제외되는 기간이 있으면 계산 방식이 달라질 수 있습니다.",
    "sv.disclaimer":
      "이 계산기는 일반적인 법정 퇴직금 산식을 이용한 참고용 계산입니다. 평균임금 산정 제외기간이 있거나 회사의 퇴직급여제도가 DC형인 경우 실제 금액이 달라질 수 있습니다. 퇴직소득세는 계산하지 않습니다.",
  },
  en: {
    "sv.inputHead": "Employment details",
    "sv.reset": "Reset",
    "sv.groupWork": "Employment period",
    "sv.groupWage": "Pay before leaving",
    "sv.joinDate": "Start date",
    "sv.lastWorkDate": "Last working day",
    "sv.lastWorkHint": "The retirement date is set automatically to the day after your last working day.",
    "sv.weeklyHours": "Contracted hours per week",
    "sv.weeklyHoursHint": "Statutory severance requires an average of 15 hours a week over four weeks.",
    "sv.wage3m": "Total wages, last 3 months",
    "sv.wage3mHint":
      "Gross base pay plus allowances received in the three months before your last working day. Enter bonuses and unused-leave pay separately below.",
    "sv.bonus": "Bonuses, last 12 months",
    "sv.bonusHint": "Total bonuses paid in the year before leaving. Three months' worth is applied.",
    "sv.leave": "Unused annual leave pay",
    "sv.leaveHint":
      "Enter leave pay that counts toward average wage. Whether it counts depends on when and why it was paid.",
    "sv.ordinary": "Daily ordinary wage",
    "sv.ordinaryHint":
      "Only if you know it. If the ordinary wage is higher than the average daily wage, it is used instead.",
    "sv.optional": "optional",
    "sv.won": "KRW",
    "sv.hour": "hrs",
    "sv.empty": "Enter your dates and the wages from your last three months to see the estimate.",
    "sv.invalidDate": "The last working day falls before the start date. Please check the dates.",
    "sv.severance": "Estimated severance pay",
    "sv.severanceSub": "This is a pre-tax estimate. The amount actually paid and the retirement income tax depend on how your pay is structured, on periods excluded from the average wage, and on your employer's retirement benefit plan.",
    "sv.avgDaily": "Average daily wage",
    "sv.appliedDaily": "Daily wage applied",
    "sv.notEligible": "Statutory requirements not met",
    "sv.notEligibleLead": "The conditions you entered do not meet the usual requirements for statutory severance pay.",
    "sv.reasonYear": "Continuous service is under one year (one year or more is required).",
    "sv.reasonHours": "Weekly contracted hours are under 15 (an average of 15 hours a week over four weeks is required).",
    "sv.notEligibleNote":
      "The figures below are shown for reference only. Your employer's own rules or your contract may still provide a retirement benefit.",
    "sv.detail": "Breakdown",
    "sv.servicePeriod": "Continuous service",
    "sv.serviceDays": "Days of service",
    "sv.retireDate": "Retirement date",
    "sv.avgPeriod": "Average wage period",
    "sv.periodDays": "Days in period",
    "sv.wage3mRow": "Wages, 3 months",
    "sv.bonusRow": "Bonus applied",
    "sv.leaveRow": "Leave pay applied",
    "sv.wageTotalRow": "Total wages in period",
    "sv.days": "days",
    "sv.yearUnit": "y",
    "sv.monthUnit": "m",
    "sv.ordinaryUsed": "Ordinary wage applied",
    "sv.averageUsed": "Average wage applied",
    "sv.formulaTitle": "How this was calculated",
    "sv.formulaAvg": "Average daily wage = total wages in period ÷ days in period",
    "sv.formulaPay": "Severance pay = daily wage applied × 30 × days of service ÷ 365",
    "sv.basisTitle": "Calculation basis",
    "sv.basisRule": "Formula",
    "sv.basisRuleValue": "Statutory severance (Employee Retirement Benefit Security Act)",
    "sv.basisEligibility": "Requirements",
    "sv.basisEligibilityValue": "1 year or more · 15 hrs a week or more",
    "sv.basisTax": "Retirement income tax",
    "sv.basisTaxValue": "Not included (pre-tax)",
    "sv.basisVerified": "Last verified",
    "sv.basisNote":
      "If part of the period is excluded from the average wage calculation, such as parental leave, maternity leave or a work injury absence, the method changes.",
    "sv.disclaimer":
      "This is a reference calculation using the standard statutory severance formula. The real amount can differ if part of the period is excluded from the average wage, or if your employer runs a defined contribution (DC) plan. Retirement income tax is not calculated.",
  },
};

const DEFAULTS = {
  joinDate: "",
  lastWorkDate: "",
  weeklyHours: "40",
  wage3m: "",
  bonus: "",
  leave: "",
  ordinary: "",
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

export default function SeverancePayCalculator() {
  const { lang } = useLang();
  const t = useT(DICT);

  const [joinDate, setJoinDate] = useState(DEFAULTS.joinDate);
  const [lastWorkDate, setLastWorkDate] = useState(DEFAULTS.lastWorkDate);
  const [weeklyHours, setWeeklyHours] = useState(DEFAULTS.weeklyHours);
  const [wage3m, setWage3m] = useState(DEFAULTS.wage3m);
  const [bonus, setBonus] = useState(DEFAULTS.bonus);
  const [leave, setLeave] = useState(DEFAULTS.leave);
  const [ordinary, setOrdinary] = useState(DEFAULTS.ordinary);

  function reset() {
    setJoinDate(DEFAULTS.joinDate);
    setLastWorkDate(DEFAULTS.lastWorkDate);
    setWeeklyHours(DEFAULTS.weeklyHours);
    setWage3m(DEFAULTS.wage3m);
    setBonus(DEFAULTS.bonus);
    setLeave(DEFAULTS.leave);
    setOrdinary(DEFAULTS.ordinary);
  }

  const result = useMemo(
    () =>
      calculateSeverance({
        joinDate,
        lastWorkDate,
        weeklyHours: Number(weeklyHours.replace(/[^\d.]/g, "")) || 0,
        wage3m: digits(wage3m),
        annualBonus: digits(bonus),
        annualLeaveAllowance: digits(leave),
        dailyOrdinaryWage: digits(ordinary),
      }),
    [joinDate, lastWorkDate, weeklyHours, wage3m, bonus, leave, ordinary],
  );

  const filled =
    joinDate !== "" && lastWorkDate !== "" && digits(wage3m) > 0;
  // 세 값이 모두 채워졌는데도 결과가 없다면 날짜 순서가 뒤집힌 경우다.
  const dateError = filled && !result;

  const servicePeriod = result
    ? lang === "ko"
      ? `${result.service.years}년 ${result.service.months}개월 ${result.service.days}일`
      : `${result.service.years}y ${result.service.months}m ${result.service.days}d`
    : "";

  const reasonText: Record<string, string> = {
    underOneYear: t("sv.reasonYear"),
    underWeeklyHours: t("sv.reasonHours"),
  };

  return (
    <>
      <PageHead slug="severance-pay-calculator" />

      <div className="sv-work">
        {/* ── 입력 ── */}
        <div className="fw-inputs">
          <div className="fw-inputs-head">
            <span className="lbl">{t("sv.inputHead")}</span>
            <span className="spacer" />
            <button className="mini-act" onClick={reset}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M13 8a5 5 0 11-1.5-3.5M13 2v3h-3" />
              </svg>
              <span>{t("sv.reset")}</span>
            </button>
          </div>

          <div className="fw-form">
            <p className="fw-group-label">{t("sv.groupWork")}</p>

            <div className="fw-row fw-row-2">
              <label className="fw-field">
                <span className="fw-field-lbl">{t("sv.joinDate")}</span>
                <span className="fw-field-input">
                  <input
                    type="date"
                    value={joinDate}
                    onChange={(e) => setJoinDate(e.target.value)}
                  />
                </span>
              </label>
              <label className="fw-field">
                <span className="fw-field-lbl">{t("sv.lastWorkDate")}</span>
                <span className="fw-field-input">
                  <input
                    type="date"
                    value={lastWorkDate}
                    onChange={(e) => setLastWorkDate(e.target.value)}
                  />
                </span>
              </label>
            </div>
            <p className="sv-hint">{t("sv.lastWorkHint")}</p>

            <label className="fw-field">
              <span className="fw-field-lbl">{t("sv.weeklyHours")}</span>
              <span className="fw-field-input">
                <input
                  type="text"
                  inputMode="decimal"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(e.target.value.replace(/[^\d.]/g, ""))}
                />
                <span className="fw-field-suffix">{t("sv.hour")}</span>
              </span>
              <span className="sv-hint">{t("sv.weeklyHoursHint")}</span>
            </label>

            <p className="fw-group-label">{t("sv.groupWage")}</p>

            <label className="fw-field">
              <span className="fw-field-lbl">{t("sv.wage3m")}</span>
              <span className="fw-field-input">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={lang === "ko" ? "예) 12,000,000" : "e.g. 12,000,000"}
                  value={wage3m}
                  onChange={(e) => setWage3m(withCommas(e.target.value))}
                />
                <span className="fw-field-suffix">{t("sv.won")}</span>
              </span>
              <span className="sv-hint">{t("sv.wage3mHint")}</span>
            </label>

            <label className="fw-field">
              <span className="fw-field-lbl">
                {t("sv.bonus")}
                <span className="sv-opt"> · {t("sv.optional")}</span>
              </span>
              <span className="fw-field-input">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={bonus}
                  onChange={(e) => setBonus(withCommas(e.target.value))}
                />
                <span className="fw-field-suffix">{t("sv.won")}</span>
              </span>
              <span className="sv-hint">{t("sv.bonusHint")}</span>
            </label>

            <label className="fw-field">
              <span className="fw-field-lbl">
                {t("sv.leave")}
                <span className="sv-opt"> · {t("sv.optional")}</span>
              </span>
              <span className="fw-field-input">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={leave}
                  onChange={(e) => setLeave(withCommas(e.target.value))}
                />
                <span className="fw-field-suffix">{t("sv.won")}</span>
              </span>
              <span className="sv-hint">{t("sv.leaveHint")}</span>
            </label>

            <label className="fw-field">
              <span className="fw-field-lbl">
                {t("sv.ordinary")}
                <span className="sv-opt"> · {t("sv.optional")}</span>
              </span>
              <span className="fw-field-input">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="0"
                  value={ordinary}
                  onChange={(e) => setOrdinary(withCommas(e.target.value))}
                />
                <span className="fw-field-suffix">{t("sv.won")}</span>
              </span>
              <span className="sv-hint">{t("sv.ordinaryHint")}</span>
            </label>
          </div>
        </div>

        {/* ── 결과 ── */}
        <div className="fw-results">
          {!result ? (
            <div className="sc-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 10h18M7 15h4" />
              </svg>
              <p>{dateError ? t("sv.invalidDate") : t("sv.empty")}</p>
            </div>
          ) : (
            <>
              {result.eligible ? (
                <div className="sv-kpis">
                  <div className="fw-emph-card primary">
                    <div className="ec-label">{t("sv.severance")}</div>
                    <div className="ec-value num">{formatWon(result.severance)}</div>
                    <div className="ec-sub">{t("sv.severanceSub")}</div>
                  </div>
                  <div className="fw-emph-card">
                    <div className="ec-label">{t("sv.avgDaily")}</div>
                    <div className="ec-value num">{formatWon(result.averageDailyWage)}</div>
                  </div>
                  <div className="fw-emph-card">
                    <div className="ec-label">{t("sv.appliedDaily")}</div>
                    <div className="ec-value num">{formatWon(result.appliedDailyWage)}</div>
                    <div className="ec-sub">
                      {result.usedOrdinaryWage ? t("sv.ordinaryUsed") : t("sv.averageUsed")}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="sv-notice">
                  <h3>{t("sv.notEligible")}</h3>
                  <p>{t("sv.notEligibleLead")}</p>
                  <ul>
                    {result.reasons.map((r) => (
                      <li key={r}>{reasonText[r]}</li>
                    ))}
                  </ul>
                  <p className="sv-notice-note">{t("sv.notEligibleNote")}</p>
                </div>
              )}

              <div className="fw-breakdown">
                <h3>{t("sv.detail")}</h3>
                <div className="bd-row">
                  <span className="k">{t("sv.servicePeriod")}</span>
                  <span className="v num">{servicePeriod}</span>
                </div>
                <div className="bd-row">
                  <span className="k">{t("sv.serviceDays")}</span>
                  <span className="v num">
                    {formatNumber(result.serviceDays)}
                    {lang === "ko" ? t("sv.days") : ` ${t("sv.days")}`}
                  </span>
                </div>
                <div className="bd-row">
                  <span className="k">{t("sv.retireDate")}</span>
                  <span className="v num">{result.retireDate}</span>
                </div>
                <div className="bd-row">
                  <span className="k">{t("sv.avgPeriod")}</span>
                  <span className="v num">
                    {result.periodStart} ~ {result.periodEnd}
                  </span>
                </div>
                <div className="bd-row">
                  <span className="k">{t("sv.periodDays")}</span>
                  <span className="v num">
                    {formatNumber(result.periodDays)}
                    {lang === "ko" ? t("sv.days") : ` ${t("sv.days")}`}
                  </span>
                </div>
                <div className="bd-row sub">
                  <span className="k">{t("sv.wage3mRow")}</span>
                  <span className="v num">{formatWon(digits(wage3m))}</span>
                </div>
                <div className="bd-row sub">
                  <span className="k">{t("sv.bonusRow")}</span>
                  <span className="v num">{formatWon(result.bonusApplied)}</span>
                </div>
                <div className="bd-row sub">
                  <span className="k">{t("sv.leaveRow")}</span>
                  <span className="v num">{formatWon(result.leaveApplied)}</span>
                </div>
                <div className="bd-row">
                  <span className="k">{t("sv.wageTotalRow")}</span>
                  <span className="v num">{formatWon(result.wageTotal)}</span>
                </div>
                <div className="bd-row">
                  <span className="k">{t("sv.avgDaily")}</span>
                  <span className="v num">{formatWon(result.averageDailyWage)}</span>
                </div>
                <div className="bd-row">
                  <span className="k">{t("sv.appliedDaily")}</span>
                  <span className="v num">{formatWon(result.appliedDailyWage)}</span>
                </div>
                {result.eligible ? (
                  <div className="bd-row total">
                    <span className="k">{t("sv.severance")}</span>
                    <span className="v num">{formatWon(result.severance)}</span>
                  </div>
                ) : null}
              </div>

              <div className="sv-formula">
                <h3>{t("sv.formulaTitle")}</h3>
                <p className="sv-formula-rule num">{t("sv.formulaAvg")}</p>
                <p className="sv-formula-calc num">
                  {formatNumber(result.wageTotal)} ÷ {formatNumber(result.periodDays)} ={" "}
                  {formatWon(result.averageDailyWage)}
                </p>
                {/* 지급 요건 미충족일 때는 퇴직금 금액을 결론처럼 보여주지 않는다. */}
                {result.eligible ? (
                  <>
                    <p className="sv-formula-rule num">{t("sv.formulaPay")}</p>
                    <p className="sv-formula-calc is-final num">
                      {formatNumber(result.appliedDailyWage)} × 30 ×{" "}
                      {formatNumber(result.serviceDays)} ÷ 365 ={" "}
                      {formatWon(result.severance)}
                    </p>
                  </>
                ) : null}
              </div>

              <div className="sc-basis">
                <h3>{t("sv.basisTitle")}</h3>
                <dl>
                  <div>
                    <dt>{t("sv.basisRule")}</dt>
                    <dd>{t("sv.basisRuleValue")}</dd>
                  </div>
                  <div>
                    <dt>{t("sv.basisEligibility")}</dt>
                    <dd className="num">{t("sv.basisEligibilityValue")}</dd>
                  </div>
                  <div>
                    <dt>{t("sv.basisTax")}</dt>
                    <dd>{t("sv.basisTaxValue")}</dd>
                  </div>
                  <div>
                    <dt>{t("sv.basisVerified")}</dt>
                    <dd className="num">{SEVERANCE_VERIFIED_AT}</dd>
                  </div>
                </dl>
                <p>{t("sv.basisNote")}</p>
              </div>

              <p className="sc-disclaimer">{t("sv.disclaimer")}</p>
            </>
          )}

          <div className="privacy">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 1.5l5 2v3.5c0 3-2.1 5.4-5 6.5-2.9-1.1-5-3.5-5-6.5V3.5z" />
              <path d="M6 8l1.5 1.5L10.5 6.5" />
            </svg>
            <span>{t("common.privacy")}</span>
          </div>
        </div>
      </div>

      <ToolGuide slug="severance-pay-calculator" />
      <Faq slug="severance-pay-calculator" />
      <RelatedTools slug="severance-pay-calculator" />
    </>
  );
}
