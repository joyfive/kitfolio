import LegalPage from "../components/LegalPage";
import { buildLegalMetadata } from "../lib/content";

export const metadata = buildLegalMetadata("about", "ko");

export default function Page() {
  return <LegalPage slug="about" lang="ko" />;
}
