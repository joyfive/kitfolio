import type { Block, ListItem } from "../../lib/folio/types";
import { DashList, Inline } from "./RichText";
import Diagram from "./Diagram";

/* 솔루션 섹션의 요소 블록: { type, ...data }. table · diagram · quote · capture · list */
const s = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");

export default function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "list":
      return (
        <div className="pf-list">
          <DashList items={Array.isArray(block.items) ? (block.items as ListItem[]) : []} />
        </div>
      );
    case "text":
      return (
        <p className="pf-text">
          <Inline text={s(block.text)} />
        </p>
      );
    case "diagram":
      return s(block.code) ? <Diagram code={s(block.code)} caption={s(block.caption) || undefined} /> : null;
    case "quote":
      return (
        <blockquote className="pf-quote">
          <Inline text={s(block.text)} />
          {s(block.by) && <cite> · {s(block.by)}</cite>}
        </blockquote>
      );
    case "table":
      return <BlockTable block={block} />;
    case "capture": {
      const src = s(block.src);
      const safe = /^(https?:|data:image\/)/i.test(src) ? src : "";
      return (
        <figure className="pf-capture">
          {safe ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={safe} alt={s(block.caption)} style={s(block.w) ? { width: s(block.w) } : undefined} />
          ) : (
            <div className="pf-capture-empty">image</div>
          )}
          {s(block.caption) && (
            <figcaption>
              <Inline text={s(block.caption)} />
            </figcaption>
          )}
        </figure>
      );
    }
    default:
      return null;
  }
}

function BlockTable({ block }: { block: Block }) {
  const headers = Array.isArray(block.headers) ? block.headers.map(s) : [];
  const rows = Array.isArray(block.rows) ? block.rows.map((r) => (Array.isArray(r) ? r.map(s) : [s(r)])) : [];
  return (
    <figure className="pf-table">
      <table>
        {headers.length > 0 && (
          <thead>
            <tr>
              {headers.map((h, i) => (
                <th key={i}>{h}</th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>
                  <Inline text={c} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {s(block.caption) && (
            <figcaption>
              <Inline text={s(block.caption)} />
            </figcaption>
          )}
    </figure>
  );
}
