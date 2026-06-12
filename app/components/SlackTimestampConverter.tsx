"use client";

import { useEffect, useState } from "react";
import Faq from "./Faq";
import PageHead from "./PageHead";
import { getTool } from "../lib/content";
import { useT } from "../lib/i18n";
import {
  parseInput,
  toUTC,
  toLocalTz,
  toReadable,
  toRelative,
  toSlackFormats,
  type InputKind,
} from "../lib/timestamp";

// 모든 텍스트(페이지 카피·컨트롤 마이크로카피·FAQ)는 content.ts 한 파일에서 관리.
const UI = getTool("tools/slack-timestamp-converter").ui;

export default function SlackTimestampConverter() {
  const t = useT(UI);

  const [input, setInput] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Client-only: current unix seconds (1 s interval)
  const [nowS, setNowS] = useState<number | null>(null);
  useEffect(() => {
    setNowS(Math.floor(Date.now() / 1000));
    const id = setInterval(() => setNowS(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  const result = input.trim() ? parseInput(input) : null;
  const valid = result !== null && result.kind !== "invalid";

  // Client-only: local timezone string
  const [localTime, setLocalTime] = useState<string | null>(null);
  useEffect(() => {
    if (!valid) { setLocalTime(null); return; }
    setLocalTime(toLocalTz(result!.unixSeconds));
  }, [valid, result?.unixSeconds]);

  // Client-only: relative time (refreshes every second)
  const [relative, setRelative] = useState<string | null>(null);
  useEffect(() => {
    if (!valid) { setRelative(null); return; }
    const update = () => setRelative(toRelative(result!.unixSeconds));
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [valid, result?.unixSeconds]);

  function copy(key: string, value: string) {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1600);
    });
  }

  const slackFormats = valid ? toSlackFormats(result!.unixSeconds) : [];

  const kindLabel = result ? t(`kind.${result.kind}`) : "";

  return (
    <>
      <PageHead slug="tools/slack-timestamp-converter" />

      <div className="ide ts-ide">
          {/* ── IDE toolbar ── */}
          <div className="ide-bar">
            <div className="ide-title">
              <span className="dot" />
              <span className="name">timestamp</span>
              <span className="path">.ts</span>
            </div>
            <div className="spacer" />
            {nowS !== null && (
              <div className="ts-now">
                <span className="ts-now-lbl">{t("now.label")}</span>
                <code className="ts-now-val">{nowS}</code>
                <button
                  className="btn-ide"
                  onClick={() => copy("now", String(nowS))}
                  title={copiedKey === "now" ? t("common.copied") : t("common.copy")}
                >
                  {copiedKey === "now" ? <CheckIcon /> : <CopyIcon />}
                </button>
              </div>
            )}
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
                {result && result.kind !== "invalid" && (
                  <span className="ts-kind-badge">{kindLabel}</span>
                )}
                <div className="spacer" />
                {input && (
                  <button
                    className="pane-act"
                    onClick={() => setInput("")}
                  >
                    {t("in.clear")}
                  </button>
                )}
              </div>
              <div className="pane-body">
                <textarea
                  className="code-in ts-textarea"
                  spellCheck={false}
                  autoCapitalize="off"
                  autoCorrect="off"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`${t("in.ph")}\n\n${t("in.ph2")}`}
                />
              </div>
            </div>

            {/* Right: Output */}
            <div className="pane pane-out">
              <div className="pane-head">
                <span className="pane-tab">
                  <span
                    className="tab-dot"
                    style={valid ? { background: "var(--color-blue-primary-400)" } : undefined}
                  />
                  {t("out.panel")}
                </span>
                <div className="spacer" />
              </div>
              <div className="pane-body ts-out-body">
                {!result ? (
                  <div className="ts-empty">
                    <ClockIcon />
                    <span>{t("err.empty")}</span>
                  </div>
                ) : result.kind === "invalid" ? (
                  <div className="ts-error">
                    <ErrorIcon />
                    <span>{result.error}</span>
                  </div>
                ) : (
                  <div className="ts-rows">
                    <Row label={t("row.utc")} value={toUTC(result.unixSeconds)} rowKey="utc" copiedKey={copiedKey} onCopy={copy} t={t} />
                    {localTime && (
                      <Row label={t("row.local")} value={localTime} rowKey="local" copiedKey={copiedKey} onCopy={copy} t={t} />
                    )}
                    <Row label={t("row.readable")} value={toReadable(result.unixSeconds)} rowKey="readable" copiedKey={copiedKey} onCopy={copy} t={t} />
                    {relative && (
                      <Row label={t("row.relative")} value={relative} rowKey="relative" copiedKey={copiedKey} onCopy={copy} t={t} />
                    )}
                    <Row label={t("row.unix")} value={String(result.unixSeconds)} rowKey="unix" copiedKey={copiedKey} onCopy={copy} t={t} mono />

                    <div className="ts-section">{t("row.slack")}</div>
                    {slackFormats.map((sf) => (
                      <Row
                        key={sf.label}
                        label={sf.label}
                        value={sf.value}
                        rowKey={`slack-${sf.label}`}
                        copiedKey={copiedKey}
                        onCopy={copy}
                        t={t}
                        mono
                        wrap
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Status bar ── */}
          <div className="ide-status">
            {result?.kind === "invalid" ? (
              <>
                <span className="status-pill err">error</span>
                <span className="err-detail">{result.error}</span>
                <span className="spacer" />
              </>
            ) : valid ? (
              <>
                <span className="status-pill ok">valid</span>
                <span>{kindLabel}</span>
                <span className="spacer" />
                {nowS !== null && (
                  <span className="pane-meta">
                    {result!.unixSeconds > nowS ? "future" : "past"}
                    {" · "}
                    Unix {result!.unixSeconds}
                  </span>
                )}
              </>
            ) : (
              <>
                <span className="status-pill idle">idle</span>
                <span className="spacer" />
              </>
            )}
          </div>
      </div>

      <Faq slug="tools/slack-timestamp-converter" />
    </>
  );
}

/* ── Sub-components ── */

function Row({
  label,
  value,
  rowKey,
  copiedKey,
  onCopy,
  t,
  mono = false,
  wrap = false,
}: {
  label: string;
  value: string;
  rowKey: string;
  copiedKey: string | null;
  onCopy: (k: string, v: string) => void;
  t: (k: string) => string;
  mono?: boolean;
  wrap?: boolean;
}) {
  const copied = copiedKey === rowKey;
  return (
    <div className="ts-row">
      <span className="ts-row-lbl">{label}</span>
      <span className={"ts-row-val" + (mono ? " kf-mono" : "") + (wrap ? " ts-wrap" : "")}>
        {value}
      </span>
      <button
        className={"ts-copy" + (copied ? " is-copied" : "")}
        onClick={() => onCopy(rowKey, value)}
        title={copied ? t("common.copied") : t("common.copy")}
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
