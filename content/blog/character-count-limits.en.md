---
title: Character Limits | Why the Same Text Passes One Form and Fails Another
description: Why a form rejects your 490-character answer against a 500-character limit, explained through spaces, line breaks, emoji and byte counting, plus per-platform limits and the right order for cutting text down.
date: 2026-07-30
updated: 2026-08-18
reviewedAt: 2026-08-18
cover: /blog/character-count-limits.png
coverAlt: Illustration representing character counting
relatedTools: character-counter
tags: writing, social, jobs
---

Thirty minutes before a deadline, you paste an answer into a field marked "500 characters max" and get "you have exceeded the character limit." Your word processor says 490. Which one is wrong?

Neither. **A character count is not one number: it changes with the counting rule.** Without knowing that, you end up deleting sentences at random instead of finding the actual cause.

## Same text, different numbers

Take this single line:

```
Hello, my name is Seoyeon Kim.
```

- **30 characters including spaces**
- **25 characters excluding spaces**
- **30 bytes in UTF-8**

Three different values. Most forms never say which rule they use, which is why identical text passes at one company and fails at another. The [character counter](/en/character-counter) shows all of them at once, so you can see which rule caught you.

## Three reasons the numbers disagree

**Line breaks count as characters.** Every paragraph break inserts a newline. Most web inputs count it as one character; word processors usually do not. Ten paragraphs means a ten-character gap on their own. If you are at 490 and the form says you are over 500, this is the most likely culprit.

**An emoji is rarely one character.** What renders as a single glyph is often stored as several. 👍 counts as 2, a family emoji like 👨‍👩‍👧 counts as 8, and flag emoji count as 2. A social post sprinkled with emoji burns through a limit far faster than it looks.

**Non-Latin scripts cost more bytes.** In UTF-8, Latin letters and digits take one byte while Korean, Japanese and Chinese characters take three. Any system that limits by bytes rather than characters will cut off CJK text much sooner.

## Limits by platform

| Platform | Limit |
|---|---:|
| X (Twitter) | 280 |
| Bluesky | 300 |
| Threads | 500 |
| Instagram caption | 2,200 |
| SMS (CJK) | 90 |

If the same post is going to several places, **write to the tightest limit first.** Drafting at 280 for X and then expanding for Threads produces better sentences than writing 500 and hacking it down.

Some limits are not limits at all but truncation points. A search result snippet gets cut around 150–160 characters; exceeding it throws no error, the tail simply disappears. That makes **putting the important phrase first** more useful than shortening the text.

## The right order for hitting a length

Writing to a character count directly produces stilted prose. Reverse the order.

1. **Write everything you want to say, ignoring the limit.** Worrying about length here makes the content shallow.
2. **Cut whole paragraphs.** Deleting your least important paragraph outright beats shaving a few words off every sentence.
3. **If it is still long, merge sentences.** "I did A. As a result, B happened." becomes "A led to B."
4. **Check with a counter last.** Confirm whether the rule includes spaces, then read that number.

For an application answer, aim to **use at least 90% of the allowance**. Submitting 300 characters against a 500 limit reads as low effort, and you are throwing away room you could have used for evidence.

## When counting characters is beside the point

- **Text nobody is counting** — emails and internal docs have no limit. Whether the conclusion is in the first paragraph matters far more than length.
- **Systems that state a byte limit** — count bytes, not characters. For non-Latin text the two are nowhere near each other.
- **Platforms that count links separately** — some convert any URL to a fixed length regardless of its real size. Confirm on the platform itself before publishing anything with a link.

Limits are a small thing until they bite you at a deadline. **Checking which rule applies before you start** avoids almost all of it.
