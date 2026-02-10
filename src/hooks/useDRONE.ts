import { useState, useCallback } from 'react'
import { useAccount, usePublicClient, useWalletClient } from 'wagmi'
import { parseUnits, Address, ContractFunctionRevertedError } from 'viem'

// DRONE 合約 ABI（基礎版）
const DRONE_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' }
    ],
    outputs: [{ name: '', type: 'uint256' }]
  },
  {
    name: 'claimFromFaucet',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: []
  },
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  }
]

export function useDRONE(contractAddress: Address) {
  const { address } = useAccount()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 獲取 DRONE 餘額
  const getBalance = useCallback(async () => {
    if (!address || !publicClient) return '0'
    try {
      const balance = await publicClient.readContract({
        address: contractAddress,
        abi: DRONE_ABI,
        functionName: 'balanceOf',
        args: [address]
      })
      return balance as string
    } catch (err) {
      console.error('Failed to get balance:', err)
      return '0'
    }
  }, [address, publicClient, contractAddress])

  // 從水龍頭領取 DRONE
  const claimFaucet = useCallback(async () => {
    if (!walletClient || !address) {
      setError('錢包未連接')
      return false
    }

    setIsLoading(true)
    setError(null)

    try {
      const hash = await walletClient.writeContract({
        address: contractAddress,
        abi: DRONE_ABI,
        functionName: 'claimFromFaucet',
        account: address
      })

      // 等待交易確認
      const publicClient = walletClient as any
      await publicClient.waitForTransactionReceipt({ hash })

      return true
    } catch (err: any) {
      const errorMsg = err?.message || '領取失敗'
      setError(errorMsg)
      console.error('Faucet claim failed:', err)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [walletClient, address, contractAddress])

  // 批准花費 DRONE
  const approveDRONE = useCallback(
    async (spender: Address, amount: string) => {
      if (!walletClient || !address) {
        setError('錢包未連接')
        return false
      }

      setIsLoading(true)
      setError(null)

      try {
        const amountInWei = parseUnits(amount, 18)

        const hash = await walletClient.writeContract({
          address: contractAddress,
          abi: DRONE_ABI,
          functionName: 'approve',
          args: [spender, amountInWei],
          account: address
        })

        // 等待交易確認
        const publicClient = walletClient as any
        await publicClient.waitForTransactionReceipt({ hash })

        return true
      } catch (err: any) {
        const errorMsg = err?.message || '批准失敗'
        setError(errorMsg)
        console.error('Approve failed:', err)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [walletClient, address, contractAddress]
  )

  return {
    getBalance,
    claimFaucet,
    approveDRONE,
    isLoading,
    error
  }
}
