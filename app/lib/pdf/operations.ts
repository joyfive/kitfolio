/* ============================================================
   PDF 편집 연산 (pdf-lib). 페이지를 이미지로 변환하지 않고 문서 구조만
   조작합니다: 병합/추출/회전/삭제 모두 원본 페이지를 그대로 복사합니다.
   각 연산은 항상 바이트 복사본으로 로드해 원본 마스터를 보존합니다.
   ============================================================ */
import { PDFDocument, degrees } from "pdf-lib";
import { PdfError } from "./pdfErrors";

async function loadDoc(bytes: Uint8Array): Promise<PDFDocument> {
  return PDFDocument.load(new Uint8Array(bytes), { ignoreEncryption: false });
}

/** 여러 PDF 를 입력 순서대로 병합 */
export async function mergePdfs(
  sources: { bytes: Uint8Array }[],
): Promise<Uint8Array> {
  const out = await PDFDocument.create();
  for (const src of sources) {
    const doc = await loadDoc(src.bytes);
    const copied = await out.copyPages(doc, doc.getPageIndices());
    copied.forEach((p) => out.addPage(p));
  }
  return out.save();
}

/** 지정한 0-based 인덱스 페이지들만 뽑아 새 PDF 생성 (순서 유지) */
export async function extractPages(
  bytes: Uint8Array,
  indices: number[],
): Promise<Uint8Array> {
  if (indices.length === 0) throw new PdfError("processing-error");
  const src = await loadDoc(bytes);
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, indices);
  copied.forEach((p) => out.addPage(p));
  return out.save();
}

/** 페이지별 회전 델타(도) 적용. delta 는 0/90/180/270, 페이지 고유 회전에 가산. */
export async function rotatePages(
  bytes: Uint8Array,
  deltas: Map<number, number>,
): Promise<Uint8Array> {
  const doc = await loadDoc(bytes);
  doc.getPages().forEach((page, i) => {
    const delta = ((deltas.get(i) ?? 0) % 360 + 360) % 360;
    if (delta !== 0) {
      const current = page.getRotation().angle;
      page.setRotation(degrees((current + delta) % 360));
    }
  });
  return doc.save();
}

/** deleteIndices(0-based) 를 제외한 나머지 페이지로 새 PDF 생성 */
export async function deletePages(
  bytes: Uint8Array,
  deleteIndices: Set<number>,
): Promise<Uint8Array> {
  const src = await loadDoc(bytes);
  const total = src.getPageCount();
  const keep: number[] = [];
  for (let i = 0; i < total; i++) if (!deleteIndices.has(i)) keep.push(i);
  if (keep.length === 0) throw new PdfError("processing-error");
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, keep);
  copied.forEach((p) => out.addPage(p));
  return out.save();
}
