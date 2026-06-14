"use client";

import { useMemo, useState } from "react";
import { clampChroma, formatHex, oklch } from "culori";
import Faq from "./Faq";
import RelatedTools from "./RelatedTools";
import PageHead from "./PageHead";
import { useT, type Dict } from "../lib/i18n";

// 컨트롤 마이크로카피만 로컬 dict. 페이지 콘텐츠는 content.ts 레지스트리.
const DICT: Dict = {
  ko: {
    "pal.base": "베이스 색상",
    "pal.name": "색상 이름",
    "pal.shades": "팔레트 (50–950)",
    "pal.code": "코드",
  },
  en: {
    "pal.base": "Base color",
    "pal.name": "Color name",
    "pal.shades": "Palette (50–950)",
    "pal.code": "Code",
  },
};

const STOPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

// Tailwind 기본 팔레트에 가까운 OKLCH 명도 스케일
const L_SCALE: Record<number, number> = {
  50: 0.971,
  100: 0.936,
  200: 0.885,
  300: 0.808,
  400: 0.704,
  500: 0.637,
  600: 0.577,
  700: 0.505,
  800: 0.444,
  900: 0.396,
  950: 0.262,
};

type Shade = { stop: number; hex: string; l: number };

/** 베이스 색의 hue·chroma 유지 + OKLCH 명도 스케일로 11단계 생성.
 *  입력색은 명도가 가장 가까운 stop 에 그대로 고정. */
function generatePalette(hex: string): Shade[] {
  const base = oklch(hex);
  if (!base) return [];
  const baseL = base.l ?? 0;
  let nearest = 500;
  let best = Infinity;
  for (const s of STOPS) {
    const d = Math.abs(L_SCALE[s] - baseL);
    if (d < best) {
      best = d;
      nearest = s;
    }
  }
  return STOPS.map((s) => {
    if (s === nearest) return { stop: s, hex: formatHex(hex)!, l: baseL };
    const l = L_SCALE[s];
    const c = clampChroma(
      { mode: "oklch", l, c: base.c ?? 0, h: base.h },
      "oklch",
    );
    return { stop: s, hex: formatHex(c)!, l };
  });
}

/** 스와치 위 텍스트 대비 — 밝은 색엔 어두운 글씨, 어두운 색엔 흰 글씨 */
function readableText(l: number) {
  return l > 0.62 ? "#21242D" : "#ffffff";
}

type FormatId = "v4" | "v3" | "css";

function buildCode(format: FormatId, name: string, shades: Shade[]) {
  const key = (name.trim() || "brand").replace(/\s+/g, "-").toLowerCase();
  const lines = shades.map((s) => ({ stop: s.stop, hex: s.hex.toUpperCase() }));
  if (format === "v4") {
    return (
      "@theme {\n" +
      lines.map((l) => `  --color-${key}-${l.stop}: ${l.hex};`).join("\n") +
      "\n}"
    );
  }
  if (format === "v3") {
    return (
      `${key}: {\n` +
      lines.map((l) => `  ${l.stop}: '${l.hex}',`).join("\n") +
      "\n},"
    );
  }
  return (
    ":root {\n" +
    lines.map((l) => `  --${key}-${l.stop}: ${l.hex};`).join("\n") +
    "\n}"
  );
}

const FORMATS: { id: FormatId; label: string }[] = [
  { id: "v4", label: "Tailwind v4" },
  { id: "v3", label: "Tailwind v3" },
  { id: "css", label: "CSS" },
];

export default function TailwindPalette() {
  const t = useT(DICT);

  const [baseHex, setBaseHex] = useState("#3a70eb");
  const [hexInput, setHexInput] = useState("#3A70EB");
  const [name, setName] = useState("brand");
  const [format, setFormat] = useState<FormatId>("v4");
  const [copiedStop, setCopiedStop] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const shades = useMemo(() => generatePalette(baseHex), [baseHex]);
  const code = useMemo(
    () => buildCode(format, name, shades),
    [format, name, shades],
  );

  function applyHex(v: string) {
    setHexInput(v);
    let h = v.trim();
    if (!h.startsWith("#")) h = "#" + h;
    if (/^#[0-9a-fA-F]{6}$/.test(h)) setBaseHex(h);
  }
  function pickColor(v: string) {
    setBaseHex(v);
    setHexInput(v.toUpperCase());
  }

  async function copyHex(s: Shade) {
    try {
      await navigator.clipboard.writeText(s.hex.toUpperCase());
    } catch {
      /* ignore */
    }
    setCopiedStop(s.stop);
    setTimeout(() => setCopiedStop((c) => (c === s.stop ? null : c)), 1100);
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      /* ignore */
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1200);
  }

  return (
    <>
      <PageHead slug="tailwind-palette-generator" />

      <div className="pal-work">
        {/* 컨트롤 */}
        <div className="pal-controls">
          <div className="field-group">
            <span className="field-label">{t("pal.base")}</span>
            <div className="pal-baserow">
              <span className="swatch" style={{ background: baseHex }}>
                <input
                  type="color"
                  value={baseHex}
                  onChange={(e) => pickColor(e.target.value)}
                  aria-label={t("pal.base")}
                />
              </span>
              <input
                className="hex-in"
                type="text"
                value={hexInput}
                maxLength={7}
                spellCheck={false}
                onChange={(e) => applyHex(e.target.value)}
              />
            </div>
          </div>
          <div className="field-group">
            <span className="field-label">{t("pal.name")}</span>
            <input
              className="pal-nameinput"
              type="text"
              value={name}
              spellCheck={false}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {/* 팔레트 스와치 */}
        <div className="field-group">
          <span className="field-label">{t("pal.shades")}</span>
          <div className="pal-swatches">
            {shades.map((s) => {
              const fg = readableText(s.l);
              return (
                <button
                  key={s.stop}
                  className="pal-swatch"
                  style={{ background: s.hex }}
                  onClick={() => copyHex(s)}
                  title={`${name || "brand"}-${s.stop} · ${s.hex.toUpperCase()}`}
                >
                  <span className="pal-stop" style={{ color: fg }}>
                    {s.stop}
                  </span>
                  <span className="pal-hex" style={{ color: fg }}>
                    {copiedStop === s.stop
                      ? t("common.copied")
                      : s.hex.toUpperCase()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 코드 출력 */}
        <div className="field-group">
          <div className="pal-codehead">
            <span className="field-label">{t("pal.code")}</span>
            <div className="seg">
              {FORMATS.map((f) => (
                <button
                  key={f.id}
                  className={format === f.id ? "is-active" : ""}
                  onClick={() => setFormat(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="css-out">
            <button
              className="btn btn-sm btn-ghost copy-css"
              onClick={copyCode}
              style={
                copiedCode ? { color: "var(--color-blue-primary-700)" } : undefined
              }
            >
              {copiedCode ? t("common.copied") : t("common.copy")}
            </button>
            <pre>{code}</pre>
          </div>
        </div>
      </div>

      <Faq slug="tailwind-palette-generator" />
      <RelatedTools slug="tailwind-palette-generator" />
    </>
  );
}
