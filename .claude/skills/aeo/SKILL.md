---
name: aeo
description: Review Kitfolio tool explanations, visible FAQ and structured data for clear, factual answers in Korean and English.
---

# AEO Review

Write clear answers within the renewed detail page structure. Review both locales.

- **What** does it do? Name the result in the title and short introduction.
- **Who** needs it? Describe a concrete task in the guide use case.
- **How** do they get the result? Use steps that match the live controls and an input-to-result example.
- **Why** does the distinction matter? Explain interpretation, tradeoffs or limitations in Background when useful.

## Visible answers and structured data

Use FAQ for blockers, errors and exceptions. Keep every answer available through the on-page FAQ. Compare the displayed questions and answers with the `FAQPage` entries from `toolJsonLd()` for both languages. Keep `WebApplication` metadata factual and consistent with the tool.

`content.aeo` is editorial data retained for the indexable content check. The standalone About tab was removed, and those four editorial answers do not appear as additional FAQ schema. See [the page content design](../../../docs/plans/tool-page-content-design.md).
