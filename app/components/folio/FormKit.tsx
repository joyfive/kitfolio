"use client";

/* 폼 에디터 공용 입력 부품.
   텍스트 영역은 마운트 시점 값으로 로컬 상태를 만든다: 입력 중인 "- " 같은 미완성 줄이
   변환 왕복에서 사라지지 않게 하기 위해서다. 문서를 바꾸거나 yml 탭에서 돌아오면
   폼 전체가 다시 마운트되어 새 값으로 초기화된다. */
import { useId, useRef, useState, type ReactNode } from "react";
import type { ListItem, Rich } from "../../lib/folio/types";
import { FOLIO_FONTS, resolveFont } from "../../lib/folio/fonts";
import { useLang } from "../../lib/i18n";
import { linesToText, listToText, richToText, textToLines, textToList, textToRich } from "../../lib/folio/text";

export type Obj = Record<string, unknown>;

export const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);
export const asObj = (v: unknown): Obj => (isObj(v) ? v : {});
export const asArr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
export const asStr = (v: unknown): string => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");

/** 값이 비면 키를 지운다 (yml 을 짧게 유지) */
export function setKey(o: Obj, key: string, v: unknown): Obj {
  const next = { ...o };
  const empty = v === undefined || v === "" || (Array.isArray(v) && v.length === 0);
  if (empty) delete next[key];
  else next[key] = v;
  return next;
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  type?: "text" | "number" | "url" | "email";
  inputMode?: "numeric" | "text";
}) {
  const id = useId();
  return (
    <div className="fb-field">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <p className="fb-hint">{hint}</p>}
    </div>
  );
}

/** 미니 에디터 서식: 선택한 글자를 표기로 감싼다 (RichText 의 Inline 이 렌더) */
const FORMATS = [
  { key: "bold", mark: "**", glyph: "B", label: { ko: "굵게", en: "Bold" }, hotkey: "b" },
  { key: "italic", mark: "*", glyph: "I", label: { ko: "기울임", en: "Italic" }, hotkey: "i" },
  { key: "underline", mark: "++", glyph: "U", label: { ko: "밑줄", en: "Underline" }, hotkey: "u" },
] as const;

function TextArea({
  label,
  hint,
  initial,
  onText,
  rows = 3,
  mono,
  placeholder,
}: {
  label: string;
  hint?: string;
  initial: string;
  onText: (t: string) => void;
  rows?: number;
  mono?: boolean;
  placeholder?: string;
}) {
  const id = useId();
  const { lang } = useLang();
  const ref = useRef<HTMLTextAreaElement>(null);
  const [text, setText] = useState(initial);
  const change = (next: string) => {
    setText(next);
    onText(next);
  };

  /** 선택 영역을 mark 로 감싼다. 이미 감싸져 있으면 벗긴다. 선택이 없으면 자리표시 글자를 넣고 선택한다. */
  function wrap(mark: string) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const before = text.slice(0, s);
    const after = text.slice(e);
    let next: string;
    let selS: number;
    let selE: number;
    if (s !== e && before.endsWith(mark) && after.startsWith(mark) && !(mark === "*" && before.endsWith("**"))) {
      next = before.slice(0, -mark.length) + text.slice(s, e) + after.slice(mark.length);
      selS = s - mark.length;
      selE = e - mark.length;
    } else {
      const inner = text.slice(s, e) || (lang === "ko" ? "텍스트" : "text");
      next = before + mark + inner + mark + after;
      selS = s + mark.length;
      selE = selS + inner.length;
    }
    change(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(selS, selE);
    });
  }

  return (
    <div className="fb-field">
      <label htmlFor={id}>{label}</label>
      {!mono && (
        <div className="sm-md-bar fb-md-bar" role="toolbar" aria-label={`${label}: ${lang === "ko" ? "서식" : "formatting"}`}>
          {FORMATS.map((f) => (
            <button
              key={f.key}
              type="button"
              className={`sm-md-btn fb-md-${f.key}`}
              title={`${f.label[lang]} (Ctrl/⌘+${f.hotkey.toUpperCase()})`}
              aria-label={f.label[lang]}
              aria-controls={id}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => wrap(f.mark)}
            >
              {f.glyph}
            </button>
          ))}
        </div>
      )}
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        value={text}
        placeholder={placeholder}
        className={mono ? "is-mono" : "fb-md-input"}
        spellCheck={!mono}
        onChange={(e) => change(e.target.value)}
        onKeyDown={(e) => {
          if (mono || !(e.metaKey || e.ctrlKey) || e.shiftKey || e.altKey) return;
          const f = FORMATS.find((x) => x.hotkey === e.key.toLowerCase());
          if (!f) return;
          e.preventDefault();
          wrap(f.mark);
        }}
      />
      {hint && <p className="fb-hint">{hint}</p>}
    </div>
  );
}

/** 여러 줄 평문 (문단 하나 또는 mermaid 코드) */
export function Area(props: {
  label: string;
  value: unknown;
  onChange: (v: string) => void;
  hint?: string;
  rows?: number;
  mono?: boolean;
  placeholder?: string;
}) {
  return <TextArea {...props} initial={asStr(props.value)} onText={(t) => props.onChange(t)} />;
}

/** 문단 또는 리스트: "- " 로 시작하는 줄이 있으면 리스트 */
export function RichArea({
  label,
  value,
  onChange,
  hint,
  rows = 3,
}: {
  label: string;
  value: unknown;
  onChange: (v: Rich | undefined) => void;
  hint?: string;
  rows?: number;
}) {
  return <TextArea label={label} hint={hint} rows={rows} initial={richToText(value)} onText={(t) => onChange(textToRich(t))} />;
}

