"use client";

import { useEffect, useRef, useState } from "react";
import PageHead from "./PageHead";
import Faq from "./Faq";
import RelatedTools from "./RelatedTools";
import { useT, type Dict } from "../lib/i18n";
import { PLATFORM_PRESETS } from "./open-graph-preview/platformPresets";
import type {
  ImageSource,
  ImageSourceMode,
  LoadState,
  PlatformId,
  PlatformPreset,
} from "./open-graph-preview/types";
import { renderCodeToImage } from "./open-graph-preview/renderCodeToImage";

// 컨트롤 마이크로카피만 로컬 DICT. 페이지 콘텐츠·SEO·FAQ·AEO는 content.ts.
const DICT: Dict = {
  ko: {
    "og.source": "이미지 소스",
    "og.upload": "이미지 첨부",
    "og.url": "이미지 URL",
    "og.code": "생성 코드",
    "og.loadImage": "이미지 불러오기",
    "og.renderImage": "이미지 생성",
    "og.attachDirectly": "직접 첨부하기",
    "og.title": "제목",
    "og.description": "설명",
    "og.domain": "표시 도메인",
    "og.imageInfo": "이미지 정보",
    "og.compareAll": "전체 플랫폼 비교",
    "og.detailPreview": "선택 플랫폼 프리뷰",
    "og.emptyImage": "OG 이미지를 입력해 주세요.",
    "og.emptyTitle": "페이지 제목이 여기에 표시됩니다.",
    "og.emptyDesc": "페이지 설명이 여기에 표시됩니다.",
    "og.titlePlaceholder": "페이지 제목을 입력하세요.",
    "og.descPlaceholder": "페이지 설명을 입력하세요.",
    "og.urlPlaceholder": "https://example.com/images/open-graph.png",
    "og.codePlaceholder":
      "<svg ...> 또는 <div style=\"...\">...</div> 형태의 SVG·HTML/CSS 코드를 붙여넣으세요.",
    "og.dropHint": "이미지를 끌어다 놓거나 클릭해서 선택하세요.",
    "og.dropFormats": "PNG · JPG · WebP · 최대 10MB",
    "og.codeNote":
      "지원 형식: SVG 또는 HTML/CSS. JavaScript, React 및 Next.js ImageResponse 코드는 실행되지 않습니다.",
    "og.urlNote": "이미지 파일 URL만 입력하세요. 웹페이지 주소 분석 기능이 아닙니다.",
    "og.simNotice":
      "플랫폼별 미리보기는 대표적인 링크 카드 형태를 기준으로 한 시뮬레이션입니다. 실제 노출 결과는 앱 버전, 기기 및 캐시 상태에 따라 달라질 수 있습니다.",
    "og.privacy":
      "첨부한 이미지와 입력한 내용은 서버로 전송되거나 저장되지 않습니다. 모든 미리보기는 브라우저에서 처리됩니다.",
    "og.warnings": "경고",
    "og.chars": "자",
    "og.errBadType": "PNG, JPG 또는 WebP 이미지 파일을 첨부해 주세요.",
    "og.errTooLarge": "10MB 이하의 이미지를 첨부해 주세요.",
    "og.errDecode":
      "이미지 파일을 읽을 수 없습니다. 다른 이미지로 다시 시도해 주세요.",
    "og.errUrl":
      "이미지를 불러오는데 실패했습니다. 직접 첨부하여 다시 시도해 주세요.",
    "og.errCodeUnsupported": "SVG 또는 HTML/CSS 형식의 코드를 입력해 주세요.",
    "og.errCodeRender":
      "코드를 이미지로 변환하지 못했습니다. 코드 형식과 외부 리소스를 확인해 주세요.",
    "og.errCodeExternal":
      "코드에 포함된 외부 이미지를 불러오지 못했습니다. 직접 첨부하거나 접근 가능한 이미지 URL을 사용해 주세요.",
    "og.warnTitleLong": "제목이 길어 일부 플랫폼에서 잘릴 수 있습니다.",
    "og.warnDescLong": "설명이 길어 일부 플랫폼에서 잘릴 수 있습니다.",
    "og.warnSmall":
      "일반적인 OG 권장 크기인 1200 × 630px보다 작습니다.",
    "og.warnRatio":
      "이미지 비율이 1.91:1과 달라 플랫폼에 따라 일부 영역이 잘릴 수 있습니다.",
    "og.warnPortrait":
      "세로형 이미지는 대부분의 링크 카드에서 중앙을 기준으로 크게 잘릴 수 있습니다.",
    "og.warnSquare":
      "정사각형 이미지는 가로형 링크 카드에서 상하 영역이 잘릴 수 있습니다.",
  },
  en: {
    "og.source": "Image source",
    "og.upload": "Upload image",
    "og.url": "Image URL",
    "og.code": "Source code",
    "og.loadImage": "Load image",
    "og.renderImage": "Generate image",
    "og.attachDirectly": "Upload directly",
    "og.title": "Title",
    "og.description": "Description",
    "og.domain": "Display domain",
    "og.imageInfo": "Image details",
    "og.compareAll": "Compare all platforms",
    "og.detailPreview": "Selected platform preview",
    "og.emptyImage": "Add an Open Graph image.",
    "og.emptyTitle": "Your page title appears here.",
    "og.emptyDesc": "Your page description appears here.",
    "og.titlePlaceholder": "Enter the page title.",
    "og.descPlaceholder": "Enter the page description.",
    "og.urlPlaceholder": "https://example.com/images/open-graph.png",
    "og.codePlaceholder":
      "Paste SVG or HTML/CSS code, e.g. <svg ...> or <div style=\"...\">...</div>.",
    "og.dropHint": "Drag an image here or click to choose a file.",
    "og.dropFormats": "PNG · JPG · WebP · up to 10MB",
    "og.codeNote":
      "Supported: SVG or HTML/CSS. JavaScript, React, and Next.js ImageResponse code are not executed.",
    "og.urlNote":
      "Enter a direct image file URL. This does not analyze web page addresses.",
    "og.simNotice":
      "Platform previews simulate common link card layouts. Actual results may vary by app version, device, and cache status.",
    "og.privacy":
      "Uploaded images and entered content are not sent to or stored on a server. All previews are processed in your browser.",
    "og.warnings": "Warnings",
    "og.chars": "chars",
    "og.errBadType": "Attach a PNG, JPG, or WebP image file.",
    "og.errTooLarge": "Attach an image of 10MB or less.",
    "og.errDecode":
      "Could not read the image file. Please try a different image.",
    "og.errUrl":
      "Failed to load the image. Upload the image directly and try again.",
    "og.errCodeUnsupported": "Enter SVG or HTML/CSS code.",
    "og.errCodeRender":
      "Could not convert the code to an image. Check the code format and external resources.",
    "og.errCodeExternal":
      "Could not load an external image referenced in the code. Upload directly or use an accessible image URL.",
    "og.warnTitleLong": "The title is long and may be truncated on some platforms.",
    "og.warnDescLong":
      "The description is long and may be truncated on some platforms.",
    "og.warnSmall": "Smaller than the common recommended OG size of 1200 × 630px.",
    "og.warnRatio":
      "The aspect ratio differs from 1.91:1, so some areas may be cropped depending on the platform.",
    "og.warnPortrait":
      "Portrait images are often heavily cropped to the center in most link cards.",
    "og.warnSquare":
      "Square images may have their top and bottom cropped in horizontal link cards.",
  },
};

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const TITLE_LIMIT = 60;
const DESC_LIMIT = 160;
const TARGET_RATIO = 1200 / 630;

