# 기획서: 슬랙 메시지 빌더 (2026-10-20 초안)

> 상태: 📝 기획 · 미착수 · 출시 시 `indexable: false` 로 추가하고 노출을 본 뒤 승격
> Slack 공식 문서 대조: **미완료** (3.4 의 제한값은 착수 전에 docs.slack.dev 원문과 대조한다)

## 1. 한 줄 정의

**슬랙 메시지 빌더는 슬랙에서 메시지를 쓰듯 에디터에 봇 메시지를 작성하면, 슬랙 미리보기와 함께
Block Kit JSON 과 바로 붙여 쓸 수 있는 API 호출 코드(curl · Node.js · Python · Incoming Webhook)를
만들어 주는 도구다.**

Block Kit JSON 을 손으로 쓰거나, 공식 Block Kit Builder 에서 블록을 하나씩 조립하지 않아도 된다.
로그인·워크스페이스 연결·토큰 입력이 없고, 작성한 내용은 브라우저 밖으로 나가지 않는다.

## 2. 검색 의도와 사용자

| 항목 | 내용 |
|---|---|
| 주 검색 의도 | "slack block kit builder" · "slack message builder" (메시지 모양을 만들고 JSON 을 얻고 싶다) |
| 보조 의도 | "slack webhook message format" · "slack mrkdwn" · "chat.postMessage blocks example" · "slack bot message json" · "슬랙 봇 메시지 만들기" · "슬랙 웹훅 메시지 포맷" |
| 사용자 | 배포·장애 알림 봇을 만드는 개발자, 릴리즈 노트·공지 봇을 운영하는 PM, 사내 자동화(Zapier·n8n·GitHub Actions)에 슬랙 알림을 붙이는 실무자 |
| 반복 상황 | 새 알림 메시지 추가 · 기존 알림 문구 수정 · 웹훅 페이로드 디버깅 · 문서에 메시지 예제 첨부 |
| 타겟 태그 | `developer` · `pm` |

- 검색 수요는 영문이 중심이다. EN 페이지를 주 랜딩으로 보고 카피를 쓴다.
- 공식 Block Kit Builder 는 슬랙 로그인이 필요하고 블록 단위 조립 + JSON 편집 중심이다.
  우리 차별점은 **① 메시지처럼 쓰는 에디터 ② 언어별 호출 코드까지 한 번에 ③ 로그인 없음** 세 가지다.

## 3. 변환 규칙

### 3.1 에디터 모델 → Block Kit

에디터는 **블록 리스트** 형태다 (노션식). 각 블록은 Block Kit 블록 하나에 1:1 대응한다.
contenteditable 기반 리치 에디터는 하루 구현 범위를 넘고 붙여넣기·커서 버그가 많아 쓰지 않는다.
텍스트 블록은 textarea 이고, 툴바 버튼과 단축키가 선택 영역을 mrkdwn 문법으로 감싼다.

| 에디터 블록 | Block Kit | 비고 |
|---|---|---|
| 텍스트 | `section` + `text: { type: "mrkdwn" }` | 기본 블록 |
| 제목 | `header` + `plain_text` | mrkdwn 미지원 (서식 버튼 비활성) |
| 구분선 | `divider` | |
| 필드 | `section` + `fields[]` (mrkdwn) | 2열 키·값 표시 (예: 환경 · 버전) |
| 보조 문구 | `context` + `elements[]` (mrkdwn) | 작은 회색 글씨 (작성자 · 시각) |
| 이미지 | `image` (`image_url` · `alt_text`) | 공개 URL 만 가능 |
| 버튼 묶음 | `actions` + `button[]` | 링크 버튼(`url`) 또는 액션 버튼(`action_id` · `value`), 스타일 `primary` · `danger` |
| 텍스트 + 버튼 | `section` + `accessory: button` | 한 줄 CTA |

