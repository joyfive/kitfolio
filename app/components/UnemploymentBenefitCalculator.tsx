"use client";

import { useMemo, useState } from "react";
import Faq from "./Faq";
import ToolGuide from "./ToolGuide";
import RelatedTools from "./RelatedTools";
import PageHead from "./PageHead";
import { useLang, useT, type Dict } from "../lib/i18n";
import {
  calculateUnemployment,
  LEAVE_REASONS,
  type LeaveReason,
} from "../lib/unemployment/calculator";
import { UNEMPLOYMENT_VERIFIED_AT } from "../lib/unemployment/sources";
import { formatNumber, formatWon } from "../lib/salary/formatter";

// 컨트롤 마이크로카피(레이블·단위·도움말)만 로컬 dict.
// 페이지 콘텐츠(제목·설명·가이드·FAQ)는 content.ts 레지스트리.
const DICT: Dict = {
  ko: {
    "ub.inputHead": "퇴사 정보",
    "ub.reset": "초기화",
    "ub.groupLeave": "이직",
    "ub.groupInsured": "나이 · 고용보험 가입기간",
    "ub.groupWage": "퇴직 전 임금",
    "ub.groupMore": "더 정확하게",
    "ub.lastWork": "마지막 근무일",
    "ub.lastWorkHint": "마지막 근무일을 이직일로 봅니다. 수급기간은 그 다음 날부터 12개월입니다.",
    "ub.reason": "이직 사유",
    "ub.reason.involuntary": "권고사직 · 해고 · 계약 만료 · 폐업",
    "ub.reason.justified": "정당한 사유가 있는 자진퇴사",
    "ub.reason.voluntary": "단순 자진퇴사",
    "ub.dailyHours": "1일 소정근로시간",
    "ub.dailyHoursHint": "하한액 계산에 쓰입니다. 1시간 미만은 올림하고(7.5시간 → 8시간), 8시간을 넘으면 8시간으로 봅니다.",
    "ub.over50": "이직일 당시 50세 이상",
    "ub.disabled": "장애인 (50세 이상 기준 적용)",
    "ub.birth": "생년월일",
    "ub.birthHint": "입력하면 이직일 당시 만 나이로 판단하고, 위 50세 체크보다 우선합니다.",
    "ub.insured": "총 피보험기간",
    "ub.insuredHint": "고용보험에 가입한 총기간. 이전 직장도 합산하되, 이전에 실업급여를 받았다면 그 이전 기간은 빼고 입력하세요.",
    "ub.years": "년",
    "ub.months": "개월",
    "ub.wage3m": "퇴직 전 3개월 임금 총액",
    "ub.wage3mHint": "마지막 근무일 이전 3개월 동안 받은 기본급과 각종 수당의 세전 합계. 상여금·연차수당은 아래에 따로 입력합니다.",
    "ub.bonus": "최근 1년간 상여금",
    "ub.leave": "연차수당",
    "ub.ordinary": "1일 통상임금",
    "ub.ordinaryHint": "평균임금보다 통상임금이 높으면 통상임금으로 계산합니다.",
    "ub.recent": "최근 18개월 중 일한 기간",
    "ub.recentHint": "수급 조건(피보험단위기간 180일) 추정에 쓰입니다. 비우면 총 피보험기간으로 추정합니다.",
    "ub.workDays": "주 근무일수",
    "ub.apply": "신청 예정일",
    "ub.applyHint": "이 날 신청하면 받을 수 있는 일수를 계산합니다.",
    "ub.reemploy": "재취업 예정일",
    "ub.reemployHint": "조기재취업수당을 계산합니다.",
    "ub.optional": "선택",
    "ub.won": "원",
    "ub.hour": "시간",
    "ub.day": "일",
    "ub.empty": "마지막 근무일과 퇴직 전 3개월 임금을 입력하면 예상 실업급여가 표시됩니다.",
    "ub.unsupported": "2024년 1월 1일 이후 이직한 경우만 계산합니다.",
    "ub.total": "예상 총 수급액",
    "ub.totalSub": "구직급여일액 × 소정급여일수. 수급 여부와 실제 지급은 고용센터가 결정합니다.",
    "ub.daily": "1일 구직급여",
    "ub.days": "소정급여일수",
    "ub.monthly": "월 환산 (28일)",
    "ub.band.floor": "하한 적용",
    "ub.band.proportional": "임금 비례",
    "ub.band.cap": "상한 적용",
    "ub.row.under50": "50세 미만 기준",
    "ub.row.over50": "50세 이상 · 장애인 기준",
    "ub.warnVoluntary": "단순 자진퇴사는 원칙적으로 실업급여 대상이 아닙니다",
    "ub.warnVoluntaryBody": "아래 금액은 수급 자격이 인정된다고 가정한 참고값입니다. 임금 체불, 통근 곤란, 질병처럼 시행규칙 [별표 2]의 정당한 사유가 있다면 '정당한 사유가 있는 자진퇴사'를 고르세요.",
    "ub.noteJustified": "정당한 이직 사유는 고용센터가 증빙으로 확인합니다. 사유를 보여줄 자료(임금 체불 확인서, 진단서 등)를 준비하세요.",
    "ub.warnUnit": "피보험단위기간 180일에 못 미칠 수 있습니다",
    "ub.warn65": "65세 이후 새로 고용된 경우 구직급여 대상에서 제외됩니다",
    "ub.warn65Body": "65세 전부터 같은 사업장에서 계속 고용된 경우는 대상입니다. 고용센터에 확인하세요.",
    "ub.eligTitle": "수급 조건 확인",
    "ub.eligUnit": "추정 피보험단위기간",
    "ub.eligUnitNote": "주 {d}일 근무 {m}개월 기준 추정치입니다. 주 {d}일 근무자는 180일을 채우려면 약 {n}개월이 필요합니다.",
    "ub.eligUnitFromInsured": "근무 기간을 따로 넣지 않아 총 피보험기간(최대 18개월)으로 추정했습니다.",
    "ub.eligReason": "이직 사유",
    "ub.pass": "충족 추정",
    "ub.fail": "미달 가능",
    "ub.scheduleTitle": "신청 기한",
    "ub.periodStart": "신청 가능 시작",
    "ub.periodEnd": "수급기간 만료",
    "ub.latest": "다 받기 위한 마지막 신청일",
    "ub.slack": "이직 다음 날부터 {n}일 여유",
    "ub.applyRow": "신청 예정일",
    "ub.payStart": "지급 시작 (대기 7일 후)",
    "ub.receivable": "받을 수 있는 일수",
    "ub.lost": "놓치는 일수",
    "ub.tooEarly": "신청은 이직일 다음 날부터 할 수 있습니다. 이직일 다음 날 신청한 것으로 계산했습니다.",
    "ub.scheduleNote": "실제 지급은 실업 인정일 단위라 하루 이틀 차이가 날 수 있습니다. 퇴사 후 되도록 빨리 신청하세요.",
    "ub.earlyTitle": "조기재취업수당",
    "ub.earlyPaid": "재취업 전까지 지급",
    "ub.earlyRemain": "남은 일수",
    "ub.earlyAmount": "예상 조기재취업수당",
    "ub.earlyNo": "남은 일수가 소정급여일수의 절반 미만이라 대상이 아닙니다.",
    "ub.earlyTooSoon": "실업 신고일부터 14일이 지나기 전에 재취업하면 대상이 아닙니다 (대기기간 7일과 별개 요건). {date}부터 재취업하면 대상입니다.",
    "ub.earlyNote": "실업 신고일부터 14일이 지난 뒤 재취업하고, 재취업 후 12개월 이상 계속 일해야 하며, 이직 전 사업주에게 다시 고용된 경우 등은 제외됩니다. 재취업일을 넣고 신청일을 비우면 이직 다음 날 신청을 가정합니다.",
    "ub.detail": "상세 결과",
    "ub.wagePeriod": "평균임금 산정기간",
    "ub.wagePeriodDays": "산정기간 일수",
    "ub.wageTotal": "산정기간 임금 총액",
    "ub.avgDaily": "1일 평균임금",
    "ub.baseDaily": "기초일액",
    "ub.ordinaryUsed": "통상임금 적용",
    "ub.rate60": "기초일액 × 60%",
    "ub.floor": "하한 ({h}시간)",
    "ub.cap": "상한",
    "ub.formulaTitle": "계산 과정",
    "ub.formulaAvg": "1일 평균임금 = 산정기간 임금 총액 ÷ 산정기간 일수",
    "ub.formulaRate": "60% 금액 = min(기초일액, {cap}원) × 60%",
    "ub.formulaFloor": "하한 = 최저임금 {w}원 × {h}시간 × 80%",
    "ub.formulaTotal": "총액 = 구직급여일액 × 소정급여일수",
    "ub.basisTitle": "계산 기준",
    "ub.basisPolicy": "적용 기준",
    "ub.basisPolicyValue": "{y}년 이직자 기준",
    "ub.basisCap": "1일 상한",
    "ub.basisFloor": "1일 하한 (8시간)",
    "ub.basisMinWage": "최저임금 시급",
    "ub.basisVerified": "기준 확인",
    "ub.basisNote": "2026년 9월 보고된 개편안(주 6일 지급 · 상한 하한 연동)은 시행일이 정해지지 않아 반영하지 않았습니다.",
    "ub.disclaimer": "이 계산기는 고용보험법의 일반 산식을 이용한 참고용 계산입니다. 일용근로자, 예술인·노무제공자·자영업자, 연장급여는 반영하지 않으며 수급 자격과 실제 금액은 고용센터가 결정합니다.",
  },
  en: {
    "ub.inputHead": "Leaving details",
    "ub.reset": "Reset",
    "ub.groupLeave": "Leaving",
    "ub.groupInsured": "Age and insured period",
    "ub.groupWage": "Pay before leaving",
    "ub.groupMore": "More precise",
    "ub.lastWork": "Last working day",
    "ub.lastWorkHint": "Your last working day is treated as the leaving date. The benefit period runs 12 months from the next day.",
    "ub.reason": "Reason for leaving",
    "ub.reason.involuntary": "Recommended resignation · dismissal · contract end · closure",
    "ub.reason.justified": "Resignation with a justified reason",
    "ub.reason.voluntary": "Voluntary resignation",
    "ub.dailyHours": "Daily contracted hours",
    "ub.dailyHoursHint": "Used for the floor. Part hours round up (7.5 hours counts as 8), and anything over 8 hours counts as 8.",
    "ub.over50": "Aged 50 or over on the leaving date",
    "ub.disabled": "Person with a disability (50+ row applies)",
    "ub.birth": "Date of birth",
    "ub.birthHint": "If entered, your age on the leaving date is used and overrides the 50+ box.",
    "ub.insured": "Total insured period",
    "ub.insuredHint": "Total time covered by employment insurance. Earlier jobs count, but leave out time before a previous benefit claim.",
    "ub.years": "y",
    "ub.months": "m",
    "ub.wage3m": "Total pay, last 3 months",
    "ub.wage3mHint": "Gross base pay plus allowances in the three months before your last working day. Enter bonuses and leave pay separately below.",
    "ub.bonus": "Bonuses, last 12 months",
    "ub.leave": "Unused annual leave pay",
    "ub.ordinary": "Daily ordinary wage",
    "ub.ordinaryHint": "If higher than the average daily wage, it is used instead.",
    "ub.recent": "Months worked in the last 18",
    "ub.recentHint": "Used to estimate the 180 insured unit days. Leave blank to estimate from the total insured period.",
    "ub.workDays": "Working days a week",
    "ub.apply": "Planned application date",
    "ub.applyHint": "Shows how many days you can receive if you apply that day.",
    "ub.reemploy": "Planned start of new job",
    "ub.reemployHint": "Estimates the early reemployment allowance.",
    "ub.optional": "optional",
    "ub.won": "KRW",
    "ub.hour": "hrs",
    "ub.day": "days",
    "ub.empty": "Enter your last working day and pay for the last three months to see the estimate.",
    "ub.unsupported": "Only leaving dates from 1 January 2024 are supported.",
    "ub.total": "Estimated total benefit",
    "ub.totalSub": "Daily benefit × benefit days. The job center decides eligibility and actual payment.",
    "ub.daily": "Daily benefit",
    "ub.days": "Benefit days",
    "ub.monthly": "Monthly (28 days)",
    "ub.band.floor": "Floor applied",
    "ub.band.proportional": "Pay-based",
    "ub.band.cap": "Cap applied",
    "ub.row.under50": "Under-50 row",
    "ub.row.over50": "50+ and disability row",
    "ub.warnVoluntary": "Voluntary resignation generally does not qualify",
    "ub.warnVoluntaryBody": "The amounts below assume you are found eligible. If you have a justified reason under Annex 2 of the Enforcement Rule, such as unpaid wages, a commute made impractical or illness, choose 'Resignation with a justified reason'.",
    "ub.noteJustified": "The job center checks justified reasons against evidence. Prepare documents such as a confirmation of unpaid wages or a medical certificate.",
    "ub.warnUnit": "You may be short of the 180 insured unit days",
    "ub.warn65": "People newly hired at 65 or over are not covered",
    "ub.warn65Body": "You are covered if you were employed at the same workplace continuously from before 65. Check with the job center.",
    "ub.eligTitle": "Eligibility check",
    "ub.eligUnit": "Estimated insured unit days",
    "ub.eligUnitNote": "Estimated from {m} months at {d} days a week. At {d} days a week, reaching 180 days takes about {n} months.",
    "ub.eligUnitFromInsured": "No months worked were entered, so the total insured period (up to 18 months) was used.",
    "ub.eligReason": "Reason for leaving",
    "ub.pass": "Likely met",
    "ub.fail": "May be short",
    "ub.scheduleTitle": "Application deadline",
    "ub.periodStart": "Can apply from",
    "ub.periodEnd": "Benefit period ends",
    "ub.latest": "Last day to apply and receive every day",
    "ub.slack": "{n} days of slack after the day you leave",
    "ub.applyRow": "Planned application",
    "ub.payStart": "Payment starts (after 7-day wait)",
    "ub.receivable": "Days you can receive",
    "ub.lost": "Days lost",
    "ub.tooEarly": "You can apply from the day after leaving. The calculation assumes you apply that day.",
    "ub.scheduleNote": "Payments follow certification days, so dates can differ by a day or two. Apply as soon as you can after leaving.",
    "ub.earlyTitle": "Early reemployment allowance",
    "ub.earlyPaid": "Paid before the new job",
    "ub.earlyRemain": "Days remaining",
    "ub.earlyAmount": "Estimated allowance",
    "ub.earlyNo": "Fewer than half of your benefit days remain, so the allowance does not apply.",
    "ub.earlyTooSoon": "Starting a new job before 14 days have passed since you registered as unemployed rules out the allowance (a separate rule from the 7-day waiting period). It applies to new jobs from {date}.",
    "ub.earlyNote": "The new job must start after 14 days from registering as unemployed and last 12 months or more, and rehiring by your previous employer is excluded. With no application date, applying the day after leaving is assumed.",
    "ub.detail": "Breakdown",
    "ub.wagePeriod": "Average wage period",
    "ub.wagePeriodDays": "Days in period",
    "ub.wageTotal": "Total pay in period",
    "ub.avgDaily": "Average daily wage",
    "ub.baseDaily": "Base daily wage",
    "ub.ordinaryUsed": "Ordinary wage applied",
    "ub.rate60": "Base daily wage × 60%",
    "ub.floor": "Floor ({h} hrs)",
    "ub.cap": "Cap",
    "ub.formulaTitle": "How this was calculated",
    "ub.formulaAvg": "Average daily wage = total pay in period ÷ days in period",
    "ub.formulaRate": "60% amount = min(base daily wage, KRW {cap}) × 60%",
    "ub.formulaFloor": "Floor = minimum wage KRW {w} × {h} hrs × 80%",
    "ub.formulaTotal": "Total = daily benefit × benefit days",
    "ub.basisTitle": "Calculation basis",
    "ub.basisPolicy": "Rules applied",
    "ub.basisPolicyValue": "Left in {y}",
    "ub.basisCap": "Daily cap",
    "ub.basisFloor": "Daily floor (8 hrs)",
    "ub.basisMinWage": "Minimum hourly wage",
    "ub.basisVerified": "Checked",
    "ub.basisNote": "The reform reported in September 2026 (6-day payment, cap linked to the floor) has no start date yet and is not applied.",
    "ub.disclaimer": "This is a reference calculation using the standard formulas of Korea's Employment Insurance Act. Daily workers, artists, platform and special-type workers, the self-employed and extended benefits are not covered, and the job center decides eligibility and the actual amount.",
  },
};

