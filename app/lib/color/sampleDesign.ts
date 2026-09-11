/* ============================================================
   색각이상 시뮬레이터 내장 예시 시안

   업로드 없이 도구의 용도를 즉시 이해할 수 있도록, 대시보드 한 장을
   캔버스에 직접 그린다. 정적 이미지 파일 대신 코드로 그리는 이유:
   ① 리포지토리에 바이너리를 넣지 않고 ② 색상만으로 구분되는 요소를
   의도한 그대로 유지하기 위해서다.

   시안에는 색상이 기능을 맡는 영역을 일부러 섞어 두었다:
   라벨 없는 상태 점 · 색으로만 연결된 차트 범례 · 색만 다른 활성 탭 ·
   밑줄 없는 링크. 시뮬레이션을 켜면 이 요소들이 먼저 무너진다.

   여기 쓰인 색상값은 레지스트리의 "실전 사용 예" 문구가 인용하는 값과
   같아야 한다 (예: 완료 #16A34A · 실패 #DC2626 · 링크 #2563EB).
   ============================================================ */

export const SAMPLE_WIDTH = 1200;
export const SAMPLE_HEIGHT = 675;

/** 예시 시안 팔레트: 레지스트리 예제 문구가 이 값들을 인용한다. */
export const SAMPLE_COLORS = {
  success: "#16A34A",
  error: "#DC2626",
  warning: "#F59E0B",
  neutral: "#94A3B8",
  link: "#2563EB",
  ink: "#334155",
  surface: "#FFFFFF",
  page: "#F2F5FF",
  line: "#D4D9E5",
  muted: "#737782",
} as const;

/** 캔버스에 그릴 때 쓰는 라벨: 컴포넌트가 현재 언어의 묶음을 넘긴다. */
export type SampleLabels = {
  title: string;
  tabs: [string, string, string];
  statusHeading: string;
  rows: [string, string, string, string];
  chartHeading: string;
  legend: [string, string, string];
  noteBefore: string;
  noteLink: string;
  noteAfter: string;
  primary: string;
  secondary: string;
};

export const SAMPLE_LABELS: { ko: SampleLabels; en: SampleLabels } = {
  ko: {
    title: "배포 대시보드",
    tabs: ["개요", "서비스", "기록"],
    statusHeading: "서비스 상태",
    rows: ["결제 API", "검색 인덱서", "알림 워커", "리포트 배치"],
    chartHeading: "주간 요청량",
    legend: ["결제", "검색", "알림"],
    noteBefore: "지난 배포 기록은 ",
    noteLink: "릴리스 노트",
    noteAfter: "에서 확인할 수 있습니다.",
    primary: "배포하기",
    secondary: "취소",
  },
  en: {
    title: "Deployment dashboard",
    tabs: ["Overview", "Services", "History"],
    statusHeading: "Service status",
    rows: ["Payments API", "Search indexer", "Notification worker", "Report batch"],
    chartHeading: "Weekly requests",
    legend: ["Payments", "Search", "Notifications"],
    noteBefore: "Previous deployments are listed in the ",
    noteLink: "release notes",
    noteAfter: ".",
    primary: "Deploy",
    secondary: "Cancel",
  },
};

/** 상태 점 색상: 라벨 없이 색상만으로 구분되도록 의도한 부분 */
const ROW_STATUS = [
  SAMPLE_COLORS.success,
  SAMPLE_COLORS.error,
  SAMPLE_COLORS.warning,
  SAMPLE_COLORS.neutral,
];

