"use client";

/* ============================================================
   Kitfolio — i18n (KO / EN), React port of the prototype engine.
   - LangProvider holds the current language + persists to
     localStorage('kitfolio-lang'). Default: ko.
   - useT(dict?) returns a t(key) that resolves against the
     page-local dict first, then the common dict, then the key.
   ============================================================ */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Lang = "ko" | "en";
export type Dict = Partial<Record<Lang, Record<string, string>>>;

const STORE = "kitfolio-lang";

const COMMON: Record<Lang, Record<string, string>> = {
  en: {
    "nav.all": "All tools",
    "nav.dev": "Developer",
    "nav.design": "Design",
    "nav.text": "Text",
    "header.search": "Search tools…",
    "header.favorites": "Favorites",
    "common.copy": "Copy",
    "common.copied": "Copied",
    "common.clear": "Clear",
    "common.paste": "Paste",
    "common.sample": "Sample",
    "common.download": "Download",
    "common.upload": "Upload",
    "common.layout": "Layout",
    "common.split": "Split",
    "common.stack": "Stacked",
    "common.input": "Input",
    "common.output": "Output",
    "common.result": "Result",
    "common.privacy": "Runs entirely in your browser — nothing is uploaded.",
  },
  ko: {
    "nav.all": "전체 도구",
    "nav.dev": "개발",
    "nav.design": "디자인",
    "nav.text": "텍스트",
    "header.search": "도구 검색…",
    "header.favorites": "즐겨찾기",
    "common.copy": "복사",
    "common.copied": "복사됨",
    "common.clear": "지우기",
    "common.paste": "붙여넣기",
    "common.sample": "예시",
    "common.download": "다운로드",
    "common.upload": "업로드",
    "common.layout": "레이아웃",
    "common.split": "좌우 분할",
    "common.stack": "상하 분할",
    "common.input": "입력",
    "common.output": "출력",
    "common.result": "결과",
    "common.privacy": "모든 처리는 브라우저 안에서만 — 어떤 데이터도 전송되지 않습니다.",
  },
};

type Ctx = { lang: Lang; setLang: (l: Lang) => void };
const LangCtx = createContext<Ctx>({ lang: "ko", setLang: () => {} });

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ko");

  useEffect(() => {
    const stored = (localStorage.getItem(STORE) as Lang) || "ko";
    setLangState(stored);
    document.documentElement.setAttribute("lang", stored);
  }, []);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    localStorage.setItem(STORE, l);
    document.documentElement.setAttribute("lang", l);
  }, []);

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang]);
  return <LangCtx.Provider value={value}>{children}</LangCtx.Provider>;
}

export function useLang() {
  return useContext(LangCtx);
}

/** Returns a translator bound to the current language and an optional page dict. */
export function useT(dict?: Dict) {
  const { lang } = useLang();
  return useCallback(
    (key: string) =>
      dict?.[lang]?.[key] ??
      COMMON[lang]?.[key] ??
      dict?.en?.[key] ??
      COMMON.en?.[key] ??
      key,
    [lang, dict],
  );
}
