/**
 * Smart Contract Configuration
 * Addresses and ABIs for Kindred contracts
 */

import KindredCommentABI from './abi/KindredComment.json'
import KindTokenABI from './abi/KindToken.json'
import KindClawTokenABI from './abi/KindClawToken.json'
import KindredHookABI from './abi/KindredHook.json'
import KindredHookV2ABI from './abi/KindredHookV2.json'
import ReputationOracleABI from './abi/ReputationOracle.json'
import KindClawTokenABI from './abi/KindClawToken.json'
import OpenWorkMockABI from './abi/OpenWorkMock.json'
import SimpleSwapABI from './abi/SimpleSwap.json'
import KindClawABI from './abi/KindClaw.json'

export const CONTRACTS = {
  // Base Sepolia (testnet) - Deployed 2026-02-05 (core) + 2026-02-07 (hook + arcade tokens)
  baseSepolia: {
    kindToken: {
      address: '0xf0b5477386810559e3e8c03f10dd10b0a9222b2a' as `0x${string}`,
      abi: KindTokenABI,
    },
    // Arcade Tokens (Faucet) - Deployed 2026-02-07
    kindclaw: {
      address: '0x03c1F6E4f6EfF220dE00b508005F2c7dc3Bd925D' as `0x${string}`,
      abi: KindClawTokenABI,
    },
    openwork: {
      address: '0x299c30dd5974bf4d5bfe42d340ca40462816ab07' as `0x${string}`,
      abi: KindTokenABI, // Standard ERC-20
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
    kindredHookV2: {
      address: '0x5238C910f0690eb9C8b4f34Cf78c97C3D7f9E313' as `0x${string}`,
      abi: KindredHookV2ABI,
    },
    mockPoolManager: '0x7350Cc2655004d32e234094C847bfac789D19408' as `0x${string}`, // Demo only
    // Simple Swap - Deployed 2026-02-07
    simpleSwap: {
      address: '0x2b50678df7FDb8Baba5867DC5de4F05432CbEf71' as `0x${string}`,
      abi: SimpleSwapABI,
    },
    usdc: '0x036CbD53842c5426634e7929541eC2318f3dCF7e' as `0x${string}`,
    // KindClaw arcade token - Deployed 2026-02-07
    kindClaw: {
      address: '0x03c1F6E4f6EfF220dE00b508005F2c7dc3Bd925D' as `0x${string}`,
      abi: KindClawABI,
    },
    // $OPENWORK token (Clawathon) - Base mainnet
    openwork: '0x299c30dd5974bf4d5bfe42d340ca40462816ab07' as `0x${string}`,
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
RUST.feePercent
  }
}
