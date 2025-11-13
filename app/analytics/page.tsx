'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@/src/contexts/WalletContext';

export default function AnalyticsPage() {
  const { address, isConnected, connect } = useWallet();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isConnected && address) {
      loadAnalytics(address);
    } else {
      setLoading(false);
    }
  }, [isConnected, address]);

  const loadAnalytics = async (wallet: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics/${wallet}`);
      
      if (!response.ok) {
        throw new Error('Failed to load analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
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

  const getPercentageBar = (value: number, max: number) => {
    const percentage = max > 0 ? (value / max) * 100 : 0;
    return (
      <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full transition-all duration-500"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    );
  };

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="text-6xl mb-6">📊</div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-gray-300 mb-8">
            Connect your wallet to view detailed analytics on your viral chain performance.
          </p>
          <button
            onClick={connect}
            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-cyan-500/50"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold text-white mb-2">Failed to Load Analytics</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition">
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const maxEarnings = Math.max(...analytics.earningsByContent.map((c: any) => c.earnings), 1);
  const maxDepthCount = Math.max(...analytics.performanceByDepth.map((d: any) => d.count), 1);

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition mb-4 inline-block">
            ← Back to Home
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-5xl">📊</div>
            <div>
              <h1 className="text-4xl font-black text-white mb-2">Analytics Dashboard</h1>
              <p className="text-gray-400 font-mono text-sm">{truncateAddress(analytics.wallet)}</p>
            </div>
          </div>
        </div>

        {/* Time-Based Metrics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-900/30 to-cyan-900/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/20">
            <p className="text-gray-400 text-sm mb-4">Last 7 Days</p>
            <div className="space-y-3">
              <div>
                <p className="text-gray-500 text-xs">Shares</p>
                <p className="text-2xl font-bold text-green-400">{analytics.timeBasedMetrics.last7Days.shares}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Earnings</p>
                <p className="text-xl font-semibold text-yellow-400">{formatNumber(analytics.timeBasedMetrics.last7Days.earnings)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Clicks</p>
                <p className="text-lg font-semibold text-white">{formatNumber(analytics.timeBasedMetrics.last7Days.clicks)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/20">
            <p className="text-gray-400 text-sm mb-4">Last 30 Days</p>
            <div className="space-y-3">
              <div>
                <p className="text-gray-500 text-xs">Shares</p>
                <p className="text-2xl font-bold text-blue-400">{analytics.timeBasedMetrics.last30Days.shares}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Earnings</p>
                <p className="text-xl font-semibold text-yellow-400">{formatNumber(analytics.timeBasedMetrics.last30Days.earnings)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Clicks</p>
                <p className="text-lg font-semibold text-white">{formatNumber(analytics.timeBasedMetrics.last30Days.clicks)}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <p className="text-gray-400 text-sm mb-4">All Time</p>
            <div className="space-y-3">
              <div>
                <p className="text-gray-500 text-xs">Shares</p>
                <p className="text-2xl font-bold text-purple-400">{analytics.timeBasedMetrics.allTime.shares}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Earnings</p>
                <p className="text-xl font-semibold text-yellow-400">{formatNumber(analytics.timeBasedMetrics.allTime.earnings)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Clicks</p>
                <p className="text-lg font-semibold text-white">{formatNumber(analytics.timeBasedMetrics.allTime.clicks)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Earnings by Content */}
          <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/20">
            <h2 className="text-2xl font-bold text-white mb-6">Earnings by Content</h2>
            {analytics.earningsByContent.length > 0 ? (
              <div className="space-y-4">
                {analytics.earningsByContent.slice(0, 5).map((content: any) => (
                  <div key={content.contentId}>
                    <div className="flex items-center justify-between mb-2">
                      <Link
                        href={`/content/${content.contentId}`}
                        className="text-white hover:text-cyan-400 transition font-semibold truncate flex-1 mr-4"
                      >
                        {content.title}
                      </Link>
                      <span className="text-yellow-400 font-bold whitespace-nowrap">
                        {formatNumber(content.earnings)}
                      </span>
                    </div>
                    {getPercentageBar(content.earnings, maxEarnings)}
                    <p className="text-gray-500 text-xs mt-1">{content.shares} shares</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No earnings data yet</p>
            )}
          </div>

          {/* Performance by Depth */}
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <h2 className="text-2xl font-bold text-white mb-6">Performance by Depth</h2>
            {analytics.performanceByDepth.length > 0 ? (
              <div className="space-y-4">
                {analytics.performanceByDepth.map((depth: any) => (
                  <div key={depth.depth}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">Depth {depth.depth}</span>
                      <span className="text-purple-400 font-bold">{depth.count} shares</span>
                    </div>
                    {getPercentageBar(depth.count, maxDepthCount)}
                    <div className="flex gap-4 text-xs text-gray-500 mt-1">
                      <span>Avg: {formatNumber(depth.avgEarnings)} lamports</span>
                      <span>•</span>
                      <span>{depth.avgClicks} clicks/share</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-8">No performance data yet</p>
            )}
          </div>
        </div>

        {/* Top Performing Shares */}
        <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/20 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/20">
          <h2 className="text-2xl font-bold text-white mb-6">Top Performing Shares</h2>
          {analytics.topShares.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.topShares.map((share: any, index: number) => (
                <Link
                  key={share.id}
                  href={`/content/${share.contentId}`}
                  className="bg-black/30 rounded-xl p-4 border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-200 hover:transform hover:scale-105"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                    </span>
                    <h3 className="text-white font-bold truncate flex-1">{share.contentTitle}</h3>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Earnings</span>
                      <span className="text-yellow-400 font-semibold">{formatNumber(share.earnings)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Clicks</span>
                      <span className="text-white">{share.clicks}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Depth</span>
                      <span className="text-purple-400">{share.depth}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">No shares yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

