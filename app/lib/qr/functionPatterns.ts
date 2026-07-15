/* ============================================================
   QR 기능 패턴(function pattern) 판별.
   실루엣 마스킹 시 데이터/EC 셀만 잘라내고, 아래 구조 패턴은 항상 보존해야
   디코더가 격자를 잡고 포맷을 읽을 수 있다(오류 복원으로도 복구 불가한 영역):
     - 위치 탐지 패턴(finder) + separator
     - 타이밍 패턴(row 6, col 6)
     - 포맷 정보(finder 인접) + dark module
     - 버전 정보(version ≥ 7)
     - 정렬 패턴(alignment, version ≥ 2)
   ============================================================ */

/** 정렬 패턴 중심 좌표 표 (QR 스펙 Annex E). index = version(1~40). */
const ALIGN: number[][] = [
  [],
  [],
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
  [6, 30, 54],
  [6, 32, 58],
  [6, 34, 62],
  [6, 26, 46, 66],
  [6, 26, 48, 70],
  [6, 26, 50, 74],
  [6, 30, 54, 78],
  [6, 30, 56, 82],
  [6, 30, 58, 86],
  [6, 34, 62, 90],
  [6, 28, 50, 72, 94],
  [6, 26, 50, 74, 98],
  [6, 30, 54, 78, 102],
  [6, 28, 54, 80, 106],
  [6, 32, 58, 84, 110],
  [6, 30, 58, 86, 114],
  [6, 34, 62, 90, 118],
  [6, 26, 50, 74, 98, 122],
  [6, 30, 54, 78, 102, 126],
  [6, 26, 52, 78, 104, 130],
  [6, 30, 56, 82, 108, 134],
  [6, 34, 60, 86, 112, 138],
  [6, 30, 58, 86, 114, 142],
  [6, 34, 62, 90, 118, 146],
  [6, 30, 54, 78, 102, 126, 150],
  [6, 24, 50, 76, 102, 128, 154],
  [6, 28, 54, 80, 106, 132, 158],
  [6, 32, 58, 84, 110, 136, 162],
  [6, 26, 54, 82, 110, 138, 166],
  [6, 30, 58, 86, 114, 142, 170],
];

/** 기능 패턴(구조 모듈)이면 true → 실루엣과 무관하게 항상 렌더한다. */
export function isFunctionModule(x: number, y: number, size: number): boolean {
  const version = (size - 17) / 4;

  // finder + separator (좌상·우상·좌하, 8×8)
  if (x < 8 && y < 8) return true;
  if (x >= size - 8 && y < 8) return true;
  if (x < 8 && y >= size - 8) return true;

  // 타이밍 패턴
  if (x === 6 || y === 6) return true;

  // 포맷 정보 + dark module (finder 인접 행/열 8)
  if (y === 8 && (x < 9 || x >= size - 8)) return true;
  if (x === 8 && (y < 9 || y >= size - 8)) return true;

  // 버전 정보 (version ≥ 7) — 우상·좌하 6×3
  if (version >= 7) {
    if (x < 6 && y >= size - 11 && y < size - 8) return true;
    if (y < 6 && x >= size - 11 && x < size - 8) return true;
  }

  // 정렬 패턴 (5×5)
  const centers = ALIGN[version] ?? [];
  for (const cx of centers) {
    for (const cy of centers) {
      // finder 와 겹치는 모서리 조합은 제외
      if (
        (cx <= 8 && cy <= 8) ||
        (cx >= size - 9 && cy <= 8) ||
        (cx <= 8 && cy >= size - 9)
      ) {
        continue;
      }
      if (Math.abs(x - cx) <= 2 && Math.abs(y - cy) <= 2) return true;
    }
  }

  return false;
}
