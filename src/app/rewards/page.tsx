import { Metadata } from 'next'
import { EarlyDiscoveryRewards } from './EarlyDiscoveryRewards'

export const metadata: Metadata = {
  title: 'Early Discovery Rewards - Kindred',
  description: 'Track your earnings from early project discoveries',
}

export default function RewardsPage() {
  return <EarlyDiscoveryRewards />
}
