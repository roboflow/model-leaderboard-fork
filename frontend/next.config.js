/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Configure for GitHub Pages deployment on fork
  basePath: '/model-leaderboard-fork', // Replace with your actual fork name
  assetPrefix: '/model-leaderboard-fork', // Replace with your actual fork name
}

module.exports = nextConfig