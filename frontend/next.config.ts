import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* cacheComponents off: classic dynamic routes for API-backed briefing pages */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
