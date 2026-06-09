"use client";

import { useEffect } from "react";

/** Sets data-theme on <body> for the lifetime of a tool page so the
 *  per-theme background (ide / canvas / clean) applies to the full
 *  viewport, then restores the default on unmount. */
export function useBodyTheme(theme: "ide" | "canvas" | "clean") {
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    return () => {
      document.body.removeAttribute("data-theme");
    };
  }, [theme]);
}
