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
