/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  basePath: '/tictactic',
  assetPrefix: '/tictactic',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig

