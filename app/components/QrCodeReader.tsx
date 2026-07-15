"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { IScannerControls } from "@zxing/browser";
import PageHead from "./PageHead";
import Faq from "./Faq";
import RelatedTools from "./RelatedTools";
import QrToolTabs from "./QrToolTabs";
import { useT, type Dict } from "../lib/i18n";
import { decodeImageElement } from "../lib/qr/decodeQr";
import { isSafeHttpUrl } from "../lib/qr/url";

const DICT: Dict = {
  ko: {
    "r.paste": "붙여넣기",
    "r.upload": "이미지 업로드",
    "r.camera": "카메라",
    "r.pasteHint": "이 영역을 클릭한 뒤 Ctrl+V 또는 Cmd+V 로 QR 이미지를 붙여넣으세요.",
    "r.pasteBtn": "클립보드에서 이미지 가져오기",
    "r.pasteText": "텍스트가 붙여넣어졌습니다. QR 코드 이미지를 붙여넣어 주세요.",
    "r.dropHint": "이미지를 여기로 끌어다 놓거나 파일을 선택하세요.",
    "r.choose": "이미지 선택",
    "r.formats": "PNG · JPG · WebP",
    "r.cameraBtn": "카메라로 QR 코드 읽기",
    "r.cameraStop": "카메라 중지",
    "r.switch": "카메라 전환",
    "r.rescanCamera": "카메라로 다시 읽기",
    "r.rechoose": "다른 이미지 선택",
    "r.again": "다시 읽기",
    "r.open": "링크 열기",
    "r.copyUrl": "주소 복사",
    "r.copyText": "내용 복사",
    "r.copied": "복사됨",
    "r.domain": "도메인",
    "r.external": "외부 링크입니다. 열기 전에 주소를 확인하세요.",
    "r.idle": "QR 이미지를 붙여넣거나 업로드하거나 카메라를 실행하면 결과가 여기에 표시됩니다.",
    "r.scanning": "QR 코드를 판독하고 있습니다…",
    "r.requesting": "카메라 권한을 요청하고 있습니다…",
    "r.success": "QR 코드를 읽었습니다.",
    "r.guide": "QR 코드를 프레임 안에 맞춰 주세요.",
    "e.notfound":
      "QR 코드를 찾지 못했습니다. QR 코드 전체가 보이도록 이미지를 다시 선택해 주세요. 이미지가 흐리거나 QR 코드가 너무 작으면 판독되지 않을 수 있습니다.",
    "e.format": "지원하지 않는 형식입니다. PNG, JPG, JPEG, WebP 이미지를 사용해 주세요.",
    "e.camera":
      "카메라를 사용할 수 없습니다. 브라우저 권한을 확인하거나 이미지 업로드를 이용해 주세요.",
    "e.clipboard":
      "클립보드에서 이미지를 가져오지 못했습니다. 권한을 확인하거나 Ctrl+V 로 붙여넣어 주세요.",
    "e.size": "이미지가 너무 큽니다. 20MB 이하 파일을 사용해 주세요.",
  },
  en: {
    "r.paste": "Paste",
    "r.upload": "Upload image",
    "r.camera": "Camera",
    "r.pasteHint": "Click this area, then press Ctrl+V or Cmd+V to paste a QR image.",
    "r.pasteBtn": "Read image from clipboard",
    "r.pasteText": "You pasted text. Please paste a QR code image instead.",
    "r.dropHint": "Drag an image here, or choose a file.",
    "r.choose": "Choose image",
    "r.formats": "PNG · JPG · WebP",
    "r.cameraBtn": "Read QR code with camera",
    "r.cameraStop": "Stop camera",
    "r.switch": "Switch camera",
    "r.rescanCamera": "Scan again with camera",
    "r.rechoose": "Choose another image",
    "r.again": "Scan again",
    "r.open": "Open link",
    "r.copyUrl": "Copy address",
    "r.copyText": "Copy text",
    "r.copied": "Copied",
    "r.domain": "Domain",
    "r.external": "External link. Check the address before opening.",
    "r.idle": "Paste or upload a QR image, or start the camera, and the result will appear here.",
    "r.scanning": "Decoding the QR code…",
    "r.requesting": "Requesting camera permission…",
    "r.success": "QR code decoded.",
    "r.guide": "Line up the QR code inside the frame.",
    "e.notfound":
      "No QR code found. Select the image again so the whole QR code is visible. A blurry or very small QR code may not be readable.",
    "e.format": "Unsupported format. Please use a PNG, JPG, JPEG or WebP image.",
    "e.camera":
      "The camera is unavailable. Check browser permissions or use image upload instead.",
    "e.clipboard":
      "Couldn't read an image from the clipboard. Check permissions or paste with Ctrl+V.",
    "e.size": "The image is too large. Please use a file under 20MB.",
  },
};

