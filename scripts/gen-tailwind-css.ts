/* ============================================================
   Tailwind 기본 stylesheet 를 TS 모듈로 굽는 스크립트

     npm run gen:tailwind-css

   텍스트 확대·간격 검사기의 Tailwind 모드는 브라우저 안에서
   `tailwindcss` 의 compile() 을 직접 돌린다. 그 입력이 되는
   `tailwindcss/index.css` (테마 토큰 + preflight + @tailwind utilities)는
   CSS 파일이라 클라이언트 번들에 문자열로 들어갈 수 없다.
   그래서 설치된 패키지에서 읽어 TS 모듈로 굽고 그 결과를 커밋한다.

   tailwindcss 버전을 올린 뒤에는 이 스크립트를 다시 실행한다.
   ============================================================ */
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const require = createRequire(import.meta.url);
const pkgPath = require.resolve("tailwindcss/package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version: string };
const indexCss = readFileSync(resolve(dirname(pkgPath), "index.css"), "utf8");

/** 템플릿 리터럴 안에서 문자 그대로 남아야 하는 것들만 이스케이프한다 */
function escapeTemplate(css: string): string {
  return css.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}

const out = `/* ============================================================
   Tailwind 기본 stylesheet (자동 생성 · 직접 수정하지 않는다)

     생성: npm run gen:tailwind-css
     원본: node_modules/tailwindcss/index.css

   테마 토큰(@theme default) · preflight(@layer base) · @tailwind utilities
   세 부분이 한 파일에 들어 있어 추가 @import 해석 없이 compile() 에
   그대로 넣을 수 있다.
   ============================================================ */

/** 이 문자열을 구운 tailwindcss 버전 */
export const TAILWIND_VERSION = ${JSON.stringify(pkg.version)};

/** \`@import "tailwindcss"\` 와 같은 내용 */
export const TAILWIND_INDEX_CSS = \`${escapeTemplate(indexCss)}\`;
`;

const here = dirname(fileURLToPath(import.meta.url));
const target = resolve(here, "../app/lib/textscale/tailwind-css.ts");
writeFileSync(target, out, "utf8");
console.log(`tailwindcss ${pkg.version} · ${indexCss.length.toLocaleString()}자 → ${target}`);
