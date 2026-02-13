import { Metadata } from 'next'

export const dynamic = 'force-dynamic' // wagmi/RainbowKit needs browser APIs
import { MindshareBoard } from '@/components/leaderboard/MindshareBoard'
import { generateMetadata as generateSeoMetadata } from '@/lib/seo'
import { BreadcrumbJsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = generateSeoMetadata({
  title: 'Leaderboard - Top Projects & Reviewers',
  description: 'Discover the top-ranked DeFi protocols, crypto projects, and expert reviewers. Real-time rankings based on community votes and stake-weighted reviews.',
  path: '/leaderboard',
  keywords: [
    'crypto leaderboard',
    'defi rankings',
    'top crypto projects',
    'best defi protocols',
    'crypto reviewer ranking',
    'stake weighted reviews',
  ],
})

export default function LeaderboardPage() {
  return (
    <>
      <BreadcrumbJsonLd 
        items={[
          { name: 'Home', url: '/' },
          { name: 'Leaderboard', url: '/leaderboard' },
        ]} 
      />
      
      <div className="min-h-screen bg-[#0a0a0b] text-white">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          {/* SEO Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">🏆 Maat Leaderboard</h1>
            <p className="text-gray-400">
              Top-ranked projects and reviewers based on community votes and stake-weighted reviews.
            </p>
          </header>
          
          <MindshareBoard />
        </main>
      </div>
    </>
  )
}