type Mode = "paste" | "upload" | "camera";
type Status =
  | "idle"
  | "loading"
  | "requesting-permission"
  | "scanning"
  | "success"
  | "error";
type Result = { type: "url"; text: string; domain: string } | { type: "text"; text: string };
type ErrKind = "notfound" | "format" | "camera" | "clipboard" | "size";

const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];
const MAX_BYTES = 20 * 1024 * 1024;

export default function QrCodeReader() {
  const t = useT(DICT);

  const [mode, setMode] = useState<Mode>("upload");
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<Result | null>(null);
  const [errKind, setErrKind] = useState<ErrKind | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [clipboardSupported, setClipboardSupported] = useState(false);
  const [canSwitch, setCanSwitch] = useState(false);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [dragOver, setDragOver] = useState(false);
  const [pasteTextHint, setPasteTextHint] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false); // 비동기 판독 중복 실행 방지

  useEffect(() => {
    setClipboardSupported(
      typeof navigator !== "undefined" &&
        !!navigator.clipboard &&
        typeof navigator.clipboard.read === "function",
    );
  }, []);

  const setPreview = useCallback((next: string | null) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = next;
    setPreviewUrl(next);
  }, []);

  const stopCamera = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    const v = videoRef.current;
    if (v && v.srcObject) {
      (v.srcObject as MediaStream).getTracks().forEach((tr) => tr.stop());
      v.srcObject = null;
    }
  }, []);

  // 언마운트 시 카메라 스트림·object URL 정리
  useEffect(() => {
    return () => {
      controlsRef.current?.stop();
      controlsRef.current = null;
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const classify = useCallback((text: string): Result => {
    const url = isSafeHttpUrl(text);
    if (url) return { type: "url", text, domain: url.hostname };
    return { type: "text", text };
  }, []);

  // 이미지 blob → QR 판독
  const decodeBlob = useCallback(
    async (blob: Blob) => {
      if (busyRef.current) return;
      if (!ALLOWED_TYPES.includes(blob.type)) {
        setResult(null);
        setErrKind("format");
        setStatus("error");
        return;
      }
      if (blob.size > MAX_BYTES) {
        setResult(null);
        setErrKind("size");
        setStatus("error");
        return;
      }
      busyRef.current = true;
      setStatus("loading");
      setResult(null);
      setErrKind(null);
      const objectUrl = URL.createObjectURL(blob);
      setPreview(objectUrl);
      try {
        const img = new Image();
        img.src = objectUrl;
        await img.decode();
        const text = await decodeImageElement(img);
        if (text == null) {
          setErrKind("notfound");
          setStatus("error");
        } else {
          setResult(classify(text));
          setStatus("success");
        }
      } catch {
        setErrKind("notfound");
        setStatus("error");
      } finally {
        busyRef.current = false;
      }
    },
    [classify, setPreview],
  );

  /* ---------- 붙여넣기 ---------- */
  useEffect(() => {
    if (mode !== "paste") return;
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            setPasteTextHint(false);
            void decodeBlob(file);
            return;
          }
        }
      }
      // 이미지가 없고 텍스트만 붙여넣은 경우: 이미지 QR 을 붙여넣도록 안내
      setPasteTextHint(true);
    }
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [mode, decodeBlob]);

  const readFromClipboard = useCallback(async () => {
    setPasteTextHint(false);
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((ty) => ty.startsWith("image/"));
        if (type) {
          const blob = await item.getType(type);
          await decodeBlob(blob);
          return;
        }
      }
      setErrKind("clipboard");
      setStatus("error");
    } catch {
      setErrKind("clipboard");
      setStatus("error");
    }
  }, [decodeBlob]);

  /* ---------- 업로드 ---------- */
  const onFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file) void decodeBlob(file);
    },
    [decodeBlob],
  );

  /* ---------- 카메라 ---------- */
  const startCamera = useCallback(
    async (facingMode: "environment" | "user") => {
      stopCamera();
      setResult(null);
      setErrKind(null);
      setPasteTextHint(false);
      setStatus("requesting-permission");
      try {
        const { BrowserQRCodeReader } = await import("@zxing/browser");
        const reader = new BrowserQRCodeReader();
        const video = videoRef.current;
        if (!video) return;
        const controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: facingMode } }, audio: false },
          video,
          (res) => {
            if (res && !busyRef.current) {
              busyRef.current = true;
              stopCamera();
              setResult(classify(res.getText()));
              setStatus("success");
              busyRef.current = false;
            }
          },
        );
        controlsRef.current = controls;
        setStatus("scanning");
        // 여러 카메라가 있으면 전환 버튼 노출
        try {
          const devices = await BrowserQRCodeReader.listVideoInputDevices();
          setCanSwitch(devices.length > 1);
        } catch {
          setCanSwitch(false);
        }
      } catch {
        stopCamera();
        setErrKind("camera");
        setStatus("error");
      }
    },
    [classify, stopCamera],
  );

  const switchCamera = useCallback(() => {
    const next = facing === "environment" ? "user" : "environment";
    setFacing(next);
    void startCamera(next);
  }, [facing, startCamera]);

  // 입력 탭 변경 시 카메라 중지 + 상태 초기화
  const changeMode = useCallback(
    (next: Mode) => {
      if (next === mode) return;
      stopCamera();
      setMode(next);
      setStatus("idle");
      setResult(null);
      setErrKind(null);
      setPasteTextHint(false);
      setPreview(null);
    },
    [mode, stopCamera, setPreview],
  );

  const reset = useCallback(() => {
    setResult(null);
    setErrKind(null);
    setPasteTextHint(false);
    setPreview(null);
    setStatus("idle");
  }, [setPreview]);

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* ignore */
    }
  }, []);

  const scanning = status === "scanning" || status === "requesting-permission";

  return (
    <>
      <PageHead slug="qr-code-reader" />
      <QrToolTabs active="reader" />

      <div className="qr-read-work">
        {/* 입력 영역 */}
        <div className="qr-panel">
          <div className="qr-panel-inner">
            {/* 입력 모드 (페이지 내부 상태 전환) */}
            <div className="qr-modes" role="group" aria-label="Input mode">
              {(["paste", "upload", "camera"] as Mode[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={mode === m ? "is-active" : ""}
                  aria-pressed={mode === m}
                  onClick={() => changeMode(m)}
                >
                  {t("r." + m)}
                </button>
              ))}
            </div>

            {mode === "paste" && (
              <div className="qr-input-zone">
                <div className="qr-paste-area" tabIndex={0}>
                  <PasteIcon />
                  <p>{t("r.pasteHint")}</p>
                  {pasteTextHint && (
                    <p className="qr-warn" role="status">
                      {t("r.pasteText")}
                    </p>
                  )}
                </div>
                {clipboardSupported && (
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={readFromClipboard}
                  >
                    {t("r.pasteBtn")}
                  </button>
                )}
              </div>
            )}

            {mode === "upload" && (
              <div
                className={"qr-drop" + (dragOver ? " is-over" : "")}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  onFiles(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <UploadIcon />
                <p>{t("r.dropHint")}</p>
                <span className="qr-formats">{t("r.formats")}</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  hidden
                  onChange={(e) => {
                    onFiles(e.target.files);
                    e.target.value = "";
                  }}
                />
              </div>
            )}

            {mode === "camera" && (
              <div className="qr-input-zone">
                <div className={"qr-camera" + (scanning ? " is-live" : "")}>
                  <video
                    ref={videoRef}
                    className="qr-video"
                    playsInline
                    muted
                    aria-label={t("r.guide")}
                  />
                  {scanning && <div className="qr-guide" aria-hidden />}
                  {!scanning && status !== "success" && (
                    <div className="qr-camera-idle" aria-hidden>
                      <CameraIcon />
                    </div>
                  )}
                </div>
                <div className="qr-camera-actions">
                  {scanning ? (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => {
                        stopCamera();
                        setStatus("idle");
                      }}
                    >
                      {t("r.cameraStop")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => startCamera(facing)}
                    >
                      {t("r.cameraBtn")}
                    </button>
                  )}
                  {scanning && canSwitch && (
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={switchCamera}
                    >
                      {t("r.switch")}
                    </button>
                  )}
                </div>
              </div>
            )}

            {previewUrl && mode !== "camera" && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="qr-preview-img" src={previewUrl} alt="" />
            )}
          </div>
        </div>

        {/* 결과 영역 */}
        <div className="qr-result">
          {status === "success" && result ? (
            <div className="qr-result-card">
              <p className="qr-result-lead">{t("r.success")}</p>
              {result.type === "url" ? (
                <>
                  <p className="qr-result-url">{result.text}</p>
                  <div className="qr-result-domain">
                    <span className="qr-result-domain-lbl">{t("r.domain")}</span>
                    <span className="qr-result-domain-val">{result.domain}</span>
                  </div>
                  <p className="qr-result-note">{t("r.external")}</p>
                  <div className="qr-result-actions">
                    <a
                      className="btn btn-primary"
                      href={result.text}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("r.open")}
                    </a>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => copy(result.text)}
                    >
                      {copied ? t("r.copied") : t("r.copyUrl")}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={mode === "camera" ? () => startCamera(facing) : reset}
                    >
                      {t("r.again")}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <pre className="qr-result-text">{result.text}</pre>
                  <div className="qr-result-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => copy(result.text)}
                    >
                      {copied ? t("r.copied") : t("r.copyText")}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={mode === "camera" ? () => startCamera(facing) : reset}
                    >
                      {t("r.again")}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : status === "error" ? (
            <div className="qr-result-empty qr-result-error" role="status" aria-live="polite">
              <p>{t("e." + (errKind ?? "notfound"))}</p>
              <div className="qr-result-actions">
                {mode === "camera" ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => startCamera(facing)}
                  >
                    {t("r.rescanCamera")}
                  </button>
                ) : mode === "upload" ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t("r.rechoose")}
                  </button>
                ) : (
                  clipboardSupported && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={readFromClipboard}
                    >
                      {t("r.pasteBtn")}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="qr-result-empty" role="status" aria-live="polite">
              <p>
                {status === "loading"
                  ? t("r.scanning")
                  : status === "requesting-permission"
                    ? t("r.requesting")
                    : status === "scanning"
                      ? t("r.guide")
                      : t("r.idle")}
              </p>
            </div>
          )}
        </div>
      </div>

      <Faq slug="qr-code-reader" />
      <RelatedTools slug="qr-code-reader" />
    </>
  );
}

function PasteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <rect x="8" y="3" width="8" height="4" rx="1" />
      <path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M12 16V4M7 9l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" strokeLinecap="round" />
    </svg>
  );
}
function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden>
      <path d="M4 8a2 2 0 0 1 2-2h1.5l1-2h5l1 2H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" />
      <circle cx="12" cy="12.5" r="3.2" />
    </svg>
  );
}
