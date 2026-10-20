"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Faq from "./Faq";
import RelatedTools from "./RelatedTools";
import PageHead from "./PageHead";
import ToolGuide from "./ToolGuide";
import { useLang, useT, type Dict } from "../lib/i18n";
import { trackEvent } from "../lib/analytics";
import {
  BLOCK_TYPES,
  newBlock,
  newButton,
  type BlockType,
  type ButtonStyle,
  type EditorBlock,
  type EditorButton,
} from "../lib/slackmsg/model";
import { autoFallback, buildPayload } from "../lib/slackmsg/blocks";
import { validate, type Issue } from "../lib/slackmsg/limits";
import { parseMrkdwn, type Inline } from "../lib/slackmsg/mrkdwn";
import {
  blockKitBuilderUrl,
  buildCode,
  CHANNEL_PLACEHOLDER,
  CODE_TABS,
  type CodeTab,
} from "../lib/slackmsg/snippets";
import { template, TEMPLATE_IDS, type TemplateId } from "../lib/slackmsg/templates";

const SLUG = "slack-message-builder";

// 컨트롤 마이크로카피만 로컬 dict.
// 페이지 콘텐츠(제목·설명·가이드·FAQ)는 content.ts 레지스트리.
const DICT: Dict = {
  ko: {
    "tpl.label": "템플릿",
    "tpl.deploy": "배포 알림",
    "tpl.incident": "장애 알림",
    "tpl.release": "릴리즈 노트",
    "act.clear": "모두 지우기",
    "in.panel": "메시지 작성",
    "in.blocks": "블록 {n}개",
    "in.empty": "아래에서 블록을 추가해 메시지를 작성하세요",
    "in.add": "블록 추가",
    "type.text": "텍스트",
    "type.header": "제목",
    "type.divider": "구분선",
    "type.fields": "필드",
    "type.context": "보조 문구",
    "type.image": "이미지",
    "type.actions": "버튼 묶음",
    "type.textButton": "텍스트 + 버튼",
    "blk.up": "위로",
    "blk.down": "아래로",
    "blk.remove": "블록 삭제",
    "blk.divider": "메시지에 가로 구분선을 넣습니다.",
    "ph.text": "메시지 내용. *굵게* _기울임_ `코드` 를 쓸 수 있습니다",
    "ph.header": "제목 (서식 없이 표시됩니다)",
    "ph.field": "*라벨*\n값",
    "ph.context": "작성자 · 시각 같은 보조 정보",
    "field.add": "필드 추가",
    "field.remove": "필드 삭제",
    "img.url": "이미지 URL (공개 주소)",
    "img.alt": "대체 텍스트 (alt, 필수)",
    "img.title": "이미지 제목 (선택)",
    "btn.add": "버튼 추가",
    "btn.remove": "버튼 삭제",
    "btn.text": "버튼 텍스트",
    "btn.url": "링크 URL (선택: 있으면 링크 버튼)",
    "btn.actionId": "action_id (선택)",
    "btn.value": "value (선택)",
    "btn.style": "스타일",
    "style.default": "기본",
    "fmt.bold": "굵게",
    "fmt.italic": "기울임",
    "fmt.strike": "취소선",
    "fmt.code": "인라인 코드",
    "fmt.pre": "코드 블록",
    "fmt.quote": "인용",
    "fmt.list": "목록",
    "fmt.link": "링크",
    "fmt.user": "사용자 멘션",
    "fmt.channel": "채널 링크",
    "fmt.here": "@here",
    "fmt.date": "날짜 (현재 시각)",
    "fb.label": "대체 텍스트 (text)",
    "fb.hint": "알림·잠금 화면·스크린 리더에 쓰입니다.",
    "fb.auto": "자동 생성",
    "fb.reset": "자동으로 되돌리기",
    "out.preview": "미리보기",
    "out.channel": "채널 ID",
    "out.blocksOnly": "blocks 만",
    "out.copy": "코드 복사",
    "out.builder": "Block Kit Builder에서 열기",
    "out.builderNote": "새 탭에서 Slack 사이트로 이동하며, 블록 JSON 이 주소에 담깁니다.",
    "out.previewNote": "구조 확인용 근사치입니다. 실제 모양은 슬랙 클라이언트·테마마다 다릅니다.",
    "out.app": "내 앱",
    "out.envNote": "토큰은 환경 변수 {env} 에서 읽습니다. 이 페이지에 토큰을 입력하지 마세요.",
    "status.blocks": "블록 {n}개",
    "status.errors": "오류 {n}건",
    "status.warns": "경고 {n}건",
    "issue.msg": "메시지",
    "issue.block": "{n}번 블록",
    "issue.tooManyBlocks": "블록이 {actual}개입니다. 메시지당 최대 {limit}개까지 보낼 수 있습니다.",
    "issue.empty": "{field}: 비어 있습니다.",
    "issue.tooLong": "{field}: {actual}자 (최대 {limit}자)",
    "issue.tooMany": "{field}: {actual}개 (최대 {limit}개)",
    "issue.badUrl": "{field}: http:// 또는 https:// 로 시작하는 주소를 넣으세요.",
    "issue.dupActionId": "같은 블록 안에서 action_id 가 중복됩니다.",
    "issue.fallbackEmpty": "대체 텍스트가 비어 있어 알림에 메시지 내용이 보이지 않습니다.",
    "issue.fallbackLong": "대체 텍스트가 {actual}자입니다. {limit}자 이하를 권장합니다.",
    "f.text": "텍스트",
    "f.fields": "필드",
    "f.url": "이미지 URL",
    "f.alt": "대체 텍스트(alt)",
    "f.title": "이미지 제목",
    "f.buttons": "버튼",
    "f.button.text": "버튼 텍스트",
    "f.button.url": "버튼 URL",
    "f.button.actionId": "action_id",
    "f.button.value": "value",
  },
  en: {
    "tpl.label": "Templates",
    "tpl.deploy": "Deploy",
    "tpl.incident": "Incident",
    "tpl.release": "Release notes",
    "act.clear": "Clear all",
    "in.panel": "Compose",
    "in.blocks": "{n} blocks",
    "in.empty": "Add a block below to start writing your message",
    "in.add": "Add block",
    "type.text": "Text",
    "type.header": "Header",
    "type.divider": "Divider",
    "type.fields": "Fields",
    "type.context": "Context",
    "type.image": "Image",
    "type.actions": "Buttons",
    "type.textButton": "Text + button",
    "blk.up": "Move up",
    "blk.down": "Move down",
    "blk.remove": "Remove block",
    "blk.divider": "Adds a horizontal rule to the message.",
    "ph.text": "Message text. Use *bold* _italic_ `code`",
    "ph.header": "Header (shown without formatting)",
    "ph.field": "*Label*\nValue",
    "ph.context": "Secondary info such as author or time",
    "field.add": "Add field",
    "field.remove": "Remove field",
    "img.url": "Image URL (public)",
    "img.alt": "Alt text (required)",
    "img.title": "Image title (optional)",
    "btn.add": "Add button",
    "btn.remove": "Remove button",
    "btn.text": "Button text",
    "btn.url": "Link URL (optional: makes a link button)",
    "btn.actionId": "action_id (optional)",
    "btn.value": "value (optional)",
    "btn.style": "Style",
    "style.default": "Default",
    "fmt.bold": "Bold",
    "fmt.italic": "Italic",
    "fmt.strike": "Strikethrough",
    "fmt.code": "Inline code",
    "fmt.pre": "Code block",
    "fmt.quote": "Quote",
    "fmt.list": "List",
    "fmt.link": "Link",
    "fmt.user": "Mention user",
    "fmt.channel": "Link channel",
    "fmt.here": "@here",
    "fmt.date": "Date (now)",
    "fb.label": "Fallback text (text)",
    "fb.hint": "Used in notifications, lock screens and screen readers.",
    "fb.auto": "Auto",
    "fb.reset": "Back to auto",
    "out.preview": "Preview",
    "out.channel": "Channel ID",
    "out.blocksOnly": "blocks only",
    "out.copy": "Copy code",
    "out.builder": "Open in Block Kit Builder",
    "out.builderNote": "Opens the Slack site in a new tab with the block JSON in the address.",
    "out.previewNote": "An approximation for checking structure. Real rendering varies by Slack client and theme.",
    "out.app": "Your App",
    "out.envNote": "The token is read from the {env} environment variable. Do not paste tokens into this page.",
    "status.blocks": "{n} blocks",
    "status.errors": "{n} errors",
    "status.warns": "{n} warnings",
    "issue.msg": "Message",
    "issue.block": "Block {n}",
    "issue.tooManyBlocks": "{actual} blocks. A message can hold up to {limit}.",
    "issue.empty": "{field}: empty.",
    "issue.tooLong": "{field}: {actual} characters (max {limit})",
    "issue.tooMany": "{field}: {actual} items (max {limit})",
    "issue.badUrl": "{field}: use an address starting with http:// or https://.",
    "issue.dupActionId": "Duplicate action_id within the same block.",
    "issue.fallbackEmpty": "Fallback text is empty, so notifications won't show the message.",
    "issue.fallbackLong": "Fallback text is {actual} characters. {limit} or fewer is recommended.",
    "f.text": "Text",
    "f.fields": "Fields",
    "f.url": "Image URL",
    "f.alt": "Alt text",
    "f.title": "Image title",
    "f.buttons": "Buttons",
    "f.button.text": "Button text",
    "f.button.url": "Button URL",
    "f.button.actionId": "action_id",
    "f.button.value": "value",
  },
};

