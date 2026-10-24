import { notFound } from "next/navigation";
import LegalPage from "../../components/LegalPage";
import { buildLegalVersionMetadata, legalVersions } from "../../lib/content";

// 이전 버전만 정적 생성한다. 현행은 /privacy-policy 가 담당하고, 목록에 없는 날짜는 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return legalVersions("privacy-policy")
    .filter((v) => !v.current)
    .map((v) => ({ version: v.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ version: string }>;
}) {
  const { version } = await params;
  return buildLegalVersionMetadata("privacy-policy", "ko", version);
}

export default async function Page({
  params,
}: {
  params: Promise<{ version: string }>;
}) {
  const { version } = await params;
  const v = legalVersions("privacy-policy").find((x) => x.id === version && !x.current);
  if (!v) notFound();
  return <LegalPage slug="privacy-policy" lang="ko" version={version} />;
}
