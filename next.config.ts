import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal self-contained bundle — reduces RAM usage on S6 Tizen.
  output: 'standalone',
  allowedDevOrigins: ['192.168.75.177', 'localhost:3000'],
  images: {
    // Konvertuojame visas nuotraukas į WebP — mažiausias formatas
    formats: ['image/webp'],
    // Kokybė 60% — vizualiai priimtina, bet failas ~3x mažesnis
    qualities: [60],
    // Signage ekranams pakanka tik vieno breakpoint'o
    deviceSizes: [800, 1280],
    imageSizes: [400, 800],
    // Cache'iname optimizuotas nuotraukas 7 dienas
    minimumCacheTTL: 604800,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.mif.vu.lt',
      },
      {
        protocol: 'https',
        hostname: 'mif.vu.lt',
      },
      {
        protocol: 'http',
        hostname: '**.mif.vu.lt',
      },
      {
        protocol: 'http',
        hostname: 'mif.vu.lt',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
