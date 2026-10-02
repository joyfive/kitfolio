/* ============================================================
   연차 계산: 계산 엔진 (UI 비의존)

   근로기준법 제60조의 법정 연차 발생 일수만 계산한다. 회사 취업규칙이
   법정보다 유리하게 정한 연차와 통상임금 산정은 범위 밖이다.

   ── 입사일 기준 (mode = "hire") ─────────────────────────
   · 입사 후 k개월(k = 1~11)을 채운 다음 날 1일 (1년 미만 월 단위 연차)
   · 근속 n년을 채운 다음 날 min(15 + floor((n − 1) ÷ 2), 25)일
   · 출근율 80% 미만인 해의 다음 해에는 그 해 개근 월 수만큼
   · "채운 다음 날"에 재직하고 있어야 발생한다 (1년 + 1일 규칙).

   ── 회계연도 기준 (mode = "fiscal") ──────────────────────
   · 월 단위 연차는 입사일 기준과 같다.
   · 입사 다음 해 1월 1일: 15 × 입사 연도 재직일수 ÷ 365 (비례 연차)
   · 그 다음 해부터 매년 1월 1일: 15일 + 가산. 가산은 그날까지 채운
     입사일 기준 근속 연수로 계산한다 (회계연도 기준 가산 시작 연도는
     행정해석 원문을 확보하지 못해, 퇴사 정산 기준과 같은 입사일 기준을 쓴다).

   ── 기간 계산 (민법 제160조) ────────────────────────────
   k개월 만료일 = 입사일에서 k개월 뒤 같은 날의 전날.
   그 달에 같은 날이 없으면 그 달의 말일. 매번 입사일에서 다시 계산한다.

   모든 계산은 브라우저 안에서만 이루어진다. 서버 전송 없음.
   ============================================================ */

import { ANNUAL_LEAVE_POLICY as P } from "./policy";

export type LeaveMode = "hire" | "fiscal";
export const LEAVE_MODES: LeaveMode[] = ["hire", "fiscal"];

/** 발생 구분: 1년 미만 월 단위 · 정기(15일+가산) · 회계연도 비례 · 출근율 80% 미만 */
export type GrantKind = "monthly" | "annual" | "prorated" | "attendance";

export type Grant = {
  /** 발생일 (YYYY-MM-DD) */
  date: string;
  kind: GrantKind;
  /** 법정 일수 (회계연도 비례는 소수) */
  days: number;
  /** 화면 단위로 환산한 양: 통상 근로자는 일, 단시간 근로자는 시간(1시간 미만 올림) */
  amount: number;
  /** 가산 일수 (annual 만) */
  bonus: number;
  /** monthly: k번째 달 · annual/attendance: 근속 n년 · prorated: 0 */
  index: number;
  /** 이 날까지 쓸 수 있다 (YYYY-MM-DD, 포함) */
  expires: string;
};

export type ExcludedReason = "smallBusiness" | "underWeeklyHours";

export type LeaveInput = {
  mode: LeaveMode;
  /** 입사일 */
  joinDate: string;
  /** 기준일. lastWorkDate 가 있으면 무시하고 마지막 근무일 기준으로 본다. */
  asOf: string;
  /** 마지막 근무일 (퇴사 예정일 때만) */
  lastWorkDate?: string;
  /** 상시 근로자 4명 이하 사업장 */
  smallBusiness?: boolean;
  /** 주 소정근로시간 (기본 40) */
  weeklyHours?: number;
  /** 통상 근로자 주 소정근로시간 (기본 40) */
  fullTimeWeeklyHours?: number;
  /** 출근율 80% 미만인 해: 근속 n년차(1부터)와 그 해 개근 월 수. 입사일 기준에만 적용 */
  lowAttendance?: { year: number; perfectMonths: number };
  /** 현재 유효한 연차 중 이미 사용한 양 (화면 단위) */
  used?: number;
  /** 1일 통상임금 (8시간 기준). 미사용 연차수당 계산용 */
  dailyWage?: number;
};

