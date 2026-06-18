import { ImageResponse } from "next/og";

/* Apple touch icon (180×180). iOS 는 투명도를 지원하지 않으므로 불투명 배경 위에 심볼 배치.
   iOS 가 자동으로 모서리를 둥글게 처리한다. */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const LOGO_SVG =
  '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M1 7V1H2.76471V3.15858H3.58824L5.02353 1H6.92941L5.14118 3.78698L7 7H5.07059L3.6 4.55385H2.76471V7H1Z" fill="#50535E"/>' +
  '<rect x="1" y="9" width="6" height="6" rx="1" fill="#D4D9E5"/>' +
  '<rect x="9" y="9" width="6" height="6" rx="1" fill="#9B9FAB"/>' +
  '<rect x="9" y="1" width="6" height="6" rx="1" fill="#737782"/></svg>';
const LOGO_DATA_URI =
  "data:image/svg+xml;base64," + Buffer.from(LOGO_SVG).toString("base64");

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F2F5FF",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_DATA_URI} width={116} height={116} alt="Kitfolio" />
      </div>
    ),
    size,
  );
}
