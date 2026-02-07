/**
 * Circle Modular Wallets Integration
 * Provides gas sponsorship and agent delegation via Circle's Smart Accounts
 * 
 * @see https://developers.circle.com/wallets/modular/web-sdk
 */

import { 
  createPublicClient,
  createBundlerClient,
  toModularTransport,
  toPasskeyTransport,
  type BundlerClient,
  type PublicClient,
} from '@circle-fin/modular-wallets-core'
import { baseSepolia } from 'viem/chains'
import { http } from 'viem'

// Circle API configuration
// Get keys from: https://console.circle.com/
const CIRCLE_CLIENT_URL = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_URL || 'https://api.circle.com/v1/w3s'
const CIRCLE_CLIENT_KEY = process.env.NEXT_PUBLIC_CIRCLE_CLIENT_KEY || ''

// Paymaster configuration (ERC-7677 compliant)
const PAYMASTER_URL = process.env.NEXT_PUBLIC_PAYMASTER_URL || 'https://paymaster.circle.com/v1'

/**
 * Create a Bundler Client for ERC-4337 User Operations
 * Enables gasless transactions via Paymaster
 */
export function createCircleBundlerClient(): BundlerClient {
  return createBundlerClient({
    transport: toModularTransport({
      clientUrl: CIRCLE_CLIENT_URL,
      clientKey: CIRCLE_CLIENT_KEY,
    }),
    chain: baseSepolia,
  })
}

/**
 * Create a Public Client for blockchain interactions
 */
export function createCirclePublicClient(): PublicClient {
  return createPublicClient({
    transport: http(),
    chain: baseSepolia,
  })
}

/**
 * Create a Passkey Transport for authentication
 * Used for user login/registration with WebAuthn
 */
export function createCirclePasskeyTransport() {
  return toPasskeyTransport({
    clientUrl: CIRCLE_CLIENT_URL,
    clientKey: CIRCLE_CLIENT_KEY,
  })
}

/**
 * Sponsor gas for a User Operation via Paymaster
 * @param userOp - The User Operation to sponsor
 * @returns Paymaster data (paymaster address, signature, etc.)
 */
export async function sponsorUserOperation(userOp: any) {
  const response = await fetch(`${PAYMASTER_URL}/sponsor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${CIRCLE_CLIENT_KEY}`,
    },
    body: JSON.stringify({
      userOperation: userOp,
      chainId: baseSepolia.id,
    }),
  })

  if (!response.ok) {
    throw new Error(`Paymaster error: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Agent Delegation Configuration
 * Allows server-side agents to execute transactions on behalf of users
 */
export const AGENT_DELEGATION_SCOPE = {
  // ERC-20 transfer limits
  erc20TransferAmount: {
    tokenAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // USDC on Base Sepolia
    maxAmount: BigInt('10000000'), // 10 USDC (6 decimals)
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
  expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
}

/**
 * Check if Circle SDK is configured
 */
export function isCircleConfigured(): boolean {
  return !!CIRCLE_CLIENT_KEY && CIRCLE_CLIENT_KEY !== ''
}

/**
 * Get configuration status for debugging
 */
export function getCircleConfig() {
  return {
    clientUrl: CIRCLE_CLIENT_URL,
    hasClientKey: !!CIRCLE_CLIENT_KEY,
    paymasterUrl: PAYMASTER_URL,
    chain: baseSepolia.name,
    chainId: baseSepolia.id,
  }
}
