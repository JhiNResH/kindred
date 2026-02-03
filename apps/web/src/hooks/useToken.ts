'use client'

import { useState, useEffect, useCallback } from 'react'
import { api, TokenInfo } from '@/lib/api'

interface UseTokenReturn {
  token: TokenInfo | null
  isLoading: boolean
  error: string | null
  chartData: any[] | null
  refetch: () => Promise<void>
  getQuote: (amount: string, action?: 'buy' | 'sell') => Promise<TokenQuote>
}

interface TokenQuote {
  amount: string
  total: string
  avgPrice: string
  currency: string
  royalty?: string
}

export function useToken(includeChart = false): UseTokenReturn {
  const [token, setToken] = useState<TokenInfo | null>(null)
  const [chartData, setChartData] = useState<any[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchToken = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const data = await api.getTokenInfo(includeChart) as any
      setToken(data)
      
      if (data.chartData) {
        setChartData(data.chartData)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch token info')
    } finally {
      setIsLoading(false)
    }
  }, [includeChart])

  useEffect(() => {
    fetchToken()
  }, [fetchToken])

  const getQuote = useCallback(async (amount: string, action: 'buy' | 'sell' = 'buy'): Promise<TokenQuote> => {
    return api.getTokenQuote(amount, action)
  }, [])

  return {
    token,
    isLoading,
    error,
    chartData,
    refetch: fetchToken,
    getQuote,
  }
}

export default useToken