type OutTab = "preview" | CodeTab;
type T = (k: string) => string;

const fill = (s: string, vars: Record<string, string | number | undefined>) =>
  s.replace(/\{(\w+)\}/g, (_, k: string) => String(vars[k] ?? ""));

export default function SlackMessageBuilder() {
  const { lang } = useLang();
  const t = useT(DICT);

  const [blocks, setBlocks] = useState<EditorBlock[]>(() => template("deploy", lang));
  const [manualFallback, setManualFallback] = useState<string | null>(null);
  const [tab, setTab] = useState<OutTab>("preview");
  const [channel, setChannel] = useState("");
  const [blocksOnly, setBlocksOnly] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    trackEvent("tool_view", { slug: SLUG, locale: lang });
  }, [lang]);

  const fallback = manualFallback ?? autoFallback(blocks);
  const payload = useMemo(() => buildPayload(blocks, fallback), [blocks, fallback]);
  const issues = useMemo(() => validate(blocks, fallback), [blocks, fallback]);
  const errors = issues.filter((i) => i.severity === "error").length;
  const warns = issues.length - errors;
  const code = tab === "preview" ? "" : buildCode(tab, payload, { channel, blocksOnly });

  function issueText(i: Issue): string {
    return fill(t(`issue.${i.code}`), {
      field: i.field ? t(`f.${i.field}`) : "",
      limit: i.limit?.toLocaleString(),
      actual: i.actual?.toLocaleString(),
    });
  }

  function update(idx: number, next: EditorBlock) {
    setBlocks((bs) => bs.map((b, i) => (i === idx ? next : b)));
  }
  function move(idx: number, dir: -1 | 1) {
    setBlocks((bs) => {
      const j = idx + dir;
      if (j < 0 || j >= bs.length) return bs;
      const out = bs.slice();
      [out[idx], out[j]] = [out[j], out[idx]];
      return out;
    });
  }
  function remove(idx: number) {
    setBlocks((bs) => bs.filter((_, i) => i !== idx));
  }
  function add(type: BlockType) {
    setBlocks((bs) => [...bs, newBlock(type)]);
  }
  function loadTemplate(id: TemplateId) {
    setBlocks(template(id, lang));
    setManualFallback(null);
  }
  function switchTab(next: OutTab) {
    setTab(next);
    setCopied(false);
    trackEvent("tool_run", { slug: SLUG, tab: next });
  }
  function copyCode() {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
      trackEvent("tool_result", { slug: SLUG, action: "copy", tab });
    });
  }

  const envName = tab === "webhook" ? "SLACK_WEBHOOK_URL" : "SLACK_BOT_TOKEN";

  return (
    <>
      <PageHead slug={SLUG} />

      <div className="ide sm-ide">
        {/* ── Toolbar ── */}
        <div className="ide-bar sm-bar">
          <div className="ide-title">
            <span className="dot" />
            <span className="name">slack-message</span>
            <span className="path">.json</span>
          </div>
          <div className="sm-tpls" role="group" aria-label={t("tpl.label")}>
            {TEMPLATE_IDS.map((id) => (
              <button key={id} type="button" className="btn-ide" onClick={() => loadTemplate(id)}>
                {t(`tpl.${id}`)}
              </button>
            ))}
          </div>
          <div className="spacer" />
          <button
            type="button"
            className="btn-ide"
            onClick={() => {
              setBlocks([]);
              setManualFallback(null);
            }}
          >
            {t("act.clear")}
          </button>
        </div>

        {/* ── Panes ── */}
        <div className="panes">
          {/* Left: editor */}
          <div className="pane pane-in">
            <div className="pane-head">
              <span className="pane-tab">
                <span className="tab-dot" />
                {t("in.panel")}
              </span>
              <div className="spacer" />
              <span className="pane-meta">{fill(t("in.blocks"), { n: blocks.length })}</span>
            </div>
            <div className="pane-body sm-in-body">
              {blocks.length === 0 && <p className="sm-empty">{t("in.empty")}</p>}
              <ol className="sm-blocks">
                {blocks.map((b, i) => (
                  <BlockCard
                    key={b.id}
                    block={b}
                    index={i}
                    count={blocks.length}
                    issues={issues.filter((x) => x.block === i)}
                    issueText={issueText}
                    onChange={(next) => update(i, next)}
                    onMove={(dir) => move(i, dir)}
                    onRemove={() => remove(i)}
                    t={t}
                  />
                ))}
              </ol>

              <div className="sm-add" role="group" aria-label={t("in.add")}>
                <span className="sm-add-lbl">{t("in.add")}</span>
                <div className="sm-add-chips">
                  {BLOCK_TYPES.map((type) => (
                    <button key={type} type="button" className="sm-chip" onClick={() => add(type)}>
                      + {t(`type.${type}`)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="sm-fallback">
                <div className="sm-fallback-head">
                  <label className="sm-label" htmlFor="sm-fallback">
                    {t("fb.label")}
                  </label>
                  {manualFallback === null ? (
                    <span className="sm-auto">{t("fb.auto")}</span>
                  ) : (
                    <button type="button" className="sm-link-btn" onClick={() => setManualFallback(null)}>
                      {t("fb.reset")}
                    </button>
                  )}
                </div>
                <textarea
                  id="sm-fallback"
                  className="sm-input sm-textarea sm-fallback-in"
                  value={fallback}
                  onChange={(e) => setManualFallback(e.target.value)}
                  rows={2}
                />
                <p className="sm-hint">{t("fb.hint")}</p>
              </div>
              <p className="sm-privacy">{t("common.privacy")}</p>
            </div>
          </div>

          {/* Right: output */}
          <div className="pane pane-out">
            <div className="sm-out-sticky">
              <div className="pane-head sm-out-head">
                <div className="sm-tabs" role="tablist" aria-label={t("out.preview")}>
                  {(["preview", ...CODE_TABS.map((c) => c.id)] as OutTab[]).map((id) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={id === tab}
                      className={"sm-tab" + (id === tab ? " is-active" : "")}
                      onClick={() => switchTab(id)}
                    >
                      {id === "preview" ? t("out.preview") : CODE_TABS.find((c) => c.id === id)?.label}
                    </button>
                  ))}
                </div>
              </div>

              {tab === "preview" ? (
                <div className="pane-body sm-out-body">
                  <SlackPreview blocks={blocks} appName={t("out.app")} />
                  <p className="sm-out-note">{t("out.previewNote")}</p>
                  <a
                    className="sm-builder"
                    href={blockKitBuilderUrl(payload)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={t("out.builderNote")}
                  >
                    {t("out.builder")} ↗
                  </a>
                  <p className="sm-out-note">{t("out.builderNote")}</p>
                </div>
              ) : (
                <div className="pane-body sm-out-body sm-code-body">
                  <div className="sm-code-opts">
                    {(tab === "curl" || tab === "node" || tab === "python") && (
                      <label className="sm-opt">
                        <span>{t("out.channel")}</span>
                        <input
                          className="sm-opt-in"
                          value={channel}
                          onChange={(e) => setChannel(e.target.value)}
                          placeholder={CHANNEL_PLACEHOLDER}
                          spellCheck={false}
                          autoComplete="off"
                        />
                      </label>
                    )}
                    {tab === "json" && (
                      <label className="sm-opt sm-check">
                        <input type="checkbox" checked={blocksOnly} onChange={(e) => setBlocksOnly(e.target.checked)} />
                        <span>{t("out.blocksOnly")}</span>
                      </label>
                    )}
                    <div className="spacer" />
                    <button type="button" className="btn-ide primary" onClick={copyCode}>
                      {copied ? <CheckIcon /> : <CopyIcon />}
                      {copied ? t("common.copied") : t("out.copy")}
                    </button>
                  </div>
                  {tab !== "json" && <p className="sm-env">{fill(t("out.envNote"), { env: envName })}</p>}
                  <CodeBlock code={code} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Issues ── */}
        {issues.length > 0 && (
          <ul className="sm-issues" aria-live="polite">
            {issues.map((i, k) => (
              <li key={k} className={"sm-issue is-" + i.severity}>
                <span className="sm-issue-where">
                  {i.block === null ? t("issue.msg") : fill(t("issue.block"), { n: i.block + 1 })}
                </span>
                {issueText(i)}
              </li>
            ))}
          </ul>
        )}

        {/* ── Status bar ── */}
        <div className="ide-status">
          {errors > 0 ? (
            <span className="status-pill err">error</span>
          ) : warns > 0 ? (
            <span className="status-pill idle">warn</span>
          ) : (
            <span className="status-pill ok">valid</span>
          )}
          <span>{fill(t("status.blocks"), { n: blocks.length })}</span>
          {errors > 0 && <span className="err-detail">{fill(t("status.errors"), { n: errors })}</span>}
          {warns > 0 && <span>{fill(t("status.warns"), { n: warns })}</span>}
        </div>
      </div>

      <ToolGuide slug={SLUG} />
      <Faq slug={SLUG} />
      <RelatedTools slug={SLUG} />
    </>
  );
}

/* ── Block editor ── */

const BLOCK_KIT_TYPE: Record<BlockType, string> = {
  text: "section",
  header: "header",
  divider: "divider",
  fields: "section · fields",
  context: "context",
  image: "image",
  actions: "actions",
  textButton: "section · accessory",
};

function BlockCard({
  block,
  index,
  count,
  issues,
  issueText,
  onChange,
  onMove,
  onRemove,
  t,
}: {
  block: EditorBlock;
  index: number;
  count: number;
  issues: Issue[];
  issueText: (i: Issue) => string;
  onChange: (b: EditorBlock) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
  t: T;
}) {
  const label = t(`type.${block.type}`);
  let body: ReactNode = null;

  switch (block.type) {
    case "text":
      body = (
        <MrkdwnArea value={block.text} onChange={(text) => onChange({ ...block, text })} placeholder={t("ph.text")} label={label} t={t} />
      );
      break;
    case "context":
      body = (
        <MrkdwnArea value={block.text} onChange={(text) => onChange({ ...block, text })} placeholder={t("ph.context")} label={label} t={t} compact />
      );
      break;
    case "header":
      body = (
        <input
          className="sm-input sm-header-in"
          value={block.text}
          onChange={(e) => onChange({ ...block, text: e.target.value })}
          placeholder={t("ph.header")}
          aria-label={label}
        />
      );
      break;
    case "divider":
      body = <p className="sm-hint">{t("blk.divider")}</p>;
      break;
    case "fields":
      body = (
        <div className="sm-fields">
          {block.fields.map((f, fi) => (
            <div key={fi} className="sm-field">
              <MrkdwnArea
                value={f}
                onChange={(v) => onChange({ ...block, fields: block.fields.map((x, k) => (k === fi ? v : x)) })}
                placeholder={t("ph.field")}
                label={`${label} ${fi + 1}`}
                t={t}
                compact
              />
              <button
                type="button"
                className="sm-icon-btn"
                aria-label={`${t("field.remove")} ${fi + 1}`}
                onClick={() => onChange({ ...block, fields: block.fields.filter((_, k) => k !== fi) })}
              >
                ✕
              </button>
            </div>
          ))}
          <button type="button" className="sm-link-btn" onClick={() => onChange({ ...block, fields: [...block.fields, ""] })}>
            + {t("field.add")}
          </button>
        </div>
      );
      break;
    case "image":
      body = (
        <div className="sm-grid">
          <TextField label={t("img.url")} value={block.url} onChange={(url) => onChange({ ...block, url })} mono />
          <TextField label={t("img.alt")} value={block.alt} onChange={(alt) => onChange({ ...block, alt })} />
          <TextField label={t("img.title")} value={block.title} onChange={(title) => onChange({ ...block, title })} />
        </div>
      );
      break;
    case "actions":
      body = (
        <div className="sm-buttons">
          {block.buttons.map((btn, bi) => (
            <ButtonEditor
              key={btn.id}
              button={btn}
              onChange={(nb) => onChange({ ...block, buttons: block.buttons.map((x, k) => (k === bi ? nb : x)) })}
              onRemove={() => onChange({ ...block, buttons: block.buttons.filter((_, k) => k !== bi) })}
              t={t}
            />
          ))}
          <button
            type="button"
            className="sm-link-btn"
            onClick={() => onChange({ ...block, buttons: [...block.buttons, newButton()] })}
          >
            + {t("btn.add")}
          </button>
        </div>
      );
      break;
    case "textButton":
      body = (
        <>
          <MrkdwnArea value={block.text} onChange={(text) => onChange({ ...block, text })} placeholder={t("ph.text")} label={label} t={t} />
          <ButtonEditor button={block.button} onChange={(button) => onChange({ ...block, button })} t={t} />
        </>
      );
      break;
  }

  return (
    <li className={"sm-block" + (issues.some((i) => i.severity === "error") ? " has-error" : "")}>
      <div className="sm-block-head">
        <span className="sm-block-no">{index + 1}</span>
        <span className="sm-block-type">{label}</span>
        <code className="sm-block-kit">{BLOCK_KIT_TYPE[block.type]}</code>
        <span className="spacer" />
        <button type="button" className="sm-icon-btn" aria-label={t("blk.up")} disabled={index === 0} onClick={() => onMove(-1)}>
          ↑
        </button>
        <button type="button" className="sm-icon-btn" aria-label={t("blk.down")} disabled={index === count - 1} onClick={() => onMove(1)}>
          ↓
        </button>
        <button type="button" className="sm-icon-btn" aria-label={t("blk.remove")} onClick={onRemove}>
          ✕
        </button>
      </div>
      <div className="sm-block-body">{body}</div>
      {issues.length > 0 && (
        <ul className="sm-block-issues">
          {issues.map((i, k) => (
            <li key={k}>{issueText(i)}</li>
          ))}
        </ul>
      )}
    </li>
  );
}

function TextField({
  label,
  value,
  onChange,
  mono = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  mono?: boolean;
}) {
  return (
    <label className="sm-tf">
      <span className="sm-tf-lbl">{label}</span>
      <input
        className={"sm-input" + (mono ? " kf-mono" : "")}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={!mono}
        autoComplete="off"
      />
    </label>
  );
}

function ButtonEditor({
  button,
  onChange,
  onRemove,
  t,
}: {
  button: EditorButton;
  onChange: (b: EditorButton) => void;
  onRemove?: () => void;
  t: T;
}) {
  const set = (patch: Partial<EditorButton>) => onChange({ ...button, ...patch });
  return (
    <div className="sm-btn-ed">
      <div className="sm-grid">
        <TextField label={t("btn.text")} value={button.text} onChange={(text) => set({ text })} />
        <label className="sm-tf">
          <span className="sm-tf-lbl">{t("btn.style")}</span>
          <select className="sm-input" value={button.style} onChange={(e) => set({ style: e.target.value as ButtonStyle })}>
            <option value="">{t("style.default")}</option>
            <option value="primary">primary</option>
            <option value="danger">danger</option>
          </select>
        </label>
        <TextField label={t("btn.url")} value={button.url} onChange={(url) => set({ url })} mono />
        <TextField label={t("btn.actionId")} value={button.actionId} onChange={(actionId) => set({ actionId })} mono />
        <TextField label={t("btn.value")} value={button.value} onChange={(value) => set({ value })} mono />
      </div>
      {onRemove && (
        <button type="button" className="sm-link-btn sm-btn-remove" onClick={onRemove}>
          {t("btn.remove")}
        </button>
      )}
    </div>
  );
}

/* ── mrkdwn textarea + toolbar ── */

function MrkdwnArea({
  value,
  onChange,
  placeholder,
  label,
  t,
  compact = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  label: string;
  t: T;
  compact?: boolean;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);

  /** 선택 영역을 바꾸고 커서를 [selStart, selEnd] 로 옮긴다 */
  function apply(next: string, selStart: number, selEnd: number) {
    onChange(next);
    requestAnimationFrame(() => {
      const el = ref.current;
      if (!el) return;
      el.focus();
      el.setSelectionRange(selStart, selEnd);
    });
  }

  function wrap(before: string, after: string, fallback: string) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const inner = value.slice(s, e) || fallback;
    apply(value.slice(0, s) + before + inner + after + value.slice(e), s + before.length, s + before.length + inner.length);
  }

  /** 선택한 줄마다 앞에 붙인다 (인용·목록) */
  function prefixLines(prefix: string) {
    const el = ref.current;
    if (!el) return;
    const s = value.lastIndexOf("\n", el.selectionStart - 1) + 1;
    const e = el.selectionEnd;
    const lines = value.slice(s, e).split("\n").map((l) => prefix + l).join("\n");
    apply(value.slice(0, s) + lines + value.slice(e), s, s + lines.length);
  }

  /** 토큰을 넣고 그 안의 자리표시 부분을 선택한다 */
  function insert(token: string, select?: string) {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: e } = el;
    const at = select ? token.indexOf(select) : token.length;
    apply(value.slice(0, s) + token + value.slice(e), s + at, s + at + (select?.length ?? 0));
  }

  function link() {
    const el = ref.current;
    if (!el) return;
    const sel = value.slice(el.selectionStart, el.selectionEnd);
    insert(sel ? `<https://|${sel}>` : "<https://>", "https://");
  }

  function date() {
    const now = Math.floor(Date.now() / 1000);
    const iso = new Date(now * 1000).toISOString().slice(0, 16).replace("T", " ");
    insert(`<!date^${now}^{date_short_pretty} {time}|${iso} UTC>`);
  }

  const tools: { key: string; glyph: string; run: () => void; full?: boolean }[] = [
    { key: "bold", glyph: "B", run: () => wrap("*", "*", "text") },
    { key: "italic", glyph: "I", run: () => wrap("_", "_", "text") },
    { key: "strike", glyph: "S", run: () => wrap("~", "~", "text") },
    { key: "code", glyph: "</>", run: () => wrap("`", "`", "code") },
    { key: "link", glyph: "🔗", run: link },
    { key: "user", glyph: "@", run: () => insert("<@U0123456789>", "U0123456789") },
    { key: "channel", glyph: "#", run: () => insert("<#C0123456789>", "C0123456789") },
    { key: "pre", glyph: "```", run: () => wrap("```\n", "\n```", "code"), full: true },
    { key: "quote", glyph: ">", run: () => prefixLines("> "), full: true },
    { key: "list", glyph: "•", run: () => prefixLines("• "), full: true },
    { key: "here", glyph: "@here", run: () => insert("<!here>"), full: true },
    { key: "date", glyph: "📅", run: date, full: true },
  ];

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!(e.metaKey || e.ctrlKey)) return;
    const k = e.key.toLowerCase();
    const map: Record<string, () => void> = {
      b: () => wrap("*", "*", "text"),
      i: () => wrap("_", "_", "text"),
      e: () => wrap("`", "`", "code"),
      k: link,
    };
    if (e.shiftKey && k === "x") {
      e.preventDefault();
      wrap("~", "~", "text");
    } else if (!e.shiftKey && map[k]) {
      e.preventDefault();
      map[k]();
    }
  }

  return (
    <div className={"sm-md" + (compact ? " is-compact" : "")}>
      <div className="sm-md-bar" role="toolbar" aria-label={label}>
        {tools
          .filter((x) => !compact || !x.full)
          .map((x) => (
            <button
              key={x.key}
              type="button"
              className={"sm-md-btn sm-md-" + x.key}
              title={t(`fmt.${x.key}`)}
              aria-label={t(`fmt.${x.key}`)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={x.run}
            >
              {x.glyph}
            </button>
          ))}
      </div>
      <textarea
        ref={ref}
        className="sm-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        aria-label={label}
        rows={compact ? 2 : 3}
      />
    </div>
  );
}

/* ── Slack-like preview ── */

function SlackPreview({ blocks, appName }: { blocks: EditorBlock[]; appName: string }) {
  return (
    <div className="sm-slack">
      <div className="sm-slack-avatar" aria-hidden="true">
        A
      </div>
      <div className="sm-slack-main">
        <div className="sm-slack-meta">
          <strong>{appName}</strong>
          <span className="sm-slack-app">APP</span>
          <span className="sm-slack-time">10:24</span>
        </div>
        {blocks.map((b) => (
          <PreviewBlock key={b.id} block={b} />
        ))}
      </div>
    </div>
  );
}

function PreviewBlock({ block: b }: { block: EditorBlock }) {
  switch (b.type) {
    case "header":
      return <div className="sm-p-header">{b.text}</div>;
    case "text":
      return <Mrkdwn src={b.text} className="sm-p-section" />;
    case "divider":
      return <hr className="sm-p-divider" />;
    case "fields":
      return (
        <div className="sm-p-fields">
          {b.fields.map((f, i) => (
            <Mrkdwn key={i} src={f} />
          ))}
        </div>
      );
    case "context":
      return <Mrkdwn src={b.text} className="sm-p-context" />;
    case "image":
      return (
        <figure className="sm-p-image">
          {b.title && <figcaption>{b.title}</figcaption>}
          {/^https?:\/\//i.test(b.url) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={b.url} alt={b.alt} loading="lazy" referrerPolicy="no-referrer" />
          ) : (
            <div className="sm-p-image-ph">{b.alt || "image"}</div>
          )}
        </figure>
      );
    case "actions":
      return (
        <div className="sm-p-actions">
          {b.buttons.map((btn) => (
            <PreviewButton key={btn.id} button={btn} />
          ))}
        </div>
      );
    case "textButton":
      return (
        <div className="sm-p-accessory">
          <Mrkdwn src={b.text} className="sm-p-section" />
          <PreviewButton button={b.button} />
        </div>
      );
  }
}

