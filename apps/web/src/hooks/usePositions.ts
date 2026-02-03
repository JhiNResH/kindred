'use client'

import { useState, useEffect, useCallback } from 'react'
import { api, Position } from '@/lib/api'

interface UsePositionsOptions {
  address: string | undefined
  status?: 'open' | 'closed' | 'settled'
  autoRefresh?: number
}

interface UsePositionsReturn {
  positions: Position[]
  isLoading: boolean
  error: string | null
  totalValue: string
  totalPnl: string
  openCount: number
  refetch: () => Promise<void>
  createPosition: (data: CreatePositionData) => Promise<Position>
  closePosition: (positionId: string, currentPrice?: number) => Promise<void>
}

interface CreatePositionData {
  marketId: string
  marketQuestion: string
  outcome: 'yes' | 'no'
  shares: string
  avgPrice: number
}

export function usePositions(options: UsePositionsOptions): UsePositionsReturn {
  const { address, status, autoRefresh } = options

  const [positions, setPositions] = useState<Position[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalValue, setTotalValue] = useState('0')
  const [totalPnl, setTotalPnl] = useState('0')
  const [openCount, setOpenCount] = useState(0)

  const fetchPositions = useCallback(async () => {
    if (!address) {
      setPositions([])
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const data = await api.getPositions(address, status)
      setPositions(data.positions)
      setTotalValue(data.totalValue)
      setTotalPnl(data.totalPnl)
      setOpenCount(data.positions.filter((p: Position) => p.status === 'open').length)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch positions')
    } finally {
      setIsLoading(false)
    }
  }, [address, status])

  useEffect(() => {
    fetchPositions()
  }, [fetchPositions])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !address) return

    const interval = setInterval(fetchPositions, autoRefresh)
    return () => clearInterval(interval)
  }, [autoRefresh, address, fetchPositions])

  const createPosition = useCallback(async (data: CreatePositionData): Promise<Position> => {
    if (!address) throw new Error('Wallet not connected')

    const position = await api.createPosition({
      userAddress: address,
      ...data,
    })

    // Optimistic update
    setPositions(prev => [...prev, position])
    setOpenCount(prev => prev + 1)

    return position
  }, [address])

  const closePosition = useCallback(async (positionId: string, currentPrice?: number) => {
    await api.updatePosition(positionId, 'close', currentPrice)

    // Update local state
    setPositions(prev => prev.map(p =>
      p.id === positionId ? { ...p, status: 'closed' as const } : p
    ))
    setOpenCount(prev => Math.max(0, prev - 1))
  }, [])

  return {
    positions,
    isLoading,
    error,
    totalValue,
    totalPnl,
    openCount,
    refetch: fetchPositions,
    createPosition,
    closePosition,
  }
}

export default usePositions
