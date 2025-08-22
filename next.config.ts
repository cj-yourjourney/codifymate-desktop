/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: isProd ? './' : undefined, // ✅ Relative paths for Electron
  basePath: ''
}

module.exports = nextConfig
