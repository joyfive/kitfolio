"use client";

import { useMemo, useRef, useState } from "react";
import PageHead from "./PageHead";
import { useT, type Dict } from "../lib/i18n";

// 컨트롤 마이크로카피만 로컬 dict. 페이지 SEO 카피(제목·설명·가이드)는 content.ts.
const DICT: Dict = {
  ko: {
    "json.indent": "들여쓰기",
    "json.format": "포맷",
    "json.minify": "압축",
    "json.status.idle": "입력 대기 중",
    "json.status.valid": "유효한 JSON",
    "json.status.invalid": "문법 오류",
    "json.lines": "줄",
    "json.keys": "키",
  },
  en: {
    "json.indent": "Indent",
    "json.format": "Format",
    "json.minify": "Minify",
    "json.status.idle": "Waiting for input",
    "json.status.valid": "Valid JSON",
    "json.status.invalid": "Syntax error",
    "json.lines": "lines",
    "json.keys": "keys",
  },
};

const SAMPLE = `{"service":"Kitfolio","version":2,"free":true,"tools":[{"id":"json-formatter","theme":"IDE","ready":true},{"id":"css-gradient","theme":"Canvas","ready":true},{"id":"character-counter","theme":"Clean","ready":true}],"meta":{"clientSide":true,"trackingApi":null,"locales":["ko","en"]}}`;

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlight(json: string) {
  json = escapeHtml(json);
  return json
    .replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false)\b|\bnull\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (m) => {
        let cls = "tok-num";
        if (/^"/.test(m)) cls = /:$/.test(m) ? "tok-key" : "tok-str";
        else if (/true|false/.test(m)) cls = "tok-bool";
        else if (/null/.test(m)) cls = "tok-null";
        return `<span class="${cls}">${m}</span>`;
      },
    )
    .replace(/([{}\[\],])/g, '<span class="tok-punc">$1</span>');
}

function posToLineCol(text: string, pos: number) {
  const upto = text.slice(0, pos);
  const line = upto.split("\n").length;
  const col = pos - upto.lastIndexOf("\n");
  return { line, col };
}

function countKeys(obj: unknown): number {
  let n = 0;
  (function walk(o: unknown) {
    if (o && typeof o === "object") {
      if (Array.isArray(o)) o.forEach(walk);
      else
        for (const k in o as Record<string, unknown>) {
          n++;
          walk((o as Record<string, unknown>)[k]);
        }
    }
  })(obj);
  return n;
}

function lineNumbers(n: number) {
  let g = "";
  for (let i = 1; i <= n; i++) g += i + "\n";
  return g;
}

