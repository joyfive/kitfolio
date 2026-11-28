"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

/**
 * 토스트: 화면 안에 상태·에러·완료 문구를 그리지 않고 여기로 보낸다.
 * 컴포넌트는 `toast.success("...")` 처럼 부르거나, 메시지가 상태로 존재하면 `useToastOnChange` 를 쓴다.
 */
export type ToastKind = "success" | "error" | "warning" | "info";

export type ToastItem = {
  id: string;
  kind: ToastKind;
  message: string;
  duration: number;
  /** 같은 key 의 토스트는 새로 쌓지 않고 교체한다 */
  key?: string;
};

type Opts = { duration?: number; key?: string };

const DEFAULT_DURATION: Record<ToastKind, number> = {
  success: 2600,
  info: 3200,
  warning: 4500,
  error: 5500,
};
const MAX_VISIBLE = 3;

let items: ToastItem[] = [];
let seq = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function dismissToast(id: string) {
  const next = items.filter((t) => t.id !== id);
  if (next.length === items.length) return;
  items = next;
  emit();
}

function push(kind: ToastKind, message: string, opts: Opts = {}) {
  const text = message.trim();
  if (!text) return "";
  const key = opts.key ?? `${kind}:${text}`;
  const id = `t${++seq}`;
  const item: ToastItem = { id, kind, message: text, duration: opts.duration ?? DEFAULT_DURATION[kind], key };
  items = [...items.filter((t) => t.key !== key), item].slice(-MAX_VISIBLE);
  emit();
  return id;
}

export const toast = {
  success: (message: string, opts?: Opts) => push("success", message, opts),
  error: (message: string, opts?: Opts) => push("error", message, opts),
  warning: (message: string, opts?: Opts) => push("warning", message, opts),
  info: (message: string, opts?: Opts) => push("info", message, opts),
  dismiss: dismissToast,
};

const EMPTY: ToastItem[] = [];
export function useToasts(): ToastItem[] {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => items,
    () => EMPTY,
  );
}

/** 상태로 존재하는 메시지를 토스트로 내보낸다. 메시지가 바뀌면 한 번 띄우고, 메시지가 사라지면(오류가 해소되면) 그 토스트를 걷는다. */
export function useToastOnChange(message: string | null | undefined, kind: ToastKind = "error") {
  const last = useRef<{ msg: string; id: string } | null>(null);
  useEffect(() => {
    const m = message?.trim() || null;
    if (m === (last.current?.msg ?? null)) return;
    if (last.current) dismissToast(last.current.id);
    last.current = m ? { msg: m, id: toast[kind](m) } : null;
  }, [message, kind]);
}

export type ToastNotice = { kind: ToastKind; message: string } | null | undefined;

/** 종류가 상태에 따라 바뀌는 알림용: { kind, message } 가 바뀔 때마다 한 번 띄우고, 사라지면 걷는다. */
export function useToastNotice(notice: ToastNotice) {
  const last = useRef<{ sig: string; id: string } | null>(null);
  const kind = notice?.kind;
  const message = notice?.message.trim() || "";
  useEffect(() => {
    const sig = kind && message ? `${kind}|${message}` : null;
    if (sig === (last.current?.sig ?? null)) return;
    if (last.current) dismissToast(last.current.id);
    last.current = sig && kind ? { sig, id: toast[kind](message) } : null;
  }, [kind, message]);
}
