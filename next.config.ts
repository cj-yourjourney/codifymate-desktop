/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Use relative paths for static assets
  assetPrefix: process.env.NODE_ENV === 'production' ? './' : undefined,
  // Ensure proper base path handling
  basePath: ''
}

module.exports = nextConfig
