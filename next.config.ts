import type { NextConfig } from "next";

const isStandalone = process.env.NEXT_ENV_OUTPUT_TYPE === "standalone";

const nextConfig: NextConfig = {
  output: isStandalone ? "standalone" : "export",
  images: {
    unoptimized: isStandalone ? false : true,
  },
};


export default nextConfig;
