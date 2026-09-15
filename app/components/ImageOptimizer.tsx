"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PageHead from "./PageHead";
import ToolGuide from "./ToolGuide";
import Faq from "./Faq";
import RelatedTools from "./RelatedTools";
import { useLang, useT, type Dict } from "../lib/i18n";
import { trackEvent } from "../lib/analytics";
import { downloadBlob } from "../lib/downloadBlob";
import {
  ACCEPT,
  DEFAULT_FORMAT,
  DEFAULT_QUALITY,
  FORMAT_LABEL,
  OUTPUT_FORMATS,
  detectFormat,
  fileSizeBucket,
  formatBytes,
  formatPercent,
  outputFileName,
  savings,
  supportsAlpha,
  supportsQuality,
  type ImageFormat,
} from "../lib/image/imageFormats";
import {
  ImageError,
  imageErrorMessage,
  normalizeImageError,
  type ImageErrorType,
} from "../lib/image/imageErrors";
import { IMAGE_LIMITS, LIMIT_SUMMARY } from "../lib/image/imageLimits";
import { optimizeImage } from "../lib/image/optimize";
import { ZIP_NAME, zipImages } from "../lib/image/zip";

const SLUG = "image-optimizer";

const DICT: Dict = {
  ko: {
    "io.upload": "이미지 추가",
    "io.drop": "이미지를 여기에 놓으세요",
    "io.formats": "PNG, JPG, WebP",
    "io.choose": "또는 파일 선택",
    "io.limits": `파일당 최대 ${LIMIT_SUMMARY.maxFileMb}MB · 최대 ${LIMIT_SUMMARY.maxFiles}개 · 한 변 ${LIMIT_SUMMARY.maxSide}px 이하`,
    "io.settings": "출력 설정",
    "io.format": "출력 포맷",
    "io.quality": "품질",
    "io.pngNote": "PNG는 원본 크기를 유지하며 무손실 방식으로 다시 저장합니다.",
    "io.alphaNote":
      "JPG는 투명 배경을 지원하지 않습니다. 투명 영역은 흰색으로 저장됩니다.",
    "io.keepSize": "원본 이미지 크기 유지",
    "io.privacy": "이미지는 서버로 업로드되지 않으며 브라우저에서만 처리됩니다.",
    "io.run": "이미지 최적화",
    "io.rerun": "다시 최적화",
    "io.running": "이미지를 최적화하고 있습니다",
    "io.files": "파일",
    "io.clearAll": "전체 초기화",
    "io.remove": "제거",
    "io.download": "다운로드",
    "io.downloadAll": "전체 다운로드",
    "io.zipping": "ZIP을 만들고 있습니다",
    "io.original": "원본",
    "io.optimized": "결과",
    "io.saved": "절감",
    "io.larger": "원본보다 {size} 큼",
    "io.same": "용량 변화 없음",
    "io.statusReady": "대기",
    "io.statusProcessing": "처리 중",
    "io.statusCompleted": "완료",
    "io.statusError": "오류",
    "io.statusStale": "설정 변경됨",
    "io.staleHint": "설정이 바뀌었습니다. 다시 최적화하면 결과를 받을 수 있습니다.",
    "io.emptyResults": "아직 결과가 없습니다. 이미지를 추가하고 최적화를 실행하세요.",
    "io.partial": "완료된 {done}개만 ZIP에 포함됩니다. {failed}개는 처리하지 못했습니다.",
    "io.summary": "완료 {done}개 · 오류 {failed}개",
    "io.deviceHint":
      "브라우저 메모리는 기기마다 다릅니다. 제한 이하에서도 아주 큰 이미지는 실패할 수 있습니다.",
    "io.progress": "{done} / {total} 처리 완료",
  },
  en: {
    "io.upload": "Add images",
    "io.drop": "Drop images here",
    "io.formats": "PNG, JPG, WebP",
    "io.choose": "or choose files",
    "io.limits": `Up to ${LIMIT_SUMMARY.maxFileMb}MB per file · ${LIMIT_SUMMARY.maxFiles} files · ${LIMIT_SUMMARY.maxSide}px per side`,
    "io.settings": "Output settings",
    "io.format": "Output format",
    "io.quality": "Quality",
    "io.pngNote": "PNG is re-encoded losslessly while preserving the original dimensions.",
    "io.alphaNote":
      "JPG does not support transparency. Transparent areas will be saved with a white background.",
    "io.keepSize": "Original dimensions preserved",
    "io.privacy": "Your images stay in your browser and are never uploaded.",
    "io.run": "Optimize images",
    "io.rerun": "Optimize again",
    "io.running": "Optimizing images",
    "io.files": "Files",
    "io.clearAll": "Clear all",
    "io.remove": "Remove",
    "io.download": "Download",
    "io.downloadAll": "Download all",
    "io.zipping": "Building ZIP",
    "io.original": "Original",
    "io.optimized": "Optimized",
    "io.saved": "Saved",
    "io.larger": "{size} larger than original",
    "io.same": "No change in file size",
    "io.statusReady": "Ready",
    "io.statusProcessing": "Processing",
    "io.statusCompleted": "Completed",
    "io.statusError": "Error",
    "io.statusStale": "Settings changed",
    "io.staleHint": "Settings changed. Optimize again to get new results.",
    "io.emptyResults": "No results yet. Add images and run the optimizer.",
    "io.partial": "Only the {done} completed files are included. {failed} could not be processed.",
    "io.summary": "{done} completed · {failed} failed",
    "io.deviceHint":
      "Browser memory varies by device. Very large images can fail even below these limits.",
    "io.progress": "{done} of {total} processed",
  },
};

