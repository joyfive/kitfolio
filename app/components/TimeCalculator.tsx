"use client";

import { useState, useCallback } from "react";
import PageHead from "./PageHead";
import Faq from "./Faq";
import RelatedTools from "./RelatedTools";
import { useLang, useT, type Dict } from "../lib/i18n";

const DICT: Dict = {
  ko: {
    "tc.inputLabel": "시간 블록 입력",
    "tc.hPlaceholder": "0",
    "tc.hUnit": "시",
    "tc.mUnit": "분",
    "tc.sUnit": "초",
    "tc.addRow": "항목 추가",
    "tc.totalLabel": "합계",
    "tc.formatsTitle": "다른 형식",
    "tc.fmtHMS": "시:분:초",
    "tc.fmtDecimal": "소수점 시간",
    "tc.fmtMinutes": "총 분",
    "tc.fmtSeconds": "총 초",
  },
  en: {
    "tc.inputLabel": "Time blocks",
    "tc.hPlaceholder": "0",
    "tc.hUnit": "h",
    "tc.mUnit": "m",
    "tc.sUnit": "s",
    "tc.addRow": "Add row",
    "tc.totalLabel": "Total",
    "tc.formatsTitle": "Other formats",
    "tc.fmtHMS": "H:M:S",
    "tc.fmtDecimal": "Decimal hours",
    "tc.fmtMinutes": "Total minutes",
    "tc.fmtSeconds": "Total seconds",
  },
};

type TimeRow = { id: number; op: "+" | "-"; h: string; m: string; s: string };

let nextId = 3;

const defaultRows: TimeRow[] = [
  { id: 1, op: "+", h: "2", m: "30", s: "0" },
  { id: 2, op: "+", h: "1", m: "45", s: "0" },
];

function toSeconds(row: TimeRow): number {
  const h = parseInt(row.h) || 0;
  const m = parseInt(row.m) || 0;
  const s = parseInt(row.s) || 0;
  const total = h * 3600 + m * 60 + s;
  return row.op === "+" ? total : -total;
}

