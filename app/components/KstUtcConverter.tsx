"use client";

import { useState } from "react";
import Faq from "./Faq";
import RelatedTools from "./RelatedTools";
import PageHead from "./PageHead";
import ToolGuide from "./ToolGuide";
import { useT, type Dict } from "../lib/i18n";
import {
  convert,
  formatDate,
  formatInput,
  formatTime,
  nowIn,
  otherZone,
  type Zone,
} from "../lib/kstutc/convert";
import { buildSnippet, CODE_LANGS, type CodeLang } from "../lib/kstutc/snippets";

// 컨트롤 마이크로카피만 로컬 dict.
// 페이지 콘텐츠(제목·설명·가이드·FAQ)는 content.ts 레지스트리.
const DICT: Dict = {
  ko: {
    "dir.label": "변환 방향",
    "act.now": "현재 시각",
    "act.example": "예제 입력",
    "act.reset": "초기화",
    "in.panel": "입력",
    "in.label": "날짜·시간",
    "in.ph": "예: 2026-10-20 18:30:00",
    "in.assume": "시간대 표기가 없으면 {zone}로 해석합니다.",
    "in.formats": "인식하는 형식",
    "out.panel": "변환 결과",
    "row.datetime": "날짜·시간",
    "row.zone": "시간대",
    "row.iso": "ISO 8601",
    "row.input": "입력(ISO)",
    "row.day": "날짜 변화",
    "day.-1": "전날",
    "day.0": "같은 날",
    "day.1": "다음 날",
    "note.truncated": "밀리초(3자리) 아래 자리는 버리고 계산했습니다.",
    "empty": "날짜·시간을 입력하면 바로 변환합니다",
    "err.format": "날짜·시간으로 읽을 수 없습니다. 예: 2026-10-20 18:30:00",
    "err.invalid-date": "존재하지 않는 날짜나 시각입니다. 월·일·시·분·초 범위를 확인하세요.",
    "err.out-of-range": "0001~9999년 범위를 벗어났습니다.",
    "err.zone-conflict": "입력 문자열의 시간대가 선택한 입력 시간대({zone})와 다릅니다. 변환 방향을 바꾸거나 시간대 표기를 지우세요.",
    "err.unsupported-zone": "UTC·KST 외의 오프셋은 지원하지 않습니다.",
    "code.title": "언어별 변환 코드",
    "code.fn": "함수 복사",
    "code.full": "전체 예제 복사",
    "code.fromInput": "현재 입력 반영",
    "code.fromExample": "예제 값 사용",
  },
  en: {
    "dir.label": "Direction",
    "act.now": "Now",
    "act.example": "Example",
    "act.reset": "Reset",
    "in.panel": "Input",
    "in.label": "Date & time",
    "in.ph": "e.g. 2026-10-20 18:30:00",
    "in.assume": "Input without a timezone is read as {zone}.",
    "in.formats": "Recognized formats",
    "out.panel": "Result",
    "row.datetime": "Date & time",
    "row.zone": "Timezone",
    "row.iso": "ISO 8601",
    "row.input": "Input (ISO)",
    "row.day": "Day change",
    "day.-1": "Previous day",
    "day.0": "Same day",
    "day.1": "Next day",
    "note.truncated": "Digits below milliseconds (3 digits) were dropped.",
    "empty": "Enter a date and time to convert it instantly",
    "err.format": "Can't read this as a date and time. e.g. 2026-10-20 18:30:00",
    "err.invalid-date": "This date or time does not exist. Check the month, day, hour, minute and second.",
    "err.out-of-range": "Outside the supported range of years 0001-9999.",
    "err.zone-conflict": "The timezone in the string differs from the selected input timezone ({zone}). Switch the direction or remove the marker.",
    "err.unsupported-zone": "Offsets other than UTC and KST are not supported.",
    "code.title": "Conversion code",
    "code.fn": "Copy function",
    "code.full": "Copy full example",
    "code.fromInput": "Uses your input",
    "code.fromExample": "Uses example value",
  },
};

/** 방향별 예제 입력: 날짜가 바뀌는 시각을 골라 경계 동작을 보여준다 */
const EXAMPLE: Record<Zone, string> = {
  UTC: "2026-10-20 18:30:00",
  KST: "2026-10-21 08:00:00",
};

const FORMATS = [
  "2026-10-20 18:30",
  "2026-10-20T18:30:05.123Z",
  "2026/10/20 18:30 UTC",
  "2026.10.21 03:30 +09:00",
];

const ZONE_LABEL: Record<Zone, string> = { UTC: "UTC (+00:00)", KST: "KST (UTC+09:00)" };

