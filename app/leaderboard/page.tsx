'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'earners' | 'viral' | 'revenue'>('earners');

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/leaderboard');
      
      if (!response.ok) {
        throw new Error('Failed to load leaderboard');
      }

      const data = await response.json();
      setLeaderboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading leaderboard...</div>
      </div>
    );
  }

  if (error || !leaderboard) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold text-white mb-2">Failed to Load Leaderboard</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition mb-4 inline-block">
            ← Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">🏆</div>
            <div>
              <h1 className="text-4xl font-black text-white mb-2">Leaderboard</h1>
              <p className="text-gray-400">Top performers in the HypeChain network</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('earners')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'earners'
                ? 'text-cyan-400 border-b-2 border-cyan-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Top Earners
          </button>
          <button
            onClick={() => setActiveTab('viral')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'viral'
                ? 'text-purple-400 border-b-2 border-purple-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Most Viral
          </button>
          <button
            onClick={() => setActiveTab('revenue')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'revenue'
                ? 'text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Top Revenue
          </button>
        </div>

        {/* Top Earners */}
        {activeTab === 'earners' && (
          <div className="space-y-4">
            {leaderboard.topEarners.length > 0 ? (
              leaderboard.topEarners.map((earner: any, index: number) => (
                <div
                  key={earner.wallet}
                  className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="text-4xl font-bold text-cyan-400 min-w-[80px]">
                        {getMedalEmoji(index + 1)}
                      </div>
                      <div>
                        <Link
                          href={`/profile?wallet=${earner.wallet}`}
                          className="text-xl font-bold text-white hover:text-cyan-400 transition font-mono"
                        >
                          {truncateAddress(earner.wallet)}
                        </Link>
                        <p className="text-gray-400 text-sm mt-1">Total Earnings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-yellow-400">{formatNumber(earner.earnings)}</p>
                      <p className="text-xs text-gray-500">lamports</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 text-center">
                <div className="text-5xl mb-4">💰</div>
                <h3 className="text-2xl font-bold text-white mb-2">No Earners Yet</h3>
                <p className="text-gray-400">Start sharing content to earn rewards!</p>
              </div>
            )}
          </div>
        )}

        {/* Most Viral Content */}
        {activeTab === 'viral' && (
          <div className="space-y-4">
            {leaderboard.viralContent.length > 0 ? (
              leaderboard.viralContent.map((content: any, index: number) => (
                <Link
                  key={content.id}
                  href={`/content/${content.id}`}
                  className="block bg-gradient-to-br from-purple-900/30 to-pink-900/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200 hover:transform hover:scale-105"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 flex-1">
                      <div className="text-4xl font-bold text-purple-400 min-w-[80px]">
                        {getMedalEmoji(index + 1)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{content.title}</h3>
                        <div className="flex gap-4 text-sm text-gray-400">
                          <span>By {truncateAddress(content.creator_wallet)}</span>
                          <span>•</span>
                          <span>{new Date(content.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-purple-400">{formatNumber(content.total_shares)}</p>
                      <p className="text-xs text-gray-500">shares</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 text-center">
                <div className="text-5xl mb-4">🚀</div>
                <h3 className="text-2xl font-bold text-white mb-2">No Viral Content Yet</h3>
                <p className="text-gray-400">Create content and start sharing!</p>
              </div>
            )}
          </div>
        )}

        {/* Top Revenue Content */}
        {activeTab === 'revenue' && (
          <div className="space-y-4">
            {leaderboard.topRevenue.length > 0 ? (
              leaderboard.topRevenue.map((content: any, index: number) => (
                <Link
                  key={content.id}
                  href={`/content/${content.id}`}
                  className="block bg-gradient-to-br from-yellow-900/30 to-orange-900/20 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-200 hover:transform hover:scale-105"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 flex-1">
                      <div className="text-4xl font-bold text-yellow-400 min-w-[80px]">
                        {getMedalEmoji(index + 1)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white mb-2">{content.title}</h3>
                        <div className="flex gap-4 text-sm text-gray-400">
                          <span>By {truncateAddress(content.creator_wallet)}</span>
                          <span>•</span>
                          <span>{formatNumber(content.total_shares)} shares</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-yellow-400">{formatNumber(content.total_revenue_lamports)}</p>
                      <p className="text-xs text-gray-500">lamports</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 text-center">
                <div className="text-5xl mb-4">💸</div>
                <h3 className="text-2xl font-bold text-white mb-2">No Revenue Generated Yet</h3>
                <p className="text-gray-400">Start adding revenue to content!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

