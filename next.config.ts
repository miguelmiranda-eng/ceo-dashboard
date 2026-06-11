import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @react-pdf/renderer (pdfkit/fontkit) must stay external to the server bundle.
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
