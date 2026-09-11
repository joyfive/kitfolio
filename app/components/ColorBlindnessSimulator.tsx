"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PageHead from "./PageHead";
import ToolGuide from "./ToolGuide";
import Faq from "./Faq";
import RelatedTools from "./RelatedTools";
import { useLang, useT, type Dict } from "../lib/i18n";
import { localizedHref } from "../lib/content";
import {
  ACCEPTED_TYPES,
  DEFAULT_STRENGTH,
  DEFAULT_VIEW,
  MAX_SOURCE_PIXELS,
  STRENGTH_STEP,
  VIEW_TYPES,
  applyView,
  previewSize,
  validateImageFile,
  type ImageIssue,
  type PixelBuffer,
  type ViewType,
} from "../lib/color/cvd";
import {
  SAMPLE_HEIGHT,
  SAMPLE_LABELS,
  SAMPLE_WIDTH,
  drawSampleDesign,
} from "../lib/color/sampleDesign";

// 컨트롤 마이크로카피만 로컬 dict. 페이지 콘텐츠는 content.ts 레지스트리.
const DICT: Dict = {
  ko: {
    "cb.drop.title": "검수할 시안 이미지를 올려 주세요.",
    "cb.drop.hint": "PNG·JPG·WebP · 최대 10MB · 파일 선택, 드래그 또는 붙여넣기",
    "cb.drop.privacy": "이미지는 서버로 전송되지 않고 브라우저에서 처리됩니다.",
    "cb.sample": "예시 시안으로 체험",
    "cb.replace": "다른 이미지",
    "cb.reset": "초기화",
    "cb.view": "보기 유형",
    "cb.view.protan": "Protan · 적색 계열",
    "cb.view.deutan": "Deutan · 녹색 계열",
    "cb.view.tritan": "Tritan · 청황 계열",
    "cb.view.grayscale": "흑백 점검",
    "cb.desc.protan": "적색 계열 신호가 달라질 때 빨강·초록 및 인접 색의 구분이 어떻게 변하는지 확인합니다.",
    "cb.desc.deutan": "녹색 계열 신호가 달라질 때 빨강·초록 중심의 구분이 어떻게 변하는지 확인합니다.",
    "cb.desc.tritan": "청색 계열 신호가 달라질 때 파랑·초록, 노랑·분홍 등 일부 조합의 구분이 어떻게 변하는지 확인합니다.",
    "cb.desc.grayscale": "색을 제거했을 때 텍스트·형태·패턴·명도 차이만으로 정보를 구분할 수 있는지 확인합니다.",
    "cb.strength": "시뮬레이션 강도",
    "cb.strength.note": "강도를 높일수록 해당 색각 조건에서 색상 차이가 더 크게 줄어든 모습을 확인할 수 있습니다. 실제 색 지각은 사람과 환경에 따라 다르므로 여러 강도에서 정보 구분이 유지되는지 살펴보세요.",
    "cb.original": "원본",
    "cb.loading": "이미지를 불러오는 중…",
    "cb.processing": "변환 중…",
    "cb.meta.source": "원본 크기",
    "cb.meta.preview": "처리 크기",
    "cb.meta.file": "파일",
    "cb.meta.format": "형식",
    "cb.meta.sample": "내장 예시 시안",
    "cb.err.type": "PNG, JPG 또는 WebP 이미지를 사용해 주세요.",
    "cb.err.size": "이미지 파일은 10MB 이하만 사용할 수 있습니다.",
    "cb.err.resolution": "이미지 해상도가 너무 큽니다. 40메가픽셀 이하로 줄여 다시 시도해 주세요.",
    "cb.err.decode": "이미지를 불러오지 못했습니다. 파일이 손상되지 않았는지 확인해 주세요.",
    "cb.err.process": "이미지를 변환하지 못했습니다. 더 작은 이미지로 다시 시도해 주세요.",
    "cb.check.heading": "현재 시안에서 확인할 점",
    "cb.check.1": "성공·오류·주의·선택 상태를 색상 없이도 구분할 수 있는가?",
    "cb.check.2": "차트의 선·막대·영역·범례가 서로 식별되는가?",
    "cb.check.3": "링크, 활성 탭, 선택된 항목이 일반 콘텐츠와 구분되는가?",
    "cb.check.4": "글자, 아이콘, 입력창 테두리의 명도 차이가 충분히 남아 있는가?",
    "cb.check.5": "색상 차이가 줄어들어도 텍스트·아이콘·패턴·형태 같은 보조 단서가 유지되는가?",
    "cb.check.cta.before": "구분이 어려운 글자색·배경색을 찾았다면 ",
    "cb.check.cta.link": "명도대비 검사기",
    "cb.check.cta.after": "에서 실제 WCAG 비율과 수정 후보를 확인하세요.",
    "cb.alt.original": "원본 이미지",
    "cb.alt.result": "시뮬레이션 결과",
  },
  en: {
    "cb.drop.title": "Add the design you want to review.",
    "cb.drop.hint": "PNG, JPG or WebP · up to 10MB · choose a file, drag it here or paste",
    "cb.drop.privacy": "Images are processed in your browser and never uploaded to a server.",
    "cb.sample": "Try the sample design",
    "cb.replace": "Replace image",
    "cb.reset": "Reset",
    "cb.view": "View",
    "cb.view.protan": "Protan · red range",
    "cb.view.deutan": "Deutan · green range",
    "cb.view.tritan": "Tritan · blue-yellow range",
    "cb.view.grayscale": "Grayscale check",
    "cb.desc.protan": "Shows how distinctions among reds, greens and neighboring colors change when the red signal differs.",
    "cb.desc.deutan": "Shows how red and green distinctions change when the green signal differs.",
    "cb.desc.tritan": "Shows how some blue-green and yellow-pink combinations change when the blue signal differs.",
    "cb.desc.grayscale": "Removes color so you can check whether text, shape, pattern and luminance alone still carry the information.",
    "cb.strength": "Simulation strength",
    "cb.strength.note": "A higher strength shows a larger reduction in color difference for the selected condition. Real color perception varies by person and environment, so check that distinctions survive at several strengths.",
    "cb.original": "Original",
    "cb.loading": "Loading image…",
    "cb.processing": "Processing…",
    "cb.meta.source": "Source size",
    "cb.meta.preview": "Processed at",
    "cb.meta.file": "File",
    "cb.meta.format": "Format",
    "cb.meta.sample": "Built-in sample design",
    "cb.err.type": "Use a PNG, JPG or WebP image.",
    "cb.err.size": "Image files must be 10MB or smaller.",
    "cb.err.resolution": "That image resolution is too large. Reduce it to 40 megapixels or fewer and try again.",
    "cb.err.decode": "The image could not be loaded. Check that the file is not damaged.",
    "cb.err.process": "The image could not be processed. Try again with a smaller image.",
    "cb.check.heading": "What to look for in this design",
    "cb.check.1": "Can success, error, warning and selected states be told apart without color?",
    "cb.check.2": "Are chart lines, bars, areas and legend entries distinguishable from each other?",
    "cb.check.3": "Do links, active tabs and selected items stand out from ordinary content?",
    "cb.check.4": "Is there still enough luminance difference in text, icons and input borders?",
    "cb.check.5": "When color differences shrink, do text, icons, patterns or shapes still carry the meaning?",
    "cb.check.cta.before": "Found a foreground and background pair that became hard to read? Measure the actual WCAG ratio and a passing alternative in the ",
    "cb.check.cta.link": "color contrast checker",
    "cb.check.cta.after": ".",
    "cb.alt.original": "Original image",
    "cb.alt.result": "Simulated result",
  },
};