function PreviewButton({ button }: { button: EditorButton }) {
  return (
    <span className={"sm-p-btn" + (button.style ? " is-" + button.style : "")}>
      {button.text || "Button"}
      {button.url && <span aria-hidden="true"> ↗</span>}
    </span>
  );
}

function Mrkdwn({ src, className }: { src: string; className?: string }) {
  const lines = parseMrkdwn(src);
  return (
    <div className={"sm-p-md" + (className ? " " + className : "")}>
      {lines.map((l, i) =>
        l.t === "pre" ? (
          <pre key={i} className="sm-p-pre">
            {l.v}
          </pre>
        ) : l.t === "quote" ? (
          <div key={i} className="sm-p-quote">
            {renderInline(l.c)}
          </div>
        ) : (
          <div key={i} className="sm-p-line">
            {l.c.length ? renderInline(l.c) : " "}
          </div>
        ),
      )}
    </div>
  );
}

function renderInline(nodes: Inline[]): ReactNode[] {
  return nodes.map((n, i) => {
    switch (n.t) {
      case "text":
        return <span key={i}>{n.v}</span>;
      case "code":
        return (
          <code key={i} className="sm-p-code">
            {n.v}
          </code>
        );
      case "b":
        return <strong key={i}>{renderInline(n.c)}</strong>;
      case "i":
        return <em key={i}>{renderInline(n.c)}</em>;
      case "s":
        return <del key={i}>{renderInline(n.c)}</del>;
      case "link":
        return (
          <a key={i} href={n.href} target="_blank" rel="noopener noreferrer nofollow">
            {n.label}
          </a>
        );
      case "mention":
        return (
          <span key={i} className="sm-p-mention">
            {n.v}
          </span>
        );
    }
  });
}

/* ── Code ── */

function CodeBlock({ code }: { code: string }) {
  const lines = code.split("\n");
  return (
    <div className="sm-code-scroll">
      <div className="gutter" aria-hidden="true">
        {lines.map((_, i) => i + 1).join("\n")}
      </div>
      <pre className="code-pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="5" y="5" width="9" height="9" rx="2" />
      <path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 8l3.5 3.5L13 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
