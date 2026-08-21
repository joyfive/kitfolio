---
name: build-tool
description: End-to-end runbook for building a new KitFolio tool/page from a plain feature description · registry entry, component, routes, OG, hub card, SEO/AEO copy, source structure, and the README/CLAUDE.md feature-list update. Use whenever the user says they want to add a tool/page/feature, e.g. "새로운 기능 개발할거야", "새로운 페이지 추가할게", "X 도구 만들자", "add a new tool/page", "build X". The user describes the feature; this skill produces a complete, shippable tool with docs updated.
---

# Build a KitFolio Tool (end-to-end)

Goal: the user describes a feature in one or two sentences, and you ship a **complete, indexable, bilingual tool** without further hand-holding. This skill is the execution runbook. For the go/no-go gate use `/new-tool`; for deep copy review use `/seo`, `/aeo`, `/branding`.

> **Key architectural fact:** the hub card, search index, sitemap, JSON-LD, OG metadata, and Related Tools are all **auto-generated from the registry** (`app/lib/content.ts`). You never hand-add a hub button · you add a registry entry with `ready: true` and the card appears. So "add a hub button" = "add the registry entry correctly".

---

## What every tool needs (the 7 deliverables)

For a tool with slug `<slug>` and component `<Comp>`:

1. **Registry entry** → append to `TOOLS` in `app/lib/content.ts` (the Single Source of Truth)
2. **Component** → `app/components/<Comp>.tsx` (`"use client"`, the actual tool UI)
3. **Work-area styles** → add tool-specific CSS to `app/globals.css` (common `.kf-*` styles already exist; the input/output area is tool-specific)
4. **KO route** → `app/<slug>/page.tsx` + `app/<slug>/opengraph-image.tsx`
5. **EN route** → `app/en/<slug>/page.tsx` + `app/en/<slug>/opengraph-image.tsx`
6. **Verify** → typecheck/build; confirm hub card, sitemap, JSON-LD all picked it up automatically
7. **Docs** → append the tool to the feature-list tables in `README.md` and `CLAUDE.md` (this is NOT auto-generated: see Step 6)

Auto-derived (do NOT edit by hand): hub card (`Hub.tsx`), sitemap (`sitemap.ts`), JSON-LD (`toolJsonLd`), Related Tools (`RelatedTools.tsx`), search index (uses `name`/`card`/`keywords`).

**NOT auto-derived: you must edit by hand:** the feature-list tables in `README.md` and `CLAUDE.md`. These are static docs, not generated from the registry, so a new tool will NOT appear there unless you do Step 6.

---

## Step 0: Decide the shape

From the feature description, fix these before writing code:

- **slug**: flat, 1-depth, kebab-case, matches search intent (e.g. `meeting-cost-calculator`). No category prefix.
- **cat + layout + badge** (they go together):
  | cat | layout | badge string | theme |
  |-----|--------|--------------|-------|
  | `dev` | `ide` | `"IDE / Editor"` | Input → dark output |
  | `design` | `canvas` | `"Canvas"` | Controls → live visual |
  | `text` | `card` | `"Clean SaaS"` | Input + result cards |
- **targets**: one or more of `pm` · `designer` · `developer` · `job-seeker` · `office-worker` · `small-business-owner` (internal tags, not URLs).
- **ico**: a short glyph/character for the card (e.g. `"{ }"`, `"¶"`, `"◧"`), or set `icoClass` for a CSS-drawn icon.
- **relatedTools**: pick 3 existing slugs (usually same `cat` first, then complementary).

If any of the 5 `/new-tool` gate questions fail, stop and flag it instead of building.

---

## Step 1: Registry entry (do this first; it drives everything)

Append one `Tool` object to `TOOLS` in `app/lib/content.ts`, in the section matching its `cat` (`// ── Developer/Design/Text ──`). Set **`ready: true`** (a `ready` tool is what makes the page renderable and the card live).

Fill **every** field for both `ko` and `en`. Copywriting rules are baked in below: follow them as you write, don't write first and review later.

```ts
{
  slug: "<slug>",
  layout: "card" | "ide" | "canvas",
  cat: "dev" | "design" | "text",
  targets: ["..."],
  ico: "<glyph>",          // or icoClass: "ico-..."
  ready: true,
  badge: "<badge string from table>",
  name: { ko: "<국문명>", en: "<English Name>" },   // en = main h1, ko = secondary
  relatedTools: ["slugA", "slugB", "slugC"],
  seo: {
    ko: { title, description, keywords: [...] },
    en: { title, description, keywords: [...] },
  },
  content: {
    ko: { card, description, howItWorks: [s1, s2, s3], aeo: { what, who, how, why } },
    en: { card, description, howItWorks: [s1, s2, s3], aeo: { what, who, how, why } },
  },
  faq: { ko: [ {question, answer}, ... ], en: [ ... ] },   // 4-6 each
  og: {
    ko: { title, subtitle },
    en: { title, subtitle },
  },
}
```

