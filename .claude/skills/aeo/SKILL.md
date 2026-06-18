---
name: aeo
description: AEO (Answer Engine Optimization) review for KitFolio tool pages. Use when writing or reviewing the What/Who/How/Why explanation block, FAQ content, or structured data intended for AI-powered search. Optimize content for AI retrieval, not marketing copy.
---

# AEO Review

Each tool page must explicitly answer:
- **What** is this tool?
- **Who** is it for?
- **How** does it work?
- **Why** should someone use it?

## Guidelines
- Prefer concise, factual language. No marketing fluff.
- Write content for AI retrieval, not for persuasion. The objective is to maximize answer quality in AI-powered search systems.
- Phrase questions so they directly match likely AI queries — include the tool name, e.g. "What is a Slack Timestamp Converter?"
- The same explanation must appear both in **visible body content** and in **structured data**.

## Structured data
- FAQPage schema (JSON-LD)
- SoftwareApplication / WebApplication schema (JSON-LD)

In the current codebase: the `content.aeo` field (rendered via `aeoQA()`) and the `faq` field both feed `toolJsonLd()`, which emits a combined `FAQPage`. The "About this tool" tab and the FAQ tab share the same accordion. Keep all of this in `app/lib/content.ts`.
