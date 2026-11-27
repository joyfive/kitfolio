/* 가이드 도해 레지스트리: slug(또는 slug/variant) → ko·en 도해.
   도구 상세 사용 가이드의 단일 출처. 공개 도구는 모두 도해가 있어야 한다 (guide-figures.test.ts). */
import type { Lang } from "../content";
import type { GuideFigure, GuideFigureMap } from "./types";
import { DOCS_FIGURES } from "./docs";
import { TIME_WORK_FIGURES } from "./time-work";
import { PAY_FIGURES } from "./pay";
import { MARKETING_FIGURES } from "./marketing";
import { WEB_FIGURES } from "./web";
import { A11Y_FIGURES } from "./a11y";

export const GUIDE_FIGURES: GuideFigureMap = {
  ...DOCS_FIGURES,
  ...TIME_WORK_FIGURES,
  ...PAY_FIGURES,
  ...MARKETING_FIGURES,
  ...WEB_FIGURES,
  ...A11Y_FIGURES,
};

/** 탭마다 도해가 다른 도구 (도구 페이지 안의 ?mode= 탭) */
export const FIGURE_VARIANTS: Record<string, readonly string[]> = {
  "pdf-tools": ["merge", "split", "rotate", "page-delete"],
};

export function guideFigure(slug: string, lang: Lang, variant?: string): GuideFigure | undefined {
  const entry = (variant && GUIDE_FIGURES[`${slug}/${variant}`]) || GUIDE_FIGURES[slug];
  return entry?.[lang];
}
