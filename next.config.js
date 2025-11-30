/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Forzar rebuild en cada deployment
  generateBuildId: async () => {
    return `build-${Date.now()}`
  }
}

module.exports = nextConfig