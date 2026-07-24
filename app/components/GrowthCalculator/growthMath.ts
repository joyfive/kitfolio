export type GrowthMode =
  | "growth-rate"
  | "percent-difference"
  | "goal-growth"
  | "required-growth"
  | "reverse-growth"
  | "cagr"
  | "compound-growth";

export type Direction = "increase" | "decrease" | "no-change";

export interface GrowthResult {
  changeRate?: number;
  difference?: number;
  multiplier?: number;
  direction?: Direction;
  requiredGrowthRate?: number;
  requiredDifference?: number;
  multiplierNeeded?: number;
  requiredIncrease?: number;
  remainingGap?: number;
  progressToTarget?: number;
  originalValue?: number;
  cagr?: number;
  totalGrowth?: number;
  finalMultiplier?: number;
  finalValue?: number;
  projectedValue?: number;
  totalDifference?: number;
}

function ok(...values: number[]): boolean {
  return values.every((v) => isFinite(v) && !isNaN(v));
}

function dir(rate: number): Direction {
  if (rate > 0) return "increase";
  if (rate < 0) return "decrease";
  return "no-change";
}

export function compute(mode: GrowthMode, inputs: Record<string, number>): GrowthResult | null {
  switch (mode) {
    case "growth-rate": {
      const { start, end } = inputs;
      if (!ok(start, end) || start === 0) return null;
      const changeRate = ((end - start) / start) * 100;
      return {
        changeRate,
        difference: end - start,
        multiplier: end / start,
        direction: dir(changeRate),
      };
    }
    case "percent-difference": {
      const { a, b } = inputs;
      if (!ok(a, b)) return null;
      const avg = (a + b) / 2;
      if (avg === 0) return null;
      return {
        changeRate: (Math.abs(a - b) / avg) * 100,
        difference: Math.abs(a - b),
      };
    }
    case "goal-growth": {
      const { current, target } = inputs;
      if (!ok(current, target) || current === 0) return null;
      return {
        requiredGrowthRate: ((target - current) / current) * 100,
        requiredDifference: target - current,
        multiplierNeeded: target / current,
      };
    }
    case "required-growth": {
      const { current, target } = inputs;
      if (!ok(current, target) || current === 0 || target === 0) return null;
      return {
        requiredIncrease: target - current,
        requiredGrowthRate: ((target - current) / current) * 100,
        remainingGap: target - current,
        progressToTarget: (current / target) * 100,
      };
    }
    case "reverse-growth": {
      const { finalValue, growthRate } = inputs;
      if (!ok(finalValue, growthRate)) return null;
      const divisor = 1 + growthRate / 100;
      if (divisor === 0) return null;
      const originalValue = finalValue / divisor;
      return {
        originalValue,
        difference: finalValue - originalValue,
        multiplier: divisor,
      };
    }
    case "cagr": {
      const { start, end, years } = inputs;
      if (!ok(start, end, years) || start <= 0 || years <= 0) return null;
      const cagr = (Math.pow(end / start, 1 / years) - 1) * 100;
      return {
        cagr,
        totalGrowth: ((end - start) / start) * 100,
        finalMultiplier: end / start,
      };
    }
    case "compound-growth": {
      const { initial, rate, periods } = inputs;
      if (!ok(initial, rate, periods) || periods < 0) return null;
      const finalValue = initial * Math.pow(1 + rate / 100, periods);
      return {
        finalValue,
        totalDifference: finalValue - initial,
        totalGrowth: initial !== 0 ? ((finalValue - initial) / initial) * 100 : 0,
      };
    }
  }
}