### Field-by-field copy rules (SEO · AEO · branding all live here)

- **`seo.title`**: ~50-60 chars, lead with the primary keyword (e.g. `"Meeting Cost Calculator | Cost per Meeting"`). This is `<title>`.
- **`seo.description`**: ≥150 chars, factual, contains the primary keyword + the "runs in your browser, no login/upload" promise. Reused as meta description.
- **`seo.keywords`**: also feeds the hub search index, so include the real search terms users type, in both languages' arrays as appropriate.
- **`content.card`**: one line for the hub card. Always required (even before `ready`). Plain, benefit-first.
- **`content.description`**: page lead paragraph; usually equals `seo.description`.
- **`content.howItWorks`**: exactly **3** short steps (input → action → output). Rendered as numbered chips.
- **`content.aeo`**: four factual sentences answering **What / Who / How / Why**. `aeoQA()` turns these into questions that include the tool name (e.g. "What is a Meeting Cost Calculator?") for direct AI-query matching, and they also go into the `FAQPage` JSON-LD. Keep them concise and declarative · no marketing voice.
- **`faq`**: 4-6 Q&A per language. Always include a privacy/"is my data sent to a server?" question (answer: everything runs in the browser). Cover the top real questions about edge cases, formats, limits.
- **`og.title` / `og.subtitle`**: short, used for the dynamic 1200×630 OG image and OpenGraph meta. Subtitle = the one-line value prop.

**Tone (see `/branding`):** concise, professional, trustworthy. No hype, no emoji. KO uses Pretendard-style natural Korean; EN is plain and direct. Reinforce speed · usefulness · clarity · "no login / no install / in your browser".

Validate after editing: `slug`, `relatedTools` entries, and `targets` must all be real values; `Tool` type will catch shape errors at build.

---

## Step 2: Component

Create `app/components/<Comp>.tsx`. It is a `"use client"` component that renders `PageHead` → the tool work area → `Faq` → `RelatedTools`. All page copy comes from the registry; only **control microcopy** (button/label text) lives in a local `DICT`.

```tsx
"use client";

import { useState } from "react"; // + useMemo/useEffect as needed
import PageHead from "./PageHead";
import Faq from "./Faq";
import RelatedTools from "./RelatedTools";
import { useLang, useT, type Dict } from "../lib/i18n";

const DICT: Dict = {
  ko: { "x.inputLabel": "입력", /* control labels only */ },
  en: { "x.inputLabel": "Input", /* control labels only */ },
};

export default function <Comp>() {
  const { lang } = useLang();   // language is route-driven; do not add a toggle
  const t = useT(DICT);
  // ...tool logic, all client-side, no server / no paid API / no LLM API...

  return (
    <>
      <PageHead slug="<slug>" />

      <div className="<slug>-work">
        {/* input/output area: theme per layout (see below) */}
      </div>

      <Faq slug="<slug>" />
      <RelatedTools slug="<slug>" />
    </>
  );
}
```

Reference implementations to copy structure/idiom from:
- **card** (text): `CharacterCounter.tsx`
- **ide** (dev): `JsonFormatter.tsx`, `SlackTimestampConverter.tsx`
- **canvas** (design): `CssGradient.tsx`, `TailwindPalette.tsx`

Rules: client-side only; no DB, no paid/LLM APIs, free APIs only; use `common.*` keys (copy/clear/paste/privacy) from i18n `COMMON`; include the privacy line for trust.

---

## Step 3: Work-area styles

The common shell (`.kf-pagehead`, `.kf-faq`, `.kf-related`, hub `.tool` cards) is already styled in `app/globals.css`. The **input/output work area is tool-specific**: add its styles to `app/globals.css` using the design tokens (`--color-blue-gray-*`, `--color-blue-primary-*`). Follow the per-theme color guidance in the root `CLAUDE.md`:
- ide: white input panel + `blue-gray-950` dark output panel
- canvas: white controls + grey checkerboard preview
- card: white input card + result card(s), one primary metric highlighted

Mobile: input min-height 240px, max 600px; stack input-over-output below ~960px.

---

## Step 4: Routes (KO + EN, 4 files)

Page wrappers are thin: metadata + JSON-LD + component. Copy these exactly, swapping `<slug>`/`<Comp>`.

