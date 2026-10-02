"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Faq from "./Faq";
import ToolGuide from "./ToolGuide";
import RelatedTools from "./RelatedTools";
import PageHead from "./PageHead";
import { useLang, useT, type Dict } from "../lib/i18n";
import {
  calculateLeave,
  LEAVE_MODES,
  type Grant,
  type LeaveMode,
} from "../lib/annualleave/calculator";
import { ANNUAL_LEAVE_POLICY as P } from "../lib/annualleave/policy";
import { ANNUAL_LEAVE_VERIFIED_AT } from "../lib/annualleave/sources";
import { formatWon } from "../lib/salary/formatter";

const SLUG = "annual-leave-calculator";

// 컨트롤 마이크로카피(레이블·단위·도움말)만 로컬 dict.
// 페이지 콘텐츠(제목·설명·가이드·FAQ)는 content.ts 레지스트리.
const DICT: Dict = {
  ko: {
    "al.tabLabel": "부여 기준",
    "al.tab.hire": "입사일 기준",
    "al.tab.fiscal": "회계연도 기준",
    "al.inputHead": "근무 정보",
    "al.reset": "초기화",
    "al.joinDate": "입사일",
    "al.status": "재직 상태",
    "al.status.working": "재직 중",
    "al.status.leaving": "퇴사 예정",
    "al.asOf": "기준일",
    "al.lastWork": "마지막 근무일",
    "al.lastWorkHint": "마지막으로 출근하는 날입니다. 퇴직일(다음 날)은 자동으로 계산합니다.",
    "al.groupWork": "근무 조건",
    "al.weeklyHours": "주 소정근로시간",
    "al.fullTimeHours": "통상 근로자 주 소정근로시간",
    "al.hour": "시간",
    "al.weeklyHint": "40시간보다 적으면 단시간 근로자로 보고 연차를 시간 단위로 계산합니다. 15시간 미만은 연차 적용 대상이 아닙니다.",
    "al.smallBusiness": "상시 근로자 4명 이하 사업장",
    "al.lowAttendance": "출근율 80% 미만인 해",
    "al.lowNone": "없음",
    "al.lowYear": "{n}년차",
    "al.perfectMonths": "그 해 개근한 달 수",
    "al.month": "개월",
    "al.lowHint": "그 해가 끝난 뒤에는 15일 대신 개근한 달 수만큼 연차가 생깁니다.",
    "al.lowFiscal": "출근율 80% 미만 설정은 입사일 기준 탭에서 계산합니다.",
    "al.groupOptional": "사용 · 수당",
    "al.optional": "선택",
    "al.used": "이미 사용한 연차",
    "al.usedHint": "아직 소멸하지 않은 연차 중 사용한 양입니다. 먼저 생긴 연차부터 차감합니다.",
    "al.dailyWage": "1일 통상임금",
    "al.dailyWageHint": "8시간 기준 금액입니다. 넣으면 남은 연차의 수당을 계산합니다.",
    "al.won": "원",
    "al.day": "일",
    "al.empty": "입사일을 입력하면 지금까지 생긴 연차와 다음 발생일이 표시됩니다.",
    "al.remaining": "지금 쓸 수 있는 연차",
    "al.remainingRetired": "퇴사 시 남는 연차",
    "al.remainingSub": "발생 {total} 중 소멸·사용 제외",
    "al.total": "지금까지 발생한 연차",
    "al.totalSub": "근속 {y}년 {m}개월 {d}일",
    "al.next": "다음 발생",
    "al.nextNone": "없음",
    "al.allowance": "미사용 연차수당",
    "al.allowanceSub": "{n} × 1일 통상임금",
    "al.expiry": "{date}까지 쓰지 않으면 {n}이 소멸합니다. 쓰지 못하고 소멸한 연차는 수당 청구 대상입니다(회사가 법정 사용 촉진을 한 경우 제외).",
    "al.preAmendment":
      "2017-05-29 이전 입사자는 1년차에 쓴 연차를 2년차 15일에서 빼던 옛 규정이 적용됐을 수 있습니다. 이 계산기는 현행 규정으로 계산합니다.",
    "al.excluded.smallBusiness":
      "상시 근로자 4명 이하 사업장에는 근로기준법 제60조(연차 유급휴가)가 적용되지 않습니다. 법정 연차 의무는 없으며, 회사 취업규칙이나 근로계약에 정한 휴가를 확인하세요.",
    "al.excluded.underWeeklyHours":
      "4주 평균 주 소정근로시간이 15시간 미만이면 연차 유급휴가가 적용되지 않습니다(근로기준법 제18조 제3항).",
    "al.excludedTitle": "법정 연차 적용 대상이 아닙니다",
    "al.timeline": "발생 내역",
    "al.col.date": "발생일",
    "al.col.kind": "구분",
    "al.col.amount": "발생",
    "al.col.expires": "사용 기한",
    "al.kind.monthly": "1년 미만 월 단위 ({n}회)",
    "al.kind.monthlyNext": "1년 미만 월 단위 ({n}번째)",
    "al.kind.annual": "근속 {n}년",
    "al.kind.annualBonus": "근속 {n}년 · 가산 {b}일",
    "al.kind.prorated": "회계연도 비례",
    "al.kind.attendance": "근속 {n}년 · 출근율 80% 미만",
    "al.expired": "소멸",
    "al.upcoming": "예정",
    "al.proratedNote":
      "비례 연차는 15 × 입사 연도 재직일수 ÷ 365 로 계산한 값을 그대로 표시합니다. 소수점 처리는 회사 규정에 따르되 근로자에게 불리하지 않게 해야 합니다.",
    "al.fiscalBonusNote":
      "회계연도 기준의 가산 연차는 1월 1일까지 채운 입사일 기준 근속 연수로 계산합니다.",
    "al.partTimeNote":
      "단시간 근로자 연차 = 통상 근로자 연차일수 × ({w} ÷ {f}) × 8시간, 1시간 미만은 1시간으로 올립니다.",
    "al.compareTitle": "두 기준의 총 발생 비교",
    "al.compareHire": "입사일 기준",
    "al.compareFiscal": "회계연도 기준",
    "al.settle":
      "회계연도 기준으로 부여받았다면 퇴사할 때 입사일 기준보다 {n} 적어, 그만큼을 수당으로 정산해야 합니다.",
    "al.compareNote":
      "회계연도 기준은 노사 합의가 있을 때 쓸 수 있고, 퇴사할 때 입사일 기준보다 적으면 부족한 만큼 수당으로 보상합니다.",
    "al.severanceLink": "연차수당은 퇴직금 평균임금에도 반영됩니다. 퇴직금 계산기에서 확인하기",
    "al.basisTitle": "계산 기준",
    "al.basisRule": "발생 일수",
    "al.basisRuleValue": "1년 미만 월 1일(최대 11일) · 1년 15일 · 2년마다 1일 가산(25일 한도)",
    "al.basisPeriod": "기간 계산",
    "al.basisPeriodValue": "민법 제160조: 입사일에서 다시 세고, 같은 날이 없으면 그 달 말일",
    "al.basisVerified": "최근 검증",
    "al.basisNote":
      "연차는 기간을 채운 다음 날 재직하고 있어야 생깁니다. 그래서 정확히 1년 일하고 퇴사하면 15일은 생기지 않습니다.",
    "al.disclaimer":
      "이 계산기는 근로기준법이 정한 최소 연차를 계산하는 참고용 도구입니다. 회사 취업규칙이 더 유리하게 정한 휴가, 일 단위 출근 기록, 통상임금 산정은 반영하지 않습니다.",
  },
  en: {
    "al.tabLabel": "Granting basis",
    "al.tab.hire": "Hire date",
    "al.tab.fiscal": "Calendar year",
    "al.inputHead": "Employment details",
    "al.reset": "Reset",
    "al.joinDate": "Start date",
    "al.status": "Status",
    "al.status.working": "Employed",
    "al.status.leaving": "Leaving",
    "al.asOf": "As of",
    "al.lastWork": "Last working day",
    "al.lastWorkHint": "The last day you work. The leaving date (the next day) is worked out for you.",
    "al.groupWork": "Working conditions",
    "al.weeklyHours": "Contracted hours per week",
    "al.fullTimeHours": "Full-time hours per week",
    "al.hour": "h",
    "al.weeklyHint": "Below 40 hours you are treated as part-time and leave is counted in hours. Under 15 hours, statutory annual leave does not apply.",
    "al.smallBusiness": "Workplace with 4 or fewer regular employees",
    "al.lowAttendance": "Year with attendance under 80%",
    "al.lowNone": "None",
    "al.lowYear": "Year {n}",
    "al.perfectMonths": "Months with full attendance that year",
    "al.month": "mo",
    "al.lowHint": "After that year you get one day per fully attended month instead of 15 days.",
    "al.lowFiscal": "The under-80% setting is calculated on the hire date tab.",
    "al.groupOptional": "Usage and pay",
    "al.optional": "optional",
    "al.used": "Leave already used",
    "al.usedHint": "Leave used out of what has not yet expired. The oldest leave is deducted first.",
    "al.dailyWage": "Daily ordinary wage",
    "al.dailyWageHint": "For an 8 hour day. Enter it to see pay for the remaining leave.",
    "al.won": "KRW",
    "al.day": "days",
    "al.empty": "Enter a start date to see the leave earned so far and the next accrual.",
    "al.remaining": "Leave you can use now",
    "al.remainingRetired": "Leave left when you leave",
    "al.remainingSub": "Of {total} earned, after expiry and use",
    "al.total": "Leave earned so far",
    "al.totalSub": "Service {y} y {m} m {d} d",
    "al.next": "Next accrual",
    "al.nextNone": "None",
    "al.allowance": "Pay for unused leave",
    "al.allowanceSub": "{n} × daily ordinary wage",
    "al.expiry": "{n} expire on {date}. Leave you could not use becomes payable after it expires, unless the employer formally promoted its use.",
    "al.preAmendment":
      "If you started on or before 29 May 2017, an older rule that deducted first-year leave from the second year's 15 days may have applied. This calculator uses the current rules.",
    "al.excluded.smallBusiness":
      "Article 60 of the Labor Standards Act (annual paid leave) does not apply to workplaces with 4 or fewer regular employees. There is no statutory annual leave, so check your employment rules or contract.",
    "al.excluded.underWeeklyHours":
      "Annual paid leave does not apply when contracted hours average under 15 a week over 4 weeks (Labor Standards Act, Art. 18(3)).",
    "al.excludedTitle": "Statutory annual leave does not apply",
    "al.timeline": "Accrual history",
    "al.col.date": "Accrued",
    "al.col.kind": "Type",
    "al.col.amount": "Amount",
    "al.col.expires": "Use by",
    "al.kind.monthly": "Monthly, first year (×{n})",
    "al.kind.monthlyNext": "Monthly, first year (no. {n})",
    "al.kind.annual": "Year {n} of service",
    "al.kind.annualBonus": "Year {n} · {b} extra",
    "al.kind.prorated": "Pro rata, calendar year",
    "al.kind.attendance": "Year {n} · attendance under 80%",
    "al.expired": "expired",
    "al.upcoming": "upcoming",
    "al.proratedNote":
      "Pro rata leave is shown as calculated, 15 × days worked in the start year ÷ 365. Your employer's rules decide the rounding, but it must not leave you worse off.",
    "al.fiscalBonusNote":
      "On the calendar-year basis, extra days for long service use the full years completed from your start date by 1 January.",
    "al.partTimeNote":
      "Part-time leave = full-time days × ({w} ÷ {f}) × 8 hours, with any part of an hour rounded up.",
    "al.compareTitle": "Total earned on each basis",
    "al.compareHire": "Hire date",
    "al.compareFiscal": "Calendar year",
    "al.settle":
      "If your leave was granted by calendar year, you have {n} less than the hire date basis when you leave, and that difference must be paid out.",
    "al.compareNote":
      "The calendar-year basis is allowed when agreed with employees. If it gives less than the hire date basis when you leave, the shortfall is paid out.",
    "al.severanceLink": "Leave pay also feeds into the average wage for severance pay. Check the severance pay calculator",
    "al.basisTitle": "Calculation basis",
    "al.basisRule": "Days earned",
    "al.basisRuleValue": "1 per month in year one (max 11) · 15 after a year · +1 every 2 years (max 25)",
    "al.basisPeriod": "Period counting",
    "al.basisPeriodValue": "Civil Act Art. 160: counted from the start date each time, month end if the day is missing",
    "al.basisVerified": "Last verified",
    "al.basisNote":
      "Leave accrues only if you are still employed the day after the period ends, so working exactly one year and leaving does not earn the 15 days.",
    "al.disclaimer":
      "This is a reference tool for the minimum annual leave under Korea's Labor Standards Act. More generous company rules, daily attendance records and ordinary wage calculations are not included.",
  },
};

