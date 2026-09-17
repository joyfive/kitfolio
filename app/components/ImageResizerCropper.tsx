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
  DEFAULT_QUALITY,
  FORMAT_LABEL,
  detectFormat,
  fileSizeBucket,
  formatBytes,
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
import {
  HANDLES,
  RATIOS,
  clampRect,
  fitRatio,
  initialCrop,
  moveRect,
  nudgeSize,
  ratioLabel,
  ratioValue,
  resizeRect,
  toPercent,
  type Handle,
  type RatioId,
  type Rect,
} from "../lib/image/crop";
import {
  MAX_SCALE,
  MIN_SCALE,
  SCALE_PRESETS,
  clampDimension,
  clampScale,
  isUpscale,
  lockedDimension,
  outputName,
  parseDimension,
  scaleDimensions,
  scalePercent,
} from "../lib/image/resize";
import {
  OUTPUT_CHOICES,
  fullTransform,
  readImageSize,
  resolveFormat,
  transformImage,
  type OutputChoice,
} from "../lib/image/transform";

const SLUG = "image-resizer-cropper";

/** 미리보기 배율: 표시에만 적용되며 결과 픽셀 수에는 영향을 주지 않는다. */
const MIN_ZOOM = 100;
const MAX_ZOOM = 400;
const ZOOM_STEP = 25;
/** 배율 100% 일 때 미리보기가 차지할 수 있는 최대 높이 (px).
 *  globals.css 의 .irc-stage-wrap max-height 에서 상하 패딩을 뺀 값과 맞춘다. */
const STAGE_MAX_HEIGHT = 520;

type Mode = "resize" | "crop";

const DICT: Dict = {
  ko: {
    "irc.drop": "이미지를 여기에 놓으세요",
    "irc.formats": "PNG, JPG, WebP",
    "irc.choose": "또는 파일 선택",
    "irc.upload": "이미지 추가",
    "irc.limits": `파일 최대 ${LIMIT_SUMMARY.maxFileMb}MB · 한 변 ${LIMIT_SUMMARY.maxSide}px 이하`,
    "irc.privacy": "이미지는 서버로 업로드되지 않으며 브라우저에서만 처리됩니다.",
    "irc.modeResize": "Resize",
    "irc.modeCrop": "Crop",
    "irc.modes": "편집 모드",
    "irc.replace": "다른 이미지 선택",
    "irc.clearAll": "모두 지우기",
    "irc.reset": "초기화",
    "irc.retry": "다시 시도",
    "irc.width": "가로 (px)",
    "irc.height": "세로 (px)",
    "irc.lock": "가로세로 비율 잠금",
    "irc.scale": "배율",
    "irc.distortWarn": "가로세로 비율을 해제하면 이미지가 왜곡될 수 있습니다.",
    "irc.upscaleWarn": "원본보다 크게 만들면 이미지가 흐릿해질 수 있습니다.",
    "irc.dimError": "1 이상의 정수로 입력해 주세요.",
    "irc.ratio": "비율",
    "irc.ratioFree": "Free",
    "irc.cropArea": "선택 영역",
    "irc.cropOut": "저장할 크기",
    "irc.outWidth": "결과 가로 (px)",
    "irc.outHeight": "결과 세로 (px)",
    "irc.outLock": "결과 비율 잠금",
    "irc.cropBox": "크롭 영역. 방향키로 이동, Shift+방향키로 10px 이동, Alt+방향키로 크기 조절.",
    "irc.cropHint": "미리보기에서 영역을 끌어 옮기거나 모서리를 끌어 크기를 바꿉니다. 키보드는 방향키로 이동, Alt+방향키로 크기 조절입니다.",
    "irc.zoom": "미리보기 배율",
    "irc.zoomIn": "미리보기 확대",
    "irc.zoomOut": "미리보기 축소",
    "irc.zoomNote": "미리보기 배율은 화면 표시에만 적용되며 결과 픽셀 수는 바뀌지 않습니다.",
    "irc.format": "출력 포맷",
    "irc.formatOriginal": "원본 유지",
    "irc.quality": "품질",
    "irc.alphaNote": "JPG는 투명 배경을 지원하지 않습니다. 투명 영역은 흰색으로 저장됩니다.",
    "irc.runResize": "이미지 리사이즈",
    "irc.runCrop": "이미지 자르기",
    "irc.rerun": "다시 적용",
    "irc.running": "이미지를 처리하고 있습니다",
    "irc.original": "원본",
    "irc.output": "결과",
    "irc.result": "결과",
    "irc.resultEmpty": "설정을 마친 뒤 실행하면 결과가 여기에 표시됩니다.",
    "irc.download": "다운로드",
    "irc.staleHint": "설정이 바뀌었습니다. 다시 적용하면 새 결과를 받을 수 있습니다.",
    "irc.fileSize": "파일 용량",
    "irc.deviceHint": "브라우저 메모리는 기기마다 다릅니다. 제한 이하에서도 아주 큰 이미지는 실패할 수 있습니다.",
    "irc.preview": "편집 미리보기",
  },
  en: {
    "irc.drop": "Drop an image here",
    "irc.formats": "PNG, JPG, WebP",
    "irc.choose": "or choose a file",
    "irc.upload": "Add an image",
    "irc.limits": `Up to ${LIMIT_SUMMARY.maxFileMb}MB per file · ${LIMIT_SUMMARY.maxSide}px per side`,
    "irc.privacy": "Your image stays in your browser and is never uploaded.",
    "irc.modeResize": "Resize",
    "irc.modeCrop": "Crop",
    "irc.modes": "Editing mode",
    "irc.replace": "Choose another image",
    "irc.clearAll": "Clear all",
    "irc.reset": "Reset",
    "irc.retry": "Try again",
    "irc.width": "Width (px)",
    "irc.height": "Height (px)",
    "irc.lock": "Lock aspect ratio",
    "irc.scale": "Scale",
    "irc.distortWarn": "Unlocking the aspect ratio may distort the image.",
    "irc.upscaleWarn": "Upscaling beyond the original size may make the image look blurry.",
    "irc.dimError": "Enter a whole number greater than 0.",
    "irc.ratio": "Ratio",
    "irc.ratioFree": "Free",
    "irc.cropArea": "Crop area",
    "irc.cropOut": "Output size",
    "irc.outWidth": "Output width (px)",
    "irc.outHeight": "Output height (px)",
    "irc.outLock": "Lock output ratio",
    "irc.cropBox": "Crop area. Arrow keys move it, Shift plus arrow moves 10px, Alt plus arrow resizes it.",
    "irc.cropHint": "Drag inside the preview to move the area, or drag a handle to resize it. With a keyboard, arrow keys move it and Alt plus arrow resizes it.",
    "irc.zoom": "Preview zoom",
    "irc.zoomIn": "Zoom in",
    "irc.zoomOut": "Zoom out",
    "irc.zoomNote": "Preview zoom only changes what you see; the output pixel dimensions stay the same.",
    "irc.format": "Output format",
    "irc.formatOriginal": "Original",
    "irc.quality": "Quality",
    "irc.alphaNote": "JPG does not support transparency. Transparent areas will be saved with a white background.",
    "irc.runResize": "Resize image",
    "irc.runCrop": "Crop image",
    "irc.rerun": "Apply again",
    "irc.running": "Processing the image",
    "irc.original": "Original",
    "irc.output": "Output",
    "irc.result": "Result",
    "irc.resultEmpty": "Set the dimensions and run the tool to see the result here.",
    "irc.download": "Download",
    "irc.staleHint": "Settings changed. Apply again to get a new result.",
    "irc.fileSize": "File size",
    "irc.deviceHint": "Browser memory varies by device. Very large images can fail even below these limits.",
    "irc.preview": "Editing preview",
  },
};