`app/<slug>/page.tsx`:
```tsx
import <Comp> from "../components/<Comp>";
import JsonLd from "../components/JsonLd";
import { buildToolMetadata, toolJsonLd } from "../lib/content";

export const metadata = buildToolMetadata("<slug>", "ko");

export default function Page() {
  return (
    <>
      <JsonLd data={toolJsonLd("<slug>", "ko")} />
      <<Comp> />
    </>
  );
}
```

`app/en/<slug>/page.tsx`: identical but `../../` imports and `"en"`.

`app/<slug>/opengraph-image.tsx`:
```tsx
import { OG_SIZE, toolOgImage } from "../lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "<KO og.title> | Kitfolio";

export default function Image() {
  return toolOgImage("<slug>", "ko");
}
```

`app/en/<slug>/opengraph-image.tsx`: `../../lib/og`, `alt` = EN title, `toolOgImage("<slug>", "en")`.

(No `next.config` change needed unless you're redirecting an old URL.)

---

## Step 5: Hub button & discovery = automatic, then verify

Because `Hub.tsx`, `sitemap.ts`, `toolJsonLd`, and `RelatedTools.tsx` all read the registry, the new tool's **hub card, sitemap entries, JSON-LD, and search indexing appear automatically** once the registry entry exists with `ready: true`. Nothing to wire by hand.

Verify before finishing:
- `npm run build` (or `npx tsc --noEmit` + `npm run lint`) passes: the `Tool` type and routes compile.
- Hub card renders and is searchable (name/card/keywords).
- `/`<slug> and `/en/`<slug> render with PageHead, working tool, About/FAQ tabs, Related Tools.
- OG images generate for both languages.

---

## Step 6: Update the docs (README.md + CLAUDE.md), manual and easy to forget

The hub/sitemap/JSON-LD update themselves, but the **feature-list tables in `README.md` and `CLAUDE.md` are hand-maintained static docs**. A new tool will not show up there on its own. Always do this step before finishing.

Both files contain a "구현된 기능" feature table with the **same 5 columns**:

`| No | 기능명 | KO 경로 | EN 경로 | 기능 요약 |`

- **`README.md`**: section heading `## 구현된 기능 (도구 N종)`
- **`CLAUDE.md`**: section heading `## 구현된 기능 목록 (<date> 기준, 도구 N종)`, placed just above the "도구 로드맵" section.

For the new tool, append **one row to each table**:

| Column | Value |
|--------|-------|
| No | next sequential number (current last + 1) |
| 기능명 | `<국문명> / <English Name>` (= registry `name.ko` / `name.en`) |
| KO 경로 | `` `/<slug>` `` |
| EN 경로 | `` `/en/<slug>` `` |
| 기능 요약 | the registry `content.ko.card` string |

Then **bump the tool count** in both headings (`N종` → `N+1종`), and refresh the date in the CLAUDE.md heading to today.

To regenerate the canonical row data from the registry instead of hand-copying (recommended: keeps it exact and in registry order):

```bash
npx tsx -e '
import { TOOLS } from "./app/lib/content";
const rows=(TOOLS as any[]).filter(t=>t.ready).map((t,i)=>
  `| ${i+1} | ${t.name.ko} / ${t.name.en} | \`/${t.slug}\` | \`/en/${t.slug}\` | ${t.content.ko.card} |`);
console.log(`구현된 기능 (도구 ${rows.length}종)`);
console.log("| No | 기능명 | KO 경로 | EN 경로 | 기능 요약 |");
console.log("|---|---|---|---|---|");
console.log(rows.join("\n"));
'
```

Append the new tool's row to both tables (or replace the whole table body with the regenerated output) and update the `N종` count. Keep README and CLAUDE.md in sync: same rows, same count.

---

## Final checklist

- [ ] Registry entry appended, `ready: true`, all ko+en fields filled
- [ ] `seo.title` keyword-led; `description` ≥150 chars; `keywords` are real search terms
- [ ] `howItWorks` = 3 steps; `aeo` = What/Who/How/Why; `faq` = 4-6 incl. privacy Q
- [ ] `og.title`/`subtitle` set; `relatedTools` = 3 valid slugs; `targets` valid
- [ ] Component created, `PageHead` + work area + `Faq` + `RelatedTools`, client-side only
- [ ] Work-area CSS added to `globals.css` with design tokens, correct theme
- [ ] 4 route files created (KO/EN page + KO/EN opengraph-image)
- [ ] Build/typecheck/lint pass; hub card, sitemap, JSON-LD auto-picked-up
- [ ] **Docs updated**: new row appended to the feature table in BOTH `README.md` and `CLAUDE.md`, tool count (`N종`) bumped, CLAUDE.md date refreshed
