---
title: Ad Metrics Made Simple | Following One Campaign All the Way Through
description: Instead of defining ROAS, CPA, CPC, CPM and CTR one by one, this walks a single campaign from impressions to revenue with real numbers, showing where each metric comes from and which one points at the actual problem.
date: 2026-08-06
updated: 2026-08-18
reviewedAt: 2026-08-18
cover: /blog/ad-metrics-explained.png
coverAlt: Illustration representing advertising performance metrics
relatedTools: roas-calculator, cpa-calculator, ctr-calculator, funnel-conversion-calculator
tags: marketing, advertising, metrics
---

Open an ad report and ROAS, CPA, CPC, CPM and CTR all arrive at once. Memorizing the definitions does not help much, because the question you actually face is "should we keep running this?" and it is not obvious which number answers it.

These five are not independent measures. They are **five coordinates on a single flow**. Follow one campaign from impression to revenue and the relationships fall into place.

## One campaign, end to end

A campaign that spent 3,000,000 over a month.

| Stage | Result | Metric it produces |
|---|---:|---|
| Impressions | 500,000 | CPM 6,000 |
| Clicks | 6,000 | CTR 1.2% · CPC 500 |
| Conversions | 120 | CVR 2% · CPA 25,000 |
| Revenue | 12,600,000 | ROAS 420% |

Every one of them is a division.

- **CPM** = 3,000,000 ÷ 500,000 × 1,000 = **6,000**: cost per thousand impressions
- **CTR** = 6,000 ÷ 500,000 = **1.2%**: share of viewers who clicked
- **CPC** = 3,000,000 ÷ 6,000 = **500**: cost per click
- **CPA** = 3,000,000 ÷ 120 = **25,000**: cost per conversion
- **ROAS** = 12,600,000 ÷ 3,000,000 = **420%**: revenue per unit of spend

Each has its own tool: the [ROAS calculator](/en/roas-calculator), [CPA calculator](/en/cpa-calculator) and [CTR calculator](/en/ctr-calculator), with the [funnel conversion calculator](/en/funnel-conversion-calculator) for seeing drop-off stage by stage.

## Is this campaign actually profitable?

At 420%, ROAS looks healthy. But ROAS is measured on **revenue**, before cost of goods, fees and shipping. Profitability needs the contribution margin.

```
Break-even ROAS = 1 ÷ contribution margin
```

At a 25% margin, break-even ROAS is **400%**. This campaign's 420% is barely above the line. The same check in CPA terms is more intuitive: average order value is 105,000 (12,600,000 ÷ 120), a 25% margin leaves 26,250 of profit per conversion, and CPA is 25,000: so each conversion nets 1,250.

**Reporting "we hit 400% ROAS" without knowing the margin can dress up a losing campaign as a win.** Derive the target ROAS from your margin before the campaign launches, not after.

## When the numbers get worse, where do you look?

This is where treating the metrics as one flow earns its keep. If CPA rose, the cause sits somewhere upstream.

- **CPM rose**: competition increased or your targeting is too narrow. That is a bidding and audience problem, not a creative one.
- **CTR fell**: the creative is fatigued from repeated exposure, or the message does not fit the audience. This is the signal to refresh creative.
- **CTR and CPC held steady but conversion rate fell**: the problem is in the **landing page or the product**, not the ad. No amount of creative testing will fix it.

Watching CPA alone cannot distinguish these three cases, which is exactly why all five belong in the same report.

## Common mistakes

**Adding up ROAS across channels.** The same order gets credited in multiple places, so summing channel ROAS inflates the total. Channel ROAS is for comparing channels, not for aggregating.

**Ignoring differences in the attribution window.** "Purchase within 7 days of a click" and "purchase within 1 day of an impression" produce entirely different numbers. Platform defaults differ, so comparing without aligning them can reverse which channel looks better.

**Judging prospecting campaigns on the first purchase.** Where customers buy again, new-customer campaigns show structurally low ROAS. They need to be evaluated against lifetime value as well.

**Treating CTR as a performance metric.** CTR is a diagnostic for how compelling the creative is, not a measure of success. Pushing CTR up with sensational creative often raises clicks while conversion rate falls, leaving CPA worse than before.

## What these metrics cannot tell you

- **Incrementality**: revenue that would have happened anyway, such as branded search, is not filtered out of ROAS. Measuring true contribution requires an experiment that turns the campaign off.
- **Early data**: a CPA computed on fewer than ten conversions is mostly chance. Waiting for 30 to 50 is far more reliable.
- **Brand awareness campaigns**: if revenue is not the objective, ROAS is the wrong lens entirely. Set reach and frequency targets that match the actual goal.

Connecting the metrics into one flow lasts much longer than memorizing them, because it tells you where to look the moment a number moves.
