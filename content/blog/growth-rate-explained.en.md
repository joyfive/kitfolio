---
title: Growth Rate, Fully Explained — Percentage Change, MoM, YoY, QoQ, WoW
description: Why growth rate and percentage change are really the same calculation, how MoM, YoY, QoQ, and WoW differ, and how to read growth correctly while avoiding the common traps — with worked examples.
date: 2026-08-06
cover: /blog/growth-rate-explained.png
coverAlt: Illustration representing the concept of calculating a growth rate
relatedTools: growth-rate-calculator, cagr-calculator, compound-growth-calculator
tags: growth, metrics, data
---

"How much did it grow since last month?" is a question that comes up several times a day at work. Revenue, visitors, sign-ups, conversions — anywhere there are numbers, we ask how much they changed. Yet the moment you try to calculate it, terms like growth rate, percentage change, MoM, and YoY start to blur together. This article shows that most of these are actually **one calculation**, and lays out how to read growth correctly in practice.

## Growth rate is really one formula

Growth rate, percentage change, percent increase, percent decrease — the names differ, but the math is identical.

> **Growth rate (%) = (Current − Previous) ÷ Previous × 100**

If last month's revenue was 10,000 and this month's is 12,500, then (12,500 − 10,000) ÷ 10,000 × 100 = **+25%**. A positive result is usually called an increase and a negative one a decrease, but the calculation is the same. That's why you don't need a separate "increase calculator" and "decrease calculator" — one growth-rate calculation covers both.

The key is **what you use as the previous value**. Change the baseline and the same numbers can tell a completely different story.

## MoM, YoY, QoQ, and WoW only differ by period

These abbreviations sound technical, but they're all the same growth-rate calculation. The only difference is **which two points in time you compare**.

- **MoM (Month over Month)** — this month vs. last month. For short-term trends and campaign effects.
- **YoY (Year over Year)** — this year vs. the same period last year. Removes seasonality to show real growth.
- **QoQ (Quarter over Quarter)** — this quarter vs. last quarter. Common in earnings reports.
- **WoW (Week over Week)** — this week vs. last week. Early signal for fast-moving metrics.

So if this month has 12,500 users and last month had 10,000, MoM growth is +25%. Use last year's number for YoY, quarterly numbers for QoQ. **One calculator is enough; you just attach the right label for the context.**

### Why YoY matters

Many businesses are seasonal. Retail peaks at year-end; travel peaks in summer. Looking only at MoM, "up 30% in December!" doesn't tell you whether that's real growth or just the season. YoY compares the same month a year earlier, cancelling seasonality and revealing **the true direction of the trend**. That's why practitioners read MoM and YoY together.

## Traps when reading growth

### 1. The small-base illusion

When the previous value is small, the growth rate inflates easily. Going from 2 users to 4 is +100%, but it doesn't mean much. Going from 1,000,000 to 1,010,000 is only +1%, yet the absolute change is far larger. **Early-stage growth rates can look huge simply because the base is small**, so always read the growth rate alongside the absolute number.

### 2. You can't divide by zero

If the previous value is 0, the growth rate is undefined. "Went from 0 to 100" isn't infinite growth — it's better described as simply "new."

### 3. Percentages are asymmetric

A 50% drop followed by a 50% rise does not return you to the start: 100 → 50 (−50%) → 75 (+50%). Consecutive percentage changes can't just be added or cancelled. To measure cumulative growth across periods, you need the compounding idea below.

## Across multiple periods: compounding and CAGR

When you deal with **growth across several periods** rather than a single change, things shift. Growing 10% a year for three years isn't a simple 30% — it's 1.1 × 1.1 × 1.1 ≈ 1.331, or **+33.1%**, because each period's growth stacks on the previous result. This is compound growth.

If you want to summarize multi-year growth as a single "average per year" figure, use **CAGR (Compound Annual Growth Rate)**. It needs only a start value, end value, and number of periods, and it's the standard way to compare investment returns or long-run revenue growth.

## A practical checklist

- Before quoting a growth rate, be clear about **what the baseline (previous value) is**.
- For seasonal metrics, read **MoM and YoY together**.
- Show the **growth rate and the absolute number side by side** to avoid the small-base illusion.
- Compute cumulative multi-period growth as **compounding**, not a simple sum.

To check a few numbers quickly, drop a previous and current value into the [Growth Rate Calculator](/en/growth-rate-calculator). It returns the growth rate along with the difference and multiplier, and for multi-year growth you can continue with the [CAGR Calculator](/en/cagr-calculator) or [Compound Growth Calculator](/en/compound-growth-calculator).
