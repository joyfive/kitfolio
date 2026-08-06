---
title: What Is JSON | A Data Format Anyone Can Understand
description: What JSON is and why it's everywhere, its basic structure and rules, the common syntax errors that break it, and why formatting and validation matter: explained without assuming you're a developer.
date: 2026-08-02
cover: /blog/json-explained.png
coverAlt: Illustration representing JSON data structure
relatedTools: json-formatter, slack-timestamp-converter
tags: development, data, JSON
---

If you've ever opened an API response or edited a config file, you've seen text full of curly braces. That's JSON. You don't have to be a developer to run into it while checking logs or handling data, and once you know the structure it's easier to read than it looks.

## JSON is a shared grammar for writing data

JSON (JavaScript Object Notation) is a format for representing data as human-readable text. Think of it as a common language programs agree on when they exchange data. It's the de facto standard almost everywhere: web APIs, config files, communication between apps.

There are two basic building blocks.

- **Object**: a set of "name: value" pairs inside curly braces `{ }`. It describes one thing.
- **Array**: an ordered list of values inside square brackets `[ ]`. Used when you have several of the same kind.

For example, a single user looks like this.

```
{
  "name": "Jimin",
  "age": 29,
  "active": true,
  "roles": ["editor", "reviewer"]
}
```

A name (`"name"`) has a value (`"Jimin"`), age is a number, active is true/false, and roles is an array holding several values. There are only six value types: string, number, boolean, null, object, array, so the rules stay simple.

## Common mistakes that stop the parser

JSON is strict. Errors that look trivial to a human make a program stop reading right at that spot.

- **Trailing comma**: you can't leave a comma after the last item in an array or object.
- **Single quotes**: strings and keys must be wrapped in double quotes `"`. Single quotes `'` are not allowed.
- **Unquoted keys**: `{ name: "Jimin" }` is wrong; `{ "name": "Jimin" }` is right.
- **Comments**: JSON doesn't allow comments (`//`) by the standard.

These are hard to spot by eye in a long payload, which is why it helps to have a formatter point to the line and column of the error.

## Formatting and validation are different

The JSON you meet in practice is often minified onto one long line. Two jobs come up here.

> **Formatting** makes it readable; **validation** checks that the syntax is correct.

Formatting indents along the hierarchy and colors the parts so the structure is visible at a glance. Validation checks for the syntax errors above. When you instead need to shrink the data, minifying strips all whitespace into a single line.

## For sensitive data, keep it in the browser

JSON frequently carries sensitive values: tokens, personal data, internal identifiers. Some online tools send your input to a server to process it, so data you pasted without thinking can end up stored elsewhere. A tool that does everything inside your browser avoids that worry.

If you need to tidy JSON or find an error, paste it into the [JSON Formatter](/en/json-formatter). It adds indentation and syntax highlighting, points to the location of any error, supports one-line minifying, and never sends your input to a server.
