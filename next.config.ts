/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: isProd ? './' : undefined,
  basePath: '',
  // Add this for Electron production builds
  ...(isProd && {
    // Use hash router for production Electron builds
    experimental: {
      appDir: false
    }
  })
}

module.exports = nextConfig
