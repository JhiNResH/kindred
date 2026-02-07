/**
 * Circle User-Controlled Wallets
 * For end users - uses MPC or Passkey for key management
 * 
 * @see https://developers.circle.com/wallets/user-controlled/overview
 */

'use client'

import { initiateDeveloperControlledWalletsClient } from '@circle-fin/user-controlled-wallets'
import { CIRCLE_CLIENT_KEY, WALLET_CONFIG, SUPPORTED_CHAIN } from './config'

// Initialize Circle User Wallet SDK
export const circleUserWallet = initiateDeveloperControlledWalletsClient({
  apiKey: CIRCLE_CLIENT_KEY,
})

/**
 * Create a new user wallet with Passkey authentication
 * @param username - User identifier
 * @returns Wallet creation result
 */
export async function createUserWallet(username: string) {
  try {
    const result = await circleUserWallet.createWallet({
      accountType: 'SCA', // Smart Contract Account
      blockchains: ['BASE-SEPOLIA'],
      metadata: {
        name: `${username}-wallet`,
        refId: username,
      },
    })
    
    return {
      success: true,
      wallet: result,
    }
  } catch (error) {
    console.error('Failed to create user wallet:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get user's wallet address
 * @param walletId - Circle wallet ID
 * @returns Wallet address
 */
export async function getUserWalletAddress(walletId: string): Promise<string | null> {
  try {
    const wallet = await circleUserWallet.getWallet({ id: walletId })
    return wallet.address || null
  } catch (error) {
    console.error('Failed to get wallet address:', error)
    return null
  }
}

/**
 * Execute a transaction from user wallet
 * @param walletId - Circle wallet ID
 * @param transaction - Transaction details
 * @returns Transaction result
 */
export async function executeUserTransaction(
  walletId: string,
  transaction: {
    to: string
    data: string
    value?: string
  }
) {
  try {
    const result = await circleUserWallet.createTransaction({
      walletId,
      blockchain: 'BASE-SEPOLIA',
      ...transaction,
    })
    
    return {
      success: true,
      txHash: result.txHash,
      status: result.state,
    }
  } catch (error) {
    console.error('Failed to execute transaction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Sign a message with user wallet (for authentication)
 * @param walletId - Circle wallet ID
 * @param message - Message to sign
 * @returns Signature
 */
export async function signMessage(walletId: string, message: string) {
  try {
    const result = await circleUserWallet.signMessage({
      walletId,
      message,
    })
    
    return {
      success: true,
      signature: result.signature,
    }
  } catch (error) {
    console.error('Failed to sign message:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Check wallet balance
 * @param walletId - Circle wallet ID
 * @param tokenAddress - Token contract address (optional, defaults to native token)
 * @returns Balance in wei
 */
export async function getWalletBalance(
  walletId: string,
  tokenAddress?: string
): Promise<string> {
  try {
    const balances = await circleUserWallet.getWalletTokenBalance({
      id: walletId,
    })
    
    if (tokenAddress) {
      const token = balances.find((b: any) => 
        b.token.id.toLowerCase() === tokenAddress.toLowerCase()
      )
      return token?.amount || '0'
    }
    
    // Return native token balance
    const nativeToken = balances.find((b: any) => b.token.symbol === 'ETH')
    return nativeToken?.amount || '0'
  } catch (error) {
    console.error('Failed to get balance:', error)
    return '0'
  }
}

/**
 * List all wallets for a user
 * @param refId - User reference ID
 * @returns List of wallets
 */
export async function listUserWallets(refId: string) {
  try {
    const wallets = await circleUserWallet.listWallets({
      refId,
    })
    
    return {
      success: true,
      wallets,
    }
  } catch (error) {
    console.error('Failed to list wallets:', error)
    return {
      success: false,
      wallets: [],
    }
  }
}
