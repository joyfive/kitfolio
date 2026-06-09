"use client";

import { useLang } from "../lib/i18n";

export default function LangToggle() {
  const { lang, setLang } = useLang();
  return (
    <span className="kf-lang">
      <button
        className={lang === "ko" ? "is-active" : ""}
        onClick={() => setLang("ko")}
      >
        KO
      </button>
      <button
        className={lang === "en" ? "is-active" : ""}
        onClick={() => setLang("en")}
      >
        EN
      </button>
    </span>
  );
}