export default function KstUtcConverter() {
  const t = useT(DICT);

  const [from, setFrom] = useState<Zone>("UTC");
  const [input, setInput] = useState("");
  const [codeLang, setCodeLang] = useState<CodeLang>("javascript");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const to = otherZone(from);
  const result = input.trim() ? convert(input, from) : null;
  const ok = result?.ok ? result : null;

  // 코드 예제: 입력이 유효하면 그 값을, 아니면 방향별 예제 값을 호출부에 넣는다.
  const codeSrc = ok ?? convert(EXAMPLE[from], from);
  const snippet = codeSrc.ok
    ? buildSnippet(codeLang, from, codeSrc.sourceIso, codeSrc.targetIso)
    : null;

  function switchDir(z: Zone) {
    if (z === from) return;
    // 결과를 새 입력으로 넘겨 되돌려 변환할 수 있게 한다.
    if (ok) setInput(formatInput(ok.target));
    setFrom(z);
  }

  function copy(key: string, value: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1600);
    });
  }

  const errMsg =
    result && !result.ok ? t(`err.${result.code}`).replace("{zone}", from) : null;

  return (
    <>
      <PageHead slug="kst-utc-converter" />

      <div className="ide ku-ide">
        {/* ── Toolbar ── */}
        <div className="ide-bar ku-bar">
          <div className="ide-title">
            <span className="dot" />
            <span className="name">kst-utc</span>
            <span className="path">.ts</span>
          </div>
          <div className="ku-dir" role="group" aria-label={t("dir.label")}>
            {(["UTC", "KST"] as const).map((z) => (
              <button
                key={z}
                type="button"
                className={"ku-dir-btn" + (z === from ? " is-active" : "")}
                aria-pressed={z === from}
                onClick={() => switchDir(z)}
              >
                {z} → {otherZone(z)}
              </button>
            ))}
          </div>
          <div className="spacer" />
          <div className="ku-acts">
            <button type="button" className="btn-ide" onClick={() => setInput(formatInput(nowIn(from)))}>
              {t("act.now")}
            </button>
            <button type="button" className="btn-ide" onClick={() => setInput(EXAMPLE[from])}>
              {t("act.example")}
            </button>
            <button type="button" className="btn-ide" onClick={() => setInput("")}>
              {t("act.reset")}
            </button>
          </div>
        </div>

        {/* ── Panes ── */}
        <div className="panes">
          {/* Left: Input */}
          <div className="pane pane-in">
            <div className="pane-head">
              <span className="pane-tab">
                <span className="tab-dot" />
                {t("in.panel")}
              </span>
              <span className="ts-kind-badge">{from}</span>
            </div>
            <div className="pane-body ku-in-body">
              <label className="ku-label" htmlFor="ku-input">
                {t("in.label")} ({from})
              </label>
              <input
                id="ku-input"
                className={"ku-input" + (errMsg ? " is-error" : "")}
                type="text"
                inputMode="text"
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="off"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("in.ph")}
                aria-invalid={errMsg ? true : undefined}
                aria-describedby="ku-assume"
              />
              <p id="ku-assume" className="ku-assume">
                {t("in.assume").replace("{zone}", from)}
              </p>
              <div className="ku-formats">
                <span className="ku-formats-lbl">{t("in.formats")}</span>
                <ul>
                  {FORMATS.map((f) => (
                    <li key={f}><code>{f}</code></li>
                  ))}
                </ul>
              </div>
              <p className="ku-privacy">{t("common.privacy")}</p>
            </div>
          </div>

          {/* Right: Output */}
          <div className="pane pane-out">
            <div className="pane-head">
              <span className="pane-tab">
                <span
                  className="tab-dot"
                  style={ok ? { background: "var(--color-blue-primary-400)" } : undefined}
                />
                {t("out.panel")}
              </span>
              <div className="spacer" />
              <span className="pane-meta">{to}</span>
            </div>
            <div className="pane-body ts-out-body ku-out-body" aria-live="polite">
              {!result ? (
                <div className="ts-empty">
                  <ClockIcon />
                  <span>{t("empty")}</span>
                </div>
              ) : !ok ? (
                <div className="ts-error">
                  <ErrorIcon />
                  <span>{errMsg}</span>
                </div>
              ) : (
                <div className="ts-rows">
                  <Row
                    label={t("row.datetime")}
                    value={`${formatDate(ok.target)} ${formatTime(ok.target)}`}
                    rowKey="datetime"
                    copiedKey={copiedKey}
                    onCopy={copy}
                    t={t}
                    primary
                  />
                  <Row label={t("row.zone")} value={ZONE_LABEL[to]} rowKey="zone" copiedKey={copiedKey} onCopy={copy} t={t} />
                  <Row label={t("row.iso")} value={ok.targetIso} rowKey="iso" copiedKey={copiedKey} onCopy={copy} t={t} mono />
                  <Row label={t("row.input")} value={ok.sourceIso} rowKey="input" copiedKey={copiedKey} onCopy={copy} t={t} mono />
                  <div className="ts-row">
                    <span className="ts-row-lbl">{t("row.day")}</span>
                    <span className="ts-row-val">
                      <span className={`ku-shift ku-shift-${ok.dayShift === -1 ? "prev" : ok.dayShift === 1 ? "next" : "same"}`}>
                        {t(`day.${ok.dayShift}`)}
                      </span>
                      <span className="ku-shift-dates kf-mono">
                        {formatDate(ok.source)} {from} → {formatDate(ok.target)} {to}
                      </span>
                    </span>
                  </div>
                  {ok.truncated && <p className="ku-note">{t("note.truncated")}</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Status bar ── */}
        <div className="ide-status">
          {errMsg ? (
            <>
              <span className="status-pill err">error</span>
              <span className="err-detail ku-status-detail">{errMsg}</span>
            </>
          ) : ok ? (
            <>
              <span className="status-pill ok">valid</span>
              <span>{from} → {to}</span>
              <span className="spacer" />
              <span className="pane-meta">{ok.dayShift === 0 ? "" : ok.dayShift > 0 ? "+1 day" : "-1 day"}</span>
            </>
          ) : (
            <>
              <span className="status-pill idle">idle</span>
              <span>{from} → {to}</span>
            </>
          )}
        </div>
      </div>

      {/* ── Language code ── */}
      {snippet && codeSrc.ok && (
        <section className="ide ku-code" aria-label={t("code.title")}>
          <div className="ide-bar ku-code-bar">
            <div className="ku-langs" role="tablist" aria-label={t("code.title")}>
              {CODE_LANGS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  role="tab"
                  aria-selected={l.id === codeLang}
                  className={"ku-lang" + (l.id === codeLang ? " is-active" : "")}
                  onClick={() => setCodeLang(l.id)}
                >
                  {l.label}
                </button>
              ))}
            </div>
            <div className="spacer" />
            <div className="ku-acts">
              <button type="button" className="btn-ide" onClick={() => copy("fn", snippet.fn)}>
                {copiedKey === "fn" ? <CheckIcon /> : <CopyIcon />}
                {copiedKey === "fn" ? t("common.copied") : t("code.fn")}
              </button>
              <button type="button" className="btn-ide primary" onClick={() => copy("full", snippet.full)}>
                {copiedKey === "full" ? <CheckIcon /> : <CopyIcon />}
                {copiedKey === "full" ? t("common.copied") : t("code.full")}
              </button>
            </div>
          </div>
          <div className="pane-out ku-code-out">
            <div className="pane-head">
              <span className="pane-tab">
                <span className="tab-dot" />
                {from} → {to}
              </span>
              <div className="spacer" />
              <span className="pane-meta">{ok ? t("code.fromInput") : t("code.fromExample")}</span>
            </div>
            <CodeBlock code={snippet.full} />
          </div>
        </section>
      )}

      <ToolGuide slug="kst-utc-converter" />
      <Faq slug="kst-utc-converter" />
      <RelatedTools slug="kst-utc-converter" />
    </>
  );
}

