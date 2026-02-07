import { createPublicClient, http, type Chain } from 'viem'
import { baseSepolia } from 'viem/chains'
import { SmartAccountsEnvironment } from '@metamask/smart-accounts-kit'

// Configure environment
export const SMART_ACCOUNTS_ENV: SmartAccountsEnvironment = 'beta'

// Public client for smart account operations
export const publicClient = createPublicClient({
  chain: baseSepolia as Chain,
  transport: http(),
})

// Contract addresses
export const USDC_ADDRESS = '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as const
export const TREASURY_ADDRESS = '0x872989F7fCd4048acA370161989d3904E37A3cB3' as const

// Default delegation scope for agents
export const DEFAULT_AGENT_DELEGATION_SCOPE = {
  type: 'erc20TransferAmount' as const,
  tokenAddress: USDC_ADDRESS,
  maxAmount: BigInt('10000000'), // 10 USDC (6 decimals)
}
