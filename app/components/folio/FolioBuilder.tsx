"use client";

/* 경력기술서 · 포트폴리오 빌더 공용 작업 영역.
   왼쪽: 문서 선택 + 폼/yml 편집 · 오른쪽: 미리보기 (모바일은 편집/미리보기 전환).
   PDF 는 브라우저 인쇄로 만든다: 인쇄할 때만 문서를 body 직속 포털로 그리고
   나머지 화면을 인쇄에서 숨긴다. 서버 렌더링(Playwright)을 쓰지 않는다. */
import { Component, useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { DocLang, FolioKind, SourceDoc } from "../../lib/folio/types";
import { buildPortfolio, buildResume, deepMerge } from "../../lib/folio/transform";
import { dumpYaml, parseYaml } from "../../lib/folio/yaml";
import { ensureFontLoaded, resolveFont } from "../../lib/folio/fonts";
import { BACKUP_MARK, normalizeWorkspace } from "../../lib/folio/storage";
import { blankDoc, samplePortfolio, sampleResume } from "../../lib/folio/sample";
import { downloadBlob } from "../../lib/downloadBlob";
import { useLang, useT } from "../../lib/i18n";
import { FOLIO_DICT } from "./dict";
import { useWorkspace } from "./useWorkspace";
import ResumeDoc from "./ResumeDoc";
import PortfolioDoc from "./PortfolioDoc";
import { FitZoom } from "./Deck";
import { toast, useToastOnChange } from "../../lib/toast";
import ResumeForm from "./ResumeForm";
import PortfolioForm from "./PortfolioForm";
import type { Obj } from "./FormKit";

/** 렌더 중 예외가 나도 편집기는 살려 둔다 (사람이 쓴 yml 은 모양을 장담할 수 없다) */
class PreviewBoundary extends Component<{ message: string; resetKey: string; children: ReactNode }, { error: boolean; key: string }> {
  state = { error: false, key: this.props.resetKey };
  static getDerivedStateFromError() {
    return { error: true };
  }
  static getDerivedStateFromProps(p: { resetKey: string }, s: { error: boolean; key: string }) {
    return p.resetKey !== s.key ? { error: false, key: p.resetKey } : null;
  }
  render() {
    return this.state.error ? <p className="fb-render-error">{this.props.message}</p> : this.props.children;
  }
}

function YamlPanel({ initial, onDoc, t }: { initial: string; onDoc: (d: SourceDoc) => void; t: (k: string) => string }) {
  const id = useId();
  const [text, setText] = useState(initial);
  const [err, setErr] = useState<{ message: string; line?: number } | null>(null);
  // YAML 오류는 화면에 그리지 않고 토스트로 알린다
  useToastOnChange(
    err ? `${t("fb.yamlError")}${err.line ? ` · ${t("fb.yamlLine").replace("{n}", String(err.line))}` : ""}: ${err.message}` : null,
    "error",
  );
  return (
    <div className="fb-yaml">
      <label htmlFor={id} className="sr-only">
        yml
      </label>
      <textarea
        id={id}
        className="fb-yaml-in"
        value={text}
        spellCheck={false}
        aria-invalid={!!err}
        onChange={(e) => {
          setText(e.target.value);
          const r = parseYaml(e.target.value);
          if (r.ok) {
            setErr(null);
            onDoc(r.doc);
          } else setErr({ message: r.message, line: r.line });
        }}
      />
    </div>
  );
}

const slugify = (s: string) =>
  s
    .trim()
    .replace(/[\\/:*?"<>|\s]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "document";

export default function FolioBuilder({ kind }: { kind: FolioKind }) {
  const { lang } = useLang();
  const t = useT(FOLIO_DICT);
  const W = useWorkspace(kind, lang);
  const { ws, entry } = W;
  const [tab, setTab] = useState<"form" | "yaml">("form");
  const [yamlTarget, setYamlTarget] = useState<"doc" | "profile">("doc");
  /** 인쇄 요청 번호: 0 이면 인쇄 중 아님. 누를 때마다 늘려 같은 상태에서도 다시 인쇄한다. */
  const [printReq, setPrintReq] = useState(0);
  const printing = printReq > 0;
  const fileRef = useRef<HTMLInputElement>(null);
  const selectId = useId();
  const langId = useId();

  const docLang: DocLang = entry.lang;
  const merged = useMemo(() => deepMerge(ws.profile, entry.doc) as SourceDoc, [ws.profile, entry.doc]);
  const companyOf = (d: SourceDoc) => (typeof d.company_name === "string" && d.company_name) || t("fb.untitled");

  // 문서 글꼴: 고르면 스타일시트를 붙인다. key 로 다시 그려 다이어그램도 새 글꼴로 측정한다.
  const font = resolveFont(merged.font);
  useEffect(() => ensureFontLoaded(font), [font]);

  const doc = useMemo(() => {
    if (kind === "resume") return <ResumeDoc key={font.id} data={buildResume(ws.profile, entry.doc)} lang={docLang} />;
    return <PortfolioDoc key={font.id} data={buildPortfolio(ws.profile, entry.doc)} lang={docLang} />;
  }, [kind, ws.profile, entry.doc, docLang, font.id]);

  /* ── 인쇄 ─────────────────────────────────────────── */
  useEffect(() => {
    if (!printing) return;
    const html = document.documentElement;
    const style = document.createElement("style");
    style.textContent = kind === "resume" ? "@page { size: A4; margin: 14mm 0; }" : "@page { size: 1920px 1080px; margin: 0; }";
    document.head.appendChild(style);
    html.classList.add("fb-printing");
    const finish = () => setPrintReq(0);
    window.addEventListener("afterprint", finish, { once: true });
    let fallback = 0;
    // 다이어그램(mermaid)이 다 그려진 뒤 인쇄한다. 최대 4초 기다린다.
    const started = Date.now();
    let fontsReady = false;
    void document.fonts?.ready.then(() => {
      fontsReady = true;
    });
    const timer = window.setInterval(() => {
      const pending = document.querySelectorAll('.fb-print-root [data-diagram][data-ready="0"]').length;
      // 글꼴(웹 폰트)과 다이어그램이 준비된 뒤 인쇄한다
      if ((pending === 0 && (fontsReady || !document.fonts)) || Date.now() - started > 4000) {
        window.clearInterval(timer);
        window.print();
        // afterprint 를 보내지 않는 브라우저 대비 (인쇄 창이 닫힐 시간을 넉넉히 둔다)
        fallback = window.setTimeout(finish, 60000);
      }
    }, 120);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(fallback);
      window.removeEventListener("afterprint", finish);
      html.classList.remove("fb-printing");
      style.remove();
    };
  }, [printReq, printing, kind]);

  /* ── 파일 ─────────────────────────────────────────── */
  const exportYaml = () => {
    const text = dumpYaml(merged);
    downloadBlob(new Blob([text], { type: "text/yaml;charset=utf-8" }), `${slugify(companyOf(entry.doc))}-${kind}.yml`);
  };
  const exportBackup = () => {
    const text = dumpYaml({ [BACKUP_MARK]: 1, ...ws } as SourceDoc);
    downloadBlob(new Blob([text], { type: "text/yaml;charset=utf-8" }), `kitfolio-folio-backup.yml`);
  };
  const importFile = async (file: File) => {
    const r = parseYaml(await file.text());
    if (!r.ok) {
      toast.error(`${t("fb.importFail")}: ${r.message}`);
      return;
    }
    if (r.doc[BACKUP_MARK] != null) {
      const { [BACKUP_MARK]: _mark, ...rest } = r.doc;
      void _mark;
      const next = normalizeWorkspace(rest);
      if (!next) {
        toast.error(t("fb.importFail"));
        return;
      }
      if (window.confirm(t("fb.importBackup"))) {
        W.replace(next);
        toast.success(t("fb.importDone"));
      }
      return;
    }
    W.add(r.doc, docLang);
    toast.success(t("fb.importDoc"));
  };

  // 저장 실패만 알린다 (자동 저장 성공은 조용히)
  useToastOnChange(W.save === "quota" ? t("fb.saveQuota") : W.save === "blocked" ? t("fb.saveBlocked") : null, "error");
  useToastOnChange(W.unreadable ? t("fb.unreadable") : null, "warning");

  const formKey = `${entry.id}:${tab}:${W.loaded ? 1 : 0}`;
  const list = ws[kind];

  return (
    <div className={`fb-work fb-work--${kind}`}>
      <div className="fb-toolbar">
        <div className="fb-docpick">
          <label htmlFor={selectId}>{t("fb.doc")}</label>
          <select id={selectId} value={entry.id} onChange={(e) => W.select(e.target.value)}>
            {list.length === 0 && <option value={entry.id}>{companyOf(entry.doc)}</option>}
            {list.map((e) => (
              <option key={e.id} value={e.id}>
                {companyOf(e.doc)}
              </option>
            ))}
          </select>
        </div>
        <div className="fb-docpick fb-docpick--lang">
          <label htmlFor={langId}>{t("fb.docLang")}</label>
          <select id={langId} value={docLang} onChange={(e) => W.setLang(e.target.value === "en" ? "en" : "ko")}>
            <option value="ko">{t("fb.docLang.ko")}</option>
            <option value="en">{t("fb.docLang.en")}</option>
          </select>
        </div>
        <div className="fb-toolbar-btns">
          <button type="button" className="btn btn-sm btn-outline" onClick={() => W.add(blankDoc(lang), lang)}>
            {t("fb.new")}
          </button>
          <button type="button" className="btn btn-sm btn-outline" onClick={() => W.add(kind === "resume" ? sampleResume(lang) : samplePortfolio(lang), lang)}>
            {t("fb.newSample")}
          </button>
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => W.add({ ...entry.doc, company_name: `${companyOf(entry.doc)}${t("fb.copySuffix")}` }, docLang)}
          >
            {t("fb.duplicate")}
          </button>
          {W.unreadable && (
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={() => downloadBlob(new Blob([W.unreadable ?? ""], { type: "application/json" }), "kitfolio-folio-unreadable.json")}
            >
              {t("fb.unreadableDownload")}
            </button>
          )}
          <button
            type="button"
            className="btn btn-sm btn-outline"
            disabled={list.length === 0}
            onClick={() => {
              if (window.confirm(t("fb.deleteConfirm"))) W.remove(entry.id);
            }}
          >
            {t("fb.delete")}
          </button>
        </div>
        <button type="button" className="btn btn-primary fb-print-btn" onClick={() => setPrintReq((n) => n + 1)}>
          {t("fb.print")}
        </button>
      </div>

      <div className="fb-split">
        <section className="fb-preview" aria-label={t("fb.viewPreview")}>
          <PreviewBoundary message={t("fb.renderError")} resetKey={`${entry.id}:${W.rev}`}>
            <div className="fb-preview-inner">{kind === "resume" ? <FitZoom width={960}>{doc}</FitZoom> : doc}</div>
          </PreviewBoundary>
          <p className="fb-hint fb-print-hint">{t("fb.printHint")}</p>
        </section>
        <section className="fb-editor" aria-label={t("fb.viewEdit")}>
          <div className="fb-tabs" role="tablist">
            <button type="button" role="tab" aria-selected={tab === "form"} className={tab === "form" ? "is-on" : ""} onClick={() => setTab("form")}>
              {t("fb.tabForm")}
            </button>
            <button type="button" role="tab" aria-selected={tab === "yaml"} className={tab === "yaml" ? "is-on" : ""} onClick={() => setTab("yaml")}>
              {t("fb.tabYaml")}
            </button>
          </div>

          <div className="fb-editor-body" role="tabpanel">
            {tab === "form" ? (
              kind === "resume" ? (
                <ResumeForm key={formKey} profile={ws.profile as Obj} setProfile={W.setProfile} doc={entry.doc as Obj} setDoc={W.setDoc} t={t} />
              ) : (
                <PortfolioForm key={formKey} profile={ws.profile as Obj} setProfile={W.setProfile} doc={entry.doc as Obj} setDoc={W.setDoc} t={t} />
              )
            ) : (
              <>
                <div className="seg fb-yamlseg" role="group" aria-label="yml">
                  <button type="button" className={yamlTarget === "doc" ? "is-active" : ""} aria-pressed={yamlTarget === "doc"} onClick={() => setYamlTarget("doc")}>
                    {t("fb.yamlDoc")}
                  </button>
                  <button type="button" className={yamlTarget === "profile" ? "is-active" : ""} aria-pressed={yamlTarget === "profile"} onClick={() => setYamlTarget("profile")}>
                    {t("fb.yamlProfile")}
                  </button>
                </div>
                <p className="fb-hint">{t("fb.yamlHelp")}</p>
                {yamlTarget === "doc" ? (
                  <YamlPanel key={`${formKey}:doc`} initial={dumpYaml(entry.doc)} onDoc={W.setDoc} t={t} />
                ) : (
                  <YamlPanel key={`${formKey}:profile`} initial={dumpYaml(ws.profile)} onDoc={W.setProfile} t={t} />
                )}
              </>
            )}
          </div>

          <div className="fb-files">
            <button type="button" className="btn btn-sm btn-ghost" onClick={exportYaml}>
              {t("fb.exportYaml")}
            </button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={exportBackup}>
              {t("fb.exportBackup")}
            </button>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => fileRef.current?.click()}>
              {t("fb.import")}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".yml,.yaml,text/yaml,text/plain"
              hidden
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) void importFile(f);
              }}
            />
          </div>
          <p className="fb-privacy">{t("fb.privacy")}</p>
        </section>
      </div>

      {printing &&
        createPortal(
          <div className="fb-print-root">
            <PreviewBoundary message={t("fb.renderError")} resetKey="print">
              {doc}
            </PreviewBoundary>
          </div>,
          document.body,
        )}
    </div>
  );
}
