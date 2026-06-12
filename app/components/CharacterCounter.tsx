"use client";

import { useEffect, useMemo, useState } from "react";
import Faq from "./Faq";
import RelatedTools from "./RelatedTools";
import ToolAbout from "./ToolAbout";
import PageHead from "./PageHead";
import { useLang, useT, type Dict } from "../lib/i18n";

// 컨트롤 마이크로카피(레이블·단위)만 로컬 dict.
// 페이지 콘텐츠(제목·설명·가이드·FAQ)는 content.ts 레지스트리.
const DICT: Dict = {
  ko: {
    "cc.editorLabel": "텍스트 입력",
    "cc.placeholder": "여기에 텍스트를 입력하거나 붙여넣으세요…",
    "cc.chars": "글자 수",
    "cc.noSpace": "(공백 제외)",
    "cc.words": "단어 수",
    "cc.sentences": "문장",
    "cc.lines": "줄",
    "cc.paras": "단락",
    "cc.readTime": "예상 읽기",
    "cc.speakTime": "예상 발화",
    "cc.size": "바이트",
    "cc.limitsTitle": "SNS 글자 수 제한",
    "cc.limitsSub": "현재 글자 수 기준 남은 분량입니다.",
    "cc.left": "남음",
    "cc.over": "초과",
  },
  en: {
    "cc.editorLabel": "Your text",
    "cc.placeholder": "Type or paste your text here…",
    "cc.chars": "Characters",
    "cc.noSpace": "(no spaces)",
    "cc.words": "Words",
    "cc.sentences": "Sentences",
    "cc.lines": "Lines",
    "cc.paras": "Paragraphs",
    "cc.readTime": "Read time",
    "cc.speakTime": "Speak time",
    "cc.size": "Bytes",
    "cc.limitsTitle": "Social character limits",
    "cc.limitsSub": "Remaining length based on current count.",
    "cc.left": "left",
    "cc.over": "over",
  },
};

const LIMITS = [
  { net: "X (Twitter)", max: 280 },
  { net: "Threads", max: 500 },
  { net: "Instagram", max: 2200 },
  { net: "Bluesky", max: 300 },
  { net: "SMS", max: 90 },
];

const SAMPLE_KO =
  "Kitfolio는 개발자와 디자이너를 위한 가볍고 빠른 웹 도구 모음입니다. 설치도, 가입도 필요 없습니다. 모든 처리는 브라우저 안에서 끝나고 어떤 데이터도 서버로 전송되지 않습니다.\n\n필요한 도구를 골라 바로 쓰세요.";
const SAMPLE_EN =
  "Kitfolio is a fast, lightweight set of web tools for developers and designers. No install, no sign-up. Everything runs in your browser and no data is ever sent to a server.\n\nPick a tool and start right away.";

function fmt(n: number) {
  return n.toLocaleString();
}

