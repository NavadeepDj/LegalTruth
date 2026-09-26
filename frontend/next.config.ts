import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Efficiency: Enable production-grade optimizations */
  reactStrictMode: true,
  poweredByHeader: false,

  /* Security: Restrict allowed image domains */
  images: {
    formats: ["image/avif", "image/webp"],
  },

  /* Efficiency: Production caching headers for static assets */
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
    {
      source: "/_next/static/(.*)",
      headers: [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ],
    },
  ],
};

export default nextConfig;