type Status = "working" | "leaving";

function todayIso(): string {
  const n = new Date();
  const p = (x: number) => String(x).padStart(2, "0");
  return `${n.getFullYear()}-${p(n.getMonth() + 1)}-${p(n.getDate())}`;
}

/** 숫자만 남긴 입력 (소수점 허용 여부 선택) */
function numeric(s: string, decimal = false): string {
  return decimal ? s.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1") : s.replace(/[^\d]/g, "");
}

function withCommas(s: string): string {
  const clean = s.replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "");
  return clean === "" ? "" : Math.min(Number(clean), 1e10).toLocaleString("en-US");
}

/** 소수 둘째 자리까지, 정수면 소수점 없이 */
function fmt(n: number): string {
  return Number.isInteger(n)
    ? n.toLocaleString("en-US")
    : n.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

/** 표에 쓰는 행: 1년 미만 월 단위는 한 줄로 묶는다 */
type Row = {
  key: string;
  date: string;
  kind: string;
  amount: number;
  expires: string;
  state: "valid" | "expired" | "upcoming";
};

export default function AnnualLeaveCalculator() {
  const { lang } = useLang();
  const t = useT(DICT);
  const pathname = usePathname();

  const [mode, setMode] = useState<LeaveMode>("hire");
  const [joinDate, setJoinDate] = useState("");
  const [status, setStatus] = useState<Status>("working");
  const [asOf, setAsOf] = useState("");
  const [lastWork, setLastWork] = useState("");
  const [weeklyHours, setWeeklyHours] = useState("40");
  const [fullTimeHours, setFullTimeHours] = useState("40");
  const [smallBusiness, setSmallBusiness] = useState(false);
  const [lowYear, setLowYear] = useState(0);
  const [perfectMonths, setPerfectMonths] = useState("");
  const [used, setUsed] = useState("");
  const [dailyWage, setDailyWage] = useState("");

  // 기준일 기본값(오늘)과 ?mode= 탭은 마운트 후 클라이언트에서만 반영한다.
  useEffect(() => {
    setAsOf(todayIso());
    const q = new URLSearchParams(window.location.search).get("mode");
    if (q && (LEAVE_MODES as string[]).includes(q)) setMode(q as LeaveMode);
  }, []);

  function switchMode(m: LeaveMode) {
    if (m === mode) return;
    setMode(m);
    window.history.replaceState(null, "", `${pathname}?mode=${m}`);
  }

  function reset() {
    setJoinDate("");
    setStatus("working");
    setAsOf(todayIso());
    setLastWork("");
    setWeeklyHours("40");
    setFullTimeHours("40");
    setSmallBusiness(false);
    setLowYear(0);
    setPerfectMonths("");
    setUsed("");
    setDailyWage("");
  }

  const weekly = parseFloat(weeklyHours);
  const fullTime = parseFloat(fullTimeHours) || P.fullTimeWeeklyHours;
  const lowActive = mode === "hire" && lowYear > 0;

  const result = useMemo(() => {
    if (!joinDate) return null;
    if (status === "leaving" && !lastWork) return null;
    return calculateLeave({
      mode,
      joinDate,
      asOf,
      lastWorkDate: status === "leaving" ? lastWork : undefined,
      smallBusiness,
      weeklyHours: Number.isFinite(weekly) ? weekly : P.fullTimeWeeklyHours,
      fullTimeWeeklyHours: fullTime,
      lowAttendance: lowActive
        ? { year: lowYear, perfectMonths: parseInt(perfectMonths || "0", 10) }
        : undefined,
      used: parseFloat(used) || 0,
      dailyWage: parseInt(dailyWage.replace(/[^\d]/g, "") || "0", 10),
    });
  }, [mode, joinDate, status, asOf, lastWork, smallBusiness, weekly, fullTime, lowActive, lowYear, perfectMonths, used, dailyWage]);

  const unitLabel = result?.unit === "hour" ? t("al.hour") : t("al.day");
  const withUnit = (n: number) => (lang === "ko" ? `${fmt(n)}${unitLabel}` : `${fmt(n)} ${unitLabel}`);

  // 근속 연수 범위: 출근율 80% 미만 연도 선택지
  const serviceYears = result ? result.service.years + 1 : 1;

  const rows: Row[] = useMemo(() => {
    if (!result || result.excluded) return [];
    const evalDate = result.evalDate;
    const label = (g: Grant) => {
      if (g.kind === "annual") {
        return g.bonus > 0
          ? t("al.kind.annualBonus").replace("{n}", String(g.index)).replace("{b}", String(g.bonus))
          : t("al.kind.annual").replace("{n}", String(g.index));
      }
      if (g.kind === "attendance") return t("al.kind.attendance").replace("{n}", String(g.index));
      return t("al.kind.prorated");
    };
    const out: Row[] = [];
    const monthly = result.accrued.filter((g) => g.kind === "monthly");
    if (monthly.length > 0) {
      const first = monthly[0];
      const last = monthly[monthly.length - 1];
      out.push({
        key: "monthly",
        date: monthly.length > 1 ? `${first.date} ~ ${last.date}` : first.date,
        kind: t("al.kind.monthly").replace("{n}", String(monthly.length)),
        amount: monthly.reduce((s, g) => s + g.amount, 0),
        expires: first.expires,
        state: first.expires < evalDate ? "expired" : "valid",
      });
    }
    for (const g of result.accrued) {
      if (g.kind === "monthly") continue;
      out.push({
        key: g.date,
        date: g.date,
        kind: label(g),
        amount: g.amount,
        expires: g.expires,
        state: g.expires < evalDate ? "expired" : "valid",
      });
    }
    if (result.next) {
      const g = result.next;
      out.push({
        key: `next-${g.date}`,
        date: g.date,
        kind:
          g.kind === "monthly"
            ? t("al.kind.monthlyNext").replace("{n}", String(g.index))
            : label(g),
        amount: g.amount,
        expires: g.expires,
        state: "upcoming",
      });
    }
    return out;
  }, [result, t]);

  const hasProrated = !!result?.accrued.some((g) => g.kind === "prorated") ||
    result?.next?.kind === "prorated";
  const severanceHref = `${lang === "en" ? "/en" : ""}/severance-pay-calculator`;

  return (
    <>
      <div className="uc-tabs">
        <div className="uc-tabs-inner">
          <span className="uc-tabs-label">{t("al.tabLabel")}</span>
          {LEAVE_MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`uc-tab${m === mode ? " is-active" : ""}`}
              aria-current={m === mode ? "true" : undefined}
            >
              {t(`al.tab.${m}`)}
            </button>
          ))}
        </div>
      </div>

      <PageHead slug={SLUG} />

      <div className="sv-work al-work">
        {/* ── 입력 ── */}
        <div className="fw-inputs">
          <div className="fw-inputs-head">
            <span className="lbl">{t("al.inputHead")}</span>
            <span className="spacer" />
            <button className="mini-act" onClick={reset}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M13 8a5 5 0 11-1.5-3.5M13 2v3h-3" />
              </svg>
              <span>{t("al.reset")}</span>
            </button>
          </div>

          <div className="fw-form">
            <div className="fw-field">
              <span className="fw-field-lbl">{t("al.status")}</span>
              <div className="seg sc-seg" role="group" aria-label={t("al.status")}>
                {(["working", "leaving"] as Status[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={status === s ? "is-active" : ""}
                    aria-pressed={status === s}
                    onClick={() => setStatus(s)}
                  >
                    {t(`al.status.${s}`)}
                  </button>
                ))}
              </div>
            </div>

            <div className="fw-row fw-row-2">
              <label className="fw-field">
                <span className="fw-field-lbl">{t("al.joinDate")}</span>
                <span className="fw-field-input">
                  <input type="date" value={joinDate} onChange={(e) => setJoinDate(e.target.value)} />
                </span>
              </label>
              {status === "working" ? (
                <label className="fw-field">
                  <span className="fw-field-lbl">{t("al.asOf")}</span>
                  <span className="fw-field-input">
                    <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
                  </span>
                </label>
              ) : (
                <label className="fw-field">
                  <span className="fw-field-lbl">{t("al.lastWork")}</span>
                  <span className="fw-field-input">
                    <input type="date" value={lastWork} onChange={(e) => setLastWork(e.target.value)} />
                  </span>
                </label>
              )}
            </div>
            {status === "leaving" ? <p className="sv-hint">{t("al.lastWorkHint")}</p> : null}

            <p className="fw-group-label">{t("al.groupWork")}</p>

            <div className="fw-row fw-row-2">
              <label className="fw-field">
                <span className="fw-field-lbl">{t("al.weeklyHours")}</span>
                <span className="fw-field-input">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={weeklyHours}
                    onChange={(e) => setWeeklyHours(numeric(e.target.value, true))}
                  />
                  <span className="fw-field-suffix">{t("al.hour")}</span>
                </span>
              </label>
              <label className="fw-field">
                <span className="fw-field-lbl">{t("al.fullTimeHours")}</span>
                <span className="fw-field-input">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={fullTimeHours}
                    onChange={(e) => setFullTimeHours(numeric(e.target.value, true))}
                  />
                  <span className="fw-field-suffix">{t("al.hour")}</span>
                </span>
              </label>
            </div>
            <p className="sv-hint">{t("al.weeklyHint")}</p>

            <div className="fw-checks">
              <label className="fw-check">
                <input
                  type="checkbox"
                  checked={smallBusiness}
                  onChange={(e) => setSmallBusiness(e.target.checked)}
                />
                <span>{t("al.smallBusiness")}</span>
              </label>
            </div>

            {mode === "hire" ? (
              <>
                <div className="fw-row fw-row-2">
                  <label className="fw-field">
                    <span className="fw-field-lbl">
                      {t("al.lowAttendance")}
                      <span className="sv-opt"> · {t("al.optional")}</span>
                    </span>
                    <span className="fw-field-input">
                      <select
                        className="al-select"
                        value={lowYear}
                        onChange={(e) => setLowYear(Number(e.target.value))}
                      >
                        <option value={0}>{t("al.lowNone")}</option>
                        {Array.from({ length: Math.max(1, serviceYears) }, (_, i) => i + 1).map((n) => (
                          <option key={n} value={n}>
                            {t("al.lowYear").replace("{n}", String(n))}
                          </option>
                        ))}
                      </select>
                    </span>
                  </label>
                  {lowYear > 0 ? (
                    <label className="fw-field">
                      <span className="fw-field-lbl">{t("al.perfectMonths")}</span>
                      <span className="fw-field-input">
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="0"
                          value={perfectMonths}
                          onChange={(e) => {
                            const v = numeric(e.target.value);
                            setPerfectMonths(v === "" ? "" : String(Math.min(11, Number(v))));
                          }}
                        />
                        <span className="fw-field-suffix">{t("al.month")}</span>
                      </span>
                    </label>
                  ) : null}
                </div>
                {lowYear > 0 ? <p className="sv-hint">{t("al.lowHint")}</p> : null}
              </>
            ) : (
              <p className="sv-hint">{t("al.lowFiscal")}</p>
            )}

            <p className="fw-group-label">
              {t("al.groupOptional")}
              <span className="sv-opt"> · {t("al.optional")}</span>
            </p>

            <div className="fw-row fw-row-2">
              <label className="fw-field">
                <span className="fw-field-lbl">{t("al.used")}</span>
                <span className="fw-field-input">
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={used}
                    onChange={(e) => setUsed(numeric(e.target.value, true))}
                  />
                  <span className="fw-field-suffix">{unitLabel}</span>
                </span>
              </label>
              <label className="fw-field">
                <span className="fw-field-lbl">{t("al.dailyWage")}</span>
                <span className="fw-field-input">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={lang === "ko" ? "예) 120,000" : "e.g. 120,000"}
                    value={dailyWage}
                    onChange={(e) => setDailyWage(withCommas(e.target.value))}
                  />
                  <span className="fw-field-suffix">{t("al.won")}</span>
                </span>
              </label>
            </div>
            <p className="sv-hint">{t("al.usedHint")} {t("al.dailyWageHint")}</p>
          </div>
        </div>

        {/* ── 결과 ── */}
        <div className="fw-results">
          {!result ? (
            <div className="sc-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 10h18M8 3v4M16 3v4" />
              </svg>
              <p>{t("al.empty")}</p>
            </div>
          ) : result.excluded ? (
            <div className="sv-notice">
              <h3>{t("al.excludedTitle")}</h3>
              <p>{t(`al.excluded.${result.excluded}`)}</p>
            </div>
          ) : (
            <>
              <div className="sv-kpis">
                <div className="fw-emph-card primary">
                  <div className="ec-label">
                    {result.retired ? t("al.remainingRetired") : t("al.remaining")}
                  </div>
                  <div className="ec-value num">{withUnit(result.remaining)}</div>
                  <div className="ec-sub num">
                    {t("al.remainingSub").replace("{total}", withUnit(result.totalAccrued))}
                  </div>
                </div>
                <div className="fw-emph-card">
                  <div className="ec-label">{t("al.total")}</div>
                  <div className="ec-value num">{withUnit(result.totalAccrued)}</div>
                  <div className="ec-sub num">
                    {t("al.totalSub")
                      .replace("{y}", String(result.service.years))
                      .replace("{m}", String(result.service.months))
                      .replace("{d}", String(result.service.days))}
                  </div>
                </div>
                {result.allowance !== null ? (
                  <div className="fw-emph-card">
                    <div className="ec-label">{t("al.allowance")}</div>
                    <div className="ec-value num">{formatWon(result.allowance)}</div>
                    <div className="ec-sub num">
                      {t("al.allowanceSub").replace("{n}", withUnit(result.remaining))}
                    </div>
                  </div>
                ) : (
                  <div className="fw-emph-card">
                    <div className="ec-label">{t("al.next")}</div>
                    <div className="ec-value num">
                      {result.next ? withUnit(result.next.amount) : t("al.nextNone")}
                    </div>
                    {result.next ? <div className="ec-sub num">{result.next.date}</div> : null}
                  </div>
                )}
              </div>

              {result.nextExpiry ? (
                <p className="ft-note">
                  {t("al.expiry")
                    .replace("{date}", result.nextExpiry.date)
                    .replace("{n}", withUnit(result.nextExpiry.amount))}
                </p>
              ) : null}
              {result.preAmendment ? <p className="ft-note">{t("al.preAmendment")}</p> : null}

              <div className="fw-breakdown al-timeline">
                <h3>{t("al.timeline")}</h3>
                <div className="al-table-wrap">
                  <table className="al-table">
                    <thead>
                      <tr>
                        <th scope="col">{t("al.col.date")}</th>
                        <th scope="col">{t("al.col.kind")}</th>
                        <th scope="col" className="r">{t("al.col.amount")}</th>
                        <th scope="col" className="al-exp">{t("al.col.expires")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((r) => (
                        <tr key={r.key} className={`is-${r.state}`}>
                          <td className="num">
                            {r.date}
                            <span className="al-sub">
                              {t("al.col.expires")} {r.expires}
                            </span>
                          </td>
                          <td>
                            {r.kind}
                            {r.state !== "valid" ? (
                              <span className="al-tag">{t(`al.${r.state}`)}</span>
                            ) : null}
                          </td>
                          <td className="num r">{withUnit(r.amount)}</td>
                          <td className="num al-exp">{r.expires}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {hasProrated ? <p className="al-foot">{t("al.proratedNote")}</p> : null}
                {mode === "fiscal" ? <p className="al-foot">{t("al.fiscalBonusNote")}</p> : null}
                {result.unit === "hour" ? (
                  <p className="al-foot num">
                    {t("al.partTimeNote")
                      .replace("{w}", fmt(weekly))
                      .replace("{f}", fmt(fullTime))}
                  </p>
                ) : null}
              </div>

              {result.compare ? (
                <div className="ft-compare">
                  <h3>{t("al.compareTitle")}</h3>
                  <div className="ft-compare-row">
                    <div className={`ft-compare-cell${mode === "hire" ? " is-current" : ""}`}>
                      <span className="k">{t("al.compareHire")}</span>
                      <span className="v num">{withUnit(result.compare.hire)}</span>
                    </div>
                    <div className={`ft-compare-cell${mode === "fiscal" ? " is-current" : ""}`}>
                      <span className="k">{t("al.compareFiscal")}</span>
                      <span className="v num">{withUnit(result.compare.fiscal)}</span>
                    </div>
                  </div>
                  <p>
                    {result.retired && result.compare.diff > 0
                      ? t("al.settle").replace("{n}", withUnit(result.compare.diff))
                      : t("al.compareNote")}
                  </p>
                </div>
              ) : null}

              {result.allowance !== null ? (
                <p className="ft-note">
                  <Link href={severanceHref}>{t("al.severanceLink")}</Link>
                </p>
              ) : null}

              <div className="sc-basis">
                <h3>{t("al.basisTitle")}</h3>
                <dl>
                  <div>
                    <dt>{t("al.basisRule")}</dt>
                    <dd>{t("al.basisRuleValue")}</dd>
                  </div>
                  <div>
                    <dt>{t("al.basisPeriod")}</dt>
                    <dd>{t("al.basisPeriodValue")}</dd>
                  </div>
                  <div>
                    <dt>{t("al.basisVerified")}</dt>
                    <dd className="num">{ANNUAL_LEAVE_VERIFIED_AT}</dd>
                  </div>
                </dl>
                <p>{t("al.basisNote")}</p>
              </div>

              <p className="sc-disclaimer">{t("al.disclaimer")}</p>
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

      <ToolGuide slug={SLUG} />
      <Faq slug={SLUG} />
      <RelatedTools slug={SLUG} />
    </>
  );
}
