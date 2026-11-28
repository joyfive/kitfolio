/* ============================================================
   약관·개인정보처리방침 이전 버전 (동결 보관본)

   개정 전 문서를 당시 게시된 문장 그대로 보관한다. 현행 문서는 content.ts 의
   LEGAL 에 있고, 이 파일은 개정일자 드롭다운 · /<slug>/<개정일> 페이지가 읽는다.

   ⚠️ 이 파일의 문장은 고치지 않는다. 당시 시행된 내용의 기록이기 때문이다.
   (운영자명 등 현재 값이 바뀌어도 이전 버전에는 당시 값이 남아야 한다.)
   새로 개정할 때는 content.ts 의 현행 문서를 이 배열 맨 앞에 옮겨 적고,
   LEGAL_REVISION 을 새 시행일로 바꾼다. 원문 출처: git 91bec29 · fc9560c.
   ============================================================ */
import type { LegalArchiveEntry } from "./content";

export const LEGAL_ARCHIVE: LegalArchiveEntry[] = [
  {
    "id": "2026-10-24",
    "summary": {
      "ko": "서비스 소개 문구 변경, 도구 사용 이벤트·기기 저장 정보·카메라와 클립보드·이메일 문의 처리 안내 추가, 이용자의 권리·권익침해 구제·방침 변경 조항 추가",
      "en": "Updated the service description; added disclosures for tool usage events, on-device storage, camera and clipboard, and email inquiries; added sections on your rights, remedies and policy changes"
    },
    "doc": {
      "privacy-policy": {
        "ko": {
          "title": "개인정보처리방침",
          "intro": "Kitfolio(이하 '본 사이트')는 비바스페이스(VIVASPACE)가 운영합니다. 본 사이트는 이용자의 개인정보를 중요시하며 「개인정보 보호법」 등 관련 법령을 준수합니다. 본 방침은 이용자의 개인정보가 어떤 용도와 방식으로 처리되며, 보호를 위해 어떤 조치가 취해지는지 안내합니다.",
          "sections": [
            {
              "heading": "1. 도구에 입력한 내용은 서버로 전송되지 않습니다",
              "body": [
                "본 사이트는 계산·변환·생성·점검에 필요한 작은 웹 도구를 이용자의 브라우저에서 단독으로 실행하는 서비스입니다.",
                "**비회원제 운영:** 본 사이트는 회원가입이나 로그인 절차가 없으며, 이용자의 이름·이메일·연락처 등 개인정보를 직접 수집하지 않습니다. 이용자가 스스로 이메일로 문의하는 경우만 5항에 따라 처리합니다.",
                "**입력 데이터 비전송:** 이용자가 각 도구에 입력하는 텍스트·숫자·파일(PDF·이미지 포함)은 이용자의 브라우저 안에서만 처리되며, 본 사이트의 서버나 외부 데이터베이스로 전송되지 않습니다. 저장하지 않은 입력값은 페이지를 닫거나 새로고침하면 사라집니다. 일부 기능이 이용자의 기기에 남기는 정보는 3항에서 안내합니다.",
                "**카메라·클립보드:** QR 코드 읽기의 카메라 스캔과 붙여넣기·복사 버튼은 이용자가 브라우저에서 권한을 허용한 경우에만 동작합니다. 카메라 영상과 클립보드 내용은 기기 안에서만 처리되며 저장하거나 전송하지 않습니다.",
                "**이 원칙의 범위:** 위 내용은 '이용자가 도구에 입력한 콘텐츠'에 한정됩니다. 사이트를 여는 것 자체는 웹 페이지를 내려받는 통신이므로, 아래 2항에 안내한 제3자 서비스가 접속 정보를 별도로 처리할 수 있습니다. 즉 **도구에 넣은 내용은 전송되지 않지만, 사이트 이용 과정에서 아무런 네트워크 통신도 일어나지 않는다는 뜻은 아닙니다.**"
              ]
            },
            {
              "heading": "2. 사이트 운영을 위해 이용하는 제3자 서비스",
              "body": [
                "본 사이트는 서비스 운영과 개선을 위해 아래의 외부 서비스를 이용하며, 이들 서비스는 각자의 개인정보처리방침에 따라 이용자의 브라우저·접속 정보 또는 쿠키를 처리할 수 있습니다.",
                "**Google Analytics 4 (방문 통계):** 어떤 도구가 얼마나 이용되는지 파악하기 위해 방문 페이지, 대략적인 접속 지역, 기기·브라우저 종류 같은 익명의 이용 통계와, 일부 도구에서 도구를 열거나 실행·내려받기 했는지 같은 사용 이벤트(도구 식별자, 처리 건수, 파일 크기 구간 등)를 수집합니다. 도구에 입력한 텍스트·숫자, 파일 이름과 내용은 어떤 이벤트에도 포함하지 않습니다. 수집을 원치 않으면 [Google 애널리틱스 차단 브라우저 부가기능](https://tools.google.com/dlpage/gaoptout)을 설치할 수 있습니다.",
                "**Google AdSense (광고):** 본 사이트는 구글이 제공하는 광고를 게재합니다. 구글은 이용자가 본 사이트 또는 다른 웹사이트를 방문한 기록을 바탕으로 맞춤형 광고를 제공하기 위해 쿠키 및 광고 식별자를 사용할 수 있습니다. 맞춤형 광고를 원치 않으면 [Google 광고 설정](https://www.google.com/settings/ads)에서 차단할 수 있습니다.",
                "**웹 폰트 (Google Fonts · jsDelivr):** 화면 글꼴을 불러오기 위해 외부 CDN에 요청이 발생하며, 이 과정에서 해당 사업자에게 IP 주소 등 표준적인 접속 정보가 전달될 수 있습니다.",
                "**호스팅 (Vercel):** 사이트가 배포·제공되는 인프라로, 서비스 제공에 필요한 범위에서 접속 로그가 처리될 수 있습니다.",
                "본 사이트는 위에 명시한 것 외의 광고·제휴·트래킹 서비스를 사용하지 않습니다."
              ]
            },
            {
              "heading": "3. 이용자의 기기에 저장하는 정보",
              "body": [
                "아래 기능은 편의를 위해 이용자 브라우저의 로컬 저장소(localStorage)에 정보를 남깁니다. 이 정보는 해당 기기의 브라우저에만 있으며 본 사이트나 제3자에게 전송되지 않습니다.",
                "**즐겨찾기:** 홈에서 별표로 표시한 도구 목록",
                "**웹접근성 체크리스트 빌더:** 이용자가 만든 체크리스트의 프로젝트명·항목 상태·메모·근거 URL",
                "브라우저 설정에서 이 사이트의 사이트 데이터를 삭제하면 위 정보도 함께 지워집니다. 다른 기기나 브라우저와 동기화되지 않습니다."
              ]
            },
            {
              "heading": "4. 쿠키 설정 및 거부 방법",
              "body": [
                "이용자는 브라우저 설정을 통해 모든 쿠키의 저장을 거부하거나, 쿠키가 저장될 때마다 확인을 거치도록 설정할 수 있습니다. 쿠키 저장을 거부해도 본 사이트의 도구 기능은 정상적으로 동작합니다.",
                "각 서비스별 개인정보 처리에 관한 자세한 내용은 [Google 개인정보처리방침](https://policies.google.com/privacy)에서 확인할 수 있습니다."
              ]
            },
            {
              "heading": "5. 이메일 문의 시 처리하는 정보",
              "body": [
                "이용자가 아래 문의처로 이메일을 보내면, 답변을 위해 다음 정보를 처리합니다.",
                "**처리 항목:** 보낸 사람의 이메일 주소와 이름(메일에 표시된 경우), 이용자가 문의에 적은 내용과 첨부 파일",
                "**처리 목적:** 문의 확인과 답변, 오류 신고의 재현과 수정",
                "**보유 기간:** 답변을 마친 날부터 1년간 보관한 뒤 파기합니다. 이용자가 삭제를 요청하면 지체 없이 파기합니다.",
                "문의에 필요하지 않은 개인정보(주민등록번호, 계좌번호, 실제 급여명세서 등)는 보내지 않도록 부탁드립니다."
              ]
            },
            {
              "heading": "6. 제3자 제공 및 위탁",
              "body": [
                "본 사이트는 이용자의 개인정보를 제3자에게 제공하거나 판매하지 않습니다. 이메일 문의 정보는 운영자가 사용하는 이메일 서비스에 보관되며, 다른 목적으로 이용하지 않습니다. 위 2항에 명시된 서비스들은 각자의 방침에 따라 익명의 이용 통계 및 광고 데이터를 처리할 수 있습니다."
              ]
            },
            {
              "heading": "7. 이용자의 권리",
              "body": [
                "이용자는 이메일 문의로 제공한 개인정보에 대해 언제든지 열람·정정·삭제·처리정지를 요청할 수 있습니다. 아래 문의처로 요청하면 지체 없이 조치하고 결과를 알려드립니다.",
                "기기에 저장된 정보(3항)는 이용자가 브라우저에서 직접 삭제할 수 있습니다."
              ]
            },
            {
              "heading": "8. 개인정보 보호책임자 및 문의처",
              "body": [
                "본 사이트는 비바스페이스가 운영하며, 개인정보 처리에 관한 업무를 총괄해서 책임지고 관련 불만 처리 및 피해 구제를 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.",
                "**성명:** 오기쁨",
                "**직책:** 대표",
                "**연락처:** support@kitfolio.app",
                "본 사이트 이용 중 발생하는 개인정보 보호 관련 문의는 위 이메일로 연락해 주시기 바랍니다."
              ]
            },
            {
              "heading": "9. 권익침해 구제 방법",
              "body": [
                "개인정보 침해에 대한 신고나 상담이 필요한 경우 아래 기관에 문의할 수 있습니다.",
                "**개인정보침해신고센터:** [privacy.kisa.or.kr](https://privacy.kisa.or.kr) · 국번 없이 118",
                "**개인정보분쟁조정위원회:** [www.kopico.go.kr](https://www.kopico.go.kr) · 1833-6972",
                "**대검찰청:** [www.spo.go.kr](https://www.spo.go.kr) · 국번 없이 1301",
                "**경찰청:** [ecrm.police.go.kr](https://ecrm.police.go.kr) · 국번 없이 182"
              ]
            },
            {
              "heading": "10. 개인정보처리방침의 변경",
              "body": [
                "본 방침을 개정하면 시행일자와 주요 변경 내용을 이 페이지에 게시합니다. 이전 방침은 페이지 상단의 개정일자 선택이나 하단의 개정 이력에서 확인할 수 있습니다."
              ]
            }
          ],
          "effectiveLabel": "시행일자",
          "contactLabel": "문의 이메일"
        },
        "en": {
          "title": "Privacy Policy",
          "intro": "Kitfolio (\"we\", \"our\", or \"the Website\") is operated by VIVASPACE. We value the privacy of our users and comply with applicable data protection laws, including the Personal Information Protection Act of Korea. This Privacy Policy explains how we handle information when you visit and use our website.",
          "sections": [
            {
              "heading": "1. What You Enter Into the Tools Is Never Transmitted",
              "body": [
                "Kitfolio is a collection of small web tools to calculate, convert, create and check, running entirely in your browser.",
                "**No Registration Required:** There is no account or login, and we do not directly collect personal information such as names, email addresses, or contact details. The only exception is when you choose to email us, which is handled as described in section 5.",
                "**Input Data Stays Local:** The text, numbers, and files (including PDFs and images) you enter into any tool are processed entirely within your browser. They are never transmitted to our servers or to any external database. Input you have not saved disappears when you close or refresh the page. Information some features keep on your device is described in section 3.",
                "**Camera and clipboard:** camera scanning in the QR Code Reader and the paste/copy buttons only work after you grant the browser permission. Camera video and clipboard contents are processed on your device and are never stored or transmitted.",
                "**Scope of this principle:** the statement above applies to *the content you enter into the tools*. Loading the site is itself a network request, and the third-party services listed in section 2 may process connection information separately. In other words, **what you put into a tool is not transmitted, but that does not mean no network communication occurs while you use the site.**"
              ]
            },
            {
              "heading": "2. Third-Party Services Used to Operate the Site",
              "body": [
                "We use the following external services to operate and improve the site. Each may process browser or connection information, or cookies, under its own privacy policy.",
                "**Google Analytics 4 (usage statistics):** collects anonymous usage data such as pages visited, approximate region, and device and browser type, plus, for some tools, usage events such as opening a tool, running it, or downloading a result (tool identifier, item counts, file-size ranges). The text and numbers you enter, and file names and contents, are never included in any event. To opt out, you can install the [Google Analytics Opt-out Browser Add-on](https://tools.google.com/dlpage/gaoptout).",
                "**Google AdSense (advertising):** this site displays advertisements served by Google. Google may use cookies and advertising identifiers to serve personalized ads based on your prior visits to this or other websites. You can opt out of personalized advertising on the [Google Ads Settings](https://www.google.com/settings/ads) page.",
                "**Web fonts (Google Fonts and jsDelivr):** loading the site's typefaces makes requests to external CDNs, which may receive standard connection information such as your IP address.",
                "**Hosting (Vercel):** the infrastructure the site is deployed on, which may process access logs as required to deliver the service.",
                "We do not use any advertising, affiliate, or tracking service other than those listed above."
              ]
            },
            {
              "heading": "3. Information Stored on Your Device",
              "body": [
                "For convenience, the features below keep information in your browser's local storage (localStorage). It stays in that browser on that device and is never sent to us or to any third party.",
                "**Favorites:** the tools you starred on the home page",
                "**Web Accessibility Checklist Builder:** the project name, item statuses, notes and evidence URLs of the checklist you create",
                "Clearing this site's data in your browser settings removes this information. It is not synced to other devices or browsers."
              ]
            },
            {
              "heading": "4. Managing and Refusing Cookies",
              "body": [
                "You can refuse all cookies through your browser settings, or configure your browser to prompt before storing one. Refusing cookies does not prevent the site's tools from working normally.",
                "For details on how each service handles data, see the [Google Privacy Policy](https://policies.google.com/privacy)."
              ]
            },
            {
              "heading": "5. Information Processed When You Email Us",
              "body": [
                "If you email the contact address below, we process the following to reply.",
                "**Items:** your email address and name (if shown in the email), and whatever you write or attach",
                "**Purpose:** reading and answering your inquiry, and reproducing and fixing reported errors",
                "**Retention:** kept for one year from the date we reply, then deleted. If you ask us to delete it, we do so without delay.",
                "Please do not send personal information the inquiry does not need (national ID numbers, bank account numbers, real pay slips, and so on)."
              ]
            },
            {
              "heading": "6. Third-Party Data Sharing",
              "body": [
                "We do not share or sell personal information to third parties. Email inquiries are kept in the email service the operator uses and are not used for any other purpose. The services named in section 2 may process anonymous usage and advertising data under their own policies."
              ]
            },
            {
              "heading": "7. Your Rights",
              "body": [
                "You may at any time ask to access, correct, delete, or stop the processing of personal information you provided by email. Send the request to the contact below and we will act on it without delay and let you know the result.",
                "Information stored on your device (section 3) can be deleted directly in your browser."
              ]
            },
            {
              "heading": "8. Privacy Officer and Contact",
              "body": [
                "The Website is operated by VIVASPACE, which oversees all personal data processing and designates the privacy officer below to handle related complaints and remedies.",
                "**Name:** Kibbeum Oh",
                "**Title:** Representative",
                "**Contact:** support@kitfolio.app",
                "If you have any questions or concerns regarding this Privacy Policy, please contact us at the email address above."
              ]
            },
            {
              "heading": "9. Remedies for Privacy Infringement (Korea)",
              "body": [
                "If you need to report or get advice on a privacy infringement, you can contact the following Korean authorities.",
                "**Personal Information Infringement Report Center (KISA):** [privacy.kisa.or.kr](https://privacy.kisa.or.kr) · 118 (in Korea)",
                "**Personal Information Dispute Mediation Committee:** [www.kopico.go.kr](https://www.kopico.go.kr) · 1833-6972",
                "**Supreme Prosecutors' Office:** [www.spo.go.kr](https://www.spo.go.kr) · 1301 (in Korea)",
                "**Korean National Police Agency:** [ecrm.police.go.kr](https://ecrm.police.go.kr) · 182 (in Korea)"
              ]
            },
            {
              "heading": "10. Changes to This Policy",
              "body": [
                "When we revise this policy, we post the effective date and a summary of the main changes on this page. Earlier versions are available from the revision date selector at the top of the page and the revision history at the bottom."
              ]
            }
          ],
          "effectiveLabel": "Effective date",
          "contactLabel": "Contact email"
        }
      },
      "terms-of-service": {
        "ko": {
          "title": "이용약관",
          "intro": "본 약관은 비바스페이스(VIVASPACE, 이하 '운영자')가 운영하는 Kitfolio(이하 '본 사이트')가 제공하는 모든 웹 도구 및 서비스(이하 '서비스')의 이용 조건과 절차, 이용자와 본 사이트의 권리·의무 및 책임 사항을 규정합니다.",
          "sections": [
            {
              "heading": "제1조 (서비스의 제공 및 변경)",
              "body": [
                "본 사이트는 계산·변환·생성·점검에 필요한 브라우저 기반 웹 도구를 무료로 제공합니다.",
                "본 서비스는 전적으로 이용자의 웹 브라우저에서 동작하며, 별도의 회원가입 없이 누구나 자유롭게 이용할 수 있습니다.",
                "서비스의 내용·디자인·도구의 종류는 성능 개선 및 최적화를 위해 사전 고지 없이 변경되거나 중단될 수 있습니다."
              ]
            },
            {
              "heading": "제2조 (이용자의 의무 및 데이터 보안)",
              "body": [
                "이용자는 본 사이트가 제공하는 도구를 합법적인 목적 및 용도로만 이용해야 합니다.",
                "본 사이트의 모든 도구는 입력된 데이터를 서버로 전송하지 않고 브라우저 내부에서만 처리하므로, 입력 데이터의 유실 방지 및 백업 책임은 전적으로 이용자에게 있습니다.",
                "즐겨찾기·체크리스트처럼 기기의 브라우저 저장소에 남는 정보는 브라우저 데이터를 삭제하거나 다른 기기를 쓰면 확인할 수 없습니다. 필요한 결과는 내보내기·복사 기능으로 따로 보관해야 합니다."
              ]
            },
            {
              "heading": "제3조 (면책 조항 · 책임의 제한)",
              "body": [
                "**계산 및 처리 결과의 정확성:** 본 사이트가 제공하는 모든 도구(연봉 실수령액·퇴직금·세금·실업급여·연차 계산기, 성장률·마케팅 지표 계산기 등)의 결과 수치와 데이터 처리는 범용적인 수식·알고리즘을 기반으로 동작합니다. 본 사이트는 계산 결과의 완전성·정확성·최신성 및 특정 목적에의 적합성을 보장하지 않습니다.",
                "**법령·요율 기반 계산:** 세법·4대보험·근로기준법·고용보험법 등 법령과 고시를 반영한 도구의 결과는 화면에 표시한 기준일과 공식 출처를 바탕으로 한 참고용 추정치이며, 법률·세무·노무 자문이 아닙니다. 실제 신고·지급·청구 전에는 관할 기관이나 전문가를 통해 확인해야 합니다.",
                "**책임의 제한:** 이용자가 본 사이트의 계산 결과나 도구 출력값을 신뢰하여 발생한 어떠한 재정적·법적·업무적 손실이나 손해(업무 중단, 세금 계산 착오, 시스템 오류 등 포함)에 대해서도 본 사이트는 법적 책임을 지지 않습니다. 모든 최종 의사결정과 검증의 책임은 이용자 본인에게 있습니다."
              ]
            },
            {
              "heading": "제4조 (지적재산권)",
              "body": [
                "본 사이트의 디자인·로고·소스코드 구조 및 콘텐츠 레지스트리에 대한 지적재산권은 운영 주체인 비바스페이스에 있습니다.",
                "본 사이트의 소스코드를 공개 저장소에 게시하는 것은 계산 방식을 확인할 수 있게 하기 위한 것이며, 별도의 라이선스를 명시하지 않는 한 복제·배포를 허락하는 것이 아닙니다.",
                "이용자는 본 사이트의 서비스를 복제·수정·배포하여 상업적으로 재판매하는 행위를 할 수 없습니다."
              ]
            },
            {
              "heading": "제5조 (광고 및 외부 링크)",
              "body": [
                "본 사이트에는 Google AdSense 등 제3자가 제공하는 광고가 게재될 수 있습니다. 광고의 내용과 광고주가 제공하는 상품·서비스에 대한 책임은 해당 광고주에게 있습니다.",
                "본 사이트가 안내하는 공식 출처 등 외부 사이트의 내용은 각 사이트 운영자가 관리하며, 본 사이트는 그 내용의 정확성이나 변경에 대해 책임지지 않습니다."
              ]
            },
            {
              "heading": "제6조 (약관의 변경)",
              "body": [
                "운영자는 관련 법령을 위반하지 않는 범위에서 본 약관을 개정할 수 있습니다. 개정하면 시행일자와 주요 개정 내용을 이 페이지에 게시하고, 이용자에게 불리한 변경은 시행일 7일 전부터 게시합니다.",
                "이전 약관은 페이지 상단의 개정일자 선택이나 하단의 개정 이력에서 확인할 수 있습니다."
              ]
            },
            {
              "heading": "제7조 (준거법)",
              "body": [
                "본 서비스 이용과 관련하여 분쟁이 발생할 경우 대한민국 관련 법령에 따릅니다."
              ]
            }
          ],
          "effectiveLabel": "시행일자",
          "contactLabel": "문의 이메일"
        },
        "en": {
          "title": "Terms of Service",
          "intro": "These Terms of Service (\"Terms\") govern the use of the web tools and services (the \"Service\") provided by Kitfolio (\"we\", \"our\", or \"the Website\"), operated by VIVASPACE, defining the rights, obligations, and responsibilities of both users and the Website.",
          "sections": [
            {
              "heading": "Article 1 (Provision and Modification of Services)",
              "body": [
                "We provide free browser-based web tools to calculate, convert, create and check.",
                "The Service runs entirely within the user's web browser and can be used freely without any account registration.",
                "The content, design, and types of tools provided may be modified, updated, or discontinued at any time without prior notice for optimization purposes."
              ]
            },
            {
              "heading": "Article 2 (User Obligations and Data Security)",
              "body": [
                "Users agree to use the Service only for lawful purposes.",
                "Because all data is processed strictly client-side and never saved on our servers, users are solely responsible for managing and backing up their own data.",
                "Information kept in your browser's storage, such as favorites and checklists, is lost if you clear browser data and is not available on other devices. Keep anything you need by exporting or copying it."
              ]
            },
            {
              "heading": "Article 3 (Disclaimer and Limitation of Liability)",
              "body": [
                "**Accuracy of Outputs:** The calculations and processing provided by our tools (e.g., net pay, severance, tax, unemployment benefit and annual leave calculators, growth rate and marketing metric calculators) are based on generalized formulas and algorithms. We do not guarantee the absolute accuracy, completeness, timeliness, or fitness for a particular purpose of any output.",
                "**Law-based calculations:** Results from tools that apply tax law, social insurance rates, the Labor Standards Act, the Employment Insurance Act or other Korean laws and notices are reference estimates based on the reference date and official sources shown on the page. They are not legal, tax or labor advice. Confirm with the relevant authority or a professional before filing, paying or claiming.",
                "**Limitation of Liability:** In no event shall Kitfolio be liable for any direct, indirect, incidental, or consequential damages (including, but not limited to, financial losses, business interruptions, tax miscalculations, or system errors) arising from the use of, or inability to use, the tools. Users are strictly advised to independently verify any critical output."
              ]
            },
            {
              "heading": "Article 4 (Intellectual Property)",
              "body": [
                "All intellectual property rights concerning the Website's design, logo, source code structure, and content registry belong to VIVASPACE, the operator of Kitfolio.",
                "The source code is published in a public repository so that anyone can check how the tools calculate. Unless a license is stated, publication does not grant permission to copy or distribute it.",
                "Users are prohibited from copying, modifying, or distributing the Service for commercial resale."
              ]
            },
            {
              "heading": "Article 5 (Advertising and External Links)",
              "body": [
                "The Website may display advertisements provided by third parties such as Google AdSense. Advertisers are responsible for their ads and for the products and services they offer.",
                "External sites the Website links to, including official sources, are managed by their own operators. We are not responsible for the accuracy of their content or for changes to it."
              ]
            },
            {
              "heading": "Article 6 (Changes to These Terms)",
              "body": [
                "We may revise these Terms within the limits of applicable law. When we do, we post the effective date and a summary of the main changes on this page, and changes that are unfavorable to users are posted at least 7 days before they take effect.",
                "Earlier versions are available from the revision date selector at the top of the page and the revision history at the bottom."
              ]
            },
            {
              "heading": "Article 7 (Governing Law)",
              "body": [
                "Any disputes arising from or relating to the use of the Service shall be governed by and construed in accordance with the laws of the Republic of Korea."
              ]
            }
          ],
          "effectiveLabel": "Effective date",
          "contactLabel": "Contact email"
        }
      }
    }
  },
  {
    "id": "2026-08-16",
    "summary": {
      "ko": "운영 주체를 VIVASPACE로 명시하고 개인정보 보호책임자와 문의처를 통일",
      "en": "Named VIVASPACE as the operator and unified the privacy officer and contact details"
    },
    "doc": {
      "privacy-policy": {
        "ko": {
          "title": "개인정보처리방침",
          "intro": "Kitfolio(이하 '본 사이트')는 VIVASPACE가 운영합니다. 본 사이트는 이용자의 개인정보를 중요시하며 「개인정보 보호법」 등 관련 법령을 준수합니다. 본 방침은 이용자의 개인정보가 어떤 용도와 방식으로 처리되며, 보호를 위해 어떤 조치가 취해지는지 안내합니다.",
          "sections": [
            {
              "heading": "1. 도구에 입력한 내용은 서버로 전송되지 않습니다",
              "body": [
                "본 사이트는 모던 지식 노동자를 위한, 브라우저에서 단독으로 동작하는 웹 도구 모음 서비스입니다.",
                "**비회원제 운영:** 본 사이트는 회원가입이나 로그인 절차가 없으며, 이용자의 이름·이메일·연락처 등 개인정보를 직접 수집하지 않습니다.",
                "**입력 데이터 비전송:** 이용자가 각 도구에 입력하는 텍스트·숫자·파일(PDF·이미지 포함)은 이용자의 브라우저 안에서만 처리되며, 본 사이트의 서버나 외부 데이터베이스로 전송되지 않습니다. 브라우저를 닫거나 새로고침하면 입력된 데이터는 즉시 소멸합니다.",
                "**이 원칙의 범위:** 위 내용은 '이용자가 도구에 입력한 콘텐츠'에 한정됩니다. 사이트를 여는 것 자체는 웹 페이지를 내려받는 통신이므로, 아래 2항에 안내한 제3자 서비스가 접속 정보를 별도로 처리할 수 있습니다. 즉 **도구에 넣은 내용은 전송되지 않지만, 사이트 이용 과정에서 아무런 네트워크 통신도 일어나지 않는다는 뜻은 아닙니다.**"
              ]
            },
            {
              "heading": "2. 사이트 운영을 위해 이용하는 제3자 서비스",
              "body": [
                "본 사이트는 서비스 운영과 개선을 위해 아래의 외부 서비스를 이용하며, 이들 서비스는 각자의 개인정보처리방침에 따라 이용자의 브라우저·접속 정보 또는 쿠키를 처리할 수 있습니다.",
                "**Google Analytics 4 (방문 통계):** 어떤 도구가 얼마나 이용되는지 파악하기 위해 방문 페이지, 대략적인 접속 지역, 기기·브라우저 종류 등 익명의 이용 통계를 수집합니다. 도구에 입력한 내용은 전송되지 않습니다. 수집을 원치 않으면 [Google 애널리틱스 차단 브라우저 부가기능](https://tools.google.com/dlpage/gaoptout)을 설치할 수 있습니다.",
                "**Google AdSense (광고):** 본 사이트는 구글이 제공하는 광고를 게재합니다. 구글은 이용자가 본 사이트 또는 다른 웹사이트를 방문한 기록을 바탕으로 맞춤형 광고를 제공하기 위해 쿠키 및 광고 식별자를 사용할 수 있습니다. 맞춤형 광고를 원치 않으면 [Google 광고 설정](https://www.google.com/settings/ads)에서 차단할 수 있습니다.",
                "**웹 폰트 (Google Fonts · jsDelivr):** 화면 글꼴을 불러오기 위해 외부 CDN에 요청이 발생하며, 이 과정에서 해당 사업자에게 IP 주소 등 표준적인 접속 정보가 전달될 수 있습니다.",
                "**호스팅 (Vercel):** 사이트가 배포·제공되는 인프라로, 서비스 제공에 필요한 범위에서 접속 로그가 처리될 수 있습니다.",
                "본 사이트는 위에 명시한 것 외의 광고·제휴·트래킹 서비스를 사용하지 않습니다."
              ]
            },
            {
              "heading": "3. 쿠키 설정 및 거부 방법",
              "body": [
                "이용자는 브라우저 설정을 통해 모든 쿠키의 저장을 거부하거나, 쿠키가 저장될 때마다 확인을 거치도록 설정할 수 있습니다. 쿠키 저장을 거부해도 본 사이트의 도구 기능은 정상적으로 동작합니다.",
                "각 서비스별 개인정보 처리에 관한 자세한 내용은 [Google 개인정보처리방침](https://policies.google.com/privacy)에서 확인할 수 있습니다."
              ]
            },
            {
              "heading": "4. 제3자 제공 및 위탁",
              "body": [
                "본 사이트는 이용자의 개인정보를 직접 수집하지 않으므로 이를 제3자에게 제공하거나 판매하지 않습니다. 다만 위 2항에 명시된 서비스들이 각자의 방침에 따라 익명의 이용 통계 및 광고 데이터를 처리할 수 있습니다."
              ]
            },
            {
              "heading": "5. 개인정보 보호책임자 및 문의처",
              "body": [
                "본 사이트는 VIVASPACE가 운영하며, 개인정보 처리에 관한 업무를 총괄해서 책임지고 관련 불만 처리 및 피해 구제를 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.",
                "**성명:** 오기쁨",
                "**직책:** 대표",
                "**연락처:** support@kitfolio.app",
                "본 사이트 이용 중 발생하는 개인정보 보호 관련 문의는 위 이메일로 연락해 주시기 바랍니다."
              ]
            }
          ],
          "effectiveLabel": "시행일자",
          "contactLabel": "문의 이메일"
        },
        "en": {
          "title": "Privacy Policy",
          "intro": "Kitfolio (\"we\", \"our\", or \"the Website\") is operated by VIVASPACE. We value the privacy of our users and comply with applicable data protection laws. This Privacy Policy explains how we handle information when you visit and use our website.",
          "sections": [
            {
              "heading": "1. What You Enter Into the Tools Is Never Transmitted",
              "body": [
                "Kitfolio is a collection of browser-based web tools for modern knowledge workers that operates entirely on the client side.",
                "**No Registration Required:** There is no account or login, and we do not directly collect personal information such as names, email addresses, or contact details.",
                "**Input Data Stays Local:** The text, numbers, and files (including PDFs and images) you enter into any tool are processed entirely within your browser. They are never transmitted to our servers or to any external database. Closing or refreshing the browser clears them immediately.",
                "**Scope of this principle:** the statement above applies to *the content you enter into the tools*. Loading the site is itself a network request, and the third-party services listed in section 2 may process connection information separately. In other words, **what you put into a tool is not transmitted, but that does not mean no network communication occurs while you use the site.**"
              ]
            },
            {
              "heading": "2. Third-Party Services Used to Operate the Site",
              "body": [
                "We use the following external services to operate and improve the site. Each may process browser or connection information, or cookies, under its own privacy policy.",
                "**Google Analytics 4 (usage statistics):** collects anonymous usage data such as pages visited, approximate region, and device and browser type, so we can see which tools are actually used. Content entered into the tools is never sent. To opt out, you can install the [Google Analytics Opt-out Browser Add-on](https://tools.google.com/dlpage/gaoptout).",
                "**Google AdSense (advertising):** this site displays advertisements served by Google. Google may use cookies and advertising identifiers to serve personalized ads based on your prior visits to this or other websites. You can opt out of personalized advertising on the [Google Ads Settings](https://www.google.com/settings/ads) page.",
                "**Web fonts (Google Fonts and jsDelivr):** loading the site's typefaces makes requests to external CDNs, which may receive standard connection information such as your IP address.",
                "**Hosting (Vercel):** the infrastructure the site is deployed on, which may process access logs as required to deliver the service.",
                "We do not use any advertising, affiliate, or tracking service other than those listed above."
              ]
            },
            {
              "heading": "3. Managing and Refusing Cookies",
              "body": [
                "You can refuse all cookies through your browser settings, or configure your browser to prompt before storing one. Refusing cookies does not prevent the site's tools from working normally.",
                "For details on how each service handles data, see the [Google Privacy Policy](https://policies.google.com/privacy)."
              ]
            },
            {
              "heading": "4. Third-Party Data Sharing",
              "body": [
                "Because we do not directly collect personal data, we do not share or sell any personal information to third parties. The services named in section 2 may process anonymous usage and advertising data under their own policies."
              ]
            },
            {
              "heading": "5. Privacy Officer and Contact",
              "body": [
                "The Website is operated by VIVASPACE, which oversees all personal data processing and designates the privacy officer below to handle related complaints and remedies.",
                "**Name:** Kibbeum Oh",
                "**Title:** Representative",
                "**Contact:** support@kitfolio.app",
                "If you have any questions or concerns regarding this Privacy Policy, please contact us at the email address above."
              ]
            }
          ],
          "effectiveLabel": "Effective date",
          "contactLabel": "Contact email"
        }
      },
      "terms-of-service": {
        "ko": {
          "title": "이용약관",
          "intro": "본 약관은 VIVASPACE(이하 '운영자')가 운영하는 Kitfolio(이하 '본 사이트')가 제공하는 모든 웹 도구 및 서비스(이하 '서비스')의 이용 조건과 절차, 이용자와 본 사이트의 권리·의무 및 책임 사항을 규정합니다.",
          "sections": [
            {
              "heading": "제1조 (서비스의 제공 및 변경)",
              "body": [
                "본 사이트는 모던 지식 노동자를 위한 브라우저 기반 유틸리티 도구를 무료로 제공합니다.",
                "본 서비스는 전적으로 이용자의 웹 브라우저에서 동작하며, 별도의 회원가입 없이 누구나 자유롭게 이용할 수 있습니다.",
                "서비스의 내용·디자인·도구의 종류는 성능 개선 및 최적화를 위해 사전 고지 없이 변경되거나 중단될 수 있습니다."
              ]
            },
            {
              "heading": "제2조 (이용자의 의무 및 데이터 보안)",
              "body": [
                "이용자는 본 사이트가 제공하는 도구를 합법적인 목적 및 용도로만 이용해야 합니다.",
                "본 사이트의 모든 도구는 입력된 데이터를 서버로 전송하지 않고 브라우저 내부에서만 처리하므로, 입력 데이터의 유실 방지 및 백업 책임은 전적으로 이용자에게 있습니다."
              ]
            },
            {
              "heading": "제3조 (면책 조항 · 책임의 제한)",
              "body": [
                "**계산 및 처리 결과의 정확성:** 본 사이트가 제공하는 모든 도구(성장률 계산기, 실수령액 계산기, 마케팅 지표 계산기 등)의 결과 수치와 데이터 처리는 범용적인 수식·알고리즘을 기반으로 동작합니다. 본 사이트는 계산 결과의 완전성·정확성·최신성 및 특정 목적에의 적합성을 보장하지 않습니다.",
                "**책임의 제한:** 이용자가 본 사이트의 계산 결과나 도구 출력값을 신뢰하여 발생한 어떠한 재정적·법적·업무적 손실이나 손해(업무 중단, 세금 계산 착오, 시스템 오류 등 포함)에 대해서도 본 사이트는 법적 책임을 지지 않습니다. 모든 최종 의사결정과 검증의 책임은 이용자 본인에게 있습니다."
              ]
            },
            {
              "heading": "제4조 (지적재산권)",
              "body": [
                "본 사이트의 디자인·로고·소스코드 구조 및 콘텐츠 레지스트리에 대한 지적재산권은 운영 주체인 VIVASPACE에 있습니다.",
                "이용자는 본 사이트의 서비스를 복제·수정·배포하여 상업적으로 재판매하는 행위를 할 수 없습니다."
              ]
            },
            {
              "heading": "제5조 (준거법)",
              "body": [
                "본 서비스 이용과 관련하여 분쟁이 발생할 경우 대한민국 관련 법령에 따릅니다."
              ]
            }
          ],
          "effectiveLabel": "시행일자",
          "contactLabel": "문의 이메일"
        },
        "en": {
          "title": "Terms of Service",
          "intro": "These Terms of Service (\"Terms\") govern the use of the web tools and services (the \"Service\") provided by Kitfolio (\"we\", \"our\", or \"the Website\"), operated by VIVASPACE, defining the rights, obligations, and responsibilities of both users and the Website.",
          "sections": [
            {
              "heading": "Article 1 (Provision and Modification of Services)",
              "body": [
                "We provide free browser-based utility tools for modern knowledge workers.",
                "The Service runs entirely within the user's web browser and can be used freely without any account registration.",
                "The content, design, and types of tools provided may be modified, updated, or discontinued at any time without prior notice for optimization purposes."
              ]
            },
            {
              "heading": "Article 2 (User Obligations and Data Security)",
              "body": [
                "Users agree to use the Service only for lawful purposes.",
                "Because all data is processed strictly client-side and never saved on our servers, users are solely responsible for managing and backing up their own data."
              ]
            },
            {
              "heading": "Article 3 (Disclaimer and Limitation of Liability)",
              "body": [
                "**Accuracy of Outputs:** The calculations and processing provided by our tools (e.g., growth rate calculators, net pay calculator, marketing metric calculators) are based on generalized formulas and algorithms. We do not guarantee the absolute accuracy, completeness, timeliness, or fitness for a particular purpose of any output.",
                "**Limitation of Liability:** In no event shall Kitfolio be liable for any direct, indirect, incidental, or consequential damages (including, but not limited to, financial losses, business interruptions, tax miscalculations, or system errors) arising from the use of, or inability to use, the tools. Users are strictly advised to independently verify any critical output."
              ]
            },
            {
              "heading": "Article 4 (Intellectual Property)",
              "body": [
                "All intellectual property rights concerning the Website's design, logo, source code structure, and content registry belong to VIVASPACE, the operator of Kitfolio.",
                "Users are prohibited from copying, modifying, or distributing the Service for commercial resale."
              ]
            },
            {
              "heading": "Article 5 (Governing Law)",
              "body": [
                "Any disputes arising from or relating to the use of the Service shall be governed by and construed in accordance with the laws of the Republic of Korea."
              ]
            }
          ],
          "effectiveLabel": "Effective date",
          "contactLabel": "Contact email"
        }
      }
    }
  },
  {
    "id": "2026-07-01",
    "summary": {
      "ko": "최초 시행",
      "en": "First published"
    },
    "doc": {
      "privacy-policy": {
        "ko": {
          "title": "개인정보처리방침",
          "intro": "Kitfolio(이하 '본 사이트')는 이용자의 개인정보를 중요시하며 「개인정보 보호법」 등 관련 법령을 준수합니다. 본 방침은 이용자의 개인정보가 어떤 용도와 방식으로 처리되며, 보호를 위해 어떤 조치가 취해지는지 안내합니다.",
          "sections": [
            {
              "heading": "1. 도구에 입력한 내용은 서버로 전송되지 않습니다",
              "body": [
                "본 사이트는 모던 지식 노동자를 위한, 브라우저에서 단독으로 동작하는 웹 도구 모음 서비스입니다.",
                "**비회원제 운영:** 본 사이트는 회원가입이나 로그인 절차가 없으며, 이용자의 이름·이메일·연락처 등 개인정보를 직접 수집하지 않습니다.",
                "**입력 데이터 비전송:** 이용자가 각 도구에 입력하는 텍스트·숫자·파일(PDF·이미지 포함)은 이용자의 브라우저 안에서만 처리되며, 본 사이트의 서버나 외부 데이터베이스로 전송되지 않습니다. 브라우저를 닫거나 새로고침하면 입력된 데이터는 즉시 소멸합니다.",
                "**이 원칙의 범위:** 위 내용은 '이용자가 도구에 입력한 콘텐츠'에 한정됩니다. 사이트를 여는 것 자체는 웹 페이지를 내려받는 통신이므로, 아래 2항에 안내한 제3자 서비스가 접속 정보를 별도로 처리할 수 있습니다. 즉 **도구에 넣은 내용은 전송되지 않지만, 사이트 이용 과정에서 아무런 네트워크 통신도 일어나지 않는다는 뜻은 아닙니다.**"
              ]
            },
            {
              "heading": "2. 사이트 운영을 위해 이용하는 제3자 서비스",
              "body": [
                "본 사이트는 서비스 운영과 개선을 위해 아래의 외부 서비스를 이용하며, 이들 서비스는 각자의 개인정보처리방침에 따라 이용자의 브라우저·접속 정보 또는 쿠키를 처리할 수 있습니다.",
                "**Google Analytics 4 (방문 통계):** 어떤 도구가 얼마나 이용되는지 파악하기 위해 방문 페이지, 대략적인 접속 지역, 기기·브라우저 종류 등 익명의 이용 통계를 수집합니다. 도구에 입력한 내용은 전송되지 않습니다. 수집을 원치 않으면 [Google 애널리틱스 차단 브라우저 부가기능](https://tools.google.com/dlpage/gaoptout)을 설치할 수 있습니다.",
                "**Google AdSense (광고):** 본 사이트는 구글이 제공하는 광고를 게재합니다. 구글은 이용자가 본 사이트 또는 다른 웹사이트를 방문한 기록을 바탕으로 맞춤형 광고를 제공하기 위해 쿠키 및 광고 식별자를 사용할 수 있습니다. 맞춤형 광고를 원치 않으면 [Google 광고 설정](https://www.google.com/settings/ads)에서 차단할 수 있습니다.",
                "**웹 폰트 (Google Fonts · jsDelivr):** 화면 글꼴을 불러오기 위해 외부 CDN에 요청이 발생하며, 이 과정에서 해당 사업자에게 IP 주소 등 표준적인 접속 정보가 전달될 수 있습니다.",
                "**호스팅 (Vercel):** 사이트가 배포·제공되는 인프라로, 서비스 제공에 필요한 범위에서 접속 로그가 처리될 수 있습니다.",
                "본 사이트는 위에 명시한 것 외의 광고·제휴·트래킹 서비스를 사용하지 않습니다."
              ]
            },
            {
              "heading": "3. 쿠키 설정 및 거부 방법",
              "body": [
                "이용자는 브라우저 설정을 통해 모든 쿠키의 저장을 거부하거나, 쿠키가 저장될 때마다 확인을 거치도록 설정할 수 있습니다. 쿠키 저장을 거부해도 본 사이트의 도구 기능은 정상적으로 동작합니다.",
                "각 서비스별 개인정보 처리에 관한 자세한 내용은 [Google 개인정보처리방침](https://policies.google.com/privacy)에서 확인할 수 있습니다."
              ]
            },
            {
              "heading": "4. 제3자 제공 및 위탁",
              "body": [
                "본 사이트는 이용자의 개인정보를 직접 수집하지 않으므로 이를 제3자에게 제공하거나 판매하지 않습니다. 다만 위 2항에 명시된 서비스들이 각자의 방침에 따라 익명의 이용 통계 및 광고 데이터를 처리할 수 있습니다."
              ]
            },
            {
              "heading": "5. 개인정보 보호책임자 및 문의처",
              "body": [
                "본 사이트 이용 중 발생하는 개인정보 보호 관련 문의는 아래 이메일로 연락해 주시기 바랍니다."
              ]
            }
          ],
          "effectiveLabel": "시행일자",
          "contactLabel": "문의 이메일"
        },
        "en": {
          "title": "Privacy Policy",
          "intro": "Kitfolio (\"we\", \"our\", or \"the Website\") values the privacy of our users and complies with applicable data protection laws. This Privacy Policy explains how we handle information when you visit and use our website.",
          "sections": [
            {
              "heading": "1. What You Enter Into the Tools Is Never Transmitted",
              "body": [
                "Kitfolio is a collection of browser-based web tools for modern knowledge workers that operates entirely on the client side.",
                "**No Registration Required:** There is no account or login, and we do not directly collect personal information such as names, email addresses, or contact details.",
                "**Input Data Stays Local:** The text, numbers, and files (including PDFs and images) you enter into any tool are processed entirely within your browser. They are never transmitted to our servers or to any external database. Closing or refreshing the browser clears them immediately.",
                "**Scope of this principle:** the statement above applies to *the content you enter into the tools*. Loading the site is itself a network request, and the third-party services listed in section 2 may process connection information separately. In other words, **what you put into a tool is not transmitted, but that does not mean no network communication occurs while you use the site.**"
              ]
            },
            {
              "heading": "2. Third-Party Services Used to Operate the Site",
              "body": [
                "We use the following external services to operate and improve the site. Each may process browser or connection information, or cookies, under its own privacy policy.",
                "**Google Analytics 4 (usage statistics):** collects anonymous usage data such as pages visited, approximate region, and device and browser type, so we can see which tools are actually used. Content entered into the tools is never sent. To opt out, you can install the [Google Analytics Opt-out Browser Add-on](https://tools.google.com/dlpage/gaoptout).",
                "**Google AdSense (advertising):** this site displays advertisements served by Google. Google may use cookies and advertising identifiers to serve personalized ads based on your prior visits to this or other websites. You can opt out of personalized advertising on the [Google Ads Settings](https://www.google.com/settings/ads) page.",
                "**Web fonts (Google Fonts and jsDelivr):** loading the site's typefaces makes requests to external CDNs, which may receive standard connection information such as your IP address.",
                "**Hosting (Vercel):** the infrastructure the site is deployed on, which may process access logs as required to deliver the service.",
                "We do not use any advertising, affiliate, or tracking service other than those listed above."
              ]
            },
            {
              "heading": "3. Managing and Refusing Cookies",
              "body": [
                "You can refuse all cookies through your browser settings, or configure your browser to prompt before storing one. Refusing cookies does not prevent the site's tools from working normally.",
                "For details on how each service handles data, see the [Google Privacy Policy](https://policies.google.com/privacy)."
              ]
            },
            {
              "heading": "4. Third-Party Data Sharing",
              "body": [
                "Because we do not directly collect personal data, we do not share or sell any personal information to third parties. The services named in section 2 may process anonymous usage and advertising data under their own policies."
              ]
            },
            {
              "heading": "5. Contact",
              "body": [
                "If you have any questions or concerns regarding this Privacy Policy, please contact us at the email address below."
              ]
            }
          ],
          "effectiveLabel": "Effective date",
          "contactLabel": "Contact email"
        }
      },
      "terms-of-service": {
        "ko": {
          "title": "이용약관",
          "intro": "본 약관은 Kitfolio(이하 '본 사이트')가 제공하는 모든 웹 도구 및 서비스(이하 '서비스')의 이용 조건과 절차, 이용자와 본 사이트의 권리·의무 및 책임 사항을 규정합니다.",
          "sections": [
            {
              "heading": "제1조 (서비스의 제공 및 변경)",
              "body": [
                "본 사이트는 모던 지식 노동자를 위한 브라우저 기반 유틸리티 도구를 무료로 제공합니다.",
                "본 서비스는 전적으로 이용자의 웹 브라우저에서 동작하며, 별도의 회원가입 없이 누구나 자유롭게 이용할 수 있습니다.",
                "서비스의 내용·디자인·도구의 종류는 성능 개선 및 최적화를 위해 사전 고지 없이 변경되거나 중단될 수 있습니다."
              ]
            },
            {
              "heading": "제2조 (이용자의 의무 및 데이터 보안)",
              "body": [
                "이용자는 본 사이트가 제공하는 도구를 합법적인 목적 및 용도로만 이용해야 합니다.",
                "본 사이트의 모든 도구는 입력된 데이터를 서버로 전송하지 않고 브라우저 내부에서만 처리하므로, 입력 데이터의 유실 방지 및 백업 책임은 전적으로 이용자에게 있습니다."
              ]
            },
            {
              "heading": "제3조 (면책 조항 · 책임의 제한)",
              "body": [
                "**계산 및 처리 결과의 정확성:** 본 사이트가 제공하는 모든 도구(성장률 계산기, 실수령액 계산기, 마케팅 지표 계산기 등)의 결과 수치와 데이터 처리는 범용적인 수식·알고리즘을 기반으로 동작합니다. 본 사이트는 계산 결과의 완전성·정확성·최신성 및 특정 목적에의 적합성을 보장하지 않습니다.",
                "**책임의 제한:** 이용자가 본 사이트의 계산 결과나 도구 출력값을 신뢰하여 발생한 어떠한 재정적·법적·업무적 손실이나 손해(업무 중단, 세금 계산 착오, 시스템 오류 등 포함)에 대해서도 본 사이트는 법적 책임을 지지 않습니다. 모든 최종 의사결정과 검증의 책임은 이용자 본인에게 있습니다."
              ]
            },
            {
              "heading": "제4조 (지적재산권)",
              "body": [
                "본 사이트의 디자인·로고·소스코드 구조 및 콘텐츠 레지스트리에 대한 지적재산권은 본 사이트 운영자에게 있습니다.",
                "이용자는 본 사이트의 서비스를 복제·수정·배포하여 상업적으로 재판매하는 행위를 할 수 없습니다."
              ]
            },
            {
              "heading": "제5조 (준거법)",
              "body": [
                "본 서비스 이용과 관련하여 분쟁이 발생할 경우 대한민국 관련 법령에 따릅니다."
              ]
            }
          ],
          "effectiveLabel": "시행일자",
          "contactLabel": "문의 이메일"
        },
        "en": {
          "title": "Terms of Service",
          "intro": "These Terms of Service (\"Terms\") govern the use of the web tools and services (the \"Service\") provided by Kitfolio (\"we\", \"our\", or \"the Website\"), defining the rights, obligations, and responsibilities of both users and the Website.",
          "sections": [
            {
              "heading": "Article 1 (Provision and Modification of Services)",
              "body": [
                "We provide free browser-based utility tools for modern knowledge workers.",
                "The Service runs entirely within the user's web browser and can be used freely without any account registration.",
                "The content, design, and types of tools provided may be modified, updated, or discontinued at any time without prior notice for optimization purposes."
              ]
            },
            {
              "heading": "Article 2 (User Obligations and Data Security)",
              "body": [
                "Users agree to use the Service only for lawful purposes.",
                "Because all data is processed strictly client-side and never saved on our servers, users are solely responsible for managing and backing up their own data."
              ]
            },
            {
              "heading": "Article 3 (Disclaimer and Limitation of Liability)",
              "body": [
                "**Accuracy of Outputs:** The calculations and processing provided by our tools (e.g., growth rate calculators, net pay calculator, marketing metric calculators) are based on generalized formulas and algorithms. We do not guarantee the absolute accuracy, completeness, timeliness, or fitness for a particular purpose of any output.",
                "**Limitation of Liability:** In no event shall Kitfolio be liable for any direct, indirect, incidental, or consequential damages (including, but not limited to, financial losses, business interruptions, tax miscalculations, or system errors) arising from the use of, or inability to use, the tools. Users are strictly advised to independently verify any critical output."
              ]
            },
            {
              "heading": "Article 4 (Intellectual Property)",
              "body": [
                "All intellectual property rights concerning the Website's design, logo, source code structure, and content registry belong to the owner of Kitfolio.",
                "Users are prohibited from copying, modifying, or distributing the Service for commercial resale."
              ]
            },
            {
              "heading": "Article 5 (Governing Law)",
              "body": [
                "Any disputes arising from or relating to the use of the Service shall be governed by and construed in accordance with the laws of the Republic of Korea."
              ]
            }
          ],
          "effectiveLabel": "Effective date",
          "contactLabel": "Contact email"
        }
      }
    }
  }
];
