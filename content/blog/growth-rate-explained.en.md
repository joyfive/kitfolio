---
title: Growth Rate, Fully Explained | Five Ways Reports Get It Wrong
description: Why growth rate, percentage change, MoM, YoY, QoQ and WoW are all one calculation, shown with real numbers, plus the traps that keep appearing in reports: asymmetric percentages, percent versus percentage points, and tiny denominators.
date: 2026-08-06
updated: 2026-08-18
reviewedAt: 2026-08-18
cover: /blog/growth-rate-explained.png
coverAlt: Illustration representing the concept of calculating a growth rate
relatedTools: growth-rate-calculator, cagr-calculator, compound-growth-calculator
tags: growth, metrics, data
---

You have probably sat through this slide. "Conversion rate up 20%." It looks good. Then you open the underlying data and find the rate moved from 0.5% to 0.6%. The 20% is arithmetically correct. It is also nowhere near enough information to decide anything.

Calculating a growth rate is one division. The hard part is never the calculation: it is **reading the resulting number and reporting it honestly**. Here are five failures that keep recurring, each with real numbers.

## First: five names, one calculation

Growth rate, percentage change, rate of change, MoM, YoY, QoQ, WoW. They get used interchangeably in meetings, and the formula behind all of them is identical.

```
Growth (%) = (Current − Previous) ÷ Previous × 100
```

MoM (month over month), YoY (year over year), QoQ (quarter over quarter) and WoW (week over week) differ only in **what you put in as the previous value**. They are names for a comparison period, not separate formulas, which is why one [growth rate calculator](/en/growth-rate-calculator) covers all of them.

If MAU went from 1,250,000 to 1,437,500: (1,437,500 − 1,250,000) ÷ 1,250,000 = **+15%**, an absolute gain of **187,500 users**.

## Trap 1: A percentage with no absolute number attached

That "conversion up 20%" slide is this trap. When the denominator is small, percentages get large for free. If one conversion out of 200 visitors becomes two, that is +100% growth: and if it drops back to one next week, that is −50%. You would be reporting noise as performance.

**Always pair the percentage with the absolute change.** Written as "+15% (+187,500 users)", the reader can judge the scale for themselves. When the sample is in the dozens, showing the raw counts alone is the more honest choice.

## Trap 2: Assuming percentages are symmetric

A value drops from 100 to 80. That is −20%. What increase brings it back to 100?

Not +20%, but **+25%**. Adding 20% to 80 gets you 96, not 100, because the base changed underneath you.

This one costs real money when setting targets. "We lost 15% last quarter, so let's recover 15% this quarter" does not return to the starting point: the recovery actually needs 17.6%. Recovery targets have to be worked backwards from the original value, not from the size of the decline.

## Trap 3: Mixing percent (%) with percentage points (pp)

Conversion moved from 2% to 3%. Both of these are valid descriptions:

- **+50%**: the relative increase (3 ÷ 2 − 1)
- **+1pp**: the absolute difference (3 − 2)

Both are true, and they leave completely different impressions. Choosing % when you want the result to look big and pp when you want it to look small is a real and common habit. **For rate metrics such as conversion, churn or market share, report the change in percentage points** and add the percentage in parentheses if it helps. The calculator will hand you +50%; deciding how to present it is your call, not the tool's.

## Trap 4: Watching MoM while ignoring seasonality

December revenue is 40% above November. Is that growth?

For any business with a year-end peak, December beating November is what happens every single year. The question that carries information is how December compares with last December. If that is −5%, the +40% MoM slide is actively hiding the fact that things are getting worse.

**Where seasonality exists, YoY is the primary view and MoM is supporting detail.** The reverse holds for a young product with no seasonal pattern yet, where MoM and WoW say more about momentum.

## Trap 5: Calling two data points a trend

A growth rate sees exactly two moments. Whether the path between them was a steady climb or a spike followed by a collapse is invisible in the number.

To summarize three or more periods as a single figure, use the [CAGR calculator](/en/cagr-calculator) instead. With +100% in year one and −50% in year two, averaging the annual rates arithmetically gives +25%, while the value actually ended exactly where it started (CAGR 0%). Growth compounds; it does not add.

## When not to use a growth rate at all

- **When the previous value is 0**: it is undefined. Going from 0 to 100 is "+100", not infinite growth.
- **When the previous value is negative**: a loss turning into a profit produces a percentage whose sign reads backwards and misleads. Report the absolute change.
- **When the sample is tiny**: with a denominator in the double digits or lower, the percentage carries almost no statistical meaning.
- **When you need a forecast**: growth rate summarizes the past. To project where that rate leads, move to the [compound growth calculator](/en/compound-growth-calculator).

The time-consuming part of growth reporting was never the arithmetic. It is **choosing the right comparison period and attaching scale and context to the number**. Hand the division to a tool and spend your time on the rest.
