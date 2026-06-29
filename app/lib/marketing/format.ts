import type { Currency } from "./types";

export function fmtCurrency(value: number, currency: Currency): string {
  try {
    const opts: Intl.NumberFormatOptions = {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "KRW" || currency === "JPY" ? 0 : 2,
      minimumFractionDigits: currency === "KRW" || currency === "JPY" ? 0 : 2,
    };
    return new Intl.NumberFormat(currency === "KRW" ? "ko-KR" : "en-US", opts).format(value);
  } catch {
    return value.toLocaleString();
  }
}

export function fmtNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value);
}

export function fmtPct(value: number, decimals = 2): string {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(value)}%`;
}

export function fmtMultiple(value: number): string {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 }).format(value)}x`;
}

export function parseNum(s: string): number {
  const v = parseFloat(s.replace(/,/g, ""));
  return Number.isFinite(v) ? v : 0;
}
