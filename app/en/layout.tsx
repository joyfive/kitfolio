import SetHtmlLang from "../components/SetHtmlLang";
import { LangProvider } from "../lib/i18n";

/** /en 서브트리: 언어를 EN으로 고정한다.
 *
 *  ── 현재 언어 표기 상태 (정확히) ──────────────────────────
 *  ✅ SSR 로 제공됨 : EN **콘텐츠 wrapper** 의 `lang="en"` (아래 div)
 *  ✅ SSR 로 제공됨 : 헤더·푸터 엘리먼트의 `lang` (각 컴포넌트가 직접 선언)
 *  ❌ 아직 미해결   : 루트 `<html lang>` 자체. 초기 SSR HTML 은 여전히
 *                     `<html lang="ko">` 로 내려가며, `document.documentElement.lang`
 *                     은 **hydration 이후** SetHtmlLang 의 effect 가 바꾼다.
 *
 *  즉 이 구현은 "루트 html lang 의 SSR 해결"이 아니다.
 *  중첩 lang 이 상위 lang 을 덮어쓴다는 HTML 규칙에 기대어, 실제 콘텐츠·헤더·푸터
 *  서브트리가 첫 응답부터 en 으로 표기되게 만든 부분 대응이다.
 *  (크롤러가 보는 문서 루트 속성은 아직 ko)
 *
 *  ── 왜 루트를 SSR 로 해결하지 않았나 ──────────────────────
 *  App Router 의 루트 레이아웃은 서버 컴포넌트라 현재 경로를 알 수 없다.
 *  `<html lang>` 을 라우트별로 바꾸려면 루트 레이아웃을 언어별로 쪼개야 하고
 *  (route group 두 벌 + 전 라우트 이동), 이는 라우팅 구조 대규모 변경이라
 *  이번 범위에서 제외했다. 색인·언어 연결은 페이지별 `hreflang`/`canonical`
 *  메타데이터로 이미 정확히 처리되고 있어 SEO 영향은 제한적이다.
 *
 *  루트까지 해결하려면: `app/(ko)/...` · `app/(en)/en/...` route group 재구성. */
export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider lang="en">
      {/* hydration 이후 document.documentElement.lang 을 'en' 으로 보정 (SSR 아님) */}
      <SetHtmlLang lang="en" />
      {/* SSR 로 내려가는 서브트리 lang. display:contents 라 레이아웃 영향 없음 */}
      <div lang="en" style={{ display: "contents" }}>
        {children}
      </div>
    </LangProvider>
  );
}
