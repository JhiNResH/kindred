/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode in dev to reduce double-renders
  transpilePackages: ['@kindred/ui'],
  webpack: (config) => {
    config.resolve.alias['@react-native-async-storage/async-storage'] = false
    return config
  },
  // Optimize for faster builds
  experimental: {
    optimizePackageImports: ['lucide-react', '@rainbow-me/rainbowkit'],
  },
  // Ignore TypeScript/ESLint errors in production builds
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig

