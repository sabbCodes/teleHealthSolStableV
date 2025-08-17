/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Disable static generation for pages that use client-side libraries
  experimental: {
    missingSuspenseWithCSRError: false,
  },
};

export default nextConfig;
