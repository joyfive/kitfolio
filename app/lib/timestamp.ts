/** Pure conversion functions — no side effects, safe for server and client. */

export type InputKind =
  | "unix-s"
  | "unix-ms"
  | "unix-us"
  | "datetime"
  | "slack"
  | "invalid";

export interface ParseResult {
  kind: InputKind;
  /** Always in whole seconds. */
  unixSeconds: number;
  error?: string;
}

/** Auto-detect format and return Unix seconds. */
export function parseInput(raw: string): ParseResult {
  const s = raw.trim();
  if (!s) return { kind: "invalid", unixSeconds: 0, error: "" };

  // Slack syntax: <!date^UNIX^format|fallback>
  const slackMatch = s.match(/<!date\^(\d+)\^/);
  if (slackMatch) {
    return { kind: "slack", unixSeconds: parseInt(slackMatch[1], 10) };
  }

  // Pure numeric (9–16 digits, optional decimal)
  if (/^\d{9,16}(\.\d+)?$/.test(s)) {
    const n = parseFloat(s);
    if (s.includes(".")) {
      // e.g. 1718071200.123456 — seconds with sub-second fraction
      return { kind: "unix-us", unixSeconds: Math.floor(n) };
    }
    if (n > 1e12) {
      // 13+ digits → milliseconds
      return { kind: "unix-ms", unixSeconds: Math.floor(n / 1000) };
    }
    // 9–10 digits → seconds
    return { kind: "unix-s", unixSeconds: Math.floor(n) };
  }

  // DateTime string (ISO 8601, locale-friendly, etc.)
  const dt = new Date(s);
  if (!isNaN(dt.getTime())) {
    return { kind: "datetime", unixSeconds: Math.floor(dt.getTime() / 1000) };
  }

  return {
    kind: "invalid",
    unixSeconds: 0,
    error: `Cannot parse "${s.slice(0, 40)}${s.length > 40 ? "…" : ""}"`,
  };
}

const DAYS = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday",
];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** UTC formatted string — safe for server render. */
export function toUTC(unixS: number): string {
  const d = new Date(unixS * 1000);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mi = String(d.getUTCMinutes()).padStart(2, "0");
  const ss = String(d.getUTCSeconds()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss} UTC`;
}

/**
 * Local timezone formatted string — CLIENT-ONLY.
 * Never call on the server; wrap in useEffect.
 */
export function toLocalTz(unixS: number): string {
  const d = new Date(unixS * 1000);
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "??";
  const tzAbbr =
    new Intl.DateTimeFormat("en", {
      timeZone: tz,
      timeZoneName: "short",
    })
      .formatToParts(d)
      .find((p) => p.type === "timeZoneName")?.value ?? tz;

  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}:${get("second")} ${tzAbbr}`;
}

/** Long readable date — UTC-based, safe for server render. */
export function toReadable(unixS: number): string {
  const d = new Date(unixS * 1000);
  return `${DAYS[d.getUTCDay()]}, ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/**
 * Relative time — CLIENT-ONLY (depends on Date.now()).
 * Never call on the server; wrap in useEffect.
 */
export function toRelative(unixS: number): string {
  const diff = unixS - Math.floor(Date.now() / 1000);
  const abs = Math.abs(diff);
  const future = diff > 0;

  const fmt = (n: number, unit: string) =>
    future ? `in ${n} ${unit}${n !== 1 ? "s" : ""}` : `${n} ${unit}${n !== 1 ? "s" : ""} ago`;

  if (abs < 5) return "just now";
  if (abs < 60) return fmt(abs, "second");
  if (abs < 3600) return fmt(Math.round(abs / 60), "minute");
  if (abs < 86_400) return fmt(Math.round(abs / 3600), "hour");
  if (abs < 86_400 * 30) return fmt(Math.round(abs / 86_400), "day");
  if (abs < 86_400 * 365) return fmt(Math.round(abs / (86_400 * 30)), "month");
  return fmt(Math.round(abs / (86_400 * 365)), "year");
}

/** Slack date format tokens → several useful variants. */
export function toSlackFormats(
  unixS: number,
): { label: string; value: string }[] {
  const ts = Math.floor(unixS);
  const d = new Date(ts * 1000);
  const mo = MONTHS[d.getUTCMonth()].slice(0, 3);
  const fallback = `${mo} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;

  return [
    {
      label: "date + time",
      value: `<!date^${ts}^{date_short_pretty} at {time}|${fallback}>`,
    },
    {
      label: "date only",
      value: `<!date^${ts}^{date_short_pretty}|${fallback}>`,
    },
    {
      label: "time only",
      value: `<!date^${ts}^{time}|${fallback}>`,
    },
    {
      label: "long + secs",
      value: `<!date^${ts}^{date_long_pretty} at {time_secs}|${fallback}>`,
    },
  ];
}
