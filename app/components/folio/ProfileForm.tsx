"use client";

/* 공통 프로필 폼: 두 도구가 같은 profile 을 고친다.
   etc(활동·수상)는 한 리스트에 섞어 저장한다 (auto-folio 작성 형식). 폼에서는 둘로 나눠 보여준다. */
import {
  Check,
  Field,
  LinesArea,
  ListArea,
  ListEditor,
  ParagraphsArea,
  Section,
  asArr,
  asObj,
  asStr,
  isObj,
  setKey,
  type Obj,
} from "./FormKit";

type T = (k: string) => string;
type Props = { profile: Obj; setProfile: (p: Obj) => void; t: T };

export function ProfileBasics({ profile, setProfile, t }: Props) {
  const set = (k: string, v: unknown) => setProfile(setKey(profile, k, v));
  const contacts = asArr(profile.contact).map((c) => (isObj(c) ? c : { value: asStr(c) }));
  return (
    <Section title={t("fb.sec.profile")} note={t("fb.shared")}>
      <Field label={t("f.name")} value={asStr(profile.name)} onChange={(v) => set("name", v)} />
      <Field label={t("f.total")} value={asStr(profile.total_experience)} onChange={(v) => set("total_experience", v)} />
      <ListEditor<Obj>
        t={t}
        label={t("f.contact")}
        items={contacts}
        onChange={(v) => set("contact", v)}
        make={() => ({ value: "" })}
        itemTitle={(c) => asStr(c.value) || t("fb.untitled")}
        addLabel={t("f.contact")}
        render={(c, setC) => (
          <>
            <Field label={t("f.contactValue")} value={asStr(c.value)} onChange={(v) => setC(setKey(c, "value", v))} />
            <Check label={t("f.strong")} checked={c.strong === true} onChange={(v) => setC(setKey(c, "strong", v || undefined))} />
          </>
        )}
      />
    </Section>
  );
}

export function ProfileIntro({ profile, setProfile, t }: Props) {
  const set = (k: string, v: unknown) => setProfile(setKey(profile, k, v));
  return (
    <Section title={t("fb.sec.intro")} note={t("fb.shared")}>
      <Field label={t("f.lead")} value={asStr(profile.lead)} onChange={(v) => set("lead", v)} />
      <ParagraphsArea label={t("f.paragraphs")} hint={t("f.paragraphsHint")} value={profile.paragraphs} onChange={(v) => set("paragraphs", v)} />
    </Section>
  );
}

export function ProfileCareer({ profile, setProfile, t }: Props) {
  return (
    <Section title={t("fb.sec.career")} note={t("fb.shared")}>
      <ListEditor<Obj>
        t={t}
        label={t("fb.sec.career")}
        items={asArr(profile.career).map(asObj)}
        onChange={(v) => setProfile(setKey(profile, "career", v))}
        make={() => ({ company: "" })}
        itemTitle={(c) => asStr(c.company) || t("fb.untitled")}
        addLabel={t("fb.sec.career")}
        render={(c, setC) => (
          <>
            <Field label={t("f.careerCompany")} value={asStr(c.company)} onChange={(v) => setC(setKey(c, "company", v))} />
            <Field label={t("f.period")} value={asStr(c.period)} onChange={(v) => setC(setKey(c, "period", v))} />
            <Field label={t("f.role")} value={asStr(c.role)} onChange={(v) => setC(setKey(c, "role", v))} />
            <ListArea label={t("f.bullets")} hint={t("f.listHint")} value={c.bullets} onChange={(v) => setC(setKey(c, "bullets", v))} />
          </>
        )}
      />
    </Section>
  );
}

export function ProfileEducation({ profile, setProfile, t }: Props) {
  const edu = asObj(profile.education);
  const setEdu = (k: string, v: string) => {
    const next = setKey(edu, k, v);
    setProfile(setKey(profile, "education", Object.keys(next).length ? next : undefined));
  };
  return (
    <Section title={t("fb.sec.education")} note={t("fb.shared")}>
      <Field label={t("f.school")} value={asStr(edu.school)} onChange={(v) => setEdu("school", v)} />
      <Field label={t("f.period")} value={asStr(edu.period)} onChange={(v) => setEdu("period", v)} />
      <Field label={t("f.eduDetail")} value={asStr(edu.detail)} onChange={(v) => setEdu("detail", v)} />
    </Section>
  );
}

export function ProfileActivities({ profile, setProfile, t }: Props) {
  const all = asArr(profile.etc).map(asObj);
  const activities = all.filter((e) => e.year == null);
  const awards = all.filter((e) => e.year != null);
  const save = (a: Obj[], w: Obj[]) => setProfile(setKey(profile, "etc", [...a, ...w]));
  return (
    <Section title={t("fb.sec.activities")} note={t("fb.shared")}>
      <ListEditor<Obj>
        t={t}
        label={t("f.activities")}
        items={activities}
        onChange={(v) => save(v ?? [], awards)}
        make={() => ({ title: "" })}
        itemTitle={(e) => asStr(e.title) || t("fb.untitled")}
        addLabel={t("f.activities")}
        render={(e, setE) => (
          <>
            <Field label={t("f.actTitle")} value={asStr(e.title)} onChange={(v) => setE(setKey(e, "title", v))} />
            <LinesArea label={t("f.actDetail")} value={e.detail} rows={2} onChange={(v) => setE(setKey(e, "detail", v))} />
          </>
        )}
      />
      <ListEditor<Obj>
        t={t}
        label={t("f.awards")}
        items={awards}
        onChange={(v) => save(activities, v ?? [])}
        make={() => ({ year: String(new Date().getFullYear()) })}
        itemTitle={(e) => asStr(e.year) || t("fb.untitled")}
        addLabel={t("f.awards")}
        render={(e, setE) => (
          <>
            {/* year 키는 비워도 남겨 둔다: 수상 항목의 표식이다 */}
            <Field label={t("f.year")} value={asStr(e.year)} onChange={(v) => setE({ ...e, year: v })} />
            <LinesArea label={t("f.awardItems")} value={e.items} rows={2} onChange={(v) => setE(setKey(e, "items", v))} />
          </>
        )}
      />
    </Section>
  );
}
