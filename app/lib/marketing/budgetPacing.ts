import type { BudgetPacingInput, BudgetPacingResult, PacingStatus } from "./types";

function isWeekday(date: Date): boolean {
  const d = date.getDay();
  return d !== 0 && d !== 6;
}

function countDays(from: Date, to: Date, mode: "daily" | "weekday"): number {
  if (from > to) return 0;
  if (mode === "daily") {
    const diff = Math.floor((to.getTime() - from.getTime()) / 86400000);
    return diff + 1;
  }
  let count = 0;
  const cur = new Date(from);
  cur.setHours(0, 0, 0, 0);
  const end = new Date(to);
  end.setHours(0, 0, 0, 0);
  while (cur <= end) {
    if (isWeekday(cur)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function toDay(d: Date): Date {
  const r = new Date(d);
  r.setHours(0, 0, 0, 0);
  return r;
}

function pacingStatus(gap: number): PacingStatus {
  if (gap > 5) return "over";
  if (gap < -5) return "under";
  return "on-track";
}

export function calcBudgetPacing(input: BudgetPacingInput): BudgetPacingResult {
  const { totalBudget, startDate, endDate, referenceDate, spentToDate, runMode, expectedDailySpend } = input;

  const start = toDay(startDate);
  const end = toDay(endDate);
  const ref = toDay(referenceDate);

  // Clamp reference date
  const clampedRef = ref < start ? new Date(start.getTime() - 86400000) : ref > end ? end : ref;

  const totalDays = countDays(start, end, runMode);

  // Elapsed: start → clampedRef (inclusive)
  const elapsedDays = ref < start ? 0 : countDays(start, clampedRef, runMode);

  // Remaining: day after ref → end
  const dayAfterRef = new Date(clampedRef.getTime() + 86400000);
  const remainingDays = dayAfterRef > end ? 0 : countDays(dayAfterRef, end, runMode);

  const timePct = totalDays > 0 ? (elapsedDays / totalDays) * 100 : 0;
  const burnPct = totalBudget > 0 ? (spentToDate / totalBudget) * 100 : 0;
  const pacingGap = burnPct - timePct;
  const status = pacingStatus(pacingGap);

  const plannedSpend = totalBudget * (timePct / 100);
  const variance = spentToDate - plannedSpend;

  const currentDailyAvg = elapsedDays > 0 ? spentToDate / elapsedDays : null;
  const remainingBudget = totalBudget - spentToDate;

  const requiredDailySpend = remainingDays > 0 ? remainingBudget / remainingDays : null;

  const dailyForProjection = expectedDailySpend !== undefined && expectedDailySpend >= 0
    ? expectedDailySpend
    : currentDailyAvg;

  const projectedFinalSpend =
    dailyForProjection !== null ? spentToDate + dailyForProjection * remainingDays : null;

  const projectedFinalBurnPct =
    projectedFinalSpend !== null && totalBudget > 0
      ? (projectedFinalSpend / totalBudget) * 100
      : null;

  return {
    totalDays,
    elapsedDays,
    remainingDays,
    timePct,
    burnPct,
    pacingGap,
    status,
    plannedSpend,
    variance,
    currentDailyAvg,
    remainingBudget,
    requiredDailySpend,
    projectedFinalSpend,
    projectedFinalBurnPct,
  };
}
