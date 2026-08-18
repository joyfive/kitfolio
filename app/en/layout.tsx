import SetHtmlLang from "../components/SetHtmlLang";
import { LangProvider } from "../lib/i18n";

/** /en 서브트리: 언어를 EN으로 고정한다.
 *
 *  ── <html lang> 에 대하여 ─────────────────────────────────
 *  App Router 의 루트 레이아웃은 서버 컴포넌트라 현재 경로를 알 수 없어
 *  <html lang> 을 라우트별로 바꾸려면 루트 레이아웃 자체를 언어별로 쪼개야 한다
 *  (route group 두 벌 + 전체 라우트 이동). 색인·hreflang 은 이미 페이지별
 *  메타데이터로 정확히 연결돼 있으므로, 그 정도의 구조 변경 없이
 *  아래 두 가지로 초기 SSR HTML 의 언어 표기를 바로잡는다.
 *
 *  1. 이 래퍼가 서브트리에 lang="en" 을 선언한다. 중첩 lang 은 상위 lang 을
 *     덮어쓰므로, 스크린 리더는 EN 페이지 본문을 처음부터 영어로 읽는다.
 *     display:contents 라 박스가 생기지 않아 레이아웃에는 영향이 없다.
 *  2. 헤더·푸터는 루트 레이아웃에서 이 래퍼 바깥에 렌더되므로,
 *     각 컴포넌트가 usePathname() 으로 도출한 언어를 자기 엘리먼트에
 *     직접 선언한다 (클라이언트 컴포넌트도 SSR 시 경로를 알기 때문에
 *     초기 HTML 에 그대로 반영된다).
 *
 *  SetHtmlLang 은 그 위에서 document.documentElement.lang 까지 맞춰 준다. */
export default function EnLayout({ children }: { children: React.ReactNode }) {
  return (
    <LangProvider lang="en">
      <SetHtmlLang lang="en" />
      <div lang="en" style={{ display: "contents" }}>
        {children}
      </div>
    </LangProvider>
  );
}
