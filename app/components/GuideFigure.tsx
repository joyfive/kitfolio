import type { ReactNode } from "react";
import type { FigurePart, GuideFigure as Figure } from "../lib/guide-figures/types";

/** 사용 가이드 도해: 실제 화면 일부를 다시 그린 목업 + 번호 마커 → 번호별 설명.
 *  목업은 그림이므로 보조기기에는 숨기고, 같은 정보를 번호 목록(ol)으로 제공한다. */
export default function GuideFigure({ figure }: { figure: Figure }) {
  return (
    <>
      <figure className="kf-gfig">
        <div className="kf-gfig-stage" aria-hidden="true">
          <div className="kf-gfig-card">
            {figure.parts.map((part, index) => <Part key={index} part={part} />)}
          </div>
        </div>
        <figcaption>{figure.caption}</figcaption>
      </figure>
      <ol className="kf-gfig-notes">
        {figure.notes.map(({ title, body }, index) => (
          <li key={index}>
            <span className="kf-gfig-num" aria-hidden="true">{index + 1}</span>
            <p><strong>{title}</strong>: {body}</p>
          </li>
        ))}
      </ol>
    </>
  );
}

function Part({ part }: { part: FigurePart }) {
  const body = renderPart(part);
  if (!part.m) return body;
  return (
    <div className="kf-gfig-marked">
      <span className="kf-gfig-num kf-gfig-pin">{part.m}</span>
      {body}
    </div>
  );
}

function Field({ label, value, unit, hint, select }: { label: string; value: string; unit?: string; hint?: string; select?: boolean }) {
  return (
    <div className="kf-gfig-field">
      <span className="kf-gfig-label">{label}</span>
      <span className="kf-gfig-input">
        <span className="kf-gfig-value">{value}</span>
        {unit && <span className="kf-gfig-unit">{unit}</span>}
        {select && <span className="kf-gfig-unit">▾</span>}
      </span>
      {hint && <span className="kf-gfig-hint">{hint}</span>}
    </div>
  );
}

function Labeled({ label, children }: { label?: string; children: ReactNode }) {
  return label ? <div className="kf-gfig-field"><span className="kf-gfig-label">{label}</span>{children}</div> : <>{children}</>;
}

function renderPart(part: FigurePart): ReactNode {
  switch (part.t) {
    case "heading":
      return <div className="kf-gfig-heading">{part.text}</div>;
    case "tabs":
      return (
        <Labeled label={part.label}>
          <div className="kf-gfig-tabs">
            {part.items.map((item, i) => <span key={item} className={i === (part.active ?? 0) ? "is-active" : undefined}>{item}</span>)}
          </div>
        </Labeled>
      );
    case "field":
      return <Field {...part} />;
    case "fields":
      return <div className="kf-gfig-grid">{part.items.map((item) => <Field key={item.label} {...item} />)}</div>;
    case "text":
      return (
        <Labeled label={part.label}>
          <span className={"kf-gfig-input kf-gfig-textarea" + (part.mono ? " is-mono" : "")}>{part.value}</span>
        </Labeled>
      );
    case "drop":
      return (
        <div className="kf-gfig-drop">
          <span className="kf-gfig-drop-icon">＋</span>
          <span>{part.title}</span>
          {part.hint && <span className="kf-gfig-hint">{part.hint}</span>}
        </div>
      );
    case "check":
      return <div className="kf-gfig-check"><span className={"kf-gfig-box" + (part.on ? " is-on" : "")}>{part.on ? "✓" : ""}</span>{part.label}</div>;
    case "chips":
      return (
        <Labeled label={part.label}>
          <div className="kf-gfig-chips">
            {part.items.map((item, i) => <span key={item} className={part.active?.includes(i) ? "is-active" : undefined}>{item}</span>)}
          </div>
        </Labeled>
      );
    case "slider":
      return (
        <div className="kf-gfig-field">
          <span className="kf-gfig-label kf-gfig-split">{part.label}<span>{part.value}</span></span>
          <span className="kf-gfig-slider"><span style={{ width: `${part.pct}%` }} /></span>
        </div>
      );
    case "result":
      return (
        <div className="kf-gfig-result">
          <span className="kf-gfig-label">{part.label}{part.badge && <em>{part.badge}</em>}</span>
          <strong>{part.value}</strong>
          {part.sub && <span className="kf-gfig-hint">{part.sub}</span>}
        </div>
      );
    case "stats":
      return (
        <div className="kf-gfig-stats">
          {part.items.map(({ label, value }) => <div key={label}><span className="kf-gfig-label">{label}</span><b>{value}</b></div>)}
        </div>
      );
    case "rows":
      return (
        <div className="kf-gfig-rows">
          {part.title && <span className="kf-gfig-label">{part.title}</span>}
          {part.items.map(({ label, value, tone }) => (
            <div key={label + value}><span>{label}</span><b className={tone ? `is-${tone}` : undefined}>{value}</b></div>
          ))}
        </div>
      );
    case "code":
      return (
        <div className="kf-gfig-code">
          {(part.title || part.tabs) && (
            <div className="kf-gfig-code-head">
              {part.tabs ? part.tabs.map((tab, i) => <span key={tab} className={i === 0 ? "is-active" : undefined}>{tab}</span>) : <span>{part.title}</span>}
            </div>
          )}
          <pre>{part.lines.join("\n")}</pre>
        </div>
      );
    case "swatches":
      return (
        <div className="kf-gfig-swatches" style={{ gridTemplateColumns: `repeat(${part.colors.length}, minmax(0, 1fr))` }}>
          {part.colors.map((color, i) => (
            <span key={color + i} style={{ background: color }}>{part.labels?.[i] && <small>{part.labels[i]}</small>}</span>
          ))}
        </div>
      );
    case "preview":
      return (
        <Labeled label={part.label}>
          <div className="kf-gfig-preview" style={{ background: part.background, aspectRatio: part.ratio ?? "16 / 7" }}>
            {part.caption && <span>{part.caption}</span>}
          </div>
        </Labeled>
      );
    case "pages":
      return (
        <div className="kf-gfig-pages">
          {part.items.map(({ label, state }) => <span key={label} className={state ? `is-${state}` : undefined}>{label}</span>)}
        </div>
      );
    case "buttons":
      return (
        <div className="kf-gfig-buttons">
          {part.items.map((item, i) => <span key={item} className={i === (part.primary ?? part.items.length - 1) ? "is-primary" : undefined}>{item}</span>)}
        </div>
      );
  }
}
