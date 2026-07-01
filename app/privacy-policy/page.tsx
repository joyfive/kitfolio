import LegalPage from "../components/LegalPage";
import { buildLegalMetadata } from "../lib/content";

export const metadata = buildLegalMetadata("privacy-policy", "ko");

export default function Page() {
  return <LegalPage slug="privacy-policy" lang="ko" />;
}
