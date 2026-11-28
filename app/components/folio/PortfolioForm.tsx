"use client";

import { useId, useState } from "react";
import { imageToDataUrl } from "../../lib/folio/image";
import { rowsToText, textToRows } from "../../lib/folio/text";
import {
  Area,
  Check,
  ColorField,
  Field,
  FontField,
  LinesArea,
  ListArea,
  ListEditor,
  RichArea,
  Section,
  asArr,
  asObj,
  asStr,
  isObj,
  setKey,
  type Obj,
} from "./FormKit";
import { ProfileActivities, ProfileBasics, ProfileCareer, ProfileEducation, ProfileIntro } from "./ProfileForm";
import { CapabilitiesEditor } from "./ResumeForm";

type T = (k: string) => string;

/** 이미지 고르기 → 줄여서 data URL */
function ImagePick({ label, value, onChange, t, maxWidth, keepAlpha, hint }: { label: string; value: string; onChange: (v: string | undefined) => void; t: T; maxWidth: number; keepAlpha?: boolean; hint?: string }) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  return (
    <div className="fb-field">
      <span className="fb-label">{label}</span>
      <div className="fb-image">
        {/^data:image\/|^https?:/.test(value) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" />
        )}
        <label htmlFor={id} className="btn btn-sm btn-outline">
          {busy ? "…" : t("f.photoPick")}
        </label>
        <input
          id={id}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setBusy(true);
            try {
              onChange(await imageToDataUrl(file, maxWidth, 0.85, keepAlpha));
            } catch {
              /* 읽을 수 없는 이미지는 무시 */
            } finally {
              setBusy(false);
            }
          }}
        />
        {value && (
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => onChange(undefined)}>
            {t("f.photoRemove")}
          </button>
        )}
      </div>
      {hint && <p className="fb-hint">{hint}</p>}
    </div>
  );
}

/** 이미지 너비 슬라이더 (섹션 폭 대비 %, 높이는 비율대로 따라간다). 100% 면 키를 지운다. */
function WidthSlider({ label, value, onChange, t }: { label: string; value: string; onChange: (v: string | undefined) => void; t: T }) {
  const id = useId();
  const pct = /^\s*(\d+(?:\.\d+)?)\s*%\s*$/.exec(value);
  const n = pct ? Math.max(10, Math.min(100, Math.round(Number(pct[1])))) : 100;
  const custom = value.trim() !== "" && !pct;
  return (
    <div className="fb-field">
      <label htmlFor={id}>{label}</label>
      <div className="fb-range">
        <input
          id={id}
          type="range"
          min={10}
          max={100}
          step={5}
          value={n}
          aria-valuetext={`${n}%`}
          onChange={(e) => {
            const v = Number(e.target.value);
            onChange(v >= 100 ? undefined : `${v}%`);
          }}
        />
        <output htmlFor={id} className="fb-range-val">
          {custom ? value : `${n}%`}
        </output>
      </div>
      <p className="fb-hint">{custom ? t("f.imageWidthCustom") : t("f.imageWidthHint")}</p>
    </div>
  );
}

const EL_TYPES = ["none", "list", "table", "quote", "diagram", "capture"] as const;