/* ── Sub-components ── */

function CodeBlock({ code }: { code: string }) {
  const lines = code.split("\n");
  return (
    <div className="ku-code-scroll">
      <div className="gutter" aria-hidden="true">
        {lines.map((_, i) => i + 1).join("\n")}
      </div>
      <pre className="code-pre">
        <code>
          {lines.map((line, i) => {
            const trimmed = line.trimStart();
            const comment = trimmed.startsWith("//") || trimmed.startsWith("# ");
            return (
              <span key={i} className={comment ? "tok-null" : undefined}>
                {line}
                {i < lines.length - 1 ? "\n" : ""}
              </span>
            );
          })}
        </code>
      </pre>
    </div>
  );
}

function Row({
  label,
  value,
  rowKey,
  copiedKey,
  onCopy,
  t,
  mono = false,
  primary = false,
}: {
  label: string;
  value: string;
  rowKey: string;
  copiedKey: string | null;
  onCopy: (k: string, v: string) => void;
  t: (k: string) => string;
  mono?: boolean;
  primary?: boolean;
}) {
  const copied = copiedKey === rowKey;
  return (
    <div className="ts-row">
      <span className="ts-row-lbl">{label}</span>
      <span className={"ts-row-val" + (mono ? " kf-mono" : "") + (primary ? " ku-primary" : "")}>
        {value}
      </span>
      <button
        type="button"
        className={"ts-copy" + (copied ? " is-copied" : "")}
        onClick={() => onCopy(rowKey, value)}
        title={copied ? t("common.copied") : t("common.copy")}
        aria-label={`${label} ${copied ? t("common.copied") : t("common.copy")}`}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
      </button>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="5" y="5" width="9" height="9" rx="2" />
      <path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4M12 16h.01" strokeLinecap="round" />
    </svg>
  );
}
