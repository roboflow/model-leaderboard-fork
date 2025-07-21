/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Build to docs directory for GitHub Pages
  distDir: '../docs'
}

module.exports = nextConfig