type SourceMap = Record<ImageSourceMode, ImageSource | null>;

function formatBytes(bytes?: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function mimeLabel(mime?: string): string {
  if (!mime) return "";
  return mime.replace("image/", "").toUpperCase();
}

function displayDomain(value: string): string {
  const s = value.trim();
  if (!s) return "example.com";
  if (/^https?:\/\//i.test(s)) {
    try {
      return new URL(s).hostname;
    } catch {
      return s;
    }
  }
  return s;
}

/* ── 플랫폼 카드 ────────────────────────────── */
function PlatformCard({
  preset,
  image,
  title,
  description,
  domain,
  emptyImage,
  emptyTitle,
  emptyDesc,
  variant,
}: {
  preset: PlatformPreset;
  image: ImageSource | null;
  title: string;
  description: string;
  domain: string;
  emptyImage: string;
  emptyTitle: string;
  emptyDesc: string;
  variant: "detail" | "grid";
}) {
  const imageArea = (
    <div
      className="og-card-media"
      style={{ aspectRatio: String(preset.imageAspectRatio) }}
    >
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={image.src} alt={title || preset.label} />
      ) : (
        <span className="og-card-media-empty">{emptyImage}</span>
      )}
    </div>
  );

  const textArea = (
    <div className="og-card-text">
      {preset.showDomain && <span className="og-card-domain">{domain}</span>}
      <span
        className={"og-card-title" + (title ? "" : " is-empty")}
        style={{ "--lines": preset.titleLines } as React.CSSProperties}
      >
        {title || emptyTitle}
      </span>
      {preset.showDescription && (
        <span
          className={"og-card-desc" + (description ? "" : " is-empty")}
          style={{ "--lines": preset.descriptionLines } as React.CSSProperties}
        >
          {description || emptyDesc}
        </span>
      )}
    </div>
  );

  return (
    <div className={"og-platform-card og-platform-card--" + preset.layout}>
      <div className="og-card-head">{preset.label}</div>
      <div className={"og-card-body" + (variant === "detail" ? " is-detail" : "")}>
        {preset.imagePosition === "right" ? (
          <>
            {textArea}
            {imageArea}
          </>
        ) : (
          <>
            {imageArea}
            {textArea}
          </>
        )}
      </div>
    </div>
  );
}

