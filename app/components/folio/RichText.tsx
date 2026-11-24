import { Fragment } from "react";
import type { ListItem, Rich } from "../../lib/folio/types";

/** 문자열 안 `**강조**` → <b class="em">. 그 외는 평문 (HTML 주입 없음). */
export function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") && p.length > 4 ? (
          <b key={i} className="em">
            {p.slice(2, -2)}
          </b>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}

/** 대시 리스트: 항목은 문자열 또는 1단계 중첩 */
export function DashList({ items, className }: { items: ListItem[]; className?: string }) {
  return (
    <ul className={className ? `dash ${className}` : "dash"}>
      {items.map((it, i) =>
        typeof it === "string" ? (
          <li key={i}>
            <Inline text={it} />
          </li>
        ) : (
          <li key={i}>
            <Inline text={it.text} />
            {it.children && it.children.length > 0 && (
              <ul className="dash">
                {it.children.map((c, j) => (
                  <li key={j}>
                    <Inline text={c} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ),
      )}
    </ul>
  );
}

/** 문자열이면 문단, 배열이면 리스트 */
export function TextOrList({ value, pClass }: { value?: Rich; pClass?: string }) {
  if (!value) return null;
  if (Array.isArray(value)) return <DashList items={value} />;
  return (
    <p className={pClass}>
      <Inline text={value} />
    </p>
  );
}
