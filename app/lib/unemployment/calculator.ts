/* ============================================================
   실업급여(구직급여) 계산: 계산 엔진 (UI 비의존)

   ── 산식 ──────────────────────────────────────────────
   기초일액    = max(1일 평균임금, 1일 통상임금), 상한 적용      (고용보험법 제45조)
   60% 금액    = floor(min(기초일액, 상한) × 60%)               (제46조)
   하한        = floor(최저임금 시급 × 1일 소정근로시간 × 80%)   (제46조)
                 소정근로시간은 1시간 미만 끝수를 올림하고 최소 4시간 · 최대 8시간
   구직급여일액 = max(60% 금액, 하한)
   총 예상액   = 구직급여일액 × 소정급여일수                      ([별표 1])

   ── 일정 ──────────────────────────────────────────────
   수급기간    = 이직일 다음 날부터 12개월 (민법 제160조로 만료일 계산)
   대기기간    = 신청일 포함 7일, 지급은 신청일 + 7일부터
   소정급여일수를 다 받을 수 있는 마지막 신청일
               = 수급기간 만료일 − (소정급여일수의 달력 일수 − 1) − 7

   이직일은 마지막 근무일로 본다 (피보험자격 상실일 = 이직일 다음 날).
   평균임금 산정은 퇴직금 계산기와 같은 공용 엔진(app/lib/wage/average.ts).
   정책 값(상한·하한·일수 표)은 policy.ts 가 단일 출처다.

   모든 계산은 브라우저 안에서만 이루어진다. 서버 전송 없음.
   ============================================================ */

import { periodEnd } from "../annualleave/calculator";
import { addDays, averageDailyWage, diffDays, parseDate, toIso } from "../wage/average";
import {
  BENEFIT_DAYS_TABLE,
  EARLY_REEMPLOYMENT,
  ELIGIBILITY,
  EXCLUDED_NEW_HIRE_AGE,
  INSURED_MONTH_BOUNDS,
  OLDER_AGE,
  SCHEDULE,
  policyOn,
  type UnemploymentPolicyPeriod,
} from "./policy";

export type LeaveReason = "involuntary" | "justified" | "voluntary";
export const LEAVE_REASONS: LeaveReason[] = ["involuntary", "justified", "voluntary"];

/** 구직급여일액이 어느 규칙으로 정해졌는가 */
export type BenefitBand = "floor" | "proportional" | "cap";

export type UnemploymentInput = {
  /** 마지막 근무일 = 이직일 (YYYY-MM-DD) */
  lastWorkDate: string;
  /** 마지막 근무일 이전 3개월 임금 총액 (세전, 상여금·연차수당 제외) */
  wage3m: number;
  annualBonus?: number;
  annualLeaveAllowance?: number;
  dailyOrdinaryWage?: number;
  /** 이직 전 1일 소정근로시간 (하한 계산용, 최대 8시간으로 본다) */
  dailyHours: number;
  /** 합산 가능한 총 피보험기간 (개월) */
  insuredMonths: number;
  /** 이직일 당시 50세 이상 (생년월일이 있으면 생년월일이 우선) */
  over50?: boolean;
  /** 생년월일 (YYYY-MM-DD, 선택) */
  birthDate?: string;
  /** 장애인고용촉진법상 장애인: 50세 이상 행 적용 */
  disabled?: boolean;
  reason: LeaveReason;
  /** 최근 18개월 안에 고용보험에 가입해 일한 기간 (개월, 선택) */
  recentWorkMonths?: number;
  /** 주 근무일수 (피보험단위기간 추정용, 기본 5) */
  workDaysPerWeek?: number;
  /** 수급자격 신청 예정일 (선택) */
  applyDate?: string;
  /** 재취업 예정일 (선택) */
  reemployDate?: string;
};

export type DailyBenefit = {
  /** 1일 평균임금 */
  averageDailyWage: number;
  /** 기초일액 (상한 적용 전, 통상임금 비교 후) */
  baseDaily: number;
  usedOrdinaryWage: boolean;
  /** 상한 적용 후 기초일액 */
  cappedBase: number;
  /** cappedBase × 60% */
  rateAmount: number;
  /** 하한 */
  floor: number;
  /** 정액 상한 (상한 기초일액 × 60%) */
  cap: number;
  /** 구직급여일액 */
  daily: number;
  band: BenefitBand;
  /** 하한 계산에 쓴 1일 소정근로시간 */
  floorHours: number;
};

