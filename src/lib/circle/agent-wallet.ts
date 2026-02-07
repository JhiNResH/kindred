/**
 * Circle Developer-Controlled Wallets
 * For AI agents - server-side only, developer controls the keys
 * 
 * @see https://developers.circle.com/wallets/developer-controlled/overview
 */

import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets'
import { CIRCLE_API_KEY, WALLET_CONFIG, AGENT_DELEGATION_SCOPE } from './config'

// Initialize Circle Developer Wallet SDK (server-side only!)
const circleAgentWallet = initiateDeveloperControlledWalletsClient({
  apiKey: CIRCLE_API_KEY,
  entitySecret: process.env.CIRCLE_ENTITY_SECRET || '', // Required for production
})

/**
 * Create a new agent wallet
 * @param agentId - Agent identifier
 * @returns Wallet creation result
 */
export async function createAgentWallet(agentId: string) {
  try {
    const result = await circleAgentWallet.createWallets({
      accountType: 'SCA', // Smart Contract Account
      blockchains: ['BASE-SEPOLIA'],
      count: 1,
      walletSetId: WALLET_CONFIG.developerWallet.walletSetId,
      metadata: [
        {
          name: `agent-${agentId}`,
          refId: agentId,
        },
      ],
    })
    
    return {
      success: true,
      wallet: result.wallets?.[0],
    }
  } catch (error) {
    console.error('Failed to create agent wallet:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get agent wallet details
 * @param walletId - Circle wallet ID
 * @returns Wallet details
 */
export async function getAgentWallet(walletId: string) {
  try {
    const wallet = await circleAgentWallet.getWallet({ id: walletId })
    return {
      success: true,
      wallet,
    }
  } catch (error) {
    console.error('Failed to get agent wallet:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Execute a transaction from agent wallet (with scoped permissions)
 * @param walletId - Circle wallet ID
 * @param transaction - Transaction details
 * @returns Transaction result
 */
export async function executeAgentTransaction(
  walletId: string,
  transaction: {
    to: string
    data: string
    value?: string
    abiFunctionSignature?: string
    abiParameters?: any[]
  }
) {
  // Verify transaction is within delegation scope
  if (!isTransactionAllowed(transaction)) {
    return {
      success: false,
      error: 'Transaction not allowed by delegation scope',
    }
  }
  
  try {
    const result = await circleAgentWallet.createTransaction({
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
    console.error('Failed to execute agent transaction:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Check if transaction is allowed by delegation scope
 * @param transaction - Transaction to check
 * @returns true if allowed
 */
function isTransactionAllowed(transaction: {
  to: string
  data: string
  abiFunctionSignature?: string
}): boolean {
  const { to, abiFunctionSignature } = transaction
  const { allowedContracts, allowedMethods } = AGENT_DELEGATION_SCOPE.contractInteraction
  
  // Check if contract is allowed
  if (!allowedContracts.some(addr => addr.toLowerCase() === to.toLowerCase())) {
    console.warn(`Contract ${to} not in allowed list`)
    return false
  }
  
  // Check if method is allowed
  if (abiFunctionSignature) {
    const methodName = abiFunctionSignature.split('(')[0]
    if (!allowedMethods.includes(methodName)) {
      console.warn(`Method ${methodName} not in allowed list`)
      return false
    }
  }
  
  return true
}

/**
 * Agent-specific operations (with scoped permissions)
 */

/**
 * Agent upvotes a comment (scoped operation)
 * @param walletId - Agent wallet ID
 * @param commentId - Comment to upvote
 * @param amount - Amount to stake
 * @returns Transaction result
 */
export async function agentUpvoteComment(
  walletId: string,
  commentId: string,
  amount: string
) {
  const kindredCommentAddress = '0xB6762e27A049A478da74C4a4bA3ba5fd179b76cf'
  
  return executeAgentTransaction(walletId, {
    to: kindredCommentAddress,
    data: '', // Would be encoded upvote call
    abiFunctionSignature: 'upvote(uint256,uint256)',
    abiParameters: [commentId, amount],
  })
}

/**
 * Agent creates a comment (scoped operation)
 * @param walletId - Agent wallet ID
 * @param params - Comment parameters
 * @returns Transaction result
 */
export async function agentCreateComment(
  walletId: string,
  params: {
    projectId: string
    contentHash: string
    stakeAmount: string
  }
) {
  const kindredCommentAddress = '0xB6762e27A049A478da74C4a4bA3ba5fd179b76cf'
  
  return executeAgentTransaction(walletId, {
    to: kindredCommentAddress,
    data: '', // Would be encoded createComment call
    abiFunctionSignature: 'createComment(bytes32,string,string,uint256,uint256)',
    abiParameters: [
      params.projectId,
      params.contentHash,
      '', // premiumHash
      '0', // unlockPrice
      params.stakeAmount,
    ],
  })
}

/**
 * Transfer ERC-20 tokens (with amount limit)
 * @param walletId - Agent wallet ID
 * @param tokenAddress - Token contract address
 * @param to - Recipient address
 * @param amount - Amount to transfer (must be within limit)
 * @returns Transaction result
 */
export async function agentTransferToken(
  walletId: string,
  tokenAddress: string,
  to: string,
  amount: string
) {
  // Check amount limit
  const maxAmount = BigInt(AGENT_DELEGATION_SCOPE.erc20TransferAmount.maxAmount)
  if (BigInt(amount) > maxAmount) {
    return {
      success: false,
      error: `Amount exceeds delegation limit (max: ${maxAmount})`,
    }
  }
  
  // Check if token is allowed
  if (tokenAddress.toLowerCase() !== AGENT_DELEGATION_SCOPE.erc20TransferAmount.tokenAddress.toLowerCase()) {
    return {
      success: false,
      error: `Token ${tokenAddress} not allowed (only USDC)`,
    }
  }
  
  return executeAgentTransaction(walletId, {
    to: tokenAddress,
    data: '', // Would be encoded transfer call
    abiFunctionSignature: 'transfer(address,uint256)',
    abiParameters: [to, amount],
  })
}

/**
 * Get agent wallet balance
 * @param walletId - Agent wallet ID
 * @returns Balance info
 */
export async function getAgentBalance(walletId: string) {
  try {
    const balances = await circleAgentWallet.getWalletTokenBalance({
      id: walletId,
    })
    
    return {
      success: true,
      balances,
    }
  } catch (error) {
    console.error('Failed to get agent balance:', error)
    return {
      success: false,
      balances: [],
    }
  }
}
