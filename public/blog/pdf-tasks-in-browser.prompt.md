# Kitfolio Blog Cover Image Prompt

## Series identity

- **Brand:** Kitfolio
- **Use:** Editorial blog cover
- **Format:** 16:9, 1200×675
- **Visual language:** Clean SaaS, semi-flat vector infographic
- **Background:** Very light blue-gray, primarily `#F2F5FF`
- **Primary colors:** `#2D5DC8`, `#6486EF`
- **Supporting colors:** `#D4D9E5`, `#61646F`
- **Optional highlight:** A tiny amount of muted amber, under 5% of the image
- **Composition:** Low-to-medium density, centered visual balance, 15–20% outer negative space
- **Shape language:** Soft rounded rectangles, circles, thin connector lines, subtle nodes
- **Rendering:** Flat or semi-flat, front-facing orthographic view, minimal soft shadow
- **Consistency rule:** Use the same palette, line weight, corner treatment, background tone, and object density across the full nine-image series

## Article

**PDF 병합·분할·회전·삭제 | 브라우저에서 안전하게 처리하기**

## Core visual idea

한 묶음의 문서 페이지가 **병합·분할·회전·삭제를 통해 재구성되는 작업 흐름**을 보여줍니다. 하나의 PDF 아이콘보다 페이지 조작 동작이 중심입니다.

## Composition

- Center: a neat stack of three or four blank document pages
- Around it: four compact action zones
  - pages converging into one stack
  - one stack separating into smaller groups
  - one page rotating with a curved arrow
  - one faded page being removed from the set
- Use arrows and connectors sparingly
- Add a subtle browser-local safety cue through a soft protective boundary around the system, not a shield icon
- Keep pages blank and free of text

## Final generation prompt

```text
Kitfolio editorial blog cover, 16:9.

Create a clean semi-flat vector infographic about editing PDF pages directly in the browser. Place a tidy stack of blank document pages at the center. Around it, show four compact page operations as one coherent system: several pages converging into one stack for merge, one stack separating into smaller groups for split, one page turning with a curved rotation arrow, and one faded page being removed from the set. Surround the full system with a subtle soft boundary suggesting local, private processing without using a literal shield. The image should emphasize page manipulation and safe in-browser workflow.

Use a very light blue-gray background (#F2F5FF), cool blue accents (#2D5DC8 and #6486EF), and neutral blue-gray support tones (#D4D9E5 and #61646F). Use restrained geometric forms, consistent thin outlines, soft rounded corners, subtle diagram nodes, minimal soft shadows, and generous negative space. Front-facing orthographic composition, calm professional modern SaaS mood, low-to-medium visual density, centered and balanced.

No readable text, no letters, no numbers, no file labels, no PDF logo, no red Adobe branding, no document content, no people, no photorealism, no 3D render, no hand-drawn texture, no neon colors, no dark background, no decorative clutter.
```

## Avoid

- A single generic PDF icon
- Red Adobe-style branding
- A literal security shield
- Text-filled document pages
- Four unrelated icons with no shared center
