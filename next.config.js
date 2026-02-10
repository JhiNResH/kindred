/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  pageExtensions: ['tsx', 'ts'],
  turbopack: {},
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
        pathname: '/coins/images/**',
      },
      {
        protocol: 'https',
        hostname: 'coin-images.coingecko.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/**',
      },
      // Restaurant/gourmet logos
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.ichiran.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.yelp.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      // Google Places API photos
      {
        protocol: 'https',
        hostname: 'places.googleapis.com',
        pathname: '/**',
      },
      // Project logos
      {
        protocol: 'https',
        hostname: 'token.uniswap.org',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'aave.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.curve.fi',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'hyperliquid.xyz',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'drift.trade',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'jup.ag',
        pathname: '/**',
      },
    ],
  },
  
  webpack: (config) => {
    config.resolve.alias['@react-native-async-storage/async-storage'] = false
    return config
  },
  
  experimental: {
    optimizePackageImports: ['lucide-react', '@rainbow-me/rainbowkit'],
  },
  
  // 開發環境優化
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
  }),
  
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
