/** @type {import('next').NextConfig} */
const createNextIntlPlugin = require('next-intl/plugin')
const { execSync } = require('child_process')

// Unique per-deploy cache buster for hero assets - prevents old cached image flash
function getHeroVersion() {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
  } catch {
    return Date.now().toString()
  }
}

const withNextIntl = createNextIntlPlugin('./i18n.ts')

const nextConfig = {
  env: {
    NEXT_PUBLIC_HERO_VERSION: process.env.NEXT_PUBLIC_HERO_VERSION || getHeroVersion(),
  },
  // Webpack cache enabled for faster rebuilds (was disabled, causing full recompile on every change)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.unsplash.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },
}

module.exports = withNextIntl(nextConfig)
