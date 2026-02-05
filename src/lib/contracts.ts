/**
 * Smart Contract Configuration
 * Addresses and ABIs for Kindred contracts
 */

import KindredCommentABI from './abi/KindredComment.json'
import KindTokenABI from './abi/KindToken.json'

export const CONTRACTS = {
  // Base Sepolia (testnet) - Deployed 2026-02-05
  baseSepolia: {
    kindToken: {
      address: '0x75c0915F19Aeb2FAaA821A72b8DE64e52EE7c06B' as `0x${string}`,
      abi: KindTokenABI,
    },
    kindredComment: {
      address: '0xB6762e27A049A478da74C4a4bA3ba5fd179b76cf' as `0x${string}`,
      abi: KindredCommentABI,
    },
    treasury: '0x872989F7fCd4048acA370161989d3904E37A3cB3' as `0x${string}`,
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
  contractName: 'kindToken' | 'kindredComment'
) {
  return CONTRACTS[chain][contractName]
}
