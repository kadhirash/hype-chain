'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ContentDetailPage({ params }: { params: Promise<{ contentId: string }> }) {
  const [contentId, setContentId] = useState<string>('');
  const [content, setContent] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [tree, setTree] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [creating, setCreating] = useState(false);
  const [newShare, setNewShare] = useState<any>(null);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);

  useEffect(() => {
    params.then(p => {
      setContentId(p.contentId);
      loadContent(p.contentId);
    });
  }, [params]);

  const loadContent = async (id: string) => {
    try {
      setImageLoadFailed(false); // Reset image state
      const [contentRes, treeRes] = await Promise.all([
        fetch(`/api/content/${id}`),
        fetch(`/api/shares/${id}/tree`),
      ]);

      if (!contentRes.ok) throw new Error('Content not found');

      const contentData = await contentRes.json();
      const treeData = treeRes.ok ? await treeRes.json() : null;

      setContent(contentData.content);
      setStats(contentData.stats);
      setTree(treeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPageUrl = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Page URL copied to clipboard!');
  };

  const handleCreateShare = async () => {
    if (!walletAddress) {
      alert('Please enter your wallet address');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/shares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content_id: contentId,
          wallet_address: walletAddress,
          parent_share_id: tree?.creatorShare?.id || null,
        }),
      });

      if (!response.ok) throw new Error('Failed to create share');

      const data = await response.json();
      setNewShare(data.share);
      
      // Optimistically update the stats
      if (stats) {
        setStats({
          ...stats,
          shares: (stats.shares || 0) + 1
        });
      }
      
      // Reload full content and tree to get latest data
      await loadContent(contentId);
    } catch (err) {
      alert('Failed to create share. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyShareLink = () => {
    if (newShare?.share_url) {
      navigator.clipboard.writeText(newShare.share_url);
      alert('Your share link copied to clipboard!');
    }
  };

  const isImageUrl = (url: string) => {
    if (!url) return false;
    // Check if URL ends with common image extensions or is from image hosting sites
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp)(\?.*)?$/i;
    const imageHosts = /picsum\.photos|imgur\.com|redd\.it/i;
    return imageExtensions.test(url) || imageHosts.test(url);
  };

  const renderTreeNode = (node: any, level: number = 0) => {
    return (
      <div key={node.id} className="ml-8">
        <div className="flex items-center gap-3 py-2">
          <div className="text-2xl">{level === 0 ? '👤' : '🔗'}</div>
          <div className="flex-1 bg-white/10 rounded-lg p-3 border border-cyan-500/20">
            <p className="text-white font-mono text-sm truncate">
              {node.wallet_address}
            </p>
            <div className="flex gap-4 text-sm text-gray-400 mt-1">
              <span>Depth: {node.share_depth}</span>
              <span>Clicks: {node.click_count}</span>
              <span>Earnings: {node.earnings_lamports} lamports</span>
            </div>
          </div>
        </div>
        {node.children && node.children.length > 0 && (
          <div className="border-l-2 border-cyan-500/30 ml-4">
            {node.children.map((child: any) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading content...</div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-bold text-white mb-2">Content Not Found</h1>
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
        <div className="flex gap-4 mb-6">
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition">
            ← Home
          </Link>
          <span className="text-gray-600">/</span>
          <Link href="/explore" className="text-cyan-400 hover:text-cyan-300 transition">
            Explore
          </Link>
        </div>

        {/* Content Header */}
        <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 backdrop-blur-xl rounded-3xl overflow-hidden border border-cyan-500/20 mb-6">
          {/* Media Display */}
          {content?.media_url && isImageUrl(content.media_url) && !imageLoadFailed && (
            <div className="aspect-video bg-gradient-to-br from-cyan-900/50 to-blue-900/30 relative overflow-hidden flex items-center justify-center">
              <img
                src={content.media_url.includes('picsum.photos') ? `${content.media_url}?random=${content.id}` : content.media_url}
                alt={content.title}
                className="w-full h-full object-cover absolute inset-0 z-10"
                onError={() => {
                  setImageLoadFailed(true);
                }}
              />
              <div className="text-6xl z-0">🎨</div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20 pointer-events-none" />
              <div className="absolute bottom-6 left-6 right-6 z-30 pointer-events-none">
                <h1 className="text-5xl font-bold text-white drop-shadow-lg">
                  {content.title}
                </h1>
              </div>
            </div>
          )}

          <div className="p-8">
            {(!content?.media_url || !isImageUrl(content.media_url) || imageLoadFailed) && (
              <h1 className="text-4xl font-bold text-white mb-6">
                {content?.title}
              </h1>
            )}
            
            <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div className="bg-black/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Total Shares</p>
              <p className="text-3xl font-bold text-cyan-400">{stats?.shares || 0}</p>
            </div>
            <div className="bg-black/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Engagements</p>
              <p className="text-3xl font-bold text-blue-400">{stats?.engagements || 0}</p>
            </div>
            <div className="bg-black/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-green-400">{content?.total_revenue_lamports || 0}</p>
            </div>
            <div className="bg-black/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Max Depth</p>
              <p className="text-3xl font-bold text-purple-400">{tree?.maxDepth || 0}</p>
            </div>
          </div>

            <div className="bg-black/30 rounded-xl p-4">
              <p className="text-gray-400 text-sm mb-1">Creator</p>
              <p className="text-white font-mono text-sm">{content?.creator_wallet}</p>
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="bg-gradient-to-br from-green-900/30 to-cyan-900/20 backdrop-blur-xl rounded-3xl p-8 border border-green-500/20 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="text-4xl">🚀</div>
            <div>
              <h2 className="text-3xl font-bold text-white">Join the Viral Chain</h2>
              <p className="text-gray-300">Get your personalized share link and earn when it goes viral!</p>
            </div>
          </div>

          {!newShare ? (
            <div className="space-y-4">
              {/* Quick Copy */}
              <div className="bg-black/30 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-2">Quick Share</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={typeof window !== 'undefined' ? window.location.href : ''}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                  />
                  <button
                    onClick={handleCopyPageUrl}
                    className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition"
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Get Personalized Link */}
              <div className="bg-black/30 rounded-xl p-4">
                <p className="text-gray-400 text-sm mb-2">Get Your Personalized Link</p>
                <p className="text-gray-500 text-xs mb-3">Enter your wallet to track earnings from your shares</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="0x..."
                    className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <button
                    onClick={handleCreateShare}
                    disabled={creating}
                    className="px-6 py-2 bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-lg font-semibold transition"
                  >
                    {creating ? 'Creating...' : 'Get Link'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-900/30 rounded-xl p-6 border border-green-500/30">
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl">✅</div>
                <div>
                  <h3 className="text-xl font-bold text-white">Your Share Link is Ready!</h3>
                  <p className="text-gray-300 text-sm">Share this link to build your viral chain and earn rewards</p>
                </div>
              </div>

              <div className="bg-black/30 rounded-lg p-4 mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={newShare.share_url}
                    className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                  />
                  <button
                    onClick={handleCopyShareLink}
                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <div className="flex gap-4 text-sm">
                <div className="bg-black/30 rounded-lg px-4 py-2">
                  <span className="text-gray-400">Depth: </span>
                  <span className="text-white font-semibold">{newShare.share_depth}</span>
                </div>
                <div className="bg-black/30 rounded-lg px-4 py-2">
                  <span className="text-gray-400">Share ID: </span>
                  <span className="text-white font-mono text-xs">{newShare.id.substring(0, 8)}...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Viral Tree */}
        {tree && tree.tree && tree.tree.length > 0 ? (
          <div className="bg-gradient-to-br from-purple-900/30 to-cyan-900/20 backdrop-blur-xl rounded-3xl p-8 border border-purple-500/20">
            <h2 className="text-3xl font-bold text-white mb-6">
              Viral Share Tree
            </h2>
            
            {tree.levelStats && (
              <div className="mb-6 flex gap-4 flex-wrap">
                {tree.levelStats.map((stat: any) => (
                  <div key={stat.level} className="bg-black/30 rounded-lg px-4 py-2">
                    <span className="text-gray-400 text-sm">Level {stat.level}: </span>
                    <span className="text-white font-semibold">{stat.shareCount} shares</span>
                  </div>
                ))}
              </div>
            )}

            <div className="overflow-x-auto">
              {tree.tree.map((node: any) => renderTreeNode(node))}
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 border border-white/20 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-2xl font-bold text-white mb-2">
              No Shares Yet
            </h3>
            <p className="text-gray-400">
              Be the first to share this content and start the viral chain!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

