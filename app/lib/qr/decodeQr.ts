/* ============================================================
   QR 판독 — `@zxing/browser` 를 동적 import 로 로드.
   이미지 요소 / 캔버스 판독을 담당한다 (카메라는 컴포넌트에서 직접 제어).
   판독 실패 시 예외 대신 null 을 반환한다.
   ============================================================ */

type QrReader = {
  decodeFromImageElement: (el: HTMLImageElement) => Promise<{ getText(): string }>;
  decodeFromCanvas: (el: HTMLCanvasElement) => Promise<{ getText(): string }>;
};

let readerPromise: Promise<QrReader> | null = null;

export async function getQrReader(): Promise<QrReader> {
  readerPromise ??= import("@zxing/browser").then(
    (m) => new m.BrowserQRCodeReader() as unknown as QrReader,
  );
  return readerPromise;
}

/** <img> 요소에서 QR 판독. 실패 시 null. */
export async function decodeImageElement(
  el: HTMLImageElement,
): Promise<string | null> {
  try {
    const reader = await getQrReader();
    const result = await reader.decodeFromImageElement(el);
    return result.getText();
  } catch {
    return null;
  }
}

/** 캔버스에서 QR 판독 (자체 판독 검증 등). 실패 시 null. */
export async function decodeCanvas(
  canvas: HTMLCanvasElement,
): Promise<string | null> {
  try {
    const reader = await getQrReader();
    const result = await reader.decodeFromCanvas(canvas);
    return result.getText();
  } catch {
    return null;
  }
}