function ElementEditor({ el, setEl, t }: { el: Obj | undefined; setEl: (v: Obj | undefined) => void; t: T }) {
  const id = useId();
  const type = el && typeof el.type === "string" ? el.type : "none";
  const e = el ?? {};
  const set = (k: string, v: unknown) => setEl(setKey(e, k, v));
  return (
    <div className="fb-element">
      <div className="fb-field">
        <label htmlFor={id}>{t("f.element")}</label>
        <select
          id={id}
          value={type}
          onChange={(ev) => {
            const v = ev.target.value;
            setEl(v === "none" ? undefined : { type: v });
          }}
        >
          {EL_TYPES.map((k) => (
            <option key={k} value={k}>
              {t(`f.el.${k}`)}
            </option>
          ))}
        </select>
      </div>
      {type === "list" && <ListArea label={t("f.el.list")} hint={t("f.listHint")} value={e.items} onChange={(v) => set("items", v)} />}
      {type === "table" && (
        <>
          <Field
            label={t("f.tableHead")}
            hint={t("f.tableHint")}
            value={asArr(e.headers).map(asStr).join(" | ")}
            onChange={(v) => set("headers", v.trim() ? v.split("|").map((c) => c.trim()) : undefined)}
          />
          <Area label={t("f.tableRows")} value={rowsToText(e.rows)} rows={4} onChange={(v) => set("rows", textToRows(v))} />
          <Area label={t("f.caption")} rows={2} value={e.caption} onChange={(v) => set("caption", v)} />
        </>
      )}
      {type === "quote" && (
        <>
          <Area label={t("f.quoteText")} value={e.text} onChange={(v) => set("text", v)} />
          <Field label={t("f.quoteBy")} value={asStr(e.by)} onChange={(v) => set("by", v)} />
        </>
      )}
      {type === "diagram" && (
        <>
          <Area label={t("f.diagramCode")} hint={t("f.diagramHint")} value={e.code} rows={6} mono onChange={(v) => set("code", v)} />
          <Area label={t("f.caption")} rows={2} value={e.caption} onChange={(v) => set("caption", v)} />
        </>
      )}
      {type === "capture" && (
        <>
          <ImagePick label={t("f.el.capture")} value={asStr(e.src)} onChange={(v) => set("src", v)} t={t} maxWidth={1600} />
          <p className="fb-hint">{t("f.imageHint")}</p>
          <Field label={t("f.imageUrl")} type="url" value={/^https?:/.test(asStr(e.src)) ? asStr(e.src) : ""} onChange={(v) => set("src", v)} />
          <WidthSlider label={t("f.imageWidth")} value={asStr(e.w)} onChange={(v) => set("w", v)} t={t} />
          <Area label={t("f.caption")} rows={2} value={e.caption} onChange={(v) => set("caption", v)} />
        </>
      )}
    </div>
  );
}

function SectionFields({ s, setS, t }: { s: Obj; setS: (v: Obj) => void; t: T }) {
  const set = (k: string, v: unknown) => setS(setKey(s, k, v));
  return (
    <>
      <Field label={t("f.secTitle")} value={asStr(s.title)} onChange={(v) => set("title", v)} />
      <Area label={t("f.secDesc")} value={s.desc} rows={2} onChange={(v) => set("desc", v)} />
      <ElementEditor el={isObj(s.element) ? s.element : undefined} setEl={(v) => set("element", v)} t={t} />
      <Area label={t("f.secNote")} rows={2} value={s.note} onChange={(v) => set("note", v)} />
    </>
  );
}

function SolutionSections({ slide, setSlide, t }: { slide: Obj; setSlide: (v: Obj) => void; t: T }) {
  return (
    <ListEditor<Obj>
      t={t}
      label={t("f.sections")}
      items={asArr(slide.sections).map(asObj)}
      onChange={(v) => setSlide(setKey(slide, "sections", v))}
      make={() => ({ title: "" })}
      itemTitle={(s) => {
        const cols = asArr(s.columns).map(asObj);
        return asStr(s.title) || cols.map((c) => asStr(c.title)).filter(Boolean).join(" | ") || t("fb.untitled");
      }}
      addLabel={t("f.sections")}
      render={(s, setS) => {
        const cols = asArr(s.columns).map(asObj);
        const two = cols.length > 0;
        return (
          <>
            <Check
              label={t("f.twoCol")}
              checked={two}
              onChange={(on) => {
                if (on) {
                  const { columns: _c, ...rest } = s;
                  void _c;
                  setS({ columns: [rest, {}] });
                } else setS(cols[0] ?? {});
              }}
            />
            {two ? (
              <div className="fb-cols">
                {[0, 1].map((ci) => (
                  <fieldset key={ci} className="fb-col">
                    <legend>{ci === 0 ? t("f.left") : t("f.right")}</legend>
                    <SectionFields
                      s={cols[ci] ?? {}}
                      setS={(v) => {
                        const next = [cols[0] ?? {}, cols[1] ?? {}];
                        next[ci] = v;
                        setS({ columns: next });
                      }}
                      t={t}
                    />
                  </fieldset>
                ))}
              </div>
            ) : (
              <SectionFields s={s} setS={setS} t={t} />
            )}
          </>
        );
      }}
    />
  );
}

