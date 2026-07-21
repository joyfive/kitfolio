/* ============================================================
   분할 결과가 여러 개일 때 ZIP 으로 묶습니다 (jszip).
   ============================================================ */
import JSZip from "jszip";

export async function zipPdfs(
  files: { name: string; bytes: Uint8Array }[],
): Promise<Blob> {
  const zip = new JSZip();
  for (const f of files) {
    zip.file(f.name, new Uint8Array(f.bytes));
  }
  return zip.generateAsync({ type: "blob", compression: "STORE" });
}
