/* ============================================================
   HTML 접근성 검사기: 헤딩 트리 · 랜드마크 (기획서 4.5 · 5.3 · 5.4)

   랜드마크 역할은 명시적 role 속성과 native element 의 암시적 역할을 함께
   인식한다. 다만 header·footer 의 암시적 역할(banner·contentinfo)은 중첩
   문맥에 따라 달라지므로, 정적으로 확실할 때만 적용하고 불확실하면
   ambiguous 로 표시해 판정에서 제외한다.
   ============================================================ */
import {
  attr,
  closest,
  elementPath,
  hasAttr,
  isSvg,
  locationOf,
  tag,
  visibleText,
  type Element,
} from "./ast";
import { explicitRole, nameSignal, type NameContext } from "./name";
import type { HeadingRow, LandmarkRow, Scope } from "./types";

/* ---------- 헤딩 ---------- */

export type HeadingInfo = {
  el: Element;
  /** 유효한 단계 (1~6). role="heading" 에 유효한 aria-level 이 없으면 null */
  level: number | null;
  aria: boolean;
  name: string;
};

const HEADING_TAGS = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

export function isHeading(el: Element): boolean {
  if (isSvg(el)) return false;
  return HEADING_TAGS.has(tag(el)) || explicitRole(el) === "heading";
}

export function collectHeadings(elements: Element[], ctx: NameContext): HeadingInfo[] {
  const out: HeadingInfo[] = [];
  for (const el of elements) {
    if (!isHeading(el)) continue;
    const name = tag(el);
    const native = HEADING_TAGS.has(name) ? Number(name.slice(1)) : null;
    const ariaRole = explicitRole(el) === "heading";
    let level = native;
    if (ariaRole) {
      const raw = (attr(el, "aria-level") ?? "").trim();
      const parsed = /^\d+$/.test(raw) ? Number(raw) : NaN;
      level = Number.isInteger(parsed) && parsed >= 1 ? parsed : native;
    }
    out.push({
      el,
      level: level ?? null,
      aria: ariaRole,
      name: nameSignal(el, ctx).name || visibleText(el),
    });
  }
  return out;
}

/** 헤딩 트리 행: 두 단계 이상 내려간 자리에 레벨 건너뜀 표시.
 *  상위 단계로 돌아가는 것은 섹션 종료일 수 있으므로 표시하지 않는다. */
export function headingRows(headings: HeadingInfo[]): HeadingRow[] {
  const rows: HeadingRow[] = [];
  let previous: number | null = null;
  for (const h of headings) {
    const level = h.level;
    const skipped = level !== null && previous !== null && level > previous + 1;
    const loc = locationOf(h.el);
    rows.push({
      level: level ?? 0,
      name: h.name,
      skipped,
      aria: h.aria,
      path: elementPath(h.el),
      line: loc?.line,
      column: loc?.column,
    });
    if (level !== null) previous = level;
  }
  return rows;
}

/* ---------- 랜드마크 ---------- */

export const LANDMARK_ROLES = [
  "banner",
  "navigation",
  "main",
  "complementary",
  "contentinfo",
  "search",
  "form",
  "region",
] as const;

export type LandmarkRole = (typeof LANDMARK_ROLES)[number];

const LANDMARK_ROLE_SET = new Set<string>(LANDMARK_ROLES);

/** header·footer 의 암시적 역할을 없애는 조상 (sectioning content + main) */
const SECTIONING = new Set(["article", "aside", "main", "nav", "section"]);

export type LandmarkInfo = {
  el: Element;
  role: LandmarkRole;
  name: string;
  implicit: boolean;
  ambiguous: boolean;
};

export function collectLandmarks(
  elements: Element[],
  ctx: NameContext,
  scope: Scope,
): LandmarkInfo[] {
  const out: LandmarkInfo[] = [];
  for (const el of elements) {
    if (isSvg(el)) continue;
    const name = nameSignal(el, ctx).name;
    const role = explicitRole(el);

    if (role && LANDMARK_ROLE_SET.has(role)) {
      out.push({
        el,
        role: role as LandmarkRole,
        name,
        implicit: false,
        ambiguous: false,
      });
      continue;
    }
    if (role) continue; // 다른 역할로 덮어썼다면 암시적 랜드마크는 노출되지 않는다

    const t = tag(el);
    if (t === "nav") out.push({ el, role: "navigation", name, implicit: true, ambiguous: false });
    else if (t === "main") out.push({ el, role: "main", name, implicit: true, ambiguous: false });
    else if (t === "aside")
      out.push({ el, role: "complementary", name, implicit: true, ambiguous: false });
    else if (t === "search") out.push({ el, role: "search", name, implicit: true, ambiguous: false });
    else if (t === "section" && name)
      out.push({ el, role: "region", name, implicit: true, ambiguous: false });
    else if (t === "form" && name)
      out.push({ el, role: "form", name, implicit: true, ambiguous: false });
    else if (t === "header" || t === "footer") {
      const nested = closest(el, (e) => SECTIONING.has(tag(e)));
      if (nested) continue; // 섹션 안의 header·footer 는 랜드마크가 아니다
      // 조각 검사에서는 이 조각이 페이지의 어디에 들어갈지 알 수 없다
      const ambiguous = scope === "fragment";
      out.push({
        el,
        role: t === "header" ? "banner" : "contentinfo",
        name,
        implicit: true,
        ambiguous,
      });
    }
  }
  return out;
}

/** 숨김 처리되어 노출되지 않는 랜드마크는 개수 판정에서 뺀다 */
export function isExposed(el: Element): boolean {
  if (hasAttr(el, "hidden") || attr(el, "aria-hidden") === "true") return false;
  return closest(el, (e) => hasAttr(e, "hidden") || attr(e, "aria-hidden") === "true") === null;
}

export function landmarkRows(landmarks: LandmarkInfo[]): LandmarkRow[] {
  return landmarks.map((l) => {
    const loc = locationOf(l.el);
    return {
      role: l.role,
      name: l.name,
      implicit: l.implicit,
      ambiguous: l.ambiguous,
      path: elementPath(l.el),
      line: loc?.line,
      column: loc?.column,
    };
  });
}
