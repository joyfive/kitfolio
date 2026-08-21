/* ============================================================
   유연근무 잔여시간 계산: 순수 계산 로직 (UI 비의존)

   모든 계산은 브라우저 안에서만 이루어집니다. 서버 전송 없음.
   ============================================================ */
import { isKrHoliday } from "./holidays";

export type FlexInput = {
  year: number;
  month: number; // 1~12
  dailyHours: number; // 1일 소정근로시간 (기본 8)
  fullLeave: number; // 연차 일수
  halfLeave: number; // 반차 횟수
  hourLeave: number; // 시간차 (시간)
  worked: number; // 현재까지 누적 근무시간
  excludeHolidays: boolean; // 공휴일을 영업일에서 제외할지
  includeToday: boolean; // 남은 영업일에 오늘을 포함할지
  today: Date; // 기준 날짜 (남은 영업일 계산용)
};

export type FlexResult = {
  businessDays: number; // 이번 달 영업일
  baseTarget: number; // 월 기본 목표시간 = 영업일 × 소정근로시간
  leaveDeduction: number; // 휴가 차감 합계
  annualDeduction: number; // 연차 차감
  halfDeduction: number; // 반차 차감
  hourDeduction: number; // 시간차 차감
  actualTarget: number; // 실제 목표시간 = 기본 목표 - 휴가 차감
  worked: number; // 현재 누적 근무시간
  remaining: number; // 남은 목표시간 = 실제 목표 - 누적
  remainingDays: number; // 남은 영업일
  requiredDaily: number | null; // 남은 기간 하루 평균 필요시간 (남은 영업일 0이면 null)
  balance: number; // 정시(소정근로) 기준 여유(+)/부족(-)
  monthState: "past" | "current" | "future"; // 선택한 달이 기준일 대비 과거/현재/미래
};

const lastDayOfMonth = (year: number, month: number) =>
  new Date(year, month, 0).getDate();

function isBusinessDay(
  year: number,
  month: number,
  day: number,
  excludeHolidays: boolean,
): boolean {
  const dow = new Date(year, month - 1, day).getDay();
  if (dow === 0 || dow === 6) return false; // 주말 제외
  if (excludeHolidays && isKrHoliday(year, month, day)) return false;
  return true;
}

/** 해당 월의 영업일 수 (주말 + 선택 시 공휴일 제외) */
export function businessDaysInMonth(
  year: number,
  month: number,
  excludeHolidays: boolean,
): number {
  let count = 0;
  const last = lastDayOfMonth(year, month);
  for (let d = 1; d <= last; d++) {
    if (isBusinessDay(year, month, d, excludeHolidays)) count++;
  }
  return count;
}

/** 기준일 대비 선택한 달의 위치 (과거/현재/미래) */
function monthState(
  year: number,
  month: number,
  today: Date,
): "past" | "current" | "future" {
  const cy = today.getFullYear();
  const cm = today.getMonth() + 1;
  if (year < cy || (year === cy && month < cm)) return "past";
  if (year === cy && month === cm) return "current";
  return "future";
}

/** 남은 영업일: 기준일 기준.
 *  과거 달이면 0, 미래 달이면 그 달 전체 영업일, 이번 달이면 오늘(포함 여부) 이후. */
export function remainingBusinessDays(
  year: number,
  month: number,
  excludeHolidays: boolean,
  today: Date,
  includeToday: boolean,
): number {
  const state = monthState(year, month, today);
  if (state === "past") return 0;
  if (state === "future") return businessDaysInMonth(year, month, excludeHolidays);

  const start = includeToday ? today.getDate() : today.getDate() + 1;
  const last = lastDayOfMonth(year, month);
  let count = 0;
  for (let d = start; d <= last; d++) {
    if (isBusinessDay(year, month, d, excludeHolidays)) count++;
  }
  return count;
}

export function calcFlexWork(input: FlexInput): FlexResult {
  const { dailyHours, fullLeave, halfLeave, hourLeave, worked } = input;

  const businessDays = businessDaysInMonth(
    input.year,
    input.month,
    input.excludeHolidays,
  );
  const baseTarget = businessDays * dailyHours;

  // 휴가 차감: 소정근로시간 기준으로 환산 (8시간 고정 아님)
  const annualDeduction = fullLeave * dailyHours;
  const halfDeduction = halfLeave * (dailyHours / 2);
  const hourDeduction = hourLeave;
  const leaveDeduction = annualDeduction + halfDeduction + hourDeduction;

  const actualTarget = baseTarget - leaveDeduction;
  const remaining = actualTarget - worked;

  const remainingDays = remainingBusinessDays(
    input.year,
    input.month,
    input.excludeHolidays,
    input.today,
    input.includeToday,
  );

  const requiredDaily = remainingDays > 0 ? remaining / remainingDays : null;
  // 남은 영업일을 모두 소정근로시간만큼 일했을 때 대비 여유(+)/부족(-)
  const balance = remainingDays * dailyHours - remaining;

  return {
    businessDays,
    baseTarget,
    leaveDeduction,
    annualDeduction,
    halfDeduction,
    hourDeduction,
    actualTarget,
    worked,
    remaining,
    remainingDays,
    requiredDaily,
    balance,
    monthState: monthState(input.year, input.month, input.today),
  };
}