/** 선택 페이지 (개요·문제 정의·가설·성과): 켜면 빈 객체가 생기고 끄면 키를 지운다 */
function PageToggle({ label, proj, k, setProj, children }: { label: string; proj: Obj; k: string; setProj: (v: Obj) => void; children: (page: Obj, setPage: (v: Obj) => void) => React.ReactNode }) {
  const on = isObj(proj[k]);
  const page = asObj(proj[k]);
  return (
    <fieldset className="fb-page">
      <legend>
        <Check label={label} checked={on} onChange={(v) => setProj(v ? { ...proj, [k]: {} } : setKey(proj, k, undefined))} />
      </legend>
      {on && children(page, (next) => setProj({ ...proj, [k]: next }))}
    </fieldset>
  );
}

function ProjectFields({ proj, setProj, t }: { proj: Obj; setProj: (v: Obj) => void; t: T }) {
  const set = (k: string, v: unknown) => setProj(setKey(proj, k, v));
  return (
    <>
      <Field label={t("f.projTitle")} value={asStr(proj.title)} onChange={(v) => set("title", v)} />
      <Field label={t("f.period")} value={asStr(proj.period)} onChange={(v) => set("period", v)} />
      <Field label={t("f.contribution")} value={asStr(proj.contribution)} onChange={(v) => set("contribution", v)} />

      <PageToggle label={t("f.page.overview")} proj={proj} k="overview" setProj={setProj}>
        {(o, setO) => {
          const s = (k: string, v: unknown) => setO(setKey(o, k, v));
          return (
            <>
              <Area label={t("f.headlineOv")} rows={2} value={o.headline} onChange={(v) => s("headline", v)} />
              <Area label={t("f.background")} value={o.background} rows={2} onChange={(v) => s("background", v)} />
              <Area label={t("f.problem")} value={o.problem} rows={2} onChange={(v) => s("problem", v)} />
              <Area label={t("f.hypothesis")} value={o.hypothesis} rows={2} onChange={(v) => s("hypothesis", v)} />
              <Area label={t("f.solution")} value={o.solution} rows={2} onChange={(v) => s("solution", v)} />
              <Area label={t("f.resultLesson")} value={o.result} rows={2} onChange={(v) => s("result", v)} />
              <Area label={t("f.takeaway")} rows={2} value={o.takeaway} onChange={(v) => s("takeaway", v)} />
            </>
          );
        }}
      </PageToggle>

      <PageToggle label={t("f.page.problem")} proj={proj} k="problem" setProj={setProj}>
        {(p, setP) => (
          <>
            <ListArea label={t("f.background")} hint={t("f.listHint")} value={p.background} onChange={(v) => setP(setKey(p, "background", v))} />
            <ListEditor<Obj>
              t={t}
              label={t("f.cards")}
              items={asArr(p.cards).map(asObj)}
              onChange={(v) => setP(setKey(p, "cards", v))}
              make={() => ({ title: "" })}
              itemTitle={(c) => asStr(c.title) || t("fb.untitled")}
              addLabel={t("f.cards")}
              render={(c, setC) => (
                <>
                  <Area label={t("f.cardTitle")} rows={2} value={c.title} onChange={(v) => setC(setKey(c, "title", v))} />
                  <Area label={t("f.cardDesc")} value={c.desc} rows={2} onChange={(v) => setC(setKey(c, "desc", v))} />
                </>
              )}
            />
            <Area label={t("f.takeaway")} rows={2} value={p.takeaway} onChange={(v) => setP(setKey(p, "takeaway", v))} />
          </>
        )}
      </PageToggle>

      <PageToggle label={t("f.page.hypothesis")} proj={proj} k="hypothesis" setProj={setProj}>
        {(h, setH) => (
          <>
            <Area label={t("f.hypoLead")} value={h.lead} rows={2} onChange={(v) => setH(setKey(h, "lead", v))} />
            <Area label={t("f.hypothesis")} value={h.hypothesis} rows={2} onChange={(v) => setH(setKey(h, "hypothesis", v))} />
            <ListArea label={t("f.evidence")} value={h.evidence} onChange={(v) => setH(setKey(h, "evidence", v))} />
            <Area label={t("f.takeaway")} rows={2} value={h.takeaway} onChange={(v) => setH(setKey(h, "takeaway", v))} />
          </>
        )}
      </PageToggle>

      <ListEditor<Obj>
        t={t}
        label={t("f.solutions")}
        items={asArr(proj.solutions).map(asObj)}
        onChange={(v) => set("solutions", v)}
        make={() => ({ sections: [{ title: "" }] })}
        itemTitle={(s, i) => asStr(s.label) || `${t("f.solution")} ${i + 1}`}
        addLabel={t("f.solutions")}
        render={(s, setS) => (
          <>
            <Field label={t("f.slideLabel")} hint={t("f.slideLabelHint")} value={asStr(s.label)} onChange={(v) => setS(setKey(s, "label", v))} />
            <SolutionSections slide={s} setSlide={setS} t={t} />
            <Area label={t("f.takeaway")} rows={2} value={s.takeaway} onChange={(v) => setS(setKey(s, "takeaway", v))} />
          </>
        )}
      />

      <PageToggle label={t("f.page.outcome")} proj={proj} k="outcome" setProj={setProj}>
        {(o, setO) => (
          <>
            <RichArea label={t("f.collab")} hint={t("f.richHint")} value={o.collaboration} onChange={(v) => setO(setKey(o, "collaboration", v))} />
            <ListEditor<Obj>
              t={t}
              label={t("f.results")}
              items={asArr(o.results).map((r) => (isObj(r) ? r : { label: asStr(r) }))}
              onChange={(v) => setO(setKey(o, "results", v))}
              make={() => ({ label: "" })}
              itemTitle={(r) => asStr(r.label) || asStr(r.value) || t("fb.untitled")}
              addLabel={t("f.results")}
              render={(r, setR) => (
                <>
                  <Field label={t("f.resLabel")} value={asStr(r.label)} onChange={(v) => setR(setKey(r, "label", v))} />
                  <Field label={t("f.resFrom")} value={asStr(r.from)} onChange={(v) => setR(setKey(r, "from", v))} />
                  <Field label={t("f.resValue")} value={asStr(r.value)} onChange={(v) => setR(setKey(r, "value", v))} />
                </>
              )}
            />
            <RichArea label={t("f.lesson")} value={o.lesson} onChange={(v) => setO(setKey(o, "lesson", v))} />
            <Area label={t("f.takeaway")} rows={2} value={o.takeaway} onChange={(v) => setO(setKey(o, "takeaway", v))} />
          </>
        )}
      </PageToggle>
    </>
  );
}