- 블록 순서는 드래그 대신 **위·아래 이동 버튼**으로 바꾼다 (모바일·키보드 접근성).
- 출력은 **`section` + mrkdwn** 을 기본으로 한다. 웹훅·구형 클라이언트·대부분의 라이브러리 예제와
  호환되고 JSON 이 짧다. `rich_text` 블록 출력은 v2 후보 (8장 3번).

### 3.2 mrkdwn 서식 (툴바 · 단축키)

| 서식 | 문법 | 단축키 |
|---|---|---|
| 굵게 | `*텍스트*` | Ctrl/Cmd + B |
| 기울임 | `_텍스트_` | Ctrl/Cmd + I |
| 취소선 | `~텍스트~` | Ctrl/Cmd + Shift + X |
| 인라인 코드 | `` `코드` `` | Ctrl/Cmd + E |
| 코드 블록 | ```` ```코드``` ```` | |
| 인용 | 줄 앞 `>` | |
| 목록 | 줄 앞 `• ` (mrkdwn 에 목록 문법이 없어 문자로 넣는다) | |
| 링크 | `<https://example.com|표시 텍스트>` | Ctrl/Cmd + K |
| 사용자 멘션 | `<@U0123456789>` | |
| 채널 링크 | `<#C0123456789>` | |
| 특수 멘션 | `<!here>` · `<!channel>` | |
| 날짜 | `<!date^1700000000^{date_short_pretty} {time}|fallback>` | |

- **이스케이프**: 사용자가 입력한 일반 텍스트의 `&` `<` `>` 는 `&amp;` `&lt;` `&gt;` 로 바꾼다.
  링크·멘션·날짜처럼 툴바로 넣은 토큰은 바꾸지 않는다. 그래서 에디터 내부 모델은 문자열 하나가 아니라
  "일반 텍스트 조각 + 토큰" 으로 들고 있다가 직렬화 시점에 이스케이프한다.
- 멘션·채널은 이름을 ID 로 바꿀 수 없다 (API 호출 없음). ID 입력란을 띄우고, 미리보기는 `@U0123…` 칩으로 그린다.
  ID 찾는 법(프로필 → 멤버 ID 복사)을 가이드와 FAQ 에 적는다.
- 날짜 토큰은 **슬랙 타임스탬프 변환기와 같은 포맷 엔진**을 재사용한다 (`/slack-timestamp-converter`).

### 3.3 대체 텍스트 (`text`)

`blocks` 가 있어도 최상위 `text` 는 알림·잠금 화면·스크린 리더에 쓰인다. 빠지면 chat.postMessage 가
경고를 낸다.

- 기본값: 블록에서 **자동 생성** (헤더 + 첫 텍스트 블록, mrkdwn 기호 제거, 150자 내외로 자름)
- 사용자가 직접 고치면 자동 생성을 멈추고 "자동으로 되돌리기" 버튼을 보여준다.

### 3.4 제한값 검사 (착수 전 공식 문서 대조 필요)

생성 즉시 아래를 검사해 블록 옆과 출력 상단에 경고로 띄운다. 초과해도 코드는 만든다 (막지 않고 알린다).

| 대상 | 제한 (초안 · 대조 전) |
|---|---|
| 메시지당 블록 | 50개 |
| `section.text` | 3,000자 |
| `section.fields` | 10개 · 각 2,000자 |
| `header.text` | 150자 |
| `context.elements` | 10개 |
| `actions.elements` | 25개 |
| 버튼 텍스트 | 75자 |
| `action_id` | 255자 · 메시지 안에서 고유 |
| 버튼 `value` | 2,000자 |
| URL (`url` · `image_url`) | 3,000자 |
| 최상위 `text` | 4,000자 권장 (넘으면 잘림) |

- 이 값은 외부 기준이므로 `app/lib/slackmsg/limits.ts` 한 곳에 두고, `sources.ts` 의 `verifiedAt` 과 함께 관리한다.

## 4. 화면 구성 (Layout B · IDE)

