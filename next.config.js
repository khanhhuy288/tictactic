/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  // Only use basePath for production builds (GitHub Pages)
  ...(process.env.NODE_ENV === 'production' && {
    basePath: '/tictactic',
    assetPrefix: '/tictactic',
  }),
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

