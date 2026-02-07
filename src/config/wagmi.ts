import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, polygon, base, sepolia, baseSepolia } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'Kindred',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [baseSepolia, base, mainnet, polygon, sepolia],
  ssr: true, // Enable server-side rendering support
})
