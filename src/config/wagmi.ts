import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { mainnet, polygon, base, sepolia, baseSepolia } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'Maat',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'kindred-app',
  chains: [baseSepolia, base, mainnet, polygon, sepolia],
  ssr: true,
})