export type LeaveResult = {
  mode: LeaveMode;
  /** 평가 기준일: 기준일 또는 마지막 근무일 */
  evalDate: string;
  retired: boolean;
  excluded: ExcludedReason | null;
  unit: "day" | "hour";
  /** 단시간 근로자 비율 (통상 근로자면 1) */
  partTimeRatio: number;
  /** 평가일까지 발생한 연차 전체 (발생일 순) */
  accrued: Grant[];
  /** 평가일 이후 다음 발생 (퇴사면 null) */
  next: Grant | null;
  /** 지금까지 발생한 총량 (화면 단위) */
  totalAccrued: number;
  /** 평가일에 아직 소멸하지 않은 양 (사용 전) */
  validBalance: number;
  /** 차감한 사용량 */
  used: number;
  /** 남은 양 */
  remaining: number;
  /** 가장 먼저 소멸하는 남은 연차 */
  nextExpiry: { date: string; amount: number } | null;
  /** 미사용 연차수당 (dailyWage 입력 시) */
  allowance: number | null;
  /** 입사일 기준과 회계연도 기준의 총 발생량 비교 (출근율 80% 미만 지정 시 null) */
  compare: { hire: number; fiscal: number; diff: number } | null;
  /** 구 제3항 차감 규정 적용 가능성이 있는 입사일 (2017-05-30 이전) */
  preAmendment: boolean;
  /** 입사일 기준 근속 기간 (평가일 포함) */
  service: { years: number; months: number; days: number };
};

// ── 날짜 ────────────────────────────────────────────────

const MS_PER_DAY = 86_400_000;

/** "YYYY-MM-DD" → UTC 자정 Date (타임존 영향 제거) */
export function parseDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== mo - 1 || dt.getUTCDate() !== d) {
    return null;
  }
  return dt;
}

export function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * MS_PER_DAY);
}

function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}

/**
 * 입사일부터 k개월 기간의 만료일 (민법 제160조).
 * 제2항: 최후의 월에서 기산일에 해당한 날의 전일
 * 제3항: 최종의 월에 해당일이 없으면 그 월의 말일
 */
export function periodEnd(join: Date, months: number): Date {
  const y = join.getUTCFullYear();
  const m = join.getUTCMonth() + months;
  const day = join.getUTCDate();
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  if (day > lastDay) return new Date(Date.UTC(y, m, lastDay));
  return addDays(new Date(Date.UTC(y, m, day)), -1);
}

/** k개월(또는 12n개월)을 채운 다음 날 = 발생일 */
export function accrualDate(join: Date, months: number): Date {
  return addDays(periodEnd(join, months), 1);
}

/** 근속 n년 정기 연차 일수: min(15 + floor((n − 1) ÷ 2), 25) */
export function annualDays(n: number): number {
  if (n < 1) return 0;
  const bonus = Math.floor((n - 1) / P.bonusEveryYears);
  return Math.min(P.baseDays + bonus, P.maxDays);
}

/** date 까지 채운 근속 연수 (발생일이 date 이하인 n 의 최댓값) */
function completedYears(join: Date, date: Date): number {
  let n = 0;
  while (n < 200 && accrualDate(join, (n + 1) * 12).getTime() <= date.getTime()) n++;
  return n;
}

function splitService(join: Date, end: Date) {
  // 평가일을 포함한 재직 기간: [입사일, 평가일 다음 날)
  const to = addDays(end, 1);
  let years = to.getUTCFullYear() - join.getUTCFullYear();
  let months = to.getUTCMonth() - join.getUTCMonth();
  let days = to.getUTCDate() - join.getUTCDate();
  if (days < 0) {
    months -= 1;
    days += new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 0)).getUTCDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

// ── 발생 이벤트 생성 ─────────────────────────────────────

