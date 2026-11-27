---
name: tool-guide
description: Write or update the usage guide figure of a KitFolio tool page · a redrawn slice of the real work area with numbered markers, then the same numbers explained below (GuideFigure). Use when building a new tool (called from /build-tool), and whenever an existing tool page changes what the user sees or does · labels, inputs, tabs or modes, defaults, results, buttons, upload flow · or when the user asks to fix, add or improve a tool guide, e.g. "가이드 보완해줘", "가이드도 고쳐줘", "update the guide".
---

# Tool Guide Figure (create · update)

Every tool detail page shows its usage guide as a **figure**: a few parts of the real work area redrawn as a static mock, numbered markers ① ② ③ on the parts the user touches or reads, a one-line caption, then a numbered list that explains each marker. The guide sits between the tool and the FAQ (`ToolGuide` → `ToolSupport` → `GuideFigure`).

The figure is a picture. It is `aria-hidden`, so **the numbered notes must carry all the information on their own.**

## When this skill must run

| Change | What to do |
|---|---|
| New tool page | Write ko + en figures (Step 1 to 4). `/build-tool` sends you here. |
| A label, tab, mode, option or button text changes | Update the same text in the figure parts and note titles. |
| An input is added, removed or reordered | Re-check which parts the figure shows and their marker order. |
| A default value, formula, rate or policy changes the result | Recompute every value shown in the figure with the engine. |
| A new `?mode=` tab whose screen differs a lot | Usually mention it in the tab marker's note. Only if the work area is a different screen, add a variant (see below). |
| Copy-only change in the registry | No figure change, unless the note quotes that copy. |

If you change a tool component and skip the figure, the page ships a guide that no longer matches the screen. Treat the figure as part of the component.

## Where it lives

- Data: `app/lib/guide-figures/<category file>.ts` as `"<slug>": { ko, en }`
  - `docs` (문서·이미지 · QR) · `time-work` (날짜·시간 · 근무·휴가) · `pay` (급여·세금) · `marketing` (광고·성과) · `web` (코드·웹 제작) · `a11y` (웹 접근성)
- Types and the part vocabulary: `app/lib/guide-figures/types.ts`
- Registry and lookup: `app/lib/guide-figures/index.ts` (`GUIDE_FIGURES`, `FIGURE_VARIANTS`, `guideFigure()`)
- Renderer and styles: `app/components/GuideFigure.tsx`, `.kf-gfig-*` in `app/globals.css`
- Test: `app/lib/__tests__/guide-figures.test.ts`

Do not add new part types or styles for one tool. Compose from the existing parts.

## Step 1: Read the real screen

1. Open the component and its bilingual `DICT`. Copy labels **exactly** (KO from `ko`, EN from `en`). Do not translate UI text yourself.
2. Run the tool (or its engine in `app/lib/<tool>/`) with the registry's first example (`content.<lang>.examples[0]`). Use those inputs and the **computed** outputs in the figure, so the figure, the example box below it and the real tool agree.
3. Never invent numbers. Verify them with a quick script, e.g. `npx tsx -e 'import {calc} from "./app/lib/<tool>/calculator"; console.log(calc({...}))'`.

## Step 2: Choose the parts and markers

Pick the smallest slice that answers "where do I start, what do I do, what will I get".

- 2 to 5 markers. Usually: ① mode or tab (if any) → ② main input → ③ secondary setting → ④ result or action.
- Markers run 1, 2, 3 … from top to bottom. One marker per part. Unmarked parts are allowed for context (for example a breakdown under the result).
- Part vocabulary (`t`): `heading` · `tabs` · `field` · `fields` (2-3 inputs in a row) · `text` (textarea, `mono` for code) · `drop` · `check` · `chips` · `slider` · `result` (the one primary metric) · `stats` · `rows` (label/value list, `tone: ok | warn | bad`) · `code` (dark IDE panel, optional `tabs`) · `swatches` · `preview` · `pages` (PDF thumbnails, `on | off | turn`) · `buttons` (`primary` index, `-1` for none).
- Keep values short enough for a 280px-wide card. Long text is cut with an ellipsis in `field`, but wraps in `text` and `code`.

## Step 3: Write caption and notes

- `caption`: one sentence that states the whole flow ("…를 넣으면 …가 나옵니다." / "Enter … to see …").
- `notes[i]` explains marker `i + 1`: `{ title, body }`, rendered as **title**: body.
  - `title`: the on-screen label (or a short name for the area).
  - `body`: 1-2 sentences. What to enter or choose, how to decide, and what to check. Include the non-obvious rule (basis, rounding, limits, privacy) that the user needs at that step.
- Tone follows the site: KO `~하세요 / ~합니다`, EN plain imperative. Follow `/branding`.
- Punctuation rules from `CLAUDE.md`: no em dash or en dash. Use `:` `·` `~` (KO ranges) and `-` (EN ranges).
- ko and en describe the **same screen**: same parts, same order, same markers (the test compares them). Wording can differ.

## Step 4: Variants (rare)

Only when tabs switch to a genuinely different work area (today: PDF merge, split, rotate, delete pages):

1. Add `"<slug>/<mode>": { ko, en }` entries.
2. List the modes in `FIGURE_VARIANTS["<slug>"]`.
3. Pass the current mode where the guide renders: `guideFigure(slug, lang, mode)`.

Otherwise keep one figure, show the tab bar as marker ①, and explain the modes in its note. Mode-specific worked examples still go through `ToolGuide`'s `exampleIndex` / `currentExample`.

## Step 5: Verify

```
npm test                    # guide-figures.test.ts: every published tool has ko+en, markers 1..n, notes = markers, ko/en same shape
npx tsc --noEmit
```

Then look at it (production build or dev server), both locales:

- 360px and 1280px: no horizontal overflow, markers line up with their parts, no part wraps awkwardly (for example swatches or tabs).
- Each label in the figure matches the live work area above it, and each value matches what the tool shows for the same input.
- The example box under the figure uses the same scenario.

## Checklist

- [ ] Labels copied from the component `DICT` (ko and en)
- [ ] Values computed by the engine, matching `examples[0]`
- [ ] 2-5 markers, top to bottom, notes = markers
- [ ] Caption plus notes readable without the figure
- [ ] ko/en same structure; no em/en dash
- [ ] Tests and a 360/1280 visual check passed in both locales
