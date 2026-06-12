import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 구 2뎁스 URL → 플랫 URL (제품 방향: 모든 도구는 1뎁스 라우트)
      {
        source: "/tools/slack-timestamp-converter",
        destination: "/slack-timestamp-converter",
        permanent: true,
      },
      {
        source: "/en/tools/slack-timestamp-converter",
        destination: "/en/slack-timestamp-converter",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
