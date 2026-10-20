/* ============================================================
   KST ↔ UTC 변환 엔진

   KST 는 UTC+09:00 고정 오프셋으로 계산한다. 과거 표준시(UTC+08:30)와
   1987·1988년 서머타임은 재현하지 않는다 (범위 밖).

   브라우저의 로컬 타임존에 의존하지 않도록 Date 는 UTC 접근자만 쓴다.
   ============================================================ */

export type Zone = "UTC" | "KST";

export const KST_OFFSET_MINUTES = 9 * 60;

export type ParseErrorCode =
  | "format"          // 날짜·시간으로 읽을 수 없음
  | "invalid-date"    // 2026-02-30 처럼 존재하지 않는 날짜·시각
  | "out-of-range"    // 0001~9999년 밖 (입력 또는 변환 결과)
  | "zone-conflict"   // 선택한 입력 시간대와 문자열 안의 시간대가 다름
  | "unsupported-zone"; // UTC·KST 외의 오프셋

/** 달력 날짜·시각 (시간대 없는 벽시계 값) */
export type WallTime = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  ms: number;
};

export type ConvertResult =
  | {
      ok: true;
      from: Zone;
      to: Zone;
      /** Unix epoch 밀리초 */
      epochMs: number;
      source: WallTime;
      target: WallTime;
      /** 입력 시간대 기준 ISO 8601 (호출 예제의 인자로 쓴다) */
      sourceIso: string;
      /** 결과 시간대 기준 ISO 8601 */
      targetIso: string;
      /** 결과 날짜가 입력 날짜보다 하루 앞(-1)·같음(0)·하루 뒤(+1) */
      dayShift: -1 | 0 | 1;
      /** 문자열 안에 시간대 표기가 있었는가 */
      explicitZone: boolean;
      /** 밀리초 아래 자리를 버렸는가 (예: 마이크로초 입력) */
      truncated: boolean;
    }
  | { ok: false; code: ParseErrorCode };

export function otherZone(z: Zone): Zone {
  return z === "UTC" ? "KST" : "UTC";
}

function offsetOf(z: Zone): number {
  return z === "KST" ? KST_OFFSET_MINUTES : 0;
}

// YYYY-MM-DD[(T| )HH:mm[:ss[.fff…]]][ ][zone]
// 날짜 구분자는 - / . 을 허용한다 (한 입력 안에서는 같은 구분자).
const RE =
  /^(\d{4})([-/.])(\d{1,2})\2(\d{1,2})(?:[Tt ]+(\d{1,2}):(\d{2})(?::(\d{2})(?:[.,](\d+))?)?)?\s*([A-Za-z]+|[+-]\d{2}(?::?\d{2})?)?$/;

/** 문자열 끝의 시간대 표기를 UTC·KST 로 해석한다. 그 밖의 오프셋은 unsupported. */
function readZone(token: string): Zone | "unsupported" | "unknown" {
  const up = token.toUpperCase();
  if (up === "Z" || up === "UTC" || up === "GMT") return "UTC";
  if (up === "KST") return "KST";
  const m = /^([+-])(\d{2}):?(\d{2})?$/.exec(token);
  if (!m) return "unknown";
  const mins = (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0));
  if (mins === 0) return "UTC";
  if (mins === KST_OFFSET_MINUTES) return "KST";
  return "unsupported";
}

function daysInMonth(year: number, month: number): number {
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  return [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

/** 벽시계 값 → epoch ms (오프셋 분을 빼서 UTC 로). 0~99년도 그대로 다룬다. */
function wallToEpoch(w: WallTime, offsetMin: number): number {
  const d = new Date(0);
  d.setUTCFullYear(w.year, w.month - 1, w.day);
  d.setUTCHours(w.hour, w.minute, w.second, w.ms);
  return d.getTime() - offsetMin * 60_000;
}

function epochToWall(epochMs: number, offsetMin: number): WallTime {
  const d = new Date(epochMs + offsetMin * 60_000);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    second: d.getUTCSeconds(),
    ms: d.getUTCMilliseconds(),
  };
}

const p2 = (n: number) => String(n).padStart(2, "0");

export function formatDate(w: WallTime): string {
  return `${String(w.year).padStart(4, "0")}-${p2(w.month)}-${p2(w.day)}`;
}

export function formatTime(w: WallTime): string {
  return `${p2(w.hour)}:${p2(w.minute)}:${p2(w.second)}.${String(w.ms).padStart(3, "0")}`;
}

/** ISO 8601 · 밀리초 3자리 · UTC 는 Z, KST 는 +09:00 */
export function formatIso(w: WallTime, zone: Zone): string {
  return `${formatDate(w)}T${formatTime(w)}${zone === "UTC" ? "Z" : "+09:00"}`;
}

/** 입력 칸에 넣는 사람용 형식 (밀리초가 0이면 생략) */
export function formatInput(w: WallTime): string {
  const base = `${formatDate(w)} ${p2(w.hour)}:${p2(w.minute)}:${p2(w.second)}`;
  return w.ms ? `${base}.${String(w.ms).padStart(3, "0")}` : base;
}

/** 지금 이 순간을 해당 시간대의 벽시계 값으로 */
export function nowIn(zone: Zone, nowMs: number = Date.now()): WallTime {
  return epochToWall(nowMs, offsetOf(zone));
}

/** 입력 문자열을 from 시간대로 읽어 반대 시간대로 변환한다. */
export function convert(input: string, from: Zone): ConvertResult {
  const m = RE.exec(input.trim());
  if (!m) return { ok: false, code: "format" };

  let explicitZone = false;
  if (m[9]) {
    const z = readZone(m[9]);
    if (z === "unknown") return { ok: false, code: "format" };
    if (z === "unsupported") return { ok: false, code: "unsupported-zone" };
    if (z !== from) return { ok: false, code: "zone-conflict" };
    explicitZone = true;
  }

  const frac = m[8] ?? "";
  const source: WallTime = {
    year: Number(m[1]),
    month: Number(m[3]),
    day: Number(m[4]),
    hour: Number(m[5] ?? 0),
    minute: Number(m[6] ?? 0),
    second: Number(m[7] ?? 0),
    ms: Number(frac.slice(0, 3).padEnd(3, "0")),
  };

  if (source.year < 1) return { ok: false, code: "out-of-range" };
  if (
    source.month < 1 || source.month > 12 ||
    source.day < 1 || source.day > daysInMonth(source.year, source.month) ||
    source.hour > 23 || source.minute > 59 || source.second > 59
  ) {
    return { ok: false, code: "invalid-date" };
  }

  const to = otherZone(from);
  const epochMs = wallToEpoch(source, offsetOf(from));
  const target = epochToWall(epochMs, offsetOf(to));
  if (target.year < 1 || target.year > 9999) return { ok: false, code: "out-of-range" };

  const dayDiff = Math.round(
    (Date.UTC(2000, target.month - 1, target.day) - Date.UTC(2000, source.month - 1, source.day)) /
      86_400_000,
  );
  // 연말·연초를 넘을 때(12-31 → 01-01) 같은 해 기준 차이가 ±364/365 가 된다.
  const dayShift = (target.year !== source.year ? Math.sign(target.year - source.year) : Math.sign(dayDiff)) as -1 | 0 | 1;

  return {
    ok: true,
    from,
    to,
    epochMs,
    source,
    target,
    sourceIso: formatIso(source, from),
    targetIso: formatIso(target, to),
    dayShift,
    explicitZone,
    truncated: frac.length > 3 && /[1-9]/.test(frac.slice(3)),
  };
}
