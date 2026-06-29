import type {
  FunnelStage,
  FunnelStageResult,
  FunnelAnalysisResult,
  ReverseFunnelStage,
  ReverseFunnelResult,
} from "./types";

export function analyzeFunnel(stages: FunnelStage[]): FunnelAnalysisResult {
  const parsed = stages.map((s) => {
    const v = parseFloat(s.count);
    return Number.isFinite(v) && v >= 0 ? Math.round(v) : 0;
  });

  const results: FunnelStageResult[] = parsed.map((count, i) => {
    const prev = parsed[i - 1];
    const next = parsed[i + 1];

    const conversionRate =
      i < parsed.length - 1 && count > 0 && next !== undefined
        ? (next / count) * 100
        : null;

    const dropOffCount =
      i < parsed.length - 1 && next !== undefined ? count - next : null;

    const dropOffRate =
      i < parsed.length - 1 && count > 0 && next !== undefined
        ? ((count - next) / count) * 100
        : null;

    const cumulativeRate =
      parsed[0] > 0 ? (count / parsed[0]) * 100 : count > 0 ? 100 : 0;

    const warning = prev !== undefined && count > prev;

    return {
      id: stages[i].id,
      name: stages[i].name,
      count,
      conversionRate,
      dropOffRate,
      dropOffCount,
      cumulativeRate,
      warning,
    };
  });

  const overallRate =
    parsed.length >= 2 && parsed[0] > 0
      ? (parsed[parsed.length - 1] / parsed[0]) * 100
      : null;

  // Worst conversion rate (excluding last stage which has no next)
  let worstConversionIdx: number | null = null;
  let worstConversionVal = Infinity;
  results.forEach((r, i) => {
    if (r.conversionRate !== null && r.conversionRate < worstConversionVal) {
      worstConversionVal = r.conversionRate;
      worstConversionIdx = i;
    }
  });

  let worstDropOffRateIdx: number | null = null;
  let worstDropOffRateVal = -Infinity;
  results.forEach((r, i) => {
    if (r.dropOffRate !== null && r.dropOffRate > worstDropOffRateVal) {
      worstDropOffRateVal = r.dropOffRate;
      worstDropOffRateIdx = i;
    }
  });

  let worstDropOffCountIdx: number | null = null;
  let worstDropOffCountVal = -Infinity;
  results.forEach((r, i) => {
    if (r.dropOffCount !== null && r.dropOffCount > worstDropOffCountVal) {
      worstDropOffCountVal = r.dropOffCount;
      worstDropOffCountIdx = i;
    }
  });

  return { stages: results, overallRate, worstConversionIdx, worstDropOffRateIdx, worstDropOffCountIdx };
}

export function reverseCalculateFunnel(
  finalTarget: number,
  stages: ReverseFunnelStage[]
): ReverseFunnelResult {
  if (stages.length < 2 || finalTarget <= 0) {
    return { stages: [], overallRate: null };
  }

  const rates = stages.slice(0, -1).map((s) => {
    const v = parseFloat(s.conversionRate);
    return Number.isFinite(v) && v > 0 && v <= 100 ? v / 100 : null;
  });

  const resultStages: ReverseFunnelResult["stages"] = [];
  resultStages.push({
    id: stages[stages.length - 1].id,
    name: stages[stages.length - 1].name,
    required: finalTarget,
    conversionRate: null,
  });

  let current = finalTarget;
  for (let i = rates.length - 1; i >= 0; i--) {
    const rate = rates[i];
    const required = rate !== null ? Math.ceil(current / rate) : null;
    if (required === null) {
      resultStages.unshift({ id: stages[i].id, name: stages[i].name, required: 0, conversionRate: null });
    } else {
      resultStages.unshift({ id: stages[i].id, name: stages[i].name, required, conversionRate: rates[i]! * 100 });
      current = required;
    }
  }

  const firstRequired = resultStages[0]?.required ?? 0;
  const overallRate =
    firstRequired > 0 ? (finalTarget / firstRequired) * 100 : null;

  return { stages: resultStages, overallRate };
}
