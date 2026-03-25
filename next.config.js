/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin')

const withNextIntl = createNextIntlPlugin('./i18n.ts')

const nextConfig = {
  // Webpack cache enabled for faster rebuilds (was disabled, causing full recompile on every change)
  // Avoid Image Optimization pipeline quirks in Chromium (Arc/Chrome) with encoded paths & client navigations.
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },
}

module.exports = withNextIntl(nextConfig)
