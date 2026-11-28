import { Fragment, type ReactNode } from "react";
import type { ListItem, Rich } from "../../lib/folio/types";

/* 인라인 서식 (폼 미니 에디터의 버튼과 같은 표기):
   **굵게** → <b class="em"> · *기울임* → <i> · ++밑줄++ → <u>. 안쪽에 다른 서식을 겹칠 수 있다.
   HTML 은 해석하지 않는다 (텍스트 노드로만 렌더). */
const FORMAT = /\*\*(.+?)\*\*|\+\+(.+?)\+\+|\*(?![\s*])([^*]+?)\*/g;

function Emphasis({ text }: { text: string }): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  let k = 0;
  for (const m of text.matchAll(FORMAT)) {
    const at = m.index ?? 0;
    if (at > last) out.push(<Fragment key={k++}>{text.slice(last, at)}</Fragment>);
    if (m[1] !== undefined)
      out.push(
        <b key={k++} className="em">
          <Emphasis text={m[1]} />
        </b>,
      );
    else if (m[2] !== undefined)
      out.push(
        <u key={k++}>
          <Emphasis text={m[2]} />
        </u>,
      );
    else
      out.push(
        <i key={k++}>
          <Emphasis text={m[3]} />
        </i>,
      );
    last = at + m[0].length;
  }
  if (last < text.length) out.push(<Fragment key={k++}>{text.slice(last)}</Fragment>);
  return <>{out}</>;
}

/** 문장 렌더: 입력한 줄바꿈(\n)을 <br> 로 살리고, 줄마다 서식(굵게·기울임·밑줄)을 적용한다.
 *  앞뒤 빈 줄은 버린다 (yml 블록 스칼라의 끝 줄바꿈 등). */
export function Inline({ text }: { text: string }) {
  const lines = text.replace(/\r\n?/g, "\n").replace(/^\n+|\n+$/g, "").split("\n");
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          <Emphasis text={line} />
        </Fragment>
      ))}
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
