/* 고른 이미지를 브라우저 안에서 줄여 data URL 로 만든다 (localStorage 용량 절약).
   파일은 어디에도 업로드하지 않는다.
   keepAlpha: 로고처럼 투명 배경을 살려야 하면 PNG 로 저장한다 (기본은 흰 배경 JPEG). */
export async function imageToDataUrl(file: File, maxWidth = 1600, quality = 0.85, keepAlpha = false): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("image"));
      el.src = url;
    });
    // 크기 정보가 없는 SVG 는 기본 폭으로 그린다
    const nw = img.naturalWidth || maxWidth;
    const nh = img.naturalHeight || Math.round(maxWidth / 3);
    const scale = Math.min(1, maxWidth / nw);
    const w = Math.max(1, Math.round(nw * scale));
    const h = Math.max(1, Math.round(nh * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    if (!keepAlpha) {
      ctx.fillStyle = "#ffffff"; // 투명 PNG 를 JPEG 로 바꿀 때 검은 배경 방지
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(img, 0, 0, w, h);
    return keepAlpha ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}