const DEFAULTS = {
  lastWork: "",
  reason: "involuntary" as LeaveReason,
  dailyHours: "8",
  over50: false,
  disabled: false,
  birth: "",
  insuredYears: "",
  insuredMonths: "",
  wage3m: "",
  bonus: "",
  leave: "",
  ordinary: "",
  recent: "",
  workDays: "5",
  apply: "",
  reemploy: "",
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

function fill(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

export default function UnemploymentBenefitCalculator() {
  const { lang } = useLang();
  const t = useT(DICT);

  const [lastWork, setLastWork] = useState(DEFAULTS.lastWork);
  const [reason, setReason] = useState<LeaveReason>(DEFAULTS.reason);
  const [dailyHours, setDailyHours] = useState(DEFAULTS.dailyHours);
  const [over50, setOver50] = useState(DEFAULTS.over50);
  const [disabled, setDisabled] = useState(DEFAULTS.disabled);
  const [birth, setBirth] = useState(DEFAULTS.birth);
  const [insuredYears, setInsuredYears] = useState(DEFAULTS.insuredYears);
  const [insuredMonths, setInsuredMonths] = useState(DEFAULTS.insuredMonths);
  const [wage3m, setWage3m] = useState(DEFAULTS.wage3m);
  const [bonus, setBonus] = useState(DEFAULTS.bonus);
  const [leave, setLeave] = useState(DEFAULTS.leave);
  const [ordinary, setOrdinary] = useState(DEFAULTS.ordinary);
  const [recent, setRecent] = useState(DEFAULTS.recent);
  const [workDays, setWorkDays] = useState(DEFAULTS.workDays);
  const [apply, setApply] = useState(DEFAULTS.apply);
  const [reemploy, setReemploy] = useState(DEFAULTS.reemploy);

  function reset() {
    setLastWork(DEFAULTS.lastWork);
    setReason(DEFAULTS.reason);
    setDailyHours(DEFAULTS.dailyHours);
    setOver50(DEFAULTS.over50);
    setDisabled(DEFAULTS.disabled);
    setBirth(DEFAULTS.birth);
    setInsuredYears(DEFAULTS.insuredYears);
    setInsuredMonths(DEFAULTS.insuredMonths);
    setWage3m(DEFAULTS.wage3m);
    setBonus(DEFAULTS.bonus);
    setLeave(DEFAULTS.leave);
    setOrdinary(DEFAULTS.ordinary);
    setRecent(DEFAULTS.recent);
    setWorkDays(DEFAULTS.workDays);
    setApply(DEFAULTS.apply);
    setReemploy(DEFAULTS.reemploy);
  }

  const calc = useMemo(
    () =>
      calculateUnemployment({
        lastWorkDate: lastWork,
        wage3m: digits(wage3m),
        annualBonus: digits(bonus),
        annualLeaveAllowance: digits(leave),
        dailyOrdinaryWage: digits(ordinary),
        dailyHours: Number(dailyHours.replace(/[^\d.]/g, "")) || 0,
        insuredMonths: digits(insuredYears) * 12 + digits(insuredMonths),
        over50,
        birthDate: birth || undefined,
        disabled,
        reason,
        recentWorkMonths: digits(recent),
        workDaysPerWeek: digits(workDays),
        applyDate: apply || undefined,
        reemployDate: reemploy || undefined,
      }),
    [
      lastWork, wage3m, bonus, leave, ordinary, dailyHours, insuredYears, insuredMonths,
      over50, birth, disabled, reason, recent, workDays, apply, reemploy,
    ],
  );

  const r = calc.ok ? calc.result : null;
  const daysUnit = (n: number) => (lang === "ko" ? `${formatNumber(n)}${t("ub.day")}` : `${formatNumber(n)} ${t("ub.day")}`);

  return (
    <>
      <PageHead slug="unemployment-benefit-calculator" />

      <div className="sv-work ub-work">
        {/* ── 입력 ── */}
        <div className="fw-inputs">
          <div className="fw-inputs-head">
            <span className="lbl">{t("ub.inputHead")}</span>
            <span className="spacer" />
            <button className="mini-act" onClick={reset}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M13 8a5 5 0 11-1.5-3.5M13 2v3h-3" />
              </svg>
              <span>{t("ub.reset")}</span>
            </button>
          </div>

          <div className="fw-form">
            <p className="fw-group-label">{t("ub.groupLeave")}</p>

            <div className="fw-row fw-row-2">
              <label className="fw-field">
                <span className="fw-field-lbl">{t("ub.lastWork")}</span>
                <span className="fw-field-input">
                  <input type="date" value={lastWork} onChange={(e) => setLastWork(e.target.value)} />
                </span>
              </label>
              <label className="fw-field">
                <span className="fw-field-lbl">{t("ub.dailyHours")}</span>
                <span className="fw-field-input">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={dailyHours}
                    onChange={(e) => setDailyHours(e.target.value.replace(/[^\d.]/g, ""))}
                  />
                  <span className="fw-field-suffix">{t("ub.hour")}</span>
                </span>
              </label>
            </div>
            <p className="sv-hint">{t("ub.lastWorkHint")} {t("ub.dailyHoursHint")}</p>

            <label className="fw-field">
              <span className="fw-field-lbl">{t("ub.reason")}</span>
              <span className="fw-field-input">
                <select
                  className="al-select"
                  value={reason}
                  onChange={(e) => setReason(e.target.value as LeaveReason)}
                >
                  {LEAVE_REASONS.map((k) => (
                    <option key={k} value={k}>
                      {t(`ub.reason.${k}`)}
                    </option>
                  ))}
                </select>
              </span>
            </label>

            <p className="fw-group-label">{t("ub.groupInsured")}</p>

            <div className="fw-row fw-row-2">
              <label className="fw-field">
                <span className="fw-field-lbl">{t("ub.insured")}</span>
                <span className="fw-field-input">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={insuredYears}
                    onChange={(e) => setInsuredYears(e.target.value.replace(/[^\d]/g, ""))}
                  />
                  <span className="fw-field-suffix">{t("ub.years")}</span>
                </span>
              </label>
              <label className="fw-field">
                <span className="fw-field-lbl" aria-hidden="true">&nbsp;</span>
                <span className="fw-field-input">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    aria-label={`${t("ub.insured")} (${t("ub.months")})`}
                    value={insuredMonths}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^\d]/g, "");
                      setInsuredMonths(v === "" ? "" : String(Math.min(11, Number(v))));
                    }}
                  />
                  <span className="fw-field-suffix">{t("ub.months")}</span>
                </span>
              </label>
            </div>
            <p className="sv-hint">{t("ub.insuredHint")}</p>

            <div className="fw-checks">
              <label className="fw-check">
                <input type="checkbox" checked={over50} onChange={(e) => setOver50(e.target.checked)} />
                <span>{t("ub.over50")}</span>
              </label>
              <label className="fw-check">
                <input type="checkbox" checked={disabled} onChange={(e) => setDisabled(e.target.checked)} />
                <span>{t("ub.disabled")}</span>
              </label>
            </div>

            <p className="fw-group-label">{t("ub.groupWage")}</p>

            <label className="fw-field">
              <span className="fw-field-lbl">{t("ub.wage3m")}</span>
              <span className="fw-field-input">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={lang === "ko" ? "예) 9,000,000" : "e.g. 9,000,000"}
                  value={wage3m}
                  onChange={(e) => setWage3m(withCommas(e.target.value))}
                />
                <span className="fw-field-suffix">{t("ub.won")}</span>
              </span>
              <span className="sv-hint">{t("ub.wage3mHint")}</span>
            </label>

            <p className="fw-group-label">
              {t("ub.groupMore")}
              <span className="sv-opt"> · {t("ub.optional")}</span>
            </p>

            <div className="fw-row fw-row-2">
              <label className="fw-field">
                <span className="fw-field-lbl">{t("ub.bonus")}</span>
                <span className="fw-field-input">
                  <input type="text" inputMode="numeric" placeholder="0" value={bonus} onChange={(e) => setBonus(withCommas(e.target.value))} />
                  <span className="fw-field-suffix">{t("ub.won")}</span>
                </span>
              </label>
              <label className="fw-field">
                <span className="fw-field-lbl">{t("ub.leave")}</span>
                <span className="fw-field-input">
                  <input type="text" inputMode="numeric" placeholder="0" value={leave} onChange={(e) => setLeave(withCommas(e.target.value))} />
                  <span className="fw-field-suffix">{t("ub.won")}</span>
                </span>
              </label>
            </div>

            <label className="fw-field">
              <span className="fw-field-lbl">{t("ub.ordinary")}</span>
              <span className="fw-field-input">
                <input type="text" inputMode="numeric" placeholder="0" value={ordinary} onChange={(e) => setOrdinary(withCommas(e.target.value))} />
                <span className="fw-field-suffix">{t("ub.won")}</span>
              </span>
              <span className="sv-hint">{t("ub.ordinaryHint")}</span>
            </label>

            <label className="fw-field">
              <span className="fw-field-lbl">{t("ub.birth")}</span>
              <span className="fw-field-input">
                <input type="date" value={birth} onChange={(e) => setBirth(e.target.value)} />
              </span>
              <span className="sv-hint">{t("ub.birthHint")}</span>
            </label>

            <div className="fw-row fw-row-2">
              <label className="fw-field">
                <span className="fw-field-lbl">{t("ub.recent")}</span>
                <span className="fw-field-input">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0"
                    value={recent}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^\d]/g, "");
                      setRecent(v === "" ? "" : String(Math.min(18, Number(v))));
                    }}
                  />
                  <span className="fw-field-suffix">{t("ub.months")}</span>
                </span>
              </label>
              <label className="fw-field">
                <span className="fw-field-lbl">{t("ub.workDays")}</span>
                <span className="fw-field-input">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={workDays}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^\d]/g, "");
                      setWorkDays(v === "" ? "" : String(Math.min(6, Math.max(1, Number(v)))));
                    }}
                  />
                  <span className="fw-field-suffix">{t("ub.day")}</span>
                </span>
              </label>
            </div>
            <p className="sv-hint">{t("ub.recentHint")}</p>

            <div className="fw-row fw-row-2">
              <label className="fw-field">
                <span className="fw-field-lbl">{t("ub.apply")}</span>
                <span className="fw-field-input">
                  <input type="date" value={apply} onChange={(e) => setApply(e.target.value)} />
                </span>
              </label>
              <label className="fw-field">
                <span className="fw-field-lbl">{t("ub.reemploy")}</span>
                <span className="fw-field-input">
                  <input type="date" value={reemploy} onChange={(e) => setReemploy(e.target.value)} />
                </span>
              </label>
            </div>
            <p className="sv-hint">{t("ub.applyHint")} {t("ub.reemployHint")}</p>
          </div>
        </div>

        {/* ── 결과 ── */}
        <div className="fw-results">
          {!r ? (
            <div className="sc-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 10h18M7 15h4" />
              </svg>
              <p>{!calc.ok && calc.error === "unsupportedDate" ? t("ub.unsupported") : t("ub.empty")}</p>
            </div>
          ) : (
            <>
              {r.eligibility.reason === "voluntary" ? (
                <div className="sv-notice">
                  <h3>{t("ub.warnVoluntary")}</h3>
                  <p>{t("ub.warnVoluntaryBody")}</p>
                </div>
              ) : null}
              {r.eligibility.age65Plus ? (
                <div className="sv-notice">
                  <h3>{t("ub.warn65")}</h3>
                  <p>{t("ub.warn65Body")}</p>
                </div>
              ) : null}

              <div className="sv-kpis">
                <div className="fw-emph-card primary">
                  <div className="ec-label">{t("ub.total")}</div>
                  <div className="ec-value num">{formatWon(r.total)}</div>
                  <div className="ec-sub">{t("ub.totalSub")}</div>
                </div>
                <div className="fw-emph-card">
                  <div className="ec-label">{t("ub.daily")}</div>
                  <div className="ec-value num">{formatWon(r.benefit.daily)}</div>
                  <div className="ec-sub">
                    <span className={`ub-band is-${r.benefit.band}`}>{t(`ub.band.${r.benefit.band}`)}</span>
                  </div>
                </div>
                <div className="fw-emph-card">
                  <div className="ec-label">{t("ub.days")}</div>
                  <div className="ec-value num">{daysUnit(r.benefitDays)}</div>
                  <div className="ec-sub">{r.olderRow ? t("ub.row.over50") : t("ub.row.under50")}</div>
                </div>
              </div>
              <p className="ub-monthly num">
                {t("ub.monthly")} <strong>{formatWon(r.monthly)}</strong>
              </p>

              <div className="fw-breakdown">
                <h3>{t("ub.scheduleTitle")}</h3>
                <div className="bd-row">
                  <span className="k">{t("ub.periodStart")}</span>
                  <span className="v num">{r.schedule.periodStart}</span>
                </div>
                <div className="bd-row">
                  <span className="k">{t("ub.periodEnd")}</span>
                  <span className="v num">{r.schedule.periodEnd}</span>
                </div>
                <div className="bd-row total">
                  <span className="k">{t("ub.latest")}</span>
                  <span className="v num">{r.schedule.latestFullApplyDate}</span>
                </div>
                <p className="al-foot">{fill(t("ub.slack"), { n: r.schedule.slackDays })}</p>
                {r.schedule.apply ? (
                  <>
                    <div className="bd-row">
                      <span className="k">{t("ub.applyRow")}</span>
                      <span className="v num">{r.schedule.apply.date}</span>
                    </div>
                    <div className="bd-row sub">
                      <span className="k">{t("ub.payStart")}</span>
                      <span className="v num">{r.schedule.apply.payStart}</span>
                    </div>
                    <div className="bd-row">
                      <span className="k">{t("ub.receivable")}</span>
                      <span className="v num">{daysUnit(r.schedule.apply.receivableDays)}</span>
                    </div>
                    {r.schedule.apply.lostDays > 0 ? (
                      <div className="bd-row ub-lost">
                        <span className="k">{t("ub.lost")}</span>
                        <span className="v num">
                          {daysUnit(r.schedule.apply.lostDays)} · {formatWon(r.schedule.apply.lostDays * r.benefit.daily)}
                        </span>
                      </div>
                    ) : null}
                    {r.schedule.apply.tooEarly ? <p className="al-foot">{t("ub.tooEarly")}</p> : null}
                  </>
                ) : null}
                <p className="al-foot">{t("ub.scheduleNote")}</p>
              </div>

              <div className="fw-breakdown">
                <h3>{t("ub.eligTitle")}</h3>
                <div className="bd-row">
                  <span className="k">{t("ub.eligUnit")}</span>
                  <span className="v num">
                    {daysUnit(r.eligibility.estimatedUnitDays)}
                    <span className={`al-tag ${r.eligibility.meetsUnitDays ? "" : "ub-tag-warn"}`}>
                      {r.eligibility.meetsUnitDays ? t("ub.pass") : t("ub.fail")}
                    </span>
                  </span>
                </div>
                <p className="al-foot">
                  {fill(t("ub.eligUnitNote"), {
                    d: digits(workDays) || 5,
                    m: r.eligibility.monthsUsed,
                    n: r.eligibility.monthsNeeded,
                  })}
                  {r.eligibility.fromInsuredPeriod ? ` ${t("ub.eligUnitFromInsured")}` : ""}
                </p>
                <div className="bd-row">
                  <span className="k">{t("ub.eligReason")}</span>
                  <span className="v">{t(`ub.reason.${r.eligibility.reason}`)}</span>
                </div>
                {r.eligibility.reason === "justified" ? <p className="al-foot">{t("ub.noteJustified")}</p> : null}
                {!r.eligibility.meetsUnitDays ? <p className="al-foot ub-warn-text">{t("ub.warnUnit")}</p> : null}
              </div>

              {r.early ? (
                <div className="fw-breakdown">
                  <h3>{t("ub.earlyTitle")}</h3>
                  <div className="bd-row">
                    <span className="k">{t("ub.earlyPaid")}</span>
                    <span className="v num">{daysUnit(r.early.paidDays)}</span>
                  </div>
                  <div className="bd-row">
                    <span className="k">{t("ub.earlyRemain")}</span>
                    <span className="v num">{daysUnit(r.early.remainingDays)}</span>
                  </div>
                  {r.early.eligible ? (
                    <div className="bd-row total">
                      <span className="k">{t("ub.earlyAmount")}</span>
                      <span className="v num">{formatWon(r.early.amount)}</span>
                    </div>
                  ) : (
                    <>
                      {r.early.tooSoon ? (
                        <p className="al-foot ub-warn-text">{fill(t("ub.earlyTooSoon"), { date: r.early.earliestDate })}</p>
                      ) : null}
                      {!r.early.enoughRemaining ? <p className="al-foot ub-warn-text">{t("ub.earlyNo")}</p> : null}
                    </>
                  )}
                  <p className="al-foot">{t("ub.earlyNote")}</p>
                </div>
              ) : null}

              <div className="fw-breakdown">
                <h3>{t("ub.detail")}</h3>
                <div className="bd-row">
                  <span className="k">{t("ub.wagePeriod")}</span>
                  <span className="v num">
                    {r.wagePeriodStart} ~ {r.lastWorkDate}
                  </span>
                </div>
                <div className="bd-row">
                  <span className="k">{t("ub.wagePeriodDays")}</span>
                  <span className="v num">{daysUnit(r.wagePeriodDays)}</span>
                </div>
                <div className="bd-row">
                  <span className="k">{t("ub.wageTotal")}</span>
                  <span className="v num">{formatWon(r.wageTotal)}</span>
                </div>
                <div className="bd-row">
                  <span className="k">{t("ub.avgDaily")}</span>
                  <span className="v num">{formatWon(r.benefit.averageDailyWage)}</span>
                </div>
                <div className="bd-row">
                  <span className="k">
                    {t("ub.baseDaily")}
                    {r.benefit.usedOrdinaryWage ? ` · ${t("ub.ordinaryUsed")}` : ""}
                  </span>
                  <span className="v num">{formatWon(r.benefit.baseDaily)}</span>
                </div>
                <div className="bd-row sub">
                  <span className="k">{t("ub.rate60")}</span>
                  <span className="v num">{formatWon(r.benefit.rateAmount)}</span>
                </div>
                <div className="bd-row sub">
                  <span className="k">{fill(t("ub.floor"), { h: r.benefit.floorHours })}</span>
                  <span className="v num">{formatWon(r.benefit.floor)}</span>
                </div>
                <div className="bd-row sub">
                  <span className="k">{t("ub.cap")}</span>
                  <span className="v num">{formatWon(r.benefit.cap)}</span>
                </div>
                <div className="bd-row total">
                  <span className="k">{t("ub.daily")}</span>
                  <span className="v num">{formatWon(r.benefit.daily)}</span>
                </div>
              </div>

              <div className="sv-formula">
                <h3>{t("ub.formulaTitle")}</h3>
                <p className="sv-formula-rule num">{t("ub.formulaAvg")}</p>
                <p className="sv-formula-calc num">
                  {formatNumber(r.wageTotal)} ÷ {formatNumber(r.wagePeriodDays)} = {formatWon(r.benefit.averageDailyWage)}
                </p>
                <p className="sv-formula-rule num">
                  {fill(t("ub.formulaRate"), { cap: formatNumber(r.policy.baseDailyCap) })}
                </p>
                <p className="sv-formula-calc num">
                  {formatNumber(r.benefit.cappedBase)} × 60% = {formatWon(r.benefit.rateAmount)}
                </p>
                <p className="sv-formula-rule num">
                  {fill(t("ub.formulaFloor"), {
                    w: formatNumber(r.policy.minWageHourly),
                    h: r.benefit.floorHours,
                  })}
                </p>
                <p className="sv-formula-calc num">= {formatWon(r.benefit.floor)}</p>
                <p className="sv-formula-rule num">{t("ub.formulaTotal")}</p>
                <p className="sv-formula-calc is-final num">
                  {formatNumber(r.benefit.daily)} × {formatNumber(r.benefitDays)} = {formatWon(r.total)}
                </p>
              </div>

              <div className="sc-basis">
                <h3>{t("ub.basisTitle")}</h3>
                <dl>
                  <div>
                    <dt>{t("ub.basisPolicy")}</dt>
                    <dd className="num">{fill(t("ub.basisPolicyValue"), { y: r.policy.label })}</dd>
                  </div>
                  <div>
                    <dt>{t("ub.basisCap")}</dt>
                    <dd className="num">{formatWon(r.benefit.cap)}</dd>
                  </div>
                  <div>
                    <dt>{t("ub.basisFloor")}</dt>
                    <dd className="num">{formatWon(Math.floor((r.policy.minWageHourly * 8 * 80) / 100))}</dd>
                  </div>
                  <div>
                    <dt>{t("ub.basisMinWage")}</dt>
                    <dd className="num">{formatWon(r.policy.minWageHourly)}</dd>
                  </div>
                  <div>
                    <dt>{t("ub.basisVerified")}</dt>
                    <dd className="num">{UNEMPLOYMENT_VERIFIED_AT}</dd>
                  </div>
                </dl>
                <p>{t("ub.basisNote")}</p>
              </div>

              <p className="sc-disclaimer">{t("ub.disclaimer")}</p>
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

      <ToolGuide slug="unemployment-benefit-calculator" />
      <Faq slug="unemployment-benefit-calculator" />
      <RelatedTools slug="unemployment-benefit-calculator" />
    </>
  );
}
