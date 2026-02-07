/**
 * Smart Contract Configuration
 * Addresses and ABIs for Kindred contracts
 */

import KindredCommentABI from './abi/KindredComment.json'
import KindTokenABI from './abi/KindToken.json'
import KindredHookABI from './abi/KindredHook.json'
import ReputationOracleABI from './abi/ReputationOracle.json'

export const CONTRACTS = {
  // Base Sepolia (testnet) - Deployed 2026-02-05 (core) + 2026-02-07 (hook)
  baseSepolia: {
    kindToken: {
      address: '0xf0b5477386810559e3e8c03f10dd10b0a9222b2a' as `0x${string}`,
      abi: KindTokenABI,
    },
    kindredComment: {
      address: '0xb3bb93089404ce4c2f64535e5d513093625fedc8' as `0x${string}`,
      abi: KindredCommentABI,
    },
    treasury: '0x872989F7fCd4048acA370161989d3904E37A3cB3' as `0x${string}`,
    // Uniswap v4 Hook System - Deployed 2026-02-07
    reputationOracle: {
      address: '0xb3Af55a046aC669642A8FfF10FC6492c22C17235' as `0x${string}`,
      abi: ReputationOracleABI,
    },
    kindredHook: {
      address: '0x03C8fFc3E6820Ef40d43F76F66e8B9C1A1DFaD4d' as `0x${string}`,
      abi: KindredHookABI,
    },
    mockPoolManager: '0x7350Cc2655004d32e234094C847bfac789D19408' as `0x${string}`, // Demo only
  },
  // Base (mainnet)
  base: {
    kindToken: {
      address: '0x0000000000000000000000000000000000000000' as `0x${string}`, // TODO: Deploy
      abi: KindTokenABI,
    },
    kindredComment: {
      address: '0x0000000000000000000000000000000000000000' as `0x${string}`, // TODO: Deploy
      abi: KindredCommentABI,
    },
  },
} as const

export type SupportedChainId = keyof typeof CONTRACTS

/**
 * Get contract config for a chain
 */
export function getContract(
  chain: SupportedChainId,
  contractName: 'kindToken' | 'kindredComment' | 'reputationOracle' | 'kindredHook'
): any {
  const contracts = CONTRACTS[chain] as any
  return contracts[contractName]
}

/**
 * Dynamic Fee Tiers based on Reputation Score
 * @see KindredHook.sol for implementation
 */
export const FEE_TIERS = {
  HIGH_TRUST: { minScore: 850, feePercent: 0.15 },   // 0.15% fee
  MEDIUM_TRUST: { minScore: 600, feePercent: 0.22 }, // 0.22% fee
  LOW_TRUST: { minScore: 0, feePercent: 0.30 },      // 0.30% fee
} as const

/**
 * Calculate expected swap fee based on reputation score
 */
export function calculateSwapFee(reputationScore: number): number {
  if (reputationScore >= FEE_TIERS.HIGH_TRUST.minScore) {
    return FEE_TIERS.HIGH_TRUST.feePercent
  } else if (reputationScore >= FEE_TIERS.MEDIUM_TRUST.minScore) {
    return FEE_TIERS.MEDIUM_TRUST.feePercent
  } else {
    return FEE_TIERS.LOW_TRUST.feePercent
  }
}