```
┌ 인풋 (화이트) ─────────────────────┬ 출력 (다크) ──────────────────────────┐
│ [텍스트][제목][구분선][필드]...+     │ [미리보기] [JSON] [curl] [Node] [Python] │
│ ┌ 제목 ───────────────── ↑ ↓ ✕ ┐  │  [Webhook]                             │
│ │ 🚀 v2.4.0 배포 완료             │  │ ┌───────────────────────────────────┐ │
│ └───────────────────────────────┘  │ │ curl -X POST https://slack.com/... │ │
│ ┌ 텍스트 ── [B][I][S][</>][🔗][@] ┐ │ │   -H "Authorization: Bearer $SLA…" │ │
│ │ *production* 에 배포되었습니다.  │  │ │   --data '{"channel": ...          │ │
│ └───────────────────────────────┘  │ └───────────────────────────────────┘ │
│ ┌ 버튼 묶음 ──────────────────────┐ │ ⚠ 대체 텍스트를 확인하세요               │
│ │ [변경 사항 보기 ↗] [롤백 (danger)] │ │ 채널 [ C0123456789 ]  [복사]          │
│ └───────────────────────────────┘  │                                        │
│ 대체 텍스트 [ v2.4.0 배포 완료 ... ] │                                        │
│ 템플릿: [배포 알림][장애][릴리즈노트]  │                                        │
└────────────────────────────────────┴────────────────────────────────────────┘
```

- **미리보기 탭**: 출력 다크 박스 안에 슬랙 메시지 모양의 라이트 카드를 그린다 (봇 이름 · 아바타 자리 · 블록).
  픽셀 단위 복제가 아니라 구조 확인용이다. "실제 렌더는 공식 Block Kit Builder 로 확인" 링크를 둔다
  (JSON 을 URL 해시에 담아 새 탭으로 연다. 사용자가 누를 때만 나간다는 점을 버튼 옆에 적는다).
- 코드 탭은 `?lang=` 이 아니라 컴포넌트 상태로 전환한다 (같은 페이지 · 같은 검색 의도라 쿼리 분리 불필요).
- 채널 ID 입력은 출력 쪽에만 있다 (메시지 내용이 아니라 호출 파라미터라서).
- **토큰 입력란은 만들지 않는다.** 코드는 `$SLACK_BOT_TOKEN` · `process.env.SLACK_BOT_TOKEN` ·
  `os.environ["SLACK_BOT_TOKEN"]` 환경 변수를 읽는다. 실제 토큰을 페이지에 붙여넣는 습관을 만들지 않기 위해서다.
- **템플릿 3종**: 배포 알림 · 장애 알림 · 릴리즈 노트. 빈 에디터로 시작하지 않게 첫 진입 시 배포 알림을 채운다.
- 모바일: 인풋 위 → 출력 아래. 블록 추가 버튼 줄은 가로 스크롤 칩.

### 4.1 코드 출력

| 탭 | 내용 |
|---|---|
| JSON | `{ text, blocks }` 페이로드. 토글로 `blocks` 배열만 보기 (Block Kit Builder · Bolt `say()` 용) |
| curl | `chat.postMessage` (Bearer 토큰 · `Content-type: application/json; charset=utf-8`) |
| Node.js | `@slack/web-api` `WebClient.chat.postMessage` |
| Python | `slack_sdk` `WebClient.chat_postMessage` |
| Webhook | Incoming Webhook URL 로 POST 하는 curl (`$SLACK_WEBHOOK_URL`, 채널 파라미터 없음) |

- 직렬화는 탭마다 따로 한다. curl 은 작은따옴표 안 `'` 를 `'\''` 로, Python 은 JSON 이 아니라
  **dict 리터럴**(`True` · `False` · `None`)로 쓴다. 이 부분이 버그가 가장 나기 쉬워 테스트를 집중한다 (6장).
- KST UTC 변환기의 `snippets.ts` 와 같은 구조: 함수 본문은 고정, 페이로드만 입력에서 들어간다.

### v1 범위 밖 (v2 후보)

