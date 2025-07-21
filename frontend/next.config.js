/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Only use custom distDir for production builds
  distDir: process.env.NODE_ENV === 'production' ? '../docs' : '.next'
}

module.exports = nextConfig 