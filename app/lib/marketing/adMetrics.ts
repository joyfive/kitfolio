// Pure calculation functions for ROAS, CPA, CPC, CPM, CTR

// ROAS
export function calcRoas(spend: number, revenue: number) {
  if (spend <= 0) return null;
  const pct = (revenue / spend) * 100;
  const multiple = revenue / spend;
  const diff = revenue - spend;
  return { pct, multiple, diff };
}

export function calcTargetRevenue(spend: number, targetRoasPct: number) {
  if (spend <= 0 || targetRoasPct <= 0) return null;
  return spend * (targetRoasPct / 100);
}

export function calcAllowableBudget(targetRevenue: number, targetRoasPct: number) {
  if (targetRevenue <= 0 || targetRoasPct <= 0) return null;
  return targetRevenue / (targetRoasPct / 100);
}

export function calcBreakEvenRoas(grossMarginPct: number) {
  if (grossMarginPct <= 0 || grossMarginPct > 100) return null;
  return 100 / (grossMarginPct / 100);
}

// CPA
export function calcCpa(spend: number, conversions: number) {
  if (conversions <= 0 || spend < 0) return null;
  return spend / conversions;
}

export function calcExpectedConversions(budget: number, targetCpa: number) {
  if (budget <= 0 || targetCpa <= 0) return null;
  return Math.floor(budget / targetCpa);
}

export function calcRequiredBudgetCpa(targetConversions: number, targetCpa: number) {
  if (targetConversions <= 0 || targetCpa <= 0) return null;
  return targetConversions * targetCpa;
}

// CPC
export function calcCpc(spend: number, clicks: number) {
  if (clicks <= 0 || spend < 0) return null;
  return spend / clicks;
}

export function calcExpectedClicks(budget: number, targetCpc: number) {
  if (budget <= 0 || targetCpc <= 0) return null;
  return Math.floor(budget / targetCpc);
}

export function calcRequiredBudgetCpc(targetClicks: number, targetCpc: number) {
  if (targetClicks <= 0 || targetCpc <= 0) return null;
  return targetClicks * targetCpc;
}

// CPM
export function calcCpm(spend: number, impressions: number) {
  if (impressions <= 0 || spend < 0) return null;
  return (spend / impressions) * 1000;
}

export function calcExpectedImpressions(budget: number, targetCpm: number) {
  if (budget <= 0 || targetCpm <= 0) return null;
  return Math.floor((budget / targetCpm) * 1000);
}

export function calcRequiredBudgetCpm(targetImpressions: number, targetCpm: number) {
  if (targetImpressions <= 0 || targetCpm <= 0) return null;
  return (targetImpressions / 1000) * targetCpm;
}

// CTR
export function calcCtr(clicks: number, impressions: number) {
  if (impressions <= 0 || clicks < 0) return null;
  return (clicks / impressions) * 100;
}

export function calcRequiredClicks(impressions: number, targetCtrPct: number) {
  if (impressions <= 0 || targetCtrPct <= 0) return null;
  return Math.ceil(impressions * (targetCtrPct / 100));
}

export function calcRequiredImpressions(clicks: number, targetCtrPct: number) {
  if (clicks <= 0 || targetCtrPct <= 0) return null;
  return Math.ceil(clicks / (targetCtrPct / 100));
}