export default function OpenGraphPreview() {
  const t = useT(DICT);

  const [sourceMode, setSourceMode] = useState<ImageSourceMode>("upload");
  const [sources, setSources] = useState<SourceMap>({
    upload: null,
    url: null,
    code: null,
  });

  const [remoteUrl, setRemoteUrl] = useState("");
  const [sourceCode, setSourceCode] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [domain, setDomain] = useState("example.com");

  const [selectedPlatform, setSelectedPlatform] = useState<PlatformId>("kakao");

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [urlState, setUrlState] = useState<LoadState>({ status: "idle" });
  const [codeState, setCodeState] = useState<LoadState>({ status: "idle" });

  const objectUrlRef = useRef<string | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // 언마운트 시 Object URL 해제
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const activeSource = sources[sourceMode];

  function setModeSource(mode: ImageSourceMode, src: ImageSource | null) {
    setSources((prev) => ({ ...prev, [mode]: src }));
  }

  /* ── 이미지 첨부 ── */
  function handleFile(file: File) {
    setUploadError(null);
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError(t("og.errBadType"));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(t("og.errTooLarge"));
      return;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    const img = new Image();
    img.onload = () => {
      setModeSource("upload", {
        mode: "upload",
        src: url,
        width: img.naturalWidth,
        height: img.naturalHeight,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      objectUrlRef.current = null;
      setUploadError(t("og.errDecode"));
    };
    img.src = url;
  }

  const [dragOver, setDragOver] = useState(false);

  /* ── 이미지 URL ── */
  function loadRemote() {
    const url = remoteUrl.trim();
    if (!url) return;
    let valid = false;
    try {
      const u = new URL(url);
      valid = u.protocol === "http:" || u.protocol === "https:";
    } catch {
      valid = false;
    }
    if (!valid) {
      setModeSource("url", null);
      setUrlState({ status: "error", message: t("og.errUrl") });
      return;
    }
    setUrlState({ status: "loading" });
    const img = new Image();
    img.onload = () => {
      setModeSource("url", {
        mode: "url",
        src: url,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
      setUrlState({ status: "success" });
    };
    img.onerror = () => {
      setModeSource("url", null);
      setUrlState({ status: "error", message: t("og.errUrl") });
    };
    img.src = url;
  }

  /* ── 생성 코드 ── */
  async function generateFromCode() {
    if (!sourceCode.trim()) return;
    setCodeState({ status: "loading" });
    const result = await renderCodeToImage(sourceCode);
    if (result.ok) {
      setModeSource("code", {
        mode: "code",
        src: result.src,
        width: result.width,
        height: result.height,
      });
      setCodeState({ status: "success" });
    } else {
      setModeSource("code", null);
      const message =
        result.error === "unsupported"
          ? t("og.errCodeUnsupported")
          : result.error === "externalImage"
            ? t("og.errCodeExternal")
            : t("og.errCodeRender");
      setCodeState({ status: "error", message });
    }
  }

  function goToUpload() {
    setSourceMode("upload");
  }

  /* ── 이미지 진단 ── */
  function imageWarnings(): string[] {
    if (!activeSource) return [];
    const { width, height } = activeSource;
    const warns: string[] = [];
    const ratio = width / height;
    if (width < 1200 || height < 630) warns.push(t("og.warnSmall"));
    if (Math.abs(ratio - TARGET_RATIO) > 0.08) warns.push(t("og.warnRatio"));
    if (height > width) warns.push(t("og.warnPortrait"));
    if (Math.abs(width / height - 1) < 0.05) warns.push(t("og.warnSquare"));
    return warns;
  }

  const warns = imageWarnings();
  if (title.length > TITLE_LIMIT) warns.unshift(t("og.warnTitleLong"));
  if (description.length > DESC_LIMIT) warns.unshift(t("og.warnDescLong"));

  const shownDomain = displayDomain(domain);
  const cardProps = {
    image: activeSource,
    title,
    description,
    domain: shownDomain,
    emptyImage: t("og.emptyImage"),
    emptyTitle: t("og.emptyTitle"),
    emptyDesc: t("og.emptyDesc"),
  };

  const selectedPreset =
    PLATFORM_PRESETS.find((p) => p.id === selectedPlatform) ?? PLATFORM_PRESETS[0];

  function onTabKeyDown(e: React.KeyboardEvent, idx: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next =
      (idx + dir + PLATFORM_PRESETS.length) % PLATFORM_PRESETS.length;
    setSelectedPlatform(PLATFORM_PRESETS[next].id);
    tabRefs.current[next]?.focus();
  }

  const SOURCE_TABS: { id: ImageSourceMode; key: string }[] = [
    { id: "upload", key: "og.upload" },
    { id: "url", key: "og.url" },
    { id: "code", key: "og.code" },
  ];

  return (
    <>
      <PageHead slug="open-graph-preview" />

      <div className="og-preview-work">
        {/* 입력 패널 */}
        <div className="og-input-panel">
          {/* 이미지 소스 탭 */}
          <div className="field-group">
            <span className="field-label">{t("og.source")}</span>
            <div className="og-source-tabs" role="tablist" aria-label={t("og.source")}>
              {SOURCE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={sourceMode === tab.id}
                  className={sourceMode === tab.id ? "is-active" : ""}
                  onClick={() => setSourceMode(tab.id)}
                >
                  {t(tab.key)}
                </button>
              ))}
            </div>
          </div>

          {/* 소스별 입력 */}
          <div className="og-source-panel">
            {sourceMode === "upload" && (
              <div className="field-group">
                <label
                  className={"og-dropzone" + (dragOver ? " is-over" : "")}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    const f = e.dataTransfer.files?.[0];
                    if (f) handleFile(f);
                  }}
                >
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFile(f);
                    }}
                  />
                  <span className="og-dropzone-hint">{t("og.dropHint")}</span>
                  <span className="og-dropzone-formats">{t("og.dropFormats")}</span>
                  {sources.upload?.fileName && (
                    <span className="og-dropzone-file">
                      {sources.upload.fileName}
                    </span>
                  )}
                </label>
                {uploadError && (
                  <p className="og-error" role="alert">
                    {uploadError}
                  </p>
                )}
              </div>
            )}

            {sourceMode === "url" && (
              <div className="field-group">
                <div className="og-url-row">
                  <input
                    type="url"
                    className="og-text-input"
                    placeholder={t("og.urlPlaceholder")}
                    value={remoteUrl}
                    onChange={(e) => {
                      setRemoteUrl(e.target.value);
                      if (urlState.status === "error")
                        setUrlState({ status: "idle" });
                    }}
                  />
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={loadRemote}
                    disabled={urlState.status === "loading" || !remoteUrl.trim()}
                    aria-busy={urlState.status === "loading"}
                  >
                    {t("og.loadImage")}
                  </button>
                </div>
                <p className="og-field-note">{t("og.urlNote")}</p>
                {urlState.status === "error" && (
                  <div className="og-error" role="alert">
                    <span>{urlState.message}</span>
                    <button className="og-link-btn" onClick={goToUpload}>
                      {t("og.attachDirectly")}
                    </button>
                  </div>
                )}
              </div>
            )}

            {sourceMode === "code" && (
              <div className="field-group">
                <textarea
                  className="og-code-input"
                  placeholder={t("og.codePlaceholder")}
                  value={sourceCode}
                  spellCheck={false}
                  onChange={(e) => {
                    setSourceCode(e.target.value);
                    if (codeState.status === "error")
                      setCodeState({ status: "idle" });
                  }}
                />
                <p className="og-field-note">{t("og.codeNote")}</p>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={generateFromCode}
                  disabled={codeState.status === "loading" || !sourceCode.trim()}
                  aria-busy={codeState.status === "loading"}
                >
                  {t("og.renderImage")}
                </button>
                {codeState.status === "error" && (
                  <p className="og-error" role="alert">
                    {codeState.message}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 텍스트 입력 */}
          <div className="og-text-fields">
            <div className="field-group">
              <span className="field-label og-label-row">
                <span>{t("og.title")}</span>
                <span
                  className={
                    "og-count" + (title.length > TITLE_LIMIT ? " is-over" : "")
                  }
                >
                  {title.length} {t("og.chars")}
                </span>
              </span>
              <input
                type="text"
                className="og-text-input"
                placeholder={t("og.titlePlaceholder")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="field-group">
              <span className="field-label og-label-row">
                <span>{t("og.description")}</span>
                <span
                  className={
                    "og-count" +
                    (description.length > DESC_LIMIT ? " is-over" : "")
                  }
                >
                  {description.length} {t("og.chars")}
                </span>
              </span>
              <textarea
                className="og-text-input og-desc-input"
                placeholder={t("og.descPlaceholder")}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="field-group">
              <span className="field-label">{t("og.domain")}</span>
              <input
                type="text"
                className="og-text-input"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
              />
            </div>
          </div>

          {/* 이미지 정보 */}
          {activeSource && (
            <div className="field-group">
              <span className="field-label">{t("og.imageInfo")}</span>
              <div className="og-diagnostics">
                <span className="og-diag-dim">
                  {activeSource.width} × {activeSource.height}px
                </span>
                <span className="og-diag-sep">·</span>
                <span>{(activeSource.width / activeSource.height).toFixed(2)}:1</span>
                {activeSource.mimeType && (
                  <>
                    <span className="og-diag-sep">·</span>
                    <span>{mimeLabel(activeSource.mimeType)}</span>
                  </>
                )}
                {activeSource.fileSize && (
                  <>
                    <span className="og-diag-sep">·</span>
                    <span>{formatBytes(activeSource.fileSize)}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* 경고 */}
          {warns.length > 0 && (
            <div className="field-group">
              <span className="field-label">{t("og.warnings")}</span>
              <ul className="og-warning-list" aria-live="polite">
                {warns.map((w, i) => (
                  <li className="og-warning" key={i}>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="og-privacy">{t("og.privacy")}</p>
        </div>

        {/* 프리뷰 패널 */}
        <div className="og-preview-panel">
          <span className="field-label">{t("og.detailPreview")}</span>
          <div
            className="og-platform-tabs"
            role="tablist"
            aria-label={t("og.detailPreview")}
          >
            {PLATFORM_PRESETS.map((p, i) => (
              <button
                key={p.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                aria-selected={selectedPlatform === p.id}
                tabIndex={selectedPlatform === p.id ? 0 : -1}
                className={selectedPlatform === p.id ? "is-active" : ""}
                onClick={() => setSelectedPlatform(p.id)}
                onKeyDown={(e) => onTabKeyDown(e, i)}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="og-detail-stage">
            <PlatformCard preset={selectedPreset} variant="detail" {...cardProps} />
          </div>

          <p className="og-simulation-notice">{t("og.simNotice")}</p>
        </div>
      </div>

      {/* 전체 플랫폼 비교 */}
      <section className="og-compare" aria-label={t("og.compareAll")}>
        <h2>{t("og.compareAll")}</h2>
        <div className="og-platform-grid">
          {PLATFORM_PRESETS.map((p) => (
            <PlatformCard key={p.id} preset={p} variant="grid" {...cardProps} />
          ))}
        </div>
        <p className="og-simulation-notice">{t("og.simNotice")}</p>
      </section>

      <Faq slug="open-graph-preview" />
      <RelatedTools slug="open-graph-preview" />
    </>
  );
}
