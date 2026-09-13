/* ============================================================
   텍스트 확대·간격 검사기: Tailwind CSS 모드

   Tailwind 를 쓰는 화면은 마크업에 클래스 이름만 있고 스타일 규칙이 없다.
   그대로 preview 에 넣으면 아무 스타일도 적용되지 않아 확대·리플로 검사가
   무의미해진다. 그래서 마크업에서 모은 클래스 후보로 CSS 를 직접 만든다.

   생성은 브라우저 안에서 `tailwindcss` 패키지의 compile() 로 한다.
   CDN 스크립트나 빌드 서버를 부르지 않는다: 입력한 코드는 이 페이지 밖으로
   나가지 않는다는 도구의 전제가 Tailwind 모드에서도 그대로 유지된다.

   사용자 CSS 는 Tailwind 기본 stylesheet 뒤에 이어 붙여 함께 컴파일한다.
   그래야 프로젝트의 @theme 토큰·@utility·@apply 가 실제 프로젝트와 같은
   의미로 동작한다. (이어 붙인 규칙은 layer 밖이라 utilities 보다 우선한다:
   실제 Tailwind v4 프로젝트에서 import 뒤에 쓴 CSS 와 같은 순서다.)
   ============================================================ */
import { compile } from "tailwindcss";
import { stripCssResources } from "./srcdoc";
import { TAILWIND_INDEX_CSS, TAILWIND_VERSION } from "./tailwind-css";

/** CSS 를 만들지 않는 것이 정상인 클래스: 변형(variant)의 표식으로만 쓰인다 */
const MARKER_CLASSES = /^(group|peer)(\/[^\s]+)?$/;

/** 미인식 클래스는 안내용이라 전부 나열하지 않는다 */
export const MAX_REPORTED_UNKNOWN = 12;

/** 클래스 하나씩 확인하는 비용이 의미 있어지는 지점. 넘으면 한 번에 만든다. */
const PER_CLASS_LIMIT = 400;

export type TailwindResult = {
  /** preview 에 넣을 stylesheet (Tailwind 기본 + 생성된 utilities + 사용자 CSS) */
  css: string;
  /** CSS 가 만들어지지 않은 클래스 (최대 MAX_REPORTED_UNKNOWN 개) */
  unknown: string[];
  /** 보고 한도를 넘어 생략한 미인식 클래스 수 */
  unknownMore: number;
  version: string;
};

/** 같은 CSS 로 여러 번 만들 때 compile() 을 다시 돌리지 않는다 (프리셋 전환 등) */
let cache: { key: string; compiler: Awaited<ReturnType<typeof compile>> } | null = null;

async function compilerFor(userCss: string) {
  if (cache && cache.key === userCss) return cache.compiler;
  const source = userCss ? `${TAILWIND_INDEX_CSS}\n${userCss}` : TAILWIND_INDEX_CSS;
  const compiler = await compile(source, { base: "/" });
  cache = { key: userCss, compiler };
  return compiler;
}

/**
 * 클래스 후보와 사용자 CSS 로 preview 용 stylesheet 를 만든다.
 *
 * @param classNames 마크업에서 모은 클래스 이름 (중복 포함 가능)
 * @param userCss    CSS 입력 영역의 내용 (@theme·@apply 포함 가능)
 * @throws compile 실패 시 그대로 던진다. 호출자가 일반 CSS 로 되돌린다.
 */
export async function compileTailwind(
  classNames: string[],
  userCss: string,
): Promise<TailwindResult> {
  const safeCss = stripCssResources(userCss).trim();
  // 같은 입력에 대해 항상 같은 결과가 나오도록 순서를 고정한다
  const candidates = [...new Set(classNames)].sort();
  const compiler = await compilerFor(safeCss);

  if (candidates.length === 0) {
    return { css: compiler.build([]), unknown: [], unknownMore: 0, version: TAILWIND_VERSION };
  }

  if (candidates.length > PER_CLASS_LIMIT) {
    return {
      css: compiler.build(candidates),
      unknown: [],
      unknownMore: 0,
      version: TAILWIND_VERSION,
    };
  }

  /* build() 는 지금까지 받은 후보를 누적해 전체 CSS 를 돌려준다.
     하나씩 넣으면서 결과가 길어지지 않은 후보를 "CSS 가 생기지 않은 클래스"로
     본다. 마지막 결과가 곧 전체 후보를 반영한 stylesheet 다. */
  const unknown: string[] = [];
  let css = compiler.build([]);
  for (const candidate of candidates) {
    const next = compiler.build([candidate]);
    if (next.length === css.length && !MARKER_CLASSES.test(candidate)) {
      // 사용자 CSS 가 직접 정의한 클래스는 이미 stylesheet 에 들어 있다
      if (!definedInCss(candidate, safeCss)) unknown.push(candidate);
    }
    css = next;
  }

  return {
    css,
    unknown: unknown.slice(0, MAX_REPORTED_UNKNOWN),
    unknownMore: Math.max(0, unknown.length - MAX_REPORTED_UNKNOWN),
    version: TAILWIND_VERSION,
  };
}

/** 사용자 CSS 가 이 클래스를 선택자로 쓰고 있는가 (미인식 오보를 줄이기 위한 확인) */
export function definedInCss(className: string, css: string): boolean {
  if (!css) return false;
  const escaped = className.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\.\\\\?${escaped}(?![\\w-])`).test(css);
}

export { TAILWIND_VERSION };
