"use client";

import { useEffect, useRef, useState } from "react";
import { softTint } from "../../lib/folio/transform";

/* mermaid 텍스트 → SVG. mermaid 는 다이어그램이 있을 때만 동적 import 한다.
   securityLevel "strict": 사용자가 쓴 라벨의 HTML·스크립트를 실행하지 않는다. */
let seq = 0;

export default function Diagram({ code, caption }: { code: string; caption?: string }) {
  const ref = useRef<HTMLElement>(null);
  const [svg, setSvg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      const el = ref.current;
      const cs = el ? getComputedStyle(el) : null;
      const primary = cs?.getPropertyValue("--primary").trim() || "#2D5DC8";
      const ink = cs?.getPropertyValue("--ink-strong").trim() || "#16191d";
      const line = cs?.getPropertyValue("--line").trim() || "#e6e9ed";
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          securityLevel: "strict",
          themeVariables: {
            primaryColor: softTint(primary),
            primaryBorderColor: primary,
            primaryTextColor: ink,
            lineColor: primary,
            secondaryColor: "#ffffff",
            tertiaryColor: "#ffffff",
            tertiaryBorderColor: line,
            fontFamily: "Pretendard, sans-serif",
            fontSize: "20px",
          },
        });
        const id = `kf-mm-${++seq}`;
        const out = await mermaid.render(id, code);
        if (alive) {
          setSvg(out.svg);
          setErr("");
        }
      } catch (e) {
        if (alive) setErr(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      alive = false;
    };
  }, [code]);

  return (
    <figure ref={ref} className="pf-diagram" data-diagram data-ready={svg || err ? "1" : "0"}>
      {err ? (
        <pre className="pf-diagram-err">{err}</pre>
      ) : (
        <div className="pf-diagram-svg" dangerouslySetInnerHTML={{ __html: svg }} />
      )}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
