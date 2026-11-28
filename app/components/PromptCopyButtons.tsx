"use client";

import { useEffect, useRef } from "react";
import { copyText } from "../lib/clipboard";

/**
 * 본문 코드 블록(pre)마다 복사 버튼을 붙인다.
 * 프롬프트 글의 핵심은 "그대로 붙여 넣을 문장"이고, 그 문장은 코드 블록에 쓴다.
 * 본문 HTML 은 서버에서 렌더되므로, 버튼만 클라이언트에서 덧붙인다 (본문 텍스트는 SSR 그대로).
 */
export default function PromptCopyButtons({
  targetId,
  copyLabel,
  copiedLabel,
}: {
  targetId: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current) return;
    done.current = true;
    const root = document.getElementById(targetId);
    if (!root) return;
    for (const pre of Array.from(root.querySelectorAll("pre"))) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "kf-prompt-copy";
      btn.textContent = copyLabel;
      btn.addEventListener("click", async () => {
        const text = pre.querySelector("code")?.textContent ?? pre.textContent ?? "";
        try {
          await copyText(text.replace(/\n$/, ""));
          btn.textContent = copiedLabel;
          window.setTimeout(() => (btn.textContent = copyLabel), 1500);
        } catch {
          /* 클립보드 권한이 없으면 사용자가 직접 선택해 복사한다 */
        }
      });
      const wrap = document.createElement("div");
      wrap.className = "kf-prompt-pre";
      pre.parentNode?.insertBefore(wrap, pre);
      wrap.appendChild(pre);
      wrap.appendChild(btn);
    }
  }, [targetId, copyLabel, copiedLabel]);
  return null;
}
