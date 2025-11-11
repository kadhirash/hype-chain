'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWallet } from '@/src/contexts/WalletContext';

export default function SharePage({ params }: { params: Promise<{ shareId: string }> }) {
  const { address, isConnected, connect } = useWallet();
  const [shareId, setShareId] = useState<string>('');
  const [content, setContent] = useState<any>(null);
  const [share, setShare] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [creating, setCreating] = useState(false);
  const [newShare, setNewShare] = useState<any>(null);

  useEffect(() => {
    params.then(p => {
      setShareId(p.shareId);
      loadShareData(p.shareId);
    });
  }, [params]);

  // Auto-fill wallet address when connected
  useEffect(() => {
    if (isConnected && address) {
      setWalletAddress(address);
    }
  }, [isConnected, address]);

  const loadShareData = async (id: string) => {
    try {
      // Fetch share info to get content_id
      const shareRes = await fetch(`/api/share/${id}`);
      if (shareRes.ok) {
        const shareData = await shareRes.json();
        setShare(shareData.share);
      }

      // Record a view engagement
      await fetch('/api/engagements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          share_id: id,
          engagement_type: 'view',
        }),
      }).catch(() => {}); // Ignore errors for now

      setLoading(false);
    } catch (err) {
      setError('Failed to load content');
      setLoading(false);
    }
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
          content_id: share.content_id, // Use content_id from the loaded share
          wallet_address: walletAddress,
          parent_share_id: shareId,
        }),
      });

      if (!response.ok) throw new Error('Failed to create share');

      const data = await response.json();
      setNewShare(data.share);
    } catch (err) {
      alert('Failed to create share. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleCopyLink = () => {
    if (newShare?.share_url) {
      navigator.clipboard.writeText(newShare.share_url);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition mb-4 inline-block">
          ← Back to Home
        </Link>

        <div className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/20 mb-6">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🔗</div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Join the Viral Chain
            </h1>
            <p className="text-xl text-gray-300">
              Share this content and earn when it goes viral!
            </p>
          </div>

          {!newShare ? (
            <div className="space-y-6">
              <div>
                <label htmlFor="wallet" className="block text-white font-semibold mb-2">
                  Your Wallet Address *
                </label>
                {isConnected && address ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      id="wallet"
                      value={walletAddress}
                      readOnly
                      className="w-full px-4 py-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono focus:outline-none cursor-not-allowed"
                    />
                    <p className="text-cyan-400 text-sm">
                      ✓ Using connected wallet address
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      id="wallet"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      placeholder="0x... or connect your wallet"
                    />
                    <button
                      type="button"
                      onClick={connect}
                      className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 text-cyan-400 rounded-lg font-semibold transition border border-cyan-500/30"
                    >
                      Connect Wallet to Auto-Fill
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleCreateShare}
                disabled={creating}
                className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-cyan-500/50"
              >
                {creating ? 'Creating Your Link...' : 'Get My Share Link'}
              </button>
            </div>
          ) : (
            <div className="bg-green-900/30 rounded-xl p-6 border border-green-500/30">
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">✅</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Your Share Link is Ready!
                </h3>
                <p className="text-gray-300">
                  Share this link to build your viral chain
                </p>
              </div>

              <div className="bg-black/30 rounded-xl p-4 mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={newShare.share_url}
                    className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white text-sm"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition"
                  >
                    Copy
                  </button>
                </div>
              </div>

              <p className="text-gray-400 text-sm text-center">
                Share ID: {newShare.id}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-4 justify-center flex-wrap">
          {share?.content_id && (
            <Link
              href={`/content/${share.content_id}`}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold transition"
            >
              View Viral Tree 📊
            </Link>
          )}
          <Link
            href="/create"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition"
          >
            Create Your Own
          </Link>
        </div>
      </div>
    </div>
  );
}

