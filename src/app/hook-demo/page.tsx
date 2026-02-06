"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

/**
 * KindredHook Demo Page
 * Demonstrates dynamic fee calculation based on reputation scores
 */

// Fee calculation logic (matches KindredHook.sol)
function calculateFee(score: number): number {
  if (score >= 850) return 0.15; // High trust
  if (score >= 600) return 0.22; // Medium trust
  return 0.30; // Low trust
}

function getTrustLevel(score: number): string {
  if (score >= 850) return "High Trust";
  if (score >= 600) return "Medium Trust";
  return "Low Trust";
}

function getTrustColor(score: number): string {
  if (score >= 850) return "text-green-500";
  if (score >= 600) return "text-yellow-500";
  return "text-red-500";
}

export default function HookDemoPage() {
  const { address, isConnected } = useAccount();
  const [reputationScore, setReputationScore] = useState(500);

  const fee = calculateFee(reputationScore);
  const trustLevel = getTrustLevel(reputationScore);
  const trustColor = getTrustColor(reputationScore);

  // Example swap amount
  const swapAmount = 1000;
  const feeAmount = (swapAmount * fee) / 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🦞 KindredHook Dynamic Fees
          </h1>
          <p className="text-lg text-gray-600">
            Lower fees for trusted users. Build reputation, save on swaps.
          </p>
        </div>

        {/* Main Demo Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {/* Reputation Score Slider */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <label className="text-lg font-semibold text-gray-700">
                Your Reputation Score
              </label>
              <span className={`text-3xl font-bold ${trustColor}`}>
                {reputationScore}
              </span>
            </div>
            
            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              value={reputationScore}
              onChange={(e) => setReputationScore(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, 
                  rgb(239 68 68) 0%, 
                  rgb(239 68 68) ${(600 / 1000) * 100}%, 
                  rgb(234 179 8) ${(600 / 1000) * 100}%, 
                  rgb(234 179 8) ${(850 / 1000) * 100}%, 
                  rgb(34 197 94) ${(850 / 1000) * 100}%, 
                  rgb(34 197 94) 100%)`
              }}
            />
            
            <div className="flex justify-between text-sm text-gray-500 mt-2">
              <span>0 (New)</span>
              <span>600</span>
              <span>850</span>
              <span>1000 (Max)</span>
            </div>
          </div>

          {/* Trust Level Badge */}
          <div className="text-center mb-8">
            <div className={`inline-block px-6 py-3 rounded-full font-bold text-xl ${trustColor} border-2 border-current`}>
              {trustLevel}
            </div>
          </div>

          {/* Fee Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
              <div className="text-sm text-gray-600 mb-2">Swap Fee Rate</div>
              <div className="text-4xl font-bold text-blue-600">
                {fee.toFixed(2)}%
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
              <div className="text-sm text-gray-600 mb-2">
                Fee on ${swapAmount.toLocaleString()} swap
              </div>
              <div className="text-4xl font-bold text-purple-600">
                ${feeAmount.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Fee Tier Breakdown */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              Fee Tiers Explained
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <div className="font-semibold text-green-700">High Trust (≥850)</div>
                  <div className="text-sm text-gray-600">Trusted community members</div>
                </div>
                <div className="text-2xl font-bold text-green-600">0.15%</div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                <div>
                  <div className="font-semibold text-yellow-700">Medium Trust (600-849)</div>
                  <div className="text-sm text-gray-600">Active participants</div>
                </div>
                <div className="text-2xl font-bold text-yellow-600">0.22%</div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                <div>
                  <div className="font-semibold text-red-700">Low Trust (&lt;600)</div>
                  <div className="text-sm text-gray-600">New or untrusted users</div>
                </div>
                <div className="text-2xl font-bold text-red-600">0.30%</div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="font-semibold text-gray-800 mb-2">1. Build Reputation</h3>
              <p className="text-sm text-gray-600">
                Stake tokens to review projects, predict rankings, and participate in the community
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-3">⬆️</div>
              <h3 className="font-semibold text-gray-800 mb-2">2. Score Increases</h3>
              <p className="text-sm text-gray-600">
                Accurate predictions and quality reviews earn you reputation points
              </p>
            </div>
            
            <div className="text-center">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="font-semibold text-gray-800 mb-2">3. Lower Fees</h3>
              <p className="text-sm text-gray-600">
                Higher reputation = lower swap fees on Uniswap v4 pools with KindredHook
              </p>
            </div>
          </div>
        </div>

        {/* Technical Details */}
        <div className="mt-8 bg-gray-800 rounded-2xl shadow-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">⚡ Technical Details</h2>
          <div className="space-y-3 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Contract:</span>
              <span>KindredHook.sol</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Hook Type:</span>
              <span>beforeSwap + afterSwap</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Oracle:</span>
              <span>ReputationOracle.sol</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Tests Passing:</span>
              <span className="text-green-400">22/22 ✓</span>
            </div>
          </div>
          
          {isConnected ? (
            <div className="mt-6 p-4 bg-gray-700 rounded-lg">
              <div className="text-sm text-gray-400 mb-1">Your Address:</div>
              <div className="font-mono text-xs break-all">{address}</div>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-blue-600 rounded-lg text-center">
              <p className="font-semibold">Connect wallet to check your reputation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
