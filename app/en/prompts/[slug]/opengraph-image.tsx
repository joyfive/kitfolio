import { OG_SIZE, promptOgImage } from "../../../lib/og";
import { getPrompt, getPromptSlugs } from "../../../lib/prompts";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Work prompt | Kitfolio";

export function generateStaticParams() {
  return getPromptSlugs("en").map((slug) => ({ slug }));
}

/** 대표 이미지 없이 글 제목으로 만든다 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = getPrompt(slug, "en")?.meta.title ?? "Kitfolio";
  return promptOgImage(title, "en");
}
