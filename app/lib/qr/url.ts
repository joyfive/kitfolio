/* ============================================================
   QR URL 정규화 / 검증: 생성기·읽기 공통.
   - http / https 만 허용 (javascript:, data:, file: 등 차단)
   - 프로토콜이 없으면 https:// 자동 보완
   - 최대 2,048자
   모든 처리는 브라우저 안에서 이루어진다.
   ============================================================ */

export const MAX_URL_LENGTH = 2048;

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

/** 링크 버튼을 제공하면 안 되는 위험 스킴 (읽기 결과 분류에서 사용) */
const BLOCKED_SCHEMES = /^(javascript|data|file|intent|vbscript|blob):/i;

/**
 * 입력 문자열을 QR 데이터로 쓸 정규화 URL로 변환한다.
 * 유효하지 않으면 null 을 반환한다 (미리보기·다운로드 비활성화 신호).
 */
export function normalizeUrl(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;
  if (raw.length > MAX_URL_LENGTH) return null;
  if (BLOCKED_SCHEMES.test(raw)) return null;

  // 프로토콜이 생략된 경우 https 보완. 명시된 스킴이 http/https 가 아니면 거부.
  const hasScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw);
  const candidate = hasScheme ? raw : `https://${raw}`;

  let url: URL;
  try {
    url = new URL(candidate);
  } catch {
    return null;
  }
  if (!ALLOWED_PROTOCOLS.has(url.protocol)) return null;
  // 호스트가 없는 형태(https:// 만 있는 경우 등) 거부
  if (!url.hostname) return null;

  const normalized = url.toString();
  if (normalized.length > MAX_URL_LENGTH) return null;
  return normalized;
}

/** 판독 결과가 안전하게 링크로 제공 가능한 http/https URL 인지 검사. */
export function isSafeHttpUrl(text: string): URL | null {
  const raw = text.trim();
  if (!raw || BLOCKED_SCHEMES.test(raw)) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  return ALLOWED_PROTOCOLS.has(url.protocol) ? url : null;
}