type RawGrant = Omit<Grant, "amount">;

/** 1년 미만 월 단위 연차 (입사일·회계연도 공통). 80% 미만 1년차면 개근 월 수만큼 */
function monthlyGrants(join: Date, perfectMonths: number): RawGrant[] {
  const firstYearEnd = toIso(periodEnd(join, 12));
  const count = Math.min(perfectMonths, P.firstYearMonthlyMax);
  const out: RawGrant[] = [];
  for (let k = 1; k <= count; k++) {
    out.push({
      date: toIso(accrualDate(join, k)),
      kind: "monthly",
      days: 1,
      bonus: 0,
      index: k,
      expires: firstYearEnd,
    });
  }
  return out;
}

/** 입사일 기준 발생 이벤트. until 이후 첫 정기 발생 하나까지 만든다. */
function hireGrants(join: Date, until: Date, low?: LeaveInput["lowAttendance"]): RawGrant[] {
  const lowYear = low && low.year >= 1 ? low.year : 0;
  const lowMonths = low ? Math.max(0, Math.min(12, Math.floor(low.perfectMonths))) : 0;
  const out = monthlyGrants(join, lowYear === 1 ? lowMonths : P.firstYearMonthlyMax);
  for (let n = 1; n <= 80; n++) {
    const date = accrualDate(join, n * 12);
    const expires = toIso(periodEnd(join, (n + 1) * 12));
    if (n === lowYear) {
      out.push({ date: toIso(date), kind: "attendance", days: lowMonths, bonus: 0, index: n, expires });
    } else {
      const days = annualDays(n);
      out.push({ date: toIso(date), kind: "annual", days, bonus: days - P.baseDays, index: n, expires });
    }
    if (date.getTime() > until.getTime()) break;
  }
  return out;
}

