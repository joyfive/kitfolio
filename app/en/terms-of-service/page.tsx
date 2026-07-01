import LegalPage from "../../components/LegalPage";
import { buildLegalMetadata } from "../../lib/content";

export const metadata = buildLegalMetadata("terms-of-service", "en");

export default function Page() {
  return <LegalPage slug="terms-of-service" lang="en" />;
}