function formatHMS(totalSec: number): string {
  const abs = Math.abs(totalSec);
  const h = Math.floor(abs / 3600);
  const m = Math.floor((abs % 3600) / 60);
  const s = abs % 60;
  const sign = totalSec < 0 ? "−" : "";
  return `${sign}${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatDecimal(totalSec: number): string {
  return (totalSec / 3600).toFixed(2) + "h";
}

export default function TimeCalculator() {
  const { lang } = useLang();
  const t = useT(DICT);

  const [rows, setRows] = useState<TimeRow[]>(defaultRows);
  const [copied, setCopied] = useState<string | null>(null);

  const totalSec = rows.reduce((sum, r) => sum + toSeconds(r), 0);

  function toggleOp(id: number) {
    setRows((rs) =>
      rs.map((r) => (r.id === id ? { ...r, op: r.op === "+" ? "-" : "+" } : r))
    );
  }

  function updateRow(id: number, field: "h" | "m" | "s", val: string) {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
  }

  function removeRow(id: number) {
    setRows((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== id) : rs));
  }

  function addRow() {
    setRows((rs) => [...rs, { id: nextId++, op: "+", h: "0", m: "0", s: "0" }]);
  }

  const copy = useCallback(
    async (text: string, key: string) => {
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        /* ignore */
      }
      setCopied(key);
      setTimeout(() => setCopied(null), 1800);
    },
    []
  );

  return (
    <>
      <PageHead slug="time-calculator" />

      <div className="tc-work">
        {/* Left: input card */}
        <div className="tc-inputs">
          <div className="tc-inputs-head">
            <span className="lbl">{t("tc.inputLabel")}</span>
            <span className="spacer" />
            <button className="mini-act" onClick={() => setRows(defaultRows)}>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M3 4h10M5.5 4V3a1 1 0 011-1h3a1 1 0 011 1v1M6 7v4M10 7v4M4 4l.7 8a1 1 0 001 .9h4.6a1 1 0 001-.9L12 4" />
              </svg>
              <span>{t("common.clear")}</span>
            </button>
          </div>

          <div className="tc-rows">
            {rows.map((row) => (
              <div className="tc-row" key={row.id}>
                {/* operator toggle button */}
                <button
                  className={`tc-op${row.op === "-" ? " minus" : ""}`}
                  onClick={() => toggleOp(row.id)}
                  aria-label="toggle operator"
                >
                  {row.op}
                </button>

                {/* h/m/s inputs */}
                <div className="tc-time-input">
                  <div className="tc-unit-field">
                    <input
                      type="number"
                      min="0"
                      value={row.h}
                      onChange={(e) => updateRow(row.id, "h", e.target.value)}
                      placeholder={t("tc.hPlaceholder")}
                    />
                    <span className="tc-unit-lbl">{t("tc.hUnit")}</span>
                  </div>
                  <div className="tc-unit-field">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={row.m}
                      onChange={(e) => updateRow(row.id, "m", e.target.value)}
                      placeholder={t("tc.hPlaceholder")}
                    />
                    <span className="tc-unit-lbl">{t("tc.mUnit")}</span>
                  </div>
                  <div className="tc-unit-field">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={row.s}
                      onChange={(e) => updateRow(row.id, "s", e.target.value)}
                      placeholder={t("tc.hPlaceholder")}
                    />
                    <span className="tc-unit-lbl">{t("tc.sUnit")}</span>
                  </div>
                </div>

                {/* delete button */}
                <button
                  className="tc-del"
                  disabled={rows.length <= 1}
                  onClick={() => removeRow(row.id)}
                  aria-label="remove row"
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M12 4L4 12M4 4l8 8" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="tc-add-row">
            <button className="tc-add-btn" onClick={addRow}>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M8 3v10M3 8h10" />
              </svg>
              {t("tc.addRow")}
            </button>
          </div>
        </div>

        {/* Right: results */}
        <div className="tc-results">
          <div className="tc-total">
            <div className="tc-total-lbl">{t("tc.totalLabel")}</div>
            <div className={`tc-total-val${totalSec < 0 ? " negative" : ""}`}>
              {formatHMS(totalSec)}
            </div>
            <div className="tc-total-sub">{formatDecimal(totalSec)}</div>
          </div>

          <div className="tc-formats">
            {[
              { key: "tc.fmtHMS", value: formatHMS(totalSec) },
              { key: "tc.fmtDecimal", value: formatDecimal(totalSec) },
              {
                key: "tc.fmtMinutes",
                value:
                  Math.round(totalSec / 60) + (lang === "ko" ? "분" : "m"),
              },
              {
                key: "tc.fmtSeconds",
                value: totalSec + (lang === "ko" ? "초" : "s"),
              },
            ].map(({ key, value }) => (
              <div className="tc-format-row" key={key}>
                <span className="tc-format-lbl">
                  {t(key as Parameters<typeof t>[0])}
                </span>
                <span className="tc-format-val">{value}</span>
                <button
                  className={`tc-copy-btn${copied === key ? " copied" : ""}`}
                  onClick={() => copy(String(value), key)}
                  aria-label="copy"
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <rect x="4" y="4" width="8.5" height="10" rx="1.5" />
                    <path d="M3.5 12H3a1 1 0 01-1-1V3a1 1 0 011-1h8a1 1 0 011 1v.5" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="privacy">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M8 1.5l5 2v3.5c0 3-2.1 5.4-5 6.5-2.9-1.1-5-3.5-5-6.5V3.5z" />
              <path d="M6 8l1.5 1.5L10.5 6.5" />
            </svg>
            <span>{t("common.privacy")}</span>
          </div>
        </div>
      </div>

      <Faq slug="time-calculator" />
      <RelatedTools slug="time-calculator" />
    </>
  );
}
