import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents is off: every page here is per-user (cookie-based), so
  // classic dynamic rendering is simpler than wrapping each read in <Suspense>.
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
