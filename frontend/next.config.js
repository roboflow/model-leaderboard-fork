/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
  // Note: distDir temporarily disabled for development
  // distDir: process.env.NODE_ENV === 'production' ? '../docs' : '.next'
}

module.exports = nextConfig 