- **JSON 가져오기** (기존 페이로드 붙여넣기 → 에디터로 복원). 8장 2번 결정에 따라 v1 으로 당길 수 있다
- `rich_text` 블록 출력 (목록·중첩 서식이 정확하지만 JSON 이 길다)
- 셀렉트·오버플로·날짜 선택기 등 버튼 외 인터랙티브 요소, `input` 블록 (모달 전용)
- 모달·App Home 뷰 (블록 한도·허용 블록이 다르다)
- 스레드 답글(`thread_ts`) · 예약 발송(`chat.scheduleMessage`) 코드
- 초안 공유 URL (페이로드를 URL 해시에 압축)
- 실제 발송 (브라우저에서 토큰으로 API 호출): **하지 않는다.** 토큰 노출·CORS 문제, "서버로 보내지 않는다" 전제와 충돌

## 5. 데이터·코드 구조

```
app/lib/slackmsg/
  model.ts         에디터 블록 타입 · 텍스트 조각/토큰 모델
  mrkdwn.ts        조각 → mrkdwn 직렬화 · 이스케이프 · 대체 텍스트 생성(서식 제거)
  blocks.ts        에디터 모델 → Block Kit JSON
  limits.ts        제한값 상수 + validate(blocks) → 경고 목록
  snippets.ts      JSON · curl · Node · Python · Webhook 코드 생성
  templates.ts     배포 · 장애 · 릴리즈 노트 템플릿 (ko/en)
  sources.ts       SLACKMSG_VERIFIED_AT · SLACKMSG_SOURCES
  __tests__/*.test.ts
app/components/SlackMessageBuilder.tsx
app/slack-message-builder/page.tsx (+ opengraph-image.tsx)
app/en/slack-message-builder/page.tsx (+ opengraph-image.tsx)
```

- 새 의존성 없음. 마크다운 파서(`marked`)도 쓰지 않는다 (mrkdwn 은 마크다운과 문법이 다르다).
- 미리보기 렌더러는 mrkdwn → React 노드로 직접 그린다 (`dangerouslySetInnerHTML` 쓰지 않음).
- 계측: `trackEvent` 의 `tool_run`(코드 탭 전환) · `tool_result`(복사, 탭 이름만) · `tool_error`(제한 초과 종류).
  **메시지 내용·채널 ID 는 어떤 파라미터로도 보내지 않는다.**

## 6. 테스트 항목

