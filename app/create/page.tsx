'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CreateContentPage() {
  const [formData, setFormData] = useState({
    title: '',
    mediaUrl: '',
    walletAddress: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          media_url: formData.mediaUrl,
          creator_wallet: formData.walletAddress,
          nft_address: '0x' + Math.random().toString(16).substring(2, 15),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create content');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (result?.share?.share_url) {
      navigator.clipboard.writeText(result.share.share_url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-cyan-400 hover:text-cyan-300 transition mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-5xl font-black text-white mb-4">
            Create Viral Content
          </h1>
          <p className="text-xl text-gray-300">
            Upload your content and get your unique shareable link to start tracking your viral chain.
          </p>
        </div>

        {!result ? (
          /* Form */
          <form onSubmit={handleSubmit} className="bg-gradient-to-br from-cyan-900/30 to-blue-900/20 backdrop-blur-xl rounded-3xl p-8 border border-cyan-500/20">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-white font-semibold mb-2">
                  Content Title *
                </label>
                <input
                  type="text"
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="Enter a catchy title..."
                />
              </div>

              {/* Media URL */}
              <div>
                <label htmlFor="mediaUrl" className="block text-white font-semibold mb-2">
                  Media URL *
                </label>
                <input
                  type="text"
                  id="mediaUrl"
                  required
                  pattern="https?://.+"
                  value={formData.mediaUrl}
                  onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-gray-400 text-sm mt-2">
                  Must start with http:// or https://
                </p>
              </div>

              {/* Wallet Address */}
              <div>
                <label htmlFor="walletAddress" className="block text-white font-semibold mb-2">
                  Your Wallet Address *
                </label>
                <input
                  type="text"
                  id="walletAddress"
                  required
                  value={formData.walletAddress}
                  onChange={(e) => setFormData({ ...formData, walletAddress: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  placeholder="0x..."
                />
                <p className="text-gray-400 text-sm mt-2">
                  Where you'll receive earnings from your viral content
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4">
                  <p className="text-red-200">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 text-white rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-cyan-500/50 hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Content'}
              </button>
            </div>
          </form>
        ) : (
          /* Success Result */
          <div className="bg-gradient-to-br from-green-900/30 to-cyan-900/20 backdrop-blur-xl rounded-3xl p-8 border border-green-500/30">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Content Created Successfully!
              </h2>
              <p className="text-gray-300">
                Your viral tracking has begun. Share this link to start building your chain.
              </p>
            </div>

            {/* Share Link */}
            <div className="bg-black/30 rounded-xl p-6 mb-6">
              <label className="block text-cyan-300 font-semibold mb-2">
                Your Shareable Link:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={result.share.share_url}
                  className="flex-1 px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                />
                <button
                  onClick={handleCopyLink}
                  className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-semibold transition"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Content Info */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-gray-400 text-sm">Content ID</p>
                <p className="text-white font-mono text-sm">{result.content.id}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">NFT Address</p>
                <p className="text-white font-mono text-sm truncate">{result.content.nft_address}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setResult(null);
                  setFormData({ title: '', mediaUrl: '', walletAddress: '' });
                }}
                className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition"
              >
                Create Another
              </button>
              <Link
                href={`/content/${result.content.id}`}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-xl font-semibold transition text-center"
              >
                View Content
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