/** 차트 3계열: 범례와 선이 색으로만 연결된다 */
const SERIES = [
  { color: SAMPLE_COLORS.link, points: [0.35, 0.5, 0.42, 0.62, 0.55, 0.74, 0.68] },
  { color: SAMPLE_COLORS.success, points: [0.6, 0.52, 0.66, 0.48, 0.7, 0.58, 0.5] },
  { color: SAMPLE_COLORS.error, points: [0.18, 0.26, 0.2, 0.34, 0.28, 0.24, 0.36] },
];

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** 예시 시안을 캔버스 컨텍스트에 그린다 (1200x675 기준). */
export function drawSampleDesign(ctx: CanvasRenderingContext2D, labels: SampleLabels): void {
  const sans = "'Pretendard', 'Inter', system-ui, sans-serif";
  const mono = "'Inter', system-ui, sans-serif";

  ctx.fillStyle = SAMPLE_COLORS.page;
  ctx.fillRect(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT);

  // 헤더 + 탭: 활성 탭이 색상으로만 구분된다
  ctx.fillStyle = SAMPLE_COLORS.surface;
  ctx.fillRect(0, 0, SAMPLE_WIDTH, 92);
  ctx.fillStyle = SAMPLE_COLORS.line;
  ctx.fillRect(0, 91, SAMPLE_WIDTH, 1);

  ctx.fillStyle = SAMPLE_COLORS.ink;
  ctx.font = `700 26px ${sans}`;
  ctx.textBaseline = "middle";
  ctx.fillText(labels.title, 48, 46);

  ctx.font = `500 17px ${sans}`;
  let tabX = 420;
  labels.tabs.forEach((tab, i) => {
    ctx.fillStyle = i === 0 ? SAMPLE_COLORS.link : SAMPLE_COLORS.muted;
    ctx.fillText(tab, tabX, 47);
    tabX += ctx.measureText(tab).width + 44;
  });

  // 상태 카드: 점 색상만으로 상태를 표시한다
  ctx.fillStyle = SAMPLE_COLORS.surface;
  roundRect(ctx, 48, 132, 480, 330, 16);
  ctx.fill();
  ctx.strokeStyle = SAMPLE_COLORS.line;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = SAMPLE_COLORS.ink;
  ctx.font = `700 18px ${sans}`;
  ctx.fillText(labels.statusHeading, 80, 172);

  ctx.font = `400 17px ${sans}`;
  labels.rows.forEach((row, i) => {
    const y = 228 + i * 58;
    dot(ctx, 92, y, 9, ROW_STATUS[i]);
    ctx.fillStyle = SAMPLE_COLORS.ink;
    ctx.fillText(row, 116, y);
    if (i < labels.rows.length - 1) {
      ctx.fillStyle = SAMPLE_COLORS.line;
      ctx.fillRect(80, y + 29, 416, 1);
    }
  });

  // 차트 카드: 범례와 선이 색으로만 연결된다
  const cx = 560;
  const cy = 132;
  const cw = 592;
  const ch = 330;
  ctx.fillStyle = SAMPLE_COLORS.surface;
  roundRect(ctx, cx, cy, cw, ch, 16);
  ctx.fill();
  ctx.strokeStyle = SAMPLE_COLORS.line;
  ctx.stroke();

  ctx.fillStyle = SAMPLE_COLORS.ink;
  ctx.font = `700 18px ${sans}`;
  ctx.fillText(labels.chartHeading, cx + 32, cy + 40);

  const plotX = cx + 32;
  const plotY = cy + 76;
  const plotW = cw - 64;
  const plotH = ch - 150;

  ctx.strokeStyle = SAMPLE_COLORS.line;
  for (let i = 0; i <= 3; i++) {
    const y = plotY + (plotH / 3) * i;
    ctx.beginPath();
    ctx.moveTo(plotX, y);
    ctx.lineTo(plotX + plotW, y);
    ctx.stroke();
  }

  ctx.lineWidth = 3;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  for (const series of SERIES) {
    ctx.strokeStyle = series.color;
    ctx.beginPath();
    series.points.forEach((v, i) => {
      const x = plotX + (plotW / (series.points.length - 1)) * i;
      const y = plotY + plotH * (1 - v);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  ctx.font = `400 15px ${mono}`;
  let legendX = plotX;
  labels.legend.forEach((label, i) => {
    dot(ctx, legendX + 7, cy + ch - 40, 7, SERIES[i].color);
    ctx.fillStyle = SAMPLE_COLORS.muted;
    ctx.fillText(label, legendX + 24, cy + ch - 39);
    legendX += ctx.measureText(label).width + 68;
  });

  // 본문 + 밑줄 없는 링크
  ctx.font = `400 17px ${sans}`;
  ctx.fillStyle = SAMPLE_COLORS.ink;
  ctx.fillText(labels.noteBefore, 48, 520);
  const linkX = 48 + ctx.measureText(labels.noteBefore).width;
  ctx.fillStyle = SAMPLE_COLORS.link;
  ctx.fillText(labels.noteLink, linkX, 520);
  const afterX = linkX + ctx.measureText(labels.noteLink).width;
  ctx.fillStyle = SAMPLE_COLORS.ink;
  ctx.fillText(labels.noteAfter, afterX, 520);

  // 버튼 2종
  ctx.font = `600 17px ${sans}`;
  const primaryW = ctx.measureText(labels.primary).width + 56;
  ctx.fillStyle = SAMPLE_COLORS.link;
  roundRect(ctx, 48, 566, primaryW, 52, 10);
  ctx.fill();
  ctx.fillStyle = SAMPLE_COLORS.surface;
  ctx.fillText(labels.primary, 48 + 28, 593);

  const secondaryW = ctx.measureText(labels.secondary).width + 56;
  ctx.fillStyle = SAMPLE_COLORS.surface;
  roundRect(ctx, 48 + primaryW + 14, 566, secondaryW, 52, 10);
  ctx.fill();
  ctx.strokeStyle = SAMPLE_COLORS.line;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = SAMPLE_COLORS.muted;
  ctx.fillText(labels.secondary, 48 + primaryW + 14 + 28, 593);
}