export type Eligibility = {
  /** 추정 피보험단위기간 (일). 근무 기간 입력이 없으면 총 피보험기간으로 추정 */
  estimatedUnitDays: number;
  /** 추정에 쓴 근무 기간 (개월, 최대 18) */
  monthsUsed: number;
  /** 근무 기간을 따로 입력하지 않아 총 피보험기간으로 추정했는가 */
  fromInsuredPeriod: boolean;
  /** 주 근무일수 기준 180일에 필요한 개월 수 */
  monthsNeeded: number;
  meetsUnitDays: boolean;
  reason: LeaveReason;
  /** 생년월일로 판단한 65세 이상 여부 (생년월일이 없으면 false) */
  age65Plus: boolean;
};

export type Schedule = {
  /** 신청 가능 시작일 = 이직일 다음 날 */
  periodStart: string;
  /** 수급기간 만료일 */
  periodEnd: string;
  /** 소정급여일수를 모두 받을 수 있는 마지막 신청일 */
  latestFullApplyDate: string;
  /** 이직일 다음 날부터 마지막 신청일까지 여유 (일) */
  slackDays: number;
  /** 신청 예정일을 넣었을 때 */
  apply?: {
    date: string;
    /** 지급 시작일 = 신청일 + 7일 */
    payStart: string;
    receivableDays: number;
    lostDays: number;
    /** 신청일이 이직일 다음 날보다 빠르다 */
    tooEarly: boolean;
  };
};

export type EarlyReemployment = {
  date: string;
  /** 재취업 전날까지 지급된 것으로 보는 일수 */
  paidDays: number;
  remainingDays: number;
  /** 남은 일수가 소정급여일수의 1/2 이상인가 */
  enoughRemaining: boolean;
  /** 실업 신고일부터 14일이 지나기 전에 재취업했는가 */
  tooSoon: boolean;
  /** 14일 요건을 채우는 가장 이른 재취업일 */
  earliestDate: string;
  /** 두 요건을 모두 채웠는가 */
  eligible: boolean;
  amount: number;
};

export type UnemploymentResult = {
  policy: UnemploymentPolicyPeriod;
  lastWorkDate: string;
  wagePeriodStart: string;
  wagePeriodDays: number;
  wageTotal: number;
  bonusApplied: number;
  leaveApplied: number;
  benefit: DailyBenefit;
  /** 이직일 당시 나이 (생년월일이 있을 때만) */
  age?: number;
  /** 소정급여일수 표에서 50세 이상 행을 썼는가 */
  olderRow: boolean;
  insuredMonths: number;
  benefitDays: number;
  total: number;
  /** 월 환산 (28일) */
  monthly: number;
  eligibility: Eligibility;
  schedule: Schedule;
  early?: EarlyReemployment;
};

/** 계산 실패 사유 (null 대신 UI 가 구분해 안내) */
export type UnemploymentError = "input" | "unsupportedDate";

function pos(n: number | undefined): number {
  return Number.isFinite(n) && (n as number) > 0 ? (n as number) : 0;
}

