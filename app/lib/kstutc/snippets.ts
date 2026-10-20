/* ============================================================
   KST ↔ UTC 변환: 언어별 코드 예제

   함수(fn)는 입력값과 무관한 재사용 코드다. 현재 입력값은 전체 예제(full)의
   호출부와 예상 출력에만 들어간다.

   모든 함수는 시간대가 붙은 ISO 8601 문자열을 받아 결과 시간대의 ISO 8601
   (밀리초 3자리, UTC 는 Z · KST 는 +09:00)을 돌려준다. 이 출력 형식은
   convert.ts 의 formatIso 와 같아야 한다 (테스트가 실제 실행으로 대조한다).
   ============================================================ */
import type { Zone } from "./convert";

export type CodeLang = "javascript" | "typescript" | "python" | "java" | "go" | "csharp";

export const CODE_LANGS: { id: CodeLang; label: string }[] = [
  { id: "javascript", label: "JavaScript" },
  { id: "typescript", label: "TypeScript" },
  { id: "python", label: "Python" },
  { id: "java", label: "Java" },
  { id: "go", label: "Go" },
  { id: "csharp", label: "C#" },
];

export type Snippet = {
  /** 재사용 함수 (import·상수 포함, 호출부 없음) */
  fn: string;
  /** 함수 + 호출 예제 + 예상 출력 주석 (그대로 실행 가능한 형태) */
  full: string;
};

/** 변환 방향별 함수 이름 */
function names(from: Zone) {
  const toKst = from === "UTC";
  return {
    camel: toKst ? "utcToKst" : "kstToUtc",
    snake: toKst ? "utc_to_kst" : "kst_to_utc",
    pascal: toKst ? "UtcToKst" : "KstToUtc",
    go: toKst ? "UTCToKST" : "KSTToUTC",
    toKst,
  };
}

function javascript(from: Zone, input: string, expected: string): Snippet {
  const n = names(from);
  const body = n.toKst
    ? `  const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().replace("Z", "+09:00");`
    : `  return date.toISOString();`;
  const fn = `function ${n.camel}(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(\`Invalid date: \${isoString}\`);
  }
${body}
}`;
  return {
    fn,
    full: `${fn}

console.log(${n.camel}("${input}"));
// ${expected}`,
  };
}

function typescript(from: Zone, input: string, expected: string): Snippet {
  const n = names(from);
  const body = n.toKst
    ? `  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().replace("Z", "+09:00");`
    : `  return date.toISOString();`;
  const constLine = n.toKst ? `const KST_OFFSET_MS = 9 * 60 * 60 * 1000;\n\n` : "";
  const fn = `${constLine}export function ${n.camel}(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(\`Invalid date: \${isoString}\`);
  }
${body}
}`;
  return {
    fn,
    full: `${fn}

console.log(${n.camel}("${input}"));
// ${expected}`,
  };
}

function python(from: Zone, input: string, expected: string): Snippet {
  const n = names(from);
  const ret = n.toKst
    ? `    return dt.astimezone(KST).isoformat(timespec="milliseconds")`
    : `    return dt.astimezone(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")`;
  const fn = `from datetime import datetime, timedelta, timezone

KST = timezone(timedelta(hours=9), "KST")


def ${n.snake}(iso_string: str) -> str:
    dt = datetime.fromisoformat(iso_string.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        raise ValueError(f"Timezone offset required: {iso_string}")
${ret}`;
  return {
    fn,
    full: `${fn}


print(${n.snake}("${input}"))
# ${expected}`,
  };
}

function java(from: Zone, input: string, expected: string): Snippet {
  const n = names(from);
  const offset = n.toKst ? "KST" : "ZoneOffset.UTC";
  const head = `import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

public class KstUtcConverter {
${n.toKst ? "    private static final ZoneOffset KST = ZoneOffset.ofHours(9);\n" : ""}    private static final DateTimeFormatter ISO_MILLIS =
        DateTimeFormatter.ofPattern("uuuu-MM-dd'T'HH:mm:ss.SSSXXX");

    public static String ${n.camel}(String isoString) {
        return OffsetDateTime.parse(isoString)
            .withOffsetSameInstant(${offset})
            .format(ISO_MILLIS);
    }`;
  return {
    fn: `${head}\n}`,
    full: `${head}

    public static void main(String[] args) {
        System.out.println(${n.camel}("${input}"));
        // ${expected}
    }
}`,
  };
}

function go(from: Zone, input: string, expected: string): Snippet {
  const n = names(from);
  const zone = n.toKst ? "kst" : "time.UTC";
  const decls = `${n.toKst ? `var kst = time.FixedZone("KST", 9*60*60)\n\n` : ""}const isoMillis = "2006-01-02T15:04:05.000Z07:00"

func ${n.go}(isoString string) (string, error) {
\tt, err := time.Parse(time.RFC3339Nano, isoString)
\tif err != nil {
\t\treturn "", err
\t}
\treturn t.In(${zone}).Format(isoMillis), nil
}`;
  return {
    fn: `import "time"\n\n${decls}`,
    full: `package main

import (
\t"fmt"
\t"time"
)

${decls}

func main() {
\tout, err := ${n.go}("${input}")
\tif err != nil {
\t\tpanic(err)
\t}
\tfmt.Println(out)
\t// ${expected}
}`,
  };
}

function csharp(from: Zone, input: string, expected: string): Snippet {
  const n = names(from);
  const ret = n.toKst
    ? `        return instant.ToOffset(KstOffset)
            .ToString("yyyy-MM-dd'T'HH:mm:ss.fffzzz", CultureInfo.InvariantCulture);`
    : `        return instant.ToUniversalTime()
            .ToString("yyyy-MM-dd'T'HH:mm:ss.fff'Z'", CultureInfo.InvariantCulture);`;
  const head = `using System;
using System.Globalization;

public static class KstUtcConverter
{
${n.toKst ? "    private static readonly TimeSpan KstOffset = TimeSpan.FromHours(9);\n\n" : ""}    public static string ${n.pascal}(string isoString)
    {
        var instant = DateTimeOffset.Parse(isoString, CultureInfo.InvariantCulture);
${ret}
    }`;
  return {
    fn: `${head}\n}`,
    full: `${head}

    public static void Main()
    {
        Console.WriteLine(${n.pascal}("${input}"));
        // ${expected}
    }
}`,
  };
}

const BUILDERS: Record<CodeLang, (from: Zone, input: string, expected: string) => Snippet> = {
  javascript,
  typescript,
  python,
  java,
  go,
  csharp,
};

/** from 시간대의 ISO 입력을 반대 시간대로 바꾸는 lang 코드 예제 */
export function buildSnippet(lang: CodeLang, from: Zone, inputIso: string, expectedIso: string): Snippet {
  return BUILDERS[lang](from, inputIso, expectedIso);
}