type ItemStatus = "ready" | "processing" | "completed" | "error";

type ItemResult = {
  blob: Blob;
  name: string;
  bytes: number;
  width: number;
  height: number;
  format: ImageFormat;
  /** 이 결과를 만든 설정. 현재 설정과 다르면 stale 로 본다. */
  settings: string;
};

type Item = {
  id: string;
  file: File;
  name: string;
  format: ImageFormat;
  bytes: number;
  previewUrl: string;
  status: ItemStatus;
  error?: ImageErrorType;
  result?: ItemResult;
};

/** 현재 설정의 지문: 포맷이 바뀌거나(PNG가 아니면) 품질이 바뀌면 값이 달라진다. */
function settingsKey(format: ImageFormat, quality: number): string {
  return supportsQuality(format) ? `${format}:${quality}` : format;
}

/** 브라우저가 상태 변화를 한 번 그릴 시간을 준다 (순차 처리 중 UI 멈춤 방지). */
function yieldToPaint(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => setTimeout(resolve, 0));
    } else {
      setTimeout(resolve, 0);
    }
  });
}

function fill(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));
}

let idSeq = 0;

export default function ImageOptimizer() {
  const { lang } = useLang();
  const t = useT(DICT);

  const [items, setItems] = useState<Item[]>([]);
  const [format, setFormat] = useState<ImageFormat>(DEFAULT_FORMAT);
  const [quality, setQuality] = useState(DEFAULT_QUALITY);
  const [addError, setAddError] = useState<ImageErrorType | null>(null);
  const [running, setRunning] = useState(false);
  const [zipping, setZipping] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const runningRef = useRef(false);
  const inputReportedRef = useRef(false);

  /** 목록의 동기 사본. Object URL 수명 관리와 순차 처리 루프가 이 값을 기준으로 한다.
   *  (setItems 의 updater 는 개발 모드에서 두 번 호출될 수 있어 부수효과를 넣지 않는다) */
  const itemsRef = useRef<Item[]>([]);
  const commitItems = useCallback((next: Item[]) => {
    itemsRef.current = next;
    setItems(next);
  }, []);
  /** 진행 중 상태 갱신처럼 "현재 값에서 파생"되는 변경용 */
  const mapItems = useCallback(
    (fn: (item: Item) => Item) => commitItems(itemsRef.current.map(fn)),
    [commitItems],
  );

  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) URL.revokeObjectURL(item.previewUrl);
    };
  }, []);

  useEffect(() => {
    trackEvent("tool_view", { slug: SLUG, locale: lang });
  }, [lang]);

  const key = settingsKey(format, quality);

  const isStale = useCallback(
    (item: Item) => Boolean(item.result) && item.result?.settings !== key,
    [key],
  );

  const completed = useMemo(
    () => items.filter((i) => i.status === "completed" && i.result && !isStale(i)),
    [items, isStale],
  );
  const failedCount = items.filter((i) => i.status === "error").length;
  const hasResults = items.some((i) => i.result);
  const staleCount = items.filter((i) => isStale(i)).length;

  /* ---------- 파일 추가 ---------- */

  const addFiles = useCallback(
    (list: FileList | null) => {
      if (!list || list.length === 0) return;
      let firstError: ImageErrorType | null = null;
      const accepted: Item[] = [];

      const prev = itemsRef.current;
      let count = prev.length;
      let total = prev.reduce((s, i) => s + i.bytes, 0);

      for (const file of Array.from(list)) {
        const detected = detectFormat(file);
        if (!detected) {
          firstError = firstError ?? "unsupported-format";
          continue;
        }
        if (file.size > IMAGE_LIMITS.maxFileBytes) {
          firstError = firstError ?? "file-too-large";
          continue;
        }
        if (count >= IMAGE_LIMITS.maxFiles || total + file.size > IMAGE_LIMITS.maxTotalBytes) {
          firstError = firstError ?? "too-many-files";
          break;
        }
        accepted.push({
          id: `img-${++idSeq}`,
          file,
          name: file.name,
          format: detected,
          bytes: file.size,
          previewUrl: URL.createObjectURL(file),
          status: "ready",
        });
        count += 1;
        total += file.size;
      }

      if (accepted.length > 0) commitItems([...prev, ...accepted]);
      setAddError(firstError);

      if (accepted.length > 0 && !inputReportedRef.current) {
        inputReportedRef.current = true;
        trackEvent("tool_input", {
          slug: SLUG,
          file_count: accepted.length,
          input_formats: Array.from(new Set(accepted.map((i) => i.format)))
            .sort()
            .join(","),
          total_input_bytes: accepted.reduce((s, i) => s + i.bytes, 0),
        });
      }
    },
    [commitItems],
  );

  const removeItem = useCallback(
    (id: string) => {
      setAddError(null);
      const target = itemsRef.current.find((i) => i.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      commitItems(itemsRef.current.filter((i) => i.id !== id));
    },
    [commitItems],
  );

  const clearAll = useCallback(() => {
    setAddError(null);
    setProgress({ done: 0, total: 0 });
    inputReportedRef.current = false;
    for (const item of itemsRef.current) URL.revokeObjectURL(item.previewUrl);
    commitItems([]);
  }, [commitItems]);

  /* ---------- 최적화 실행 ---------- */

  const run = useCallback(async () => {
    if (runningRef.current) return;
    const targets = itemsRef.current;
    if (targets.length === 0) return;

    runningRef.current = true;
    setRunning(true);
    setAddError(null);
    setProgress({ done: 0, total: targets.length });

    trackEvent("tool_run", {
      slug: SLUG,
      file_count: targets.length,
      output_format: format,
      quality: supportsQuality(format) ? quality : 0,
    });

    const runKey = settingsKey(format, quality);
    let successCount = 0;
    let errorCount = 0;
    let inputBytes = 0;
    let outputBytes = 0;

    for (const target of targets) {
      mapItems((i) =>
        i.id === target.id
          ? { ...i, status: "processing", error: undefined, result: undefined }
          : i,
      );
      await yieldToPaint();

      try {
        const out = await optimizeImage(target.file, format, quality);
        const result: ItemResult = {
          blob: out.blob,
          name: outputFileName(target.name, target.format, format),
          bytes: out.bytes,
          width: out.width,
          height: out.height,
          format,
          settings: runKey,
        };
        successCount += 1;
        inputBytes += target.bytes;
        outputBytes += out.bytes;
        mapItems((i) => (i.id === target.id ? { ...i, status: "completed", result } : i));
      } catch (e) {
        const type = e instanceof ImageError ? e.type : normalizeImageError(e);
        errorCount += 1;
        trackEvent("tool_error", {
          slug: SLUG,
          error_type: type,
          input_format: target.format,
          file_size_bucket: fileSizeBucket(target.bytes),
        });
        mapItems((i) => (i.id === target.id ? { ...i, status: "error", error: type } : i));
      }

      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }

    trackEvent("tool_result", {
      slug: SLUG,
      success_count: successCount,
      error_count: errorCount,
      output_format: format,
      total_input_bytes: inputBytes,
      total_output_bytes: outputBytes,
    });

    runningRef.current = false;
    setRunning(false);
  }, [format, quality, mapItems]);

  /* ---------- 다운로드 ---------- */

  const downloadOne = useCallback(
    (item: Item) => {
      if (!item.result || isStale(item)) return;
      downloadBlob(item.result.blob, item.result.name);
      trackEvent("tool_download", {
        slug: SLUG,
        download_type: "single",
        file_count: 1,
        output_format: item.result.format,
      });
    },
    [isStale],
  );

  const downloadAll = useCallback(async () => {
    if (completed.length < 2 || zipping) return;
    setZipping(true);
    try {
      const zip = await zipImages(
        completed.map((i) => ({ name: i.result!.name, blob: i.result!.blob })),
      );
      downloadBlob(zip, ZIP_NAME);
      trackEvent("tool_download", {
        slug: SLUG,
        download_type: "zip",
        file_count: completed.length,
        output_format: format,
      });
    } finally {
      setZipping(false);
    }
  }, [completed, format, zipping]);

  /* ---------- 렌더 ---------- */

  const statusLabel: Record<ItemStatus, string> = {
    ready: t("io.statusReady"),
    processing: t("io.statusProcessing"),
    completed: t("io.statusCompleted"),
    error: t("io.statusError"),
  };

  const openPicker = () => fileInputRef.current?.click();

  const onFormatKeyDown = (e: React.KeyboardEvent, index: number) => {
    const last = OUTPUT_FORMATS.length - 1;
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = index === last ? 0 : index + 1;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = index === 0 ? last : index - 1;
    if (next < 0) return;
    e.preventDefault();
    setFormat(OUTPUT_FORMATS[next]);
    const group = e.currentTarget.parentElement;
    (group?.children[next] as HTMLButtonElement | undefined)?.focus();
  };

  return (
    <>
      <PageHead slug={SLUG} />

      <div className="io-work">
        {/* 좌: 업로드 + 출력 설정 */}
        <div className="io-panel">
          <div className="io-panel-inner">
            <div
              className={"io-drop" + (dragOver ? " is-over" : "") + (running ? " is-disabled" : "")}
              role="button"
              tabIndex={running ? -1 : 0}
              aria-disabled={running}
              aria-label={t("io.upload")}
              onClick={openPicker}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && !running) {
                  e.preventDefault();
                  openPicker();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (!running) setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (!running) addFiles(e.dataTransfer.files);
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
                <path d="M12 16V4M7 9l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" strokeLinecap="round" />
              </svg>
              <p className="io-drop-title">{t("io.drop")}</p>
              <span className="io-drop-formats">{t("io.formats")}</span>
              <span className="io-drop-hint">{t("io.choose")}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPT}
                multiple
                hidden
                onChange={(e) => {
                  addFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </div>
            <p className="io-limits">{t("io.limits")}</p>

            {addError && (
              <p className="io-alert" role="alert">
                {imageErrorMessage(addError, lang)}
              </p>
            )}

            <div className="io-settings">
              <span className="field-label" id="io-format-label">
                {t("io.format")}
              </span>
              <div className="seg io-seg" role="radiogroup" aria-labelledby="io-format-label">
                {OUTPUT_FORMATS.map((f, i) => (
                  <button
                    key={f}
                    type="button"
                    role="radio"
                    aria-checked={format === f}
                    tabIndex={format === f ? 0 : -1}
                    className={format === f ? "is-active" : ""}
                    onClick={() => setFormat(f)}
                    onKeyDown={(e) => onFormatKeyDown(e, i)}
                  >
                    {FORMAT_LABEL[f]}
                  </button>
                ))}
              </div>

              {supportsQuality(format) ? (
                <div className="io-quality">
                  <label className="field-label" htmlFor="io-quality">
                    {t("io.quality")}
                  </label>
                  <div className="io-quality-row">
                    <input
                      id="io-quality"
                      type="range"
                      min={1}
                      max={100}
                      step={1}
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                    />
                    <output htmlFor="io-quality" className="io-quality-value">
                      {quality}
                    </output>
                  </div>
                </div>
              ) : (
                <p className="io-note">{t("io.pngNote")}</p>
              )}

              {!supportsAlpha(format) && <p className="io-note">{t("io.alphaNote")}</p>}

              <p className="io-keep">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M3 8.5l3.2 3.2L13 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t("io.keepSize")}
              </p>

              <button
                type="button"
                className="btn btn-primary io-run"
                onClick={run}
                disabled={items.length === 0 || running}
              >
                {hasResults ? t("io.rerun") : t("io.run")}
              </button>

              <p className="io-privacy">{t("io.privacy")}</p>
            </div>
          </div>
        </div>

        {/* 우: 파일 목록 + 결과 */}
        <div className="io-results">
          <div className="io-results-head">
            <span className="field-label">
              {t("io.files")}
              {items.length > 0 ? ` · ${items.length}` : ""}
            </span>
            {items.length > 0 && (
              <button
                type="button"
                className="btn btn-sm btn-ghost"
                onClick={clearAll}
                disabled={running}
              >
                {t("io.clearAll")}
              </button>
            )}
          </div>

          <p className="io-live" role="status" aria-live="polite">
            {running
              ? `${t("io.running")} · ${fill(t("io.progress"), progress)}`
              : hasResults
                ? fill(t("io.summary"), { done: completed.length, failed: failedCount })
                : ""}
          </p>

          {items.length === 0 ? (
            <p className="io-empty">{t("io.emptyResults")}</p>
          ) : (
            <ul className="io-list">
              {items.map((item) => {
                const stale = isStale(item);
                const result = item.result;
                const diff = result ? savings(item.bytes, result.bytes) : null;
                return (
                  <li key={item.id} className={"io-card is-" + item.status}>
                    <span className="io-thumb">
                      {/* 원본 미리보기: Object URL 은 제거·초기화·unmount 시 revoke 된다. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.previewUrl} alt="" loading="lazy" />
                    </span>

                    <span className="io-card-body">
                      <span className="io-names">
                        <span className="io-name" title={item.name}>
                          {item.name}
                        </span>
                        {result && (
                          <>
                            <span className="io-arrow" aria-hidden>
                              →
                            </span>
                            <span className="io-name io-name-out" title={result.name}>
                              {result.name}
                            </span>
                          </>
                        )}
                      </span>

                      <span className="io-meta">
                        <span className={"io-status io-status-" + (stale ? "stale" : item.status)}>
                          <span className="io-status-dot" aria-hidden />
                          {stale ? t("io.statusStale") : statusLabel[item.status]}
                        </span>
                        {result && (
                          <span className="io-dims">
                            {result.width} × {result.height} px
                          </span>
                        )}
                      </span>

                      {item.status === "error" && item.error && (
                        <span className="io-alert" role="alert">
                          {imageErrorMessage(item.error, lang)}
                        </span>
                      )}

                      {result && (
                        <span className="io-sizes">
                          <span className="io-size">
                            <span className="io-size-label">{t("io.original")}</span>
                            {formatBytes(item.bytes)}
                          </span>
                          <span className="io-size">
                            <span className="io-size-label">{t("io.optimized")}</span>
                            {formatBytes(result.bytes)}
                          </span>
                          <span
                            className={
                              "io-delta" +
                              (diff!.larger ? " is-larger" : diff!.saved === 0 ? " is-same" : "")
                            }
                          >
                            {diff!.saved === 0
                              ? t("io.same")
                              : diff!.larger
                                ? fill(t("io.larger"), { size: formatBytes(diff!.saved) })
                                : `${t("io.saved")} ${formatBytes(diff!.saved)} · ${formatPercent(diff!.percent)}`}
                          </span>
                        </span>
                      )}

                      {stale && <span className="io-note io-note-stale">{t("io.staleHint")}</span>}
                    </span>

                    <span className="io-card-actions">
                      {result && (
                        <button
                          type="button"
                          className="btn btn-sm btn-outline"
                          onClick={() => downloadOne(item)}
                          disabled={stale}
                        >
                          {t("io.download")}
                        </button>
                      )}
                      <button
                        type="button"
                        className="io-icon-btn"
                        aria-label={`${t("io.remove")}: ${item.name}`}
                        onClick={() => removeItem(item.id)}
                        disabled={running}
                      >
                        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
                          <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
                        </svg>
                      </button>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}

          {completed.length >= 2 && (
            <div className="io-bulk">
              <button
                type="button"
                className="btn btn-primary"
                onClick={downloadAll}
                disabled={zipping}
              >
                {zipping ? t("io.zipping") : `${t("io.downloadAll")} · ${completed.length}`}
              </button>
              {failedCount > 0 && (
                <p className="io-note">
                  {fill(t("io.partial"), { done: completed.length, failed: failedCount })}
                </p>
              )}
            </div>
          )}

          {staleCount > 0 && !running && <p className="io-note">{t("io.staleHint")}</p>}
          <p className="io-device-hint">{t("io.deviceHint")}</p>
        </div>
      </div>

      <ToolGuide slug={SLUG} />
      <Faq slug={SLUG} />
      <RelatedTools slug={SLUG} />
    </>
  );
}