/** 항상 리스트: 한 줄 = 한 항목, 2칸 이상 들여쓰면 하위 항목 */
export function ListArea({
  label,
  value,
  onChange,
  hint,
  rows = 3,
}: {
  label: string;
  value: unknown;
  onChange: (v: ListItem[] | undefined) => void;
  hint?: string;
  rows?: number;
}) {
  return (
    <TextArea
      label={label}
      hint={hint}
      rows={rows}
      initial={listToText(value)}
      onText={(t) => {
        const list = textToList(t);
        onChange(list.length ? list : undefined);
      }}
    />
  );
}

/** 한 줄 = 한 문자열 */
export function LinesArea({
  label,
  value,
  onChange,
  hint,
  rows = 3,
}: {
  label: string;
  value: unknown;
  onChange: (v: string[] | undefined) => void;
  hint?: string;
  rows?: number;
}) {
  return (
    <TextArea
      label={label}
      hint={hint}
      rows={rows}
      initial={linesToText(value)}
      onText={(t) => {
        const lines = textToLines(t);
        onChange(lines.length ? lines : undefined);
      }}
    />
  );
}

/** 빈 줄로 나눈 문단들 */
export function ParagraphsArea({
  label,
  value,
  onChange,
  hint,
  rows = 4,
}: {
  label: string;
  value: unknown;
  onChange: (v: string[] | undefined) => void;
  hint?: string;
  rows?: number;
}) {
  const initial = Array.isArray(value) ? value.map(asStr).join("\n\n") : asStr(value);
  return (
    <TextArea
      label={label}
      hint={hint}
      rows={rows}
      initial={initial}
      onText={(t) => {
        const ps = t
          .replace(/\r\n?/g, "\n")
          .split(/\n\s*\n/)
          .map((p) => p.trim())
          .filter(Boolean);
        onChange(ps.length ? ps : undefined);
      }}
    />
  );
}

export function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="fb-check">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

export function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const id = useId();
  const valid = /^#[0-9a-f]{6}$/i.test(value);
  return (
    <div className="fb-field">
      <label htmlFor={id}>{label}</label>
      <div className="fb-color">
        <input type="color" aria-label={label} value={valid ? value : "#2d5dc8"} onChange={(e) => onChange(e.target.value.toUpperCase())} />
        <input id={id} type="text" value={value} spellCheck={false} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}

/** 문서 글꼴 선택 (yml 의 font 키) */
export function FontField({ label, hint, value, onChange }: { label: string; hint?: string; value: unknown; onChange: (v: string) => void }) {
  const id = useId();
  const { lang } = useLang();
  return (
    <div className="fb-field">
      <label htmlFor={id}>{label}</label>
      <select id={id} value={resolveFont(value).id} onChange={(e) => onChange(e.target.value)}>
        {FOLIO_FONTS.map((f) => (
          <option key={f.id} value={f.id}>
            {f.label[lang]}
          </option>
        ))}
      </select>
      {hint && <p className="fb-hint">{hint}</p>}
    </div>
  );
}

/** 접는 섹션 (details/summary: 키보드·스크린리더 기본 지원) */
export function Section({ title, note, children, open }: { title: string; note?: string; children: ReactNode; open?: boolean }) {
  return (
    <details className="fb-sec" open={open}>
      <summary>
        <span>{title}</span>
        {note && <em>{note}</em>}
      </summary>
      <div className="fb-sec-body">{children}</div>
    </details>
  );
}

let idSeq = 0;
const nextKey = () => `k${++idSeq}`;

/** 객체 배열 편집: 추가 · 삭제 · 위/아래 이동. 항목 key 는 편집 세션 동안 유지한다. */
export function ListEditor<T>({
  label,
  items,
  onChange,
  make,
  itemTitle,
  render,
  addLabel,
  t,
}: {
  label: string;
  items: T[];
  onChange: (next: T[] | undefined) => void;
  make: () => T;
  itemTitle: (item: T, index: number) => string;
  render: (item: T, set: (next: T) => void, index: number) => ReactNode;
  addLabel: string;
  t: (k: string) => string;
}) {
  const keys = useRef<string[]>([]);
  while (keys.current.length < items.length) keys.current.push(nextKey());
  if (keys.current.length > items.length) keys.current.length = items.length;

  const emit = (next: T[]) => onChange(next.length ? next : undefined);
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    const k = keys.current;
    [k[i], k[j]] = [k[j], k[i]];
    emit(next);
  };
  const remove = (i: number) => {
    keys.current.splice(i, 1);
    emit(items.filter((_, x) => x !== i));
  };

  return (
    <div className="fb-list">
      <div className="fb-list-head">{label}</div>
      {items.map((item, i) => {
        const title = itemTitle(item, i);
        return (
          <div className="fb-item" key={keys.current[i]}>
            <div className="fb-item-head">
              <span className="fb-item-no">{i + 1}</span>
              <span className="fb-item-title">{title}</span>
              <span className="fb-item-tools">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`${title}: ${t("fb.up")}`}>
                  ↑
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label={`${title}: ${t("fb.down")}`}>
                  ↓
                </button>
                <button type="button" onClick={() => remove(i)} aria-label={`${title}: ${t("fb.remove")}`}>
                  ✕
                </button>
              </span>
            </div>
            <div className="fb-item-body">
              {render(item, (next) => emit(items.map((x, xi) => (xi === i ? next : x))), i)}
            </div>
          </div>
        );
      })}
      <button
        type="button"
        className="btn btn-sm btn-outline fb-add"
        onClick={() => {
          keys.current.push(nextKey());
          emit([...items, make()]);
        }}
      >
        + {addLabel}
      </button>
    </div>
  );
}
