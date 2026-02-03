'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { 
  Home, Compass, Flame, Trophy, Plus, Search, Bot, 
  ChevronDown, PanelLeftClose, PanelLeftOpen,
  BarChart2, Coins, Dog, BookOpen, HelpCircle,
  ToggleLeft, Store, Key, Terminal, Brain, Shield
} from 'lucide-react'
import { BuyToken, KindPrice } from './BuyToken'

export function HomePage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [agentMode, setAgentMode] = useState(false)

  return (
    <div className={`min-h-screen bg-[#0a0a0b] text-white ${agentMode ? 'agent-mode' : ''}`}>
      {/* Agent Mode Banner */}
      {agentMode && (
        <div className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/10 to-green-600/10 border-b border-green-500/30 text-green-500 text-xs font-medium">
          <Bot className="w-3.5 h-3.5" />
          <span>Agent Mode Active — AI agents can now operate on your behalf</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between gap-10 px-10 py-5 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-[#1f1f23]">
        <div className="flex items-center gap-2.5">
          <img src="/logo.jpg" alt="Kindred" className="w-8 h-8 rounded-md object-contain" />
          <span className="text-[#d9d4e8] font-cinzel text-2xl font-bold tracking-wide uppercase">
            KINDRED
          </span>
          <div className={`w-1.5 h-1.5 rounded-full ${agentMode ? 'bg-green-500 animate-pulse' : 'bg-purple-500'}`} />
        </div>

        {/* Search Bar */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5 w-full max-w-md px-4 py-2.5 bg-[#111113] border border-[#1f1f23] rounded-lg focus-within:border-purple-500 transition-colors">
          <Search className="w-4 h-4 text-[#6b6b70]" />
          <input 
            type="text" 
            placeholder="Search boards, projects, reviews..."
            className="flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-[#6b6b70]"
          />
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <KindPrice />
          <BuyToken variant="small" />
          <button 
            onClick={() => setAgentMode(!agentMode)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all border ${
              agentMode 
                ? 'bg-green-500/10 border-green-500/30 text-green-500' 
                : 'bg-transparent border-[#2a2a2e] text-[#adadb0] hover:bg-[#111113] hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Agent</span>
          </button>
          <ConnectButton />
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex">
        {/* Expand Sidebar Button */}
        {sidebarCollapsed && (
          <button 
            onClick={() => setSidebarCollapsed(false)}
            className="fixed left-4 top-20 z-40 p-2 bg-[#111113] border border-[#1f1f23] rounded-lg shadow-lg text-white hover:bg-[#1f1f23] transition-colors"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        )}

        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-0 min-w-0 p-0 opacity-0 invisible' : 'w-[260px] min-w-[260px] py-5'} bg-[#111113] border-r border-[#1f1f23] overflow-y-auto transition-all duration-300 h-[calc(100vh-73px)] sticky top-[73px]`}>
          {/* Sidebar Header */}
          <div className="flex items-center gap-2 px-4 pb-3">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-br from-purple-500 to-purple-700 rounded-lg text-white text-sm font-medium hover:translate-y-[-2px] hover:shadow-lg hover:shadow-purple-500/30 transition-all">
              <Plus className="w-4 h-4" />
              <span>Create Board</span>
            </button>
            <button 
              onClick={() => setSidebarCollapsed(true)}
              className="p-2 text-[#6b6b70] hover:text-white transition-colors"
            >
              <PanelLeftClose className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Main Navigation */}
          <nav className="mb-2">
            <div className="space-y-0.5 px-2">
              <SidebarItem icon={Home} label="Home" active />
              <SidebarItem icon={Compass} label="Explore" />
              <SidebarItem icon={Flame} label="Trending" badge="Hot" />
              <SidebarItem icon={Trophy} label="Leaderboard" />
            </div>
          </nav>

          <div className="mx-4 my-2 border-t border-[#1f1f23]" />

          {/* Agent Hub */}
          <SidebarSection title="🤖 Agent Hub">
            <div className="flex items-center justify-between px-3 py-2.5 rounded-lg text-[#adadb0] hover:bg-[#1a1a1d] cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <ToggleLeft className="w-4.5 h-4.5" />
                <span className="text-sm">Agent Mode</span>
              </div>
              <div 
                onClick={(e) => { e.stopPropagation(); setAgentMode(!agentMode) }}
                className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${agentMode ? 'bg-green-500' : 'bg-[#2a2a2e]'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${agentMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
            </div>
            <SidebarItem icon={Bot} label="My Agents" badge="3" badgeColor="green" />
            <SidebarItem icon={Store} label="Agent Marketplace" />
            <SidebarItem icon={Key} label="API Keys" />
            <SidebarItem icon={Terminal} label="Agent Logs" />
          </SidebarSection>

          {/* Active Agents */}
          <SidebarSection title="Active Agents">
            <AgentItem name="ReviewBot" status="online" icon={Bot} color="green" />
            <AgentItem name="AnalyzerAI" status="online" icon={Brain} color="purple" />
            <AgentItem name="AuditAgent" status="offline" icon={Shield} color="gray" />
          </SidebarSection>

          <div className="mx-4 my-2 border-t border-[#1f1f23]" />

          {/* Categories */}
          <SidebarSection title="Categories">
            <SidebarItem icon={BarChart2} label="k/perp-dex" badge="42" iconBg="defi" />
            <SidebarItem icon={Coins} label="k/defi" badge="128" iconBg="nft" />
            <SidebarItem icon={Bot} label="k/agent" badge="89" badgeColor="green" iconBg="gaming" />
            <SidebarItem icon={Dog} label="k/memecoin" badge="256" badgeColor="orange" iconBg="dao" />
          </SidebarSection>

          <div className="mx-4 my-2 border-t border-[#1f1f23]" />

          {/* My Boards */}
          <SidebarSection title="My Boards">
            <BoardItem name="k/uniswap" letter="U" color="purple" />
            <BoardItem name="k/hyperliquid" letter="H" color="violet" />
            <BoardItem name="k/jupiter" letter="J" color="pink" />
            <BoardItem name="k/ai16z" letter="A" color="green" />
            <BoardItem name="k/doge" letter="🐕" color="orange" />
          </SidebarSection>

          <div className="mx-4 my-2 border-t border-[#1f1f23]" />

          {/* Trending Tags */}
          <div className="px-4 py-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#6b6b70] uppercase tracking-wide">Trending Tags</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['#audit', '#security', '#yield', '#airdrop', '#bridge', '#staking', '#governance', '#tokenomics'].map(tag => (
                <span key={tag} className="px-2.5 py-1 bg-[#1a1a1d] rounded-full text-xs text-[#adadb0] hover:bg-purple-500/10 hover:text-purple-400 cursor-pointer transition-colors">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mx-4 my-2 border-t border-[#1f1f23]" />

          {/* Resources */}
          <SidebarSection title="Resources">
            <SidebarItem icon={BookOpen} label="Documentation" />
            <SidebarItem icon={HelpCircle} label="Help Center" />
          </SidebarSection>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-10">
          {/* Hero */}
          <div className="text-center py-16">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-[#adadb0] bg-clip-text text-transparent">
              The Trust Layer for Everyone
            </h1>
            <p className="text-lg text-[#adadb0] max-w-2xl mx-auto mb-8">
              Stake-backed reviews that protect your trades. Write reviews, earn from NFT sales, build reputation on-chain.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/review" className="px-6 py-3 rounded-lg text-sm font-medium bg-gradient-to-br from-purple-500 to-purple-700 text-white hover:translate-y-[-2px] hover:shadow-lg hover:shadow-purple-500/30 transition-all">
                Write a Review
              </Link>
              <BuyToken variant="secondary" />
              <Link href="/leaderboard" className="px-6 py-3 rounded-lg text-sm font-medium bg-transparent border border-[#2a2a2e] text-[#adadb0] hover:bg-[#111113] hover:text-white transition-all">
                View Leaderboard
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-6 mb-16">
            <StatCard label="Total Reviews" value="12,847" change="+12%" positive />
            <StatCard label="$KINDRED Staked" value="$2.4M" change="+8%" positive />
            <StatCard label="Active Reviewers" value="3,291" change="+24%" positive />
            <StatCard label="Trust Score Avg" value="87.3" change="" purple />
          </div>

          {/* Recent Reviews */}
          <section>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Recent Reviews</h2>
              <button className="flex items-center gap-1.5 px-4 py-2 border border-[#2a2a2e] rounded-md text-sm text-[#adadb0] hover:bg-[#111113] hover:text-white transition-all">
                View All
                <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
              </button>
            </div>
            
            <div className="space-y-4">
              <ReviewCard 
                project="Hyperliquid"
                rating={4.8}
                reviewer="0x7a3d...8f2e"
                content="Excellent perp DEX with deep liquidity. The order book model provides tight spreads and the UI is intuitive. However, withdrawal times could be improved."
                upvotes={234}
                comments={18}
                staked="5,000"
              />
              <ReviewCard 
                project="Jupiter"
                rating={4.5}
                reviewer="0x9b2c...4a1f"
                content="Best aggregator on Solana. The DCA feature is a game-changer for accumulating positions. Integration with limit orders makes it a one-stop shop."
                upvotes={189}
                comments={12}
                staked="3,200"
              />
              <ReviewCard 
                project="Uniswap v4"
                rating={4.9}
                reviewer="0x3e8f...7c2d"
                content="Revolutionary hooks system opens up endless possibilities. Gas optimization is noticeable. The singleton contract architecture is elegant."
                upvotes={312}
                comments={24}
                staked="8,500"
              />
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

// Components
function SidebarItem({ icon: Icon, label, badge, badgeColor, active, iconBg }: {
  icon: any
  label: string
  badge?: string
  badgeColor?: 'green' | 'orange'
  active?: boolean
  iconBg?: string
}) {
  return (
    <a href="#" className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${active ? 'bg-purple-500/10 text-purple-400' : 'text-[#adadb0] hover:bg-[#1a1a1d] hover:text-white'}`}>
      <span className={`flex items-center justify-center w-5 h-5 ${iconBg ? 'rounded-md' : ''}`}>
        <Icon className="w-4.5 h-4.5" />
      </span>
      <span className="text-sm flex-1">{label}</span>
      {badge && (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
          badgeColor === 'green' ? 'bg-green-500/10 text-green-500' :
          badgeColor === 'orange' ? 'bg-orange-500/10 text-orange-500' :
          'bg-[#2a2a2e] text-[#6b6b70]'
        }`}>
          {badge}
        </span>
      )}
    </a>
  )
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  
  return (
    <div className="mb-2">
      <button 
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-between w-full px-4 py-2.5 text-xs font-semibold text-[#6b6b70] uppercase tracking-wide hover:text-[#adadb0] transition-colors"
      >
        <span>{title}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${collapsed ? '-rotate-90' : ''}`} />
      </button>
      {!collapsed && <div className="space-y-0.5 px-2">{children}</div>}
    </div>
  )
}

function AgentItem({ name, status, icon: Icon, color }: { name: string; status: 'online' | 'offline'; icon: any; color: string }) {
  const colorClasses = {
    green: 'bg-green-500/20 text-green-500',
    purple: 'bg-purple-500/20 text-purple-500',
    gray: 'bg-[#6b6b70]/20 text-[#6b6b70]'
  }
  
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#1a1a1d] cursor-pointer transition-colors">
      <div className={`w-6 h-6 rounded-md flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
        <Icon className="w-3 h-3" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm text-[#adadb0]">{name}</span>
        <span className={`text-[10px] font-medium ${status === 'online' ? 'text-green-500' : 'text-[#6b6b70]'}`}>
          {status === 'online' ? '● Active' : '○ Paused'}
        </span>
      </div>
    </div>
  )
}

function BoardItem({ name, letter, color }: { name: string; letter: string; color: string }) {
  const colorClasses = {
    purple: 'bg-purple-500/20 text-purple-500',
    violet: 'bg-violet-500/20 text-violet-500',
    pink: 'bg-pink-500/20 text-pink-500',
    green: 'bg-green-500/20 text-green-500',
    orange: 'bg-orange-500/20 text-orange-500'
  }
  
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-[#1a1a1d] cursor-pointer transition-colors">
      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-medium ${colorClasses[color as keyof typeof colorClasses]}`}>
        {letter}
      </div>
      <span className="text-sm text-[#adadb0]">{name}</span>
    </div>
  )
}

function StatCard({ label, value, change, positive, purple }: { label: string; value: string; change: string; positive?: boolean; purple?: boolean }) {
  return (
    <div className="p-6 bg-[#111113] border border-[#1f1f23] rounded-xl">
      <div className="text-sm text-[#6b6b70] mb-2">{label}</div>
      <div className="text-3xl font-bold font-mono mb-1">{value}</div>
      {change && (
        <div className={`text-sm font-medium ${positive ? 'text-green-500' : purple ? 'text-purple-500' : 'text-[#6b6b70]'}`}>
          {change}
        </div>
      )}
    </div>
  )
}

function ReviewCard({ project, rating, reviewer, content, upvotes, comments, staked }: {
  project: string
  rating: number
  reviewer: string
  content: string
  upvotes: number
  comments: number
  staked: string
}) {
  return (
    <div className="p-5 bg-[#111113] border border-[#1f1f23] rounded-xl hover:border-purple-500/50 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold">{project}</span>
            <span className="px-2 py-0.5 bg-green-500/10 text-green-500 rounded-full text-xs font-medium">
              ★ {rating}
            </span>
          </div>
          <div className="text-sm text-[#6b6b70]">by {reviewer}</div>
        </div>
        <div className="text-right">
          <div className="text-xs text-[#6b6b70]">Staked</div>
          <div className="text-sm font-mono text-purple-400">{staked} $KIND</div>
        </div>
      </div>
      <p className="text-[#adadb0] text-sm mb-4 line-clamp-2">{content}</p>
      <div className="flex items-center gap-4 text-sm text-[#6b6b70]">
        <button className="flex items-center gap-1.5 hover:text-green-500 transition-colors">
          <span>▲</span> {upvotes}
        </button>
        <button className="flex items-center gap-1.5 hover:text-purple-400 transition-colors">
          💬 {comments}
        </button>
      </div>
    </div>
  )
}
