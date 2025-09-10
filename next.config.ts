import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: isProd ? './' : undefined,

  ...(isProd && {
    // 👇 use `any` to avoid type issues
    webpack: (config: any) => {
      if (config.output) {
        config.output.publicPath = './'
      }
      return config
    }
  })
}

export default nextConfig
