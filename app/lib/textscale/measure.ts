/* ============================================================
   텍스트 확대·간격 검사기: 측정 (기획서 7.2)

   원본·검사 preview 는 같은 source snapshot 으로 만들어지고, 같은
   data-kf-node-id 로 element 를 대응시킨다.

   측정은 반드시 강조 outline 을 그리기 **전에** 끝낸다. outline 을 먼저
   입히면 scrollWidth 와 위치 결과가 달라진다.
   ============================================================ */
import { NODE_ID_ATTR } from "./nodeId";
import { LIMITS, type DocSnapshot, type NodeSnapshot } from "./types";

/** 두 번의 requestAnimationFrame: load 직후의 첫 layout 이 안정된 뒤에 읽는다.
 *  document.fonts.ready 는 외부 font 를 차단한 preview 에서 멈출 수 있어 쓰지 않는다. */
export function afterLayout(view: Window): Promise<void> {
  return new Promise((resolve) => {
    view.requestAnimationFrame(() => view.requestAnimationFrame(() => resolve()));
  });
}

const CONTROL_TAGS = new Set(["button", "input", "select", "textarea"]);

/** stylesheet 안에서 고정 px height·max-height 를 선언한 선택자를 한 번만 모은다.
 *  요소마다 전체 규칙을 다시 훑으면 10,000개 입력에서 비용이 커진다. */
function fixedHeightSelectors(doc: Document): string[] {
  const view = doc.defaultView;
  if (!view) return [];
  const found: string[] = [];
  for (const sheet of Array.from(doc.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      continue; // 접근할 수 없는 stylesheet 는 건너뛴다
    }
    collect(rules);
  }
  return found;

  function collect(rules: CSSRuleList) {
    for (const rule of Array.from(rules)) {
      // @media 안의 규칙도 실제로 적용될 수 있으므로 따라 들어간다
      if ("cssRules" in rule) {
        collect((rule as CSSGroupingRule).cssRules);
        continue;
      }
      if (!(rule instanceof view!.CSSStyleRule)) continue;
      if (isFixedPx(rule.style.height) || isFixedPx(rule.style.maxHeight)) {
        found.push(rule.selectorText);
      }
    }
  }
}

/** 고정 px height 또는 max-height 가 걸려 있는가 (FIXED-001 판정용).
 *  computed height 는 언제나 px 라 판정에 쓸 수 없다: 저자가 명시한 값만 본다. */
function hasFixedHeight(el: HTMLElement, selectors: string[]): boolean {
  if (isFixedPx(el.style.height) || isFixedPx(el.style.maxHeight)) return true;
  for (const selector of selectors) {
    try {
      if (el.matches(selector)) return true;
    } catch {
      // 해석할 수 없는 선택자는 무시한다
    }
  }
  return false;
}

function isFixedPx(value: string): boolean {
  return /^\s*\d+(\.\d+)?px\s*$/.test(value);
}

/** 자신이나 자손이 텍스트를 제공하는가.
 *  기획서 7.4: "텍스트 node 가 없고 자식도 텍스트를 제공하지 않는" 순수 장식 element만
 *  잘림 검사에서 제외한다. 고정 높이 래퍼가 자식 텍스트를 잘라내는 것이야말로
 *  이 도구가 찾으려는 문제이므로, 직접 텍스트 node 유무로 판정하면 안 된다. */
function hasAnyText(el: Element): boolean {
  return (el.textContent ?? "").trim() !== "";
}

/** 결과 카드용 요소 경로. class 는 넣지 않는다: 프로젝트명·상태값이 드러나고 길어진다. */
export function domPath(el: Element): string {
  const parts: string[] = [];
  let cur: Element | null = el;
  while (cur && cur.tagName.toLowerCase() !== "body") {
    const tag = cur.tagName.toLowerCase();
    if (cur.id) {
      parts.unshift(`${tag}#${cur.id}`);
      break;
    }
    const parent: Element | null = cur.parentElement;
    let seg = tag;
    if (parent) {
      const same = Array.from(parent.children).filter(
        (c) => c.tagName.toLowerCase() === tag,
      );
      if (same.length > 1) seg = `${tag}:nth-of-type(${same.indexOf(cur) + 1})`;
    }
    parts.unshift(seg);
    cur = parent;
  }
  const path = parts.join(" > ");
  return path.length > LIMITS.pathChars ? "…" + path.slice(-(LIMITS.pathChars - 1)) : path;
}

/** 결과 카드에 보여줄 짧은 텍스트 미리보기 */
export function textPreview(el: Element): string {
  const raw = (el.textContent ?? "").replace(/\s+/g, " ").trim();
  if (!raw) return "";
  return raw.length > LIMITS.textChars ? raw.slice(0, LIMITS.textChars - 1) + "…" : raw;
}

/** 한 preview 문서의 측정 snapshot 을 만든다 */
export function snapshotDocument(doc: Document, viewport: number): DocSnapshot {
  const view = doc.defaultView;
  const root = doc.documentElement;
  const nodes: NodeSnapshot[] = [];
  if (!view) {
    return { viewport, scrollWidth: 0, clientWidth: 0, nodes };
  }

  const rootRect = root.getBoundingClientRect();
  const fixedSelectors = fixedHeightSelectors(doc);

  for (const el of Array.from(doc.body.querySelectorAll<HTMLElement>(`[${NODE_ID_ATTR}]`))) {
    const id = el.getAttribute(NODE_ID_ATTR);
    if (!id) continue;
    const cs = view.getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    const tag = el.tagName.toLowerCase();
    nodes.push({
      id,
      tag,
      path: domPath(el),
      text: textPreview(el),
      parentId: el.parentElement?.getAttribute(NODE_ID_ATTR) ?? null,
      hasText: hasAnyText(el),
      isControl: CONTROL_TAGS.has(tag),
      clientWidth: el.clientWidth,
      clientHeight: el.clientHeight,
      scrollWidth: el.scrollWidth,
      scrollHeight: el.scrollHeight,
      right: Math.round(rect.right - rootRect.left),
      overflowX: cs.overflowX,
      overflowY: cs.overflowY,
      whiteSpace: cs.whiteSpace,
      fontSizePx: Number.parseFloat(cs.fontSize) || 0,
      fixedHeight: hasFixedHeight(el, fixedSelectors),
    });
  }

  return {
    viewport,
    scrollWidth: root.scrollWidth,
    clientWidth: root.clientWidth,
    nodes,
  };
}
