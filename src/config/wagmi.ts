import { http, createConfig, cookieStorage, createStorage } from 'wagmi'
import { mainnet, polygon, base, sepolia, baseSepolia } from 'wagmi/chains'

export const config = createConfig({
  chains: [polygon, mainnet, base, sepolia, baseSepolia],
  transports: {
    [polygon.id]: http(),
    [mainnet.id]: http(),
    [base.id]: http(),
    [sepolia.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
  storage: createStorage({
    storage: cookieStorage,
  }),
})
