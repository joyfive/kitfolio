import { OG_SIZE, promptOgImage } from "../../lib/og";
import { getPrompt, getPromptSlugs } from "../../lib/prompts";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "업무 프롬프트 | Kitfolio";

export function generateStaticParams() {
  return getPromptSlugs("ko").map((slug) => ({ slug }));
}

/** 대표 이미지 없이 글 제목으로 만든다 */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = getPrompt(slug, "ko")?.meta.title ?? "Kitfolio";
  return promptOgImage(title, "ko");
}
