/* ============================================================
   약관·개인정보처리방침 개정 이력 테스트

   현행(content.ts LEGAL) + 이전 버전(legal-archive.ts)이 시행일 내림차순으로 이어지고,
   각 이전 버전의 시행 종료일이 다음 개정 전날로 맞물리는지 확인한다.
   ============================================================ */
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  LEGAL_REVISION,
  POLICY_SLUGS,
  formatLegalDate,
  legalVersionHref,
  legalVersions,
} from "../content.ts";

describe("legalVersions", () => {
  for (const slug of POLICY_SLUGS) {
    test(`${slug}: 현행이 맨 앞이고 시행일이 내림차순·중복 없음`, () => {
      const v = legalVersions(slug);
      assert.ok(v.length >= 2);
      assert.equal(v[0].id, LEGAL_REVISION.id);
      assert.ok(v[0].current && v.slice(1).every((x) => !x.current));
      for (let i = 1; i < v.length; i++) assert.ok(v[i].id < v[i - 1].id, `${v[i].id} < ${v[i - 1].id}`);
    });

    test(`${slug}: 이전 버전의 시행 종료일은 다음 개정 전날`, () => {
      const v = legalVersions(slug);
      assert.equal(v[0].until, undefined);
      assert.equal(v[1].until, "2026-10-23");
      assert.equal(v[2].until, "2026-08-15");
    });

    test(`${slug}: 모든 버전이 ko·en 문서와 개정 요약을 갖는다`, () => {
      for (const x of legalVersions(slug))
        for (const lang of ["ko", "en"] as const) {
          assert.ok(x.doc[lang].title && x.doc[lang].sections.length > 0, `${x.id} ${lang}`);
          assert.ok(x.summary[lang], `${x.id} ${lang} summary`);
        }
    });
  }

  test("이전 버전 URL 은 /<slug>/<시행일>, 현행은 /<slug>", () => {
    assert.equal(legalVersionHref("privacy-policy", "ko", LEGAL_REVISION.id), "/privacy-policy");
    assert.equal(legalVersionHref("privacy-policy", "en", "2026-08-16"), "/en/privacy-policy/2026-08-16");
  });

  test("버전 라우트 파일이 KO·EN 에 있다", () => {
    for (const slug of POLICY_SLUGS)
      for (const base of ["app", "app/en"])
        assert.ok(fs.existsSync(path.join(process.cwd(), base, slug, "[version]", "page.tsx")), `${base}/${slug}`);
  });

  test("날짜 표기", () => {
    assert.equal(formatLegalDate("2026-08-16", "ko"), "2026년 8월 16일");
    assert.equal(formatLegalDate("2026-08-16", "en"), "August 16, 2026");
  });
});
