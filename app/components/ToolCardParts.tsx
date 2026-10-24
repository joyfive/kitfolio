import {
  actionOf,
  categoryOf,
  toolNames,
  type Lang,
  type Tool,
} from "../lib/content";

/** 도구명 병기: 페이지 언어 이름이 메인 (허브 카드 · 관련 도구 공통) */
export function ToolName({ tool, lang }: { tool: Tool; lang: Lang }) {
  const n = toolNames(tool, lang);
  return (
    <div className="tool-name">
      <span className="tool-main">{n.main}</span>
      <span className="tool-sub" lang={n.subLang}>
        {n.sub}
      </span>
    </div>
  );
}

/** 카드 태그: 1단 카테고리 칩 + 2단 대표 작업 칩 (허브 필터 칩과 같은 depth 스타일) */
export function ToolTags({ tool, lang }: { tool: Tool; lang: Lang }) {
  return (
    <span className="tool-tags">
      <span className="cat-tag">{categoryOf(tool.category).label[lang]}</span>
      <span className="action-tag">{actionOf(tool.actions[0]).label[lang]}</span>
    </span>
  );
}
