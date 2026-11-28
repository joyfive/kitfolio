# KitFolio Project Context

> **KitFolio is a collection of small web tools to calculate, convert, create and check, all running in the browser.**
>
> **The tool comes first. Guide, FAQ, and background help users complete the task and understand the result.**
>
> **Prefer many small, focused utilities over a few complex applications.**

## Overview

KitFolio is a collection of small web tools to calculate, convert, create and check.

Brand message (2026-10-24):
> Find the tool. Get back to work. (필요한 도구를 찾아, 하던 일을 계속하세요.)

Core user: anyone who wants a result now, without installing software or starting a complicated workflow. The site is not targeted at a list of job titles; roles appear only as use cases inside individual tools.

Value: easy to find, short to use, result usable right away.

## Product Principles
- Browser-first
- No installation
- No login required
- Client-side processing whenever possible
- Fast and focused UX
- One tool = one clear problem

## Information Architecture
- Flat 1-depth URL structure
- Every tool has its own landing page
- Homepage acts as a discovery hub: search → topic category (1st-level chip) → action tag (2nd-level chip)
- Individual tool pages are primary SEO landing pages
- 8 topic categories (one per tool): Docs & Images · QR Codes · Date & Time · Work Hours & Leave · Pay & Tax · Ads & Growth · Code & Web · Web Accessibility
- 7 action tags (1 primary + up to 2): calculate · convert · generate · edit · check · analyze · read
- Hub filter state is a query string (`/?cat=&action=`), never a path
- Classification is by the problem solved, never by job title or layout. Procedure: `/build-tool` Step 0.5; mapping: `docs/plans/taxonomy-recategorization.md`

## Design System
Only three layouts exist:
1. Card
2. IDE
3. Canvas

Avoid introducing additional layouts unless absolutely necessary. Layout is chosen by the work and is independent of category.

Visual language (2026-11-27): Toss (TDS) style on the unchanged Kitfolio palette. Flat white cards with no border or shadow (20px radius), filled gray fields (52px), 48px buttons with a `scale(.96)` press, gray-track segmented controls, weight 700 for titles only and 600 for UI. Never import Toss hex values. Source of truth: CLAUDE.md, tokens in `app/globals.css`.

Work-area layout (2026-11-28): on desktop the preview/result sits on the left and the input on the right; on mobile the input is on top and the result below. DOM order is input-first; two-column containers are flipped on desktop only via the `direction: rtl` list at the end of `globals.css` (register new work containers there).

## Localization
Tool content is managed in `app/lib/content.ts`. Bilingual guide situations live in `app/lib/tool-guide-context.ts`, guide figures (numbered UI mockups with matching notes) in `app/lib/guide-figures/`, and control labels live in localized UI data.
Supported locales:
- ko
- en

Every new tool must provide both language sets.

## Usage guide figures
Each tool's usage guide is a redrawn slice of its work area with numbered markers and matching numbered notes (`GuideFigure`, data in `app/lib/guide-figures/`). Hard rule: whenever a tool page is created or changed (labels, inputs, tabs or modes, defaults, formulas, rates, results), update its ko/en figure in the same change with `/tool-guide`. Tests check that figures exist and are well formed, not that labels and values still match the screen, so reviewers check that. If a change to a component, `DICT`, engine or policy data leaves the figure untouched, say why in the commit message.

## Content Philosophy
The detail page follows Tool → Guide → FAQ → Background. Use `/build-tool` and the [detail page design](../plans/tool-page-content-design.md) to add both languages. Keep the on-page FAQ and FAQPage structured data aligned.

## Core Rule
Never optimize for content production. Always optimize for solving a real user problem.

## Related working skills
- `/build-tool`: end-to-end runbook for a new tool page
- `/tool-guide`: write or update a tool's guide figure (new tools and every change to an existing tool's screen)
- `/new-tool`: checklist + required structure for adding a tool
- `/product-review`: product-direction / scope review
- `/branding`: branding & tone guardrails
- `/seo`: SEO review checklist
- `/aeo`: AEO review checklist

The authoritative, detailed Korean spec lives in the root `CLAUDE.md`. This document is the concise English context for AI agents. There is no separate `AGENTS.md`: change `CLAUDE.md` first, then mirror the change here and in the affected skills.
