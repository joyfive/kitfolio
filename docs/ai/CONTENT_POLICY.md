# Content Policy

Write Korean and English content together for every tool. Follow the [detail page design](../plans/tool-page-content-design.md).

| Area | What it answers | Where to write |
| --- | --- | --- |
| Tool | What can I do and get here? | `content.card` and the live workspace. Keep warnings beside the relevant control or result. |
| Usage guide | Where do I start, what do I do, and what will I get? | A specific bilingual situation in `app/lib/tool-guide-context.ts`, 2-4 real steps in `content.howItWorks` and a verified input/result example in `content.examples`. |
| FAQ | What might block me, and what can I do? | `faq` in `app/lib/content.ts`. Usually 4-6 distinct questions. Use the same visible entries in FAQPage JSON-LD. |
| Background | How should I interpret or compare the result? | `content.guide`, `limitations`, and relevant primary `sources` plus `verifiedAt`. Link to an existing related article where appropriate. |

Use factual copy. Instructions should match the visible labels and selected mode in each language. Keep `content.aeo` as editorial data for the indexable validation. Place useful information from it in the relevant page section.

Shared UI strings live in `app/lib/i18n.tsx` (`COMMON`). Per-tool control labels and mode-specific guide copy belong in the tool’s bilingual data or local `DICT`. See `/build-tool` for implementation and `/aeo` and `/seo` for review.
