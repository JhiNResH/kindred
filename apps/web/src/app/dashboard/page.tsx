import { UserDashboard } from '@/components/UserDashboard'
import { WriteReview } from '@/components/WriteReview'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {/* Simple Header */}
      <header className="sticky top-0 z-50 px-6 py-4 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-[#1f1f23]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold">🦞 KINDRED</span>
          </a>
          <nav className="flex items-center gap-6 text-sm">
            <a href="/app" className="text-[#adadb0] hover:text-white transition">App</a>
            <a href="/dashboard" className="text-white font-medium">Dashboard</a>
            <a href="/leaderboard" className="text-[#adadb0] hover:text-white transition">Leaderboard</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-[#adadb0]">Track your reviews, earnings, and reputation</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Dashboard Stats - 2 columns */}
          <div className="lg:col-span-2">
            <UserDashboard />
          </div>
          
          {/* Write Review - 1 column */}
          <div>
            <WriteReview />
          </div>
        </div>
      </main>
    </div>
  )
}
