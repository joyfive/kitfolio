import { notFound } from "next/navigation";
import LegalPage from "../../components/LegalPage";
import { buildLegalVersionMetadata, legalVersions } from "../../lib/content";

// 이전 버전만 정적 생성한다. 현행은 /terms-of-service 가 담당하고, 목록에 없는 날짜는 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return legalVersions("terms-of-service")
    .filter((v) => !v.current)
    .map((v) => ({ version: v.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ version: string }>;
}) {
  const { version } = await params;
  return buildLegalVersionMetadata("terms-of-service", "ko", version);
}

export default async function Page({
  params,
}: {
  params: Promise<{ version: string }>;
}) {
  const { version } = await params;
  const v = legalVersions("terms-of-service").find((x) => x.id === version && !x.current);
  if (!v) notFound();
  return <LegalPage slug="terms-of-service" lang="ko" version={version} />;
}
