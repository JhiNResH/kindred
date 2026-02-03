'use client'

import { useParams } from 'next/navigation'
import { CategoryFeed } from '@/components/CategoryFeed'
import { Header } from '@/components/Header'

const CATEGORY_INFO: Record<string, { icon: string; description: string }> = {
  'defi': { icon: '🏦', description: 'DeFi protocols - Lending, DEXs, Yield' },
  'perp-dex': { icon: '📈', description: 'Perpetual DEXs - Derivatives trading' },
  'memecoin': { icon: '🐕', description: 'Memecoins - The degen corner' },
  'ai': { icon: '🤖', description: 'AI projects - ML, Agents, Data' },
  'all': { icon: '🌐', description: 'All categories' },
}

export default function CategoryPage() {
  const params = useParams()
  const category = params.category as string
  
  const info = CATEGORY_INFO[category] || { icon: '📁', description: 'Community reviews' }

  return (
    <main className="min-h-screen bg-[#0a0a0b] text-white">
      <Header />
      
      <div className="py-8 px-4">
        <CategoryFeed
          category={`k/${category}`}
          categoryIcon={info.icon}
          categoryDescription={info.description}
        />
      </div>
    </main>
  )
}