/** 회계연도(1/1 ~ 12/31) 기준 발생 이벤트 */
function fiscalGrants(join: Date, until: Date): RawGrant[] {
  const out = monthlyGrants(join, P.firstYearMonthlyMax);
  const y0 = join.getUTCFullYear();
  const firstYearDays = diffDays(join, new Date(Date.UTC(y0 + 1, 0, 1)));
  for (let y = y0 + 1; y <= y0 + 80; y++) {
    const date = new Date(Date.UTC(y, 0, 1));
    const expires = `${y}-12-31`;
    if (y === y0 + 1) {
      const ratio = Math.min(1, firstYearDays / P.proratedDenominator);
      out.push({ date: toIso(date), kind: "prorated", days: P.baseDays * ratio, bonus: 0, index: 0, expires });
    } else {
      const n = Math.max(1, completedYears(join, date));
      const days = annualDays(n);
      out.push({ date: toIso(date), kind: "annual", days, bonus: days - P.baseDays, index: n, expires });
    }
    if (date.getTime() > until.getTime()) break;
  }
  return out.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

/** 단시간 근로자 시간 환산 (시행령 [별표 2]): 건별로 1시간 미만 올림 */
export function toHours(days: number, ratio: number): number {
  // 부동소수점 오차로 60.0000001 이 61 로 올라가지 않도록 먼저 정리한다.
  const raw = Math.round(days * ratio * P.hoursPerDay * 1e6) / 1e6;
  return Math.ceil(raw);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ── 메인 ─────────────────────────────────────────────────

/**
 * 법정 연차를 계산한다.
 * 날짜가 비었거나 잘못됐거나 평가일이 입사일보다 앞서면 null 을 반환한다.
 */
export function calculateLeave(input: LeaveInput): LeaveResult | null {
  const join = parseDate(input.joinDate);
  if (!join) return null;
  const lastWork = input.lastWorkDate ? parseDate(input.lastWorkDate) : null;
  if (input.lastWorkDate && !lastWork) return null;
  const asOf = lastWork ?? parseDate(input.asOf);
  if (!asOf || asOf.getTime() < join.getTime()) return null;
  const evalDate = asOf;

  const weekly = input.weeklyHours ?? P.fullTimeWeeklyHours;
  const fullTime = input.fullTimeWeeklyHours || P.fullTimeWeeklyHours;
  const partTimeRatio = weekly > 0 && weekly < fullTime ? weekly / fullTime : 1;
  const unit: "day" | "hour" = partTimeRatio < 1 ? "hour" : "day";

  let excluded: ExcludedReason | null = null;
  if (input.smallBusiness) excluded = "smallBusiness";
  else if (weekly < P.minWeeklyHours) excluded = "underWeeklyHours";

  const preAmendment = toIso(join) < P.noDeductionJoinFrom;
  const service = splitService(join, evalDate);

  const withAmount = (g: RawGrant): Grant => ({
    ...g,
    amount: unit === "hour" ? toHours(g.days, partTimeRatio) : g.days,
  });
  const sum = (gs: Grant[]) => round2(gs.reduce((s, g) => s + g.amount, 0));
  const evalIso = toIso(evalDate);

  if (excluded) {
    return {
      mode: input.mode, evalDate: evalIso, retired: !!lastWork, excluded, unit, partTimeRatio,
      accrued: [], next: null, totalAccrued: 0, validBalance: 0, used: 0, remaining: 0,
      nextExpiry: null, allowance: null, compare: null, preAmendment, service,
    };
  }

  const build = (mode: LeaveMode) => {
    const raw =
      mode === "hire" ? hireGrants(join, evalDate, input.lowAttendance) : fiscalGrants(join, evalDate);
    const all = raw.map(withAmount);
    return {
      accrued: all.filter((g) => g.date <= evalIso),
      next: all.find((g) => g.date > evalIso) ?? null,
    };
  };

  const { accrued, next } = build(input.mode);

  // 소멸하지 않은 연차를 발생일 순으로 놓고, 사용량은 먼저 발생한 것부터 차감한다
  // (고용노동부 2018-05 설명자료: 특정 월 발생분을 골라 쓸 수 없다).
  const valid = accrued.filter((g) => g.expires >= evalIso);
  const validBalance = sum(valid);
  const used = Math.min(Math.max(0, input.used ?? 0), validBalance);
  let toDeduct = used;
  let nextExpiry: LeaveResult["nextExpiry"] = null;
  const leftovers = new Map<string, number>();
  for (const g of valid) {
    const take = Math.min(g.amount, toDeduct);
    toDeduct = round2(toDeduct - take);
    const left = round2(g.amount - take);
    if (left > 0) {
      leftovers.set(g.expires, round2((leftovers.get(g.expires) ?? 0) + left));
    }
  }
  if (leftovers.size > 0) {
    const date = [...leftovers.keys()].sort()[0];
    nextExpiry = { date, amount: leftovers.get(date)! };
  }
  const remaining = round2(validBalance - used);

  const wage = input.dailyWage && input.dailyWage > 0 ? input.dailyWage : 0;
  const allowance = wage
    ? Math.round(unit === "hour" ? (remaining * wage) / P.hoursPerDay : remaining * wage)
    : null;

  let compare: LeaveResult["compare"] = null;
  if (!input.lowAttendance) {
    const hire = input.mode === "hire" ? sum(accrued) : sum(build("hire").accrued);
    const fiscal = input.mode === "fiscal" ? sum(accrued) : sum(build("fiscal").accrued);
    compare = { hire, fiscal, diff: round2(hire - fiscal) };
  }

  return {
    mode: input.mode,
    evalDate: evalIso,
    retired: !!lastWork,
    excluded: null,
    unit,
    partTimeRatio,
    accrued,
    next: lastWork ? null : next,
    totalAccrued: sum(accrued),
    validBalance,
    used,
    remaining,
    nextExpiry,
    allowance,
    compare,
    preAmendment,
    service,
  };
}
