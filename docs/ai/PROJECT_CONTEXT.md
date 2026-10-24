# KitFolio Project Context

> **KitFolio is a collection of small web tools to calculate, convert, create and check, all running in the browser.**
>
> **The tool is the product. Text exists only to improve discoverability through SEO and AEO.**
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

## Localization
All user-facing content is managed centrally (`app/lib/content.ts`).
Supported locales:
- ko
- en

Every new tool must provide both language sets.

## Content Philosophy
KitFolio is NOT a CMS. Text exists only to support:
- SEO
- AEO
- Tool explanation

The tool itself is the product.

## Core Rule
Never optimize for content production. Always optimize for solving a real user problem.

## Related working skills
- `/new-tool`: checklist + required structure for adding a tool
- `/product-review`: product-direction / scope review
- `/branding`: branding & tone guardrails
- `/seo`: SEO review checklist
- `/aeo`: AEO review checklist

The authoritative, detailed Korean spec lives in the root `CLAUDE.md`. This document is the concise English context for AI agents.