export default function CharacterCounter() {
  const { lang } = useLang();
  const t = useT(DICT);

  const [text, setText] = useState(lang === "en" ? SAMPLE_EN : SAMPLE_KO);

  // 사용자가 손대지 않은 샘플이면 언어 전환 시 샘플도 교체
  useEffect(() => {
    setText((cur) =>
      cur === SAMPLE_KO || cur === SAMPLE_EN || cur === ""
        ? lang === "en"
          ? SAMPLE_EN
          : SAMPLE_KO
        : cur,
    );
  }, [lang]);

  function timeStr(sec: number) {
    sec = Math.round(sec);
    if (sec < 60) return sec + (lang === "ko" ? "초" : "s");
    const mn = Math.floor(sec / 60);
    const s = sec % 60;
    return lang === "ko" ? `${mn}분 ${s}초` : `${mn}m ${s}s`;
  }

  const m = useMemo(() => {
    const v = text;
    const chars = Array.from(v).length;
    const noSpace = Array.from(v.replace(/\s/g, "")).length;
    const words = (v.trim().match(/\S+/g) || []).length;
    const sentences =
      (v.match(/[^.!?。！？…\n]+[.!?。！？…]+/g) || []).filter((s) =>
        s.trim(),
      ).length || (v.trim() ? 1 : 0);
    const lines = v === "" ? 0 : v.split("\n").length;
    const paras = v.split(/\n\s*\n/).filter((p) => p.trim()).length;
    const readTime = (words / 200) * 60;
    const speakTime = (words / 130) * 60;
    const bytes = new Blob([v]).size;
    return {
      chars,
      noSpace,
      words,
      sentences,
      lines,
      paras,
      readTime,
      speakTime,
      bytes,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, lang]);

  async function paste() {
    try {
      const tx = await navigator.clipboard.readText();
      setText((cur) => cur + tx);
    } catch {
      /* ignore */
    }
  }

  return (
    <>
      <PageHead slug="character-counter" />

      <div className="cc-work">
          <div className="editor-card">
            <div className="editor-head">
              <span className="lbl">{t("cc.editorLabel")}</span>
              <span className="spacer" />
              <button className="mini-act" onClick={paste}>
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3.5" y="2.5" width="9" height="11" rx="1.5" />
                  <path d="M6 2.5V2a1 1 0 011-1h2a1 1 0 011 1v.5" />
                </svg>
                <span>{t("common.paste")}</span>
              </button>
              <button className="mini-act" onClick={() => setText("")}>
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M3 4h10M5.5 4V3a1 1 0 011-1h3a1 1 0 011 1v1M6 7v4M10 7v4M4 4l.7 8a1 1 0 001 .9h4.6a1 1 0 001-.9L12 4" />
                </svg>
                <span>{t("common.clear")}</span>
              </button>
            </div>
            <textarea
              id="text"
              spellCheck={false}
              placeholder={t("cc.placeholder")}
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="stats-col">
            <div className="metric-grid">
              <div className="metric primary">
                <div className="mv num">{fmt(m.chars)}</div>
                <div className="ml">{t("cc.chars")}</div>
                <div className="ms">
                  <span className="num">{fmt(m.noSpace)}</span>{" "}
                  <span>{t("cc.noSpace")}</span>
                </div>
              </div>
              <div className="metric">
                <div className="mv num">{fmt(m.words)}</div>
                <div className="ml">{t("cc.words")}</div>
                <div className="ms">&nbsp;</div>
              </div>
            </div>

            <div className="mini-grid">
              <div className="mini">
                <div className="v num">{fmt(m.sentences)}</div>
                <div className="l">{t("cc.sentences")}</div>
              </div>
              <div className="mini">
                <div className="v num">{fmt(m.lines)}</div>
                <div className="l">{t("cc.lines")}</div>
              </div>
              <div className="mini">
                <div className="v num">{fmt(m.paras)}</div>
                <div className="l">{t("cc.paras")}</div>
              </div>
            </div>

            <div className="mini-grid">
              <div className="mini">
                <div className="v num">{timeStr(m.readTime)}</div>
                <div className="l">{t("cc.readTime")}</div>
              </div>
              <div className="mini">
                <div className="v num">{timeStr(m.speakTime)}</div>
                <div className="l">{t("cc.speakTime")}</div>
              </div>
              <div className="mini">
                <div className="v num">{fmt(m.bytes)} B</div>
                <div className="l">{t("cc.size")}</div>
              </div>
            </div>

            <div className="limits-card">
              <h3>{t("cc.limitsTitle")}</h3>
              <p className="sub">{t("cc.limitsSub")}</p>
              <div>
                {LIMITS.map((l) => {
                  const pct = Math.min(100, (m.chars / l.max) * 100);
                  const remaining = l.max - m.chars;
                  const state =
                    remaining < 0 ? "over" : pct >= 85 ? "near" : "";
                  const countTxt =
                    remaining < 0
                      ? `${fmt(-remaining)} ${t("cc.over")}`
                      : `${fmt(remaining)} ${t("cc.left")}`;
                  return (
                    <div className="limit" key={l.net}>
                      <div className="limit-top">
                        <span className="limit-name">
                          <span className="net">{l.net}</span>
                        </span>
                        <span className={"limit-count " + state}>
                          {countTxt} · {fmt(m.chars)}/{fmt(l.max)}
                        </span>
                      </div>
                      <div className="bar">
                        <i className={state} style={{ width: pct + "%" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="privacy">
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M8 1.5l5 2v3.5c0 3-2.1 5.4-5 6.5-2.9-1.1-5-3.5-5-6.5V3.5z" />
                <path d="M6 8l1.5 1.5L10.5 6.5" />
              </svg>
              <span>{t("common.privacy")}</span>
            </div>
          </div>
      </div>

      <ToolAbout slug="character-counter" />
      <Faq slug="character-counter" />
      <RelatedTools slug="character-counter" />
    </>
  );
}
