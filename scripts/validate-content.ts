/* ============================================================
   콘텐츠 품질 게이트 실행 스크립트

     npm run validate:content

   indexable=true 인 도구가 검색 랜딩 페이지 최소 구조를 갖췄는지 검사한다.
   실패 시 도구 slug 와 누락 필드를 출력하고 exit code 1 로 종료.
   ============================================================ */
import { TOOLS, validateIndexableTools } from "../app/lib/content.ts";

const issues = validateIndexableTools();
const ready = TOOLS.filter((t) => t.ready);
const indexable = ready.filter((t) => t.indexable);

console.log(
  `도구 ${TOOLS.length}개 · ready ${ready.length}개 · indexable ${indexable.length}개`,
);

if (issues.length === 0) {
  console.log(`✓ indexable 도구 ${indexable.length}개 모두 품질 조건 통과`);
  process.exit(0);
}

console.error(`\n✗ 품질 조건 미달 도구 ${issues.length}개\n`);
for (const { slug, problems } of issues) {
  console.error(`  ${slug}`);
  for (const p of problems) console.error(`    - ${p}`);
  console.error("");
}
console.error(
  "indexable=true 를 유지하려면 위 필드를 채우거나, 해당 도구를 indexable=false 로 내리세요.",
);
process.exit(1);
