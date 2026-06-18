# Content Policy

Operating principles for all user-facing text.

- All text is managed in the central registry (`app/lib/content.ts`). Never hardcode copy in page components.
- Every new tool must ship ko **and** en content sets together.
- Include only SEO/AEO-purposed explanation. Avoid long blog-style content.
- FAQ: 4–6 entries per tool by default.
- Keep `How it works`, `What`, `Who`, `Why` information in a consistent structure across all tools.

## Microcopy exception
UI microcopy (feature/button/input labels) is **excluded** from the content registry:
- Global shared strings (header nav, footer, copy/clear buttons) → `lib/i18n.tsx` `COMMON`
- Per-tool control labels → the component's local `DICT`

## Related skills
See `/aeo` and `/seo` for the review checklists that consume this policy.
