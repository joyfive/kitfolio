import LegalPage from "../components/LegalPage";
import { buildLegalMetadata } from "../lib/content";

export const metadata = buildLegalMetadata("contact", "ko");

export default function Page() {
  return <LegalPage slug="contact" lang="ko" />;
}
