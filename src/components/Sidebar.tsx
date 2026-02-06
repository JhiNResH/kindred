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
  Store,
  Key,
  Terminal,
  BarChart2,
  Coins,
  Dog,
  BookOpen,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  Plus,
  PanelLeftClose,
  Settings,
  ToggleLeft,
} from "lucide-react";

// Types
type SidebarSection =
  | "agent-hub"
  | "active-agents"
  | "categories"
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
    "agent-hub": true,
    "active-agents": true,
    categories: true,
    "my-boards": true,
  });
  const [agentMode, setAgentMode] = useState(false);

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
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#ded4e8] rounded-lg text-black text-[13px] font-bold transition-all hover:bg-[#c4b9d3] hover:shadow-lg hover:shadow-purple-500/20">
          <Plus className="w-4 h-4" />
          <span>Create Board</span>
        </button>
        <button
          onClick={() => setCollapsed(true)}
          className="ml-2 p-2 text-[#6b6b70] hover:bg-[#0d0d0e] hover:text-white rounded-lg transition-colors"
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
        </div>
      </div>

      <div className="h-px bg-[#1f1f23] mx-4 my-3" />

              <span>k/perp-dex</span>
              <span className="ml-auto px-2 py-0.5 bg-[#2a2a2e] text-[#adadb0] text-[10px] font-bold rounded-full">
                42
              </span>
            </Link>
            <Link
              href="/leaderboard?category=k/defi"
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#adadb0] border-l-[3px] border-transparent hover:bg-purple-500/5 hover:text-white transition-colors"
            >
              <div className="w-7 h-7 rounded-md bg-pink-500/15 text-pink-500 flex items-center justify-center">
                <Coins className="w-3.5 h-3.5" />
              </div>
              <span>k/defi</span>
              <span className="ml-auto px-2 py-0.5 bg-[#2a2a2e] text-[#adadb0] text-[10px] font-bold rounded-full">
                128
              </span>
            </Link>
            <Link
              href="/leaderboard?category=k/ai"
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#adadb0] border-l-[3px] border-transparent hover:bg-purple-500/5 hover:text-white transition-colors"
            >
              <div className="w-7 h-7 rounded-md bg-green-500/15 text-green-500 flex items-center justify-center">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <span>k/agent</span>
              <span className="ml-auto px-2 py-0.5 bg-green-500 text-white text-[10px] font-bold rounded-full">
                89
              </span>
            </Link>
          </div>
        )}
      </div>

      {/* Resources */}
      <div className="mt-4 mb-8">
        <div className="px-4 py-2 text-[10px] font-semibold text-[#6b6b70] uppercase tracking-wide">
          Resources
        </div>
        <div className="flex flex-col">
          <Link
            href="/docs"
            className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-[#adadb0] hover:text-white transition-colors"
          >
            <BookOpen className="w-[18px] h-[18px]" />
            <span>Documentation</span>
          </Link>
          <Link
            href="/security"
            className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-[#adadb0] hover:text-white transition-colors"
          >
            <ShieldCheck className="w-[18px] h-[18px]" />
            <span>Security</span>
          </Link>
          <Link
            href="/help"
            className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-[#adadb0] hover:text-white transition-colors"
          >
            <HelpCircle className="w-[18px] h-[18px]" />
            <span>Help Center</span>
          </Link>
        </div>
      </div>
    </aside>
  );
}