export default function PortfolioForm({
  profile,
  setProfile,
  doc,
  setDoc,
  t,
}: {
  profile: Obj;
  setProfile: (p: Obj) => void;
  doc: Obj;
  setDoc: (d: Obj) => void;
  t: T;
}) {
  const set = (k: string, v: unknown) => setDoc(setKey(doc, k, v));
  const p = { profile, setProfile, t };
  const projects = asArr(doc.projects).map(asObj);
  const peer = asObj(doc.peer_review);
  const setPeer = (k: string, v: unknown) => {
    const next = setKey(peer, k, v);
    set("peer_review", Object.keys(next).length ? next : undefined);
  };

  return (
    <div className="fb-form">
      <Section title={t("fb.sec.cover")} open>
        <Field label={t("f.company")} value={asStr(doc.company_name)} onChange={(v) => set("company_name", v)} />
        <ImagePick label={t("f.logo")} hint={t("f.logoHint")} value={asStr(doc.logo)} onChange={(v) => set("logo", v)} t={t} maxWidth={640} keepAlpha />
        <ColorField label={t("f.primary")} value={asStr(doc.primary)} onChange={(v) => set("primary", v)} />
        <FontField label={t("f.font")} hint={t("f.fontHint")} value={doc.font} onChange={(v) => set("font", v === "pretendard" ? undefined : v)} />
        <Area label={t("f.title")} rows={2} value={doc.title} onChange={(v) => set("title", v)} />
        <Field label={t("f.headline")} value={asStr(doc.headline)} onChange={(v) => set("headline", v)} />
        <ImagePick label={t("f.photo")} value={asStr(doc.photo)} onChange={(v) => set("photo", v)} t={t} maxWidth={480} />
      </Section>
      <ProfileBasics {...p} />
      <ProfileIntro {...p} />
      <ProfileCareer {...p} />
      <ProfileEducation {...p} />
      <ProfileActivities {...p} />

      <Section title={t("fb.sec.work")}>
        <ListEditor<Obj>
          t={t}
          label={t("f.philosophy")}
          items={asArr(doc.philosophy).map((x) => (isObj(x) ? x : { title: asStr(x) }))}
          onChange={(v) => set("philosophy", v)}
          make={() => ({ title: "" })}
          itemTitle={(x) => asStr(x.title) || t("fb.untitled")}
          addLabel={t("f.philosophy")}
          render={(x, setX) => (
            <>
              <Area label={t("f.philoTitle")} rows={2} value={x.title} onChange={(v) => setX(setKey(x, "title", v))} />
              <Area label={t("f.philoDesc")} value={x.desc} rows={2} onChange={(v) => setX(setKey(x, "desc", v))} />
            </>
          )}
        />
        <LinesArea label={t("f.workingStyle")} hint={t("f.workingStyleHint")} value={doc.working_style} onChange={(v) => set("working_style", v)} />
        <fieldset className="fb-page">
          <legend>{t("f.peer")}</legend>
          <Field label={t("f.peerTitle")} value={asStr(peer.title)} onChange={(v) => setPeer("title", v)} />
          <Field label={t("f.peerSource")} value={asStr(peer.source)} onChange={(v) => setPeer("source", v)} />
          <ListEditor<Obj>
            t={t}
            label={t("f.metrics")}
            items={asArr(peer.metrics).map(asObj)}
            onChange={(v) => setPeer("metrics", v)}
            make={() => ({ label: "", value: 80 })}
            itemTitle={(m) => asStr(m.label) || t("fb.untitled")}
            addLabel={t("f.metrics")}
            render={(m, setM) => (
              <>
                <Field label={t("f.metricLabel")} value={asStr(m.label)} onChange={(v) => setM(setKey(m, "label", v))} />
                <Field
                  label={t("f.metricValue")}
                  type="number"
                  inputMode="numeric"
                  value={asStr(m.value)}
                  onChange={(v) => setM(setKey(m, "value", v === "" ? undefined : Math.max(0, Math.min(100, Number(v)))))}
                />
              </>
            )}
          />
          <LinesArea label={t("f.quotes")} value={peer.quotes} onChange={(v) => setPeer("quotes", v)} />
        </fieldset>
      </Section>

      <Section title={t("fb.sec.overview")}>
        <CapabilitiesEditor doc={doc} setDoc={setDoc} t={t} />
        <ListEditor<Obj>
          t={t}
          label={t("f.overviewItems")}
          items={asArr(doc.overview).map(asObj)}
          onChange={(v) => set("overview", v)}
          make={() => ({ title: "" })}
          itemTitle={(o) => asStr(o.title) || t("fb.untitled")}
          addLabel={t("f.overviewItems")}
          render={(o, setO) => {
            const linked = new Set(asArr(o.projects).map((l) => Number(isObj(l) ? l.no : l)));
            return (
              <>
                <Area label={t("f.ovTitle")} rows={2} value={o.title} onChange={(v) => setO(setKey(o, "title", v))} />
                <Area label={t("f.ovDesc")} value={o.desc} rows={2} onChange={(v) => setO(setKey(o, "desc", v))} />
                {projects.length > 0 && (
                  <fieldset className="fb-checks">
                    <legend>{t("f.ovProjects")}</legend>
                    {projects.map((pr, i) => (
                      <Check
                        key={i}
                        label={`#${i + 1} ${asStr(pr.title) || t("fb.untitled")}`}
                        checked={linked.has(i + 1)}
                        onChange={(on) => {
                          const next = new Set(linked);
                          if (on) next.add(i + 1);
                          else next.delete(i + 1);
                          setO(setKey(o, "projects", [...next].sort((a, b) => a - b).map((no) => ({ no }))));
                        }}
                      />
                    ))}
                  </fieldset>
                )}
              </>
            );
          }}
        />
      </Section>

      <Section title={t("fb.sec.projects")}>
        <ListEditor<Obj>
          t={t}
          label={t("fb.sec.projects")}
          items={projects}
          onChange={(v) => set("projects", v)}
          make={() => ({ title: "", overview: { headline: "" } })}
          itemTitle={(pr) => asStr(pr.title) || t("fb.untitled")}
          addLabel={t("fb.sec.projects")}
          render={(pr, setP) => <ProjectFields proj={pr} setProj={setP} t={t} />}
        />
      </Section>

      <Section title={t("fb.sec.ending")}>
        <LinesArea label={t("f.ending")} hint={t("f.endingHint")} value={doc.ending} onChange={(v) => set("ending", v)} />
      </Section>
    </div>
  );
}
