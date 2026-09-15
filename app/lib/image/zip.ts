/* ============================================================
   완료된 결과가 2개 이상일 때 ZIP 으로 묶는다 (jszip).
   이미 압축된 이미지라 ZIP 단계에서는 다시 압축하지 않는다(STORE).
   ============================================================ */
import JSZip from "jszip";
import { dedupeNames } from "./imageFormats";

/** ZIP 파일명 (고정) */
export const ZIP_NAME = "kitfolio-optimized-images.zip";

export async function zipImages(files: { name: string; blob: Blob }[]): Promise<Blob> {
  const zip = new JSZip();
  const names = dedupeNames(files.map((f) => f.name));
  files.forEach((f, i) => zip.file(names[i], f.blob));
  return zip.generateAsync({ type: "blob", compression: "STORE" });
}
