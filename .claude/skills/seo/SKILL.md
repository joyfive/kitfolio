---
name: seo
description: SEO review checklist for KitFolio tool pages. Use when writing or reviewing page metadata, titles, descriptions, canonical/hreflang, internal links, or search-intent targeting. Each tool page targets one primary search intent; the homepage must not compete with tool pages.
---

# SEO Review

Each tool page should target **one** primary search intent.

## Checklist
- Unique title
- Unique description (min ~150 chars)
- FAQ
- Related tools (internal links)
- Structured metadata (JSON-LD)
- OG metadata (unique per tool)
- Internal links
- Canonical URL
- `hreflang` (ko-KR / en-US / x-default)
- H1 matches the search intent

## Principles
- The homepage is a discovery hub, **not** an SEO landing page. It should not compete with tool pages.
- Tool pages are the SEO entry points. Users search "Character Counter" or "Aspect Ratio Calculator", not "KitFolio".
- Growth = more indexed tool pages × strong long-tail intent × internal linking.

Metadata, titles, descriptions, and keywords all live in `app/lib/content.ts`. Edit the registry, not the page components.
