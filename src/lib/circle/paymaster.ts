/**
 * Circle Paymaster Integration
 * Sponsors gas for eligible transactions (gasless UX)
 * 
 * @see https://developers.circle.com/wallets/gasless-transactions
 */

import { CIRCLE_API_KEY, CIRCLE_API_BASE, WALLET_CONFIG } from './config'

interface UserOperation {
  sender: string
  nonce: string
  initCode: string
  callData: string
  callGasLimit: string
  verificationGasLimit: string
  preVerificationGas: string
  maxFeePerGas: string
  maxPriorityFeePerGas: string
  paymasterAndData?: string
  signature: string
}

interface PaymasterSponsorshipResult {
  paymasterAndData: string
  preVerificationGas: string
  verificationGasLimit: string
  callGasLimit: string
}

/**
 * Request gas sponsorship from Circle Paymaster
 * @param userOp - User operation to sponsor
 * @param chainId - Chain ID (e.g., "84532" for Base Sepolia)
 * @returns Paymaster data to include in transaction
 */
export async function sponsorUserOperation(
  userOp: Partial<UserOperation>,
  chainId: string = '84532'
): Promise<PaymasterSponsorshipResult | null> {
  try {
    const response = await fetch(`${CIRCLE_API_BASE}/v1/w3s/paymaster/sponsor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CIRCLE_API_KEY}`,
      },
      body: JSON.stringify({
        userOperation: userOp,
        chainId,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Paymaster sponsorship failed:', error)
      return null
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Failed to sponsor user operation:', error)
    return null
  }
}

/**
 * Check if an operation should be sponsored
 * Based on WALLET_CONFIG.paymaster settings
 * 
 * @param operation - Operation name (e.g., "createComment", "upvote")
 * @returns true if should sponsor
 */
export function shouldSponsorOperation(operation: string): boolean {
  const { enabled, sponsorAll, allowedOperations } = WALLET_CONFIG.paymaster
  
  if (!enabled) {
    return false
  }
  
  if (sponsorAll) {
    return true
  }
  
  return allowedOperations.includes(operation)
}

/**
 * Estimate gas for a user operation
 * @param userOp - User operation
 * @param chainId - Chain ID
 * @returns Gas estimates
 */
export async function estimateUserOperationGas(
  userOp: Partial<UserOperation>,
  chainId: string = '84532'
) {
  try {
    const response = await fetch(`${CIRCLE_API_BASE}/v1/w3s/paymaster/estimate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CIRCLE_API_KEY}`,
      },
      body: JSON.stringify({
        userOperation: userOp,
        chainId,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Gas estimation failed:', error)
      return null
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Failed to estimate gas:', error)
    return null
  }
}

/**
 * Helper to create a sponsored transaction
 * @param params - Transaction parameters
 * @returns User operation with paymaster data
 */
export async function createSponsoredTransaction(params: {
  from: string
  to: string
  data: string
  value?: string
  operation?: string
}) {
  const { from, to, data, value = '0', operation = 'unknown' } = params
  
  // Check if we should sponsor this operation
  if (!shouldSponsorOperation(operation)) {
    console.log(`Operation "${operation}" not eligible for sponsorship`)
    return null
  }
  
  // Build user operation
  const userOp: Partial<UserOperation> = {
    sender: from,
    callData: data,
    // These will be filled by gas estimation
    nonce: '0',
    initCode: '0x',
    callGasLimit: '0',
    verificationGasLimit: '0',
    preVerificationGas: '0',
    maxFeePerGas: '0',
    maxPriorityFeePerGas: '0',
    signature: '0x',
  }
  
  // Get gas estimates
  const gasEstimates = await estimateUserOperationGas(userOp)
  if (!gasEstimates) {
    console.error('Failed to estimate gas')
    return null
  }
  
  // Update user operation with estimates
  Object.assign(userOp, gasEstimates)
  
  // Get paymaster sponsorship
  const paymasterData = await sponsorUserOperation(userOp)
  if (!paymasterData) {
    console.error('Failed to get paymaster sponsorship')
    return null
  }
  
  // Update user operation with paymaster data
  Object.assign(userOp, paymasterData)
  
  return userOp
}

/**
 * Check paymaster balance
 * @returns Paymaster balance info
 */
export async function getPaymasterBalance() {
  try {
    const response = await fetch(`${CIRCLE_API_BASE}/v1/w3s/paymaster/balance`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CIRCLE_API_KEY}`,
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Failed to get paymaster balance:', error)
    return null
  }
}

/**
 * Get paymaster sponsorship policies
 * @returns Policy configuration
 */
export async function getPaymasterPolicies() {
  try {
    const response = await fetch(`${CIRCLE_API_BASE}/v1/w3s/paymaster/policies`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${CIRCLE_API_KEY}`,
      },
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Failed to get paymaster policies:', error)
    return null
  }
}
