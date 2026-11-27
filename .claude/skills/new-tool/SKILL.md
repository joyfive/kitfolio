---
name: new-tool
description: Checklist and required structure for adding a new KitFolio tool. Use when the user wants to add, scaffold, design, or evaluate a new tool/utility, or asks "should we build X". Enforces the build criteria, the bilingual tool-first page structure, guide, FAQ, background, OG and JSON-LD requirements, and the three-layout rule.
---

# New Tool Checklist

Before implementing a new tool, evaluate (all must be "yes"):

1. Does it solve a real recurring problem?
2. Does it give a result someone can use right away, without installing anything or starting a complicated workflow?
3. Is there search demand?
4. Can it run entirely in the browser? (no server, no paid/LLM APIs)
5. Can it be completed within one day?

> Prefer a practical, focused tool over a generic utility. See `/product-review` and `docs/ai/TOOL_SELECTION.md` for scoring.

## Required structure for every tool

Each tool must include:
- `slug` (flat 1-depth route, e.g. `/aspect-ratio`)
- classification: exactly one topic `category` (hub 1단), 1-3 `actions` from the fixed 7 (hub 2단, primary first), `searchTerms` (procedure: `/build-tool` Step 0.5)
- ko **and** en content (both locales mandatory)
- metadata (title / description / keywords)
- Tool → Guide → FAQ → Background in each locale. The guide needs a real use case, a guide figure (redrawn work area + numbered markers + matching notes, written with `/tool-guide`), 2-4 actionable steps and at least one worked input-to-result example. Background explains how to interpret the result, including relevant limits and sources.
- FAQ for real blockers and exceptions, generally 4-6 questions. The editorial `aeo` fields support the indexable-tool check. See `docs/ai/CONTENT_POLICY.md` for what appears on the page.
- Related tools
- OG metadata (unique per tool)
- JSON-LD (WebApplication + FAQPage)

## Layout: choose exactly one
- **Card**: Input → Result
- **IDE**: Input → Transform → Output
- **Canvas**: Controls → Live Visual Output

Do not invent new layout types.

## Page or mode tab?
A tool is **one standalone URL page** (`/<slug>` + `/en/<slug>`). Each page automatically gets a hub card, sitemap entries, metadata and WebApplication/FAQ JSON-LD; nothing else is hand-wired (`npm test` → `routes.test.ts` enforces it).
- New search intent + its own guide/examples/FAQ → **new page**.
- Same component and structure, only a different formula/unit/operation → **`?mode=` tab on the existing page** (no new card, no sitemap entry). This is how CSS units, ad metrics, PDF tools, VAT, annual leave and freelancer modes work.

## Implementation footprint (current codebase)
- `app/<slug>/page.tsx` (KO) + `app/en/<slug>/page.tsx` (EN) + `app/components/<Tool>.tsx`
- Add the registry entry in `app/lib/content.ts` (seo / content / faq / og) at the end of its category block and add the bilingual use case in `app/lib/tool-guide-context.ts` and the guide figure in `app/lib/guide-figures/` before setting `ready: true`.
- Control microcopy lives in the component's local `DICT`, not the registry
- Render `PageHead → tool work area → ToolGuide → RelatedTools`. `ToolGuide` renders the shared Guide, FAQ, and Background via `ToolSupport`. The guide is a redrawn slice of the work area with numbered markers, then the same numbers explained below (`GuideFigure`). For multi-mode tools, pass the current example from the tool state.
- Layout is chosen by the work (text transform = IDE, live visual = Canvas, form → results = Card), **not** by category. Category is chosen by the problem solved (`/build-tool` Step 0.5), never by job title or layout.

## Classification gate
- If the tool fits none of the 8 categories, stop and propose a new one to the user instead of forcing it.
- Action tags are fixed at 7 (계산·변환·생성·편집·검사·분석·읽기). Never add one; if none fits, stop and ask.

Keep general tool copy, examples and FAQ in the registry. Put the guide use case in `app/lib/tool-guide-context.ts`, UI labels in the component’s bilingual `DICT`, and mode-specific guide copy in the tool’s bilingual data. Follow [the page content design](../../../docs/plans/tool-page-content-design.md) and the `/build-tool` runbook.

## Changing an existing tool
Any change to what the user sees or does on a tool page (labels, inputs, tabs or modes, defaults, results, buttons) must update that tool's guide figure in the same change. Run `/tool-guide`; its table lists what to re-check per change.
