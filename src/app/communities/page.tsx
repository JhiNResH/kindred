'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, TrendingUp, MessageSquare, Award, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface CommunityStats {
  category: string;
  label: string;
  emoji: string;
  members: number;
  posts: number;
  avgAccuracy: number;
  avgRating: string;
  growth: string;
  projects: number;
}

export default function CommunitiesPage() {
  const [communities, setCommunities] = useState<CommunityStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'members' | 'posts' | 'growth'>('members');

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/communities/stats');
        const data = await res.json();
        setCommunities(data.communities || []);
      } catch (error) {
        console.error('Failed to fetch community stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const sortedCommunities = [...communities].sort((a, b) => {
    switch (sortBy) {
      case 'members':
        return b.members - a.members;
      case 'posts':
        return b.posts - a.posts;
      case 'growth':
        return parseFloat(b.growth) - parseFloat(a.growth);
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            📊 Community Statistics
          </h1>
          <p className="text-xl text-gray-300">
            Discover the most active communities and join the conversation
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setSortBy('members')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sortBy === 'members'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            Most Members
          </button>
          <button
            onClick={() => setSortBy('posts')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sortBy === 'posts'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            Most Active
          </button>
          <button
            onClick={() => setSortBy('growth')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sortBy === 'growth'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-800 text-gray-300 hover:bg-slate-700'
            }`}
          >
            Fastest Growing
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12 text-gray-400">
            Loading community statistics...
          </div>
        )}

        {/* Communities Grid */}
        {!loading && sortedCommunities.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedCommunities.map((community) => (
              <Link
                key={community.category}
                href={`/k/${community.category.replace('k/', '')}`}
              >
                <div className="h-full p-6 bg-slate-800/50 border border-purple-500/30 rounded-xl hover:border-purple-500 hover:bg-slate-800 transition-all cursor-pointer group">
                  {/* Header with Emoji */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{community.emoji}</div>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          {community.label}
                        </h2>
                        <p className="text-sm text-gray-400">
                          {community.projects} projects
                        </p>
                      </div>
                    </div>
                    {/* Growth Indicator */}
                    <div className={`flex items-center gap-1 ${
                      parseFloat(community.growth) >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {parseFloat(community.growth) >= 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      <span className="text-sm font-semibold">
                        {Math.abs(parseFloat(community.growth))}%
                      </span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Members */}
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Users className="w-4 h-4" />
                        <span>Members</span>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {community.members}
                      </p>
                    </div>

                    {/* Posts */}
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>Posts</span>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {community.posts}
                      </p>
                    </div>

                    {/* Accuracy */}
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>Accuracy</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-400">
                        {community.avgAccuracy.toFixed(0)}%
                      </p>
                    </div>

                    {/* Rating */}
                    <div className="bg-slate-900/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
                        <Award className="w-4 h-4" />
                        <span>Avg Rating</span>
                      </div>
                      <p className="text-2xl font-bold text-yellow-400">
                        {community.avgRating}⭐
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button className="w-full mt-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors group-hover:shadow-lg group-hover:shadow-purple-500/50">
                    Join Community →
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Tips Section */}
        <div className="mt-12 pt-12 border-t border-purple-500/20">
          <h3 className="text-2xl font-bold text-white mb-6">
            💡 How to Grow Your Community
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-800/50 border border-purple-500/30 rounded-lg">
              <div className="text-3xl mb-3">📝</div>
              <h4 className="font-bold text-white mb-2">Write Reviews</h4>
              <p className="text-gray-400 text-sm">
                Post high-quality comments about projects to earn reputation and DRONE
              </p>
            </div>
            <div className="p-6 bg-slate-800/50 border border-purple-500/30 rounded-lg">
              <div className="text-3xl mb-3">🎯</div>
              <h4 className="font-bold text-white mb-2">Make Predictions</h4>
              <p className="text-gray-400 text-sm">
                Vote on community reviews and participate in weekly settlement rounds
              </p>
            </div>
            <div className="p-6 bg-slate-800/50 border border-purple-500/30 rounded-lg">
              <div className="text-3xl mb-3">🏆</div>
              <h4 className="font-bold text-white mb-2">Build Reputation</h4>
              <p className="text-gray-400 text-sm">
                Climb the leaderboard and unlock benefits as your accuracy improves
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
