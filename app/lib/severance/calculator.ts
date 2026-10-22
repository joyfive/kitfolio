/* ============================================================
   퇴직금 계산: 계산 엔진 (UI 비의존)

   법정 퇴직금(세전) 예상액만 계산한다. 퇴직소득세와 IRP 운용수익은
   범위 밖이며, 도구 하단 가이드에서 글로 설명한다.

   ── 산식 ──────────────────────────────────────────────
   1일 평균임금 = (3개월 임금 + 연간 상여금 × 3/12 + 연차수당 × 3/12)
                  ÷ 평균임금 산정기간 총일수
   적용 1일 임금 = max(1일 평균임금, 입력한 1일 통상임금)
   예상 퇴직금   = 적용 1일 임금 × 30 × 계속근로일수 ÷ 365

   ── 날짜 처리 ─────────────────────────────────────────
   사용자에게는 "마지막 근무일"만 받고, 퇴직일은 그 다음 날로 내부에서
   계산한다 (고용노동부 계산기가 요구하는 "퇴직일 = 마지막 근무일의 다음 날"을
   사용자가 직접 환산하지 않도록 한다).
   평균임금 산정기간은 퇴직일 직전 3개월: [퇴직일 - 3개월, 마지막 근무일].

   평균임금 산정은 app/lib/wage/average.ts 공용 엔진을 쓴다
   (실업급여 계산기의 구직급여 기초일액과 같은 계산).

   모든 계산은 브라우저 안에서만 이루어진다. 서버 전송 없음.
   ============================================================ */

import {
  averageDailyWage,
  diffDays,
  parseDate,
  toIso,
} from "../wage/average";

export { toIso };

/** 법정 퇴직금 지급 요건: 계속근로기간 1년 이상 */
export const MIN_SERVICE_DAYS = 365;
/** 법정 퇴직금 지급 요건: 4주 평균 1주 소정근로시간 15시간 이상 */
export const MIN_WEEKLY_HOURS = 15;

export type SeveranceInput = {
  /** 입사일 (YYYY-MM-DD) */
  joinDate: string;
  /** 마지막 근무일 (YYYY-MM-DD). 퇴직일은 이 날의 다음 날로 계산한다. */
  lastWorkDate: string;
  /** 주 평균 소정근로시간 */
  weeklyHours: number;
  /** 퇴직 전 3개월 임금 총액 (세전, 상여금·연차수당 제외) */
  wage3m: number;
  /** 최근 1년간 상여금 총액 (없으면 0) */
  annualBonus: number;
  /** 연차수당 (없으면 0) */
  annualLeaveAllowance: number;
  /** 1일 통상임금 (아는 경우에만. 0 또는 생략 시 평균임금만 사용) */
  dailyOrdinaryWage?: number;
};

/** 지급 요건 미충족 사유 */
export type IneligibleReason = "underOneYear" | "underWeeklyHours";

export type SeveranceResult = {
  /** 퇴직일 = 마지막 근무일 + 1일 (YYYY-MM-DD) */
  retireDate: string;
  /** 계속근로기간: 연·월·일 */
  service: { years: number; months: number; days: number };
  /** 계속근로일수 (퇴직일 - 입사일) */
  serviceDays: number;
  /** 평균임금 산정기간 시작일 (YYYY-MM-DD) */
  periodStart: string;
  /** 평균임금 산정기간 종료일 = 마지막 근무일 (YYYY-MM-DD) */
  periodEnd: string;
  /** 산정기간 총일수 (달력 기준) */
  periodDays: number;
  /** 평균임금에 반영된 상여금 (연간 상여금의 3개월분) */
  bonusApplied: number;
  /** 평균임금에 반영된 연차수당 (연차수당의 3개월분) */
  leaveApplied: number;
  /** 산정기간 임금 총액 (3개월 임금 + 상여 반영액 + 연차 반영액) */
  wageTotal: number;
  /** 1일 평균임금 (원 단위 반올림) */
  averageDailyWage: number;
  /** 적용 1일 임금: 평균임금과 통상임금 중 큰 값 */
  appliedDailyWage: number;
  /** 통상임금이 평균임금보다 커서 통상임금을 적용했는가 */
  usedOrdinaryWage: boolean;
  /** 예상 퇴직금 (세전, 원 단위 반올림) */
  severance: number;
  /** 법정 퇴직금 지급 요건 충족 여부 */
  eligible: boolean;
  /** 미충족 사유 (eligible=true 면 빈 배열) */
  reasons: IneligibleReason[];
};

/** 두 날짜 사이를 연·월·일로 분해 (from 포함, to 미포함 = 재직일수와 같은 기준) */
function splitDuration(from: Date, to: Date) {
  let years = to.getUTCFullYear() - from.getUTCFullYear();
  let months = to.getUTCMonth() - from.getUTCMonth();
  let days = to.getUTCDate() - from.getUTCDate();

  if (days < 0) {
    months -= 1;
    const prevMonthDays = new Date(
      Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), 0),
    ).getUTCDate();
    days += prevMonthDays;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

function toNumber(n: number | undefined): number {
  return Number.isFinite(n) && (n as number) > 0 ? (n as number) : 0;
}

/**
 * 예상 법정 퇴직금(세전)을 계산한다.
 * 입력이 비었거나 날짜가 뒤집혔거나 임금이 0이면 null 을 반환한다.
 */
export function calculateSeverance(
  input: SeveranceInput,
): SeveranceResult | null {
  const join = parseDate(input.joinDate);
  const lastWork = parseDate(input.lastWorkDate);
  if (!join || !lastWork) return null;
  if (diffDays(join, lastWork) < 0) return null;

  const avg = averageDailyWage({
    lastWork,
    join,
    wage3m: input.wage3m,
    annualBonus: input.annualBonus,
    annualLeaveAllowance: input.annualLeaveAllowance,
    dailyOrdinaryWage: input.dailyOrdinaryWage,
  });
  if (!avg) return null;

  // 퇴직일 = 마지막 근무일 다음 날
  const retire = avg.eventDate;
  const serviceDays = diffDays(join, retire);
  const appliedDailyWage = avg.appliedDailyWage;

  const severance = Math.round((appliedDailyWage * 30 * serviceDays) / 365);

  const reasons: IneligibleReason[] = [];
  if (serviceDays < MIN_SERVICE_DAYS) reasons.push("underOneYear");
  if (toNumber(input.weeklyHours) < MIN_WEEKLY_HOURS) {
    reasons.push("underWeeklyHours");
  }

  return {
    retireDate: toIso(retire),
    service: splitDuration(join, retire),
    serviceDays,
    periodStart: toIso(avg.periodStart),
    periodEnd: toIso(avg.periodEnd),
    periodDays: avg.periodDays,
    bonusApplied: avg.bonusApplied,
    leaveApplied: avg.leaveApplied,
    wageTotal: avg.wageTotal,
    averageDailyWage: avg.averageDailyWage,
    appliedDailyWage,
    usedOrdinaryWage: avg.usedOrdinaryWage,
    severance,
    eligible: reasons.length === 0,
    reasons,
  };
}
