'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShieldCheck, Bookmark, Award } from 'lucide-react';

export function MaatHomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      // Navigate to search results or verification page
      const slug = searchQuery
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      router.push(`/m/${slug}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Scarab Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 py-16 text-center">
          {/* Scarab Icon (simplified sacred beetle) */}
          <div className="inline-block mb-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
              <svg viewBox="0 0 100 100" className="relative w-full h-full text-amber-200">
                <path
                  d="M50 20 C35 20, 25 30, 25 45 L25 55 C25 70, 35 80, 50 80 C65 80, 75 70, 75 55 L75 45 C75 30, 65 20, 50 20 Z M40 35 C40 32, 42 30, 45 30 C48 30, 50 32, 50 35 C50 38, 48 40, 45 40 C42 40, 40 38, 40 35 Z M55 30 C58 30, 60 32, 60 35 C60 38, 58 40, 55 40 C52 40, 50 38, 50 35 C50 32, 52 30, 55 30 Z"
                  fill="currentColor"
                />
                <ellipse cx="50" cy="50" rx="20" ry="25" fill="currentColor" opacity="0.6" />
                <path
                  d="M30 50 L20 60 M70 50 L80 60 M30 55 L15 70 M70 55 L85 70"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <h1 className="text-5xl font-bold mb-4">MA&apos;AT</h1>
          <p className="text-xl text-amber-100 mb-2">Proof of Experience</p>
          <p className="text-sm text-amber-200 max-w-2xl mx-auto">
            We verify <strong>who is speaking</strong>, not what they say. Truth through verification, not censorship.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Search Bar */}
        <div className="mb-16">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search restaurant name or paste review link..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-amber-300 focus:border-amber-500 focus:outline-none text-lg shadow-lg"
              />
              <button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                {loading ? '⏳' : 'Verify'}
              </button>
            </div>
          </form>
        </div>

        {/* 4-Step Flow */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1: Search */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-amber-200 hover:border-amber-400 transition-all">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">1. Search</h3>
              <p className="text-sm text-gray-600">
                Enter restaurant name or paste review link from any platform
              </p>
            </div>

            {/* Step 2: Verify */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-200 hover:border-orange-400 transition-all">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">2. AI Verify</h3>
              <p className="text-sm text-gray-600">
                AI analyzes reviews from multiple platforms for authenticity
              </p>
            </div>

            {/* Step 3: Save */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-amber-200 hover:border-amber-400 transition-all">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                <Bookmark className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">3. Save</h3>
              <p className="text-sm text-gray-600">
                Add to your Vault: want to go, visited, or certified
              </p>
            </div>

            {/* Step 4: Certify */}
            <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-orange-200 hover:border-orange-400 transition-all">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">4. Certify</h3>
              <p className="text-sm text-gray-600">
                Upload proof (receipt, GPS) to mint SBT certification
              </p>
            </div>
          </div>
        </div>

        {/* Why MA'AT Section */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-amber-300 mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Why MA&apos;AT?</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-amber-600 mb-3">Traditional Reviews</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  <span>Judge review quality (subjective)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  <span>Fake reviews problem</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  <span>Paid rankings</span>
                </li>
                <li className="flex items-start">
                  <span className="text-red-500 mr-2">✗</span>
                  <span>Trust the platform</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-600 mb-3">MA&apos;AT Approach</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Verify reviewer experience (objective)</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Proof-of-experience solves this</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Credibility from verification</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>Trust cryptographic proof</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Start verifying restaurants now</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => document.querySelector('input')?.focus()}
              className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transition-all hover:shadow-xl"
            >
              Search Restaurant
            </button>
            <button
              onClick={() => router.push('/m/vault')}
              className="bg-white hover:bg-gray-50 text-amber-600 border-2 border-amber-500 px-8 py-3 rounded-lg font-semibold shadow-lg transition-all"
            >
              View My Vault
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
