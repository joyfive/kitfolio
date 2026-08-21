---
title: Five JSON Syntax Errors | What to Check When One Edit Breaks Everything
description: The five syntax errors people actually hit when editing JSON for the first time, shown with the real error messages, plus how to read an error position and the order to check things in. No development background needed.
date: 2026-08-02
updated: 2026-08-18
reviewedAt: 2026-08-18
cover: /blog/json-explained.png
coverAlt: Illustration representing JSON data structure
relatedTools: json-formatter, slack-timestamp-converter
tags: development, data, JSON
---

You changed one value in a config file. You saved, restarted, and the service refuses to come up:

```
SyntaxError: Unexpected token } in JSON at position 184
```

Opening the file tells you nothing. Braces and quotes are packed together and scanning by eye does not find it.

JSON is a way of writing data as text, and it has very few rules. **Break even one of them, though, and the entire file is rejected.** Nothing is read partially, which is how a single stray character stops a whole service. Here are the five that actually come up, in the order worth checking.

## First: there are only two shapes

```json
{
  "name": "Seoyeon Kim",
  "age": 32,
  "active": true,
  "roles": ["admin", "editor"],
  "team": { "id": 7, "label": "Growth" }
}
```

- `{ }` **object**: a bundle of labelled values, written as `"key": value` pairs separated by commas.
- `[ ]` **array**: an ordered list of values.

A value can be a string (`"..."`), a number, `true`/`false`, `null`, or another object or array. That is the whole vocabulary. Files get deeper: an object holding an array holding more objects: but the rules never grow.

## Error 1: A comma after the last item

By far the most common.

```json
{
  "tags": ["work", "tools",]
}
```

The comma after `"tools"` is the problem. **JSON does not allow a trailing comma after the final item.** JavaScript does, so the habit carries over, and commas are frequently left behind when deleting an entry. When an error message points at a `]` or `}`, look at the comma just before it.

## Error 2: Unquoted keys

```json
{ name: "kitfolio" }
```

`name` has no quotes. **Every JSON key must be wrapped in double quotes.** JavaScript object literals let you omit them, which is where the confusion starts.

## Error 3: Single quotes

```json
{ 'name': 'kitfolio' }
```

Python and JavaScript accept single-quoted strings; **JSON accepts double quotes only.** This shows up constantly when data is copied over from another language.

## Error 4: Comments

```json
{
  // production settings
  "env": "production"
}
```

**Standard JSON has no comments.** If you have seen them in `tsconfig.json` or `.vscode/settings.json`, those files are JSONC, an extended format understood by specific tools. A normal JSON parser treats a comment as an error.

## Error 5: Unbalanced brackets

If it is none of the above, it is usually this. Once nesting gets deep, a single missing `}` is genuinely hard to spot by reading.

There is a faster route than checking all five by hand. Paste the file into the [JSON formatter](/en/json-formatter) and **it points at the exact character where parsing failed.** That turns `position 184` into a specific line and column, which removes most of the search. If the file is valid, it comes back re-indented so you can check the structure at the same time.

## When there is no error but the value looks wrong

If it parses and the data still looks off, suspect one of these two.

**Very large numbers.** JSON numbers are read as double-precision floats in most environments. Integer IDs above 9,007,199,254,740,992 (2 to the 53rd) can come back with their final digits changed. This is why long IDs are conventionally sent as strings (`"1234567890123456789"`) rather than numbers.

**Dates.** JSON has no date type. Dates arrive either as strings (`"2026-08-18T09:30:00Z"`) or as numbers, such as the Unix timestamp `1755509400`. To read the latter, convert it with the [timestamp converter](/en/slack-timestamp-converter). Watch the digit count: mixing up seconds and milliseconds lands you in 1970 or the distant future.

## When not to use JSON

- **Config files humans edit often**: with no comments, there is nowhere to record why a value is set the way it is. YAML or TOML suit that job better.
- **Very large datasets**: the format expects to be read whole, which does not work at hundreds of megabytes. JSON Lines or CSV process record by record instead.
- **Values needing exact decimal arithmetic**: for money and anything where rounding is unacceptable, send the value as a string rather than a number.

That is genuinely all you need to work with JSON. Remember that it trades a small rule set for zero tolerance, and an error message becomes something you can act on in seconds.
