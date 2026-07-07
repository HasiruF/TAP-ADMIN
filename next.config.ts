import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Emit a minimal, self-contained server bundle (.next/standalone) so the
  // production Docker image ships only the files needed to run — no full
  // node_modules. See the Dockerfile "runner" stage.
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4566',
      },
    ],
  },
}

export default nextConfig
