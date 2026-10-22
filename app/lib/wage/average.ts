/* ============================================================
   평균임금 산정: 공용 엔진 (UI 비의존)

   근로기준법 평균임금을 "마지막 근무일" 기준으로 계산한다.
   퇴직금 계산기와 실업급여 계산기(구직급여 기초일액)가 함께 쓴다.

   ── 산식 ──────────────────────────────────────────────
   1일 평균임금 = (3개월 임금 + 연간 상여금 × 3/12 + 연차수당 × 3/12)
                  ÷ 평균임금 산정기간 총일수
   적용 1일 임금 = max(1일 평균임금, 입력한 1일 통상임금)

   ── 날짜 처리 ─────────────────────────────────────────
   산정 사유 발생일(퇴직일)은 마지막 근무일의 다음 날이다.
   산정기간은 그 직전 3개월: [발생일 - 3개월, 마지막 근무일].
   입사일을 주면 산정기간 시작은 입사일보다 앞서지 않는다.

   모든 계산은 브라우저 안에서만 이루어진다. 서버 전송 없음.
   ============================================================ */

/** 평균임금에 반영하는 상여금·연차수당 비율 (3개월분) */
const THREE_MONTH_SHARE = 3 / 12;

const MS_PER_DAY = 86_400_000;

/** "YYYY-MM-DD" → UTC 자정 Date (타임존 영향 제거) */
export function parseDate(iso: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const dt = new Date(Date.UTC(y, mo - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== mo - 1 ||
    dt.getUTCDate() !== d
  ) {
    return null;
  }
  return dt;
}

/** Date → "YYYY-MM-DD" */
export function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** 두 날짜 사이의 일수 (b - a) */
export function diffDays(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getTime() + n * MS_PER_DAY);
}

/** n개월 이동. 이동한 달에 같은 일자가 없으면 그 달의 말일로 맞춘다.
 *  (5월 31일에서 3개월 전 → 2월 28일. 자동 이월로 3월로 넘어가지 않게 한다) */
export function addMonths(d: Date, n: number): Date {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + n;
  const day = d.getUTCDate();
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return new Date(Date.UTC(y, m, Math.min(day, lastDay)));
}

function toNumber(n: number | undefined): number {
  return Number.isFinite(n) && (n as number) > 0 ? (n as number) : 0;
}

export type AverageWageInput = {
  /** 마지막 근무일 */
  lastWork: Date;
  /** 입사일 (산정기간 시작이 이보다 앞서지 않게 한다. 모르면 생략) */
  join?: Date;
  /** 마지막 근무일 이전 3개월 임금 총액 (세전, 상여금·연차수당 제외) */
  wage3m: number;
  /** 최근 1년간 상여금 총액 */
  annualBonus?: number;
  /** 연차수당 */
  annualLeaveAllowance?: number;
  /** 1일 통상임금 (0 또는 생략 시 평균임금만 사용) */
  dailyOrdinaryWage?: number;
};

export type AverageWageResult = {
  /** 산정 사유 발생일 = 마지막 근무일 + 1일 */
  eventDate: Date;
  periodStart: Date;
  periodEnd: Date;
  /** 산정기간 총일수 (달력 기준) */
  periodDays: number;
  bonusApplied: number;
  leaveApplied: number;
  /** 산정기간 임금 총액 */
  wageTotal: number;
  /** 1일 평균임금 (원 단위 반올림) */
  averageDailyWage: number;
  /** 적용 1일 임금: 평균임금과 통상임금 중 큰 값 */
  appliedDailyWage: number;
  usedOrdinaryWage: boolean;
};

/** 1일 평균임금을 계산한다. 임금이 0이거나 산정기간이 비면 null. */
export function averageDailyWage(input: AverageWageInput): AverageWageResult | null {
  const wage3m = toNumber(input.wage3m);
  if (wage3m <= 0) return null;

  const eventDate = addDays(input.lastWork, 1);
  const threeMonthsBefore = addMonths(eventDate, -3);
  const periodStart =
    input.join && diffDays(input.join, threeMonthsBefore) < 0 ? input.join : threeMonthsBefore;
  const periodDays = diffDays(periodStart, eventDate);
  if (periodDays <= 0) return null;

  const bonusApplied = Math.round(toNumber(input.annualBonus) * THREE_MONTH_SHARE);
  const leaveApplied = Math.round(toNumber(input.annualLeaveAllowance) * THREE_MONTH_SHARE);
  const wageTotal = wage3m + bonusApplied + leaveApplied;

  const average = Math.round(wageTotal / periodDays);
  const ordinary = Math.round(toNumber(input.dailyOrdinaryWage));
  const usedOrdinaryWage = ordinary > average;

  return {
    eventDate,
    periodStart,
    periodEnd: input.lastWork,
    periodDays,
    bonusApplied,
    leaveApplied,
    wageTotal,
    averageDailyWage: average,
    appliedDailyWage: usedOrdinaryWage ? ordinary : average,
    usedOrdinaryWage,
  };
}
