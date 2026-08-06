---
title: The Power of Compounding — Compound Growth and Future Value
description: The difference between simple and compound growth, why compound growth and future-value projection are really the same calculation, and how rate and time change the outcome dramatically — with examples.
date: 2026-08-03
cover: /blog/compound-growth-future-value.png
coverAlt: Illustration of a compound growth curve
relatedTools: compound-growth-calculator, cagr-calculator, growth-rate-calculator
tags: growth, compounding, forecasting
---

It's easy to think "growing 5% a month means 60% more after a year." It doesn't. Compounded, it's about **79.6%**. That gap is the power of compounding, and it's the heart of growth forecasting.

## Simple vs. compound

**Simple growth** adds the same amount each period, always based on the starting value. From 100, adding 10 a month gives 220 after a year.

**Compound growth** applies each period's growth to the **accumulated total so far**. From 100 growing 10% a month, the second month adds 10% of 110, the third adds 10% of 121. Growth stacks on growth.

> **Final value = Initial × (1 + rate/100) ^ periods**

The longer the horizon and the higher the rate, the more dramatically simple and compound growth diverge. That's why compounding is emphasized so heavily in long-term investing and business growth.

## "Compound growth" and "future value" are the same calculation

The two phrases differ only in context; the formula is identical.

- **Compound growth** — an initial 10,000 growing 8% a year for 10 years is worth how much?
- **Future value** — this month's 5,000 users growing 6% a month become how many in a year?

Both are solved by `initial × (1 + rate/100)^periods`. Put a principal in the initial-value field and you get a compound final value; put a current business metric there and it becomes a future projection (a growth scenario).

## Small differences, big outcomes

With compounding, small changes in rate and time change the result a lot. Starting from 10,000:

- 7% a year, 10 years → about 19,672
- 10% a year, 10 years → about 25,937
- 10% a year, 20 years → about 67,275

A 3-point difference, or an extra 10 years, multiplies the final value. So when building growth scenarios, it helps to enter **optimistic, base, and conservative** rates and view the range of outcomes together.

## Things to watch

- It assumes a **constant rate every period**. If real growth varies, split the horizon into segments and calculate each.
- A negative rate models **compound decline**, shrinking by a fixed percentage each period — useful for churn-driven user decline or depreciation.
- Match the period unit to the rate. A monthly rate needs periods in months.

## CAGR — past growth as a single number

If the calculation above looks forward, sometimes you instead want to summarize **what average annual rate already-realized growth came out to**. That's CAGR (Compound Annual Growth Rate). It needs only a start value, end value, and number of periods, and it's the standard way to fairly compare the long-run growth of different investments or businesses.

To try the numbers, use the [Compound Growth Calculator](/en/compound-growth-calculator) for future value and the [CAGR Calculator](/en/cagr-calculator) for a past annual rate. For a single-period change, the [Growth Rate Calculator](/en/growth-rate-calculator) is the quickest.
