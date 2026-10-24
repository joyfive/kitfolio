---
name: new-tool
description: Checklist and required structure for adding a new KitFolio tool. Use when the user wants to add, scaffold, design, or evaluate a new tool/utility, or asks "should we build X". Enforces the build criteria, the ko/en content registry, FAQ/AEO/OG/JSON-LD requirements, and the three-layout rule.
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
- FAQ (4-6 questions, see `docs/ai/CONTENT_POLICY.md`)
- AEO block: What / Who / How / Why
- Related tools
- OG metadata (unique per tool)
- JSON-LD (WebApplication + FAQPage)

## Layout: choose exactly one
- **Card**: Input → Result
- **IDE**: Input → Transform → Output
- **Canvas**: Controls → Live Visual Output

Do not invent new layout types.

## Implementation footprint (current codebase)
- `app/<slug>/page.tsx` (KO) + `app/en/<slug>/page.tsx` (EN) + `app/components/<Tool>.tsx`
- Add the registry entry in `app/lib/content.ts` (seo / content / faq / og) and flip `ready: true`
- Control microcopy lives in the component's local `DICT`, not the registry
- Append `<Faq slug="..." />` at the end of the component
- Layout is chosen by the work (text transform = IDE, live visual = Canvas, form → results = Card), **not** by category. Category is chosen by the problem solved (`/build-tool` Step 0.5), never by job title or layout.

## Classification gate
- If the tool fits none of the 8 categories, stop and propose a new one to the user instead of forcing it.
- Action tags are fixed at 7 (계산·변환·생성·편집·검사·분석·읽기). Never add one; if none fits, stop and ask.

All user-facing copy is centralized in `app/lib/content.ts`. Never hardcode copy in page components.