- 블록 매핑: 에디터 블록 8종 → 기대 JSON (스냅샷이 아니라 필드 단위 비교)
- 이스케이프: 일반 텍스트 `a < b & c > d` → `a &lt; b &amp; c &gt; d`, 링크·멘션 토큰은 그대로
- 링크 표시 텍스트에 `|` · `>` 가 들어간 경우
- 대체 텍스트: 서식 기호 제거 · 멘션은 `@U…` 로 · 길이 자르기 · 수동 수정 후 자동 생성 중지
- 제한값: 각 경계값(한도 · 한도+1)에서 경고 유무, `action_id` 중복 감지
- 코드 생성 왕복 검사 (핵심):
  - curl · Webhook: 생성 문자열에서 `--data '...'` 부분을 셸 규칙대로 풀어 `JSON.parse` → 원래 페이로드와 같다
  - Python: dict 리터럴을 JSON 으로 되돌려(`True`→`true` 등) 비교, `'` · `\` · 줄바꿈 · 이모지 · 한글 포함 표본
  - Node: 객체 리터럴을 `JSON.parse` 가능한 형태로 비교
- 템플릿 3종이 모두 제한값 검사를 경고 없이 통과
- 문장부호 규칙 (`typography.test.ts`)

## 7. 콘텐츠 골격 (content.ts · ko/en)

| 필드 | 방향 |
|---|---|
| name | 슬랙 메시지 빌더 / Slack Message Builder |
| seo.title | 슬랙 메시지 빌더 \| Block Kit JSON·API 코드 생성 / Slack Message Builder \| Block Kit JSON & API Code |
| keywords | slack block kit builder · slack message builder · slack webhook message · chat.postMessage blocks · slack mrkdwn · 슬랙 봇 메시지 · 슬랙 웹훅 · 블록킷 |
| aeo | What: 에디터로 쓴 메시지를 Block Kit JSON 과 API 호출 코드로 변환 · Who: 알림 봇을 만드는 개발자·PM · How: 블록 단위 에디터 → mrkdwn 직렬화 → 언어별 코드 · Why: JSON 을 손으로 쓰지 않고, 로그인 없이, 바로 붙여 넣을 코드를 얻기 위해 |
| guide (2+) | ① Block Kit 은 무엇이고 section · header · context · actions 는 언제 쓰나 ② mrkdwn 은 마크다운과 무엇이 다른가 (`*굵게*`, 목록 없음, 링크 문법, 이스케이프) ③ chat.postMessage 와 Incoming Webhook 중 무엇을 쓰나 (토큰·채널 지정·권한 차이) |
| examples (1+) | 배포 완료 알림 (헤더 + 필드 + 링크 버튼) · 장애 알림 (danger 버튼 + 담당자 멘션) · 주간 릴리즈 노트 (목록 + 보조 문구) |
| limitations (2+) | 메시지 모양만 만들고 실제로 보내지 않음 · 버튼 클릭 처리는 앱의 Interactivity 설정과 응답 서버가 필요 · 멘션은 이름이 아니라 ID 필요 · 미리보기는 근사치(실제 렌더는 클라이언트·테마마다 다름) · 모달·App Home·셀렉트 등 v1 미지원 · 이미지는 공개 URL 만 |
| faq (4~6) | 슬랙 웹훅 메시지 형식은 · 대체 텍스트(text)는 왜 필요한가 · 굵게가 `**` 로 안 되는 이유 · 사용자를 멘션하려면 · 버튼을 눌렀는데 아무 일도 없을 때 · 토큰을 입력하지 않아도 되나 |
| sources | Slack 공식 문서: Block Kit 블록 레퍼런스 · mrkdwn 포맷 · chat.postMessage · Incoming Webhooks (`verifiedAt` 필수) |
| relatedTools | `slack-timestamp-converter` · `json-formatter` · `kst-utc-converter` |

- 슬랙 타임스탬프 변환기의 relatedTools 에도 이 도구를 추가한다 (양방향 연결).
- 이름에 "Block Kit Builder" 를 쓰지 않는다. 공식 제품명이라 사칭으로 읽힐 수 있다. 키워드·본문에서만 설명어로 쓴다.
- 문장부호 규칙(엠대시·엔대시 금지)을 지킨다.

## 8. 결정이 필요한 항목

1. **slug**: `slack-message-builder` (제안) 또는 `slack-block-kit-generator`
2. **JSON 가져오기를 v1 에 넣을지**: 제안은 v2. 지원 블록만 복원하고 나머지는 "편집 불가 블록"으로
   보존해야 해서 하루 범위를 넘는다. 다만 "기존 알림 수정" 수요가 크면 당긴다
3. **출력 기본값**: `section` + mrkdwn (제안) 또는 `rich_text`
4. **코드 언어 범위**: 위 5탭 (제안). Java · Go 는 수요를 보고 추가
5. **카테고리**: 개발(IDE) (제안). PM 도 쓰지만 결과물이 코드라서

## 9. 착수 전 체크

- [ ] 3.4 제한값을 docs.slack.dev Block Kit 레퍼런스 원문과 대조, `verifiedAt` 기록
- [ ] mrkdwn 이스케이프·링크·날짜 문법 원문 대조
- [ ] chat.postMessage 의 `text` 누락 경고 동작 · Incoming Webhook 의 `channel` 무시 여부 대조
- [ ] `@slack/web-api` · `slack_sdk` 현재 메이저 버전의 호출 시그니처 확인
- [ ] 공식 Block Kit Builder 의 URL 해시 열기 방식이 지금도 동작하는지 확인
- [ ] 키워드 검색량 확인 (영문 중심 · 네이버는 보조)
- [ ] 8장 결정 항목 합의
