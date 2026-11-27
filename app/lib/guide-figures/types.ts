/* ============================================================
   가이드 도해(Guide figure) 타입

   도구 상세의 사용 가이드는 실제 화면 일부를 다시 그린 목업에
   번호 마커(①②③)를 달고, 그 아래에 같은 번호로 설명을 붙인다.
   목업은 실제 입력 요소가 아니라 그림이다 (렌더러가 aria-hidden 처리).
   정보는 번호별 설명(notes)이 전부 담아야 한다.

   - 마커 번호 m 은 1부터 빠짐없이 이어지고, 같은 번호는 한 번만 쓴다.
   - notes[i] 가 마커 i+1 의 설명이다. 마커 수 = notes 수.
   - 라벨·값은 실제 화면의 라벨과 같게 쓴다 (화면이 바뀌면 함께 고친다).
   ============================================================ */
import type { Lang } from "../content";

type Mark = { m?: number };
type LabelValue = { label: string; value: string };

export type FigurePart = Mark & (
  /** 카드 상단 제목 (예: "급여 정보") */
  | { t: "heading"; text: string }
  /** 세그먼트 탭 · 라디오 묶음 */
  | { t: "tabs"; items: string[]; active?: number; label?: string }
  /** 라벨 + 입력값 한 칸 */
  | { t: "field"; label: string; value: string; unit?: string; hint?: string; select?: boolean }
  /** 입력 칸 2~3개를 한 줄에 */
  | { t: "fields"; items: Array<LabelValue & { unit?: string; select?: boolean }> }
  /** 여러 줄 입력 (mono: 코드 입력) */
  | { t: "text"; label?: string; value: string; mono?: boolean }
  /** 파일 놓기 영역 */
  | { t: "drop"; title: string; hint?: string }
  /** 체크박스 · 토글 */
  | { t: "check"; label: string; on?: boolean }
  /** 작은 선택 칩 */
  | { t: "chips"; items: string[]; active?: number[]; label?: string }
  /** 슬라이더 */
  | { t: "slider"; label: string; value: string; pct: number }
  /** 주요 결과 1개 (primary 강조) */
  | { t: "result"; label: string; value: string; sub?: string; badge?: string }
  /** 보조 결과 카드 2~3개 */
  | { t: "stats"; items: LabelValue[] }
  /** 라벨-값 행 목록 · 파일 목록 · 검사 결과 */
  | { t: "rows"; items: Array<LabelValue & { tone?: "ok" | "warn" | "bad" }>; title?: string }
  /** IDE 다크 출력 패널 */
  | { t: "code"; lines: string[]; title?: string; tabs?: string[] }
  /** 색상 스와치 */
  | { t: "swatches"; colors: string[]; labels?: string[] }
  /** 그라디언트 · 이미지 같은 시각 미리보기 */
  | { t: "preview"; label?: string; background: string; caption?: string; ratio?: string }
  /** PDF 페이지 썸네일 */
  | { t: "pages"; items: Array<{ label: string; state?: "on" | "off" | "turn" }> }
  /** 버튼 묶음 (primary 인덱스만 채움 버튼) */
  | { t: "buttons"; items: string[]; primary?: number }
);

export type FigureNote = { title: string; body: string };

export type GuideFigure = {
  /** 목업 아래 한 줄 설명 */
  caption: string;
  parts: FigurePart[];
  /** notes[i] = 마커 i+1 설명 */
  notes: FigureNote[];
};

export type GuideFigureEntry = Record<Lang, GuideFigure>;
export type GuideFigureMap = Record<string, GuideFigureEntry>;
