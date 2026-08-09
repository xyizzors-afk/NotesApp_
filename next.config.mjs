/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  // react-pdf/pdfjs-dist reference Node's `canvas` module in browser builds —
  // alias it away so both bundlers build cleanly for the client bundle.
  // Next.js 16 defaults to Turbopack, which needs its own config format;
  // the webpack block below still covers anyone running `next dev --webpack`.
  turbopack: {
    resolveAlias: {
      canvas: "./empty-module.js",
    },
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
