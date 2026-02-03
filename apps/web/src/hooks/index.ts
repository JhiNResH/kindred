// Kindred React Hooks
// Easy frontend integration with backend APIs

export { useMarkets, useMarket } from './useMarkets'
export { usePositions } from './usePositions'
export { useToken } from './useToken'

// Re-export types from API
export type { Market, Position, Review, Stake, TokenInfo } from '@/lib/api'
