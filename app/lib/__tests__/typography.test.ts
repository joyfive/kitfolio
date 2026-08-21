/* ============================================================
   문장부호 규칙 검사 (저장소 전체)

   엠대시(U+2014)와 엔대시(U+2013)는 쓰지 않는다.
   · 라벨과 설명을 잇는 자리  → 콜론(:)
   · 같은 층위의 항목 나열     → 가운뎃점(·)
   · 숫자 범위                → 물결(~, 국문) 또는 하이픈(-, 영문)

   화면 카피·주석·문서 어디에서든 다시 섞여 들어오는 것을 막는다.
   이 파일이 스스로 걸리지 않도록 대시는 유니코드 이스케이프로만 표기한다.
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const EXTS = [".ts", ".tsx", ".md", ".css"];
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "out", "build"]);
const EM_DASH = "\u2014"; // em dash
const EN_DASH = "\u2013"; // en dash

function sourceFiles(dir: string, found: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) sourceFiles(path.join(dir, entry.name), found);
    } else if (EXTS.some((e) => entry.name.endsWith(e))) {
      found.push(path.join(dir, entry.name));
    }
  }
  return found;
}

describe("문장부호", () => {
  test("엠대시·엔대시를 쓰지 않는다", () => {
    const root = process.cwd();
    const offenders: string[] = [];

    for (const file of sourceFiles(root)) {
      const raw = fs.readFileSync(file, "utf8");
      if (!raw.includes(EM_DASH) && !raw.includes(EN_DASH)) continue;
      raw.split("\n").forEach((line, i) => {
        if (line.includes(EM_DASH) || line.includes(EN_DASH)) {
          offenders.push(`${path.relative(root, file)}:${i + 1}`);
        }
      });
    }

    assert.deepEqual(
      offenders,
      [],
      `대시 사용 (콜론·가운뎃점·물결로 바꾸세요):\n  ${offenders.join("\n  ")}`,
    );
  });
});
