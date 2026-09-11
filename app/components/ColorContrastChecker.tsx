"use client";

import { useEffect, useMemo, useState } from "react";
import PageHead from "./PageHead";
import ToolGuide from "./ToolGuide";
import Faq from "./Faq";
import RelatedTools from "./RelatedTools";
import { useT, type Dict } from "../lib/i18n";
import {
  CRITERIA,
  PALETTE_MAX,
  PALETTE_MIN,
  TARGET_RATIO,
  contrastBand,
  contrastRatio,
  formatRatio,
  meets,
  parseHexColor,
  parsePalette,
  suggestPassingColor,
  type Band,
  type CriterionId,
  type TargetId,
} from "../lib/color/contrast";

// 컨트롤 마이크로카피만 로컬 dict. 페이지 콘텐츠는 content.ts 레지스트리.
const DICT: Dict = {
  ko: {
    "cc.tab.single": "단일 색상 검사",
    "cc.tab.palette": "팔레트 감사",
    "cc.fg": "전경색",
    "cc.bg": "배경색",
    "cc.pick": "색상 선택",
    "cc.swap": "전경·배경 교환",
    "cc.reset": "초기화",
    "cc.err.invalid": "HEX 색상을 3자리 또는 6자리로 입력해 주세요.",
    "cc.err.alpha": "투명도가 포함된 색상은 아직 지원하지 않습니다. 불투명 HEX 색상을 입력해 주세요.",
    "cc.ratio": "대비 비율",
    "cc.pass": "통과",
    "cc.fail": "미달",
    "cc.crit.heading": "WCAG 2.2 판정",
    "cc.crit.body-aa": "일반 텍스트 AA",
    "cc.crit.body-aaa": "일반 텍스트 AAA",
    "cc.crit.large-aa": "큰 텍스트 AA",
    "cc.crit.large-aaa": "큰 텍스트 AAA",
    "cc.crit.ui-aa": "UI 컴포넌트·그래픽 AA",
    "cc.largeNote": "큰 텍스트는 18pt(약 24px) 이상 또는 굵은 14pt(약 18.5px) 이상입니다. 획이 얇거나 특이한 글꼴은 수치상 통과해도 더 높은 대비가 필요할 수 있습니다.",
    "cc.preview.heading": "미리보기",
    "cc.preview.note": "미리보기는 판정 근거가 아니라 체감 확인용입니다.",
    "cc.preview.body": "본문 텍스트 · 16px",
    "cc.preview.bodyRule": "적용 기준 4.5:1",
    "cc.preview.bodyText": "이 문장은 본문 크기의 텍스트입니다. 실제 화면에서 편하게 읽히는지 확인하세요.",
    "cc.preview.large": "큰 텍스트 · 24px",
    "cc.preview.largeRule": "적용 기준 3:1",
    "cc.preview.largeText": "큰 제목 문장",
    "cc.preview.ui": "UI 컴포넌트",
    "cc.preview.uiRule": "적용 기준 3:1",
    "cc.preview.uiButton": "확인",
    "cc.preview.uiField": "입력창 테두리",
    "cc.suggest.heading": "통과 색상 제안",
    "cc.suggest.target": "목표 기준",
    "cc.suggest.adjust": "조정 대상",
    "cc.suggest.expected": "예상 대비",
    "cc.suggest.apply": "적용",
    "cc.target.large-ui-aa": "큰 텍스트·UI AA · 3:1",
    "cc.target.body-aa": "본문 텍스트 AA · 4.5:1",
    "cc.target.body-aaa": "본문 텍스트 AAA · 7:1",
    "cc.suggest.ok": "현재 색상 조합이 선택한 기준을 충족합니다.",
    "cc.suggest.none": "이 색을 단독으로 조정해서는 선택한 기준에 도달할 수 없습니다. 반대 색상도 함께 조정해 보세요.",
    "cc.suggest.method": "색조는 유지하고 밝기를 우선 조정합니다. 화면에서 표현할 수 없는 색은 채도를 최소한으로 낮출 수 있습니다.",
    "cc.copied": "HEX 색상을 복사했습니다.",
    "cc.copyFail": "자동 복사에 실패했습니다. HEX 값을 직접 선택해 복사해 주세요.",
    "cc.pal.label": "HEX 팔레트",
    "cc.pal.placeholder": "#0F172A\n#334155\n#64748B\n#E2E8F0\n#FFFFFF",
    "cc.pal.hint": "줄바꿈·공백·쉼표·세미콜론으로 구분해 2~12개의 HEX 색상을 붙여넣으세요. CSS 변수 선언을 통째로 붙여넣어도 '#'으로 시작하는 색상만 인식합니다.",
    "cc.pal.run": "팔레트 검사",
    "cc.pal.err.none": "인식할 수 있는 HEX 색상이 없습니다.",
    "cc.pal.err.one": "팔레트 검사를 위해 색상을 2개 이상 입력해 주세요.",
    "cc.pal.err.max": "한 번에 최대 12개까지 검사할 수 있습니다.",
    "cc.pal.warn": "{n}개의 색상을 인식했고 {m}개의 잘못된 HEX 값은 제외했습니다.",
    "cc.matrix.caption": "행은 전경색, 열은 배경색입니다. 셀을 선택하면 해당 조합이 단일 색상 검사로 넘어갑니다.",
    "cc.matrix.corner": "전경색 \\ 배경색",
    "cc.matrix.fg": "전경색",
    "cc.matrix.bg": "배경색",
    "cc.band.aaa-body": "AAA 본문",
    "cc.band.aa-body": "AA 본문",
    "cc.band.aa-large": "AA 큰 글자·UI",
    "cc.band.fail": "미달",
    "cc.live.ratio": "전경색 {fg}, 배경색 {bg}, 대비 비율 {r} 대 1. {band}.",
    "cc.live.applied": "전경색 {fg}, 배경색 {bg} 조합을 단일 색상 검사에 적용했습니다.",
  },
  en: {
    "cc.tab.single": "Single pair",
    "cc.tab.palette": "Palette audit",
    "cc.fg": "Foreground",
    "cc.bg": "Background",
    "cc.pick": "Pick a color",
    "cc.swap": "Swap foreground and background",
    "cc.reset": "Reset",
    "cc.err.invalid": "Enter a 3 or 6 digit HEX color.",
    "cc.err.alpha": "Colors with transparency are not supported yet. Enter an opaque HEX color.",
    "cc.ratio": "Contrast ratio",
    "cc.pass": "Pass",
    "cc.fail": "Fail",
    "cc.crit.heading": "WCAG 2.2 results",
    "cc.crit.body-aa": "Normal text AA",
    "cc.crit.body-aaa": "Normal text AAA",
    "cc.crit.large-aa": "Large text AA",
    "cc.crit.large-aaa": "Large text AAA",
    "cc.crit.ui-aa": "UI components and graphics AA",
    "cc.largeNote": "Large text means at least 18pt (about 24px), or 14pt bold (about 18.5px). Thin or unusual typefaces may need more contrast than the numbers suggest.",
    "cc.preview.heading": "Preview",
    "cc.preview.note": "The preview is for judging how the pair feels, not for deciding pass or fail.",
    "cc.preview.body": "Body text · 16px",
    "cc.preview.bodyRule": "Applies at 4.5:1",
    "cc.preview.bodyText": "This sentence is set at body size. Check whether it stays comfortable to read on a real screen.",
    "cc.preview.large": "Large text · 24px",
    "cc.preview.largeRule": "Applies at 3:1",
    "cc.preview.largeText": "A large heading line",
    "cc.preview.ui": "UI component",
    "cc.preview.uiRule": "Applies at 3:1",
    "cc.preview.uiButton": "Confirm",
    "cc.preview.uiField": "Input border",
    "cc.suggest.heading": "Passing color suggestion",
    "cc.suggest.target": "Target",
    "cc.suggest.adjust": "Adjust",
    "cc.suggest.expected": "Expected ratio",
    "cc.suggest.apply": "Apply",
    "cc.target.large-ui-aa": "Large text and UI AA · 3:1",
    "cc.target.body-aa": "Normal text AA · 4.5:1",
    "cc.target.body-aaa": "Normal text AAA · 7:1",
    "cc.suggest.ok": "This pair already meets the selected target.",
    "cc.suggest.none": "Adjusting this color alone cannot reach the selected target. Try adjusting the other color as well.",
    "cc.suggest.method": "The hue stays fixed and lightness is adjusted first. Chroma is lowered only as far as needed for colors a screen cannot display.",
    "cc.copied": "HEX color copied.",
    "cc.copyFail": "Copying failed. Select the HEX value and copy it manually.",
    "cc.pal.label": "HEX palette",
    "cc.pal.placeholder": "#0F172A\n#334155\n#64748B\n#E2E8F0\n#FFFFFF",
    "cc.pal.hint": "Paste 2 to 12 HEX colors separated by line breaks, spaces, commas or semicolons. You can paste whole CSS variable declarations: only tokens starting with '#' are read as colors.",
    "cc.pal.run": "Audit palette",
    "cc.pal.err.none": "No HEX color could be found.",
    "cc.pal.err.one": "Enter at least 2 colors to audit a palette.",
    "cc.pal.err.max": "Up to 12 colors can be audited at a time.",
    "cc.pal.warn": "{n} colors were read and {m} invalid HEX values were skipped.",
    "cc.matrix.caption": "Rows are foreground colors and columns are background colors. Selecting a cell sends that pair to the single pair check.",
    "cc.matrix.corner": "Foreground \\ background",
    "cc.matrix.fg": "Foreground",
    "cc.matrix.bg": "Background",
    "cc.band.aaa-body": "AAA text",
    "cc.band.aa-body": "AA text",
    "cc.band.aa-large": "AA large and UI",
    "cc.band.fail": "Fail",
    "cc.live.ratio": "Foreground {fg} on background {bg}, contrast ratio {r} to 1. {band}.",
    "cc.live.applied": "Foreground {fg} on background {bg} sent to the single pair check.",
  },
};

