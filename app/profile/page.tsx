'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@/src/contexts/WalletContext';

export default function ProfilePage() {
  const { address, isConnected, connect } = useWallet();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isConnected && address) {
      loadProfile(address);
    } else {
      setLoading(false);
    }
  }, [isConnected, address]);

  const loadProfile = async (wallet: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/profile/${wallet}`);
      
      if (!response.ok) {
        throw new Error('Failed to load profile');
      }

      const data = await response.json();
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
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

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="text-6xl mb-6">👤</div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-gray-300 mb-8">
            Connect your wallet to view your profile, shares, and earnings.
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
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold text-white mb-2">Failed to Load Profile</h1>
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
            <div className="text-5xl">👤</div>
            <div>
              <h1 className="text-4xl font-black text-white mb-2">Your Profile</h1>
              <p className="text-gray-400 font-mono text-sm">{truncateAddress(profile.wallet)}</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/20">
            <p className="text-gray-400 text-sm mb-2">Total Earnings</p>
            <p className="text-4xl font-bold text-cyan-400">{formatNumber(profile.stats.totalEarnings)}</p>
            <p className="text-xs text-gray-500 mt-1">lamports</p>
          </div>

          <div className="bg-gradient-to-br from-green-900/30 to-cyan-900/20 backdrop-blur-xl rounded-2xl p-6 border border-green-500/20">
            <p className="text-gray-400 text-sm mb-2">Active Shares</p>
            <p className="text-4xl font-bold text-green-400">{profile.stats.activeShares}</p>
            <p className="text-xs text-gray-500 mt-1">out of {profile.stats.totalShares} total</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20">
            <p className="text-gray-400 text-sm mb-2">Total Clicks</p>
            <p className="text-4xl font-bold text-purple-400">{formatNumber(profile.stats.totalClicks)}</p>
            <p className="text-xs text-gray-500 mt-1">across all shares</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/20 backdrop-blur-xl rounded-2xl p-6 border border-yellow-500/20">
            <p className="text-gray-400 text-sm mb-2">Content Created</p>
            <p className="text-4xl font-bold text-yellow-400">{profile.stats.contentCreated}</p>
            <p className="text-xs text-gray-500 mt-1">{formatNumber(profile.stats.totalContentRevenue)} lamports earned</p>
          </div>
        </div>

        {/* Created Content Section */}
        {profile.createdContent && profile.createdContent.length > 0 && (
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-6">Your Content</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {profile.createdContent.map((content: any) => (
                <Link
                  key={content.id}
                  href={`/content/${content.id}`}
                  className="bg-gradient-to-br from-purple-900/30 to-blue-900/20 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/20 hover:border-purple-500/40 transition-all duration-200 hover:transform hover:scale-105"
                >
                  <h3 className="text-xl font-bold text-white mb-3">{content.title}</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-400">Shares</p>
                      <p className="text-white font-semibold">{content.total_shares || 0}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Revenue</p>
                      <p className="text-yellow-400 font-semibold">{formatNumber(content.total_revenue_lamports || 0)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Status</p>
                      <p className={content.is_deleted ? 'text-red-400' : 'text-green-400'}>
                        {content.is_deleted ? 'Deleted' : 'Active'}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Shares Section */}
        {profile.shares && profile.shares.length > 0 ? (
          <div>
            <h2 className="text-3xl font-bold text-white mb-6">Your Shares</h2>
            <div className="space-y-4">
              {profile.shares.map((share: any) => (
                <div
                  key={share.id}
                  className={`bg-gradient-to-br backdrop-blur-xl rounded-2xl p-6 border transition-all duration-200 ${
                    share.is_deleted
                      ? 'from-red-900/20 to-gray-900/20 border-red-500/20 opacity-60'
                      : 'from-cyan-900/30 to-blue-900/20 border-cyan-500/20 hover:border-cyan-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Link
                        href={`/content/${share.content_id}`}
                        className="text-xl font-bold text-white hover:text-cyan-400 transition"
                      >
                        {share.content?.title || 'Unknown Content'}
                      </Link>
                      {share.is_deleted && (
                        <span className="ml-3 text-xs text-red-400 font-semibold px-2 py-0.5 bg-red-500/20 rounded">
                          Deleted
                        </span>
                      )}
                      <p className="text-gray-400 text-sm mt-1">
                        Created: {new Date(share.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {!share.is_deleted && (
                      <Link
                        href={share.share_url}
                        className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg text-sm font-semibold transition border border-cyan-500/30"
                      >
                        View Share
                      </Link>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-6 text-sm">
                    <div>
                      <p className="text-gray-400 mb-1">Depth</p>
                      <p className="text-white font-semibold">{share.share_depth}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Clicks</p>
                      <p className="text-white font-semibold">{formatNumber(share.click_count || 0)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Earnings</p>
                      <p className="text-yellow-400 font-semibold">{formatNumber(share.earnings_lamports || 0)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1">Content Revenue</p>
                      <p className="text-gray-300 font-semibold">{formatNumber(share.content?.total_revenue_lamports || 0)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 text-center">
            <div className="text-5xl mb-4">🔗</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              No Shares Yet
            </h3>
            <p className="text-gray-400 mb-6">
              Start sharing content to earn rewards and build your viral chain!
            </p>
            <Link
              href="/explore"
              className="inline-block px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-cyan-500/50"
            >
              Explore Content
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

