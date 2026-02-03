// Kindred Shared Package
// Re-export all types and utilities

export * from './types'

// Constants
export const CATEGORIES: Record<string, { name: string; icon: string; color: string }> = {
  'k/defi': { name: 'DeFi', icon: '🏦', color: '#3B82F6' },
  'k/memecoin': { name: 'Memecoins', icon: '🐸', color: '#10B981' },
  'k/perp-dex': { name: 'Perp DEX', icon: '📈', color: '#8B5CF6' },
  'k/ai': { name: 'AI Agents', icon: '🤖', color: '#F59E0B' },
}

export const REPUTATION_LEVELS = {
  newcomer: { minScore: 0, label: 'Newcomer', color: '#6B7280' },
  contributor: { minScore: 100, label: 'Contributor', color: '#3B82F6' },
  trusted: { minScore: 1000, label: 'Trusted', color: '#10B981' },
  expert: { minScore: 5000, label: 'Expert', color: '#8B5CF6' },
  authority: { minScore: 10000, label: 'Authority', color: '#F59E0B' },
}

export const STAKE_OPTIONS = [
  { value: '0', label: 'No Stake', bonus: 0 },
  { value: '1000000000000000000', label: '1 OPEN', bonus: 10 },
  { value: '5000000000000000000', label: '5 OPEN', bonus: 25 },
  { value: '10000000000000000000', label: '10 OPEN', bonus: 50 },
]

// Utilities
export function formatWei(wei: string, decimals = 18): string {
  const value = BigInt(wei)
  const divisor = BigInt(10 ** decimals)
  const whole = value / divisor
  const fraction = value % divisor
  
  if (fraction === BigInt(0)) {
    return whole.toString()
  }
  
  const fractionStr = fraction.toString().padStart(decimals, '0').slice(0, 2)
  return `${whole}.${fractionStr}`
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return ''
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

export function calculateReputationLevel(score: number): keyof typeof REPUTATION_LEVELS {
  if (score >= 10000) return 'authority'
  if (score >= 5000) return 'expert'
  if (score >= 1000) return 'trusted'
  if (score >= 100) return 'contributor'
  return 'newcomer'
}
