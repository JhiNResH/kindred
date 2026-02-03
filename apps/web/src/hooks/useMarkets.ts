'use client'

import { useState, useEffect, useCallback } from 'react'
import { api, Market } from '@/lib/api'

interface UseMarketsOptions {
  category?: string
  limit?: number
  search?: string
  autoRefresh?: number // refresh interval in ms
}

interface UseMarketsReturn {
  markets: Market[]
  isLoading: boolean
  error: string | null
  total: number
  refetch: () => Promise<void>
}

export function useMarkets(options: UseMarketsOptions = {}): UseMarketsReturn {
  const { category, limit = 20, search, autoRefresh } = options
  
  const [markets, setMarkets] = useState<Market[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchMarkets = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const data = await api.getMarkets({ category, limit, q: search })
      setMarkets(data.markets)
      setTotal(data.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch markets')
    } finally {
      setIsLoading(false)
    }
  }, [category, limit, search])

  useEffect(() => {
    fetchMarkets()
  }, [fetchMarkets])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(fetchMarkets, autoRefresh)
    return () => clearInterval(interval)
  }, [autoRefresh, fetchMarkets])

  return {
    markets,
    isLoading,
    error,
    total,
    refetch: fetchMarkets,
  }
}

// Hook for single market
export function useMarket(id: string | null) {
  const [market, setMarket] = useState<Market | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setMarket(null)
      return
    }

    const fetchMarket = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await api.getMarket(id)
        setMarket(data.market)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMarket()
  }, [id])

  return { market, isLoading, error }
}

export default useMarkets
