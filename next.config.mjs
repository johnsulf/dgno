/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  reactStrictMode: true,
  ...(isProd && { output: "export", basePath: "/dgno" }),
  images: { unoptimized: true },
};

export default nextConfig;
