/**
 * Circle Programmable Wallets Configuration
 * 
 * Two types of wallets:
 * 1. User-Controlled Wallets - For end users (MPC/Passkey)
 * 2. Developer-Controlled Wallets - For agents (server-side)
 */

import { baseSepolia } from 'viem/chains'

// Environment variables
export const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY || ''
export const CIRCLE_CLIENT_KEY = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_KEY || ''

// Circle API endpoints
export const CIRCLE_API_BASE = 'https://api.circle.com'
export const CIRCLE_ENDPOINT = '/v1/w3s'

// Network configuration
export const SUPPORTED_CHAIN = baseSepolia
export const CHAIN_ID = baseSepolia.id.toString()

// Wallet configuration
export const WALLET_CONFIG = {
  // User-controlled wallet config
  userWallet: {
    appId: 'kindred-app',
    environment: 'testnet' as const,
  },
  
  // Developer-controlled wallet config (for agents)
  developerWallet: {
    walletSetId: process.env.CIRCLE_WALLET_SET_ID || '',
    accountType: 'SCA' as const, // Smart Contract Account
    blockchains: ['ETH-SEPOLIA', 'BASE-SEPOLIA'],
  },
  
  // Paymaster config
  paymaster: {
    enabled: true,
    sponsorAll: false, // Only sponsor specific operations
    allowedOperations: [
      'createComment',
      'upvote',
      'downvote',
    ],
  },
}

// Agent delegation scope
export const AGENT_DELEGATION_SCOPE = {
  // ERC-20 transfer limits
  erc20TransferAmount: {
    tokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC Base Sepolia
    maxAmount: '10000000', // 10 USDC (6 decimals)
  },
  
  // Contract interaction limits
  contractInteraction: {
    allowedContracts: [
      '0xB6762e27A049A478da74C4a4bA3ba5fd179b76cf', // KindredComment
      '0x75c0915F19Aeb2FAaA821A72b8DE64e52EE7c06B', // KindToken
    ],
    allowedMethods: [
      'createComment',
      'upvote',
      'downvote',
      'approve',
    ],
  },
  
  // Time limits
  expiresIn: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
}

/**
 * Check if Circle is properly configured
 */
export function isCircleConfigured(): boolean {
  return !!(CIRCLE_API_KEY && CIRCLE_CLIENT_KEY)
}

/**
 * Get configuration status for debugging
 */
export function getCircleConfigStatus() {
  return {
    apiKeyConfigured: !!CIRCLE_API_KEY,
    clientKeyConfigured: !!CIRCLE_CLIENT_KEY,
    apiBase: CIRCLE_API_BASE,
    chain: SUPPORTED_CHAIN.name,
    chainId: CHAIN_ID,
    paymasterEnabled: WALLET_CONFIG.paymaster.enabled,
  }
}
