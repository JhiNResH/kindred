"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Flame,
  Trophy,
  Bot,
  BarChart2,
  Coins,
  ChevronDown,
  PanelLeftClose,
  Repeat,
} from "lucide-react";
import { useStore } from "@/lib/store";

// Types
type SidebarSection =
  | "communities"
  | "explore-communities"
  | "my-boards"
  | "trending-tags"
  | "resources";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    "explore-communities": true,
    communities: true,
    "my-boards": true,
  });
  const communities = useStore(state => state.communities)
  const joinedCommunityIds = useStore(state => state.joinedCommunityIds)
  
  // Separate joined vs other communities
  const joinedCommunities = communities.filter(c => joinedCommunityIds.includes(c.id))
  const otherCommunities = communities.filter(c => !joinedCommunityIds.includes(c.id))

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (collapsed) return null;

  return (
    <aside className="fixed top-[65px] left-0 h-[calc(100vh-65px)] w-[260px] bg-[#111113] border-r border-[#1f1f23] overflow-y-auto z-40 hidden md:block transition-all scrollbar-thin scrollbar-thumb-[#2a2a2e] scrollbar-track-transparent">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between px-4 pb-3 pt-5">
        <button
          onClick={() => setCollapsed(true)}
          className="p-2 text-[#6b6b70] hover:bg-[#0d0d0e] hover:text-white rounded-lg transition-colors"
        >
          <PanelLeftClose className="w-[18px] h-[18px]" />
        </button>
      </div>

      {/* Main Navigation */}
      <div className="mb-2">
        <div className="flex flex-col">
          <Link
            href="/"
            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium border-l-[3px] transition-colors ${pathname === "/" ? "bg-purple-500/10 text-purple-400 border-purple-500" : "border-transparent text-[#adadb0] hover:bg-purple-500/5 hover:text-white"}`}
          >
            <Home className="w-[18px] h-[18px]" />
            <span>Home</span>
          </Link>
          <Link
            href="/trending"
            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium border-l-[3px] transition-colors ${pathname === "/trending" ? "bg-purple-500/10 text-purple-400 border-purple-500" : "border-transparent text-[#adadb0] hover:bg-purple-500/5 hover:text-white"}`}
          >
            <Flame className="w-[18px] h-[18px]" />
            <span>Trending</span>
            <span className="ml-auto px-2 py-0.5 bg-purple-500 text-white text-[10px] font-bold rounded-full">
              Hot
            </span>
          </Link>
          <Link
            href="/leaderboard"
            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium border-l-[3px] transition-colors ${pathname === "/leaderboard" ? "bg-purple-500/10 text-purple-400 border-purple-500" : "border-transparent text-[#adadb0] hover:bg-purple-500/5 hover:text-white"}`}
          >
            <Trophy className="w-[18px] h-[18px]" />
            <span>Leaderboard</span>
          </Link>
          <Link
            href="/agent-register"
            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium border-l-[3px] transition-colors ${pathname === "/agent-register" ? "bg-purple-500/10 text-purple-400 border-purple-500" : "border-transparent text-[#adadb0] hover:bg-purple-500/5 hover:text-white"}`}
          >
            <Bot className="w-[18px] h-[18px]" />
            <span>Become an Agent</span>
            <span className="ml-auto px-1.5 py-0.5 bg-green-500/30 text-green-400 text-[10px] font-bold rounded">
              NEW
            </span>
          </Link>
          <Link
            href="/swap"
            className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium border-l-[3px] transition-colors ${pathname === "/swap" ? "bg-blue-500/10 text-blue-400 border-blue-500" : "border-transparent text-[#adadb0] hover:bg-blue-500/5 hover:text-white"}`}
          >
            <Repeat className="w-[18px] h-[18px]" />
            <span>Hook Swap</span>
            <span className="ml-auto px-2 py-0.5 bg-blue-500 text-white text-[10px] font-bold rounded-full">
              v4
            </span>
          </Link>
        </div>
      </div>

      <div className="h-px bg-[#1f1f23] mx-4 my-3" />

      {/* Explore Communities */}
      <div className="mb-2">
        <button
          onClick={() => toggleSection("explore-communities")}
          className="w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-semibold text-[#6b6b70] uppercase tracking-wide hover:text-[#adadb0]"
        >
          <span>Explore</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${!openSections["explore-communities"] ? "-rotate-90" : ""}`}
          />
        </button>

        {openSections["explore-communities"] && (
          <div className="flex flex-col">
            <Link
              href="/communities"
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#adadb0] border-l-[3px] border-transparent hover:bg-purple-500/5 hover:text-white transition-colors"
            >
              <Compass className="w-[18px] h-[18px]" />
              <span>Explore Communities</span>
            </Link>
          </div>
        )}
      </div>

      {/* My Communities (Joined) */}
      {joinedCommunities.length > 0 && (
        <div className="mb-2">
          <div className="px-4 py-2.5 text-[10px] font-semibold text-[#6b6b70] uppercase tracking-wide">
            My Communities
          </div>
          <div className="flex flex-col">
            {joinedCommunities.map((comm) => (
              <Link
                key={comm.id}
                href={`/${comm.category || 'k/defi'}/${comm.id}`}
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#adadb0] border-l-[3px] border-purple-500 bg-purple-500/5 hover:bg-purple-500/10 hover:text-white transition-colors"
              >
                <div className="w-7 h-7 rounded-md bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold">
                  {comm.name.replace('r/', '').slice(0, 2).toUpperCase()}
                </div>
                <span>{comm.name}</span>
                <span className="ml-auto px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[10px] font-bold rounded-full">
                  ✓
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="mb-2">
        <button
          onClick={() => toggleSection("communities")}
          className="w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-semibold text-[#6b6b70] uppercase tracking-wide hover:text-[#adadb0]"
        >
          <span>Categories</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${!openSections["communities"] ? "-rotate-90" : ""}`}
          />
        </button>

        {openSections["communities"] && (
          <div className="flex flex-col">
            <Link
              href="/m/defi"
              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium border-l-[3px] transition-colors ${pathname === "/m/defi" ? "bg-purple-500/10 text-purple-400 border-purple-500" : "border-transparent text-[#adadb0] hover:bg-purple-500/5 hover:text-white"}`}
            >
              <div className="w-7 h-7 rounded-md bg-pink-500/15 text-pink-500 flex items-center justify-center">
                <Coins className="w-3.5 h-3.5" />
              </div>
              <span>k/defi</span>
            </Link>
            <Link
              href="/m/perp-dex"
              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium border-l-[3px] transition-colors ${pathname === "/m/perp-dex" ? "bg-purple-500/10 text-purple-400 border-purple-500" : "border-transparent text-[#adadb0] hover:bg-purple-500/5 hover:text-white"}`}
            >
              <div className="w-7 h-7 rounded-md bg-purple-500/15 text-purple-500 flex items-center justify-center">
                <BarChart2 className="w-3.5 h-3.5" />
              </div>
              <span>k/perp-dex</span>
            </Link>
            <Link
              href="/m/stablecoin"
              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium border-l-[3px] transition-colors ${pathname === "/m/stablecoin" ? "bg-purple-500/10 text-purple-400 border-purple-500" : "border-transparent text-[#adadb0] hover:bg-purple-500/5 hover:text-white"}`}
            >
              <div className="w-7 h-7 rounded-md bg-blue-500/15 text-blue-500 flex items-center justify-center">
                💵
              </div>
              <span>k/stablecoin</span>
            </Link>
            <Link
              href="/m/ai"
              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium border-l-[3px] transition-colors ${pathname === "/m/ai" ? "bg-purple-500/10 text-purple-400 border-purple-500" : "border-transparent text-[#adadb0] hover:bg-purple-500/5 hover:text-white"}`}
            >
              <div className="w-7 h-7 rounded-md bg-green-500/15 text-green-500 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span>k/ai</span>
            </Link>
          </div>
        )}
      </div>

      {/* Opinion Rankings */}
      <div className="mb-2">
        <button
          onClick={() => toggleSection("opinion-rankings")}
          className="w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-semibold text-[#6b6b70] uppercase tracking-wide hover:text-[#adadb0]"
        >
          <span>🗳️ Opinion Rankings</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${!openSections["opinion-rankings"] ? "-rotate-90" : ""}`}
          />
        </button>

        {openSections["opinion-rankings"] !== false && (
          <div className="flex flex-col">
            <Link
              href="/rankings/memecoin-credibility"
              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium border-l-[3px] transition-colors ${pathname === "/rankings/memecoin-credibility" ? "bg-purple-500/10 text-purple-400 border-purple-500" : "border-transparent text-[#adadb0] hover:bg-purple-500/5 hover:text-white"}`}
            >
              <span>💎 Memecoin Credibility</span>
            </Link>
            <Link
              href="/rankings/perp-risk"
              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium border-l-[3px] transition-colors ${pathname === "/rankings/perp-risk" ? "bg-purple-500/10 text-purple-400 border-purple-500" : "border-transparent text-[#adadb0] hover:bg-purple-500/5 hover:text-white"}`}
            >
              <span>📊 Perp DEX Risk</span>
            </Link>
            <Link
              href="/rankings/agent-experts"
              className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium border-l-[3px] transition-colors ${pathname === "/rankings/agent-experts" ? "bg-purple-500/10 text-purple-400 border-purple-500" : "border-transparent text-[#adadb0] hover:bg-purple-500/5 hover:text-white"}`}
            >
              <span>🤖 Agent Experts</span>
            </Link>
          </div>
        )}
      </div>

      {/* Recent Projects */}
      {otherCommunities.length > 0 && (
        <div className="mb-2">
          <button
            onClick={() => toggleSection("recent-projects")}
            className="w-full flex items-center justify-between px-4 py-2.5 text-[10px] font-semibold text-[#6b6b70] uppercase tracking-wide hover:text-[#adadb0]"
          >
            <span>Recent Projects</span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${!openSections["recent-projects"] ? "-rotate-90" : ""}`}
            />
          </button>

          {openSections["recent-projects"] !== false && (
            <div className="flex flex-col">
              {otherCommunities.slice(0, 8).map((comm) => (
                <Link
                  key={comm.id}
                  href={`/${comm.category || 'k/defi'}/${comm.id}`}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#adadb0] border-l-[3px] border-transparent hover:bg-purple-500/5 hover:text-white transition-colors"
                >
                  <div className="w-7 h-7 rounded-md bg-[#2a2a2e] text-white flex items-center justify-center text-[10px] font-bold">
                    {comm.name.replace('r/', '').slice(0, 2).toUpperCase()}
                  </div>
                  <span className="truncate">{comm.name}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
