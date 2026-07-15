/* ============================================================
   QR 행렬 생성 — `qrcode` 라이브러리를 동적 import 로 로드해
   URL 을 boolean 모듈 행렬로 변환한다.
   (동적 import → SSR 번들/평가에서 제외, 클라이언트에서만 로드)
   ============================================================ */

export type QrErrorLevel = "M" | "Q" | "H";

export type QrMatrix = {
  /** 한 변의 모듈 수 (Quiet Zone 제외) */
  size: number;
  /** true = 어두운 모듈. row-major, index = y * size + x */
  modules: boolean[];
  level: QrErrorLevel;
};

/** QR 행렬을 생성한다. 입력이 유효하지 않거나 용량 초과 시 예외를 던진다. */
export async function createQrMatrix(
  text: string,
  level: QrErrorLevel,
): Promise<QrMatrix> {
  const QRCode = (await import("qrcode")).default;
  const qr = QRCode.create(text, { errorCorrectionLevel: level });
  const size = qr.modules.size;
  const data = qr.modules.data; // Uint8Array, row-major (0/1)
  const modules: boolean[] = new Array(size * size);
  for (let i = 0; i < modules.length; i++) modules[i] = data[i] === 1;
  return { size, modules, level };
}

/**
 * 세 개의 위치 탐지 패턴(finder pattern) 영역인지 판별한다.
 * 이 영역은 데이터 셀 모양 설정과 무관하게 기본 사각형으로 렌더해
 * 인식 안정성을 지킨다. (7×7 finder 블록 3개)
 */
export function isFinderRegion(x: number, y: number, size: number): boolean {
  const topLeft = x < 7 && y < 7;
  const topRight = x >= size - 7 && y < 7;
  const bottomLeft = x < 7 && y >= size - 7;
  return topLeft || topRight || bottomLeft;
}
