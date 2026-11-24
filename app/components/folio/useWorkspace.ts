"use client";

/* 작업공간 상태 + localStorage 자동 저장.
   첫 렌더(SSR 포함)는 예시 작업공간이다. 마운트 후 저장본이 있으면 바꿔 끼운다.
   저장은 사용자가 무언가를 바꿨을 때만 한다: 예시를 열어 보기만 해도 저장되면
   "저장된 데이터 없음"과 "예시를 저장함"을 구분할 수 없다. */
import { useCallback, useEffect, useRef, useState } from "react";
import type { DocLang, FolioEntry, FolioKind, SourceDoc, Workspace } from "../../lib/folio/types";
import { activeEntry, loadWorkspace, makeEntry, saveWorkspace } from "../../lib/folio/storage";
import { sampleWorkspace } from "../../lib/folio/sample";

export type SaveState = "idle" | "saving" | "saved" | "quota" | "blocked";

export function useWorkspace(kind: FolioKind, pageLang: DocLang) {
  const [ws, setWs] = useState<Workspace>(() => sampleWorkspace(pageLang));
  const [loaded, setLoaded] = useState(false);
  const [unreadable, setUnreadable] = useState<string | null>(null);
  const [save, setSave] = useState<SaveState>("idle");
  const dirty = useRef(false);
  /** 변경 횟수: 미리보기 오류 경계를 새 값으로 다시 시도하게 하는 키 */
  const [rev, setRev] = useState(0);

  useEffect(() => {
    const r = loadWorkspace();
    if (r.kind === "ok") {
      setWs(r.workspace);
      setSave("saved");
    } else if (r.kind === "unreadable") setUnreadable(r.raw);
    setLoaded(true);
  }, []);

  // 변경 후 400ms 디바운스 저장
  useEffect(() => {
    if (!loaded || !dirty.current) return;
    setSave("saving");
    const id = window.setTimeout(() => {
      const r = saveWorkspace(ws);
      setSave(r.ok ? "saved" : r.reason);
      if (r.ok) setUnreadable(null);
    }, 400);
    return () => window.clearTimeout(id);
  }, [ws, loaded]);

  const update = useCallback((fn: (w: Workspace) => Workspace) => {
    dirty.current = true;
    setRev((r) => r + 1);
    setWs((w) => fn(w));
  }, []);

  // 목록이 비면 빈 문서를 하나 만든다 (편집 대상이 항상 있게)
  const entry: FolioEntry = activeEntry(ws, kind) ?? { id: "empty", lang: pageLang, doc: {}, updatedAt: "" };

  const touch = (e: FolioEntry, patch: Partial<FolioEntry>): FolioEntry => ({ ...e, ...patch, updatedAt: new Date().toISOString() });

  const setDoc = useCallback(
    (doc: SourceDoc) =>
      update((w) => {
        const cur = activeEntry(w, kind);
        if (!cur) {
          const e = makeEntry(doc, pageLang);
          return { ...w, [kind]: [e], active: { ...w.active, [kind]: e.id } };
        }
        return { ...w, [kind]: w[kind].map((e) => (e.id === cur.id ? touch(e, { doc }) : e)) };
      }),
    [kind, pageLang, update],
  );

  const setLang = useCallback(
    (lang: DocLang) =>
      update((w) => {
        const cur = activeEntry(w, kind);
        return cur ? { ...w, [kind]: w[kind].map((e) => (e.id === cur.id ? touch(e, { lang }) : e)) } : w;
      }),
    [kind, update],
  );

  const setProfile = useCallback((profile: SourceDoc) => update((w) => ({ ...w, profile })), [update]);

  const select = useCallback((id: string) => update((w) => ({ ...w, active: { ...w.active, [kind]: id } })), [kind, update]);

  const add = useCallback(
    (doc: SourceDoc, lang: DocLang) =>
      update((w) => {
        const e = makeEntry(doc, lang);
        return { ...w, [kind]: [...w[kind], e], active: { ...w.active, [kind]: e.id } };
      }),
    [kind, update],
  );

  const remove = useCallback(
    (id: string) =>
      update((w) => {
        const list = w[kind].filter((e) => e.id !== id);
        return { ...w, [kind]: list, active: { ...w.active, [kind]: list[0]?.id } };
      }),
    [kind, update],
  );

  const replace = useCallback((next: Workspace) => update(() => next), [update]);

  return { ws, entry, rev, loaded, save, unreadable, setDoc, setLang, setProfile, select, add, remove, replace };
}