/** 이직일 당시 만 나이 */
export function ageOn(birth: Date, on: Date): number {
  let age = on.getUTCFullYear() - birth.getUTCFullYear();
  const beforeBirthday =
    on.getUTCMonth() < birth.getUTCMonth() ||
    (on.getUTCMonth() === birth.getUTCMonth() && on.getUTCDate() < birth.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

/** [별표 1] 소정급여일수 */
export function benefitDaysFor(insuredMonths: number, older: boolean): number {
  const row = older ? BENEFIT_DAYS_TABLE.over50 : BENEFIT_DAYS_TABLE.under50;
  let i = 0;
  while (i < INSURED_MONTH_BOUNDS.length && insuredMonths >= INSURED_MONTH_BOUNDS[i]) i += 1;
  return row[i];
}

/** 구직급여일액: 60% · 상한 · 하한 */
export function dailyBenefit(
  policy: UnemploymentPolicyPeriod,
  averageDaily: number,
  ordinaryDaily: number,
  dailyHours: number,
): DailyBenefit {
  const usedOrdinaryWage = ordinaryDaily > averageDaily;
  const baseDaily = usedOrdinaryWage ? ordinaryDaily : averageDaily;
  // 1시간 미만 끝수는 올림 (7.5시간 → 8시간). 입력 소수 오차로 7시간이 8시간이 되지 않게 여유를 둔다.
  const hours = pos(dailyHours) ? Math.ceil(pos(dailyHours) - 1e-9) : policy.maxFloorHours;
  const floorHours = Math.min(Math.max(hours, policy.minFloorHours), policy.maxFloorHours);
  // 원 미만 절사. 정수 연산으로 부동소수 오차를 피한다 (113,500 × 0.6 = 68,100).
  const pct = (n: number, rate: number) => Math.floor((n * Math.round(rate * 100)) / 100);
  const floor = pct(policy.minWageHourly * floorHours, policy.floorRate);
  const cap =
    policy.upperRule.kind === "fixed"
      ? pct(policy.baseDailyCap, policy.replacementRate)
      : Math.floor(floor * policy.upperRule.ratio);
  const cappedBase = Math.min(baseDaily, policy.baseDailyCap);
  const rateAmount = Math.min(pct(cappedBase, policy.replacementRate), cap);

  let band: BenefitBand;
  let daily: number;
  if (rateAmount < floor) {
    band = "floor";
    daily = floor;
  } else if (rateAmount >= cap) {
    band = "cap";
    daily = cap;
  } else {
    band = "proportional";
    daily = rateAmount;
  }
  return {
    averageDailyWage: averageDaily,
    baseDaily,
    usedOrdinaryWage,
    cappedBase,
    rateAmount,
    floor,
    cap,
    daily,
    band,
    floorHours,
  };
}

/** 지급일 수를 달력 일수로 바꾼다 (주 7일 지급이면 같다) */
export function calendarDaysFor(paidDays: number, paidDaysPerWeek: number): number {
  return paidDaysPerWeek >= 7 ? paidDays : Math.ceil((paidDays * 7) / paidDaysPerWeek);
}

/** 달력 일수 안에 지급되는 일수 */
function paidDaysWithin(calendarDays: number, paidDaysPerWeek: number): number {
  if (calendarDays <= 0) return 0;
  if (paidDaysPerWeek >= 7) return calendarDays;
  const weeks = Math.floor(calendarDays / 7);
  return weeks * paidDaysPerWeek + Math.min(calendarDays % 7, paidDaysPerWeek);
}

/** 주 근무일수 기준 피보험단위기간 추정: 근무 주 수 × (근무일 + 유급 주휴일 1) */
export function estimateUnitDays(months: number, workDaysPerWeek: number): number {
  const perWeek = Math.min(Math.max(Math.round(workDaysPerWeek), 1) + 1, 7);
  return Math.floor(((months * 365) / 12 / 7) * perWeek);
}

/** 180일을 채우는 데 필요한 개월 수 (정수, 올림) */
export function monthsForUnitDays(workDaysPerWeek: number): number {
  for (let m = 1; m <= ELIGIBILITY.baseMonths; m += 1) {
    if (estimateUnitDays(m, workDaysPerWeek) >= ELIGIBILITY.minInsuredUnitDays) return m;
  }
  return ELIGIBILITY.baseMonths;
}

export function calculateUnemployment(
  input: UnemploymentInput,
): { ok: true; result: UnemploymentResult } | { ok: false; error: UnemploymentError } {
  const lastWork = parseDate(input.lastWorkDate);
  if (!lastWork || pos(input.wage3m) <= 0) return { ok: false, error: "input" };
  const policy = policyOn(input.lastWorkDate);
  if (!policy) return { ok: false, error: "unsupportedDate" };

  const avg = averageDailyWage({
    lastWork,
    wage3m: input.wage3m,
    annualBonus: input.annualBonus,
    annualLeaveAllowance: input.annualLeaveAllowance,
  });
  if (!avg) return { ok: false, error: "input" };

  const benefit = dailyBenefit(
    policy,
    avg.averageDailyWage,
    Math.round(pos(input.dailyOrdinaryWage)),
    input.dailyHours,
  );

  // ── 소정급여일수 ──
  const birth = input.birthDate ? parseDate(input.birthDate) : null;
  const age = birth ? ageOn(birth, lastWork) : undefined;
  const olderByAge = age !== undefined ? age >= OLDER_AGE : !!input.over50;
  const olderRow = olderByAge || !!input.disabled;
  const insuredMonths = Math.floor(pos(input.insuredMonths));
  const benefitDays = benefitDaysFor(insuredMonths, olderRow);
  const total = benefit.daily * benefitDays;
  const monthly = benefit.daily * SCHEDULE.certificationCycleDays;

  // ── 수급 자격 (추정) ──
  const recent = pos(input.recentWorkMonths);
  const fromInsuredPeriod = recent === 0;
  const monthsUsed = Math.min(fromInsuredPeriod ? insuredMonths : recent, ELIGIBILITY.baseMonths);
  const workDays = pos(input.workDaysPerWeek) || 5;
  const estimatedUnitDays = estimateUnitDays(monthsUsed, workDays);
  const eligibility: Eligibility = {
    estimatedUnitDays,
    monthsUsed,
    fromInsuredPeriod,
    monthsNeeded: monthsForUnitDays(workDays),
    meetsUnitDays: estimatedUnitDays >= ELIGIBILITY.minInsuredUnitDays,
    reason: input.reason,
    age65Plus: age !== undefined && age >= EXCLUDED_NEW_HIRE_AGE,
  };

  // ── 일정 ──
  const start = addDays(lastWork, 1);
  const end = periodEnd(start, SCHEDULE.benefitPeriodMonths);
  const needCalendar = calendarDaysFor(benefitDays, policy.paidDaysPerWeek);
  const latest = addDays(end, -(needCalendar - 1) - SCHEDULE.waitingDays);
  const schedule: Schedule = {
    periodStart: toIso(start),
    periodEnd: toIso(end),
    latestFullApplyDate: toIso(latest),
    slackDays: Math.max(diffDays(start, latest), 0),
  };

  const applyDate = input.applyDate ? parseDate(input.applyDate) : null;
  // 재취업 계산은 신청일이 없으면 이직일 다음 날 신청을 가정한다.
  const applyBase = applyDate && diffDays(start, applyDate) >= 0 ? applyDate : start;
  const payStart = addDays(applyBase, SCHEDULE.waitingDays);
  if (applyDate) {
    const tooEarly = diffDays(start, applyDate) < 0;
    const receivable = Math.min(
      paidDaysWithin(diffDays(payStart, end) + 1, policy.paidDaysPerWeek),
      benefitDays,
    );
    schedule.apply = {
      date: toIso(applyDate),
      payStart: toIso(payStart),
      receivableDays: receivable,
      lostDays: benefitDays - receivable,
      tooEarly,
    };
  }

  // ── 조기재취업수당 ──
  let early: EarlyReemployment | undefined;
  const reemploy = input.reemployDate ? parseDate(input.reemployDate) : null;
  if (reemploy && diffDays(start, reemploy) >= 0) {
    const paidDays = Math.min(
      paidDaysWithin(diffDays(payStart, reemploy), policy.paidDaysPerWeek),
      benefitDays,
    );
    const remainingDays = benefitDays - paidDays;
    const enoughRemaining = remainingDays >= benefitDays * EARLY_REEMPLOYMENT.minRemainingRatio;
    const tooSoon = diffDays(applyBase, reemploy) < EARLY_REEMPLOYMENT.minDaysAfterApply;
    const eligible = enoughRemaining && !tooSoon;
    early = {
      date: toIso(reemploy),
      paidDays,
      remainingDays,
      enoughRemaining,
      tooSoon,
      earliestDate: toIso(addDays(applyBase, EARLY_REEMPLOYMENT.minDaysAfterApply)),
      eligible,
      amount: eligible
        ? Math.floor(remainingDays * benefit.daily * EARLY_REEMPLOYMENT.payRatio)
        : 0,
    };
  }

  return {
    ok: true,
    result: {
      policy,
      lastWorkDate: toIso(lastWork),
      wagePeriodStart: toIso(avg.periodStart),
      wagePeriodDays: avg.periodDays,
      wageTotal: avg.wageTotal,
      bonusApplied: avg.bonusApplied,
      leaveApplied: avg.leaveApplied,
      benefit,
      age,
      olderRow,
      insuredMonths,
      benefitDays,
      total,
      monthly,
      eligibility,
      schedule,
      early,
    },
  };
}
