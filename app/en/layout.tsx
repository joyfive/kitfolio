import SetHtmlLang from "../components/SetHtmlLang";
import { LangProvider } from "../lib/i18n";

/** /en 서브트리: 언어를 EN으로 덮어쓰고 <html lang>도 'en'으로 설정. */
export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider lang="en">
      <SetHtmlLang lang="en" />
      {children}
    </LangProvider>
  );
}
