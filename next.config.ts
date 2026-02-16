import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "src/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Use webpack for builds since @serwist/next requires webpack
  // Next.js 16 defaults to Turbopack but Serwist doesn't support it yet
  turbopack: {},
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
      {
        protocol: "https",
        hostname: "fal.media",
        pathname: "/**",
      },
    ],
  },
  experimental: {
    optimizeCss: true,
  },
};

export default withSerwist(nextConfig);