export default function JsonFormatter() {
  const t = useT(DICT);

  const [text, setText] = useState(SAMPLE);
  const [indent, setIndent] = useState("2");
  const [mode, setMode] = useState<"format" | "minify">("format");
  const [copied, setCopied] = useState(false);
  const inGutterRef = useRef<HTMLDivElement>(null);

  const result = useMemo(() => {
    const raw = text;
    const inGutter = lineNumbers(raw.split("\n").length || 1);
    const sizeInfo = raw ? `${raw.length.toLocaleString()} B` : "";
    if (!raw.trim()) {
      return {
        status: "idle" as const,
        errDetail: "",
        outputHtml: "",
        outGutter: "",
        outMeta: "",
        inGutter,
        sizeInfo,
        plain: "",
      };
    }
    let obj: unknown;
    try {
      obj = JSON.parse(raw);
    } catch (err) {
      const msg = (err as Error).message;
      const m = /position (\d+)/.exec(msg);
      let detail = msg.replace(/^JSON\.parse:?\s*/, "");
      if (m) {
        const { line, col } = posToLineCol(raw, Number(m[1]));
        detail = `${detail}  ·  line ${line}, col ${col}`;
      }
      return {
        status: "err" as const,
        errDetail: detail,
        outputHtml: `<span style="color:#e06464">// ${escapeHtml(detail)}</span>`,
        outGutter: "",
        outMeta: "",
        inGutter,
        sizeInfo,
        plain: "",
      };
    }
    const indentVal =
      mode === "minify" ? 0 : indent === "tab" ? "\t" : Number(indent);
    const formatted = JSON.stringify(obj, null, indentVal);
    const lines = formatted.split("\n").length;
    const keys = countKeys(obj);
    return {
      status: "ok" as const,
      errDetail: "",
      outputHtml: highlight(formatted),
      outGutter: lineNumbers(lines),
      outMeta: `${lines} ${t("json.lines")} · ${keys} ${t("json.keys")}`,
      inGutter,
      sizeInfo,
      plain: formatted,
    };
  }, [text, indent, mode, t]);

  const statusKey =
    result.status === "ok"
      ? "json.status.valid"
      : result.status === "err"
        ? "json.status.invalid"
        : "json.status.idle";

  async function copyOut() {
    if (!result.plain) return;
    try {
      await navigator.clipboard.writeText(result.plain);
    } catch {
      /* ignore */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  }

  return (
    <>
      <PageHead slug="json-formatter" />

      <div className="ide">
          <div className="ide-bar">
            <div className="ide-title">
              <span className="dot" />
              <span className="name">JSON Formatter</span>
              <span className="path">/json-formatter</span>
            </div>
            <div className="spacer" />
            <label className="field">
              <span>{t("json.indent")}</span>
              <select
                className="ide-select"
                value={indent}
                onChange={(e) => {
                  setIndent(e.target.value);
                  setMode("format");
                }}
              >
                <option value="2">2 spaces</option>
                <option value="4">4 spaces</option>
                <option value="tab">Tab</option>
              </select>
            </label>
            <button
              className="btn-ide primary"
              onClick={() => setMode("format")}
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path d="M2.5 4h11M2.5 8h7M2.5 12h9" />
              </svg>
              <span>{t("json.format")}</span>
            </button>
            <button className="btn-ide" onClick={() => setMode("minify")}>
              <span>{t("json.minify")}</span>
            </button>
          </div>

          <div className="panes">
            <div className="pane pane-in">
              <div className="pane-head">
                <span className="pane-tab">
                  <span className="tab-dot" />
                  input.json
                </span>
                <span className="spacer" />
                <button
                  className="pane-act"
                  onClick={() => {
                    setText(SAMPLE);
                    setMode("format");
                  }}
                >
                  {t("common.sample")}
                </button>
                <button
                  className="pane-act"
                  onClick={() => {
                    setText("");
                    setMode("format");
                  }}
                >
                  {t("common.clear")}
                </button>
              </div>
              <div className="pane-body">
                <div className="in-gutter" ref={inGutterRef}>
                  {result.inGutter}
                </div>
                <textarea
                  className="code-in"
                  spellCheck={false}
                  placeholder='{ "paste": "your JSON here" }'
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setMode("format");
                  }}
                  onScroll={(e) => {
                    if (inGutterRef.current)
                      inGutterRef.current.style.transform = `translateY(${-(e.target as HTMLTextAreaElement).scrollTop}px)`;
                  }}
                />
              </div>
            </div>

            <div className="pane pane-out">
              <div className="pane-head">
                <span className="pane-tab">
                  <span
                    className="tab-dot"
                    style={{ background: "var(--color-blue-primary-500)" }}
                  />
                  output.json
                </span>
                <span className="spacer" />
                <span className="pane-meta">{result.outMeta}</span>
                <button
                  className={"pane-act" + (copied ? " copied-flash" : "")}
                  onClick={copyOut}
                >
                  {copied ? t("common.copied") : t("common.copy")}
                </button>
              </div>
              <div className="pane-body">
                <div className="code-out">
                  <div className="gutter">{result.outGutter}</div>
                  <pre
                    className="code-pre"
                    dangerouslySetInnerHTML={{ __html: result.outputHtml }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="ide-status">
            <span className={"status-pill " + result.status}>
              <span>{t(statusKey)}</span>
            </span>
            <span className="err-detail">{result.errDetail}</span>
            <span className="spacer" />
            <span>{result.sizeInfo}</span>
          </div>
      </div>
    </>
  );
}
