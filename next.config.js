/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Forzar rebuild en cada deployment
  generateBuildId: async () => {
    return `build-${Date.now()}`
  }
}

module.exports = nextConfig