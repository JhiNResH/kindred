/**
 * Agent Wallet - Privy Server Wallet Integration
 * 
 * 讓 AI Agents 自動化執行鏈上操作：
 * - 創建 Agent 專屬錢包
 * - 自動簽署交易
 * - 管理 gas 和 token
 * 
 * 安全性：
 * - 使用 P-256 Authorization Key 控制
 * - 每個 Agent 有獨立錢包
 * - 可設定 Policy 限制操作範圍
 */

import { PrivyClient, generateP256KeyPair } from '@privy-io/node'
import { createPublicClient, createWalletClient, http, parseEther, formatEther } from 'viem'
import { baseSepolia, base } from 'viem/chains'
import { CONTRACTS } from './contracts'

// Types
export interface AgentWallet {
  id: string
  address: `0x${string}`
  chainType: 'ethereum'
  createdAt: Date
  agentId: string
}

export interface TransactionRequest {
  to: `0x${string}`
  value?: bigint
  data?: `0x${string}`
}

export interface TransactionResult {
  hash: `0x${string}`
  status: 'pending' | 'confirmed' | 'failed'
}

// Initialize Privy client
function getPrivyClient(): PrivyClient {
  const appId = process.env.PRIVY_APP_ID || process.env.NEXT_PUBLIC_PRIVY_APP_ID
  const appSecret = process.env.PRIVY_APP_SECRET
  
  if (!appId || !appSecret) {
    throw new Error('Missing PRIVY_APP_ID or PRIVY_APP_SECRET')
  }
  
  return new PrivyClient({ appId, appSecret })
}

// Get Authorization Key for signing
function getAuthorizationKey(): string {
  const authKey = process.env.PRIVY_AUTHORIZATION_KEY
  if (!authKey) {
    throw new Error('Missing PRIVY_AUTHORIZATION_KEY')
  }
  return authKey
}

// Public client for reading chain state
export function getPublicClient(chainId: 'baseSepolia' | 'base' = 'baseSepolia') {
  const chain = chainId === 'base' ? base : baseSepolia
  return createPublicClient({
    chain,
    transport: http(),
  })
}

/**
 * Create a new wallet for an agent
 */
export async function createAgentWallet(agentId: string): Promise<AgentWallet> {
  const privy = getPrivyClient()
  const authKey = getAuthorizationKey()
  
  const wallet = await privy.wallets().create({
    chain_type: 'ethereum',
    // Owner is the authorization key (our server controls it)
    owner: { public_key: authKey },
  } as any)
  
  return {
    id: wallet.id,
    address: wallet.address as `0x${string}`,
    chainType: 'ethereum',
    createdAt: new Date(),
    agentId,
  }
}

/**
 * Get an existing wallet by ID
 */
export async function getAgentWallet(walletId: string): Promise<AgentWallet | null> {
  const privy = getPrivyClient()
  
  try {
    const wallet = await privy.wallets().get(walletId)
    return {
      id: wallet.id,
      address: wallet.address as `0x${string}`,
      chainType: 'ethereum',
      createdAt: new Date(),
      agentId: '', // Would need to store this mapping separately
    }
  } catch {
    return null
  }
}

/**
 * List all wallets
 */
export async function listAgentWallets(): Promise<AgentWallet[]> {
  const privy = getPrivyClient()
  
  const { data: wallets } = await privy.wallets().list()
  
  return wallets.map((w: { id: string; address: string }) => ({
    id: w.id,
    address: w.address as `0x${string}`,
    chainType: 'ethereum' as const,
    createdAt: new Date(),
    agentId: '',
  }))
}

/**
 * Get wallet balance
 */
export async function getWalletBalance(
  address: `0x${string}`,
  chainId: 'baseSepolia' | 'base' = 'baseSepolia'
): Promise<{ eth: string; wei: bigint }> {
  const client = getPublicClient(chainId)
  const balance = await client.getBalance({ address })
  
  return {
    eth: formatEther(balance),
    wei: balance,
  }
}

/**
 * Sign and send a transaction
 */
export async function sendTransaction(
  walletId: string,
  tx: TransactionRequest,
  chainId: 'baseSepolia' | 'base' = 'baseSepolia'
): Promise<TransactionResult> {
  const privy = getPrivyClient()
  const authKey = getAuthorizationKey()
  const chain = chainId === 'base' ? base : baseSepolia
  
  // Use Privy's RPC endpoint to send transaction
  const result = await privy.wallets().ethereum().sendTransaction(walletId, {
    caip2: `eip155:${chain.id}`,
    params: {
      to: tx.to,
      value: tx.value ? `0x${tx.value.toString(16)}` : '0x0',
      data: tx.data || '0x',
    },
  } as any)
  
  return {
    hash: result.hash as `0x${string}`,
    status: 'pending',
  }
}

/**
 * Sign a message
 */
export async function signMessage(
  walletId: string,
  message: string
): Promise<`0x${string}`> {
  const privy = getPrivyClient()
  const authKey = getAuthorizationKey()
  
  const result = await privy.wallets().ethereum().signMessage(walletId, {
    message,
    authorization_context: {
      authorization_private_keys: [authKey],
    },
  })
  
  return result.signature as `0x${string}`
}

/**
 * Execute a contract call
 */
export async function executeContractCall(
  walletId: string,
  contractAddress: `0x${string}`,
  data: `0x${string}`,
  value: bigint = 0n,
  chainId: 'baseSepolia' | 'base' = 'baseSepolia'
): Promise<TransactionResult> {
  return sendTransaction(
    walletId,
    {
      to: contractAddress,
      data,
      value,
    },
    chainId
  )
}

/**
 * Utility: Generate new P-256 keypair (for creating new authorization keys)
 */
export async function generateAuthorizationKeyPair(): Promise<{
  privateKey: string
  publicKey: string
}> {
  const { privateKey, publicKey } = await generateP256KeyPair()
  return { privateKey, publicKey }
}

/**
 * Agent Wallet Manager - High-level interface
 */
export class AgentWalletManager {
  private walletCache: Map<string, AgentWallet> = new Map()
  
  /**
   * Get or create wallet for an agent
   */
  async getOrCreateWallet(agentId: string): Promise<AgentWallet> {
    // Check cache first
    if (this.walletCache.has(agentId)) {
      return this.walletCache.get(agentId)!
    }
    
    // TODO: Check database for existing wallet mapping
    
    // Create new wallet
    const wallet = await createAgentWallet(agentId)
    this.walletCache.set(agentId, wallet)
    
    return wallet
  }
  
  /**
   * Send ETH from agent wallet
   */
  async sendEth(
    agentId: string,
    to: `0x${string}`,
    amountEth: string,
    chainId: 'baseSepolia' | 'base' = 'baseSepolia'
  ): Promise<TransactionResult> {
    const wallet = await this.getOrCreateWallet(agentId)
    
    return sendTransaction(
      wallet.id,
      {
        to,
        value: parseEther(amountEth),
      },
      chainId
    )
  }
  
  /**
   * Check agent wallet balance
   */
  async getBalance(
    agentId: string,
    chainId: 'baseSepolia' | 'base' = 'baseSepolia'
  ): Promise<{ eth: string; wei: bigint }> {
    const wallet = await this.getOrCreateWallet(agentId)
    return getWalletBalance(wallet.address, chainId)
  }
}

// Export singleton instance
export const agentWalletManager = new AgentWalletManager()
