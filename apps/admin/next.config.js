/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@egov/ui', '@egov/types'],
  eslint: { ignoreDuringBuilds: true },
};

module.exports = nextConfig;
