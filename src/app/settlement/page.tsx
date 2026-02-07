import { Metadata } from 'next'
import { WeeklySettlement } from './WeeklySettlement'

export const metadata: Metadata = {
  title: 'Weekly Settlement - Kindred',
  description: 'Predict project rankings and earn rewards',
}

export default function SettlementPage() {
  return <WeeklySettlement />
}
