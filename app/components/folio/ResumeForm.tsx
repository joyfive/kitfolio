"use client";

import { Area, ColorField, Field, FontField, ListEditor, RichArea, Section, asArr, asObj, asStr, setKey, type Obj } from "./FormKit";
import { ProfileActivities, ProfileBasics, ProfileCareer, ProfileEducation, ProfileIntro } from "./ProfileForm";

type T = (k: string) => string;

export function TargetFields({ doc, setDoc, t }: { doc: Obj; setDoc: (d: Obj) => void; t: T }) {
  const set = (k: string, v: unknown) => setDoc(setKey(doc, k, v));
  return (
    <>
      <Field label={t("f.company")} value={asStr(doc.company_name)} onChange={(v) => set("company_name", v)} />
      <ColorField label={t("f.primary")} value={asStr(doc.primary)} onChange={(v) => set("primary", v)} />
      <FontField label={t("f.font")} hint={t("f.fontHint")} value={doc.font} onChange={(v) => set("font", v === "pretendard" ? undefined : v)} />
      <Field label={t("f.headline")} value={asStr(doc.headline)} onChange={(v) => set("headline", v)} />
    </>
  );
}

export function CapabilitiesEditor({ doc, setDoc, t }: { doc: Obj; setDoc: (d: Obj) => void; t: T }) {
  return (
    <ListEditor<Obj>
      t={t}
      label={t("fb.sec.capabilities")}
      items={asArr(doc.capabilities).map(asObj)}
      onChange={(v) => setDoc(setKey(doc, "capabilities", v))}
      make={() => ({ title: "" })}
      itemTitle={(c) => asStr(c.title) || t("fb.untitled")}
      addLabel={t("fb.sec.capabilities")}
      render={(c, setC) => (
        <>
          <Field label={t("f.capTitle")} value={asStr(c.title)} onChange={(v) => setC(setKey(c, "title", v))} />
          <Area label={t("f.capDesc")} rows={2} value={c.desc} onChange={(v) => setC(setKey(c, "desc", v))} />
        </>
      )}
    />
  );
}

export default function ResumeForm({
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
  const p = { profile, setProfile, t };
  return (
    <div className="fb-form">
      <Section title={t("fb.sec.target")} open>
        <TargetFields doc={doc} setDoc={setDoc} t={t} />
      </Section>
      <ProfileBasics {...p} />
      <ProfileIntro {...p} />
      <Section title={t("fb.sec.capabilities")}>
        <CapabilitiesEditor doc={doc} setDoc={setDoc} t={t} />
      </Section>
      <Section title={t("fb.sec.skills")}>
        <ListEditor<Obj>
          t={t}
          label={t("fb.sec.skills")}
          items={asArr(doc.skills).map(asObj)}
          onChange={(v) => setDoc(setKey(doc, "skills", v))}
          make={() => ({ k: "" })}
          itemTitle={(s) => asStr(s.k) || t("fb.untitled")}
          addLabel={t("fb.sec.skills")}
          render={(s, setS) => (
            <>
              <Field label={t("f.skillK")} value={asStr(s.k)} onChange={(v) => setS(setKey(s, "k", v))} />
              <Area label={t("f.skillV")} rows={2} value={s.v} onChange={(v) => setS(setKey(s, "v", v))} />
            </>
          )}
        />
      </Section>
      <ProfileCareer {...p} />
      <Section title={t("fb.sec.projects")}>
        <ListEditor<Obj>
          t={t}
          label={t("fb.sec.projects")}
          items={asArr(doc.projects).map(asObj)}
          onChange={(v) => setDoc(setKey(doc, "projects", v))}
          make={() => ({ title: "" })}
          itemTitle={(pr) => asStr(pr.title) || t("fb.untitled")}
          addLabel={t("fb.sec.projects")}
          render={(pr, setP) => {
            const set = (k: string, v: unknown) => setP(setKey(pr, k, v));
            return (
              <>
                <Field label={t("f.projTitle")} value={asStr(pr.title)} onChange={(v) => set("title", v)} />
                <Field label={t("f.projCompany")} value={asStr(pr.company)} onChange={(v) => set("company", v)} />
                <Field label={t("f.period")} value={asStr(pr.period)} onChange={(v) => set("period", v)} />
                <Field
                  label={t("f.contribution")}
                  hint={t("f.contributionHint")}
                  value={asStr(pr.contribution)}
                  onChange={(v) => set("contribution", /^\d+(\.\d+)?$/.test(v.trim()) ? Number(v) : v)}
                />
                <RichArea label={t("f.projRole")} hint={t("f.richHint")} value={pr.role} onChange={(v) => set("role", v)} />
                <RichArea label={t("f.projProblem")} value={pr.problem} onChange={(v) => set("problem", v)} />
                <RichArea label={t("f.projSolution")} value={pr.solution} rows={4} onChange={(v) => set("solution", v)} />
                <RichArea label={t("f.projResult")} value={pr.result} onChange={(v) => set("result", v)} />
              </>
            );
          }}
        />
      </Section>
      <ProfileEducation {...p} />
      <ProfileActivities {...p} />
    </div>
  );
}
