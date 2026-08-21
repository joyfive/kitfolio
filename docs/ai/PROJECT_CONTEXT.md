# KitFolio Project Context

> **KitFolio is a browser-based collection of practical micro SaaS tools for modern knowledge workers.**
>
> **The tool is the product. Text exists only to improve discoverability through SEO and AEO.**
>
> **Prefer many small, focused utilities over a few complex applications.**

## Overview

KitFolio is a browser-based micro SaaS collection for modern knowledge workers.

Brand message:
> Small tools for modern knowledge workers

Supporting message:
> Work calculators, generators and utilities.

The goal is to provide practical utilities that solve small but recurring problems in work and daily professional activities.

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
- Homepage acts as a discovery hub
- Individual tool pages are primary SEO landing pages

## Design System
Only three layouts exist:
1. Card
2. IDE
3. Canvas

Avoid introducing additional layouts unless absolutely necessary.

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