const DEFAULT_FG = "#111827";
const DEFAULT_BG = "#FFFFFF";

const TARGET_IDS: TargetId[] = ["large-ui-aa", "body-aa", "body-aaa"];

type Role = "fg" | "bg";
type FieldError = "invalid" | "alpha" | null;

/** 입력 중에는 조용히 두고, 더 타이핑해도 유효해질 수 없거나 포커스를 떠났을 때만 오류를 알린다. */
function fieldError(raw: string, focused: boolean): FieldError {
  const parsed = parseHexColor(raw);
  if (parsed.ok) return null;
  if (!focused) return parsed.reason === "empty" ? "invalid" : parsed.reason;
  const body = raw.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{0,5}$/.test(body)) return null;
  return parsed.reason === "empty" ? null : parsed.reason;
}

function fill(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (acc, [k, v]) => acc.split(`{${k}}`).join(v),
    template,
  );
}

function IconPass() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconFail() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconAlert() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2.8l5.6 10H2.4L8 2.8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 6.6v3M8 11.6v.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function ColorContrastChecker() {
  const t = useT(DICT);

  const [mode, setMode] = useState<"single" | "palette">("single");

  const [fg, setFg] = useState(DEFAULT_FG);
  const [bg, setBg] = useState(DEFAULT_BG);
  const [fgText, setFgText] = useState(DEFAULT_FG);
  const [bgText, setBgText] = useState(DEFAULT_BG);
  const [focused, setFocused] = useState<Role | null>(null);

  const [target, setTarget] = useState<TargetId>("body-aa");
  const [adjust, setAdjust] = useState<Role>("fg");
  const [copyState, setCopyState] = useState<"idle" | "done" | "fail">("idle");

  const [paletteText, setPaletteText] = useState("");
  const [palette, setPalette] = useState<{ colors: string[]; invalid: number } | null>(null);
  const [paletteMsg, setPaletteMsg] = useState<{ kind: "error" | "warn"; text: string } | null>(null);

  const [live, setLive] = useState("");

  const ratio = useMemo(() => contrastRatio(fg, bg), [fg, bg]);
  const band = contrastBand(ratio);
  const targetRatio = TARGET_RATIO[target];
  const meetsTarget = meets(ratio, targetRatio);

  const suggestion = useMemo(() => {
    if (meetsTarget) return null;
    return adjust === "fg"
      ? suggestPassingColor(fg, bg, targetRatio)
      : suggestPassingColor(bg, fg, targetRatio);
  }, [meetsTarget, adjust, fg, bg, targetRatio]);

  // 입력이 바뀔 때마다 읽히지 않도록 결과 안내는 디바운스 후 한 번만 갱신한다.
  useEffect(() => {
    const id = setTimeout(() => {
      setLive(
        fill(t("cc.live.ratio"), {
          fg,
          bg,
          r: formatRatio(ratio),
          band: t(`cc.band.${band}`),
        }),
      );
    }, 600);
    return () => clearTimeout(id);
  }, [fg, bg, ratio, band, t]);

  function commitColor(role: Role, raw: string) {
    if (role === "fg") setFgText(raw);
    else setBgText(raw);
    const parsed = parseHexColor(raw);
    if (!parsed.ok) return;
    if (role === "fg") setFg(parsed.hex);
    else setBg(parsed.hex);
  }

  function pickColor(role: Role, value: string) {
    const hex = value.toUpperCase();
    if (role === "fg") {
      setFg(hex);
      setFgText(hex);
    } else {
      setBg(hex);
      setBgText(hex);
    }
  }

  function swap() {
    setFg(bg);
    setBg(fg);
    setFgText(bg);
    setBgText(fg);
  }

  function reset() {
    if (mode === "single") {
      setFg(DEFAULT_FG);
      setBg(DEFAULT_BG);
      setFgText(DEFAULT_FG);
      setBgText(DEFAULT_BG);
      return;
    }
    setPaletteText("");
    setPalette(null);
    setPaletteMsg(null);
  }

  function applySuggestion(hex: string) {
    pickColor(adjust, hex);
  }

  async function copyHex(hex: string) {
    try {
      await navigator.clipboard.writeText(hex);
      setCopyState("done");
    } catch {
      setCopyState("fail");
    }
    setTimeout(() => setCopyState("idle"), 2200);
  }

  function runPaletteAudit() {
    const { colors, invalid } = parsePalette(paletteText);
    if (colors.length === 0) {
      setPalette(null);
      setPaletteMsg({ kind: "error", text: t("cc.pal.err.none") });
      return;
    }
    if (colors.length < PALETTE_MIN) {
      setPalette(null);
      setPaletteMsg({ kind: "error", text: t("cc.pal.err.one") });
      return;
    }
    // 12색을 넘으면 앞부분만 잘라 검사하지 않고 사용자가 직접 줄이게 한다.
    if (colors.length > PALETTE_MAX) {
      setPalette(null);
      setPaletteMsg({ kind: "error", text: t("cc.pal.err.max") });
      return;
    }
    setPalette({ colors, invalid });
    setPaletteMsg(
      invalid > 0
        ? {
            kind: "warn",
            text: fill(t("cc.pal.warn"), { n: String(colors.length), m: String(invalid) }),
          }
        : null,
    );
  }

  function selectPair(rowHex: string, colHex: string) {
    setFg(rowHex);
    setFgText(rowHex);
    setBg(colHex);
    setBgText(colHex);
    setMode("single");
    setLive(fill(t("cc.live.applied"), { fg: rowHex, bg: colHex }));
  }

  const fgErr = fieldError(fgText, focused === "fg");
  const bgErr = fieldError(bgText, focused === "bg");

  function colorField(role: Role, err: FieldError) {
    const value = role === "fg" ? fg : bg;
    const text = role === "fg" ? fgText : bgText;
    const id = `cc-${role}`;
    const label = t(role === "fg" ? "cc.fg" : "cc.bg");
    return (
      <div className="field-group">
        <label className="field-label" htmlFor={id}>
          {label}
        </label>
        <div className="ccc-colorrow">
          <span className="swatch" style={{ background: value }}>
            <input
              type="color"
              value={value.toLowerCase()}
              onChange={(e) => pickColor(role, e.target.value)}
              aria-label={`${label}: ${t("cc.pick")}`}
            />
          </span>
          <input
            id={id}
            className="hex-in ccc-hexin"
            type="text"
            inputMode="text"
            spellCheck={false}
            autoComplete="off"
            value={text}
            maxLength={9}
            aria-invalid={err ? true : undefined}
            aria-describedby={err ? `${id}-err` : undefined}
            onChange={(e) => commitColor(role, e.target.value)}
            onFocus={() => setFocused(role)}
            onBlur={() => setFocused(null)}
          />
        </div>
        {err && (
          <p className="ccc-fielderr" id={`${id}-err`}>
            <IconAlert />
            <span>{t(err === "alpha" ? "cc.err.alpha" : "cc.err.invalid")}</span>
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      <PageHead slug="color-contrast-checker" />

      <div className="ccc-tabs" role="tablist" aria-label={t("cc.crit.heading")}>
        {(["single", "palette"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            id={`ccc-tab-${m}`}
            aria-selected={mode === m}
            aria-controls={`ccc-panel-${m}`}
            className={`ccc-tab${mode === m ? " is-active" : ""}`}
            onClick={() => setMode(m)}
          >
            {t(m === "single" ? "cc.tab.single" : "cc.tab.palette")}
          </button>
        ))}
      </div>

      {mode === "single" ? (
        <div id="ccc-panel-single" role="tabpanel" aria-labelledby="ccc-tab-single" tabIndex={-1}>
          <div className="ccc-work">
            {/* 인풋 패널: 화이트 */}
            <div className="ccc-panel">
              <div className="ccc-panel-inner">
                {colorField("fg", fgErr)}
                {colorField("bg", bgErr)}
                <div className="ccc-actions">
                  <button type="button" className="btn btn-sm btn-outline" onClick={swap}>
                    {t("cc.swap")}
                  </button>
                  <button type="button" className="btn btn-sm btn-ghost" onClick={reset}>
                    {t("cc.reset")}
                  </button>
                </div>
                <p className="ccc-privacy">{t("common.privacy")}</p>
              </div>
            </div>

            {/* 출력 패널: 그레이 */}
            <div className="ccc-result">
              <div className="ccc-ratio">
                <span className="field-label">{t("cc.ratio")}</span>
                <strong className="ccc-ratio-num">
                  {formatRatio(ratio)}
                  <span className="ccc-ratio-unit">:1</span>
                </strong>
                <span className={`ccc-bandchip band-${band}`}>
                  {band === "fail" ? <IconFail /> : <IconPass />}
                  <span>{t(`cc.band.${band}`)}</span>
                </span>
              </div>

              <div className="ccc-crits">
                <span className="field-label">{t("cc.crit.heading")}</span>
                <ul>
                  {CRITERIA.map((c) => {
                    const ok = meets(ratio, c.min);
                    return (
                      <li key={c.id} className={ok ? "is-pass" : "is-fail"}>
                        <span className="ccc-crit-name">{t(`cc.crit.${c.id as CriterionId}`)}</span>
                        <span className="ccc-crit-min">{c.min}:1</span>
                        <span className="ccc-crit-verdict">
                          {ok ? <IconPass /> : <IconFail />}
                          <span>{ok ? t("cc.pass") : t("cc.fail")}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
                <p className="ccc-note">{t("cc.largeNote")}</p>
              </div>
            </div>
          </div>

          {/* 통과 색상 제안 */}
          <section className="ccc-suggest" aria-label={t("cc.suggest.heading")}>
            <div className="ccc-suggest-controls">
              <div className="field-group">
                <label className="field-label" htmlFor="cc-target">
                  {t("cc.suggest.target")}
                </label>
                <select
                  id="cc-target"
                  className="ccc-select"
                  value={target}
                  onChange={(e) => setTarget(e.target.value as TargetId)}
                >
                  {TARGET_IDS.map((id) => (
                    <option key={id} value={id}>
                      {t(`cc.target.${id}`)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <span className="field-label" id="cc-adjust-label">
                  {t("cc.suggest.adjust")}
                </span>
                <div className="seg" role="group" aria-labelledby="cc-adjust-label">
                  {(["fg", "bg"] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      className={adjust === role ? "is-active" : ""}
                      aria-pressed={adjust === role}
                      onClick={() => setAdjust(role)}
                    >
                      {t(role === "fg" ? "cc.fg" : "cc.bg")}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {meetsTarget ? (
              <p className="ccc-suggest-msg is-ok">
                <IconPass />
                <span>{t("cc.suggest.ok")}</span>
              </p>
            ) : suggestion ? (
              <div className="ccc-suggest-card">
                <span
                  className="ccc-suggest-swatch"
                  style={{
                    background: adjust === "fg" ? bg : suggestion.hex,
                    color: adjust === "fg" ? suggestion.hex : fg,
                  }}
                  aria-hidden="true"
                >
                  Aa
                </span>
                <div className="ccc-suggest-meta">
                  <strong>{suggestion.hex}</strong>
                  <span>
                    {t("cc.suggest.expected")} {formatRatio(suggestion.ratio)}:1
                  </span>
                </div>
                <div className="ccc-suggest-actions">
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => applySuggestion(suggestion.hex)}
                  >
                    {t("cc.suggest.apply")}
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline"
                    onClick={() => copyHex(suggestion.hex)}
                  >
                    {copyState === "done" ? t("common.copied") : t("common.copy")}
                  </button>
                </div>
              </div>
            ) : (
              <p className="ccc-suggest-msg is-warn">
                <IconAlert />
                <span>{t("cc.suggest.none")}</span>
              </p>
            )}
            <p className="ccc-note">{t("cc.suggest.method")}</p>
            {copyState !== "idle" && (
              <p className="ccc-note" role="status">
                {copyState === "done" ? t("cc.copied") : t("cc.copyFail")}
              </p>
            )}
          </section>

          {/* 미리보기 */}
          <section className="ccc-previews" aria-label={t("cc.preview.heading")}>
            <div className="ccc-preview">
              <div className="ccc-preview-head">
                <span>{t("cc.preview.body")}</span>
                <span className="ccc-preview-rule">{t("cc.preview.bodyRule")}</span>
              </div>
              <div className="ccc-preview-box" style={{ background: bg, color: fg }}>
                <p className="ccc-sample-body">{t("cc.preview.bodyText")}</p>
              </div>
            </div>
            <div className="ccc-preview">
              <div className="ccc-preview-head">
                <span>{t("cc.preview.large")}</span>
                <span className="ccc-preview-rule">{t("cc.preview.largeRule")}</span>
              </div>
              <div className="ccc-preview-box" style={{ background: bg, color: fg }}>
                <p className="ccc-sample-large">{t("cc.preview.largeText")}</p>
              </div>
            </div>
            <div className="ccc-preview">
              <div className="ccc-preview-head">
                <span>{t("cc.preview.ui")}</span>
                <span className="ccc-preview-rule">{t("cc.preview.uiRule")}</span>
              </div>
              <div className="ccc-preview-box" style={{ background: bg, color: fg }}>
                <div className="ccc-sample-ui">
                  <span className="ccc-sample-btn" style={{ background: fg, color: bg }}>
                    {t("cc.preview.uiButton")}
                  </span>
                  <span className="ccc-sample-field" style={{ borderColor: fg, color: fg }}>
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    {t("cc.preview.uiField")}
                  </span>
                </div>
              </div>
            </div>
            <p className="ccc-note">{t("cc.preview.note")}</p>
          </section>
        </div>
      ) : (
        <div id="ccc-panel-palette" role="tabpanel" aria-labelledby="ccc-tab-palette" tabIndex={-1}>
          <div className="ccc-palette">
            <div className="field-group">
              <label className="field-label" htmlFor="cc-palette">
                {t("cc.pal.label")}
              </label>
              <textarea
                id="cc-palette"
                className="ccc-textarea"
                value={paletteText}
                placeholder={t("cc.pal.placeholder")}
                spellCheck={false}
                aria-describedby="cc-palette-hint"
                onChange={(e) => setPaletteText(e.target.value)}
              />
              <p className="ccc-note" id="cc-palette-hint">
                {t("cc.pal.hint")}
              </p>
            </div>
            <div className="ccc-actions">
              <button type="button" className="btn btn-sm btn-primary" onClick={runPaletteAudit}>
                {t("cc.pal.run")}
              </button>
              <button type="button" className="btn btn-sm btn-ghost" onClick={reset}>
                {t("cc.reset")}
              </button>
            </div>
            {paletteMsg && (
              <p className={`ccc-palmsg is-${paletteMsg.kind}`} role="status">
                <IconAlert />
                <span>{paletteMsg.text}</span>
              </p>
            )}
            <p className="ccc-privacy">{t("common.privacy")}</p>
          </div>

          {palette && (
            <div className="ccc-matrix-wrap">
              <table className="ccc-matrix">
                <caption>{t("cc.matrix.caption")}</caption>
                <thead>
                  <tr>
                    <th scope="col">
                      <span className="ccc-corner">{t("cc.matrix.corner")}</span>
                    </th>
                    {palette.colors.map((c, i) => (
                      <th scope="col" key={c}>
                        <span className="ccc-head-swatch" style={{ background: c }} aria-hidden="true" />
                        <span className="ccc-head-name">{`Color ${i + 1}`}</span>
                        <span className="ccc-head-hex">{c}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {palette.colors.map((rowHex, ri) => (
                    <tr key={rowHex}>
                      <th scope="row">
                        <span className="ccc-head-swatch" style={{ background: rowHex }} aria-hidden="true" />
                        <span className="ccc-head-name">{`Color ${ri + 1}`}</span>
                        <span className="ccc-head-hex">{rowHex}</span>
                      </th>
                      {palette.colors.map((colHex) => {
                        const r = contrastRatio(rowHex, colHex);
                        const cellBand: Band = contrastBand(r);
                        const same = rowHex === colHex;
                        const label = `${t("cc.matrix.fg")} ${rowHex}, ${t("cc.matrix.bg")} ${colHex}, ${formatRatio(r)}:1, ${t(`cc.band.${cellBand}`)}`;
                        return (
                          <td key={colHex} className={same ? "is-same" : undefined}>
                            {same ? (
                              <span className="ccc-cell" aria-label={label}>
                                <span className="ccc-cell-swatch" style={{ background: colHex, color: rowHex }} aria-hidden="true">
                                  Aa
                                </span>
                                <span className="ccc-cell-ratio">{formatRatio(r)}</span>
                                <span className={`ccc-cell-band band-${cellBand}`}>
                                  {cellBand === "fail" ? <IconFail /> : <IconPass />}
                                  <span>{t(`cc.band.${cellBand}`)}</span>
                                </span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                className="ccc-cell is-pick"
                                onClick={() => selectPair(rowHex, colHex)}
                                aria-label={label}
                              >
                                <span className="ccc-cell-swatch" style={{ background: colHex, color: rowHex }} aria-hidden="true">
                                  Aa
                                </span>
                                <span className="ccc-cell-ratio">{formatRatio(r)}</span>
                                <span className={`ccc-cell-band band-${cellBand}`}>
                                  {cellBand === "fail" ? <IconFail /> : <IconPass />}
                                  <span>{t(`cc.band.${cellBand}`)}</span>
                                </span>
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <p className="sr-only" aria-live="polite">
        {live}
      </p>

      <ToolGuide slug="color-contrast-checker" />
      <Faq slug="color-contrast-checker" />
      <RelatedTools slug="color-contrast-checker" />
    </>
  );
}
