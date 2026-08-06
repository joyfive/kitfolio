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

**px, rem, em, %, vw | CSS 단위 언제 무엇을 써야 할까**

## Core visual idea

동일한 요소가 **루트·부모·컨테이너·뷰포트라는 서로 다른 기준점에 따라 크기가 달라지는 구조**를 보여줍니다. 코드 텍스트 없이 상대 단위의 개념을 도식화합니다.

## Composition

- Use four nested or adjacent reference frames
- Inside each frame, repeat the same small rounded module at a different scale
- Root frame, parent frame, container frame, and viewport frame should be distinguishable only through hierarchy and spatial relation, not labels
- Add tiny measurement ticks or guide lines without any numeric markings
- One frame may expand fluidly while another stays fixed to show the difference between absolute and relative sizing
- Keep the visual architectural and systematic

## Final generation prompt

```text
Kitfolio editorial blog cover, 16:9.

Create a clean semi-flat vector infographic explaining that CSS sizing changes depending on its reference frame. Show four nested or carefully arranged geometric frames representing root, parent, container, and viewport contexts. Repeat the same small rounded module inside them at visibly different scales. Include subtle unlabeled guide lines and measurement ticks, with one element staying fixed while others scale relative to their surrounding frame. The composition should communicate fixed size, inherited scale, container proportion, and viewport-based responsiveness without showing code or labels.

Use a very light blue-gray background (#F2F5FF), cool blue accents (#2D5DC8 and #6486EF), and neutral blue-gray support tones (#D4D9E5 and #61646F). Use restrained geometric forms, consistent thin outlines, soft rounded corners, subtle diagram nodes, minimal soft shadows, and generous negative space. Front-facing orthographic composition, calm professional modern SaaS mood, low-to-medium visual density, centered and balanced.

No readable text, no letters, no unit labels, no numbers, no code snippets, no browser screenshot, no people, no photorealism, no 3D render, no hand-drawn texture, no neon colors, no dark background, no decorative clutter.
```

## Avoid

- Literal code editors
- Visible “px”, “rem”, “em”, “vw”, or “%”
- A ruler as the only concept
- Random nested boxes with no scale relationship
- Overly technical grid density
