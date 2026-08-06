---
title: px, rem, em, %, vw — Which CSS Unit to Use and When
description: What CSS absolute and relative units are each relative to, how they affect accessibility and responsiveness, and which unit to reach for in each situation.
date: 2026-08-04
cover: /blog/css-units-explained.png
coverAlt: Illustration comparing CSS length units
relatedTools: rem-to-px, em-to-px, vw-to-px, percent-to-px
tags: CSS, frontend, design
---

When sizing things in CSS, you hesitate every time: px, rem, or %? Each unit differs in **what it's relative to**, and that difference drives accessibility and responsive behavior. Let's sort them out.

## Absolute unit: px

**px (pixels)** is a fixed, absolute unit. `16px` is 16px in every situation. It's predictable, but it has a downside: **it doesn't scale when a user increases their browser's default text size**. Fixing fonts or spacing in px can hurt accessibility for people with low vision. It suits values that genuinely must be fixed, like border thickness.

## Font-relative units: rem and em

### rem — relative to the root

**rem (root em)** is always relative to the HTML root element's font size. If the root is 16px, then `1rem = 16px` and `1.5rem = 24px`. When a user bumps up the default text size, everything sized in rem grows with it — **good for accessibility**. Since it references only the root, values stay predictable.

### em — relative to the parent

**em** is relative to the element's inherited font size. Give a button `0.75em` of padding and the spacing scales with the text, so the whole component grows together.

em's trap is **compounding when nested**. Use em inside an element that itself sets its font size in em and the ancestors' ratios multiply. `1.2em` nested three levels deep is actually 1.2 × 1.2 × 1.2 ≈ 1.73×. So choose rem when predictability matters and em when you want scaling relative to the parent.

## Container-relative: %

**% (percent)** is relative to the parent — but the reference differs by property: `width` is the parent's width, `height` its height, `font-size` its font size, and, notably, `padding` and `margin` are computed from the parent's **width** even for vertical values. It suits dividing space proportionally inside a container.

## Viewport-relative: vw / vh

**vw (viewport width)** is 1% of the screen width. `100vw` is the full width, `50vw` is half. It changes automatically with screen size, so it's used for full-bleed heroes and typography that scales with the viewport.

Watch out: vw alone gets too large on wide screens and too small on narrow ones. In practice you bound it with `clamp()`: `font-size: clamp(1rem, 4vw, 2rem)`.

## A situational guide

- **Font size and spacing** → rem (accessibility, predictability)
- **Scaling inside a component** → em (relative to parent font)
- **Proportional space in a container** → %
- **Size relative to the screen** → vw, paired with clamp
- **Values that must be fixed (borders)** → px

## Convert to px to check

Designs usually arrive in px while implementation uses rem, em, %, or vw, so you often convert between them. Seeing the real pixel value makes it easier to reason about — check instantly with the [rem→px](/en/rem-to-px), [em→px](/en/em-to-px), [vw→px](/en/vw-to-px), and [%→px](/en/percent-to-px) converters.
