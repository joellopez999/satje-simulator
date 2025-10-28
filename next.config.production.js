/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para producción
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Optimizaciones para producción
  compress: true,
  poweredByHeader: false,
  
  // Configuración de imágenes
  images: {
    domains: ['localhost', 'tu-dominio.com'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Configuración de headers de seguridad
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
  
  // Configuración de redirecciones
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/procesos',
        permanent: false,
      },
    ]
  },
  
  // Configuración de rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
  
  // Configuración de experimental (si es necesario)
  experimental: {
    // appDir: true, // Ya no es experimental en Next.js 14
  },
  
  // Configuración de output
  output: 'standalone', // Para Docker o servidores
}

module.exports = nextConfig
