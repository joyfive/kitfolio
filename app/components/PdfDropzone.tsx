"use client";

import { useRef, useState } from "react";

/** PDF 업로드 드롭존 — 클릭/드래그 앤 드롭. 라벨 문구는 부모(도구 DICT)에서 주입. */
export default function PdfDropzone({
  onFiles,
  multiple = false,
  disabled = false,
  title,
  hint,
  compact = false,
}: {
  onFiles: (files: FileList | null) => void;
  multiple?: boolean;
  disabled?: boolean;
  title: string;
  hint?: string;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const open = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div
      className={
        "pdf-drop" +
        (over ? " is-over" : "") +
        (disabled ? " is-disabled" : "") +
        (compact ? " is-compact" : "")
      }
      onDragOver={(e) => {
        e.preventDefault();
        if (!disabled) setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (!disabled) onFiles(e.dataTransfer.files);
      }}
      onClick={open}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          e.preventDefault();
          open();
        }
      }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        aria-hidden
      >
        <path d="M12 16V4M7 9l5-5 5 5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" strokeLinecap="round" />
      </svg>
      <p className="pdf-drop-title">{title}</p>
      {hint && <span className="pdf-drop-hint">{hint}</span>}
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        multiple={multiple}
        hidden
        onChange={(e) => {
          onFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