type Source = {
  /** 미리보기 처리 크기로 줄인 픽셀 데이터: 모든 변환의 입력 */
  pixels: PixelBuffer;
  /** 업로드 원본 해상도 (표시용) */
  sourceWidth: number;
  sourceHeight: number;
  /** 파일명 · 내장 예시는 null */
  name: string | null;
  format: string;
};

function formatViewLabel(t: (k: string) => string, view: ViewType, strength: number): string {
  const name = t(`cb.view.${view}`).split(" · ")[0];
  return view === "grayscale" ? t("cb.view.grayscale") : `${name} · ${strength}%`;
}

function IconAlert() {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 2.8l5.6 10H2.4L8 2.8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 6.6v3M8 11.6v.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function ColorBlindnessSimulator() {
  const { lang } = useLang();
  const t = useT(DICT);

  const [source, setSource] = useState<Source | null>(null);
  const [view, setView] = useState<ViewType>(DEFAULT_VIEW);
  const [strength, setStrength] = useState(DEFAULT_STRENGTH);
  const [issue, setIssue] = useState<ImageIssue | null>(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [live, setLive] = useState("");
  const [dragging, setDragging] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const originalRef = useRef<HTMLCanvasElement>(null);
  const resultRef = useRef<HTMLCanvasElement>(null);

  /* ── 이미지 읽기 ────────────────────────────────────── */

  const loadFile = useCallback(async (file: File) => {
    const fileIssue = validateImageFile(file);
    if (fileIssue) {
      // 새 이미지가 실패해도 기존 정상 결과는 지우지 않는다.
      setIssue(fileIssue);
      return;
    }
    setIssue(null);
    setLoading(true);

    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();

      const sw = img.naturalWidth;
      const sh = img.naturalHeight;
      if (sw * sh > MAX_SOURCE_PIXELS) {
        setIssue("resolution");
        return;
      }

      const { width, height } = previewSize(sw, sh);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        setIssue("process");
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      const data = ctx.getImageData(0, 0, width, height);

      setSource({
        pixels: { data: data.data, width, height },
        sourceWidth: sw,
        sourceHeight: sh,
        name: file.name,
        format: file.type.replace("image/", "").toUpperCase(),
      });
    } catch {
      setIssue("decode");
    } finally {
      // 픽셀 데이터를 확보한 뒤에는 Object URL 을 들고 있을 이유가 없다.
      URL.revokeObjectURL(url);
      setLoading(false);
    }
  }, []);

  const loadSample = useCallback(() => {
    setIssue(null);
    const canvas = document.createElement("canvas");
    canvas.width = SAMPLE_WIDTH;
    canvas.height = SAMPLE_HEIGHT;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) {
      setIssue("process");
      return;
    }
    drawSampleDesign(ctx, SAMPLE_LABELS[lang]);
    const data = ctx.getImageData(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT);
    setSource({
      pixels: { data: data.data, width: SAMPLE_WIDTH, height: SAMPLE_HEIGHT },
      sourceWidth: SAMPLE_WIDTH,
      sourceHeight: SAMPLE_HEIGHT,
      name: null,
      format: "PNG",
    });
  }, [lang]);

  function pickFiles(files: FileList | null) {
    const file = files?.[0];
    if (file) void loadFile(file);
  }

  function reset() {
    setSource(null);
    setIssue(null);
    setView(DEFAULT_VIEW);
    setStrength(DEFAULT_STRENGTH);
  }

  // 붙여넣기: 텍스트 입력의 일반 붙여넣기는 가로채지 않는다.
  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable) return;
      const item = Array.from(e.clipboardData?.items ?? []).find((i) =>
        (ACCEPTED_TYPES as readonly string[]).includes(i.type),
      );
      // 클립보드에 이미지가 없으면 아무것도 하지 않는다 (오류도 띄우지 않는다).
      if (!item) return;
      const file = item.getAsFile();
      if (file) {
        e.preventDefault();
        void loadFile(file);
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [loadFile]);

  /* ── 변환 ──────────────────────────────────────────── */

  // 원본 캔버스: 소스가 바뀔 때만 다시 그린다.
  useEffect(() => {
    const canvas = originalRef.current;
    if (!canvas || !source) return;
    canvas.width = source.pixels.width;
    canvas.height = source.pixels.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.putImageData(
      new ImageData(source.pixels.data, source.pixels.width, source.pixels.height),
      0,
      0,
    );
  }, [source]);

  // 결과 캔버스: 유형·강도가 바뀔 때 최신 선택값만 반영한다.
  useEffect(() => {
    if (!source) return;
    let cancelled = false;

    // 150ms 이상 걸릴 때만 처리 상태를 보여준다.
    const slow = setTimeout(() => {
      if (!cancelled) setProcessing(true);
    }, 150);

    const run = setTimeout(() => {
      if (cancelled) return;
      try {
        const out = applyView(source.pixels, view, strength);
        const canvas = resultRef.current;
        if (!canvas || cancelled) return;
        canvas.width = out.width;
        canvas.height = out.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.putImageData(new ImageData(out.data, out.width, out.height), 0, 0);
        setIssue((prev) => (prev === "process" ? null : prev));
      } catch {
        if (!cancelled) setIssue("process");
      } finally {
        if (!cancelled) {
          clearTimeout(slow);
          setProcessing(false);
        }
      }
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(slow);
      clearTimeout(run);
    };
  }, [source, view, strength]);

  // 슬라이더를 움직일 때마다 읽히지 않도록 디바운스한다.
  useEffect(() => {
    if (!source) return;
    const id = setTimeout(() => setLive(formatViewLabel(t, view, strength)), 500);
    return () => clearTimeout(id);
  }, [source, view, strength, t]);

  const meta = useMemo(() => {
    if (!source) return null;
    const scaled =
      source.pixels.width !== source.sourceWidth || source.pixels.height !== source.sourceHeight;
    return { scaled };
  }, [source]);

  const resultLabel = formatViewLabel(t, view, strength);
  const canvasName = source?.name ?? t("cb.meta.sample");

  return (
    <>
      <PageHead slug="color-blindness-simulator" />

      <div className="cbs-work">
        {!source ? (
          <div className="cbs-intro">
            <div
              className={`cbs-drop${dragging ? " is-over" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => fileRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  fileRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                pickFiles(e.dataTransfer.files);
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                <path d="M12 16V4M7 9l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" strokeLinecap="round" />
              </svg>
              <p className="cbs-drop-title">{t("cb.drop.title")}</p>
              <span className="cbs-drop-hint">{t("cb.drop.hint")}</span>
              <span className="cbs-drop-privacy">{t("cb.drop.privacy")}</span>
            </div>
            <button type="button" className="btn btn-outline cbs-sample" onClick={loadSample}>
              {t("cb.sample")}
            </button>
          </div>
        ) : (
          <>
            <div className="cbs-controls">
              <div className="field-group">
                <span className="field-label" id="cbs-view-label">
                  {t("cb.view")}
                </span>
                <div className="cbs-views" role="radiogroup" aria-labelledby="cbs-view-label">
                  {VIEW_TYPES.map((v) => (
                    <button
                      key={v}
                      type="button"
                      role="radio"
                      aria-checked={view === v}
                      className={`cbs-view${view === v ? " is-active" : ""}`}
                      onClick={() => setView(v)}
                    >
                      {t(`cb.view.${v}`)}
                    </button>
                  ))}
                </div>
                <p className="cbs-note">{t(`cb.desc.${view}`)}</p>
              </div>

              {view !== "grayscale" && (
                <div className="field-group">
                  <label className="field-label" htmlFor="cbs-strength">
                    {t("cb.strength")}
                  </label>
                  <div className="cbs-strength">
                    <input
                      id="cbs-strength"
                      type="range"
                      min={0}
                      max={100}
                      step={STRENGTH_STEP}
                      value={strength}
                      onChange={(e) => setStrength(Number(e.target.value))}
                    />
                    <output className="cbs-strength-val" htmlFor="cbs-strength">
                      {strength}%
                    </output>
                  </div>
                  <p className="cbs-note">{t("cb.strength.note")}</p>
                </div>
              )}

              <div className="cbs-actions">
                <button type="button" className="btn btn-sm btn-outline" onClick={() => fileRef.current?.click()}>
                  {t("cb.replace")}
                </button>
                <button type="button" className="btn btn-sm btn-ghost" onClick={reset}>
                  {t("cb.reset")}
                </button>
              </div>
            </div>

            <div className="cbs-compare">
              <figure className="cbs-pane">
                <figcaption className="cbs-pane-head">
                  <span className="cbs-pane-label">{t("cb.original")}</span>
                </figcaption>
                <div className="cbs-canvas-box">
                  <canvas
                    ref={originalRef}
                    role="img"
                    aria-label={`${t("cb.alt.original")}: ${canvasName}`}
                  />
                </div>
              </figure>
              <figure className="cbs-pane">
                <figcaption className="cbs-pane-head">
                  <span className="cbs-pane-label">{resultLabel}</span>
                  {processing && <span className="cbs-badge">{t("cb.processing")}</span>}
                </figcaption>
                <div className="cbs-canvas-box">
                  <canvas
                    ref={resultRef}
                    role="img"
                    aria-label={`${t("cb.alt.result")}: ${canvasName}, ${resultLabel}`}
                  />
                </div>
              </figure>
            </div>

            <dl className="cbs-meta">
              <div>
                <dt>{t("cb.meta.file")}</dt>
                <dd>{source.name ?? t("cb.meta.sample")}</dd>
              </div>
              <div>
                <dt>{t("cb.meta.format")}</dt>
                <dd>{source.format}</dd>
              </div>
              <div>
                <dt>{t("cb.meta.source")}</dt>
                <dd>
                  {source.sourceWidth} × {source.sourceHeight}
                </dd>
              </div>
              {meta?.scaled && (
                <div>
                  <dt>{t("cb.meta.preview")}</dt>
                  <dd>
                    {source.pixels.width} × {source.pixels.height}
                  </dd>
                </div>
              )}
            </dl>
          </>
        )}

        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          hidden
          onChange={(e) => {
            pickFiles(e.target.files);
            e.target.value = "";
          }}
        />

        {(issue || loading) && (
          <p className={`cbs-status${issue ? " is-error" : ""}`} role="status">
            {issue ? <IconAlert /> : null}
            <span>{issue ? t(`cb.err.${issue}`) : t("cb.loading")}</span>
          </p>
        )}
      </div>

      <section className="cbs-checks" aria-label={t("cb.check.heading")}>
        <h2>{t("cb.check.heading")}</h2>
        <ul>
          {["1", "2", "3", "4", "5"].map((n) => (
            <li key={n}>{t(`cb.check.${n}`)}</li>
          ))}
        </ul>
        <p className="cbs-note">
          {t("cb.check.cta.before")}
          <a href={localizedHref(lang, "/color-contrast-checker")}>{t("cb.check.cta.link")}</a>
          {t("cb.check.cta.after")}
        </p>
      </section>

      <p className="sr-only" aria-live="polite">
        {live}
      </p>

      <ToolGuide slug="color-blindness-simulator" />
      <Faq slug="color-blindness-simulator" />
      <RelatedTools slug="color-blindness-simulator" />
    </>
  );
}