type Source = {
  file: File;
  name: string;
  format: ImageFormat;
  bytes: number;
  url: string;
  /** 디코딩된 표시 방향 기준 픽셀 크기 (EXIF 회전이 이미 반영된 값) */
  width: number;
  height: number;
};

type Output = {
  blob: Blob;
  url: string;
  name: string;
  bytes: number;
  width: number;
  height: number;
  format: ImageFormat;
  mode: Mode;
  /** 이 결과를 만든 설정의 지문. 현재 설정과 다르면 stale 로 본다. */
  key: string;
};

/** 결과 크기를 사용자가 직접 정했는지까지 함께 들고 있는 Crop 출력 크기 */
type CropOut = { touched: boolean; w: number; h: number };

type DimField = "width" | "height" | "outWidth" | "outHeight";

type Drag = {
  kind: "move" | Handle;
  start: Rect;
  px: number;
  py: number;
  /** 화면 1px 이 원본 몇 px 인지 */
  scale: number;
};

export default function ImageResizerCropper() {
  const { lang } = useLang();
  const t = useT(DICT);

  const [src, setSrc] = useState<Source | null>(null);
  const [mode, setMode] = useState<Mode>("resize");

  // Resize
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [dimText, setDimText] = useState({ w: "", h: "" });
  const [lock, setLock] = useState(true);

  // Crop
  const [rect, setRect] = useState<Rect>({ x: 0, y: 0, w: 0, h: 0 });
  const [ratio, setRatio] = useState<RatioId>("free");
  const [cropOut, setCropOut] = useState<CropOut>({ touched: false, w: 0, h: 0 });
  const [cropOutText, setCropOutText] = useState({ w: "", h: "" });
  const [cropOutLock, setCropOutLock] = useState(true);

  // 출력 · 미리보기
  const [choice, setChoice] = useState<OutputChoice>("original");
  const [quality, setQuality] = useState(DEFAULT_QUALITY);
  const [zoom, setZoom] = useState(MIN_ZOOM);

  const [result, setResult] = useState<Output | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<ImageErrorType | null>(null);
  const [invalid, setInvalid] = useState<Record<DimField, boolean>>({
    width: false,
    height: false,
    outWidth: false,
    outHeight: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  /** 배율 100% 일 때의 미리보기 표시 너비(px). 0 이면 아직 측정 전이다. */
  const [fitWidth, setFitWidth] = useState(0);
  const dragRef = useRef<Drag | null>(null);
  const runningRef = useRef(false);

  /* ---------- Object URL 수명 관리 ----------
     원본과 결과 두 종류의 Object URL 을 쓴다. 교체·제거·초기화·unmount 에서
     모두 회수해야 하므로 최신 값을 ref 에 함께 들고 정리한다. */
  const srcUrlRef = useRef<string | null>(null);
  const resultUrlRef = useRef<string | null>(null);

  const revokeResult = useCallback(() => {
    if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    resultUrlRef.current = null;
  }, []);

  const revokeSource = useCallback(() => {
    if (srcUrlRef.current) URL.revokeObjectURL(srcUrlRef.current);
    srcUrlRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (srcUrlRef.current) URL.revokeObjectURL(srcUrlRef.current);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  useEffect(() => {
    trackEvent("tool_view", { slug: SLUG, locale: lang });
  }, [lang]);

  /* ---------- 미리보기 표시 크기 측정 ----------
     이미지를 컨테이너에 맞춰 줄일 때 CSS 퍼센트만으로는 크기가 정해지지 않는다
     (컨테이너가 이미지 크기를 따라가는 shrink-to-fit 이라 서로를 참조한다).
     그래서 배율 100% 에 해당하는 표시 너비를 직접 재고, 배율은 그 값에 곱한다.
     결과 픽셀 계산은 원본 좌표로만 하므로 이 값은 화면 표시에만 쓰인다. */
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap || !src) {
      setFitWidth(0);
      return;
    }
    const measure = () => {
      const style = getComputedStyle(wrap);
      const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const available = wrap.clientWidth - padX;
      if (!(available > 0)) return;
      // 원본보다 크게 늘리지는 않는다: 확대는 배율 슬라이더가 담당한다.
      const scale = Math.min(available / src.width, STAGE_MAX_HEIGHT / src.height, 1);
      setFitWidth(Math.max(1, Math.floor(src.width * scale)));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [src]);

  /* ---------- 파생값 ---------- */

  const outFormat: ImageFormat = src ? resolveFormat(choice, src.format) : "png";
  const effCropOut = cropOut.touched ? cropOut : { touched: false, w: rect.w, h: rect.h };
  const outWidth = mode === "resize" ? dims.w : effCropOut.w;
  const outHeight = mode === "resize" ? dims.h : effCropOut.h;
  const upscaled = src ? isUpscale(outWidth, outHeight, src.width, src.height) : false;

  /** 현재 설정의 지문: 결과 픽셀에 영향을 주는 값만 넣는다.
   *  미리보기 배율(zoom)은 표시 전용이라 여기에 포함하지 않는다. */
  const settingsKey = useMemo(() => {
    const out = `${outWidth}x${outHeight}`;
    const area = mode === "crop" ? `${rect.x},${rect.y},${rect.w},${rect.h}` : "full";
    const q = supportsQuality(outFormat) ? quality : 0;
    return `${mode}|${area}|${out}|${outFormat}|${q}`;
  }, [mode, rect, outWidth, outHeight, outFormat, quality]);

  const stale = Boolean(result) && result?.key !== settingsKey;
  const canRun = Boolean(src) && outWidth > 0 && outHeight > 0 && !running;

  /* ---------- 이미지 선택 ---------- */

  const loadFile = useCallback(
    async (file: File) => {
      const format = detectFormat(file);
      if (!format) {
        setError("unsupported-format");
        return;
      }
      if (file.size > IMAGE_LIMITS.maxFileBytes) {
        setError("file-too-large");
        return;
      }

      let size: { width: number; height: number };
      try {
        // EXIF 회전을 적용한 표시 방향 기준 크기. 미리보기 <img> 도 같은 방향으로
        // 그려지므로 크롭 좌표와 결과가 항상 일치한다.
        size = await readImageSize(file);
      } catch (e) {
        setError(e instanceof ImageError ? e.type : normalizeImageError(e, "decode-failed"));
        return;
      }

      revokeSource();
      revokeResult();
      setResult(null);
      setError(null);
      setInvalid({ width: false, height: false, outWidth: false, outHeight: false });

      const url = URL.createObjectURL(file);
      srcUrlRef.current = url;
      setSrc({ file, name: file.name, format, bytes: file.size, url, ...size });

      setDims({ w: size.width, h: size.height });
      setDimText({ w: String(size.width), h: String(size.height) });
      setLock(true);
      setRect(initialCrop(size.width, size.height));
      setRatio("free");
      setCropOut({ touched: false, w: size.width, h: size.height });
      setCropOutText({ w: String(size.width), h: String(size.height) });
      setCropOutLock(true);
      setZoom(MIN_ZOOM);

      trackEvent("tool_input", {
        slug: SLUG,
        input_format: format,
        input_width: size.width,
        input_height: size.height,
        file_size_bucket: fileSizeBucket(file.size),
      });
    },
    [revokeResult, revokeSource],
  );

  const onPick = useCallback(
    (list: FileList | null) => {
      const file = list?.[0];
      if (file) void loadFile(file);
    },
    [loadFile],
  );

  const clearAll = useCallback(() => {
    revokeSource();
    revokeResult();
    setSrc(null);
    setResult(null);
    setError(null);
    setMode("resize");
    setChoice("original");
    setQuality(DEFAULT_QUALITY);
    setZoom(MIN_ZOOM);
  }, [revokeResult, revokeSource]);

  /** 편집값만 원본 기준으로 되돌린다 (이미지는 유지). */
  const resetEdits = useCallback(() => {
    if (!src) return;
    setDims({ w: src.width, h: src.height });
    setDimText({ w: String(src.width), h: String(src.height) });
    setLock(true);
    setRect(initialCrop(src.width, src.height));
    setRatio("free");
    setCropOut({ touched: false, w: src.width, h: src.height });
    setCropOutText({ w: String(src.width), h: String(src.height) });
    setCropOutLock(true);
    setZoom(MIN_ZOOM);
    setError(null);
    setInvalid({ width: false, height: false, outWidth: false, outHeight: false });
  }, [src]);

  /* ---------- Resize 입력 ---------- */

  const markInvalid = (field: DimField, bad: boolean) =>
    setInvalid((prev) => (prev[field] === bad ? prev : { ...prev, [field]: bad }));

  const editWidth = (raw: string) => {
    setDimText((prev) => ({ ...prev, w: raw }));
    const n = parseDimension(raw);
    if (n === null || !src) return markInvalid("width", true);
    markInvalid("width", false);
    const w = clampDimension(n);
    const h = lock ? lockedDimension(w, src.width, src.height) : dims.h;
    setDims({ w, h });
    if (lock) setDimText({ w: raw, h: String(h) });
  };

  const editHeight = (raw: string) => {
    setDimText((prev) => ({ ...prev, h: raw }));
    const n = parseDimension(raw);
    if (n === null || !src) return markInvalid("height", true);
    markInvalid("height", false);
    const h = clampDimension(n);
    const w = lock ? lockedDimension(h, src.height, src.width) : dims.w;
    setDims({ w, h });
    if (lock) setDimText({ w: String(w), h: raw });
  };

  /** 잘못된 값을 남겨두지 않도록, 포커스를 떠나면 마지막 유효값으로 되돌린다. */
  const settleDims = () => {
    setDimText({ w: String(dims.w), h: String(dims.h) });
    setInvalid((prev) => ({ ...prev, width: false, height: false }));
  };

  const applyScale = (percent: number) => {
    if (!src) return;
    const next = scaleDimensions(src.width, src.height, percent);
    setDims({ w: next.width, h: next.height });
    setDimText({ w: String(next.width), h: String(next.height) });
    setInvalid((prev) => ({ ...prev, width: false, height: false }));
  };

  const currentScale = src ? scalePercent(dims.w, src.width) : 100;

  /* ---------- Crop 영역 ---------- */

  /** 선택 영역 변경을 한 곳으로 모은다: 드래그·키보드·프리셋이 모두 여기를 지난다.
   *  결과 크기를 사용자가 직접 정하지 않았으면 선택 영역을 그대로 따라가고,
   *  직접 정했다면 사용자가 넣은 가로를 지키면서 새 비율로 세로만 다시 맞춘다. */
  const applyRect = (next: Rect) => {
    setRect(next);
    if (!cropOut.touched) {
      setCropOut({ touched: false, w: next.w, h: next.h });
      setCropOutText({ w: String(next.w), h: String(next.h) });
      return;
    }
    if (!cropOutLock) return;
    const h = lockedDimension(cropOut.w, next.w, next.h);
    setCropOut({ touched: true, w: cropOut.w, h });
    setCropOutText({ w: String(cropOut.w), h: String(h) });
  };

  const pickRatio = (id: RatioId) => {
    if (!src) return;
    setRatio(id);
    applyRect(fitRatio(rect, ratioValue(id), src.width, src.height));
  };

  const editCropOut = (raw: string, axis: "w" | "h") => {
    setCropOutText((prev) => ({ ...prev, [axis]: raw }));
    const field: DimField = axis === "w" ? "outWidth" : "outHeight";
    const n = parseDimension(raw);
    if (n === null) return markInvalid(field, true);
    markInvalid(field, false);
    const value = clampDimension(n);
    if (!cropOutLock) {
      setCropOut((prev) => ({ touched: true, w: axis === "w" ? value : prev.w, h: axis === "h" ? value : prev.h }));
      return;
    }
    // 잠금 상태에서는 현재 선택 영역의 비율로 반대쪽 축을 계산한다.
    const other =
      axis === "w"
        ? lockedDimension(value, rect.w, rect.h)
        : lockedDimension(value, rect.h, rect.w);
    if (axis === "w") {
      setCropOut({ touched: true, w: value, h: other });
      setCropOutText({ w: raw, h: String(other) });
    } else {
      setCropOut({ touched: true, w: other, h: value });
      setCropOutText({ w: String(other), h: raw });
    }
  };

  const settleCropOut = () => {
    setCropOutText({ w: String(effCropOut.w), h: String(effCropOut.h) });
    setInvalid((prev) => ({ ...prev, outWidth: false, outHeight: false }));
  };

  /* ---------- 크롭 드래그 ---------- */

  const beginDrag = (e: React.PointerEvent<HTMLElement>, kind: "move" | Handle) => {
    if (!src || e.button !== 0) return;
    const stage = stageRef.current;
    if (!stage) return;
    const box = stage.getBoundingClientRect();
    if (box.width <= 0) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      kind,
      start: rect,
      px: e.clientX,
      py: e.clientY,
      scale: src.width / box.width,
    };
  };

  const onDragMove = (e: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    if (!drag || !src) return;
    const dx = (e.clientX - drag.px) * drag.scale;
    const dy = (e.clientY - drag.py) * drag.scale;
    applyRect(
      drag.kind === "move"
        ? moveRect(drag.start, dx, dy, src.width, src.height)
        : resizeRect(drag.start, drag.kind, dx, dy, src.width, src.height, ratioValue(ratio)),
    );
  };

  const endDrag = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragRef.current) return;
    dragRef.current = null;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const onCropKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!src) return;
    const map: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const step = map[e.key];
    if (!step) return;
    e.preventDefault();
    const amount = e.shiftKey ? 10 : 1;
    const dx = step[0] * amount;
    const dy = step[1] * amount;
    applyRect(
      e.altKey
        ? nudgeSize(rect, dx, dy, src.width, src.height, ratioValue(ratio))
        : moveRect(rect, dx, dy, src.width, src.height),
    );
  };

  /* ---------- 실행 ---------- */

  const run = useCallback(async () => {
    if (runningRef.current || !src) return;
    if (!(outWidth > 0 && outHeight > 0)) return;

    runningRef.current = true;
    setRunning(true);
    setError(null);

    const transform =
      mode === "resize"
        ? fullTransform(src.width, src.height, outWidth, outHeight)
        : { sx: rect.x, sy: rect.y, sw: rect.w, sh: rect.h, outWidth, outHeight };

    trackEvent("tool_run", {
      slug: SLUG,
      mode,
      ratio: mode === "crop" ? ratio : "n/a",
      input_format: src.format,
      output_format: outFormat,
      output_width: outWidth,
      output_height: outHeight,
      upscaled,
    });

    try {
      const out = await transformImage(src.file, transform, outFormat, quality);
      revokeResult();
      const url = URL.createObjectURL(out.blob);
      resultUrlRef.current = url;
      setResult({
        blob: out.blob,
        url,
        name: outputName(src.name, mode, out.width, out.height, outFormat),
        bytes: out.bytes,
        width: out.width,
        height: out.height,
        format: outFormat,
        mode,
        key: settingsKey,
      });
      trackEvent("tool_result", {
        slug: SLUG,
        mode,
        output_format: outFormat,
        output_width: out.width,
        output_height: out.height,
        upscaled,
      });
    } catch (e) {
      const type = e instanceof ImageError ? e.type : normalizeImageError(e, "process-failed");
      setError(type);
      trackEvent("tool_error", { slug: SLUG, mode, error_type: type });
    } finally {
      runningRef.current = false;
      setRunning(false);
    }
  }, [
    mode,
    outFormat,
    outHeight,
    outWidth,
    quality,
    ratio,
    rect,
    revokeResult,
    settingsKey,
    src,
    upscaled,
  ]);

  const download = () => {
    if (!result || stale) return;
    downloadBlob(result.blob, result.name);
    trackEvent("tool_download", {
      slug: SLUG,
      mode: result.mode,
      output_format: result.format,
      output_width: result.width,
      output_height: result.height,
    });
  };

  /* ---------- 렌더 ---------- */

  const openPicker = () => fileInputRef.current?.click();

  const fileField = (
    <input
      ref={fileInputRef}
      type="file"
      accept={ACCEPT}
      hidden
      onChange={(e) => {
        onPick(e.target.files);
        e.target.value = "";
      }}
    />
  );

  const dimError = (field: DimField) =>
    invalid[field] ? (
      <span className="irc-field-error" role="alert">
        {t("irc.dimError")}
      </span>
    ) : null;

  const overlay = src ? toPercent(clampRect(rect, src.width, src.height), src.width, src.height) : null;

  return (
    <>
      <PageHead slug={SLUG} />

      <div className="irc-work">
        {!src ? (
          <div className="irc-empty">
            <Dropzone
              label={t("irc.upload")}
              title={t("irc.drop")}
              formats={t("irc.formats")}
              hint={t("irc.choose")}
              onPick={onPick}
              onOpen={openPicker}
            />
            {fileField}
            <p className="irc-limits">{t("irc.limits")}</p>
            {error && (
              <p className="irc-alert" role="alert">
                {imageErrorMessage(error, lang)}
              </p>
            )}
            <p className="irc-privacy">{t("irc.privacy")}</p>
          </div>
        ) : (
          <>
            <div className="irc-head">
              <div className="seg irc-modes" role="radiogroup" aria-label={t("irc.modes")}>
                {(["resize", "crop"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    role="radio"
                    aria-checked={mode === m}
                    className={mode === m ? "is-active" : ""}
                    onClick={() => setMode(m)}
                  >
                    {m === "resize" ? t("irc.modeResize") : t("irc.modeCrop")}
                  </button>
                ))}
              </div>
              <div className="irc-head-actions">
                <button type="button" className="btn btn-sm btn-outline" onClick={openPicker}>
                  {t("irc.replace")}
                </button>
                <button type="button" className="btn btn-sm btn-ghost" onClick={clearAll}>
                  {t("irc.clearAll")}
                </button>
              </div>
              {fileField}
            </div>

            <div className="irc-body">
              {/* 미리보기: DOM 순서상 앞에 두어 모바일에서 먼저 보이게 하고,
                  데스크톱에서는 그리드 배치로 오른쪽 열에 놓는다. */}
              <div className="irc-preview">
                <div className="irc-preview-head">
                  <span className="field-label">{t("irc.preview")}</span>
                  <div className="irc-zoom">
                    <button
                      type="button"
                      className="irc-icon-btn"
                      aria-label={t("irc.zoomOut")}
                      onClick={() => setZoom((z) => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
                      disabled={zoom <= MIN_ZOOM}
                    >
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                        <path d="M3.5 8h9" strokeLinecap="round" />
                      </svg>
                    </button>
                    <input
                      type="range"
                      aria-label={t("irc.zoom")}
                      min={MIN_ZOOM}
                      max={MAX_ZOOM}
                      step={ZOOM_STEP}
                      value={zoom}
                      onChange={(e) => setZoom(Number(e.target.value))}
                    />
                    <button
                      type="button"
                      className="irc-icon-btn"
                      aria-label={t("irc.zoomIn")}
                      onClick={() => setZoom((z) => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
                      disabled={zoom >= MAX_ZOOM}
                    >
                      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                        <path d="M8 3.5v9M3.5 8h9" strokeLinecap="round" />
                      </svg>
                    </button>
                    <span className="irc-zoom-value">{zoom}%</span>
                  </div>
                </div>

                <div className="irc-stage-wrap" ref={wrapRef}>
                  <div
                    className="irc-stage"
                    ref={stageRef}
                    style={
                      fitWidth
                        ? { width: Math.round((fitWidth * zoom) / 100), maxWidth: "none" }
                        : undefined
                    }
                  >
                    {/* 원본 미리보기: Object URL 은 교체·초기화·unmount 시 revoke 된다.
                        EXIF 회전은 브라우저가 표시 단계에서 적용하므로 비트맵 크기와 일치한다. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="irc-img" src={src.url} alt="" draggable={false} />

                    {mode === "crop" && overlay && (
                      <div className="irc-overlay">
                        <span className="irc-shade" style={{ inset: `0 0 ${100 - overlay.top}% 0` }} />
                        <span
                          className="irc-shade"
                          style={{ inset: `${overlay.top + overlay.height}% 0 0 0` }}
                        />
                        <span
                          className="irc-shade"
                          style={{
                            inset: `${overlay.top}% ${100 - overlay.left}% ${100 - overlay.top - overlay.height}% 0`,
                          }}
                        />
                        <span
                          className="irc-shade"
                          style={{
                            inset: `${overlay.top}% 0 ${100 - overlay.top - overlay.height}% ${overlay.left + overlay.width}%`,
                          }}
                        />
                        <div
                          className="irc-crop"
                          tabIndex={0}
                          role="group"
                          aria-label={`${t("irc.cropBox")} ${rect.w} × ${rect.h} px`}
                          style={{
                            left: `${overlay.left}%`,
                            top: `${overlay.top}%`,
                            width: `${overlay.width}%`,
                            height: `${overlay.height}%`,
                          }}
                          onPointerDown={(e) => beginDrag(e, "move")}
                          onPointerMove={onDragMove}
                          onPointerUp={endDrag}
                          onPointerCancel={endDrag}
                          onKeyDown={onCropKeyDown}
                        >
                          {HANDLES.map((h) => (
                            <span
                              key={h}
                              className={"irc-handle is-" + h}
                              aria-hidden
                              onPointerDown={(e) => beginDrag(e, h)}
                              onPointerMove={onDragMove}
                              onPointerUp={endDrag}
                              onPointerCancel={endDrag}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <p className="irc-note">{mode === "crop" ? t("irc.cropHint") : t("irc.zoomNote")}</p>
              </div>

              {/* 컨트롤 */}
              <div className="irc-controls">
                <div className="irc-source">
                  <span className="irc-source-name" title={src.name}>
                    {src.name}
                  </span>
                  <span className="irc-source-meta">
                    {FORMAT_LABEL[src.format]} · {src.width} × {src.height} px · {formatBytes(src.bytes)}
                  </span>
                </div>

                {mode === "resize" ? (
                  <div className="irc-group">
                    <div className="irc-dims">
                      <label className="irc-field">
                        <span className="field-label">{t("irc.width")}</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          className={"irc-input" + (invalid.width ? " is-invalid" : "")}
                          value={dimText.w}
                          aria-invalid={invalid.width}
                          onChange={(e) => editWidth(e.target.value)}
                          onBlur={settleDims}
                        />
                        {dimError("width")}
                      </label>
                      <label className="irc-field">
                        <span className="field-label">{t("irc.height")}</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          className={"irc-input" + (invalid.height ? " is-invalid" : "")}
                          value={dimText.h}
                          aria-invalid={invalid.height}
                          onChange={(e) => editHeight(e.target.value)}
                          onBlur={settleDims}
                        />
                        {dimError("height")}
                      </label>
                    </div>

                    <label className="irc-check">
                      <input
                        type="checkbox"
                        checked={lock}
                        onChange={(e) => {
                          setLock(e.target.checked);
                          if (e.target.checked) {
                            const h = lockedDimension(dims.w, src.width, src.height);
                            setDims({ w: dims.w, h });
                            setDimText({ w: String(dims.w), h: String(h) });
                          }
                        }}
                      />
                      <span>{t("irc.lock")}</span>
                    </label>

                    {!lock && <p className="irc-note irc-note-warn">{t("irc.distortWarn")}</p>}

                    {lock && (
                      <div className="irc-scale">
                        <span className="field-label">{t("irc.scale")}</span>
                        <div className="irc-scale-row">
                          <input
                            type="range"
                            aria-label={t("irc.scale")}
                            min={MIN_SCALE}
                            max={MAX_SCALE}
                            step={1}
                            value={Math.round(clampScale(currentScale))}
                            onChange={(e) => applyScale(Number(e.target.value))}
                          />
                          <span className="irc-scale-value">{currentScale}%</span>
                        </div>
                        <div className="irc-presets">
                          {SCALE_PRESETS.map((p) => (
                            <button
                              key={p}
                              type="button"
                              className={
                                "irc-chip" + (Math.abs(currentScale - p) < 0.05 ? " is-active" : "")
                              }
                              onClick={() => applyScale(p)}
                            >
                              {p}%
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="irc-group">
                    <div className="irc-ratios">
                      <span className="field-label" id="irc-ratio-label">
                        {t("irc.ratio")}
                      </span>
                      <div className="irc-presets" role="radiogroup" aria-labelledby="irc-ratio-label">
                        {RATIOS.map((id) => (
                          <button
                            key={id}
                            type="button"
                            role="radio"
                            aria-checked={ratio === id}
                            className={"irc-chip" + (ratio === id ? " is-active" : "")}
                            onClick={() => pickRatio(id)}
                          >
                            {id === "free" ? t("irc.ratioFree") : id}
                          </button>
                        ))}
                      </div>
                    </div>

                    <dl className="irc-readout">
                      <div>
                        <dt>{t("irc.cropArea")}</dt>
                        <dd>
                          {rect.w} × {rect.h} px · {ratioLabel(rect.w, rect.h)}
                        </dd>
                      </div>
                      <div>
                        <dt>X · Y</dt>
                        <dd>
                          {rect.x} · {rect.y} px
                        </dd>
                      </div>
                    </dl>

                    <div className="irc-dims">
                      <label className="irc-field">
                        <span className="field-label">{t("irc.outWidth")}</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          className={"irc-input" + (invalid.outWidth ? " is-invalid" : "")}
                          value={cropOutText.w}
                          aria-invalid={invalid.outWidth}
                          onChange={(e) => editCropOut(e.target.value, "w")}
                          onBlur={settleCropOut}
                        />
                        {dimError("outWidth")}
                      </label>
                      <label className="irc-field">
                        <span className="field-label">{t("irc.outHeight")}</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          className={"irc-input" + (invalid.outHeight ? " is-invalid" : "")}
                          value={cropOutText.h}
                          aria-invalid={invalid.outHeight}
                          onChange={(e) => editCropOut(e.target.value, "h")}
                          onBlur={settleCropOut}
                        />
                        {dimError("outHeight")}
                      </label>
                    </div>

                    <label className="irc-check">
                      <input
                        type="checkbox"
                        checked={cropOutLock}
                        onChange={(e) => setCropOutLock(e.target.checked)}
                      />
                      <span>{t("irc.outLock")}</span>
                    </label>

                    {!cropOutLock && <p className="irc-note irc-note-warn">{t("irc.distortWarn")}</p>}
                  </div>
                )}

                <div className="irc-group">
                  <span className="field-label" id="irc-format-label">
                    {t("irc.format")}
                  </span>
                  <div className="seg irc-seg" role="radiogroup" aria-labelledby="irc-format-label">
                    {OUTPUT_CHOICES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        role="radio"
                        aria-checked={choice === c}
                        className={choice === c ? "is-active" : ""}
                        onClick={() => setChoice(c)}
                      >
                        {c === "original" ? t("irc.formatOriginal") : FORMAT_LABEL[c]}
                      </button>
                    ))}
                  </div>

                  {supportsQuality(outFormat) && (
                    <div className="irc-quality">
                      <label className="field-label" htmlFor="irc-quality">
                        {t("irc.quality")}
                      </label>
                      <div className="irc-quality-row">
                        <input
                          id="irc-quality"
                          type="range"
                          min={1}
                          max={100}
                          step={1}
                          value={quality}
                          onChange={(e) => setQuality(Number(e.target.value))}
                        />
                        <output htmlFor="irc-quality" className="irc-quality-value">
                          {quality}
                        </output>
                      </div>
                    </div>
                  )}

                  {!supportsAlpha(outFormat) && <p className="irc-note">{t("irc.alphaNote")}</p>}
                </div>

                <dl className="irc-summary">
                  <div>
                    <dt>{t("irc.original")}</dt>
                    <dd>
                      {src.width} × {src.height} px
                    </dd>
                  </div>
                  <div className="is-primary">
                    <dt>{t("irc.output")}</dt>
                    <dd>
                      {outWidth} × {outHeight} px
                    </dd>
                  </div>
                  {mode === "resize" && (
                    <div>
                      <dt>{t("irc.scale")}</dt>
                      <dd>{currentScale}%</dd>
                    </div>
                  )}
                </dl>

                {upscaled && <p className="irc-note irc-note-warn">{t("irc.upscaleWarn")}</p>}

                <button
                  type="button"
                  className="btn btn-primary irc-run"
                  onClick={run}
                  disabled={!canRun}
                >
                  {running
                    ? t("irc.running")
                    : stale
                      ? t("irc.rerun")
                      : mode === "resize"
                        ? t("irc.runResize")
                        : t("irc.runCrop")}
                </button>

                {error && (
                  <div className="irc-error" role="alert">
                    <p className="irc-alert">{imageErrorMessage(error, lang)}</p>
                    <div className="irc-error-actions">
                      <button type="button" className="btn btn-sm btn-outline" onClick={run}>
                        {t("irc.retry")}
                      </button>
                    </div>
                  </div>
                )}

                <button type="button" className="irc-reset" onClick={resetEdits}>
                  {t("irc.reset")}
                </button>

                <p className="irc-privacy">{t("irc.privacy")}</p>
              </div>
            </div>
          </>
        )}
      </div>

      {src && (
        <section className="irc-result" aria-label={t("irc.result")}>
          <div className="irc-result-head">
            <h2>{t("irc.result")}</h2>
            <p className="irc-live" role="status" aria-live="polite">
              {running ? t("irc.running") : stale && result ? t("irc.staleHint") : ""}
            </p>
          </div>

          {!result ? (
            <p className="irc-empty-result">{t("irc.resultEmpty")}</p>
          ) : (
            <div className={"irc-result-body" + (stale ? " is-stale" : "")}>
              <div className="irc-result-thumb">
                {/* 결과 미리보기: Object URL 은 재실행·초기화·unmount 시 revoke 된다. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result.url} alt="" />
              </div>
              <dl className="irc-result-meta">
                <div>
                  <dt>{t("irc.original")}</dt>
                  <dd>
                    {src.width} × {src.height} px
                  </dd>
                </div>
                <div className="is-primary">
                  <dt>{t("irc.output")}</dt>
                  <dd>
                    {result.width} × {result.height} px
                  </dd>
                </div>
                <div>
                  <dt>{t("irc.format")}</dt>
                  <dd>{FORMAT_LABEL[result.format]}</dd>
                </div>
                <div>
                  <dt>{t("irc.fileSize")}</dt>
                  <dd>{formatBytes(result.bytes)}</dd>
                </div>
              </dl>
              <div className="irc-result-actions">
                <span className="irc-result-name" title={result.name}>
                  {result.name}
                </span>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={download}
                  disabled={stale}
                >
                  {t("irc.download")}
                </button>
              </div>
            </div>
          )}

          <p className="irc-device-hint">{t("irc.deviceHint")}</p>
        </section>
      )}

      <ToolGuide slug={SLUG} />
      <Faq slug={SLUG} />
      <RelatedTools slug={SLUG} />
    </>
  );
}

/** 업로드 영역: 업로드 전 화면의 중심 요소 */
function Dropzone({
  label,
  title,
  formats,
  hint,
  onPick,
  onOpen,
}: {
  label: string;
  title: string;
  formats: string;
  hint: string;
  onPick: (files: FileList | null) => void;
  onOpen: () => void;
}) {
  const [over, setOver] = useState(false);
  return (
    <div
      className={"irc-drop" + (over ? " is-over" : "")}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onPick(e.dataTransfer.files);
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
        <path d="M12 16V4M7 9l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" strokeLinecap="round" />
      </svg>
      <p className="irc-drop-title">{title}</p>
      <span className="irc-drop-formats">{formats}</span>
      <span className="irc-drop-hint">{hint}</span>
    </div>
  );
}
